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

var _atomSpacePenViews = require('atom-space-pen-views');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _events = require('events');

var _stripJsonComments = require('strip-json-comments');

var _stripJsonComments2 = _interopRequireDefault(_stripJsonComments);

var _chokidar = require('chokidar');

var _chokidar2 = _interopRequireDefault(_chokidar);

var _helpers = require('./helpers');

var _directory = require('./directory');

var _directory2 = _interopRequireDefault(_directory);

var _progress = require('./progress');

var _progress2 = _interopRequireDefault(_progress);

var _connectorsFtp = require('./connectors/ftp');

var _connectorsFtp2 = _interopRequireDefault(_connectorsFtp);

var _connectorsSftp = require('./connectors/sftp');

var _connectorsSftp2 = _interopRequireDefault(_connectorsSftp);

var _dialogsPromptPassDialog = require('./dialogs/prompt-pass-dialog');

var _dialogsPromptPassDialog2 = _interopRequireDefault(_dialogsPromptPassDialog);

var _ignore = require('ignore');

var _ignore2 = _interopRequireDefault(_ignore);

'use babel';

var atom = global.atom;

exports['default'] = (function INIT() {
  var Client = (function (_EventEmitter) {
    _inherits(Client, _EventEmitter);

    function Client() {
      _classCallCheck(this, Client);

      _get(Object.getPrototypeOf(Client.prototype), 'constructor', this).call(this);
      var self = this;
      self.info = null;
      self.connector = null;
      self._current = null;
      self._queue = [];

      self.root = new _directory2['default']({
        name: '/',
        path: '/',
        client: this,
        isExpanded: true
      });

      self.status = 'NOT_CONNECTED'; // Options NOT_CONNECTED, CONNECTING, CONNECTED

      self.watch = {
        watcher: null,
        files: [],
        addListeners: function addListeners() {
          var watchData = (0, _helpers.getObject)({
            keys: ['info', 'watch'],
            obj: self
          });
          if (watchData === null || watchData === false) return;
          if (typeof watchData === 'string') watchData = [watchData];

          if (!Array.isArray(watchData) || watchData.length === 0) return;

          var dir = self.getProjectPath();

          var watchDataFormatted = watchData.map(function (watch) {
            return _path2['default'].resolve(dir, watch);
          });

          var watcher = _chokidar2['default'].watch(watchDataFormatted, {
            ignored: /[\/\\]\./,
            persistent: true
          });

          watcher.on('change', function (path) {
            self.watch.queueUpload.apply(self, [path]);
          });

          self.files = watchDataFormatted.slice();

          atom.notifications.addInfo('Remote FTP: Added watch listeners', {
            dismissable: false
          });
          self.watcher = watcher;
        },
        removeListeners: function removeListeners() {
          if (self.watcher != null) {
            self.watcher.close();
            atom.notifications.addInfo('Remote FTP: Stopped watch listeners', {
              dismissable: false
            });
          }
        },
        queue: {},
        queueUpload: function queueUpload(fileName) {
          var timeoutDuration = isNaN(parseInt(self.info.watchTimeout, 10)) === true ? 500 : parseInt(self.info.watchTimeout, 10);

          function scheduleUpload(file) {
            self.watch.queue[file] = setTimeout(function () {
              self.upload(file, function () {});
            }, timeoutDuration);
          }

          if (self.watch.queue[fileName] !== null) {
            clearTimeout(self.watch.queue[fileName]);
            self.watch.queue[fileName] = null;
          }

          scheduleUpload(fileName);
        }

      };

      self.watch.addListeners = self.watch.addListeners.bind(self);
      self.watch.removeListeners = self.watch.removeListeners.bind(self);

      self.on('connected', self.watch.addListeners);
      self.on('disconnected', self.watch.removeListeners);
    }

    _createClass(Client, [{
      key: 'readConfig',
      value: function readConfig(callback) {
        var self = this;
        var error = function error(err) {
          if (typeof callback === 'function') callback.apply(self, [err]);
        };
        self.info = null;
        self.ftpConfigPath = self.getConfigPath();

        if (self.ftpConfigPath === false) throw new Error('Remote FTP: getConfigPath returned false, but expected a string');

        _fsPlus2['default'].readFile(self.ftpConfigPath, 'utf8', function (err, res) {
          if (err) return error(err);

          var data = (0, _stripJsonComments2['default'])(res);
          var json = null;
          if (self.validateConfig(data)) {
            try {
              json = JSON.parse(data);

              self.info = json;
              self.root.name = '';
              self.root.path = '/' + self.info.remote.replace(/^\/+/, '');
            } catch (e) {
              atom.notifications.addError('Could not process `.ftpconfig`', {
                detail: e,
                dismissable: false
              });
            }
          }
          if (json !== null && typeof callback === 'function') {
            callback.apply(self, [err, json]);
          }
        });
      }
    }, {
      key: 'getFilePath',
      value: function getFilePath(relativePath) {
        var self = this;
        var projectPath = self.getProjectPath();
        if (projectPath === false) return false;
        return _path2['default'].resolve(projectPath, relativePath);
      }
    }, {
      key: 'getProjectPath',
      value: function getProjectPath() {
        var self = this;
        var projectPath = null;

        if ((0, _helpers.multipleHostsEnabled)() === true) {
          var $selectedDir = (0, _atomSpacePenViews.$)('.tree-view .selected');
          var $currentProject = $selectedDir.hasClass('project-root') ? $selectedDir : $selectedDir.closest('.project-root');
          projectPath = $currentProject.find('.header span.name').data('path');
        } else {
          var firstDirectory = atom.project.getDirectories()[0];
          if (firstDirectory != null) projectPath = firstDirectory.path;
        }

        if (projectPath != null) {
          self.projectPath = projectPath;
          return projectPath;
        }
        atom.notifications.addError('Remote FTP: Could not get project path', {
          dismissable: false, // Want user to report error so don't let them close it
          detail: 'Please report this error if it occurs. Multiple Hosts is ' + (0, _helpers.multipleHostsEnabled)()
        });
        return false;
      }
    }, {
      key: 'getConfigPath',
      value: function getConfigPath() {
        var self = this;
        return self.getFilePath('./.ftpconfig');
      }
    }, {
      key: 'validateConfig',
      value: function validateConfig(data) {
        try {
          // try to parse the json
          JSON.parse(data);
          return true;
        } catch (error) {
          (function () {
            // try to extract bad syntax location from error message
            var lineNumber = -1;
            var regex = /at position ([0-9]+)$/;
            var result = error.message.match(regex);
            if (result && result.length > 0) {
              var cursorPos = parseInt(result[1]);
              // count lines until syntax error position
              var tmp = data.substr(0, cursorPos);
              for (lineNumber = -1, index = 0; index != -1; lineNumber++, index = tmp.indexOf('\n', index + 1));
            }

            // show notification
            atom.notifications.addError('Could not parse `.ftpconfig`', {
              detail: '' + error.message,
              dismissable: false
            });

            // open .ftpconfig file and mark the faulty line
            atom.workspace.open('.ftpconfig').then(function (editor) {
              if (lineNumber == -1) return; // no line number to mark

              var decorationConfig = {
                'class': 'ftpconfig_line_error'
              };
              editor.getDecorations(decorationConfig).forEach(function (decoration) {
                decoration.destroy();
              });

              var range = editor.getBuffer().clipRange([[lineNumber, 0], [lineNumber, Infinity]]);
              var marker = editor.markBufferRange(range, {
                invalidate: 'inside'
              });

              decorationConfig.type = 'line';
              editor.decorateMarker(marker, decorationConfig);
            });
          })();
        }

        // return false, as the json is not valid
        return false;
      }
    }, {
      key: 'isConnected',
      value: function isConnected() {
        var self = this;
        return self.connector && self.connector.isConnected();
      }
    }, {
      key: 'onceConnected',
      value: function onceConnected(onconnect) {
        var self = this;
        if (self.connector && self.connector.isConnected()) {
          onconnect.apply(self);
          return true;
        } else if (typeof onconnect === 'function') {
          if (self.status === 'NOT_CONNECTED') {
            self.status = 'CONNECTING';
            self.readConfig(function (err) {
              if (err !== null) {
                self.status = 'NOT_CONNECTED';
                // NOTE: Remove notification as it will just say there
                // is no ftpconfig if none in directory all the time
                // atom.notifications.addError("Remote FTP: " + err);
                return;
              }
              self.connect(true);
            });
          }

          self.once('connected', onconnect);
          return false;
        }
        console.warn('Remote-FTP: Not connected and typeof onconnect is ' + typeof onconnect);
        return false;
      }
    }, {
      key: 'connect',
      value: function connect(reconnect) {
        var self = this;
        if (reconnect !== true) self.disconnect();
        if (self.isConnected()) return;
        if (!self.info) return;
        if (self.info.promptForPass === true) self.promptForPass();else self.doConnect();
      }
    }, {
      key: 'doConnect',
      value: function doConnect() {
        var self = this;

        atom.notifications.addInfo('Remote FTP: Connecting...', {
          dismissable: false
        });

        var info = undefined;
        switch (self.info.protocol) {
          case 'ftp':
            {
              info = {
                host: self.info.host || '',
                port: self.info.port || 21,
                user: self.info.user || '',
                password: self.info.pass || '',
                secure: self.info.secure || '',
                secureOptions: self.info.secureOptions || '',
                connTimeout: self.info.timeout || 10000,
                pasvTimeout: self.info.timeout || 10000,
                keepalive: self.info.keepalive || 10000,
                debug: function debug(str) {
                  var log = str.match(/^\[connection\] (>|<) '(.*?)(\\r\\n)?'$/);
                  if (!log) return;
                  if (log[2].match(/^PASS /)) log[2] = 'PASS ******';
                  self.emit('debug', log[1] + ' ' + log[2]);
                  console.debug(log[1] + ' ' + log[2]);
                }
              };
              self.connector = new _connectorsFtp2['default'](self);
              break;
            }

          case 'sftp':
            {
              info = {
                host: self.info.host || '',
                port: self.info.port || 21,
                username: self.info.user || '',
                readyTimeout: self.info.connTimeout || 10000,
                keepaliveInterval: self.info.keepalive || 10000
              };

              if (self.info.pass) info.password = self.info.pass;

              if (self.info.privatekey) {
                try {
                  var pk = _fsPlus2['default'].readFileSync(self.info.privatekey);
                  info.privateKey = pk;
                } catch (err) {
                  atom.notifications.addError('Remote FTP: Could not read privateKey file', {
                    detail: err,
                    dismissable: true
                  });
                }
              }

              if (self.info.passphrase) info.passphrase = self.info.passphrase;

              if (self.info.agent) info.agent = self.info.agent;

              if (self.info.agent === 'env') info.agent = process.env.SSH_AUTH_SOCK;

              if (self.info.hosthash) info.hostHash = self.info.hosthash;

              if (self.info.ignorehost) {
                // NOTE: hostVerifier doesn't run at all if it's not a function.
                // Allows you to skip hostHash option in ssh2 0.5+
                info.hostVerifier = false;
              }

              info.algorithms = {
                key: ['ecdh-sha2-nistp256', 'ecdh-sha2-nistp384', 'ecdh-sha2-nistp521', 'diffie-hellman-group-exchange-sha256', 'diffie-hellman-group14-sha1', 'diffie-hellman-group-exchange-sha1', 'diffie-hellman-group1-sha1'],
                cipher: ['aes128-ctr', 'aes192-ctr', 'aes256-ctr', 'aes128-gcm', 'aes128-gcm@openssh.com', 'aes256-gcm', 'aes256-gcm@openssh.com', 'aes256-cbc', 'aes192-cbc', 'aes128-cbc', 'blowfish-cbc', '3des-cbc', 'arcfour256', 'arcfour128', 'cast128-cbc', 'arcfour'],
                serverHostKey: ['ssh-rsa', 'ecdsa-sha2-nistp256', 'ecdsa-sha2-nistp384', 'ecdsa-sha2-nistp521', 'ssh-dss'],
                hmac: ['hmac-sha2-256', 'hmac-sha2-512', 'hmac-sha1', 'hmac-md5', 'hmac-sha2-256-96', 'hmac-sha2-512-96', 'hmac-ripemd160', 'hmac-sha1-96', 'hmac-md5-96'],
                compress: ['none', 'zlib@openssh.com', 'zlib']
              };

              info.filePermissions = self.info.filePermissions;
              if (self.info.keyboardInteractive) info.tryKeyboard = true;

              self.connector = new _connectorsSftp2['default'](self);
              break;
            }

          default:
            throw new Error('No `protocol` found in connection credential. Please recreate .ftpconfig file from Packages -> Remote-FTP -> Create (S)FTP config file.');
        }

        self.connector.connect(info, function () {
          if (self.root.status !== 1) self.root.open();
          self.emit('connected');
          self.status = 'CONNECTED';

          atom.notifications.addSuccess('Remote FTP: Connected', {
            dismissable: false
          });
        });

        self.connector.on('closed', function (action) {
          self.disconnect();
          self.status = 'NOT_CONNECTED';
          self.emit('closed');
          atom.notifications.addInfo('Remote FTP: Connection closed', {
            dismissable: false
          });

          if (action === 'RECONNECT') {
            self.connect(true);
          }
        });
        self.connector.on('ended', function () {
          self.emit('ended');
        });
        self.connector.on('error', function (err) {
          atom.notifications.addError('Remote FTP: Connection failed', {
            detail: err,
            dismissable: false
          });
        });
      }
    }, {
      key: 'disconnect',
      value: function disconnect() {
        var self = this;

        if (self.connector) {
          self.connector.disconnect();
          delete self.connector;
          self.connector = null;
        }

        if (self.root) {
          self.root.status = 0;
          self.root.destroy();
        }

        self.watch.removeListeners.apply(self);

        self._current = null;
        self._queue = [];

        self.emit('disconnected');
        self.status = 'NOT_CONNECTED';

        return self;
      }
    }, {
      key: 'toRemote',
      value: function toRemote(local) {
        var self = this;

        return _path2['default'].join(self.info.remote, atom.project.relativize(local)).replace(/\\/g, '/');
      }
    }, {
      key: 'toLocal',
      value: function toLocal(remote) {
        var self = this;
        var projectPath = self.getProjectPath();

        if (projectPath === false) return false;
        if (typeof remote !== 'string') {
          throw new Error('Remote FTP: remote must be a string, was passed ' + typeof remote);
        }
        return _path2['default'].resolve(projectPath, './' + remote.substr(self.info.remote.length).replace(/^\/+/, ''));
      }
    }, {
      key: '_next',
      value: function _next() {
        var self = this;

        if (!self.isConnected()) return;

        self._current = self._queue.shift();

        if (self._current) self._current[1].apply(self, [self._current[2]]);

        atom.project.remoteftp.emit('queue-changed');
      }
    }, {
      key: '_enqueue',
      value: function _enqueue(func, desc) {
        var self = this;
        var progress = new _progress2['default']();

        self._queue.push([desc, func, progress]);
        if (self._queue.length == 1 && !self._current) self._next();else self.emit('queue-changed');

        return progress;
      }
    }, {
      key: 'abort',
      value: function abort() {
        var self = this;

        if (self.isConnected()) {
          self.connector.abort(function () {
            self._next();
          });
        }

        return self;
      }
    }, {
      key: 'abortAll',
      value: function abortAll() {
        var self = this;

        self._current = null;
        self._queue = [];

        if (self.isConnected()) {
          self.connector.abort();
        }

        self.emit('queue-changed');

        return self;
      }
    }, {
      key: 'list',
      value: function list(remote, recursive, callback) {
        var self = this;
        self.onceConnected(function () {
          self._enqueue(function () {
            self.connector.list(remote, recursive, function () {
              if (typeof callback === 'function') callback.apply(undefined, arguments);
              self._next();
            });
          }, 'Listing ' + (recursive ? 'recursively ' : '') + _path2['default'].basename(remote));
        });

        return self;
      }
    }, {
      key: 'download',
      value: function download(remote, recursive, callback) {
        var self = this;
        self.onceConnected(function () {
          self._enqueue(function (progress) {
            self.connector.get(remote, recursive, function () {
              if (typeof callback === 'function') callback.apply(undefined, arguments);
              self._next();
            }, function (percent) {
              progress.setProgress(percent);
            });
          }, 'Downloading ' + _path2['default'].basename(remote));
        });

        return self;
      }
    }, {
      key: 'upload',
      value: function upload(local, callback) {
        var self = this;
        self.onceConnected(function () {
          self._enqueue(function (progress) {
            self.connector.put(local, function () {
              if (typeof callback === 'function') callback.apply(undefined, arguments);
              self._next();
            }, function (percent) {
              progress.setProgress(percent);
            });
          }, 'Uploading ' + _path2['default'].basename(local));
        });

        return self;
      }
    }, {
      key: 'traverseTree',
      value: function traverseTree(rootPath, callback) {
        var list = [];
        var queue = [rootPath];

        // search all files in rootPath recursively
        while (queue.length > 0) {
          var currentPath = queue.pop();
          var filesFound = _fsPlus2['default'].readdirSync(currentPath);

          for (var fileName of filesFound) {
            if (fileName !== '.' && fileName !== '..') {
              var fullName = _path2['default'].join(currentPath, fileName);

              var stats = _fsPlus2['default'].statSync(fullName);
              list.push({
                name: fullName,
                size: stats.size,
                date: stats.mtime,
                type: stats.isFile() ? 'f' : 'd'
              });

              if (!stats.isFile()) queue.push(fullName);
            }
          }
        }

        // depth counting & sorting
        for (var file of list) {
          file.depth = file.name.split('/').length;
        }
        list.sort(function (a, b) {
          if (a.depth === b.depth) return 0;
          return a.depth > b.depth ? 1 : -1;
        });

        // callback
        if (typeof callback === 'function') callback.apply(null, [list]);
      }
    }, {
      key: 'syncRemoteLocal',
      value: function syncRemoteLocal(remote, isFile, callback) {
        // TODO: Tidy up this function. Does ( probably ) not need to list from the connector
        // if isFile === true. Will need to check to see if that doesn't break anything before
        // implementing. In the meantime current solution should work for #453
        var self = this;

        if (!remote) return;

        self.onceConnected(function () {
          self._enqueue(function () {
            var local = self.toLocal(remote);

            self.connector.list(remote, true, function (err, remotes) {
              if (err) {
                if (typeof callback === 'function') callback.apply(null, [err]);

                return;
              }

              self.traverseTree(local, function (locals) {
                var error = function error() {
                  if (typeof callback === 'function') callback.apply(null);
                  self._next();
                  return;
                };
                var n = function n() {
                  var _again2 = true;

                  _function2: while (_again2) {
                    _again2 = false;

                    var remote = remotes.shift();
                    var toLocal = undefined;
                    var local = undefined;

                    if (!remote) return error();

                    if (remote.type === 'd') {
                      _again2 = true;
                      remote = toLocal = local = undefined;
                      continue _function2;
                    }

                    toLocal = self.toLocal(remote.name);
                    local = null;

                    for (var a = 0, b = locals.length; a < b; ++a) {
                      if (locals[a].name === toLocal) {
                        local = locals[a];
                        break;
                      }
                    }

                    // Download only if not present on local or size differ
                    if (!local || remote.size !== local.size) {
                      self.connector.get(remote.name, false, function () {
                        return n();
                      });
                    } else {
                      n();
                    }
                  }
                };
                if (remotes.length === 0) {
                  self.connector.get(remote, false, function () {
                    return n();
                  });
                  return;
                }
                n();
              });
            }, isFile);
            // NOTE: Added isFile to end of call to prevent breaking any functions
            // that already use list command. Is file is used only for ftp connector
            // as it will list a file as a file of itself unlinke with sftp which
            // will throw an error.
          }, 'Sync local ' + _path2['default'].basename(remote));
        });
        return self;
      }
    }, {
      key: 'syncLocalRemote',
      value: function syncLocalRemote(local, callback) {
        var self = this;

        self.onceConnected(function () {
          self._enqueue(function (progress) {
            var remote = self.toRemote(local);

            self.connector.list(remote, true, function (err, remotes) {
              if (err) {
                if (typeof callback === 'function') callback.apply(null, [err]);
                return;
              }

              self.traverseTree(local, function (locals) {
                var error = function error() {
                  if (typeof callback === 'function') callback.apply(null);
                  self._next();
                  return;
                };

                // filter via .ftpignore
                var ftpignore = self.getFilePath('.ftpignore');
                var ignoreFilter = (0, _ignore2['default'])();
                if (_fsPlus2['default'].existsSync(ftpignore)) {
                  ignoreFilter.add(_fsPlus2['default'].readFileSync(ftpignore).toString());
                }

                // remove ignored locals
                for (var i = locals.length - 1; i >= 0; i--) {
                  if (ignoreFilter.ignores(locals[i].name)) {
                    locals.splice(i, 1); // remove from list
                  }
                }

                var n = function n() {
                  var _again3 = true;

                  _function3: while (_again3) {
                    _again3 = false;

                    var local = locals.shift();
                    var remote = undefined;

                    if (!local) return error();

                    if (local.type === 'd') {
                      _again3 = true;
                      local = remote = undefined;
                      continue _function3;
                    }

                    var toRemote = self.toRemote(local.name);
                    remote = null;

                    for (var a = 0, b = remotes.length; a < b; ++a) {
                      if (remotes[a].name === toRemote) {
                        remote = remotes[a];
                        break;
                      }
                    }

                    // NOTE: Upload only if not present on remote or size differ
                    if (!remote || remote.size !== local.size) {
                      self.connector.put(local.name, function () {
                        return n();
                      });
                    } else {
                      n();
                    }
                  }
                };
                n();
              });
            });
          }, 'Sync remote ' + _path2['default'].basename(local));
        });

        return self;
      }
    }, {
      key: 'mkdir',
      value: function mkdir(remote, recursive, callback) {
        var self = this;
        self.onceConnected(function () {
          self._enqueue(function () {
            self.connector.mkdir(remote, recursive, function () {
              if (typeof callback === 'function') callback.apply(undefined, arguments);
              self._next();
            });
          }, 'Creating folder ' + _path2['default'].basename(remote));
        });

        return self;
      }
    }, {
      key: 'mkfile',
      value: function mkfile(remote, callback) {
        var self = this;
        self.onceConnected(function () {
          self._enqueue(function () {
            self.connector.mkfile(remote, function () {
              if (typeof callback === 'function') callback.apply(undefined, arguments);
              self._next();
            });
          }, 'Creating file ' + _path2['default'].basename(remote));
        });

        return self;
      }
    }, {
      key: 'rename',
      value: function rename(source, dest, callback) {
        var self = this;
        self.onceConnected(function () {
          self._enqueue(function () {
            self.connector.rename(source, dest, function (err) {
              if (typeof callback === 'function') callback.apply(null, [err]);
              self._next();
            });
          }, 'Renaming ' + _path2['default'].basename(source));
        });
        return self;
      }
    }, {
      key: 'delete',
      value: function _delete(remote, callback) {
        var self = this;
        self.onceConnected(function () {
          self._enqueue(function () {
            self.connector['delete'](remote, function () {
              if (typeof callback === 'function') callback.apply(undefined, arguments);
              self._next();
            });
          }, 'Deleting ' + _path2['default'].basename(remote));
        });

        return self;
      }
    }, {
      key: 'promptForPass',
      value: function promptForPass() {
        var self = this;
        var dialog = new _dialogsPromptPassDialog2['default']('', true);
        dialog.on('dialog-done', function (e, pass) {
          self.info.pass = pass;
          self.info.passphrase = pass;
          dialog.close();
          self.doConnect();
        });
        dialog.attach();
      }
    }]);

    return Client;
  })(_events.EventEmitter);

  return Client;
})();

module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGU6Ly8vQzovVXNlcnMvdWNoaWhhLy5hdG9tL3BhY2thZ2VzL1JlbW90ZS1GVFAvbGliL2NsaWVudC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztzQkFFZSxTQUFTOzs7O2lDQUNOLHNCQUFzQjs7b0JBQ3ZCLE1BQU07Ozs7c0JBQ00sUUFBUTs7aUNBQ1AscUJBQXFCOzs7O3dCQUM5QixVQUFVOzs7O3VCQUNpQixXQUFXOzt5QkFDckMsYUFBYTs7Ozt3QkFDZCxZQUFZOzs7OzZCQUNqQixrQkFBa0I7Ozs7OEJBQ2pCLG1CQUFtQjs7Ozt1Q0FDUCw4QkFBOEI7Ozs7c0JBQ3hDLFFBQVE7Ozs7QUFkM0IsV0FBVyxDQUFDOztBQWdCWixJQUFNLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDOztxQkFFVCxDQUFBLFNBQVMsSUFBSSxHQUFHO01BQ3hCLE1BQU07Y0FBTixNQUFNOztBQUNDLGFBRFAsTUFBTSxHQUNJOzRCQURWLE1BQU07O0FBRVIsaUNBRkUsTUFBTSw2Q0FFQTtBQUNSLFVBQU0sSUFBSSxHQUFHLElBQUksQ0FBQztBQUNsQixVQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztBQUNqQixVQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztBQUN0QixVQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztBQUNyQixVQUFJLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQzs7QUFFakIsVUFBSSxDQUFDLElBQUksR0FBRywyQkFBYztBQUN4QixZQUFJLEVBQUUsR0FBRztBQUNULFlBQUksRUFBRSxHQUFHO0FBQ1QsY0FBTSxFQUFFLElBQUk7QUFDWixrQkFBVSxFQUFFLElBQUk7T0FDakIsQ0FBQyxDQUFDOztBQUVILFVBQUksQ0FBQyxNQUFNLEdBQUcsZUFBZSxDQUFDOztBQUU5QixVQUFJLENBQUMsS0FBSyxHQUFHO0FBQ1gsZUFBTyxFQUFFLElBQUk7QUFDYixhQUFLLEVBQUUsRUFBRTtBQUNULG9CQUFZ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LElBQUksQ0FBQztPQUNiOzs7YUFFSyxpQkFBQyxNQUFNLEVBQUUsUUFBUSxFQUFFO0FBQ3ZCLFlBQU0sSUFBSSxHQUFHLElBQUksQ0FBQztBQUNsQixZQUFJLENBQUMsYUFBYSxDQUFDLFlBQU07QUFDdkIsY0FBSSxDQUFDLFFBQVEsQ0FBQyxZQUFNO0FBQ2xCLGdCQUFJLENBQUMsU0FBUyxVQUFPLENBQUMsTUFBTSxFQUFFLFlBQVk7QUFDeEMsa0JBQUksT0FBTyxRQUFRLEtBQUssVUFBVSxFQUFFLFFBQVEsa0JBQUksU0FBUyxDQUFDLENBQUM7QUFDM0Qsa0JBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQzthQUNkLENBQUMsQ0FBQztXQUNKLGdCQUFjLGtCQUFLLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBRyxDQUFDO1NBQ3pDLENBQUMsQ0FBQzs7QUFFSCxlQUFPLElBQUksQ0FBQztPQUNiOzs7YUFFWSx5QkFBRztBQUNkLFlBQU0sSUFBSSxHQUFHLElBQUksQ0FBQztBQUNsQixZQUFNLE1BQU0sR0FBRyx5Q0FBcUIsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQzlDLGNBQU0sQ0FBQyxFQUFFLENBQUMsYUFBYSxFQUFFLFVBQUMsQ0FBQyxFQUFFLElBQUksRUFBSztBQUNwQyxjQUFJLENBQUMsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7QUFDdEIsY0FBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO0FBQzVCLGdCQUFNLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDZixjQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7U0FDbEIsQ0FBQyxDQUFDO0FBQ0gsY0FBTSxDQUFDLE1BQU0sRUFBRSxDQUFDO09BQ2pCOzs7V0EveEJHLE1BQU07OztBQW15QlosU0FBTyxNQUFNLENBQUM7Q0FDZixDQUFBLEVBQUUiLCJmaWxlIjoiZmlsZTovLy9DOi9Vc2Vycy91Y2hpaGEvLmF0b20vcGFja2FnZXMvUmVtb3RlLUZUUC9saWIvY2xpZW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmltcG9ydCBGUyBmcm9tICdmcy1wbHVzJztcbmltcG9ydCB7ICQgfSBmcm9tICdhdG9tLXNwYWNlLXBlbi12aWV3cyc7XG5pbXBvcnQgUGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7IEV2ZW50RW1pdHRlciB9IGZyb20gJ2V2ZW50cyc7XG5pbXBvcnQgc3RyaXBKc29uQ29tbWVudHMgZnJvbSAnc3RyaXAtanNvbi1jb21tZW50cyc7XG5pbXBvcnQgY2hva2lkYXIgZnJvbSAnY2hva2lkYXInO1xuaW1wb3J0IHsgbXVsdGlwbGVIb3N0c0VuYWJsZWQsIGdldE9iamVjdCB9IGZyb20gJy4vaGVscGVycyc7XG5pbXBvcnQgRGlyZWN0b3J5IGZyb20gJy4vZGlyZWN0b3J5JztcbmltcG9ydCBQcm9ncmVzcyBmcm9tICcuL3Byb2dyZXNzJztcbmltcG9ydCBGVFAgZnJvbSAnLi9jb25uZWN0b3JzL2Z0cCc7XG5pbXBvcnQgU0ZUUCBmcm9tICcuL2Nvbm5lY3RvcnMvc2Z0cCc7XG5pbXBvcnQgUHJvbXB0UGFzc0RpYWxvZyBmcm9tICcuL2RpYWxvZ3MvcHJvbXB0LXBhc3MtZGlhbG9nJztcbmltcG9ydCBJZ25vcmUgZnJvbSAnaWdub3JlJztcblxuY29uc3QgYXRvbSA9IGdsb2JhbC5hdG9tO1xuXG5leHBvcnQgZGVmYXVsdCAoZnVuY3Rpb24gSU5JVCgpIHtcbiAgY2xhc3MgQ2xpZW50IGV4dGVuZHMgRXZlbnRFbWl0dGVyIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgIHN1cGVyKCk7XG4gICAgICBjb25zdCBzZWxmID0gdGhpcztcbiAgICAgIHNlbGYuaW5mbyA9IG51bGw7XG4gICAgICBzZWxmLmNvbm5lY3RvciA9IG51bGw7XG4gICAgICBzZWxmLl9jdXJyZW50ID0gbnVsbDtcbiAgICAgIHNlbGYuX3F1ZXVlID0gW107XG5cbiAgICAgIHNlbGYucm9vdCA9IG5ldyBEaXJlY3Rvcnkoe1xuICAgICAgICBuYW1lOiAnLycsXG4gICAgICAgIHBhdGg6ICcvJyxcbiAgICAgICAgY2xpZW50OiB0aGlzLFxuICAgICAgICBpc0V4cGFuZGVkOiB0cnVlLFxuICAgICAgfSk7XG5cbiAgICAgIHNlbGYuc3RhdHVzID0gJ05PVF9DT05ORUNURUQnOyAvLyBPcHRpb25zIE5PVF9DT05ORUNURUQsIENPTk5FQ1RJTkcsIENPTk5FQ1RFRFxuXG4gICAgICBzZWxmLndhdGNoID0ge1xuICAgICAgICB3YXRjaGVyOiBudWxsLFxuICAgICAgICBmaWxlczogW10sXG4gICAgICAgIGFkZExpc3RlbmVycygpIHtcbiAgICAgICAgICBsZXQgd2F0Y2hEYXRhID0gZ2V0T2JqZWN0KHtcbiAgICAgICAgICAgIGtleXM6IFsnaW5mbycsICd3YXRjaCddLFxuICAgICAgICAgICAgb2JqOiBzZWxmLFxuICAgICAgICAgIH0pO1xuICAgICAgICAgIGlmICh3YXRjaERhdGEgPT09IG51bGwgfHwgd2F0Y2hEYXRhID09PSBmYWxzZSkgcmV0dXJuO1xuICAgICAgICAgIGlmICh0eXBlb2Ygd2F0Y2hEYXRhID09PSAnc3RyaW5nJykgd2F0Y2hEYXRhID0gW3dhdGNoRGF0YV07XG5cbiAgICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkod2F0Y2hEYXRhKSB8fCB3YXRjaERhdGEubGVuZ3RoID09PSAwKSByZXR1cm47XG5cbiAgICAgICAgICBjb25zdCBkaXIgPSBzZWxmLmdldFByb2plY3RQYXRoKCk7XG5cbiAgICAgICAgICBjb25zdCB3YXRjaERhdGFGb3JtYXR0ZWQgPSB3YXRjaERhdGEubWFwKHdhdGNoID0+IFBhdGgucmVzb2x2ZShkaXIsIHdhdGNoKSk7XG5cbiAgICAgICAgICBjb25zdCB3YXRjaGVyID0gY2hva2lkYXIud2F0Y2god2F0Y2hEYXRhRm9ybWF0dGVkLCB7XG4gICAgICAgICAgICBpZ25vcmVkOiAvW1xcL1xcXFxdXFwuLyxcbiAgICAgICAgICAgIHBlcnNpc3RlbnQ6IHRydWUsXG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICB3YXRjaGVyXG4gICAgICAgICAgLm9uKCdjaGFuZ2UnLCAocGF0aCkgPT4ge1xuICAgICAgICAgICAgc2VsZi53YXRjaC5xdWV1ZVVwbG9hZC5hcHBseShzZWxmLCBbcGF0aF0pO1xuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgc2VsZi5maWxlcyA9IHdhdGNoRGF0YUZvcm1hdHRlZC5zbGljZSgpO1xuXG4gICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEluZm8oJ1JlbW90ZSBGVFA6IEFkZGVkIHdhdGNoIGxpc3RlbmVycycsIHtcbiAgICAgICAgICAgIGRpc21pc3NhYmxlOiBmYWxzZSxcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBzZWxmLndhdGNoZXIgPSB3YXRjaGVyO1xuICAgICAgICB9LFxuICAgICAgICByZW1vdmVMaXN0ZW5lcnMoKSB7XG4gICAgICAgICAgaWYgKHNlbGYud2F0Y2hlciAhPSBudWxsKSB7XG4gICAgICAgICAgICBzZWxmLndhdGNoZXIuY2xvc2UoKTtcbiAgICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRJbmZvKCdSZW1vdGUgRlRQOiBTdG9wcGVkIHdhdGNoIGxpc3RlbmVycycsIHtcbiAgICAgICAgICAgICAgZGlzbWlzc2FibGU6IGZhbHNlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBxdWV1ZToge30sXG4gICAgICAgIHF1ZXVlVXBsb2FkKGZpbGVOYW1lKSB7XG4gICAgICAgICAgY29uc3QgdGltZW91dER1cmF0aW9uID0gaXNOYU4ocGFyc2VJbnQoc2VsZi5pbmZvLndhdGNoVGltZW91dCwgMTApKSA9PT0gdHJ1ZVxuICAgICAgICAgICAgPyA1MDBcbiAgICAgICAgICAgIDogcGFyc2VJbnQoc2VsZi5pbmZvLndhdGNoVGltZW91dCwgMTApO1xuXG5cbiAgICAgICAgICBmdW5jdGlvbiBzY2hlZHVsZVVwbG9hZChmaWxlKSB7XG4gICAgICAgICAgICBzZWxmLndhdGNoLnF1ZXVlW2ZpbGVdID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgIHNlbGYudXBsb2FkKGZpbGUsICgpID0+IHt9KTtcbiAgICAgICAgICAgIH0sIHRpbWVvdXREdXJhdGlvbik7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHNlbGYud2F0Y2gucXVldWVbZmlsZU5hbWVdICE9PSBudWxsKSB7XG4gICAgICAgICAgICBjbGVhclRpbWVvdXQoc2VsZi53YXRjaC5xdWV1ZVtmaWxlTmFtZV0pO1xuICAgICAgICAgICAgc2VsZi53YXRjaC5xdWV1ZVtmaWxlTmFtZV0gPSBudWxsO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHNjaGVkdWxlVXBsb2FkKGZpbGVOYW1lKTtcbiAgICAgICAgfSxcblxuICAgICAgfTtcblxuICAgICAgc2VsZi53YXRjaC5hZGRMaXN0ZW5lcnMgPSBzZWxmLndhdGNoLmFkZExpc3RlbmVycy5iaW5kKHNlbGYpO1xuICAgICAgc2VsZi53YXRjaC5yZW1vdmVMaXN0ZW5lcnMgPSBzZWxmLndhdGNoLnJlbW92ZUxpc3RlbmVycy5iaW5kKHNlbGYpO1xuXG4gICAgICBzZWxmLm9uKCdjb25uZWN0ZWQnLCBzZWxmLndhdGNoLmFkZExpc3RlbmVycyk7XG4gICAgICBzZWxmLm9uKCdkaXNjb25uZWN0ZWQnLCBzZWxmLndhdGNoLnJlbW92ZUxpc3RlbmVycyk7XG4gICAgfVxuXG4gICAgcmVhZENvbmZpZyhjYWxsYmFjaykge1xuICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgICBjb25zdCBlcnJvciA9IChlcnIpID0+IHtcbiAgICAgICAgaWYgKHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykgY2FsbGJhY2suYXBwbHkoc2VsZiwgW2Vycl0pO1xuICAgICAgfTtcbiAgICAgIHNlbGYuaW5mbyA9IG51bGw7XG4gICAgICBzZWxmLmZ0cENvbmZpZ1BhdGggPSBzZWxmLmdldENvbmZpZ1BhdGgoKTtcblxuICAgICAgaWYgKHNlbGYuZnRwQ29uZmlnUGF0aCA9PT0gZmFsc2UpIHRocm93IG5ldyBFcnJvcignUmVtb3RlIEZUUDogZ2V0Q29uZmlnUGF0aCByZXR1cm5lZCBmYWxzZSwgYnV0IGV4cGVjdGVkIGEgc3RyaW5nJyk7XG5cbiAgICAgIEZTLnJlYWRGaWxlKHNlbGYuZnRwQ29uZmlnUGF0aCwgJ3V0ZjgnLCAoZXJyLCByZXMpID0+IHtcbiAgICAgICAgaWYgKGVycikgcmV0dXJuIGVycm9yKGVycik7XG5cbiAgICAgICAgY29uc3QgZGF0YSA9IHN0cmlwSnNvbkNvbW1lbnRzKHJlcyk7XG4gICAgICAgIGxldCBqc29uID0gbnVsbDtcbiAgICAgICAgaWYgKHNlbGYudmFsaWRhdGVDb25maWcoZGF0YSkpIHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAganNvbiA9IEpTT04ucGFyc2UoZGF0YSk7XG5cbiAgICAgICAgICAgIHNlbGYuaW5mbyA9IGpzb247XG4gICAgICAgICAgICBzZWxmLnJvb3QubmFtZSA9ICcnO1xuICAgICAgICAgICAgc2VsZi5yb290LnBhdGggPSBgLyR7c2VsZi5pbmZvLnJlbW90ZS5yZXBsYWNlKC9eXFwvKy8sICcnKX1gO1xuICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcignQ291bGQgbm90IHByb2Nlc3MgYC5mdHBjb25maWdgJywge1xuICAgICAgICAgICAgICBkZXRhaWw6IGUsXG4gICAgICAgICAgICAgIGRpc21pc3NhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoanNvbiAhPT0gbnVsbCAmJiB0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICBjYWxsYmFjay5hcHBseShzZWxmLCBbZXJyLCBqc29uXSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGdldEZpbGVQYXRoKHJlbGF0aXZlUGF0aCkge1xuICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgICBjb25zdCBwcm9qZWN0UGF0aCA9IHNlbGYuZ2V0UHJvamVjdFBhdGgoKTtcbiAgICAgIGlmIChwcm9qZWN0UGF0aCA9PT0gZmFsc2UpIHJldHVybiBmYWxzZTtcbiAgICAgIHJldHVybiBQYXRoLnJlc29sdmUocHJvamVjdFBhdGgsIHJlbGF0aXZlUGF0aCk7XG4gICAgfVxuXG4gICAgZ2V0UHJvamVjdFBhdGgoKSB7XG4gICAgICBjb25zdCBzZWxmID0gdGhpcztcbiAgICAgIGxldCBwcm9qZWN0UGF0aCA9IG51bGw7XG5cbiAgICAgIGlmIChtdWx0aXBsZUhvc3RzRW5hYmxlZCgpID09PSB0cnVlKSB7XG4gICAgICAgIGNvbnN0ICRzZWxlY3RlZERpciA9ICQoJy50cmVlLXZpZXcgLnNlbGVjdGVkJyk7XG4gICAgICAgIGNvbnN0ICRjdXJyZW50UHJvamVjdCA9ICRzZWxlY3RlZERpci5oYXNDbGFzcygncHJvamVjdC1yb290JykgPyAkc2VsZWN0ZWREaXIgOiAkc2VsZWN0ZWREaXIuY2xvc2VzdCgnLnByb2plY3Qtcm9vdCcpO1xuICAgICAgICBwcm9qZWN0UGF0aCA9ICRjdXJyZW50UHJvamVjdC5maW5kKCcuaGVhZGVyIHNwYW4ubmFtZScpLmRhdGEoJ3BhdGgnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IGZpcnN0RGlyZWN0b3J5ID0gYXRvbS5wcm9qZWN0LmdldERpcmVjdG9yaWVzKClbMF07XG4gICAgICAgIGlmIChmaXJzdERpcmVjdG9yeSAhPSBudWxsKSBwcm9qZWN0UGF0aCA9IGZpcnN0RGlyZWN0b3J5LnBhdGg7XG4gICAgICB9XG5cbiAgICAgIGlmIChwcm9qZWN0UGF0aCAhPSBudWxsKSB7XG4gICAgICAgIHNlbGYucHJvamVjdFBhdGggPSBwcm9qZWN0UGF0aDtcbiAgICAgICAgcmV0dXJuIHByb2plY3RQYXRoO1xuICAgICAgfVxuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKCdSZW1vdGUgRlRQOiBDb3VsZCBub3QgZ2V0IHByb2plY3QgcGF0aCcsIHtcbiAgICAgICAgZGlzbWlzc2FibGU6IGZhbHNlLCAvLyBXYW50IHVzZXIgdG8gcmVwb3J0IGVycm9yIHNvIGRvbid0IGxldCB0aGVtIGNsb3NlIGl0XG4gICAgICAgIGRldGFpbDogYFBsZWFzZSByZXBvcnQgdGhpcyBlcnJvciBpZiBpdCBvY2N1cnMuIE11bHRpcGxlIEhvc3RzIGlzICR7bXVsdGlwbGVIb3N0c0VuYWJsZWQoKX1gLFxuICAgICAgfSk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgZ2V0Q29uZmlnUGF0aCgpIHtcbiAgICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgICAgcmV0dXJuIHNlbGYuZ2V0RmlsZVBhdGgoJy4vLmZ0cGNvbmZpZycpO1xuICAgIH1cblxuICAgIHZhbGlkYXRlQ29uZmlnKGRhdGEpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIC8vIHRyeSB0byBwYXJzZSB0aGUganNvblxuICAgICAgICBKU09OLnBhcnNlKGRhdGEpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIC8vIHRyeSB0byBleHRyYWN0IGJhZCBzeW50YXggbG9jYXRpb24gZnJvbSBlcnJvciBtZXNzYWdlXG4gICAgICAgIGxldCBsaW5lTnVtYmVyID0gLTE7XG4gICAgICAgIGNvbnN0IHJlZ2V4ID0gL2F0IHBvc2l0aW9uIChbMC05XSspJC87XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGVycm9yLm1lc3NhZ2UubWF0Y2gocmVnZXgpO1xuICAgICAgICBpZiAocmVzdWx0ICYmIHJlc3VsdC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgY29uc3QgY3Vyc29yUG9zID0gcGFyc2VJbnQocmVzdWx0WzFdKTtcbiAgICAgICAgICAvLyBjb3VudCBsaW5lcyB1bnRpbCBzeW50YXggZXJyb3IgcG9zaXRpb25cbiAgICAgICAgICBjb25zdCB0bXAgPSBkYXRhLnN1YnN0cigwLCBjdXJzb3JQb3MpO1xuICAgICAgICAgIGZvciAobGluZU51bWJlciA9IC0xLCBpbmRleCA9IDA7IGluZGV4ICE9IC0xOyBsaW5lTnVtYmVyKyssIGluZGV4ID0gdG1wLmluZGV4T2YoJ1xcbicsIGluZGV4ICsgMSkpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gc2hvdyBub3RpZmljYXRpb25cbiAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKCdDb3VsZCBub3QgcGFyc2UgYC5mdHBjb25maWdgJywge1xuICAgICAgICAgIGRldGFpbDogYCR7ZXJyb3IubWVzc2FnZX1gLFxuICAgICAgICAgIGRpc21pc3NhYmxlOiBmYWxzZSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gb3BlbiAuZnRwY29uZmlnIGZpbGUgYW5kIG1hcmsgdGhlIGZhdWx0eSBsaW5lXG4gICAgICAgIGF0b20ud29ya3NwYWNlLm9wZW4oJy5mdHBjb25maWcnKS50aGVuKChlZGl0b3IpID0+IHtcbiAgICAgICAgICBpZiAobGluZU51bWJlciA9PSAtMSkgcmV0dXJuOyAvLyBubyBsaW5lIG51bWJlciB0byBtYXJrXG5cbiAgICAgICAgICBjb25zdCBkZWNvcmF0aW9uQ29uZmlnID0ge1xuICAgICAgICAgICAgY2xhc3M6ICdmdHBjb25maWdfbGluZV9lcnJvcicsXG4gICAgICAgICAgfTtcbiAgICAgICAgICBlZGl0b3IuZ2V0RGVjb3JhdGlvbnMoZGVjb3JhdGlvbkNvbmZpZykuZm9yRWFjaCgoZGVjb3JhdGlvbikgPT4ge1xuICAgICAgICAgICAgZGVjb3JhdGlvbi5kZXN0cm95KCk7XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICBjb25zdCByYW5nZSA9IGVkaXRvci5nZXRCdWZmZXIoKS5jbGlwUmFuZ2UoW1tsaW5lTnVtYmVyLCAwXSwgW2xpbmVOdW1iZXIsIEluZmluaXR5XV0pO1xuICAgICAgICAgIGNvbnN0IG1hcmtlciA9IGVkaXRvci5tYXJrQnVmZmVyUmFuZ2UocmFuZ2UsIHtcbiAgICAgICAgICAgIGludmFsaWRhdGU6ICdpbnNpZGUnLFxuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgZGVjb3JhdGlvbkNvbmZpZy50eXBlID0gJ2xpbmUnO1xuICAgICAgICAgIGVkaXRvci5kZWNvcmF0ZU1hcmtlcihtYXJrZXIsIGRlY29yYXRpb25Db25maWcpO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgLy8gcmV0dXJuIGZhbHNlLCBhcyB0aGUganNvbiBpcyBub3QgdmFsaWRcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBpc0Nvbm5lY3RlZCgpIHtcbiAgICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgICAgcmV0dXJuIHNlbGYuY29ubmVjdG9yICYmIHNlbGYuY29ubmVjdG9yLmlzQ29ubmVjdGVkKCk7XG4gICAgfVxuXG4gICAgb25jZUNvbm5lY3RlZChvbmNvbm5lY3QpIHtcbiAgICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgICAgaWYgKHNlbGYuY29ubmVjdG9yICYmIHNlbGYuY29ubmVjdG9yLmlzQ29ubmVjdGVkKCkpIHtcbiAgICAgICAgb25jb25uZWN0LmFwcGx5KHNlbGYpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIG9uY29ubmVjdCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBpZiAoc2VsZi5zdGF0dXMgPT09ICdOT1RfQ09OTkVDVEVEJykge1xuICAgICAgICAgIHNlbGYuc3RhdHVzID0gJ0NPTk5FQ1RJTkcnO1xuICAgICAgICAgIHNlbGYucmVhZENvbmZpZygoZXJyKSA9PiB7XG4gICAgICAgICAgICBpZiAoZXJyICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgIHNlbGYuc3RhdHVzID0gJ05PVF9DT05ORUNURUQnO1xuICAgICAgICAgICAgICAvLyBOT1RFOiBSZW1vdmUgbm90aWZpY2F0aW9uIGFzIGl0IHdpbGwganVzdCBzYXkgdGhlcmVcbiAgICAgICAgICAgICAgLy8gaXMgbm8gZnRwY29uZmlnIGlmIG5vbmUgaW4gZGlyZWN0b3J5IGFsbCB0aGUgdGltZVxuICAgICAgICAgICAgICAvLyBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoXCJSZW1vdGUgRlRQOiBcIiArIGVycik7XG4gICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNlbGYuY29ubmVjdCh0cnVlKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHNlbGYub25jZSgnY29ubmVjdGVkJywgb25jb25uZWN0KTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgY29uc29sZS53YXJuKGBSZW1vdGUtRlRQOiBOb3QgY29ubmVjdGVkIGFuZCB0eXBlb2Ygb25jb25uZWN0IGlzICR7dHlwZW9mIG9uY29ubmVjdH1gKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBjb25uZWN0KHJlY29ubmVjdCkge1xuICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgICBpZiAocmVjb25uZWN0ICE9PSB0cnVlKSBzZWxmLmRpc2Nvbm5lY3QoKTtcbiAgICAgIGlmIChzZWxmLmlzQ29ubmVjdGVkKCkpIHJldHVybjtcbiAgICAgIGlmICghc2VsZi5pbmZvKSByZXR1cm47XG4gICAgICBpZiAoc2VsZi5pbmZvLnByb21wdEZvclBhc3MgPT09IHRydWUpIHNlbGYucHJvbXB0Rm9yUGFzcygpO1xuICAgICAgZWxzZSBzZWxmLmRvQ29ubmVjdCgpO1xuICAgIH1cblxuICAgIGRvQ29ubmVjdCgpIHtcbiAgICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkSW5mbygnUmVtb3RlIEZUUDogQ29ubmVjdGluZy4uLicsIHtcbiAgICAgICAgZGlzbWlzc2FibGU6IGZhbHNlLFxuICAgICAgfSk7XG5cbiAgICAgIGxldCBpbmZvO1xuICAgICAgc3dpdGNoIChzZWxmLmluZm8ucHJvdG9jb2wpIHtcbiAgICAgICAgY2FzZSAnZnRwJzoge1xuICAgICAgICAgIGluZm8gPSB7XG4gICAgICAgICAgICBob3N0OiBzZWxmLmluZm8uaG9zdCB8fCAnJyxcbiAgICAgICAgICAgIHBvcnQ6IHNlbGYuaW5mby5wb3J0IHx8IDIxLFxuICAgICAgICAgICAgdXNlcjogc2VsZi5pbmZvLnVzZXIgfHwgJycsXG4gICAgICAgICAgICBwYXNzd29yZDogc2VsZi5pbmZvLnBhc3MgfHwgJycsXG4gICAgICAgICAgICBzZWN1cmU6IHNlbGYuaW5mby5zZWN1cmUgfHwgJycsXG4gICAgICAgICAgICBzZWN1cmVPcHRpb25zOiBzZWxmLmluZm8uc2VjdXJlT3B0aW9ucyB8fCAnJyxcbiAgICAgICAgICAgIGNvbm5UaW1lb3V0OiBzZWxmLmluZm8udGltZW91dCB8fCAxMDAwMCxcbiAgICAgICAgICAgIHBhc3ZUaW1lb3V0OiBzZWxmLmluZm8udGltZW91dCB8fCAxMDAwMCxcbiAgICAgICAgICAgIGtlZXBhbGl2ZTogc2VsZi5pbmZvLmtlZXBhbGl2ZSB8fCAxMDAwMCxcbiAgICAgICAgICAgIGRlYnVnKHN0cikge1xuICAgICAgICAgICAgICBjb25zdCBsb2cgPSBzdHIubWF0Y2goL15cXFtjb25uZWN0aW9uXFxdICg+fDwpICcoLio/KShcXFxcclxcXFxuKT8nJC8pO1xuICAgICAgICAgICAgICBpZiAoIWxvZykgcmV0dXJuO1xuICAgICAgICAgICAgICBpZiAobG9nWzJdLm1hdGNoKC9eUEFTUyAvKSkgbG9nWzJdID0gJ1BBU1MgKioqKioqJztcbiAgICAgICAgICAgICAgc2VsZi5lbWl0KCdkZWJ1ZycsIGAke2xvZ1sxXX0gJHtsb2dbMl19YCk7XG4gICAgICAgICAgICAgIGNvbnNvbGUuZGVidWcoYCR7bG9nWzFdfSAke2xvZ1syXX1gKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfTtcbiAgICAgICAgICBzZWxmLmNvbm5lY3RvciA9IG5ldyBGVFAoc2VsZik7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICBjYXNlICdzZnRwJzoge1xuICAgICAgICAgIGluZm8gPSB7XG4gICAgICAgICAgICBob3N0OiBzZWxmLmluZm8uaG9zdCB8fCAnJyxcbiAgICAgICAgICAgIHBvcnQ6IHNlbGYuaW5mby5wb3J0IHx8IDIxLFxuICAgICAgICAgICAgdXNlcm5hbWU6IHNlbGYuaW5mby51c2VyIHx8ICcnLFxuICAgICAgICAgICAgcmVhZHlUaW1lb3V0OiBzZWxmLmluZm8uY29ublRpbWVvdXQgfHwgMTAwMDAsXG4gICAgICAgICAgICBrZWVwYWxpdmVJbnRlcnZhbDogc2VsZi5pbmZvLmtlZXBhbGl2ZSB8fCAxMDAwMCxcbiAgICAgICAgICB9O1xuXG4gICAgICAgICAgaWYgKHNlbGYuaW5mby5wYXNzKSBpbmZvLnBhc3N3b3JkID0gc2VsZi5pbmZvLnBhc3M7XG5cbiAgICAgICAgICBpZiAoc2VsZi5pbmZvLnByaXZhdGVrZXkpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgIGNvbnN0IHBrID0gRlMucmVhZEZpbGVTeW5jKHNlbGYuaW5mby5wcml2YXRla2V5KTtcbiAgICAgICAgICAgICAgaW5mby5wcml2YXRlS2V5ID0gcGs7XG4gICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKCdSZW1vdGUgRlRQOiBDb3VsZCBub3QgcmVhZCBwcml2YXRlS2V5IGZpbGUnLCB7XG4gICAgICAgICAgICAgICAgZGV0YWlsOiBlcnIsXG4gICAgICAgICAgICAgICAgZGlzbWlzc2FibGU6IHRydWUsXG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChzZWxmLmluZm8ucGFzc3BocmFzZSkgaW5mby5wYXNzcGhyYXNlID0gc2VsZi5pbmZvLnBhc3NwaHJhc2U7XG5cbiAgICAgICAgICBpZiAoc2VsZi5pbmZvLmFnZW50KSBpbmZvLmFnZW50ID0gc2VsZi5pbmZvLmFnZW50O1xuXG4gICAgICAgICAgaWYgKHNlbGYuaW5mby5hZ2VudCA9PT0gJ2VudicpIGluZm8uYWdlbnQgPSBwcm9jZXNzLmVudi5TU0hfQVVUSF9TT0NLO1xuXG4gICAgICAgICAgaWYgKHNlbGYuaW5mby5ob3N0aGFzaCkgaW5mby5ob3N0SGFzaCA9IHNlbGYuaW5mby5ob3N0aGFzaDtcblxuICAgICAgICAgIGlmIChzZWxmLmluZm8uaWdub3JlaG9zdCkge1xuICAgICAgICAgICAgLy8gTk9URTogaG9zdFZlcmlmaWVyIGRvZXNuJ3QgcnVuIGF0IGFsbCBpZiBpdCdzIG5vdCBhIGZ1bmN0aW9uLlxuICAgICAgICAgICAgLy8gQWxsb3dzIHlvdSB0byBza2lwIGhvc3RIYXNoIG9wdGlvbiBpbiBzc2gyIDAuNStcbiAgICAgICAgICAgIGluZm8uaG9zdFZlcmlmaWVyID0gZmFsc2U7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaW5mby5hbGdvcml0aG1zID0ge1xuICAgICAgICAgICAga2V5OiBbXG4gICAgICAgICAgICAgICdlY2RoLXNoYTItbmlzdHAyNTYnLFxuICAgICAgICAgICAgICAnZWNkaC1zaGEyLW5pc3RwMzg0JyxcbiAgICAgICAgICAgICAgJ2VjZGgtc2hhMi1uaXN0cDUyMScsXG4gICAgICAgICAgICAgICdkaWZmaWUtaGVsbG1hbi1ncm91cC1leGNoYW5nZS1zaGEyNTYnLFxuICAgICAgICAgICAgICAnZGlmZmllLWhlbGxtYW4tZ3JvdXAxNC1zaGExJyxcbiAgICAgICAgICAgICAgJ2RpZmZpZS1oZWxsbWFuLWdyb3VwLWV4Y2hhbmdlLXNoYTEnLFxuICAgICAgICAgICAgICAnZGlmZmllLWhlbGxtYW4tZ3JvdXAxLXNoYTEnLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIGNpcGhlcjogW1xuICAgICAgICAgICAgICAnYWVzMTI4LWN0cicsXG4gICAgICAgICAgICAgICdhZXMxOTItY3RyJyxcbiAgICAgICAgICAgICAgJ2FlczI1Ni1jdHInLFxuICAgICAgICAgICAgICAnYWVzMTI4LWdjbScsXG4gICAgICAgICAgICAgICdhZXMxMjgtZ2NtQG9wZW5zc2guY29tJyxcbiAgICAgICAgICAgICAgJ2FlczI1Ni1nY20nLFxuICAgICAgICAgICAgICAnYWVzMjU2LWdjbUBvcGVuc3NoLmNvbScsXG4gICAgICAgICAgICAgICdhZXMyNTYtY2JjJyxcbiAgICAgICAgICAgICAgJ2FlczE5Mi1jYmMnLFxuICAgICAgICAgICAgICAnYWVzMTI4LWNiYycsXG4gICAgICAgICAgICAgICdibG93ZmlzaC1jYmMnLFxuICAgICAgICAgICAgICAnM2Rlcy1jYmMnLFxuICAgICAgICAgICAgICAnYXJjZm91cjI1NicsXG4gICAgICAgICAgICAgICdhcmNmb3VyMTI4JyxcbiAgICAgICAgICAgICAgJ2Nhc3QxMjgtY2JjJyxcbiAgICAgICAgICAgICAgJ2FyY2ZvdXInLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIHNlcnZlckhvc3RLZXk6IFtcbiAgICAgICAgICAgICAgJ3NzaC1yc2EnLFxuICAgICAgICAgICAgICAnZWNkc2Etc2hhMi1uaXN0cDI1NicsXG4gICAgICAgICAgICAgICdlY2RzYS1zaGEyLW5pc3RwMzg0JyxcbiAgICAgICAgICAgICAgJ2VjZHNhLXNoYTItbmlzdHA1MjEnLFxuICAgICAgICAgICAgICAnc3NoLWRzcycsXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgaG1hYzogW1xuICAgICAgICAgICAgICAnaG1hYy1zaGEyLTI1NicsXG4gICAgICAgICAgICAgICdobWFjLXNoYTItNTEyJyxcbiAgICAgICAgICAgICAgJ2htYWMtc2hhMScsXG4gICAgICAgICAgICAgICdobWFjLW1kNScsXG4gICAgICAgICAgICAgICdobWFjLXNoYTItMjU2LTk2JyxcbiAgICAgICAgICAgICAgJ2htYWMtc2hhMi01MTItOTYnLFxuICAgICAgICAgICAgICAnaG1hYy1yaXBlbWQxNjAnLFxuICAgICAgICAgICAgICAnaG1hYy1zaGExLTk2JyxcbiAgICAgICAgICAgICAgJ2htYWMtbWQ1LTk2JyxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBjb21wcmVzczogW1xuICAgICAgICAgICAgICAnbm9uZScsXG4gICAgICAgICAgICAgICd6bGliQG9wZW5zc2guY29tJyxcbiAgICAgICAgICAgICAgJ3psaWInLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICB9O1xuXG4gICAgICAgICAgaW5mby5maWxlUGVybWlzc2lvbnMgPSBzZWxmLmluZm8uZmlsZVBlcm1pc3Npb25zO1xuICAgICAgICAgIGlmIChzZWxmLmluZm8ua2V5Ym9hcmRJbnRlcmFjdGl2ZSkgaW5mby50cnlLZXlib2FyZCA9IHRydWU7XG5cbiAgICAgICAgICBzZWxmLmNvbm5lY3RvciA9IG5ldyBTRlRQKHNlbGYpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIGBwcm90b2NvbGAgZm91bmQgaW4gY29ubmVjdGlvbiBjcmVkZW50aWFsLiBQbGVhc2UgcmVjcmVhdGUgLmZ0cGNvbmZpZyBmaWxlIGZyb20gUGFja2FnZXMgLT4gUmVtb3RlLUZUUCAtPiBDcmVhdGUgKFMpRlRQIGNvbmZpZyBmaWxlLicpO1xuICAgICAgfVxuXG4gICAgICBzZWxmLmNvbm5lY3Rvci5jb25uZWN0KGluZm8sICgpID0+IHtcbiAgICAgICAgaWYgKHNlbGYucm9vdC5zdGF0dXMgIT09IDEpIHNlbGYucm9vdC5vcGVuKCk7XG4gICAgICAgIHNlbGYuZW1pdCgnY29ubmVjdGVkJyk7XG4gICAgICAgIHNlbGYuc3RhdHVzID0gJ0NPTk5FQ1RFRCc7XG5cbiAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFN1Y2Nlc3MoJ1JlbW90ZSBGVFA6IENvbm5lY3RlZCcsIHtcbiAgICAgICAgICBkaXNtaXNzYWJsZTogZmFsc2UsXG4gICAgICAgIH0pO1xuICAgICAgfSk7XG5cbiAgICAgIHNlbGYuY29ubmVjdG9yLm9uKCdjbG9zZWQnLCAoYWN0aW9uKSA9PiB7XG4gICAgICAgIHNlbGYuZGlzY29ubmVjdCgpO1xuICAgICAgICBzZWxmLnN0YXR1cyA9ICdOT1RfQ09OTkVDVEVEJztcbiAgICAgICAgc2VsZi5lbWl0KCdjbG9zZWQnKTtcbiAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEluZm8oJ1JlbW90ZSBGVFA6IENvbm5lY3Rpb24gY2xvc2VkJywge1xuICAgICAgICAgIGRpc21pc3NhYmxlOiBmYWxzZSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKGFjdGlvbiA9PT0gJ1JFQ09OTkVDVCcpIHtcbiAgICAgICAgICBzZWxmLmNvbm5lY3QodHJ1ZSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgc2VsZi5jb25uZWN0b3Iub24oJ2VuZGVkJywgKCkgPT4ge1xuICAgICAgICBzZWxmLmVtaXQoJ2VuZGVkJyk7XG4gICAgICB9KTtcbiAgICAgIHNlbGYuY29ubmVjdG9yLm9uKCdlcnJvcicsIChlcnIpID0+IHtcbiAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKCdSZW1vdGUgRlRQOiBDb25uZWN0aW9uIGZhaWxlZCcsIHtcbiAgICAgICAgICBkZXRhaWw6IGVycixcbiAgICAgICAgICBkaXNtaXNzYWJsZTogZmFsc2UsXG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgZGlzY29ubmVjdCgpIHtcbiAgICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgICBpZiAoc2VsZi5jb25uZWN0b3IpIHtcbiAgICAgICAgc2VsZi5jb25uZWN0b3IuZGlzY29ubmVjdCgpO1xuICAgICAgICBkZWxldGUgc2VsZi5jb25uZWN0b3I7XG4gICAgICAgIHNlbGYuY29ubmVjdG9yID0gbnVsbDtcbiAgICAgIH1cblxuICAgICAgaWYgKHNlbGYucm9vdCkge1xuICAgICAgICBzZWxmLnJvb3Quc3RhdHVzID0gMDtcbiAgICAgICAgc2VsZi5yb290LmRlc3Ryb3koKTtcbiAgICAgIH1cblxuICAgICAgc2VsZi53YXRjaC5yZW1vdmVMaXN0ZW5lcnMuYXBwbHkoc2VsZik7XG5cbiAgICAgIHNlbGYuX2N1cnJlbnQgPSBudWxsO1xuICAgICAgc2VsZi5fcXVldWUgPSBbXTtcblxuICAgICAgc2VsZi5lbWl0KCdkaXNjb25uZWN0ZWQnKTtcbiAgICAgIHNlbGYuc3RhdHVzID0gJ05PVF9DT05ORUNURUQnO1xuXG5cbiAgICAgIHJldHVybiBzZWxmO1xuICAgIH1cblxuICAgIHRvUmVtb3RlKGxvY2FsKSB7XG4gICAgICBjb25zdCBzZWxmID0gdGhpcztcblxuICAgICAgcmV0dXJuIFBhdGguam9pbihcbiAgICAgICAgc2VsZi5pbmZvLnJlbW90ZSxcbiAgICAgICAgYXRvbS5wcm9qZWN0LnJlbGF0aXZpemUobG9jYWwpXG4gICAgICApLnJlcGxhY2UoL1xcXFwvZywgJy8nKTtcbiAgICB9XG5cbiAgICB0b0xvY2FsKHJlbW90ZSkge1xuICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgICBjb25zdCBwcm9qZWN0UGF0aCA9IHNlbGYuZ2V0UHJvamVjdFBhdGgoKTtcblxuICAgICAgaWYgKHByb2plY3RQYXRoID09PSBmYWxzZSkgcmV0dXJuIGZhbHNlO1xuICAgICAgaWYgKHR5cGVvZiByZW1vdGUgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgUmVtb3RlIEZUUDogcmVtb3RlIG11c3QgYmUgYSBzdHJpbmcsIHdhcyBwYXNzZWQgJHt0eXBlb2YgcmVtb3RlfWApO1xuICAgICAgfVxuICAgICAgcmV0dXJuIFBhdGgucmVzb2x2ZShwcm9qZWN0UGF0aCwgYC4vJHtyZW1vdGUuc3Vic3RyKHNlbGYuaW5mby5yZW1vdGUubGVuZ3RoKS5yZXBsYWNlKC9eXFwvKy8sICcnKX1gKTtcbiAgICB9XG5cbiAgICBfbmV4dCgpIHtcbiAgICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgICBpZiAoIXNlbGYuaXNDb25uZWN0ZWQoKSkgcmV0dXJuO1xuXG4gICAgICBzZWxmLl9jdXJyZW50ID0gc2VsZi5fcXVldWUuc2hpZnQoKTtcblxuICAgICAgaWYgKHNlbGYuX2N1cnJlbnQpIHNlbGYuX2N1cnJlbnRbMV0uYXBwbHkoc2VsZiwgW3NlbGYuX2N1cnJlbnRbMl1dKTtcblxuICAgICAgYXRvbS5wcm9qZWN0LnJlbW90ZWZ0cC5lbWl0KCdxdWV1ZS1jaGFuZ2VkJyk7XG4gICAgfVxuXG4gICAgX2VucXVldWUoZnVuYywgZGVzYykge1xuICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgICBjb25zdCBwcm9ncmVzcyA9IG5ldyBQcm9ncmVzcygpO1xuXG4gICAgICBzZWxmLl9xdWV1ZS5wdXNoKFtkZXNjLCBmdW5jLCBwcm9ncmVzc10pO1xuICAgICAgaWYgKHNlbGYuX3F1ZXVlLmxlbmd0aCA9PSAxICYmICFzZWxmLl9jdXJyZW50KSBzZWxmLl9uZXh0KCk7XG5cbiAgICAgIGVsc2Ugc2VsZi5lbWl0KCdxdWV1ZS1jaGFuZ2VkJyk7XG5cbiAgICAgIHJldHVybiBwcm9ncmVzcztcbiAgICB9XG5cbiAgICBhYm9ydCgpIHtcbiAgICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgICBpZiAoc2VsZi5pc0Nvbm5lY3RlZCgpKSB7XG4gICAgICAgIHNlbGYuY29ubmVjdG9yLmFib3J0KCgpID0+IHtcbiAgICAgICAgICBzZWxmLl9uZXh0KCk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gc2VsZjtcbiAgICB9XG5cbiAgICBhYm9ydEFsbCgpIHtcbiAgICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgICBzZWxmLl9jdXJyZW50ID0gbnVsbDtcbiAgICAgIHNlbGYuX3F1ZXVlID0gW107XG5cbiAgICAgIGlmIChzZWxmLmlzQ29ubmVjdGVkKCkpIHtcbiAgICAgICAgc2VsZi5jb25uZWN0b3IuYWJvcnQoKTtcbiAgICAgIH1cblxuICAgICAgc2VsZi5lbWl0KCdxdWV1ZS1jaGFuZ2VkJyk7XG5cbiAgICAgIHJldHVybiBzZWxmO1xuICAgIH1cblxuICAgIGxpc3QocmVtb3RlLCByZWN1cnNpdmUsIGNhbGxiYWNrKSB7XG4gICAgICBjb25zdCBzZWxmID0gdGhpcztcbiAgICAgIHNlbGYub25jZUNvbm5lY3RlZCgoKSA9PiB7XG4gICAgICAgIHNlbGYuX2VucXVldWUoKCkgPT4ge1xuICAgICAgICAgIHNlbGYuY29ubmVjdG9yLmxpc3QocmVtb3RlLCByZWN1cnNpdmUsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIGNhbGxiYWNrKC4uLmFyZ3VtZW50cyk7XG4gICAgICAgICAgICBzZWxmLl9uZXh0KCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0sIGBMaXN0aW5nICR7cmVjdXJzaXZlID8gJ3JlY3Vyc2l2ZWx5ICcgOiAnJ30ke1BhdGguYmFzZW5hbWUocmVtb3RlKX1gKTtcbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gc2VsZjtcbiAgICB9XG5cbiAgICBkb3dubG9hZChyZW1vdGUsIHJlY3Vyc2l2ZSwgY2FsbGJhY2spIHtcbiAgICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgICAgc2VsZi5vbmNlQ29ubmVjdGVkKCgpID0+IHtcbiAgICAgICAgc2VsZi5fZW5xdWV1ZSgocHJvZ3Jlc3MpID0+IHtcbiAgICAgICAgICBzZWxmLmNvbm5lY3Rvci5nZXQocmVtb3RlLCByZWN1cnNpdmUsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIGNhbGxiYWNrKC4uLmFyZ3VtZW50cyk7XG4gICAgICAgICAgICBzZWxmLl9uZXh0KCk7XG4gICAgICAgICAgfSwgKHBlcmNlbnQpID0+IHtcbiAgICAgICAgICAgIHByb2dyZXNzLnNldFByb2dyZXNzKHBlcmNlbnQpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9LCBgRG93bmxvYWRpbmcgJHtQYXRoLmJhc2VuYW1lKHJlbW90ZSl9YCk7XG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIHNlbGY7XG4gICAgfVxuXG4gICAgdXBsb2FkKGxvY2FsLCBjYWxsYmFjaykge1xuICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgICBzZWxmLm9uY2VDb25uZWN0ZWQoKCkgPT4ge1xuICAgICAgICBzZWxmLl9lbnF1ZXVlKChwcm9ncmVzcykgPT4ge1xuICAgICAgICAgIHNlbGYuY29ubmVjdG9yLnB1dChsb2NhbCwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykgY2FsbGJhY2soLi4uYXJndW1lbnRzKTtcbiAgICAgICAgICAgIHNlbGYuX25leHQoKTtcbiAgICAgICAgICB9LCAocGVyY2VudCkgPT4ge1xuICAgICAgICAgICAgcHJvZ3Jlc3Muc2V0UHJvZ3Jlc3MocGVyY2VudCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0sIGBVcGxvYWRpbmcgJHtQYXRoLmJhc2VuYW1lKGxvY2FsKX1gKTtcbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gc2VsZjtcbiAgICB9XG5cbiAgICB0cmF2ZXJzZVRyZWUocm9vdFBhdGgsIGNhbGxiYWNrKSB7XG4gICAgICBjb25zdCBsaXN0ID0gW107XG4gICAgICBjb25zdCBxdWV1ZSA9IFtyb290UGF0aF07XG5cbiAgICAgIC8vIHNlYXJjaCBhbGwgZmlsZXMgaW4gcm9vdFBhdGggcmVjdXJzaXZlbHlcbiAgICAgIHdoaWxlIChxdWV1ZS5sZW5ndGggPiAwKSB7XG4gICAgICAgIGNvbnN0IGN1cnJlbnRQYXRoID0gcXVldWUucG9wKCk7XG4gICAgICAgIGNvbnN0IGZpbGVzRm91bmQgPSBGUy5yZWFkZGlyU3luYyhjdXJyZW50UGF0aCk7XG5cbiAgICAgICAgZm9yIChjb25zdCBmaWxlTmFtZSBvZiBmaWxlc0ZvdW5kKSB7XG4gICAgICAgICAgaWYgKGZpbGVOYW1lICE9PSAnLicgJiYgZmlsZU5hbWUgIT09ICcuLicpIHtcbiAgICAgICAgICAgIGNvbnN0IGZ1bGxOYW1lID0gUGF0aC5qb2luKGN1cnJlbnRQYXRoLCBmaWxlTmFtZSk7XG5cbiAgICAgICAgICAgIGNvbnN0IHN0YXRzID0gRlMuc3RhdFN5bmMoZnVsbE5hbWUpO1xuICAgICAgICAgICAgbGlzdC5wdXNoKHtcbiAgICAgICAgICAgICAgbmFtZTogZnVsbE5hbWUsXG4gICAgICAgICAgICAgIHNpemU6IHN0YXRzLnNpemUsXG4gICAgICAgICAgICAgIGRhdGU6IHN0YXRzLm10aW1lLFxuICAgICAgICAgICAgICB0eXBlOiBzdGF0cy5pc0ZpbGUoKSA/ICdmJyA6ICdkJyxcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBpZiAoIXN0YXRzLmlzRmlsZSgpKSBxdWV1ZS5wdXNoKGZ1bGxOYW1lKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gZGVwdGggY291bnRpbmcgJiBzb3J0aW5nXG4gICAgICBmb3IgKGNvbnN0IGZpbGUgb2YgbGlzdCkge1xuICAgICAgICBmaWxlLmRlcHRoID0gZmlsZS5uYW1lLnNwbGl0KCcvJykubGVuZ3RoO1xuICAgICAgfVxuICAgICAgbGlzdC5zb3J0KChhLCBiKSA9PiB7XG4gICAgICAgIGlmIChhLmRlcHRoID09PSBiLmRlcHRoKSByZXR1cm4gMDtcbiAgICAgICAgcmV0dXJuIGEuZGVwdGggPiBiLmRlcHRoID8gMSA6IC0xO1xuICAgICAgfSk7XG5cbiAgICAgIC8vIGNhbGxiYWNrXG4gICAgICBpZiAodHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSBjYWxsYmFjay5hcHBseShudWxsLCBbbGlzdF0pO1xuICAgIH1cblxuICAgIHN5bmNSZW1vdGVMb2NhbChyZW1vdGUsIGlzRmlsZSwgY2FsbGJhY2spIHtcbiAgICAgIC8vIFRPRE86IFRpZHkgdXAgdGhpcyBmdW5jdGlvbi4gRG9lcyAoIHByb2JhYmx5ICkgbm90IG5lZWQgdG8gbGlzdCBmcm9tIHRoZSBjb25uZWN0b3JcbiAgICAgIC8vIGlmIGlzRmlsZSA9PT0gdHJ1ZS4gV2lsbCBuZWVkIHRvIGNoZWNrIHRvIHNlZSBpZiB0aGF0IGRvZXNuJ3QgYnJlYWsgYW55dGhpbmcgYmVmb3JlXG4gICAgICAvLyBpbXBsZW1lbnRpbmcuIEluIHRoZSBtZWFudGltZSBjdXJyZW50IHNvbHV0aW9uIHNob3VsZCB3b3JrIGZvciAjNDUzXG4gICAgICBjb25zdCBzZWxmID0gdGhpcztcblxuICAgICAgaWYgKCFyZW1vdGUpIHJldHVybjtcblxuICAgICAgc2VsZi5vbmNlQ29ubmVjdGVkKCgpID0+IHtcbiAgICAgICAgc2VsZi5fZW5xdWV1ZSgoKSA9PiB7XG4gICAgICAgICAgY29uc3QgbG9jYWwgPSBzZWxmLnRvTG9jYWwocmVtb3RlKTtcblxuICAgICAgICAgIHNlbGYuY29ubmVjdG9yLmxpc3QocmVtb3RlLCB0cnVlLCAoZXJyLCByZW1vdGVzKSA9PiB7XG4gICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgIGlmICh0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIGNhbGxiYWNrLmFwcGx5KG51bGwsIFtlcnJdKTtcblxuICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHNlbGYudHJhdmVyc2VUcmVlKGxvY2FsLCAobG9jYWxzKSA9PiB7XG4gICAgICAgICAgICAgIGNvbnN0IGVycm9yID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIGNhbGxiYWNrLmFwcGx5KG51bGwpO1xuICAgICAgICAgICAgICAgIHNlbGYuX25leHQoKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgIGNvbnN0IG4gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVtb3RlID0gcmVtb3Rlcy5zaGlmdCgpO1xuICAgICAgICAgICAgICAgIGxldCB0b0xvY2FsO1xuICAgICAgICAgICAgICAgIGxldCBsb2NhbDtcblxuICAgICAgICAgICAgICAgIGlmICghcmVtb3RlKSByZXR1cm4gZXJyb3IoKTtcblxuXG4gICAgICAgICAgICAgICAgaWYgKHJlbW90ZS50eXBlID09PSAnZCcpIHJldHVybiBuKCk7XG5cbiAgICAgICAgICAgICAgICB0b0xvY2FsID0gc2VsZi50b0xvY2FsKHJlbW90ZS5uYW1lKTtcbiAgICAgICAgICAgICAgICBsb2NhbCA9IG51bGw7XG5cbiAgICAgICAgICAgICAgICBmb3IgKGxldCBhID0gMCwgYiA9IGxvY2Fscy5sZW5ndGg7IGEgPCBiOyArK2EpIHtcbiAgICAgICAgICAgICAgICAgIGlmIChsb2NhbHNbYV0ubmFtZSA9PT0gdG9Mb2NhbCkge1xuICAgICAgICAgICAgICAgICAgICBsb2NhbCA9IGxvY2Fsc1thXTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gRG93bmxvYWQgb25seSBpZiBub3QgcHJlc2VudCBvbiBsb2NhbCBvciBzaXplIGRpZmZlclxuICAgICAgICAgICAgICAgIGlmICghbG9jYWwgfHwgcmVtb3RlLnNpemUgIT09IGxvY2FsLnNpemUpIHtcbiAgICAgICAgICAgICAgICAgIHNlbGYuY29ubmVjdG9yLmdldChyZW1vdGUubmFtZSwgZmFsc2UsICgpID0+IG4oKSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIG4oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgIGlmIChyZW1vdGVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHNlbGYuY29ubmVjdG9yLmdldChyZW1vdGUsIGZhbHNlLCAoKSA9PiBuKCkpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBuKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9LCBpc0ZpbGUpO1xuICAgICAgICAgIC8vIE5PVEU6IEFkZGVkIGlzRmlsZSB0byBlbmQgb2YgY2FsbCB0byBwcmV2ZW50IGJyZWFraW5nIGFueSBmdW5jdGlvbnNcbiAgICAgICAgICAvLyB0aGF0IGFscmVhZHkgdXNlIGxpc3QgY29tbWFuZC4gSXMgZmlsZSBpcyB1c2VkIG9ubHkgZm9yIGZ0cCBjb25uZWN0b3JcbiAgICAgICAgICAvLyBhcyBpdCB3aWxsIGxpc3QgYSBmaWxlIGFzIGEgZmlsZSBvZiBpdHNlbGYgdW5saW5rZSB3aXRoIHNmdHAgd2hpY2hcbiAgICAgICAgICAvLyB3aWxsIHRocm93IGFuIGVycm9yLlxuICAgICAgICB9LCBgU3luYyBsb2NhbCAke1BhdGguYmFzZW5hbWUocmVtb3RlKX1gKTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHNlbGY7XG4gICAgfVxuXG4gICAgc3luY0xvY2FsUmVtb3RlKGxvY2FsLCBjYWxsYmFjaykge1xuICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgICAgIHNlbGYub25jZUNvbm5lY3RlZCgoKSA9PiB7XG4gICAgICAgIHNlbGYuX2VucXVldWUoKHByb2dyZXNzKSA9PiB7XG4gICAgICAgICAgY29uc3QgcmVtb3RlID0gc2VsZi50b1JlbW90ZShsb2NhbCk7XG5cbiAgICAgICAgICBzZWxmLmNvbm5lY3Rvci5saXN0KHJlbW90ZSwgdHJ1ZSwgKGVyciwgcmVtb3RlcykgPT4ge1xuICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICBpZiAodHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSBjYWxsYmFjay5hcHBseShudWxsLCBbZXJyXSk7XG4gICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc2VsZi50cmF2ZXJzZVRyZWUobG9jYWwsIChsb2NhbHMpID0+IHtcbiAgICAgICAgICAgICAgY29uc3QgZXJyb3IgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykgY2FsbGJhY2suYXBwbHkobnVsbCk7XG4gICAgICAgICAgICAgICAgc2VsZi5fbmV4dCgpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAvLyBmaWx0ZXIgdmlhIC5mdHBpZ25vcmVcbiAgICAgICAgICAgICAgY29uc3QgZnRwaWdub3JlID0gc2VsZi5nZXRGaWxlUGF0aCgnLmZ0cGlnbm9yZScpO1xuICAgICAgICAgICAgICBjb25zdCBpZ25vcmVGaWx0ZXIgPSBJZ25vcmUoKTtcbiAgICAgICAgICAgICAgaWYgKEZTLmV4aXN0c1N5bmMoZnRwaWdub3JlKSkge1xuICAgICAgICAgICAgICAgIGlnbm9yZUZpbHRlci5hZGQoRlMucmVhZEZpbGVTeW5jKGZ0cGlnbm9yZSkudG9TdHJpbmcoKSk7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAvLyByZW1vdmUgaWdub3JlZCBsb2NhbHNcbiAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IGxvY2Fscy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICAgICAgICAgIGlmIChpZ25vcmVGaWx0ZXIuaWdub3Jlcyhsb2NhbHNbaV0ubmFtZSkpIHtcbiAgICAgICAgICAgICAgICAgIGxvY2Fscy5zcGxpY2UoaSwgMSk7IC8vIHJlbW92ZSBmcm9tIGxpc3RcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBjb25zdCBuID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGxvY2FsID0gbG9jYWxzLnNoaWZ0KCk7XG4gICAgICAgICAgICAgICAgbGV0IHJlbW90ZTtcblxuICAgICAgICAgICAgICAgIGlmICghbG9jYWwpIHJldHVybiBlcnJvcigpO1xuXG4gICAgICAgICAgICAgICAgaWYgKGxvY2FsLnR5cGUgPT09ICdkJykgcmV0dXJuIG4oKTtcblxuICAgICAgICAgICAgICAgIGNvbnN0IHRvUmVtb3RlID0gc2VsZi50b1JlbW90ZShsb2NhbC5uYW1lKTtcbiAgICAgICAgICAgICAgICByZW1vdGUgPSBudWxsO1xuXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgYSA9IDAsIGIgPSByZW1vdGVzLmxlbmd0aDsgYSA8IGI7ICsrYSkge1xuICAgICAgICAgICAgICAgICAgaWYgKHJlbW90ZXNbYV0ubmFtZSA9PT0gdG9SZW1vdGUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVtb3RlID0gcmVtb3Rlc1thXTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gTk9URTogVXBsb2FkIG9ubHkgaWYgbm90IHByZXNlbnQgb24gcmVtb3RlIG9yIHNpemUgZGlmZmVyXG4gICAgICAgICAgICAgICAgaWYgKCFyZW1vdGUgfHwgcmVtb3RlLnNpemUgIT09IGxvY2FsLnNpemUpIHtcbiAgICAgICAgICAgICAgICAgIHNlbGYuY29ubmVjdG9yLnB1dChsb2NhbC5uYW1lLCAoKSA9PiBuKCkpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICBuKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICBuKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSwgYFN5bmMgcmVtb3RlICR7UGF0aC5iYXNlbmFtZShsb2NhbCl9YCk7XG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIHNlbGY7XG4gICAgfVxuXG4gICAgbWtkaXIocmVtb3RlLCByZWN1cnNpdmUsIGNhbGxiYWNrKSB7XG4gICAgICBjb25zdCBzZWxmID0gdGhpcztcbiAgICAgIHNlbGYub25jZUNvbm5lY3RlZCgoKSA9PiB7XG4gICAgICAgIHNlbGYuX2VucXVldWUoKCkgPT4ge1xuICAgICAgICAgIHNlbGYuY29ubmVjdG9yLm1rZGlyKHJlbW90ZSwgcmVjdXJzaXZlLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSBjYWxsYmFjayguLi5hcmd1bWVudHMpO1xuICAgICAgICAgICAgc2VsZi5fbmV4dCgpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9LCBgQ3JlYXRpbmcgZm9sZGVyICR7UGF0aC5iYXNlbmFtZShyZW1vdGUpfWApO1xuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiBzZWxmO1xuICAgIH1cblxuICAgIG1rZmlsZShyZW1vdGUsIGNhbGxiYWNrKSB7XG4gICAgICBjb25zdCBzZWxmID0gdGhpcztcbiAgICAgIHNlbGYub25jZUNvbm5lY3RlZCgoKSA9PiB7XG4gICAgICAgIHNlbGYuX2VucXVldWUoKCkgPT4ge1xuICAgICAgICAgIHNlbGYuY29ubmVjdG9yLm1rZmlsZShyZW1vdGUsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIGNhbGxiYWNrKC4uLmFyZ3VtZW50cyk7XG4gICAgICAgICAgICBzZWxmLl9uZXh0KCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0sIGBDcmVhdGluZyBmaWxlICR7UGF0aC5iYXNlbmFtZShyZW1vdGUpfWApO1xuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiBzZWxmO1xuICAgIH1cblxuICAgIHJlbmFtZShzb3VyY2UsIGRlc3QsIGNhbGxiYWNrKSB7XG4gICAgICBjb25zdCBzZWxmID0gdGhpcztcbiAgICAgIHNlbGYub25jZUNvbm5lY3RlZCgoKSA9PiB7XG4gICAgICAgIHNlbGYuX2VucXVldWUoKCkgPT4ge1xuICAgICAgICAgIHNlbGYuY29ubmVjdG9yLnJlbmFtZShzb3VyY2UsIGRlc3QsIChlcnIpID0+IHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIGNhbGxiYWNrLmFwcGx5KG51bGwsIFtlcnJdKTtcbiAgICAgICAgICAgIHNlbGYuX25leHQoKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSwgYFJlbmFtaW5nICR7UGF0aC5iYXNlbmFtZShzb3VyY2UpfWApO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gc2VsZjtcbiAgICB9XG5cbiAgICBkZWxldGUocmVtb3RlLCBjYWxsYmFjaykge1xuICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgICBzZWxmLm9uY2VDb25uZWN0ZWQoKCkgPT4ge1xuICAgICAgICBzZWxmLl9lbnF1ZXVlKCgpID0+IHtcbiAgICAgICAgICBzZWxmLmNvbm5lY3Rvci5kZWxldGUocmVtb3RlLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSBjYWxsYmFjayguLi5hcmd1bWVudHMpO1xuICAgICAgICAgICAgc2VsZi5fbmV4dCgpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9LCBgRGVsZXRpbmcgJHtQYXRoLmJhc2VuYW1lKHJlbW90ZSl9YCk7XG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIHNlbGY7XG4gICAgfVxuXG4gICAgcHJvbXB0Rm9yUGFzcygpIHtcbiAgICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgICAgY29uc3QgZGlhbG9nID0gbmV3IFByb21wdFBhc3NEaWFsb2coJycsIHRydWUpO1xuICAgICAgZGlhbG9nLm9uKCdkaWFsb2ctZG9uZScsIChlLCBwYXNzKSA9PiB7XG4gICAgICAgIHNlbGYuaW5mby5wYXNzID0gcGFzcztcbiAgICAgICAgc2VsZi5pbmZvLnBhc3NwaHJhc2UgPSBwYXNzO1xuICAgICAgICBkaWFsb2cuY2xvc2UoKTtcbiAgICAgICAgc2VsZi5kb0Nvbm5lY3QoKTtcbiAgICAgIH0pO1xuICAgICAgZGlhbG9nLmF0dGFjaCgpO1xuICAgIH1cbiAgfVxuXG5cbiAgcmV0dXJuIENsaWVudDtcbn0oKSk7XG4iXX0=