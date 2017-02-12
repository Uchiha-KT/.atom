Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _atomSpacePenViews = require('atom-space-pen-views');

'use babel';

var atom = global.atom;

var Dialog = (function (_View) {
  _inherits(Dialog, _View);

  _createClass(Dialog, null, [{
    key: 'content',
    value: function content(opts) {
      var _this = this;

      var options = opts || {};
      return this.div({
        'class': 'tree-view-dialog overlay from-top'
      }, function () {
        _this.label(options.prompt, {
          'class': 'icon',
          outlet: 'text'
        });
        _this.subview('miniEditor', new _atomSpacePenViews.TextEditorView({
          mini: true
        }));
        _this.div({
          'class': 'error-message',
          outlet: 'error'
        });
      });
    }
  }]);

  function Dialog(opts) {
    var _this2 = this;

    _classCallCheck(this, Dialog);

    var options = opts || {};
    _get(Object.getPrototypeOf(Dialog.prototype), 'constructor', this).call(this, options);
    var self = this;

    this.prompt = options.prompt || '';
    this.initialPath = options.initialPath || '';
    this.select = options.select || false;
    this.iconClass = options.iconClass || '';

    if (this.iconClass) {
      this.text.addClass(this.iconClass);
    }

    atom.commands.add(this.element, {
      'core:confirm': function coreConfirm() {
        self.onConfirm(self.miniEditor.getText());
      },
      'core:cancel': function coreCancel() {
        self.cancel();
      }
    });

    this.miniEditor.on('blur', function () {
      _this2.close();
    });

    this.miniEditor.getModel().onDidChange(function () {
      _this2.showError();
    });

    if (this.initialPath) {
      this.miniEditor.getModel().setText(this.initialPath);
    }

    if (this.select) {
      var ext = _path2['default'].extname(this.initialPath);
      var _name = _path2['default'].basename(this.initialPath);
      var selEnd = undefined;
      if (_name === ext) {
        selEnd = this.initialPath.length;
      } else {
        selEnd = this.initialPath.length - ext.length;
      }
      var range = [[0, this.initialPath.length - _name.length], [0, selEnd]];
      this.miniEditor.getModel().setSelectedBufferRange(range);
    }
  }

  _createClass(Dialog, [{
    key: 'attach',
    value: function attach() {
      this.panel = atom.workspace.addModalPanel({ item: this.element });
      this.miniEditor.focus();
      this.miniEditor.getModel().scrollToCursorPosition();
    }
  }, {
    key: 'close',
    value: function close() {
      var destroyPanel = this.panel;
      this.panel = null;
      if (destroyPanel) {
        destroyPanel.destroy();
      }

      atom.workspace.getActivePane().activate();
    }
  }, {
    key: 'cancel',
    value: function cancel() {
      this.close();
      (0, _atomSpacePenViews.$)('.ftp-view').focus();
    }
  }, {
    key: 'showError',
    value: function showError(message) {
      this.error.text(message);
      if (message) {
        this.flashError();
      }
    }
  }]);

  return Dialog;
})(_atomSpacePenViews.View);

exports['default'] = Dialog;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGU6Ly8vQzovVXNlcnMvdWNoaWhhLy5hdG9tL3BhY2thZ2VzL1JlbW90ZS1GVFAvbGliL2RpYWxvZ3MvZGlhbG9nLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O29CQUVpQixNQUFNOzs7O2lDQUNpQixzQkFBc0I7O0FBSDlELFdBQVcsQ0FBQzs7QUFLWixJQUFNLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDOztJQUVKLE1BQU07WUFBTixNQUFNOztlQUFOLE1BQU07O1dBRVgsaUJBQUMsSUFBSSxFQUFFOzs7QUFDbkIsVUFBTSxPQUFPLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztBQUMzQixhQUFPLElBQUksQ0FBQyxHQUFHLENBQ2I7QUFDRSxpQkFBTyxtQ0FBbUM7T0FDM0MsRUFBRSxZQUFNO0FBQ1QsY0FBSyxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRTtBQUN6QixtQkFBTyxNQUFNO0FBQ2IsZ0JBQU0sRUFBRSxNQUFNO1NBQ2YsQ0FBQyxDQUFDO0FBQ0gsY0FBSyxPQUFPLENBQUMsWUFBWSxFQUFFLHNDQUFtQjtBQUM1QyxjQUFJLEVBQUUsSUFBSTtTQUNYLENBQUMsQ0FBQyxDQUFDO0FBQ0osY0FBSyxHQUFHLENBQUM7QUFDUCxtQkFBTyxlQUFlO0FBQ3RCLGdCQUFNLEVBQUUsT0FBTztTQUNoQixDQUFDLENBQUM7T0FDSixDQUFDLENBQUM7S0FDSjs7O0FBRVUsV0F0QlEsTUFBTSxDQXNCYixJQUFJLEVBQUU7OzswQkF0QkMsTUFBTTs7QUF1QnZCLFFBQU0sT0FBTyxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7QUFDM0IsK0JBeEJpQixNQUFNLDZDQXdCakIsT0FBTyxFQUFFO0FBQ2YsUUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDOztBQUVsQixRQUFJLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQyxNQUFNLElBQUksRUFBRSxDQUFDO0FBQ25DLFFBQUksQ0FBQyxXQUFXLEdBQUcsT0FBTyxDQUFD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LFdBQVcsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDO0tBQ3hCOzs7V0FFUSxtQkFBQyxPQUFPLEVBQUU7QUFDakIsVUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDekIsVUFBSSxPQUFPLEVBQUU7QUFBRSxZQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7T0FBRTtLQUNwQzs7O1NBN0ZrQixNQUFNOzs7cUJBQU4sTUFBTSIsImZpbGUiOiJmaWxlOi8vL0M6L1VzZXJzL3VjaGloYS8uYXRvbS9wYWNrYWdlcy9SZW1vdGUtRlRQL2xpYi9kaWFsb2dzL2RpYWxvZy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7ICQsIFZpZXcsIFRleHRFZGl0b3JWaWV3IH0gZnJvbSAnYXRvbS1zcGFjZS1wZW4tdmlld3MnO1xuXG5jb25zdCBhdG9tID0gZ2xvYmFsLmF0b207XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIERpYWxvZyBleHRlbmRzIFZpZXcge1xuXG4gIHN0YXRpYyBjb250ZW50KG9wdHMpIHtcbiAgICBjb25zdCBvcHRpb25zID0gb3B0cyB8fCB7fTtcbiAgICByZXR1cm4gdGhpcy5kaXYoXG4gICAgICB7XG4gICAgICAgIGNsYXNzOiAndHJlZS12aWV3LWRpYWxvZyBvdmVybGF5IGZyb20tdG9wJyxcbiAgICAgIH0sICgpID0+IHtcbiAgICAgIHRoaXMubGFiZWwob3B0aW9ucy5wcm9tcHQsIHtcbiAgICAgICAgY2xhc3M6ICdpY29uJyxcbiAgICAgICAgb3V0bGV0OiAndGV4dCcsXG4gICAgICB9KTtcbiAgICAgIHRoaXMuc3VidmlldygnbWluaUVkaXRvcicsIG5ldyBUZXh0RWRpdG9yVmlldyh7XG4gICAgICAgIG1pbmk6IHRydWUsXG4gICAgICB9KSk7XG4gICAgICB0aGlzLmRpdih7XG4gICAgICAgIGNsYXNzOiAnZXJyb3ItbWVzc2FnZScsXG4gICAgICAgIG91dGxldDogJ2Vycm9yJyxcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgY29uc3RydWN0b3Iob3B0cykge1xuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRzIHx8IHt9O1xuICAgIHN1cGVyKG9wdGlvbnMpO1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgdGhpcy5wcm9tcHQgPSBvcHRpb25zLnByb21wdCB8fCAnJztcbiAgICB0aGlzLmluaXRpYWxQYXRoID0gb3B0aW9ucy5pbml0aWFsUGF0aCB8fCAnJztcbiAgICB0aGlzLnNlbGVjdCA9IG9wdGlvbnMuc2VsZWN0IHx8IGZhbHNlO1xuICAgIHRoaXMuaWNvbkNsYXNzID0gb3B0aW9ucy5pY29uQ2xhc3MgfHwgJyc7XG5cbiAgICBpZiAodGhpcy5pY29uQ2xhc3MpIHsgdGhpcy50ZXh0LmFkZENsYXNzKHRoaXMuaWNvbkNsYXNzKTsgfVxuXG4gICAgYXRvbS5jb21tYW5kcy5hZGQodGhpcy5lbGVtZW50LCB7XG4gICAgICAnY29yZTpjb25maXJtJzogKCkgPT4ge1xuICAgICAgICBzZWxmLm9uQ29uZmlybShzZWxmLm1pbmlFZGl0b3IuZ2V0VGV4dCgpKTtcbiAgICAgIH0sXG4gICAgICAnY29yZTpjYW5jZWwnOiAoKSA9PiB7XG4gICAgICAgIHNlbGYuY2FuY2VsKCk7XG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgdGhpcy5taW5pRWRpdG9yLm9uKCdibHVyJywgKCkgPT4ge1xuICAgICAgdGhpcy5jbG9zZSgpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5taW5pRWRpdG9yLmdldE1vZGVsKCkub25EaWRDaGFuZ2UoKCkgPT4ge1xuICAgICAgdGhpcy5zaG93RXJyb3IoKTtcbiAgICB9KTtcblxuICAgIGlmICh0aGlzLmluaXRpYWxQYXRoKSB7XG4gICAgICB0aGlzLm1pbmlFZGl0b3IuZ2V0TW9kZWwoKS5zZXRUZXh0KHRoaXMuaW5pdGlhbFBhdGgpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLnNlbGVjdCkge1xuICAgICAgY29uc3QgZXh0ID0gcGF0aC5leHRuYW1lKHRoaXMuaW5pdGlhbFBhdGgpO1xuICAgICAgY29uc3QgbmFtZSA9IHBhdGguYmFzZW5hbWUodGhpcy5pbml0aWFsUGF0aCk7XG4gICAgICBsZXQgc2VsRW5kO1xuICAgICAgaWYgKG5hbWUgPT09IGV4dCkge1xuICAgICAgICBzZWxFbmQgPSB0aGlzLmluaXRpYWxQYXRoLmxlbmd0aDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNlbEVuZCA9IHRoaXMuaW5pdGlhbFBhdGgubGVuZ3RoIC0gZXh0Lmxlbmd0aDtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHJhbmdlID0gW1swLCB0aGlzLmluaXRpYWxQYXRoLmxlbmd0aCAtIG5hbWUubGVuZ3RoXSwgWzAsIHNlbEVuZF1dO1xuICAgICAgdGhpcy5taW5pRWRpdG9yLmdldE1vZGVsKCkuc2V0U2VsZWN0ZWRCdWZmZXJSYW5nZShyYW5nZSk7XG4gICAgfVxuICB9XG5cbiAgYXR0YWNoKCkge1xuICAgIHRoaXMucGFuZWwgPSBhdG9tLndvcmtzcGFjZS5hZGRNb2RhbFBhbmVsKHsgaXRlbTogdGhpcy5lbGVtZW50IH0pO1xuICAgIHRoaXMubWluaUVkaXRvci5mb2N1cygpO1xuICAgIHRoaXMubWluaUVkaXRvci5nZXRNb2RlbCgpLnNjcm9sbFRvQ3Vyc29yUG9zaXRpb24oKTtcbiAgfVxuXG4gIGNsb3NlKCkge1xuICAgIGNvbnN0IGRlc3Ryb3lQYW5lbCA9IHRoaXMucGFuZWw7XG4gICAgdGhpcy5wYW5lbCA9IG51bGw7XG4gICAgaWYgKGRlc3Ryb3lQYW5lbCkge1xuICAgICAgZGVzdHJveVBhbmVsLmRlc3Ryb3koKTtcbiAgICB9XG5cbiAgICBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lKCkuYWN0aXZhdGUoKTtcbiAgfVxuXG4gIGNhbmNlbCgpIHtcbiAgICB0aGlzLmNsb3NlKCk7XG4gICAgJCgnLmZ0cC12aWV3JykuZm9jdXMoKTtcbiAgfVxuXG4gIHNob3dFcnJvcihtZXNzYWdlKSB7XG4gICAgdGhpcy5lcnJvci50ZXh0KG1lc3NhZ2UpO1xuICAgIGlmIChtZXNzYWdlKSB7IHRoaXMuZmxhc2hFcnJvcigpOyB9XG4gIH1cblxufVxuIl19