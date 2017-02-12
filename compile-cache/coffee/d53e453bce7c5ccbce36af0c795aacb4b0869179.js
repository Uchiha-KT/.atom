(function() {
  var ref;

  module.exports = {
    cliStatusView: null,
    activate: function(state) {
      return atom.packages.onDidActivateInitialPackages((function(_this) {
        return function() {
          var CliStatusView, createStatusEntry;
          CliStatusView = require('./cli-status-view');
          createStatusEntry = function() {
            return _this.cliStatusView = new CliStatusView(state.cliStatusViewState);
          };
          return createStatusEntry();
        };
      })(this));
    },
    deactivate: function() {
      return this.cliStatusView.destroy();
    },
    config: {
      'windowHeight': {
        type: 'integer',
        "default": 30,
        minimum: 0,
        maximum: 80
      },
      'clearCommandInput': {
        type: 'boolean',
        "default": true
      },
      'logConsole': {
        type: 'boolean',
        "default": false
      },
      'overrideLs': {
        title: 'Override ls',
        type: 'boolean',
        "default": true
      },
      'shell': {
        type: 'string',
        "default": process.platform === 'win32' ? 'cmd.exe' : (ref = process.env.SHELL) != null ? ref : '/bin/bash'
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy91Y2hpaGEvLmF0b20vcGFja2FnZXMvdGVybWluYWwtcGFuZWwvbGliL2NsaS1zdGF0dXMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxNQUFNLENBQUMsT0FBUCxHQUNFO0lBQUEsYUFBQSxFQUFlLElBQWY7SUFFQSxRQUFBLEVBQVUsU0FBQyxLQUFEO2FBQ1IsSUFBSSxDQUFDLFFBQVEsQ0FBQyw0QkFBZCxDQUEyQyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7QUFDekMsY0FBQTtVQUFBLGFBQUEsR0FBZ0IsT0FBQSxDQUFRLG1CQUFSO1VBQ2hCLGlCQUFBLEdBQW9CLFNBQUE7bUJBQ2xCLEtBQUMsQ0FBQSxhQUFELEdBQXFCLElBQUEsYUFBQSxDQUFjLEtBQUssQ0FBQyxrQkFBcEI7VUFESDtpQkFFcEIsaUJBQUEsQ0FBQTtRQUp5QztNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBM0M7SUFEUSxDQUZWO0lBU0EsVUFBQSxFQUFZLFNBQUE7YUFDVixJQUFDLENBQUEsYUFBYSxDQUFDLE9BQWYsQ0FBQTtJQURVLENBVFo7SUFZQSxNQUFBLEVBQ0U7TUFBQSxjQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sU0FBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsRUFEVDtRQUVBLE9BQUEsRUFBUyxDQUZUO1FBR0EsT0FBQSxFQUFTLEVBSFQ7T0FERjtNQUtBLG1CQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sU0FBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsSUFEVDtPQU5GO01BUUEsWUFBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFNBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEtBRFQ7T0FURjtNQVdBLFlBQUEsRUFDRTtRQUFBLEtBQUEsRUFBTyxhQUFQO1FBQ0EsSUFBQSxFQUFNLFNBRE47UUFFQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLElBRlQ7T0FaRjtNQWVBLE9BQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxRQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBWSxPQUFPLENBQUMsUUFBUixLQUFvQixPQUF2QixHQUNMLFNBREssNkNBR2UsV0FKeEI7T0FoQkY7S0FiRjs7QUFERiIsInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID1cbiAgY2xpU3RhdHVzVmlldzogbnVsbFxuXG4gIGFjdGl2YXRlOiAoc3RhdGUpIC0+XG4gICAgYXRvbS5wYWNrYWdlcy5vbkRpZEFjdGl2YXRlSW5pdGlhbFBhY2thZ2VzID0+XG4gICAgICBDbGlTdGF0dXNWaWV3ID0gcmVxdWlyZSAnLi9jbGktc3RhdHVzLXZpZXcnXG4gICAgICBjcmVhdGVTdGF0dXNFbnRyeSA9ID0+XG4gICAgICAgIEBjbGlTdGF0dXNWaWV3ID0gbmV3IENsaVN0YXR1c1ZpZXcoc3RhdGUuY2xpU3RhdHVzVmlld1N0YXRlKVxuICAgICAgY3JlYXRlU3RhdHVzRW50cnkoKVxuXG4gIGRlYWN0aXZhdGU6IC0+XG4gICAgQGNsaVN0YXR1c1ZpZXcuZGVzdHJveSgpXG5cbiAgY29uZmlnOlxuICAgICd3aW5kb3dIZWlnaHQnOlxuICAgICAgdHlwZTogJ2ludGVnZXInXG4gICAgICBkZWZhdWx0OiAzMFxuICAgICAgbWluaW11bTogMFxuICAgICAgbWF4aW11bTogODBcbiAgICAnY2xlYXJDb21tYW5kSW5wdXQnOlxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiB0cnVlXG4gICAgJ2xvZ0NvbnNvbGUnOlxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiBmYWxzZVxuICAgICdvdmVycmlkZUxzJzpcbiAgICAgIHRpdGxlOiAnT3ZlcnJpZGUgbHMnXG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAnc2hlbGwnOlxuICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIGRlZmF1bHQ6IGlmIHByb2Nlc3MucGxhdGZvcm0gaXMgJ3dpbjMyJ1xuICAgICAgICAgICdjbWQuZXhlJ1xuICAgICAgICBlbHNlXG4gICAgICAgICAgcHJvY2Vzcy5lbnYuU0hFTEwgPyAnL2Jpbi9iYXNoJ1xuIl19
