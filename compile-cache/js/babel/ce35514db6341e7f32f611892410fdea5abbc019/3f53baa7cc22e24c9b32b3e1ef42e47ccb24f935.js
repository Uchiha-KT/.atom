Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _dialog = require('./dialog');

var _dialog2 = _interopRequireDefault(_dialog);

'use babel';

var NavigateTo = (function (_Dialog) {
  _inherits(NavigateTo, _Dialog);

  function NavigateTo() {
    _classCallCheck(this, NavigateTo);

    _get(Object.getPrototypeOf(NavigateTo.prototype), 'constructor', this).call(this, {
      prompt: 'Enter the path to navigate to.',
      initialPath: '/',
      select: false,
      iconClass: 'icon-file-directory'
    });
  }

  _createClass(NavigateTo, [{
    key: 'onConfirm',
    value: function onConfirm(path) {
      this.trigger('navigate-to', path);
    }
  }]);

  return NavigateTo;
})(_dialog2['default']);

exports['default'] = NavigateTo;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGU6Ly8vQzovVXNlcnMvdWNoaWhhLy5hdG9tL3BhY2thZ2VzL1JlbW90ZS1GVFAvbGliL2RpYWxvZ3MvbmF2aWdhdGUtdG8tZGlhbG9nLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O3NCQUVtQixVQUFVOzs7O0FBRjdCLFdBQVcsQ0FBQzs7SUFJUyxVQUFVO1lBQVYsVUFBVTs7QUFFbEIsV0FGUSxVQUFVLEdBRWY7MEJBRkssVUFBVTs7QUFHM0IsK0JBSGlCLFVBQVUsNkNBR3JCO0FBQ0osWUFBTSxFQUFFLGdDQUFnQztBQUN4QyxpQkFBVyxFQUFFLEdBQUc7QUFDaEIsWUFBTSxFQUFFLEtBQUs7QUFDYixlQUFTLEVBQUUscUJBQXFCO0tBQ2pDLEVBQUU7R0FDSjs7ZUFUa0IsVUFBVTs7V0FXcEIsbUJBQUMsSUFBSSxFQUFFO0FBQ2QsVUFBSSxDQUFDLE9BQU8sQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDLENBQUM7S0FDbkM7OztTQWJrQixVQUFVOzs7cUJBQVYsVUFBVSIsImZpbGUiOiJmaWxlOi8vL0M6L1VzZXJzL3VjaGloYS8uYXRvbS9wYWNrYWdlcy9SZW1vdGUtRlRQL2xpYi9kaWFsb2dzL25hdmlnYXRlLXRvLWRpYWxvZy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5pbXBvcnQgRGlhbG9nIGZyb20gJy4vZGlhbG9nJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTmF2aWdhdGVUbyBleHRlbmRzIERpYWxvZyB7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoe1xuICAgICAgcHJvbXB0OiAnRW50ZXIgdGhlIHBhdGggdG8gbmF2aWdhdGUgdG8uJyxcbiAgICAgIGluaXRpYWxQYXRoOiAnLycsXG4gICAgICBzZWxlY3Q6IGZhbHNlLFxuICAgICAgaWNvbkNsYXNzOiAnaWNvbi1maWxlLWRpcmVjdG9yeScsXG4gICAgfSk7XG4gIH1cblxuICBvbkNvbmZpcm0ocGF0aCkge1xuICAgIHRoaXMudHJpZ2dlcignbmF2aWdhdGUtdG8nLCBwYXRoKTtcbiAgfVxuXG59XG4iXX0=