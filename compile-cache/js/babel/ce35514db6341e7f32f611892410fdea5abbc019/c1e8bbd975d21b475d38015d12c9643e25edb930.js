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

var MoveDialog = (function (_Dialog) {
  _inherits(MoveDialog, _Dialog);

  function MoveDialog(initialPath, isFile) {
    _classCallCheck(this, MoveDialog);

    _get(Object.getPrototypeOf(MoveDialog.prototype), 'constructor', this).call(this, {
      prompt: isFile ? 'Enter the new path for the file.' : 'Enter the new path for the folder.',
      initialPath: initialPath,
      select: true,
      iconClass: isFile ? 'icon-file-add' : 'icon-file-directory-create'
    });

    this.isCreatingFile = isFile;
  }

  _createClass(MoveDialog, [{
    key: 'onConfirm',
    value: function onConfirm(absolutePath) {
      this.trigger('path-changed', [absolutePath]);
    }
  }]);

  return MoveDialog;
})(_dialog2['default']);

exports['default'] = MoveDialog;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGU6Ly8vQzovVXNlcnMvdWNoaWhhLy5hdG9tL3BhY2thZ2VzL1JlbW90ZS1GVFAvbGliL2RpYWxvZ3MvbW92ZS1kaWFsb2cuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7c0JBRW1CLFVBQVU7Ozs7QUFGN0IsV0FBVyxDQUFDOztJQUlTLFVBQVU7WUFBVixVQUFVOztBQUVsQixXQUZRLFVBQVUsQ0FFakIsV0FBVyxFQUFFLE1BQU0sRUFBRTswQkFGZCxVQUFVOztBQUczQiwrQkFIaUIsVUFBVSw2Q0FHckI7QUFDSixZQUFNLEVBQUUsTUFBTSxHQUFHLGtDQUFrQyxHQUFHLG9DQUFvQztBQUMxRixpQkFBVyxFQUFYLFdBQVc7QUFDWCxZQUFNLEVBQUUsSUFBSTtBQUNaLGVBQVMsRUFBRSxNQUFNLEdBQUcsZUFBZSxHQUFHLDRCQUE0QjtLQUNuRSxFQUFFOztBQUVILFFBQUksQ0FBQyxjQUFjLEdBQUcsTUFBTSxDQUFDO0dBQzlCOztlQVhrQixVQUFVOztXQWFwQixtQkFBQyxZQUFZLEVBQUU7QUFDdEIsVUFBSSxDQUFDLE9BQU8sQ0FBQyxjQUFjLEVBQUUsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO0tBQzlDOzs7U0Fma0IsVUFBVTs7O3FCQUFWLFVBQVUiLCJmaWxlIjoiZmlsZTovLy9DOi9Vc2Vycy91Y2hpaGEvLmF0b20vcGFja2FnZXMvUmVtb3RlLUZUUC9saWIvZGlhbG9ncy9tb3ZlLWRpYWxvZy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5pbXBvcnQgRGlhbG9nIGZyb20gJy4vZGlhbG9nJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTW92ZURpYWxvZyBleHRlbmRzIERpYWxvZyB7XG5cbiAgY29uc3RydWN0b3IoaW5pdGlhbFBhdGgsIGlzRmlsZSkge1xuICAgIHN1cGVyKHtcbiAgICAgIHByb21wdDogaXNGaWxlID8gJ0VudGVyIHRoZSBuZXcgcGF0aCBmb3IgdGhlIGZpbGUuJyA6ICdFbnRlciB0aGUgbmV3IHBhdGggZm9yIHRoZSBmb2xkZXIuJyxcbiAgICAgIGluaXRpYWxQYXRoLFxuICAgICAgc2VsZWN0OiB0cnVlLFxuICAgICAgaWNvbkNsYXNzOiBpc0ZpbGUgPyAnaWNvbi1maWxlLWFkZCcgOiAnaWNvbi1maWxlLWRpcmVjdG9yeS1jcmVhdGUnLFxuICAgIH0pO1xuXG4gICAgdGhpcy5pc0NyZWF0aW5nRmlsZSA9IGlzRmlsZTtcbiAgfVxuXG4gIG9uQ29uZmlybShhYnNvbHV0ZVBhdGgpIHtcbiAgICB0aGlzLnRyaWdnZXIoJ3BhdGgtY2hhbmdlZCcsIFthYnNvbHV0ZVBhdGhdKTtcbiAgfVxuXG59XG4iXX0=