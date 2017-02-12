(function() {
  var BranchListView, OutputViewManager, PullBranchListView, git, isValidBranch, notifier,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  git = require('../git');

  OutputViewManager = require('../output-view-manager');

  notifier = require('../notifier');

  BranchListView = require('./branch-list-view');

  isValidBranch = function(item, remote) {
    return item.startsWith(remote + '/') && !item.includes('/HEAD');
  };

  module.exports = PullBranchListView = (function(superClass) {
    extend(PullBranchListView, superClass);

    function PullBranchListView() {
      return PullBranchListView.__super__.constructor.apply(this, arguments);
    }

    PullBranchListView.prototype.initialize = function(repo, data1, remote1, extraArgs) {
      this.repo = repo;
      this.data = data1;
      this.remote = remote1;
      this.extraArgs = extraArgs;
      PullBranchListView.__super__.initialize.apply(this, arguments);
      return this.result = new Promise((function(_this) {
        return function(resolve, reject) {
          _this.resolve = resolve;
          return _this.reject = reject;
        };
      })(this));
    };

    PullBranchListView.prototype.parseData = function() {
      var branches, items;
      items = this.data.split("\n").map(function(item) {
        return item.replace(/\s/g, '');
      });
      branches = items.filter((function(_this) {
        return function(item) {
          return isValidBranch(item, _this.remote);
        };
      })(this)).map(function(item) {
        return {
          name: item
        };
      });
      if (branches.length === 1) {
        this.confirmed(branches[0]);
      } else {
        this.setItems(branches);
      }
      return this.focusFilterEditor();
    };

    PullBranchListView.prototype.confirmed = function(arg1) {
      var name;
      name = arg1.name;
      this.pull(name.substring(name.indexOf('/') + 1));
      return this.cancel();
    };

    PullBranchListView.prototype.pull = function(remoteBranch) {
      var args, startMessage, view;
      if (remoteBranch == null) {
        remoteBranch = '';
      }
      view = OutputViewManager.create();
      startMessage = notifier.addInfo("Pulling...", {
        dismissable: true
      });
      args = ['pull'].concat(this.extraArgs, this.remote, remoteBranch).filter(function(arg) {
        return arg !== '';
      });
      return git.cmd(args, {
        cwd: this.repo.getWorkingDirectory()
      }, {
        color: true
      }).then((function(_this) {
        return function(data) {
          _this.resolve(remoteBranch);
          view.setContent(data).finish();
          startMessage.dismiss();
          return git.refresh(_this.repo);
        };
      })(this))["catch"]((function(_this) {
        return function(error) {
          view.setContent(error).finish();
          return startMessage.dismiss();
        };
      })(this));
    };

    return PullBranchListView;

  })(BranchListView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy91Y2hpaGEvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvbGliL3ZpZXdzL3B1bGwtYnJhbmNoLWxpc3Qtdmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLG1GQUFBO0lBQUE7OztFQUFBLEdBQUEsR0FBTSxPQUFBLENBQVEsUUFBUjs7RUFDTixpQkFBQSxHQUFvQixPQUFBLENBQVEsd0JBQVI7O0VBQ3BCLFFBQUEsR0FBVyxPQUFBLENBQVEsYUFBUjs7RUFDWCxjQUFBLEdBQWlCLE9BQUEsQ0FBUSxvQkFBUjs7RUFFakIsYUFBQSxHQUFnQixTQUFDLElBQUQsRUFBTyxNQUFQO1dBQ2QsSUFBSSxDQUFDLFVBQUwsQ0FBZ0IsTUFBQSxHQUFTLEdBQXpCLENBQUEsSUFBa0MsQ0FBSSxJQUFJLENBQUMsUUFBTCxDQUFjLE9BQWQ7RUFEeEI7O0VBR2hCLE1BQU0sQ0FBQyxPQUFQLEdBR1E7Ozs7Ozs7aUNBQ0osVUFBQSxHQUFZLFNBQUMsSUFBRCxFQUFRLEtBQVIsRUFBZSxPQUFmLEVBQXdCLFNBQXhCO01BQUMsSUFBQyxDQUFBLE9BQUQ7TUFBTyxJQUFDLENBQUEsT0FBRDtNQUFPLElBQUMsQ0FBQSxTQUFEO01BQVMsSUFBQyxDQUFBLFlBQUQ7TUFDbEMsb0RBQUEsU0FBQTthQUNBLElBQUMsQ0FBQSxNQUFELEdBQWMsSUFBQSxPQUFBLENBQVEsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLE9BQUQsRUFBVSxNQUFWO1VBQ3BCLEtBQUMsQ0FBQSxPQUFELEdBQVc7aUJBQ1gsS0FBQyxDQUFBLE1BQUQsR0FBVTtRQUZVO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFSO0lBRko7O2lDQU1aLFNBQUEsR0FBVyxTQUFBO0FBQ1QsVUFBQTtNQUFBLEtBQUEsR0FBUSxJQUFDLENBQUEsSUFBSSxDQUFDLEtBQU4sQ0FBWSxJQUFaLENBQWlCLENBQUMsR0FBbEIsQ0FBc0IsU0FBQyxJQUFEO2VBQVUsSUFBSSxDQUFDLE9BQUwsQ0FBYSxLQUFiLEVBQW9CLEVBQXBCO01BQVYsQ0FBdEI7TUFDUixRQUFBLEdBQVcsS0FBSyxDQUFDLE1BQU4sQ0FBYSxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsSUFBRDtpQkFBVSxhQUFBLENBQWMsSUFBZCxFQUFvQixLQUFDLENBQUEsTUFBckI7UUFBVjtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBYixDQUFvRCxDQUFDLEdBQXJELENBQXlELFNBQUMsSUFBRDtlQUFVO1VBQUMsSUFBQSxFQUFNLElBQVA7O01BQVYsQ0FBekQ7TUFDWCxJQUFHLFFBQVEsQ0FBQyxNQUFULEtBQW1CLENBQXRCO1FBQ0UsSUFBQyxDQUFBLFNBQUQsQ0FBVyxRQUFTLENBQUEsQ0FBQSxDQUFwQixFQURGO09BQUEsTUFBQTtRQUdFLElBQUMsQ0FBQSxRQUFELENBQVUsUUFBVixFQUhGOzthQUlBLElBQUMsQ0FBQSxpQkFBRCxDQUFBO0lBUFM7O2lDQVNYLFNBQUEsR0FBVyxTQUFDLElBQUQ7QUFDVCxVQUFBO01BRFcsT0FBRDtNQUNWLElBQUMsQ0FBQSxJQUFELENBQU0sSUFBSSxDQUFDLFNBQUwsQ0FBZSxJQUFJLENBQUMsT0FBTCxDQUFhLEdBQWIsQ0FBQSxHQUFvQixDQUFuQyxDQUFOO2FBQ0EsSUFBQyxDQUFBLE1BQUQsQ0FBQTtJQUZTOztpQ0FJWCxJQUFBLEdBQU0sU0FBQyxZQUFEO0FBQ0osVUFBQTs7UUFESyxlQUFhOztNQUNsQixJQUFBLEdBQU8saUJBQWlCLENBQUMsTUFBbEIsQ0FBQTtNQUNQLFlBQUEsR0FBZSxRQUFRLENBQUMsT0FBVCxDQUFpQixZQUFqQixFQUErQjtRQUFBLFdBQUEsRUFBYSxJQUFiO09BQS9CO01BQ2YsSUFBQSxHQUFPLENBQUMsTUFBRCxDQUFRLENBQUMsTUFBVCxDQUFnQixJQUFDLENBQUEsU0FBakIsRUFBNEIsSUFBQyxDQUFBLE1BQTdCLEVBQXFDLFlBQXJDLENBQWtELENBQUMsTUFBbkQsQ0FBMEQsU0FBQyxHQUFEO2VBQVMsR0FBQSxLQUFTO01BQWxCLENBQTFEO2FBQ1AsR0FBRyxDQUFDLEdBQUosQ0FBUSxJQUFSLEVBQWM7UUFBQSxHQUFBLEVBQUssSUFBQyxDQUFBLElBQUksQ0FBQyxtQkFBTixDQUFBLENBQUw7T0FBZCxFQUFnRDtRQUFDLEtBQUEsRUFBTyxJQUFSO09BQWhELENBQ0EsQ0FBQyxJQURELENBQ00sQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLElBQUQ7VUFDSixLQUFDLENBQUEsT0FBRCxDQUFTLFlBQVQ7VUFDQSxJQUFJLENBQUMsVUFBTCxDQUFnQixJQUFoQixDQUFxQixDQUFDLE1BQXRCLENBQUE7VUFDQSxZQUFZLENBQUMsT0FBYixDQUFBO2lCQUNBLEdBQUcsQ0FBQyxPQUFKLENBQVksS0FBQyxDQUFBLElBQWI7UUFKSTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FETixDQU1BLEVBQUMsS0FBRCxFQU5BLENBTU8sQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLEtBQUQ7VUFHTCxJQUFJLENBQUMsVUFBTCxDQUFnQixLQUFoQixDQUFzQixDQUFDLE1BQXZCLENBQUE7aUJBQ0EsWUFBWSxDQUFDLE9BQWIsQ0FBQTtRQUpLO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQU5QO0lBSkk7Ozs7S0FwQnlCO0FBWG5DIiwic291cmNlc0NvbnRlbnQiOlsiZ2l0ID0gcmVxdWlyZSAnLi4vZ2l0J1xuT3V0cHV0Vmlld01hbmFnZXIgPSByZXF1aXJlICcuLi9vdXRwdXQtdmlldy1tYW5hZ2VyJ1xubm90aWZpZXIgPSByZXF1aXJlICcuLi9ub3RpZmllcidcbkJyYW5jaExpc3RWaWV3ID0gcmVxdWlyZSAnLi9icmFuY2gtbGlzdC12aWV3J1xuXG5pc1ZhbGlkQnJhbmNoID0gKGl0ZW0sIHJlbW90ZSkgLT5cbiAgaXRlbS5zdGFydHNXaXRoKHJlbW90ZSArICcvJykgYW5kIG5vdCBpdGVtLmluY2x1ZGVzKCcvSEVBRCcpXG5cbm1vZHVsZS5leHBvcnRzID1cbiAgIyBFeHRlbnNpb24gb2YgQnJhbmNoTGlzdFZpZXdcbiAgIyBUYWtlcyB0aGUgbmFtZSBvZiB0aGUgcmVtb3RlIHRvIHB1bGwgZnJvbVxuICBjbGFzcyBQdWxsQnJhbmNoTGlzdFZpZXcgZXh0ZW5kcyBCcmFuY2hMaXN0Vmlld1xuICAgIGluaXRpYWxpemU6IChAcmVwbywgQGRhdGEsIEByZW1vdGUsIEBleHRyYUFyZ3MpIC0+XG4gICAgICBzdXBlclxuICAgICAgQHJlc3VsdCA9IG5ldyBQcm9taXNlIChyZXNvbHZlLCByZWplY3QpID0+XG4gICAgICAgIEByZXNvbHZlID0gcmVzb2x2ZVxuICAgICAgICBAcmVqZWN0ID0gcmVqZWN0XG5cbiAgICBwYXJzZURhdGE6IC0+XG4gICAgICBpdGVtcyA9IEBkYXRhLnNwbGl0KFwiXFxuXCIpLm1hcCAoaXRlbSkgLT4gaXRlbS5yZXBsYWNlKC9cXHMvZywgJycpXG4gICAgICBicmFuY2hlcyA9IGl0ZW1zLmZpbHRlcigoaXRlbSkgPT4gaXNWYWxpZEJyYW5jaChpdGVtLCBAcmVtb3RlKSkubWFwIChpdGVtKSAtPiB7bmFtZTogaXRlbX1cbiAgICAgIGlmIGJyYW5jaGVzLmxlbmd0aCBpcyAxXG4gICAgICAgIEBjb25maXJtZWQgYnJhbmNoZXNbMF1cbiAgICAgIGVsc2VcbiAgICAgICAgQHNldEl0ZW1zIGJyYW5jaGVzXG4gICAgICBAZm9jdXNGaWx0ZXJFZGl0b3IoKVxuXG4gICAgY29uZmlybWVkOiAoe25hbWV9KSAtPlxuICAgICAgQHB1bGwgbmFtZS5zdWJzdHJpbmcobmFtZS5pbmRleE9mKCcvJykgKyAxKVxuICAgICAgQGNhbmNlbCgpXG5cbiAgICBwdWxsOiAocmVtb3RlQnJhbmNoPScnKSAtPlxuICAgICAgdmlldyA9IE91dHB1dFZpZXdNYW5hZ2VyLmNyZWF0ZSgpXG4gICAgICBzdGFydE1lc3NhZ2UgPSBub3RpZmllci5hZGRJbmZvIFwiUHVsbGluZy4uLlwiLCBkaXNtaXNzYWJsZTogdHJ1ZVxuICAgICAgYXJncyA9IFsncHVsbCddLmNvbmNhdChAZXh0cmFBcmdzLCBAcmVtb3RlLCByZW1vdGVCcmFuY2gpLmZpbHRlcigoYXJnKSAtPiBhcmcgaXNudCAnJylcbiAgICAgIGdpdC5jbWQoYXJncywgY3dkOiBAcmVwby5nZXRXb3JraW5nRGlyZWN0b3J5KCksIHtjb2xvcjogdHJ1ZX0pXG4gICAgICAudGhlbiAoZGF0YSkgPT5cbiAgICAgICAgQHJlc29sdmUgcmVtb3RlQnJhbmNoXG4gICAgICAgIHZpZXcuc2V0Q29udGVudChkYXRhKS5maW5pc2goKVxuICAgICAgICBzdGFydE1lc3NhZ2UuZGlzbWlzcygpXG4gICAgICAgIGdpdC5yZWZyZXNoIEByZXBvXG4gICAgICAuY2F0Y2ggKGVycm9yKSA9PlxuICAgICAgICAjIyBTaG91bGQgQHJlc3VsdCBiZSByZWplY3RlZCBmb3IgdGhvc2UgZGVwZW5kaW5nIG9uIHRoaXMgdmlldz9cbiAgICAgICAgIyBAcmVqZWN0KClcbiAgICAgICAgdmlldy5zZXRDb250ZW50KGVycm9yKS5maW5pc2goKVxuICAgICAgICBzdGFydE1lc3NhZ2UuZGlzbWlzcygpXG4iXX0=
