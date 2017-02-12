(function() {
  var OutputViewManager, emptyOrUndefined, getUpstream, git, notifier;

  git = require('../git');

  notifier = require('../notifier');

  OutputViewManager = require('../output-view-manager');

  emptyOrUndefined = function(thing) {
    return thing !== '' && thing !== void 0;
  };

  getUpstream = function(repo) {
    var ref;
    return (ref = repo.getUpstreamBranch()) != null ? ref.substring('refs/remotes/'.length).split('/') : void 0;
  };

  module.exports = function(repo, arg) {
    var args, extraArgs, startMessage, view;
    extraArgs = (arg != null ? arg : {}).extraArgs;
    if (extraArgs == null) {
      extraArgs = [];
    }
    view = OutputViewManager.create();
    startMessage = notifier.addInfo("Pulling...", {
      dismissable: true
    });
    args = ['pull'].concat(extraArgs).concat(getUpstream(repo)).filter(emptyOrUndefined);
    return git.cmd(args, {
      cwd: repo.getWorkingDirectory()
    }, {
      color: true
    }).then(function(data) {
      view.setContent(data).finish();
      return startMessage.dismiss();
    })["catch"](function(error) {
      view.setContent(error).finish();
      return startMessage.dismiss();
    });
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy91Y2hpaGEvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvbGliL21vZGVscy9fcHVsbC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLEdBQUEsR0FBTSxPQUFBLENBQVEsUUFBUjs7RUFDTixRQUFBLEdBQVcsT0FBQSxDQUFRLGFBQVI7O0VBQ1gsaUJBQUEsR0FBb0IsT0FBQSxDQUFRLHdCQUFSOztFQUVwQixnQkFBQSxHQUFtQixTQUFDLEtBQUQ7V0FBVyxLQUFBLEtBQVcsRUFBWCxJQUFrQixLQUFBLEtBQVc7RUFBeEM7O0VBRW5CLFdBQUEsR0FBYyxTQUFDLElBQUQ7QUFDWixRQUFBO3lEQUF3QixDQUFFLFNBQTFCLENBQW9DLGVBQWUsQ0FBQyxNQUFwRCxDQUEyRCxDQUFDLEtBQTVELENBQWtFLEdBQWxFO0VBRFk7O0VBR2QsTUFBTSxDQUFDLE9BQVAsR0FBaUIsU0FBQyxJQUFELEVBQU8sR0FBUDtBQUNmLFFBQUE7SUFEdUIsMkJBQUQsTUFBWTs7TUFDbEMsWUFBYTs7SUFDYixJQUFBLEdBQU8saUJBQWlCLENBQUMsTUFBbEIsQ0FBQTtJQUNQLFlBQUEsR0FBZSxRQUFRLENBQUMsT0FBVCxDQUFpQixZQUFqQixFQUErQjtNQUFBLFdBQUEsRUFBYSxJQUFiO0tBQS9CO0lBQ2YsSUFBQSxHQUFPLENBQUMsTUFBRCxDQUFRLENBQUMsTUFBVCxDQUFnQixTQUFoQixDQUEwQixDQUFDLE1BQTNCLENBQWtDLFdBQUEsQ0FBWSxJQUFaLENBQWxDLENBQW9ELENBQUMsTUFBckQsQ0FBNEQsZ0JBQTVEO1dBQ1AsR0FBRyxDQUFDLEdBQUosQ0FBUSxJQUFSLEVBQWM7TUFBQSxHQUFBLEVBQUssSUFBSSxDQUFDLG1CQUFMLENBQUEsQ0FBTDtLQUFkLEVBQStDO01BQUMsS0FBQSxFQUFPLElBQVI7S0FBL0MsQ0FDQSxDQUFDLElBREQsQ0FDTSxTQUFDLElBQUQ7TUFDSixJQUFJLENBQUMsVUFBTCxDQUFnQixJQUFoQixDQUFxQixDQUFDLE1BQXRCLENBQUE7YUFDQSxZQUFZLENBQUMsT0FBYixDQUFBO0lBRkksQ0FETixDQUlBLEVBQUMsS0FBRCxFQUpBLENBSU8sU0FBQyxLQUFEO01BQ0wsSUFBSSxDQUFDLFVBQUwsQ0FBZ0IsS0FBaEIsQ0FBc0IsQ0FBQyxNQUF2QixDQUFBO2FBQ0EsWUFBWSxDQUFDLE9BQWIsQ0FBQTtJQUZLLENBSlA7RUFMZTtBQVRqQiIsInNvdXJjZXNDb250ZW50IjpbImdpdCA9IHJlcXVpcmUgJy4uL2dpdCdcbm5vdGlmaWVyID0gcmVxdWlyZSAnLi4vbm90aWZpZXInXG5PdXRwdXRWaWV3TWFuYWdlciA9IHJlcXVpcmUgJy4uL291dHB1dC12aWV3LW1hbmFnZXInXG5cbmVtcHR5T3JVbmRlZmluZWQgPSAodGhpbmcpIC0+IHRoaW5nIGlzbnQgJycgYW5kIHRoaW5nIGlzbnQgdW5kZWZpbmVkXG5cbmdldFVwc3RyZWFtID0gKHJlcG8pIC0+XG4gIHJlcG8uZ2V0VXBzdHJlYW1CcmFuY2goKT8uc3Vic3RyaW5nKCdyZWZzL3JlbW90ZXMvJy5sZW5ndGgpLnNwbGl0KCcvJylcblxubW9kdWxlLmV4cG9ydHMgPSAocmVwbywge2V4dHJhQXJnc309e30pIC0+XG4gIGV4dHJhQXJncyA/PSBbXVxuICB2aWV3ID0gT3V0cHV0Vmlld01hbmFnZXIuY3JlYXRlKClcbiAgc3RhcnRNZXNzYWdlID0gbm90aWZpZXIuYWRkSW5mbyBcIlB1bGxpbmcuLi5cIiwgZGlzbWlzc2FibGU6IHRydWVcbiAgYXJncyA9IFsncHVsbCddLmNvbmNhdChleHRyYUFyZ3MpLmNvbmNhdChnZXRVcHN0cmVhbShyZXBvKSkuZmlsdGVyKGVtcHR5T3JVbmRlZmluZWQpXG4gIGdpdC5jbWQoYXJncywgY3dkOiByZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkoKSwge2NvbG9yOiB0cnVlfSlcbiAgLnRoZW4gKGRhdGEpIC0+XG4gICAgdmlldy5zZXRDb250ZW50KGRhdGEpLmZpbmlzaCgpXG4gICAgc3RhcnRNZXNzYWdlLmRpc21pc3MoKVxuICAuY2F0Y2ggKGVycm9yKSAtPlxuICAgIHZpZXcuc2V0Q29udGVudChlcnJvcikuZmluaXNoKClcbiAgICBzdGFydE1lc3NhZ2UuZGlzbWlzcygpXG4iXX0=
