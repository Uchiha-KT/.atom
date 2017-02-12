Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// TODO: Change ._start to be .start

var _events = require('events');

'use babel';
var Progress = (function (_EventEmitter) {
  _inherits(Progress, _EventEmitter);

  function Progress() {
    _classCallCheck(this, Progress);

    _get(Object.getPrototypeOf(Progress.prototype), 'constructor', this).call(this);
    this.progress = -1;
    this._start = 0;
  }

  _createClass(Progress, [{
    key: 'setProgress',
    value: function setProgress(res) {
      var progress = parseFloat(res) || -1;

      if (this.progress === -1 && progress > -1) this._start = Date.now();
      this.progress = progress;
      this.emit('progress', this.progress);
      if (this.progress === 1) this.emit('done');
    }
  }, {
    key: 'isDone',
    value: function isDone() {
      return this.progress >= 1;
    }
  }, {
    key: 'getEta',
    value: function getEta() {
      if (this.progress === -1) return Infinity;

      var now = Date.now();
      var elapse = now - this._start;
      var remaining = elapse * 1 / this.progress;

      return remaining - elapse;
    }
  }]);

  return Progress;
})(_events.EventEmitter);

exports['default'] = Progress;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGU6Ly8vQzovVXNlcnMvdWNoaWhhLy5hdG9tL3BhY2thZ2VzL1JlbW90ZS1GVFAvbGliL3Byb2dyZXNzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O3NCQUk2QixRQUFROztBQUpyQyxXQUFXLENBQUM7SUFNUyxRQUFRO1lBQVIsUUFBUTs7QUFDaEIsV0FEUSxRQUFRLEdBQ2I7MEJBREssUUFBUTs7QUFFekIsK0JBRmlCLFFBQVEsNkNBRWpCO0FBQ1IsUUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUNuQixRQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztHQUNqQjs7ZUFMa0IsUUFBUTs7V0FPaEIscUJBQUMsR0FBRyxFQUFFO0FBQ2YsVUFBTSxRQUFRLEdBQUcsVUFBVSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDOztBQUV2QyxVQUFJLElBQUksQ0FBQyxRQUFRLEtBQUssQ0FBQyxDQUFDLElBQUksUUFBUSxHQUFHLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBQ3BFLFVBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO0FBQ3pCLFVBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUNyQyxVQUFJLElBQUksQ0FBQyxRQUFRLEtBQUssQ0FBQyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7S0FDNUM7OztXQUVLLGtCQUFHO0FBQUUsYUFBTyxJQUFJLENBQUMsUUFBUSxJQUFJLENBQUMsQ0FBQztLQUFFOzs7V0FFakMsa0JBQUc7QUFDUCxVQUFJLElBQUksQ0FBQyxRQUFRLEtBQUssQ0FBQyxDQUFDLEVBQUUsT0FBTyxRQUFRLENBQUM7O0FBRTFDLFVBQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUN2QixVQUFNLE1BQU0sR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztBQUNqQyxVQUFNLFNBQVMsR0FBRyxBQUFDLE1BQU0sR0FBRyxDQUFDLEdBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQzs7QUFFL0MsYUFBTyxTQUFTLEdBQUcsTUFBTSxDQUFDO0tBQzNCOzs7U0ExQmtCLFFBQVE7OztxQkFBUixRQUFRIiwiZmlsZSI6ImZpbGU6Ly8vQzovVXNlcnMvdWNoaWhhLy5hdG9tL3BhY2thZ2VzL1JlbW90ZS1GVFAvbGliL3Byb2dyZXNzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbi8vIFRPRE86IENoYW5nZSAuX3N0YXJ0IHRvIGJlIC5zdGFydFxuXG5pbXBvcnQgeyBFdmVudEVtaXR0ZXIgfSBmcm9tICdldmVudHMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQcm9ncmVzcyBleHRlbmRzIEV2ZW50RW1pdHRlciB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5wcm9ncmVzcyA9IC0xO1xuICAgIHRoaXMuX3N0YXJ0ID0gMDtcbiAgfVxuXG4gIHNldFByb2dyZXNzKHJlcykge1xuICAgIGNvbnN0IHByb2dyZXNzID0gcGFyc2VGbG9hdChyZXMpIHx8IC0xO1xuXG4gICAgaWYgKHRoaXMucHJvZ3Jlc3MgPT09IC0xICYmIHByb2dyZXNzID4gLTEpIHRoaXMuX3N0YXJ0ID0gRGF0ZS5ub3coKTtcbiAgICB0aGlzLnByb2dyZXNzID0gcHJvZ3Jlc3M7XG4gICAgdGhpcy5lbWl0KCdwcm9ncmVzcycsIHRoaXMucHJvZ3Jlc3MpO1xuICAgIGlmICh0aGlzLnByb2dyZXNzID09PSAxKSB0aGlzLmVtaXQoJ2RvbmUnKTtcbiAgfVxuXG4gIGlzRG9uZSgpIHsgcmV0dXJuIHRoaXMucHJvZ3Jlc3MgPj0gMTsgfVxuXG4gIGdldEV0YSgpIHtcbiAgICBpZiAodGhpcy5wcm9ncmVzcyA9PT0gLTEpIHJldHVybiBJbmZpbml0eTtcblxuICAgIGNvbnN0IG5vdyA9IERhdGUubm93KCk7XG4gICAgY29uc3QgZWxhcHNlID0gbm93IC0gdGhpcy5fc3RhcnQ7XG4gICAgY29uc3QgcmVtYWluaW5nID0gKGVsYXBzZSAqIDEpIC8gdGhpcy5wcm9ncmVzcztcblxuICAgIHJldHVybiByZW1haW5pbmcgLSBlbGFwc2U7XG4gIH1cbn1cbiJdfQ==