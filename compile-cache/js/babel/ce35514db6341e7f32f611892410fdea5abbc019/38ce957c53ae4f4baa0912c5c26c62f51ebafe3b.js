Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _events = require('events');

'use babel';

var error = function ERROR(callback) {
  if (typeof callback === 'function') {
    callback.apply(this, ['Abstract connector']);
  }
};

var Connector = (function (_EventEmitter) {
  _inherits(Connector, _EventEmitter);

  function Connector(client) {
    _classCallCheck(this, Connector);

    _get(Object.getPrototypeOf(Connector.prototype), 'constructor', this).call(this);
    var self = this;
    self.client = client;
    self.info = {};
  }

  _createClass(Connector, [{
    key: 'connect',
    value: function connect(info, completed) {
      error(completed);
      return this;
    }
  }, {
    key: 'disconnect',
    value: function disconnect(completed) {
      error(completed);
      return this;
    }
  }, {
    key: 'abort',
    value: function abort(completed) {
      error(completed);
      return this;
    }
  }, {
    key: 'list',
    value: function list(path, recursive, completed) {
      error(completed);
      return this;
    }
  }, {
    key: 'get',
    value: function get(path, recursive, completed) {
      error(completed);
      return this;
    }
  }, {
    key: 'put',
    value: function put(path, completed) {
      error(completed);
      return this;
    }
  }, {
    key: 'mkdir',
    value: function mkdir(path, completed) {
      error(completed);
      return this;
    }
  }, {
    key: 'mkfile',
    value: function mkfile(path, completed) {
      error(completed);
      return this;
    }
  }, {
    key: 'rename',
    value: function rename(source, dest, completed) {
      error(completed);
      return this;
    }
  }, {
    key: 'delete',
    value: function _delete(path, completed) {
      error(completed);
      return this;
    }
  }], [{
    key: 'isConnected',
    value: function isConnected() {
      return false;
    }
  }]);

  return Connector;
})(_events.EventEmitter);

exports['default'] = Connector;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGU6Ly8vQzovVXNlcnMvdWNoaWhhLy5hdG9tL3BhY2thZ2VzL1JlbW90ZS1GVFAvbGliL2Nvbm5lY3Rvci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7c0JBRTZCLFFBQVE7O0FBRnJDLFdBQVcsQ0FBQzs7QUFJWixJQUFNLEtBQUssR0FBRyxTQUFTLEtBQUssQ0FBQyxRQUFRLEVBQUU7QUFDckMsTUFBSSxPQUFPLFFBQVEsS0FBSyxVQUFVLEVBQUU7QUFDbEMsWUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLENBQUM7R0FDOUM7Q0FDRixDQUFDOztJQUVtQixTQUFTO1lBQVQsU0FBUzs7QUFDakIsV0FEUSxTQUFTLENBQ2hCLE1BQU0sRUFBRTswQkFERCxTQUFTOztBQUUxQiwrQkFGaUIsU0FBUyw2Q0FFbEI7QUFDUixRQUFNLElBQUksR0FBRyxJQUFJLENBQUM7QUFDbEIsUUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7QUFDckIsUUFBSSxDQUFDLElBQUksR0FBRyxFQUFFLENBQUM7R0FDaEI7O2VBTmtCLFNBQVM7O1dBWXJCLGlCQUFDLElBQUksRUFBRSxTQUFTLEVBQUU7QUFDdkIsV0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ2pCLGFBQU8sSUFBSSxDQUFDO0tBQ2I7OztXQUVTLG9CQUFDLFNBQVMsRUFBRTtBQUNwQixXQUFLLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDakIsYUFBTyxJQUFJLENBQUM7S0FDYjs7O1dBRUksZUFBQyxTQUFTLEVBQUU7QUFDZixXQUFLLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDakIsYUFBTyxJQUFJLENBQUM7S0FDYjs7O1dBRUcsY0FBQyxJQUFJLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRTtBQUMvQixXQUFLLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDakIsYUFBTyxJQUFJLENBQUM7S0FDYjs7O1dBRUUsYUFBQyxJQUFJLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRTtBQUM5QixXQUFLLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDakIsYUFBTyxJQUFJLENBQUM7S0FDYjs7O1dBRUUsYUFBQyxJQUFJLEVBQUUsU0FBUyxFQUFFO0FBQ25CLFdBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUNqQixhQUFPLElBQUksQ0FBQztLQUNiOzs7V0FFSSxlQUFDLElBQUksRUFBRSxTQUFTLEVBQUU7QUFDckIsV0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ2pCLGFBQU8sSUFBSSxDQUFDO0tBQ2I7OztXQUVLLGdCQUFDLElBQUksRUFBRSxTQUFTLEVBQUU7QUFDdEIsV0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ2pCLGFBQU8sSUFBSSxDQUFDO0tBQ2I7OztXQUVLLGdCQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFO0FBQzlCLFdBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUNqQixhQUFPLElBQUksQ0FBQztLQUNiOzs7V0FFSyxpQkFBQyxJQUFJLEVBQUUsU0FBUyxFQUFFO0FBQ3RCLFdBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUNqQixhQUFPLElBQUksQ0FBQztLQUNiOzs7V0FwRGlCLHVCQUFHO0FBQ25CLGFBQU8sS0FBSyxDQUFDO0tBQ2Q7OztTQVZrQixTQUFTOzs7cUJBQVQsU0FBUyIsImZpbGUiOiJmaWxlOi8vL0M6L1VzZXJzL3VjaGloYS8uYXRvbS9wYWNrYWdlcy9SZW1vdGUtRlRQL2xpYi9jb25uZWN0b3IuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuaW1wb3J0IHsgRXZlbnRFbWl0dGVyIH0gZnJvbSAnZXZlbnRzJztcblxuY29uc3QgZXJyb3IgPSBmdW5jdGlvbiBFUlJPUihjYWxsYmFjaykge1xuICBpZiAodHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSB7XG4gICAgY2FsbGJhY2suYXBwbHkodGhpcywgWydBYnN0cmFjdCBjb25uZWN0b3InXSk7XG4gIH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvbm5lY3RvciBleHRlbmRzIEV2ZW50RW1pdHRlciB7XG4gIGNvbnN0cnVjdG9yKGNsaWVudCkge1xuICAgIHN1cGVyKCk7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgc2VsZi5jbGllbnQgPSBjbGllbnQ7XG4gICAgc2VsZi5pbmZvID0ge307XG4gIH1cblxuICBzdGF0aWMgaXNDb25uZWN0ZWQoKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgY29ubmVjdChpbmZvLCBjb21wbGV0ZWQpIHtcbiAgICBlcnJvcihjb21wbGV0ZWQpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgZGlzY29ubmVjdChjb21wbGV0ZWQpIHtcbiAgICBlcnJvcihjb21wbGV0ZWQpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgYWJvcnQoY29tcGxldGVkKSB7XG4gICAgZXJyb3IoY29tcGxldGVkKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGxpc3QocGF0aCwgcmVjdXJzaXZlLCBjb21wbGV0ZWQpIHtcbiAgICBlcnJvcihjb21wbGV0ZWQpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgZ2V0KHBhdGgsIHJlY3Vyc2l2ZSwgY29tcGxldGVkKSB7XG4gICAgZXJyb3IoY29tcGxldGVkKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHB1dChwYXRoLCBjb21wbGV0ZWQpIHtcbiAgICBlcnJvcihjb21wbGV0ZWQpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgbWtkaXIocGF0aCwgY29tcGxldGVkKSB7XG4gICAgZXJyb3IoY29tcGxldGVkKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIG1rZmlsZShwYXRoLCBjb21wbGV0ZWQpIHtcbiAgICBlcnJvcihjb21wbGV0ZWQpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgcmVuYW1lKHNvdXJjZSwgZGVzdCwgY29tcGxldGVkKSB7XG4gICAgZXJyb3IoY29tcGxldGVkKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGRlbGV0ZShwYXRoLCBjb21wbGV0ZWQpIHtcbiAgICBlcnJvcihjb21wbGV0ZWQpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbn1cbiJdfQ==