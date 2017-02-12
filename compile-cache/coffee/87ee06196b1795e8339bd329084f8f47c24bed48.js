(function() {
  var BranchListView, DeleteBranchListView, git, notifier,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  git = require('../git');

  notifier = require('../notifier');

  BranchListView = require('./branch-list-view');

  module.exports = DeleteBranchListView = (function(superClass) {
    extend(DeleteBranchListView, superClass);

    function DeleteBranchListView() {
      return DeleteBranchListView.__super__.constructor.apply(this, arguments);
    }

    DeleteBranchListView.prototype.initialize = function(repo, data, arg) {
      this.repo = repo;
      this.data = data;
      this.isRemote = (arg != null ? arg : {}).isRemote;
      return DeleteBranchListView.__super__.initialize.apply(this, arguments);
    };

    DeleteBranchListView.prototype.confirmed = function(arg) {
      var branch, name, remote;
      name = arg.name;
      if (name.startsWith("*")) {
        name = name.slice(1);
      }
      if (!this.isRemote) {
        this["delete"](name);
      } else {
        branch = name.substring(name.indexOf('/') + 1);
        remote = name.substring(0, name.indexOf('/'));
        this["delete"](branch, remote);
      }
      return this.cancel();
    };

    DeleteBranchListView.prototype["delete"] = function(branch, remote) {
      var args, notification;
      notification = notifier.addInfo("Deleting remote branch " + branch, {
        dismissable: true
      });
      args = remote ? ['push', remote, '--delete'] : ['branch', '-D'];
      return git.cmd(args.concat(branch), {
        cwd: this.repo.getWorkingDirectory()
      }).then(function(message) {
        notification.dismiss();
        return notifier.addSuccess(message);
      })["catch"](function(error) {
        notification.dismiss();
        return notifier.addError(error);
      });
    };

    return DeleteBranchListView;

  })(BranchListView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy91Y2hpaGEvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvbGliL3ZpZXdzL2RlbGV0ZS1icmFuY2gtdmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLG1EQUFBO0lBQUE7OztFQUFBLEdBQUEsR0FBTSxPQUFBLENBQVEsUUFBUjs7RUFDTixRQUFBLEdBQVcsT0FBQSxDQUFRLGFBQVI7O0VBQ1gsY0FBQSxHQUFpQixPQUFBLENBQVEsb0JBQVI7O0VBRWpCLE1BQU0sQ0FBQyxPQUFQLEdBQ1E7Ozs7Ozs7bUNBQ0osVUFBQSxHQUFZLFNBQUMsSUFBRCxFQUFRLElBQVIsRUFBZSxHQUFmO01BQUMsSUFBQyxDQUFBLE9BQUQ7TUFBTyxJQUFDLENBQUEsT0FBRDtNQUFRLElBQUMsQ0FBQSwwQkFBRixNQUFZLElBQVY7YUFBaUIsc0RBQUEsU0FBQTtJQUFsQzs7bUNBRVosU0FBQSxHQUFXLFNBQUMsR0FBRDtBQUNULFVBQUE7TUFEVyxPQUFEO01BQ1YsSUFBd0IsSUFBSSxDQUFDLFVBQUwsQ0FBZ0IsR0FBaEIsQ0FBeEI7UUFBQSxJQUFBLEdBQU8sSUFBSSxDQUFDLEtBQUwsQ0FBVyxDQUFYLEVBQVA7O01BQ0EsSUFBQSxDQUFPLElBQUMsQ0FBQSxRQUFSO1FBQ0UsSUFBQyxFQUFBLE1BQUEsRUFBRCxDQUFRLElBQVIsRUFERjtPQUFBLE1BQUE7UUFHRSxNQUFBLEdBQVMsSUFBSSxDQUFDLFNBQUwsQ0FBZSxJQUFJLENBQUMsT0FBTCxDQUFhLEdBQWIsQ0FBQSxHQUFvQixDQUFuQztRQUNULE1BQUEsR0FBUyxJQUFJLENBQUMsU0FBTCxDQUFlLENBQWYsRUFBa0IsSUFBSSxDQUFDLE9BQUwsQ0FBYSxHQUFiLENBQWxCO1FBQ1QsSUFBQyxFQUFBLE1BQUEsRUFBRCxDQUFRLE1BQVIsRUFBZ0IsTUFBaEIsRUFMRjs7YUFNQSxJQUFDLENBQUEsTUFBRCxDQUFBO0lBUlM7O29DQVVYLFFBQUEsR0FBUSxTQUFDLE1BQUQsRUFBUyxNQUFUO0FBQ04sVUFBQTtNQUFBLFlBQUEsR0FBZSxRQUFRLENBQUMsT0FBVCxDQUFpQix5QkFBQSxHQUEwQixNQUEzQyxFQUFxRDtRQUFBLFdBQUEsRUFBYSxJQUFiO09BQXJEO01BQ2YsSUFBQSxHQUFVLE1BQUgsR0FBZSxDQUFDLE1BQUQsRUFBUyxNQUFULEVBQWlCLFVBQWpCLENBQWYsR0FBaUQsQ0FBQyxRQUFELEVBQVcsSUFBWDthQUN4RCxHQUFHLENBQUMsR0FBSixDQUFRLElBQUksQ0FBQyxNQUFMLENBQVksTUFBWixDQUFSLEVBQTZCO1FBQUEsR0FBQSxFQUFLLElBQUMsQ0FBQSxJQUFJLENBQUMsbUJBQU4sQ0FBQSxDQUFMO09BQTdCLENBQ0EsQ0FBQyxJQURELENBQ00sU0FBQyxPQUFEO1FBQ0osWUFBWSxDQUFDLE9BQWIsQ0FBQTtlQUNBLFFBQVEsQ0FBQyxVQUFULENBQW9CLE9BQXBCO01BRkksQ0FETixDQUlBLEVBQUMsS0FBRCxFQUpBLENBSU8sU0FBQyxLQUFEO1FBQ0wsWUFBWSxDQUFDLE9BQWIsQ0FBQTtlQUNBLFFBQVEsQ0FBQyxRQUFULENBQWtCLEtBQWxCO01BRkssQ0FKUDtJQUhNOzs7O0tBYnlCO0FBTHJDIiwic291cmNlc0NvbnRlbnQiOlsiZ2l0ID0gcmVxdWlyZSAnLi4vZ2l0J1xubm90aWZpZXIgPSByZXF1aXJlICcuLi9ub3RpZmllcidcbkJyYW5jaExpc3RWaWV3ID0gcmVxdWlyZSAnLi9icmFuY2gtbGlzdC12aWV3J1xuXG5tb2R1bGUuZXhwb3J0cyA9XG4gIGNsYXNzIERlbGV0ZUJyYW5jaExpc3RWaWV3IGV4dGVuZHMgQnJhbmNoTGlzdFZpZXdcbiAgICBpbml0aWFsaXplOiAoQHJlcG8sIEBkYXRhLCB7QGlzUmVtb3RlfT17fSkgLT4gc3VwZXJcblxuICAgIGNvbmZpcm1lZDogKHtuYW1lfSkgLT5cbiAgICAgIG5hbWUgPSBuYW1lLnNsaWNlKDEpIGlmIG5hbWUuc3RhcnRzV2l0aCBcIipcIlxuICAgICAgdW5sZXNzIEBpc1JlbW90ZVxuICAgICAgICBAZGVsZXRlIG5hbWVcbiAgICAgIGVsc2VcbiAgICAgICAgYnJhbmNoID0gbmFtZS5zdWJzdHJpbmcobmFtZS5pbmRleE9mKCcvJykgKyAxKVxuICAgICAgICByZW1vdGUgPSBuYW1lLnN1YnN0cmluZygwLCBuYW1lLmluZGV4T2YoJy8nKSlcbiAgICAgICAgQGRlbGV0ZSBicmFuY2gsIHJlbW90ZVxuICAgICAgQGNhbmNlbCgpXG5cbiAgICBkZWxldGU6IChicmFuY2gsIHJlbW90ZSkgLT5cbiAgICAgIG5vdGlmaWNhdGlvbiA9IG5vdGlmaWVyLmFkZEluZm8gXCJEZWxldGluZyByZW1vdGUgYnJhbmNoICN7YnJhbmNofVwiLCBkaXNtaXNzYWJsZTogdHJ1ZVxuICAgICAgYXJncyA9IGlmIHJlbW90ZSB0aGVuIFsncHVzaCcsIHJlbW90ZSwgJy0tZGVsZXRlJ10gZWxzZSBbJ2JyYW5jaCcsICctRCddXG4gICAgICBnaXQuY21kKGFyZ3MuY29uY2F0KGJyYW5jaCksIGN3ZDogQHJlcG8uZ2V0V29ya2luZ0RpcmVjdG9yeSgpKVxuICAgICAgLnRoZW4gKG1lc3NhZ2UpIC0+XG4gICAgICAgIG5vdGlmaWNhdGlvbi5kaXNtaXNzKClcbiAgICAgICAgbm90aWZpZXIuYWRkU3VjY2VzcyBtZXNzYWdlXG4gICAgICAuY2F0Y2ggKGVycm9yKSAtPlxuICAgICAgICBub3RpZmljYXRpb24uZGlzbWlzcygpXG4gICAgICAgIG5vdGlmaWVyLmFkZEVycm9yIGVycm9yXG4iXX0=
