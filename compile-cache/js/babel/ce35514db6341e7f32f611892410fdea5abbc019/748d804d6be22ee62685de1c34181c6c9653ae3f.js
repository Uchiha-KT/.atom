Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _fsPlus = require('fs-plus');

var _fsPlus2 = _interopRequireDefault(_fsPlus);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _client = require('./client');

var _client2 = _interopRequireDefault(_client);

var _viewsTreeView = require('./views/tree-view');

var _viewsTreeView2 = _interopRequireDefault(_viewsTreeView);

var _helpers = require('./helpers');

var _menusMain = require('./menus/main');

var _menusMain2 = _interopRequireDefault(_menusMain);

var _atom = require('atom');

'use babel';

var atom = global.atom;
var config = require('./config-schema.json');

var Main = (function () {
  function Main() {
    _classCallCheck(this, Main);

    var self = this;
    self.config = config;
    self.treeView = null;
    self.client = null;
    self.listeners = [];
  }

  _createClass(Main, [{
    key: 'activate',
    value: function activate() {
      var self = this;

      self.client = new _client2['default']();
      atom.project['remoteftp-main'] = self; // change remoteftp to object containing client and main?
      atom.project.remoteftp = self.client;
      self.treeView = new _viewsTreeView2['default']();

      self.treeView.detach();

      self.client.on('connected', function () {
        self.treeView.root.name.attr('data-name', _path2['default'].basename(self.client.root.remote));
        self.treeView.root.name.attr('data-path', self.client.root.remote);
      });

      // NOTE: if there is a project folder & show view on startup
      //  is true, show the Remote FTP sidebar

      if ((0, _helpers.hasProject)()) {
        // NOTE: setTimeout is for when multiple hosts option is true
        setTimeout(function () {
          _fsPlus2['default'].exists(self.client.getConfigPath(), function (exists) {
            if (exists && atom.config.get('Remote-FTP.showViewOnStartup')) {
              self.treeView.attach();
            }
          });
        }, 0);
      }

      // NOTE: Adds commands to context menus and atom.commands
      (0, _menusMain2['default'])();

      atom.workspace.observeTextEditors(function (ed) {
        var buffer = ed.buffer;
        var listener = buffer.onDidSave(self.fileSaved.bind(self));
        self.listeners.push(listener);
      });

      self.listeners.push(atom.project.onDidChangePaths(function () {
        if (!(0, _helpers.hasProject)() || !self.client.isConnected()) return;
        atom.commands.dispatch(atom.views.getView(atom.workspace), 'remote-ftp:disconnect');
        atom.commands.dispatch(atom.views.getView(atom.workspace), 'remote-ftp:connect');
      }));
    }
  }, {
    key: 'deactivate',
    value: function deactivate() {
      var self = this;
      self.listeners.forEach(function (listener) {
        return listener.dispose();
      });
      self.listeners = [];
      if (self.client) self.client.disconnect();
    }
  }, {
    key: 'fileSaved',
    value: function fileSaved(text) {
      var self = this;
      if (!(0, _helpers.hasProject)()) return;

      if (atom.config.get('Remote-FTP.autoUploadOnSave') === 'never') return;

      if (!self.client.isConnected() && atom.config.get('Remote-FTP.autoUploadOnSave') !== 'always') return;

      var local = text.path;

      if (!atom.project.contains(local)) return;
      if (self.client.ftpConfigPath !== self.client.getConfigPath()) return;

      if (local === self.client.getConfigPath()) return;
      // TODO: Add fix for files which are uploaded from a glob selector
      // don't upload files watched, they will be uploaded by the watcher
      // doesn't work fully with new version of watcher
      if (self.client.watch.files.indexOf(local) >= 0) return;

      self.client.upload(local, function () {
        try {
          var remote = self.client.toRemote(local);
          var _parent = self.client.resolve(_path2['default'].dirname(remote).replace(/\\/g, '/'));
          if (_parent) _parent.open();
        } catch (e) {}
      });
    }
  }, {
    key: 'consumeElementIcons',
    value: function consumeElementIcons(fn) {
      (0, _helpers.setIconHandler)(fn);
      return new _atom.Disposable(function () {
        (0, _helpers.setIconHandler)(null);
      });
    }
  }]);

  return Main;
})();

exports['default'] = new Main();
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGU6Ly8vQzovVXNlcnMvdWNoaWhhLy5hdG9tL3BhY2thZ2VzL1JlbW90ZS1GVFAvbGliL3JlbW90ZS1mdHAuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztzQkFFZSxTQUFTOzs7O29CQUNQLE1BQU07Ozs7c0JBQ0osVUFBVTs7Ozs2QkFDUixtQkFBbUI7Ozs7dUJBSWpDLFdBQVc7O3lCQUNPLGNBQWM7Ozs7b0JBRVosTUFBTTs7QUFaakMsV0FBVyxDQUFDOztBQWFaLElBQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUM7QUFDekIsSUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLHNCQUFzQixDQUFDLENBQUM7O0lBRXpDLElBQUk7QUFFRyxXQUZQLElBQUksR0FFTTswQkFGVixJQUFJOztBQUdOLFFBQU0sSUFBSSxHQUFHLElBQUksQ0FBQztBQUNsQixRQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztBQUNyQixRQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztBQUNyQixRQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztBQUNuQixRQUFJLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQztHQUNyQjs7ZUFSRyxJQUFJOztXQVVBLG9CQUFHO0FBQ1QsVUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDOztBQUVsQixVQUFJLENBQUMsTUFBTSxHQUFHLHlCQUFZLENBQUM7QUFDM0IsVUFBSSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLElBQUksQ0FBQztBQUN0QyxVQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO0FBQ3JDLFVBQUksQ0FBQyxRQUFRLEdBQUcsZ0NBQWMsQ0FBQzs7QUFFL0IsVUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQzs7QUFHdkIsVUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsV0FBVyxFQUFFLFlBQU07QUFDaEMsWUFBSSxDQUFD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O0FBQzFDLFVBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxhQUFhLEtBQUssSUFBSSxDQUFDLE1BQU0sQ0FBQyxhQUFhLEVBQUUsRUFBRSxPQUFPOztBQUV0RSxVQUFJLEtBQUssS0FBSyxJQUFJLENBQUMsTUFBTSxDQUFDLGFBQWEsRUFBRSxFQUFFLE9BQU87Ozs7QUFJbEQsVUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRSxPQUFPOztBQUV4RCxVQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsWUFBTTtBQUM5QixZQUFJO0FBQ0YsY0FBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDM0MsY0FBTSxPQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsa0JBQUssT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUNwRCxPQUFPLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDeEIsY0FBSSxPQUFNLEVBQUUsT0FBTSxDQUFDLElBQUksRUFBRSxDQUFDO1NBQzNCLENBQUMsT0FBTyxDQUFDLEVBQUUsRUFBRTtPQUNmLENBQUMsQ0FBQztLQUNKOzs7V0FFa0IsNkJBQUMsRUFBRSxFQUFFO0FBQ3RCLG1DQUFlLEVBQUUsQ0FBQyxDQUFDO0FBQ25CLGFBQU8scUJBQWUsWUFBTTtBQUMxQixxQ0FBZSxJQUFJLENBQUMsQ0FBQztPQUN0QixDQUFDLENBQUM7S0FDSjs7O1NBbEdHLElBQUk7OztxQkFzR0ssSUFBSSxJQUFJLEVBQUUiLCJmaWxlIjoiZmlsZTovLy9DOi9Vc2Vycy91Y2hpaGEvLmF0b20vcGFja2FnZXMvUmVtb3RlLUZUUC9saWIvcmVtb3RlLWZ0cC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5pbXBvcnQgRlMgZnJvbSAnZnMtcGx1cyc7XG5pbXBvcnQgUGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCBDbGllbnQgZnJvbSAnLi9jbGllbnQnO1xuaW1wb3J0IFRyZWVWaWV3IGZyb20gJy4vdmlld3MvdHJlZS12aWV3JztcbmltcG9ydCB7XG4gIGhhc1Byb2plY3QsXG4gIHNldEljb25IYW5kbGVyLFxufSBmcm9tICcuL2hlbHBlcnMnO1xuaW1wb3J0IGluaXRDb21tYW5kcyBmcm9tICcuL21lbnVzL21haW4nO1xuXG5pbXBvcnQgeyBEaXNwb3NhYmxlIH0gZnJvbSAnYXRvbSc7XG5jb25zdCBhdG9tID0gZ2xvYmFsLmF0b207XG5jb25zdCBjb25maWcgPSByZXF1aXJlKCcuL2NvbmZpZy1zY2hlbWEuanNvbicpO1xuXG5jbGFzcyBNYWluIHtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcbiAgICBzZWxmLmNvbmZpZyA9IGNvbmZpZztcbiAgICBzZWxmLnRyZWVWaWV3ID0gbnVsbDtcbiAgICBzZWxmLmNsaWVudCA9IG51bGw7XG4gICAgc2VsZi5saXN0ZW5lcnMgPSBbXTtcbiAgfVxuXG4gIGFjdGl2YXRlKCkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgc2VsZi5jbGllbnQgPSBuZXcgQ2xpZW50KCk7XG4gICAgYXRvbS5wcm9qZWN0WydyZW1vdGVmdHAtbWFpbiddID0gc2VsZjsgLy8gY2hhbmdlIHJlbW90ZWZ0cCB0byBvYmplY3QgY29udGFpbmluZyBjbGllbnQgYW5kIG1haW4/XG4gICAgYXRvbS5wcm9qZWN0LnJlbW90ZWZ0cCA9IHNlbGYuY2xpZW50O1xuICAgIHNlbGYudHJlZVZpZXcgPSBuZXcgVHJlZVZpZXcoKTtcblxuICAgIHNlbGYudHJlZVZpZXcuZGV0YWNoKCk7XG5cblxuICAgIHNlbGYuY2xpZW50Lm9uKCdjb25uZWN0ZWQnLCAoKSA9PiB7XG4gICAgICBzZWxmLnRyZWVWaWV3LnJvb3QubmFtZS5hdHRyKCdkYXRhLW5hbWUnLCBQYXRoLmJhc2VuYW1lKHNlbGYuY2xpZW50LnJvb3QucmVtb3RlKSk7XG4gICAgICBzZWxmLnRyZWVWaWV3LnJvb3QubmFtZS5hdHRyKCdkYXRhLXBhdGgnLCBzZWxmLmNsaWVudC5yb290LnJlbW90ZSk7XG4gICAgfSk7XG5cblxuICAgIC8vIE5PVEU6IGlmIHRoZXJlIGlzIGEgcHJvamVjdCBmb2xkZXIgJiBzaG93IHZpZXcgb24gc3RhcnR1cFxuICAgIC8vICBpcyB0cnVlLCBzaG93IHRoZSBSZW1vdGUgRlRQIHNpZGViYXJcblxuICAgIGlmIChoYXNQcm9qZWN0KCkpIHtcbiAgICAgIC8vIE5PVEU6IHNldFRpbWVvdXQgaXMgZm9yIHdoZW4gbXVsdGlwbGUgaG9zdHMgb3B0aW9uIGlzIHRydWVcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBGUy5leGlzdHMoc2VsZi5jbGllbnQuZ2V0Q29uZmlnUGF0aCgpLCAoZXhpc3RzKSA9PiB7XG4gICAgICAgICAgaWYgKGV4aXN0cyAmJiBhdG9tLmNvbmZpZy5nZXQoJ1JlbW90ZS1GVFAuc2hvd1ZpZXdPblN0YXJ0dXAnKSkge1xuICAgICAgICAgICAgc2VsZi50cmVlVmlldy5hdHRhY2goKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSwgMCk7XG4gICAgfVxuXG4gICAgLy8gTk9URTogQWRkcyBjb21tYW5kcyB0byBjb250ZXh0IG1lbnVzIGFuZCBhdG9tLmNvbW1hbmRzXG4gICAgaW5pdENvbW1hbmRzKCk7XG5cbiAgICBhdG9tLndvcmtzcGFjZS5vYnNlcnZlVGV4dEVkaXRvcnMoKGVkKSA9PiB7XG4gICAgICBjb25zdCBidWZmZXIgPSBlZC5idWZmZXI7XG4gICAgICBjb25zdCBsaXN0ZW5lciA9IGJ1ZmZlci5vbkRpZFNhdmUoc2VsZi5maWxlU2F2ZWQuYmluZChzZWxmKSk7XG4gICAgICBzZWxmLmxpc3RlbmVycy5wdXNoKGxpc3RlbmVyKTtcbiAgICB9KTtcblxuICAgIHNlbGYubGlzdGVuZXJzLnB1c2goYXRvbS5wcm9qZWN0Lm9uRGlkQ2hhbmdlUGF0aHMoKCkgPT4ge1xuICAgICAgaWYgKCFoYXNQcm9qZWN0KCkgfHwgIXNlbGYuY2xpZW50LmlzQ29ubmVjdGVkKCkpIHJldHVybjtcbiAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlKSwgJ3JlbW90ZS1mdHA6ZGlzY29ubmVjdCcpO1xuICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChhdG9tLnZpZXdzLmdldFZpZXcoYXRvbS53b3Jrc3BhY2UpLCAncmVtb3RlLWZ0cDpjb25uZWN0Jyk7XG4gICAgfSkpO1xuICB9XG5cbiAgZGVhY3RpdmF0ZSgpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcbiAgICBzZWxmLmxpc3RlbmVycy5mb3JFYWNoKGxpc3RlbmVyID0+IGxpc3RlbmVyLmRpc3Bvc2UoKSk7XG4gICAgc2VsZi5saXN0ZW5lcnMgPSBbXTtcbiAgICBpZiAoc2VsZi5jbGllbnQpIHNlbGYuY2xpZW50LmRpc2Nvbm5lY3QoKTtcbiAgfVxuXG4gIGZpbGVTYXZlZCh0ZXh0KSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgaWYgKCFoYXNQcm9qZWN0KCkpIHJldHVybjtcblxuICAgIGlmIChhdG9tLmNvbmZpZy5nZXQoJ1JlbW90ZS1GVFAuYXV0b1VwbG9hZE9uU2F2ZScpID09PSAnbmV2ZXInKSByZXR1cm47XG5cbiAgICBpZiAoIXNlbGYuY2xpZW50LmlzQ29ubmVjdGVkKCkgJiYgYXRvbS5jb25maWcuZ2V0KCdSZW1vdGUtRlRQLmF1dG9VcGxvYWRPblNhdmUnKSAhPT0gJ2Fsd2F5cycpIHJldHVybjtcblxuICAgIGNvbnN0IGxvY2FsID0gdGV4dC5wYXRoO1xuXG4gICAgaWYgKCFhdG9tLnByb2plY3QuY29udGFpbnMobG9jYWwpKSByZXR1cm47XG4gICAgaWYgKHNlbGYuY2xpZW50LmZ0cENvbmZpZ1BhdGggIT09IHNlbGYuY2xpZW50LmdldENvbmZpZ1BhdGgoKSkgcmV0dXJuO1xuXG4gICAgaWYgKGxvY2FsID09PSBzZWxmLmNsaWVudC5nZXRDb25maWdQYXRoKCkpIHJldHVybjtcbiAgICAvLyBUT0RPOiBBZGQgZml4IGZvciBmaWxlcyB3aGljaCBhcmUgdXBsb2FkZWQgZnJvbSBhIGdsb2Igc2VsZWN0b3JcbiAgICAvLyBkb24ndCB1cGxvYWQgZmlsZXMgd2F0Y2hlZCwgdGhleSB3aWxsIGJlIHVwbG9hZGVkIGJ5IHRoZSB3YXRjaGVyXG4gICAgLy8gZG9lc24ndCB3b3JrIGZ1bGx5IHdpdGggbmV3IHZlcnNpb24gb2Ygd2F0Y2hlclxuICAgIGlmIChzZWxmLmNsaWVudC53YXRjaC5maWxlcy5pbmRleE9mKGxvY2FsKSA+PSAwKSByZXR1cm47XG5cbiAgICBzZWxmLmNsaWVudC51cGxvYWQobG9jYWwsICgpID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlbW90ZSA9IHNlbGYuY2xpZW50LnRvUmVtb3RlKGxvY2FsKTtcbiAgICAgICAgY29uc3QgcGFyZW50ID0gc2VsZi5jbGllbnQucmVzb2x2ZShQYXRoLmRpcm5hbWUocmVtb3RlKVxuICAgICAgICAgIC5yZXBsYWNlKC9cXFxcL2csICcvJykpO1xuICAgICAgICBpZiAocGFyZW50KSBwYXJlbnQub3BlbigpO1xuICAgICAgfSBjYXRjaCAoZSkge31cbiAgICB9KTtcbiAgfVxuXG4gIGNvbnN1bWVFbGVtZW50SWNvbnMoZm4pIHtcbiAgICBzZXRJY29uSGFuZGxlcihmbik7XG4gICAgcmV0dXJuIG5ldyBEaXNwb3NhYmxlKCgpID0+IHtcbiAgICAgIHNldEljb25IYW5kbGVyKG51bGwpO1xuICAgIH0pO1xuICB9XG5cbn1cblxuZXhwb3J0IGRlZmF1bHQgbmV3IE1haW4oKTtcbiJdfQ==