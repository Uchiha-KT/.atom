'use babel';
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
var oldConfigs = ['fonts.useRoboto', 'fonts.useRobotoInUI', 'panels', 'tabs.rippleAccentColor', 'tabs.showTabIcons', 'tabs.tabSize', 'tabs.tabMinWidth', 'treeView.compactTreeView', 'ui.accentColor', 'ui.disableAnimations', 'ui.slimScrollbar', 'accentColor', 'compactTreeView', 'disableAnimations', 'rippleAccentColor', 'showTabIcons', 'slimScrollbar', 'tabMinWidth', 'tabSize', 'useRoboto', 'useRobotoInUI'];

function apply() {
    oldConfigs.forEach(function (option) {
        atom.config.unset('atom-material-ui.' + option);
    });
}

exports['default'] = {
    apply: apply
};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGU6Ly8vQzovVXNlcnMvdWNoaWhhLy5hdG9tL3BhY2thZ2VzL2F0b20tbWF0ZXJpYWwtdWkvbGliL3VwZGF0ZS1jb25maWctc2NoZW1hLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFdBQVcsQ0FBQztBQUNaLFlBQVksQ0FBQzs7Ozs7QUFFYixJQUFJLFVBQVUsR0FBRyxDQUNiLGlCQUFpQixFQUNqQixxQkFBcUIsRUFDckIsUUFBUSxFQUNSLHdCQUF3QixFQUN4QixtQkFBbUIsRUFDbkIsY0FBYyxFQUNkLGtCQUFrQixFQUNsQiwwQkFBMEIsRUFDMUIsZ0JBQWdCLEVBQ2hCLHNCQUFzQixFQUN0QixrQkFBa0IsRUFDbEIsYUFBYSxFQUNiLGlCQUFpQixFQUNqQixtQkFBbUIsRUFDbkIsbUJBQW1CLEVBQ25CLGNBQWMsRUFDZCxlQUFlLEVBQ2YsYUFBYSxFQUNiLFNBQVMsRUFDVCxXQUFXLEVBQ1gsZUFBZSxDQUNsQixDQUFDOztBQUVGLFNBQVMsS0FBSyxHQUFHO0FBQ2IsY0FBVSxDQUFDLE9BQU8sQ0FBQyxVQUFDLE1BQU0sRUFBSztBQUMzQixZQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssdUJBQXFCLE1BQU0sQ0FBRyxDQUFDO0tBQ25ELENBQUMsQ0FBQztDQUNOOztxQkFFYztBQUNYLFNBQUssRUFBTCxLQUFLO0NBQ1IiLCJmaWxlIjoiZmlsZTovLy9DOi9Vc2Vycy91Y2hpaGEvLmF0b20vcGFja2FnZXMvYXRvbS1tYXRlcmlhbC11aS9saWIvdXBkYXRlLWNvbmZpZy1zY2hlbWEuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbid1c2Ugc3RyaWN0JztcblxudmFyIG9sZENvbmZpZ3MgPSBbXG4gICAgJ2ZvbnRzLnVzZVJvYm90bycsXG4gICAgJ2ZvbnRzLnVzZVJvYm90b0luVUknLFxuICAgICdwYW5lbHMnLFxuICAgICd0YWJzLnJpcHBsZUFjY2VudENvbG9yJyxcbiAgICAndGFicy5zaG93VGFiSWNvbnMnLFxuICAgICd0YWJzLnRhYlNpemUnLFxuICAgICd0YWJzLnRhYk1pbldpZHRoJyxcbiAgICAndHJlZVZpZXcuY29tcGFjdFRyZWVWaWV3JyxcbiAgICAndWkuYWNjZW50Q29sb3InLFxuICAgICd1aS5kaXNhYmxlQW5pbWF0aW9ucycsXG4gICAgJ3VpLnNsaW1TY3JvbGxiYXInLFxuICAgICdhY2NlbnRDb2xvcicsXG4gICAgJ2NvbXBhY3RUcmVlVmlldycsXG4gICAgJ2Rpc2FibGVBbmltYXRpb25zJyxcbiAgICAncmlwcGxlQWNjZW50Q29sb3InLFxuICAgICdzaG93VGFiSWNvbnMnLFxuICAgICdzbGltU2Nyb2xsYmFyJyxcbiAgICAndGFiTWluV2lkdGgnLFxuICAgICd0YWJTaXplJyxcbiAgICAndXNlUm9ib3RvJyxcbiAgICAndXNlUm9ib3RvSW5VSSdcbl07XG5cbmZ1bmN0aW9uIGFwcGx5KCkge1xuICAgIG9sZENvbmZpZ3MuZm9yRWFjaCgob3B0aW9uKSA9PiB7XG4gICAgICAgIGF0b20uY29uZmlnLnVuc2V0KGBhdG9tLW1hdGVyaWFsLXVpLiR7b3B0aW9ufWApO1xuICAgIH0pO1xufVxuXG5leHBvcnQgZGVmYXVsdCB7XG4gICAgYXBwbHlcbn07XG4iXX0=