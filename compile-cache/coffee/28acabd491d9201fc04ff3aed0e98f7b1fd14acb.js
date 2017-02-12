(function() {
  var BufferedProcess, CompositeDisposable, PhpCsFixer, fs, path;

  CompositeDisposable = require('atom').CompositeDisposable;

  BufferedProcess = require('atom').BufferedProcess;

  fs = require('fs');

  path = require('path');

  module.exports = PhpCsFixer = {
    subscriptions: null,
    config: {
      phpExecutablePath: {
        title: 'PHP executable path',
        type: 'string',
        "default": 'php',
        description: 'The path to the `php` executable.',
        order: 10
      },
      phpArguments: {
        title: 'Add PHP arguments',
        type: 'array',
        "default": [],
        description: 'Add arguments, like for example `-n`, to the PHP executable.',
        order: 11
      },
      executablePath: {
        title: 'PHP-CS-fixer executable path',
        type: 'string',
        "default": 'php-cs-fixer',
        description: 'The path to the `php-cs-fixer` executable.',
        order: 20
      },
      rules: {
        title: 'PHP-CS-Fixer Rules',
        type: 'string',
        "default": '@PSR2',
        description: 'A list of rules (based on php-cs-fixer 2.0), for example: `@PSR2,no_short_echo_tag,indentation_type`. See <https://github.com/FriendsOfPHP/PHP-CS-Fixer#usage> for a complete list. Will be ignored if a config file is used.',
        order: 21
      },
      allowRisky: {
        title: 'Allow risky',
        type: 'boolean',
        "default": false,
        description: 'Option allows you to set whether risky rules may run. Will be ignored if a config file is used.',
        order: 22
      },
      pathMode: {
        title: 'PHP-CS-Fixer Path-Mode',
        type: 'string',
        "default": 'override',
        "enum": ['override', 'intersection'],
        description: 'Specify path mode (can be override or intersection).',
        order: 23
      },
      fixerArguments: {
        title: 'PHP-CS-Fixer arguments',
        type: 'array',
        "default": ['--using-cache=no', '--no-interaction'],
        description: 'Add arguments, like for example `--using-cache=false`, to the PHP-CS-Fixer executable. Run `php-cs-fixer help fix` in your command line, to get a full list of all supported arguments.',
        order: 24
      },
      configPath: {
        title: 'PHP-CS-fixer config file path',
        type: 'string',
        "default": '',
        description: 'Optionally provide the path to the `.php_cs` config file, if the path is not provided it will be loaded from the root path of the current project.',
        order: 25
      },
      executeOnSave: {
        title: 'Execute on save',
        type: 'boolean',
        "default": false,
        description: 'Execute PHP CS fixer on save',
        order: 30
      },
      showInfoNotifications: {
        title: 'Show notifications',
        type: 'boolean',
        "default": false,
        description: 'Show some status informations from the last "fix".',
        order: 31
      }
    },
    activate: function(state) {
      atom.config.observe('php-cs-fixer.executeOnSave', (function(_this) {
        return function() {
          return _this.executeOnSave = atom.config.get('php-cs-fixer.executeOnSave');
        };
      })(this));
      atom.config.observe('php-cs-fixer.phpExecutablePath', (function(_this) {
        return function() {
          return _this.phpExecutablePath = atom.config.get('php-cs-fixer.phpExecutablePath');
        };
      })(this));
      atom.config.observe('php-cs-fixer.executablePath', (function(_this) {
        return function() {
          return _this.executablePath = atom.config.get('php-cs-fixer.executablePath');
        };
      })(this));
      atom.config.observe('php-cs-fixer.configPath', (function(_this) {
        return function() {
          return _this.configPath = atom.config.get('php-cs-fixer.configPath');
        };
      })(this));
      atom.config.observe('php-cs-fixer.allowRisky', (function(_this) {
        return function() {
          return _this.allowRisky = atom.config.get('php-cs-fixer.allowRisky');
        };
      })(this));
      atom.config.observe('php-cs-fixer.rules', (function(_this) {
        return function() {
          return _this.rules = atom.config.get('php-cs-fixer.rules');
        };
      })(this));
      atom.config.observe('php-cs-fixer.showInfoNotifications', (function(_this) {
        return function() {
          return _this.showInfoNotifications = atom.config.get('php-cs-fixer.showInfoNotifications');
        };
      })(this));
      atom.config.observe('php-cs-fixer.phpArguments', (function(_this) {
        return function() {
          return _this.phpArguments = atom.config.get('php-cs-fixer.phpArguments');
        };
      })(this));
      atom.config.observe('php-cs-fixer.fixerArguments', (function(_this) {
        return function() {
          return _this.fixerArguments = atom.config.get('php-cs-fixer.fixerArguments');
        };
      })(this));
      atom.config.observe('php-cs-fixer.pathMode', (function(_this) {
        return function() {
          return _this.pathMode = atom.config.get('php-cs-fixer.pathMode');
        };
      })(this));
      this.subscriptions = new CompositeDisposable;
      this.subscriptions.add(atom.commands.add('atom-workspace', {
        'php-cs-fixer:fix': (function(_this) {
          return function() {
            return _this.fix();
          };
        })(this)
      }));
      return this.subscriptions.add(atom.workspace.observeTextEditors((function(_this) {
        return function(editor) {
          return _this.subscriptions.add(editor.getBuffer().onWillSave(function() {
            if (editor.getGrammar().name === "PHP" && _this.executeOnSave) {
              return _this.fix();
            }
          }));
        };
      })(this)));
    },
    deactivate: function() {
      return this.subscriptions.dispose();
    },
    fix: function() {
      var args, command, configPath, editor, exit, filePath, fixerArgs, process, stderr, stdout;
      editor = atom.workspace.getActivePaneItem();
      if (editor && editor.getPath) {
        filePath = editor.getPath();
      }
      command = this.phpExecutablePath;
      args = [];
      if (this.phpArguments.length) {
        if (this.phpArguments.length > 1) {
          args = this.phpArguments;
        } else {
          args = this.phpArguments[0].split(' ');
        }
      }
      args = args.concat([this.executablePath, 'fix', filePath]);
      if (this.configPath) {
        args.push('--config=' + this.configPath);
      } else if (configPath = this.findFile(path.dirname(filePath), ['.php_cs', '.php_cs.dist'])) {
        args.push('--config=' + configPath);
      }
      if (this.allowRisky && !configPath) {
        args.push('--allow-risky=yes');
      }
      if (this.rules && !configPath) {
        args.push('--rules=' + this.rules);
      }
      if (this.pathMode) {
        args.push('--path-mode=' + this.pathMode);
      }
      if (this.fixerArguments.length && !configPath) {
        if (this.fixerArguments.length > 1) {
          fixerArgs = this.fixerArguments;
        } else {
          fixerArgs = this.fixerArguments[0].split(' ');
        }
        args = args.concat(fixerArgs);
      }
      console.debug('php-cs-fixer Command', command);
      console.debug('php-cs-fixer Arguments', args);
      stdout = function(output) {
        if (PhpCsFixer.showInfoNotifications) {
          if (/^\s*\d*[)]/.test(output)) {
            atom.notifications.addSuccess(output);
          } else {
            atom.notifications.addInfo(output);
          }
        }
        return console.log(output);
      };
      stderr = function(output) {
        if (PhpCsFixer.showInfoNotifications) {
          if (output.replace(/\s/g, "") === "") {

          } else if (/^Loaded config/.test(output)) {
            atom.notifications.addInfo(output);
          } else {
            atom.notifications.addError(output);
          }
        }
        return console.error(output);
      };
      exit = function(code) {
        return console.log(command + " exited with code: " + code);
      };
      if (filePath) {
        return process = new BufferedProcess({
          command: command,
          args: args,
          stdout: stdout,
          stderr: stderr,
          exit: exit
        });
      }
    },
    findFile: function(startDir, names) {
      var currentDir, filePath, i, len, name;
      if (!arguments.length) {
        throw new Error("Specify a filename to find");
      }
      if (!(names instanceof Array)) {
        names = [names];
      }
      startDir = startDir.split(path.sep);
      while (startDir.length) {
        currentDir = startDir.join(path.sep);
        for (i = 0, len = names.length; i < len; i++) {
          name = names[i];
          filePath = path.join(currentDir, name);
          try {
            fs.accessSync(filePath, fs.R_OK);
            return filePath;
          } catch (error) {}
        }
        startDir.pop();
      }
      return null;
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy91Y2hpaGEvLmF0b20vcGFja2FnZXMvcGhwLWNzLWZpeGVyL2xpYi9waHAtY3MtZml4ZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQyxzQkFBdUIsT0FBQSxDQUFRLE1BQVI7O0VBQ3ZCLGtCQUFtQixPQUFBLENBQVEsTUFBUjs7RUFDcEIsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSOztFQUNMLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFFUCxNQUFNLENBQUMsT0FBUCxHQUFpQixVQUFBLEdBQ2Y7SUFBQSxhQUFBLEVBQWUsSUFBZjtJQUNBLE1BQUEsRUFDRTtNQUFBLGlCQUFBLEVBQ0U7UUFBQSxLQUFBLEVBQU8scUJBQVA7UUFDQSxJQUFBLEVBQU0sUUFETjtRQUVBLENBQUEsT0FBQSxDQUFBLEVBQVMsS0FGVDtRQUdBLFdBQUEsRUFBYSxtQ0FIYjtRQUlBLEtBQUEsRUFBTyxFQUpQO09BREY7TUFNQSxZQUFBLEVBQ0U7UUFBQSxLQUFBLEVBQU8sbUJBQVA7UUFDQSxJQUFBLEVBQU0sT0FETjtRQUVBLENBQUEsT0FBQSxDQUFBLEVBQVMsRUFGVDtRQUdBLFdBQUEsRUFBYSw4REFIYjtRQUlBLEtBQUEsRUFBTyxFQUpQO09BUEY7TUFZQSxjQUFBLEVBQ0U7UUFBQSxLQUFBLEVBQU8sOEJBQVA7UUFDQSxJQUFBLEVBQU0sUUFETjtRQUVBLENBQUEsT0FBQSxDQUFBLEVBQVMsY0FGVDtRQUdBLFdBQUEsRUFBYSw0Q0FIYjtRQUlBLEtBQUEsRUFBTyxFQUpQO09BYkY7TUFrQkEsS0FBQSxFQUNFO1FBQUEsS0FBQSxFQUFPLG9CQUFQO1FBQ0EsSUFBQSxFQUFNLFFBRE47UUFFQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLE9BRlQ7UUFHQSxXQUFBLEVBQWEsK05BSGI7UUFJQSxLQUFBLEVBQU8sRUFKUDtPQW5CRjtNQXdCQSxVQUFB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NUIsTUFBQSxFQUFRLE1BSG9CO1VBSTVCLE1BQUEsRUFBUSxNQUpvQjtVQUs1QixJQUFBLEVBQU0sSUFMc0I7U0FBaEIsRUFBZDs7SUEzREcsQ0E5R0w7SUF5TEEsUUFBQSxFQUFVLFNBQUMsUUFBRCxFQUFXLEtBQVg7QUFDUixVQUFBO01BQUEsSUFBQSxDQUFvRCxTQUFTLENBQUMsTUFBOUQ7QUFBQSxjQUFVLElBQUEsS0FBQSxDQUFNLDRCQUFOLEVBQVY7O01BQ0EsSUFBQSxDQUFBLENBQU8sS0FBQSxZQUFpQixLQUF4QixDQUFBO1FBQ0UsS0FBQSxHQUFRLENBQUMsS0FBRCxFQURWOztNQUVBLFFBQUEsR0FBVyxRQUFRLENBQUMsS0FBVCxDQUFlLElBQUksQ0FBQyxHQUFwQjtBQUNYLGFBQU0sUUFBUSxDQUFDLE1BQWY7UUFDRSxVQUFBLEdBQWEsUUFBUSxDQUFDLElBQVQsQ0FBYyxJQUFJLENBQUMsR0FBbkI7QUFDYixhQUFBLHVDQUFBOztVQUNFLFFBQUEsR0FBVyxJQUFJLENBQUMsSUFBTCxDQUFVLFVBQVYsRUFBc0IsSUFBdEI7QUFDWDtZQUNFLEVBQUUsQ0FBQyxVQUFILENBQWMsUUFBZCxFQUF3QixFQUFFLENBQUMsSUFBM0I7QUFDQSxtQkFBTyxTQUZUO1dBQUE7QUFGRjtRQUtBLFFBQVEsQ0FBQyxHQUFULENBQUE7TUFQRjtBQVFBLGFBQU87SUFiQyxDQXpMVjs7QUFORiIsInNvdXJjZXNDb250ZW50IjpbIntDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXG57QnVmZmVyZWRQcm9jZXNzfSA9IHJlcXVpcmUgJ2F0b20nXG5mcyA9IHJlcXVpcmUgJ2ZzJ1xucGF0aCA9IHJlcXVpcmUgJ3BhdGgnXG5cbm1vZHVsZS5leHBvcnRzID0gUGhwQ3NGaXhlciA9XG4gIHN1YnNjcmlwdGlvbnM6IG51bGxcbiAgY29uZmlnOlxuICAgIHBocEV4ZWN1dGFibGVQYXRoOlxuICAgICAgdGl0bGU6ICdQSFAgZXhlY3V0YWJsZSBwYXRoJ1xuICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIGRlZmF1bHQ6ICdwaHAnXG4gICAgICBkZXNjcmlwdGlvbjogJ1RoZSBwYXRoIHRvIHRoZSBgcGhwYCBleGVjdXRhYmxlLidcbiAgICAgIG9yZGVyOiAxMFxuICAgIHBocEFyZ3VtZW50czpcbiAgICAgIHRpdGxlOiAnQWRkIFBIUCBhcmd1bWVudHMnXG4gICAgICB0eXBlOiAnYXJyYXknXG4gICAgICBkZWZhdWx0OiBbXVxuICAgICAgZGVzY3JpcHRpb246ICdBZGQgYXJndW1lbnRzLCBsaWtlIGZvciBleGFtcGxlIGAtbmAsIHRvIHRoZSBQSFAgZXhlY3V0YWJsZS4nXG4gICAgICBvcmRlcjogMTFcbiAgICBleGVjdXRhYmxlUGF0aDpcbiAgICAgIHRpdGxlOiAnUEhQLUNTLWZpeGVyIGV4ZWN1dGFibGUgcGF0aCdcbiAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICBkZWZhdWx0OiAncGhwLWNzLWZpeGVyJ1xuICAgICAgZGVzY3JpcHRpb246ICdUaGUgcGF0aCB0byB0aGUgYHBocC1jcy1maXhlcmAgZXhlY3V0YWJsZS4nXG4gICAgICBvcmRlcjogMjBcbiAgICBydWxlczpcbiAgICAgIHRpdGxlOiAnUEhQLUNTLUZpeGVyIFJ1bGVzJ1xuICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIGRlZmF1bHQ6ICdAUFNSMidcbiAgICAgIGRlc2NyaXB0aW9uOiAnQSBsaXN0IG9mIHJ1bGVzIChiYXNlZCBvbiBwaHAtY3MtZml4ZXIgMi4wKSwgZm9yIGV4YW1wbGU6IGBAUFNSMixub19zaG9ydF9lY2hvX3RhZyxpbmRlbnRhdGlvbl90eXBlYC4gU2VlIDxodHRwczovL2dpdGh1Yi5jb20vRnJpZW5kc09mUEhQL1BIUC1DUy1GaXhlciN1c2FnZT4gZm9yIGEgY29tcGxldGUgbGlzdC4gV2lsbCBiZSBpZ25vcmVkIGlmIGEgY29uZmlnIGZpbGUgaXMgdXNlZC4nXG4gICAgICBvcmRlcjogMjFcbiAgICBhbGxvd1Jpc2t5OlxuICAgICAgdGl0bGU6ICdBbGxvdyByaXNreSdcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICAgIGRlc2NyaXB0aW9uOiAnT3B0aW9uIGFsbG93cyB5b3UgdG8gc2V0IHdoZXRoZXIgcmlza3kgcnVsZXMgbWF5IHJ1bi4gV2lsbCBiZSBpZ25vcmVkIGlmIGEgY29uZmlnIGZpbGUgaXMgdXNlZC4nXG4gICAgICBvcmRlcjogMjJcbiAgICBwYXRoTW9kZTpcbiAgICAgIHRpdGxlOiAnUEhQLUNTLUZpeGVyIFBhdGgtTW9kZSdcbiAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICBkZWZhdWx0OiAnb3ZlcnJpZGUnXG4gICAgICBlbnVtOiBbJ292ZXJyaWRlJywgJ2ludGVyc2VjdGlvbiddXG4gICAgICBkZXNjcmlwdGlvbjogJ1NwZWNpZnkgcGF0aCBtb2RlIChjYW4gYmUgb3ZlcnJpZGUgb3IgaW50ZXJzZWN0aW9uKS4nXG4gICAgICBvcmRlcjogMjNcbiAgICBmaXhlckFyZ3VtZW50czpcbiAgICAgIHRpdGxlOiAnUEhQLUNTLUZpeGVyIGFyZ3VtZW50cydcbiAgICAgIHR5cGU6ICdhcnJheSdcbiAgICAgIGRlZmF1bHQ6IFsnLS11c2luZy1jYWNoZT1ubycsICctLW5vLWludGVyYWN0aW9uJ11cbiAgICAgIGRlc2NyaXB0aW9uOiAnQWRkIGFyZ3VtZW50cywgbGlrZSBmb3IgZXhhbXBsZSBgLS11c2luZy1jYWNoZT1mYWxzZWAsIHRvIHRoZSBQSFAtQ1MtRml4ZXIgZXhlY3V0YWJsZS4gUnVuIGBwaHAtY3MtZml4ZXIgaGVscCBmaXhgIGluIHlvdXIgY29tbWFuZCBsaW5lLCB0byBnZXQgYSBmdWxsIGxpc3Qgb2YgYWxsIHN1cHBvcnRlZCBhcmd1bWVudHMuJ1xuICAgICAgb3JkZXI6IDI0XG4gICAgY29uZmlnUGF0aDpcbiAgICAgIHRpdGxlOiAnUEhQLUNTLWZpeGVyIGNvbmZpZyBmaWxlIHBhdGgnXG4gICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgZGVmYXVsdDogJydcbiAgICAgIGRlc2NyaXB0aW9uOiAnT3B0aW9uYWxseSBwcm92aWRlIHRoZSBwYXRoIHRvIHRoZSBgLnBocF9jc2AgY29uZmlnIGZpbGUsIGlmIHRoZSBwYXRoIGlzIG5vdCBwcm92aWRlZCBpdCB3aWxsIGJlIGxvYWRlZCBmcm9tIHRoZSByb290IHBhdGggb2YgdGhlIGN1cnJlbnQgcHJvamVjdC4nXG4gICAgICBvcmRlcjogMjVcbiAgICBleGVjdXRlT25TYXZlOlxuICAgICAgdGl0bGU6ICdFeGVjdXRlIG9uIHNhdmUnXG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgICBkZXNjcmlwdGlvbjogJ0V4ZWN1dGUgUEhQIENTIGZpeGVyIG9uIHNhdmUnXG4gICAgICBvcmRlcjogMzBcbiAgICBzaG93SW5mb05vdGlmaWNhdGlvbnM6XG4gICAgICB0aXRsZTogJ1Nob3cgbm90aWZpY2F0aW9ucydcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICAgIGRlc2NyaXB0aW9uOiAnU2hvdyBzb21lIHN0YXR1cyBpbmZvcm1hdGlvbnMgZnJvbSB0aGUgbGFzdCBcImZpeFwiLidcbiAgICAgIG9yZGVyOiAzMVxuXG4gIGFjdGl2YXRlOiAoc3RhdGUpIC0+XG4gICAgYXRvbS5jb25maWcub2JzZXJ2ZSAncGhwLWNzLWZpeGVyLmV4ZWN1dGVPblNhdmUnLCA9PlxuICAgICAgQGV4ZWN1dGVPblNhdmUgPSBhdG9tLmNvbmZpZy5nZXQgJ3BocC1jcy1maXhlci5leGVjdXRlT25TYXZlJ1xuXG4gICAgYXRvbS5jb25maWcub2JzZXJ2ZSAncGhwLWNzLWZpeGVyLnBocEV4ZWN1dGFibGVQYXRoJywgPT5cbiAgICAgIEBwaHBFeGVjdXRhYmxlUGF0aCA9IGF0b20uY29uZmlnLmdldCAncGhwLWNzLWZpeGVyLnBocEV4ZWN1dGFibGVQYXRoJ1xuXG4gICAgYXRvbS5jb25maWcub2JzZXJ2ZSAncGhwLWNzLWZpeGVyLmV4ZWN1dGFibGVQYXRoJywgPT5cbiAgICAgIEBleGVjdXRhYmxlUGF0aCA9IGF0b20uY29uZmlnLmdldCAncGhwLWNzLWZpeGVyLmV4ZWN1dGFibGVQYXRoJ1xuXG4gICAgYXRvbS5jb25maWcub2JzZXJ2ZSAncGhwLWNzLWZpeGVyLmNvbmZpZ1BhdGgnLCA9PlxuICAgICAgQGNvbmZpZ1BhdGggPSBhdG9tLmNvbmZpZy5nZXQgJ3BocC1jcy1maXhlci5jb25maWdQYXRoJ1xuXG4gICAgYXRvbS5jb25maWcub2JzZXJ2ZSAncGhwLWNzLWZpeGVyLmFsbG93Umlza3knLCA9PlxuICAgICAgQGFsbG93Umlza3kgPSBhdG9tLmNvbmZpZy5nZXQgJ3BocC1jcy1maXhlci5hbGxvd1Jpc2t5J1xuXG4gICAgYXRvbS5jb25maWcub2JzZXJ2ZSAncGhwLWNzLWZpeGVyLnJ1bGVzJywgPT5cbiAgICAgIEBydWxlcyA9IGF0b20uY29uZmlnLmdldCAncGhwLWNzLWZpeGVyLnJ1bGVzJ1xuXG4gICAgYXRvbS5jb25maWcub2JzZXJ2ZSAncGhwLWNzLWZpeGVyLnNob3dJbmZvTm90aWZpY2F0aW9ucycsID0+XG4gICAgICBAc2hvd0luZm9Ob3RpZmljYXRpb25zID0gYXRvbS5jb25maWcuZ2V0ICdwaHAtY3MtZml4ZXIuc2hvd0luZm9Ob3RpZmljYXRpb25zJ1xuXG4gICAgYXRvbS5jb25maWcub2JzZXJ2ZSAncGhwLWNzLWZpeGVyLnBocEFyZ3VtZW50cycsID0+XG4gICAgICBAcGhwQXJndW1lbnRzID0gYXRvbS5jb25maWcuZ2V0ICdwaHAtY3MtZml4ZXIucGhwQXJndW1lbnRzJ1xuXG4gICAgYXRvbS5jb25maWcub2JzZXJ2ZSAncGhwLWNzLWZpeGVyLmZpeGVyQXJndW1lbnRzJywgPT5cbiAgICAgIEBmaXhlckFyZ3VtZW50cyA9IGF0b20uY29uZmlnLmdldCAncGhwLWNzLWZpeGVyLmZpeGVyQXJndW1lbnRzJ1xuXG4gICAgYXRvbS5jb25maWcub2JzZXJ2ZSAncGhwLWNzLWZpeGVyLnBhdGhNb2RlJywgPT5cbiAgICAgIEBwYXRoTW9kZSA9IGF0b20uY29uZmlnLmdldCAncGhwLWNzLWZpeGVyLnBhdGhNb2RlJ1xuXG4gICAgIyBFdmVudHMgc3Vic2NyaWJlZCB0byBpbiBhdG9tJ3Mgc3lzdGVtIGNhbiBiZSBlYXNpbHkgY2xlYW5lZCB1cCB3aXRoIGEgQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgIEBzdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcblxuICAgICMgUmVnaXN0ZXIgY29tbWFuZCB0aGF0IHRvZ2dsZXMgdGhpcyB2aWV3XG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXdvcmtzcGFjZScsICdwaHAtY3MtZml4ZXI6Zml4JzogPT4gQGZpeCgpXG5cbiAgICAjIEFkZCB3b3Jrc3BhY2Ugb2JzZXJ2ZXIgYW5kIHNhdmUgaGFuZGxlclxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLndvcmtzcGFjZS5vYnNlcnZlVGV4dEVkaXRvcnMgKGVkaXRvcikgPT5cbiAgICAgIEBzdWJzY3JpcHRpb25zLmFkZCBlZGl0b3IuZ2V0QnVmZmVyKCkub25XaWxsU2F2ZSA9PlxuICAgICAgICBpZiBlZGl0b3IuZ2V0R3JhbW1hcigpLm5hbWUgPT0gXCJQSFBcIiBhbmQgQGV4ZWN1dGVPblNhdmVcbiAgICAgICAgICBAZml4KClcblxuICBkZWFjdGl2YXRlOiAtPlxuICAgIEBzdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuXG4gIGZpeDogLT5cbiAgICBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lSXRlbSgpXG5cbiAgICBmaWxlUGF0aCA9IGVkaXRvci5nZXRQYXRoKCkgaWYgZWRpdG9yICYmIGVkaXRvci5nZXRQYXRoXG5cbiAgICBjb21tYW5kID0gQHBocEV4ZWN1dGFibGVQYXRoXG5cbiAgICBhcmdzID0gW11cblxuICAgIGlmIEBwaHBBcmd1bWVudHMubGVuZ3RoXG4gICAgICBpZiBAcGhwQXJndW1lbnRzLmxlbmd0aCA+IDFcbiAgICAgICAgYXJncyA9IEBwaHBBcmd1bWVudHNcbiAgICAgIGVsc2VcbiAgICAgICAgYXJncyA9IEBwaHBBcmd1bWVudHNbMF0uc3BsaXQoJyAnKVxuXG4gICAgYXJncyA9IGFyZ3MuY29uY2F0IFtAZXhlY3V0YWJsZVBhdGgsICdmaXgnLCBmaWxlUGF0aF1cblxuICAgIGlmIEBjb25maWdQYXRoXG4gICAgICBhcmdzLnB1c2ggJy0tY29uZmlnPScgKyBAY29uZmlnUGF0aFxuICAgIGVsc2UgaWYgY29uZmlnUGF0aCA9IEBmaW5kRmlsZShwYXRoLmRpcm5hbWUoZmlsZVBhdGgpLCBbJy5waHBfY3MnLCAnLnBocF9jcy5kaXN0J10pXG4gICAgICBhcmdzLnB1c2ggJy0tY29uZmlnPScgKyBjb25maWdQYXRoXG5cbiAgICAjIGFkZCBvcHRpb25hbCBvcHRpb25zXG4gICAgYXJncy5wdXNoICctLWFsbG93LXJpc2t5PXllcycgaWYgQGFsbG93Umlza3kgYW5kIG5vdCBjb25maWdQYXRoXG4gICAgYXJncy5wdXNoICctLXJ1bGVzPScgKyBAcnVsZXMgaWYgQHJ1bGVzIGFuZCBub3QgY29uZmlnUGF0aFxuICAgIGFyZ3MucHVzaCAnLS1wYXRoLW1vZGU9JyArIEBwYXRoTW9kZSBpZiBAcGF0aE1vZGVcblxuICAgIGlmIEBmaXhlckFyZ3VtZW50cy5sZW5ndGggYW5kIG5vdCBjb25maWdQYXRoXG4gICAgICBpZiBAZml4ZXJBcmd1bWVudHMubGVuZ3RoID4gMVxuICAgICAgICBmaXhlckFyZ3MgPSBAZml4ZXJBcmd1bWVudHNcbiAgICAgIGVsc2VcbiAgICAgICAgZml4ZXJBcmdzID0gQGZpeGVyQXJndW1lbnRzWzBdLnNwbGl0KCcgJylcblxuICAgICAgYXJncyA9IGFyZ3MuY29uY2F0IGZpeGVyQXJncztcblxuICAgICMgc29tZSBkZWJ1ZyBvdXRwdXQgZm9yIGEgYmV0dGVyIHN1cHBvcnQgZmVlZGJhY2tcbiAgICBjb25zb2xlLmRlYnVnKCdwaHAtY3MtZml4ZXIgQ29tbWFuZCcsIGNvbW1hbmQpXG4gICAgY29uc29sZS5kZWJ1ZygncGhwLWNzLWZpeGVyIEFyZ3VtZW50cycsIGFyZ3MpXG5cbiAgICBzdGRvdXQgPSAob3V0cHV0KSAtPlxuICAgICAgaWYgUGhwQ3NGaXhlci5zaG93SW5mb05vdGlmaWNhdGlvbnNcbiAgICAgICAgaWYgKC9eXFxzKlxcZCpbKV0vLnRlc3Qob3V0cHV0KSlcbiAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkU3VjY2VzcyhvdXRwdXQpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkSW5mbyhvdXRwdXQpXG4gICAgICBjb25zb2xlLmxvZyhvdXRwdXQpXG5cbiAgICBzdGRlcnIgPSAob3V0cHV0KSAtPlxuICAgICAgaWYgUGhwQ3NGaXhlci5zaG93SW5mb05vdGlmaWNhdGlvbnNcbiAgICAgICAgaWYgKG91dHB1dC5yZXBsYWNlKC9cXHMvZyxcIlwiKSA9PSBcIlwiKVxuICAgICAgICAgICMgZG8gbm90aGluZ1xuICAgICAgICBlbHNlIGlmICgvXkxvYWRlZCBjb25maWcvLnRlc3Qob3V0cHV0KSkgIyB0ZW1wb3JhcnkgZml4aW5nIGh0dHBzOi8vZ2l0aHViLmNvbS9wZmVmZmVybGUvYXRvbS1waHAtY3MtZml4ZXIvaXNzdWVzLzM1XG4gICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEluZm8ob3V0cHV0KVxuICAgICAgICBlbHNlXG4gICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKG91dHB1dClcbiAgICAgIGNvbnNvbGUuZXJyb3Iob3V0cHV0KVxuXG4gICAgZXhpdCA9IChjb2RlKSAtPiBjb25zb2xlLmxvZyhcIiN7Y29tbWFuZH0gZXhpdGVkIHdpdGggY29kZTogI3tjb2RlfVwiKVxuXG4gICAgcHJvY2VzcyA9IG5ldyBCdWZmZXJlZFByb2Nlc3Moe1xuICAgICAgY29tbWFuZDogY29tbWFuZCxcbiAgICAgIGFyZ3M6IGFyZ3MsXG4gICAgICBzdGRvdXQ6IHN0ZG91dCxcbiAgICAgIHN0ZGVycjogc3RkZXJyLFxuICAgICAgZXhpdDogZXhpdFxuICAgIH0pIGlmIGZpbGVQYXRoXG5cbiAgIyBjb3BpZWQgZnJvbSB0aGUgQXRvbUxpbnRlciBsaWJcbiAgIyBzZWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9BdG9tTGludGVyL2F0b20tbGludGVyL2Jsb2IvbWFzdGVyL2xpYi9oZWxwZXJzLmNvZmZlZSNMMTEyXG4gICNcbiAgIyBUaGUgQXRvbUxpbnRlciBpcyBsaWNlbnNlZCB1bmRlciBcIlRoZSBNSVQgTGljZW5zZSAoTUlUKVwiXG4gICNcbiAgIyBDb3B5cmlnaHQgKGMpIDIwMTUgQXRvbUxpbnRlclxuICAjXG4gICMgU2VlIHRoZSBmdWxsIGxpY2Vuc2UgaGVyZTogaHR0cHM6Ly9naXRodWIuY29tL0F0b21MaW50ZXIvYXRvbS1saW50ZXIvYmxvYi9tYXN0ZXIvTElDRU5TRVxuICBmaW5kRmlsZTogKHN0YXJ0RGlyLCBuYW1lcykgLT5cbiAgICB0aHJvdyBuZXcgRXJyb3IgXCJTcGVjaWZ5IGEgZmlsZW5hbWUgdG8gZmluZFwiIHVubGVzcyBhcmd1bWVudHMubGVuZ3RoXG4gICAgdW5sZXNzIG5hbWVzIGluc3RhbmNlb2YgQXJyYXlcbiAgICAgIG5hbWVzID0gW25hbWVzXVxuICAgIHN0YXJ0RGlyID0gc3RhcnREaXIuc3BsaXQocGF0aC5zZXApXG4gICAgd2hpbGUgc3RhcnREaXIubGVuZ3RoXG4gICAgICBjdXJyZW50RGlyID0gc3RhcnREaXIuam9pbihwYXRoLnNlcClcbiAgICAgIGZvciBuYW1lIGluIG5hbWVzXG4gICAgICAgIGZpbGVQYXRoID0gcGF0aC5qb2luKGN1cnJlbnREaXIsIG5hbWUpXG4gICAgICAgIHRyeVxuICAgICAgICAgIGZzLmFjY2Vzc1N5bmMoZmlsZVBhdGgsIGZzLlJfT0spXG4gICAgICAgICAgcmV0dXJuIGZpbGVQYXRoXG4gICAgICBzdGFydERpci5wb3AoKVxuICAgIHJldHVybiBudWxsXG4iXX0=
