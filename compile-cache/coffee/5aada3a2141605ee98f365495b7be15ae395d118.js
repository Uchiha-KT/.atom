(function() {
  var CompositeDisposable, HtmlPreviewView, url;

  url = require('url');

  CompositeDisposable = require('atom').CompositeDisposable;

  HtmlPreviewView = require('./atom-html-preview-view');

  module.exports = {
    config: {
      triggerOnSave: {
        type: 'boolean',
        description: 'Watch will trigger on save.',
        "default": false
      },
      preserveWhiteSpaces: {
        type: 'boolean',
        description: 'Preserve white spaces and line endings.',
        "default": false
      },
      fileEndings: {
        type: 'array',
        title: 'Preserve file endings',
        description: 'File endings to preserve',
        "default": ["c", "h"],
        items: {
          type: 'string'
        }
      },
      scrollToCursor: {
        type: 'boolean',
        description: 'Attempts to scroll the webview to the section of your HTML you are editing based on your cursor\'s position.',
        "default": false
      },
      enableMathJax: {
        type: 'boolean',
        description: 'Enable MathJax inline rendering \\f$ \\pi \\f$',
        "default": false
      }
    },
    htmlPreviewView: null,
    activate: function(state) {
      this.subscriptions = new CompositeDisposable;
      this.subscriptions.add(atom.workspace.observeTextEditors((function(_this) {
        return function(editor) {
          return _this.subscriptions.add(editor.onDidSave(function() {
            if ((typeof htmlPreviewView !== "undefined" && htmlPreviewView !== null) && htmlPreviewView instanceof HtmlPreviewView) {
              return htmlPreviewView.renderHTML();
            }
          }));
        };
      })(this)));
      this.subscriptions.add(atom.commands.add('atom-workspace', {
        'atom-html-preview:toggle': (function(_this) {
          return function() {
            return _this.toggle();
          };
        })(this)
      }));
      return atom.workspace.addOpener(function(uriToOpen) {
        var error, host, pathname, protocol, ref;
        try {
          ref = url.parse(uriToOpen), protocol = ref.protocol, host = ref.host, pathname = ref.pathname;
        } catch (error1) {
          error = error1;
          return;
        }
        if (protocol !== 'html-preview:') {
          return;
        }
        try {
          if (pathname) {
            pathname = decodeURI(pathname);
          }
        } catch (error1) {
          error = error1;
          return;
        }
        if (host === 'editor') {
          this.htmlPreviewView = new HtmlPreviewView({
            editorId: pathname.substring(1)
          });
        } else {
          this.htmlPreviewView = new HtmlPreviewView({
            filePath: pathname
          });
        }
        return htmlPreviewView;
      });
    },
    toggle: function() {
      var editor, previewPane, previousActivePane, uri;
      editor = atom.workspace.getActiveTextEditor();
      if (editor == null) {
        return;
      }
      uri = "html-preview://editor/" + editor.id;
      previewPane = atom.workspace.paneForURI(uri);
      if (previewPane) {
        previewPane.destroyItem(previewPane.itemForURI(uri));
        return;
      }
      previousActivePane = atom.workspace.getActivePane();
      return atom.workspace.open(uri, {
        split: 'right',
        searchAllPanes: true
      }).done(function(htmlPreviewView) {
        if (htmlPreviewView instanceof HtmlPreviewView) {
          htmlPreviewView.renderHTML();
          return previousActivePane.activate();
        }
      });
    },
    deactivate: function() {
      return this.subscriptions.dispose();
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy91Y2hpaGEvLmF0b20vcGFja2FnZXMvYXRvbS1odG1sLXByZXZpZXcvbGliL2F0b20taHRtbC1wcmV2aWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsR0FBQSxHQUF3QixPQUFBLENBQVEsS0FBUjs7RUFDdkIsc0JBQXVCLE9BQUEsQ0FBUSxNQUFSOztFQUV4QixlQUFBLEdBQXdCLE9BQUEsQ0FBUSwwQkFBUjs7RUFFeEIsTUFBTSxDQUFDLE9BQVAsR0FDRTtJQUFBLE1BQUEsRUFDRTtNQUFBLGFBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxTQUFOO1FBQ0EsV0FBQSxFQUFhLDZCQURiO1FBRUEsQ0FBQSxPQUFBLENBQUEsRUFBUyxLQUZUO09BREY7TUFJQSxtQkFBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFNBQU47UUFDQSxXQUFBLEVBQWEseUNBRGI7UUFFQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEtBRlQ7T0FMRjtNQVFBLFdBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxPQUFOO1FBQ0EsS0FBQSxFQUFPLHVCQURQO1FBRUEsV0FBQSxFQUFhLDBCQUZiO1FBR0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxDQUFDLEdBQUQsRUFBTSxHQUFOLENBSFQ7UUFJQSxLQUFBLEVBQ0U7VUFBQSxJQUFBLEVBQU0sUUFBTjtTQUxGO09BVEY7TUFlQSxjQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sU0FBTjtRQUNBLFdBQUEsRUFBYSw4R0FEYjtRQUVBLENBQUEsT0FBQSxDQUFBLEVBQVMsS0FGVDtPQWhCRjtNQW1CQSxhQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sU0FBTjtRQUNBLFdBQUEsRUFBYSxnREFEYjtRQUVBLENBQUEsT0FBQSxDQUFBLEVBQVMsS0FGVDtPQXBCRjtLQURGO0lBeUJBLGVBQUEsRUFBaUIsSUF6QmpCO0lBMkJBLFFBQUEsRUFBVSxTQUFDLEtBQUQ7TUFFUixJQUFDLENBQUEsYUFBRCxHQUFpQixJQUFJO01BRXJCLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFJLENBQUMsU0FBUyxDQUFDLGtCQUFmLENBQWtDLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxNQUFEO2lCQUNuRCxLQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsTUFBTSxDQUFDLFNBQVAsQ0FBaUIsU0FBQTtZQUNsQyxJQUFHLG9FQUFBLElBQXFCLGVBQUEsWUFBMkIsZUFBbkQ7cUJBQ0UsZUFBZSxDQUFDLFVBQWhCLENBQUEsRUFERjs7VUFEa0MsQ0FBakIsQ0FBbkI7UUFEbUQ7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWxDLENBQW5CO01BTUEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQixnQkFBbEIsRUFBb0M7UUFBQSwwQkFBQSxFQUE0QixDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFBO21CQUFHLEtBQUMsQ0FBQSxNQUFELENBQUE7VUFBSDtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBNUI7T0FBcEMsQ0FBbkI7YUFFQSxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQWYsQ0FBeUIsU0FBQyxTQUFEO0FBQ3ZCLFlBQUE7QUFBQTtVQUNFLE1BQTZCLEdBQUcsQ0FBQyxLQUFKLENBQVUsU0FBVixDQUE3QixFQUFDLHVCQUFELEVBQVcsZUFBWCxFQUFpQix3QkFEbkI7U0FBQSxjQUFBO1VBRU07QUFDSixpQkFIRjs7UUFLQSxJQUFjLFFBQUEsS0FBWSxlQUExQjtBQUFBLGlCQUFBOztBQUVBO1VBQ0UsSUFBa0MsUUFBbEM7WUFBQSxRQUFBLEdBQVcsU0FBQSxDQUFVLFFBQVYsRUFBWDtXQURGO1NBQUEsY0FBQTtVQUVNO0FBQ0osaUJBSEY7O1FBS0EsSUFBRyxJQUFBLEtBQVEsUUFBWDtVQUNFLElBQUMsQ0FBQSxlQUFELEdBQXVCLElBQUEsZUFBQSxDQUFnQjtZQUFBLFFBQUEsRUFBVSxRQUFRLENBQUMsU0FBVCxDQUFtQixDQUFuQixDQUFWO1dBQWhCLEVBRHpCO1NBQUEsTUFBQTtVQUdFLElBQUMsQ0FBQSxlQUFELEdBQXVCLElBQUEsZUFBQSxDQUFnQjtZQUFBLFFBQUEsRUFBVSxRQUFWO1dBQWhCLEVBSHpCOztBQUtBLGVBQU87TUFsQmdCLENBQXpCO0lBWlEsQ0EzQlY7SUEyREEsTUFBQSxFQUFRLFNBQUE7QUFDTixVQUFBO01BQUEsTUFBQSxHQUFTLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQWYsQ0FBQTtNQUNULElBQWMsY0FBZDtBQUFBLGVBQUE7O01BRUEsR0FBQSxHQUFNLHdCQUFBLEdBQXlCLE1BQU0sQ0FBQztNQUV0QyxXQUFBLEdBQWMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFmLENBQTBCLEdBQTFCO01BQ2QsSUFBRyxXQUFIO1FBQ0UsV0FBVyxDQUFDLFdBQVosQ0FBd0IsV0FBVyxDQUFDLFVBQVosQ0FBdUIsR0FBdkIsQ0FBeEI7QUFDQSxlQUZGOztNQUlBLGtCQUFBLEdBQXFCLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBZixDQUFBO2FBQ3JCLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBZixDQUFvQixHQUFwQixFQUF5QjtRQUFBLEtBQUEsRUFBTyxPQUFQO1FBQWdCLGNBQUEsRUFBZ0IsSUFBaEM7T0FBekIsQ0FBOEQsQ0FBQyxJQUEvRCxDQUFvRSxTQUFDLGVBQUQ7UUFDbEUsSUFBRyxlQUFBLFlBQTJCLGVBQTlCO1VBQ0UsZUFBZSxDQUFDLFVBQWhCLENBQUE7aUJBQ0Esa0JBQWtCLENBQUMsUUFBbkIsQ0FBQSxFQUZGOztNQURrRSxDQUFwRTtJQVpNLENBM0RSO0lBNEVBLFVBQUEsRUFBWSxTQUFBO2FBQ1YsSUFBQyxDQUFBLGFBQWEsQ0FBQyxPQUFmLENBQUE7SUFEVSxDQTVFWjs7QUFORiIsInNvdXJjZXNDb250ZW50IjpbInVybCAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ3VybCdcbntDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXG5cbkh0bWxQcmV2aWV3VmlldyAgICAgICA9IHJlcXVpcmUgJy4vYXRvbS1odG1sLXByZXZpZXctdmlldydcblxubW9kdWxlLmV4cG9ydHMgPVxuICBjb25maWc6XG4gICAgdHJpZ2dlck9uU2F2ZTpcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVzY3JpcHRpb246ICdXYXRjaCB3aWxsIHRyaWdnZXIgb24gc2F2ZS4nXG4gICAgICBkZWZhdWx0OiBmYWxzZVxuICAgIHByZXNlcnZlV2hpdGVTcGFjZXM6XG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlc2NyaXB0aW9uOiAnUHJlc2VydmUgd2hpdGUgc3BhY2VzIGFuZCBsaW5lIGVuZGluZ3MuJ1xuICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICBmaWxlRW5kaW5nczpcbiAgICAgIHR5cGU6ICdhcnJheSdcbiAgICAgIHRpdGxlOiAnUHJlc2VydmUgZmlsZSBlbmRpbmdzJ1xuICAgICAgZGVzY3JpcHRpb246ICdGaWxlIGVuZGluZ3MgdG8gcHJlc2VydmUnXG4gICAgICBkZWZhdWx0OiBbXCJjXCIsIFwiaFwiXVxuICAgICAgaXRlbXM6XG4gICAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgc2Nyb2xsVG9DdXJzb3I6XG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlc2NyaXB0aW9uOiAnQXR0ZW1wdHMgdG8gc2Nyb2xsIHRoZSB3ZWJ2aWV3IHRvIHRoZSBzZWN0aW9uIG9mIHlvdXIgSFRNTCB5b3UgYXJlIGVkaXRpbmcgYmFzZWQgb24geW91ciBjdXJzb3JcXCdzIHBvc2l0aW9uLidcbiAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgZW5hYmxlTWF0aEpheDpcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVzY3JpcHRpb246ICdFbmFibGUgTWF0aEpheCBpbmxpbmUgcmVuZGVyaW5nIFxcXFxmJCBcXFxccGkgXFxcXGYkJ1xuICAgICAgZGVmYXVsdDogZmFsc2VcblxuICBodG1sUHJldmlld1ZpZXc6IG51bGxcblxuICBhY3RpdmF0ZTogKHN0YXRlKSAtPlxuICAgICMgRXZlbnRzIHN1YnNjcmliZWQgdG8gaW4gYXRvbSdzIHN5c3RlbSBjYW4gYmUgZWFzaWx5IGNsZWFuZWQgdXAgd2l0aCBhIENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgICBAc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS53b3Jrc3BhY2Uub2JzZXJ2ZVRleHRFZGl0b3JzIChlZGl0b3IpID0+XG4gICAgICBAc3Vic2NyaXB0aW9ucy5hZGQgZWRpdG9yLm9uRGlkU2F2ZSA9PlxuICAgICAgICBpZiBodG1sUHJldmlld1ZpZXc/IGFuZCBodG1sUHJldmlld1ZpZXcgaW5zdGFuY2VvZiBIdG1sUHJldmlld1ZpZXdcbiAgICAgICAgICBodG1sUHJldmlld1ZpZXcucmVuZGVySFRNTCgpXG5cbiAgICAjIFJlZ2lzdGVyIGNvbW1hbmQgdGhhdCB0b2dnbGVzIHRoaXMgdmlld1xuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS13b3Jrc3BhY2UnLCAnYXRvbS1odG1sLXByZXZpZXc6dG9nZ2xlJzogPT4gQHRvZ2dsZSgpXG5cbiAgICBhdG9tLndvcmtzcGFjZS5hZGRPcGVuZXIgKHVyaVRvT3BlbikgLT5cbiAgICAgIHRyeVxuICAgICAgICB7cHJvdG9jb2wsIGhvc3QsIHBhdGhuYW1lfSA9IHVybC5wYXJzZSh1cmlUb09wZW4pXG4gICAgICBjYXRjaCBlcnJvclxuICAgICAgICByZXR1cm5cblxuICAgICAgcmV0dXJuIHVubGVzcyBwcm90b2NvbCBpcyAnaHRtbC1wcmV2aWV3OidcblxuICAgICAgdHJ5XG4gICAgICAgIHBhdGhuYW1lID0gZGVjb2RlVVJJKHBhdGhuYW1lKSBpZiBwYXRobmFtZVxuICAgICAgY2F0Y2ggZXJyb3JcbiAgICAgICAgcmV0dXJuXG5cbiAgICAgIGlmIGhvc3QgaXMgJ2VkaXRvcidcbiAgICAgICAgQGh0bWxQcmV2aWV3VmlldyA9IG5ldyBIdG1sUHJldmlld1ZpZXcoZWRpdG9ySWQ6IHBhdGhuYW1lLnN1YnN0cmluZygxKSlcbiAgICAgIGVsc2VcbiAgICAgICAgQGh0bWxQcmV2aWV3VmlldyA9IG5ldyBIdG1sUHJldmlld1ZpZXcoZmlsZVBhdGg6IHBhdGhuYW1lKVxuXG4gICAgICByZXR1cm4gaHRtbFByZXZpZXdWaWV3XG5cbiAgdG9nZ2xlOiAtPlxuICAgIGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgIHJldHVybiB1bmxlc3MgZWRpdG9yP1xuXG4gICAgdXJpID0gXCJodG1sLXByZXZpZXc6Ly9lZGl0b3IvI3tlZGl0b3IuaWR9XCJcblxuICAgIHByZXZpZXdQYW5lID0gYXRvbS53b3Jrc3BhY2UucGFuZUZvclVSSSh1cmkpXG4gICAgaWYgcHJldmlld1BhbmVcbiAgICAgIHByZXZpZXdQYW5lLmRlc3Ryb3lJdGVtKHByZXZpZXdQYW5lLml0ZW1Gb3JVUkkodXJpKSlcbiAgICAgIHJldHVyblxuXG4gICAgcHJldmlvdXNBY3RpdmVQYW5lID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZSgpXG4gICAgYXRvbS53b3Jrc3BhY2Uub3Blbih1cmksIHNwbGl0OiAncmlnaHQnLCBzZWFyY2hBbGxQYW5lczogdHJ1ZSkuZG9uZSAoaHRtbFByZXZpZXdWaWV3KSAtPlxuICAgICAgaWYgaHRtbFByZXZpZXdWaWV3IGluc3RhbmNlb2YgSHRtbFByZXZpZXdWaWV3XG4gICAgICAgIGh0bWxQcmV2aWV3Vmlldy5yZW5kZXJIVE1MKClcbiAgICAgICAgcHJldmlvdXNBY3RpdmVQYW5lLmFjdGl2YXRlKClcblxuICBkZWFjdGl2YXRlOiAtPlxuICAgIEBzdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuIl19
