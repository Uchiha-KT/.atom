Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = INITCOMMANDS;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _contextMenu = require('./contextMenu');

var _contextMenu2 = _interopRequireDefault(_contextMenu);

var _commands = require('./commands');

var _commands2 = _interopRequireDefault(_commands);

'use babel';

function INITCOMMANDS() {
  var atom = global.atom;
  var add = function ADD(_ref) {
    var location = _ref.location;
    var obj = _ref.obj;
    var _ref$target = _ref.target;
    var target = _ref$target === undefined ? false : _ref$target;

    var enabledCommands = Object.keys(obj).reduce(function (ret, key) {
      // key == command user types in or is called with context menu
      var _obj$key = obj[key];
      var enabled = _obj$key.enabled;
      var command = _obj$key.command;

      var object = Object.assign({}, ret);
      if (enabled === true) {
        object[key] = command;
      }
      return object;
    }, {});

    if (target === false) {
      atom[location].add(enabledCommands);
    } else {
      atom[location].add(target, enabledCommands);
    }
  };

  add({
    location: 'contextMenu',
    obj: (0, _contextMenu2['default'])()
  });
  add({
    location: 'commands',
    obj: (0, _commands2['default'])(),
    target: 'atom-workspace'
  });
}

module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGU6Ly8vQzovVXNlcnMvdWNoaWhhLy5hdG9tL3BhY2thZ2VzL1JlbW90ZS1GVFAvbGliL21lbnVzL21haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O3FCQUt3QixZQUFZOzs7OzJCQUhaLGVBQWU7Ozs7d0JBQ2xCLFlBQVk7Ozs7QUFIakMsV0FBVyxDQUFDOztBQUtHLFNBQVMsWUFBWSxHQUFHO0FBQ3JDLE1BQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUM7QUFDekIsTUFBTSxHQUFHLEdBQUcsU0FBUyxHQUFHLENBQUMsSUFJeEIsRUFBRTtRQUhELFFBQVEsR0FEZSxJQUl4QixDQUhDLFFBQVE7UUFDUixHQUFHLEdBRm9CLElBSXhCLENBRkMsR0FBRztzQkFGb0IsSUFJeEIsQ0FEQyxNQUFNO1FBQU4sTUFBTSwrQkFBRyxLQUFLOztBQUVkLFFBQU0sZUFBZSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQ3ZDLE1BQU0sQ0FBQyxVQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUs7O3FCQUloQixHQUFHLENBQUMsR0FBRyxDQUFDO1VBRlYsT0FBTyxZQUFQLE9BQU87VUFDUCxPQUFPLFlBQVAsT0FBTzs7QUFFVCxVQUFNLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQztBQUN0QyxVQUFJLE9BQU8sS0FBSyxJQUFJLEVBQUU7QUFDcEIsY0FBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLE9BQU8sQ0FBQztPQUN2QjtBQUNELGFBQU8sTUFBTSxDQUFDO0tBQ2YsRUFBRSxFQUFFLENBQUMsQ0FBQzs7QUFFUCxRQUFJLE1BQU0sS0FBSyxLQUFLLEVBQUU7QUFDcEIsVUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsQ0FBQztLQUNyQyxNQUFNO0FBQ0wsVUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsZUFBZSxDQUFDLENBQUM7S0FDN0M7R0FDRixDQUFDOztBQUVGLEtBQUcsQ0FBQztBQUNGLFlBQVEsRUFBRSxhQUFhO0FBQ3ZCLE9BQUcsRUFBRSwrQkFBYTtHQUNuQixDQUFDLENBQUM7QUFDSCxLQUFHLENBQUM7QUFDRixZQUFRLEVBQUUsVUFBVTtBQUNwQixPQUFHLEVBQUUsNEJBQVU7QUFDZixVQUFNLEVBQUUsZ0JBQWdCO0dBQ3pCLENBQUMsQ0FBQztDQUNKIiwiZmlsZSI6ImZpbGU6Ly8vQzovVXNlcnMvdWNoaWhhLy5hdG9tL3BhY2thZ2VzL1JlbW90ZS1GVFAvbGliL21lbnVzL21haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuaW1wb3J0IGNvbnRleHRNZW51IGZyb20gJy4vY29udGV4dE1lbnUnO1xuaW1wb3J0IGNvbW1hbmRzIGZyb20gJy4vY29tbWFuZHMnO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBJTklUQ09NTUFORFMoKSB7XG4gIGNvbnN0IGF0b20gPSBnbG9iYWwuYXRvbTtcbiAgY29uc3QgYWRkID0gZnVuY3Rpb24gQUREKHtcbiAgICBsb2NhdGlvbixcbiAgICBvYmosXG4gICAgdGFyZ2V0ID0gZmFsc2UsXG4gIH0pIHtcbiAgICBjb25zdCBlbmFibGVkQ29tbWFuZHMgPSBPYmplY3Qua2V5cyhvYmopXG4gICAgLnJlZHVjZSgocmV0LCBrZXkpID0+IHsgLy8ga2V5ID09IGNvbW1hbmQgdXNlciB0eXBlcyBpbiBvciBpcyBjYWxsZWQgd2l0aCBjb250ZXh0IG1lbnVcbiAgICAgIGNvbnN0IHtcbiAgICAgICAgZW5hYmxlZCxcbiAgICAgICAgY29tbWFuZCxcbiAgICAgIH0gPSBvYmpba2V5XTtcbiAgICAgIGNvbnN0IG9iamVjdCA9IE9iamVjdC5hc3NpZ24oe30sIHJldCk7XG4gICAgICBpZiAoZW5hYmxlZCA9PT0gdHJ1ZSkge1xuICAgICAgICBvYmplY3Rba2V5XSA9IGNvbW1hbmQ7XG4gICAgICB9XG4gICAgICByZXR1cm4gb2JqZWN0O1xuICAgIH0sIHt9KTtcblxuICAgIGlmICh0YXJnZXQgPT09IGZhbHNlKSB7XG4gICAgICBhdG9tW2xvY2F0aW9uXS5hZGQoZW5hYmxlZENvbW1hbmRzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYXRvbVtsb2NhdGlvbl0uYWRkKHRhcmdldCwgZW5hYmxlZENvbW1hbmRzKTtcbiAgICB9XG4gIH07XG5cbiAgYWRkKHtcbiAgICBsb2NhdGlvbjogJ2NvbnRleHRNZW51JyxcbiAgICBvYmo6IGNvbnRleHRNZW51KCksXG4gIH0pO1xuICBhZGQoe1xuICAgIGxvY2F0aW9uOiAnY29tbWFuZHMnLFxuICAgIG9iajogY29tbWFuZHMoKSxcbiAgICB0YXJnZXQ6ICdhdG9tLXdvcmtzcGFjZScsXG4gIH0pO1xufVxuIl19