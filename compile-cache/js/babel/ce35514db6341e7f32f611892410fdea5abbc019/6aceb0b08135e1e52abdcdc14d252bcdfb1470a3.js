'use babel';

var __hasProp = ({}).hasOwnProperty,
    __extends = function __extends(child, parent) {
  for (var key in parent) {
    if (__hasProp.call(parent, key)) child[key] = parent[key];
  }function ctor() {
    this.constructor = child;
  }ctor.prototype = parent.prototype;child.prototype = new ctor();child.__super__ = parent.prototype;return child;
},
    FS = require('fs-plus'),
    Path = require('path'),
    SSH2 = require('ssh2'),
    Connector = require('../connector');

module.exports = (function () {
  __extends(ConnectorSFTP, Connector);

  function ConnectorSFTP() {
    ConnectorSFTP.__super__.constructor.apply(this, arguments);
    this.ssh2 = null;
    this.sftp = null;
    this.status = 'disconnected';
  }

  ConnectorSFTP.prototype.isConnected = function () {
    var self = this;

    return self.status != 'disconnected' && self.sftp;
  };

  ConnectorSFTP.prototype.connect = function (info, completed) {
    var self = this;
    self.info = info;
    self.info.debug = true;
    self.customFilePermissions = self.info.filePermissions;

    var debug = self.info.debug;
    var connectInfo = Object.assign({}, self.info);

    delete connectInfo.filePermissions;

    self.status = 'connecting';

    self.ssh2 = new SSH2();
    self.ssh2.on('banner', function (msg, lang) {
      self.emit('greeting', msg);
    });
    self.ssh2.on('ready', function () {
      self.ssh2.sftp(function (err, sftp) {
        if (err) {
          self.disconnect();
          return;
        }

        self.status = 'connected';

        self.sftp = sftp;
        self.sftp.on('end', function () {
          self.disconnect();
          self.emit('ended');
        });

        self.emit('connected');

        if (typeof completed === 'function') {
          completed.apply(self, []);
        }
      });
    });
    self.ssh2.on('end', function () {
      self.disconnect();
      self.emit('ended');
    });
    self.ssh2.on('close', function () {
      self.disconnect();
      self.emit('closed');
    });
    self.ssh2.on('error', function (err) {
      self.emit('error', err);
    });
    self.ssh2.on('debug', function (str) {
      if (typeof debug === 'function') {
        debug.apply(null, [str]);
      }
    });
    self.ssh2.on('keyboard-interactive', function (name, instructions, instructionsLang, prompts, finish) {
      finish([self.info.password]);
    });

    try {
      self.ssh2.connect(connectInfo);
    } catch (err) {
      atom.notifications.addError('SFTP connection attempt failed', {
        detail: err,
        dismissable: true
      });
    }

    return self;
  };

  ConnectorSFTP.prototype.disconnect = function (completed) {
    var self = this;

    self.status = 'disconnected';

    if (self.sftp) {
      self.sftp.end();
      self.sftp = null;
    }

    if (self.ssh2) {
      self.ssh2.end();
      self.ssh2 = null;
    }

    if (typeof completed === 'function') {
      completed.apply(null, []);
    }

    return self;
  };

  ConnectorSFTP.prototype.abort = function (completed) {
    // TODO find a way to abort current operation

    if (typeof completed === 'function') {
      completed.apply(null, []);
    }

    return this;
  };

  ConnectorSFTP.prototype.list = function (path, recursive, completed) {
    var self = this;

    if (!self.isConnected()) {
      if (typeof completed === 'function') completed.apply(null, ['Not connected']);
      return;
    }

    var list = [];
    var digg = 0;

    var callCompleted = function callCompleted() {
      if (typeof completed === 'function') completed.apply(null, [null, list]);
    };

    var oneDirCompleted = function oneDirCompleted() {
      if (--digg === 0) callCompleted();
    };

    var listDir = function listDir(path) {
      digg++;
      if (digg > 500) {
        console.log('recursion depth over 500!');
      }
      self.sftp.readdir(path, function (err, li) {
        if (err) return callCompleted();
        var filesLeft = li.length;

        if (filesLeft === 0) return callCompleted();

        li.forEach(function (item) {
          // symlinks
          if (item.attrs.isSymbolicLink()) {
            (function () {
              // NOTE: we only follow one symlink down here!
              // symlink -> symlink -> file won't work!
              var fname = Path.join(path, item.filename).replace(/\\/g, '/');

              self.sftp.realpath(fname, function (err, target) {
                if (err) {
                  atom.notifications.addError('Could not call realpath for symlink', {
                    detail: err,
                    dismissable: false
                  });
                  if (--filesLeft === 0) oneDirCompleted();
                  return;
                }

                self.sftp.stat(target, function (err, stats) {
                  if (err) {
                    atom.notifications.addError('Could not correctly resolve symlink', {
                      detail: fname + ' -> ' + target,
                      dismissable: false
                    });
                    if (--filesLeft === 0) oneDirCompleted();
                    return;
                  }
                  var entry = {
                    name: fname,
                    type: stats.isFile() ? 'f' : 'd',
                    size: stats.size,
                    date: new Date()
                  };
                  entry.date.setTime(stats.mtime * 1000);
                  list.push(entry);
                  if (recursive && entry.type === 'd') listDir(entry.name);
                  if (--filesLeft === 0) oneDirCompleted();
                });
              });

              // regular files & dirs
            })();
          } else {
              var entry = {
                name: Path.join(path, item.filename).replace(/\\/g, '/'),
                type: item.attrs.isFile() ? 'f' : 'd',
                size: item.attrs.size,
                date: new Date()
              };
              entry.date.setTime(item.attrs.mtime * 1000);
              list.push(entry);
              if (recursive && entry.type === 'd') listDir(entry.name);
              if (--filesLeft === 0) oneDirCompleted();
            }
        });
      });
    };

    listDir(path);
  };

  ConnectorSFTP.prototype.get = function (path, recursive, completed, progress, symlinkPath) {
    var self = this,
        local = self.client.toLocal(symlinkPath || path);
    if (!self.isConnected()) {
      if (typeof completed === 'function') completed.apply(null, ['Not connected']);
      return;
    }
    self.sftp.lstat(path, function (err, stats) {
      if (err) {
        if (typeof completed === 'function') completed.apply(null, [err]);
        return;
      }
      if (stats.isSymbolicLink()) {
        self.sftp.realpath(path, function (err, target) {
          if (err) {
            if (typeof completed === 'function') completed.apply(null, [err]);
            return;
          }
          self.get(target, recursive, completed, progress, path);
        });
      } else if (stats.isFile()) {
        // File
        FS.makeTreeSync(Path.dirname(local));
        self.sftp.fastGet(path, local, {
          step: function step(read, chunk, size) {
            if (typeof progress === 'function') {
              progress.apply(null, [read / size]);
            }
          }
        }, function (err) {
          if (typeof completed === 'function') {
            completed.apply(null, [err]);
          }
          return;
        });
      } else {
        // Directory
        self.list(path, recursive, function (err, list) {
          list.unshift({ name: path, type: 'd' });
          list.forEach(function (item) {
            item.depth = item.name.replace(/^\/+/, '').replace(/\/+$/).split('/').length;
          });
          list.sort(function (a, b) {
            if (a.depth == b.depth) return 0;
            return a.depth > b.depth ? 1 : -1;
          });

          var error = null,
              total = list.length,
              i = -1;
          var e = function e() {
            if (typeof completed === 'function') {
              completed.apply(null, [error, list]);
            }
          };
          var n = function n() {
            ++i;
            if (typeof progress === 'function') {
              progress.apply(null, [i / total]);
            }

            var item = list.shift();
            if (typeof item === 'undefined' || item === null) {
              return e();
            }
            var local = self.client.toLocal(item.name);
            if (item.type == 'd' || item.type == 'l') {
              // mkdirp(local, function (err) {
              FS.makeTree(local, function (err) {
                if (err) {
                  error = err;
                }
                return n();
              });
            } else {
              self.sftp.fastGet(item.name, local, {
                step: function step(read, chunk, size) {
                  if (typeof progress === 'function') {
                    progress.apply(null, [i / total + read / size / total]);
                  }
                }
              }, function (err) {
                if (err) {
                  error = err;
                }
                return n();
              });
            }
          };
          n();
        });
      }
    });

    return self;
  };

  ConnectorSFTP.prototype.put = function (path, completed, progress) {
    var self = this,
        remote = self.client.toRemote(path);

    function put(obj) {
      // Possibly deconstruct in coffee script? If thats a thing??
      var localPath = obj.localPath;
      var remotePath = obj.remotePath;
      var e = obj.e; // callback
      var i = obj.i;
      var total = obj.total;

      self.sftp.stat(remotePath, function (err, attrs) {
        var options = {};

        if (self.customFilePermissions) {
          // overwrite permissions when filePermissions option set
          options.mode = parseInt(self.customFilePermissions, 8);
        } else if (err) {
          // using the default 0644
          options.mode = 420;
        } else {
          // using the original permissions from the remote
          options.mode = attrs.mode;
        }

        var readStream = FS.createReadStream(localPath);
        var writeStream = self.sftp.createWriteStream(remotePath, options);
        var fileSize = FS.statSync(localPath).size; // used for setting progress bar
        var totalRead = 0; // used for setting progress bar

        function applyProgress() {
          if (typeof progress !== 'function') return;
          if (total != null && i != null) {
            progress.apply(null, [i / total + totalRead / fileSize / total]);
          } else {
            progress.apply(null, [totalRead / fileSize]);
          }
        }

        writeStream.on('finish', function () {
          applyProgress(); // completes the progress bar
          return e();
        }).on('error', function (err) {
          if (!obj.hasOwnProperty('err') && (err.message == 'No such file' || err.message === 'NO_SUCH_FILE')) {
            self.mkdir(Path.dirname(remote).replace(/\\/g, '/'), true, function (err) {
              if (err) {
                var error = err.message || err;
                atom.notifications.addError('Remote FTP: Upload Error ' + error, {
                  dismissable: false
                });
                return err;
              }
              put(Object.assign({}, obj, { err: err }));
            });
          } else {
            var error = err.message || err;
            atom.notifications.addError('Remote FTP: Upload Error ' + error, {
              dismissable: false
            });
          }
        });

        readStream.on('data', function (chunk) {
          totalRead += chunk.length;
          if (totalRead === fileSize) return; // let writeStream.on("finish") complete the progress bar
          applyProgress();
        });

        readStream.pipe(writeStream);
      });
    }

    if (self.isConnected()) {
      // File
      if (FS.isFileSync(path)) {
        var e = function e(err) {
          if (typeof completed === 'function') {
            completed.apply(null, [err || null, [{ name: path, type: 'f' }]]);
          }
        };

        put({
          localPath: path,
          remotePath: remote,
          e: e
        });
      }

      // Folder
      else {
          self.client.traverseTree(path, function (list) {
            self.mkdir(remote, true, function (err) {
              var error = undefined,
                  i = -1,
                  total = list.length;
              var e = function e() {
                if (typeof completed === 'function') {
                  completed.apply(null, [error, list]);
                }
              };
              var n = function n() {
                if (++i >= list.length) return e();

                var item = list[i];
                var remote = self.client.toRemote(item.name);

                if (item.type == 'd' || item.type == 'l') {
                  self.sftp.mkdir(remote, {}, function (err) {
                    if (err) {
                      error = err;
                    }
                    return n();
                  });
                } else {
                  put({
                    localPath: item.name,
                    remotePath: remote,
                    i: i,
                    total: total,
                    e: function e(err) {
                      if (err) error = err;
                      return n();
                    }
                  });
                }
              };
              return n();
            });
          });
        }
    } else if (typeof completed === 'function') {
      completed.apply(null, ['Not connected']);
    }

    return self;
  };

  ConnectorSFTP.prototype.mkdir = function (path, recursive, completed) {
    var self = this,
        remotes = path.replace(/^\/+/, '').replace(/\/+$/, '').split('/'),
        dirs = ['/' + remotes.slice(0, remotes.length).join('/')];

    if (self.isConnected()) {
      if (recursive) {
        for (var a = remotes.length - 1; a > 0; --a) {
          dirs.unshift('/' + remotes.slice(0, a).join('/'));
        }
      }

      var n = function n() {
        var dir = dirs.shift(),
            last = dirs.length === 0;

        self.sftp.mkdir(dir, {}, function (err) {
          if (last) {
            if (typeof completed === 'function') {
              completed.apply(null, [err || null]);
            }
          } else {
            return n();
          }
        });
      };
      n();
    } else if (typeof completed === 'function') {
      completed.apply(null, ['Not connected']);
    }

    return self;
  };

  ConnectorSFTP.prototype.mkfile = function (path, completed) {
    var self = this,
        local = self.client.toLocal(path),
        empty = new Buffer('', 'utf8');

    if (self.isConnected()) {
      self.sftp.open(path, 'w', {}, function (err, handle) {
        if (err) {
          if (typeof completed === 'function') {
            completed.apply(null, [err]);
          }
          return;
        }
        self.sftp.write(handle, empty, 0, 0, 0, function (err) {
          if (err) {
            if (typeof completed === 'function') {
              completed.apply(null, [err]);
            }
            return;
          }
          // mkdirp(Path.dirname(local), function (err1) {
          FS.makeTree(Path.dirname(local), function (err1) {
            FS.writeFile(local, empty, function (err2) {
              if (typeof completed === 'function') {
                completed.apply(null, [err1 || err2]);
              }
            });
          });
        });
      });
    } else if (typeof completed === 'function') {
      completed.apply(null, ['Not connected']);
    }

    return self;
  };

  ConnectorSFTP.prototype.rename = function (source, dest, completed) {
    var self = this;

    if (self.isConnected()) {
      self.sftp.rename(source, dest, function (err) {
        if (err) {
          if (typeof completed === 'function') {
            completed.apply(null, [err]);
          }
        } else {
          FS.rename(self.client.toLocal(source), self.client.toLocal(dest), function (err) {
            if (typeof completed === 'function') {
              completed.apply(null, [err]);
            }
          });
        }
      });
    } else if (typeof completed === 'function') {
      completed.apply(null, ['Not connected']);
    }

    return self;
  };

  ConnectorSFTP.prototype['delete'] = function (path, completed) {
    var self = this;

    if (self.isConnected()) {
      self.sftp.stat(path, function (err, stats) {
        if (err) {
          if (typeof completed === 'function') completed.apply(null, [err]);
          return;
        }

        if (stats.isSymbolicLink()) {
          self.sftp.realpath(path, function (err, target) {
            if (err) {
              if (typeof completed === 'function') completed.apply(null, [err]);
              return;
            }
            self['delete'](target, completed);
          });
        } else if (stats.isFile()) {
          // File
          self.sftp.unlink(path, function (err) {
            if (typeof completed === 'function') {
              completed.apply(null, [err, [{ name: path, type: 'f' }]]);
            }
          });
        } else {
          // Directory
          self.list(path, true, function (err, list) {
            list.forEach(function (item) {
              item.depth = item.name.replace(/^\/+/, '').replace(/\/+$/).split('/').length;
            });
            list.sort(function (a, b) {
              if (a.depth == b.depth) {
                return 0;
              }
              return a.depth > b.depth ? -1 : 1;
            });

            var done = 0;

            var e = function e() {
              self.sftp.rmdir(path, function (err) {
                if (typeof completed === 'function') {
                  completed.apply(null, [err, list]);
                }
              });
            };
            list.forEach(function (item) {
              ++done;
              var fn = item.type == 'd' || item.type == 'l' ? 'rmdir' : 'unlink';
              self.sftp[fn](item.name, function (err) {
                if (--done === 0) ;
                return e();
              });
            });
            if (list.length === 0) ;
            e();
          });
        }
      });
    } else if (typeof completed === 'function') {
      completed.apply(null, ['Not connected']);
    }

    return self;
  };

  return ConnectorSFTP;
})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGU6Ly8vQzovVXNlcnMvdWNoaWhhLy5hdG9tL3BhY2thZ2VzL1JlbW90ZS1GVFAvbGliL2Nvbm5lY3RvcnMvc2Z0cC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxXQUFXLENBQUM7O0FBRVosSUFBSSxTQUFTLEdBQUcsQ0FBQSxHQUFFLENBQUMsY0FBYztJQUMvQixTQUFTLEdBQUcsU0FBWixTQUFTLENBQWEsS0FBSyxFQUFFLE1BQU0sRUFBRTtBQUFFLE9BQUssSUFBTSxHQUFHLElBQUksTUFBTSxFQUFFO0FBQUUsUUFBSSxTQUFTLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsRUFBRSxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0dBQUUsQUFBQyxTQUFTLElBQUksR0FBRztBQUFFLFFBQUksQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDO0dBQUUsQUFBQyxJQUFJLENBQUMsU0FBUyxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUMsQUFBQyxLQUFLLENBQUMsU0FBUyxHQUFHLElBQUksSUFBSSxFQUFFLENBQUMsQUFBQyxLQUFLLENBQUMsU0FBUyxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUMsQUFBQyxPQUFPLEtBQUssQ0FBQztDQUFFO0lBQ2xTLEVBQUUsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDO0lBQ3ZCLElBQUksR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDO0lBQ3RCLElBQUksR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDO0lBQ3RCLFNBQVMsR0FBRyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUM7O0FBR3RDLE1BQU0sQ0FBQyxPQUFPLEdBQUksQ0FBQSxZQUFZO0FBQzVCLFdBQVMsQ0FBQyxhQUFhLEVBQUUsU0FBUyxDQUFDLENBQUM7O0FBRXBDLFdBQVMsYUFBYSxHQUFHO0FBQ3ZCLGlCQUFhLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFF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QUMsSUFBSSxJQUFJLEdBQUcsSUFBSSxJQUFJLENBQUMsSUFBSSxJQUFJLEdBQUcsR0FBRyxPQUFPLEdBQUcsUUFBUSxDQUFDO0FBQ3JFLGtCQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsVUFBQyxHQUFHLEVBQUs7QUFDaEMsb0JBQUksRUFBRSxJQUFJLEtBQUssQ0FBQyxFQUFDLENBQUM7QUFDbEIsdUJBQU8sQ0FBQyxFQUFFLENBQUM7ZUFDWixDQUFDLENBQUM7YUFDSixDQUFDLENBQUM7QUFDSCxnQkFBSSxJQUFJLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBQyxDQUFDO0FBQ3ZCLGFBQUMsRUFBRSxDQUFDO1dBQ0wsQ0FBQyxDQUFDO1NBQ0o7T0FDRixDQUFDLENBQUM7S0FDSixNQUFNLElBQUksT0FBTyxTQUFTLEtBQUssVUFBVSxFQUFLO0FBQUUsZUFBUyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDO0tBQUU7O0FBRTVGLFdBQU8sSUFBSSxDQUFDO0dBQ2IsQ0FBQzs7QUFFRixTQUFPLGFBQWEsQ0FBQztDQUN0QixDQUFBLEVBQUUsQUFBQyxDQUFDIiwiZmlsZSI6ImZpbGU6Ly8vQzovVXNlcnMvdWNoaWhhLy5hdG9tL3BhY2thZ2VzL1JlbW90ZS1GVFAvbGliL2Nvbm5lY3RvcnMvc2Z0cC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5sZXQgX19oYXNQcm9wID0ge30uaGFzT3duUHJvcGVydHksXG4gIF9fZXh0ZW5kcyA9IGZ1bmN0aW9uIChjaGlsZCwgcGFyZW50KSB7IGZvciAoY29uc3Qga2V5IGluIHBhcmVudCkgeyBpZiAoX19oYXNQcm9wLmNhbGwocGFyZW50LCBrZXkpKSBjaGlsZFtrZXldID0gcGFyZW50W2tleV07IH0gZnVuY3Rpb24gY3RvcigpIHsgdGhpcy5jb25zdHJ1Y3RvciA9IGNoaWxkOyB9IGN0b3IucHJvdG90eXBlID0gcGFyZW50LnByb3RvdHlwZTsgY2hpbGQucHJvdG90eXBlID0gbmV3IGN0b3IoKTsgY2hpbGQuX19zdXBlcl9fID0gcGFyZW50LnByb3RvdHlwZTsgcmV0dXJuIGNoaWxkOyB9LFxuICBGUyA9IHJlcXVpcmUoJ2ZzLXBsdXMnKSxcbiAgUGF0aCA9IHJlcXVpcmUoJ3BhdGgnKSxcbiAgU1NIMiA9IHJlcXVpcmUoJ3NzaDInKSxcbiAgQ29ubmVjdG9yID0gcmVxdWlyZSgnLi4vY29ubmVjdG9yJyk7XG5cblxubW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24gKCkge1xuICBfX2V4dGVuZHMoQ29ubmVjdG9yU0ZUUCwgQ29ubmVjdG9yKTtcblxuICBmdW5jdGlvbiBDb25uZWN0b3JTRlRQKCkge1xuICAgIENvbm5lY3RvclNGVFAuX19zdXBlcl9fLmNvbnN0cnVjdG9yLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgdGhpcy5zc2gyID0gbnVsbDtcbiAgICB0aGlzLnNmdHAgPSBudWxsO1xuICAgIHRoaXMuc3RhdHVzID0gJ2Rpc2Nvbm5lY3RlZCc7XG4gIH1cblxuICBDb25uZWN0b3JTRlRQLnByb3RvdHlwZS5pc0Nvbm5lY3RlZCA9IGZ1bmN0aW9uICgpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcblxuICAgIHJldHVybiBzZWxmLnN0YXR1cyAhPSAnZGlzY29ubmVjdGVkJyAmJiBzZWxmLnNmdHA7XG4gIH07XG5cbiAgQ29ubmVjdG9yU0ZUUC5wcm90b3R5cGUuY29ubmVjdCA9IGZ1bmN0aW9uIChpbmZvLCBjb21wbGV0ZWQpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcbiAgICBzZWxmLmluZm8gPSBpbmZvO1xuICAgIHNlbGYuaW5mby5kZWJ1ZyA9IHRydWU7XG4gICAgc2VsZi5jdXN0b21GaWxlUGVybWlzc2lvbnMgPSBzZWxmLmluZm8uZmlsZVBlcm1pc3Npb25zO1xuXG4gICAgY29uc3QgZGVidWcgPSBzZWxmLmluZm8uZGVidWc7XG4gICAgY29uc3QgY29ubmVjdEluZm8gPSBPYmplY3QuYXNzaWduKHt9LCBzZWxmLmluZm8pO1xuXG4gICAgZGVsZXRlIGNvbm5lY3RJbmZvLmZpbGVQZXJtaXNzaW9ucztcblxuICAgIHNlbGYuc3RhdHVzID0gJ2Nvbm5lY3RpbmcnO1xuXG4gICAgc2VsZi5zc2gyID0gbmV3IFNTSDIoKTtcbiAgICBzZWxmLnNzaDIub24oJ2Jhbm5lcicsIChtc2csIGxhbmcpID0+IHtcbiAgICAgIHNlbGYuZW1pdCgnZ3JlZXRpbmcnLCBtc2cpO1xuICAgIH0pO1xuICAgIHNlbGYuc3NoMi5vbigncmVhZHknLCAoKSA9PiB7XG4gICAgICBzZWxmLnNzaDIuc2Z0cCgoZXJyLCBzZnRwKSA9PiB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICBzZWxmLmRpc2Nvbm5lY3QoKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBzZWxmLnN0YXR1cyA9ICdjb25uZWN0ZWQnO1xuXG4gICAgICAgIHNlbGYuc2Z0cCA9IHNmdHA7XG4gICAgICAgIHNlbGYuc2Z0cC5vbignZW5kJywgKCkgPT4ge1xuICAgICAgICAgIHNlbGYuZGlzY29ubmVjdCgpO1xuICAgICAgICAgIHNlbGYuZW1pdCgnZW5kZWQnKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgc2VsZi5lbWl0KCdjb25uZWN0ZWQnKTtcblxuICAgICAgICBpZiAodHlwZW9mIGNvbXBsZXRlZCA9PT0gJ2Z1bmN0aW9uJylcdFx0XHRcdFx0eyBjb21wbGV0ZWQuYXBwbHkoc2VsZiwgW10pOyB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICBzZWxmLnNzaDIub24oJ2VuZCcsICgpID0+IHtcbiAgICAgIHNlbGYuZGlzY29ubmVjdCgpO1xuICAgICAgc2VsZi5lbWl0KCdlbmRlZCcpO1xuICAgIH0pO1xuICAgIHNlbGYuc3NoMi5vbignY2xvc2UnLCAoKSA9PiB7XG4gICAgICBzZWxmLmRpc2Nvbm5lY3QoKTtcbiAgICAgIHNlbGYuZW1pdCgnY2xvc2VkJyk7XG4gICAgfSk7XG4gICAgc2VsZi5zc2gyLm9uKCdlcnJvcicsIChlcnIpID0+IHtcbiAgICAgIHNlbGYuZW1pdCgnZXJyb3InLCBlcnIpO1xuICAgIH0pO1xuICAgIHNlbGYuc3NoMi5vbignZGVidWcnLCAoc3RyKSA9PiB7XG4gICAgICBpZiAodHlwZW9mIGRlYnVnID09PSAnZnVuY3Rpb24nKVx0XHRcdFx0eyBkZWJ1Zy5hcHBseShudWxsLCBbc3RyXSk7IH1cbiAgICB9KTtcbiAgICBzZWxmLnNzaDIub24oJ2tleWJvYXJkLWludGVyYWN0aXZlJywgKG5hbWUsIGluc3RydWN0aW9ucywgaW5zdHJ1Y3Rpb25zTGFuZywgcHJvbXB0cywgZmluaXNoKSA9PiB7XG4gICAgICBmaW5pc2goW3NlbGYuaW5mby5wYXNzd29yZF0pO1xuICAgIH0pO1xuXG4gICAgdHJ5IHtcbiAgICAgIHNlbGYuc3NoMi5jb25uZWN0KGNvbm5lY3RJbmZvKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcignU0ZUUCBjb25uZWN0aW9uIGF0dGVtcHQgZmFpbGVkJywge1xuICAgICAgICBkZXRhaWw6IGVycixcbiAgICAgICAgZGlzbWlzc2FibGU6IHRydWUsXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gc2VsZjtcbiAgfTtcblxuICBDb25uZWN0b3JTRlRQLnByb3RvdHlwZS5kaXNjb25uZWN0ID0gZnVuY3Rpb24gKGNvbXBsZXRlZCkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgc2VsZi5zdGF0dXMgPSAnZGlzY29ubmVjdGVkJztcblxuICAgIGlmIChzZWxmLnNmdHApIHtcbiAgICAgIHNlbGYuc2Z0cC5lbmQoKTtcbiAgICAgIHNlbGYuc2Z0cCA9IG51bGw7XG4gICAgfVxuXG4gICAgaWYgKHNlbGYuc3NoMikge1xuICAgICAgc2VsZi5zc2gyLmVuZCgpO1xuICAgICAgc2VsZi5zc2gyID0gbnVsbDtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIGNvbXBsZXRlZCA9PT0gJ2Z1bmN0aW9uJylcdFx0XHR7IGNvbXBsZXRlZC5hcHBseShudWxsLCBbXSk7IH1cblxuICAgIHJldHVybiBzZWxmO1xuICB9O1xuXG4gIENvbm5lY3RvclNGVFAucHJvdG90eXBlLmFib3J0ID0gZnVuY3Rpb24gKGNvbXBsZXRlZCkge1xuXHRcdC8vIFRPRE8gZmluZCBhIHdheSB0byBhYm9ydCBjdXJyZW50IG9wZXJhdGlvblxuXG4gICAgaWYgKHR5cGVvZiBjb21wbGV0ZWQgPT09ICdmdW5jdGlvbicpXHRcdFx0eyBjb21wbGV0ZWQuYXBwbHkobnVsbCwgW10pOyB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICBDb25uZWN0b3JTRlRQLnByb3RvdHlwZS5saXN0ID0gZnVuY3Rpb24gKHBhdGgsIHJlY3Vyc2l2ZSwgY29tcGxldGVkKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgICBpZiAoIXNlbGYuaXNDb25uZWN0ZWQoKSkge1xuICAgICAgaWYgKHR5cGVvZiBjb21wbGV0ZWQgPT09ICdmdW5jdGlvbicpIGNvbXBsZXRlZC5hcHBseShudWxsLCBbJ05vdCBjb25uZWN0ZWQnXSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgbGlzdCA9IFtdO1xuICAgIGxldCBkaWdnID0gMDtcblxuICAgIGNvbnN0IGNhbGxDb21wbGV0ZWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAodHlwZW9mIGNvbXBsZXRlZCA9PT0gJ2Z1bmN0aW9uJykgY29tcGxldGVkLmFwcGx5KG51bGwsIFtudWxsLCBsaXN0XSk7XG4gICAgfTtcblxuICAgIGNvbnN0IG9uZURpckNvbXBsZXRlZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmICgtLWRpZ2cgPT09IDApIGNhbGxDb21wbGV0ZWQoKTtcbiAgICB9O1xuXG4gICAgdmFyIGxpc3REaXIgPSBmdW5jdGlvbiAocGF0aCkge1xuICAgICAgZGlnZysrO1xuICAgICAgaWYgKGRpZ2cgPiA1MDApIHtcbiAgICAgICAgY29uc29sZS5sb2coJ3JlY3Vyc2lvbiBkZXB0aCBvdmVyIDUwMCEnKTtcbiAgICAgIH1cbiAgICAgIHNlbGYuc2Z0cC5yZWFkZGlyKHBhdGgsIChlcnIsIGxpKSA9PiB7XG4gICAgICAgIGlmIChlcnIpIHJldHVybiBjYWxsQ29tcGxldGVkKCk7XG4gICAgICAgIGxldCBmaWxlc0xlZnQgPSBsaS5sZW5ndGg7XG5cbiAgICAgICAgaWYgKGZpbGVzTGVmdCA9PT0gMCkgcmV0dXJuIGNhbGxDb21wbGV0ZWQoKTtcblxuICAgICAgICBsaS5mb3JFYWNoKChpdGVtKSA9PiB7XG5cdFx0XHRcdFx0Ly8gc3ltbGlua3NcbiAgICAgICAgICBpZiAoaXRlbS5hdHRycy5pc1N5bWJvbGljTGluaygpKSB7XG5cdFx0XHRcdFx0XHQvLyBOT1RFOiB3ZSBvbmx5IGZvbGxvdyBvbmUgc3ltbGluayBkb3duIGhlcmUhXG5cdFx0XHRcdFx0XHQvLyBzeW1saW5rIC0+IHN5bWxpbmsgLT4gZmlsZSB3b24ndCB3b3JrIVxuICAgICAgICAgICAgY29uc3QgZm5hbWUgPSBQYXRoLmpvaW4ocGF0aCwgaXRlbS5maWxlbmFtZSkucmVwbGFjZSgvXFxcXC9nLCAnLycpO1xuXG4gICAgICAgICAgICBzZWxmLnNmdHAucmVhbHBhdGgoZm5hbWUsIChlcnIsIHRhcmdldCkgPT4ge1xuICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKCdDb3VsZCBub3QgY2FsbCByZWFscGF0aCBmb3Igc3ltbGluaycsIHtcbiAgICAgICAgICAgICAgICAgIGRldGFpbDogZXJyLFxuICAgICAgICAgICAgICAgICAgZGlzbWlzc2FibGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGlmICgtLWZpbGVzTGVmdCA9PT0gMCkgb25lRGlyQ29tcGxldGVkKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgc2VsZi5zZnRwLnN0YXQodGFyZ2V0LCAoZXJyLCBzdGF0cykgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcignQ291bGQgbm90IGNvcnJlY3RseSByZXNvbHZlIHN5bWxpbmsnLCB7XG4gICAgICAgICAgICAgICAgICAgIGRldGFpbDogYCR7Zm5hbWV9IC0+ICR7dGFyZ2V0fWAsXG4gICAgICAgICAgICAgICAgICAgIGRpc21pc3NhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgaWYgKC0tZmlsZXNMZWZ0ID09PSAwKSBvbmVEaXJDb21wbGV0ZWQoKTtcbiAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29uc3QgZW50cnkgPSB7XG4gICAgICAgICAgICAgICAgICBuYW1lOiBmbmFtZSxcbiAgICAgICAgICAgICAgICAgIHR5cGU6IHN0YXRzLmlzRmlsZSgpID8gJ2YnIDogJ2QnLFxuICAgICAgICAgICAgICAgICAgc2l6ZTogc3RhdHMuc2l6ZSxcbiAgICAgICAgICAgICAgICAgIGRhdGU6IG5ldyBEYXRlKCksXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBlbnRyeS5kYXRlLnNldFRpbWUoc3RhdHMubXRpbWUgKiAxMDAwKTtcbiAgICAgICAgICAgICAgICBsaXN0LnB1c2goZW50cnkpO1xuICAgICAgICAgICAgICAgIGlmIChyZWN1cnNpdmUgJiYgZW50cnkudHlwZSA9PT0gJ2QnKSBsaXN0RGlyKGVudHJ5Lm5hbWUpO1xuICAgICAgICAgICAgICAgIGlmICgtLWZpbGVzTGVmdCA9PT0gMCkgb25lRGlyQ29tcGxldGVkKCk7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG5cblx0XHRcdFx0XHQvLyByZWd1bGFyIGZpbGVzICYgZGlyc1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBlbnRyeSA9IHtcbiAgICAgICAgICAgICAgbmFtZTogUGF0aC5qb2luKHBhdGgsIGl0ZW0uZmlsZW5hbWUpLnJlcGxhY2UoL1xcXFwvZywgJy8nKSxcbiAgICAgICAgICAgICAgdHlwZTogaXRlbS5hdHRycy5pc0ZpbGUoKSA/ICdmJyA6ICdkJyxcbiAgICAgICAgICAgICAgc2l6ZTogaXRlbS5hdHRycy5zaXplLFxuICAgICAgICAgICAgICBkYXRlOiBuZXcgRGF0ZSgpLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGVudHJ5LmRhdGUuc2V0VGltZShpdGVtLmF0dHJzLm10aW1lICogMTAwMCk7XG4gICAgICAgICAgICBsaXN0LnB1c2goZW50cnkpO1xuICAgICAgICAgICAgaWYgKHJlY3Vyc2l2ZSAmJiBlbnRyeS50eXBlID09PSAnZCcpIGxpc3REaXIoZW50cnkubmFtZSk7XG4gICAgICAgICAgICBpZiAoLS1maWxlc0xlZnQgPT09IDApIG9uZURpckNvbXBsZXRlZCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgbGlzdERpcihwYXRoKTtcbiAgfTtcblxuICBDb25uZWN0b3JTRlRQLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbiAocGF0aCwgcmVjdXJzaXZlLCBjb21wbGV0ZWQsIHByb2dyZXNzLCBzeW1saW5rUGF0aCkge1xuICAgIGxldCBzZWxmID0gdGhpcyxcbiAgICAgIGxvY2FsID0gc2VsZi5jbGllbnQudG9Mb2NhbChzeW1saW5rUGF0aCB8fCBwYXRoKTtcbiAgICBpZiAoIXNlbGYuaXNDb25uZWN0ZWQoKSkge1xuICAgICAgaWYgKHR5cGVvZiBjb21wbGV0ZWQgPT09ICdmdW5jdGlvbicpIGNvbXBsZXRlZC5hcHBseShudWxsLCBbJ05vdCBjb25uZWN0ZWQnXSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHNlbGYuc2Z0cC5sc3RhdChwYXRoLCAoZXJyLCBzdGF0cykgPT4ge1xuICAgICAgaWYgKGVycikge1xuICAgICAgICBpZiAodHlwZW9mIGNvbXBsZXRlZCA9PT0gJ2Z1bmN0aW9uJykgY29tcGxldGVkLmFwcGx5KG51bGwsIFtlcnJdKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaWYgKHN0YXRzLmlzU3ltYm9saWNMaW5rKCkpIHtcbiAgICAgICAgc2VsZi5zZnRwLnJlYWxwYXRoKHBhdGgsIChlcnIsIHRhcmdldCkgPT4ge1xuICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgY29tcGxldGVkID09PSAnZnVuY3Rpb24nKSBjb21wbGV0ZWQuYXBwbHkobnVsbCwgW2Vycl0pO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgICBzZWxmLmdldCh0YXJnZXQsIHJlY3Vyc2l2ZSwgY29tcGxldGVkLCBwcm9ncmVzcywgcGF0aCk7XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIGlmIChzdGF0cy5pc0ZpbGUoKSkge1xuXHRcdFx0XHQvLyBGaWxlXG4gICAgICAgIEZTLm1ha2VUcmVlU3luYyhQYXRoLmRpcm5hbWUobG9jYWwpKTtcbiAgICAgICAgc2VsZi5zZnRwLmZhc3RHZXQocGF0aCwgbG9jYWwsIHtcbiAgICAgICAgICBzdGVwKHJlYWQsIGNodW5rLCBzaXplKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHByb2dyZXNzID09PSAnZnVuY3Rpb24nKVx0XHRcdFx0XHRcdFx0eyBwcm9ncmVzcy5hcHBseShudWxsLCBbcmVhZCAvIHNpemVdKTsgfVxuICAgICAgICAgIH0sXG4gICAgICAgIH0sIChlcnIpID0+IHtcbiAgICAgICAgICBpZiAodHlwZW9mIGNvbXBsZXRlZCA9PT0gJ2Z1bmN0aW9uJylcdFx0XHRcdFx0XHR7IGNvbXBsZXRlZC5hcHBseShudWxsLCBbZXJyXSk7IH1cbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcblx0XHRcdFx0Ly8gRGlyZWN0b3J5XG4gICAgICAgIHNlbGYubGlzdChwYXRoLCByZWN1cnNpdmUsIChlcnIsIGxpc3QpID0+IHtcbiAgICAgICAgICBsaXN0LnVuc2hpZnQoeyBuYW1lOiBwYXRoLCB0eXBlOiAnZCcgfSk7XG4gICAgICAgICAgbGlzdC5mb3JFYWNoKChpdGVtKSA9PiB7XG4gICAgICAgICAgICBpdGVtLmRlcHRoID0gaXRlbS5uYW1lLnJlcGxhY2UoL15cXC8rLywgJycpLnJlcGxhY2UoL1xcLyskLykuc3BsaXQoJy8nKS5sZW5ndGg7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgbGlzdC5zb3J0KChhLCBiKSA9PiB7XG4gICAgICAgICAgICBpZiAoYS5kZXB0aCA9PSBiLmRlcHRoKSByZXR1cm4gMDtcbiAgICAgICAgICAgIHJldHVybiBhLmRlcHRoID4gYi5kZXB0aCA/IDEgOiAtMTtcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIGxldCBlcnJvciA9IG51bGwsXG4gICAgICAgICAgICB0b3RhbCA9IGxpc3QubGVuZ3RoLFxuICAgICAgICAgICAgaSA9IC0xO1xuICAgICAgICAgIGNvbnN0IGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGNvbXBsZXRlZCA9PT0gJ2Z1bmN0aW9uJylcdFx0XHRcdFx0XHRcdHsgY29tcGxldGVkLmFwcGx5KG51bGwsIFtlcnJvciwgbGlzdF0pOyB9XG4gICAgICAgICAgfTtcbiAgICAgICAgICB2YXIgbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICsraTtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgcHJvZ3Jlc3MgPT09ICdmdW5jdGlvbicpXHRcdFx0XHRcdFx0XHR7IHByb2dyZXNzLmFwcGx5KG51bGwsIFtpIC8gdG90YWxdKTsgfVxuXG4gICAgICAgICAgICBjb25zdCBpdGVtID0gbGlzdC5zaGlmdCgpO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBpdGVtID09PSAndW5kZWZpbmVkJyB8fCBpdGVtID09PSBudWxsKVx0XHRcdFx0XHRcdFx0eyByZXR1cm4gZSgpOyB9XG4gICAgICAgICAgICBjb25zdCBsb2NhbCA9IHNlbGYuY2xpZW50LnRvTG9jYWwoaXRlbS5uYW1lKTtcbiAgICAgICAgICAgIGlmIChpdGVtLnR5cGUgPT0gJ2QnIHx8IGl0ZW0udHlwZSA9PSAnbCcpIHtcblx0XHRcdFx0XHRcdFx0Ly8gbWtkaXJwKGxvY2FsLCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICAgIEZTLm1ha2VUcmVlKGxvY2FsLCAoZXJyKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGVycilcdFx0XHRcdFx0XHRcdFx0XHR7IGVycm9yID0gZXJyOyB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIG4oKTtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBzZWxmLnNmdHAuZmFzdEdldChpdGVtLm5hbWUsIGxvY2FsLCB7XG4gICAgICAgICAgICAgICAgc3RlcChyZWFkLCBjaHVuaywgc2l6ZSkge1xuICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBwcm9ncmVzcyA9PT0gJ2Z1bmN0aW9uJylcdFx0XHRcdFx0XHRcdFx0XHRcdHsgcHJvZ3Jlc3MuYXBwbHkobnVsbCwgWyhpIC8gdG90YWwpICsgKHJlYWQgLyBzaXplIC8gdG90YWwpXSk7IH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB9LCAoZXJyKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGVycilcdFx0XHRcdFx0XHRcdFx0XHR7IGVycm9yID0gZXJyOyB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIG4oKTtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfTtcbiAgICAgICAgICBuKCk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHNlbGY7XG4gIH07XG5cbiAgQ29ubmVjdG9yU0ZUUC5wcm90b3R5cGUucHV0ID0gZnVuY3Rpb24gKHBhdGgsIGNvbXBsZXRlZCwgcHJvZ3Jlc3MpIHtcbiAgICBsZXQgc2VsZiA9IHRoaXMsXG4gICAgICByZW1vdGUgPSBzZWxmLmNsaWVudC50b1JlbW90ZShwYXRoKTtcblxuXG4gICAgZnVuY3Rpb24gcHV0KG9iaikge1xuXHRcdFx0XHQvLyBQb3NzaWJseSBkZWNvbnN0cnVjdCBpbiBjb2ZmZWUgc2NyaXB0PyBJZiB0aGF0cyBhIHRoaW5nPz9cbiAgICAgIGNvbnN0IGxvY2FsUGF0aCA9IG9iai5sb2NhbFBhdGg7XG4gICAgICBjb25zdCByZW1vdGVQYXRoID0gb2JqLnJlbW90ZVBhdGg7XG4gICAgICBjb25zdCBlID0gb2JqLmU7IC8vIGNhbGxiYWNrXG4gICAgICBjb25zdCBpID0gb2JqLmk7XG4gICAgICBjb25zdCB0b3RhbCA9IG9iai50b3RhbDtcblxuICAgICAgc2VsZi5zZnRwLnN0YXQocmVtb3RlUGF0aCwgKGVyciwgYXR0cnMpID0+IHtcbiAgICAgICAgY29uc3Qgb3B0aW9ucyA9IHt9O1xuXG4gICAgICAgIGlmIChzZWxmLmN1c3RvbUZpbGVQZXJtaXNzaW9ucykge1xuXHRcdFx0XHRcdFx0Ly8gb3ZlcndyaXRlIHBlcm1pc3Npb25zIHdoZW4gZmlsZVBlcm1pc3Npb25zIG9wdGlvbiBzZXRcbiAgICAgICAgICBvcHRpb25zLm1vZGUgPSBwYXJzZUludChzZWxmLmN1c3RvbUZpbGVQZXJtaXNzaW9ucywgOCk7XG4gICAgICAgIH0gZWxzZSBpZiAoZXJyKSB7XG5cdFx0XHRcdFx0XHQvLyB1c2luZyB0aGUgZGVmYXVsdCAwNjQ0XG4gICAgICAgICAgb3B0aW9ucy5tb2RlID0gMG8wNjQ0O1xuICAgICAgICB9IGVsc2Uge1xuXHRcdFx0XHRcdFx0Ly8gdXNpbmcgdGhlIG9yaWdpbmFsIHBlcm1pc3Npb25zIGZyb20gdGhlIHJlbW90ZVxuICAgICAgICAgIG9wdGlvbnMubW9kZSA9IGF0dHJzLm1vZGU7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCByZWFkU3RyZWFtID0gRlMuY3JlYXRlUmVhZFN0cmVhbShsb2NhbFBhdGgpO1xuICAgICAgICBjb25zdCB3cml0ZVN0cmVhbSA9IHNlbGYuc2Z0cC5jcmVhdGVXcml0ZVN0cmVhbShyZW1vdGVQYXRoLCBvcHRpb25zKTtcbiAgICAgICAgY29uc3QgZmlsZVNpemUgPSBGUy5zdGF0U3luYyhsb2NhbFBhdGgpLnNpemU7IC8vIHVzZWQgZm9yIHNldHRpbmcgcHJvZ3Jlc3MgYmFyXG4gICAgICAgIGxldCB0b3RhbFJlYWQgPSAwOyAvLyB1c2VkIGZvciBzZXR0aW5nIHByb2dyZXNzIGJhclxuXG5cbiAgICAgICAgZnVuY3Rpb24gYXBwbHlQcm9ncmVzcygpIHtcbiAgICAgICAgICBpZiAodHlwZW9mIHByb2dyZXNzICE9PSAnZnVuY3Rpb24nKSByZXR1cm47XG4gICAgICAgICAgaWYgKHRvdGFsICE9IG51bGwgJiYgaSAhPSBudWxsKSB7XG4gICAgICAgICAgICBwcm9ncmVzcy5hcHBseShudWxsLCBbKGkgLyB0b3RhbCkgKyAodG90YWxSZWFkIC8gZmlsZVNpemUgLyB0b3RhbCldKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcHJvZ3Jlc3MuYXBwbHkobnVsbCwgW3RvdGFsUmVhZCAvIGZpbGVTaXplXSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cblxuICAgICAgICB3cml0ZVN0cmVhbVxuXHRcdFx0XHRcdC5vbignZmluaXNoJywgKCkgPT4ge1xuICBhcHBseVByb2dyZXNzKCk7IC8vIGNvbXBsZXRlcyB0aGUgcHJvZ3Jlc3MgYmFyXG4gIHJldHVybiBlKCk7XG59KVxuXHRcdFx0XHRcdC5vbignZXJyb3InLCAoZXJyKSA9PiB7XG4gIGlmICghb2JqLmhhc093blByb3BlcnR5KCdlcnInKSAmJiAoZXJyLm1lc3NhZ2UgPT0gJ05vIHN1Y2ggZmlsZScgfHwgZXJyLm1lc3NhZ2UgPT09ICdOT19TVUNIX0ZJTEUnKSkge1xuICAgIHNlbGYubWtkaXIoUGF0aC5kaXJuYW1lKHJlbW90ZSkucmVwbGFjZSgvXFxcXC9nLCAnLycpLCB0cnVlLCAoZXJyKSA9PiB7XG4gICAgICBpZiAoZXJyKSB7XG4gICAgICAgIGNvbnN0IGVycm9yID0gZXJyLm1lc3NhZ2UgfHwgZXJyO1xuICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoYFJlbW90ZSBGVFA6IFVwbG9hZCBFcnJvciAke2Vycm9yfWAsIHtcbiAgICAgICAgICBkaXNtaXNzYWJsZTogZmFsc2UsXG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gZXJyO1xuICAgICAgfVxuICAgICAgcHV0KE9iamVjdC5hc3NpZ24oe30sIG9iaiwgeyBlcnIgfSkpO1xuICAgIH0pO1xuICB9IGVsc2Uge1xuICAgIGNvbnN0IGVycm9yID0gZXJyLm1lc3NhZ2UgfHwgZXJyO1xuICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcihgUmVtb3RlIEZUUDogVXBsb2FkIEVycm9yICR7ZXJyb3J9YCwge1xuICAgICAgZGlzbWlzc2FibGU6IGZhbHNlLFxuICAgIH0pO1xuICB9XG59KTtcblxuICAgICAgICByZWFkU3RyZWFtXG5cdFx0XHRcdFx0Lm9uKCdkYXRhJywgKGNodW5rKSA9PiB7XG4gIHRvdGFsUmVhZCArPSBjaHVuay5sZW5ndGg7XG4gIGlmICh0b3RhbFJlYWQgPT09IGZpbGVTaXplKSByZXR1cm47IC8vIGxldCB3cml0ZVN0cmVhbS5vbihcImZpbmlzaFwiKSBjb21wbGV0ZSB0aGUgcHJvZ3Jlc3MgYmFyXG4gIGFwcGx5UHJvZ3Jlc3MoKTtcbn0pO1xuXG4gICAgICAgIHJlYWRTdHJlYW0ucGlwZSh3cml0ZVN0cmVhbSk7XG4gICAgICB9KTtcbiAgICB9XG5cblxuICAgIGlmIChzZWxmLmlzQ29ubmVjdGVkKCkpIHtcblx0XHRcdC8vIEZpbGVcbiAgICAgIGlmIChGUy5pc0ZpbGVTeW5jKHBhdGgpKSB7XG4gICAgICAgIGNvbnN0IGUgPSBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgaWYgKHR5cGVvZiBjb21wbGV0ZWQgPT09ICdmdW5jdGlvbicpXHRcdFx0XHRcdFx0eyBjb21wbGV0ZWQuYXBwbHkobnVsbCwgW2VyciB8fCBudWxsLCBbeyBuYW1lOiBwYXRoLCB0eXBlOiAnZicgfV1dKTsgfVxuICAgICAgICB9O1xuXG4gICAgICAgIHB1dCh7XG4gICAgICAgICAgbG9jYWxQYXRoOiBwYXRoLFxuICAgICAgICAgIHJlbW90ZVBhdGg6IHJlbW90ZSxcbiAgICAgICAgICBlLFxuICAgICAgICB9KTtcbiAgICAgIH1cblxuXHRcdFx0Ly8gRm9sZGVyXG4gICAgICBlbHNlIHtcbiAgICAgICAgc2VsZi5jbGllbnQudHJhdmVyc2VUcmVlKHBhdGgsIChsaXN0KSA9PiB7XG4gICAgICAgICAgc2VsZi5ta2RpcihyZW1vdGUsIHRydWUsIChlcnIpID0+IHtcbiAgICAgICAgICAgIGxldCBlcnJvcixcbiAgICAgICAgICAgICAgaSA9IC0xLFxuICAgICAgICAgICAgICB0b3RhbCA9IGxpc3QubGVuZ3RoO1xuICAgICAgICAgICAgY29uc3QgZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgaWYgKHR5cGVvZiBjb21wbGV0ZWQgPT09ICdmdW5jdGlvbicpXHRcdFx0XHRcdFx0XHRcdFx0eyBjb21wbGV0ZWQuYXBwbHkobnVsbCwgW2Vycm9yLCBsaXN0XSk7IH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB2YXIgbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgaWYgKCsraSA+PSBsaXN0Lmxlbmd0aCkgcmV0dXJuIGUoKTtcblxuICAgICAgICAgICAgICBjb25zdCBpdGVtID0gbGlzdFtpXTtcbiAgICAgICAgICAgICAgY29uc3QgcmVtb3RlID0gc2VsZi5jbGllbnQudG9SZW1vdGUoaXRlbS5uYW1lKTtcblxuICAgICAgICAgICAgICBpZiAoaXRlbS50eXBlID09ICdkJyB8fCBpdGVtLnR5cGUgPT0gJ2wnKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5zZnRwLm1rZGlyKHJlbW90ZSwge30sIChlcnIpID0+IHtcbiAgICAgICAgICAgICAgICAgIGlmIChlcnIpXHRcdFx0XHRcdFx0XHRcdFx0XHRcdHsgZXJyb3IgPSBlcnI7IH1cbiAgICAgICAgICAgICAgICAgIHJldHVybiBuKCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcHV0KHtcbiAgICAgICAgICAgICAgICAgIGxvY2FsUGF0aDogaXRlbS5uYW1lLFxuICAgICAgICAgICAgICAgICAgcmVtb3RlUGF0aDogcmVtb3RlLFxuICAgICAgICAgICAgICAgICAgaSxcbiAgICAgICAgICAgICAgICAgIHRvdGFsLFxuICAgICAgICAgICAgICAgICAgZShlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVycikgZXJyb3IgPSBlcnI7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBuKCk7XG4gICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcmV0dXJuIG4oKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgY29tcGxldGVkID09PSAnZnVuY3Rpb24nKVx0XHRcdFx0eyBjb21wbGV0ZWQuYXBwbHkobnVsbCwgWydOb3QgY29ubmVjdGVkJ10pOyB9XG5cbiAgICByZXR1cm4gc2VsZjtcbiAgfTtcblxuICBDb25uZWN0b3JTRlRQLnByb3RvdHlwZS5ta2RpciA9IGZ1bmN0aW9uIChwYXRoLCByZWN1cnNpdmUsIGNvbXBsZXRlZCkge1xuICAgIGxldCBzZWxmID0gdGhpcyxcbiAgICAgIHJlbW90ZXMgPSBwYXRoLnJlcGxhY2UoL15cXC8rLywgJycpLnJlcGxhY2UoL1xcLyskLywgJycpLnNwbGl0KCcvJyksXG4gICAgICBkaXJzID0gW2AvJHtyZW1vdGVzLnNsaWNlKDAsIHJlbW90ZXMubGVuZ3RoKS5qb2luKCcvJyl9YF07XG5cbiAgICBpZiAoc2VsZi5pc0Nvbm5lY3RlZCgpKSB7XG4gICAgICBpZiAocmVjdXJzaXZlKSB7XG4gICAgICAgIGZvciAobGV0IGEgPSByZW1vdGVzLmxlbmd0aCAtIDE7IGEgPiAwOyAtLWEpXHRcdFx0XHRcdHsgZGlycy51bnNoaWZ0KGAvJHtyZW1vdGVzLnNsaWNlKDAsIGEpLmpvaW4oJy8nKX1gKTsgfVxuICAgICAgfVxuXG4gICAgICB2YXIgbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgbGV0IGRpciA9IGRpcnMuc2hpZnQoKSxcbiAgICAgICAgICBsYXN0ID0gZGlycy5sZW5ndGggPT09IDA7XG5cbiAgICAgICAgc2VsZi5zZnRwLm1rZGlyKGRpciwge30sIChlcnIpID0+IHtcbiAgICAgICAgICBpZiAobGFzdCkge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBjb21wbGV0ZWQgPT09ICdmdW5jdGlvbicpXHRcdFx0XHRcdFx0XHR7IGNvbXBsZXRlZC5hcHBseShudWxsLCBbZXJyIHx8IG51bGxdKTsgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gbigpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9O1xuICAgICAgbigpO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGNvbXBsZXRlZCA9PT0gJ2Z1bmN0aW9uJylcdFx0XHRcdHsgY29tcGxldGVkLmFwcGx5KG51bGwsIFsnTm90IGNvbm5lY3RlZCddKTsgfVxuXG4gICAgcmV0dXJuIHNlbGY7XG4gIH07XG5cbiAgQ29ubmVjdG9yU0ZUUC5wcm90b3R5cGUubWtmaWxlID0gZnVuY3Rpb24gKHBhdGgsIGNvbXBsZXRlZCkge1xuICAgIGxldCBzZWxmID0gdGhpcyxcbiAgICAgIGxvY2FsID0gc2VsZi5jbGllbnQudG9Mb2NhbChwYXRoKSxcbiAgICAgIGVtcHR5ID0gbmV3IEJ1ZmZlcignJywgJ3V0ZjgnKTtcblxuICAgIGlmIChzZWxmLmlzQ29ubmVjdGVkKCkpIHtcbiAgICAgIHNlbGYuc2Z0cC5vcGVuKHBhdGgsICd3Jywge30sIChlcnIsIGhhbmRsZSkgPT4ge1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgaWYgKHR5cGVvZiBjb21wbGV0ZWQgPT09ICdmdW5jdGlvbicpXHRcdFx0XHRcdFx0eyBjb21wbGV0ZWQuYXBwbHkobnVsbCwgW2Vycl0pOyB9XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHNlbGYuc2Z0cC53cml0ZShoYW5kbGUsIGVtcHR5LCAwLCAwLCAwLCAoZXJyKSA9PiB7XG4gICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBjb21wbGV0ZWQgPT09ICdmdW5jdGlvbicpXHRcdFx0XHRcdFx0XHR7IGNvbXBsZXRlZC5hcHBseShudWxsLCBbZXJyXSk7IH1cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG5cdFx0XHRcdFx0Ly8gbWtkaXJwKFBhdGguZGlybmFtZShsb2NhbCksIGZ1bmN0aW9uIChlcnIxKSB7XG4gICAgICAgICAgRlMubWFrZVRyZWUoUGF0aC5kaXJuYW1lKGxvY2FsKSwgKGVycjEpID0+IHtcbiAgICAgICAgICAgIEZTLndyaXRlRmlsZShsb2NhbCwgZW1wdHksIChlcnIyKSA9PiB7XG4gICAgICAgICAgICAgIGlmICh0eXBlb2YgY29tcGxldGVkID09PSAnZnVuY3Rpb24nKVx0XHRcdFx0XHRcdFx0XHR7IGNvbXBsZXRlZC5hcHBseShudWxsLCBbZXJyMSB8fCBlcnIyXSk7IH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGNvbXBsZXRlZCA9PT0gJ2Z1bmN0aW9uJylcdFx0XHRcdHsgY29tcGxldGVkLmFwcGx5KG51bGwsIFsnTm90IGNvbm5lY3RlZCddKTsgfVxuXG4gICAgcmV0dXJuIHNlbGY7XG4gIH07XG5cbiAgQ29ubmVjdG9yU0ZUUC5wcm90b3R5cGUucmVuYW1lID0gZnVuY3Rpb24gKHNvdXJjZSwgZGVzdCwgY29tcGxldGVkKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgICBpZiAoc2VsZi5pc0Nvbm5lY3RlZCgpKSB7XG4gICAgICBzZWxmLnNmdHAucmVuYW1lKHNvdXJjZSwgZGVzdCwgKGVycikgPT4ge1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgaWYgKHR5cGVvZiBjb21wbGV0ZWQgPT09ICdmdW5jdGlvbicpXHRcdFx0XHRcdFx0eyBjb21wbGV0ZWQuYXBwbHkobnVsbCwgW2Vycl0pOyB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgRlMucmVuYW1lKHNlbGYuY2xpZW50LnRvTG9jYWwoc291cmNlKSwgc2VsZi5jbGllbnQudG9Mb2NhbChkZXN0KSwgKGVycikgPT4ge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBjb21wbGV0ZWQgPT09ICdmdW5jdGlvbicpXHRcdFx0XHRcdFx0XHR7IGNvbXBsZXRlZC5hcHBseShudWxsLCBbZXJyXSk7IH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgY29tcGxldGVkID09PSAnZnVuY3Rpb24nKVx0XHRcdFx0eyBjb21wbGV0ZWQuYXBwbHkobnVsbCwgWydOb3QgY29ubmVjdGVkJ10pOyB9XG5cbiAgICByZXR1cm4gc2VsZjtcbiAgfTtcblxuICBDb25uZWN0b3JTRlRQLnByb3RvdHlwZS5kZWxldGUgPSBmdW5jdGlvbiAocGF0aCwgY29tcGxldGVkKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgICBpZiAoc2VsZi5pc0Nvbm5lY3RlZCgpKSB7XG4gICAgICBzZWxmLnNmdHAuc3RhdChwYXRoLCAoZXJyLCBzdGF0cykgPT4ge1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgaWYgKHR5cGVvZiBjb21wbGV0ZWQgPT09ICdmdW5jdGlvbicpIGNvbXBsZXRlZC5hcHBseShudWxsLCBbZXJyXSk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHN0YXRzLmlzU3ltYm9saWNMaW5rKCkpIHtcbiAgICAgICAgICBzZWxmLnNmdHAucmVhbHBhdGgocGF0aCwgKGVyciwgdGFyZ2V0KSA9PiB7XG4gICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgIGlmICh0eXBlb2YgY29tcGxldGVkID09PSAnZnVuY3Rpb24nKSBjb21wbGV0ZWQuYXBwbHkobnVsbCwgW2Vycl0pO1xuICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzZWxmLmRlbGV0ZSh0YXJnZXQsIGNvbXBsZXRlZCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSBpZiAoc3RhdHMuaXNGaWxlKCkpIHtcblx0XHRcdFx0XHQvLyBGaWxlXG4gICAgICAgICAgc2VsZi5zZnRwLnVubGluayhwYXRoLCAoZXJyKSA9PiB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGNvbXBsZXRlZCA9PT0gJ2Z1bmN0aW9uJylcdFx0XHRcdFx0XHRcdHsgY29tcGxldGVkLmFwcGx5KG51bGwsIFtlcnIsIFt7IG5hbWU6IHBhdGgsIHR5cGU6ICdmJyB9XV0pOyB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG5cdFx0XHRcdFx0Ly8gRGlyZWN0b3J5XG4gICAgICAgICAgc2VsZi5saXN0KHBhdGgsIHRydWUsIChlcnIsIGxpc3QpID0+IHtcbiAgICAgICAgICAgIGxpc3QuZm9yRWFjaCgoaXRlbSkgPT4geyBpdGVtLmRlcHRoID0gaXRlbS5uYW1lLnJlcGxhY2UoL15cXC8rLywgJycpLnJlcGxhY2UoL1xcLyskLykuc3BsaXQoJy8nKS5sZW5ndGg7IH0pO1xuICAgICAgICAgICAgbGlzdC5zb3J0KChhLCBiKSA9PiB7XG4gICAgICAgICAgICAgIGlmIChhLmRlcHRoID09IGIuZGVwdGgpXHRcdFx0XHRcdFx0XHRcdHsgcmV0dXJuIDA7IH1cbiAgICAgICAgICAgICAgcmV0dXJuIGEuZGVwdGggPiBiLmRlcHRoID8gLTEgOiAxO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGxldCBkb25lID0gMDtcblxuICAgICAgICAgICAgY29uc3QgZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgc2VsZi5zZnRwLnJtZGlyKHBhdGgsIChlcnIpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGNvbXBsZXRlZCA9PT0gJ2Z1bmN0aW9uJylcdFx0XHRcdFx0XHRcdFx0XHR7IGNvbXBsZXRlZC5hcHBseShudWxsLCBbZXJyLCBsaXN0XSk7IH1cbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgbGlzdC5mb3JFYWNoKChpdGVtKSA9PiB7XG4gICAgICAgICAgICAgICsrZG9uZTtcbiAgICAgICAgICAgICAgY29uc3QgZm4gPSBpdGVtLnR5cGUgPT0gJ2QnIHx8IGl0ZW0udHlwZSA9PSAnbCcgPyAncm1kaXInIDogJ3VubGluayc7XG4gICAgICAgICAgICAgIHNlbGYuc2Z0cFtmbl0oaXRlbS5uYW1lLCAoZXJyKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKC0tZG9uZSA9PT0gMCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGUoKTtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmIChsaXN0Lmxlbmd0aCA9PT0gMCk7XG4gICAgICAgICAgICBlKCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGNvbXBsZXRlZCA9PT0gJ2Z1bmN0aW9uJylcdFx0XHRcdHsgY29tcGxldGVkLmFwcGx5KG51bGwsIFsnTm90IGNvbm5lY3RlZCddKTsgfVxuXG4gICAgcmV0dXJuIHNlbGY7XG4gIH07XG5cbiAgcmV0dXJuIENvbm5lY3RvclNGVFA7XG59KCkpO1xuIl19