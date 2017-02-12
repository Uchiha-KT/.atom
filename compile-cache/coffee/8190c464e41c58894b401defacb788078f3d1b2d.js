
/*
  Atom-terminal-panel
  Copyright by isis97
  MIT licensed

  The panel, which manages all the terminal instances.
 */

(function() {
  var $, ATPOutputView, ATPPanel, View, ref,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ref = include('atom-space-pen-views'), $ = ref.$, View = ref.View;

  ATPOutputView = include('atp-view');

  module.exports = ATPPanel = (function(superClass) {
    extend(ATPPanel, superClass);

    function ATPPanel() {
      return ATPPanel.__super__.constructor.apply(this, arguments);
    }

    ATPPanel.content = function() {
      return this.div({
        "class": 'atp-panel inline-block'
      }, (function(_this) {
        return function() {
          _this.span({
            outlet: 'termStatusContainer'
          }, function() {
            return _this.span({
              click: 'newTermClick',
              "class": "atp-panel icon icon-plus"
            });
          });
          return _this.span({
            outlet: 'termStatusInfo',
            style: 'position:absolute;right:10%;'
          });
        };
      })(this));
    };

    ATPPanel.prototype.commandViews = [];

    ATPPanel.prototype.activeIndex = 0;

    ATPPanel.prototype.initialize = function(serializeState) {
      var getSelectedText;
      getSelectedText = function() {
        var text;
        text = '';
        if (window.getSelection) {
          text = window.getSelection().toString();
        } else if (document.selection && document.selection.type !== "Control") {
          text = document.selection.createRange().text;
        }
        return text;
      };
      atom.commands.add('atom-workspace', {
        'atom-terminal-panel:context-copy-and-execute-output-selection': (function(_this) {
          return function() {
            return _this.runInCurrentView(function(i) {
              var t;
              t = getSelectedText();
              atom.clipboard.write(t);
              return i.onCommand(t);
            });
          };
        })(this),
        'atom-terminal-panel:context-copy-output-selection': (function(_this) {
          return function() {
            return _this.runInCurrentView(function(i) {
              return atom.clipboard.write(getSelectedText());
            });
          };
        })(this),
        'atom-terminal-panel:context-copy-raw-output': (function(_this) {
          return function() {
            return _this.runInCurrentView(function(i) {
              return atom.clipboard.write(i.getRawOutput());
            });
          };
        })(this),
        'atom-terminal-panel:context-copy-html-output': (function(_this) {
          return function() {
            return _this.runInCurrentView(function(i) {
              return atom.clipboard.write(i.getHtmlOutput());
            });
          };
        })(this),
        'atom-terminal-panel:new': (function(_this) {
          return function() {
            return _this.newTermClick();
          };
        })(this),
        'atom-terminal-panel:toggle': (function(_this) {
          return function() {
            return _this.toggle();
          };
        })(this),
        'atom-terminal-panel:next': (function(_this) {
          return function() {
            return _this.activeNextCommandView();
          };
        })(this),
        'atom-terminal-panel:prev': (function(_this) {
          return function() {
            return _this.activePrevCommandView();
          };
        })(this),
        'atom-terminal-panel:hide': (function(_this) {
          return function() {
            return _this.runInCurrentView(function(i) {
              return i.close();
            });
          };
        })(this),
        'atom-terminal-panel:destroy': (function(_this) {
          return function() {
            return _this.runInCurrentView(function(i) {
              return i.destroy();
            });
          };
        })(this),
        'atom-terminal-panel:compile': (function(_this) {
          return function() {
            return _this.getForcedActiveCommandView().compile();
          };
        })(this),
        'atom-terminal-panel:toggle-autocompletion': (function(_this) {
          return function() {
            return _this.runInCurrentView(function(i) {
              return i.toggleAutoCompletion();
            });
          };
        })(this),
        'atom-terminal-panel:reload-config': (function(_this) {
          return function() {
            return _this.runInCurrentView(function(i) {
              i.clear();
              i.reloadSettings();
              return i.clear();
            });
          };
        })(this),
        'atom-terminal-panel:show-command-finder': (function(_this) {
          return function() {
            return _this.runInCurrentView(function(i) {
              return i.getLocalCommandsMemdump();
            });
          };
        })(this),
        'atom-terminal-panel:open-config': (function(_this) {
          return function() {
            return _this.runInCurrentView(function(i) {
              return i.showSettings();
            });
          };
        })(this)
      });
      this.createCommandView();
      return this.attach();
    };

    ATPPanel.prototype.updateStatusBarTask = function(instance, delay) {
      if (delay == null) {
        delay = 1000;
      }
      return setTimeout((function(_this) {
        return function() {
          if (instance != null) {
            _this.updateStatusBar(instance);
          } else {
            _this.updateStatusBar(_this.commandViews[0]);
          }
          return _this.updateStatusBarTask(instance, delay);
        };
      })(this), delay);
    };

    ATPPanel.prototype.updateStatusBar = function(instance) {
      if (instance == null) {
        return;
      }
      this.termStatusInfo.children().remove();
      return this.termStatusInfo.append(instance.parseTemplate(atom.config.get('atom-terminal-panel.statusBarText'), [], true));
    };

    ATPPanel.prototype.createCommandView = function() {
      var commandOutputView, termStatus;
      termStatus = $('<span class="atp-panel icon icon-terminal"></span>');
      commandOutputView = new ATPOutputView;
      commandOutputView.statusIcon = termStatus;
      commandOutputView.statusView = this;
      this.commandViews.push(commandOutputView);
      termStatus.click((function(_this) {
        return function() {
          return commandOutputView.toggle();
        };
      })(this));
      this.termStatusContainer.append(termStatus);
      commandOutputView.init();
      this.updateStatusBar(commandOutputView);
      return commandOutputView;
    };

    ATPPanel.prototype.activeNextCommandView = function() {
      return this.activeCommandView(this.activeIndex + 1);
    };

    ATPPanel.prototype.activePrevCommandView = function() {
      return this.activeCommandView(this.activeIndex - 1);
    };

    ATPPanel.prototype.activeCommandView = function(index) {
      if (index >= this.commandViews.length) {
        index = 0;
      }
      if (index < 0) {
        index = this.commandViews.length - 1;
      }
      this.updateStatusBar(this.commandViews[index]);
      return this.commandViews[index] && this.commandViews[index].open();
    };

    ATPPanel.prototype.getActiveCommandView = function() {
      return this.commandViews[this.activeIndex];
    };

    ATPPanel.prototype.runInCurrentView = function(call) {
      var v;
      v = this.getForcedActiveCommandView();
      if (v != null) {
        return call(v);
      }
      return null;
    };

    ATPPanel.prototype.getForcedActiveCommandView = function() {
      var ret;
      if (this.getActiveCommandView() !== null && this.getActiveCommandView() !== void 0) {
        return this.getActiveCommandView();
      }
      ret = this.activeCommandView(0);
      this.toggle();
      return ret;
    };

    ATPPanel.prototype.setActiveCommandView = function(commandView) {
      this.activeIndex = this.commandViews.indexOf(commandView);
      return this.updateStatusBar(this.commandViews[this.activeIndex]);
    };

    ATPPanel.prototype.removeCommandView = function(commandView) {
      var index;
      index = this.commandViews.indexOf(commandView);
      return index >= 0 && this.commandViews.splice(index, 1);
    };

    ATPPanel.prototype.newTermClick = function() {
      return this.createCommandView().toggle();
    };

    ATPPanel.prototype.attach = function() {
      return atom.workspace.addBottomPanel({
        item: this,
        priority: 100
      });
    };

    ATPPanel.prototype.destroyActiveTerm = function() {
      var ref1;
      return (ref1 = this.commandViews[this.activeIndex]) != null ? ref1.destroy() : void 0;
    };

    ATPPanel.prototype.closeAll = function() {
      var index, j, o, ref1, results;
      results = [];
      for (index = j = ref1 = this.commandViews.length; ref1 <= 0 ? j <= 0 : j >= 0; index = ref1 <= 0 ? ++j : --j) {
        o = this.commandViews[index];
        if (o != null) {
          results.push(o.close());
        } else {
          results.push(void 0);
        }
      }
      return results;
    };

    ATPPanel.prototype.destroy = function() {
      var index, j, ref1;
      for (index = j = ref1 = this.commandViews.length; ref1 <= 0 ? j <= 0 : j >= 0; index = ref1 <= 0 ? ++j : --j) {
        this.removeCommandView(this.commandViews[index]);
      }
      return this.detach();
    };

    ATPPanel.prototype.toggle = function() {
      if (this.commandViews[this.activeIndex] == null) {
        this.createCommandView();
      }
      this.updateStatusBar(this.commandViews[this.activeIndex]);
      return this.commandViews[this.activeIndex].toggle();
    };

    return ATPPanel;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy91Y2hpaGEvLmF0b20vcGFja2FnZXMvYXRvbS10ZXJtaW5hbC1wYW5lbC9saWIvYXRwLXBhbmVsLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7O0FBQUE7QUFBQSxNQUFBLHFDQUFBO0lBQUE7OztFQVFBLE1BQVksT0FBQSxDQUFRLHNCQUFSLENBQVosRUFBQyxTQUFELEVBQUk7O0VBQ0osYUFBQSxHQUFnQixPQUFBLENBQVEsVUFBUjs7RUFFaEIsTUFBTSxDQUFDLE9BQVAsR0FDTTs7Ozs7OztJQUNKLFFBQUMsQ0FBQSxPQUFELEdBQVUsU0FBQTthQUNSLElBQUMsQ0FBQSxHQUFELENBQUs7UUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLHdCQUFQO09BQUwsRUFBc0MsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO1VBQ3BDLEtBQUMsQ0FBQSxJQUFELENBQU07WUFBQSxNQUFBLEVBQVEscUJBQVI7V0FBTixFQUFxQyxTQUFBO21CQUNuQyxLQUFDLENBQUEsSUFBRCxDQUFNO2NBQUEsS0FBQSxFQUFPLGNBQVA7Y0FBdUIsQ0FBQSxLQUFBLENBQUEsRUFBTywwQkFBOUI7YUFBTjtVQURtQyxDQUFyQztpQkFFQSxLQUFDLENBQUEsSUFBRCxDQUFNO1lBQUEsTUFBQSxFQUFRLGdCQUFSO1lBQTBCLEtBQUEsRUFBTyw4QkFBakM7V0FBTjtRQUhvQztNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdEM7SUFEUTs7dUJBTVYsWUFBQSxHQUFjOzt1QkFDZCxXQUFBLEdBQWE7O3VCQUNiLFVBQUEsR0FBWSxTQUFDLGNBQUQ7QUFFVixVQUFBO01BQUEsZUFBQSxHQUFrQixTQUFBO0FBQ2hCLFlBQUE7UUFBQSxJQUFBLEdBQU87UUFDUCxJQUFHLE1BQU0sQ0FBQyxZQUFWO1VBQ0UsSUFBQSxHQUFPLE1BQU0sQ0FBQyxZQUFQLENBQUEsQ0FBcUIsQ0FBQyxRQUF0QixDQUFBLEVBRFQ7U0FBQSxNQUVLLElBQUcsUUFBUSxDQUFDLFNBQVQsSUFBdUIsUUFBUSxDQUFDLFNBQVMsQ0FBQyxJQUFuQixLQUEyQixTQUFyRDtVQUNILElBQUEsR0FBTyxRQUFRLENBQUMsU0FBUyxDQUFDLFdBQW5CLENBQUEsQ0FBZ0MsQ0FBQyxLQURyQzs7QUFFTCxlQUFPO01BTlM7TUFRbEIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLGdCQUFsQixFQUNFO1FBQUEsK0RBQUEsRUFBaUUsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQTttQkFBRyxLQUFDLENBQUEsZ0JBQUQsQ0FBa0IsU0FBQyxDQUFEO0FBQ3BGLGtCQUFBO2NBQUEsQ0FBQSxHQUFJLGVBQUEsQ0FBQTtjQUNKLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBZixDQUFxQixDQUFyQjtxQkFDQSxDQUFDLENBQUMsU0FBRixDQUFZLENBQVo7WUFIb0YsQ0FBbEI7VUFBSDtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBakU7UUFJQSxtREFBQSxFQUFxRCxDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFBO21CQUFHLEtBQUMsQ0FBQSxnQkFBRCxDQUFrQixTQUFDLENBQUQ7cUJBQ3hFLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBZixDQUFxQixlQUFBLENBQUEsQ0FBckI7WUFEd0UsQ0FBbEI7VUFBSDtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FKckQ7UUFNQSw2Q0FBQSxFQUErQyxDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFBO21CQUFHLEtBQUMsQ0FBQSxnQkFBRCxDQUFrQixTQUFDLENBQUQ7cUJBQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFmLENBQXFCLENBQUMsQ0FBQyxZQUFGLENBQUEsQ0FBckI7WUFBUCxDQUFsQjtVQUFIO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQU4vQztRQU9BLDhDQUFBLEVBQWdELENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7bUJBQUcsS0FBQyxDQUFBLGdCQUFELENBQWtCLFNBQUMsQ0FBRDtxQkFBTyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQWYsQ0FBcUIsQ0FBQyxDQUFDLGFBQUYsQ0FBQSxDQUFyQjtZQUFQLENBQWxCO1VBQUg7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBUGhEO1FBUUEseUJBQUEsRUFBMkIsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQTttQkFBRyxLQUFDLENBQUEsWUFBRCxDQUFBO1VBQUg7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBUjNCO1FBU0EsNEJBQUEsRUFBOEIsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQTttQkFBRyxLQUFDLENBQUEsTUFBRCxDQUFBO1VBQUg7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBVDlCO1FBVUEsMEJBQUEsRUFBNEIsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQTttQkFBRyxLQUFDLENBQUEscUJBQUQsQ0FBQTtVQUFIO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQVY1QjtRQVdBLDBCQUFBLEVBQTRCLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7bUJBQUcsS0FBQyxDQUFBLHFCQUFELENBQUE7VUFBSDtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FYNUI7UUFZQSwwQkFBQSxFQUE0QixDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFBO21CQUFHLEtBQUMsQ0FBQSxnQkFBRCxDQUFrQixTQUFDLENBQUQ7cUJBQU8sQ0FBQyxDQUFDLEtBQUYsQ0FBQTtZQUFQLENBQWxCO1VBQUg7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBWjVCO1FBYUEsNkJBQUEsRUFBK0IsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQTttQkFBSSxLQUFDLENBQUEsZ0JBQUQsQ0FBa0IsU0FBQyxDQUFEO3FCQUNuRCxDQUFDLENBQUMsT0FBRixDQUFBO1lBRG1ELENBQWxCO1VBQUo7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBYi9CO1FBZUEsNkJBQUEsRUFBK0IsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQTttQkFBRyxLQUFDLENBQUEsMEJBQUQsQ0FBQSxDQUE2QixDQUFDLE9BQTlCLENBQUE7VUFBSDtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FmL0I7UUFnQkEsMkNBQUEsRUFBNkMsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQTttQkFBRyxLQUFDLENBQUEsZ0JBQUQsQ0FBa0IsU0FBQyxDQUFEO3FCQUFPLENBQUMsQ0FBQyxvQkFBRixDQUFBO1lBQVAsQ0FBbEI7VUFBSDtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FoQjdDO1FBaUJBLG1DQUFBLEVBQXFDLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7bUJBQUcsS0FBQyxDQUFBLGdCQUFELENBQWtCLFNBQUMsQ0FBRDtjQUN4RCxDQUFDLENBQUMsS0FBRixDQUFBO2NBQ0EsQ0FBQyxDQUFDLGNBQUYsQ0FBQTtxQkFDQSxDQUFDLENBQUMsS0FBRixDQUFBO1lBSHdELENBQWxCO1VBQUg7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBakJyQztRQXFCQSx5Q0FBQSxFQUEyQyxDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFBO21CQUFHLEtBQUMsQ0FBQSxnQkFBRCxDQUFrQixTQUFDLENBQUQ7cUJBQzlELENBQUMsQ0FBQyx1QkFBRixDQUFBO1lBRDhELENBQWxCO1VBQUg7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBckIzQztRQXVCQSxpQ0FBQSxFQUFtQyxDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFBO21CQUFHLEtBQUMsQ0FBQSxnQkFBRCxDQUFrQixTQUFDLENBQUQ7cUJBQ3RELENBQUMsQ0FBQyxZQUFGLENBQUE7WUFEc0QsQ0FBbEI7VUFBSDtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0F2Qm5DO09BREY7TUEwQkEsSUFBQyxDQUFBLGlCQUFELENBQUE7YUFFQSxJQUFDLENBQUEsTUFBRCxDQUFBO0lBdENVOzt1QkF3Q1osbUJBQUEsR0FBcUIsU0FBQyxRQUFELEVBQVcsS0FBWDtNQUNuQixJQUFPLGFBQVA7UUFDRSxLQUFBLEdBQVEsS0FEVjs7YUFFQSxVQUFBLENBQVcsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO1VBQ1QsSUFBRyxnQkFBSDtZQUNFLEtBQUMsQ0FBQSxlQUFELENBQWlCLFFBQWpCLEVBREY7V0FBQSxNQUFBO1lBR0UsS0FBQyxDQUFBLGVBQUQsQ0FBaUIsS0FBQyxDQUFBLFlBQWEsQ0FBQSxDQUFBLENBQS9CLEVBSEY7O2lCQUlBLEtBQUMsQ0FBQSxtQkFBRCxDQUFxQixRQUFyQixFQUErQixLQUEvQjtRQUxTO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFYLEVBTUMsS0FORDtJQUhtQjs7dUJBV3JCLGVBQUEsR0FBaUIsU0FBQyxRQUFEO01BQ2YsSUFBTyxnQkFBUDtBQUNFLGVBREY7O01BRUEsSUFBQyxDQUFBLGNBQWMsQ0FBQyxRQUFoQixDQUFBLENBQTBCLENBQUMsTUFBM0IsQ0FBQTthQUNBLElBQUMsQ0FBQSxjQUFjLENBQUMsTUFBaEIsQ0FBdUIsUUFBUSxDQUFDLGFBQVQsQ0FBd0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLG1DQUFoQixDQUF4QixFQUE4RSxFQUE5RSxFQUFrRixJQUFsRixDQUF2QjtJQUplOzt1QkFNakIsaUJBQUEsR0FBbUIsU0FBQTtBQUNqQixVQUFBO01BQUEsVUFBQSxHQUFhLENBQUEsQ0FBRSxvREFBRjtNQUNiLGlCQUFBLEdBQW9CLElBQUk7TUFDeEIsaUJBQWlCLENBQUMsVUFBbEIsR0FBK0I7TUFDL0IsaUJBQWlCLENBQUMsVUFBbEIsR0FBK0I7TUFDL0IsSUFBQyxDQUFBLFlBQVksQ0FBQyxJQUFkLENBQW1CLGlCQUFuQjtNQUNBLFVBQVUsQ0FBQyxLQUFYLENBQWlCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtpQkFDZixpQkFBaUIsQ0FBQyxNQUFsQixDQUFBO1FBRGU7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWpCO01BRUEsSUFBQyxDQUFBLG1CQUFtQixDQUFDLE1BQXJCLENBQTRCLFVBQTVCO01BQ0EsaUJBQWlCLENBQUMsSUFBbEIsQ0FBQTtNQUNBLElBQUMsQ0FBQSxlQUFELENBQWlCLGlCQUFqQjtBQUNBLGFBQU87SUFYVTs7dUJBYW5CLHFCQUFBLEdBQXVCLFNBQUE7YUFDckIsSUFBQyxDQUFBLGlCQUFELENBQW1CLElBQUMsQ0FBQSxXQUFELEdBQWUsQ0FBbEM7SUFEcUI7O3VCQUd2QixxQkFBQSxHQUF1QixTQUFBO2FBQ3JCLElBQUMsQ0FBQSxpQkFBRCxDQUFtQixJQUFDLENBQUEsV0FBRCxHQUFlLENBQWxDO0lBRHFCOzt1QkFHdkIsaUJBQUEsR0FBbUIsU0FBQyxLQUFEO01BQ2pCLElBQUcsS0FBQSxJQUFTLElBQUMsQ0FBQSxZQUFZLENBQUMsTUFBMUI7UUFDRSxLQUFBLEdBQVEsRUFEVjs7TUFFQSxJQUFHLEtBQUEsR0FBUSxDQUFYO1FBQ0UsS0FBQSxHQUFRLElBQUMsQ0FBQSxZQUFZLENBQUMsTUFBZCxHQUF1QixFQURqQzs7TUFFQSxJQUFDLENBQUEsZUFBRCxDQUFpQixJQUFDLENBQUEsWUFBYSxDQUFBLEtBQUEsQ0FBL0I7YUFDQSxJQUFDLENBQUEsWUFBYSxDQUFBLEtBQUEsQ0FBZCxJQUF5QixJQUFDLENBQUEsWUFBYSxDQUFBLEtBQUEsQ0FBTSxDQUFDLElBQXJCLENBQUE7SUFOUjs7dUJBUW5CLG9CQUFBLEdBQXNCLFNBQUE7QUFDcEIsYUFBTyxJQUFDLENBQUEsWUFBYSxDQUFBLElBQUMsQ0FBQSxXQUFEO0lBREQ7O3VCQUd0QixnQkFBQSxHQUFrQixTQUFDLElBQUQ7QUFDaEIsVUFBQTtNQUFBLENBQUEsR0FBSSxJQUFDLENBQUEsMEJBQUQsQ0FBQTtNQUNKLElBQUcsU0FBSDtBQUNFLGVBQU8sSUFBQSxDQUFLLENBQUwsRUFEVDs7QUFFQSxhQUFPO0lBSlM7O3VCQU1sQiwwQkFBQSxHQUE0QixTQUFBO0FBQzFCLFVBQUE7TUFBQSxJQUFHLElBQUMsQ0FBQSxvQkFBRCxDQUFBLENBQUEsS0FBMkIsSUFBM0IsSUFBbUMsSUFBQyxDQUFBLG9CQUFELENBQUEsQ0FBQSxLQUEyQixNQUFqRTtBQUNFLGVBQU8sSUFBQyxDQUFBLG9CQUFELENBQUEsRUFEVDs7TUFFQSxHQUFBLEdBQU0sSUFBQyxDQUFBLGlCQUFELENBQW1CLENBQW5CO01BQ04sSUFBQyxDQUFBLE1BQUQsQ0FBQTtBQUNBLGFBQU87SUFMbUI7O3VCQU81QixvQkFBQSxHQUFzQixTQUFDLFdBQUQ7TUFDcEIsSUFBQyxDQUFBLFdBQUQsR0FBZSxJQUFDLENBQUEsWUFBWSxDQUFDLE9BQWQsQ0FBc0IsV0FBdEI7YUFDZixJQUFDLENBQUEsZUFBRCxDQUFpQixJQUFDLENBQUEsWUFBYSxDQUFBLElBQUMsQ0FBQSxXQUFELENBQS9CO0lBRm9COzt1QkFJdEIsaUJBQUEsR0FBbUIsU0FBQyxXQUFEO0FBQ2pCLFVBQUE7TUFBQSxLQUFBLEdBQVEsSUFBQyxDQUFBLFlBQVksQ0FBQyxPQUFkLENBQXNCLFdBQXRCO2FBQ1IsS0FBQSxJQUFRLENBQVIsSUFBYyxJQUFDLENBQUEsWUFBWSxDQUFDLE1BQWQsQ0FBcUIsS0FBckIsRUFBNEIsQ0FBNUI7SUFGRzs7dUJBSW5CLFlBQUEsR0FBYyxTQUFBO2FBQ1osSUFBQyxDQUFBLGlCQUFELENBQUEsQ0FBb0IsQ0FBQyxNQUFyQixDQUFBO0lBRFk7O3VCQUdkLE1BQUEsR0FBUSxTQUFBO2FBRU4sSUFBSSxDQUFDLFNBQVMsQ0FBQyxjQUFmLENBQThCO1FBQUEsSUFBQSxFQUFNLElBQU47UUFBWSxRQUFBLEVBQVUsR0FBdEI7T0FBOUI7SUFGTTs7dUJBS1IsaUJBQUEsR0FBbUIsU0FBQTtBQUNoQixVQUFBO3dFQUEyQixDQUFFLE9BQTdCLENBQUE7SUFEZ0I7O3VCQUduQixRQUFBLEdBQVUsU0FBQTtBQUNSLFVBQUE7QUFBQTtXQUFhLHVHQUFiO1FBQ0UsQ0FBQSxHQUFJLElBQUMsQ0FBQSxZQUFhLENBQUEsS0FBQTtRQUNsQixJQUFHLFNBQUg7dUJBQ0UsQ0FBQyxDQUFDLEtBQUYsQ0FBQSxHQURGO1NBQUEsTUFBQTsrQkFBQTs7QUFGRjs7SUFEUTs7dUJBT1YsT0FBQSxHQUFTLFNBQUE7QUFDUCxVQUFBO0FBQUEsV0FBYSx1R0FBYjtRQUNFLElBQUMsQ0FBQSxpQkFBRCxDQUFtQixJQUFDLENBQUEsWUFBYSxDQUFBLEtBQUEsQ0FBakM7QUFERjthQUVBLElBQUMsQ0FBQSxNQUFELENBQUE7SUFITzs7dUJBS1QsTUFBQSxHQUFRLFNBQUE7TUFDTixJQUE0QiwyQ0FBNUI7UUFBQSxJQUFDLENBQUEsaUJBQUQsQ0FBQSxFQUFBOztNQUNBLElBQUMsQ0FBQSxlQUFELENBQWlCLElBQUMsQ0FBQSxZQUFhLENBQUEsSUFBQyxDQUFBLFdBQUQsQ0FBL0I7YUFDQSxJQUFDLENBQUEsWUFBYSxDQUFBLElBQUMsQ0FBQSxXQUFELENBQWEsQ0FBQyxNQUE1QixDQUFBO0lBSE07Ozs7S0E1SWE7QUFadkIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbiAgQXRvbS10ZXJtaW5hbC1wYW5lbFxuICBDb3B5cmlnaHQgYnkgaXNpczk3XG4gIE1JVCBsaWNlbnNlZFxuXG4gIFRoZSBwYW5lbCwgd2hpY2ggbWFuYWdlcyBhbGwgdGhlIHRlcm1pbmFsIGluc3RhbmNlcy5cbiMjI1xuXG57JCwgVmlld30gPSBpbmNsdWRlICdhdG9tLXNwYWNlLXBlbi12aWV3cydcbkFUUE91dHB1dFZpZXcgPSBpbmNsdWRlICdhdHAtdmlldydcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgQVRQUGFuZWwgZXh0ZW5kcyBWaWV3XG4gIEBjb250ZW50OiAtPlxuICAgIEBkaXYgY2xhc3M6ICdhdHAtcGFuZWwgaW5saW5lLWJsb2NrJywgPT5cbiAgICAgIEBzcGFuIG91dGxldDogJ3Rlcm1TdGF0dXNDb250YWluZXInLCA9PlxuICAgICAgICBAc3BhbiBjbGljazogJ25ld1Rlcm1DbGljaycsIGNsYXNzOiBcImF0cC1wYW5lbCBpY29uIGljb24tcGx1c1wiXG4gICAgICBAc3BhbiBvdXRsZXQ6ICd0ZXJtU3RhdHVzSW5mbycsIHN0eWxlOiAncG9zaXRpb246YWJzb2x1dGU7cmlnaHQ6MTAlOydcblxuICBjb21tYW5kVmlld3M6IFtdXG4gIGFjdGl2ZUluZGV4OiAwXG4gIGluaXRpYWxpemU6IChzZXJpYWxpemVTdGF0ZSkgLT5cblxuICAgIGdldFNlbGVjdGVkVGV4dCA9ICgpIC0+XG4gICAgICB0ZXh0ID0gJydcbiAgICAgIGlmIHdpbmRvdy5nZXRTZWxlY3Rpb25cbiAgICAgICAgdGV4dCA9IHdpbmRvdy5nZXRTZWxlY3Rpb24oKS50b1N0cmluZygpXG4gICAgICBlbHNlIGlmIGRvY3VtZW50LnNlbGVjdGlvbiBhbmQgZG9jdW1lbnQuc2VsZWN0aW9uLnR5cGUgIT0gXCJDb250cm9sXCJcbiAgICAgICAgdGV4dCA9IGRvY3VtZW50LnNlbGVjdGlvbi5jcmVhdGVSYW5nZSgpLnRleHRcbiAgICAgIHJldHVybiB0ZXh0XG5cbiAgICBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS13b3Jrc3BhY2UnLFxuICAgICAgJ2F0b20tdGVybWluYWwtcGFuZWw6Y29udGV4dC1jb3B5LWFuZC1leGVjdXRlLW91dHB1dC1zZWxlY3Rpb24nOiA9PiBAcnVuSW5DdXJyZW50VmlldyAoaSkgLT5cbiAgICAgICAgdCA9IGdldFNlbGVjdGVkVGV4dCgpXG4gICAgICAgIGF0b20uY2xpcGJvYXJkLndyaXRlIHRcbiAgICAgICAgaS5vbkNvbW1hbmQgdFxuICAgICAgJ2F0b20tdGVybWluYWwtcGFuZWw6Y29udGV4dC1jb3B5LW91dHB1dC1zZWxlY3Rpb24nOiA9PiBAcnVuSW5DdXJyZW50VmlldyAoaSkgLT5cbiAgICAgICAgYXRvbS5jbGlwYm9hcmQud3JpdGUgZ2V0U2VsZWN0ZWRUZXh0KClcbiAgICAgICdhdG9tLXRlcm1pbmFsLXBhbmVsOmNvbnRleHQtY29weS1yYXctb3V0cHV0JzogPT4gQHJ1bkluQ3VycmVudFZpZXcgKGkpIC0+IGF0b20uY2xpcGJvYXJkLndyaXRlKGkuZ2V0UmF3T3V0cHV0KCkpXG4gICAgICAnYXRvbS10ZXJtaW5hbC1wYW5lbDpjb250ZXh0LWNvcHktaHRtbC1vdXRwdXQnOiA9PiBAcnVuSW5DdXJyZW50VmlldyAoaSkgLT4gYXRvbS5jbGlwYm9hcmQud3JpdGUoaS5nZXRIdG1sT3V0cHV0KCkpXG4gICAgICAnYXRvbS10ZXJtaW5hbC1wYW5lbDpuZXcnOiA9PiBAbmV3VGVybUNsaWNrKClcbiAgICAgICdhdG9tLXRlcm1pbmFsLXBhbmVsOnRvZ2dsZSc6ID0+IEB0b2dnbGUoKVxuICAgICAgJ2F0b20tdGVybWluYWwtcGFuZWw6bmV4dCc6ID0+IEBhY3RpdmVOZXh0Q29tbWFuZFZpZXcoKVxuICAgICAgJ2F0b20tdGVybWluYWwtcGFuZWw6cHJldic6ID0+IEBhY3RpdmVQcmV2Q29tbWFuZFZpZXcoKVxuICAgICAgJ2F0b20tdGVybWluYWwtcGFuZWw6aGlkZSc6ID0+IEBydW5JbkN1cnJlbnRWaWV3IChpKSAtPiBpLmNsb3NlKClcbiAgICAgICdhdG9tLXRlcm1pbmFsLXBhbmVsOmRlc3Ryb3knOiA9PiAgQHJ1bkluQ3VycmVudFZpZXcgKGkpIC0+XG4gICAgICAgIGkuZGVzdHJveSgpXG4gICAgICAnYXRvbS10ZXJtaW5hbC1wYW5lbDpjb21waWxlJzogPT4gQGdldEZvcmNlZEFjdGl2ZUNvbW1hbmRWaWV3KCkuY29tcGlsZSgpXG4gICAgICAnYXRvbS10ZXJtaW5hbC1wYW5lbDp0b2dnbGUtYXV0b2NvbXBsZXRpb24nOiA9PiBAcnVuSW5DdXJyZW50VmlldygoaSkgLT4gaS50b2dnbGVBdXRvQ29tcGxldGlvbigpKVxuICAgICAgJ2F0b20tdGVybWluYWwtcGFuZWw6cmVsb2FkLWNvbmZpZyc6ID0+IEBydW5JbkN1cnJlbnRWaWV3IChpKSAtPlxuICAgICAgICBpLmNsZWFyKClcbiAgICAgICAgaS5yZWxvYWRTZXR0aW5ncygpXG4gICAgICAgIGkuY2xlYXIoKVxuICAgICAgJ2F0b20tdGVybWluYWwtcGFuZWw6c2hvdy1jb21tYW5kLWZpbmRlcic6ID0+IEBydW5JbkN1cnJlbnRWaWV3IChpKSAtPlxuICAgICAgICBpLmdldExvY2FsQ29tbWFuZHNNZW1kdW1wKClcbiAgICAgICdhdG9tLXRlcm1pbmFsLXBhbmVsOm9wZW4tY29uZmlnJzogPT4gQHJ1bkluQ3VycmVudFZpZXcgKGkpIC0+XG4gICAgICAgIGkuc2hvd1NldHRpbmdzKClcbiAgICBAY3JlYXRlQ29tbWFuZFZpZXcoKVxuICAgICNAdXBkYXRlU3RhdHVzQmFyVGFzaygpXG4gICAgQGF0dGFjaCgpXG5cbiAgdXBkYXRlU3RhdHVzQmFyVGFzazogKGluc3RhbmNlLCBkZWxheSkgLT5cbiAgICBpZiBub3QgZGVsYXk/XG4gICAgICBkZWxheSA9IDEwMDBcbiAgICBzZXRUaW1lb3V0ICgpID0+XG4gICAgICBpZiBpbnN0YW5jZT9cbiAgICAgICAgQHVwZGF0ZVN0YXR1c0JhcihpbnN0YW5jZSlcbiAgICAgIGVsc2VcbiAgICAgICAgQHVwZGF0ZVN0YXR1c0JhcihAY29tbWFuZFZpZXdzWzBdKVxuICAgICAgQHVwZGF0ZVN0YXR1c0JhclRhc2soaW5zdGFuY2UsIGRlbGF5KVxuICAgICxkZWxheVxuXG4gIHVwZGF0ZVN0YXR1c0JhcjogKGluc3RhbmNlKSAtPlxuICAgIGlmIG5vdCBpbnN0YW5jZT9cbiAgICAgIHJldHVyblxuICAgIEB0ZXJtU3RhdHVzSW5mby5jaGlsZHJlbigpLnJlbW92ZSgpXG4gICAgQHRlcm1TdGF0dXNJbmZvLmFwcGVuZChpbnN0YW5jZS5wYXJzZVRlbXBsYXRlIChhdG9tLmNvbmZpZy5nZXQgJ2F0b20tdGVybWluYWwtcGFuZWwuc3RhdHVzQmFyVGV4dCcpLCBbXSwgdHJ1ZSApXG5cbiAgY3JlYXRlQ29tbWFuZFZpZXc6IC0+XG4gICAgdGVybVN0YXR1cyA9ICQoJzxzcGFuIGNsYXNzPVwiYXRwLXBhbmVsIGljb24gaWNvbi10ZXJtaW5hbFwiPjwvc3Bhbj4nKVxuICAgIGNvbW1hbmRPdXRwdXRWaWV3ID0gbmV3IEFUUE91dHB1dFZpZXdcbiAgICBjb21tYW5kT3V0cHV0Vmlldy5zdGF0dXNJY29uID0gdGVybVN0YXR1c1xuICAgIGNvbW1hbmRPdXRwdXRWaWV3LnN0YXR1c1ZpZXcgPSB0aGlzXG4gICAgQGNvbW1hbmRWaWV3cy5wdXNoIGNvbW1hbmRPdXRwdXRWaWV3XG4gICAgdGVybVN0YXR1cy5jbGljayAoKSA9PlxuICAgICAgY29tbWFuZE91dHB1dFZpZXcudG9nZ2xlKClcbiAgICBAdGVybVN0YXR1c0NvbnRhaW5lci5hcHBlbmQgdGVybVN0YXR1c1xuICAgIGNvbW1hbmRPdXRwdXRWaWV3LmluaXQoKVxuICAgIEB1cGRhdGVTdGF0dXNCYXIgY29tbWFuZE91dHB1dFZpZXdcbiAgICByZXR1cm4gY29tbWFuZE91dHB1dFZpZXdcblxuICBhY3RpdmVOZXh0Q29tbWFuZFZpZXc6IC0+XG4gICAgQGFjdGl2ZUNvbW1hbmRWaWV3IEBhY3RpdmVJbmRleCArIDFcblxuICBhY3RpdmVQcmV2Q29tbWFuZFZpZXc6IC0+XG4gICAgQGFjdGl2ZUNvbW1hbmRWaWV3IEBhY3RpdmVJbmRleCAtIDFcblxuICBhY3RpdmVDb21tYW5kVmlldzogKGluZGV4KSAtPlxuICAgIGlmIGluZGV4ID49IEBjb21tYW5kVmlld3MubGVuZ3RoXG4gICAgICBpbmRleCA9IDBcbiAgICBpZiBpbmRleCA8IDBcbiAgICAgIGluZGV4ID0gQGNvbW1hbmRWaWV3cy5sZW5ndGggLSAxXG4gICAgQHVwZGF0ZVN0YXR1c0JhciBAY29tbWFuZFZpZXdzW2luZGV4XVxuICAgIEBjb21tYW5kVmlld3NbaW5kZXhdIGFuZCBAY29tbWFuZFZpZXdzW2luZGV4XS5vcGVuKClcblxuICBnZXRBY3RpdmVDb21tYW5kVmlldzogKCkgLT5cbiAgICByZXR1cm4gQGNvbW1hbmRWaWV3c1tAYWN0aXZlSW5kZXhdXG5cbiAgcnVuSW5DdXJyZW50VmlldzogKGNhbGwpIC0+XG4gICAgdiA9IEBnZXRGb3JjZWRBY3RpdmVDb21tYW5kVmlldygpXG4gICAgaWYgdj9cbiAgICAgIHJldHVybiBjYWxsKHYpXG4gICAgcmV0dXJuIG51bGxcblxuICBnZXRGb3JjZWRBY3RpdmVDb21tYW5kVmlldzogKCkgLT5cbiAgICBpZiBAZ2V0QWN0aXZlQ29tbWFuZFZpZXcoKSAhPSBudWxsICYmIEBnZXRBY3RpdmVDb21tYW5kVmlldygpICE9IHVuZGVmaW5lZFxuICAgICAgcmV0dXJuIEBnZXRBY3RpdmVDb21tYW5kVmlldygpXG4gICAgcmV0ID0gQGFjdGl2ZUNvbW1hbmRWaWV3KDApXG4gICAgQHRvZ2dsZSgpXG4gICAgcmV0dXJuIHJldFxuXG4gIHNldEFjdGl2ZUNvbW1hbmRWaWV3OiAoY29tbWFuZFZpZXcpIC0+XG4gICAgQGFjdGl2ZUluZGV4ID0gQGNvbW1hbmRWaWV3cy5pbmRleE9mIGNvbW1hbmRWaWV3XG4gICAgQHVwZGF0ZVN0YXR1c0JhciBAY29tbWFuZFZpZXdzW0BhY3RpdmVJbmRleF1cblxuICByZW1vdmVDb21tYW5kVmlldzogKGNvbW1hbmRWaWV3KSAtPlxuICAgIGluZGV4ID0gQGNvbW1hbmRWaWV3cy5pbmRleE9mIGNvbW1hbmRWaWV3XG4gICAgaW5kZXggPj0wIGFuZCBAY29tbWFuZFZpZXdzLnNwbGljZSBpbmRleCwgMVxuXG4gIG5ld1Rlcm1DbGljazogLT5cbiAgICBAY3JlYXRlQ29tbWFuZFZpZXcoKS50b2dnbGUoKVxuXG4gIGF0dGFjaDogKCkgLT5cbiAgICAjIGNvbnNvbGUubG9nICdwYW5lbCBhdHRhY2hlZCEnXG4gICAgYXRvbS53b3Jrc3BhY2UuYWRkQm90dG9tUGFuZWwoaXRlbTogdGhpcywgcHJpb3JpdHk6IDEwMClcbiAgICAjIHN0YXR1c0Jhci5hZGRMZWZ0VGlsZShpdGVtOiB0aGlzLCBwcmlvcml0eTogMTAwKVxuXG4gIGRlc3Ryb3lBY3RpdmVUZXJtOiAtPlxuICAgICBAY29tbWFuZFZpZXdzW0BhY3RpdmVJbmRleF0/LmRlc3Ryb3koKVxuXG4gIGNsb3NlQWxsOiAtPlxuICAgIGZvciBpbmRleCBpbiBbQGNvbW1hbmRWaWV3cy5sZW5ndGggLi4gMF1cbiAgICAgIG8gPSBAY29tbWFuZFZpZXdzW2luZGV4XVxuICAgICAgaWYgbz9cbiAgICAgICAgby5jbG9zZSgpXG5cbiAgIyBUZWFyIGRvd24gYW55IHN0YXRlIGFuZCBkZXRhY2hcbiAgZGVzdHJveTogLT5cbiAgICBmb3IgaW5kZXggaW4gW0Bjb21tYW5kVmlld3MubGVuZ3RoIC4uIDBdXG4gICAgICBAcmVtb3ZlQ29tbWFuZFZpZXcgQGNvbW1hbmRWaWV3c1tpbmRleF1cbiAgICBAZGV0YWNoKClcblxuICB0b2dnbGU6IC0+XG4gICAgQGNyZWF0ZUNvbW1hbmRWaWV3KCkgdW5sZXNzIEBjb21tYW5kVmlld3NbQGFjdGl2ZUluZGV4XT9cbiAgICBAdXBkYXRlU3RhdHVzQmFyIEBjb21tYW5kVmlld3NbQGFjdGl2ZUluZGV4XVxuICAgIEBjb21tYW5kVmlld3NbQGFjdGl2ZUluZGV4XS50b2dnbGUoKVxuIl19
