(function() {
  var $$, ListView, SelectListView, fs, git, notifier, ref,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  fs = require('fs-plus');

  ref = require('atom-space-pen-views'), $$ = ref.$$, SelectListView = ref.SelectListView;

  git = require('../git');

  notifier = require('../notifier');

  module.exports = ListView = (function(superClass) {
    extend(ListView, superClass);

    function ListView() {
      return ListView.__super__.constructor.apply(this, arguments);
    }

    ListView.prototype.args = ['checkout'];

    ListView.prototype.initialize = function(repo, data) {
      this.repo = repo;
      this.data = data;
      ListView.__super__.initialize.apply(this, arguments);
      this.addClass('git-branch');
      this.show();
      this.parseData();
      return this.currentPane = atom.workspace.getActivePane();
    };

    ListView.prototype.parseData = function() {
      var branches, i, item, items, len;
      items = this.data.split("\n");
      branches = [];
      for (i = 0, len = items.length; i < len; i++) {
        item = items[i];
        item = item.replace(/\s/g, '');
        if (item !== '') {
          branches.push({
            name: item
          });
        }
      }
      this.setItems(branches);
      return this.focusFilterEditor();
    };

    ListView.prototype.getFilterKey = function() {
      return 'name';
    };

    ListView.prototype.show = function() {
      if (this.panel == null) {
        this.panel = atom.workspace.addModalPanel({
          item: this
        });
      }
      this.panel.show();
      return this.storeFocusedElement();
    };

    ListView.prototype.cancelled = function() {
      return this.hide();
    };

    ListView.prototype.hide = function() {
      var ref1;
      return (ref1 = this.panel) != null ? ref1.destroy() : void 0;
    };

    ListView.prototype.viewForItem = function(arg) {
      var current, name;
      name = arg.name;
      current = false;
      if (name.startsWith("*")) {
        name = name.slice(1);
        current = true;
      }
      return $$(function() {
        return this.li(name, (function(_this) {
          return function() {
            return _this.div({
              "class": 'pull-right'
            }, function() {
              if (current) {
                return _this.span('HEAD');
              }
            });
          };
        })(this));
      });
    };

    ListView.prototype.confirmed = function(arg) {
      var name;
      name = arg.name;
      this.checkout(name.match(/\*?(.*)/)[1]);
      return this.cancel();
    };

    ListView.prototype.checkout = function(branch) {
      return git.cmd(this.args.concat(branch), {
        cwd: this.repo.getWorkingDirectory()
      }).then((function(_this) {
        return function(message) {
          notifier.addSuccess(message);
          atom.workspace.observeTextEditors(function(editor) {
            var error, filepath, path;
            try {
              path = editor.getPath();
              console.log("Git-plus: editor.getPath() returned '" + path + "'");
              if (filepath = path != null ? typeof path.toString === "function" ? path.toString() : void 0 : void 0) {
                return fs.exists(filepath, function(exists) {
                  if (!exists) {
                    return editor.destroy();
                  }
                });
              }
            } catch (error1) {
              error = error1;
              notifier.addWarning("There was an error closing windows for non-existing files after the checkout. Please check the dev console.");
              return console.info("Git-plus: please take a screenshot of what has been printed in the console and add it to the issue on github at https://github.com/akonwi/git-plus/issues/139");
            }
          });
          git.refresh(_this.repo);
          return _this.currentPane.activate();
        };
      })(this))["catch"](function(err) {
        return notifier.addError(err);
      });
    };

    return ListView;

  })(SelectListView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy91Y2hpaGEvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvbGliL3ZpZXdzL2JyYW5jaC1saXN0LXZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSxvREFBQTtJQUFBOzs7RUFBQSxFQUFBLEdBQUssT0FBQSxDQUFRLFNBQVI7O0VBQ0wsTUFBdUIsT0FBQSxDQUFRLHNCQUFSLENBQXZCLEVBQUMsV0FBRCxFQUFLOztFQUNMLEdBQUEsR0FBTSxPQUFBLENBQVEsUUFBUjs7RUFDTixRQUFBLEdBQVcsT0FBQSxDQUFRLGFBQVI7O0VBRVgsTUFBTSxDQUFDLE9BQVAsR0FDTTs7Ozs7Ozt1QkFDSixJQUFBLEdBQU0sQ0FBQyxVQUFEOzt1QkFFTixVQUFBLEdBQVksU0FBQyxJQUFELEVBQVEsSUFBUjtNQUFDLElBQUMsQ0FBQSxPQUFEO01BQU8sSUFBQyxDQUFBLE9BQUQ7TUFDbEIsMENBQUEsU0FBQTtNQUNBLElBQUMsQ0FBQSxRQUFELENBQVUsWUFBVjtNQUNBLElBQUMsQ0FBQSxJQUFELENBQUE7TUFDQSxJQUFDLENBQUEsU0FBRCxDQUFBO2FBQ0EsSUFBQyxDQUFBLFdBQUQsR0FBZSxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWYsQ0FBQTtJQUxMOzt1QkFPWixTQUFBLEdBQVcsU0FBQTtBQUNULFVBQUE7TUFBQSxLQUFBLEdBQVEsSUFBQyxDQUFBLElBQUksQ0FBQyxLQUFOLENBQVksSUFBWjtNQUNSLFFBQUEsR0FBVztBQUNYLFdBQUEsdUNBQUE7O1FBQ0UsSUFBQSxHQUFPLElBQUksQ0FBQyxPQUFMLENBQWEsS0FBYixFQUFvQixFQUFwQjtRQUNQLElBQU8sSUFBQSxLQUFRLEVBQWY7VUFDRSxRQUFRLENBQUMsSUFBVCxDQUFjO1lBQUMsSUFBQSxFQUFNLElBQVA7V0FBZCxFQURGOztBQUZGO01BSUEsSUFBQyxDQUFBLFFBQUQsQ0FBVSxRQUFW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bnQiOlsiZnMgPSByZXF1aXJlICdmcy1wbHVzJ1xueyQkLCBTZWxlY3RMaXN0Vmlld30gPSByZXF1aXJlICdhdG9tLXNwYWNlLXBlbi12aWV3cydcbmdpdCA9IHJlcXVpcmUgJy4uL2dpdCdcbm5vdGlmaWVyID0gcmVxdWlyZSAnLi4vbm90aWZpZXInXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIExpc3RWaWV3IGV4dGVuZHMgU2VsZWN0TGlzdFZpZXdcbiAgYXJnczogWydjaGVja291dCddXG5cbiAgaW5pdGlhbGl6ZTogKEByZXBvLCBAZGF0YSkgLT5cbiAgICBzdXBlclxuICAgIEBhZGRDbGFzcygnZ2l0LWJyYW5jaCcpXG4gICAgQHNob3coKVxuICAgIEBwYXJzZURhdGEoKVxuICAgIEBjdXJyZW50UGFuZSA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmUoKVxuXG4gIHBhcnNlRGF0YTogLT5cbiAgICBpdGVtcyA9IEBkYXRhLnNwbGl0KFwiXFxuXCIpXG4gICAgYnJhbmNoZXMgPSBbXVxuICAgIGZvciBpdGVtIGluIGl0ZW1zXG4gICAgICBpdGVtID0gaXRlbS5yZXBsYWNlKC9cXHMvZywgJycpXG4gICAgICB1bmxlc3MgaXRlbSBpcyAnJ1xuICAgICAgICBicmFuY2hlcy5wdXNoIHtuYW1lOiBpdGVtfVxuICAgIEBzZXRJdGVtcyBicmFuY2hlc1xuICAgIEBmb2N1c0ZpbHRlckVkaXRvcigpXG5cbiAgZ2V0RmlsdGVyS2V5OiAtPiAnbmFtZSdcblxuICBzaG93OiAtPlxuICAgIEBwYW5lbCA/PSBhdG9tLndvcmtzcGFjZS5hZGRNb2RhbFBhbmVsKGl0ZW06IHRoaXMpXG4gICAgQHBhbmVsLnNob3coKVxuICAgIEBzdG9yZUZvY3VzZWRFbGVtZW50KClcblxuICBjYW5jZWxsZWQ6IC0+IEBoaWRlKClcblxuICBoaWRlOiAtPiBAcGFuZWw/LmRlc3Ryb3koKVxuXG4gIHZpZXdGb3JJdGVtOiAoe25hbWV9KSAtPlxuICAgIGN1cnJlbnQgPSBmYWxzZVxuICAgIGlmIG5hbWUuc3RhcnRzV2l0aCBcIipcIlxuICAgICAgbmFtZSA9IG5hbWUuc2xpY2UoMSlcbiAgICAgIGN1cnJlbnQgPSB0cnVlXG4gICAgJCQgLT5cbiAgICAgIEBsaSBuYW1lLCA9PlxuICAgICAgICBAZGl2IGNsYXNzOiAncHVsbC1yaWdodCcsID0+XG4gICAgICAgICAgQHNwYW4oJ0hFQUQnKSBpZiBjdXJyZW50XG5cbiAgY29uZmlybWVkOiAoe25hbWV9KSAtPlxuICAgIEBjaGVja291dCBuYW1lLm1hdGNoKC9cXCo/KC4qKS8pWzFdXG4gICAgQGNhbmNlbCgpXG5cbiAgY2hlY2tvdXQ6IChicmFuY2gpIC0+XG4gICAgZ2l0LmNtZChAYXJncy5jb25jYXQoYnJhbmNoKSwgY3dkOiBAcmVwby5nZXRXb3JraW5nRGlyZWN0b3J5KCkpXG4gICAgLnRoZW4gKG1lc3NhZ2UpID0+XG4gICAgICBub3RpZmllci5hZGRTdWNjZXNzIG1lc3NhZ2VcbiAgICAgIGF0b20ud29ya3NwYWNlLm9ic2VydmVUZXh0RWRpdG9ycyAoZWRpdG9yKSA9PlxuICAgICAgICB0cnlcbiAgICAgICAgICBwYXRoID0gZWRpdG9yLmdldFBhdGgoKVxuICAgICAgICAgIGNvbnNvbGUubG9nIFwiR2l0LXBsdXM6IGVkaXRvci5nZXRQYXRoKCkgcmV0dXJuZWQgJyN7cGF0aH0nXCJcbiAgICAgICAgICBpZiBmaWxlcGF0aCA9IHBhdGg/LnRvU3RyaW5nPygpXG4gICAgICAgICAgICBmcy5leGlzdHMgZmlsZXBhdGgsIChleGlzdHMpID0+XG4gICAgICAgICAgICAgIGVkaXRvci5kZXN0cm95KCkgaWYgbm90IGV4aXN0c1xuICAgICAgICBjYXRjaCBlcnJvclxuICAgICAgICAgIG5vdGlmaWVyLmFkZFdhcm5pbmcgXCJUaGVyZSB3YXMgYW4gZXJyb3IgY2xvc2luZyB3aW5kb3dzIGZvciBub24tZXhpc3RpbmcgZmlsZXMgYWZ0ZXIgdGhlIGNoZWNrb3V0LiBQbGVhc2UgY2hlY2sgdGhlIGRldiBjb25zb2xlLlwiXG4gICAgICAgICAgY29uc29sZS5pbmZvIFwiR2l0LXBsdXM6IHBsZWFzZSB0YWtlIGEgc2NyZWVuc2hvdCBvZiB3aGF0IGhhcyBiZWVuIHByaW50ZWQgaW4gdGhlIGNvbnNvbGUgYW5kIGFkZCBpdCB0byB0aGUgaXNzdWUgb24gZ2l0aHViIGF0IGh0dHBzOi8vZ2l0aHViLmNvbS9ha29ud2kvZ2l0LXBsdXMvaXNzdWVzLzEzOVwiXG4gICAgICBnaXQucmVmcmVzaCBAcmVwb1xuICAgICAgQGN1cnJlbnRQYW5lLmFjdGl2YXRlKClcbiAgICAuY2F0Y2ggKGVycikgLT5cbiAgICAgIG5vdGlmaWVyLmFkZEVycm9yIGVyclxuIl19
