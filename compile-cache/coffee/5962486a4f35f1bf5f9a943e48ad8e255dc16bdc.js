(function() {
  var ListView, git;

  git = require('../git');

  ListView = require('../views/delete-branch-view');

  module.exports = function(repo) {
    return git.cmd(['branch', '--no-color', '-r'], {
      cwd: repo.getWorkingDirectory()
    }).then(function(data) {
      return new ListView(repo, data, {
        isRemote: true
      });
    });
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy91Y2hpaGEvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvbGliL21vZGVscy9naXQtZGVsZXRlLXJlbW90ZS1icmFuY2guY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxHQUFBLEdBQU0sT0FBQSxDQUFRLFFBQVI7O0VBQ04sUUFBQSxHQUFXLE9BQUEsQ0FBUSw2QkFBUjs7RUFFWCxNQUFNLENBQUMsT0FBUCxHQUFpQixTQUFDLElBQUQ7V0FDZixHQUFHLENBQUMsR0FBSixDQUFRLENBQUMsUUFBRCxFQUFXLFlBQVgsRUFBeUIsSUFBekIsQ0FBUixFQUF3QztNQUFBLEdBQUEsRUFBSyxJQUFJLENBQUMsbUJBQUwsQ0FBQSxDQUFMO0tBQXhDLENBQ0EsQ0FBQyxJQURELENBQ00sU0FBQyxJQUFEO2FBQWMsSUFBQSxRQUFBLENBQVMsSUFBVCxFQUFlLElBQWYsRUFBcUI7UUFBQSxRQUFBLEVBQVUsSUFBVjtPQUFyQjtJQUFkLENBRE47RUFEZTtBQUhqQiIsInNvdXJjZXNDb250ZW50IjpbImdpdCA9IHJlcXVpcmUgJy4uL2dpdCdcbkxpc3RWaWV3ID0gcmVxdWlyZSAnLi4vdmlld3MvZGVsZXRlLWJyYW5jaC12aWV3J1xuXG5tb2R1bGUuZXhwb3J0cyA9IChyZXBvKSAtPlxuICBnaXQuY21kKFsnYnJhbmNoJywgJy0tbm8tY29sb3InLCAnLXInXSwgY3dkOiByZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkoKSlcbiAgLnRoZW4gKGRhdGEpIC0+IG5ldyBMaXN0VmlldyhyZXBvLCBkYXRhLCBpc1JlbW90ZTogdHJ1ZSlcbiJdfQ==
