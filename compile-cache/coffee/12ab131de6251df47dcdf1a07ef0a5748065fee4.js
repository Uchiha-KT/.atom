(function() {
  var $, CompositeDisposable, InputView, OutputViewManager, TextEditorView, View, git, notifier, ref, runCommand,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  CompositeDisposable = require('atom').CompositeDisposable;

  ref = require('atom-space-pen-views'), $ = ref.$, TextEditorView = ref.TextEditorView, View = ref.View;

  git = require('../git');

  notifier = require('../notifier');

  OutputViewManager = require('../output-view-manager');

  runCommand = function(args, workingDirectory) {
    var view;
    view = OutputViewManager.create();
    return git.cmd(args, {
      cwd: workingDirectory
    }, {
      color: true
    }).then(function(data) {
      var msg;
      msg = "git " + (args.join(' ')) + " was successful";
      notifier.addSuccess(msg);
      if ((data != null ? data.length : void 0) > 0) {
        view.setContent(data);
      } else {
        view.reset();
      }
      return view.finish();
    })["catch"]((function(_this) {
      return function(msg) {
        if ((msg != null ? msg.length : void 0) > 0) {
          view.setContent(msg);
        } else {
          view.reset();
        }
        return view.finish();
      };
    })(this));
  };

  InputView = (function(superClass) {
    extend(InputView, superClass);

    function InputView() {
      return InputView.__super__.constructor.apply(this, arguments);
    }

    InputView.content = function() {
      return this.div((function(_this) {
        return function() {
          return _this.subview('commandEditor', new TextEditorView({
            mini: true,
            placeholderText: 'Git command and arguments'
          }));
        };
      })(this));
    };

    InputView.prototype.initialize = function(repo1) {
      this.repo = repo1;
      this.disposables = new CompositeDisposable;
      this.currentPane = atom.workspace.getActivePane();
      if (this.panel == null) {
        this.panel = atom.workspace.addModalPanel({
          item: this
        });
      }
      this.panel.show();
      this.commandEditor.focus();
      this.disposables.add(atom.commands.add('atom-text-editor', {
        'core:cancel': (function(_this) {
          return function(e) {
            var ref1;
            if ((ref1 = _this.panel) != null) {
              ref1.destroy();
            }
            _this.currentPane.activate();
            return _this.disposables.dispose();
          };
        })(this)
      }));
      return this.disposables.add(atom.commands.add('atom-text-editor', 'core:confirm', (function(_this) {
        return function(e) {
          var args, ref1;
          _this.disposables.dispose();
          if ((ref1 = _this.panel) != null) {
            ref1.destroy();
          }
          args = _this.commandEditor.getText().split(' ');
          if (args[0] === 1) {
            args.shift();
          }
          return runCommand(args, _this.repo.getWorkingDirectory()).then(function() {
            _this.currentPane.activate();
            return git.refresh(_this.repo);
          });
        };
      })(this)));
    };

    return InputView;

  })(View);

  module.exports = function(repo, args) {
    if (args) {
      args = args.split(' ');
      return runCommand(args, repo.getWorkingDirectory());
    } else {
      return new InputView(repo);
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy91Y2hpaGEvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvbGliL21vZGVscy9naXQtcnVuLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsMEdBQUE7SUFBQTs7O0VBQUMsc0JBQXVCLE9BQUEsQ0FBUSxNQUFSOztFQUN4QixNQUE0QixPQUFBLENBQVEsc0JBQVIsQ0FBNUIsRUFBQyxTQUFELEVBQUksbUNBQUosRUFBb0I7O0VBRXBCLEdBQUEsR0FBTSxPQUFBLENBQVEsUUFBUjs7RUFDTixRQUFBLEdBQVcsT0FBQSxDQUFRLGFBQVI7O0VBQ1gsaUJBQUEsR0FBb0IsT0FBQSxDQUFRLHdCQUFSOztFQUVwQixVQUFBLEdBQWEsU0FBQyxJQUFELEVBQU8sZ0JBQVA7QUFDWCxRQUFBO0lBQUEsSUFBQSxHQUFPLGlCQUFpQixDQUFDLE1BQWxCLENBQUE7V0FDUCxHQUFHLENBQUMsR0FBSixDQUFRLElBQVIsRUFBYztNQUFBLEdBQUEsRUFBSyxnQkFBTDtLQUFkLEVBQXFDO01BQUMsS0FBQSxFQUFPLElBQVI7S0FBckMsQ0FDQSxDQUFDLElBREQsQ0FDTSxTQUFDLElBQUQ7QUFDSixVQUFBO01BQUEsR0FBQSxHQUFNLE1BQUEsR0FBTSxDQUFDLElBQUksQ0FBQyxJQUFMLENBQVUsR0FBVixDQUFELENBQU4sR0FBc0I7TUFDNUIsUUFBUSxDQUFDLFVBQVQsQ0FBb0IsR0FBcEI7TUFDQSxvQkFBRyxJQUFJLENBQUUsZ0JBQU4sR0FBZSxDQUFsQjtRQUNFLElBQUksQ0FBQyxVQUFMLENBQWdCLElBQWhCLEVBREY7T0FBQSxNQUFBO1FBR0UsSUFBSSxDQUFDLEtBQUwsQ0FBQSxFQUhGOzthQUlBLElBQUksQ0FBQyxNQUFMLENBQUE7SUFQSSxDQUROLENBU0EsRUFBQyxLQUFELEVBVEEsQ0FTTyxDQUFBLFNBQUEsS0FBQTthQUFBLFNBQUMsR0FBRDtRQUNMLG1C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ID0gcmVxdWlyZSAnYXRvbSdcbnskLCBUZXh0RWRpdG9yVmlldywgVmlld30gPSByZXF1aXJlICdhdG9tLXNwYWNlLXBlbi12aWV3cydcblxuZ2l0ID0gcmVxdWlyZSAnLi4vZ2l0J1xubm90aWZpZXIgPSByZXF1aXJlICcuLi9ub3RpZmllcidcbk91dHB1dFZpZXdNYW5hZ2VyID0gcmVxdWlyZSAnLi4vb3V0cHV0LXZpZXctbWFuYWdlcidcblxucnVuQ29tbWFuZCA9IChhcmdzLCB3b3JraW5nRGlyZWN0b3J5KSAtPlxuICB2aWV3ID0gT3V0cHV0Vmlld01hbmFnZXIuY3JlYXRlKClcbiAgZ2l0LmNtZChhcmdzLCBjd2Q6IHdvcmtpbmdEaXJlY3RvcnksIHtjb2xvcjogdHJ1ZX0pXG4gIC50aGVuIChkYXRhKSAtPlxuICAgIG1zZyA9IFwiZ2l0ICN7YXJncy5qb2luKCcgJyl9IHdhcyBzdWNjZXNzZnVsXCJcbiAgICBub3RpZmllci5hZGRTdWNjZXNzKG1zZylcbiAgICBpZiBkYXRhPy5sZW5ndGggPiAwXG4gICAgICB2aWV3LnNldENvbnRlbnQgZGF0YVxuICAgIGVsc2VcbiAgICAgIHZpZXcucmVzZXQoKVxuICAgIHZpZXcuZmluaXNoKClcbiAgLmNhdGNoIChtc2cpID0+XG4gICAgaWYgbXNnPy5sZW5ndGggPiAwXG4gICAgICB2aWV3LnNldENvbnRlbnQgbXNnXG4gICAgZWxzZVxuICAgICAgdmlldy5yZXNldCgpXG4gICAgdmlldy5maW5pc2goKVxuXG5jbGFzcyBJbnB1dFZpZXcgZXh0ZW5kcyBWaWV3XG4gIEBjb250ZW50OiAtPlxuICAgIEBkaXYgPT5cbiAgICAgIEBzdWJ2aWV3ICdjb21tYW5kRWRpdG9yJywgbmV3IFRleHRFZGl0b3JWaWV3KG1pbmk6IHRydWUsIHBsYWNlaG9sZGVyVGV4dDogJ0dpdCBjb21tYW5kIGFuZCBhcmd1bWVudHMnKVxuXG4gIGluaXRpYWxpemU6IChAcmVwbykgLT5cbiAgICBAZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgIEBjdXJyZW50UGFuZSA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmUoKVxuICAgIEBwYW5lbCA/PSBhdG9tLndvcmtzcGFjZS5hZGRNb2RhbFBhbmVsKGl0ZW06IHRoaXMpXG4gICAgQHBhbmVsLnNob3coKVxuICAgIEBjb21tYW5kRWRpdG9yLmZvY3VzKClcblxuICAgIEBkaXNwb3NhYmxlcy5hZGQgYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20tdGV4dC1lZGl0b3InLCAnY29yZTpjYW5jZWwnOiAoZSkgPT5cbiAgICAgIEBwYW5lbD8uZGVzdHJveSgpXG4gICAgICBAY3VycmVudFBhbmUuYWN0aXZhdGUoKVxuICAgICAgQGRpc3Bvc2FibGVzLmRpc3Bvc2UoKVxuXG4gICAgQGRpc3Bvc2FibGVzLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS10ZXh0LWVkaXRvcicsICdjb3JlOmNvbmZpcm0nLCAoZSkgPT5cbiAgICAgIEBkaXNwb3NhYmxlcy5kaXNwb3NlKClcbiAgICAgIEBwYW5lbD8uZGVzdHJveSgpXG4gICAgICBhcmdzID0gQGNvbW1hbmRFZGl0b3IuZ2V0VGV4dCgpLnNwbGl0KCcgJylcbiAgICAgICMgVE9ETzogcmVtb3ZlIHRoaXM/XG4gICAgICBpZiBhcmdzWzBdIGlzIDEgdGhlbiBhcmdzLnNoaWZ0KClcbiAgICAgIHJ1bkNvbW1hbmQgYXJncywgQHJlcG8uZ2V0V29ya2luZ0RpcmVjdG9yeSgpXG4gICAgICAudGhlbiA9PlxuICAgICAgICBAY3VycmVudFBhbmUuYWN0aXZhdGUoKVxuICAgICAgICBnaXQucmVmcmVzaCBAcmVwb1xuXG5tb2R1bGUuZXhwb3J0cyA9IChyZXBvLCBhcmdzKSAtPlxuICBpZiBhcmdzXG4gICAgYXJncyA9IGFyZ3Muc3BsaXQoJyAnKVxuICAgIHJ1bkNvbW1hbmQgYXJncywgcmVwby5nZXRXb3JraW5nRGlyZWN0b3J5KClcbiAgZWxzZVxuICAgIG5ldyBJbnB1dFZpZXcocmVwbylcbiJdfQ==
