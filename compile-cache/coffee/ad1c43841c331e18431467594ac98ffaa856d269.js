
/*
  Atom-terminal-panel
  Copyright by isis97
  MIT licensed

  The main plugin class.
 */

(function() {
  var ATPOutputView, ATPPanel, core, path;

  require('./atp-utils');

  path = include('path');

  ATPPanel = include('atp-panel');

  ATPOutputView = include('atp-view');

  core = include('atp-core');

  module.exports = {
    cliStatusView: null,
    callbacks: {
      onDidActivateInitialPackages: []
    },
    getPanel: function() {
      return this.cliStatusView;
    },
    activate: function(state) {
      this.cliStatusView = new ATPPanel(state.cliStatusViewState);
      return setTimeout(function() {
        return core.init();
      }, 0);
    },
    deactivate: function() {
      if (this.cliStatusView != null) {
        return this.cliStatusView.destroy();
      }
    },
    config: {
      'WindowHeight': {
        type: 'integer',
        description: 'Maximum height of a console window.',
        "default": 300
      },
      'enableWindowAnimations': {
        title: 'Enable window animations',
        description: 'Enable window animations.',
        type: 'boolean',
        "default": true
      },
      'useAtomIcons': {
        title: 'Use Atom icons',
        description: 'Uses only the icons used by the Atom. Otherwise the default terminal icons will be used.',
        type: 'boolean',
        "default": true
      },
      'clearCommandInput': {
        title: 'Clear command input',
        description: 'Always clear command input when opening terminal panel.',
        type: 'boolean',
        "default": true
      },
      'logConsole': {
        title: 'Log console',
        description: 'Log console output.',
        type: 'boolean',
        "default": false
      },
      'overrideLs': {
        title: 'Override ls',
        description: 'Override ls command (if this option is disabled the native version of ls is used)',
        type: 'boolean',
        "default": true
      },
      'enableExtendedCommands': {
        title: 'Enable extended built-in commands',
        description: 'Enable extended built-in commands (like ls override, cd or echo).',
        type: 'boolean',
        "default": true
      },
      'enableUserCommands': {
        title: 'Enable user commands',
        description: 'Enable user defined commands from terminal-commands.json file',
        type: 'boolean',
        "default": true
      },
      'enableConsoleInteractiveLinks': {
        title: 'Enable console interactive links',
        description: 'If this option is disabled or terminal links are not clickable (the file extensions will be coloured only)',
        type: 'boolean',
        "default": true
      },
      'enableConsoleInteractiveHints': {
        title: 'Enable console interactive hints',
        description: 'Enable terminal tooltips.',
        type: 'boolean',
        "default": true
      },
      'enableConsoleLabels': {
        title: 'Enable console labels (like %(label:info...), error, warning)',
        description: 'If this option is disabled all labels are removed.',
        type: 'boolean',
        "default": true
      },
      'enableConsoleStartupInfo': {
        title: 'Enable the console welcome message.',
        description: 'Always display welcome message when the terminal window is opened.',
        type: 'boolean',
        "default": true
      },
      'enableConsoleSuggestionsDropdown': {
        title: 'Enable the console suggestions list.',
        description: 'Makes the console display the suggested commands list in a dropdown list.',
        type: 'boolean',
        "default": true
      },
      'disabledExtendedCommands': {
        title: 'Disabled commands:',
        description: 'You can disable any command (it will be used as native).',
        type: 'array',
        "default": [],
        items: {
          type: 'string'
        }
      },
      'moveToCurrentDirOnOpen': {
        title: 'Always move to current directory',
        description: 'Always move to currently selected file\'s directory when the console is opened.',
        type: 'boolean',
        "default": true
      },
      'moveToCurrentDirOnOpenLS': {
        title: 'Always run \"ls\" in active console.',
        description: 'Always run \"ls\" command when the console is opened (slows down terminal a little).',
        type: 'boolean',
        "default": false
      },
      'parseSpecialTemplateTokens': {
        title: 'Enable the special tokens (like: %(path), %(day) etc.)',
        description: 'If this option is disabled all special tokens are removed.',
        type: 'boolean',
        "default": true
      },
      'commandPrompt': {
        title: 'The command prompt message.',
        description: 'Set the command prompt message.',
        type: 'string',
        "default": '%(dynamic) %(label:badge:text:%(line)) %(^#FF851B)%(hours):%(minutes):%(seconds)%(^) %(^#01FF70)%(hostname)%(^):%(^#DDDDDD)%(^#39CCCC)../%(path:-2)/%(path:-1)%(^)>%(^)'
      },
      'textReplacementCurrentPath': {
        title: 'Current working directory replacement',
        description: 'Replacement for the current working directory path at the console output.',
        type: 'string',
        "default": '[CWD]'
      },
      'textReplacementCurrentFile': {
        title: 'Currently edited file replacement',
        description: 'Replacement for the currently edited file at the console output.',
        type: 'string',
        "default": '%(link)%(file)%(endlink)'
      },
      'textReplacementFileAdress': {
        title: 'File adress replacement',
        description: 'Replacement for any file adress at the console output.',
        type: 'string',
        "default": '%(link)%(file)%(endlink)'
      },
      'statusBarText': {
        title: 'Status bar text',
        description: 'Text displayed on the terminal status bar.',
        type: 'string',
        "default": '%(dynamic) %(hostname) %(username) %(hours):%(minutes):%(seconds) %(ampm)'
      },
      'XExperimentEnableForceLinking': {
        title: 'EXPERIMENTAL: Enable auto links',
        description: 'Warning: This function is experimental, so it can be broken.',
        type: 'boolean',
        "default": false
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy91Y2hpaGEvLmF0b20vcGFja2FnZXMvYXRvbS10ZXJtaW5hbC1wYW5lbC9saWIvYXRwLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7O0FBQUE7QUFBQSxNQUFBOztFQVFBLE9BQUEsQ0FBUSxhQUFSOztFQUVBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFDUCxRQUFBLEdBQVcsT0FBQSxDQUFRLFdBQVI7O0VBQ1gsYUFBQSxHQUFnQixPQUFBLENBQVEsVUFBUjs7RUFDaEIsSUFBQSxHQUFPLE9BQUEsQ0FBUSxVQUFSOztFQUNQLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7SUFBQSxhQUFBLEVBQWUsSUFBZjtJQUNBLFNBQUEsRUFDRTtNQUFBLDRCQUFBLEVBQThCLEVBQTlCO0tBRkY7SUFJQSxRQUFBLEVBQVUsU0FBQTtBQUNSLGFBQU8sSUFBQyxDQUFBO0lBREEsQ0FKVjtJQU9BLFFBQUEsRUFBVSxTQUFDLEtBQUQ7TUFDUixJQUFDLENBQUEsYUFBRCxHQUFxQixJQUFBLFFBQUEsQ0FBUyxLQUFLLENBQUMsa0JBQWY7YUFDckIsVUFBQSxDQUFXLFNBQUE7ZUFDVCxJQUFJLENBQUMsSUFBTCxDQUFBO01BRFMsQ0FBWCxFQUVDLENBRkQ7SUFGUSxDQVBWO0lBYUEsVUFBQSxFQUFZLFNBQUE7TUFDVixJQUFHLDBCQUFIO2VBQ0UsSUFBQyxDQUFBLGFBQWEsQ0FBQyxPQUFmLENBQUEsRUFERjs7SUFEVSxDQWJaO0lBaUJBLE1BQUEsRUFDRTtNQUFBLGNBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxTQUFOO1FBQ0EsV0FBQSxFQUFhLHFDQURiO1FBRUEsQ0FBQSxPQUFBLENBQUEsRUFBUyxHQUZUO09BREY7TUFJQSx3QkFBQSxFQUNFO1FBQUEsS0FBQSxFQUFPLDBCQUFQO1FBQ0EsV0FBQSxFQUFhLDJCQURiO1FBRUEsSUFBQSxFQUFNLFNBRk47UUFHQSxD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O1FBQUEsS0FBQSxFQUFPLDZCQUFQO1FBQ0EsV0FBQSxFQUFhLGlDQURiO1FBRUEsSUFBQSxFQUFNLFFBRk47UUFHQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLHlLQUhUO09BdkZGO01BMkZBLDRCQUFBLEVBQ0U7UUFBQSxLQUFBLEVBQU8sdUNBQVA7UUFDQSxXQUFBLEVBQWEsMkVBRGI7UUFFQSxJQUFBLEVBQU0sUUFGTjtRQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsT0FIVDtPQTVGRjtNQWdHQSw0QkFBQSxFQUNFO1FBQUEsS0FBQSxFQUFPLG1DQUFQO1FBQ0EsV0FBQSxFQUFhLGtFQURiO1FBRUEsSUFBQSxFQUFNLFFBRk47UUFHQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLDBCQUhUO09BakdGO01BcUdBLDJCQUFBLEVBQ0U7UUFBQSxLQUFBLEVBQU8seUJBQVA7UUFDQSxXQUFBLEVBQWEsd0RBRGI7UUFFQSxJQUFBLEVBQU0sUUFGTjtRQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsMEJBSFQ7T0F0R0Y7TUEwR0EsZUFBQSxFQUNFO1FBQUEsS0FBQSxFQUFPLGlCQUFQO1FBQ0EsV0FBQSxFQUFhLDRDQURiO1FBRUEsSUFBQSxFQUFNLFFBRk47UUFHQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLDJFQUhUO09BM0dGO01BK0dBLCtCQUFBLEVBQ0U7UUFBQSxLQUFBLEVBQU8saUNBQVA7UUFDQSxXQUFBLEVBQWEsOERBRGI7UUFFQSxJQUFBLEVBQU0sU0FGTjtRQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsS0FIVDtPQWhIRjtLQWxCRjs7QUFmRiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuICBBdG9tLXRlcm1pbmFsLXBhbmVsXG4gIENvcHlyaWdodCBieSBpc2lzOTdcbiAgTUlUIGxpY2Vuc2VkXG5cbiAgVGhlIG1haW4gcGx1Z2luIGNsYXNzLlxuIyMjXG5cbnJlcXVpcmUgJy4vYXRwLXV0aWxzJ1xuXG5wYXRoID0gaW5jbHVkZSAncGF0aCdcbkFUUFBhbmVsID0gaW5jbHVkZSAnYXRwLXBhbmVsJ1xuQVRQT3V0cHV0VmlldyA9IGluY2x1ZGUgJ2F0cC12aWV3J1xuY29yZSA9IGluY2x1ZGUgJ2F0cC1jb3JlJ1xubW9kdWxlLmV4cG9ydHMgPVxuICBjbGlTdGF0dXNWaWV3OiBudWxsXG4gIGNhbGxiYWNrczpcbiAgICBvbkRpZEFjdGl2YXRlSW5pdGlhbFBhY2thZ2VzOiBbXVxuXG4gIGdldFBhbmVsOiAtPlxuICAgIHJldHVybiBAY2xpU3RhdHVzVmlld1xuXG4gIGFjdGl2YXRlOiAoc3RhdGUpIC0+XG4gICAgQGNsaVN0YXR1c1ZpZXcgPSBuZXcgQVRQUGFuZWwoc3RhdGUuY2xpU3RhdHVzVmlld1N0YXRlKVxuICAgIHNldFRpbWVvdXQgKCkgLT5cbiAgICAgIGNvcmUuaW5pdCgpXG4gICAgLDBcblxuICBkZWFjdGl2YXRlOiAtPlxuICAgIGlmIEBjbGlTdGF0dXNWaWV3P1xuICAgICAgQGNsaVN0YXR1c1ZpZXcuZGVzdHJveSgpXG5cbiAgY29uZmlnOlxuICAgICdXaW5kb3dIZWlnaHQnOlxuICAgICAgdHlwZTogJ2ludGVnZXInXG4gICAgICBkZXNjcmlwdGlvbjogJ01heGltdW0gaGVpZ2h0IG9mIGEgY29uc29sZSB3aW5kb3cuJ1xuICAgICAgZGVmYXVsdDogMzAwXG4gICAgJ2VuYWJsZVdpbmRvd0FuaW1hdGlvbnMnOlxuICAgICAgdGl0bGU6ICdFbmFibGUgd2luZG93IGFuaW1hdGlvbnMnXG4gICAgICBkZXNjcmlwdGlvbjogJ0VuYWJsZSB3aW5kb3cgYW5pbWF0aW9ucy4nXG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAndXNlQXRvbUljb25zJzpcbiAgICAgIHRpdGxlOiAnVXNlIEF0b20gaWNvbnMnXG4gICAgICBkZXNjcmlwdGlvbjogJ1VzZXMgb25seSB0aGUgaWNvbnMgdXNlZCBieSB0aGUgQXRvbS4gT3RoZXJ3aXNlIHRoZSBkZWZhdWx0IHRlcm1pbmFsIGljb25zIHdpbGwgYmUgdXNlZC4nXG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAnY2xlYXJDb21tYW5kSW5wdXQnOlxuICAgICAgdGl0bGU6ICdDbGVhciBjb21tYW5kIGlucHV0J1xuICAgICAgZGVzY3JpcHRpb246ICdBbHdheXMgY2xlYXIgY29tbWFuZCBpbnB1dCB3aGVuIG9wZW5pbmcgdGVybWluYWwgcGFuZWwuJ1xuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiB0cnVlXG4gICAgJ2xvZ0NvbnNvbGUnOlxuICAgICAgdGl0bGU6ICdMb2cgY29uc29sZSdcbiAgICAgIGRlc2NyaXB0aW9uOiAnTG9nIGNvbnNvbGUgb3V0cHV0LidcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICAnb3ZlcnJpZGVMcyc6XG4gICAgICB0aXRsZTogJ092ZXJyaWRlIGxzJ1xuICAgICAgZGVzY3JpcHRpb246ICdPdmVycmlkZSBscyBjb21tYW5kIChpZiB0aGlzIG9wdGlvbiBpcyBkaXNhYmxlZCB0aGUgbmF0aXZlIHZlcnNpb24gb2YgbHMgaXMgdXNlZCknXG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAnZW5hYmxlRXh0ZW5kZWRDb21tYW5kcyc6XG4gICAgICB0aXRsZTogJ0VuYWJsZSBleHRlbmRlZCBidWlsdC1pbiBjb21tYW5kcydcbiAgICAgIGRlc2NyaXB0aW9uOiAnRW5hYmxlIGV4dGVuZGVkIGJ1aWx0LWluIGNvbW1hbmRzIChsaWtlIGxzIG92ZXJyaWRlLCBjZCBvciBlY2hvKS4nXG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAnZW5hYmxlVXNlckNvbW1hbmRzJzpcbiAgICAgIHRpdGxlOiAnRW5hYmxlIHVzZXIgY29tbWFuZHMnXG4gICAgICBkZXNjcmlwdGlvbjogJ0VuYWJsZSB1c2VyIGRlZmluZWQgY29tbWFuZHMgZnJvbSB0ZXJtaW5hbC1jb21tYW5kcy5qc29uIGZpbGUnXG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAnZW5hYmxlQ29uc29sZUludGVyYWN0aXZlTGlua3MnOlxuICAgICAgdGl0bGU6ICdFbmFibGUgY29uc29sZSBpbnRlcmFjdGl2ZSBsaW5rcydcbiAgICAgIGRlc2NyaXB0aW9uOiAnSWYgdGhpcyBvcHRpb24gaXMgZGlzYWJsZWQgb3IgdGVybWluYWwgbGlua3MgYXJlIG5vdCBjbGlja2FibGUgKHRoZSBmaWxlIGV4dGVuc2lvbnMgd2lsbCBiZSBjb2xvdXJlZCBvbmx5KSdcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICdlbmFibGVDb25zb2xlSW50ZXJhY3RpdmVIaW50cyc6XG4gICAgICB0aXRsZTogJ0VuYWJsZSBjb25zb2xlIGludGVyYWN0aXZlIGhpbnRzJ1xuICAgICAgZGVzY3JpcHRpb246ICdFbmFibGUgdGVybWluYWwgdG9vbHRpcHMuJ1xuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiB0cnVlXG4gICAgJ2VuYWJsZUNvbnNvbGVMYWJlbHMnOlxuICAgICAgdGl0bGU6ICdFbmFibGUgY29uc29sZSBsYWJlbHMgKGxpa2UgJShsYWJlbDppbmZvLi4uKSwgZXJyb3IsIHdhcm5pbmcpJ1xuICAgICAgZGVzY3JpcHRpb246ICdJZiB0aGlzIG9wdGlvbiBpcyBkaXNhYmxlZCBhbGwgbGFiZWxzIGFyZSByZW1vdmVkLidcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICdlbmFibGVDb25zb2xlU3RhcnR1cEluZm8nOlxuICAgICAgdGl0bGU6ICdFbmFibGUgdGhlIGNvbnNvbGUgd2VsY29tZSBtZXNzYWdlLidcbiAgICAgIGRlc2NyaXB0aW9uOiAnQWx3YXlzIGRpc3BsYXkgd2VsY29tZSBtZXNzYWdlIHdoZW4gdGhlIHRlcm1pbmFsIHdpbmRvdyBpcyBvcGVuZWQuJ1xuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiB0cnVlXG4gICAgJ2VuYWJsZUNvbnNvbGVTdWdnZXN0aW9uc0Ryb3Bkb3duJzpcbiAgICAgIHRpdGxlOiAnRW5hYmxlIHRoZSBjb25zb2xlIHN1Z2dlc3Rpb25zIGxpc3QuJ1xuICAgICAgZGVzY3JpcHRpb246ICdNYWtlcyB0aGUgY29uc29sZSBkaXNwbGF5IHRoZSBzdWdnZXN0ZWQgY29tbWFuZHMgbGlzdCBpbiBhIGRyb3Bkb3duIGxpc3QuJ1xuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiB0cnVlXG4gICAgJ2Rpc2FibGVkRXh0ZW5kZWRDb21tYW5kcyc6XG4gICAgICB0aXRsZTogJ0Rpc2FibGVkIGNvbW1hbmRzOidcbiAgICAgIGRlc2NyaXB0aW9uOiAnWW91IGNhbiBkaXNhYmxlIGFueSBjb21tYW5kIChpdCB3aWxsIGJlIHVzZWQgYXMgbmF0aXZlKS4nXG4gICAgICB0eXBlOiAnYXJyYXknXG4gICAgICBkZWZhdWx0OiBbXVxuICAgICAgaXRlbXM6XG4gICAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgJ21vdmVUb0N1cnJlbnREaXJPbk9wZW4nOlxuICAgICAgdGl0bGU6ICdBbHdheXMgbW92ZSB0byBjdXJyZW50IGRpcmVjdG9yeSdcbiAgICAgIGRlc2NyaXB0aW9uOiAnQWx3YXlzIG1vdmUgdG8gY3VycmVudGx5IHNlbGVjdGVkIGZpbGVcXCdzIGRpcmVjdG9yeSB3aGVuIHRoZSBjb25zb2xlIGlzIG9wZW5lZC4nXG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAnbW92ZVRvQ3VycmVudERpck9uT3BlbkxTJzpcbiAgICAgIHRpdGxlOiAnQWx3YXlzIHJ1biBcXFwibHNcXFwiIGluIGFjdGl2ZSBjb25zb2xlLidcbiAgICAgIGRlc2NyaXB0aW9uOiAnQWx3YXlzIHJ1biBcXFwibHNcXFwiIGNvbW1hbmQgd2hlbiB0aGUgY29uc29sZSBpcyBvcGVuZWQgKHNsb3dzIGRvd24gdGVybWluYWwgYSBsaXR0bGUpLidcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICAncGFyc2VTcGVjaWFsVGVtcGxhdGVUb2tlbnMnOlxuICAgICAgdGl0bGU6ICdFbmFibGUgdGhlIHNwZWNpYWwgdG9rZW5zIChsaWtlOiAlKHBhdGgpLCAlKGRheSkgZXRjLiknXG4gICAgICBkZXNjcmlwdGlvbjogJ0lmIHRoaXMgb3B0aW9uIGlzIGRpc2FibGVkIGFsbCBzcGVjaWFsIHRva2VucyBhcmUgcmVtb3ZlZC4nXG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAnY29tbWFuZFByb21wdCc6XG4gICAgICB0aXRsZTogJ1RoZSBjb21tYW5kIHByb21wdCBtZXNzYWdlLidcbiAgICAgIGRlc2NyaXB0aW9uOiAnU2V0IHRoZSBjb21tYW5kIHByb21wdCBtZXNzYWdlLidcbiAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICBkZWZhdWx0OiAnJShkeW5hbWljKSAlKGxhYmVsOmJhZGdlOnRleHQ6JShsaW5lKSkgJSheI0ZGODUxQiklKGhvdXJzKTolKG1pbnV0ZXMpOiUoc2Vjb25kcyklKF4pICUoXiMwMUZGNzApJShob3N0bmFtZSklKF4pOiUoXiNEREREREQpJSheIzM5Q0NDQykuLi8lKHBhdGg6LTIpLyUocGF0aDotMSklKF4pPiUoXiknXG4gICAgJ3RleHRSZXBsYWNlbWVudEN1cnJlbnRQYXRoJzpcbiAgICAgIHRpdGxlOiAnQ3VycmVudCB3b3JraW5nIGRpcmVjdG9yeSByZXBsYWNlbWVudCdcbiAgICAgIGRlc2NyaXB0aW9uOiAnUmVwbGFjZW1lbnQgZm9yIHRoZSBjdXJyZW50IHdvcmtpbmcgZGlyZWN0b3J5IHBhdGggYXQgdGhlIGNvbnNvbGUgb3V0cHV0LidcbiAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICBkZWZhdWx0OiAnW0NXRF0nXG4gICAgJ3RleHRSZXBsYWNlbWVudEN1cnJlbnRGaWxlJzpcbiAgICAgIHRpdGxlOiAnQ3VycmVudGx5IGVkaXRlZCBmaWxlIHJlcGxhY2VtZW50J1xuICAgICAgZGVzY3JpcHRpb246ICdSZXBsYWNlbWVudCBmb3IgdGhlIGN1cnJlbnRseSBlZGl0ZWQgZmlsZSBhdCB0aGUgY29uc29sZSBvdXRwdXQuJ1xuICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIGRlZmF1bHQ6ICclKGxpbmspJShmaWxlKSUoZW5kbGluayknXG4gICAgJ3RleHRSZXBsYWNlbWVudEZpbGVBZHJlc3MnOlxuICAgICAgdGl0bGU6ICdGaWxlIGFkcmVzcyByZXBsYWNlbWVudCdcbiAgICAgIGRlc2NyaXB0aW9uOiAnUmVwbGFjZW1lbnQgZm9yIGFueSBmaWxlIGFkcmVzcyBhdCB0aGUgY29uc29sZSBvdXRwdXQuJ1xuICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIGRlZmF1bHQ6ICclKGxpbmspJShmaWxlKSUoZW5kbGluayknXG4gICAgJ3N0YXR1c0JhclRleHQnOlxuICAgICAgdGl0bGU6ICdTdGF0dXMgYmFyIHRleHQnXG4gICAgICBkZXNjcmlwdGlvbjogJ1RleHQgZGlzcGxheWVkIG9uIHRoZSB0ZXJtaW5hbCBzdGF0dXMgYmFyLidcbiAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICBkZWZhdWx0OiAnJShkeW5hbWljKSAlKGhvc3RuYW1lKSAlKHVzZXJuYW1lKSAlKGhvdXJzKTolKG1pbnV0ZXMpOiUoc2Vjb25kcykgJShhbXBtKSdcbiAgICAnWEV4cGVyaW1lbnRFbmFibGVGb3JjZUxpbmtpbmcnOlxuICAgICAgdGl0bGU6ICdFWFBFUklNRU5UQUw6IEVuYWJsZSBhdXRvIGxpbmtzJ1xuICAgICAgZGVzY3JpcHRpb246ICdXYXJuaW5nOiBUaGlzIGZ1bmN0aW9uIGlzIGV4cGVyaW1lbnRhbCwgc28gaXQgY2FuIGJlIGJyb2tlbi4nXG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IGZhbHNlXG4iXX0=
