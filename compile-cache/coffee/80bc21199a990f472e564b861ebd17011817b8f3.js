
/*
  Atom-terminal-panel
  Copyright by isis97
  MIT licensed

  Class containing all builtin variables.
 */

(function() {
  var $, BuiltinVariables, dirname, extname, os, ref, resolve;

  $ = include('atom-space-pen-views').$;

  ref = include('path'), resolve = ref.resolve, dirname = ref.dirname, extname = ref.extname;

  os = include('os');

  $.event.special.destroyed = {
    remove: function(o) {
      if (o.handler) {
        return o.handler();
      }
    }
  };

  BuiltinVariables = (function() {
    function BuiltinVariables() {}

    BuiltinVariables.prototype.list = {
      "%(project.root)": "first currently opened project directory",
      "%(project:INDEX)": "n-th currently opened project directory",
      "%(project.count)": "number of currently opened projects",
      "%(atom)": "atom directory.",
      "%(path)": "current working directory",
      "%(file)": "currenly opened file in the editor",
      "%(editor.path)": "path of the file currently opened in the editor",
      "%(editor.file)": "full path of the file currently opened in the editor",
      "%(editor.name)": "name of the file currently opened in the editor",
      "%(cwd)": "current working directory",
      "%(hostname)": "computer name",
      "%(computer-name)": "computer name",
      "%(username)": "currently logged in user",
      "%(user)": "currently logged in user",
      "%(home)": "home directory of the user",
      "%(osname)": "name of the operating system",
      "%(os)": "name of the operating system",
      "%(env.*)": "list of all available native environment variables",
      "%(.day)": "current date: day number (without leading zeros)",
      "%(.month)": "current date: month number (without leading zeros)",
      "%(.year)": "current date: year (without leading zeros)",
      "%(.hours)": "current date: hour 24-format (without leading zeros)",
      "%(.hours12)": "current date: hour 12-format (without leading zeros)",
      "%(.minutes)": "current date: minutes (without leading zeros)",
      "%(.seconds)": "current date: seconds (without leading zeros)",
      "%(.milis)": "current date: miliseconds (without leading zeros)",
      "%(day)": "current date: day number",
      "%(month)": "current date: month number",
      "%(year)": "current date: year",
      "%(hours)": "current date: hour 24-format",
      "%(hours12)": "current date: hour 12-format",
      "%(minutes)": "current date: minutes",
      "%(seconds)": "current date: seconds",
      "%(milis)": "current date: miliseconds",
      "%(ampm)": "displays am/pm (12-hour format)",
      "%(AMPM)": "displays AM/PM (12-hour format)",
      "%(line)": "input line number",
      "%(disc)": "current working directory disc name",
      "%(label:TYPE:TEXT": "(styling-annotation) creates a label of the specified type",
      "%(tooltip:TEXT:content:CONTENT)": "(styling-annotation) creates a tooltip message",
      "%(link)": "(styling-annotation) starts the file link - see %(endlink)",
      "%(endlink)": "(styling-annotation) ends the file link - see %(link)",
      "%(^)": "(styling-annotation) ends text formatting",
      "%(^COLOR)": "(styling-annotation) creates coloured text",
      "%(^b)": "(styling-annotation) creates bolded text",
      "%(^bold)": "(styling-annotation) creates bolded text",
      "%(^i)": "(styling-annotation) creates italics text",
      "%(^italics)": "(styling-annotation) creates italics text",
      "%(^u)": "(styling-annotation) creates underline text",
      "%(^underline)": "(styling-annotation) creates underline text",
      "%(^l)": "(styling-annotation) creates a line through the text",
      "%(^line-trough)": "(styling-annotation) creates a line through the text",
      "%(path:INDEX)": "refers to the %(path) components",
      "%(*)": "(only user-defined commands) refers to the all passed parameters",
      "%(*^)": "(only user-defined commands) refers to the full command string",
      "%(INDEX)": "(only user-defined commands) refers to the passed parameters",
      "%(raw)": "Makes the entire expression evaluated only when printing to output (delayed-evaluation)",
      "%(dynamic)": "Indicates that the expression should be dynamically updated."
    };

    BuiltinVariables.prototype.customVariables = [];

    BuiltinVariables.prototype.putVariable = function(entry) {
      this.customVariables.push(entry);
      return this.list['%(' + entry.name + ')'] = entry.description || "";
    };

    BuiltinVariables.prototype.removeAnnotation = function(consoleInstance, prompt) {
      return prompt.replace(/%\((?!cwd-original\))(?!file-original\))([^\(\)]*)\)/img, (function(_this) {
        return function(match, text, urlId) {
          return '';
        };
      })(this));
    };

    BuiltinVariables.prototype.parseHtml = function(consoleInstance, prompt, values, startRefreshTask) {
      var o;
      if (startRefreshTask == null) {
        startRefreshTask = true;
      }
      o = this.parseFull(consoleInstance, prompt, values, startRefreshTask);
      if (o.modif != null) {
        o.modif((function(_this) {
          return function(i) {
            i = consoleInstance.util.replaceAll('%(file-original)', consoleInstance.getCurrentFilePath(), i);
            i = consoleInstance.util.replaceAll('%(cwd-original)', consoleInstance.getCwd(), i);
            i = consoleInstance.util.replaceAll('&fs;', '/', i);
            i = consoleInstance.util.replaceAll('&bs;', '\\', i);
            return i;
          };
        })(this));
      }
      if (o.getHtml != null) {
        return o.getHtml();
      }
      return o;
    };

    BuiltinVariables.prototype.parse = function(consoleInstance, prompt, values) {
      var o;
      o = this.parseFull(consoleInstance, prompt, values);
      if (o.getText != null) {
        return o.getText();
      }
      return o;
    };

    BuiltinVariables.prototype.parseFull = function(consoleInstance, prompt, values, startRefreshTask) {
      var ampm, ampmC, atomPath, breadcrumbIdFwd, breadcrumbIdRwd, cmd, day, disc, dynamicExpressionUpdateDelay, entry, file, homelocation, hours, hours12, i, isDynamicExpression, j, k, key, l, len, m, milis, minutes, month, o, orig, osname, panelPath, pathBreadcrumbs, pathBreadcrumbsSize, preservedPathsString, projectPaths, projectPathsCount, ref1, ref2, ref3, repl, seconds, text, today, username, value, year;
      if (startRefreshTask == null) {
        startRefreshTask = true;
      }
      orig = prompt;
      text = '';
      isDynamicExpression = false;
      dynamicExpressionUpdateDelay = 100;
      if (consoleInstance == null) {
        return '';
      }
      if (prompt == null) {
        return '';
      }
      cmd = null;
      file = consoleInstance.getCurrentFilePath();
      if (values != null) {
        if (values.cmd != null) {
          cmd = values.cmd;
        }
        if (values.file != null) {
          file = values.file;
        }
      }
      if ((!atom.config.get('atom-terminal-panel.parseSpecialTemplateTokens')) && (!consoleInstance.specsMode)) {
        consoleInstance.preserveOriginalPaths(prompt.replace(/%\([^ ]*\)/ig, ''));
      }
      if (prompt.indexOf('%') === -1) {
        consoleInstance.preserveOriginalPaths(prompt);
      }
      prompt.replace(/%\(dynamic:?([0-9]+)?\)/ig, (function(_this) {
        return function(match, p1) {
          if (p1 != null) {
            dynamicExpressionUpdateDelay = parseInt(p1);
          }
          isDynamicExpression = true;
          return '';
        };
      })(this));
      for (key in values) {
        value = values[key];
        if (key !== 'cmd' && key !== 'file') {
          prompt = consoleInstance.util.replaceAll("%(" + key + ")", value, prompt);
        }
      }
      if (prompt.indexOf('%(raw)') === -1) {
        panelPath = atom.packages.resolvePackagePath('atom-terminal-panel');
        atomPath = resolve(panelPath + '/../..');
        prompt = consoleInstance.util.replaceAll('%(atom)', atomPath, prompt);
        prompt = consoleInstance.util.replaceAll('%(path)', consoleInstance.getCwd(), prompt);
        prompt = consoleInstance.util.replaceAll('%(file)', file, prompt);
        prompt = consoleInstance.util.replaceAll('%(editor.path)', consoleInstance.getCurrentFileLocation(), prompt);
        prompt = consoleInstance.util.replaceAll('%(editor.file)', consoleInstance.getCurrentFilePath(), prompt);
        prompt = consoleInstance.util.replaceAll('%(editor.name)', consoleInstance.getCurrentFileName(), prompt);
        prompt = consoleInstance.util.replaceAll('%(cwd)', consoleInstance.getCwd(), prompt);
        prompt = consoleInstance.util.replaceAll('%(hostname)', os.hostname(), prompt);
        prompt = consoleInstance.util.replaceAll('%(computer-name)', os.hostname(), prompt);
        username = process.env.USERNAME || process.env.LOGNAME || process.env.USER;
        prompt = consoleInstance.util.replaceAll('%(username)', username, prompt);
        prompt = consoleInstance.util.replaceAll('%(user)', username, prompt);
        homelocation = process.env.HOME || process.env.HOMEPATH || process.env.HOMEDIR;
        prompt = consoleInstance.util.replaceAll('%(home)', homelocation, prompt);
        osname = process.platform || process.env.OS;
        prompt = consoleInstance.util.replaceAll('%(osname)', osname, prompt);
        prompt = consoleInstance.util.replaceAll('%(os)', osname, prompt);
        prompt = prompt.replace(/%\(env\.[A-Za-z_\*]*\)/ig, (function(_this) {
          return function(match, text, urlId) {
            var nativeVarName, ref1, ret;
            nativeVarName = match;
            nativeVarName = consoleInstance.util.replaceAll('%(env.', '', nativeVarName);
            nativeVarName = nativeVarName.substring(0, nativeVarName.length - 1);
            if (nativeVarName === '*') {
              ret = 'process.env {\n';
              ref1 = process.env;
              for (key in ref1) {
                value = ref1[key];
                ret += '\t' + key + '\n';
              }
              ret += '}';
              return ret;
            }
            return process.env[nativeVarName];
          };
        })(this));
        if (cmd != null) {
          prompt = consoleInstance.util.replaceAll('%(command)', cmd, prompt);
        }
        today = new Date();
        day = today.getDate();
        month = today.getMonth() + 1;
        year = today.getFullYear();
        minutes = today.getMinutes();
        hours = today.getHours();
        hours12 = today.getHours() % 12;
        milis = today.getMilliseconds();
        seconds = today.getSeconds();
        ampm = 'am';
        ampmC = 'AM';
        if (hours >= 12) {
          ampm = 'pm';
          ampmC = 'PM';
        }
        prompt = consoleInstance.util.replaceAll('%(.day)', day, prompt);
        prompt = consoleInstance.util.replaceAll('%(.month)', month, prompt);
        prompt = consoleInstance.util.replaceAll('%(.year)', year, prompt);
        prompt = consoleInstance.util.replaceAll('%(.hours)', hours, prompt);
        prompt = consoleInstance.util.replaceAll('%(.hours12)', hours12, prompt);
        prompt = consoleInstance.util.replaceAll('%(.minutes)', minutes, prompt);
        prompt = consoleInstance.util.replaceAll('%(.seconds)', seconds, prompt);
        prompt = consoleInstance.util.replaceAll('%(.milis)', milis, prompt);
        if (seconds < 10) {
          seconds = '0' + seconds;
        }
        if (day < 10) {
          day = '0' + day;
        }
        if (month < 10) {
          month = '0' + month;
        }
        if (milis < 10) {
          milis = '000' + milis;
        } else if (milis < 100) {
          milis = '00' + milis;
        } else if (milis < 1000) {
          milis = '0' + milis;
        }
        if (minutes < 10) {
          minutes = '0' + minutes;
        }
        if (hours >= 12) {
          ampm = 'pm';
        }
        if (hours < 10) {
          hours = '0' + hours;
        }
        if (hours12 < 10) {
          hours12 = '0' + hours12;
        }
        prompt = consoleInstance.util.replaceAll('%(day)', day, prompt);
        prompt = consoleInstance.util.replaceAll('%(month)', month, prompt);
        prompt = consoleInstance.util.replaceAll('%(year)', year, prompt);
        prompt = consoleInstance.util.replaceAll('%(hours)', hours, prompt);
        prompt = consoleInstance.util.replaceAll('%(hours12)', hours12, prompt);
        prompt = consoleInstance.util.replaceAll('%(ampm)', ampm, prompt);
        prompt = consoleInstance.util.replaceAll('%(AMPM)', ampmC, prompt);
        prompt = consoleInstance.util.replaceAll('%(minutes)', minutes, prompt);
        prompt = consoleInstance.util.replaceAll('%(seconds)', seconds, prompt);
        prompt = consoleInstance.util.replaceAll('%(milis)', milis, prompt);
        prompt = consoleInstance.util.replaceAll('%(line)', consoleInstance.inputLine + 1, prompt);
        projectPaths = atom.project.getPaths();
        projectPathsCount = projectPaths.length - 1;
        prompt = consoleInstance.util.replaceAll('%(project.root)', projectPaths[0], prompt);
        prompt = consoleInstance.util.replaceAll('%(project.count)', projectPaths.length, prompt);
        for (i = j = 0, ref1 = projectPathsCount; j <= ref1; i = j += 1) {
          breadcrumbIdFwd = i - projectPathsCount - 1;
          breadcrumbIdRwd = i;
          prompt = consoleInstance.util.replaceAll("%(project:" + breadcrumbIdFwd + ")", projectPaths[i], prompt);
          prompt = consoleInstance.util.replaceAll("%(project:" + breadcrumbIdRwd + ")", projectPaths[i], prompt);
        }
        pathBreadcrumbs = consoleInstance.getCwd().split(/\\|\//ig);
        pathBreadcrumbs[0] = pathBreadcrumbs[0].charAt(0).toUpperCase() + pathBreadcrumbs[0].slice(1);
        disc = consoleInstance.util.replaceAll(':', '', pathBreadcrumbs[0]);
        prompt = consoleInstance.util.replaceAll('%(disc)', disc, prompt);
        pathBreadcrumbsSize = pathBreadcrumbs.length - 1;
        for (i = k = 0, ref2 = pathBreadcrumbsSize; k <= ref2; i = k += 1) {
          breadcrumbIdFwd = i - pathBreadcrumbsSize - 1;
          breadcrumbIdRwd = i;
          prompt = consoleInstance.util.replaceAll("%(path:" + breadcrumbIdFwd + ")", pathBreadcrumbs[i], prompt);
          prompt = consoleInstance.util.replaceAll("%(path:" + breadcrumbIdRwd + ")", pathBreadcrumbs[i], prompt);
        }
        prompt = prompt.replace(/%\(tooltip:[^\n\t\[\]{}%\)\(]*\)/ig, (function(_this) {
          return function(match, text, urlId) {
            var content, target, target_tokens;
            target = consoleInstance.util.replaceAll('%(tooltip:', '', match);
            target = target.substring(0, target.length - 1);
            target_tokens = target.split(':content:');
            target = target_tokens[0];
            content = target_tokens[1];
            return "<font data-toggle=\"tooltip\" data-placement=\"top\" title=\"" + target + "\">" + content + "</font>";
          };
        })(this));
        if (prompt.indexOf('%(link:') !== -1) {
          throw 'Error:\nUsage of %(link:) is deprecated.\nUse %(link)target%(endlink) notation\ninstead of %(link:target)!\nAt: [' + prompt + ']';
        }
        prompt = prompt.replace(/%\(link\)[^%]*%\(endlink\)/ig, (function(_this) {
          return function(match, text, urlId) {
            var ret, target;
            target = match;
            target = consoleInstance.util.replaceAll('%(link)', '', target);
            target = consoleInstance.util.replaceAll('%(endlink)', '', target);
            ret = consoleInstance.consoleLink(target, true);
            return ret;
          };
        })(this));
        prompt = prompt.replace(/%\(\^[^\s\(\)]*\)/ig, (function(_this) {
          return function(match, text, urlId) {
            var target;
            target = consoleInstance.util.replaceAll('%(^', '', match);
            target = target.substring(0, target.length - 1);
            if (target === '') {
              return '</font>';
            } else if (target.charAt(0) === '#') {
              return "<font style=\"color:" + target + ";\">";
            } else if (target === 'b' || target === 'bold') {
              return "<font style=\"font-weight:bold;\">";
            } else if (target === 'u' || target === 'underline') {
              return "<font style=\"text-decoration:underline;\">";
            } else if (target === 'i' || target === 'italic') {
              return "<font style=\"font-style:italic;\">";
            } else if (target === 'l' || target === 'line-through') {
              return "<font style=\"text-decoration:line-through;\">";
            }
            return '';
          };
        })(this));
        if ((atom.config.get('atom-terminal-panel.enableConsoleLabels')) || consoleInstance.specsMode) {
          prompt = prompt.replace(/%\(label:[^\n\t\[\]{}%\)\(]*\)/ig, (function(_this) {
            return function(match, text, urlId) {
              var content, target, target_tokens;
              target = consoleInstance.util.replaceAll('%(label:', '', match);
              target = target.substring(0, target.length - 1);
              target_tokens = target.split(':text:');
              target = target_tokens[0];
              content = target_tokens[1];
              return consoleInstance.consoleLabel(target, content);
            };
          })(this));
        } else {
          prompt = prompt.replace(/%\(label:[^\n\t\[\]{}%\)\(]*\)/ig, (function(_this) {
            return function(match, text, urlId) {
              var content, target, target_tokens;
              target = consoleInstance.util.replaceAll('%(label:', '', match);
              target = target.substring(0, target.length - 1);
              target_tokens = target.split(':text:');
              target = target_tokens[0];
              content = target_tokens[1];
              return content;
            };
          })(this));
        }
        ref3 = this.customVariables;
        for (l = 0, len = ref3.length; l < len; l++) {
          entry = ref3[l];
          if (prompt.indexOf('%(' + entry.name + ')') > -1) {
            repl = entry.variable(consoleInstance);
            if (repl != null) {
              prompt = consoleInstance.util.replaceAll('%(' + entry.name + ')', repl, prompt);
            }
          }
        }
        preservedPathsString = consoleInstance.preserveOriginalPaths(prompt);
        text = this.removeAnnotation(consoleInstance, preservedPathsString);
      } else {
        text = prompt;
      }
      o = {
        enclosedVarInstance: null,
        text: text,
        isDynamicExpression: isDynamicExpression,
        dynamicExpressionUpdateDelay: dynamicExpressionUpdateDelay,
        orig: orig,
        textModifiers: [],
        modif: function(modifier) {
          this.textModifiers.push(modifier);
          return this;
        },
        runTextModifiers: function(input) {
          var n, ref4;
          for (i = n = 0, ref4 = this.textModifiers.length - 1; n <= ref4; i = n += 1) {
            input = this.textModifiers[i](input) || input;
          }
          return input;
        },
        getText: function() {
          return this.runTextModifiers(this.text);
        },
        getHtml: function() {
          var htmlObj, refresh, refreshTask, taskRunning;
          htmlObj = $('<span>' + this.runTextModifiers(this.text) + '</span>');
          taskRunning = false;
          if (window.taskWorkingThreadsNumber == null) {
            window.taskWorkingThreadsNumber = 0;
          }
          refresh = (function(_this) {
            return function() {
              var t;
              t = _this.enclosedVarInstance.parseHtml(consoleInstance, _this.orig, values, false);
              htmlObj.html('');
              return htmlObj.append(t);
            };
          })(this);
          refreshTask = (function(_this) {
            return function() {
              if (_this.dynamicExpressionUpdateDelay <= 0 || !taskRunning) {
                --window.taskWorkingThreadsNumber;
                return;
              }
              return setTimeout(function() {
                refresh();
                return refreshTask();
              }, _this.dynamicExpressionUpdateDelay);
            };
          })(this);
          if (startRefreshTask && this.isDynamicExpression) {
            taskRunning = true;
            htmlObj.bind('destroyed', function() {
              return taskRunning = false;
            });
            ++window.taskWorkingThreadsNumber;
            refreshTask();
          }
          return htmlObj;
        }
      };
      m = function(i) {
        i = consoleInstance.util.replaceAll('%(file-original)', consoleInstance.getCurrentFilePath(), i);
        i = consoleInstance.util.replaceAll('%(cwd-original)', consoleInstance.getCwd(), i);
        i = consoleInstance.util.replaceAll('&fs;', '/', i);
        i = consoleInstance.util.replaceAll('&bs;', '\\', i);
        return i;
      };
      o.modif(m);
      o.enclosedVarInstance = this;
      return o;
    };

    return BuiltinVariables;

  })();

  module.exports = new BuiltinVariables();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy91Y2hpaGEvLmF0b20vcGFja2FnZXMvYXRvbS10ZXJtaW5hbC1wYW5lbC9saWIvYXRwLWJ1aWx0aW5zLXZhcmlhYmxlcy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7OztBQUFBO0FBQUEsTUFBQTs7RUFRQyxJQUFLLE9BQUEsQ0FBUSxzQkFBUjs7RUFDTixNQUE4QixPQUFBLENBQVEsTUFBUixDQUE5QixFQUFDLHFCQUFELEVBQVUscUJBQVYsRUFBbUI7O0VBQ25CLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUjs7RUFFTCxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxTQUFoQixHQUE0QjtJQUMxQixNQUFBLEVBQVEsU0FBQyxDQUFEO01BQ04sSUFBRyxDQUFDLENBQUMsT0FBTDtlQUNFLENBQUMsQ0FBQyxPQUFGLENBQUEsRUFERjs7SUFETSxDQURrQjs7O0VBTXRCOzs7K0JBQ0osSUFBQSxHQUNFO01BQUEsaUJBQUEsRUFBb0IsMENBQXBCO01BQ0Esa0JBQUEsRUFBcUIseUNBRHJCO01BRUEsa0JBQUEsRUFBcUIscUNBRnJCO01BR0EsU0FBQSxFQUFZLGlCQUhaO01BSUEsU0FBQSxFQUFZLDJCQUpaO01BS0EsU0FBQSxFQUFZLG9DQUxaO01BTUEsZ0JBQUEsRUFBbUIsaURBTm5CO01BT0EsZ0JBQUEsRUFBbUIsc0RBUG5CO01BUUEsZ0JBQUEsRUFBbUIsaURBUm5CO01BU0EsUUFBQSxFQUFXLDJCQVRYO01BVUEsYUFBQSxFQUFnQixlQVZoQjtNQVdBLGtCQUFBLEVBQXFCLGVBWHJCO01BWUEsYUFBQSxFQUFnQiwwQkFaaEI7TUFhQSxTQUFBLEVBQVksMEJBYlo7TUFjQSxTQUFBLEVBQVksNEJBZFo7TUFlQSxXQUFBLEVBQWMsOEJBZmQ7TUFnQkEsT0FBQSxFQUFVLDhCQWhCVjtNQWlCQSxVQUFBLEVBQWEsb0RBakJiO01Ba0JBLFNBQUEs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ekI7WUFDRSxXQUFBLEdBQWM7WUFDZCxPQUFPLENBQUMsSUFBUixDQUFhLFdBQWIsRUFBMEIsU0FBQTtxQkFDeEIsV0FBQSxHQUFjO1lBRFUsQ0FBMUI7WUFFQSxFQUFFLE1BQU0sQ0FBQztZQUVULFdBQUEsQ0FBQSxFQU5GOztBQU9BLGlCQUFPO1FBMUJBLENBaEJQOztNQTRDSixDQUFBLEdBQUksU0FBQyxDQUFEO1FBQ0YsQ0FBQSxHQUFJLGVBQWUsQ0FBQyxJQUFJLENBQUMsVUFBckIsQ0FBZ0Msa0JBQWhDLEVBQW9ELGVBQWUsQ0FBQyxrQkFBaEIsQ0FBQSxDQUFwRCxFQUEwRixDQUExRjtRQUNKLENBQUEsR0FBSSxlQUFlLENBQUMsSUFBSSxDQUFDLFVBQXJCLENBQWdDLGlCQUFoQyxFQUFtRCxlQUFlLENBQUMsTUFBaEIsQ0FBQSxDQUFuRCxFQUE2RSxDQUE3RTtRQUNKLENBQUEsR0FBSSxlQUFlLENBQUMsSUFBSSxDQUFDLFVBQXJCLENBQWdDLE1BQWhDLEVBQXdDLEdBQXhDLEVBQTZDLENBQTdDO1FBQ0osQ0FBQSxHQUFJLGVBQWUsQ0FBQyxJQUFJLENBQUMsVUFBckIsQ0FBZ0MsTUFBaEMsRUFBd0MsSUFBeEMsRUFBOEMsQ0FBOUM7QUFDSixlQUFPO01BTEw7TUFNSixDQUFDLENBQUMsS0FBRixDQUFRLENBQVI7TUFDQSxDQUFDLENBQUMsbUJBQUYsR0FBd0I7QUFDeEIsYUFBTztJQXJSRTs7Ozs7O0VBdVJiLE1BQU0sQ0FBQyxPQUFQLEdBQ00sSUFBQSxnQkFBQSxDQUFBO0FBbllOIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4gIEF0b20tdGVybWluYWwtcGFuZWxcbiAgQ29weXJpZ2h0IGJ5IGlzaXM5N1xuICBNSVQgbGljZW5zZWRcblxuICBDbGFzcyBjb250YWluaW5nIGFsbCBidWlsdGluIHZhcmlhYmxlcy5cbiMjI1xuXG57JH0gPSBpbmNsdWRlICdhdG9tLXNwYWNlLXBlbi12aWV3cydcbntyZXNvbHZlLCBkaXJuYW1lLCBleHRuYW1lfSA9IGluY2x1ZGUgJ3BhdGgnXG5vcyA9IGluY2x1ZGUgJ29zJ1xuXG4kLmV2ZW50LnNwZWNpYWwuZGVzdHJveWVkID0ge1xuICByZW1vdmU6IChvKSAtPlxuICAgIGlmIG8uaGFuZGxlclxuICAgICAgby5oYW5kbGVyKClcbn1cblxuY2xhc3MgQnVpbHRpblZhcmlhYmxlc1xuICBsaXN0OlxuICAgIFwiJShwcm9qZWN0LnJvb3QpXCIgOiBcImZpcnN0IGN1cnJlbnRseSBvcGVuZWQgcHJvamVjdCBkaXJlY3RvcnlcIlxuICAgIFwiJShwcm9qZWN0OklOREVYKVwiIDogXCJuLXRoIGN1cnJlbnRseSBvcGVuZWQgcHJvamVjdCBkaXJlY3RvcnlcIlxuICAgIFwiJShwcm9qZWN0LmNvdW50KVwiIDogXCJudW1iZXIgb2YgY3VycmVudGx5IG9wZW5lZCBwcm9qZWN0c1wiXG4gICAgXCIlKGF0b20pXCIgOiBcImF0b20gZGlyZWN0b3J5LlwiXG4gICAgXCIlKHBhdGgpXCIgOiBcImN1cnJlbnQgd29ya2luZyBkaXJlY3RvcnlcIlxuICAgIFwiJShmaWxlKVwiIDogXCJjdXJyZW5seSBvcGVuZWQgZmlsZSBpbiB0aGUgZWRpdG9yXCJcbiAgICBcIiUoZWRpdG9yLnBhdGgpXCIgOiBcInBhdGggb2YgdGhlIGZpbGUgY3VycmVudGx5IG9wZW5lZCBpbiB0aGUgZWRpdG9yXCJcbiAgICBcIiUoZWRpdG9yLmZpbGUpXCIgOiBcImZ1bGwgcGF0aCBvZiB0aGUgZmlsZSBjdXJyZW50bHkgb3BlbmVkIGluIHRoZSBlZGl0b3JcIlxuICAgIFwiJShlZGl0b3IubmFtZSlcIiA6IFwibmFtZSBvZiB0aGUgZmlsZSBjdXJyZW50bHkgb3BlbmVkIGluIHRoZSBlZGl0b3JcIlxuICAgIFwiJShjd2QpXCIgOiBcImN1cnJlbnQgd29ya2luZyBkaXJlY3RvcnlcIlxuICAgIFwiJShob3N0bmFtZSlcIiA6IFwiY29tcHV0ZXIgbmFtZVwiXG4gICAgXCIlKGNvbXB1dGVyLW5hbWUpXCIgOiBcImNvbXB1dGVyIG5hbWVcIlxuICAgIFwiJSh1c2VybmFtZSlcIiA6IFwiY3VycmVudGx5IGxvZ2dlZCBpbiB1c2VyXCJcbiAgICBcIiUodXNlcilcIiA6IFwiY3VycmVudGx5IGxvZ2dlZCBpbiB1c2VyXCJcbiAgICBcIiUoaG9tZSlcIiA6IFwiaG9tZSBkaXJlY3Rvcnkgb2YgdGhlIHVzZXJcIlxuICAgIFwiJShvc25hbWUpXCIgOiBcIm5hbWUgb2YgdGhlIG9wZXJhdGluZyBzeXN0ZW1cIlxuICAgIFwiJShvcylcIiA6IFwibmFtZSBvZiB0aGUgb3BlcmF0aW5nIHN5c3RlbVwiXG4gICAgXCIlKGVudi4qKVwiIDogXCJsaXN0IG9mIGFsbCBhdmFpbGFibGUgbmF0aXZlIGVudmlyb25tZW50IHZhcmlhYmxlc1wiXG4gICAgXCIlKC5kYXkpXCIgOiBcImN1cnJlbnQgZGF0ZTogZGF5IG51bWJlciAod2l0aG91dCBsZWFkaW5nIHplcm9zKVwiXG4gICAgXCIlKC5tb250aClcIiA6IFwiY3VycmVudCBkYXRlOiBtb250aCBudW1iZXIgKHdpdGhvdXQgbGVhZGluZyB6ZXJvcylcIlxuICAgIFwiJSgueWVhcilcIiA6IFwiY3VycmVudCBkYXRlOiB5ZWFyICh3aXRob3V0IGxlYWRpbmcgemVyb3MpXCJcbiAgICBcIiUoLmhvdXJzKVwiIDogXCJjdXJyZW50IGRhdGU6IGhvdXIgMjQtZm9ybWF0ICh3aXRob3V0IGxlYWRpbmcgemVyb3MpXCJcbiAgICBcIiUoLmhvdXJzMTIpXCIgOiBcImN1cnJlbnQgZGF0ZTogaG91ciAxMi1mb3JtYXQgKHdpdGhvdXQgbGVhZGluZyB6ZXJvcylcIlxuICAgIFwiJSgubWludXRlcylcIiA6IFwiY3VycmVudCBkYXRlOiBtaW51dGVzICh3aXRob3V0IGxlYWRpbmcgemVyb3MpXCJcbiAgICBcIiUoLnNlY29uZHMpXCIgOiBcImN1cnJlbnQgZGF0ZTogc2Vjb25kcyAod2l0aG91dCBsZWFkaW5nIHplcm9zKVwiXG4gICAgXCIlKC5taWxpcylcIiA6IFwiY3VycmVudCBkYXRlOiBtaWxpc2Vjb25kcyAod2l0aG91dCBsZWFkaW5nIHplcm9zKVwiXG4gICAgXCIlKGRheSlcIiA6IFwiY3VycmVudCBkYXRlOiBkYXkgbnVtYmVyXCJcbiAgICBcIiUobW9udGgpXCIgOiBcImN1cnJlbnQgZGF0ZTogbW9udGggbnVtYmVyXCJcbiAgICBcIiUoeWVhcilcIiA6IFwiY3VycmVudCBkYXRlOiB5ZWFyXCJcbiAgICBcIiUoaG91cnMpXCIgOiBcImN1cnJlbnQgZGF0ZTogaG91ciAyNC1mb3JtYXRcIlxuICAgIFwiJShob3VyczEyKVwiIDogXCJjdXJyZW50IGRhdGU6IGhvdXIgMTItZm9ybWF0XCJcbiAgICBcIiUobWludXRlcylcIiA6IFwiY3VycmVudCBkYXRlOiBtaW51dGVzXCJcbiAgICBcIiUoc2Vjb25kcylcIiA6IFwiY3VycmVudCBkYXRlOiBzZWNvbmRzXCJcbiAgICBcIiUobWlsaXMpXCIgOiBcImN1cnJlbnQgZGF0ZTogbWlsaXNlY29uZHNcIlxuICAgIFwiJShhbXBtKVwiIDogXCJkaXNwbGF5cyBhbS9wbSAoMTItaG91ciBmb3JtYXQpXCJcbiAgICBcIiUoQU1QTSlcIiA6IFwiZGlzcGxheXMgQU0vUE0gKDEyLWhvdXIgZm9ybWF0KVwiXG4gICAgXCIlKGxpbmUpXCIgOiBcImlucHV0IGxpbmUgbnVtYmVyXCJcbiAgICBcIiUoZGlzYylcIiA6IFwiY3VycmVudCB3b3JraW5nIGRpcmVjdG9yeSBkaXNjIG5hbWVcIlxuICAgIFwiJShsYWJlbDpUWVBFOlRFWFRcIjogXCIoc3R5bGluZy1hbm5vdGF0aW9uKSBjcmVhdGVzIGEgbGFiZWwgb2YgdGhlIHNwZWNpZmllZCB0eXBlXCJcbiAgICBcIiUodG9vbHRpcDpURVhUOmNvbnRlbnQ6Q09OVEVOVClcIjogXCIoc3R5bGluZy1hbm5vdGF0aW9uKSBjcmVhdGVzIGEgdG9vbHRpcCBtZXNzYWdlXCJcbiAgICBcIiUobGluaylcIjogXCIoc3R5bGluZy1hbm5vdGF0aW9uKSBzdGFydHMgdGhlIGZpbGUgbGluayAtIHNlZSAlKGVuZGxpbmspXCJcbiAgICBcIiUoZW5kbGluaylcIjogXCIoc3R5bGluZy1hbm5vdGF0aW9uKSBlbmRzIHRoZSBmaWxlIGxpbmsgLSBzZWUgJShsaW5rKVwiXG4gICAgXCIlKF4pXCI6IFwiKHN0eWxpbmctYW5ub3RhdGlvbikgZW5kcyB0ZXh0IGZvcm1hdHRpbmdcIlxuICAgIFwiJSheQ09MT1IpXCI6IFwiKHN0eWxpbmctYW5ub3RhdGlvbikgY3JlYXRlcyBjb2xvdXJlZCB0ZXh0XCJcbiAgICBcIiUoXmIpXCI6IFwiKHN0eWxpbmctYW5ub3RhdGlvbikgY3JlYXRlcyBib2xkZWQgdGV4dFwiXG4gICAgXCIlKF5ib2xkKVwiOiBcIihzdHlsaW5nLWFubm90YXRpb24pIGNyZWF0ZXMgYm9sZGVkIHRleHRcIlxuICAgIFwiJSheaSlcIjogXCIoc3R5bGluZy1hbm5vdGF0aW9uKSBjcmVhdGVzIGl0YWxpY3MgdGV4dFwiXG4gICAgXCIlKF5pdGFsaWNzKVwiOiBcIihzdHlsaW5nLWFubm90YXRpb24pIGNyZWF0ZXMgaXRhbGljcyB0ZXh0XCJcbiAgICBcIiUoXnUpXCI6IFwiKHN0eWxpbmctYW5ub3RhdGlvbikgY3JlYXRlcyB1bmRlcmxpbmUgdGV4dFwiXG4gICAgXCIlKF51bmRlcmxpbmUpXCI6IFwiKHN0eWxpbmctYW5ub3RhdGlvbikgY3JlYXRlcyB1bmRlcmxpbmUgdGV4dFwiXG4gICAgXCIlKF5sKVwiOiBcIihzdHlsaW5nLWFubm90YXRpb24pIGNyZWF0ZXMgYSBsaW5lIHRocm91Z2ggdGhlIHRleHRcIlxuICAgIFwiJShebGluZS10cm91Z2gpXCI6IFwiKHN0eWxpbmctYW5ub3RhdGlvbikgY3JlYXRlcyBhIGxpbmUgdGhyb3VnaCB0aGUgdGV4dFwiXG4gICAgXCIlKHBhdGg6SU5ERVgpXCI6IFwicmVmZXJzIHRvIHRoZSAlKHBhdGgpIGNvbXBvbmVudHNcIlxuICAgIFwiJSgqKVwiOiBcIihvbmx5IHVzZXItZGVmaW5lZCBjb21tYW5kcykgcmVmZXJzIHRvIHRoZSBhbGwgcGFzc2VkIHBhcmFtZXRlcnNcIlxuICAgIFwiJSgqXilcIjogXCIob25seSB1c2VyLWRlZmluZWQgY29tbWFuZHMpIHJlZmVycyB0byB0aGUgZnVsbCBjb21tYW5kIHN0cmluZ1wiXG4gICAgXCIlKElOREVYKVwiOiBcIihvbmx5IHVzZXItZGVmaW5lZCBjb21tYW5kcykgcmVmZXJzIHRvIHRoZSBwYXNzZWQgcGFyYW1ldGVyc1wiXG4gICAgXCIlKHJhdylcIjogXCJNYWtlcyB0aGUgZW50aXJlIGV4cHJlc3Npb24gZXZhbHVhdGVkIG9ubHkgd2hlbiBwcmludGluZyB0byBvdXRwdXQgKGRlbGF5ZWQtZXZhbHVhdGlvbilcIlxuICAgIFwiJShkeW5hbWljKVwiOiBcIkluZGljYXRlcyB0aGF0IHRoZSBleHByZXNzaW9uIHNob3VsZCBiZSBkeW5hbWljYWxseSB1cGRhdGVkLlwiXG4gIGN1c3RvbVZhcmlhYmxlczogW11cblxuICBwdXRWYXJpYWJsZTogKGVudHJ5KSAtPlxuICAgIEBjdXN0b21WYXJpYWJsZXMucHVzaCBlbnRyeVxuICAgIEBsaXN0WyclKCcrZW50cnkubmFtZSsnKSddID0gZW50cnkuZGVzY3JpcHRpb24gb3IgXCJcIlxuXG4gIHJlbW92ZUFubm90YXRpb246IChjb25zb2xlSW5zdGFuY2UsIHByb21wdCkgLT5cbiAgICByZXR1cm4gcHJvbXB0LnJlcGxhY2UgLyVcXCgoPyFjd2Qtb3JpZ2luYWxcXCkpKD8hZmlsZS1vcmlnaW5hbFxcKSkoW15cXChcXCldKilcXCkvaW1nLCAobWF0Y2gsIHRleHQsIHVybElkKSA9PlxuICAgICAgcmV0dXJuICcnXG5cbiAgcGFyc2VIdG1sOiAoY29uc29sZUluc3RhbmNlLCBwcm9tcHQsIHZhbHVlcywgc3RhcnRSZWZyZXNoVGFzaz10cnVlKSAtPlxuICAgIG8gPSBAcGFyc2VGdWxsKGNvbnNvbGVJbnN0YW5jZSwgcHJvbXB0LCB2YWx1ZXMsIHN0YXJ0UmVmcmVzaFRhc2spXG4gICAgaWYgby5tb2RpZj9cbiAgICAgIG8ubW9kaWYgKGkpID0+XG4gICAgICAgIGkgPSBjb25zb2xlSW5zdGFuY2UudXRpbC5yZXBsYWNlQWxsICclKGZpbGUtb3JpZ2luYWwpJywgY29uc29sZUluc3RhbmNlLmdldEN1cnJlbnRGaWxlUGF0aCgpLCBpXG4gICAgICAgIGkgPSBjb25zb2xlSW5zdGFuY2UudXRpbC5yZXBsYWNlQWxsICclKGN3ZC1vcmlnaW5hbCknLCBjb25zb2xlSW5zdGFuY2UuZ2V0Q3dkKCksIGlcbiAgICAgICAgaSA9IGNvbnNvbGVJbnN0YW5jZS51dGlsLnJlcGxhY2VBbGwgJyZmczsnLCAnLycsIGlcbiAgICAgICAgaSA9IGNvbnNvbGVJbnN0YW5jZS51dGlsLnJlcGxhY2VBbGwgJyZiczsnLCAnXFxcXCcsIGlcbiAgICAgICAgcmV0dXJuIGlcbiAgICBpZiBvLmdldEh0bWw/XG4gICAgICByZXR1cm4gby5nZXRIdG1sKClcbiAgICByZXR1cm4gb1xuXG4gIHBhcnNlOiAoY29uc29sZUluc3RhbmNlLCBwcm9tcHQsIHZhbHVlcykgLT5cbiAgICBvID0gQHBhcnNlRnVsbChjb25zb2xlSW5zdGFuY2UsIHByb21wdCwgdmFsdWVzKVxuICAgIGlmIG8uZ2V0VGV4dD9cbiAgICAgIHJldHVybiBvLmdldFRleHQoKVxuICAgIHJldHVybiBvXG5cbiAgcGFyc2VGdWxsOiAoY29uc29sZUluc3RhbmNlLCBwcm9tcHQsIHZhbHVlcywgc3RhcnRSZWZyZXNoVGFzaz10cnVlKSAtPlxuXG4gICAgb3JpZyA9IHByb21wdFxuICAgIHRleHQgPSAnJ1xuICAgIGlzRHluYW1pY0V4cHJlc3Npb24gPSBmYWxzZVxuICAgIGR5bmFtaWNFeHByZXNzaW9uVXBkYXRlRGVsYXkgPSAxMDBcblxuICAgIGlmIG5vdCBjb25zb2xlSW5zdGFuY2U/XG4gICAgICByZXR1cm4gJydcbiAgICBpZiBub3QgcHJvbXB0P1xuICAgICAgcmV0dXJuICcnXG5cbiAgICBjbWQgPSBudWxsXG4gICAgZmlsZSA9IGNvbnNvbGVJbnN0YW5jZS5nZXRDdXJyZW50RmlsZVBhdGgoKVxuICAgIGlmIHZhbHVlcz9cbiAgICAgIGlmIHZhbHVlcy5jbWQ/XG4gICAgICAgIGNtZCA9IHZhbHVlcy5jbWRcbiAgICAgIGlmIHZhbHVlcy5maWxlP1xuICAgICAgICBmaWxlID0gdmFsdWVzLmZpbGVcblxuICAgIGlmIChub3QgYXRvbS5jb25maWcuZ2V0KCdhdG9tLXRlcm1pbmFsLXBhbmVsLnBhcnNlU3BlY2lhbFRlbXBsYXRlVG9rZW5zJykpIGFuZCAobm90IGNvbnNvbGVJbnN0YW5jZS5zcGVjc01vZGUpXG4gICAgICBjb25zb2xlSW5zdGFuY2UucHJlc2VydmVPcmlnaW5hbFBhdGhzIChwcm9tcHQucmVwbGFjZSAvJVxcKFteIF0qXFwpL2lnLCAnJylcblxuICAgIGlmIHByb21wdC5pbmRleE9mKCclJykgPT0gLTFcbiAgICAgIGNvbnNvbGVJbnN0YW5jZS5wcmVzZXJ2ZU9yaWdpbmFsUGF0aHMgcHJvbXB0XG5cbiAgICBwcm9tcHQucmVwbGFjZSAvJVxcKGR5bmFtaWM6PyhbMC05XSspP1xcKS9pZywgKG1hdGNoLCBwMSkgPT5cbiAgICAgIGlmIHAxP1xuICAgICAgICBkeW5hbWljRXhwcmVzc2lvblVwZGF0ZURlbGF5ID0gcGFyc2VJbnQocDEpXG4gICAgICBpc0R5bmFtaWNFeHByZXNzaW9uID0gdHJ1ZVxuICAgICAgcmV0dXJuICcnXG5cbiAgICBmb3Iga2V5LCB2YWx1ZSBvZiB2YWx1ZXNcbiAgICAgIGlmIGtleSAhPSAnY21kJyBhbmQga2V5ICE9ICdmaWxlJ1xuICAgICAgICBwcm9tcHQgPSBjb25zb2xlSW5zdGFuY2UudXRpbC5yZXBsYWNlQWxsIFwiJSgje2tleX0pXCIsIHZhbHVlLCBwcm9tcHRcblxuICAgIGlmIHByb21wdC5pbmRleE9mKCclKHJhdyknKSA9PSAtMVxuICAgICAgcGFuZWxQYXRoID0gYXRvbS5wYWNrYWdlcy5yZXNvbHZlUGFja2FnZVBhdGggJ2F0b20tdGVybWluYWwtcGFuZWwnXG4gICAgICBhdG9tUGF0aCA9IHJlc29sdmUgcGFuZWxQYXRoKycvLi4vLi4nXG5cbiAgICAgIHByb21wdCA9IGNvbnNvbGVJbnN0YW5jZS51dGlsLnJlcGxhY2VBbGwgJyUoYXRvbSknLCBhdG9tUGF0aCwgcHJvbXB0XG4gICAgICBwcm9tcHQgPSBjb25zb2xlSW5zdGFuY2UudXRpbC5yZXBsYWNlQWxsICclKHBhdGgpJywgY29uc29sZUluc3RhbmNlLmdldEN3ZCgpLCBwcm9tcHRcbiAgICAgIHByb21wdCA9IGNvbnNvbGVJbnN0YW5jZS51dGlsLnJlcGxhY2VBbGwgJyUoZmlsZSknLCBmaWxlLCBwcm9tcHRcbiAgICAgIHByb21wdCA9IGNvbnNvbGVJbnN0YW5jZS51dGlsLnJlcGxhY2VBbGwgJyUoZWRpdG9yLnBhdGgpJywgY29uc29sZUluc3RhbmNlLmdldEN1cnJlbnRGaWxlTG9jYXRpb24oKSwgcHJvbXB0XG4gICAgICBwcm9tcHQgPSBjb25zb2xlSW5zdGFuY2UudXRpbC5yZXBsYWNlQWxsICclKGVkaXRvci5maWxlKScsIGNvbnNvbGVJbnN0YW5jZS5nZXRDdXJyZW50RmlsZVBhdGgoKSwgcHJvbXB0XG4gICAgICBwcm9tcHQgPSBjb25zb2xlSW5zdGFuY2UudXRpbC5yZXBsYWNlQWxsICclKGVkaXRvci5uYW1lKScsIGNvbnNvbGVJbnN0YW5jZS5nZXRDdXJyZW50RmlsZU5hbWUoKSwgcHJvbXB0XG4gICAgICBwcm9tcHQgPSBjb25zb2xlSW5zdGFuY2UudXRpbC5yZXBsYWNlQWxsICclKGN3ZCknLCBjb25zb2xlSW5zdGFuY2UuZ2V0Q3dkKCksIHByb21wdFxuICAgICAgcHJvbXB0ID0gY29uc29sZUluc3RhbmNlLnV0aWwucmVwbGFjZUFsbCAnJShob3N0bmFtZSknLCBvcy5ob3N0bmFtZSgpLCBwcm9tcHRcbiAgICAgIHByb21wdCA9IGNvbnNvbGVJbnN0YW5jZS51dGlsLnJlcGxhY2VBbGwgJyUoY29tcHV0ZXItbmFtZSknLCBvcy5ob3N0bmFtZSgpLCBwcm9tcHRcblxuICAgICAgdXNlcm5hbWUgPSBwcm9jZXNzLmVudi5VU0VSTkFNRSBvciBwcm9jZXNzLmVudi5MT0dOQU1FIG9yIHByb2Nlc3MuZW52LlVTRVJcbiAgICAgIHByb21wdCA9IGNvbnNvbGVJbnN0YW5jZS51dGlsLnJlcGxhY2VBbGwgJyUodXNlcm5hbWUpJywgdXNlcm5hbWUsIHByb21wdFxuICAgICAgcHJvbXB0ID0gY29uc29sZUluc3RhbmNlLnV0aWwucmVwbGFjZUFsbCAnJSh1c2VyKScsIHVzZXJuYW1lLCBwcm9tcHRcblxuICAgICAgaG9tZWxvY2F0aW9uID0gcHJvY2Vzcy5lbnYuSE9NRSBvciBwcm9jZXNzLmVudi5IT01FUEFUSCBvciBwcm9jZXNzLmVudi5IT01FRElSXG4gICAgICBwcm9tcHQgPSBjb25zb2xlSW5zdGFuY2UudXRpbC5yZXBsYWNlQWxsICclKGhvbWUpJywgaG9tZWxvY2F0aW9uLCBwcm9tcHRcblxuICAgICAgb3NuYW1lID0gcHJvY2Vzcy5wbGF0Zm9ybSBvciBwcm9jZXNzLmVudi5PU1xuICAgICAgcHJvbXB0ID0gY29uc29sZUluc3RhbmNlLnV0aWwucmVwbGFjZUFsbCAnJShvc25hbWUpJywgb3NuYW1lLCBwcm9tcHRcbiAgICAgIHByb21wdCA9IGNvbnNvbGVJbnN0YW5jZS51dGlsLnJlcGxhY2VBbGwgJyUob3MpJywgb3NuYW1lLCBwcm9tcHRcblxuICAgICAgcHJvbXB0ID0gcHJvbXB0LnJlcGxhY2UgLyVcXChlbnZcXC5bQS1aYS16X1xcKl0qXFwpL2lnLCAobWF0Y2gsIHRleHQsIHVybElkKSA9PlxuICAgICAgICBuYXRpdmVWYXJOYW1lID0gbWF0Y2hcbiAgICAgICAgbmF0aXZlVmFyTmFtZSA9IGNvbnNvbGVJbnN0YW5jZS51dGlsLnJlcGxhY2VBbGwgJyUoZW52LicsICcnLCBuYXRpdmVWYXJOYW1lXG4gICAgICAgIG5hdGl2ZVZhck5hbWUgPSBuYXRpdmVWYXJOYW1lLnN1YnN0cmluZygwLCBuYXRpdmVWYXJOYW1lLmxlbmd0aC0xKVxuICAgICAgICBpZiBuYXRpdmVWYXJOYW1lID09ICcqJ1xuICAgICAgICAgIHJldCA9ICdwcm9jZXNzLmVudiB7XFxuJ1xuICAgICAgICAgIGZvciBrZXksIHZhbHVlIG9mIHByb2Nlc3MuZW52XG4gICAgICAgICAgICByZXQgKz0gJ1xcdCcgKyBrZXkgKyAnXFxuJ1xuICAgICAgICAgIHJldCArPSAnfSdcbiAgICAgICAgICByZXR1cm4gcmV0XG5cbiAgICAgICAgcmV0dXJuIHByb2Nlc3MuZW52W25hdGl2ZVZhck5hbWVdXG5cblxuICAgICAgaWYgY21kP1xuICAgICAgICBwcm9tcHQgPSBjb25zb2xlSW5zdGFuY2UudXRpbC5yZXBsYWNlQWxsICclKGNvbW1hbmQpJywgY21kLCBwcm9tcHRcbiAgICAgIHRvZGF5ID0gbmV3IERhdGUoKVxuICAgICAgZGF5ID0gdG9kYXkuZ2V0RGF0ZSgpXG4gICAgICBtb250aCA9IHRvZGF5LmdldE1vbnRoKCkrMVxuICAgICAgeWVhciA9IHRvZGF5LmdldEZ1bGxZZWFyKClcbiAgICAgIG1pbnV0ZXMgPSB0b2RheS5nZXRNaW51dGVzKClcbiAgICAgIGhvdXJzID0gdG9kYXkuZ2V0SG91cnMoKVxuICAgICAgaG91cnMxMiA9IHRvZGF5LmdldEhvdXJzKCkgJSAxMlxuICAgICAgbWlsaXMgPSB0b2RheS5nZXRNaWxsaXNlY29uZHMoKVxuICAgICAgc2Vjb25kcyA9IHRvZGF5LmdldFNlY29uZHMoKVxuICAgICAgYW1wbSA9ICdhbSdcbiAgICAgIGFtcG1DID0gJ0FNJ1xuXG4gICAgICBpZiBob3VycyA+PSAxMlxuICAgICAgICBhbXBtID0gJ3BtJ1xuICAgICAgICBhbXBtQyA9ICdQTSdcblxuICAgICAgcHJvbXB0ID0gY29uc29sZUluc3RhbmNlLnV0aWwucmVwbGFjZUFsbCAnJSguZGF5KScsIGRheSwgcHJvbXB0XG4gICAgICBwcm9tcHQgPSBjb25zb2xlSW5zdGFuY2UudXRpbC5yZXBsYWNlQWxsICclKC5tb250aCknLCBtb250aCwgcHJvbXB0XG4gICAgICBwcm9tcHQgPSBjb25zb2xlSW5zdGFuY2UudXRpbC5yZXBsYWNlQWxsICclKC55ZWFyKScsIHllYXIsIHByb21wdFxuICAgICAgcHJvbXB0ID0gY29uc29sZUluc3RhbmNlLnV0aWwucmVwbGFjZUFsbCAnJSguaG91cnMpJywgaG91cnMsIHByb21wdFxuICAgICAgcHJvbXB0ID0gY29uc29sZUluc3RhbmNlLnV0aWwucmVwbGFjZUFsbCAnJSguaG91cnMxMiknLCBob3VyczEyLCBwcm9tcHRcbiAgICAgIHByb21wdCA9IGNvbnNvbGVJbnN0YW5jZS51dGlsLnJlcGxhY2VBbGwgJyUoLm1pbnV0ZXMpJywgbWludXRlcywgcHJvbXB0XG4gICAgICBwcm9tcHQgPSBjb25zb2xlSW5zdGFuY2UudXRpbC5yZXBsYWNlQWxsICclKC5zZWNvbmRzKScsIHNlY29uZHMsIHByb21wdFxuICAgICAgcHJvbXB0ID0gY29uc29sZUluc3RhbmNlLnV0aWwucmVwbGFjZUFsbCAnJSgubWlsaXMpJywgbWlsaXMsIHByb21wdFxuXG4gICAgICBpZiBzZWNvbmRzIDwgMTBcbiAgICAgICAgc2Vjb25kcyA9ICcwJyArIHNlY29uZHNcbiAgICAgIGlmIGRheSA8IDEwXG4gICAgICAgIGRheSA9ICcwJyArIGRheVxuICAgICAgaWYgbW9udGggPCAxMFxuICAgICAgICBtb250aCA9ICcwJyArIG1vbnRoXG4gICAgICBpZiBtaWxpcyA8IDEwXG4gICAgICAgIG1pbGlzID0gJzAwMCcgKyBtaWxpc1xuICAgICAgZWxzZSBpZiBtaWxpcyA8IDEwMFxuICAgICAgICBtaWxpcyA9ICcwMCcgKyBtaWxpc1xuICAgICAgZWxzZSBpZiBtaWxpcyA8IDEwMDBcbiAgICAgICAgbWlsaXMgPSAnMCcgKyBtaWxpc1xuICAgICAgaWYgbWludXRlcyA8IDEwXG4gICAgICAgIG1pbnV0ZXMgPSAnMCcgKyBtaW51dGVzXG4gICAgICBpZiBob3VycyA+PSAxMlxuICAgICAgICBhbXBtID0gJ3BtJ1xuICAgICAgaWYgaG91cnMgPCAxMFxuICAgICAgICBob3VycyA9ICcwJyArIGhvdXJzXG4gICAgICBpZiBob3VyczEyIDwgMTBcbiAgICAgICAgaG91cnMxMiA9ICcwJyArIGhvdXJzMTJcblxuICAgICAgcHJvbXB0ID0gY29uc29sZUluc3RhbmNlLnV0aWwucmVwbGFjZUFsbCAnJShkYXkpJywgZGF5LCBwcm9tcHRcbiAgICAgIHByb21wdCA9IGNvbnNvbGVJbnN0YW5jZS51dGlsLnJlcGxhY2VBbGwgJyUobW9udGgpJywgbW9udGgsIHByb21wdFxuICAgICAgcHJvbXB0ID0gY29uc29sZUluc3RhbmNlLnV0aWwucmVwbGFjZUFsbCAnJSh5ZWFyKScsIHllYXIsIHByb21wdFxuICAgICAgcHJvbXB0ID0gY29uc29sZUluc3RhbmNlLnV0aWwucmVwbGFjZUFsbCAnJShob3VycyknLCBob3VycywgcHJvbXB0XG4gICAgICBwcm9tcHQgPSBjb25zb2xlSW5zdGFuY2UudXRpbC5yZXBsYWNlQWxsICclKGhvdXJzMTIpJywgaG91cnMxMiwgcHJvbXB0XG4gICAgICBwcm9tcHQgPSBjb25zb2xlSW5zdGFuY2UudXRpbC5yZXBsYWNlQWxsICclKGFtcG0pJywgYW1wbSwgcHJvbXB0XG4gICAgICBwcm9tcHQgPSBjb25zb2xlSW5zdGFuY2UudXRpbC5yZXBsYWNlQWxsICclKEFNUE0pJywgYW1wbUMsIHByb21wdFxuICAgICAgcHJvbXB0ID0gY29uc29sZUluc3RhbmNlLnV0aWwucmVwbGFjZUFsbCAnJShtaW51dGVzKScsIG1pbnV0ZXMsIHByb21wdFxuICAgICAgcHJvbXB0ID0gY29uc29sZUluc3RhbmNlLnV0aWwucmVwbGFjZUFsbCAnJShzZWNvbmRzKScsIHNlY29uZHMsIHByb21wdFxuICAgICAgcHJvbXB0ID0gY29uc29sZUluc3RhbmNlLnV0aWwucmVwbGFjZUFsbCAnJShtaWxpcyknLCBtaWxpcywgcHJvbXB0XG4gICAgICBwcm9tcHQgPSBjb25zb2xlSW5zdGFuY2UudXRpbC5yZXBsYWNlQWxsICclKGxpbmUpJywgY29uc29sZUluc3RhbmNlLmlucHV0TGluZSsxLCBwcm9tcHRcblxuICAgICAgcHJvamVjdFBhdGhzID0gYXRvbS5wcm9qZWN0LmdldFBhdGhzKClcbiAgICAgIHByb2plY3RQYXRoc0NvdW50ID0gcHJvamVjdFBhdGhzLmxlbmd0aCAtIDFcbiAgICAgIHByb21wdCA9IGNvbnNvbGVJbnN0YW5jZS51dGlsLnJlcGxhY2VBbGwgJyUocHJvamVjdC5yb290KScsIHByb2plY3RQYXRoc1swXSwgcHJvbXB0XG4gICAgICBwcm9tcHQgPSBjb25zb2xlSW5zdGFuY2UudXRpbC5yZXBsYWNlQWxsICclKHByb2plY3QuY291bnQpJywgcHJvamVjdFBhdGhzLmxlbmd0aCwgcHJvbXB0XG4gICAgICBmb3IgaSBpbiBbMC4ucHJvamVjdFBhdGhzQ291bnRdIGJ5IDFcbiAgICAgICAgYnJlYWRjcnVtYklkRndkID0gaS1wcm9qZWN0UGF0aHNDb3VudC0xXG4gICAgICAgIGJyZWFkY3J1bWJJZFJ3ZCA9IGlcbiAgICAgICAgcHJvbXB0ID0gY29uc29sZUluc3RhbmNlLnV0aWwucmVwbGFjZUFsbCBcIiUocHJvamVjdDoje2JyZWFkY3J1bWJJZEZ3ZH0pXCIsIHByb2plY3RQYXRoc1tpXSwgcHJvbXB0XG4gICAgICAgIHByb21wdCA9IGNvbnNvbGVJbnN0YW5jZS51dGlsLnJlcGxhY2VBbGwgXCIlKHByb2plY3Q6I3ticmVhZGNydW1iSWRSd2R9KVwiLCBwcm9qZWN0UGF0aHNbaV0sIHByb21wdFxuXG4gICAgICBwYXRoQnJlYWRjcnVtYnMgPSBjb25zb2xlSW5zdGFuY2UuZ2V0Q3dkKCkuc3BsaXQgL1xcXFx8XFwvL2lnXG4gICAgICBwYXRoQnJlYWRjcnVtYnNbMF0gPSBwYXRoQnJlYWRjcnVtYnNbMF0uY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBwYXRoQnJlYWRjcnVtYnNbMF0uc2xpY2UoMSlcbiAgICAgIGRpc2MgPSBjb25zb2xlSW5zdGFuY2UudXRpbC5yZXBsYWNlQWxsICc6JywgJycsIHBhdGhCcmVhZGNydW1ic1swXVxuICAgICAgcHJvbXB0ID0gY29uc29sZUluc3RhbmNlLnV0aWwucmVwbGFjZUFsbCAnJShkaXNjKScsIGRpc2MsIHByb21wdFxuXG4gICAgICBwYXRoQnJlYWRjcnVtYnNTaXplID0gcGF0aEJyZWFkY3J1bWJzLmxlbmd0aCAtIDFcbiAgICAgIGZvciBpIGluIFswLi5wYXRoQnJlYWRjcnVtYnNTaXplXSBieSAxXG4gICAgICAgIGJyZWFkY3J1bWJJZEZ3ZCA9IGktcGF0aEJyZWFkY3J1bWJzU2l6ZS0xXG4gICAgICAgIGJyZWFkY3J1bWJJZFJ3ZCA9IGlcbiAgICAgICAgcHJvbXB0ID0gY29uc29sZUluc3RhbmNlLnV0aWwucmVwbGFjZUFsbCBcIiUocGF0aDoje2JyZWFkY3J1bWJJZEZ3ZH0pXCIsIHBhdGhCcmVhZGNydW1ic1tpXSwgcHJvbXB0XG4gICAgICAgIHByb21wdCA9IGNvbnNvbGVJbnN0YW5jZS51dGlsLnJlcGxhY2VBbGwgXCIlKHBhdGg6I3ticmVhZGNydW1iSWRSd2R9KVwiLCBwYXRoQnJlYWRjcnVtYnNbaV0sIHByb21wdFxuXG4gICAgICBwcm9tcHQgPSBwcm9tcHQucmVwbGFjZSAvJVxcKHRvb2x0aXA6W15cXG5cXHRcXFtcXF17fSVcXClcXChdKlxcKS9pZywgKG1hdGNoLCB0ZXh0LCB1cmxJZCkgPT5cbiAgICAgICAgdGFyZ2V0ID0gY29uc29sZUluc3RhbmNlLnV0aWwucmVwbGFjZUFsbCAnJSh0b29sdGlwOicsICcnLCBtYXRjaFxuICAgICAgICB0YXJnZXQgPSB0YXJnZXQuc3Vic3RyaW5nIDAsIHRhcmdldC5sZW5ndGgtMVxuICAgICAgICB0YXJnZXRfdG9rZW5zID0gdGFyZ2V0LnNwbGl0ICc6Y29udGVudDonXG4gICAgICAgIHRhcmdldCA9IHRhcmdldF90b2tlbnNbMF1cbiAgICAgICAgY29udGVudCA9IHRhcmdldF90b2tlbnNbMV1cbiAgICAgICAgcmV0dXJuIFwiPGZvbnQgZGF0YS10b2dnbGU9XFxcInRvb2x0aXBcXFwiIGRhdGEtcGxhY2VtZW50PVxcXCJ0b3BcXFwiIHRpdGxlPVxcXCIje3RhcmdldH1cXFwiPiN7Y29udGVudH08L2ZvbnQ+XCJcblxuICAgICAgIyAvJVxcKGxpbms6W15cXG5cXHRcXFtcXF17fSVcXClcXChdKlxcKS9pZ1xuXG4gICAgICBpZiBwcm9tcHQuaW5kZXhPZignJShsaW5rOicpICE9IC0xXG4gICAgICAgIHRocm93ICdFcnJvcjpcXG5Vc2FnZSBvZiAlKGxpbms6KSBpcyBkZXByZWNhdGVkLlxcblVzZSAlKGxpbmspdGFyZ2V0JShlbmRsaW5rKSBub3RhdGlvblxcbmluc3RlYWQgb2YgJShsaW5rOnRhcmdldCkhXFxuQXQ6IFsnK3Byb21wdCsnXSdcblxuICAgICAgcHJvbXB0ID0gcHJvbXB0LnJlcGxhY2UgLyVcXChsaW5rXFwpW14lXSolXFwoZW5kbGlua1xcKS9pZywgKG1hdGNoLCB0ZXh0LCB1cmxJZCkgPT5cbiAgICAgICAgdGFyZ2V0ID0gbWF0Y2hcbiAgICAgICAgdGFyZ2V0ID0gY29uc29sZUluc3RhbmNlLnV0aWwucmVwbGFjZUFsbCAnJShsaW5rKScsICcnLCB0YXJnZXRcbiAgICAgICAgdGFyZ2V0ID0gY29uc29sZUluc3RhbmNlLnV0aWwucmVwbGFjZUFsbCAnJShlbmRsaW5rKScsICcnLCB0YXJnZXRcbiAgICAgICAgIyB0YXJnZXQgPSB0YXJnZXQuc3Vic3RyaW5nIDAsIHRhcmdldC5sZW5ndGgtMVxuICAgICAgICByZXQgPSBjb25zb2xlSW5zdGFuY2UuY29uc29sZUxpbmsgdGFyZ2V0LCB0cnVlXG4gICAgICAgIHJldHVybiByZXRcblxuICAgICAgcHJvbXB0ID0gcHJvbXB0LnJlcGxhY2UgLyVcXChcXF5bXlxcc1xcKFxcKV0qXFwpL2lnLCAobWF0Y2gsIHRleHQsIHVybElkKSA9PlxuICAgICAgICB0YXJnZXQgPSBjb25zb2xlSW5zdGFuY2UudXRpbC5yZXBsYWNlQWxsICclKF4nLCAnJywgbWF0Y2hcbiAgICAgICAgdGFyZ2V0ID0gdGFyZ2V0LnN1YnN0cmluZyAwLCB0YXJnZXQubGVuZ3RoLTFcblxuICAgICAgICBpZiB0YXJnZXQgPT0gJydcbiAgICAgICAgICByZXR1cm4gJzwvZm9udD4nXG4gICAgICAgIGVsc2UgaWYgdGFyZ2V0LmNoYXJBdCgwKSA9PSAnIydcbiAgICAgICAgICByZXR1cm4gXCI8Zm9udCBzdHlsZT1cXFwiY29sb3I6I3t0YXJnZXR9O1xcXCI+XCJcbiAgICAgICAgZWxzZSBpZiB0YXJnZXQgPT0gJ2InIG9yIHRhcmdldCA9PSAnYm9sZCdcbiAgICAgICAgICByZXR1cm4gXCI8Zm9udCBzdHlsZT1cXFwiZm9udC13ZWlnaHQ6Ym9sZDtcXFwiPlwiXG4gICAgICAgIGVsc2UgaWYgdGFyZ2V0ID09ICd1JyBvciB0YXJnZXQgPT0gJ3VuZGVybGluZSdcbiAgICAgICAgICByZXR1cm4gXCI8Zm9udCBzdHlsZT1cXFwidGV4dC1kZWNvcmF0aW9uOnVuZGVybGluZTtcXFwiPlwiXG4gICAgICAgIGVsc2UgaWYgdGFyZ2V0ID09ICdpJyBvciB0YXJnZXQgPT0gJ2l0YWxpYydcbiAgICAgICAgICByZXR1cm4gXCI8Zm9udCBzdHlsZT1cXFwiZm9udC1zdHlsZTppdGFsaWM7XFxcIj5cIlxuICAgICAgICBlbHNlIGlmIHRhcmdldCA9PSAnbCcgb3IgdGFyZ2V0ID09ICdsaW5lLXRocm91Z2gnXG4gICAgICAgICAgcmV0dXJuIFwiPGZvbnQgc3R5bGU9XFxcInRleHQtZGVjb3JhdGlvbjpsaW5lLXRocm91Z2g7XFxcIj5cIlxuICAgICAgICByZXR1cm4gJydcblxuICAgICAgaWYgKGF0b20uY29uZmlnLmdldCAnYXRvbS10ZXJtaW5hbC1wYW5lbC5lbmFibGVDb25zb2xlTGFiZWxzJykgb3IgY29uc29sZUluc3RhbmNlLnNwZWNzTW9kZVxuICAgICAgICBwcm9tcHQgPSBwcm9tcHQucmVwbGFjZSAvJVxcKGxhYmVsOlteXFxuXFx0XFxbXFxde30lXFwpXFwoXSpcXCkvaWcsIChtYXRjaCwgdGV4dCwgdXJsSWQpID0+XG4gICAgICAgICAgdGFyZ2V0ID0gY29uc29sZUluc3RhbmNlLnV0aWwucmVwbGFjZUFsbCAnJShsYWJlbDonLCAnJywgbWF0Y2hcbiAgICAgICAgICB0YXJnZXQgPSB0YXJnZXQuc3Vic3RyaW5nIDAsIHRhcmdldC5sZW5ndGgtMVxuICAgICAgICAgIHRhcmdldF90b2tlbnMgPSB0YXJnZXQuc3BsaXQgJzp0ZXh0OidcbiAgICAgICAgICB0YXJnZXQgPSB0YXJnZXRfdG9rZW5zWzBdXG4gICAgICAgICAgY29udGVudCA9IHRhcmdldF90b2tlbnNbMV1cbiAgICAgICAgICByZXR1cm4gY29uc29sZUluc3RhbmNlLmNvbnNvbGVMYWJlbCB0YXJnZXQsIGNvbnRlbnRcbiAgICAgIGVsc2VcbiAgICAgICAgcHJvbXB0ID0gcHJvbXB0LnJlcGxhY2UgLyVcXChsYWJlbDpbXlxcblxcdFxcW1xcXXt9JVxcKVxcKF0qXFwpL2lnLCAobWF0Y2gsIHRleHQsIHVybElkKSA9PlxuICAgICAgICAgIHRhcmdldCA9IGNvbnNvbGVJbnN0YW5jZS51dGlsLnJlcGxhY2VBbGwgJyUobGFiZWw6JywgJycsIG1hdGNoXG4gICAgICAgICAgdGFyZ2V0ID0gdGFyZ2V0LnN1YnN0cmluZyAwLCB0YXJnZXQubGVuZ3RoLTFcbiAgICAgICAgICB0YXJnZXRfdG9rZW5zID0gdGFyZ2V0LnNwbGl0ICc6dGV4dDonXG4gICAgICAgICAgdGFyZ2V0ID0gdGFyZ2V0X3Rva2Vuc1swXVxuICAgICAgICAgIGNvbnRlbnQgPSB0YXJnZXRfdG9rZW5zWzFdXG4gICAgICAgICAgcmV0dXJuIGNvbnRlbnRcblxuICAgICAgZm9yIGVudHJ5IGluIEBjdXN0b21WYXJpYWJsZXNcbiAgICAgICAgaWYgcHJvbXB0LmluZGV4T2YoJyUoJytlbnRyeS5uYW1lKycpJykgPiAtMVxuICAgICAgICAgIHJlcGwgPSBlbnRyeS52YXJpYWJsZShjb25zb2xlSW5zdGFuY2UpXG4gICAgICAgICAgaWYgcmVwbD9cbiAgICAgICAgICAgIHByb21wdCA9IGNvbnNvbGVJbnN0YW5jZS51dGlsLnJlcGxhY2VBbGwgJyUoJytlbnRyeS5uYW1lKycpJywgcmVwbCwgcHJvbXB0XG5cbiAgICAgIHByZXNlcnZlZFBhdGhzU3RyaW5nID0gY29uc29sZUluc3RhbmNlLnByZXNlcnZlT3JpZ2luYWxQYXRocyBwcm9tcHRcbiAgICAgIHRleHQgPSBAcmVtb3ZlQW5ub3RhdGlvbiggY29uc29sZUluc3RhbmNlLCBwcmVzZXJ2ZWRQYXRoc1N0cmluZyApXG4gICAgZWxzZVxuICAgICAgdGV4dCA9IHByb21wdFxuICAgICAgI3RleHQgPSBjb25zb2xlSW5zdGFuY2UudXRpbC5yZXBsYWNlQWxsICclKHJhdyknLCAnJywgcHJvbXB0XG5cbiAgICBvID0ge1xuICAgICAgZW5jbG9zZWRWYXJJbnN0YW5jZTogbnVsbFxuICAgICAgdGV4dDogdGV4dFxuICAgICAgaXNEeW5hbWljRXhwcmVzc2lvbjogaXNEeW5hbWljRXhwcmVzc2lvblxuICAgICAgZHluYW1pY0V4cHJlc3Npb25VcGRhdGVEZWxheTogZHluYW1pY0V4cHJlc3Npb25VcGRhdGVEZWxheVxuICAgICAgb3JpZzogb3JpZ1xuICAgICAgdGV4dE1vZGlmaWVyczogW11cbiAgICAgIG1vZGlmOiAobW9kaWZpZXIpIC0+XG4gICAgICAgIEB0ZXh0TW9kaWZpZXJzLnB1c2ggbW9kaWZpZXJcbiAgICAgICAgcmV0dXJuIHRoaXNcbiAgICAgIHJ1blRleHRNb2RpZmllcnM6IChpbnB1dCkgLT5cbiAgICAgICAgZm9yIGkgaW4gWzAuLkB0ZXh0TW9kaWZpZXJzLmxlbmd0aC0xXSBieSAxXG4gICAgICAgICAgaW5wdXQgPSBAdGV4dE1vZGlmaWVyc1tpXShpbnB1dCkgb3IgaW5wdXRcbiAgICAgICAgcmV0dXJuIGlucHV0XG4gICAgICBnZXRUZXh0OiAoKSAtPlxuICAgICAgICByZXR1cm4gQHJ1blRleHRNb2RpZmllcnMoQHRleHQpXG4gICAgICBnZXRIdG1sOiAoKSAtPlxuICAgICAgICBodG1sT2JqID0gJCgnPHNwYW4+JytAcnVuVGV4dE1vZGlmaWVycyhAdGV4dCkrJzwvc3Bhbj4nKVxuICAgICAgICB0YXNrUnVubmluZyA9IGZhbHNlXG4gICAgICAgIGlmIG5vdCB3aW5kb3cudGFza1dvcmtpbmdUaHJlYWRzTnVtYmVyP1xuICAgICAgICAgIHdpbmRvdy50YXNrV29ya2luZ1RocmVhZHNOdW1iZXIgPSAwXG5cbiAgICAgICAgcmVmcmVzaCA9ICgpID0+XG4gICAgICAgICAgdCA9IEBlbmNsb3NlZFZhckluc3RhbmNlLnBhcnNlSHRtbChjb25zb2xlSW5zdGFuY2UsIEBvcmlnLCB2YWx1ZXMsIGZhbHNlKVxuICAgICAgICAgIGh0bWxPYmouaHRtbCgnJylcbiAgICAgICAgICBodG1sT2JqLmFwcGVuZCh0KVxuICAgICAgICByZWZyZXNoVGFzayA9ICgpID0+XG4gICAgICAgICAgaWYgQGR5bmFtaWNFeHByZXNzaW9uVXBkYXRlRGVsYXk8PTAgb3Igbm90IHRhc2tSdW5uaW5nXG4gICAgICAgICAgICAtLXdpbmRvdy50YXNrV29ya2luZ1RocmVhZHNOdW1iZXJcbiAgICAgICAgICAgICNjb25zb2xlLmxvZyAnQWN0aXZlIHRocmVhZHM6ICcrd2luZG93LnRhc2tXb3JraW5nVGhyZWFkc051bWJlclxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgc2V0VGltZW91dCAoKSA9PlxuICAgICAgICAgICAgcmVmcmVzaCgpXG4gICAgICAgICAgICByZWZyZXNoVGFzaygpXG4gICAgICAgICAgLEBkeW5hbWljRXhwcmVzc2lvblVwZGF0ZURlbGF5XG4gICAgICAgIGlmIHN0YXJ0UmVmcmVzaFRhc2sgYW5kIEBpc0R5bmFtaWNFeHByZXNzaW9uXG4gICAgICAgICAgdGFza1J1bm5pbmcgPSB0cnVlXG4gICAgICAgICAgaHRtbE9iai5iaW5kICdkZXN0cm95ZWQnLCAoKSAtPlxuICAgICAgICAgICAgdGFza1J1bm5pbmcgPSBmYWxzZVxuICAgICAgICAgICsrd2luZG93LnRhc2tXb3JraW5nVGhyZWFkc051bWJlclxuICAgICAgICAgICNjb25zb2xlLmxvZyAnQWN0aXZlIHRocmVhZHM6ICcrd2luZG93LnRhc2tXb3JraW5nVGhyZWFkc051bWJlclxuICAgICAgICAgIHJlZnJlc2hUYXNrKClcbiAgICAgICAgcmV0dXJuIGh0bWxPYmpcbiAgICB9XG4gICAgbSA9IChpKSAtPlxuICAgICAgaSA9IGNvbnNvbGVJbnN0YW5jZS51dGlsLnJlcGxhY2VBbGwgJyUoZmlsZS1vcmlnaW5hbCknLCBjb25zb2xlSW5zdGFuY2UuZ2V0Q3VycmVudEZpbGVQYXRoKCksIGlcbiAgICAgIGkgPSBjb25zb2xlSW5zdGFuY2UudXRpbC5yZXBsYWNlQWxsICclKGN3ZC1vcmlnaW5hbCknLCBjb25zb2xlSW5zdGFuY2UuZ2V0Q3dkKCksIGlcbiAgICAgIGkgPSBjb25zb2xlSW5zdGFuY2UudXRpbC5yZXBsYWNlQWxsICcmZnM7JywgJy8nLCBpXG4gICAgICBpID0gY29uc29sZUluc3RhbmNlLnV0aWwucmVwbGFjZUFsbCAnJmJzOycsICdcXFxcJywgaVxuICAgICAgcmV0dXJuIGlcbiAgICBvLm1vZGlmIG1cbiAgICBvLmVuY2xvc2VkVmFySW5zdGFuY2UgPSB0aGlzXG4gICAgcmV0dXJuIG9cblxubW9kdWxlLmV4cG9ydHMgPVxuICBuZXcgQnVpbHRpblZhcmlhYmxlcygpXG4iXX0=
