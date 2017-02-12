
/*
  Atom-terminal-panel
  Copyright by isis97
  MIT licensed

  The very basic class, which handles the configuration files, loads up commands and
  answers all the commands requests generated by terminal instance.
 */

(function() {
  var ATPCore, dirname, extname, fs, ref, resolve;

  ref = include('path'), resolve = ref.resolve, dirname = ref.dirname, extname = ref.extname;

  fs = include('fs');

  ATPCore = (function() {
    function ATPCore() {}

    ATPCore.prototype.state = {
      config: {},
      statePath: null,
      opened: false,
      customCommands: {},
      defaultCommands: {
        "hello_world": {
          "description": "Prints the hello world message to the terminal output.",
          "command": ["echo Hello world :D", "echo This is", "echo example usage", "echo of the console"]
        }
      }
    };

    ATPCore.prototype.createDefaultCommandsFile = function() {
      var content, e, initialContent;
      if (atom.config.get('atom-terminal-panel.enableUserCommands')) {
        try {
          initialContent = {
            '_comment': 'Package atom-terminal-panel: This terminal-commands.json file was automatically generated by atom-terminal-package. It contains all useful config data.',
            commands: this.state.defaultCommands,
            actions: [],
            toolbar: [["clear", "clear", "Clears the console output."], ["info", "info", "Prints the terminal welcome message."], ["all available commands", "memdump", "Displays all available builtin commands. (all commands except native)"]],
            rules: {
              "\\b[A-Z][A-Z]+\\b": {
                'match': {
                  'flags': ['g']
                },
                'css': {
                  'color': 'gray'
                }
              },
              '(error|err):? (.*)': {
                'match': {
                  'matchLine': true,
                  'replace': '%(label:error:text:Error) %(0)'
                },
                'css': {
                  'color': 'red',
                  'font-weight': 'bold'
                }
              },
              '(warning|warn|alert):? (.*)': {
                'match': {
                  'matchLine': true,
                  'replace': '%(label:warning:text:Warning) %(0)'
                },
                'css': {
                  'color': 'yellow'
                }
              },
              '(note|info):? (.*)': {
                'match': {
                  'matchLine': true,
                  'replace': '%(label:info:text:Info) %(0)'
                },
                'css': {}
              },
              '(debug|dbg):? (.*)': {
                'match': {
                  'matchLine': true,
                  'replace': '%(label:default:text:Debug) %(0)'
                },
                'css': {
                  'color': 'gray'
                }
              }
            }
          };
          content = JSON.stringify(initialContent, null, '\t');
          return fs.writeFileSync(this.state.statePath, content);
        } catch (error) {
          e = error;
          return console.log('atp-core cannot create default terminal commands JSON file', e.message);
        }
      }
    };

    ATPCore.prototype.reload = function() {
      this.state.opended = false;
      return this.init();
    };

    ATPCore.prototype.init = function() {
      var e;
      if (!this.state.opended) {
        this.state.opened = true;
        this.state.statePath = dirname(atom.config.getUserConfigPath()) + '/terminal-commands.json';
        try {
          this.state.config = JSON.parse(fs.readFileSync(this.state.statePath));
        } catch (error) {
          e = error;
          console.log('atp-core cannot reload terminal config file: invalid content', e.message);
          atom.notifications.addWarning("atom-terminal-panel: Could not load the config file. The new file will be created. Reason: " + e.message);
          this.state.opened = false;
        }
        if (!this.state.opened) {
          this.createDefaultCommandsFile();
          this.state.opened = true;
          this.state.customCommands = this.state.defaultCommands;
        } else {
          this.state.customCommands = this.state.config.commands;
        }
      }
      return this;
    };

    ATPCore.prototype.jsonCssToInlineStyle = function(obj) {
      var key, ret, value;
      if (obj instanceof String) {
        return obj;
      }
      ret = '';
      for (key in obj) {
        value = obj[key];
        if ((key != null) && (value != null)) {
          ret += key + ':' + value + ';';
        }
      }
      return ret;
    };

    ATPCore.prototype.getConfig = function() {
      return this.state.config;
    };

    ATPCore.prototype.getUserCommands = function() {
      if (atom.config.get('atom-terminal-panel.enableUserCommands')) {
        return this.state.customCommands;
      }
      return null;
    };

    ATPCore.prototype.findUserCommandAction = function(cmd) {
      var code, name, ref1;
      if (!atom.config.get('atom-terminal-panel.enableUserCommands')) {
        return null;
      }
      ref1 = this.state.customCommands;
      for (name in ref1) {
        code = ref1[name];
        if (name === cmd) {
          if (code.command != null) {
            return code.command;
          }
          return code;
        }
      }
      return null;
    };

    ATPCore.prototype.findUserCommand = function(cmd) {
      var action;
      if (!atom.config.get('atom-terminal-panel.enableUserCommands')) {
        return null;
      }
      action = this.findUserCommandAction(cmd);
      if (action == null) {
        return null;
      }
      return function(state, args) {
        return state.execDelayedCommand(1, action, args, state);
      };
    };

    return ATPCore;

  })();

  module.exports = new ATPCore().init();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy91Y2hpaGEvLmF0b20vcGFja2FnZXMvYXRvbS10ZXJtaW5hbC1wYW5lbC9saWIvYXRwLWNvcmUuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7Ozs7O0FBQUE7QUFBQSxNQUFBOztFQVNBLE1BQThCLE9BQUEsQ0FBUSxNQUFSLENBQTlCLEVBQUMscUJBQUQsRUFBVSxxQkFBVixFQUFtQjs7RUFDbkIsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSOztFQUVDOzs7c0JBRUosS0FBQSxHQUNFO01BQUEsTUFBQSxFQUFRLEVBQVI7TUFDQSxTQUFBLEVBQVcsSUFEWDtNQUVBLE1BQUEsRUFBUSxLQUZSO01BR0EsY0FBQSxFQUFnQixFQUhoQjtNQUlBLGVBQUEsRUFDRTtRQUFBLGFBQUEsRUFBZTtVQUNiLGFBQUEsRUFBZSx3REFERjtVQUViLFNBQUEsRUFBVyxDQUNULHFCQURTLEVBRVQsY0FGUyxFQUdULG9CQUhTLEVBSVQscUJBSlMsQ0FGRTtTQUFmO09BTEY7OztzQkFlRix5QkFBQSxHQUEyQixTQUFBO0FBQ3pCLFVBQUE7TUFBQSxJQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQix3Q0FBaEIsQ0FBSDtBQUNFO1VBQ0UsY0FBQSxHQUFpQjtZQUNmLFVBQUEsRUFBWSx5SkFERztZQUVmLFFBQUEsRUFBVSxJQUFDLENBQUEsS0FBSyxDQUFDLGVBRkY7WUFHZixPQUFBLEVBQVMsRUFITTtZQUlmLE9BQUEsRUFBUyxDQUNQLENBQUMsT0FBRCxFQUFVLE9BQVYsRUFBbUIsNEJBQW5CLENBRE8sRUFFUCxDQUFDLE1BQUQsRUFBUyxNQUFULEVBQWlCLHNDQUFqQixDQUZPLEVBR1AsQ0FBQyx3QkFBRCxFQUEyQixTQUEzQixFQUFzQyx1RUFBdEMsQ0FITyxDQUpNO1lBU2YsS0FBQSxFQUFPO2NBQ0wsbUJBQUEsRUFBcUI7Z0JBQ25CLE9BQUEsRUFBUztr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QSxDQUFTLENBQUMsSUFBVixDQUFBO0FBekpyQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuICBBdG9tLXRlcm1pbmFsLXBhbmVsXG4gIENvcHlyaWdodCBieSBpc2lzOTdcbiAgTUlUIGxpY2Vuc2VkXG5cbiAgVGhlIHZlcnkgYmFzaWMgY2xhc3MsIHdoaWNoIGhhbmRsZXMgdGhlIGNvbmZpZ3VyYXRpb24gZmlsZXMsIGxvYWRzIHVwIGNvbW1hbmRzIGFuZFxuICBhbnN3ZXJzIGFsbCB0aGUgY29tbWFuZHMgcmVxdWVzdHMgZ2VuZXJhdGVkIGJ5IHRlcm1pbmFsIGluc3RhbmNlLlxuIyMjXG5cbntyZXNvbHZlLCBkaXJuYW1lLCBleHRuYW1lfSA9IGluY2x1ZGUgJ3BhdGgnXG5mcyA9IGluY2x1ZGUgJ2ZzJ1xuXG5jbGFzcyBBVFBDb3JlXG5cbiAgc3RhdGU6XG4gICAgY29uZmlnOiB7fVxuICAgIHN0YXRlUGF0aDogbnVsbFxuICAgIG9wZW5lZDogZmFsc2VcbiAgICBjdXN0b21Db21tYW5kczoge31cbiAgICBkZWZhdWx0Q29tbWFuZHM6XG4gICAgICBcImhlbGxvX3dvcmxkXCI6IHtcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIlByaW50cyB0aGUgaGVsbG8gd29ybGQgbWVzc2FnZSB0byB0aGUgdGVybWluYWwgb3V0cHV0LlwiXG4gICAgICAgIFwiY29tbWFuZFwiOiBbXG4gICAgICAgICAgXCJlY2hvIEhlbGxvIHdvcmxkIDpEXCIsXG4gICAgICAgICAgXCJlY2hvIFRoaXMgaXNcIixcbiAgICAgICAgICBcImVjaG8gZXhhbXBsZSB1c2FnZVwiLFxuICAgICAgICAgIFwiZWNobyBvZiB0aGUgY29uc29sZVwiXG4gICAgICAgIF1cbiAgICAgIH1cblxuICBjcmVhdGVEZWZhdWx0Q29tbWFuZHNGaWxlOiAoKSAtPlxuICAgIGlmIGF0b20uY29uZmlnLmdldCgnYXRvbS10ZXJtaW5hbC1wYW5lbC5lbmFibGVVc2VyQ29tbWFuZHMnKVxuICAgICAgdHJ5XG4gICAgICAgIGluaXRpYWxDb250ZW50ID0ge1xuICAgICAgICAgICdfY29tbWVudCc6ICdQYWNrYWdlIGF0b20tdGVybWluYWwtcGFuZWw6IFRoaXMgdGVybWluYWwtY29tbWFuZHMuanNvbiBmaWxlIHdhcyBhdXRvbWF0aWNhbGx5IGdlbmVyYXRlZCBieSBhdG9tLXRlcm1pbmFsLXBhY2thZ2UuIEl0IGNvbnRhaW5zIGFsbCB1c2VmdWwgY29uZmlnIGRhdGEuJ1xuICAgICAgICAgIGNvbW1hbmRzOiBAc3RhdGUuZGVmYXVsdENvbW1hbmRzXG4gICAgICAgICAgYWN0aW9uczogW11cbiAgICAgICAgICB0b29sYmFyOiBbXG4gICAgICAgICAgICBbXCJjbGVhclwiLCBcImNsZWFyXCIsIFwiQ2xlYXJzIHRoZSBjb25zb2xlIG91dHB1dC5cIl0sXG4gICAgICAgICAgICBbXCJpbmZvXCIsIFwiaW5mb1wiLCBcIlByaW50cyB0aGUgdGVybWluYWwgd2VsY29tZSBtZXNzYWdlLlwiXSxcbiAgICAgICAgICAgIFtcImFsbCBhdmFpbGFibGUgY29tbWFuZHNcIiwgXCJtZW1kdW1wXCIsIFwiRGlzcGxheXMgYWxsIGF2YWlsYWJsZSBidWlsdGluIGNvbW1hbmRzLiAoYWxsIGNvbW1hbmRzIGV4Y2VwdCBuYXRpdmUpXCJdXG4gICAgICAgICAgXVxuICAgICAgICAgIHJ1bGVzOiB7XG4gICAgICAgICAgICBcIlxcXFxiW0EtWl1bQS1aXStcXFxcYlwiOiB7XG4gICAgICAgICAgICAgICdtYXRjaCc6IHtcbiAgICAgICAgICAgICAgICAnZmxhZ3MnOiBbJ2cnXVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICdjc3MnOiB7XG4gICAgICAgICAgICAgICAgJ2NvbG9yJzonZ3JheSdcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgJyhlcnJvcnxlcnIpOj8gKC4qKSc6IHtcbiAgICAgICAgICAgICAgJ21hdGNoJzoge1xuICAgICAgICAgICAgICAgICdtYXRjaExpbmUnOiB0cnVlXG4gICAgICAgICAgICAgICAgJ3JlcGxhY2UnOiAnJShsYWJlbDplcnJvcjp0ZXh0OkVycm9yKSAlKDApJ1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICdjc3MnOiB7XG4gICAgICAgICAgICAgICAgJ2NvbG9yJzogJ3JlZCdcbiAgICAgICAgICAgICAgICAnZm9udC13ZWlnaHQnOiAnYm9sZCdcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgJyh3YXJuaW5nfHdhcm58YWxlcnQpOj8gKC4qKSc6IHtcbiAgICAgICAgICAgICAgJ21hdGNoJzoge1xuICAgICAgICAgICAgICAgICdtYXRjaExpbmUnOiB0cnVlXG4gICAgICAgICAgICAgICAgJ3JlcGxhY2UnOiAnJShsYWJlbDp3YXJuaW5nOnRleHQ6V2FybmluZykgJSgwKSdcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAnY3NzJzoge1xuICAgICAgICAgICAgICAgICdjb2xvcic6ICd5ZWxsb3cnXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICcobm90ZXxpbmZvKTo/ICguKiknOiB7XG4gICAgICAgICAgICAgICdtYXRjaCc6IHtcbiAgICAgICAgICAgICAgICAnbWF0Y2hMaW5lJzogdHJ1ZVxuICAgICAgICAgICAgICAgICdyZXBsYWNlJzogJyUobGFiZWw6aW5mbzp0ZXh0OkluZm8pICUoMCknXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgJ2Nzcyc6IHtcblxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAnKGRlYnVnfGRiZyk6PyAoLiopJzoge1xuICAgICAgICAgICAgICAnbWF0Y2gnOiB7XG4gICAgICAgICAgICAgICAgJ21hdGNoTGluZSc6IHRydWVcbiAgICAgICAgICAgICAgICAncmVwbGFjZSc6ICclKGxhYmVsOmRlZmF1bHQ6dGV4dDpEZWJ1ZykgJSgwKSdcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAnY3NzJzoge1xuICAgICAgICAgICAgICAgICdjb2xvcic6ICdncmF5J1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNvbnRlbnQgPSBKU09OLnN0cmluZ2lmeSBpbml0aWFsQ29udGVudCwgbnVsbCwgJ1xcdCdcbiAgICAgICAgZnMud3JpdGVGaWxlU3luYyBAc3RhdGUuc3RhdGVQYXRoLCBjb250ZW50XG4gICAgICBjYXRjaCBlXG4gICAgICAgIGNvbnNvbGUubG9nICdhdHAtY29yZSBjYW5ub3QgY3JlYXRlIGRlZmF1bHQgdGVybWluYWwgY29tbWFuZHMgSlNPTiBmaWxlJywgZS5tZXNzYWdlXG5cbiAgcmVsb2FkOiAoKSAtPlxuICAgIEBzdGF0ZS5vcGVuZGVkID0gZmFsc2VcbiAgICBAaW5pdCgpXG5cbiAgaW5pdDogKCkgLT5cbiAgICBpZiBub3QgQHN0YXRlLm9wZW5kZWRcbiAgICAgIEBzdGF0ZS5vcGVuZWQgPSB0cnVlXG4gICAgICBAc3RhdGUuc3RhdGVQYXRoID0gZGlybmFtZShhdG9tLmNvbmZpZy5nZXRVc2VyQ29uZmlnUGF0aCgpKSArICcvdGVybWluYWwtY29tbWFuZHMuanNvbidcbiAgICAgIHRyeVxuICAgICAgICBAc3RhdGUuY29uZmlnID0gSlNPTi5wYXJzZSBmcy5yZWFkRmlsZVN5bmMgQHN0YXRlLnN0YXRlUGF0aFxuICAgICAgY2F0Y2ggZVxuICAgICAgICBjb25zb2xlLmxvZyAnYXRwLWNvcmUgY2Fubm90IHJlbG9hZCB0ZXJtaW5hbCBjb25maWcgZmlsZTogaW52YWxpZCBjb250ZW50JywgZS5tZXNzYWdlXG4gICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nIFwiYXRvbS10ZXJtaW5hbC1wYW5lbDogQ291bGQgbm90IGxvYWQgdGhlIGNvbmZpZyBmaWxlLiBUaGUgbmV3IGZpbGUgd2lsbCBiZSBjcmVhdGVkLiBSZWFzb246IFwiK2UubWVzc2FnZVxuICAgICAgICBAc3RhdGUub3BlbmVkID0gbm9cbiAgICAgIGlmIG5vdCBAc3RhdGUub3BlbmVkXG4gICAgICAgIEBjcmVhdGVEZWZhdWx0Q29tbWFuZHNGaWxlKClcbiAgICAgICAgQHN0YXRlLm9wZW5lZCA9IHRydWVcbiAgICAgICAgQHN0YXRlLmN1c3RvbUNvbW1hbmRzID0gQHN0YXRlLmRlZmF1bHRDb21tYW5kc1xuICAgICAgZWxzZVxuICAgICAgICBAc3RhdGUuY3VzdG9tQ29tbWFuZHMgPSBAc3RhdGUuY29uZmlnLmNvbW1hbmRzXG4gICAgcmV0dXJuIHRoaXNcblxuICBqc29uQ3NzVG9JbmxpbmVTdHlsZTogKG9iaikgLT5cbiAgICBpZiBvYmogaW5zdGFuY2VvZiBTdHJpbmdcbiAgICAgIHJldHVybiBvYmpcbiAgICByZXQgPSAnJ1xuICAgIGZvciBrZXksIHZhbHVlIG9mIG9ialxuICAgICAgaWYga2V5PyBhbmQgdmFsdWU/XG4gICAgICAgIHJldCArPSBrZXkgKyAnOicgKyB2YWx1ZSArICc7J1xuICAgIHJldHVybiByZXRcblxuICBnZXRDb25maWc6ICgpIC0+XG4gICAgcmV0dXJuIEBzdGF0ZS5jb25maWdcblxuICBnZXRVc2VyQ29tbWFuZHM6ICgpIC0+XG4gICAgaWYgYXRvbS5jb25maWcuZ2V0KCdhdG9tLXRlcm1pbmFsLXBhbmVsLmVuYWJsZVVzZXJDb21tYW5kcycpXG4gICAgICByZXR1cm4gQHN0YXRlLmN1c3RvbUNvbW1hbmRzXG4gICAgcmV0dXJuIG51bGxcblxuICBmaW5kVXNlckNvbW1hbmRBY3Rpb246IChjbWQpIC0+XG4gICAgaWYgbm90IGF0b20uY29uZmlnLmdldCgnYXRvbS10ZXJtaW5hbC1wYW5lbC5lbmFibGVVc2VyQ29tbWFuZHMnKVxuICAgICAgcmV0dXJuIG51bGxcbiAgICBmb3IgbmFtZSwgY29kZSBvZiBAc3RhdGUuY3VzdG9tQ29tbWFuZHNcbiAgICAgIGlmIG5hbWUgPT0gY21kXG4gICAgICAgIGlmIGNvZGUuY29tbWFuZD9cbiAgICAgICAgICByZXR1cm4gY29kZS5jb21tYW5kXG4gICAgICAgIHJldHVybiBjb2RlXG4gICAgcmV0dXJuIG51bGxcblxuICBmaW5kVXNlckNvbW1hbmQ6IChjbWQpIC0+XG4gICAgaWYgbm90IGF0b20uY29uZmlnLmdldCgnYXRvbS10ZXJtaW5hbC1wYW5lbC5lbmFibGVVc2VyQ29tbWFuZHMnKVxuICAgICAgcmV0dXJuIG51bGxcbiAgICBhY3Rpb24gPSBAZmluZFVzZXJDb21tYW5kQWN0aW9uKGNtZClcbiAgICBpZiBub3QgYWN0aW9uP1xuICAgICAgcmV0dXJuIG51bGxcbiAgICByZXR1cm4gKHN0YXRlLCBhcmdzKSAtPlxuICAgICAgcmV0dXJuIHN0YXRlLmV4ZWNEZWxheWVkQ29tbWFuZCAxLCBhY3Rpb24sIGFyZ3MsIHN0YXRlXG5cbm1vZHVsZS5leHBvcnRzID0gbmV3IEFUUENvcmUoKS5pbml0KClcbiJdfQ==