Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _fsPlus = require('fs-plus');

var _fsPlus2 = _interopRequireDefault(_fsPlus);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _atomSpacePenViews = require('atom-space-pen-views');

var _helpers = require('../helpers');

var _file = require('../file');

var _file2 = _interopRequireDefault(_file);

var _directory = require('../directory');

var _directory2 = _interopRequireDefault(_directory);

var _viewsDirectoryView = require('../views/directory-view');

var _viewsDirectoryView2 = _interopRequireDefault(_viewsDirectoryView);

var _dialogsAddDialog = require('../dialogs/add-dialog');

var _dialogsAddDialog2 = _interopRequireDefault(_dialogsAddDialog);

var _dialogsMoveDialog = require('../dialogs/move-dialog');

var _dialogsMoveDialog2 = _interopRequireDefault(_dialogsMoveDialog);

var _dialogsNavigateToDialog = require('../dialogs/navigate-to-dialog');

var _dialogsNavigateToDialog2 = _interopRequireDefault(_dialogsNavigateToDialog);

'use babel';

var init = function INIT() {
  var atom = global.atom;
  var client = atom.project.remoteftp;
  var remoteftp = atom.project['remoteftp-main'];
  var getRemotes = function GETREMOTES(errMessage) {
    var remotes = remoteftp.treeView.getSelected();

    if (!remotes || remotes.length === 0) {
      atom.notifications.addWarning('Remote FTP: ' + errMessage, {
        dismissable: false
      });
      return false;
    }

    return remotes;
  };

  var createConfig = function CREATECONFIG(obj) {
    if (!(0, _helpers.hasProject)()) return;

    var ftpConfigPath = client.getConfigPath();
    var fileExists = _fsPlus2['default'].existsSync(ftpConfigPath);
    var json = JSON.stringify(obj, null, 4);

    var writeFile = true;
    if (fileExists) {
      writeFile = atom.confirm({
        message: 'Do you want to overwrite .ftpconfig?',
        detailedMessage: 'You are overwriting ' + ftpConfigPath,
        buttons: {
          Yes: function Yes() {
            return true;
          },
          No: function No() {
            return false;
          }
        }
      });
    }
    if (writeFile) {
      _fsPlus2['default'].writeFile(ftpConfigPath, json, function (err) {
        if (!err) atom.workspace.open(ftpConfigPath);
      });
    }
  };

  var commands = {
    'remote-ftp:create-ftp-config': {
      enabled: true,
      command: function command() {
        createConfig({
          protocol: 'ftp',
          host: 'example.com',
          port: 21,
          user: 'user',
          pass: 'pass',
          promptForPass: false,
          remote: '/',
          local: '',
          secure: false,
          secureOptions: null,
          connTimeout: 10000,
          pasvTimeout: 10000,
          keepalive: 10000,
          watch: [],
          watchTimeout: 500
        });
      }
    },
    'remote-ftp:create-sftp-config': {
      enabled: true,
      command: function command() {
        createConfig({
          protocol: 'sftp',
          host: 'example.com',
          port: 22,
          user: 'user',
          pass: 'pass',
          promptForPass: false,
          remote: '/',
          local: '',
          agent: '',
          privatekey: '',
          passphrase: '',
          hosthash: '',
          ignorehost: true,
          connTimeout: 10000,
          keepalive: 10000,
          keyboardInteractive: false,
          watch: [],
          watchTimeout: 500
        });
      }
    },
    'remote-ftp:create-ignore-file': {
      enabled: true,
      command: function command() {
        if (!(0, _helpers.hasProject)()) return;

        var fileContents = '\n      # Please note that this is a beta-feature and will only work with local-to-remote sync!\n      # For example, the following patterns will be ignored on sync:\n      .ftpconfig\n      .DS_Store\n      ';

        var ftpIgnorePath = client.getFilePath('./.ftpignore');

        _fsPlus2['default'].writeFile(ftpIgnorePath, fileContents, function (err) {
          if (!err) atom.workspace.open(ftpIgnorePath);
        });
      }
    },
    'remote-ftp:toggle': {
      enabled: true,
      command: function command() {
        remoteftp.treeView.toggle();
      }
    },
    'remote-ftp:connect': {
      enabled: true,
      command: function command() {
        if (!(0, _helpers.hasProject)()) return;

        client.readConfig(function (e) {
          if (e) {
            atom.notifications.addError('Remote FTP: Could not read `.ftpconfig` file', {
              detail: e,
              dismissable: false
            });

            return;
          }

          var hideFTPTreeView = false;
          if (!remoteftp.treeView.isVisible()) {
            remoteftp.treeView.toggle();
            hideFTPTreeView = true;
          }

          client.connect();

          if (hideFTPTreeView) {
            atom.project.remoteftp.once('connected', function () {
              remoteftp.treeView.toggle();
            });
          }
        });
      }
    },
    'remote-ftp:disconnect': {
      enabled: true,
      command: function command() {
        if (!(0, _helpers.hasProject)()) return;

        client.disconnect();
      }
    },
    'remote-ftp:add-file': {
      enabled: true,
      command: function command() {
        if (!(0, _helpers.hasProject)()) return;
        var remotes = getRemotes('You need to select a folder first');
        if (remotes === false) return;
        if (!(remotes[0] instanceof _viewsDirectoryView2['default'])) {
          atom.notifications.addError('Remote FTP: Cannot add a file to ' + remotes[0].item.remote, {
            dismissable: false
          });
          return;
        }
        var dialog = new _dialogsAddDialog2['default']('', true);
        dialog.on('new-path', function (e, name) {
          var remote = _path2['default'].join(remotes[0].item.remote, name).replace(/\\/g, '/');
          dialog.close();
          client.mkdir(remotes[0].item.remote, true, function () {
            client.mkfile(remote, function (err) {
              remotes[0].open();
              if (!err) atom.workspace.open(client.toLocal(remote));
            });
          });
        });

        dialog.attach();
      }
    },
    'remote-ftp:add-folder': {
      enabled: true,
      command: function command() {
        if (!(0, _helpers.hasProject)()) return;

        var remotes = getRemotes('You need to select a folder first');
        if (remotes === false) return;
        if (!(remotes[0] instanceof _viewsDirectoryView2['default'])) {
          atom.notifications.addError('Remote FTP: Cannot add a folder to ' + remotes[0].item.remote, {
            dismissable: false
          });
          return;
        }

        var dialog = new _dialogsAddDialog2['default']('');

        dialog.on('new-path', function (e, name) {
          var remote = _path2['default'].join(remotes[0].item.remote, name).replace(/\\/g, '/');
          client.mkdir(remote, true, function () {
            dialog.close();
            remotes[0].open();
          });
        });
        dialog.attach();
      }
    },
    'remote-ftp:refresh-selected': {
      enabled: true,
      command: function command() {
        if (!(0, _helpers.hasProject)()) return;

        var remotes = getRemotes('You need to select a folder first');
        if (remotes === false) return;

        remotes.forEach(function (remote) {
          remote.open();
        });
      }
    },
    'remote-ftp:move-selected': {
      enabled: true,
      command: function command() {
        if (!(0, _helpers.hasProject)()) return;

        var remotes = getRemotes('You need to select a folder first');
        if (remotes === false) return;

        var dialog = new _dialogsMoveDialog2['default'](remotes[0].item.remote);

        dialog.on('path-changed', function (e, newremote) {
          client.rename(remotes[0].item.remote, newremote, function (err) {
            var errMessage = (0, _helpers.getObject)({
              obj: err,
              keys: ['message']
            });
            dialog.close();
            if (errMessage === 'file exists' || errMessage === 'File already exists') {
              atom.notifications.addError('Remote FTP: File / Folder already exists', {
                dismissable: false
              });
              return;
            }
            var parentNew = remoteftp.treeView.resolve(_path2['default'].dirname(newremote));
            if (parentNew) parentNew.open();
            var parentOld = remoteftp.treeView.resolve(_path2['default'].dirname(remotes[0].item.remote));
            if (parentOld && parentOld !== parentNew) parentOld.open();
            remotes[0].destroy();
          });
        });
        dialog.attach();
      }
    },
    'remote-ftp:delete-selected': {
      enabled: true,
      command: function command() {
        if (!(0, _helpers.hasProject)()) return;

        var remotes = getRemotes('You need to select a folder first');
        if (remotes === false) return;

        atom.confirm({
          message: 'Are you sure you want to delete the selected item ?',
          detailedMessage: 'You are deleting:' + remotes.map(function (view) {
            return '\n  ' + view.item.remote;
          }),
          buttons: {
            'Move to Trash': function MOVETOTRASH() {
              remotes.forEach(function (view) {
                if (!view) return;

                var dir = _path2['default'].dirname(view.item.remote).replace(/\\/g, '/');
                var parent = remoteftp.treeView.resolve(dir);

                client['delete'](view.item.remote, function (err) {
                  if (!err && parent) {
                    parent.open();
                  }
                });
              });
            },
            Cancel: null
          }
        });
      }
    },
    'remote-ftp:download-selected': {
      enabled: true,
      command: function command() {
        if (!(0, _helpers.hasProject)()) return;

        var remotes = getRemotes('You need to select a folder first');
        if (remotes === false) return;

        remotes.forEach(function (view) {
          if (!view) return;

          client.download(view.item.remote, true, function () {});
        });
      }
    },
    'remote-ftp:download-selected-local': {
      enabled: true,
      command: function command() {
        if (!(0, _helpers.hasProject)()) return;
        if (client.root.local === '') {
          atom.notifications.addError('Remote FTP: You must define your local root folder in the projects .ftpconfig file.', {
            dismissable: false
          });
          return;
        }

        if (!client.isConnected()) {
          // just connect
          atom.commands.dispatch(atom.views.getView(atom.workspace), 'remote-ftp:connect');

          client.once('connected', function () {
            atom.commands.dispatch(atom.views.getView(atom.workspace), 'remote-ftp:download-selected-local');
          });

          return;
        }

        if (atom.config.get('Remote-FTP.enableTransferNotifications')) {
          // TODO: correctly count files within a subdirectory
          var requestedTransfers = 0;
          var successfulTransfers = 0;
          var attemptedTransfers = 0;

          (0, _atomSpacePenViews.$)('.tree-view .selected').map(function () {
            requestedTransfers++;
          });
        }

        (0, _atomSpacePenViews.$)('.tree-view .selected').each(function MAP() {
          var path = this.getPath ? this.getPath() : '';
          var localPath = path.replace(client.root.local, '');
          // if this is windows, the path may have \ instead of / as directory separators
          var remotePath = atom.project.remoteftp.root.remote + localPath.replace(/\\/g, '/');
          client.download(remotePath, true, function () {
            if (atom.config.get('Remote-FTP.enableTransferNotifications')) {
              // TODO: check if any errors were thrown, indicating an unsuccessful transfer
              attemptedTransfers++;
              successfulTransfers++;
            }
          });
        });

        if (atom.config.get('Remote-FTP.enableTransferNotifications')) {
          var waitingForTransfers = setInterval(function () {
            if (attemptedTransfers == requestedTransfers) {
              // we're done waiting
              clearInterval(waitingForTransfers);
              if (successfulTransfers == requestedTransfers) {
                // great, all uploads worked
                atom.notifications.addSuccess('Remote FTP: All transfers succeeded (' + successfulTransfers + ' of ' + requestedTransfers + ').');
              } else {
                // :( some uploads failed
                atom.notifications.addError('Remote FTP: Some transfers failed<br />There were ' + successfulTransfers + ' successful out of an expected ' + requestedTransfers + '.');
              }
            }
          }, 200);
        }

        return;
      }
    },
    'remote-ftp:upload-selected': {
      enabled: true,
      command: function command() {
        if (!(0, _helpers.hasProject)()) return;

        if (!client.isConnected()) {
          // just connect
          atom.commands.dispatch(atom.views.getView(atom.workspace), 'remote-ftp:connect');

          atom.project.remoteftp.once('connected', function () {
            atom.commands.dispatch(atom.views.getView(atom.workspace), 'remote-ftp:upload-selected');
          });

          return;
        }

        var locals = (0, _atomSpacePenViews.$)('.tree-view .selected').map(function MAP() {
          return this.getPath ? this.getPath() : '';
        }).get();

        if (atom.config.get('Remote-FTP.enableTransferNotifications')) {
          var successfulTransfers = 0;
          var attemptedTransfers = 0;
        }

        locals.forEach(function (local) {
          if (!local) return;

          client.upload(local, function (err, list) {
            if (atom.config.get('Remote-FTP.enableTransferNotifications')) {
              attemptedTransfers++;
            }
            if (err) return;
            if (atom.config.get('Remote-FTP.enableTransferNotifications')) {
              successfulTransfers++;
            }

            var dirs = [];
            list.forEach(function (item) {
              var remote = client.toRemote(item.name);
              var dir = _path2['default'].dirname(remote);
              if (dirs.indexOf(dir) === -1) dirs.push(dir);
            });

            dirs.forEach(function (dir) {
              var view = remoteftp.treeView.resolve(dir);
              if (view) view.open();
            });
          });
        });

        if (atom.config.get('Remote-FTP.enableTransferNotifications')) {
          var waitingForTransfers = setInterval(function () {
            if (attemptedTransfers == locals.length) {
              // we're done waiting
              clearInterval(waitingForTransfers);
              if (successfulTransfers == locals.length) {
                // great, all uploads worked
                atom.notifications.addSuccess('Remote FTP: All transfers succeeded (' + successfulTransfers + ' of ' + locals.length + ').');
              } else {
                // :( some uploads failed
                atom.notifications.addError('Remote FTP: Some transfers failed<br />There were ' + successfulTransfers + ' successful out of an expected ' + locals.length + '.');
              }
            }
          }, 200);
        }
      }
    },
    'remote-ftp:upload-active': {
      enabled: true,
      command: function command() {
        if (!(0, _helpers.hasProject)()) return;

        var editor = atom.workspace.getActivePaneItem();
        if (!editor) return;

        var local = editor.getPath();

        client.upload(local, function (err, list) {
          if (err) return;

          var dirs = [];
          list.forEach(function (item) {
            var remote = atom.project.remoteftp.toRemote(item.name);
            var dir = _path2['default'].dirname(remote);
            if (dirs.indexOf(dir) === -1) dirs.push(dir);
          });

          dirs.forEach(function (dir) {
            var view = remoteftp.treeView.resolve(dir);
            if (view) view.open();
          });
        });
      }
    },
    // Remote -> Local
    'remote-ftp:sync-with-remote': {
      enabled: true,
      command: function command() {
        var remotes = remoteftp.treeView.getSelected();

        remotes.forEach(function (view) {
          if (!view) return;
          var isFile = view.item instanceof _file2['default'];
          client.syncRemoteLocal(view.item.remote, isFile, function () {});
        });
      }
    },

    // Local -> Remote
    'remote-ftp:sync-with-local': {
      enabled: true,
      command: function command() {
        if (!(0, _helpers.hasProject)()) return;

        var locals = (0, _atomSpacePenViews.$)('.tree-view .selected').map(function MAP() {
          return this.getPath ? this.getPath() : '';
        }).get();

        locals.forEach(function (local) {
          if (!local) return;

          client.syncLocalRemote(local, function () {
            var remote = client.toRemote(local);
            if (remote) {
              var _parent = remoteftp.treeView.resolve(remote);
              if (_parent && !(_parent.item instanceof _directory2['default'])) {
                _parent = remoteftp.treeView.resolve(_path2['default'].dirname(remote).replace(/\\/g, '/'));
              }
              if (_parent) _parent.open();
            }
          });
        });
      }
    },
    'remote-ftp:abort-current': {
      enabled: true,
      command: function command() {
        if (!(0, _helpers.hasProject)()) return;
        client.abort();
      }
    },
    'remote-ftp:navigate-to': {
      enabled: true,
      command: function command() {
        if (!(0, _helpers.hasProject)()) return;
        var dialog = new _dialogsNavigateToDialog2['default']();
        dialog.on('navigate-to', function (e, path) {
          dialog.close();
          client.root.openPath(path);
        });
        dialog.attach();
      }
    },
    'remote-ftp:copy-name': {
      enabled: true,
      command: function command() {
        if (!(0, _helpers.hasProject)()) return;
        var remotes = remoteftp.treeView.getSelected();
        if (!remotes || remotes.length === 0) return;
        var name = '' + remotes.map(function (data) {
          return data.item.name;
        });
        atom.clipboard.write(name);
      }
    }

  };

  return commands;
};

exports['default'] = init;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGU6Ly8vQzovVXNlcnMvdWNoaWhhLy5hdG9tL3BhY2thZ2VzL1JlbW90ZS1GVFAvbGliL21lbnVzL2NvbW1hbmRzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztzQkFFZSxTQUFTOzs7O29CQUNQLE1BQU07Ozs7aUNBQ0wsc0JBQXNCOzt1QkFJakMsWUFBWTs7b0JBRUYsU0FBUzs7Ozt5QkFDSixjQUFjOzs7O2tDQUNWLHlCQUF5Qjs7OztnQ0FDN0IsdUJBQXVCOzs7O2lDQUN0Qix3QkFBd0I7Ozs7dUNBQ3hCLCtCQUErQjs7OztBQWZ0RCxXQUFXLENBQUM7O0FBa0JaLElBQU0sSUFBSSxHQUFHLFNBQVMsSUFBSSxHQUFHO0FBQzNCLE1BQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUM7QUFDekIsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUM7QUFDdEMsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0FBQ2pELE1BQU0sVUFBVSxHQUFHLFNBQVMsVUFBVSxDQUFDLFVBQVUsRUFBRTtBQUNqRCxRQUFNLE9BQU8sR0FBRyxTQUFTLENBQUMsUUFBUSxDQUFDLFdBQVcsRUFBRSxDQUFDOztBQUVqRCxRQUFJLENBQUMsT0FBTyxJQUFJLE9BQU8sQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO0FBQ3BDLFVBQUksQ0FBQyxhQUFhLENBQUMsVUFBVSxrQkFBZ0IsVUFBVSxFQUFJO0FBQ3pELG1CQUFXLEVBQUUsS0FBSztPQUNuQixDQUFDLENBQUM7QUFDSCxhQUFPLEtBQUssQ0FBQztLQUNkOztBQUVELFdBQU8sT0FBTyxDQUFDO0dBQ2hCLENBQUM7O0FBRUYsTUFBTSxZQUFZLEdBQUcsU0FBUyxZQUFZLENBQUMsR0FBRyxFQUFFO0FBQzlDLFFBQUksQ0FBQywwQkFBWSxFQUFFLE9BQU87O0FBRTFCLFFBQU0sYUFBYSxHQUFHLE1BQU0sQ0FBQyxhQUFhLEVB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akQsWUFBSSxDQUFDLE9BQU8sSUFBSSxPQUFPLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRSxPQUFPO0FBQzdDLFlBQU0sSUFBSSxRQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBQSxJQUFJO2lCQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSTtTQUFBLENBQUMsQUFBRSxDQUFDO0FBQ3RELFlBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO09BQzVCO0tBQ0Y7O0dBRUYsQ0FBQzs7QUFFRixTQUFPLFFBQVEsQ0FBQztDQUNqQixDQUFDOztxQkFFYSxJQUFJIiwiZmlsZSI6ImZpbGU6Ly8vQzovVXNlcnMvdWNoaWhhLy5hdG9tL3BhY2thZ2VzL1JlbW90ZS1GVFAvbGliL21lbnVzL2NvbW1hbmRzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmltcG9ydCBGUyBmcm9tICdmcy1wbHVzJztcbmltcG9ydCBQYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgJCB9IGZyb20gJ2F0b20tc3BhY2UtcGVuLXZpZXdzJztcbmltcG9ydCB7XG4gIGhhc1Byb2plY3QsXG4gIGdldE9iamVjdCxcbn0gZnJvbSAnLi4vaGVscGVycyc7XG5cbmltcG9ydCBGaWxlIGZyb20gJy4uL2ZpbGUnO1xuaW1wb3J0IERpcmVjdG9yeSBmcm9tICcuLi9kaXJlY3RvcnknO1xuaW1wb3J0IERpcmVjdG9yeVZpZXcgZnJvbSAnLi4vdmlld3MvZGlyZWN0b3J5LXZpZXcnO1xuaW1wb3J0IEFkZERpYWxvZyBmcm9tICcuLi9kaWFsb2dzL2FkZC1kaWFsb2cnO1xuaW1wb3J0IE1vdmVEaWFsb2cgZnJvbSAnLi4vZGlhbG9ncy9tb3ZlLWRpYWxvZyc7XG5pbXBvcnQgTmF2aWdhdGVUbyBmcm9tICcuLi9kaWFsb2dzL25hdmlnYXRlLXRvLWRpYWxvZyc7XG5cblxuY29uc3QgaW5pdCA9IGZ1bmN0aW9uIElOSVQoKSB7XG4gIGNvbnN0IGF0b20gPSBnbG9iYWwuYXRvbTtcbiAgY29uc3QgY2xpZW50ID0gYXRvbS5wcm9qZWN0LnJlbW90ZWZ0cDtcbiAgY29uc3QgcmVtb3RlZnRwID0gYXRvbS5wcm9qZWN0WydyZW1vdGVmdHAtbWFpbiddO1xuICBjb25zdCBnZXRSZW1vdGVzID0gZnVuY3Rpb24gR0VUUkVNT1RFUyhlcnJNZXNzYWdlKSB7XG4gICAgY29uc3QgcmVtb3RlcyA9IHJlbW90ZWZ0cC50cmVlVmlldy5nZXRTZWxlY3RlZCgpO1xuXG4gICAgaWYgKCFyZW1vdGVzIHx8IHJlbW90ZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkV2FybmluZyhgUmVtb3RlIEZUUDogJHtlcnJNZXNzYWdlfWAsIHtcbiAgICAgICAgZGlzbWlzc2FibGU6IGZhbHNlLFxuICAgICAgfSk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlbW90ZXM7XG4gIH07XG5cbiAgY29uc3QgY3JlYXRlQ29uZmlnID0gZnVuY3Rpb24gQ1JFQVRFQ09ORklHKG9iaikge1xuICAgIGlmICghaGFzUHJvamVjdCgpKSByZXR1cm47XG5cbiAgICBjb25zdCBmdHBDb25maWdQYXRoID0gY2xpZW50LmdldENvbmZpZ1BhdGgoKTtcbiAgICBjb25zdCBmaWxlRXhpc3RzID0gRlMuZXhpc3RzU3luYyhmdHBDb25maWdQYXRoKTtcbiAgICBjb25zdCBqc29uID0gSlNPTi5zdHJpbmdpZnkob2JqLCBudWxsLCA0KTtcblxuICAgIGxldCB3cml0ZUZpbGUgPSB0cnVlO1xuICAgIGlmIChmaWxlRXhpc3RzKSB7XG4gICAgICB3cml0ZUZpbGUgPSBhdG9tLmNvbmZpcm0oe1xuICAgICAgICBtZXNzYWdlOiAnRG8geW91IHdhbnQgdG8gb3ZlcndyaXRlIC5mdHBjb25maWc/JyxcbiAgICAgICAgZGV0YWlsZWRNZXNzYWdlOiBgWW91IGFyZSBvdmVyd3JpdGluZyAke2Z0cENvbmZpZ1BhdGh9YCxcbiAgICAgICAgYnV0dG9uczoge1xuICAgICAgICAgIFllczogKCkgPT4gdHJ1ZSxcbiAgICAgICAgICBObzogKCkgPT4gZmFsc2UsXG4gICAgICAgIH0sXG4gICAgICB9KTtcbiAgICB9XG4gICAgaWYgKHdyaXRlRmlsZSkge1xuICAgICAgRlMud3JpdGVGaWxlKGZ0cENvbmZpZ1BhdGgsIGpzb24sIChlcnIpID0+IHtcbiAgICAgICAgaWYgKCFlcnIpIGF0b20ud29ya3NwYWNlLm9wZW4oZnRwQ29uZmlnUGF0aCk7XG4gICAgICB9KTtcbiAgICB9XG4gIH07XG5cblxuICBjb25zdCBjb21tYW5kcyA9IHtcbiAgICAncmVtb3RlLWZ0cDpjcmVhdGUtZnRwLWNvbmZpZyc6IHtcbiAgICAgIGVuYWJsZWQ6IHRydWUsXG4gICAgICBjb21tYW5kKCkge1xuICAgICAgICBjcmVhdGVDb25maWcoe1xuICAgICAgICAgIHByb3RvY29sOiAnZnRwJyxcbiAgICAgICAgICBob3N0OiAnZXhhbXBsZS5jb20nLFxuICAgICAgICAgIHBvcnQ6IDIxLFxuICAgICAgICAgIHVzZXI6ICd1c2VyJyxcbiAgICAgICAgICBwYXNzOiAncGFzcycsXG4gICAgICAgICAgcHJvbXB0Rm9yUGFzczogZmFsc2UsXG4gICAgICAgICAgcmVtb3RlOiAnLycsXG4gICAgICAgICAgbG9jYWw6ICcnLFxuICAgICAgICAgIHNlY3VyZTogZmFsc2UsXG4gICAgICAgICAgc2VjdXJlT3B0aW9uczogbnVsbCxcbiAgICAgICAgICBjb25uVGltZW91dDogMTAwMDAsXG4gICAgICAgICAgcGFzdlRpbWVvdXQ6IDEwMDAwLFxuICAgICAgICAgIGtlZXBhbGl2ZTogMTAwMDAsXG4gICAgICAgICAgd2F0Y2g6IFtdLFxuICAgICAgICAgIHdhdGNoVGltZW91dDogNTAwLFxuICAgICAgICB9KTtcbiAgICAgIH0sXG4gICAgfSxcbiAgICAncmVtb3RlLWZ0cDpjcmVhdGUtc2Z0cC1jb25maWcnOiB7XG4gICAgICBlbmFibGVkOiB0cnVlLFxuICAgICAgY29tbWFuZCgpIHtcbiAgICAgICAgY3JlYXRlQ29uZmlnKHtcbiAgICAgICAgICBwcm90b2NvbDogJ3NmdHAnLFxuICAgICAgICAgIGhvc3Q6ICdleGFtcGxlLmNvbScsXG4gICAgICAgICAgcG9ydDogMjIsXG4gICAgICAgICAgdXNlcjogJ3VzZXInLFxuICAgICAgICAgIHBhc3M6ICdwYXNzJyxcbiAgICAgICAgICBwcm9tcHRGb3JQYXNzOiBmYWxzZSxcbiAgICAgICAgICByZW1vdGU6ICcvJyxcbiAgICAgICAgICBsb2NhbDogJycsXG4gICAgICAgICAgYWdlbnQ6ICcnLFxuICAgICAgICAgIHByaXZhdGVrZXk6ICcnLFxuICAgICAgICAgIHBhc3NwaHJhc2U6ICcnLFxuICAgICAgICAgIGhvc3RoYXNoOiAnJyxcbiAgICAgICAgICBpZ25vcmVob3N0OiB0cnVlLFxuICAgICAgICAgIGNvbm5UaW1lb3V0OiAxMDAwMCxcbiAgICAgICAgICBrZWVwYWxpdmU6IDEwMDAwLFxuICAgICAgICAgIGtleWJvYXJkSW50ZXJhY3RpdmU6IGZhbHNlLFxuICAgICAgICAgIHdhdGNoOiBbXSxcbiAgICAgICAgICB3YXRjaFRpbWVvdXQ6IDUwMCxcbiAgICAgICAgfSk7XG4gICAgICB9LFxuICAgIH0sXG4gICAgJ3JlbW90ZS1mdHA6Y3JlYXRlLWlnbm9yZS1maWxlJzoge1xuICAgICAgZW5hYmxlZDogdHJ1ZSxcbiAgICAgIGNvbW1hbmQoKSB7XG4gICAgICAgIGlmICghaGFzUHJvamVjdCgpKSByZXR1cm47XG5cbiAgICAgICAgY29uc3QgZmlsZUNvbnRlbnRzID0gYFxuICAgICAgIyBQbGVhc2Ugbm90ZSB0aGF0IHRoaXMgaXMgYSBiZXRhLWZlYXR1cmUgYW5kIHdpbGwgb25seSB3b3JrIHdpdGggbG9jYWwtdG8tcmVtb3RlIHN5bmMhXG4gICAgICAjIEZvciBleGFtcGxlLCB0aGUgZm9sbG93aW5nIHBhdHRlcm5zIHdpbGwgYmUgaWdub3JlZCBvbiBzeW5jOlxuICAgICAgLmZ0cGNvbmZpZ1xuICAgICAgLkRTX1N0b3JlXG4gICAgICBgO1xuXG4gICAgICAgIGNvbnN0IGZ0cElnbm9yZVBhdGggPSBjbGllbnQuZ2V0RmlsZVBhdGgoJy4vLmZ0cGlnbm9yZScpO1xuXG4gICAgICAgIEZTLndyaXRlRmlsZShmdHBJZ25vcmVQYXRoLCBmaWxlQ29udGVudHMsIChlcnIpID0+IHtcbiAgICAgICAgICBpZiAoIWVycikgYXRvbS53b3Jrc3BhY2Uub3BlbihmdHBJZ25vcmVQYXRoKTtcbiAgICAgICAgfSk7XG4gICAgICB9LFxuICAgIH0sXG4gICAgJ3JlbW90ZS1mdHA6dG9nZ2xlJzoge1xuICAgICAgZW5hYmxlZDogdHJ1ZSxcbiAgICAgIGNvbW1hbmQoKSB7XG4gICAgICAgIHJlbW90ZWZ0cC50cmVlVmlldy50b2dnbGUoKTtcbiAgICAgIH0sXG4gICAgfSxcbiAgICAncmVtb3RlLWZ0cDpjb25uZWN0Jzoge1xuICAgICAgZW5hYmxlZDogdHJ1ZSxcbiAgICAgIGNvbW1hbmQoKSB7XG4gICAgICAgIGlmICghaGFzUHJvamVjdCgpKSByZXR1cm47XG5cbiAgICAgICAgY2xpZW50LnJlYWRDb25maWcoKGUpID0+IHtcbiAgICAgICAgICBpZiAoZSkge1xuICAgICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKCdSZW1vdGUgRlRQOiBDb3VsZCBub3QgcmVhZCBgLmZ0cGNvbmZpZ2AgZmlsZScsIHtcbiAgICAgICAgICAgICAgZGV0YWlsOiBlLFxuICAgICAgICAgICAgICBkaXNtaXNzYWJsZTogZmFsc2UsXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGxldCBoaWRlRlRQVHJlZVZpZXcgPSBmYWxzZTtcbiAgICAgICAgICBpZiAoIXJlbW90ZWZ0cC50cmVlVmlldy5pc1Zpc2libGUoKSkge1xuICAgICAgICAgICAgcmVtb3RlZnRwLnRyZWVWaWV3LnRvZ2dsZSgpO1xuICAgICAgICAgICAgaGlkZUZUUFRyZWVWaWV3ID0gdHJ1ZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjbGllbnQuY29ubmVjdCgpO1xuXG4gICAgICAgICAgaWYgKGhpZGVGVFBUcmVlVmlldykge1xuICAgICAgICAgICAgYXRvbS5wcm9qZWN0LnJlbW90ZWZ0cC5vbmNlKCdjb25uZWN0ZWQnLCAoKSA9PiB7XG4gICAgICAgICAgICAgIHJlbW90ZWZ0cC50cmVlVmlldy50b2dnbGUoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9LFxuICAgIH0sXG4gICAgJ3JlbW90ZS1mdHA6ZGlzY29ubmVjdCc6IHtcbiAgICAgIGVuYWJsZWQ6IHRydWUsXG4gICAgICBjb21tYW5kKCkge1xuICAgICAgICBpZiAoIWhhc1Byb2plY3QoKSkgcmV0dXJuO1xuXG4gICAgICAgIGNsaWVudC5kaXNjb25uZWN0KCk7XG4gICAgICB9LFxuICAgIH0sXG4gICAgJ3JlbW90ZS1mdHA6YWRkLWZpbGUnOiB7XG4gICAgICBlbmFibGVkOiB0cnVlLFxuICAgICAgY29tbWFuZCgpIHtcbiAgICAgICAgaWYgKCFoYXNQcm9qZWN0KCkpIHJldHVybjtcbiAgICAgICAgY29uc3QgcmVtb3RlcyA9IGdldFJlbW90ZXMoJ1lvdSBuZWVkIHRvIHNlbGVjdCBhIGZvbGRlciBmaXJzdCcpO1xuICAgICAgICBpZiAocmVtb3RlcyA9PT0gZmFsc2UpIHJldHVybjtcbiAgICAgICAgaWYgKCEocmVtb3Rlc1swXSBpbnN0YW5jZW9mIERpcmVjdG9yeVZpZXcpKSB7XG4gICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKGBSZW1vdGUgRlRQOiBDYW5ub3QgYWRkIGEgZmlsZSB0byAke3JlbW90ZXNbMF0uaXRlbS5yZW1vdGV9YCwge1xuICAgICAgICAgICAgZGlzbWlzc2FibGU6IGZhbHNlLFxuICAgICAgICAgIH0pO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBkaWFsb2cgPSBuZXcgQWRkRGlhbG9nKCcnLCB0cnVlKTtcbiAgICAgICAgZGlhbG9nLm9uKCduZXctcGF0aCcsIChlLCBuYW1lKSA9PiB7XG4gICAgICAgICAgY29uc3QgcmVtb3RlID0gUGF0aC5qb2luKHJlbW90ZXNbMF0uaXRlbS5yZW1vdGUsIG5hbWUpLnJlcGxhY2UoL1xcXFwvZywgJy8nKTtcbiAgICAgICAgICBkaWFsb2cuY2xvc2UoKTtcbiAgICAgICAgICBjbGllbnQubWtkaXIocmVtb3Rlc1swXS5pdGVtLnJlbW90ZSwgdHJ1ZSwgKCkgPT4ge1xuICAgICAgICAgICAgY2xpZW50Lm1rZmlsZShyZW1vdGUsIChlcnIpID0+IHtcbiAgICAgICAgICAgICAgcmVtb3Rlc1swXS5vcGVuKCk7XG4gICAgICAgICAgICAgIGlmICghZXJyKSBhdG9tLndvcmtzcGFjZS5vcGVuKGNsaWVudC50b0xvY2FsKHJlbW90ZSkpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGRpYWxvZy5hdHRhY2goKTtcbiAgICAgIH0sXG4gICAgfSxcbiAgICAncmVtb3RlLWZ0cDphZGQtZm9sZGVyJzoge1xuICAgICAgZW5hYmxlZDogdHJ1ZSxcbiAgICAgIGNvbW1hbmQoKSB7XG4gICAgICAgIGlmICghaGFzUHJvamVjdCgpKSByZXR1cm47XG5cbiAgICAgICAgY29uc3QgcmVtb3RlcyA9IGdldFJlbW90ZXMoJ1lvdSBuZWVkIHRvIHNlbGVjdCBhIGZvbGRlciBmaXJzdCcpO1xuICAgICAgICBpZiAocmVtb3RlcyA9PT0gZmFsc2UpIHJldHVybjtcbiAgICAgICAgaWYgKCEocmVtb3Rlc1swXSBpbnN0YW5jZW9mIERpcmVjdG9yeVZpZXcpKSB7XG4gICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKGBSZW1vdGUgRlRQOiBDYW5ub3QgYWRkIGEgZm9sZGVyIHRvICR7cmVtb3Rlc1swXS5pdGVtLnJlbW90ZX1gLCB7XG4gICAgICAgICAgICBkaXNtaXNzYWJsZTogZmFsc2UsXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZGlhbG9nID0gbmV3IEFkZERpYWxvZygnJyk7XG5cbiAgICAgICAgZGlhbG9nLm9uKCduZXctcGF0aCcsIChlLCBuYW1lKSA9PiB7XG4gICAgICAgICAgY29uc3QgcmVtb3RlID0gUGF0aC5qb2luKHJlbW90ZXNbMF0uaXRlbS5yZW1vdGUsIG5hbWUpXG4gICAgICAgICAgICAucmVwbGFjZSgvXFxcXC9nLCAnLycpO1xuICAgICAgICAgIGNsaWVudC5ta2RpcihyZW1vdGUsIHRydWUsICgpID0+IHtcbiAgICAgICAgICAgIGRpYWxvZy5jbG9zZSgpO1xuICAgICAgICAgICAgcmVtb3Rlc1swXS5vcGVuKCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICBkaWFsb2cuYXR0YWNoKCk7XG4gICAgICB9LFxuICAgIH0sXG4gICAgJ3JlbW90ZS1mdHA6cmVmcmVzaC1zZWxlY3RlZCc6IHtcbiAgICAgIGVuYWJsZWQ6IHRydWUsXG4gICAgICBjb21tYW5kKCkge1xuICAgICAgICBpZiAoIWhhc1Byb2plY3QoKSkgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IHJlbW90ZXMgPSBnZXRSZW1vdGVzKCdZb3UgbmVlZCB0byBzZWxlY3QgYSBmb2xkZXIgZmlyc3QnKTtcbiAgICAgICAgaWYgKHJlbW90ZXMgPT09IGZhbHNlKSByZXR1cm47XG5cbiAgICAgICAgcmVtb3Rlcy5mb3JFYWNoKChyZW1vdGUpID0+IHtcbiAgICAgICAgICByZW1vdGUub3BlbigpO1xuICAgICAgICB9KTtcbiAgICAgIH0sXG4gICAgfSxcbiAgICAncmVtb3RlLWZ0cDptb3ZlLXNlbGVjdGVkJzoge1xuICAgICAgZW5hYmxlZDogdHJ1ZSxcbiAgICAgIGNvbW1hbmQoKSB7XG4gICAgICAgIGlmICghaGFzUHJvamVjdCgpKSByZXR1cm47XG5cbiAgICAgICAgY29uc3QgcmVtb3RlcyA9IGdldFJlbW90ZXMoJ1lvdSBuZWVkIHRvIHNlbGVjdCBhIGZvbGRlciBmaXJzdCcpO1xuICAgICAgICBpZiAocmVtb3RlcyA9PT0gZmFsc2UpIHJldHVybjtcblxuICAgICAgICBjb25zdCBkaWFsb2cgPSBuZXcgTW92ZURpYWxvZyhyZW1vdGVzWzBdLml0ZW0ucmVtb3RlKTtcblxuICAgICAgICBkaWFsb2cub24oJ3BhdGgtY2hhbmdlZCcsIChlLCBuZXdyZW1vdGUpID0+IHtcbiAgICAgICAgICBjbGllbnQucmVuYW1lKHJlbW90ZXNbMF0uaXRlbS5yZW1vdGUsIG5ld3JlbW90ZSwgKGVycikgPT4ge1xuICAgICAgICAgICAgY29uc3QgZXJyTWVzc2FnZSA9IGdldE9iamVjdCh7XG4gICAgICAgICAgICAgIG9iajogZXJyLFxuICAgICAgICAgICAgICBrZXlzOiBbJ21lc3NhZ2UnXSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgZGlhbG9nLmNsb3NlKCk7XG4gICAgICAgICAgICBpZiAoZXJyTWVzc2FnZSA9PT0gJ2ZpbGUgZXhpc3RzJyB8fCBlcnJNZXNzYWdlID09PSAnRmlsZSBhbHJlYWR5IGV4aXN0cycpIHtcbiAgICAgICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKCdSZW1vdGUgRlRQOiBGaWxlIC8gRm9sZGVyIGFscmVhZHkgZXhpc3RzJywge1xuICAgICAgICAgICAgICAgIGRpc21pc3NhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHBhcmVudE5ldyA9IHJlbW90ZWZ0cC50cmVlVmlldy5yZXNvbHZlKFBhdGguZGlybmFtZShuZXdyZW1vdGUpKTtcbiAgICAgICAgICAgIGlmIChwYXJlbnROZXcpIHBhcmVudE5ldy5vcGVuKCk7XG4gICAgICAgICAgICBjb25zdCBwYXJlbnRPbGQgPSByZW1vdGVmdHAudHJlZVZpZXcucmVzb2x2ZShQYXRoLmRpcm5hbWUocmVtb3Rlc1swXS5pdGVtLnJlbW90ZSkpO1xuICAgICAgICAgICAgaWYgKHBhcmVudE9sZCAmJiBwYXJlbnRPbGQgIT09IHBhcmVudE5ldykgcGFyZW50T2xkLm9wZW4oKTtcbiAgICAgICAgICAgIHJlbW90ZXNbMF0uZGVzdHJveSgpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgZGlhbG9nLmF0dGFjaCgpO1xuICAgICAgfSxcbiAgICB9LFxuICAgICdyZW1vdGUtZnRwOmRlbGV0ZS1zZWxlY3RlZCc6IHtcbiAgICAgIGVuYWJsZWQ6IHRydWUsXG4gICAgICBjb21tYW5kKCkge1xuICAgICAgICBpZiAoIWhhc1Byb2plY3QoKSkgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IHJlbW90ZXMgPSBnZXRSZW1vdGVzKCdZb3UgbmVlZCB0byBzZWxlY3QgYSBmb2xkZXIgZmlyc3QnKTtcbiAgICAgICAgaWYgKHJlbW90ZXMgPT09IGZhbHNlKSByZXR1cm47XG5cbiAgICAgICAgYXRvbS5jb25maXJtKHtcbiAgICAgICAgICBtZXNzYWdlOiAnQXJlIHlvdSBzdXJlIHlvdSB3YW50IHRvIGRlbGV0ZSB0aGUgc2VsZWN0ZWQgaXRlbSA/JyxcbiAgICAgICAgICBkZXRhaWxlZE1lc3NhZ2U6IGBZb3UgYXJlIGRlbGV0aW5nOiR7cmVtb3Rlcy5tYXAodmlldyA9PiBgXFxuICAke3ZpZXcuaXRlbS5yZW1vdGV9YCl9YCxcbiAgICAgICAgICBidXR0b25zOiB7XG4gICAgICAgICAgICAnTW92ZSB0byBUcmFzaCc6IGZ1bmN0aW9uIE1PVkVUT1RSQVNIKCkge1xuICAgICAgICAgICAgICByZW1vdGVzLmZvckVhY2goKHZpZXcpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoIXZpZXcpIHJldHVybjtcblxuICAgICAgICAgICAgICAgIGNvbnN0IGRpciA9IFBhdGguZGlybmFtZSh2aWV3Lml0ZW0ucmVtb3RlKVxuICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcXFwvZywgJy8nKTtcbiAgICAgICAgICAgICAgICBjb25zdCBwYXJlbnQgPSByZW1vdGVmdHAudHJlZVZpZXcucmVzb2x2ZShkaXIpO1xuXG4gICAgICAgICAgICAgICAgY2xpZW50LmRlbGV0ZSh2aWV3Lml0ZW0ucmVtb3RlLCAoZXJyKSA9PiB7XG4gICAgICAgICAgICAgICAgICBpZiAoIWVyciAmJiBwYXJlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50Lm9wZW4oKTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgQ2FuY2VsOiBudWxsLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgICAgfSxcbiAgICB9LFxuICAgICdyZW1vdGUtZnRwOmRvd25sb2FkLXNlbGVjdGVkJzoge1xuICAgICAgZW5hYmxlZDogdHJ1ZSxcbiAgICAgIGNvbW1hbmQoKSB7XG4gICAgICAgIGlmICghaGFzUHJvamVjdCgpKSByZXR1cm47XG5cbiAgICAgICAgY29uc3QgcmVtb3RlcyA9IGdldFJlbW90ZXMoJ1lvdSBuZWVkIHRvIHNlbGVjdCBhIGZvbGRlciBmaXJzdCcpO1xuICAgICAgICBpZiAocmVtb3RlcyA9PT0gZmFsc2UpIHJldHVybjtcblxuICAgICAgICByZW1vdGVzLmZvckVhY2goKHZpZXcpID0+IHtcbiAgICAgICAgICBpZiAoIXZpZXcpIHJldHVybjtcblxuICAgICAgICAgIGNsaWVudC5kb3dubG9hZCh2aWV3Lml0ZW0ucmVtb3RlLCB0cnVlLCAoKSA9PiB7XG5cbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9LFxuICAgIH0sXG4gICAgJ3JlbW90ZS1mdHA6ZG93bmxvYWQtc2VsZWN0ZWQtbG9jYWwnOiB7XG4gICAgICBlbmFibGVkOiB0cnVlLFxuICAgICAgY29tbWFuZCgpIHtcbiAgICAgICAgaWYgKCFoYXNQcm9qZWN0KCkpIHJldHVybjtcbiAgICAgICAgaWYgKGNsaWVudC5yb290LmxvY2FsID09PSAnJykge1xuICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcignUmVtb3RlIEZUUDogWW91IG11c3QgZGVmaW5lIHlvdXIgbG9jYWwgcm9vdCBmb2xkZXIgaW4gdGhlIHByb2plY3RzIC5mdHBjb25maWcgZmlsZS4nLCB7XG4gICAgICAgICAgICBkaXNtaXNzYWJsZTogZmFsc2UsXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFjbGllbnQuaXNDb25uZWN0ZWQoKSkge1xuICAgICAgICAgIC8vIGp1c3QgY29ubmVjdFxuICAgICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlKSwgJ3JlbW90ZS1mdHA6Y29ubmVjdCcpO1xuXG4gICAgICAgICAgY2xpZW50Lm9uY2UoJ2Nvbm5lY3RlZCcsICgpID0+IHtcbiAgICAgICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlKSwgJ3JlbW90ZS1mdHA6ZG93bmxvYWQtc2VsZWN0ZWQtbG9jYWwnKTtcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChhdG9tLmNvbmZpZy5nZXQoJ1JlbW90ZS1GVFAuZW5hYmxlVHJhbnNmZXJOb3RpZmljYXRpb25zJykpIHtcbiAgICBcdFx0Ly8gVE9ETzogY29ycmVjdGx5IGNvdW50IGZpbGVzIHdpdGhpbiBhIHN1YmRpcmVjdG9yeVxuICAgIFx0XHR2YXIgcmVxdWVzdGVkVHJhbnNmZXJzID0gMDtcbiAgICBcdFx0dmFyIHN1Y2Nlc3NmdWxUcmFuc2ZlcnMgPSAwO1xuICAgIFx0XHR2YXIgYXR0ZW1wdGVkVHJhbnNmZXJzID0gMDtcblxuICAgIFx0XHQkKCcudHJlZS12aWV3IC5zZWxlY3RlZCcpLm1hcCgoKSA9PiB7XG4gICAgXHRcdFx0cmVxdWVzdGVkVHJhbnNmZXJzKys7XG4gICAgXHRcdH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgJCgnLnRyZWUtdmlldyAuc2VsZWN0ZWQnKS5lYWNoKGZ1bmN0aW9uIE1BUCgpIHtcbiAgICAgICAgICBjb25zdCBwYXRoID0gdGhpcy5nZXRQYXRoID8gdGhpcy5nZXRQYXRoKCkgOiAnJztcbiAgICAgICAgICBjb25zdCBsb2NhbFBhdGggPSBwYXRoLnJlcGxhY2UoY2xpZW50LnJvb3QubG9jYWwsICcnKTtcbiAgICAgICAgICAvLyBpZiB0aGlzIGlzIHdpbmRvd3MsIHRoZSBwYXRoIG1heSBoYXZlIFxcIGluc3RlYWQgb2YgLyBhcyBkaXJlY3Rvcnkgc2VwYXJhdG9yc1xuICAgICAgICAgIGNvbnN0IHJlbW90ZVBhdGggPSBhdG9tLnByb2plY3QucmVtb3RlZnRwLnJvb3QucmVtb3RlICsgbG9jYWxQYXRoLnJlcGxhY2UoL1xcXFwvZywgJy8nKTtcbiAgICAgICAgICBjbGllbnQuZG93bmxvYWQocmVtb3RlUGF0aCwgdHJ1ZSwgKCkgPT4ge1xuICAgICAgICAgICAgaWYgKGF0b20uY29uZmlnLmdldCgnUmVtb3RlLUZUUC5lbmFibGVUcmFuc2Zlck5vdGlmaWNhdGlvbnMnKSkge1xuICAgICAgICAgICAgICAgIC8vIFRPRE86IGNoZWNrIGlmIGFueSBlcnJvcnMgd2VyZSB0aHJvd24sIGluZGljYXRpbmcgYW4gdW5zdWNjZXNzZnVsIHRyYW5zZmVyXG4gICAgICAgICAgICAgIGF0dGVtcHRlZFRyYW5zZmVycysrO1xuICAgICAgICAgICAgICBzdWNjZXNzZnVsVHJhbnNmZXJzKys7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmIChhdG9tLmNvbmZpZy5nZXQoJ1JlbW90ZS1GVFAuZW5hYmxlVHJhbnNmZXJOb3RpZmljYXRpb25zJykpIHtcbiAgICAgICAgICB2YXIgd2FpdGluZ0ZvclRyYW5zZmVycyA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgICAgIGlmIChhdHRlbXB0ZWRUcmFuc2ZlcnMgPT0gcmVxdWVzdGVkVHJhbnNmZXJzKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHdlJ3JlIGRvbmUgd2FpdGluZ1xuICAgICAgICAgICAgICBjbGVhckludGVydmFsKHdhaXRpbmdGb3JUcmFuc2ZlcnMpO1xuICAgICAgICAgICAgICBpZiAoc3VjY2Vzc2Z1bFRyYW5zZmVycyA9PSByZXF1ZXN0ZWRUcmFuc2ZlcnMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGdyZWF0LCBhbGwgdXBsb2FkcyB3b3JrZWRcbiAgICAgICAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkU3VjY2VzcyhgUmVtb3RlIEZUUDogQWxsIHRyYW5zZmVycyBzdWNjZWVkZWQgKCR7c3VjY2Vzc2Z1bFRyYW5zZmVyc30gb2YgJHtyZXF1ZXN0ZWRUcmFuc2ZlcnN9KS5gKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIDooIHNvbWUgdXBsb2FkcyBmYWlsZWRcbiAgICAgICAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoYFJlbW90ZSBGVFA6IFNvbWUgdHJhbnNmZXJzIGZhaWxlZDxiciAvPlRoZXJlIHdlcmUgJHtzdWNjZXNzZnVsVHJhbnNmZXJzfSBzdWNjZXNzZnVsIG91dCBvZiBhbiBleHBlY3RlZCAke3JlcXVlc3RlZFRyYW5zZmVyc30uYCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LCAyMDApO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuO1xuICAgICAgfSxcbiAgICB9LFxuICAgICdyZW1vdGUtZnRwOnVwbG9hZC1zZWxlY3RlZCc6IHtcbiAgICAgIGVuYWJsZWQ6IHRydWUsXG4gICAgICBjb21tYW5kKCkge1xuICAgICAgICBpZiAoIWhhc1Byb2plY3QoKSkgcmV0dXJuO1xuXG4gICAgICAgIGlmICghY2xpZW50LmlzQ29ubmVjdGVkKCkpIHtcbiAgICAgICAgICAvLyBqdXN0IGNvbm5lY3RcbiAgICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKGF0b20udmlld3MuZ2V0VmlldyhhdG9tLndvcmtzcGFjZSksICdyZW1vdGUtZnRwOmNvbm5lY3QnKTtcblxuICAgICAgICAgIGF0b20ucHJvamVjdC5yZW1vdGVmdHAub25jZSgnY29ubmVjdGVkJywgKCkgPT4ge1xuICAgICAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChhdG9tLnZpZXdzLmdldFZpZXcoYXRvbS53b3Jrc3BhY2UpLCAncmVtb3RlLWZ0cDp1cGxvYWQtc2VsZWN0ZWQnKTtcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGxvY2FscyA9ICQoJy50cmVlLXZpZXcgLnNlbGVjdGVkJykubWFwKGZ1bmN0aW9uIE1BUCgpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5nZXRQYXRoID8gdGhpcy5nZXRQYXRoKCkgOiAnJztcbiAgICAgICAgfSlcbiAgICAgICAgLmdldCgpO1xuXG4gICAgICAgIGlmIChhdG9tLmNvbmZpZy5nZXQoJ1JlbW90ZS1GVFAuZW5hYmxlVHJhbnNmZXJOb3RpZmljYXRpb25zJykpIHtcbiAgICAgICAgICB2YXIgc3VjY2Vzc2Z1bFRyYW5zZmVycyA9IDA7XG4gICAgICAgICAgdmFyIGF0dGVtcHRlZFRyYW5zZmVycyA9IDA7XG4gICAgICAgIH1cblxuICAgICAgICBsb2NhbHMuZm9yRWFjaCgobG9jYWwpID0+IHtcbiAgICAgICAgICBpZiAoIWxvY2FsKSByZXR1cm47XG5cbiAgICAgICAgICBjbGllbnQudXBsb2FkKGxvY2FsLCAoZXJyLCBsaXN0KSA9PiB7XG4gICAgICAgICAgICBpZiAoYXRvbS5jb25maWcuZ2V0KCdSZW1vdGUtRlRQLmVuYWJsZVRyYW5zZmVyTm90aWZpY2F0aW9ucycpKSB7IGF0dGVtcHRlZFRyYW5zZmVycysrOyB9XG4gICAgICAgICAgICBpZiAoZXJyKSByZXR1cm47XG4gICAgICAgICAgICBpZiAoYXRvbS5jb25maWcuZ2V0KCdSZW1vdGUtRlRQLmVuYWJsZVRyYW5zZmVyTm90aWZpY2F0aW9ucycpKSB7IHN1Y2Nlc3NmdWxUcmFuc2ZlcnMrKzsgfVxuXG4gICAgICAgICAgICBjb25zdCBkaXJzID0gW107XG4gICAgICAgICAgICBsaXN0LmZvckVhY2goKGl0ZW0pID0+IHtcbiAgICAgICAgICAgICAgY29uc3QgcmVtb3RlID0gY2xpZW50LnRvUmVtb3RlKGl0ZW0ubmFtZSk7XG4gICAgICAgICAgICAgIGNvbnN0IGRpciA9IFBhdGguZGlybmFtZShyZW1vdGUpO1xuICAgICAgICAgICAgICBpZiAoZGlycy5pbmRleE9mKGRpcikgPT09IC0xKSBkaXJzLnB1c2goZGlyKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBkaXJzLmZvckVhY2goKGRpcikgPT4ge1xuICAgICAgICAgICAgICBjb25zdCB2aWV3ID0gcmVtb3RlZnRwLnRyZWVWaWV3LnJlc29sdmUoZGlyKTtcbiAgICAgICAgICAgICAgaWYgKHZpZXcpIHZpZXcub3BlbigpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmIChhdG9tLmNvbmZpZy5nZXQoJ1JlbW90ZS1GVFAuZW5hYmxlVHJhbnNmZXJOb3RpZmljYXRpb25zJykpIHtcbiAgICAgICAgICB2YXIgd2FpdGluZ0ZvclRyYW5zZmVycyA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgICAgIGlmIChhdHRlbXB0ZWRUcmFuc2ZlcnMgPT0gbG9jYWxzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAvLyB3ZSdyZSBkb25lIHdhaXRpbmdcbiAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbCh3YWl0aW5nRm9yVHJhbnNmZXJzKTtcbiAgICAgICAgICAgICAgaWYgKHN1Y2Nlc3NmdWxUcmFuc2ZlcnMgPT0gbG9jYWxzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gZ3JlYXQsIGFsbCB1cGxvYWRzIHdvcmtlZFxuICAgICAgICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRTdWNjZXNzKGBSZW1vdGUgRlRQOiBBbGwgdHJhbnNmZXJzIHN1Y2NlZWRlZCAoJHtzdWNjZXNzZnVsVHJhbnNmZXJzfSBvZiAke2xvY2Fscy5sZW5ndGh9KS5gKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIDooIHNvbWUgdXBsb2FkcyBmYWlsZWRcbiAgICAgICAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoYFJlbW90ZSBGVFA6IFNvbWUgdHJhbnNmZXJzIGZhaWxlZDxiciAvPlRoZXJlIHdlcmUgJHtzdWNjZXNzZnVsVHJhbnNmZXJzfSBzdWNjZXNzZnVsIG91dCBvZiBhbiBleHBlY3RlZCAke2xvY2Fscy5sZW5ndGh9LmApO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSwgMjAwKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICB9LFxuICAgICdyZW1vdGUtZnRwOnVwbG9hZC1hY3RpdmUnOiB7XG4gICAgICBlbmFibGVkOiB0cnVlLFxuICAgICAgY29tbWFuZCgpIHtcbiAgICAgICAgaWYgKCFoYXNQcm9qZWN0KCkpIHJldHVybjtcblxuICAgICAgICBjb25zdCBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lSXRlbSgpO1xuICAgICAgICBpZiAoIWVkaXRvcikgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IGxvY2FsID0gZWRpdG9yLmdldFBhdGgoKTtcblxuICAgICAgICBjbGllbnQudXBsb2FkKGxvY2FsLCAoZXJyLCBsaXN0KSA9PiB7XG4gICAgICAgICAgaWYgKGVycikgcmV0dXJuO1xuXG4gICAgICAgICAgY29uc3QgZGlycyA9IFtdO1xuICAgICAgICAgIGxpc3QuZm9yRWFjaCgoaXRlbSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgcmVtb3RlID0gYXRvbS5wcm9qZWN0LnJlbW90ZWZ0cC50b1JlbW90ZShpdGVtLm5hbWUpO1xuICAgICAgICAgICAgY29uc3QgZGlyID0gUGF0aC5kaXJuYW1lKHJlbW90ZSk7XG4gICAgICAgICAgICBpZiAoZGlycy5pbmRleE9mKGRpcikgPT09IC0xKSBkaXJzLnB1c2goZGlyKTtcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIGRpcnMuZm9yRWFjaCgoZGlyKSA9PiB7XG4gICAgICAgICAgICBjb25zdCB2aWV3ID0gcmVtb3RlZnRwLnRyZWVWaWV3LnJlc29sdmUoZGlyKTtcbiAgICAgICAgICAgIGlmICh2aWV3KSB2aWV3Lm9wZW4oKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9LFxuICAgIH0sXG4gICAgLy8gUmVtb3RlIC0+IExvY2FsXG4gICAgJ3JlbW90ZS1mdHA6c3luYy13aXRoLXJlbW90ZSc6IHtcbiAgICAgIGVuYWJsZWQ6IHRydWUsXG4gICAgICBjb21tYW5kKCkge1xuICAgICAgICBjb25zdCByZW1vdGVzID0gcmVtb3RlZnRwLnRyZWVWaWV3LmdldFNlbGVjdGVkKCk7XG5cbiAgICAgICAgcmVtb3Rlcy5mb3JFYWNoKCh2aWV3KSA9PiB7XG4gICAgICAgICAgaWYgKCF2aWV3KSByZXR1cm47XG4gICAgICAgICAgY29uc3QgaXNGaWxlID0gdmlldy5pdGVtIGluc3RhbmNlb2YgRmlsZTtcbiAgICAgICAgICBjbGllbnQuc3luY1JlbW90ZUxvY2FsKHZpZXcuaXRlbS5yZW1vdGUsIGlzRmlsZSwgKCkgPT4ge1xuXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfSxcbiAgICB9LFxuXG4gICAgLy8gTG9jYWwgLT4gUmVtb3RlXG4gICAgJ3JlbW90ZS1mdHA6c3luYy13aXRoLWxvY2FsJzoge1xuICAgICAgZW5hYmxlZDogdHJ1ZSxcbiAgICAgIGNvbW1hbmQoKSB7XG4gICAgICAgIGlmICghaGFzUHJvamVjdCgpKSByZXR1cm47XG5cbiAgICAgICAgY29uc3QgbG9jYWxzID0gJCgnLnRyZWUtdmlldyAuc2VsZWN0ZWQnKS5tYXAoZnVuY3Rpb24gTUFQKCkge1xuICAgICAgICAgIHJldHVybiB0aGlzLmdldFBhdGggPyB0aGlzLmdldFBhdGgoKSA6ICcnO1xuICAgICAgICB9KVxuICAgICAgICAuZ2V0KCk7XG5cbiAgICAgICAgbG9jYWxzLmZvckVhY2goKGxvY2FsKSA9PiB7XG4gICAgICAgICAgaWYgKCFsb2NhbCkgcmV0dXJuO1xuXG4gICAgICAgICAgY2xpZW50LnN5bmNMb2NhbFJlbW90ZShsb2NhbCwgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgcmVtb3RlID0gY2xpZW50LnRvUmVtb3RlKGxvY2FsKTtcbiAgICAgICAgICAgIGlmIChyZW1vdGUpIHtcbiAgICAgICAgICAgICAgbGV0IHBhcmVudCA9IHJlbW90ZWZ0cC50cmVlVmlldy5yZXNvbHZlKHJlbW90ZSk7XG4gICAgICAgICAgICAgIGlmIChwYXJlbnQgJiYgIShwYXJlbnQuaXRlbSBpbnN0YW5jZW9mIERpcmVjdG9yeSkpIHtcbiAgICAgICAgICAgICAgICBwYXJlbnQgPSByZW1vdGVmdHAudHJlZVZpZXcucmVzb2x2ZShQYXRoLmRpcm5hbWUocmVtb3RlKS5yZXBsYWNlKC9cXFxcL2csICcvJykpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGlmIChwYXJlbnQpIHBhcmVudC5vcGVuKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfSxcbiAgICB9LFxuICAgICdyZW1vdGUtZnRwOmFib3J0LWN1cnJlbnQnOiB7XG4gICAgICBlbmFibGVkOiB0cnVlLFxuICAgICAgY29tbWFuZCgpIHtcbiAgICAgICAgaWYgKCFoYXNQcm9qZWN0KCkpIHJldHVybjtcbiAgICAgICAgY2xpZW50LmFib3J0KCk7XG4gICAgICB9LFxuICAgIH0sXG4gICAgJ3JlbW90ZS1mdHA6bmF2aWdhdGUtdG8nOiB7XG4gICAgICBlbmFibGVkOiB0cnVlLFxuICAgICAgY29tbWFuZCgpIHtcbiAgICAgICAgaWYgKCFoYXNQcm9qZWN0KCkpIHJldHVybjtcbiAgICAgICAgY29uc3QgZGlhbG9nID0gbmV3IE5hdmlnYXRlVG8oKTtcbiAgICAgICAgZGlhbG9nLm9uKCduYXZpZ2F0ZS10bycsIChlLCBwYXRoKSA9PiB7XG4gICAgICAgICAgZGlhbG9nLmNsb3NlKCk7XG4gICAgICAgICAgY2xpZW50LnJvb3Qub3BlblBhdGgocGF0aCk7XG4gICAgICAgIH0pO1xuICAgICAgICBkaWFsb2cuYXR0YWNoKCk7XG4gICAgICB9LFxuICAgIH0sXG4gICAgJ3JlbW90ZS1mdHA6Y29weS1uYW1lJzoge1xuICAgICAgZW5hYmxlZDogdHJ1ZSxcbiAgICAgIGNvbW1hbmQoKSB7XG4gICAgICAgIGlmICghaGFzUHJvamVjdCgpKSByZXR1cm47XG4gICAgICAgIGNvbnN0IHJlbW90ZXMgPSByZW1vdGVmdHAudHJlZVZpZXcuZ2V0U2VsZWN0ZWQoKTtcbiAgICAgICAgaWYgKCFyZW1vdGVzIHx8IHJlbW90ZXMubGVuZ3RoID09PSAwKSByZXR1cm47XG4gICAgICAgIGNvbnN0IG5hbWUgPSBgJHtyZW1vdGVzLm1hcChkYXRhID0+IGRhdGEuaXRlbS5uYW1lKX1gO1xuICAgICAgICBhdG9tLmNsaXBib2FyZC53cml0ZShuYW1lKTtcbiAgICAgIH0sXG4gICAgfSxcblxuICB9O1xuXG4gIHJldHVybiBjb21tYW5kcztcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGluaXQ7XG4iXX0=