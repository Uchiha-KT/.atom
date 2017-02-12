
/*
  Atom-terminal-panel
  Copyright by isis97
  MIT licensed

  The main terminal view class, which does the most of all the work.
 */

(function() {
  var $, ATPCommandFinderView, ATPCommandsBuiltins, ATPCore, ATPOutputView, ATPVariablesBuiltins, TextEditorView, View, ansihtml, dirname, exec, execSync, extname, fs, iconv, lastOpenedView, os, ref, ref1, ref2, resolve, sep, spawn, stream,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    slice = [].slice;

  lastOpenedView = null;

  fs = include('fs');

  os = include('os');

  ref = include('atom-space-pen-views'), $ = ref.$, TextEditorView = ref.TextEditorView, View = ref.View;

  ref1 = include('child_process'), spawn = ref1.spawn, exec = ref1.exec, execSync = ref1.execSync;

  ref2 = include('path'), resolve = ref2.resolve, dirname = ref2.dirname, extname = ref2.extname, sep = ref2.sep;

  ansihtml = include('ansi-html-stream');

  stream = include('stream');

  iconv = include('iconv-lite');

  ATPCommandFinderView = include('atp-command-finder');

  ATPCore = include('atp-core');

  ATPCommandsBuiltins = include('atp-builtins-commands');

  ATPVariablesBuiltins = include('atp-builtins-variables');

  window.$ = window.jQuery = $;

  include('jquery-autocomplete-js');

  module.exports = ATPOutputView = (function(superClass) {
    extend(ATPOutputView, superClass);

    function ATPOutputView() {
      this.spawn = bind(this.spawn, this);
      this.flashIconClass = bind(this.flashIconClass, this);
      this.parseSpecialStringTemplate = bind(this.parseSpecialStringTemplate, this);
      return ATPOutputView.__super__.constructor.apply(this, arguments);
    }

    ATPOutputView.prototype.cwd = null;

    ATPOutputView.prototype.streamsEncoding = 'iso-8859-3';

    ATPOutputView.prototype._cmdintdel = 50;

    ATPOutputView.prototype.echoOn = true;

    ATPOutputView.prototype.redirectOutput = '';

    ATPOutputView.prototype.specsMode = false;

    ATPOutputView.prototype.inputLine = 0;

    ATPOutputView.prototype.helloMessageShown = false;

    ATPOutputView.prototype.minHeight = 250;

    ATPOutputView.prototype.util = include('atp-terminal-util');

    ATPOutputView.prototype.currentInputBox = null;

    ATPOutputView.prototype.currentInputBox = null;

    ATPOutputView.prototype.currentInputBoxTmr = null;

    ATPOutputView.prototype.volatileSuggestions = [];

    ATPOutputView.prototype.disposables = {
      dispose: function(field) {
        var a, i, j, ref3, results;
        if (ATPOutputView[field] == null) {
          ATPOutputView[field] = [];
        }
        a = ATPOutputView[field];
        results = [];
        for (i = j = 0, ref3 = a.length - 1; j <= ref3; i = j += 1) {
          results.push(a[i].dispose());
        }
        return results;
      },
      add: function(field, value) {
        if (ATPOutputView[field] == null) {
          ATPOutputView[field] = [];
        }
        return ATPOutputView[field].push(value);
      }
    };

    ATPOutputView.prototype.keyCodes = {
      enter: 13,
      arrowUp: 38,
      arrowDown: 40,
      arrowLeft: 37,
      arrowRight: 39
    };

    ATPOutputView.prototype.localCommandAtomBindings = [];

    ATPOutputView.prototype.localCommands = ATPCommandsBuiltins;

    ATPOutputView.content = function() {
      return this.div({
        tabIndex: -1,
        "class": 'panel atp-panel panel-bottom',
        outlet: 'atpView'
      }, (function(_this) {
        return function() {
          _this.div({
            "class": 'terminal panel-divider',
            style: 'cursor:n-resize;width:100%;height:8px;',
            outlet: 'panelDivider'
          });
          _this.button({
            outlet: 'maximizeIconBtn',
            "class": 'atp-maximize-btn',
            click: 'maximize'
          });
          _this.button({
            outlet: 'closeIconBtn',
            "class": 'atp-close-btn',
            click: 'close'
          });
          _this.button({
            outlet: 'destroyIconBtn',
            "class": 'atp-destroy-btn',
            click: 'destroy'
          });
          _this.div({
            "class": 'panel-heading btn-toolbar',
            outlet: 'consoleToolbarHeading'
          }, function() {
            _this.div({
              "class": 'btn-group',
              outlet: 'consoleToolbar'
            }, function() {
              _this.button({
                outlet: 'killBtn',
                click: 'kill',
                "class": 'btn hide'
              }, function() {
                return _this.span('kill');
              });
              _this.button({
                outlet: 'exitBtn',
                click: 'destroy',
                "class": 'btn'
              }, function() {
                return _this.span('exit');
              });
              return _this.button({
                outlet: 'closeBtn',
                click: 'close',
                "class": 'btn'
              }, function() {
                _this.span({
                  "class": "icon icon-x"
                });
                return _this.span('close');
              });
            });
            _this.button({
              outlet: 'openConfigBtn',
              "class": 'btn icon icon-gear inline-block-tight button-settings',
              click: 'showSettings'
            }, function() {
              return _this.span('Open config');
            });
            return _this.button({
              outlet: 'reloadConfigBtn',
              "class": 'btn icon icon-gear inline-block-tight button-settings',
              click: 'reloadSettings'
            }, function() {
              return _this.span('Reload config');
            });
          });
          return _this.div({
            "class": 'atp-panel-body'
          }, function() {
            return _this.pre({
              "class": "terminal",
              outlet: "cliOutput"
            });
          });
        };
      })(this));
    };

    ATPOutputView.prototype.toggleAutoCompletion = function() {
      if (this.currentInputBoxCmp != null) {
        this.currentInputBoxCmp.enable();
        this.currentInputBoxCmp.repaint();
        this.currentInputBoxCmp.showDropDown();
        return this.currentInputBox.find('.terminal-input').height('100px');
      }
    };

    ATPOutputView.prototype.fsSpy = function() {
      this.volatileSuggestions = [];
      if (this.cwd != null) {
        return fs.readdir(this.cwd, (function(_this) {
          return function(err, files) {
            var file, j, len, results;
            if (files != null) {
              results = [];
              for (j = 0, len = files.length; j < len; j++) {
                file = files[j];
                results.push(_this.volatileSuggestions.push(file));
              }
              return results;
            }
          };
        })(this));
      }
    };

    ATPOutputView.prototype.turnSpecsMode = function(state) {
      return this.specsMode = state;
    };

    ATPOutputView.prototype.getRawOutput = function() {
      var t;
      t = this.getHtmlOutput().replace(/<[^>]*>/igm, "");
      t = this.util.replaceAll("&gt;", ">", t);
      t = this.util.replaceAll("&lt;", "<", t);
      t = this.util.replaceAll("&quot;", "\"", t);
      return t;
    };

    ATPOutputView.prototype.getHtmlOutput = function() {
      return this.cliOutput.html();
    };

    ATPOutputView.prototype.resolvePath = function(path) {
      var filepath;
      path = this.util.replaceAll('\"', '', path);
      filepath = '';
      if (path.match(/([A-Za-z]):/ig) !== null) {
        filepath = path;
      } else {
        filepath = this.getCwd() + '/' + path;
      }
      filepath = this.util.replaceAll('\\', '/', filepath);
      return this.util.replaceAll('\\', '/', resolve(filepath));
    };

    ATPOutputView.prototype.reloadSettings = function() {
      return this.onCommand('update');
    };

    ATPOutputView.prototype.showSettings = function() {
      ATPCore.reload();
      return setTimeout((function(_this) {
        return function() {
          var atomPath, configPath, panelPath;
          panelPath = atom.packages.resolvePackagePath('atom-terminal-panel');
          atomPath = resolve(panelPath + '/../..');
          configPath = atomPath + '/terminal-commands.json';
          return atom.workspace.open(configPath);
        };
      })(this), 50);
    };

    ATPOutputView.prototype.focusInputBox = function() {
      if (this.currentInputBoxCmp != null) {
        return this.currentInputBoxCmp.input.focus();
      }
    };

    ATPOutputView.prototype.updateInputCursor = function(textarea) {
      var val;
      this.rawMessage('test\n');
      val = textarea.val();
      return textarea.blur().focus().val("").val(val);
    };

    ATPOutputView.prototype.removeInputBox = function() {
      return this.cliOutput.find('.atp-dynamic-input-box').remove();
    };

    ATPOutputView.prototype.putInputBox = function() {
      var endsWith, history, inputComp, prompt;
      if (this.currentInputBoxTmr != null) {
        clearInterval(this.currentInputBoxTmr);
        this.currentInputBoxTmr = null;
      }
      this.cliOutput.find('.atp-dynamic-input-box').remove();
      prompt = this.getCommandPrompt('');
      this.currentInputBox = $('<div style="width: 100%; white-space:nowrap; overflow:hidden; display:inline-block;" class="atp-dynamic-input-box">' + '<div style="position:relative; top:5px; max-height:500px; width: 100%; bottom: -10px; height: 20px; white-space:nowrap; overflow:hidden; display:inline-block;" class="terminal-input native-key-bindings"></div>' + '</div>');
      this.currentInputBox.prepend('&nbsp;&nbsp;');
      this.currentInputBox.prepend(prompt);
      history = [];
      if (this.currentInputBoxCmp != null) {
        history = this.currentInputBoxCmp.getInputHistory();
      }
      inputComp = this.currentInputBox.find('.terminal-input');
      this.currentInputBoxCmp = inputComp.autocomplete({
        animation: [['opacity', 0, 0.8]],
        isDisabled: true,
        inputHistory: history,
        inputWidth: '80%',
        dropDownWidth: '30%',
        dropDownDescriptionBoxWidth: '30%',
        dropDownPosition: 'top',
        showDropDown: atom.config.get('atom-terminal-panel.enableConsoleSuggestionsDropdown')
      });
      this.currentInputBoxCmp.confirmed((function(_this) {
        return function() {
          _this.currentInputBoxCmp.disable().repaint();
          return _this.onCommand();
        };
      })(this)).changed((function(_this) {
        return function(inst, text) {
          if (inst.getText().length <= 0) {
            _this.currentInputBoxCmp.disable().repaint();
            return _this.currentInputBox.find('.terminal-input').height('20px');
          }
        };
      })(this));
      this.currentInputBoxCmp.input.keydown((function(_this) {
        return function(e) {
          if ((e.keyCode === 17) && (_this.currentInputBoxCmp.getText().length > 0)) {

            /*
            @currentInputBoxCmp.enable().repaint()
            @currentInputBoxCmp.showDropDown()
            @currentInputBox.find('.terminal-input').height('100px');
             */
          } else if ((e.keyCode === 32) || (e.keyCode === 8)) {
            _this.currentInputBoxCmp.disable().repaint();
            return _this.currentInputBox.find('.terminal-input').height('20px');
          }
        };
      })(this));
      endsWith = function(text, suffix) {
        return text.indexOf(suffix, text.length - suffix.length) !== -1;
      };
      this.currentInputBoxCmp.options = (function(_this) {
        return function(instance, text, lastToken) {
          var e, fsStat, i, j, o, ref3, ret, token;
          token = lastToken;
          if (token == null) {
            token = '';
          }
          if (!(endsWith(token, '/') || endsWith(token, '\\'))) {
            token = _this.util.replaceAll('\\', sep, token);
            token = token.split(sep);
            token.pop();
            token = token.join(sep);
            if (!endsWith(token, sep)) {
              token = token + sep;
            }
          }
          o = _this.getCommandsNames().concat(_this.volatileSuggestions);
          fsStat = [];
          if (token != null) {
            try {
              fsStat = fs.readdirSync(token);
              for (i = j = 0, ref3 = fsStat.length - 1; j <= ref3; i = j += 1) {
                fsStat[i] = token + fsStat[i];
              }
            } catch (error) {
              e = error;
            }
          }
          ret = o.concat(fsStat);
          return ret;
        };
      })(this);
      this.currentInputBoxCmp.hideDropDown();
      setTimeout((function(_this) {
        return function() {
          return _this.currentInputBoxCmp.input.focus();
        };
      })(this), 0);
      this.currentInputBox.appendTo(this.cliOutput);
      return this.focusInputBox();
    };

    ATPOutputView.prototype.readInputBox = function() {
      var ret;
      ret = '';
      if (this.currentInputBoxCmp != null) {
        ret = this.currentInputBoxCmp.getText();
      }
      return ret;
    };

    ATPOutputView.prototype.requireCSS = function(location) {
      if (location == null) {
        return;
      }
      location = resolve(location);
      if (atom.config.get('atom-terminal-panel.logConsole') || this.specsMode) {
        console.log("Require atom-terminal-panel plugin CSS file: " + location + "\n");
      }
      return $('head').append("<link rel='stylesheet' type='text/css' href='" + location + "'/>");
    };

    ATPOutputView.prototype.resolvePluginDependencies = function(path, plugin) {
      var config, css_dependencies, css_dependency, j, len;
      config = plugin.dependencies;
      if (config == null) {
        return;
      }
      css_dependencies = config.css;
      if (css_dependencies == null) {
        css_dependencies = [];
      }
      for (j = 0, len = css_dependencies.length; j < len; j++) {
        css_dependency = css_dependencies[j];
        this.requireCSS(path + "/" + css_dependency);
      }
      return delete plugin['dependencies'];
    };

    ATPOutputView.prototype.init = function() {

      /*
      TODO: test-autocomplete Remove this!
      el = $('<div style="z-index: 9999; position: absolute; left: 200px; top: 200px;" id="glotest"></div>')
      el.autocomplete({
        inputWidth: '80%'
      })
      $('body').append(el)
       */
      var action, actions, atomCommands, bt, caller, com, comName, command, eleqr, j, k, l, lastY, len, len1, len2, mouseDown, normalizedPath, obj, panelDraggingActive, ref3, toolbar;
      lastY = -1;
      mouseDown = false;
      panelDraggingActive = false;
      this.panelDivider.mousedown((function(_this) {
        return function() {
          return panelDraggingActive = true;
        };
      })(this)).mouseup((function(_this) {
        return function() {
          return panelDraggingActive = false;
        };
      })(this));
      $(document).mousedown((function(_this) {
        return function() {
          return mouseDown = true;
        };
      })(this)).mouseup((function(_this) {
        return function() {
          return mouseDown = false;
        };
      })(this)).mousemove((function(_this) {
        return function(e) {
          var delta;
          if (mouseDown && panelDraggingActive) {
            if (lastY !== -1) {
              delta = e.pageY - lastY;
              _this.cliOutput.height(_this.cliOutput.height() - delta);
            }
            return lastY = e.pageY;
          } else {
            return lastY = -1;
          }
        };
      })(this));
      normalizedPath = require("path").join(__dirname, "../commands");
      if (atom.config.get('atom-terminal-panel.logConsole') || this.specsMode) {
        console.log("Loading atom-terminal-panel plugins from the directory: " + normalizedPath + "\n");
      }
      fs.readdirSync(normalizedPath).forEach((function(_this) {
        return function(folder) {
          var fullpath, key, obj, results, value;
          fullpath = resolve("../commands/" + folder);
          if (atom.config.get('atom-terminal-panel.logConsole') || _this.specsMode) {
            console.log("Require atom-terminal-panel plugin: " + folder + "\n");
          }
          obj = require("../commands/" + folder + "/index.coffee");
          if (atom.config.get('atom-terminal-panel.logConsole')) {
            console.log("Plugin loaded.");
          }
          _this.resolvePluginDependencies(fullpath, obj);
          results = [];
          for (key in obj) {
            value = obj[key];
            if (value.command != null) {
              _this.localCommands[key] = value;
              _this.localCommands[key].source = 'external-functional';
              results.push(_this.localCommands[key].sourcefile = folder);
            } else if (value.variable != null) {
              value.name = key;
              results.push(ATPVariablesBuiltins.putVariable(value));
            } else {
              results.push(void 0);
            }
          }
          return results;
        };
      })(this));
      if (atom.config.get('atom-terminal-panel.logConsole')) {
        console.log("All plugins were loaded.");
      }
      if (ATPCore.getConfig() != null) {
        actions = ATPCore.getConfig().actions;
        if (actions != null) {
          for (j = 0, len = actions.length; j < len; j++) {
            action = actions[j];
            if (action.length > 1) {
              obj = {};
              obj['atom-terminal-panel:' + action[0]] = (function(_this) {
                return function() {
                  _this.open();
                  return _this.onCommand(action[1]);
                };
              })(this);
              atom.commands.add('atom-workspace', obj);
            }
          }
        }
      }
      if (atom.workspace != null) {
        eleqr = (ref3 = atom.workspace.getActivePaneItem()) != null ? ref3 : atom.workspace;
        eleqr = atom.views.getView(eleqr);
        atomCommands = atom.commands.findCommands({
          target: eleqr
        });
        for (k = 0, len1 = atomCommands.length; k < len1; k++) {
          command = atomCommands[k];
          comName = command.name;
          com = {};
          com.description = command.displayName;
          com.command = (function(comNameP) {
            return function(state, args) {
              var ele, ref4;
              ele = (ref4 = atom.workspace.getActivePaneItem()) != null ? ref4 : atom.workspace;
              ele = atom.views.getView(ele);
              atom.commands.dispatch(ele, comNameP);
              return (state.consoleLabel('info', "info")) + (state.consoleText('info', 'Atom command executed: ' + comNameP));
            };
          })(comName);
          com.source = "internal-atom";
          this.localCommands[comName] = com;
        }
      }
      toolbar = ATPCore.getConfig().toolbar;
      if (toolbar != null) {
        toolbar.reverse();
        for (l = 0, len2 = toolbar.length; l < len2; l++) {
          com = toolbar[l];
          bt = $("<div class=\"btn\" data-action=\"" + com[1] + "\" ><span>" + com[0] + "</span></div>");
          if (com[2] != null) {
            atom.tooltips.add(bt, {
              title: com[2]
            });
          }
          this.consoleToolbar.prepend(bt);
          caller = this;
          bt.click(function() {
            return caller.onCommand($(this).data('action'));
          });
        }
      }
      return this;
    };

    ATPOutputView.prototype.commandLineNotCounted = function() {
      return this.inputLine--;
    };

    ATPOutputView.prototype.parseSpecialStringTemplate = function(prompt, values, isDOM) {
      if (isDOM == null) {
        isDOM = false;
      }
      if (isDOM) {
        return ATPVariablesBuiltins.parseHtml(this, prompt, values);
      } else {
        return ATPVariablesBuiltins.parse(this, prompt, values);
      }
    };

    ATPOutputView.prototype.getCommandPrompt = function(cmd) {
      return this.parseTemplate(atom.config.get('atom-terminal-panel.commandPrompt'), {
        cmd: cmd
      }, true);
    };

    ATPOutputView.prototype.delay = function(callback, delay) {
      if (delay == null) {
        delay = 100;
      }
      return setTimeout(callback, delay);
    };

    ATPOutputView.prototype.execDelayedCommand = function(delay, cmd, args, state) {
      var callback, caller;
      caller = this;
      callback = function() {
        return caller.exec(cmd, args, state);
      };
      return setTimeout(callback, delay);
    };

    ATPOutputView.prototype.moveToCurrentDirectory = function() {
      var CURRENT_LOCATION;
      CURRENT_LOCATION = this.getCurrentFileLocation();
      if (CURRENT_LOCATION != null) {
        return this.cd([CURRENT_LOCATION]);
      }
    };

    ATPOutputView.prototype.getCurrentFileName = function() {
      var current_file, matcher;
      current_file = this.getCurrentFilePath();
      if (current_file !== null) {
        matcher = /(.*:)((.*)\\)*/ig;
        return current_file.replace(matcher, "");
      }
      return null;
    };

    ATPOutputView.prototype.getCurrentFileLocation = function() {
      if (this.getCurrentFilePath() === null) {
        return null;
      }
      return this.util.replaceAll(this.getCurrentFileName(), "", this.getCurrentFilePath());
    };

    ATPOutputView.prototype.getCurrentFilePath = function() {
      var te;
      if (atom.workspace == null) {
        return null;
      }
      te = atom.workspace.getActiveTextEditor();
      if (te != null) {
        if (te.getPath() != null) {
          return te.getPath();
        }
      }
      return null;
    };

    ATPOutputView.prototype.parseTemplate = function(text, vars, isDOM) {
      var ret;
      if (isDOM == null) {
        isDOM = false;
      }
      if (vars == null) {
        vars = {};
      }
      ret = '';
      if (isDOM) {
        ret = ATPVariablesBuiltins.parseHtml(this, text, vars);
      } else {
        ret = this.parseSpecialStringTemplate(text, vars);
        ret = this.util.replaceAll('%(file-original)', this.getCurrentFilePath(), ret);
        ret = this.util.replaceAll('%(cwd-original)', this.getCwd(), ret);
        ret = this.util.replaceAll('&fs;', '/', ret);
        ret = this.util.replaceAll('&bs;', '\\', ret);
      }
      return ret;
    };

    ATPOutputView.prototype.parseExecToken__ = function(cmd, args, strArgs) {
      var argsNum, i, j, ref3, v;
      if (strArgs != null) {
        cmd = this.util.replaceAll("%(*)", strArgs, cmd);
      }
      cmd = this.util.replaceAll("%(*^)", this.util.replaceAll("%(*^)", "", cmd), cmd);
      if (args != null) {
        argsNum = args.length;
        for (i = j = 0, ref3 = argsNum; j <= ref3; i = j += 1) {
          if (args[i] != null) {
            v = args[i].replace(/\n/ig, '');
            cmd = this.util.replaceAll("%(" + i + ")", args[i], cmd);
          }
        }
      }
      cmd = this.parseTemplate(cmd, {
        file: this.getCurrentFilePath()
      });
      return cmd;
    };

    ATPOutputView.prototype.execStackCounter = 0;

    ATPOutputView.prototype.exec = function(cmdStr, ref_args, state, callback) {
      var cmdStrC;
      if (state == null) {
        state = this;
      }
      if (ref_args == null) {
        ref_args = {};
      }
      if (cmdStr.split != null) {
        cmdStrC = cmdStr.split(';;');
        if (cmdStrC.length > 1) {
          cmdStr = cmdStrC;
        }
      }
      this.execStackCounter = 0;
      return this.exec_(cmdStr, ref_args, state, callback);
    };

    ATPOutputView.prototype.exec_ = function(cmdStr, ref_args, state, callback) {
      var args, cmd, com, command, e, j, len, ref_args_str, ret, val;
      if (callback == null) {
        callback = function() {
          return null;
        };
      }
      ++this.execStackCounter;
      if (cmdStr instanceof Array) {
        ret = '';
        for (j = 0, len = cmdStr.length; j < len; j++) {
          com = cmdStr[j];
          val = this.exec(com, ref_args, state);
          if (val != null) {
            ret += val;
          }
        }
        --this.execStackCounter;
        if (this.execStackCounter === 0) {
          callback();
        }
        if (ret == null) {
          return null;
        }
        return ret;
      } else {
        cmdStr = this.util.replaceAll("\\\"", '&hquot;', cmdStr);
        cmdStr = this.util.replaceAll("&bs;\"", '&hquot;', cmdStr);
        cmdStr = this.util.replaceAll("\\\'", '&lquot;', cmdStr);
        cmdStr = this.util.replaceAll("&bs;\'", '&lquot;', cmdStr);
        ref_args_str = null;
        if (ref_args != null) {
          if (ref_args.join != null) {
            ref_args_str = ref_args.join(' ');
          }
        }
        cmdStr = this.parseExecToken__(cmdStr, ref_args, ref_args_str);
        args = [];
        cmd = cmdStr;
        cmd.replace(/("[^"]*"|'[^']*'|[^\s'"]+)/g, (function(_this) {
          return function(s) {
            if (s[0] !== '"' && s[0] !== "'") {
              s = s.replace(/~/g, _this.userHome);
            }
            s = _this.util.replaceAll('&hquot;', '"', s);
            s = _this.util.replaceAll('&lquot;', '\'', s);
            return args.push(s);
          };
        })(this));
        args = this.util.dir(args, this.getCwd());
        cmd = args.shift();
        command = null;
        if (this.isCommandEnabled(cmd)) {
          command = ATPCore.findUserCommand(cmd);
        }
        if (command != null) {
          if (state == null) {
            ret = null;
            throw 'The console functional (not native) command cannot be executed without caller information: \'' + cmd + '\'.';
          }
          if (command != null) {
            try {
              ret = command(state, args);
            } catch (error) {
              e = error;
              throw new Error("Error at executing terminal command: '" + cmd + "' ('" + cmdStr + "'): " + e.message);
            }
          }
          --this.execStackCounter;
          if (this.execStackCounter === 0) {
            callback();
          }
          if (ret == null) {
            return null;
          }
          return ret;
        } else {
          if (atom.config.get('atom-terminal-panel.enableExtendedCommands') || this.specsMode) {
            if (this.isCommandEnabled(cmd)) {
              command = this.getLocalCommand(cmd);
            }
          }
          if (command != null) {
            ret = command(state, args);
            --this.execStackCounter;
            if (this.execStackCounter === 0) {
              callback();
            }
            if (ret == null) {
              return null;
            }
            return ret;
          } else {
            cmdStr = this.util.replaceAll('&hquot;', '"', cmdStr);
            cmd = this.util.replaceAll('&hquot;', '"', cmd);
            cmdStr = this.util.replaceAll('&lquot;', '\'', cmdStr);
            cmd = this.util.replaceAll('&lquot;', '\'', cmd);
            this.spawn(cmdStr, cmd, args);
            --this.execStackCounter;
            if (this.execStackCounter === 0) {
              callback();
            }
            if (cmd == null) {
              return null;
            }
            return null;
          }
        }
      }
    };

    ATPOutputView.prototype.isCommandEnabled = function(name) {
      var disabledCommands;
      disabledCommands = atom.config.get('atom-terminal-panel.disabledExtendedCommands') || this.specsMode;
      if (disabledCommands == null) {
        return true;
      }
      if (indexOf.call(disabledCommands, name) >= 0) {
        return false;
      }
      return true;
    };

    ATPOutputView.prototype.getLocalCommand = function(name) {
      var cmd_body, cmd_name, ref3;
      ref3 = this.localCommands;
      for (cmd_name in ref3) {
        cmd_body = ref3[cmd_name];
        if (cmd_name === name) {
          if (cmd_body.command != null) {
            return cmd_body.command;
          } else {
            return cmd_body;
          }
        }
      }
      return null;
    };

    ATPOutputView.prototype.getCommandsRegistry = function() {
      var cmd, cmd_, cmd_body, cmd_forbd, cmd_item, cmd_len, cmd_name, descr, global_vars, j, key, len, ref3, ref4, ref5, ref6, value, var_name;
      global_vars = ATPVariablesBuiltins.list;
      ref3 = process.env;
      for (key in ref3) {
        value = ref3[key];
        global_vars['%(env.' + key + ')'] = "access native environment variable: " + key;
      }
      cmd = [];
      ref4 = this.localCommands;
      for (cmd_name in ref4) {
        cmd_body = ref4[cmd_name];
        cmd.push({
          name: cmd_name,
          description: cmd_body.description,
          example: cmd_body.example,
          params: cmd_body.params,
          deprecated: cmd_body.deprecated,
          sourcefile: cmd_body.sourcefile,
          source: cmd_body.source || 'internal'
        });
      }
      ref5 = ATPCore.getUserCommands();
      for (cmd_name in ref5) {
        cmd_body = ref5[cmd_name];
        cmd.push({
          name: cmd_name,
          description: cmd_body.description,
          example: cmd_body.example,
          params: cmd_body.params,
          deprecated: cmd_body.deprecated,
          sourcefile: cmd_body.sourcefile,
          source: 'external'
        });
      }
      for (var_name in global_vars) {
        descr = global_vars[var_name];
        cmd.push({
          name: var_name,
          description: descr,
          source: 'global-variable'
        });
      }
      cmd_ = [];
      cmd_len = cmd.length;
      cmd_forbd = (atom.config.get('atom-terminal-panel.disabledExtendedCommands')) || [];
      for (j = 0, len = cmd.length; j < len; j++) {
        cmd_item = cmd[j];
        if (ref6 = cmd_item.name, indexOf.call(cmd_forbd, ref6) >= 0) {

        } else {
          cmd_.push(cmd_item);
        }
      }
      return cmd_;
    };

    ATPOutputView.prototype.getCommandsNames = function() {
      var cmd_names, cmds, deprecated, descr, descr_prefix, example, icon_style, item, j, len, name, params, sourcefile;
      cmds = this.getCommandsRegistry();
      cmd_names = [];
      for (j = 0, len = cmds.length; j < len; j++) {
        item = cmds[j];
        descr = "";
        example = "";
        params = "";
        sourcefile = "";
        deprecated = false;
        name = item.name;
        if (item.sourcefile != null) {
          sourcefile = "<div style='float:bottom'><b style='float:right'>Plugin " + item.sourcefile + "&nbsp;&nbsp;&nbsp;<b></div>";
        }
        if (item.example != null) {
          example = "<br><b><u>Example:</u></b><br><code>" + item.example + "</code>";
        }
        if (item.params != null) {
          params = item.params;
        }
        if (item.deprecated) {
          deprecated = true;
        }
        icon_style = '';
        descr_prefix = '';
        if (item.source === 'external') {
          icon_style = 'book';
          descr_prefix = 'External: ';
        } else if (item.source === 'internal') {
          icon_style = 'repo';
          descr_prefix = 'Builtin: ';
        } else if (item.source === 'internal-atom') {
          icon_style = 'repo';
          descr_prefix = 'Atom command: ';
        } else if (item.source === 'external-functional') {
          icon_style = 'plus';
          descr_prefix = 'Functional: ';
        } else if (item.source === 'global-variable') {
          icon_style = 'briefcase';
          descr_prefix = 'Global variable: ';
        }
        if (deprecated) {
          name = "<strike style='color:gray;font-weight:normal;'>" + name + "</strike>";
        }
        descr = "<div style='float:left; padding-top:10px;' class='status status-" + icon_style + " icon icon-" + icon_style + "'></div><div style='padding-left: 10px;'><b>" + name + " " + params + "</b><br>" + item.description + " " + example + " " + sourcefile + "</div>";
        cmd_names.push({
          name: item.name,
          description: descr,
          html: true
        });
      }
      return cmd_names;
    };

    ATPOutputView.prototype.getLocalCommandsMemdump = function() {
      var cmd, commandFinder, commandFinderPanel;
      cmd = this.getCommandsRegistry();
      commandFinder = new ATPCommandFinderView(cmd);
      commandFinderPanel = atom.workspace.addModalPanel({
        item: commandFinder
      });
      commandFinder.shown(commandFinderPanel, this);
    };

    ATPOutputView.prototype.commandProgress = function(value) {
      if (value < 0) {
        this.cliProgressBar.hide();
        return this.cliProgressBar.attr('value', '0');
      } else {
        this.cliProgressBar.show();
        return this.cliProgressBar.attr('value', value / 2);
      }
    };

    ATPOutputView.prototype.showInitMessage = function(forceShow) {
      var changelog_path, hello_message, readme_path;
      if (forceShow == null) {
        forceShow = false;
      }
      if (!forceShow) {
        if (this.helloMessageShown) {
          return;
        }
      }
      if (atom.config.get('atom-terminal-panel.enableConsoleStartupInfo' || forceShow || (!this.specsMode))) {
        changelog_path = require("path").join(__dirname, "../CHANGELOG.md");
        readme_path = require("path").join(__dirname, "../README.md");
        hello_message = this.consolePanel('ATOM Terminal', 'Please enter new commands to the box below. (ctrl-to show suggestions dropdown)<br>The console supports special anotattion like: %(path), %(file), %(link)file.something%(endlink).<br>It also supports special HTML elements like: %(tooltip:A:content:B) and so on.<br>Hope you\'ll enjoy the terminal.' + ("<br><a class='changelog-link' href='" + changelog_path + "'>See changelog</a>&nbsp;&nbsp;<a class='readme-link' href='" + readme_path + "'>and the README! :)</a>"));
        this.rawMessage(hello_message);
        $('.changelog-link').css('font-weight', '300%').click((function(_this) {
          return function() {
            return atom.workspace.open(changelog_path);
          };
        })(this));
        $('.readme-link').css('font-weight', '300%').click((function(_this) {
          return function() {
            return atom.workspace.open(readme_path);
          };
        })(this));
        this.helloMessageShown = true;
      }
      return this;
    };

    ATPOutputView.prototype.onCommand = function(inputCmd) {
      var ret;
      this.fsSpy();
      if (inputCmd == null) {
        inputCmd = this.readInputBox();
      }
      this.disposables.dispose('statusIconTooltips');
      this.disposables.add('statusIconTooltips', atom.tooltips.add(this.statusIcon, {
        title: 'Task: \"' + inputCmd + '\"',
        delay: 0,
        animation: false
      }));
      this.inputLine++;
      inputCmd = this.parseSpecialStringTemplate(inputCmd);
      if (this.echoOn) {
        console.log('echo-on');
      }
      ret = this.exec(inputCmd, null, this, (function(_this) {
        return function() {
          return setTimeout(function() {
            return _this.putInputBox();
          }, 750);
        };
      })(this));
      if (ret != null) {
        this.message(ret + '\n');
      }
      this.scrollToBottom();
      this.putInputBox();
      setTimeout((function(_this) {
        return function() {
          return _this.putInputBox();
        };
      })(this), 750);
      return null;
    };

    ATPOutputView.prototype.initialize = function() {
      var cmd;
      this.userHome = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
      cmd = 'test -e /etc/profile && source /etc/profile;test -e ~/.profile && source ~/.profile; node -pe "JSON.stringify(process.env)"';
      exec(cmd, function(code, stdout, stderr) {
        var e;
        try {
          return process.env = JSON.parse(stdout);
        } catch (error) {
          e = error;
        }
      });
      return atom.commands.add('atom-workspace', {
        "atp-status:toggle-output": (function(_this) {
          return function() {
            return _this.toggle();
          };
        })(this)
      });
    };

    ATPOutputView.prototype.clear = function() {
      this.cliOutput.empty();
      this.message('\n');
      return this.putInputBox();
    };

    ATPOutputView.prototype.adjustWindowHeight = function() {
      var maxHeight;
      maxHeight = atom.config.get('atom-terminal-panel.WindowHeight');
      this.cliOutput.css("max-height", maxHeight + "px");
      return $('.terminal-input').css("max-height", maxHeight + "px");
    };

    ATPOutputView.prototype.showCmd = function() {
      this.focusInputBox();
      return this.scrollToBottom();
    };

    ATPOutputView.prototype.scrollToBottom = function() {
      return this.cliOutput.scrollTop(10000000);
    };

    ATPOutputView.prototype.flashIconClass = function(className, time) {
      var onStatusOut;
      if (time == null) {
        time = 100;
      }
      this.statusIcon.addClass(className);
      this.timer && clearTimeout(this.timer);
      onStatusOut = (function(_this) {
        return function() {
          return _this.statusIcon.removeClass(className);
        };
      })(this);
      return this.timer = setTimeout(onStatusOut, time);
    };

    ATPOutputView.prototype.destroy = function() {
      var _destroy;
      this.statusIcon.remove();
      _destroy = (function(_this) {
        return function() {
          if (_this.hasParent()) {
            _this.close();
          }
          if (_this.statusIcon && _this.statusIcon.parentNode) {
            _this.statusIcon.parentNode.removeChild(_this.statusIcon);
          }
          return _this.statusView.removeCommandView(_this);
        };
      })(this);
      if (this.program) {
        this.program.once('exit', _destroy);
        return this.program.kill();
      } else {
        return _destroy();
      }
    };

    ATPOutputView.prototype.terminateProcessTree = function() {
      var killProcess, pid, psTree;
      pid = this.program.pid;
      psTree = require('ps-tree');
      killProcess = (function(_this) {
        return function(pid, signal, callback) {
          var ex, killTree;
          signal = signal || 'SIGKILL';
          callback = callback || function() {
            return {};
          };
          killTree = true;
          if (killTree) {
            return psTree(pid, function(err, children) {
              [pid].concat(children.map(function(p) {
                return p.PID;
              })).forEach(function(tpid) {
                var ex;
                try {
                  return process.kill(tpid, signal);
                } catch (error) {
                  ex = error;
                }
              });
              return callback();
            });
          } else {
            try {
              process.kill(pid, signal);
            } catch (error) {
              ex = error;
            }
            return callback();
          }
        };
      })(this);
      return killProcess(pid, 'SIGINT');
    };

    ATPOutputView.prototype.kill = function() {
      if (this.program) {
        this.terminateProcessTree(this.program.pid);
        this.program.stdin.pause();
        this.program.kill('SIGINT');
        this.program.kill();
        return this.message((this.consoleLabel('info', 'info')) + (this.consoleText('info', 'Process has been stopped')));
      }
    };

    ATPOutputView.prototype.maximize = function() {
      return this.cliOutput.height(this.cliOutput.height() + 9999);
    };

    ATPOutputView.prototype.open = function() {
      if ((atom.config.get('atom-terminal-panel.moveToCurrentDirOnOpen')) && (!this.specsMode)) {
        this.moveToCurrentDirectory();
      }
      if ((atom.config.get('atom-terminal-panel.moveToCurrentDirOnOpenLS')) && (!this.specsMode)) {
        this.clear();
        this.execDelayedCommand(this._cmdintdel, 'ls', null, this);
      }
      if (!this.hasParent()) {
        atom.workspace.addBottomPanel({
          item: this
        });
      }
      if (lastOpenedView && lastOpenedView !== this) {
        lastOpenedView.close();
      }
      lastOpenedView = this;
      this.scrollToBottom();
      this.statusView.setActiveCommandView(this);
      this.focusInputBox();
      this.showInitMessage();
      this.putInputBox();
      atom.tooltips.add(this.killBtn, {
        title: 'Kill the long working process.'
      });
      atom.tooltips.add(this.exitBtn, {
        title: 'Destroy the terminal session.'
      });
      atom.tooltips.add(this.closeBtn, {
        title: 'Hide the terminal window.'
      });
      atom.tooltips.add(this.openConfigBtn, {
        title: 'Open the terminal config file.'
      });
      atom.tooltips.add(this.reloadConfigBtn, {
        title: 'Reload the terminal configuration.'
      });
      if (atom.config.get('atom-terminal-panel.enableWindowAnimations')) {
        this.WindowMinHeight = this.cliOutput.height() + 50;
        this.height(0);
        this.consoleToolbarHeading.css({
          opacity: 0
        });
        return this.animate({
          height: this.WindowMinHeight
        }, 250, (function(_this) {
          return function() {
            _this.attr('style', '');
            return _this.consoleToolbarHeading.animate({
              opacity: 1
            }, 250, function() {
              return _this.consoleToolbarHeading.attr('style', '');
            });
          };
        })(this));
      }
    };

    ATPOutputView.prototype.close = function() {
      if (atom.config.get('atom-terminal-panel.enableWindowAnimations')) {
        this.WindowMinHeight = this.cliOutput.height() + 50;
        this.height(this.WindowMinHeight);
        return this.animate({
          height: 0
        }, 250, (function(_this) {
          return function() {
            _this.attr('style', '');
            _this.consoleToolbar.attr('style', '');
            _this.detach();
            return lastOpenedView = null;
          };
        })(this));
      } else {
        this.detach();
        return lastOpenedView = null;
      }
    };

    ATPOutputView.prototype.toggle = function() {
      if (this.hasParent()) {
        return this.close();
      } else {
        return this.open();
      }
    };

    ATPOutputView.prototype.removeQuotes = function(text) {
      var j, len, ret, t;
      if (text == null) {
        return '';
      }
      if (text instanceof Array) {
        ret = [];
        for (j = 0, len = text.length; j < len; j++) {
          t = text[j];
          ret.push(this.removeQuotes(t));
        }
        return ret;
      }
      return text.replace(/['"]+/g, '');
    };

    ATPOutputView.prototype.cd = function(args) {
      var dir, e, stat;
      if (!args[0]) {
        args = [atom.project.path];
      }
      args = this.removeQuotes(args);
      dir = resolve(this.getCwd(), args[0]);
      try {
        stat = fs.statSync(dir);
        if (!stat.isDirectory()) {
          return this.errorMessage("cd: not a directory: " + args[0]);
        }
        this.cwd = dir;
        this.putInputBox();
      } catch (error) {
        e = error;
        return this.errorMessage("cd: " + args[0] + ": No such file or directory");
      }
      return null;
    };

    ATPOutputView.prototype.ls = function(args) {
      var e, files, filesBlocks, ret;
      try {
        files = fs.readdirSync(this.getCwd());
      } catch (error) {
        e = error;
        return false;
      }
      if (atom.config.get('atom-terminal-panel.XExperimentEnableForceLinking')) {
        ret = '';
        files.forEach((function(_this) {
          return function(filename) {
            return ret += _this.resolvePath(filename + '\t%(break)');
          };
        })(this));
        this.message(ret);
        return true;
      }
      filesBlocks = [];
      files.forEach((function(_this) {
        return function(filename) {
          return filesBlocks.push(_this._fileInfoHtml(filename, _this.getCwd()));
        };
      })(this));
      filesBlocks = filesBlocks.sort(function(a, b) {
        var aDir, bDir;
        aDir = false;
        bDir = false;
        if (a[1] != null) {
          aDir = a[1].isDirectory();
        }
        if (b[1] != null) {
          bDir = b[1].isDirectory();
        }
        if (aDir && !bDir) {
          return -1;
        }
        if (!aDir && bDir) {
          return 1;
        }
        return a[2] > b[2] && 1 || -1;
      });
      filesBlocks.unshift(this._fileInfoHtml('..', this.getCwd()));
      filesBlocks = filesBlocks.map(function(b) {
        return b[0];
      });
      this.message(filesBlocks.join('%(break)') + '<div class="clear"/>');
      return true;
    };

    ATPOutputView.prototype.parseSpecialNodes = function() {
      var caller;
      caller = this;
      if (atom.config.get('atom-terminal-panel.enableConsoleInteractiveHints')) {
        $('.atp-tooltip[data-toggle="tooltip"]').each(function() {
          var title;
          title = $(this).attr('title');
          return atom.tooltips.add($(this), {});
        });
      }
      if (atom.config.get('atom-terminal-panel.enableConsoleInteractiveLinks')) {
        return this.find('.console-link').each((function() {
          var el, link_target, link_target_column, link_target_line, link_target_name, link_type;
          el = $(this);
          link_target = el.data('target');
          if (link_target !== null && link_target !== void 0) {
            el.data('target', null);
            link_type = el.data('targettype');
            link_target_name = el.data('targetname');
            link_target_line = el.data('line');
            link_target_column = el.data('column');
            if (link_target_line == null) {
              link_target_line = 0;
            }
            if (link_target_column == null) {
              link_target_column = 0;
            }
            return el.click(function() {
              var moveToDir;
              el.addClass('link-used');
              if (link_type === 'file') {
                atom.workspace.open(link_target, {
                  initialLine: link_target_line,
                  initialColumn: link_target_column
                });
              }
              if (link_type === 'directory') {
                moveToDir = function(directory, messageDisp) {
                  if (messageDisp == null) {
                    messageDisp = false;
                  }
                  caller.clear();
                  caller.cd([directory]);
                  return setTimeout(function() {
                    if (!caller.ls()) {
                      if (!messageDisp) {
                        caller.errorMessage('The directory is inaccesible.\n');
                        messageDisp = true;
                        return setTimeout(function() {
                          return moveToDir('..', messageDisp);
                        }, 1500);
                      }
                    }
                  }, caller._cmdintdel);
                };
                return setTimeout(function() {
                  return moveToDir(link_target_name);
                }, caller._cmdintdel);
              }
            });
          }
        }));
      }
    };

    ATPOutputView.prototype.consoleAlert = function(text) {
      return '<div class="alert alert-danger alert-dismissible" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button><strong>Warning!</strong> ' + text + '</div>';
    };

    ATPOutputView.prototype.consolePanel = function(title, content) {
      return '<div class="panel panel-info welcome-panel"><div class="panel-heading">' + title + '</div><div class="panel-body">' + content + '</div></div><br><br>';
    };

    ATPOutputView.prototype.consoleText = function(type, text) {
      if (type === 'info') {
        return '<span class="text-info" style="margin-left:10px;">' + text + '</span>';
      }
      if (type === 'error') {
        return '<span class="text-error" style="margin-left:10px;">' + text + '</span>';
      }
      if (type === 'warning') {
        return '<span class="text-warning" style="margin-left:10px;">' + text + '</span>';
      }
      if (type === 'success') {
        return '<span class="text-success" style="margin-left:10px;">' + text + '</span>';
      }
      return text;
    };

    ATPOutputView.prototype.consoleLabel = function(type, text) {
      if ((!atom.config.get('atom-terminal-panel.enableConsoleLabels')) && (!this.specsMode)) {
        return text;
      }
      if (text == null) {
        text = type;
      }
      if (type === 'badge') {
        return '<span class="badge">' + text + '</span>';
      }
      if (type === 'default') {
        return '<span class="inline-block highlight">' + text + '</span>';
      }
      if (type === 'primary') {
        return '<span class="label label-primary">' + text + '</span>';
      }
      if (type === 'success') {
        return '<span class="inline-block highlight-success">' + text + '</span>';
      }
      if (type === 'info') {
        return '<span class="inline-block highlight-info">' + text + '</span>';
      }
      if (type === 'warning') {
        return '<span class="inline-block highlight-warning">' + text + '</span>';
      }
      if (type === 'danger') {
        return '<span class="inline-block highlight-error">' + text + '</span>';
      }
      if (type === 'error') {
        return '<span class="inline-block highlight-error">' + text + '</span>';
      }
      return '<span class="label label-default">' + text + '</span>';
    };

    ATPOutputView.prototype.consoleLink = function(name, forced) {
      if (forced == null) {
        forced = true;
      }
      if ((atom.config.get('atom-terminal-panel.XExperimentEnableForceLinking')) && (!forced)) {
        return name;
      }
      return this._fileInfoHtml(name, this.getCwd(), 'font', false)[0];
    };

    ATPOutputView.prototype._fileInfoHtml = function(filename, parent, wrapper_class, use_file_info_class) {
      var classes, dataname, e, exattrs, extension, file_exists, filecolumn, fileline, filepath, filepath_tooltip, href, matcher, name_tokens, stat, str, target_type;
      if (wrapper_class == null) {
        wrapper_class = 'span';
      }
      if (use_file_info_class == null) {
        use_file_info_class = 'true';
      }
      str = filename;
      name_tokens = filename;
      filename = filename.replace(/:[0-9]+:[0-9]/ig, '');
      name_tokens = this.util.replaceAll(filename, '', name_tokens);
      name_tokens = name_tokens.split(':');
      fileline = name_tokens[0];
      filecolumn = name_tokens[1];
      filename = this.util.replaceAll('/', '\\', filename);
      filename = this.util.replaceAll(parent, '', filename);
      filename = this.util.replaceAll(this.util.replaceAll('/', '\\', parent), '', filename);
      if (filename[0] === '\\' || filename[0] === '/') {
        filename = filename.substring(1);
      }
      if (filename === '..') {
        if (use_file_info_class) {
          return ["<font class=\"file-extension\"><" + wrapper_class + " data-targetname=\"" + filename + "\" data-targettype=\"directory\" data-target=\"" + filename + "\" class=\"console-link icon-file-directory parent-folder\">" + filename + "</" + wrapper_class + "></font>", null, filename];
        } else {
          return ["<font class=\"file-extension\"><" + wrapper_class + " data-targetname=\"" + filename + "\" data-targettype=\"directory\" data-target=\"" + filename + "\" class=\"console-link icon-file-directory file-info parent-folder\">" + filename + "</" + wrapper_class + "></font>", null, filename];
        }
      }
      file_exists = true;
      filepath = this.resolvePath(filename);
      classes = [];
      dataname = '';
      if (atom.config.get('atom-terminal-panel.useAtomIcons')) {
        classes.push('name');
        classes.push('icon');
        classes.push('icon-file-text');
        dataname = filepath;
      } else {
        classes.push('name');
      }
      if (use_file_info_class) {
        classes.push('file-info');
      }
      stat = null;
      if (file_exists) {
        try {
          stat = fs.lstatSync(filepath);
        } catch (error) {
          e = error;
          file_exists = false;
        }
      }
      if (file_exists) {
        if (atom.config.get('atom-terminal-panel.enableConsoleInteractiveLinks') || this.specsMode) {
          classes.push('console-link');
        }
        if (stat.isSymbolicLink()) {
          classes.push('stat-link');
          stat = fs.statSync(filepath);
          target_type = 'null';
        }
        if (stat.isFile()) {
          if (stat.mode & 73) {
            classes.push('stat-program');
          }
          matcher = /(.:)((.*)\\)*((.*\.)*)/ig;
          extension = filepath.replace(matcher, "");
          classes.push(this.util.replaceAll(' ', '', extension));
          classes.push('icon-file-text');
          target_type = 'file';
        }
        if (stat.isDirectory()) {
          classes.push('icon-file-directory');
          target_type = 'directory';
        }
        if (stat.isCharacterDevice()) {
          classes.push('stat-char-dev');
          target_type = 'device';
        }
        if (stat.isFIFO()) {
          classes.push('stat-fifo');
          target_type = 'fifo';
        }
        if (stat.isSocket()) {
          classes.push('stat-sock');
          target_type = 'sock';
        }
      } else {
        classes.push('file-not-found');
        classes.push('icon-file-text');
        target_type = 'file';
      }
      if (filename[0] === '.') {
        classes.push('status-ignored');
        target_type = 'ignored';
      }
      href = 'file:///' + this.util.replaceAll('\\', '/', filepath);
      classes.push('atp-tooltip');
      exattrs = [];
      if (fileline != null) {
        exattrs.push('data-line="' + fileline + '"');
      }
      if (filecolumn != null) {
        exattrs.push('data-column="' + filecolumn + '"');
      }
      filepath_tooltip = this.util.replaceAll('\\', '/', filepath);
      filepath = this.util.replaceAll('\\', '/', filepath);
      return ["<font class=\"file-extension\"><" + wrapper_class + " " + (exattrs.join(' ')) + " tooltip=\"\" data-targetname=\"" + filename + "\" data-targettype=\"" + target_type + "\" data-target=\"" + filepath + "\" data-name=\"" + dataname + "\" class=\"" + (classes.join(' ')) + "\" data-toggle=\"tooltip\" data-placement=\"top\" title=\"" + filepath_tooltip + "\" >" + filename + "</" + wrapper_class + "></font>", stat, filename];
    };

    ATPOutputView.prototype.getGitStatusName = function(path, gitRoot, repo) {
      var status;
      status = (repo.getCachedPathStatus || repo.getPathStatus)(path);
      if (status) {
        if (repo.isStatusModified(status)) {
          return 'modified';
        }
        if (repo.isStatusNew(status)) {
          return 'added';
        }
      }
      if (repo.isPathIgnore(path)) {
        return 'ignored';
      }
    };

    ATPOutputView.prototype.preserveOriginalPaths = function(text) {
      text = this.util.replaceAll(this.getCurrentFilePath(), '%(file-original)', text);
      text = this.util.replaceAll(this.getCwd(), '%(cwd-original)', text);
      text = this.util.replaceAll(this.getCwd(), '%(cwd-original)', text);
      text = this.util.replaceAll('/', '&fs;', text);
      text = this.util.replaceAll('\\', '&bs;', text);
      return text;
    };

    ATPOutputView.prototype.parseMessage = function(message, matchSpec, parseCustomRules) {
      var instance, n;
      if (matchSpec == null) {
        matchSpec = true;
      }
      if (parseCustomRules == null) {
        parseCustomRules = true;
      }
      instance = this;
      message = '<div>' + (instance.parseMessage_(message, false, true, true)) + '</div>';
      n = $(message);
      n.contents().filter(function() {
        return this.nodeType === 3;
      }).each(function() {
        var out, thiz;
        thiz = $(this);
        out = thiz.text();
        out = instance.parseMessage_(out, matchSpec, parseCustomRules);
        return thiz.replaceWith('<span>' + out + '</span>');
      });
      return n.html();
    };

    ATPOutputView.prototype.parseMessage_ = function(message, matchSpec, parseCustomRules, isForcelyPreparsering) {
      var cwdE, cwdN, flags, forceParse, i, j, key, matchAllLine, matchExp, matchNextLines, path, ref3, regex, regex2, regexString, replExp, rules, value;
      if (matchSpec == null) {
        matchSpec = true;
      }
      if (parseCustomRules == null) {
        parseCustomRules = true;
      }
      if (isForcelyPreparsering == null) {
        isForcelyPreparsering = false;
      }
      if (message === null) {
        return '';
      }
      if (matchSpec) {
        if (atom.config.get('atom-terminal-panel.XExperimentEnableForceLinking')) {
          if (atom.config.get('atom-terminal-panel.textReplacementFileAdress') != null) {
            if (atom.config.get('atom-terminal-panel.textReplacementFileAdress') !== '') {
              regex = /(\.(\\|\/))?(([A-Za-z]:)(\\|\/))?(([^\s#@$%&!;<>\.\^:]| )+(\\|\/))((([^\s#@$%&!;<>\.\^:]| )+(\\|\/))*([^\s<>:#@$%\^;]| )+(\.([^\s#@$%&!;<>\.0-9:\^]| )*)*)?/ig;
              regex2 = /(\.(\\|\/))((([^\s#@$%&!;<>\.\^:]| )+(\\|\/))*([^\s<>:#@$%\^;]| )+(\.([^\s#@$%&!;<>\.0-9:\^]| )*)*)?/ig;
              message = message.replace(regex, (function(_this) {
                return function(match, text, urlId) {
                  return _this.parseSpecialStringTemplate(atom.config.get('atom-terminal-panel.textReplacementFileAdress'), {
                    file: match
                  });
                };
              })(this));
              message = message.replace(regex2, (function(_this) {
                return function(match, text, urlId) {
                  return _this.parseSpecialStringTemplate(atom.config.get('atom-terminal-panel.textReplacementFileAdress'), {
                    file: match
                  });
                };
              })(this));
            }
          }
        } else {
          if (atom.config.get('atom-terminal-panel.textReplacementFileAdress') != null) {
            if (atom.config.get('atom-terminal-panel.textReplacementFileAdress') !== '') {
              cwdN = this.getCwd();
              cwdE = this.util.replaceAll('/', '\\', this.getCwd());
              regexString = '(' + (this.util.escapeRegExp(cwdN)) + '|' + (this.util.escapeRegExp(cwdE)) + ')\\\\([^\\s:#$%^&!:]| )+\\.?([^\\s:#$@%&\\*\\^!0-9:\\.+\\-,\\\\\\/\"]| )*';
              regex = new RegExp(regexString, 'ig');
              message = message.replace(regex, (function(_this) {
                return function(match, text, urlId) {
                  return _this.parseSpecialStringTemplate(atom.config.get('atom-terminal-panel.textReplacementFileAdress'), {
                    file: match
                  });
                };
              })(this));
            }
          }
        }
        if (atom.config.get('atom-terminal-panel.textReplacementCurrentFile') != null) {
          if (atom.config.get('atom-terminal-panel.textReplacementCurrentFile') !== '') {
            path = this.getCurrentFilePath();
            regex = new RegExp(this.util.escapeRegExp(path), 'g');
            message = message.replace(regex, (function(_this) {
              return function(match, text, urlId) {
                return _this.parseSpecialStringTemplate(atom.config.get('atom-terminal-panel.textReplacementCurrentFile'), {
                  file: match
                });
              };
            })(this));
          }
        }
        message = this.preserveOriginalPaths(message);
        if (atom.config.get('atom-terminal-panel.textReplacementCurrentPath') != null) {
          if (atom.config.get('atom-terminal-panel.textReplacementCurrentPath') !== '') {
            path = this.getCwd();
            regex = new RegExp(this.util.escapeRegExp(path), 'g');
            message = message.replace(regex, (function(_this) {
              return function(match, text, urlId) {
                return _this.parseSpecialStringTemplate(atom.config.get('atom-terminal-panel.textReplacementCurrentPath'), {
                  file: match
                });
              };
            })(this));
          }
        }
      }
      message = this.util.replaceAll('%(file-original)', this.getCurrentFilePath(), message);
      message = this.util.replaceAll('%(cwd-original)', this.getCwd(), message);
      message = this.util.replaceAll('&fs;', '/', message);
      message = this.util.replaceAll('&bs;', '\\', message);
      rules = ATPCore.getConfig().rules;
      for (key in rules) {
        value = rules[key];
        matchExp = key;
        replExp = '%(content)';
        matchAllLine = false;
        matchNextLines = 0;
        flags = 'gm';
        forceParse = false;
        if (value.match != null) {
          if (value.match.flags != null) {
            flags = value.match.flags.join('');
          }
          if (value.match.replace != null) {
            replExp = value.match.replace;
          }
          if (value.match.matchLine != null) {
            matchAllLine = value.match.matchLine;
          }
          if (value.match.matchNextLines != null) {
            matchNextLines = value.match.matchNextLines;
          }
          if (value.match.forced != null) {
            forceParse = value.match.forced;
          }
        }
        if ((forceParse || parseCustomRules) && ((isForcelyPreparsering && forceParse) || (!isForcelyPreparsering))) {
          if (matchAllLine) {
            matchExp = '.*' + matchExp;
          }
          if (matchNextLines > 0) {
            for (i = j = 0, ref3 = matchNextLines; j <= ref3; i = j += 1) {
              matchExp = matchExp + '[\\r\\n].*';
            }
          }
          regex = new RegExp(matchExp, flags);
          message = message.replace(regex, (function(_this) {
            return function() {
              var groups, groupsNumber, k, match, ref4, repl, style, vars;
              match = arguments[0], groups = 2 <= arguments.length ? slice.call(arguments, 1) : [];
              style = '';
              if (value.css != null) {
                style = ATPCore.jsonCssToInlineStyle(value.css);
              } else if (value.match == null) {
                style = ATPCore.jsonCssToInlineStyle(value);
              }
              vars = {
                content: match,
                0: match
              };
              groupsNumber = groups.length - 1;
              for (i = k = 0, ref4 = groupsNumber; k <= ref4; i = k += 1) {
                if (groups[i] != null) {
                  vars[i + 1] = groups[i];
                }
              }
              repl = _this.parseSpecialStringTemplate(replExp, vars);
              return "<font style=\"" + style + "\">" + repl + "</font>";
            };
          })(this));
        }
      }
      message = this.util.replaceAll('%(file-original)', this.getCurrentFilePath(), message);
      message = this.util.replaceAll('%(cwd-original)', this.getCwd(), message);
      message = this.util.replaceAll('&fs;', '/', message);
      message = this.util.replaceAll('&bs;', '\\', message);
      return message;
    };

    ATPOutputView.prototype.redirect = function(streamName) {
      return this.redirectOutput = streamName;
    };

    ATPOutputView.prototype.rawMessage = function(message) {
      if (this.redirectOutput === 'console') {
        console.log(message);
        return;
      }
      this.cliOutput.append(message);
      this.showCmd();
      this.statusIcon.removeClass('status-error');
      return this.statusIcon.addClass('status-success');
    };

    ATPOutputView.prototype.message = function(message, matchSpec) {
      var j, len, m, mes;
      if (matchSpec == null) {
        matchSpec = true;
      }
      if (this.redirectOutput === 'console') {
        console.log(message);
        return;
      }
      if (typeof message === 'object') {
        mes = message;
      } else {
        if (message == null) {
          return;
        }
        mes = message.split('%(break)');
        if (mes.length > 1) {
          for (j = 0, len = mes.length; j < len; j++) {
            m = mes[j];
            this.message(m);
          }
          return;
        } else {
          mes = mes[0];
        }
        mes = this.parseMessage(message, matchSpec, matchSpec);
        mes = this.util.replaceAll('%(raw)', '', mes);
        mes = this.parseTemplate(mes, [], true);
      }
      this.cliOutput.append(mes);
      this.showCmd();
      this.statusIcon.removeClass('status-error');
      this.statusIcon.addClass('status-success');
      this.parseSpecialNodes();
      return this.scrollToBottom();
    };

    ATPOutputView.prototype.errorMessage = function(message) {
      this.cliOutput.append(this.parseMessage(message));
      this.showCmd();
      this.statusIcon.removeClass('status-success');
      this.statusIcon.addClass('status-error');
      return this.parseSpecialNodes();
    };

    ATPOutputView.prototype.correctFilePath = function(path) {
      return this.util.replaceAll('\\', '/', path);
    };

    ATPOutputView.prototype.getCwd = function() {
      var cwd, extFile, projectDir;
      if (atom.project == null) {
        return null;
      }
      extFile = extname(atom.project.path);
      if (extFile === "") {
        if (atom.project.path) {
          projectDir = atom.project.path;
        } else {
          if (process.env.HOME) {
            projectDir = process.env.HOME;
          } else if (process.env.USERPROFILE) {
            projectDir = process.env.USERPROFILE;
          } else {
            projectDir = '/';
          }
        }
      } else {
        projectDir = dirname(atom.project.path);
      }
      cwd = this.cwd || projectDir || this.userHome;
      return this.correctFilePath(cwd);
    };

    ATPOutputView.prototype.spawn = function(inputCmd, cmd, args) {
      var dataCallback, err, htmlStream, instance;
      this.spawnProcessActive = true;
      instance = this;
      dataCallback = function(data) {
        instance.message(data);
        return instance.scrollToBottom();
      };
      htmlStream = ansihtml();
      htmlStream.on('data', (function(_this) {
        return function(data) {
          return setTimeout(function() {
            return dataCallback(data);
          }, 100);
        };
      })(this));
      try {
        this.program = exec(inputCmd, {
          stdio: 'pipe',
          env: process.env,
          cwd: this.getCwd()
        });
        this.program.stdout.pipe(htmlStream);
        this.program.stderr.pipe(htmlStream);
        this.statusIcon.removeClass('status-success');
        this.statusIcon.removeClass('status-error');
        this.statusIcon.addClass('status-running');
        this.killBtn.removeClass('hide');
        this.program.once('exit', (function(_this) {
          return function(code) {
            if (atom.config.get('atom-terminal-panel.logConsole') || _this.specsMode) {
              console.log('exit', code);
            }
            _this.killBtn.addClass('hide');
            _this.statusIcon.removeClass('status-running');
            _this.program = null;
            _this.statusIcon.addClass(code === 0 && 'status-success' || 'status-error');
            _this.showCmd();
            return _this.spawnProcessActive = false;
          };
        })(this));
        this.program.on('error', (function(_this) {
          return function(err) {
            if (atom.config.get('atom-terminal-panel.logConsole') || _this.specsMode) {
              console.log('error');
            }
            _this.message(err.message);
            _this.showCmd();
            return _this.statusIcon.addClass('status-error');
          };
        })(this));
        this.program.stdout.on('data', (function(_this) {
          return function() {
            _this.flashIconClass('status-info');
            return _this.statusIcon.removeClass('status-error');
          };
        })(this));
        return this.program.stderr.on('data', (function(_this) {
          return function() {
            if (atom.config.get('atom-terminal-panel.logConsole') || _this.specsMode) {
              console.log('stderr');
            }
            return _this.flashIconClass('status-error', 300);
          };
        })(this));
      } catch (error) {
        err = error;
        this.message(err.message);
        return this.showCmd();
      }
    };

    return ATPOutputView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy91Y2hpaGEvLmF0b20vcGFja2FnZXMvYXRvbS10ZXJtaW5hbC1wYW5lbC9saWIvYXRwLXZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7Ozs7QUFBQTtBQUFBLE1BQUEseU9BQUE7SUFBQTs7Ozs7O0VBUUEsY0FBQSxHQUFpQjs7RUFFakIsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSOztFQUNMLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUjs7RUFDTCxNQUE0QixPQUFBLENBQVEsc0JBQVIsQ0FBNUIsRUFBQyxTQUFELEVBQUksbUNBQUosRUFBb0I7O0VBQ3BCLE9BQTBCLE9BQUEsQ0FBUSxlQUFSLENBQTFCLEVBQUMsa0JBQUQsRUFBUSxnQkFBUixFQUFjOztFQUNkLE9BQW1DLE9BQUEsQ0FBUSxNQUFSLENBQW5DLEVBQUMsc0JBQUQsRUFBVSxzQkFBVixFQUFtQixzQkFBbkIsRUFBNEI7O0VBRTVCLFFBQUEsR0FBVyxPQUFBLENBQVEsa0JBQVI7O0VBQ1gsTUFBQSxHQUFTLE9BQUEsQ0FBUSxRQUFSOztFQUNULEtBQUEsR0FBUSxPQUFBLENBQVEsWUFBUjs7RUFFUixvQkFBQSxHQUF1QixPQUFBLENBQVEsb0JBQVI7O0VBQ3ZCLE9BQUEsR0FBVSxPQUFBLENBQVEsVUFBUjs7RUFDVixtQkFBQSxHQUFzQixPQUFBLENBQVEsdUJBQVI7O0VBQ3RCLG9CQUFBLEdBQXVCLE9BQUEsQ0FBUSx3QkFBUjs7RUFFdkIsTUFBTSxDQUFDLENBQVAsR0FBVyxNQUFNLENBQUMsTUFBUCxHQUFnQjs7RUFDM0IsT0FBQSxDQUFRLHdCQUFSOztFQUdBLE1BQU0sQ0FBQyxPQUFQLEdBQ007Ozs7Ozs7Ozs7NEJBQ0osR0FBQSxHQUFLOzs0QkFDTCxlQUFBLEdBQWlCOzs0QkFDakIsVUFBQSxHQUFZOzs0QkFDWixNQUFBLEdBQVE7OzRCQUNSLGNBQUEsR0FBZ0I7OzRC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QUEsT0FBRCxDQUFVLEdBQUcsQ0FBQyxPQUFkO2VBQ0EsSUFBQyxDQUFBLE9BQUQsQ0FBQSxFQWhDRjs7SUEzQks7Ozs7S0F6eENtQjtBQTlCNUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbiAgQXRvbS10ZXJtaW5hbC1wYW5lbFxuICBDb3B5cmlnaHQgYnkgaXNpczk3XG4gIE1JVCBsaWNlbnNlZFxuXG4gIFRoZSBtYWluIHRlcm1pbmFsIHZpZXcgY2xhc3MsIHdoaWNoIGRvZXMgdGhlIG1vc3Qgb2YgYWxsIHRoZSB3b3JrLlxuIyMjXG5cbmxhc3RPcGVuZWRWaWV3ID0gbnVsbFxuXG5mcyA9IGluY2x1ZGUgJ2ZzJ1xub3MgPSBpbmNsdWRlICdvcydcbnskLCBUZXh0RWRpdG9yVmlldywgVmlld30gPSBpbmNsdWRlICdhdG9tLXNwYWNlLXBlbi12aWV3cydcbntzcGF3biwgZXhlYywgZXhlY1N5bmN9ID0gaW5jbHVkZSAnY2hpbGRfcHJvY2VzcydcbntyZXNvbHZlLCBkaXJuYW1lLCBleHRuYW1lLCBzZXB9ID0gaW5jbHVkZSAncGF0aCdcblxuYW5zaWh0bWwgPSBpbmNsdWRlICdhbnNpLWh0bWwtc3RyZWFtJ1xuc3RyZWFtID0gaW5jbHVkZSAnc3RyZWFtJ1xuaWNvbnYgPSBpbmNsdWRlICdpY29udi1saXRlJ1xuXG5BVFBDb21tYW5kRmluZGVyVmlldyA9IGluY2x1ZGUgJ2F0cC1jb21tYW5kLWZpbmRlcidcbkFUUENvcmUgPSBpbmNsdWRlICdhdHAtY29yZSdcbkFUUENvbW1hbmRzQnVpbHRpbnMgPSBpbmNsdWRlICdhdHAtYnVpbHRpbnMtY29tbWFuZHMnXG5BVFBWYXJpYWJsZXNCdWlsdGlucyA9IGluY2x1ZGUgJ2F0cC1idWlsdGlucy12YXJpYWJsZXMnXG5cbndpbmRvdy4kID0gd2luZG93LmpRdWVyeSA9ICRcbmluY2x1ZGUgJ2pxdWVyeS1hdXRvY29tcGxldGUtanMnXG5cblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgQVRQT3V0cHV0VmlldyBleHRlbmRzIFZpZXdcbiAgY3dkOiBudWxsXG4gIHN0cmVhbXNFbmNvZGluZzogJ2lzby04ODU5LTMnXG4gIF9jbWRpbnRkZWw6IDUwXG4gIGVjaG9PbjogdHJ1ZVxuICByZWRpcmVjdE91dHB1dDogJydcbiAgc3BlY3NNb2RlOiBmYWxzZVxuICBpbnB1dExpbmU6IDBcbiAgaGVsbG9NZXNzYWdlU2hvd246IGZhbHNlXG4gIG1pbkhlaWdodDogMjUwXG4gIHV0aWw6IGluY2x1ZGUgJ2F0cC10ZXJtaW5hbC11dGlsJ1xuICBjdXJyZW50SW5wdXRCb3g6IG51bGxcbiAgY3VycmVudElucHV0Qm94OiBudWxsXG4gIGN1cnJlbnRJbnB1dEJveFRtcjogbnVsbFxuICB2b2xhdGlsZVN1Z2dlc3Rpb25zOiBbXVxuICBkaXNwb3NhYmxlczpcbiAgICBkaXNwb3NlOiAoZmllbGQpID0+XG4gICAgICBpZiBub3QgdGhpc1tmaWVsZF0/XG4gICAgICAgIHRoaXNbZmllbGRdID0gW11cbiAgICAgIGEgPSB0aGlzW2ZpZWxkXVxuICAgICAgZm9yIGkgaW4gWzAuLmEubGVuZ3RoLTFdIGJ5IDFcbiAgICAgICAgYVtpXS5kaXNwb3NlKClcbiAgICBhZGQ6IChmaWVsZCwgdmFsdWUpID0+XG4gICAgICBpZiBub3QgdGhpc1tmaWVsZF0/XG4gICAgICAgIHRoaXNbZmllbGRdID0gW11cbiAgICAgIHRoaXNbZmllbGRdLnB1c2ggdmFsdWVcbiAga2V5Q29kZXM6IHtcbiAgICBlbnRlcjogMTNcbiAgICBhcnJvd1VwOiAzOFxuICAgIGFycm93RG93bjogNDBcbiAgICBhcnJvd0xlZnQ6IDM3XG4gICAgYXJyb3dSaWdodDogMzlcbiAgfVxuICBsb2NhbENvbW1hbmRBdG9tQmluZGluZ3M6IFtdXG4gIGxvY2FsQ29tbWFuZHM6IEFUUENvbW1hbmRzQnVpbHRpbnNcbiAgQGNvbnRlbnQ6IC0+XG4gICAgQGRpdiB0YWJJbmRleDogLTEsIGNsYXNzOiAncGFuZWwgYXRwLXBhbmVsIHBhbmVsLWJvdHRvbScsIG91dGxldDogJ2F0cFZpZXcnLCA9PlxuICAgICAgQGRpdiBjbGFzczogJ3Rlcm1pbmFsIHBhbmVsLWRpdmlkZXInLCBzdHlsZTogJ2N1cnNvcjpuLXJlc2l6ZTt3aWR0aDoxMDAlO2hlaWdodDo4cHg7Jywgb3V0bGV0OiAncGFuZWxEaXZpZGVyJ1xuICAgICAgQGJ1dHRvbiBvdXRsZXQ6ICdtYXhpbWl6ZUljb25CdG4nLCBjbGFzczogJ2F0cC1tYXhpbWl6ZS1idG4nLCBjbGljazogJ21heGltaXplJ1xuICAgICAgQGJ1dHRvbiBvdXRsZXQ6ICdjbG9zZUljb25CdG4nLCBjbGFzczogJ2F0cC1jbG9zZS1idG4nLCBjbGljazogJ2Nsb3NlJ1xuICAgICAgQGJ1dHRvbiBvdXRsZXQ6ICdkZXN0cm95SWNvbkJ0bicsIGNsYXNzOiAnYXRwLWRlc3Ryb3ktYnRuJywgY2xpY2s6ICdkZXN0cm95J1xuICAgICAgQGRpdiBjbGFzczogJ3BhbmVsLWhlYWRpbmcgYnRuLXRvb2xiYXInLCBvdXRsZXQ6J2NvbnNvbGVUb29sYmFySGVhZGluZycsID0+XG4gICAgICAgIEBkaXYgY2xhc3M6ICdidG4tZ3JvdXAnLCBvdXRsZXQ6J2NvbnNvbGVUb29sYmFyJywgPT5cbiAgICAgICAgICBAYnV0dG9uIG91dGxldDogJ2tpbGxCdG4nLCBjbGljazogJ2tpbGwnLCBjbGFzczogJ2J0biBoaWRlJywgPT5cbiAgICAgICAgICAgIEBzcGFuICdraWxsJ1xuICAgICAgICAgIEBidXR0b24gb3V0bGV0OiAnZXhpdEJ0bicsIGNsaWNrOiAnZGVzdHJveScsIGNsYXNzOiAnYnRuJywgPT5cbiAgICAgICAgICAgIEBzcGFuICdleGl0J1xuICAgICAgICAgIEBidXR0b24gb3V0bGV0OiAnY2xvc2VCdG4nLCBjbGljazogJ2Nsb3NlJywgY2xhc3M6ICdidG4nLCA9PlxuICAgICAgICAgICAgQHNwYW4gY2xhc3M6IFwiaWNvbiBpY29uLXhcIlxuICAgICAgICAgICAgQHNwYW4gJ2Nsb3NlJ1xuICAgICAgICBAYnV0dG9uIG91dGxldDogJ29wZW5Db25maWdCdG4nLCBjbGFzczogJ2J0biBpY29uIGljb24tZ2VhciBpbmxpbmUtYmxvY2stdGlnaHQgYnV0dG9uLXNldHRpbmdzJywgY2xpY2s6ICdzaG93U2V0dGluZ3MnLCA9PlxuICAgICAgICAgIEBzcGFuICdPcGVuIGNvbmZpZydcbiAgICAgICAgQGJ1dHRvbiBvdXRsZXQ6ICdyZWxvYWRDb25maWdCdG4nLCBjbGFzczogJ2J0biBpY29uIGljb24tZ2VhciBpbmxpbmUtYmxvY2stdGlnaHQgYnV0dG9uLXNldHRpbmdzJywgY2xpY2s6ICdyZWxvYWRTZXR0aW5ncycsID0+XG4gICAgICAgICAgQHNwYW4gJ1JlbG9hZCBjb25maWcnXG4gICAgICBAZGl2IGNsYXNzOiAnYXRwLXBhbmVsLWJvZHknLCA9PlxuICAgICAgICBAcHJlIGNsYXNzOiBcInRlcm1pbmFsXCIsIG91dGxldDogXCJjbGlPdXRwdXRcIlxuXG4gIHRvZ2dsZUF1dG9Db21wbGV0aW9uOiAoKSAtPlxuICAgIGlmIEBjdXJyZW50SW5wdXRCb3hDbXA/XG4gICAgICBAY3VycmVudElucHV0Qm94Q21wLmVuYWJsZSgpXG4gICAgICBAY3VycmVudElucHV0Qm94Q21wLnJlcGFpbnQoKVxuICAgICAgQGN1cnJlbnRJbnB1dEJveENtcC5zaG93RHJvcERvd24oKVxuICAgICAgQGN1cnJlbnRJbnB1dEJveC5maW5kKCcudGVybWluYWwtaW5wdXQnKS5oZWlnaHQoJzEwMHB4Jyk7XG5cbiAgZnNTcHk6ICgpIC0+XG4gICAgQHZvbGF0aWxlU3VnZ2VzdGlvbnMgPSBbXVxuICAgIGlmIEBjd2Q/XG4gICAgICBmcy5yZWFkZGlyIEBjd2QsIChlcnIsIGZpbGVzKSA9PlxuICAgICAgICBpZiBmaWxlcz9cbiAgICAgICAgICBmb3IgZmlsZSBpbiBmaWxlc1xuICAgICAgICAgICAgQHZvbGF0aWxlU3VnZ2VzdGlvbnMucHVzaCBmaWxlXG5cbiAgdHVyblNwZWNzTW9kZTogKHN0YXRlKSAtPlxuICAgIEBzcGVjc01vZGUgPSBzdGF0ZVxuXG4gIGdldFJhd091dHB1dDogKCkgLT5cbiAgICB0ID0gQGdldEh0bWxPdXRwdXQoKS5yZXBsYWNlKC88W14+XSo+L2lnbSwgXCJcIilcbiAgICB0ID0gQHV0aWwucmVwbGFjZUFsbCBcIiZndDtcIiwgXCI+XCIsIHRcbiAgICB0ID0gQHV0aWwucmVwbGFjZUFsbCBcIiZsdDtcIiwgXCI8XCIsIHRcbiAgICB0ID0gQHV0aWwucmVwbGFjZUFsbCBcIiZxdW90O1wiLCBcIlxcXCJcIiwgdFxuICAgIHJldHVybiB0XG5cbiAgZ2V0SHRtbE91dHB1dDogKCkgLT5cbiAgICByZXR1cm4gQGNsaU91dHB1dC5odG1sKClcblxuICByZXNvbHZlUGF0aDogKHBhdGgpIC0+XG4gICAgcGF0aCA9IEB1dGlsLnJlcGxhY2VBbGwgJ1xcXCInLCAnJywgcGF0aFxuICAgIGZpbGVwYXRoID0gJydcbiAgICBpZiBwYXRoLm1hdGNoKC8oW0EtWmEtel0pOi9pZykgIT0gbnVsbFxuICAgICAgZmlsZXBhdGggPSBwYXRoXG4gICAgZWxzZVxuICAgICAgZmlsZXBhdGggPSBAZ2V0Q3dkKCkgKyAnLycgKyBwYXRoXG4gICAgZmlsZXBhdGggPSBAdXRpbC5yZXBsYWNlQWxsICdcXFxcJywgJy8nLCBmaWxlcGF0aFxuICAgIHJldHVybiBAdXRpbC5yZXBsYWNlQWxsICdcXFxcJywgJy8nLCAocmVzb2x2ZSBmaWxlcGF0aClcblxuICByZWxvYWRTZXR0aW5nczogKCkgLT5cbiAgICBAb25Db21tYW5kICd1cGRhdGUnXG5cbiAgc2hvd1NldHRpbmdzOiAoKSAtPlxuICAgIEFUUENvcmUucmVsb2FkKClcbiAgICBzZXRUaW1lb3V0ICgpID0+XG4gICAgICBwYW5lbFBhdGggPSBhdG9tLnBhY2thZ2VzLnJlc29sdmVQYWNrYWdlUGF0aCAnYXRvbS10ZXJtaW5hbC1wYW5lbCdcbiAgICAgIGF0b21QYXRoID0gcmVzb2x2ZSBwYW5lbFBhdGgrJy8uLi8uLidcbiAgICAgIGNvbmZpZ1BhdGggPSBhdG9tUGF0aCArICcvdGVybWluYWwtY29tbWFuZHMuanNvbidcbiAgICAgIGF0b20ud29ya3NwYWNlLm9wZW4gY29uZmlnUGF0aFxuICAgICwgNTBcblxuICBmb2N1c0lucHV0Qm94OiAoKSAtPlxuICAgIGlmIEBjdXJyZW50SW5wdXRCb3hDbXA/XG4gICAgICBAY3VycmVudElucHV0Qm94Q21wLmlucHV0LmZvY3VzKClcblxuICB1cGRhdGVJbnB1dEN1cnNvcjogKHRleHRhcmVhKSAtPlxuICAgIEByYXdNZXNzYWdlICd0ZXN0XFxuJ1xuICAgIHZhbCA9IHRleHRhcmVhLnZhbCgpXG4gICAgdGV4dGFyZWFcbiAgICAgIC5ibHVyKClcbiAgICAgIC5mb2N1cygpXG4gICAgICAudmFsKFwiXCIpXG4gICAgICAudmFsKHZhbClcblxuICByZW1vdmVJbnB1dEJveDogKCkgLT5cbiAgICBAY2xpT3V0cHV0LmZpbmQoJy5hdHAtZHluYW1pYy1pbnB1dC1ib3gnKS5yZW1vdmUoKVxuXG4gIHB1dElucHV0Qm94OiAoKSAtPlxuICAgIGlmIEBjdXJyZW50SW5wdXRCb3hUbXI/XG4gICAgICBjbGVhckludGVydmFsIEBjdXJyZW50SW5wdXRCb3hUbXJcbiAgICAgIEBjdXJyZW50SW5wdXRCb3hUbXIgPSBudWxsXG5cbiAgICBAY2xpT3V0cHV0LmZpbmQoJy5hdHAtZHluYW1pYy1pbnB1dC1ib3gnKS5yZW1vdmUoKVxuICAgIHByb21wdCA9IEBnZXRDb21tYW5kUHJvbXB0KCcnKVxuICAgIEBjdXJyZW50SW5wdXRCb3ggPSAkKFxuICAgICAgJzxkaXYgc3R5bGU9XCJ3aWR0aDogMTAwJTsgd2hpdGUtc3BhY2U6bm93cmFwOyBvdmVyZmxvdzpoaWRkZW47IGRpc3BsYXk6aW5saW5lLWJsb2NrO1wiIGNsYXNzPVwiYXRwLWR5bmFtaWMtaW5wdXQtYm94XCI+JyArXG4gICAgICAnPGRpdiBzdHlsZT1cInBvc2l0aW9uOnJlbGF0aXZlOyB0b3A6NXB4OyBtYXgtaGVpZ2h0OjUwMHB4OyB3aWR0aDogMTAwJTsgYm90dG9tOiAtMTBweDsgaGVpZ2h0OiAyMHB4OyB3aGl0ZS1zcGFjZTpub3dyYXA7IG92ZXJmbG93OmhpZGRlbjsgZGlzcGxheTppbmxpbmUtYmxvY2s7XCIgY2xhc3M9XCJ0ZXJtaW5hbC1pbnB1dCBuYXRpdmUta2V5LWJpbmRpbmdzXCI+PC9kaXY+JyArXG4gICAgICAnPC9kaXY+J1xuICAgIClcbiAgICBAY3VycmVudElucHV0Qm94LnByZXBlbmQgJyZuYnNwOyZuYnNwOydcbiAgICBAY3VycmVudElucHV0Qm94LnByZXBlbmQgcHJvbXB0XG5cbiAgICAjQGNsaU91dHB1dC5tb3VzZWRvd24gKGUpID0+XG4gICAgIyAgaWYgZS53aGljaCBpcyAxXG4gICAgIyAgICBAZm9jdXNJbnB1dEJveCgpXG5cbiAgICBoaXN0b3J5ID0gW11cbiAgICBpZiBAY3VycmVudElucHV0Qm94Q21wP1xuICAgICAgaGlzdG9yeSA9IEBjdXJyZW50SW5wdXRCb3hDbXAuZ2V0SW5wdXRIaXN0b3J5KClcbiAgICBpbnB1dENvbXAgPSBAY3VycmVudElucHV0Qm94LmZpbmQgJy50ZXJtaW5hbC1pbnB1dCdcblxuICAgIEBjdXJyZW50SW5wdXRCb3hDbXAgPSBpbnB1dENvbXAuYXV0b2NvbXBsZXRlIHtcbiAgICAgIGFuaW1hdGlvbjogW1xuICAgICAgICBbJ29wYWNpdHknLCAwLCAwLjhdXG4gICAgICBdXG4gICAgICBpc0Rpc2FibGVkOiB0cnVlXG4gICAgICBpbnB1dEhpc3Rvcnk6IGhpc3RvcnlcbiAgICAgIGlucHV0V2lkdGg6ICc4MCUnXG4gICAgICBkcm9wRG93bldpZHRoOiAnMzAlJ1xuICAgICAgZHJvcERvd25EZXNjcmlwdGlvbkJveFdpZHRoOiAnMzAlJ1xuICAgICAgZHJvcERvd25Qb3NpdGlvbjogJ3RvcCdcbiAgICAgIHNob3dEcm9wRG93bjogYXRvbS5jb25maWcuZ2V0ICdhdG9tLXRlcm1pbmFsLXBhbmVsLmVuYWJsZUNvbnNvbGVTdWdnZXN0aW9uc0Ryb3Bkb3duJ1xuICAgIH1cbiAgICBAY3VycmVudElucHV0Qm94Q21wXG4gICAgLmNvbmZpcm1lZCgoKSA9PlxuICAgICAgQGN1cnJlbnRJbnB1dEJveENtcC5kaXNhYmxlKCkucmVwYWludCgpXG4gICAgICBAb25Db21tYW5kKClcbiAgICApLmNoYW5nZWQoKGluc3QsIHRleHQpID0+XG4gICAgICBpZiBpbnN0LmdldFRleHQoKS5sZW5ndGggPD0gMFxuICAgICAgICBAY3VycmVudElucHV0Qm94Q21wLmRpc2FibGUoKS5yZXBhaW50KClcbiAgICAgICAgQGN1cnJlbnRJbnB1dEJveC5maW5kKCcudGVybWluYWwtaW5wdXQnKS5oZWlnaHQoJzIwcHgnKVxuICAgIClcblxuICAgIEBjdXJyZW50SW5wdXRCb3hDbXAuaW5wdXQua2V5ZG93bigoZSkgPT5cbiAgICAgIGlmIChlLmtleUNvZGUgPT0gMTcpIGFuZCAoQGN1cnJlbnRJbnB1dEJveENtcC5nZXRUZXh0KCkubGVuZ3RoID4gMClcbiAgICAgICAgIyMjXG4gICAgICAgIEBjdXJyZW50SW5wdXRCb3hDbXAuZW5hYmxlKCkucmVwYWludCgpXG4gICAgICAgIEBjdXJyZW50SW5wdXRCb3hDbXAuc2hvd0Ryb3BEb3duKClcbiAgICAgICAgQGN1cnJlbnRJbnB1dEJveC5maW5kKCcudGVybWluYWwtaW5wdXQnKS5oZWlnaHQoJzEwMHB4Jyk7XG4gICAgICAgICMjI1xuICAgICAgZWxzZSBpZiAoZS5rZXlDb2RlID09IDMyKSBvciAoZS5rZXlDb2RlID09IDgpXG4gICAgICAgIEBjdXJyZW50SW5wdXRCb3hDbXAuZGlzYWJsZSgpLnJlcGFpbnQoKVxuICAgICAgICBAY3VycmVudElucHV0Qm94LmZpbmQoJy50ZXJtaW5hbC1pbnB1dCcpLmhlaWdodCgnMjBweCcpXG4gICAgKVxuXG4gICAgZW5kc1dpdGggPSAodGV4dCwgc3VmZml4KSAtPlxuICAgICAgcmV0dXJuIHRleHQuaW5kZXhPZihzdWZmaXgsIHRleHQubGVuZ3RoIC0gc3VmZml4Lmxlbmd0aCkgIT0gLTFcblxuICAgIEBjdXJyZW50SW5wdXRCb3hDbXAub3B0aW9ucyA9IChpbnN0YW5jZSwgdGV4dCwgbGFzdFRva2VuKSA9PlxuICAgICAgdG9rZW4gPSBsYXN0VG9rZW5cbiAgICAgIGlmIG5vdCB0b2tlbj9cbiAgICAgICAgdG9rZW4gPSAnJ1xuXG4gICAgICBpZiBub3QgKGVuZHNXaXRoKHRva2VuLCAnLycpIG9yIGVuZHNXaXRoKHRva2VuLCAnXFxcXCcpKVxuICAgICAgICB0b2tlbiA9IEB1dGlsLnJlcGxhY2VBbGwgJ1xcXFwnLCBzZXAsIHRva2VuXG4gICAgICAgIHRva2VuID0gdG9rZW4uc3BsaXQgc2VwXG4gICAgICAgIHRva2VuLnBvcCgpXG4gICAgICAgIHRva2VuID0gdG9rZW4uam9pbihzZXApXG4gICAgICAgIGlmIG5vdCBlbmRzV2l0aCh0b2tlbiwgc2VwKVxuICAgICAgICAgIHRva2VuID0gdG9rZW4gKyBzZXBcblxuICAgICAgbyA9IEBnZXRDb21tYW5kc05hbWVzKCkuY29uY2F0KEB2b2xhdGlsZVN1Z2dlc3Rpb25zKVxuICAgICAgZnNTdGF0ID0gW11cbiAgICAgIGlmIHRva2VuP1xuICAgICAgICB0cnlcbiAgICAgICAgICBmc1N0YXQgPSBmcy5yZWFkZGlyU3luYyh0b2tlbilcbiAgICAgICAgICBmb3IgaSBpbiBbMC4uZnNTdGF0Lmxlbmd0aC0xXSBieSAxXG4gICAgICAgICAgICBmc1N0YXRbaV0gPSB0b2tlbiArIGZzU3RhdFtpXVxuICAgICAgICBjYXRjaCBlXG4gICAgICByZXQgPSBvLmNvbmNhdChmc1N0YXQpXG4gICAgICByZXR1cm4gcmV0XG5cbiAgICBAY3VycmVudElucHV0Qm94Q21wLmhpZGVEcm9wRG93bigpXG4gICAgc2V0VGltZW91dCAoKSA9PlxuICAgXHQgQGN1cnJlbnRJbnB1dEJveENtcC5pbnB1dC5mb2N1cygpXG4gICAgLCAwXG5cbiAgICBAY3VycmVudElucHV0Qm94LmFwcGVuZFRvIEBjbGlPdXRwdXRcbiAgICBAZm9jdXNJbnB1dEJveCgpXG5cbiAgcmVhZElucHV0Qm94OiAoKSAtPlxuICAgIHJldCA9ICcnXG4gICAgaWYgQGN1cnJlbnRJbnB1dEJveENtcD9cbiAgICAgICMgcmV0ID0gQGN1cnJlbnRJbnB1dEJveC5maW5kKCcudGVybWluYWwtaW5wdXQnKS52YWwoKVxuICAgICAgcmV0ID0gQGN1cnJlbnRJbnB1dEJveENtcC5nZXRUZXh0KClcbiAgICByZXR1cm4gcmV0XG5cbiAgcmVxdWlyZUNTUzogKGxvY2F0aW9uKSAtPlxuICAgIGlmIG5vdCBsb2NhdGlvbj9cbiAgICAgIHJldHVyblxuICAgIGxvY2F0aW9uID0gcmVzb2x2ZSBsb2NhdGlvblxuICAgIGNvbnNvbGUubG9nIChcIlJlcXVpcmUgYXRvbS10ZXJtaW5hbC1wYW5lbCBwbHVnaW4gQ1NTIGZpbGU6IFwiK2xvY2F0aW9uK1wiXFxuXCIpIGlmIGF0b20uY29uZmlnLmdldCgnYXRvbS10ZXJtaW5hbC1wYW5lbC5sb2dDb25zb2xlJykgb3IgQHNwZWNzTW9kZVxuICAgICQoJ2hlYWQnKS5hcHBlbmQgXCI8bGluayByZWw9J3N0eWxlc2hlZXQnIHR5cGU9J3RleHQvY3NzJyBocmVmPScje2xvY2F0aW9ufScvPlwiXG5cbiAgcmVzb2x2ZVBsdWdpbkRlcGVuZGVuY2llczogKHBhdGgsIHBsdWdpbikgLT5cbiAgICBjb25maWcgPSBwbHVnaW4uZGVwZW5kZW5jaWVzXG4gICAgaWYgbm90IGNvbmZpZz9cbiAgICAgIHJldHVyblxuXG4gICAgY3NzX2RlcGVuZGVuY2llcyA9IGNvbmZpZy5jc3NcbiAgICBpZiBub3QgY3NzX2RlcGVuZGVuY2llcz9cbiAgICAgIGNzc19kZXBlbmRlbmNpZXMgPSBbXVxuICAgIGZvciBjc3NfZGVwZW5kZW5jeSBpbiBjc3NfZGVwZW5kZW5jaWVzXG4gICAgICBAcmVxdWlyZUNTUyBwYXRoK1wiL1wiK2Nzc19kZXBlbmRlbmN5XG5cbiAgICBkZWxldGUgcGx1Z2luWydkZXBlbmRlbmNpZXMnXVxuXG5cbiAgaW5pdDogKCkgLT5cblxuXG4gICAgIyMjXG4gICAgVE9ETzogdGVzdC1hdXRvY29tcGxldGUgUmVtb3ZlIHRoaXMhXG4gICAgZWwgPSAkKCc8ZGl2IHN0eWxlPVwiei1pbmRleDogOTk5OTsgcG9zaXRpb246IGFic29sdXRlOyBsZWZ0OiAyMDBweDsgdG9wOiAyMDBweDtcIiBpZD1cImdsb3Rlc3RcIj48L2Rpdj4nKVxuICAgIGVsLmF1dG9jb21wbGV0ZSh7XG4gICAgICBpbnB1dFdpZHRoOiAnODAlJ1xuICAgIH0pXG4gICAgJCgnYm9keScpLmFwcGVuZChlbClcbiAgICAjIyNcblxuXG4gICAgbGFzdFkgPSAtMVxuICAgIG1vdXNlRG93biA9IGZhbHNlXG4gICAgcGFuZWxEcmFnZ2luZ0FjdGl2ZSA9IGZhbHNlXG4gICAgQHBhbmVsRGl2aWRlclxuICAgIC5tb3VzZWRvd24gKCkgPT4gcGFuZWxEcmFnZ2luZ0FjdGl2ZSA9IHRydWVcbiAgICAubW91c2V1cCAoKSA9PiBwYW5lbERyYWdnaW5nQWN0aXZlID0gZmFsc2VcbiAgICAkKGRvY3VtZW50KVxuICAgIC5tb3VzZWRvd24gKCkgPT4gbW91c2VEb3duID0gdHJ1ZVxuICAgIC5tb3VzZXVwICgpID0+IG1vdXNlRG93biA9IGZhbHNlXG4gICAgLm1vdXNlbW92ZSAoZSkgPT5cbiAgICAgIGlmIG1vdXNlRG93biBhbmQgcGFuZWxEcmFnZ2luZ0FjdGl2ZVxuICAgICAgICBpZiBsYXN0WSAhPSAtMVxuICAgICAgICAgIGRlbHRhID0gZS5wYWdlWSAtIGxhc3RZXG4gICAgICAgICAgQGNsaU91dHB1dC5oZWlnaHQgQGNsaU91dHB1dC5oZWlnaHQoKS1kZWx0YVxuICAgICAgICBsYXN0WSA9IGUucGFnZVlcbiAgICAgIGVsc2VcbiAgICAgICAgbGFzdFkgPSAtMVxuXG4gICAgbm9ybWFsaXplZFBhdGggPSByZXF1aXJlKFwicGF0aFwiKS5qb2luKF9fZGlybmFtZSwgXCIuLi9jb21tYW5kc1wiKVxuICAgIGNvbnNvbGUubG9nIChcIkxvYWRpbmcgYXRvbS10ZXJtaW5hbC1wYW5lbCBwbHVnaW5zIGZyb20gdGhlIGRpcmVjdG9yeTogXCIrbm9ybWFsaXplZFBhdGgrXCJcXG5cIikgaWYgYXRvbS5jb25maWcuZ2V0KCdhdG9tLXRlcm1pbmFsLXBhbmVsLmxvZ0NvbnNvbGUnKSBvciBAc3BlY3NNb2RlXG4gICAgZnMucmVhZGRpclN5bmMobm9ybWFsaXplZFBhdGgpLmZvckVhY2goIChmb2xkZXIpID0+XG4gICAgICBmdWxscGF0aCA9IHJlc29sdmUgXCIuLi9jb21tYW5kcy9cIiArZm9sZGVyXG4gICAgICBjb25zb2xlLmxvZyAoXCJSZXF1aXJlIGF0b20tdGVybWluYWwtcGFuZWwgcGx1Z2luOiBcIitmb2xkZXIrXCJcXG5cIikgaWYgYXRvbS5jb25maWcuZ2V0KCdhdG9tLXRlcm1pbmFsLXBhbmVsLmxvZ0NvbnNvbGUnKSBvciBAc3BlY3NNb2RlXG4gICAgICBvYmogPSByZXF1aXJlIChcIi4uL2NvbW1hbmRzL1wiICtmb2xkZXIrXCIvaW5kZXguY29mZmVlXCIpXG4gICAgICBjb25zb2xlLmxvZyBcIlBsdWdpbiBsb2FkZWQuXCIgaWYgYXRvbS5jb25maWcuZ2V0KCdhdG9tLXRlcm1pbmFsLXBhbmVsLmxvZ0NvbnNvbGUnKVxuICAgICAgQHJlc29sdmVQbHVnaW5EZXBlbmRlbmNpZXMgZnVsbHBhdGgsIG9ialxuICAgICAgZm9yIGtleSwgdmFsdWUgb2Ygb2JqXG4gICAgICAgIGlmIHZhbHVlLmNvbW1hbmQ/XG4gICAgICAgICAgQGxvY2FsQ29tbWFuZHNba2V5XSA9IHZhbHVlXG4gICAgICAgICAgQGxvY2FsQ29tbWFuZHNba2V5XS5zb3VyY2UgPSAnZXh0ZXJuYWwtZnVuY3Rpb25hbCdcbiAgICAgICAgICBAbG9jYWxDb21tYW5kc1trZXldLnNvdXJjZWZpbGUgPSBmb2xkZXJcbiAgICAgICAgZWxzZSBpZiB2YWx1ZS52YXJpYWJsZT9cbiAgICAgICAgICB2YWx1ZS5uYW1lID0ga2V5XG4gICAgICAgICAgQVRQVmFyaWFibGVzQnVpbHRpbnMucHV0VmFyaWFibGUgdmFsdWVcbiAgICApXG4gICAgY29uc29sZS5sb2cgKFwiQWxsIHBsdWdpbnMgd2VyZSBsb2FkZWQuXCIpIGlmIGF0b20uY29uZmlnLmdldCgnYXRvbS10ZXJtaW5hbC1wYW5lbC5sb2dDb25zb2xlJylcblxuICAgIGlmIEFUUENvcmUuZ2V0Q29uZmlnKCk/XG4gICAgICBhY3Rpb25zID0gQVRQQ29yZS5nZXRDb25maWcoKS5hY3Rpb25zXG4gICAgICBpZiBhY3Rpb25zP1xuICAgICAgICBmb3IgYWN0aW9uIGluIGFjdGlvbnNcbiAgICAgICAgICBpZiBhY3Rpb24ubGVuZ3RoID4gMVxuICAgICAgICAgICAgb2JqID0ge31cbiAgICAgICAgICAgIG9ialsnYXRvbS10ZXJtaW5hbC1wYW5lbDonK2FjdGlvblswXV0gPSAoKSA9PlxuICAgICAgICAgICAgICBAb3BlbigpXG4gICAgICAgICAgICAgIEBvbkNvbW1hbmQgYWN0aW9uWzFdXG4gICAgICAgICAgICBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS13b3Jrc3BhY2UnLCBvYmpcblxuICAgIGlmIGF0b20ud29ya3NwYWNlP1xuICAgICAgZWxlcXIgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lSXRlbSgpID8gYXRvbS53b3Jrc3BhY2VcbiAgICAgIGVsZXFyID0gYXRvbS52aWV3cy5nZXRWaWV3KGVsZXFyKVxuICAgICAgYXRvbUNvbW1hbmRzID0gYXRvbS5jb21tYW5kcy5maW5kQ29tbWFuZHMoe3RhcmdldDogZWxlcXJ9KVxuICAgICAgZm9yIGNvbW1hbmQgaW4gYXRvbUNvbW1hbmRzXG4gICAgICAgIGNvbU5hbWUgPSBjb21tYW5kLm5hbWVcbiAgICAgICAgY29tID0ge31cbiAgICAgICAgY29tLmRlc2NyaXB0aW9uID0gY29tbWFuZC5kaXNwbGF5TmFtZVxuICAgICAgICBjb20uY29tbWFuZCA9XG4gICAgICAgICAgKChjb21OYW1lUCkgLT5cbiAgICAgICAgICAgIHJldHVybiAoc3RhdGUsIGFyZ3MpIC0+XG4gICAgICAgICAgICAgIGVsZSA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmVJdGVtKCkgPyBhdG9tLndvcmtzcGFjZVxuICAgICAgICAgICAgICBlbGUgPSBhdG9tLnZpZXdzLmdldFZpZXcoZWxlKVxuICAgICAgICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoIGVsZSwgY29tTmFtZVBcbiAgICAgICAgICAgICAgcmV0dXJuIChzdGF0ZS5jb25zb2xlTGFiZWwgJ2luZm8nLCBcImluZm9cIikgKyAoc3RhdGUuY29uc29sZVRleHQgJ2luZm8nLCAnQXRvbSBjb21tYW5kIGV4ZWN1dGVkOiAnK2NvbU5hbWVQKVxuICAgICAgICAgICkoY29tTmFtZSlcbiAgICAgICAgY29tLnNvdXJjZSA9IFwiaW50ZXJuYWwtYXRvbVwiXG4gICAgICAgIEBsb2NhbENvbW1hbmRzW2NvbU5hbWVdID0gY29tXG5cbiAgICB0b29sYmFyID0gQVRQQ29yZS5nZXRDb25maWcoKS50b29sYmFyXG4gICAgaWYgdG9vbGJhcj9cbiAgICAgIHRvb2xiYXIucmV2ZXJzZSgpXG4gICAgICBmb3IgY29tIGluIHRvb2xiYXJcbiAgICAgICAgYnQgPSAkKFwiPGRpdiBjbGFzcz1cXFwiYnRuXFxcIiBkYXRhLWFjdGlvbj1cXFwiI3tjb21bMV19XFxcIiA+PHNwYW4+I3tjb21bMF19PC9zcGFuPjwvZGl2PlwiKVxuICAgICAgICBpZiBjb21bMl0/XG4gICAgICAgICAgYXRvbS50b29sdGlwcy5hZGQgYnQsXG4gICAgICAgICAgICB0aXRsZTogY29tWzJdXG4gICAgICAgIEBjb25zb2xlVG9vbGJhci5wcmVwZW5kIGJ0XG4gICAgICAgIGNhbGxlciA9IHRoaXNcbiAgICAgICAgYnQuY2xpY2sgKCkgLT5cbiAgICAgICAgICBjYWxsZXIub25Db21tYW5kICQodGhpcykuZGF0YSgnYWN0aW9uJylcblxuICAgIHJldHVybiB0aGlzXG5cbiAgY29tbWFuZExpbmVOb3RDb3VudGVkOiAoKSAtPlxuICAgIEBpbnB1dExpbmUtLVxuXG4gIHBhcnNlU3BlY2lhbFN0cmluZ1RlbXBsYXRlOiAocHJvbXB0LCB2YWx1ZXMsIGlzRE9NPWZhbHNlKSA9PlxuICAgIGlmIGlzRE9NXG4gICAgICByZXR1cm4gQVRQVmFyaWFibGVzQnVpbHRpbnMucGFyc2VIdG1sKHRoaXMsIHByb21wdCwgdmFsdWVzKVxuICAgIGVsc2VcbiAgICAgIHJldHVybiBBVFBWYXJpYWJsZXNCdWlsdGlucy5wYXJzZSh0aGlzLCBwcm9tcHQsIHZhbHVlcylcblxuICBnZXRDb21tYW5kUHJvbXB0OiAoY21kKSAtPlxuICAgIHJldHVybiBAcGFyc2VUZW1wbGF0ZSBhdG9tLmNvbmZpZy5nZXQoJ2F0b20tdGVybWluYWwtcGFuZWwuY29tbWFuZFByb21wdCcpLCB7Y21kOiBjbWR9LCB0cnVlXG5cbiAgZGVsYXk6IChjYWxsYmFjaywgZGVsYXk9MTAwKSAtPlxuICAgIHNldFRpbWVvdXQgY2FsbGJhY2ssIGRlbGF5XG5cbiAgZXhlY0RlbGF5ZWRDb21tYW5kOiAoZGVsYXksIGNtZCwgYXJncywgc3RhdGUpIC0+XG4gICAgY2FsbGVyID0gdGhpc1xuICAgIGNhbGxiYWNrID0gLT5cbiAgICAgIGNhbGxlci5leGVjIGNtZCwgYXJncywgc3RhdGVcbiAgICBzZXRUaW1lb3V0IGNhbGxiYWNrLCBkZWxheVxuXG4gIG1vdmVUb0N1cnJlbnREaXJlY3Rvcnk6ICgpLT5cbiAgICBDVVJSRU5UX0xPQ0FUSU9OID0gQGdldEN1cnJlbnRGaWxlTG9jYXRpb24oKVxuICAgIGlmIENVUlJFTlRfTE9DQVRJT04/XG4gICAgICBAY2QgW0NVUlJFTlRfTE9DQVRJT05dXG5cbiAgZ2V0Q3VycmVudEZpbGVOYW1lOiAoKS0+XG4gICAgY3VycmVudF9maWxlID0gQGdldEN1cnJlbnRGaWxlUGF0aCgpXG4gICAgaWYgY3VycmVudF9maWxlICE9IG51bGxcbiAgICAgIG1hdGNoZXIgPSAvKC4qOikoKC4qKVxcXFwpKi9pZ1xuICAgICAgcmV0dXJuIGN1cnJlbnRfZmlsZS5yZXBsYWNlIG1hdGNoZXIsIFwiXCJcbiAgICByZXR1cm4gbnVsbFxuXG4gIGdldEN1cnJlbnRGaWxlTG9jYXRpb246ICgpLT5cbiAgICBpZiBAZ2V0Q3VycmVudEZpbGVQYXRoKCkgPT0gbnVsbFxuICAgICAgcmV0dXJuIG51bGxcbiAgICByZXR1cm4gIEB1dGlsLnJlcGxhY2VBbGwoQGdldEN1cnJlbnRGaWxlTmFtZSgpLCBcIlwiLCBAZ2V0Q3VycmVudEZpbGVQYXRoKCkpXG5cbiAgZ2V0Q3VycmVudEZpbGVQYXRoOiAoKS0+XG4gICAgaWYgbm90IGF0b20ud29ya3NwYWNlP1xuICAgICAgcmV0dXJuIG51bGxcbiAgICB0ZSA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgIGlmIHRlP1xuICAgICAgaWYgdGUuZ2V0UGF0aCgpP1xuICAgICAgICByZXR1cm4gdGUuZ2V0UGF0aCgpXG4gICAgcmV0dXJuIG51bGxcblxuXG4gIHBhcnNlVGVtcGxhdGU6ICh0ZXh0LCB2YXJzLCBpc0RPTT1mYWxzZSkgLT5cbiAgICBpZiBub3QgdmFycz9cbiAgICAgIHZhcnMgPSB7fVxuICAgIHJldCA9ICcnXG4gICAgaWYgaXNET01cbiAgICAgIHJldCA9IEFUUFZhcmlhYmxlc0J1aWx0aW5zLnBhcnNlSHRtbCB0aGlzLCB0ZXh0LCB2YXJzXG4gICAgZWxzZVxuICAgICAgcmV0ID0gQHBhcnNlU3BlY2lhbFN0cmluZ1RlbXBsYXRlIHRleHQsIHZhcnNcbiAgICAgIHJldCA9IEB1dGlsLnJlcGxhY2VBbGwgJyUoZmlsZS1vcmlnaW5hbCknLCBAZ2V0Q3VycmVudEZpbGVQYXRoKCksIHJldFxuICAgICAgcmV0ID0gQHV0aWwucmVwbGFjZUFsbCAnJShjd2Qtb3JpZ2luYWwpJywgQGdldEN3ZCgpLCByZXRcbiAgICAgIHJldCA9IEB1dGlsLnJlcGxhY2VBbGwgJyZmczsnLCAnLycsIHJldFxuICAgICAgcmV0ID0gQHV0aWwucmVwbGFjZUFsbCAnJmJzOycsICdcXFxcJywgcmV0XG4gICAgcmV0dXJuIHJldFxuXG4gIHBhcnNlRXhlY1Rva2VuX186IChjbWQsIGFyZ3MsIHN0ckFyZ3MpIC0+XG4gICAgaWYgc3RyQXJncz9cbiAgICAgIGNtZCA9IEB1dGlsLnJlcGxhY2VBbGwgXCIlKCopXCIsIHN0ckFyZ3MsIGNtZFxuICAgIGNtZCA9IEB1dGlsLnJlcGxhY2VBbGwgXCIlKCpeKVwiLCAoQHV0aWwucmVwbGFjZUFsbCBcIiUoKl4pXCIsIFwiXCIsIGNtZCksIGNtZFxuICAgIGlmIGFyZ3M/XG4gICAgICBhcmdzTnVtID0gYXJncy5sZW5ndGhcbiAgICAgIGZvciBpIGluIFswLi5hcmdzTnVtXSBieSAxXG4gICAgICAgIGlmIGFyZ3NbaV0/XG4gICAgICAgICAgdiA9IGFyZ3NbaV0ucmVwbGFjZSAvXFxuL2lnLCAnJ1xuICAgICAgICAgIGNtZCA9IEB1dGlsLnJlcGxhY2VBbGwgXCIlKCN7aX0pXCIsIGFyZ3NbaV0sIGNtZFxuICAgIGNtZCA9IEBwYXJzZVRlbXBsYXRlIGNtZCwge2ZpbGU6QGdldEN1cnJlbnRGaWxlUGF0aCgpfVxuICAgIHJldHVybiBjbWRcblxuICBleGVjU3RhY2tDb3VudGVyOiAwXG4gIGV4ZWM6IChjbWRTdHIsIHJlZl9hcmdzLCBzdGF0ZSwgY2FsbGJhY2spIC0+XG4gICAgaWYgbm90IHN0YXRlP1xuICAgICAgc3RhdGUgPSB0aGlzXG4gICAgaWYgbm90IHJlZl9hcmdzP1xuICAgICAgcmVmX2FyZ3MgPSB7fVxuICAgIGlmIGNtZFN0ci5zcGxpdD9cbiAgICAgIGNtZFN0ckMgPSBjbWRTdHIuc3BsaXQgJzs7J1xuICAgICAgaWYgY21kU3RyQy5sZW5ndGggPiAxXG4gICAgICAgIGNtZFN0ciA9IGNtZFN0ckNcbiAgICBAZXhlY1N0YWNrQ291bnRlciA9IDBcbiAgICByZXR1cm4gQGV4ZWNfIGNtZFN0ciwgcmVmX2FyZ3MsIHN0YXRlLCBjYWxsYmFja1xuXG4gIGV4ZWNfOiAoY21kU3RyLCByZWZfYXJncywgc3RhdGUsIGNhbGxiYWNrKSAtPlxuICAgIGlmIG5vdCBjYWxsYmFjaz9cbiAgICAgIGNhbGxiYWNrID0gKCkgLT4gcmV0dXJuIG51bGxcbiAgICArK0BleGVjU3RhY2tDb3VudGVyXG4gICAgaWYgY21kU3RyIGluc3RhbmNlb2YgQXJyYXlcbiAgICAgIHJldCA9ICcnXG4gICAgICBmb3IgY29tIGluIGNtZFN0clxuICAgICAgICB2YWwgPSBAZXhlYyBjb20sIHJlZl9hcmdzLCBzdGF0ZVxuICAgICAgICBpZiB2YWw/XG4gICAgICAgICAgcmV0ICs9IHZhbFxuICAgICAgLS1AZXhlY1N0YWNrQ291bnRlclxuICAgICAgaWYgQGV4ZWNTdGFja0NvdW50ZXI9PTBcbiAgICAgICAgY2FsbGJhY2soKVxuICAgICAgaWYgbm90IHJldD9cbiAgICAgICAgcmV0dXJuIG51bGxcbiAgICAgIHJldHVybiByZXRcbiAgICBlbHNlXG4gICAgICBjbWRTdHIgPSBAdXRpbC5yZXBsYWNlQWxsIFwiXFxcXFxcXCJcIiwgJyZocXVvdDsnLCBjbWRTdHJcbiAgICAgIGNtZFN0ciA9IEB1dGlsLnJlcGxhY2VBbGwgXCImYnM7XFxcIlwiLCAnJmhxdW90OycsIGNtZFN0clxuICAgICAgY21kU3RyID0gQHV0aWwucmVwbGFjZUFsbCBcIlxcXFxcXCdcIiwgJyZscXVvdDsnLCBjbWRTdHJcbiAgICAgIGNtZFN0ciA9IEB1dGlsLnJlcGxhY2VBbGwgXCImYnM7XFwnXCIsICcmbHF1b3Q7JywgY21kU3RyXG5cbiAgICAgIHJlZl9hcmdzX3N0ciA9IG51bGxcbiAgICAgIGlmIHJlZl9hcmdzP1xuICAgICAgICBpZiByZWZfYXJncy5qb2luP1xuICAgICAgICAgIHJlZl9hcmdzX3N0ciA9IHJlZl9hcmdzLmpvaW4oJyAnKVxuICAgICAgY21kU3RyID0gQHBhcnNlRXhlY1Rva2VuX18gY21kU3RyLCByZWZfYXJncywgcmVmX2FyZ3Nfc3RyXG5cbiAgICAgIGFyZ3MgPSBbXVxuICAgICAgY21kID0gY21kU3RyXG4gICAgICBjbWQucmVwbGFjZSAvKFwiW15cIl0qXCJ8J1teJ10qJ3xbXlxccydcIl0rKS9nLCAocykgPT5cbiAgICAgICAgaWYgc1swXSAhPSAnXCInIGFuZCBzWzBdICE9IFwiJ1wiXG4gICAgICAgICAgcyA9IHMucmVwbGFjZSAvfi9nLCBAdXNlckhvbWVcbiAgICAgICAgcyA9IEB1dGlsLnJlcGxhY2VBbGwgJyZocXVvdDsnLCAnXCInLCBzXG4gICAgICAgIHMgPSBAdXRpbC5yZXBsYWNlQWxsICcmbHF1b3Q7JywgJ1xcJycsIHNcbiAgICAgICAgYXJncy5wdXNoIHNcbiAgICAgIGFyZ3MgPSBAdXRpbC5kaXIgYXJncywgQGdldEN3ZCgpXG4gICAgICBjbWQgPSBhcmdzLnNoaWZ0KClcblxuICAgICAgY29tbWFuZCA9IG51bGxcbiAgICAgIGlmIEBpc0NvbW1hbmRFbmFibGVkKGNtZClcbiAgICAgICAgY29tbWFuZCA9IEFUUENvcmUuZmluZFVzZXJDb21tYW5kKGNtZClcbiAgICAgIGlmIGNvbW1hbmQ/XG4gICAgICAgIGlmIG5vdCBzdGF0ZT9cbiAgICAgICAgICByZXQgPSBudWxsXG4gICAgICAgICAgdGhyb3cgJ1RoZSBjb25zb2xlIGZ1bmN0aW9uYWwgKG5vdCBuYXRpdmUpIGNvbW1hbmQgY2Fubm90IGJlIGV4ZWN1dGVkIHdpdGhvdXQgY2FsbGVyIGluZm9ybWF0aW9uOiBcXCcnK2NtZCsnXFwnLidcbiAgICAgICAgaWYgY29tbWFuZD9cbiAgICAgICAgICB0cnlcbiAgICAgICAgICAgIHJldCA9IGNvbW1hbmQoc3RhdGUsIGFyZ3MpXG4gICAgICAgICAgY2F0Y2ggZVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yIFwiRXJyb3IgYXQgZXhlY3V0aW5nIHRlcm1pbmFsIGNvbW1hbmQ6ICcje2NtZH0nICgnI3tjbWRTdHJ9Jyk6ICN7ZS5tZXNzYWdlfVwiXG4gICAgICAgIC0tQGV4ZWNTdGFja0NvdW50ZXJcbiAgICAgICAgaWYgQGV4ZWNTdGFja0NvdW50ZXI9PTBcbiAgICAgICAgICBjYWxsYmFjaygpXG4gICAgICAgIGlmIG5vdCByZXQ/XG4gICAgICAgICAgcmV0dXJuIG51bGxcbiAgICAgICAgcmV0dXJuIHJldFxuICAgICAgZWxzZVxuICAgICAgICBpZiBhdG9tLmNvbmZpZy5nZXQoJ2F0b20tdGVybWluYWwtcGFuZWwuZW5hYmxlRXh0ZW5kZWRDb21tYW5kcycpIG9yIEBzcGVjc01vZGVcbiAgICAgICAgICBpZiBAaXNDb21tYW5kRW5hYmxlZChjbWQpXG4gICAgICAgICAgICBjb21tYW5kID0gQGdldExvY2FsQ29tbWFuZChjbWQpXG4gICAgICAgIGlmIGNvbW1hbmQ/XG4gICAgICAgICAgcmV0ID0gY29tbWFuZChzdGF0ZSwgYXJncylcbiAgICAgICAgICAtLUBleGVjU3RhY2tDb3VudGVyXG4gICAgICAgICAgaWYgQGV4ZWNTdGFja0NvdW50ZXI9PTBcbiAgICAgICAgICAgIGNhbGxiYWNrKClcbiAgICAgICAgICBpZiBub3QgcmV0P1xuICAgICAgICAgICAgcmV0dXJuIG51bGxcbiAgICAgICAgICByZXR1cm4gcmV0XG4gICAgICAgIGVsc2VcbiAgICAgICAgICBjbWRTdHIgPSBAdXRpbC5yZXBsYWNlQWxsICcmaHF1b3Q7JywgJ1wiJywgY21kU3RyXG4gICAgICAgICAgY21kID0gQHV0aWwucmVwbGFjZUFsbCAnJmhxdW90OycsICdcIicsIGNtZFxuICAgICAgICAgIGNtZFN0ciA9IEB1dGlsLnJlcGxhY2VBbGwgJyZscXVvdDsnLCAnXFwnJywgY21kU3RyXG4gICAgICAgICAgY21kID0gQHV0aWwucmVwbGFjZUFsbCAnJmxxdW90OycsICdcXCcnLCBjbWRcbiAgICAgICAgICBAc3Bhd24gY21kU3RyLCBjbWQsIGFyZ3NcbiAgICAgICAgICAtLUBleGVjU3RhY2tDb3VudGVyXG4gICAgICAgICAgaWYgQGV4ZWNTdGFja0NvdW50ZXI9PTBcbiAgICAgICAgICAgIGNhbGxiYWNrKClcbiAgICAgICAgICBpZiBub3QgY21kP1xuICAgICAgICAgICAgcmV0dXJuIG51bGxcbiAgICAgICAgICByZXR1cm4gbnVsbFxuXG4gIGlzQ29tbWFuZEVuYWJsZWQ6IChuYW1lKSAtPlxuICAgIGRpc2FibGVkQ29tbWFuZHMgPSBhdG9tLmNvbmZpZy5nZXQoJ2F0b20tdGVybWluYWwtcGFuZWwuZGlzYWJsZWRFeHRlbmRlZENvbW1hbmRzJykgb3IgQHNwZWNzTW9kZVxuICAgIGlmIG5vdCBkaXNhYmxlZENvbW1hbmRzP1xuICAgICAgcmV0dXJuIHRydWVcbiAgICBpZiBuYW1lIGluIGRpc2FibGVkQ29tbWFuZHNcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIHJldHVybiB0cnVlXG5cbiAgZ2V0TG9jYWxDb21tYW5kOiAobmFtZSkgLT5cbiAgICBmb3IgY21kX25hbWUsIGNtZF9ib2R5IG9mIEBsb2NhbENvbW1hbmRzXG4gICAgICBpZiBjbWRfbmFtZSA9PSBuYW1lXG4gICAgICAgIGlmIGNtZF9ib2R5LmNvbW1hbmQ/XG4gICAgICAgICAgcmV0dXJuIGNtZF9ib2R5LmNvbW1hbmRcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHJldHVybiBjbWRfYm9keVxuICAgIHJldHVybiBudWxsXG5cbiAgZ2V0Q29tbWFuZHNSZWdpc3RyeTogKCkgLT5cbiAgICBnbG9iYWxfdmFycyA9IEFUUFZhcmlhYmxlc0J1aWx0aW5zLmxpc3RcblxuICAgIGZvciBrZXksIHZhbHVlIG9mIHByb2Nlc3MuZW52XG4gICAgICBnbG9iYWxfdmFyc1snJShlbnYuJytrZXkrJyknXSA9IFwiYWNjZXNzIG5hdGl2ZSBlbnZpcm9ubWVudCB2YXJpYWJsZTogXCIra2V5XG5cbiAgICBjbWQgPSBbXVxuICAgIGZvciBjbWRfbmFtZSwgY21kX2JvZHkgb2YgQGxvY2FsQ29tbWFuZHNcbiAgICAgIGNtZC5wdXNoIHtcbiAgICAgICAgbmFtZTogY21kX25hbWVcbiAgICAgICAgZGVzY3JpcHRpb246IGNtZF9ib2R5LmRlc2NyaXB0aW9uXG4gICAgICAgIGV4YW1wbGU6IGNtZF9ib2R5LmV4YW1wbGVcbiAgICAgICAgcGFyYW1zOiBjbWRfYm9keS5wYXJhbXNcbiAgICAgICAgZGVwcmVjYXRlZDogY21kX2JvZHkuZGVwcmVjYXRlZFxuICAgICAgICBzb3VyY2VmaWxlOiBjbWRfYm9keS5zb3VyY2VmaWxlXG4gICAgICAgIHNvdXJjZTogY21kX2JvZHkuc291cmNlIG9yICdpbnRlcm5hbCdcbiAgICAgIH1cbiAgICBmb3IgY21kX25hbWUsIGNtZF9ib2R5IG9mIEFUUENvcmUuZ2V0VXNlckNvbW1hbmRzKClcbiAgICAgIGNtZC5wdXNoIHtcbiAgICAgICAgbmFtZTogY21kX25hbWVcbiAgICAgICAgZGVzY3JpcHRpb246IGNtZF9ib2R5LmRlc2NyaXB0aW9uXG4gICAgICAgIGV4YW1wbGU6IGNtZF9ib2R5LmV4YW1wbGVcbiAgICAgICAgcGFyYW1zOiBjbWRfYm9keS5wYXJhbXNcbiAgICAgICAgZGVwcmVjYXRlZDogY21kX2JvZHkuZGVwcmVjYXRlZFxuICAgICAgICBzb3VyY2VmaWxlOiBjbWRfYm9keS5zb3VyY2VmaWxlXG4gICAgICAgIHNvdXJjZTogJ2V4dGVybmFsJ1xuICAgICAgfVxuICAgIGZvciB2YXJfbmFtZSwgZGVzY3Igb2YgZ2xvYmFsX3ZhcnNcbiAgICAgIGNtZC5wdXNoIHtcbiAgICAgICAgbmFtZTogdmFyX25hbWVcbiAgICAgICAgZGVzY3JpcHRpb246IGRlc2NyXG4gICAgICAgIHNvdXJjZTogJ2dsb2JhbC12YXJpYWJsZSdcbiAgICAgIH1cblxuICAgIGNtZF8gPSBbXVxuICAgIGNtZF9sZW4gPSBjbWQubGVuZ3RoXG4gICAgY21kX2ZvcmJkID0gKGF0b20uY29uZmlnLmdldCAnYXRvbS10ZXJtaW5hbC1wYW5lbC5kaXNhYmxlZEV4dGVuZGVkQ29tbWFuZHMnKSBvciBbXVxuICAgIGZvciBjbWRfaXRlbSBpbiBjbWRcbiAgICAgIGlmIGNtZF9pdGVtLm5hbWUgaW4gY21kX2ZvcmJkXG4gICAgICBlbHNlXG4gICAgICAgIGNtZF8ucHVzaCBjbWRfaXRlbVxuXG4gICAgcmV0dXJuIGNtZF9cblxuICBnZXRDb21tYW5kc05hbWVzOiAoKSAtPlxuICAgIGNtZHMgPSBAZ2V0Q29tbWFuZHNSZWdpc3RyeSgpXG4gICAgY21kX25hbWVzID0gW11cbiAgICBmb3IgaXRlbSBpbiBjbWRzXG4gICAgICBkZXNjciA9IFwiXCJcbiAgICAgIGV4YW1wbGUgPSBcIlwiXG4gICAgICBwYXJhbXMgPSBcIlwiXG4gICAgICBzb3VyY2VmaWxlID0gXCJcIlxuICAgICAgZGVwcmVjYXRlZCA9IGZhbHNlXG4gICAgICBuYW1lID0gaXRlbS5uYW1lXG4gICAgICBpZiBpdGVtLnNvdXJjZWZpbGU/XG4gICAgICAgIHNvdXJjZWZpbGUgPSBcIjxkaXYgc3R5bGU9J2Zsb2F0OmJvdHRvbSc+PGIgc3R5bGU9J2Zsb2F0OnJpZ2h0Jz5QbHVnaW4gI3tpdGVtLnNvdXJjZWZpbGV9Jm5ic3A7Jm5ic3A7Jm5ic3A7PGI+PC9kaXY+XCJcbiAgICAgIGlmIGl0ZW0uZXhhbXBsZT9cbiAgICAgICAgZXhhbXBsZSA9IFwiPGJyPjxiPjx1PkV4YW1wbGU6PC91PjwvYj48YnI+PGNvZGU+XCIraXRlbS5leGFtcGxlK1wiPC9jb2RlPlwiXG4gICAgICBpZiBpdGVtLnBhcmFtcz9cbiAgICAgICAgcGFyYW1zID0gaXRlbS5wYXJhbXNcbiAgICAgIGlmIGl0ZW0uZGVwcmVjYXRlZFxuICAgICAgICBkZXByZWNhdGVkID0gdHJ1ZVxuICAgICAgaWNvbl9zdHlsZSA9ICcnXG4gICAgICBkZXNjcl9wcmVmaXggPSAnJ1xuICAgICAgaWYgaXRlbS5zb3VyY2UgPT0gJ2V4dGVybmFsJ1xuICAgICAgICBpY29uX3N0eWxlID0gJ2Jvb2snXG4gICAgICAgIGRlc2NyX3ByZWZpeCA9ICdFeHRlcm5hbDogJ1xuICAgICAgZWxzZSBpZiBpdGVtLnNvdXJjZSA9PSAnaW50ZXJuYWwnXG4gICAgICAgIGljb25fc3R5bGUgPSAncmVwbydcbiAgICAgICAgZGVzY3JfcHJlZml4ID0gJ0J1aWx0aW46ICdcbiAgICAgIGVsc2UgaWYgaXRlbS5zb3VyY2UgPT0gJ2ludGVybmFsLWF0b20nXG4gICAgICAgIGljb25fc3R5bGUgPSAncmVwbydcbiAgICAgICAgZGVzY3JfcHJlZml4ID0gJ0F0b20gY29tbWFuZDogJ1xuICAgICAgZWxzZSBpZiBpdGVtLnNvdXJjZSA9PSAnZXh0ZXJuYWwtZnVuY3Rpb25hbCdcbiAgICAgICAgaWNvbl9zdHlsZSA9ICdwbHVzJ1xuICAgICAgICBkZXNjcl9wcmVmaXggPSAnRnVuY3Rpb25hbDogJ1xuICAgICAgZWxzZSBpZiBpdGVtLnNvdXJjZSA9PSAnZ2xvYmFsLXZhcmlhYmxlJ1xuICAgICAgICBpY29uX3N0eWxlID0gJ2JyaWVmY2FzZSdcbiAgICAgICAgZGVzY3JfcHJlZml4ID0gJ0dsb2JhbCB2YXJpYWJsZTogJ1xuICAgICAgaWYgZGVwcmVjYXRlZFxuICAgICAgICBuYW1lID0gXCI8c3RyaWtlIHN0eWxlPSdjb2xvcjpncmF5O2ZvbnQtd2VpZ2h0Om5vcm1hbDsnPlwiK25hbWUrXCI8L3N0cmlrZT5cIlxuICAgICAgZGVzY3IgPSBcIjxkaXYgc3R5bGU9J2Zsb2F0OmxlZnQ7IHBhZGRpbmctdG9wOjEwcHg7JyBjbGFzcz0nc3RhdHVzIHN0YXR1cy0je2ljb25fc3R5bGV9IGljb24gaWNvbi0je2ljb25fc3R5bGV9Jz48L2Rpdj48ZGl2IHN0eWxlPSdwYWRkaW5nLWxlZnQ6IDEwcHg7Jz48Yj4je25hbWV9ICN7cGFyYW1zfTwvYj48YnI+I3tpdGVtLmRlc2NyaXB0aW9ufSAje2V4YW1wbGV9ICN7c291cmNlZmlsZX08L2Rpdj5cIlxuICAgICAgY21kX25hbWVzLnB1c2gge1xuICAgICAgICBuYW1lOiBpdGVtLm5hbWVcbiAgICAgICAgZGVzY3JpcHRpb246IGRlc2NyXG4gICAgICAgIGh0bWw6IHRydWVcbiAgICAgIH1cbiAgICByZXR1cm4gY21kX25hbWVzXG5cbiAgZ2V0TG9jYWxDb21tYW5kc01lbWR1bXA6ICgpIC0+XG4gICAgY21kID0gQGdldENvbW1hbmRzUmVnaXN0cnkoKVxuICAgIGNvbW1hbmRGaW5kZXIgPSBuZXcgQVRQQ29tbWFuZEZpbmRlclZpZXcgY21kXG4gICAgY29tbWFuZEZpbmRlclBhbmVsID0gYXRvbS53b3Jrc3BhY2UuYWRkTW9kYWxQYW5lbChpdGVtOiBjb21tYW5kRmluZGVyKVxuICAgIGNvbW1hbmRGaW5kZXIuc2hvd24gY29tbWFuZEZpbmRlclBhbmVsLCB0aGlzXG4gICAgcmV0dXJuXG5cbiAgY29tbWFuZFByb2dyZXNzOiAodmFsdWUpIC0+XG4gICAgaWYgdmFsdWUgPCAwXG4gICAgICBAY2xpUHJvZ3Jlc3NCYXIuaGlkZSgpXG4gICAgICBAY2xpUHJvZ3Jlc3NCYXIuYXR0cigndmFsdWUnLCAnMCcpXG4gICAgZWxzZVxuICAgICAgQGNsaVByb2dyZXNzQmFyLnNob3coKVxuICAgICAgQGNsaVByb2dyZXNzQmFyLmF0dHIoJ3ZhbHVlJywgdmFsdWUvMilcblxuICBzaG93SW5pdE1lc3NhZ2U6IChmb3JjZVNob3c9ZmFsc2UpIC0+XG4gICAgaWYgbm90IGZvcmNlU2hvd1xuICAgICAgaWYgQGhlbGxvTWVzc2FnZVNob3duXG4gICAgICAgIHJldHVyblxuICAgIGlmIGF0b20uY29uZmlnLmdldCAnYXRvbS10ZXJtaW5hbC1wYW5lbC5lbmFibGVDb25zb2xlU3RhcnR1cEluZm8nIG9yIGZvcmNlU2hvdyBvciAobm90IEBzcGVjc01vZGUpXG4gICAgICBjaGFuZ2Vsb2dfcGF0aCA9IHJlcXVpcmUoXCJwYXRoXCIpLmpvaW4oX19kaXJuYW1lLCBcIi4uL0NIQU5HRUxPRy5tZFwiKTtcbiAgICAgIHJlYWRtZV9wYXRoID0gcmVxdWlyZShcInBhdGhcIikuam9pbihfX2Rpcm5hbWUsIFwiLi4vUkVBRE1FLm1kXCIpO1xuICAgICAgaGVsbG9fbWVzc2FnZSA9IEBjb25zb2xlUGFuZWwgJ0FUT00gVGVybWluYWwnLCAnUGxlYXNlIGVudGVyIG5ldyBjb21tYW5kcyB0byB0aGUgYm94IGJlbG93LiAoY3RybC10byBzaG93IHN1Z2dlc3Rpb25zIGRyb3Bkb3duKTxicj5UaGUgY29uc29sZSBzdXBwb3J0cyBzcGVjaWFsIGFub3RhdHRpb24gbGlrZTogJShwYXRoKSwgJShmaWxlKSwgJShsaW5rKWZpbGUuc29tZXRoaW5nJShlbmRsaW5rKS48YnI+SXQgYWxzbyBzdXBwb3J0cyBzcGVjaWFsIEhUTUwgZWxlbWVudHMgbGlrZTogJSh0b29sdGlwOkE6Y29udGVudDpCKSBhbmQgc28gb24uPGJyPkhvcGUgeW91XFwnbGwgZW5qb3kgdGhlIHRlcm1pbmFsLicrXG4gICAgICBcIjxicj48YSBjbGFzcz0nY2hhbmdlbG9nLWxpbmsnIGhyZWY9JyN7Y2hhbmdlbG9nX3BhdGh9Jz5TZWUgY2hhbmdlbG9nPC9hPiZuYnNwOyZuYnNwOzxhIGNsYXNzPSdyZWFkbWUtbGluaycgaHJlZj0nI3tyZWFkbWVfcGF0aH0nPmFuZCB0aGUgUkVBRE1FISA6KTwvYT5cIlxuICAgICAgQHJhd01lc3NhZ2UgaGVsbG9fbWVzc2FnZVxuICAgICAgJCgnLmNoYW5nZWxvZy1saW5rJykuY3NzKCdmb250LXdlaWdodCcsJzMwMCUnKS5jbGljaygoKSA9PlxuICAgICAgICAgIGF0b20ud29ya3NwYWNlLm9wZW4gY2hhbmdlbG9nX3BhdGhcbiAgICAgIClcbiAgICAgICQoJy5yZWFkbWUtbGluaycpLmNzcygnZm9udC13ZWlnaHQnLCczMDAlJykuY2xpY2soKCkgPT5cbiAgICAgICAgICBhdG9tLndvcmtzcGFjZS5vcGVuIHJlYWRtZV9wYXRoXG4gICAgICApXG4gICAgICBAaGVsbG9NZXNzYWdlU2hvd24gPSB0cnVlXG4gICAgcmV0dXJuIHRoaXNcblxuICBvbkNvbW1hbmQ6IChpbnB1dENtZCkgLT5cbiAgICBAZnNTcHkoKVxuXG4gICAgaWYgbm90IGlucHV0Q21kP1xuICAgICAgaW5wdXRDbWQgPSBAcmVhZElucHV0Qm94KClcblxuICAgIEBkaXNwb3NhYmxlcy5kaXNwb3NlKCdzdGF0dXNJY29uVG9vbHRpcHMnKVxuICAgIEBkaXNwb3NhYmxlcy5hZGQgJ3N0YXR1c0ljb25Ub29sdGlwcycsIGF0b20udG9vbHRpcHMuYWRkIEBzdGF0dXNJY29uLFxuICAgICB0aXRsZTogJ1Rhc2s6IFxcXCInK2lucHV0Q21kKydcXFwiJ1xuICAgICBkZWxheTogMFxuICAgICBhbmltYXRpb246IGZhbHNlXG5cbiAgICBAaW5wdXRMaW5lKytcbiAgICBpbnB1dENtZCA9IEBwYXJzZVNwZWNpYWxTdHJpbmdUZW1wbGF0ZSBpbnB1dENtZFxuXG4gICAgaWYgQGVjaG9PblxuICAgICAgY29uc29sZS5sb2cgJ2VjaG8tb24nXG4gICAgICAjVE9ETzogUmVwYWlyIVxuICAgICAgI0BtZXNzYWdlIFwiXFxuXCIrQGdldENvbW1hbmRQcm9tcHQoaW5wdXRDbWQpK1wiIFwiK2lucHV0Q21kK1wiXFxuXCIsIGZhbHNlXG5cbiAgICByZXQgPSBAZXhlYyBpbnB1dENtZCwgbnVsbCwgdGhpcywgKCkgPT5cbiAgICAgIHNldFRpbWVvdXQgKCkgPT5cbiAgICAgICAgQHB1dElucHV0Qm94KClcbiAgICAgICwgNzUwXG4gICAgaWYgcmV0P1xuICAgICAgQG1lc3NhZ2UgcmV0ICsgJ1xcbidcblxuICAgIEBzY3JvbGxUb0JvdHRvbSgpXG5cbiAgICAjIFRPRE86IFNob3VsZCBiZSByZW1vdmVkLlxuICAgIEBwdXRJbnB1dEJveCgpXG4gICAgc2V0VGltZW91dCAoKSA9PlxuICAgICAgQHB1dElucHV0Qm94KClcbiAgICAsIDc1MFxuICAgICMgVE9ETzogUmVwYWlyIHRoaXMgYWJvdmUsIG1ha2luZyBpbnB1dCBib3ggbGVzcyBidWdneSFcblxuICAgIHJldHVybiBudWxsXG5cbiAgaW5pdGlhbGl6ZTogLT5cbiAgICBAdXNlckhvbWUgPSBwcm9jZXNzLmVudi5IT01FIG9yIHByb2Nlc3MuZW52LkhPTUVQQVRIIG9yIHByb2Nlc3MuZW52LlVTRVJQUk9GSUxFXG4gICAgY21kID0gJ3Rlc3QgLWUgL2V0Yy9wcm9maWxlICYmIHNvdXJjZSAvZXRjL3Byb2ZpbGU7dGVzdCAtZSB+Ly5wcm9maWxlICYmIHNvdXJjZSB+Ly5wcm9maWxlOyBub2RlIC1wZSBcIkpTT04uc3RyaW5naWZ5KHByb2Nlc3MuZW52KVwiJ1xuICAgIGV4ZWMgY21kLCAoY29kZSwgc3Rkb3V0LCBzdGRlcnIpIC0+XG4gICAgICB0cnlcbiAgICAgICAgcHJvY2Vzcy5lbnYgPSBKU09OLnBhcnNlKHN0ZG91dClcbiAgICAgIGNhdGNoIGVcbiAgICBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS13b3Jrc3BhY2UnLFxuICAgICAgXCJhdHAtc3RhdHVzOnRvZ2dsZS1vdXRwdXRcIjogPT4gQHRvZ2dsZSgpXG5cbiAgY2xlYXI6IC0+XG4gICAgQGNsaU91dHB1dC5lbXB0eSgpXG4gICAgQG1lc3NhZ2UgJ1xcbidcbiAgICBAcHV0SW5wdXRCb3goKVxuXG4gIGFkanVzdFdpbmRvd0hlaWdodDogLT5cbiAgICBtYXhIZWlnaHQgPSBhdG9tLmNvbmZpZy5nZXQoJ2F0b20tdGVybWluYWwtcGFuZWwuV2luZG93SGVpZ2h0JylcbiAgICBAY2xpT3V0cHV0LmNzcyhcIm1heC1oZWlnaHRcIiwgXCIje21heEhlaWdodH1weFwiKVxuICAgICQoJy50ZXJtaW5hbC1pbnB1dCcpLmNzcyhcIm1heC1oZWlnaHRcIiwgXCIje21heEhlaWdodH1weFwiKVxuXG4gIHNob3dDbWQ6IC0+XG4gICAgQGZvY3VzSW5wdXRCb3goKVxuICAgIEBzY3JvbGxUb0JvdHRvbSgpXG5cbiAgc2Nyb2xsVG9Cb3R0b206IC0+XG4gICAgQGNsaU91dHB1dC5zY3JvbGxUb3AgMTAwMDAwMDBcblxuICBmbGFzaEljb25DbGFzczogKGNsYXNzTmFtZSwgdGltZT0xMDApPT5cbiAgICBAc3RhdHVzSWNvbi5hZGRDbGFzcyBjbGFzc05hbWVcbiAgICBAdGltZXIgYW5kIGNsZWFyVGltZW91dChAdGltZXIpXG4gICAgb25TdGF0dXNPdXQgPSA9PlxuICAgICAgQHN0YXR1c0ljb24ucmVtb3ZlQ2xhc3MgY2xhc3NOYW1lXG4gICAgQHRpbWVyID0gc2V0VGltZW91dCBvblN0YXR1c091dCwgdGltZVxuXG4gIGRlc3Ryb3k6IC0+XG4gICAgQHN0YXR1c0ljb24ucmVtb3ZlKClcblxuICAgIF9kZXN0cm95ID0gPT5cbiAgICAgIGlmIEBoYXNQYXJlbnQoKVxuICAgICAgICBAY2xvc2UoKVxuICAgICAgaWYgQHN0YXR1c0ljb24gYW5kIEBzdGF0dXNJY29uLnBhcmVudE5vZGVcbiAgICAgICAgQHN0YXR1c0ljb24ucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChAc3RhdHVzSWNvbilcbiAgICAgIEBzdGF0dXNWaWV3LnJlbW92ZUNvbW1hbmRWaWV3IHRoaXNcbiAgICBpZiBAcHJvZ3JhbVxuICAgICAgQHByb2dyYW0ub25jZSAnZXhpdCcsIF9kZXN0cm95XG4gICAgICBAcHJvZ3JhbS5raWxsKClcbiAgICBlbHNlXG4gICAgICBfZGVzdHJveSgpXG5cbiAgdGVybWluYXRlUHJvY2Vzc1RyZWU6ICgpIC0+XG4gICAgcGlkID0gQHByb2dyYW0ucGlkXG4gICAgcHNUcmVlID0gcmVxdWlyZSAncHMtdHJlZSdcbiAgICBraWxsUHJvY2VzcyA9IChwaWQsIHNpZ25hbCwgY2FsbGJhY2spID0+XG4gICAgICAgIHNpZ25hbCAgID0gc2lnbmFsIHx8ICdTSUdLSUxMJ1xuICAgICAgICBjYWxsYmFjayA9IGNhbGxiYWNrIHx8ICgpIC0+IHt9XG4gICAgICAgIGtpbGxUcmVlID0gdHJ1ZVxuICAgICAgICBpZiBraWxsVHJlZVxuICAgICAgICAgICAgcHNUcmVlKHBpZCwgKGVyciwgY2hpbGRyZW4pID0+XG4gICAgICAgICAgICAgICAgW3BpZF0uY29uY2F0KFxuICAgICAgICAgICAgICAgICAgICBjaGlsZHJlbi5tYXAoKHApID0+XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcC5QSURcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICkuZm9yRWFjaCgodHBpZCkgPT5cbiAgICAgICAgICAgICAgICAgICAgdHJ5XG4gICAgICAgICAgICAgICAgICAgICAgcHJvY2Vzcy5raWxsIHRwaWQsIHNpZ25hbFxuICAgICAgICAgICAgICAgICAgICBjYXRjaCBleFxuXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgIGNhbGxiYWNrKClcbiAgICAgICAgICAgIClcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHRyeVxuICAgICAgICAgICAgcHJvY2Vzcy5raWxsIHBpZCwgc2lnbmFsXG4gICAgICAgICAgY2F0Y2ggZXhcbiAgICAgICAgICBjYWxsYmFjaygpXG4gICAga2lsbFByb2Nlc3MgcGlkLCAnU0lHSU5UJ1xuXG5cbiAga2lsbDogLT5cbiAgICBpZiBAcHJvZ3JhbVxuICAgICAgQHRlcm1pbmF0ZVByb2Nlc3NUcmVlIEBwcm9ncmFtLnBpZFxuICAgICAgQHByb2dyYW0uc3RkaW4ucGF1c2UoKVxuICAgICAgQHByb2dyYW0ua2lsbCgnU0lHSU5UJylcbiAgICAgIEBwcm9ncmFtLmtpbGwoKVxuICAgICAgQG1lc3NhZ2UgKEBjb25zb2xlTGFiZWwgJ2luZm8nLCAnaW5mbycpKyhAY29uc29sZVRleHQgJ2luZm8nLCAnUHJvY2VzcyBoYXMgYmVlbiBzdG9wcGVkJylcblxuICBtYXhpbWl6ZTogLT5cbiAgICBAY2xpT3V0cHV0LmhlaWdodCAoQGNsaU91dHB1dC5oZWlnaHQoKSs5OTk5KVxuXG4gIG9wZW46IC0+XG4gICAgaWYgKGF0b20uY29uZmlnLmdldCgnYXRvbS10ZXJtaW5hbC1wYW5lbC5tb3ZlVG9DdXJyZW50RGlyT25PcGVuJykpIGFuZCAobm90IEBzcGVjc01vZGUpXG4gICAgICBAbW92ZVRvQ3VycmVudERpcmVjdG9yeSgpXG4gICAgaWYgKGF0b20uY29uZmlnLmdldCgnYXRvbS10ZXJtaW5hbC1wYW5lbC5tb3ZlVG9DdXJyZW50RGlyT25PcGVuTFMnKSkgYW5kIChub3QgQHNwZWNzTW9kZSlcbiAgICAgIEBjbGVhcigpXG4gICAgICBAZXhlY0RlbGF5ZWRDb21tYW5kIEBfY21kaW50ZGVsLCAnbHMnLCBudWxsLCB0aGlzXG5cbiAgICBhdG9tLndvcmtzcGFjZS5hZGRCb3R0b21QYW5lbChpdGVtOiB0aGlzKSB1bmxlc3MgQGhhc1BhcmVudCgpXG4gICAgaWYgbGFzdE9wZW5lZFZpZXcgYW5kIGxhc3RPcGVuZWRWaWV3ICE9IHRoaXNcbiAgICAgIGxhc3RPcGVuZWRWaWV3LmNsb3NlKClcbiAgICBsYXN0T3BlbmVkVmlldyA9IHRoaXNcbiAgICBAc2Nyb2xsVG9Cb3R0b20oKVxuICAgIEBzdGF0dXNWaWV3LnNldEFjdGl2ZUNvbW1hbmRWaWV3IHRoaXNcbiAgICBAZm9jdXNJbnB1dEJveCgpXG4gICAgQHNob3dJbml0TWVzc2FnZSgpXG4gICAgQHB1dElucHV0Qm94KClcblxuICAgIGF0b20udG9vbHRpcHMuYWRkIEBraWxsQnRuLFxuICAgICB0aXRsZTogJ0tpbGwgdGhlIGxvbmcgd29ya2luZyBwcm9jZXNzLidcbiAgICBhdG9tLnRvb2x0aXBzLmFkZCBAZXhpdEJ0bixcbiAgICAgdGl0bGU6ICdEZXN0cm95IHRoZSB0ZXJtaW5hbCBzZXNzaW9uLidcbiAgICBhdG9tLnRvb2x0aXBzLmFkZCBAY2xvc2VCdG4sXG4gICAgIHRpdGxlOiAnSGlkZSB0aGUgdGVybWluYWwgd2luZG93LidcbiAgICBhdG9tLnRvb2x0aXBzLmFkZCBAb3BlbkNvbmZpZ0J0bixcbiAgICAgdGl0bGU6ICdPcGVuIHRoZSB0ZXJtaW5hbCBjb25maWcgZmlsZS4nXG4gICAgYXRvbS50b29sdGlwcy5hZGQgQHJlbG9hZENvbmZpZ0J0bixcbiAgICAgdGl0bGU6ICdSZWxvYWQgdGhlIHRlcm1pbmFsIGNvbmZpZ3VyYXRpb24uJ1xuXG4gICAgaWYgYXRvbS5jb25maWcuZ2V0ICdhdG9tLXRlcm1pbmFsLXBhbmVsLmVuYWJsZVdpbmRvd0FuaW1hdGlvbnMnXG4gICAgICBAV2luZG93TWluSGVpZ2h0ID0gQGNsaU91dHB1dC5oZWlnaHQoKSArIDUwXG4gICAgICBAaGVpZ2h0IDBcbiAgICAgIEBjb25zb2xlVG9vbGJhckhlYWRpbmcuY3NzIHtvcGFjaXR5OiAwfVxuICAgICAgQGFuaW1hdGUge1xuICAgICAgICBoZWlnaHQ6IEBXaW5kb3dNaW5IZWlnaHRcbiAgICAgIH0sIDI1MCwgPT5cbiAgICAgICAgQGF0dHIgJ3N0eWxlJywgJydcbiAgICAgICAgQGNvbnNvbGVUb29sYmFySGVhZGluZy5hbmltYXRlIHtcbiAgICAgICAgICBvcGFjaXR5OiAxXG4gICAgICAgIH0sIDI1MCwgPT5cbiAgICAgICAgICBAY29uc29sZVRvb2xiYXJIZWFkaW5nLmF0dHIgJ3N0eWxlJywgJydcblxuICBjbG9zZTogLT5cbiAgICBpZiBhdG9tLmNvbmZpZy5nZXQgJ2F0b20tdGVybWluYWwtcGFuZWwuZW5hYmxlV2luZG93QW5pbWF0aW9ucydcbiAgICAgIEBXaW5kb3dNaW5IZWlnaHQgPSBAY2xpT3V0cHV0LmhlaWdodCgpICsgNTBcbiAgICAgIEBoZWlnaHQgQFdpbmRvd01pbkhlaWdodFxuICAgICAgQGFuaW1hdGUge1xuICAgICAgICBoZWlnaHQ6IDBcbiAgICAgIH0sIDI1MCwgPT5cbiAgICAgICAgQGF0dHIgJ3N0eWxlJywgJydcbiAgICAgICAgQGNvbnNvbGVUb29sYmFyLmF0dHIgJ3N0eWxlJywgJydcbiAgICAgICAgQGRldGFjaCgpXG4gICAgICAgIGxhc3RPcGVuZWRWaWV3ID0gbnVsbFxuICAgIGVsc2VcbiAgICAgIEBkZXRhY2goKVxuICAgICAgbGFzdE9wZW5lZFZpZXcgPSBudWxsXG5cblxuICB0b2dnbGU6IC0+XG4gICAgaWYgQGhhc1BhcmVudCgpXG4gICAgICBAY2xvc2UoKVxuICAgIGVsc2VcbiAgICAgIEBvcGVuKClcblxuICByZW1vdmVRdW90ZXM6ICh0ZXh0KS0+XG4gICAgaWYgbm90IHRleHQ/XG4gICAgICByZXR1cm4gJydcbiAgICBpZiB0ZXh0IGluc3RhbmNlb2YgQXJyYXlcbiAgICAgIHJldCA9IFtdXG4gICAgICBmb3IgdCBpbiB0ZXh0XG4gICAgICAgIHJldC5wdXNoIChAcmVtb3ZlUXVvdGVzIHQpXG4gICAgICByZXR1cm4gcmV0XG4gICAgcmV0dXJuIHRleHQucmVwbGFjZSgvWydcIl0rL2csICcnKVxuXG4gIGNkOiAoYXJncyktPlxuICAgIGFyZ3MgPSBbYXRvbS5wcm9qZWN0LnBhdGhdIGlmIG5vdCBhcmdzWzBdXG4gICAgYXJncyA9IEByZW1vdmVRdW90ZXMgYXJnc1xuICAgIGRpciA9IHJlc29sdmUgQGdldEN3ZCgpLCBhcmdzWzBdXG4gICAgdHJ5XG4gICAgICBzdGF0ID0gZnMuc3RhdFN5bmMgZGlyXG4gICAgICBpZiBub3Qgc3RhdC5pc0RpcmVjdG9yeSgpXG4gICAgICAgIHJldHVybiBAZXJyb3JNZXNzYWdlIFwiY2Q6IG5vdCBhIGRpcmVjdG9yeTogI3thcmdzWzBdfVwiXG4gICAgICBAY3dkID0gZGlyXG4gICAgICBAcHV0SW5wdXRCb3goKVxuICAgIGNhdGNoIGVcbiAgICAgIHJldHVybiBAZXJyb3JNZXNzYWdlIFwiY2Q6ICN7YXJnc1swXX06IE5vIHN1Y2ggZmlsZSBvciBkaXJlY3RvcnlcIlxuICAgIHJldHVybiBudWxsXG5cbiAgbHM6IChhcmdzKSAtPlxuICAgIHRyeVxuICAgICAgZmlsZXMgPSBmcy5yZWFkZGlyU3luYyBAZ2V0Q3dkKClcbiAgICBjYXRjaCBlXG4gICAgICByZXR1cm4gZmFsc2VcblxuICAgIGlmIGF0b20uY29uZmlnLmdldCgnYXRvbS10ZXJtaW5hbC1wYW5lbC5YRXhwZXJpbWVudEVuYWJsZUZvcmNlTGlua2luZycpXG4gICAgICByZXQgPSAnJ1xuICAgICAgZmlsZXMuZm9yRWFjaCAoZmlsZW5hbWUpID0+XG4gICAgICAgIHJldCArPSBAcmVzb2x2ZVBhdGggZmlsZW5hbWUgKyAnXFx0JShicmVhayknXG4gICAgICBAbWVzc2FnZSByZXRcbiAgICAgIHJldHVybiB0cnVlXG5cbiAgICBmaWxlc0Jsb2NrcyA9IFtdXG4gICAgZmlsZXMuZm9yRWFjaCAoZmlsZW5hbWUpID0+XG4gICAgICBmaWxlc0Jsb2Nrcy5wdXNoIEBfZmlsZUluZm9IdG1sKGZpbGVuYW1lLCBAZ2V0Q3dkKCkpXG4gICAgZmlsZXNCbG9ja3MgPSBmaWxlc0Jsb2Nrcy5zb3J0IChhLCBiKSAtPlxuICAgICAgYURpciA9IGZhbHNlXG4gICAgICBiRGlyID0gZmFsc2VcbiAgICAgIGlmIGFbMV0/XG4gICAgICAgIGFEaXIgPSBhWzFdLmlzRGlyZWN0b3J5KClcbiAgICAgIGlmIGJbMV0/XG4gICAgICAgIGJEaXIgPSBiWzFdLmlzRGlyZWN0b3J5KClcbiAgICAgIGlmIGFEaXIgYW5kIG5vdCBiRGlyXG4gICAgICAgIHJldHVybiAtMVxuICAgICAgaWYgbm90IGFEaXIgYW5kIGJEaXJcbiAgICAgICAgcmV0dXJuIDFcbiAgICAgIGFbMl0gPiBiWzJdIGFuZCAxIG9yIC0xXG4gICAgZmlsZXNCbG9ja3MudW5zaGlmdCBAX2ZpbGVJbmZvSHRtbCgnLi4nLCBAZ2V0Q3dkKCkpXG4gICAgZmlsZXNCbG9ja3MgPSBmaWxlc0Jsb2Nrcy5tYXAgKGIpIC0+XG4gICAgICBiWzBdXG4gICAgQG1lc3NhZ2UgZmlsZXNCbG9ja3Muam9pbignJShicmVhayknKSArICc8ZGl2IGNsYXNzPVwiY2xlYXJcIi8+J1xuICAgIHJldHVybiB0cnVlXG5cbiAgcGFyc2VTcGVjaWFsTm9kZXM6ICgpIC0+XG4gICAgY2FsbGVyID0gdGhpc1xuXG4gICAgaWYgYXRvbS5jb25maWcuZ2V0ICdhdG9tLXRlcm1pbmFsLXBhbmVsLmVuYWJsZUNvbnNvbGVJbnRlcmFjdGl2ZUhpbnRzJ1xuICAgICAgJCgnLmF0cC10b29sdGlwW2RhdGEtdG9nZ2xlPVwidG9vbHRpcFwiXScpLmVhY2goKCkgLT5cbiAgICAgICAgICB0aXRsZSA9ICQodGhpcykuYXR0cigndGl0bGUnKVxuICAgICAgICAgIGF0b20udG9vbHRpcHMuYWRkICQodGhpcyksIHt9XG4gICAgICApXG5cbiAgICBpZiBhdG9tLmNvbmZpZy5nZXQgJ2F0b20tdGVybWluYWwtcGFuZWwuZW5hYmxlQ29uc29sZUludGVyYWN0aXZlTGlua3MnXG4gICAgICBAZmluZCgnLmNvbnNvbGUtbGluaycpLmVhY2ggKFxuICAgICAgICAoKSAtPlxuICAgICAgICAgIGVsID0gJCh0aGlzKVxuICAgICAgICAgIGxpbmtfdGFyZ2V0ID0gZWwuZGF0YSgndGFyZ2V0JylcblxuICAgICAgICAgIGlmIGxpbmtfdGFyZ2V0ICE9IG51bGwgJiYgbGlua190YXJnZXQgIT0gdW5kZWZpbmVkXG4gICAgICAgICAgICBlbC5kYXRhKCd0YXJnZXQnLCBudWxsKVxuICAgICAgICAgICAgbGlua190eXBlID0gZWwuZGF0YSgndGFyZ2V0dHlwZScpXG4gICAgICAgICAgICBsaW5rX3RhcmdldF9uYW1lID0gZWwuZGF0YSgndGFyZ2V0bmFtZScpXG4gICAgICAgICAgICBsaW5rX3RhcmdldF9saW5lID0gZWwuZGF0YSgnbGluZScpXG4gICAgICAgICAgICBsaW5rX3RhcmdldF9jb2x1bW4gPSBlbC5kYXRhKCdjb2x1bW4nKVxuXG4gICAgICAgICAgICBpZiBub3QgbGlua190YXJnZXRfbGluZT9cbiAgICAgICAgICAgICAgbGlua190YXJnZXRfbGluZSA9IDBcbiAgICAgICAgICAgIGlmIG5vdCBsaW5rX3RhcmdldF9jb2x1bW4/XG4gICAgICAgICAgICAgIGxpbmtfdGFyZ2V0X2NvbHVtbiA9IDBcblxuICAgICAgICAgICAgZWwuY2xpY2sgKCkgLT5cbiAgICAgICAgICAgICAgZWwuYWRkQ2xhc3MoJ2xpbmstdXNlZCcpXG4gICAgICAgICAgICAgIGlmIGxpbmtfdHlwZSA9PSAnZmlsZSdcbiAgICAgICAgICAgICAgICBhdG9tLndvcmtzcGFjZS5vcGVuIGxpbmtfdGFyZ2V0LCB7XG4gICAgICAgICAgICAgICAgICBpbml0aWFsTGluZTogbGlua190YXJnZXRfbGluZVxuICAgICAgICAgICAgICAgICAgaW5pdGlhbENvbHVtbjogbGlua190YXJnZXRfY29sdW1uXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIGlmIGxpbmtfdHlwZSA9PSAnZGlyZWN0b3J5J1xuICAgICAgICAgICAgICAgICAgbW92ZVRvRGlyID0gKGRpcmVjdG9yeSwgbWVzc2FnZURpc3A9ZmFsc2UpLT5cbiAgICAgICAgICAgICAgICAgICAgY2FsbGVyLmNsZWFyKClcbiAgICAgICAgICAgICAgICAgICAgY2FsbGVyLmNkKFtkaXJlY3RvcnldKVxuICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0ICgpIC0+XG4gICAgICAgICAgICAgICAgICAgICAgaWYgbm90IGNhbGxlci5scygpXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBub3QgbWVzc2FnZURpc3BcbiAgICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGVyLmVycm9yTWVzc2FnZSAnVGhlIGRpcmVjdG9yeSBpcyBpbmFjY2VzaWJsZS5cXG4nXG4gICAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2VEaXNwID0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0ICgpIC0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbW92ZVRvRGlyKCcuLicsIG1lc3NhZ2VEaXNwKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAsIDE1MDBcbiAgICAgICAgICAgICAgICAgICAgLCBjYWxsZXIuX2NtZGludGRlbFxuICAgICAgICAgICAgICAgICAgc2V0VGltZW91dCAoKSAtPlxuICAgICAgICAgICAgICAgICAgICBtb3ZlVG9EaXIobGlua190YXJnZXRfbmFtZSlcbiAgICAgICAgICAgICAgICAgICwgY2FsbGVyLl9jbWRpbnRkZWxcbiAgICAgIClcbiAgICAgICMgZWwuZGF0YSgnZmlsZW5hbWVMaW5rJywgJycpXG5cbiAgY29uc29sZUFsZXJ0OiAodGV4dCkgLT5cbiAgICByZXR1cm4gJzxkaXYgY2xhc3M9XCJhbGVydCBhbGVydC1kYW5nZXIgYWxlcnQtZGlzbWlzc2libGVcIiByb2xlPVwiYWxlcnRcIj48YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImNsb3NlXCIgZGF0YS1kaXNtaXNzPVwiYWxlcnRcIiBhcmlhLWxhYmVsPVwiQ2xvc2VcIj48c3BhbiBhcmlhLWhpZGRlbj1cInRydWVcIj4mdGltZXM7PC9zcGFuPjwvYnV0dG9uPjxzdHJvbmc+V2FybmluZyE8L3N0cm9uZz4gJyArIHRleHQgKyAnPC9kaXY+J1xuXG4gIGNvbnNvbGVQYW5lbDogKHRpdGxlLCBjb250ZW50KSAtPlxuICAgIHJldHVybiAnPGRpdiBjbGFzcz1cInBhbmVsIHBhbmVsLWluZm8gd2VsY29tZS1wYW5lbFwiPjxkaXYgY2xhc3M9XCJwYW5lbC1oZWFkaW5nXCI+Jyt0aXRsZSsnPC9kaXY+PGRpdiBjbGFzcz1cInBhbmVsLWJvZHlcIj4nK2NvbnRlbnQrJzwvZGl2PjwvZGl2Pjxicj48YnI+J1xuXG4gIGNvbnNvbGVUZXh0OiAodHlwZSwgdGV4dCkgLT5cbiAgICBpZiB0eXBlID09ICdpbmZvJ1xuICAgICAgcmV0dXJuICc8c3BhbiBjbGFzcz1cInRleHQtaW5mb1wiIHN0eWxlPVwibWFyZ2luLWxlZnQ6MTBweDtcIj4nK3RleHQrJzwvc3Bhbj4nXG4gICAgaWYgdHlwZSA9PSAnZXJyb3InXG4gICAgICByZXR1cm4gJzxzcGFuIGNsYXNzPVwidGV4dC1lcnJvclwiIHN0eWxlPVwibWFyZ2luLWxlZnQ6MTBweDtcIj4nK3RleHQrJzwvc3Bhbj4nXG4gICAgaWYgdHlwZSA9PSAnd2FybmluZydcbiAgICAgIHJldHVybiAnPHNwYW4gY2xhc3M9XCJ0ZXh0LXdhcm5pbmdcIiBzdHlsZT1cIm1hcmdpbi1sZWZ0OjEwcHg7XCI+Jyt0ZXh0Kyc8L3NwYW4+J1xuICAgIGlmIHR5cGUgPT0gJ3N1Y2Nlc3MnXG4gICAgICByZXR1cm4gJzxzcGFuIGNsYXNzPVwidGV4dC1zdWNjZXNzXCIgc3R5bGU9XCJtYXJnaW4tbGVmdDoxMHB4O1wiPicrdGV4dCsnPC9zcGFuPidcbiAgICByZXR1cm4gdGV4dFxuXG4gIGNvbnNvbGVMYWJlbDogKHR5cGUsIHRleHQpIC0+XG4gICAgaWYgKG5vdCBhdG9tLmNvbmZpZy5nZXQgJ2F0b20tdGVybWluYWwtcGFuZWwuZW5hYmxlQ29uc29sZUxhYmVscycpIGFuZCAobm90IEBzcGVjc01vZGUpXG4gICAgICByZXR1cm4gdGV4dFxuXG4gICAgaWYgbm90IHRleHQ/XG4gICAgICB0ZXh0ID0gdHlwZVxuXG4gICAgaWYgdHlwZSA9PSAnYmFkZ2UnXG4gICAgICByZXR1cm4gJzxzcGFuIGNsYXNzPVwiYmFkZ2VcIj4nK3RleHQrJzwvc3Bhbj4nXG4gICAgaWYgdHlwZSA9PSAnZGVmYXVsdCdcbiAgICAgIHJldHVybiAnPHNwYW4gY2xhc3M9XCJpbmxpbmUtYmxvY2sgaGlnaGxpZ2h0XCI+Jyt0ZXh0Kyc8L3NwYW4+J1xuICAgIGlmIHR5cGUgPT0gJ3ByaW1hcnknXG4gICAgICByZXR1cm4gJzxzcGFuIGNsYXNzPVwibGFiZWwgbGFiZWwtcHJpbWFyeVwiPicrdGV4dCsnPC9zcGFuPidcbiAgICBpZiB0eXBlID09ICdzdWNjZXNzJ1xuICAgICAgcmV0dXJuICc8c3BhbiBjbGFzcz1cImlubGluZS1ibG9jayBoaWdobGlnaHQtc3VjY2Vzc1wiPicrdGV4dCsnPC9zcGFuPidcbiAgICBpZiB0eXBlID09ICdpbmZvJ1xuICAgICAgcmV0dXJuICc8c3BhbiBjbGFzcz1cImlubGluZS1ibG9jayBoaWdobGlnaHQtaW5mb1wiPicrdGV4dCsnPC9zcGFuPidcbiAgICBpZiB0eXBlID09ICd3YXJuaW5nJ1xuICAgICAgcmV0dXJuICc8c3BhbiBjbGFzcz1cImlubGluZS1ibG9jayBoaWdobGlnaHQtd2FybmluZ1wiPicrdGV4dCsnPC9zcGFuPidcbiAgICBpZiB0eXBlID09ICdkYW5nZXInXG4gICAgICByZXR1cm4gJzxzcGFuIGNsYXNzPVwiaW5saW5lLWJsb2NrIGhpZ2hsaWdodC1lcnJvclwiPicrdGV4dCsnPC9zcGFuPidcbiAgICBpZiB0eXBlID09ICdlcnJvcidcbiAgICAgIHJldHVybiAnPHNwYW4gY2xhc3M9XCJpbmxpbmUtYmxvY2sgaGlnaGxpZ2h0LWVycm9yXCI+Jyt0ZXh0Kyc8L3NwYW4+J1xuICAgIHJldHVybiAnPHNwYW4gY2xhc3M9XCJsYWJlbCBsYWJlbC1kZWZhdWx0XCI+Jyt0ZXh0Kyc8L3NwYW4+J1xuXG4gIGNvbnNvbGVMaW5rOiAobmFtZSwgZm9yY2VkPXRydWUpIC0+XG4gICAgaWYgKGF0b20uY29uZmlnLmdldCAnYXRvbS10ZXJtaW5hbC1wYW5lbC5YRXhwZXJpbWVudEVuYWJsZUZvcmNlTGlua2luZycpIGFuZCAobm90IGZvcmNlZClcbiAgICAgIHJldHVybiBuYW1lXG4gICAgcmV0dXJuIEBfZmlsZUluZm9IdG1sKG5hbWUsIEBnZXRDd2QoKSwgJ2ZvbnQnLCBmYWxzZSlbMF1cblxuICBfZmlsZUluZm9IdG1sOiAoZmlsZW5hbWUsIHBhcmVudCwgd3JhcHBlcl9jbGFzcz0nc3BhbicsIHVzZV9maWxlX2luZm9fY2xhc3M9J3RydWUnKSAtPlxuXG4gICAgc3RyID0gZmlsZW5hbWVcbiAgICBuYW1lX3Rva2VucyA9IGZpbGVuYW1lXG4gICAgZmlsZW5hbWUgPSBmaWxlbmFtZS5yZXBsYWNlIC86WzAtOV0rOlswLTldL2lnLCAnJ1xuICAgIG5hbWVfdG9rZW5zID0gQHV0aWwucmVwbGFjZUFsbCBmaWxlbmFtZSwgJycsIG5hbWVfdG9rZW5zXG4gICAgbmFtZV90b2tlbnMgPSBuYW1lX3Rva2Vucy5zcGxpdCAnOidcbiAgICBmaWxlbGluZSA9IG5hbWVfdG9rZW5zWzBdXG4gICAgZmlsZWNvbHVtbiA9IG5hbWVfdG9rZW5zWzFdXG5cbiAgICBmaWxlbmFtZSA9IEB1dGlsLnJlcGxhY2VBbGwgJy8nLCAnXFxcXCcsIGZpbGVuYW1lXG4gICAgZmlsZW5hbWUgPSBAdXRpbC5yZXBsYWNlQWxsIHBhcmVudCwgJycsIGZpbGVuYW1lXG4gICAgZmlsZW5hbWUgPSBAdXRpbC5yZXBsYWNlQWxsIChAdXRpbC5yZXBsYWNlQWxsICcvJywgJ1xcXFwnLCBwYXJlbnQpLCAnJywgZmlsZW5hbWVcblxuICAgIGlmIGZpbGVuYW1lWzBdID09ICdcXFxcJyBvciBmaWxlbmFtZVswXSA9PSAnLydcbiAgICAgIGZpbGVuYW1lID0gZmlsZW5hbWUuc3Vic3RyaW5nKDEpXG5cbiAgICBpZiBmaWxlbmFtZSA9PSAnLi4nXG4gICAgICBpZiB1c2VfZmlsZV9pbmZvX2NsYXNzXG4gICAgICAgIHJldHVybiBbXCI8Zm9udCBjbGFzcz1cXFwiZmlsZS1leHRlbnNpb25cXFwiPjwje3dyYXBwZXJfY2xhc3N9IGRhdGEtdGFyZ2V0bmFtZT1cXFwiI3tmaWxlbmFtZX1cXFwiIGRhdGEtdGFyZ2V0dHlwZT1cXFwiZGlyZWN0b3J5XFxcIiBkYXRhLXRhcmdldD1cXFwiI3tmaWxlbmFtZX1cXFwiIGNsYXNzPVxcXCJjb25zb2xlLWxpbmsgaWNvbi1maWxlLWRpcmVjdG9yeSBwYXJlbnQtZm9sZGVyXFxcIj4je2ZpbGVuYW1lfTwvI3t3cmFwcGVyX2NsYXNzfT48L2ZvbnQ+XCIsIG51bGwsIGZpbGVuYW1lXVxuICAgICAgZWxzZVxuICAgICAgICAgIHJldHVybiBbXCI8Zm9udCBjbGFzcz1cXFwiZmlsZS1leHRlbnNpb25cXFwiPjwje3dyYXBwZXJfY2xhc3N9IGRhdGEtdGFyZ2V0bmFtZT1cXFwiI3tmaWxlbmFtZX1cXFwiIGRhdGEtdGFyZ2V0dHlwZT1cXFwiZGlyZWN0b3J5XFxcIiBkYXRhLXRhcmdldD1cXFwiI3tmaWxlbmFtZX1cXFwiIGNsYXNzPVxcXCJjb25zb2xlLWxpbmsgaWNvbi1maWxlLWRpcmVjdG9yeSBmaWxlLWluZm8gcGFyZW50LWZvbGRlclxcXCI+I3tmaWxlbmFtZX08LyN7d3JhcHBlcl9jbGFzc30+PC9mb250PlwiLCBudWxsLCBmaWxlbmFtZV1cblxuICAgIGZpbGVfZXhpc3RzID0gdHJ1ZVxuXG4gICAgZmlsZXBhdGggPSBAcmVzb2x2ZVBhdGggZmlsZW5hbWVcbiAgICBjbGFzc2VzID0gW11cbiAgICBkYXRhbmFtZSA9ICcnXG5cbiAgICBpZiBhdG9tLmNvbmZpZy5nZXQoJ2F0b20tdGVybWluYWwtcGFuZWwudXNlQXRvbUljb25zJylcbiAgICAgIGNsYXNzZXMucHVzaCAnbmFtZSdcbiAgICAgIGNsYXNzZXMucHVzaCAnaWNvbidcbiAgICAgIGNsYXNzZXMucHVzaCAnaWNvbi1maWxlLXRleHQnXG4gICAgICBkYXRhbmFtZSA9IGZpbGVwYXRoXG4gICAgZWxzZVxuICAgICAgY2xhc3Nlcy5wdXNoICduYW1lJ1xuXG4gICAgaWYgdXNlX2ZpbGVfaW5mb19jbGFzc1xuICAgICAgY2xhc3Nlcy5wdXNoICdmaWxlLWluZm8nXG5cbiAgICBzdGF0ID0gbnVsbFxuICAgIGlmIGZpbGVfZXhpc3RzXG4gICAgICB0cnlcbiAgICAgICAgc3RhdCA9IGZzLmxzdGF0U3luYyBmaWxlcGF0aFxuICAgICAgY2F0Y2ggZVxuICAgICAgICBmaWxlX2V4aXN0cyA9IGZhbHNlXG5cbiAgICBpZiBmaWxlX2V4aXN0c1xuICAgICAgaWYgYXRvbS5jb25maWcuZ2V0KCdhdG9tLXRlcm1pbmFsLXBhbmVsLmVuYWJsZUNvbnNvbGVJbnRlcmFjdGl2ZUxpbmtzJykgb3IgQHNwZWNzTW9kZVxuICAgICAgICBjbGFzc2VzLnB1c2ggJ2NvbnNvbGUtbGluaydcbiAgICAgIGlmIHN0YXQuaXNTeW1ib2xpY0xpbmsoKVxuICAgICAgICBjbGFzc2VzLnB1c2ggJ3N0YXQtbGluaydcbiAgICAgICAgc3RhdCA9IGZzLnN0YXRTeW5jIGZpbGVwYXRoXG4gICAgICAgIHRhcmdldF90eXBlID0gJ251bGwnXG4gICAgICBpZiBzdGF0LmlzRmlsZSgpXG4gICAgICAgIGlmIHN0YXQubW9kZSAmIDczICMwMTExXG4gICAgICAgICAgY2xhc3Nlcy5wdXNoICdzdGF0LXByb2dyYW0nXG4gICAgICAgICMgVE9ETyBjaGVjayBleHRlbnNpb25cbiAgICAgICAgbWF0Y2hlciA9IC8oLjopKCguKilcXFxcKSooKC4qXFwuKSopL2lnXG4gICAgICAgIGV4dGVuc2lvbiA9IGZpbGVwYXRoLnJlcGxhY2UgbWF0Y2hlciwgXCJcIlxuICAgICAgICBjbGFzc2VzLnB1c2ggQHV0aWwucmVwbGFjZUFsbCgnICcsICcnLCBleHRlbnNpb24pXG4gICAgICAgIGNsYXNzZXMucHVzaCAnaWNvbi1maWxlLXRleHQnXG4gICAgICAgIHRhcmdldF90eXBlID0gJ2ZpbGUnXG4gICAgICBpZiBzdGF0LmlzRGlyZWN0b3J5KClcbiAgICAgICAgY2xhc3Nlcy5wdXNoICdpY29uLWZpbGUtZGlyZWN0b3J5J1xuICAgICAgICB0YXJnZXRfdHlwZSA9ICdkaXJlY3RvcnknXG4gICAgICBpZiBzdGF0LmlzQ2hhcmFjdGVyRGV2aWNlKClcbiAgICAgICAgY2xhc3Nlcy5wdXNoICdzdGF0LWNoYXItZGV2J1xuICAgICAgICB0YXJnZXRfdHlwZSA9ICdkZXZpY2UnXG4gICAgICBpZiBzdGF0LmlzRklGTygpXG4gICAgICAgIGNsYXNzZXMucHVzaCAnc3RhdC1maWZvJ1xuICAgICAgICB0YXJnZXRfdHlwZSA9ICdmaWZvJ1xuICAgICAgaWYgc3RhdC5pc1NvY2tldCgpXG4gICAgICAgIGNsYXNzZXMucHVzaCAnc3RhdC1zb2NrJ1xuICAgICAgICB0YXJnZXRfdHlwZSA9ICdzb2NrJ1xuICAgIGVsc2VcbiAgICAgIGNsYXNzZXMucHVzaCAnZmlsZS1ub3QtZm91bmQnXG4gICAgICBjbGFzc2VzLnB1c2ggJ2ljb24tZmlsZS10ZXh0J1xuICAgICAgdGFyZ2V0X3R5cGUgPSAnZmlsZSdcbiAgICBpZiBmaWxlbmFtZVswXSA9PSAnLidcbiAgICAgIGNsYXNzZXMucHVzaCAnc3RhdHVzLWlnbm9yZWQnXG4gICAgICB0YXJnZXRfdHlwZSA9ICdpZ25vcmVkJ1xuXG4gICAgaHJlZiA9ICdmaWxlOi8vLycgKyBAdXRpbC5yZXBsYWNlQWxsKCdcXFxcJywgJy8nLCBmaWxlcGF0aClcblxuICAgIGNsYXNzZXMucHVzaCAnYXRwLXRvb2x0aXAnXG5cbiAgICBleGF0dHJzID0gW11cbiAgICBpZiBmaWxlbGluZT9cbiAgICAgIGV4YXR0cnMucHVzaCAnZGF0YS1saW5lPVwiJytmaWxlbGluZSsnXCInXG4gICAgaWYgZmlsZWNvbHVtbj9cbiAgICAgIGV4YXR0cnMucHVzaCAnZGF0YS1jb2x1bW49XCInK2ZpbGVjb2x1bW4rJ1wiJ1xuXG4gICAgZmlsZXBhdGhfdG9vbHRpcCA9IEB1dGlsLnJlcGxhY2VBbGwgJ1xcXFwnLCAnLycsIGZpbGVwYXRoXG4gICAgZmlsZXBhdGggPSBAdXRpbC5yZXBsYWNlQWxsICdcXFxcJywgJy8nLCBmaWxlcGF0aFxuICAgIFtcIjxmb250IGNsYXNzPVxcXCJmaWxlLWV4dGVuc2lvblxcXCI+PCN7d3JhcHBlcl9jbGFzc30gI3tleGF0dHJzLmpvaW4gJyAnfSB0b29sdGlwPVxcXCJcXFwiIGRhdGEtdGFyZ2V0bmFtZT1cXFwiI3tmaWxlbmFtZX1cXFwiIGRhdGEtdGFyZ2V0dHlwZT1cXFwiI3t0YXJnZXRfdHlwZX1cXFwiIGRhdGEtdGFyZ2V0PVxcXCIje2ZpbGVwYXRofVxcXCIgZGF0YS1uYW1lPVxcXCIje2RhdGFuYW1lfVxcXCIgY2xhc3M9XFxcIiN7Y2xhc3Nlcy5qb2luICcgJ31cXFwiIGRhdGEtdG9nZ2xlPVxcXCJ0b29sdGlwXFxcIiBkYXRhLXBsYWNlbWVudD1cXFwidG9wXFxcIiB0aXRsZT1cXFwiI3tmaWxlcGF0aF90b29sdGlwfVxcXCIgPiN7ZmlsZW5hbWV9PC8je3dyYXBwZXJfY2xhc3N9PjwvZm9udD5cIiwgc3RhdCwgZmlsZW5hbWVdXG5cbiAgZ2V0R2l0U3RhdHVzTmFtZTogKHBhdGgsIGdpdFJvb3QsIHJlcG8pIC0+XG4gICAgc3RhdHVzID0gKHJlcG8uZ2V0Q2FjaGVkUGF0aFN0YXR1cyBvciByZXBvLmdldFBhdGhTdGF0dXMpKHBhdGgpXG4gICAgaWYgc3RhdHVzXG4gICAgICBpZiByZXBvLmlzU3RhdHVzTW9kaWZpZWQgc3RhdHVzXG4gICAgICAgIHJldHVybiAnbW9kaWZpZWQnXG4gICAgICBpZiByZXBvLmlzU3RhdHVzTmV3IHN0YXR1c1xuICAgICAgICByZXR1cm4gJ2FkZGVkJ1xuICAgIGlmIHJlcG8uaXNQYXRoSWdub3JlIHBhdGhcbiAgICAgIHJldHVybiAnaWdub3JlZCdcblxuICBwcmVzZXJ2ZU9yaWdpbmFsUGF0aHM6ICh0ZXh0KSAtPlxuICAgIHRleHQgPSBAdXRpbC5yZXBsYWNlQWxsIEBnZXRDdXJyZW50RmlsZVBhdGgoKSwgJyUoZmlsZS1vcmlnaW5hbCknLCB0ZXh0XG4gICAgdGV4dCA9IEB1dGlsLnJlcGxhY2VBbGwgQGdldEN3ZCgpLCAnJShjd2Qtb3JpZ2luYWwpJywgdGV4dFxuICAgIHRleHQgPSBAdXRpbC5yZXBsYWNlQWxsIEBnZXRDd2QoKSwgJyUoY3dkLW9yaWdpbmFsKScsIHRleHRcbiAgICB0ZXh0ID0gQHV0aWwucmVwbGFjZUFsbCAnLycsICcmZnM7JywgdGV4dFxuICAgIHRleHQgPSBAdXRpbC5yZXBsYWNlQWxsICdcXFxcJywgJyZiczsnLCB0ZXh0XG4gICAgcmV0dXJuIHRleHRcblxuICBwYXJzZU1lc3NhZ2U6IChtZXNzYWdlLCBtYXRjaFNwZWM9dHJ1ZSwgcGFyc2VDdXN0b21SdWxlcz10cnVlKSAtPlxuICAgIGluc3RhbmNlID0gdGhpc1xuICAgIG1lc3NhZ2UgPSAnPGRpdj4nKyhpbnN0YW5jZS5wYXJzZU1lc3NhZ2VfIG1lc3NhZ2UsIGZhbHNlLCB0cnVlLCB0cnVlKSsnPC9kaXY+J1xuICAgIG4gPSAkKG1lc3NhZ2UpXG4gICAgbi5jb250ZW50cygpLmZpbHRlcigoKSAtPlxuICAgICAgcmV0dXJuIHRoaXMubm9kZVR5cGUgPT0gM1xuICAgICkuZWFjaCgoKSAtPlxuICAgICAgdGhpeiA9ICQodGhpcylcbiAgICAgIG91dCA9IHRoaXoudGV4dCgpXG4gICAgICBvdXQgPSBpbnN0YW5jZS5wYXJzZU1lc3NhZ2VfIG91dCwgbWF0Y2hTcGVjLCBwYXJzZUN1c3RvbVJ1bGVzXG4gICAgICB0aGl6LnJlcGxhY2VXaXRoKCc8c3Bhbj4nK291dCsnPC9zcGFuPicpXG4gICAgKVxuICAgIHJldHVybiBuLmh0bWwoKVxuXG4gIHBhcnNlTWVzc2FnZV86IChtZXNzYWdlLCBtYXRjaFNwZWM9dHJ1ZSwgcGFyc2VDdXN0b21SdWxlcz10cnVlLCBpc0ZvcmNlbHlQcmVwYXJzZXJpbmc9ZmFsc2UpIC0+XG4gICAgaWYgbWVzc2FnZSA9PSBudWxsXG4gICAgICByZXR1cm4gJydcbiAgICBpZiBtYXRjaFNwZWNcbiAgICAgIGlmIGF0b20uY29uZmlnLmdldCgnYXRvbS10ZXJtaW5hbC1wYW5lbC5YRXhwZXJpbWVudEVuYWJsZUZvcmNlTGlua2luZycpXG4gICAgICAgIGlmIGF0b20uY29uZmlnLmdldCgnYXRvbS10ZXJtaW5hbC1wYW5lbC50ZXh0UmVwbGFjZW1lbnRGaWxlQWRyZXNzJyk/XG4gICAgICAgICAgaWYgYXRvbS5jb25maWcuZ2V0KCdhdG9tLXRlcm1pbmFsLXBhbmVsLnRleHRSZXBsYWNlbWVudEZpbGVBZHJlc3MnKSAhPSAnJ1xuICAgICAgICAgICAgIyByZWdleCA9IC8oKFtBLVphLXpdOikoXFxcXHxcXC8pKT8oW0EtWmEteiRcXCpcXC0rJiNAIV9cXC5dKyhcXFxcfFxcLykpKFtBLVphLXogJFxcKlxcLSsmI0AhX1xcLl0rKFxcXFx8XFwvKSkqW0EtWmEtelxcLV8kXFwqXFwrJlxcXkAjXFwuIF0rXFwuW0EtWmEtelxcLV8kXFwqXFwrXSovaWdcbiAgICAgICAgICAgICMgcmVnZXggPSAvKChbQS1aYS16XTopKFxcXFx8XFwvKSk/KChbXlxccyNAJCUmITs8PlxcLlxcXjpdfCApKyhcXFxcfFxcLykpKCgoW15cXHMjQCQlJiE7PD5cXC5cXF46XXwgKSsoXFxcXHxcXC8pKSooW15cXHM8PjojQCQlXFxeO118ICkrKFxcLihbXlxccyNAJCUmITs8PlxcLjAtOTpcXF5dfCApKikqKT8vaWdcbiAgICAgICAgICAgIHJlZ2V4ID0gLyhcXC4oXFxcXHxcXC8pKT8oKFtBLVphLXpdOikoXFxcXHxcXC8pKT8oKFteXFxzI0AkJSYhOzw+XFwuXFxeOl18ICkrKFxcXFx8XFwvKSkoKChbXlxccyNAJCUmITs8PlxcLlxcXjpdfCApKyhcXFxcfFxcLykpKihbXlxcczw+OiNAJCVcXF47XXwgKSsoXFwuKFteXFxzI0AkJSYhOzw+XFwuMC05OlxcXl18ICkqKSopPy9pZ1xuICAgICAgICAgICAgcmVnZXgyID0gLyhcXC4oXFxcXHxcXC8pKSgoKFteXFxzI0AkJSYhOzw+XFwuXFxeOl18ICkrKFxcXFx8XFwvKSkqKFteXFxzPD46I0AkJVxcXjtdfCApKyhcXC4oW15cXHMjQCQlJiE7PD5cXC4wLTk6XFxeXXwgKSopKik/L2lnXG4gICAgICAgICAgICBtZXNzYWdlID0gbWVzc2FnZS5yZXBsYWNlIHJlZ2V4LCAobWF0Y2gsIHRleHQsIHVybElkKSA9PlxuICAgICAgICAgICAgICByZXR1cm4gQHBhcnNlU3BlY2lhbFN0cmluZ1RlbXBsYXRlIGF0b20uY29uZmlnLmdldCgnYXRvbS10ZXJtaW5hbC1wYW5lbC50ZXh0UmVwbGFjZW1lbnRGaWxlQWRyZXNzJyksIHtmaWxlOm1hdGNofVxuICAgICAgICAgICAgbWVzc2FnZSA9IG1lc3NhZ2UucmVwbGFjZSByZWdleDIsIChtYXRjaCwgdGV4dCwgdXJsSWQpID0+XG4gICAgICAgICAgICAgIHJldHVybiBAcGFyc2VTcGVjaWFsU3RyaW5nVGVtcGxhdGUgYXRvbS5jb25maWcuZ2V0KCdhdG9tLXRlcm1pbmFsLXBhbmVsLnRleHRSZXBsYWNlbWVudEZpbGVBZHJlc3MnKSwge2ZpbGU6bWF0Y2h9XG4gICAgICBlbHNlXG4gICAgICAgIGlmIGF0b20uY29uZmlnLmdldCgnYXRvbS10ZXJtaW5hbC1wYW5lbC50ZXh0UmVwbGFjZW1lbnRGaWxlQWRyZXNzJyk/XG4gICAgICAgICAgaWYgYXRvbS5jb25maWcuZ2V0KCdhdG9tLXRlcm1pbmFsLXBhbmVsLnRleHRSZXBsYWNlbWVudEZpbGVBZHJlc3MnKSAhPSAnJ1xuICAgICAgICAgICAgI3JlZ2V4ID0gLygoW0EtWmEtel06KShcXFxcfFxcLykpPyhbQS1aYS16JFxcKlxcLSsmI0AhX1xcLl0rKFxcXFx8XFwvKSkoW0EtWmEteiAkXFwqXFwtKyYjQCFfXFwuXSsoXFxcXHxcXC8pKSpbQS1aYS16XFwtXyRcXCpcXCsmXFxeQCNcXC4gXStcXC5bQS1aYS16XFwtXyRcXCpcXCtdKi9pZ1xuICAgICAgICAgICAgY3dkTiA9IEBnZXRDd2QoKVxuICAgICAgICAgICAgY3dkRSA9IEB1dGlsLnJlcGxhY2VBbGwgJy8nLCAnXFxcXCcsIEBnZXRDd2QoKVxuICAgICAgICAgICAgcmVnZXhTdHJpbmcgPScoJyArIChAdXRpbC5lc2NhcGVSZWdFeHAgY3dkTikgKyAnfCcgKyAoQHV0aWwuZXNjYXBlUmVnRXhwIGN3ZEUpICsgJylcXFxcXFxcXChbXlxcXFxzOiMkJV4mITpdfCApK1xcXFwuPyhbXlxcXFxzOiMkQCUmXFxcXCpcXFxcXiEwLTk6XFxcXC4rXFxcXC0sXFxcXFxcXFxcXFxcL1xcXCJdfCApKidcbiAgICAgICAgICAgIHJlZ2V4ID0gbmV3IFJlZ0V4cChyZWdleFN0cmluZywgJ2lnJylcbiAgICAgICAgICAgIG1lc3NhZ2UgPSBtZXNzYWdlLnJlcGxhY2UgcmVnZXgsIChtYXRjaCwgdGV4dCwgdXJsSWQpID0+XG4gICAgICAgICAgICAgIHJldHVybiBAcGFyc2VTcGVjaWFsU3RyaW5nVGVtcGxhdGUgYXRvbS5jb25maWcuZ2V0KCdhdG9tLXRlcm1pbmFsLXBhbmVsLnRleHRSZXBsYWNlbWVudEZpbGVBZHJlc3MnKSwge2ZpbGU6bWF0Y2h9XG4gICAgICBpZiBhdG9tLmNvbmZpZy5nZXQoJ2F0b20tdGVybWluYWwtcGFuZWwudGV4dFJlcGxhY2VtZW50Q3VycmVudEZpbGUnKT9cbiAgICAgICAgaWYgYXRvbS5jb25maWcuZ2V0KCdhdG9tLXRlcm1pbmFsLXBhbmVsLnRleHRSZXBsYWNlbWVudEN1cnJlbnRGaWxlJykgIT0gJydcbiAgICAgICAgICBwYXRoID0gQGdldEN1cnJlbnRGaWxlUGF0aCgpXG4gICAgICAgICAgcmVnZXggPSBuZXcgUmVnRXhwIEB1dGlsLmVzY2FwZVJlZ0V4cChwYXRoKSwgJ2cnXG4gICAgICAgICAgbWVzc2FnZSA9IG1lc3NhZ2UucmVwbGFjZSByZWdleCwgKG1hdGNoLCB0ZXh0LCB1cmxJZCkgPT5cbiAgICAgICAgICAgIHJldHVybiBAcGFyc2VTcGVjaWFsU3RyaW5nVGVtcGxhdGUgYXRvbS5jb25maWcuZ2V0KCdhdG9tLXRlcm1pbmFsLXBhbmVsLnRleHRSZXBsYWNlbWVudEN1cnJlbnRGaWxlJyksIHtmaWxlOm1hdGNofVxuICAgICAgbWVzc2FnZSA9IEBwcmVzZXJ2ZU9yaWdpbmFsUGF0aHMgbWVzc2FnZVxuICAgICAgaWYgYXRvbS5jb25maWcuZ2V0KCdhdG9tLXRlcm1pbmFsLXBhbmVsLnRleHRSZXBsYWNlbWVudEN1cnJlbnRQYXRoJyk/XG4gICAgICAgIGlmIGF0b20uY29uZmlnLmdldCgnYXRvbS10ZXJtaW5hbC1wYW5lbC50ZXh0UmVwbGFjZW1lbnRDdXJyZW50UGF0aCcpICE9ICcnXG4gICAgICAgICAgcGF0aCA9IEBnZXRDd2QoKVxuICAgICAgICAgIHJlZ2V4ID0gbmV3IFJlZ0V4cCBAdXRpbC5lc2NhcGVSZWdFeHAocGF0aCksICdnJ1xuICAgICAgICAgIG1lc3NhZ2UgPSBtZXNzYWdlLnJlcGxhY2UgcmVnZXgsIChtYXRjaCwgdGV4dCwgdXJsSWQpID0+XG4gICAgICAgICAgICByZXR1cm4gQHBhcnNlU3BlY2lhbFN0cmluZ1RlbXBsYXRlIGF0b20uY29uZmlnLmdldCgnYXRvbS10ZXJtaW5hbC1wYW5lbC50ZXh0UmVwbGFjZW1lbnRDdXJyZW50UGF0aCcpLCB7ZmlsZTptYXRjaH1cblxuXG4gICAgbWVzc2FnZSA9IEB1dGlsLnJlcGxhY2VBbGwgJyUoZmlsZS1vcmlnaW5hbCknLCBAZ2V0Q3VycmVudEZpbGVQYXRoKCksIG1lc3NhZ2VcbiAgICBtZXNzYWdlID0gQHV0aWwucmVwbGFjZUFsbCAnJShjd2Qtb3JpZ2luYWwpJywgQGdldEN3ZCgpLCBtZXNzYWdlXG4gICAgbWVzc2FnZSA9IEB1dGlsLnJlcGxhY2VBbGwgJyZmczsnLCAnLycsIG1lc3NhZ2VcbiAgICBtZXNzYWdlID0gQHV0aWwucmVwbGFjZUFsbCAnJmJzOycsICdcXFxcJywgbWVzc2FnZVxuXG4gICAgcnVsZXMgPSBBVFBDb3JlLmdldENvbmZpZygpLnJ1bGVzXG4gICAgZm9yIGtleSwgdmFsdWUgb2YgcnVsZXNcbiAgICAgIG1hdGNoRXhwID0ga2V5XG4gICAgICByZXBsRXhwID0gJyUoY29udGVudCknXG4gICAgICBtYXRjaEFsbExpbmUgPSBmYWxzZVxuICAgICAgbWF0Y2hOZXh0TGluZXMgPSAwXG4gICAgICBmbGFncyA9ICdnbSdcbiAgICAgIGZvcmNlUGFyc2UgPSBmYWxzZVxuXG4gICAgICBpZiB2YWx1ZS5tYXRjaD9cbiAgICAgICAgaWYgdmFsdWUubWF0Y2guZmxhZ3M/XG4gICAgICAgICAgZmxhZ3MgPSB2YWx1ZS5tYXRjaC5mbGFncy5qb2luICcnXG4gICAgICAgIGlmIHZhbHVlLm1hdGNoLnJlcGxhY2U/XG4gICAgICAgICAgcmVwbEV4cCA9IHZhbHVlLm1hdGNoLnJlcGxhY2VcbiAgICAgICAgaWYgdmFsdWUubWF0Y2gubWF0Y2hMaW5lP1xuICAgICAgICAgIG1hdGNoQWxsTGluZSA9IHZhbHVlLm1hdGNoLm1hdGNoTGluZVxuICAgICAgICBpZiB2YWx1ZS5tYXRjaC5tYXRjaE5leHRMaW5lcz9cbiAgICAgICAgICBtYXRjaE5leHRMaW5lcyA9IHZhbHVlLm1hdGNoLm1hdGNoTmV4dExpbmVzXG4gICAgICAgIGlmIHZhbHVlLm1hdGNoLmZvcmNlZD9cbiAgICAgICAgICBmb3JjZVBhcnNlID0gdmFsdWUubWF0Y2guZm9yY2VkXG5cbiAgICAgIGlmIChmb3JjZVBhcnNlIG9yIHBhcnNlQ3VzdG9tUnVsZXMpIGFuZCAoKGlzRm9yY2VseVByZXBhcnNlcmluZyBhbmQgZm9yY2VQYXJzZSkgb3IgKG5vdCBpc0ZvcmNlbHlQcmVwYXJzZXJpbmcpKVxuICAgICAgICBpZiBtYXRjaEFsbExpbmVcbiAgICAgICAgICBtYXRjaEV4cCA9ICcuKicgKyBtYXRjaEV4cFxuXG4gICAgICAgIGlmIG1hdGNoTmV4dExpbmVzID4gMFxuICAgICAgICAgIGZvciBpIGluIFswLi5tYXRjaE5leHRMaW5lc10gYnkgMVxuICAgICAgICAgICAgbWF0Y2hFeHAgPSBtYXRjaEV4cCArICdbXFxcXHJcXFxcbl0uKic7XG5cbiAgICAgICAgcmVnZXggPSBuZXcgUmVnRXhwKG1hdGNoRXhwLCBmbGFncylcblxuICAgICAgICBtZXNzYWdlID0gbWVzc2FnZS5yZXBsYWNlIHJlZ2V4LCAobWF0Y2gsIGdyb3Vwcy4uLikgPT5cbiAgICAgICAgICBzdHlsZSA9ICcnXG4gICAgICAgICAgaWYgdmFsdWUuY3NzP1xuICAgICAgICAgICAgc3R5bGUgPSBBVFBDb3JlLmpzb25Dc3NUb0lubGluZVN0eWxlIHZhbHVlLmNzc1xuICAgICAgICAgIGVsc2UgaWYgbm90IHZhbHVlLm1hdGNoP1xuICAgICAgICAgICAgc3R5bGUgPSBBVFBDb3JlLmpzb25Dc3NUb0lubGluZVN0eWxlIHZhbHVlXG4gICAgICAgICAgdmFycyA9XG4gICAgICAgICAgICBjb250ZW50OiBtYXRjaFxuICAgICAgICAgICAgMDogbWF0Y2hcblxuICAgICAgICAgIGdyb3Vwc051bWJlciA9IGdyb3Vwcy5sZW5ndGgtMVxuICAgICAgICAgIGZvciBpIGluIFswLi5ncm91cHNOdW1iZXJdIGJ5IDFcbiAgICAgICAgICAgIGlmIGdyb3Vwc1tpXT9cbiAgICAgICAgICAgICAgdmFyc1tpKzFdID0gZ3JvdXBzW2ldXG5cbiAgICAgICAgICAjIGNvbnNvbGUubG9nICdBY3RpdmUgcnVsZSA9PiAnK21hdGNoRXhwXG4gICAgICAgICAgcmVwbCA9IEBwYXJzZVNwZWNpYWxTdHJpbmdUZW1wbGF0ZSByZXBsRXhwLCB2YXJzXG4gICAgICAgICAgcmV0dXJuIFwiPGZvbnQgc3R5bGU9XFxcIiN7c3R5bGV9XFxcIj4je3JlcGx9PC9mb250PlwiXG5cbiAgICBtZXNzYWdlID0gQHV0aWwucmVwbGFjZUFsbCAnJShmaWxlLW9yaWdpbmFsKScsIEBnZXRDdXJyZW50RmlsZVBhdGgoKSwgbWVzc2FnZVxuICAgIG1lc3NhZ2UgPSBAdXRpbC5yZXBsYWNlQWxsICclKGN3ZC1vcmlnaW5hbCknLCBAZ2V0Q3dkKCksIG1lc3NhZ2VcbiAgICBtZXNzYWdlID0gQHV0aWwucmVwbGFjZUFsbCAnJmZzOycsICcvJywgbWVzc2FnZVxuICAgIG1lc3NhZ2UgPSBAdXRpbC5yZXBsYWNlQWxsICcmYnM7JywgJ1xcXFwnLCBtZXNzYWdlXG5cbiAgICByZXR1cm4gbWVzc2FnZVxuXG4gIHJlZGlyZWN0OiAoc3RyZWFtTmFtZSkgLT5cbiAgICBAcmVkaXJlY3RPdXRwdXQgPSBzdHJlYW1OYW1lXG5cbiAgcmF3TWVzc2FnZTogKG1lc3NhZ2UpIC0+XG4gICAgaWYgQHJlZGlyZWN0T3V0cHV0ID09ICdjb25zb2xlJ1xuICAgICAgY29uc29sZS5sb2cgbWVzc2FnZVxuICAgICAgcmV0dXJuXG5cbiAgICBAY2xpT3V0cHV0LmFwcGVuZCBtZXNzYWdlXG4gICAgQHNob3dDbWQoKVxuICAgIEBzdGF0dXNJY29uLnJlbW92ZUNsYXNzICdzdGF0dXMtZXJyb3InXG4gICAgQHN0YXR1c0ljb24uYWRkQ2xhc3MgJ3N0YXR1cy1zdWNjZXNzJ1xuICAgICMgQHBhcnNlU3BlY2lhbE5vZGVzKClcblxuICBtZXNzYWdlOiAobWVzc2FnZSwgbWF0Y2hTcGVjPXRydWUpIC0+XG4gICAgaWYgQHJlZGlyZWN0T3V0cHV0ID09ICdjb25zb2xlJ1xuICAgICAgY29uc29sZS5sb2cgbWVzc2FnZVxuICAgICAgcmV0dXJuXG5cbiAgICBpZiB0eXBlb2YgbWVzc2FnZSBpcyAnb2JqZWN0J1xuICAgICAgbWVzID0gbWVzc2FnZVxuICAgIGVsc2VcbiAgICAgIGlmIG5vdCBtZXNzYWdlP1xuICAgICAgICByZXR1cm5cbiAgICAgIG1lcyA9IG1lc3NhZ2Uuc3BsaXQgJyUoYnJlYWspJ1xuICAgICAgaWYgbWVzLmxlbmd0aCA+IDFcbiAgICAgICAgZm9yIG0gaW4gbWVzXG4gICAgICAgICAgQG1lc3NhZ2UgbVxuICAgICAgICByZXR1cm5cbiAgICAgIGVsc2VcbiAgICAgICAgbWVzID0gbWVzWzBdXG4gICAgICBtZXMgPSBAcGFyc2VNZXNzYWdlIG1lc3NhZ2UsIG1hdGNoU3BlYywgbWF0Y2hTcGVjXG4gICAgICBtZXMgPSBAdXRpbC5yZXBsYWNlQWxsICclKHJhdyknLCAnJywgbWVzXG4gICAgICBtZXMgPSBAcGFyc2VUZW1wbGF0ZSBtZXMsIFtdLCB0cnVlXG5cbiAgICAjIG1lcyA9IEB1dGlsLnJlcGxhY2VBbGwgJzwnLCAnJmx0OycsIG1lc1xuICAgICMgbWVzID0gQHV0aWwucmVwbGFjZUFsbCAnPicsICcmZ3Q7JywgbWVzXG4gICAgQGNsaU91dHB1dC5hcHBlbmQgbWVzXG4gICAgQHNob3dDbWQoKVxuICAgIEBzdGF0dXNJY29uLnJlbW92ZUNsYXNzICdzdGF0dXMtZXJyb3InXG4gICAgQHN0YXR1c0ljb24uYWRkQ2xhc3MgJ3N0YXR1cy1zdWNjZXNzJ1xuICAgIEBwYXJzZVNwZWNpYWxOb2RlcygpXG4gICAgQHNjcm9sbFRvQm90dG9tKClcbiAgICAjIEBwdXRJbnB1dEJveCgpXG5cbiAgZXJyb3JNZXNzYWdlOiAobWVzc2FnZSkgLT5cbiAgICBAY2xpT3V0cHV0LmFwcGVuZCBAcGFyc2VNZXNzYWdlKG1lc3NhZ2UpXG4gICAgQHNob3dDbWQoKVxuICAgIEBzdGF0dXNJY29uLnJlbW92ZUNsYXNzICdzdGF0dXMtc3VjY2VzcydcbiAgICBAc3RhdHVzSWNvbi5hZGRDbGFzcyAnc3RhdHVzLWVycm9yJ1xuICAgIEBwYXJzZVNwZWNpYWxOb2RlcygpXG5cbiAgY29ycmVjdEZpbGVQYXRoOiAocGF0aCkgLT5cbiAgICByZXR1cm4gQHV0aWwucmVwbGFjZUFsbCAnXFxcXCcsICcvJywgcGF0aFxuXG4gIGdldEN3ZDogLT5cbiAgICBpZiBub3QgYXRvbS5wcm9qZWN0P1xuICAgICAgcmV0dXJuIG51bGxcbiAgICBleHRGaWxlID0gZXh0bmFtZSBhdG9tLnByb2plY3QucGF0aFxuXG4gICAgaWYgZXh0RmlsZSA9PSBcIlwiXG4gICAgICBpZiBhdG9tLnByb2plY3QucGF0aFxuICAgICAgICBwcm9qZWN0RGlyID0gYXRvbS5wcm9qZWN0LnBhdGhcbiAgICAgIGVsc2VcbiAgICAgICAgaWYgcHJvY2Vzcy5lbnYuSE9NRVxuICAgICAgICAgIHByb2plY3REaXIgPSBwcm9jZXNzLmVudi5IT01FXG4gICAgICAgIGVsc2UgaWYgcHJvY2Vzcy5lbnYuVVNFUlBST0ZJTEVcbiAgICAgICAgICBwcm9qZWN0RGlyID0gcHJvY2Vzcy5lbnYuVVNFUlBST0ZJTEVcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHByb2plY3REaXIgPSAnLydcbiAgICBlbHNlXG4gICAgICBwcm9qZWN0RGlyID0gZGlybmFtZSBhdG9tLnByb2plY3QucGF0aFxuXG4gICAgY3dkID0gQGN3ZCBvciBwcm9qZWN0RGlyIG9yIEB1c2VySG9tZVxuICAgIHJldHVybiBAY29ycmVjdEZpbGVQYXRoIGN3ZFxuXG4gIHNwYXduOiAoaW5wdXRDbWQsIGNtZCwgYXJncykgPT5cbiAgICAjIyBAY21kRWRpdG9yLmhpZGUoKVxuICAgICMjIGh0bWxTdHJlYW0gPSBhbnNpaHRtbCgpXG4gICAgIyBodG1sU3RyZWFtID0gaWNvbnYuZGVjb2RlU3RyZWFtIEBzdHJlYW1zRW5jb2RpbmdcbiAgICAjIGh0bWxTdHJlYW0ub24gJ2RhdGEnLCAoZGF0YSkgPT5cbiAgICAjIyBAY2xpT3V0cHV0LmFwcGVuZCBkYXRhXG4gICAgIyBAbWVzc2FnZSBkYXRhXG4gICAgIyBAc2Nyb2xsVG9Cb3R0b20oKVxuICAgICMgdHJ5XG4gICAgIyMgQHByb2dyYW0gPSBzcGF3biBjbWQsIGFyZ3MsIHN0ZGlvOiAncGlwZScsIGVudjogcHJvY2Vzcy5lbnYsIGN3ZDogQGdldEN3ZCgpXG4gICAgIyBAcHJvZ3JhbSA9IGV4ZWMgaW5wdXRDbWQsIHN0ZGlvOiAncGlwZScsIGVudjogcHJvY2Vzcy5lbnYsIGN3ZDogQGdldEN3ZCgpXG4gICAgIyMgQHByb2dyYW0uc3RkaW4ucGlwZSBodG1sU3RyZWFtXG4gICAgIyBAcHJvZ3JhbS5zdGRvdXQucGlwZSBodG1sU3RyZWFtXG4gICAgIyBAcHJvZ3JhbS5zdGRlcnIucGlwZSBodG1sU3RyZWFtXG4gICAgIyMgQHByb2dyYW0uc3Rkb3V0LnNldEVuY29kaW5nIEBzdHJlYW1zRW5jb2RpbmdcbiAgICBAc3Bhd25Qcm9jZXNzQWN0aXZlID0gdHJ1ZVxuXG4gICAgaW5zdGFuY2UgPSB0aGlzXG4gICAgZGF0YUNhbGxiYWNrID0gKGRhdGEpIC0+XG4gICAgICBpbnN0YW5jZS5tZXNzYWdlKGRhdGEpXG4gICAgICBpbnN0YW5jZS5zY3JvbGxUb0JvdHRvbSgpXG5cbiAgICBodG1sU3RyZWFtID0gYW5zaWh0bWwoKVxuICAgIGh0bWxTdHJlYW0ub24gJ2RhdGEnLCAoZGF0YSkgPT5cbiAgICAgIHNldFRpbWVvdXQgKCktPlxuICAgICAgICBkYXRhQ2FsbGJhY2soZGF0YSk7XG4gICAgICAsIDEwMFxuICAgIHRyeVxuICAgICAgQHByb2dyYW0gPSBleGVjIGlucHV0Q21kLCBzdGRpbzogJ3BpcGUnLCBlbnY6IHByb2Nlc3MuZW52LCBjd2Q6IEBnZXRDd2QoKVxuICAgICAgQHByb2dyYW0uc3Rkb3V0LnBpcGUgaHRtbFN0cmVhbVxuICAgICAgQHByb2dyYW0uc3RkZXJyLnBpcGUgaHRtbFN0cmVhbVxuXG4gICAgICBAc3RhdHVzSWNvbi5yZW1vdmVDbGFzcyAnc3RhdHVzLXN1Y2Nlc3MnXG4gICAgICBAc3RhdHVzSWNvbi5yZW1vdmVDbGFzcyAnc3RhdHVzLWVycm9yJ1xuICAgICAgQHN0YXR1c0ljb24uYWRkQ2xhc3MgJ3N0YXR1cy1ydW5uaW5nJ1xuICAgICAgQGtpbGxCdG4ucmVtb3ZlQ2xhc3MgJ2hpZGUnXG4gICAgICBAcHJvZ3JhbS5vbmNlICdleGl0JywgKGNvZGUpID0+XG4gICAgICAgIGNvbnNvbGUubG9nICdleGl0JywgY29kZSBpZiBhdG9tLmNvbmZpZy5nZXQoJ2F0b20tdGVybWluYWwtcGFuZWwubG9nQ29uc29sZScpIG9yIEBzcGVjc01vZGVcbiAgICAgICAgQGtpbGxCdG4uYWRkQ2xhc3MgJ2hpZGUnXG4gICAgICAgIEBzdGF0dXNJY29uLnJlbW92ZUNsYXNzICdzdGF0dXMtcnVubmluZydcbiAgICAgICAgIyByZW1vdmVDbGFzcyBAc3RhdHVzSWNvbiwgJ3N0YXR1cy1lcnJvcidcbiAgICAgICAgQHByb2dyYW0gPSBudWxsXG4gICAgICAgIEBzdGF0dXNJY29uLmFkZENsYXNzIGNvZGUgPT0gMCBhbmQgJ3N0YXR1cy1zdWNjZXNzJyBvciAnc3RhdHVzLWVycm9yJ1xuICAgICAgICBAc2hvd0NtZCgpXG4gICAgICAgIEBzcGF3blByb2Nlc3NBY3RpdmUgPSBmYWxzZVxuICAgICAgQHByb2dyYW0ub24gJ2Vycm9yJywgKGVycikgPT5cbiAgICAgICAgY29uc29sZS5sb2cgJ2Vycm9yJyBpZiBhdG9tLmNvbmZpZy5nZXQoJ2F0b20tdGVybWluYWwtcGFuZWwubG9nQ29uc29sZScpIG9yIEBzcGVjc01vZGVcbiAgICAgICAgQG1lc3NhZ2UoZXJyLm1lc3NhZ2UpXG4gICAgICAgIEBzaG93Q21kKClcbiAgICAgICAgQHN0YXR1c0ljb24uYWRkQ2xhc3MgJ3N0YXR1cy1lcnJvcidcbiAgICAgIEBwcm9ncmFtLnN0ZG91dC5vbiAnZGF0YScsID0+XG4gICAgICAgIEBmbGFzaEljb25DbGFzcyAnc3RhdHVzLWluZm8nXG4gICAgICAgIEBzdGF0dXNJY29uLnJlbW92ZUNsYXNzICdzdGF0dXMtZXJyb3InXG4gICAgICBAcHJvZ3JhbS5zdGRlcnIub24gJ2RhdGEnLCA9PlxuICAgICAgICBjb25zb2xlLmxvZyAnc3RkZXJyJyBpZiBhdG9tLmNvbmZpZy5nZXQoJ2F0b20tdGVybWluYWwtcGFuZWwubG9nQ29uc29sZScpIG9yIEBzcGVjc01vZGVcbiAgICAgICAgQGZsYXNoSWNvbkNsYXNzICdzdGF0dXMtZXJyb3InLCAzMDBcblxuICAgIGNhdGNoIGVyclxuICAgICAgQG1lc3NhZ2UgKGVyci5tZXNzYWdlKVxuICAgICAgQHNob3dDbWQoKVxuIl19
