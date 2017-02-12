'use babel';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var init = function INIT() {
  var atom = global.atom;
  var copyEnabled = function copyEnabled() {
    return atom.config.get('Remote-FTP.enableCopyFilename');
  };
  var contextMenu = {
    '.remote-ftp-view .entries.list-tree:not(.multi-select) .directory .header': {
      enabled: copyEnabled(),
      command: [{
        label: 'Copy name',
        command: 'remote-ftp:copy-name'
      }, {
        type: 'separator'
      }]
    },
    '.remote-ftp-view .entries.list-tree:not(.multi-select) .file': {
      enabled: copyEnabled(),
      command: [{
        label: 'Copy filename',
        command: 'remote-ftp:copy-name'
      }, {
        type: 'separator'
      }]
    }
  };
  return contextMenu;
};

exports['default'] = init;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGU6Ly8vQzovVXNlcnMvdWNoaWhhLy5hdG9tL3BhY2thZ2VzL1JlbW90ZS1GVFAvbGliL21lbnVzL2NvbnRleHRNZW51LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFdBQVcsQ0FBQzs7Ozs7QUFFWixJQUFNLElBQUksR0FBRyxTQUFTLElBQUksR0FBRztBQUMzQixNQUFNLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDO0FBQ3pCLE1BQU0sV0FBVyxHQUFHLFNBQWQsV0FBVztXQUFTLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLCtCQUErQixDQUFDO0dBQUEsQ0FBQztBQUMzRSxNQUFNLFdBQVcsR0FBRztBQUNsQiwrRUFBMkUsRUFBRTtBQUMzRSxhQUFPLEVBQUUsV0FBVyxFQUFFO0FBQ3RCLGFBQU8sRUFBRSxDQUFDO0FBQ1IsYUFBSyxFQUFFLFdBQVc7QUFDbEIsZUFBTyxFQUFFLHNCQUFzQjtPQUNoQyxFQUFFO0FBQ0QsWUFBSSxFQUFFLFdBQVc7T0FDbEIsQ0FBQztLQUNIO0FBQ0Qsa0VBQThELEVBQUU7QUFDOUQsYUFBTyxFQUFFLFdBQVcsRUFBRTtBQUN0QixhQUFPLEVBQUUsQ0FBQztBQUNSLGFBQUssRUFBRSxlQUFlO0FBQ3RCLGVBQU8sRUFBRSxzQkFBc0I7T0FDaEMsRUFBRTtBQUNELFlBQUksRUFBRSxXQUFXO09BQ2xCLENBQUM7S0FDSDtHQUNGLENBQUM7QUFDRixTQUFPLFdBQVcsQ0FBQztDQUNwQixDQUFDOztxQkFHYSxJQUFJIiwiZmlsZSI6ImZpbGU6Ly8vQzovVXNlcnMvdWNoaWhhLy5hdG9tL3BhY2thZ2VzL1JlbW90ZS1GVFAvbGliL21lbnVzL2NvbnRleHRNZW51LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmNvbnN0IGluaXQgPSBmdW5jdGlvbiBJTklUKCkge1xuICBjb25zdCBhdG9tID0gZ2xvYmFsLmF0b207XG4gIGNvbnN0IGNvcHlFbmFibGVkID0gKCkgPT4gYXRvbS5jb25maWcuZ2V0KCdSZW1vdGUtRlRQLmVuYWJsZUNvcHlGaWxlbmFtZScpO1xuICBjb25zdCBjb250ZXh0TWVudSA9IHtcbiAgICAnLnJlbW90ZS1mdHAtdmlldyAuZW50cmllcy5saXN0LXRyZWU6bm90KC5tdWx0aS1zZWxlY3QpIC5kaXJlY3RvcnkgLmhlYWRlcic6IHtcbiAgICAgIGVuYWJsZWQ6IGNvcHlFbmFibGVkKCksXG4gICAgICBjb21tYW5kOiBbe1xuICAgICAgICBsYWJlbDogJ0NvcHkgbmFtZScsXG4gICAgICAgIGNvbW1hbmQ6ICdyZW1vdGUtZnRwOmNvcHktbmFtZScsXG4gICAgICB9LCB7XG4gICAgICAgIHR5cGU6ICdzZXBhcmF0b3InLFxuICAgICAgfV0sXG4gICAgfSxcbiAgICAnLnJlbW90ZS1mdHAtdmlldyAuZW50cmllcy5saXN0LXRyZWU6bm90KC5tdWx0aS1zZWxlY3QpIC5maWxlJzoge1xuICAgICAgZW5hYmxlZDogY29weUVuYWJsZWQoKSxcbiAgICAgIGNvbW1hbmQ6IFt7XG4gICAgICAgIGxhYmVsOiAnQ29weSBmaWxlbmFtZScsXG4gICAgICAgIGNvbW1hbmQ6ICdyZW1vdGUtZnRwOmNvcHktbmFtZScsXG4gICAgICB9LCB7XG4gICAgICAgIHR5cGU6ICdzZXBhcmF0b3InLFxuICAgICAgfV0sXG4gICAgfSxcbiAgfTtcbiAgcmV0dXJuIGNvbnRleHRNZW51O1xufTtcblxuXG5leHBvcnQgZGVmYXVsdCBpbml0O1xuIl19