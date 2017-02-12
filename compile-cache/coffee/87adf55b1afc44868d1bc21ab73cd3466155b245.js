(function() {
  var CompositeDisposable, Os, Path, disposables, fs, git, nothingToShow, notifier, prepFile, showFile;

  CompositeDisposable = require('atom').CompositeDisposable;

  Os = require('os');

  Path = require('path');

  fs = require('fs-plus');

  git = require('../git');

  notifier = require('../notifier');

  nothingToShow = 'Nothing to show.';

  disposables = new CompositeDisposable;

  showFile = function(filePath) {
    var splitDirection;
    if (atom.config.get('git-plus.general.openInPane')) {
      splitDirection = atom.config.get('git-plus.general.splitPane');
      atom.workspace.getActivePane()["split" + splitDirection]();
    }
    return atom.workspace.open(filePath);
  };

  prepFile = function(text, filePath) {
    return new Promise(function(resolve, reject) {
      if ((text != null ? text.length : void 0) === 0) {
        return reject(nothingToShow);
      } else {
        return fs.writeFile(filePath, text, {
          flag: 'w+'
        }, function(err) {
          if (err) {
            return reject(err);
          } else {
            return resolve(true);
          }
        });
      }
    });
  };

  module.exports = function(repo, arg) {
    var args, diffFilePath, diffStat, file, ref, ref1;
    ref = arg != null ? arg : {}, diffStat = ref.diffStat, file = ref.file;
    diffFilePath = Path.join(repo.getPath(), "atom_git_plus.diff");
    if (file == null) {
      file = repo.relativize((ref1 = atom.workspace.getActiveTextEditor()) != null ? ref1.getPath() : void 0);
    }
    if (!file) {
      return notifier.addError("No open file. Select 'Diff All'.");
    }
    args = ['diff', '--color=never'];
    if (atom.config.get('git-plus.diffs.includeStagedDiff')) {
      args.push('HEAD');
    }
    if (atom.config.get('git-plus.diffs.wordDiff')) {
      args.push('--word-diff');
    }
    if (!diffStat) {
      args.push(file);
    }
    return git.cmd(args, {
      cwd: repo.getWorkingDirectory()
    }).then(function(data) {
      return prepFile((diffStat != null ? diffStat : '') + data, diffFilePath);
    }).then(function() {
      return showFile(diffFilePath);
    }).then(function(textEditor) {
      return disposables.add(textEditor.onDidDestroy(function() {
        return fs.unlink(diffFilePath);
      }));
    })["catch"](function(err) {
      if (err === nothingToShow) {
        return notifier.addInfo(err);
      } else {
        return notifier.addError(err);
      }
    });
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy91Y2hpaGEvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvbGliL21vZGVscy9naXQtZGlmZi5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFDLHNCQUF1QixPQUFBLENBQVEsTUFBUjs7RUFDeEIsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSOztFQUNMLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFDUCxFQUFBLEdBQUssT0FBQSxDQUFRLFNBQVI7O0VBRUwsR0FBQSxHQUFNLE9BQUEsQ0FBUSxRQUFSOztFQUNOLFFBQUEsR0FBVyxPQUFBLENBQVEsYUFBUjs7RUFFWCxhQUFBLEdBQWdCOztFQUVoQixXQUFBLEdBQWMsSUFBSTs7RUFFbEIsUUFBQSxHQUFXLFNBQUMsUUFBRDtBQUNULFFBQUE7SUFBQSxJQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQiw2QkFBaEIsQ0FBSDtNQUNFLGNBQUEsR0FBaUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLDRCQUFoQjtNQUNqQixJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWYsQ0FBQSxDQUErQixDQUFBLE9BQUEsR0FBUSxjQUFSLENBQS9CLENBQUEsRUFGRjs7V0FHQSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQWYsQ0FBb0IsUUFBcEI7RUFKUzs7RUFNWCxRQUFBLEdBQVcsU0FBQyxJQUFELEVBQU8sUUFBUDtXQUNMLElBQUEsT0FBQSxDQUFRLFNBQUMsT0FBRCxFQUFVLE1BQVY7TUFDVixvQkFBRyxJQUFJLENBQUUsZ0JBQU4sS0FBZ0IsQ0FBbkI7ZUFDRSxNQUFBLENBQU8sYUFBUCxFQURGO09BQUEsTUFBQTtlQUdFLEVBQUUsQ0FBQyxTQUFILENBQWEsUUFBYixFQUF1QixJQUF2QixFQUE2QjtVQUFBLElBQUEsRUFBTSxJQUFOO1NBQTdCLEVBQXlDLFNBQUMsR0FBRDtVQUN2QyxJQUFHLEdBQUg7bUJBQVksTUFBQSxDQUFPLEdBQVAsRUFBWjtXQUFBLE1BQUE7bUJBQTRCLE9BQUEsQ0FBUSxJQUFSLEVBQTVCOztRQUR1QyxDQUF6QyxFQUhGOztJQURVLENBQVI7RUFESzs7RUFRWCxNQUFNLENBQUMsT0FBUCxHQUFpQixTQUFDLElBQUQsRUFBTyxHQUFQO0FBQ2YsUUFBQTt3QkFEc0IsTUFBaUIsSUFBaEIseUJBQVU7SUFDakMsWUFBQSxHQUFlLElBQUksQ0FBQyxJQUFMLENBQVUsSUFBSSxDQUFDLE9BQUwsQ0FBQSxDQUFWLEVBQTBCLG9CQUExQjs7TUFDZixPQUFRLElBQUksQ0FBQyxVQUFMLDZEQUFvRCxDQUFFLE9BQXRDLENBQUEsVUFBaEI7O0lBQ1IsSUFBRyxDQUFJLElBQVA7QUFDRSxhQUFPLFFBQVEsQ0FBQyxRQUFULENBQWtCLGtDQUFsQixFQURUOztJQUVBLElBQUEsR0FBTyxDQUFDLE1BQUQsRUFBUyxlQUFUO0lBQ1AsSUFBb0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLGtDQUFoQixDQUFwQjtNQUFBLElBQUksQ0FBQyxJQUFMLENBQVUsTUFBVixFQUFBOztJQUNBLElBQTJCLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQix5QkFBaEIsQ0FBM0I7TUFBQSxJQUFJLENBQUMsSUFBTCxDQUFVLGFBQVYsRUFBQTs7SUFDQSxJQUFBLENBQXNCLFFBQXRCO01BQUEsSUFBSSxDQUFDLElBQUwsQ0FBVSxJQUFWLEVBQUE7O1dBQ0EsR0FBRyxDQUFDLEdBQUosQ0FBUSxJQUFSLEVBQWM7TUFBQSxHQUFBLEVBQUssSUFBSSxDQUFDLG1CQUFMLENBQUEsQ0FBTDtLQUFkLENBQ0EsQ0FBQyxJQURELENBQ00sU0FBQyxJQUFEO2FBQVUsUUFBQSxDQUFTLG9CQUFDLFdBQVcsRUFBWixDQUFBLEdBQWtCLElBQTNCLEVBQWlDLFlBQWpDO0lBQVYsQ0FETixDQUVBLENBQUMsSUFGRCxDQUVNLFNBQUE7YUFBRyxRQUFBLENBQVMsWUFBVDtJQUFILENBRk4sQ0FHQSxDQUFDLElBSEQsQ0FHTSxTQUFDLFVBQUQ7YUFDSixXQUFXLENBQUMsR0FBWixDQUFnQixVQUFVLENBQUMsWUFBWCxDQUF3QixTQUFBO2VBQUcsRUFBRSxDQUFDLE1BQUgsQ0FBVSxZQUFWO01BQUgsQ0FBeEIsQ0FBaEI7SUFESSxDQUhOLENBS0EsRUFBQyxLQUFELEVBTEEsQ0FLTyxTQUFDLEdBQUQ7TUFDTCxJQUFHLEdBQUEsS0FBTyxhQUFWO2VBQ0UsUUFBUSxDQUFDLE9BQVQsQ0FBaUIsR0FBakIsRUFERjtPQUFBLE1BQUE7ZUFHRSxRQUFRLENBQUMsUUFBVCxDQUFrQixHQUFsQixFQUhGOztJQURLLENBTFA7RUFUZTtBQTFCakIiLCJzb3VyY2VzQ29udGVudCI6WyJ7Q29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlICdhdG9tJ1xuT3MgPSByZXF1aXJlICdvcydcblBhdGggPSByZXF1aXJlICdwYXRoJ1xuZnMgPSByZXF1aXJlICdmcy1wbHVzJ1xuXG5naXQgPSByZXF1aXJlICcuLi9naXQnXG5ub3RpZmllciA9IHJlcXVpcmUgJy4uL25vdGlmaWVyJ1xuXG5ub3RoaW5nVG9TaG93ID0gJ05vdGhpbmcgdG8gc2hvdy4nXG5cbmRpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcblxuc2hvd0ZpbGUgPSAoZmlsZVBhdGgpIC0+XG4gIGlmIGF0b20uY29uZmlnLmdldCgnZ2l0LXBsdXMuZ2VuZXJhbC5vcGVuSW5QYW5lJylcbiAgICBzcGxpdERpcmVjdGlvbiA9IGF0b20uY29uZmlnLmdldCgnZ2l0LXBsdXMuZ2VuZXJhbC5zcGxpdFBhbmUnKVxuICAgIGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmUoKVtcInNwbGl0I3tzcGxpdERpcmVjdGlvbn1cIl0oKVxuICBhdG9tLndvcmtzcGFjZS5vcGVuKGZpbGVQYXRoKVxuXG5wcmVwRmlsZSA9ICh0ZXh0LCBmaWxlUGF0aCkgLT5cbiAgbmV3IFByb21pc2UgKHJlc29sdmUsIHJlamVjdCkgLT5cbiAgICBpZiB0ZXh0Py5sZW5ndGggaXMgMFxuICAgICAgcmVqZWN0IG5vdGhpbmdUb1Nob3dcbiAgICBlbHNlXG4gICAgICBmcy53cml0ZUZpbGUgZmlsZVBhdGgsIHRleHQsIGZsYWc6ICd3KycsIChlcnIpIC0+XG4gICAgICAgIGlmIGVyciB0aGVuIHJlamVjdCBlcnIgZWxzZSByZXNvbHZlIHRydWVcblxubW9kdWxlLmV4cG9ydHMgPSAocmVwbywge2RpZmZTdGF0LCBmaWxlfT17fSkgLT5cbiAgZGlmZkZpbGVQYXRoID0gUGF0aC5qb2luKHJlcG8uZ2V0UGF0aCgpLCBcImF0b21fZ2l0X3BsdXMuZGlmZlwiKVxuICBmaWxlID89IHJlcG8ucmVsYXRpdml6ZShhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCk/LmdldFBhdGgoKSlcbiAgaWYgbm90IGZpbGVcbiAgICByZXR1cm4gbm90aWZpZXIuYWRkRXJyb3IgXCJObyBvcGVuIGZpbGUuIFNlbGVjdCAnRGlmZiBBbGwnLlwiXG4gIGFyZ3MgPSBbJ2RpZmYnLCAnLS1jb2xvcj1uZXZlciddXG4gIGFyZ3MucHVzaCAnSEVBRCcgaWYgYXRvbS5jb25maWcuZ2V0ICdnaXQtcGx1cy5kaWZmcy5pbmNsdWRlU3RhZ2VkRGlmZidcbiAgYXJncy5wdXNoICctLXdvcmQtZGlmZicgaWYgYXRvbS5jb25maWcuZ2V0ICdnaXQtcGx1cy5kaWZmcy53b3JkRGlmZidcbiAgYXJncy5wdXNoIGZpbGUgdW5sZXNzIGRpZmZTdGF0XG4gIGdpdC5jbWQoYXJncywgY3dkOiByZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkoKSlcbiAgLnRoZW4gKGRhdGEpIC0+IHByZXBGaWxlKChkaWZmU3RhdCA/ICcnKSArIGRhdGEsIGRpZmZGaWxlUGF0aClcbiAgLnRoZW4gLT4gc2hvd0ZpbGUgZGlmZkZpbGVQYXRoXG4gIC50aGVuICh0ZXh0RWRpdG9yKSAtPlxuICAgIGRpc3Bvc2FibGVzLmFkZCB0ZXh0RWRpdG9yLm9uRGlkRGVzdHJveSAtPiBmcy51bmxpbmsgZGlmZkZpbGVQYXRoXG4gIC5jYXRjaCAoZXJyKSAtPlxuICAgIGlmIGVyciBpcyBub3RoaW5nVG9TaG93XG4gICAgICBub3RpZmllci5hZGRJbmZvIGVyclxuICAgIGVsc2VcbiAgICAgIG5vdGlmaWVyLmFkZEVycm9yIGVyclxuIl19
