(function() {
  var CompositeDisposable, GitPull, GitPush, Path, cleanup, commit, destroyCommitEditor, disposables, fs, getStagedFiles, getTemplate, git, notifier, prepFile, showFile, trimFile, verboseCommitsEnabled;

  Path = require('path');

  CompositeDisposable = require('atom').CompositeDisposable;

  fs = require('fs-plus');

  git = require('../git');

  notifier = require('../notifier');

  GitPush = require('./git-push');

  GitPull = require('./git-pull');

  disposables = new CompositeDisposable;

  verboseCommitsEnabled = function() {
    return atom.config.get('git-plus.commits.verboseCommits');
  };

  getStagedFiles = function(repo) {
    return git.stagedFiles(repo).then(function(files) {
      if (files.length >= 1) {
        return git.cmd(['-c', 'color.ui=false', 'status'], {
          cwd: repo.getWorkingDirectory()
        });
      } else {
        return Promise.reject("Nothing to commit.");
      }
    });
  };

  getTemplate = function(filePath) {
    var e;
    if (filePath) {
      try {
        return fs.readFileSync(fs.absolute(filePath.trim())).toString().trim();
      } catch (error) {
        e = error;
        throw new Error("Your configured commit template file can't be found.");
      }
    } else {
      return '';
    }
  };

  prepFile = function(arg) {
    var commentChar, content, cwd, diff, filePath, status, template;
    status = arg.status, filePath = arg.filePath, diff = arg.diff, commentChar = arg.commentChar, template = arg.template;
    cwd = Path.dirname(filePath);
    status = status.replace(/\s*\(.*\)\n/g, "\n");
    status = status.trim().replace(/\n/g, "\n" + commentChar + " ");
    content = template + "\n" + commentChar + " Please enter the commit message for your changes. Lines starting\n" + commentChar + " with '" + commentChar + "' will be ignored, and an empty message aborts the commit.\n" + commentChar + "\n" + commentChar + " " + status;
    if (diff) {
      content += "\n" + commentChar + "\n" + commentChar + " ------------------------ >8 ------------------------\n" + commentChar + " Do not touch the line above.\n" + commentChar + " Everything below will be removed.\n" + diff;
    }
    return fs.writeFileSync(filePath, content);
  };

  destroyCommitEditor = function(filePath) {
    var ref, ref1;
    if (atom.config.get('git-plus.general.openInPane')) {
      return (ref = atom.workspace.paneForURI(filePath)) != null ? ref.destroy() : void 0;
    } else {
      return (ref1 = atom.workspace.paneForURI(filePath).itemForURI(filePath)) != null ? ref1.destroy() : void 0;
    }
  };

  trimFile = function(filePath, commentChar) {
    var content, cwd, startOfComments;
    cwd = Path.dirname(filePath);
    content = fs.readFileSync(fs.absolute(filePath)).toString();
    startOfComments = content.indexOf(content.split('\n').find(function(line) {
      return line.startsWith(commentChar);
    }));
    content = content.substring(0, startOfComments);
    return fs.writeFileSync(filePath, content);
  };

  commit = function(directory, filePath) {
    return git.cmd(['commit', "--cleanup=strip", "--file=" + filePath], {
      cwd: directory
    }).then(function(data) {
      notifier.addSuccess(data);
      destroyCommitEditor(filePath);
      return git.refresh();
    })["catch"](function(data) {
      notifier.addError(data);
      return destroyCommitEditor(filePath);
    });
  };

  cleanup = function(currentPane, filePath) {
    if (currentPane.isAlive()) {
      currentPane.activate();
    }
    return disposables.dispose();
  };

  showFile = function(filePath) {
    var commitEditor, ref, splitDirection;
    commitEditor = (ref = atom.workspace.paneForURI(filePath)) != null ? ref.itemForURI(filePath) : void 0;
    if (!commitEditor) {
      if (atom.config.get('git-plus.general.openInPane')) {
        splitDirection = atom.config.get('git-plus.general.splitPane');
        atom.workspace.getActivePane()["split" + splitDirection]();
      }
      return atom.workspace.open(filePath);
    } else {
      if (atom.config.get('git-plus.general.openInPane')) {
        atom.workspace.paneForURI(filePath).activate();
      } else {
        atom.workspace.paneForURI(filePath).activateItemForURI(filePath);
      }
      return Promise.resolve(commitEditor);
    }
  };

  module.exports = function(repo, arg) {
    var andPush, commentChar, currentPane, e, filePath, init, ref, ref1, stageChanges, startCommit, template;
    ref = arg != null ? arg : {}, stageChanges = ref.stageChanges, andPush = ref.andPush;
    filePath = Path.join(repo.getPath(), 'COMMIT_EDITMSG');
    currentPane = atom.workspace.getActivePane();
    commentChar = (ref1 = git.getConfig(repo, 'core.commentchar')) != null ? ref1 : '#';
    try {
      template = getTemplate(git.getConfig(repo, 'commit.template'));
    } catch (error) {
      e = error;
      notifier.addError(e.message);
      return Promise.reject(e.message);
    }
    init = function() {
      return getStagedFiles(repo).then(function(status) {
        var args;
        if (verboseCommitsEnabled()) {
          args = ['diff', '--color=never', '--staged'];
          if (atom.config.get('git-plus.diffs.wordDiff')) {
            args.push('--word-diff');
          }
          return git.cmd(args, {
            cwd: repo.getWorkingDirectory()
          }).then(function(diff) {
            return prepFile({
              status: status,
              filePath: filePath,
              diff: diff,
              commentChar: commentChar,
              template: template
            });
          });
        } else {
          return prepFile({
            status: status,
            filePath: filePath,
            commentChar: commentChar,
            template: template
          });
        }
      });
    };
    startCommit = function() {
      return showFile(filePath).then(function(textEditor) {
        disposables.add(textEditor.onDidSave(function() {
          if (verboseCommitsEnabled()) {
            trimFile(filePath, commentChar);
          }
          return commit(repo.getWorkingDirectory(), filePath).then(function() {
            if (andPush) {
              return GitPush(repo);
            }
          });
        }));
        return disposables.add(textEditor.onDidDestroy(function() {
          return cleanup(currentPane, filePath);
        }));
      })["catch"](function(msg) {
        return notifier.addError(msg);
      });
    };
    if (stageChanges) {
      return git.add(repo, {
        update: stageChanges
      }).then(function() {
        return init();
      }).then(function() {
        return startCommit();
      });
    } else {
      return init().then(function() {
        return startCommit();
      })["catch"](function(message) {
        if (typeof message.includes === "function" ? message.includes('CRLF') : void 0) {
          return startCommit();
        } else {
          return notifier.addInfo(message);
        }
      });
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy91Y2hpaGEvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvbGliL21vZGVscy9naXQtY29tbWl0LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUNOLHNCQUF1QixPQUFBLENBQVEsTUFBUjs7RUFDeEIsRUFBQSxHQUFLLE9BQUEsQ0FBUSxTQUFSOztFQUNMLEdBQUEsR0FBTSxPQUFBLENBQVEsUUFBUjs7RUFDTixRQUFBLEdBQVcsT0FBQSxDQUFRLGFBQVI7O0VBQ1gsT0FBQSxHQUFVLE9BQUEsQ0FBUSxZQUFSOztFQUNWLE9BQUEsR0FBVSxPQUFBLENBQVEsWUFBUjs7RUFFVixXQUFBLEdBQWMsSUFBSTs7RUFFbEIscUJBQUEsR0FBd0IsU0FBQTtXQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixpQ0FBaEI7RUFBSDs7RUFFeEIsY0FBQSxHQUFpQixTQUFDLElBQUQ7V0FDZixHQUFHLENBQUMsV0FBSixDQUFnQixJQUFoQixDQUFxQixDQUFDLElBQXRCLENBQTJCLFNBQUMsS0FBRDtNQUN6QixJQUFHLEtBQUssQ0FBQyxNQUFOLElBQWdCLENBQW5CO2VBQ0UsR0FBRyxDQUFDLEdBQUosQ0FBUSxDQUFDLElBQUQsRUFBTyxnQkFBUCxFQUF5QixRQUF6QixDQUFSLEVBQTRDO1VBQUEsR0FBQSxFQUFLLElBQUksQ0FBQyxtQkFBTCxDQUFBLENBQUw7U0FBNUMsRUFERjtPQUFBLE1BQUE7ZUFHRSxPQUFPLENBQUMsTUFBUixDQUFlLG9CQUFmLEVBSEY7O0lBRHlCLENBQTNCO0VBRGU7O0VBT2pCLFdBQUEsR0FBYyxTQUFDLFFBQUQ7QUFDWixRQUFBO0lBQUEsSUFBRyxRQUFIO0FBQ0U7ZUFDRSxFQUFFLENBQUMsWUFBSCxDQUFnQixFQUFFLENBQUMsUUFBSCxDQUFZLFFBQVEs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QUFBOztpQkFDQSxNQUFBLENBQU8sSUFBSSxDQUFDLG1CQUFMLENBQUEsQ0FBUCxFQUFtQyxRQUFuQyxDQUNBLENBQUMsSUFERCxDQUNNLFNBQUE7WUFBRyxJQUFpQixPQUFqQjtxQkFBQSxPQUFBLENBQVEsSUFBUixFQUFBOztVQUFILENBRE47UUFGbUMsQ0FBckIsQ0FBaEI7ZUFJQSxXQUFXLENBQUMsR0FBWixDQUFnQixVQUFVLENBQUMsWUFBWCxDQUF3QixTQUFBO2lCQUFHLE9BQUEsQ0FBUSxXQUFSLEVBQXFCLFFBQXJCO1FBQUgsQ0FBeEIsQ0FBaEI7TUFMSSxDQUROLENBT0EsRUFBQyxLQUFELEVBUEEsQ0FPTyxTQUFDLEdBQUQ7ZUFBUyxRQUFRLENBQUMsUUFBVCxDQUFrQixHQUFsQjtNQUFULENBUFA7SUFEWTtJQVVkLElBQUcsWUFBSDthQUNFLEdBQUcsQ0FBQyxHQUFKLENBQVEsSUFBUixFQUFjO1FBQUEsTUFBQSxFQUFRLFlBQVI7T0FBZCxDQUFtQyxDQUFDLElBQXBDLENBQXlDLFNBQUE7ZUFBRyxJQUFBLENBQUE7TUFBSCxDQUF6QyxDQUFtRCxDQUFDLElBQXBELENBQXlELFNBQUE7ZUFBRyxXQUFBLENBQUE7TUFBSCxDQUF6RCxFQURGO0tBQUEsTUFBQTthQUdFLElBQUEsQ0FBQSxDQUFNLENBQUMsSUFBUCxDQUFZLFNBQUE7ZUFBRyxXQUFBLENBQUE7TUFBSCxDQUFaLENBQ0EsRUFBQyxLQUFELEVBREEsQ0FDTyxTQUFDLE9BQUQ7UUFDTCw2Q0FBRyxPQUFPLENBQUMsU0FBVSxnQkFBckI7aUJBQ0UsV0FBQSxDQUFBLEVBREY7U0FBQSxNQUFBO2lCQUdFLFFBQVEsQ0FBQyxPQUFULENBQWlCLE9BQWpCLEVBSEY7O01BREssQ0FEUCxFQUhGOztFQTVCZTtBQXhGakIiLCJzb3VyY2VzQ29udGVudCI6WyJQYXRoID0gcmVxdWlyZSAncGF0aCdcbntDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXG5mcyA9IHJlcXVpcmUgJ2ZzLXBsdXMnXG5naXQgPSByZXF1aXJlICcuLi9naXQnXG5ub3RpZmllciA9IHJlcXVpcmUgJy4uL25vdGlmaWVyJ1xuR2l0UHVzaCA9IHJlcXVpcmUgJy4vZ2l0LXB1c2gnXG5HaXRQdWxsID0gcmVxdWlyZSAnLi9naXQtcHVsbCdcblxuZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuXG52ZXJib3NlQ29tbWl0c0VuYWJsZWQgPSAtPiBhdG9tLmNvbmZpZy5nZXQoJ2dpdC1wbHVzLmNvbW1pdHMudmVyYm9zZUNvbW1pdHMnKVxuXG5nZXRTdGFnZWRGaWxlcyA9IChyZXBvKSAtPlxuICBnaXQuc3RhZ2VkRmlsZXMocmVwbykudGhlbiAoZmlsZXMpIC0+XG4gICAgaWYgZmlsZXMubGVuZ3RoID49IDFcbiAgICAgIGdpdC5jbWQoWyctYycsICdjb2xvci51aT1mYWxzZScsICdzdGF0dXMnXSwgY3dkOiByZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkoKSlcbiAgICBlbHNlXG4gICAgICBQcm9taXNlLnJlamVjdCBcIk5vdGhpbmcgdG8gY29tbWl0LlwiXG5cbmdldFRlbXBsYXRlID0gKGZpbGVQYXRoKSAtPlxuICBpZiBmaWxlUGF0aFxuICAgIHRyeVxuICAgICAgZnMucmVhZEZpbGVTeW5jKGZzLmFic29sdXRlKGZpbGVQYXRoLnRyaW0oKSkpLnRvU3RyaW5nKCkudHJpbSgpXG4gICAgY2F0Y2ggZVxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiWW91ciBjb25maWd1cmVkIGNvbW1pdCB0ZW1wbGF0ZSBmaWxlIGNhbid0IGJlIGZvdW5kLlwiKVxuICBlbHNlXG4gICAgJydcblxucHJlcEZpbGUgPSAoe3N0YXR1cywgZmlsZVBhdGgsIGRpZmYsIGNvbW1lbnRDaGFyLCB0ZW1wbGF0ZX0pIC0+XG4gIGN3ZCA9IFBhdGguZGlybmFtZShmaWxlUGF0aClcbiAgc3RhdHVzID0gc3RhdHVzLnJlcGxhY2UoL1xccypcXCguKlxcKVxcbi9nLCBcIlxcblwiKVxuICBzdGF0dXMgPSBzdGF0dXMudHJpbSgpLnJlcGxhY2UoL1xcbi9nLCBcIlxcbiN7Y29tbWVudENoYXJ9IFwiKVxuICBjb250ZW50ID1cbiAgICBcIlwiXCIje3RlbXBsYXRlfVxuICAgICN7Y29tbWVudENoYXJ9IFBsZWFzZSBlbnRlciB0aGUgY29tbWl0IG1lc3NhZ2UgZm9yIHlvdXIgY2hhbmdlcy4gTGluZXMgc3RhcnRpbmdcbiAgICAje2NvbW1lbnRDaGFyfSB3aXRoICcje2NvbW1lbnRDaGFyfScgd2lsbCBiZSBpZ25vcmVkLCBhbmQgYW4gZW1wdHkgbWVzc2FnZSBhYm9ydHMgdGhlIGNvbW1pdC5cbiAgICAje2NvbW1lbnRDaGFyfVxuICAgICN7Y29tbWVudENoYXJ9ICN7c3RhdHVzfVwiXCJcIlxuICBpZiBkaWZmXG4gICAgY29udGVudCArPVxuICAgICAgXCJcIlwiXFxuI3tjb21tZW50Q2hhcn1cbiAgICAgICN7Y29tbWVudENoYXJ9IC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSA+OCAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgICN7Y29tbWVudENoYXJ9IERvIG5vdCB0b3VjaCB0aGUgbGluZSBhYm92ZS5cbiAgICAgICN7Y29tbWVudENoYXJ9IEV2ZXJ5dGhpbmcgYmVsb3cgd2lsbCBiZSByZW1vdmVkLlxuICAgICAgI3tkaWZmfVwiXCJcIlxuICBmcy53cml0ZUZpbGVTeW5jIGZpbGVQYXRoLCBjb250ZW50XG5cbmRlc3Ryb3lDb21taXRFZGl0b3IgPSAoZmlsZVBhdGgpIC0+XG4gIGlmIGF0b20uY29uZmlnLmdldCgnZ2l0LXBsdXMuZ2VuZXJhbC5vcGVuSW5QYW5lJylcbiAgICBhdG9tLndvcmtzcGFjZS5wYW5lRm9yVVJJKGZpbGVQYXRoKT8uZGVzdHJveSgpXG4gIGVsc2VcbiAgICBhdG9tLndvcmtzcGFjZS5wYW5lRm9yVVJJKGZpbGVQYXRoKS5pdGVtRm9yVVJJKGZpbGVQYXRoKT8uZGVzdHJveSgpXG5cbnRyaW1GaWxlID0gKGZpbGVQYXRoLCBjb21tZW50Q2hhcikgLT5cbiAgY3dkID0gUGF0aC5kaXJuYW1lKGZpbGVQYXRoKVxuICBjb250ZW50ID0gZnMucmVhZEZpbGVTeW5jKGZzLmFic29sdXRlKGZpbGVQYXRoKSkudG9TdHJpbmcoKVxuICBzdGFydE9mQ29tbWVudHMgPSBjb250ZW50LmluZGV4T2YoY29udGVudC5zcGxpdCgnXFxuJykuZmluZCAobGluZSkgLT4gbGluZS5zdGFydHNXaXRoIGNvbW1lbnRDaGFyKVxuICBjb250ZW50ID0gY29udGVudC5zdWJzdHJpbmcoMCwgc3RhcnRPZkNvbW1lbnRzKVxuICBmcy53cml0ZUZpbGVTeW5jIGZpbGVQYXRoLCBjb250ZW50XG5cbmNvbW1pdCA9IChkaXJlY3RvcnksIGZpbGVQYXRoKSAtPlxuICBnaXQuY21kKFsnY29tbWl0JywgXCItLWNsZWFudXA9c3RyaXBcIiwgXCItLWZpbGU9I3tmaWxlUGF0aH1cIl0sIGN3ZDogZGlyZWN0b3J5KVxuICAudGhlbiAoZGF0YSkgLT5cbiAgICBub3RpZmllci5hZGRTdWNjZXNzIGRhdGFcbiAgICBkZXN0cm95Q29tbWl0RWRpdG9yKGZpbGVQYXRoKVxuICAgIGdpdC5yZWZyZXNoKClcbiAgLmNhdGNoIChkYXRhKSAtPlxuICAgIG5vdGlmaWVyLmFkZEVycm9yIGRhdGFcbiAgICBkZXN0cm95Q29tbWl0RWRpdG9yKGZpbGVQYXRoKVxuXG5jbGVhbnVwID0gKGN1cnJlbnRQYW5lLCBmaWxlUGF0aCkgLT5cbiAgY3VycmVudFBhbmUuYWN0aXZhdGUoKSBpZiBjdXJyZW50UGFuZS5pc0FsaXZlKClcbiAgZGlzcG9zYWJsZXMuZGlzcG9zZSgpXG5cbnNob3dGaWxlID0gKGZpbGVQYXRoKSAtPlxuICBjb21taXRFZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5wYW5lRm9yVVJJKGZpbGVQYXRoKT8uaXRlbUZvclVSSShmaWxlUGF0aClcbiAgaWYgbm90IGNvbW1pdEVkaXRvclxuICAgIGlmIGF0b20uY29uZmlnLmdldCgnZ2l0LXBsdXMuZ2VuZXJhbC5vcGVuSW5QYW5lJylcbiAgICAgIHNwbGl0RGlyZWN0aW9uID0gYXRvbS5jb25maWcuZ2V0KCdnaXQtcGx1cy5nZW5lcmFsLnNwbGl0UGFuZScpXG4gICAgICBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lKClbXCJzcGxpdCN7c3BsaXREaXJlY3Rpb259XCJdKClcbiAgICBhdG9tLndvcmtzcGFjZS5vcGVuIGZpbGVQYXRoXG4gIGVsc2VcbiAgICBpZiBhdG9tLmNvbmZpZy5nZXQoJ2dpdC1wbHVzLmdlbmVyYWwub3BlbkluUGFuZScpXG4gICAgICBhdG9tLndvcmtzcGFjZS5wYW5lRm9yVVJJKGZpbGVQYXRoKS5hY3RpdmF0ZSgpXG4gICAgZWxzZVxuICAgICAgYXRvbS53b3Jrc3BhY2UucGFuZUZvclVSSShmaWxlUGF0aCkuYWN0aXZhdGVJdGVtRm9yVVJJKGZpbGVQYXRoKVxuICAgIFByb21pc2UucmVzb2x2ZShjb21taXRFZGl0b3IpXG5cbm1vZHVsZS5leHBvcnRzID0gKHJlcG8sIHtzdGFnZUNoYW5nZXMsIGFuZFB1c2h9PXt9KSAtPlxuICBmaWxlUGF0aCA9IFBhdGguam9pbihyZXBvLmdldFBhdGgoKSwgJ0NPTU1JVF9FRElUTVNHJylcbiAgY3VycmVudFBhbmUgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lKClcbiAgY29tbWVudENoYXIgPSBnaXQuZ2V0Q29uZmlnKHJlcG8sICdjb3JlLmNvbW1lbnRjaGFyJykgPyAnIydcbiAgdHJ5XG4gICAgdGVtcGxhdGUgPSBnZXRUZW1wbGF0ZShnaXQuZ2V0Q29uZmlnKHJlcG8sICdjb21taXQudGVtcGxhdGUnKSlcbiAgY2F0Y2ggZVxuICAgIG5vdGlmaWVyLmFkZEVycm9yKGUubWVzc2FnZSlcbiAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoZS5tZXNzYWdlKVxuXG4gIGluaXQgPSAtPiBnZXRTdGFnZWRGaWxlcyhyZXBvKS50aGVuIChzdGF0dXMpIC0+XG4gICAgaWYgdmVyYm9zZUNvbW1pdHNFbmFibGVkKClcbiAgICAgIGFyZ3MgPSBbJ2RpZmYnLCAnLS1jb2xvcj1uZXZlcicsICctLXN0YWdlZCddXG4gICAgICBhcmdzLnB1c2ggJy0td29yZC1kaWZmJyBpZiBhdG9tLmNvbmZpZy5nZXQoJ2dpdC1wbHVzLmRpZmZzLndvcmREaWZmJylcbiAgICAgIGdpdC5jbWQoYXJncywgY3dkOiByZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkoKSlcbiAgICAgIC50aGVuIChkaWZmKSAtPiBwcmVwRmlsZSB7c3RhdHVzLCBmaWxlUGF0aCwgZGlmZiwgY29tbWVudENoYXIsIHRlbXBsYXRlfVxuICAgIGVsc2VcbiAgICAgIHByZXBGaWxlIHtzdGF0dXMsIGZpbGVQYXRoLCBjb21tZW50Q2hhciwgdGVtcGxhdGV9XG4gIHN0YXJ0Q29tbWl0ID0gLT5cbiAgICBzaG93RmlsZSBmaWxlUGF0aFxuICAgIC50aGVuICh0ZXh0RWRpdG9yKSAtPlxuICAgICAgZGlzcG9zYWJsZXMuYWRkIHRleHRFZGl0b3Iub25EaWRTYXZlIC0+XG4gICAgICAgIHRyaW1GaWxlKGZpbGVQYXRoLCBjb21tZW50Q2hhcikgaWYgdmVyYm9zZUNvbW1pdHNFbmFibGVkKClcbiAgICAgICAgY29tbWl0KHJlcG8uZ2V0V29ya2luZ0RpcmVjdG9yeSgpLCBmaWxlUGF0aClcbiAgICAgICAgLnRoZW4gLT4gR2l0UHVzaChyZXBvKSBpZiBhbmRQdXNoXG4gICAgICBkaXNwb3NhYmxlcy5hZGQgdGV4dEVkaXRvci5vbkRpZERlc3Ryb3kgLT4gY2xlYW51cCBjdXJyZW50UGFuZSwgZmlsZVBhdGhcbiAgICAuY2F0Y2ggKG1zZykgLT4gbm90aWZpZXIuYWRkRXJyb3IgbXNnXG5cbiAgaWYgc3RhZ2VDaGFuZ2VzXG4gICAgZ2l0LmFkZChyZXBvLCB1cGRhdGU6IHN0YWdlQ2hhbmdlcykudGhlbigtPiBpbml0KCkpLnRoZW4gLT4gc3RhcnRDb21taXQoKVxuICBlbHNlXG4gICAgaW5pdCgpLnRoZW4gLT4gc3RhcnRDb21taXQoKVxuICAgIC5jYXRjaCAobWVzc2FnZSkgLT5cbiAgICAgIGlmIG1lc3NhZ2UuaW5jbHVkZXM/KCdDUkxGJylcbiAgICAgICAgc3RhcnRDb21taXQoKVxuICAgICAgZWxzZVxuICAgICAgICBub3RpZmllci5hZGRJbmZvIG1lc3NhZ2VcbiJdfQ==
