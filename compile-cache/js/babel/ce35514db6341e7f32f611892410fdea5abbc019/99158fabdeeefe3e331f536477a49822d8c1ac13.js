Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _fsPlus = require('fs-plus');

var _fsPlus2 = _interopRequireDefault(_fsPlus);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _ftp = require('ftp');

var _ftp2 = _interopRequireDefault(_ftp);

var _connector = require('../connector');

var _connector2 = _interopRequireDefault(_connector);

var _helpers = require('../helpers');

'use babel';

var atom = global.atom;
// const errorMessages = {
//
// }

function tryApply(callback, context, args) {
  if (typeof callback === 'function') {
    callback.apply(context, args);
  }
}

exports['default'] = (function INIT() {
  var ConnectorFTP = (function (_Connector) {
    _inherits(ConnectorFTP, _Connector);

    function ConnectorFTP() {
      _classCallCheck(this, ConnectorFTP);

      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      _get(Object.getPrototypeOf(ConnectorFTP.prototype), 'constructor', this).apply(this, args);
      var self = this;
      self.ftp = null;
    }

    _createClass(ConnectorFTP, [{
      key: 'isConnected',
      value: function isConnected() {
        var self = this;
        return self.ftp && self.ftp.connected;
      }
    }, {
      key: 'connect',
      value: function connect(info, completed) {
        var self = this;

        self.info = info;

        self.ftp = new _ftp2['default']();
        self.ftp.on('greeting', function (msg) {
          self.emit('greeting', msg);
        }).on('ready', function () {
          self.emit('connected');

          // disable keepalive manually when specified in .ftpconfig
          self.ftp._socket.setKeepAlive(self.info.keepalive > 0);

          tryApply(completed, self, []);
        }).on('end', function () {
          self.emit('ended');
        }).on('error', function (err) {
          var errCode = (0, _helpers.getObject)({
            obj: err,
            keys: ['code']
          });

          if (errCode === 421) {
            self.emit('closed', 'RECONNECT');
            self.disconnect();
          }

          self.emit('error', err);
        });

        self.info._debug = self.info.debug;
        self.info.debug = function DEBUG(str) {
          var log = str.match(/^\[connection\] (>|<) '(.*?)(\\r\\n)?'$/);
          if (!log || log[1] !== '<') return;

          var reply = log[2].match(/^[0-9]+/);
          if (reply) self.emit(reply[0], log[2]);

          tryApply(self.info._debug, null, [str]);
        };
        self.ftp.connect(self.info);

        return self;
      }
    }, {
      key: 'disconnect',
      value: function disconnect(completed) {
        var self = this;

        if (self.ftp) {
          self.ftp.destroy();
          self.ftp = null;
        }
        tryApply(completed, null, []);
        return self;
      }
    }, {
      key: 'abort',
      value: function abort(completed) {
        var self = this;

        if (self.isConnected()) {
          self.ftp.abort(function () {
            tryApply(completed, null, []);
          });
        } else tryApply(completed, null, []);
        return self;
      }
    }, {
      key: 'list',
      value: function list(path, recursive, completed, isFile) {
        // NOTE: isFile is included as the list command from FTP does not throw an error
        // when you try to get the files in a file.

        // NOTE: // prepend '-al ' before path to show hidden files in ftp command
        // e.g. LIST -al /foobar/
        var self = this;
        var showHiddenFiles = atom.config.get('Remote-FTP.showHiddenFiles');

        if (self.isConnected()) {
          if (isFile === true) {
            completed.apply(null, [null, []]);
            return;
          }
          if (recursive) {
            (function () {
              var list = [];
              var digg = 0;

              var error = function error() {
                tryApply(completed, null, [null, list]);
              };
              var l = function l(p) {
                ++digg;
                self.ftp.list(showHiddenFiles ? '-al ' + p : p, function (err, lis) {
                  if (err) return error();

                  if (lis) {
                    lis.forEach(function (item) {
                      if (item.name === '.' || item.name === '..') return;
                      // NOTE: if the same, then we synhronize file
                      if (p !== item.name) item.name = p + '/' + item.name;

                      if (item.type === 'd' || item.type === 'l') {
                        list.push(item);
                        l(item.name);
                      } else {
                        item.type = 'f';
                        list.push(item);
                      }
                    });
                  }
                  if (--digg === 0) error();
                });
              };
              l(path);
            })();
          } else {
            self.ftp.list(showHiddenFiles ? '-al ' + path : path, function (err, lis) {
              var list = [];

              if (lis && !err) {
                lis.forEach(function (item) {
                  if (item.type === 'd' || item.type === 'l') {
                    if (item.name !== '.' && item.name !== '..') list.push(item);
                  } else {
                    item.type = 'f';
                    list.push(item);
                  }
                });
              }
              tryApply(completed, null, [err, list]);
            });
          }
        } else tryApply(completed, null, ['Not connected']);

        return self;
      }
    }, {
      key: 'get',
      value: function get(path, recursive, completed, progress) {
        var self = this;
        var local = self.client.toLocal(path);

        if (self.isConnected()) {
          self.ftp.cwd(path, function (err) {
            self.ftp.cwd('/', function () {
              if (err) {
                (function () {
                  // NOTE: File
                  console.log(local, path);
                  _fsPlus2['default'].makeTreeSync(_path2['default'].dirname(local));
                  var size = -1;
                  var pool = undefined;
                  self.once('150', function (reply) {
                    var str = reply.match(/([0-9]+)\s*(bytes)/);
                    if (str) {
                      size = parseInt(str[1], 10) || -1;
                      pool = setInterval(function () {
                        if (!self.ftp || !self.ftp._pasvSocket) return;
                        var read = self.ftp._pasvSocket.bytesRead;
                        tryApply(progress, null, [read / size]);
                      }, 250);
                    }
                  });
                  self.ftp.get(path, function (error, stream) {
                    if (error) {
                      if (pool) clearInterval(pool);
                      tryApply(completed, null, [err]);
                      return;
                    }

                    var dest = _fsPlus2['default'].createWriteStream(local);
                    dest.on('unpipe', function () {
                      if (pool) clearInterval(pool);
                      tryApply(completed, null, []);
                    });
                    dest.on('error', function (destError) {
                      if (pool) clearInterval(pool);
                      tryApply(completed, null, [destError]);
                    });
                    stream.pipe(dest);
                  });
                })();
              } else {
                // NOTE: Folder
                self.list(path, recursive, function (lError, list) {
                  list.unshift({ name: path, type: 'd' });
                  list.forEach(function (item) {
                    item.depth = item.name.replace(/^\/+/, '').replace(/\/+$/).split('/').length;
                  });
                  list.sort(function (a, b) {
                    if (a.depth === b.depth) return 0;
                    return a.depth > b.depth ? 1 : -1;
                  });
                  var error = null;
                  var i = -1;
                  var size = 0;
                  var read = 0;
                  var pool = undefined;
                  var total = list.length;
                  var e = function e() {
                    tryApply(completed, null, [error, list]);
                  };
                  var n = function n() {
                    ++i;
                    if (pool) clearInterval(pool);
                    tryApply(progress, null, [i / total]);

                    var item = list.shift();
                    if (typeof item === 'undefined' || item === null) return e();
                    var nLocal = self.client.toLocal(item.name);
                    if (item.type === 'd' || item.type === 'l') {
                      _fsPlus2['default'].makeTreeSync(nLocal);
                      n();
                    } else {
                      size = 0;
                      read = 0;
                      self.once('150', function (reply) {
                        var str = reply.match(/([0-9]+)\s*(bytes)/);
                        if (str) {
                          size = parseInt(str[1], 10) || -1;
                          pool = setInterval(function () {
                            if (!self.ftp || !self.ftp._pasvSocket) return;
                            read = self.ftp._pasvSocket.bytesRead;
                            tryApply(progress, null, [i / total + read / size / total]);
                          }, 250);
                        }
                      });
                      self.ftp.get(item.name, function (getError, stream) {
                        if (getError) {
                          error = getError;
                          return n();
                        }
                        var dest = _fsPlus2['default'].createWriteStream(nLocal);
                        dest.on('unpipe', function () {
                          return n();
                        });
                        dest.on('error', function (err) {
                          return n();
                        });
                        stream.pipe(dest);
                      });
                    }
                  };
                  n();
                });
              }
            });
          });
        } else tryApply(completed, null, ['Not connected']);
        return self;
      }
    }, {
      key: 'put',
      value: function put(path, completed, progress) {
        var self = this;
        var remote = self.client.toRemote(path);

        if (self.isConnected()) {
          if (_fsPlus2['default'].isFileSync(path)) {
            (function () {
              // NOTE: File
              var stats = _fsPlus2['default'].statSync(path);
              var size = stats.size;
              var written = 0;

              var e = function e(err) {
                tryApply(completed, null, [err || null, [{ name: path, type: 'f' }]]);
              };
              var pool = setInterval(function () {
                if (!self.ftp || !self.ftp._pasvSocket) return;
                written = self.ftp._pasvSocket.bytesWritten;
                tryApply(progress, null, [written / size]);
              }, 250);

              self.ftp.put(path, remote, function (err) {
                if (err) {
                  self.mkdir(_path2['default'].dirname(remote).replace(/\\/g, '/'), true, function (err) {
                    self.ftp.put(path, remote, function (putError) {
                      if (pool) clearInterval(pool);
                      return e(putError);
                    });
                  });
                  return;
                }
                if (pool) clearInterval(pool);
                return e();
              });
            })();
          } else {
            // NOTE: Folder
            self.client.traverseTree(path, function (list) {
              self.mkdir(remote, true, function (err) {
                var error = undefined;
                var i = -1;
                var size = 0;
                var written = 0;

                var total = list.length;
                var pool = setInterval(function () {
                  if (!self.ftp || !self.ftp._pasvSocket) return;
                  written = self.ftp._pasvSocket.bytesWritten;
                  tryApply(progress, null, [i / total + written / size / total]);
                }, 250);
                var e = function e() {
                  if (pool) clearInterval(pool);
                  tryApply(completed, null, [error, list]);
                };
                var n = function n() {
                  if (++i >= list.length) return e();
                  var item = list[i];
                  var nRemote = self.client.toRemote(item.name);
                  if (item.type === 'd' || item.type === 'l') {
                    self.ftp.mkdir(nRemote, function (mkdirErr) {
                      if (mkdirErr) error = mkdirErr;
                      return n();
                    });
                  } else {
                    var stats = _fsPlus2['default'].statSync(item.name);
                    size = stats.size;
                    written = 0;
                    self.ftp.put(item.name, nRemote, function (putErr) {
                      if (putErr) error = putErr;
                      return n();
                    });
                  }
                };
                return n();
              });
            });
          }
        } else tryApply(completed, null, ['Not connected']);

        return self;
      }
    }, {
      key: 'mkdir',
      value: function mkdir(path, recursive, completed) {
        var self = this;
        var remotes = path.replace(/^\/+/, '').replace(/\/+$/, '').split('/');
        var dirs = ['/' + remotes.slice(0, remotes.length).join('/')];

        if (self.isConnected()) {
          (function () {
            if (recursive) {
              for (var a = remotes.length - 1; a > 0; --a) {
                dirs.unshift('/' + remotes.slice(0, a).join('/'));
              }
            }

            var n = function n() {
              var dir = dirs.shift();
              var last = dirs.length === 0;

              self.ftp.mkdir(dir, function (err) {
                if (last) {
                  tryApply(completed, null, [err || null]);
                } else {
                  return n();
                }
              });
            };
            n();
          })();
        } else tryApply(completed, null, ['Not connected']);

        return self;
      }
    }, {
      key: 'mkfile',
      value: function mkfile(path, completed) {
        var self = this;
        var local = self.client.toLocal(path);
        var empty = new Buffer('', 'utf8');

        if (self.isConnected()) {
          self.ftp.put(empty, path, function (err) {
            if (err) {
              tryApply(completed, null, [err]);
              return;
            }

            _fsPlus2['default'].makeTreeSync(_path2['default'].dirname(local));
            _fsPlus2['default'].writeFile(local, empty, function (err2) {
              tryApply(completed, null, [err2]);
            });
          });
        } else tryApply(completed, null, ['Not connected']);

        return self;
      }
    }, {
      key: 'rename',
      value: function rename(source, dest, completed) {
        var self = this;

        if (self.isConnected()) {
          self.ftp.rename(source, dest, function (err) {
            if (err) {
              tryApply(completed, null, [err]);
            } else {
              _fsPlus2['default'].rename(self.client.toLocal(source), self.client.toLocal(dest), function (err) {
                tryApply(completed, null, [err]);
              });
            }
          });
        } else tryApply(completed, null, ['Not connected']);

        return self;
      }
    }, {
      key: 'delete',
      value: function _delete(path, completed) {
        var self = this;

        if (self.isConnected()) {
          self.ftp.cwd(path, function (err) {
            self.ftp.cwd('/', function () {
              if (err) {
                // NOTE: File
                self.ftp['delete'](path, function (err) {
                  tryApply(completed, null, [err, [{ name: path, type: 'f' }]]);
                });
              } else {
                // NOTE: Folder
                self.list(path, true, function (err, list) {
                  list.forEach(function (item) {
                    item.depth = item.name.replace(/^\/+/, '').replace(/\/+$/).split('/').length;
                  });
                  list.sort(function (a, b) {
                    if (a.depth == b.depth) return 0;
                    return a.depth > b.depth ? -1 : 1;
                  });

                  var done = 0;

                  var e = function e() {
                    self.ftp.rmdir(path, function (err) {
                      tryApply(completed, null, [err, list]);
                    });
                  };
                  list.forEach(function (item) {
                    ++done;
                    var fn = item.type === 'd' || item.type === 'l' ? 'rmdir' : 'delete';
                    self.ftp[fn](item.name, function (err) {
                      if (--done === 0) return e();
                    });
                  });
                  if (list.length === 0) e();
                });
              }
            });
          });
        } else tryApply(completed, null, ['Not connected']);

        return self;
      }
    }]);

    return ConnectorFTP;
  })(_connector2['default']);

  return ConnectorFTP;
})();

module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGU6Ly8vQzovVXNlcnMvdWNoaWhhLy5hdG9tL3BhY2thZ2VzL1JlbW90ZS1GVFAvbGliL2Nvbm5lY3RvcnMvZnRwLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O3NCQUVlLFNBQVM7Ozs7b0JBQ1AsTUFBTTs7OzttQkFDUCxLQUFLOzs7O3lCQUNDLGNBQWM7Ozs7dUJBQ1YsWUFBWTs7QUFOdEMsV0FBVyxDQUFDOztBQVFaLElBQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUM7Ozs7O0FBS3pCLFNBQVMsUUFBUSxDQUFDLFFBQVEsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFO0FBQ3pDLE1BQUksT0FBTyxRQUFRLEtBQUssVUFBVSxFQUFFO0FBQ2xDLFlBQVEsQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO0dBQy9CO0NBQ0Y7O3FCQUVlLENBQUEsU0FBUyxJQUFJLEdBQUc7TUFDeEIsWUFBWTtjQUFaLFlBQVk7O0FBQ0wsYUFEUCxZQUFZLEdBQ0s7NEJBRGpCLFlBQVk7O3dDQUNELElBQUk7QUFBSixZQUFJOzs7QUFDakIsaUNBRkUsWUFBWSw4Q0FFTCxJQUFJLEVBQUU7QUFDZixVQUFNLElBQUksR0FBRyxJQUFJLENBQUM7QUFDbEIsVUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUM7S0FDakI7O2lCQUxHLFlBQVk7O2FBUUwsdUJBQUc7QUFDWixZQUFNLElBQUksR0FBRyxJQUFJLENBQUM7QUFDbEIsZUFBTyxJQUFJLENBQUMsR0FBRyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDO09BQ3ZDOzs7YUFFTSxpQkFBQyxJQUFJLEVBQUUsU0FBUyxFQUFFO0FBQ3ZCLFlBQU0sSUFBSSxHQUFHLElBQUksQ0FBQzs7QUFFbEIsWUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7O0FBRWpCLFlBQUksQ0FBQyxHQUFHLEdBQUcsc0JBQVMsQ0FBQztBQUNyQixZQUFJLENBQUMs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cGFja2FnZXMvUmVtb3RlLUZUUC9saWIvY29ubmVjdG9ycy9mdHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuaW1wb3J0IEZTIGZyb20gJ2ZzLXBsdXMnO1xuaW1wb3J0IFBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgRlRQIGZyb20gJ2Z0cCc7XG5pbXBvcnQgQ29ubmVjdG9yIGZyb20gJy4uL2Nvbm5lY3Rvcic7XG5pbXBvcnQgeyBnZXRPYmplY3QgfSBmcm9tICcuLi9oZWxwZXJzJztcblxuY29uc3QgYXRvbSA9IGdsb2JhbC5hdG9tO1xuLy8gY29uc3QgZXJyb3JNZXNzYWdlcyA9IHtcbi8vXG4vLyB9XG5cbmZ1bmN0aW9uIHRyeUFwcGx5KGNhbGxiYWNrLCBjb250ZXh0LCBhcmdzKSB7XG4gIGlmICh0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIHtcbiAgICBjYWxsYmFjay5hcHBseShjb250ZXh0LCBhcmdzKTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCAoZnVuY3Rpb24gSU5JVCgpIHtcbiAgY2xhc3MgQ29ubmVjdG9yRlRQIGV4dGVuZHMgQ29ubmVjdG9yIHtcbiAgICBjb25zdHJ1Y3RvciguLi5hcmdzKSB7XG4gICAgICBzdXBlciguLi5hcmdzKTtcbiAgICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgICAgc2VsZi5mdHAgPSBudWxsO1xuICAgIH1cblxuXG4gICAgaXNDb25uZWN0ZWQoKSB7XG4gICAgICBjb25zdCBzZWxmID0gdGhpcztcbiAgICAgIHJldHVybiBzZWxmLmZ0cCAmJiBzZWxmLmZ0cC5jb25uZWN0ZWQ7XG4gICAgfVxuXG4gICAgY29ubmVjdChpbmZvLCBjb21wbGV0ZWQpIHtcbiAgICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgICBzZWxmLmluZm8gPSBpbmZvO1xuXG4gICAgICBzZWxmLmZ0cCA9IG5ldyBGVFAoKTtcbiAgICAgIHNlbGYuZnRwXG4gICAgICAub24oJ2dyZWV0aW5nJywgKG1zZykgPT4ge1xuICAgICAgICBzZWxmLmVtaXQoJ2dyZWV0aW5nJywgbXNnKTtcbiAgICAgIH0pXG4gICAgICAub24oJ3JlYWR5JywgKCkgPT4ge1xuICAgICAgICBzZWxmLmVtaXQoJ2Nvbm5lY3RlZCcpO1xuXG4gICAgICAgIC8vIGRpc2FibGUga2VlcGFsaXZlIG1hbnVhbGx5IHdoZW4gc3BlY2lmaWVkIGluIC5mdHBjb25maWdcbiAgICAgICAgc2VsZi5mdHAuX3NvY2tldC5zZXRLZWVwQWxpdmUoc2VsZi5pbmZvLmtlZXBhbGl2ZSA+IDApO1xuXG4gICAgICAgIHRyeUFwcGx5KGNvbXBsZXRlZCwgc2VsZiwgW10pO1xuICAgICAgfSlcbiAgICAgIC5vbignZW5kJywgKCkgPT4ge1xuICAgICAgICBzZWxmLmVtaXQoJ2VuZGVkJyk7XG4gICAgICB9KVxuICAgICAgLm9uKCdlcnJvcicsIChlcnIpID0+IHtcbiAgICAgICAgY29uc3QgZXJyQ29kZSA9IGdldE9iamVjdCh7XG4gICAgICAgICAgb2JqOiBlcnIsXG4gICAgICAgICAga2V5czogWydjb2RlJ10sXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmIChlcnJDb2RlID09PSA0MjEpIHtcbiAgICAgICAgICBzZWxmLmVtaXQoJ2Nsb3NlZCcsICdSRUNPTk5FQ1QnKTtcbiAgICAgICAgICBzZWxmLmRpc2Nvbm5lY3QoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHNlbGYuZW1pdCgnZXJyb3InLCBlcnIpO1xuICAgICAgfSk7XG5cbiAgICAgIHNlbGYuaW5mby5fZGVidWcgPSBzZWxmLmluZm8uZGVidWc7XG4gICAgICBzZWxmLmluZm8uZGVidWcgPSBmdW5jdGlvbiBERUJVRyhzdHIpIHtcbiAgICAgICAgY29uc3QgbG9nID0gc3RyLm1hdGNoKC9eXFxbY29ubmVjdGlvblxcXSAoPnw8KSAnKC4qPykoXFxcXHJcXFxcbik/JyQvKTtcbiAgICAgICAgaWYgKCFsb2cgfHwgbG9nWzFdICE9PSAnPCcpIHJldHVybjtcblxuICAgICAgICBjb25zdCByZXBseSA9IGxvZ1syXS5tYXRjaCgvXlswLTldKy8pO1xuICAgICAgICBpZiAocmVwbHkpIHNlbGYuZW1pdChyZXBseVswXSwgbG9nWzJdKTtcblxuICAgICAgICB0cnlBcHBseShzZWxmLmluZm8uX2RlYnVnLCBudWxsLCBbc3RyXSk7XG4gICAgICB9O1xuICAgICAgc2VsZi5mdHAuY29ubmVjdChzZWxmLmluZm8pO1xuXG4gICAgICByZXR1cm4gc2VsZjtcbiAgICB9XG5cbiAgICBkaXNjb25uZWN0KGNvbXBsZXRlZCkge1xuICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgICAgIGlmIChzZWxmLmZ0cCkge1xuICAgICAgICBzZWxmLmZ0cC5kZXN0cm95KCk7XG4gICAgICAgIHNlbGYuZnRwID0gbnVsbDtcbiAgICAgIH1cbiAgICAgIHRyeUFwcGx5KGNvbXBsZXRlZCwgbnVsbCwgW10pO1xuICAgICAgcmV0dXJuIHNlbGY7XG4gICAgfVxuXG4gICAgYWJvcnQoY29tcGxldGVkKSB7XG4gICAgICBjb25zdCBzZWxmID0gdGhpcztcblxuICAgICAgaWYgKHNlbGYuaXNDb25uZWN0ZWQoKSkge1xuICAgICAgICBzZWxmLmZ0cC5hYm9ydCgoKSA9PiB7XG4gICAgICAgICAgdHJ5QXBwbHkoY29tcGxldGVkLCBudWxsLCBbXSk7XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHRyeUFwcGx5KGNvbXBsZXRlZCwgbnVsbCwgW10pO1xuICAgICAgcmV0dXJuIHNlbGY7XG4gICAgfVxuXG4gICAgbGlzdChwYXRoLCByZWN1cnNpdmUsIGNvbXBsZXRlZCwgaXNGaWxlKSB7XG4gICAgICAvLyBOT1RFOiBpc0ZpbGUgaXMgaW5jbHVkZWQgYXMgdGhlIGxpc3QgY29tbWFuZCBmcm9tIEZUUCBkb2VzIG5vdCB0aHJvdyBhbiBlcnJvclxuICAgICAgLy8gd2hlbiB5b3UgdHJ5IHRvIGdldCB0aGUgZmlsZXMgaW4gYSBmaWxlLlxuXG4gICAgICAvLyBOT1RFOiAvLyBwcmVwZW5kICctYWwgJyBiZWZvcmUgcGF0aCB0byBzaG93IGhpZGRlbiBmaWxlcyBpbiBmdHAgY29tbWFuZFxuICAgICAgLy8gZS5nLiBMSVNUIC1hbCAvZm9vYmFyL1xuICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgICBjb25zdCBzaG93SGlkZGVuRmlsZXMgPSBhdG9tLmNvbmZpZy5nZXQoJ1JlbW90ZS1GVFAuc2hvd0hpZGRlbkZpbGVzJyk7XG5cbiAgICAgIGlmIChzZWxmLmlzQ29ubmVjdGVkKCkpIHtcbiAgICAgICAgaWYgKGlzRmlsZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgIGNvbXBsZXRlZC5hcHBseShudWxsLCBbbnVsbCwgW11dKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHJlY3Vyc2l2ZSkge1xuICAgICAgICAgIGNvbnN0IGxpc3QgPSBbXTtcbiAgICAgICAgICBsZXQgZGlnZyA9IDA7XG5cbiAgICAgICAgICBjb25zdCBlcnJvciA9ICgpID0+IHtcbiAgICAgICAgICAgIHRyeUFwcGx5KGNvbXBsZXRlZCwgbnVsbCwgW251bGwsIGxpc3RdKTtcbiAgICAgICAgICB9O1xuICAgICAgICAgIGNvbnN0IGwgPSBmdW5jdGlvbiAocCkge1xuICAgICAgICAgICAgKytkaWdnO1xuICAgICAgICAgICAgc2VsZi5mdHAubGlzdCgoc2hvd0hpZGRlbkZpbGVzID8gYC1hbCAke3B9YCA6IHApLCAoZXJyLCBsaXMpID0+IHtcbiAgICAgICAgICAgICAgaWYgKGVycikgcmV0dXJuIGVycm9yKCk7XG5cbiAgICAgICAgICAgICAgaWYgKGxpcykge1xuICAgICAgICAgICAgICAgIGxpcy5mb3JFYWNoKChpdGVtKSA9PiB7XG4gICAgICAgICAgICAgICAgICBpZiAoaXRlbS5uYW1lID09PSAnLicgfHwgaXRlbS5uYW1lID09PSAnLi4nKSByZXR1cm47XG4gICAgICAgICAgICAgICAgLy8gTk9URTogaWYgdGhlIHNhbWUsIHRoZW4gd2Ugc3luaHJvbml6ZSBmaWxlXG4gICAgICAgICAgICAgICAgICBpZiAocCAhPT0gaXRlbS5uYW1lKSBpdGVtLm5hbWUgPSBgJHtwfS8ke2l0ZW0ubmFtZX1gO1xuXG4gICAgICAgICAgICAgICAgICBpZiAoaXRlbS50eXBlID09PSAnZCcgfHwgaXRlbS50eXBlID09PSAnbCcpIHtcbiAgICAgICAgICAgICAgICAgICAgbGlzdC5wdXNoKGl0ZW0pO1xuICAgICAgICAgICAgICAgICAgICBsKGl0ZW0ubmFtZSk7XG4gICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpdGVtLnR5cGUgPSAnZic7XG4gICAgICAgICAgICAgICAgICAgIGxpc3QucHVzaChpdGVtKTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBpZiAoLS1kaWdnID09PSAwKSBlcnJvcigpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfTtcbiAgICAgICAgICBsKHBhdGgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHNlbGYuZnRwLmxpc3QoKHNob3dIaWRkZW5GaWxlcyA/IGAtYWwgJHtwYXRofWAgOiBwYXRoKSwgKGVyciwgbGlzKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBsaXN0ID0gW107XG5cbiAgICAgICAgICAgIGlmIChsaXMgJiYgIWVycikge1xuICAgICAgICAgICAgICBsaXMuZm9yRWFjaCgoaXRlbSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChpdGVtLnR5cGUgPT09ICdkJyB8fCBpdGVtLnR5cGUgPT09ICdsJykge1xuICAgICAgICAgICAgICAgICAgaWYgKGl0ZW0ubmFtZSAhPT0gJy4nICYmIGl0ZW0ubmFtZSAhPT0gJy4uJylsaXN0LnB1c2goaXRlbSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIGl0ZW0udHlwZSA9ICdmJztcbiAgICAgICAgICAgICAgICAgIGxpc3QucHVzaChpdGVtKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdHJ5QXBwbHkoY29tcGxldGVkLCBudWxsLCBbZXJyLCBsaXN0XSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB0cnlBcHBseShjb21wbGV0ZWQsIG51bGwsIFsnTm90IGNvbm5lY3RlZCddKTtcblxuICAgICAgcmV0dXJuIHNlbGY7XG4gICAgfVxuXG4gICAgZ2V0KHBhdGgsIHJlY3Vyc2l2ZSwgY29tcGxldGVkLCBwcm9ncmVzcykge1xuICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgICBjb25zdCBsb2NhbCA9IHNlbGYuY2xpZW50LnRvTG9jYWwocGF0aCk7XG5cbiAgICAgIGlmIChzZWxmLmlzQ29ubmVjdGVkKCkpIHtcbiAgICAgICAgc2VsZi5mdHAuY3dkKHBhdGgsIChlcnIpID0+IHtcbiAgICAgICAgICBzZWxmLmZ0cC5jd2QoJy8nLCAoKSA9PiB7XG4gICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgIC8vIE5PVEU6IEZpbGVcbiAgICAgICAgICAgICAgY29uc29sZS5sb2cobG9jYWwsIHBhdGgpO1xuICAgICAgICAgICAgICBGUy5tYWtlVHJlZVN5bmMoUGF0aC5kaXJuYW1lKGxvY2FsKSk7XG4gICAgICAgICAgICAgIGxldCBzaXplID0gLTE7XG4gICAgICAgICAgICAgIGxldCBwb29sO1xuICAgICAgICAgICAgICBzZWxmLm9uY2UoJzE1MCcsIChyZXBseSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHN0ciA9IHJlcGx5Lm1hdGNoKC8oWzAtOV0rKVxccyooYnl0ZXMpLyk7XG4gICAgICAgICAgICAgICAgaWYgKHN0cikge1xuICAgICAgICAgICAgICAgICAgc2l6ZSA9IHBhcnNlSW50KHN0clsxXSwgMTApIHx8IC0xO1xuICAgICAgICAgICAgICAgICAgcG9vbCA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFzZWxmLmZ0cCB8fCAhc2VsZi5mdHAuX3Bhc3ZTb2NrZXQpIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVhZCA9IHNlbGYuZnRwLl9wYXN2U29ja2V0LmJ5dGVzUmVhZDtcbiAgICAgICAgICAgICAgICAgICAgdHJ5QXBwbHkocHJvZ3Jlc3MsIG51bGwsIFtyZWFkIC8gc2l6ZV0pO1xuICAgICAgICAgICAgICAgICAgfSwgMjUwKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICBzZWxmLmZ0cC5nZXQocGF0aCwgKGVycm9yLCBzdHJlYW0pID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgIGlmIChwb29sKSBjbGVhckludGVydmFsKHBvb2wpO1xuICAgICAgICAgICAgICAgICAgdHJ5QXBwbHkoY29tcGxldGVkLCBudWxsLCBbZXJyXSk7XG4gICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgY29uc3QgZGVzdCA9IEZTLmNyZWF0ZVdyaXRlU3RyZWFtKGxvY2FsKTtcbiAgICAgICAgICAgICAgICBkZXN0Lm9uKCd1bnBpcGUnLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICBpZiAocG9vbCkgY2xlYXJJbnRlcnZhbChwb29sKTtcbiAgICAgICAgICAgICAgICAgIHRyeUFwcGx5KGNvbXBsZXRlZCwgbnVsbCwgW10pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGRlc3Qub24oJ2Vycm9yJywgKGRlc3RFcnJvcikgPT4ge1xuICAgICAgICAgICAgICAgICAgaWYgKHBvb2wpIGNsZWFySW50ZXJ2YWwocG9vbCk7XG4gICAgICAgICAgICAgICAgICB0cnlBcHBseShjb21wbGV0ZWQsIG51bGwsIFtkZXN0RXJyb3JdKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBzdHJlYW0ucGlwZShkZXN0KTtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAvLyBOT1RFOiBGb2xkZXJcbiAgICAgICAgICAgICAgc2VsZi5saXN0KHBhdGgsIHJlY3Vyc2l2ZSwgKGxFcnJvciwgbGlzdCkgPT4ge1xuICAgICAgICAgICAgICAgIGxpc3QudW5zaGlmdCh7IG5hbWU6IHBhdGgsIHR5cGU6ICdkJyB9KTtcbiAgICAgICAgICAgICAgICBsaXN0LmZvckVhY2goKGl0ZW0pID0+IHsgaXRlbS5kZXB0aCA9IGl0ZW0ubmFtZS5yZXBsYWNlKC9eXFwvKy8sICcnKS5yZXBsYWNlKC9cXC8rJC8pLnNwbGl0KCcvJykubGVuZ3RoOyB9KTtcbiAgICAgICAgICAgICAgICBsaXN0LnNvcnQoKGEsIGIpID0+IHtcbiAgICAgICAgICAgICAgICAgIGlmIChhLmRlcHRoID09PSBiLmRlcHRoKSByZXR1cm4gMDtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBhLmRlcHRoID4gYi5kZXB0aCA/IDEgOiAtMTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBsZXQgZXJyb3IgPSBudWxsO1xuICAgICAgICAgICAgICAgIGxldCBpID0gLTE7XG4gICAgICAgICAgICAgICAgbGV0IHNpemUgPSAwO1xuICAgICAgICAgICAgICAgIGxldCByZWFkID0gMDtcbiAgICAgICAgICAgICAgICBsZXQgcG9vbDtcbiAgICAgICAgICAgICAgICBjb25zdCB0b3RhbCA9IGxpc3QubGVuZ3RoO1xuICAgICAgICAgICAgICAgIGNvbnN0IGUgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICB0cnlBcHBseShjb21wbGV0ZWQsIG51bGwsIFtlcnJvciwgbGlzdF0pO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgY29uc3QgbiA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICsraTtcbiAgICAgICAgICAgICAgICAgIGlmIChwb29sKSBjbGVhckludGVydmFsKHBvb2wpO1xuICAgICAgICAgICAgICAgICAgdHJ5QXBwbHkocHJvZ3Jlc3MsIG51bGwsIFtpIC8gdG90YWxdKTtcblxuICAgICAgICAgICAgICAgICAgY29uc3QgaXRlbSA9IGxpc3Quc2hpZnQoKTtcbiAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgaXRlbSA9PT0gJ3VuZGVmaW5lZCcgfHwgaXRlbSA9PT0gbnVsbCkgcmV0dXJuIGUoKTtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IG5Mb2NhbCA9IHNlbGYuY2xpZW50LnRvTG9jYWwoaXRlbS5uYW1lKTtcbiAgICAgICAgICAgICAgICAgIGlmIChpdGVtLnR5cGUgPT09ICdkJyB8fCBpdGVtLnR5cGUgPT09ICdsJykge1xuICAgICAgICAgICAgICAgICAgICBGUy5tYWtlVHJlZVN5bmMobkxvY2FsKTtcbiAgICAgICAgICAgICAgICAgICAgbigpO1xuICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgc2l6ZSA9IDA7XG4gICAgICAgICAgICAgICAgICAgIHJlYWQgPSAwO1xuICAgICAgICAgICAgICAgICAgICBzZWxmLm9uY2UoJzE1MCcsIChyZXBseSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHN0ciA9IHJlcGx5Lm1hdGNoKC8oWzAtOV0rKVxccyooYnl0ZXMpLyk7XG4gICAgICAgICAgICAgICAgICAgICAgaWYgKHN0cikge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2l6ZSA9IHBhcnNlSW50KHN0clsxXSwgMTApIHx8IC0xO1xuICAgICAgICAgICAgICAgICAgICAgICAgcG9vbCA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFzZWxmLmZ0cCB8fCAhc2VsZi5mdHAuX3Bhc3ZTb2NrZXQpIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcmVhZCA9IHNlbGYuZnRwLl9wYXN2U29ja2V0LmJ5dGVzUmVhZDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdHJ5QXBwbHkocHJvZ3Jlc3MsIG51bGwsIFsoaSAvIHRvdGFsKSArIChyZWFkIC8gc2l6ZSAvIHRvdGFsKV0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSwgMjUwKTtcbiAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBzZWxmLmZ0cC5nZXQoaXRlbS5uYW1lLCAoZ2V0RXJyb3IsIHN0cmVhbSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgIGlmIChnZXRFcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3IgPSBnZXRFcnJvcjtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBuKCk7XG4gICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGRlc3QgPSBGUy5jcmVhdGVXcml0ZVN0cmVhbShuTG9jYWwpO1xuICAgICAgICAgICAgICAgICAgICAgIGRlc3Qub24oJ3VucGlwZScsICgpID0+IG4oKSk7XG4gICAgICAgICAgICAgICAgICAgICAgZGVzdC5vbignZXJyb3InLCBlcnIgPT4gbigpKTtcbiAgICAgICAgICAgICAgICAgICAgICBzdHJlYW0ucGlwZShkZXN0KTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBuKCk7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB0cnlBcHBseShjb21wbGV0ZWQsIG51bGwsIFsnTm90IGNvbm5lY3RlZCddKTtcbiAgICAgIHJldHVybiBzZWxmO1xuICAgIH1cblxuICAgIHB1dChwYXRoLCBjb21wbGV0ZWQsIHByb2dyZXNzKSB7XG4gICAgICBjb25zdCBzZWxmID0gdGhpcztcbiAgICAgIGNvbnN0IHJlbW90ZSA9IHNlbGYuY2xpZW50LnRvUmVtb3RlKHBhdGgpO1xuXG4gICAgICBpZiAoc2VsZi5pc0Nvbm5lY3RlZCgpKSB7XG4gICAgICAgIGlmIChGUy5pc0ZpbGVTeW5jKHBhdGgpKSB7XG4gICAgICAgICAgLy8gTk9URTogRmlsZVxuICAgICAgICAgIGNvbnN0IHN0YXRzID0gRlMuc3RhdFN5bmMocGF0aCk7XG4gICAgICAgICAgY29uc3Qgc2l6ZSA9IHN0YXRzLnNpemU7XG4gICAgICAgICAgbGV0IHdyaXR0ZW4gPSAwO1xuXG4gICAgICAgICAgY29uc3QgZSA9IChlcnIpID0+IHtcbiAgICAgICAgICAgIHRyeUFwcGx5KGNvbXBsZXRlZCwgbnVsbCwgW2VyciB8fCBudWxsLCBbeyBuYW1lOiBwYXRoLCB0eXBlOiAnZicgfV1dKTtcbiAgICAgICAgICB9O1xuICAgICAgICAgIGNvbnN0IHBvb2wgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgICAgICBpZiAoIXNlbGYuZnRwIHx8ICFzZWxmLmZ0cC5fcGFzdlNvY2tldCkgcmV0dXJuO1xuICAgICAgICAgICAgd3JpdHRlbiA9IHNlbGYuZnRwLl9wYXN2U29ja2V0LmJ5dGVzV3JpdHRlbjtcbiAgICAgICAgICAgIHRyeUFwcGx5KHByb2dyZXNzLCBudWxsLCBbd3JpdHRlbiAvIHNpemVdKTtcbiAgICAgICAgICB9LCAyNTApO1xuXG4gICAgICAgICAgc2VsZi5mdHAucHV0KHBhdGgsIHJlbW90ZSwgKGVycikgPT4ge1xuICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICBzZWxmLm1rZGlyKFBhdGguZGlybmFtZShyZW1vdGUpLnJlcGxhY2UoL1xcXFwvZywgJy8nKSwgdHJ1ZSwgKGVycikgPT4ge1xuICAgICAgICAgICAgICAgIHNlbGYuZnRwLnB1dChwYXRoLCByZW1vdGUsIChwdXRFcnJvcikgPT4ge1xuICAgICAgICAgICAgICAgICAgaWYgKHBvb2wpIGNsZWFySW50ZXJ2YWwocG9vbCk7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gZShwdXRFcnJvcik7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocG9vbCkgY2xlYXJJbnRlcnZhbChwb29sKTtcbiAgICAgICAgICAgIHJldHVybiBlKCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gTk9URTogRm9sZGVyXG4gICAgICAgICAgc2VsZi5jbGllbnQudHJhdmVyc2VUcmVlKHBhdGgsIChsaXN0KSA9PiB7XG4gICAgICAgICAgICBzZWxmLm1rZGlyKHJlbW90ZSwgdHJ1ZSwgKGVycikgPT4ge1xuICAgICAgICAgICAgICBsZXQgZXJyb3I7XG4gICAgICAgICAgICAgIGxldCBpID0gLTE7XG4gICAgICAgICAgICAgIGxldCBzaXplID0gMDtcbiAgICAgICAgICAgICAgbGV0IHdyaXR0ZW4gPSAwO1xuXG4gICAgICAgICAgICAgIGNvbnN0IHRvdGFsID0gbGlzdC5sZW5ndGg7XG4gICAgICAgICAgICAgIGNvbnN0IHBvb2wgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCFzZWxmLmZ0cCB8fCAhc2VsZi5mdHAuX3Bhc3ZTb2NrZXQpIHJldHVybjtcbiAgICAgICAgICAgICAgICB3cml0dGVuID0gc2VsZi5mdHAuX3Bhc3ZTb2NrZXQuYnl0ZXNXcml0dGVuO1xuICAgICAgICAgICAgICAgIHRyeUFwcGx5KHByb2dyZXNzLCBudWxsLCBbKGkgLyB0b3RhbCkgKyAod3JpdHRlbiAvIHNpemUgLyB0b3RhbCldKTtcbiAgICAgICAgICAgICAgfSwgMjUwKTtcbiAgICAgICAgICAgICAgY29uc3QgZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBpZiAocG9vbCkgY2xlYXJJbnRlcnZhbChwb29sKTtcbiAgICAgICAgICAgICAgICB0cnlBcHBseShjb21wbGV0ZWQsIG51bGwsIFtlcnJvciwgbGlzdF0pO1xuICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICBjb25zdCBuID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGlmICgrK2kgPj0gbGlzdC5sZW5ndGgpIHJldHVybiBlKCk7XG4gICAgICAgICAgICAgICAgY29uc3QgaXRlbSA9IGxpc3RbaV07XG4gICAgICAgICAgICAgICAgY29uc3QgblJlbW90ZSA9IHNlbGYuY2xpZW50LnRvUmVtb3RlKGl0ZW0ubmFtZSk7XG4gICAgICAgICAgICAgICAgaWYgKGl0ZW0udHlwZSA9PT0gJ2QnIHx8IGl0ZW0udHlwZSA9PT0gJ2wnKSB7XG4gICAgICAgICAgICAgICAgICBzZWxmLmZ0cC5ta2RpcihuUmVtb3RlLCAobWtkaXJFcnIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG1rZGlyRXJyKSBlcnJvciA9IG1rZGlyRXJyO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbigpO1xuICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IHN0YXRzID0gRlMuc3RhdFN5bmMoaXRlbS5uYW1lKTtcbiAgICAgICAgICAgICAgICAgIHNpemUgPSBzdGF0cy5zaXplO1xuICAgICAgICAgICAgICAgICAgd3JpdHRlbiA9IDA7XG4gICAgICAgICAgICAgICAgICBzZWxmLmZ0cC5wdXQoaXRlbS5uYW1lLCBuUmVtb3RlLCAocHV0RXJyKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChwdXRFcnIpIGVycm9yID0gcHV0RXJyO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbigpO1xuICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICByZXR1cm4gbigpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB0cnlBcHBseShjb21wbGV0ZWQsIG51bGwsIFsnTm90IGNvbm5lY3RlZCddKTtcblxuICAgICAgcmV0dXJuIHNlbGY7XG4gICAgfVxuXG4gICAgbWtkaXIocGF0aCwgcmVjdXJzaXZlLCBjb21wbGV0ZWQpIHtcbiAgICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgICAgY29uc3QgcmVtb3RlcyA9IHBhdGgucmVwbGFjZSgvXlxcLysvLCAnJykucmVwbGFjZSgvXFwvKyQvLCAnJykuc3BsaXQoJy8nKTtcbiAgICAgIGNvbnN0IGRpcnMgPSBbYC8ke3JlbW90ZXMuc2xpY2UoMCwgcmVtb3Rlcy5sZW5ndGgpLmpvaW4oJy8nKX1gXTtcblxuICAgICAgaWYgKHNlbGYuaXNDb25uZWN0ZWQoKSkge1xuICAgICAgICBpZiAocmVjdXJzaXZlKSB7XG4gICAgICAgICAgZm9yIChsZXQgYSA9IHJlbW90ZXMubGVuZ3RoIC0gMTsgYSA+IDA7IC0tYSkge1xuICAgICAgICAgICAgZGlycy51bnNoaWZ0KGAvJHtyZW1vdGVzLnNsaWNlKDAsIGEpLmpvaW4oJy8nKX1gKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBuID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgIGNvbnN0IGRpciA9IGRpcnMuc2hpZnQoKTtcbiAgICAgICAgICBjb25zdCBsYXN0ID0gZGlycy5sZW5ndGggPT09IDA7XG5cbiAgICAgICAgICBzZWxmLmZ0cC5ta2RpcihkaXIsIChlcnIpID0+IHtcbiAgICAgICAgICAgIGlmIChsYXN0KSB7XG4gICAgICAgICAgICAgIHRyeUFwcGx5KGNvbXBsZXRlZCwgbnVsbCwgW2VyciB8fCBudWxsXSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICByZXR1cm4gbigpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuICAgICAgICBuKCk7XG4gICAgICB9IGVsc2UgdHJ5QXBwbHkoY29tcGxldGVkLCBudWxsLCBbJ05vdCBjb25uZWN0ZWQnXSk7XG5cbiAgICAgIHJldHVybiBzZWxmO1xuICAgIH1cblxuICAgIG1rZmlsZShwYXRoLCBjb21wbGV0ZWQpIHtcbiAgICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgICAgY29uc3QgbG9jYWwgPSBzZWxmLmNsaWVudC50b0xvY2FsKHBhdGgpO1xuICAgICAgY29uc3QgZW1wdHkgPSBuZXcgQnVmZmVyKCcnLCAndXRmOCcpO1xuXG4gICAgICBpZiAoc2VsZi5pc0Nvbm5lY3RlZCgpKSB7XG4gICAgICAgIHNlbGYuZnRwLnB1dChlbXB0eSwgcGF0aCwgKGVycikgPT4ge1xuICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgIHRyeUFwcGx5KGNvbXBsZXRlZCwgbnVsbCwgW2Vycl0pO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIEZTLm1ha2VUcmVlU3luYyhQYXRoLmRpcm5hbWUobG9jYWwpKTtcbiAgICAgICAgICBGUy53cml0ZUZpbGUobG9jYWwsIGVtcHR5LCAoZXJyMikgPT4ge1xuICAgICAgICAgICAgdHJ5QXBwbHkoY29tcGxldGVkLCBudWxsLCBbZXJyMl0pO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB0cnlBcHBseShjb21wbGV0ZWQsIG51bGwsIFsnTm90IGNvbm5lY3RlZCddKTtcblxuICAgICAgcmV0dXJuIHNlbGY7XG4gICAgfVxuXG4gICAgcmVuYW1lKHNvdXJjZSwgZGVzdCwgY29tcGxldGVkKSB7XG4gICAgICBjb25zdCBzZWxmID0gdGhpcztcblxuICAgICAgaWYgKHNlbGYuaXNDb25uZWN0ZWQoKSkge1xuICAgICAgICBzZWxmLmZ0cC5yZW5hbWUoc291cmNlLCBkZXN0LCAoZXJyKSA9PiB7XG4gICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgdHJ5QXBwbHkoY29tcGxldGVkLCBudWxsLCBbZXJyXSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIEZTLnJlbmFtZShzZWxmLmNsaWVudC50b0xvY2FsKHNvdXJjZSksIHNlbGYuY2xpZW50LnRvTG9jYWwoZGVzdCksIChlcnIpID0+IHtcbiAgICAgICAgICAgICAgdHJ5QXBwbHkoY29tcGxldGVkLCBudWxsLCBbZXJyXSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHRyeUFwcGx5KGNvbXBsZXRlZCwgbnVsbCwgWydOb3QgY29ubmVjdGVkJ10pO1xuXG4gICAgICByZXR1cm4gc2VsZjtcbiAgICB9XG5cbiAgICBkZWxldGUocGF0aCwgY29tcGxldGVkKSB7XG4gICAgICBjb25zdCBzZWxmID0gdGhpcztcblxuICAgICAgaWYgKHNlbGYuaXNDb25uZWN0ZWQoKSkge1xuICAgICAgICBzZWxmLmZ0cC5jd2QocGF0aCwgKGVycikgPT4ge1xuICAgICAgICAgIHNlbGYuZnRwLmN3ZCgnLycsICgpID0+IHtcbiAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgLy8gTk9URTogRmlsZVxuICAgICAgICAgICAgICBzZWxmLmZ0cC5kZWxldGUocGF0aCwgKGVycikgPT4ge1xuICAgICAgICAgICAgICAgIHRyeUFwcGx5KGNvbXBsZXRlZCwgbnVsbCwgW2VyciwgW3sgbmFtZTogcGF0aCwgdHlwZTogJ2YnIH1dXSk7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgLy8gTk9URTogRm9sZGVyXG4gICAgICAgICAgICAgIHNlbGYubGlzdChwYXRoLCB0cnVlLCAoZXJyLCBsaXN0KSA9PiB7XG4gICAgICAgICAgICAgICAgbGlzdC5mb3JFYWNoKChpdGVtKSA9PiB7IGl0ZW0uZGVwdGggPSBpdGVtLm5hbWUucmVwbGFjZSgvXlxcLysvLCAnJykucmVwbGFjZSgvXFwvKyQvKS5zcGxpdCgnLycpLmxlbmd0aDsgfSk7XG4gICAgICAgICAgICAgICAgbGlzdC5zb3J0KChhLCBiKSA9PiB7XG4gICAgICAgICAgICAgICAgICBpZiAoYS5kZXB0aCA9PSBiLmRlcHRoKSByZXR1cm4gMDtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBhLmRlcHRoID4gYi5kZXB0aCA/IC0xIDogMTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIGxldCBkb25lID0gMDtcblxuICAgICAgICAgICAgICAgIGNvbnN0IGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICBzZWxmLmZ0cC5ybWRpcihwYXRoLCAoZXJyKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRyeUFwcGx5KGNvbXBsZXRlZCwgbnVsbCwgW2VyciwgbGlzdF0pO1xuICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBsaXN0LmZvckVhY2goKGl0ZW0pID0+IHtcbiAgICAgICAgICAgICAgICAgICsrZG9uZTtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IGZuID0gaXRlbS50eXBlID09PSAnZCcgfHwgaXRlbS50eXBlID09PSAnbCcgPyAncm1kaXInIDogJ2RlbGV0ZSc7XG4gICAgICAgICAgICAgICAgICBzZWxmLmZ0cFtmbl0oaXRlbS5uYW1lLCAoZXJyKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmICgtLWRvbmUgPT09IDApIHJldHVybiBlKCk7XG4gICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBpZiAobGlzdC5sZW5ndGggPT09IDApIGUoKTtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHRyeUFwcGx5KGNvbXBsZXRlZCwgbnVsbCwgWydOb3QgY29ubmVjdGVkJ10pO1xuXG4gICAgICByZXR1cm4gc2VsZjtcbiAgICB9XG5cbn1cblxuICByZXR1cm4gQ29ubmVjdG9yRlRQO1xufSgpKTtcbiJdfQ==