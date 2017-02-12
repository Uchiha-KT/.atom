(function() {
  var BranchListView, OutputViewManager, PushBranchListView, git, isValidBranch, notifier,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  git = require('../git');

  OutputViewManager = require('../output-view-manager');

  notifier = require('../notifier');

  BranchListView = require('./branch-list-view');

  isValidBranch = function(item, remote) {
    return item.startsWith(remote + '/') && !item.includes('/HEAD');
  };

  module.exports = PushBranchListView = (function(superClass) {
    extend(PushBranchListView, superClass);

    function PushBranchListView() {
      return PushBranchListView.__super__.constructor.apply(this, arguments);
    }

    PushBranchListView.prototype.initialize = function(repo, data1, remote1, extraArgs) {
      this.repo = repo;
      this.data = data1;
      this.remote = remote1;
      this.extraArgs = extraArgs;
      PushBranchListView.__super__.initialize.apply(this, arguments);
      return this.result = new Promise((function(_this) {
        return function(resolve, reject) {
          _this.resolve = resolve;
          return _this.reject = reject;
        };
      })(this));
    };

    PushBranchListView.prototype.parseData = function() {
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

    PushBranchListView.prototype.confirmed = function(arg1) {
      var name;
      name = arg1.name;
      this.push(name.substring(name.indexOf('/') + 1));
      return this.cancel();
    };

    PushBranchListView.prototype.push = function(remoteBranch) {
      var args, startMessage, view;
      view = OutputViewManager.create();
      startMessage = notifier.addInfo("Pushing...", {
        dismissable: true
      });
      args = ['push'].concat(this.extraArgs, this.remote, remoteBranch).filter(function(arg) {
        return arg !== '';
      });
      return git.cmd(args, {
        cwd: this.repo.getWorkingDirectory()
      }, {
        color: true
      }).then((function(_this) {
        return function(data) {
          _this.resolve();
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

    return PushBranchListView;

  })(BranchListView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy91Y2hpaGEvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvbGliL3ZpZXdzL3B1c2gtYnJhbmNoLWxpc3Qtdmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLG1GQUFBO0lBQUE7OztFQUFBLEdBQUEsR0FBTSxPQUFBLENBQVEsUUFBUjs7RUFDTixpQkFBQSxHQUFvQixPQUFBLENBQVEsd0JBQVI7O0VBQ3BCLFFBQUEsR0FBVyxPQUFBLENBQVEsYUFBUjs7RUFDWCxjQUFBLEdBQWlCLE9BQUEsQ0FBUSxvQkFBUjs7RUFFakIsYUFBQSxHQUFnQixTQUFDLElBQUQsRUFBTyxNQUFQO1dBQ2QsSUFBSSxDQUFDLFVBQUwsQ0FBZ0IsTUFBQSxHQUFTLEdBQXpCLENBQUEsSUFBa0MsQ0FBSSxJQUFJLENBQUMsUUFBTCxDQUFjLE9BQWQ7RUFEeEI7O0VBR2hCLE1BQU0sQ0FBQyxPQUFQLEdBR1E7Ozs7Ozs7aUNBQ0osVUFBQSxHQUFZLFNBQUMsSUFBRCxFQUFRLEtBQVIsRUFBZSxPQUFmLEVBQXdCLFNBQXhCO01BQUMsSUFBQyxDQUFBLE9BQUQ7TUFBTyxJQUFDLENBQUEsT0FBRDtNQUFPLElBQUMsQ0FBQSxTQUFEO01BQVMsSUFBQyxDQUFBLFlBQUQ7TUFDbEMsb0RBQUEsU0FBQTthQUNBLElBQUMsQ0FBQSxNQUFELEdBQWMsSUFBQSxPQUFBLENBQVEsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLE9BQUQsRUFBVSxNQUFWO1VBQ3BCLEtBQUMsQ0FBQSxPQUFELEdBQVc7aUJBQ1gsS0FBQyxDQUFBLE1BQUQsR0FBVTtRQUZVO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFSO0lBRko7O2lDQU1aLFNBQUEsR0FBVyxTQUFBO0FBQ1QsVUFBQTtNQUFBLEtBQUEsR0FBUSxJQUFDLENBQUEsSUFBSSxDQUFDLEtBQU4sQ0FBWSxJQUFaLENBQWlCLENBQUMsR0FBbEIsQ0FBc0IsU0FBQyxJQUFEO2VBQVUsSUFBSSxDQUFDLE9BQUwsQ0FBYSxLQUFiLEVBQW9CLEVBQXBCO01BQVYsQ0FBdEI7TUFDUixRQUFBLEdBQVcsS0FBSyxDQUFDLE1BQU4sQ0FBYSxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsSUFBRDtpQkFBVSxhQUFBLENBQWMsSUFBZCxFQUFvQixLQUFDLENBQUEsTUFBckI7UUFBVjtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBYixDQUFvRCxDQUFDLEdBQXJELENBQXlELFNBQUMsSUFBRDtlQUFVO1VBQUMsSUFBQSxFQUFNLElBQVA7O01BQVYsQ0FBekQ7TUFDWCxJQUFHLFFBQVEsQ0FBQyxNQUFULEtBQW1CLENBQXRCO1FBQ0UsSUFBQyxDQUFBLFNBQUQsQ0FBVyxRQUFTLENBQUEsQ0FBQSxDQUFwQixFQURGO09BQUEsTUFBQTtRQUdFLElBQUMsQ0FBQSxRQUFELENBQVUsUUFBVixFQUhGOzthQUlBLElBQUMsQ0FBQSxpQkFBRCxDQUFBO0lBUFM7O2lDQVNYLFNBQUEsR0FBVyxTQUFDLElBQUQ7QUFDVCxVQUFBO01BRFcsT0FBRDtNQUNWLElBQUMsQ0FBQSxJQUFELENBQU0sSUFBSSxDQUFDLFNBQUwsQ0FBZSxJQUFJLENBQUMsT0FBTCxDQUFhLEdBQWIsQ0FBQSxHQUFvQixDQUFuQyxDQUFOO2FBQ0EsSUFBQyxDQUFBLE1BQUQsQ0FBQTtJQUZTOztpQ0FJWCxJQUFBLEdBQU0sU0FBQyxZQUFEO0FBQ0osVUFBQTtNQUFBLElBQUEsR0FBTyxpQkFBaUIsQ0FBQyxNQUFsQixDQUFBO01BQ1AsWUFBQSxHQUFlLFFBQVEsQ0FBQyxPQUFULENBQWlCLFlBQWpCLEVBQStCO1FBQUEsV0FBQSxFQUFhLElBQWI7T0FBL0I7TUFDZixJQUFBLEdBQU8sQ0FBQyxNQUFELENBQVEsQ0FBQyxNQUFULENBQWdCLElBQUMsQ0FBQSxTQUFqQixFQUE0QixJQUFDLENBQUEsTUFBN0IsRUFBcUMsWUFBckMsQ0FBa0QsQ0FBQyxNQUFuRCxDQUEwRCxTQUFDLEdBQUQ7ZUFBUyxHQUFBLEtBQVM7TUFBbEIsQ0FBMUQ7YUFDUCxHQUFHLENBQUMsR0FBSixDQUFRLElBQVIsRUFBYztRQUFBLEdBQUEsRUFBSyxJQUFDLENBQUEsSUFBSSxDQUFDLG1CQUFOLENBQUEsQ0FBTDtPQUFkLEVBQWdEO1FBQUMsS0FBQSxFQUFPLElBQVI7T0FBaEQsQ0FDQSxDQUFDLElBREQsQ0FDTSxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsSUFBRDtVQUNKLEtBQUMsQ0FBQSxPQUFELENBQUE7VUFDQSxJQUFJLENBQUMsVUFBTCxDQUFnQixJQUFoQixDQUFxQixDQUFDLE1BQXRCLENBQUE7VUFDQSxZQUFZLENBQUMsT0FBYixDQUFBO2lCQUNBLEdBQUcsQ0FBQyxPQUFKLENBQVksS0FBQyxDQUFBLElBQWI7UUFKSTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FETixDQU1BLEVBQUMsS0FBRCxFQU5BLENBTU8sQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLEtBQUQ7VUFHTCxJQUFJLENBQUMsVUFBTCxDQUFnQixLQUFoQixDQUFzQixDQUFDLE1BQXZCLENBQUE7aUJBQ0EsWUFBWSxDQUFDLE9BQWIsQ0FBQTtRQUpLO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQU5QO0lBSkk7Ozs7S0FwQnlCO0FBWG5DIiwic291cmNlc0NvbnRlbnQiOlsiZ2l0ID0gcmVxdWlyZSAnLi4vZ2l0J1xuT3V0cHV0Vmlld01hbmFnZXIgPSByZXF1aXJlICcuLi9vdXRwdXQtdmlldy1tYW5hZ2VyJ1xubm90aWZpZXIgPSByZXF1aXJlICcuLi9ub3RpZmllcidcbkJyYW5jaExpc3RWaWV3ID0gcmVxdWlyZSAnLi9icmFuY2gtbGlzdC12aWV3J1xuXG5pc1ZhbGlkQnJhbmNoID0gKGl0ZW0sIHJlbW90ZSkgLT5cbiAgaXRlbS5zdGFydHNXaXRoKHJlbW90ZSArICcvJykgYW5kIG5vdCBpdGVtLmluY2x1ZGVzKCcvSEVBRCcpXG5cbm1vZHVsZS5leHBvcnRzID1cbiAgIyBFeHRlbnNpb24gb2YgQnJhbmNoTGlzdFZpZXdcbiAgIyBUYWtlcyB0aGUgbmFtZSBvZiB0aGUgcmVtb3RlIHRvIHB1c2ggdG9cbiAgY2xhc3MgUHVzaEJyYW5jaExpc3RWaWV3IGV4dGVuZHMgQnJhbmNoTGlzdFZpZXdcbiAgICBpbml0aWFsaXplOiAoQHJlcG8sIEBkYXRhLCBAcmVtb3RlLCBAZXh0cmFBcmdzKSAtPlxuICAgICAgc3VwZXJcbiAgICAgIEByZXN1bHQgPSBuZXcgUHJvbWlzZSAocmVzb2x2ZSwgcmVqZWN0KSA9PlxuICAgICAgICBAcmVzb2x2ZSA9IHJlc29sdmVcbiAgICAgICAgQHJlamVjdCA9IHJlamVjdFxuXG4gICAgcGFyc2VEYXRhOiAtPlxuICAgICAgaXRlbXMgPSBAZGF0YS5zcGxpdChcIlxcblwiKS5tYXAgKGl0ZW0pIC0+IGl0ZW0ucmVwbGFjZSgvXFxzL2csICcnKVxuICAgICAgYnJhbmNoZXMgPSBpdGVtcy5maWx0ZXIoKGl0ZW0pID0+IGlzVmFsaWRCcmFuY2goaXRlbSwgQHJlbW90ZSkpLm1hcCAoaXRlbSkgLT4ge25hbWU6IGl0ZW19XG4gICAgICBpZiBicmFuY2hlcy5sZW5ndGggaXMgMVxuICAgICAgICBAY29uZmlybWVkIGJyYW5jaGVzWzBdXG4gICAgICBlbHNlXG4gICAgICAgIEBzZXRJdGVtcyBicmFuY2hlc1xuICAgICAgQGZvY3VzRmlsdGVyRWRpdG9yKClcblxuICAgIGNvbmZpcm1lZDogKHtuYW1lfSkgLT5cbiAgICAgIEBwdXNoIG5hbWUuc3Vic3RyaW5nKG5hbWUuaW5kZXhPZignLycpICsgMSlcbiAgICAgIEBjYW5jZWwoKVxuXG4gICAgcHVzaDogKHJlbW90ZUJyYW5jaCkgLT5cbiAgICAgIHZpZXcgPSBPdXRwdXRWaWV3TWFuYWdlci5jcmVhdGUoKVxuICAgICAgc3RhcnRNZXNzYWdlID0gbm90aWZpZXIuYWRkSW5mbyBcIlB1c2hpbmcuLi5cIiwgZGlzbWlzc2FibGU6IHRydWVcbiAgICAgIGFyZ3MgPSBbJ3B1c2gnXS5jb25jYXQoQGV4dHJhQXJncywgQHJlbW90ZSwgcmVtb3RlQnJhbmNoKS5maWx0ZXIoKGFyZykgLT4gYXJnIGlzbnQgJycpXG4gICAgICBnaXQuY21kKGFyZ3MsIGN3ZDogQHJlcG8uZ2V0V29ya2luZ0RpcmVjdG9yeSgpLCB7Y29sb3I6IHRydWV9KVxuICAgICAgLnRoZW4gKGRhdGEpID0+XG4gICAgICAgIEByZXNvbHZlKClcbiAgICAgICAgdmlldy5zZXRDb250ZW50KGRhdGEpLmZpbmlzaCgpXG4gICAgICAgIHN0YXJ0TWVzc2FnZS5kaXNtaXNzKClcbiAgICAgICAgZ2l0LnJlZnJlc2ggQHJlcG9cbiAgICAgIC5jYXRjaCAoZXJyb3IpID0+XG4gICAgICAgICMjIFNob3VsZCBAcmVzdWx0IGJlIHJlamVjdGVkIGZvciB0aG9zZSBkZXBlbmRpbmcgb24gdGhpcyB2aWV3P1xuICAgICAgICAjIEByZWplY3QoKVxuICAgICAgICB2aWV3LnNldENvbnRlbnQoZXJyb3IpLmZpbmlzaCgpXG4gICAgICAgIHN0YXJ0TWVzc2FnZS5kaXNtaXNzKClcbiJdfQ==
