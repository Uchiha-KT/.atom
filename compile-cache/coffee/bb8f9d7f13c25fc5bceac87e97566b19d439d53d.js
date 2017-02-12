(function() {
  var $, $$$, AtomHtmlPreviewView, CompositeDisposable, Disposable, ScrollView, fs, os, path, ref, ref1, scrollInjectScript,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  fs = require('fs');

  ref = require('atom'), CompositeDisposable = ref.CompositeDisposable, Disposable = ref.Disposable;

  ref1 = require('atom-space-pen-views'), $ = ref1.$, $$$ = ref1.$$$, ScrollView = ref1.ScrollView;

  path = require('path');

  os = require('os');

  scrollInjectScript = "<script>\n(function () {\n  var scriptTag = document.scripts[document.scripts.length - 1];\n  document.addEventListener('DOMContentLoaded',()=>{\n    var elem = document.createElement(\"span\")\n    try {\n      // Scroll to this current script tag\n      elem.style.width = 100\n      // Center the scrollY\n      elem.style.height = \"20vh\"\n      elem.style.marginTop = \"-20vh\"\n      elem.style.marginLeft = -100\n      elem.style.display = \"block\"\n      var par = scriptTag.parentNode\n      par.insertBefore(elem, scriptTag)\n      elem.scrollIntoView()\n    } catch (error) {}\n    try { elem.remove() } catch (error) {}\n    try { scriptTag.remove() } catch (error) {}\n  }, false)\n})();\n</script>";

  module.exports = AtomHtmlPreviewView = (function(superClass) {
    extend(AtomHtmlPreviewView, superClass);

    atom.deserializers.add(AtomHtmlPreviewView);

    AtomHtmlPreviewView.prototype.editorSub = null;

    AtomHtmlPreviewView.prototype.onDidChangeTitle = function() {
      return new Disposable();
    };

    AtomHtmlPreviewView.prototype.onDidChangeModified = function() {
      return new Disposable();
    };

    AtomHtmlPreviewView.deserialize = function(state) {
      return new AtomHtmlPreviewView(state);
    };

    AtomHtmlPreviewView.content = function() {
      return this.div({
        "class": 'atom-html-preview native-key-bindings',
        tabindex: -1
      }, (function(_this) {
        return function() {
          var style;
          style = 'z-index: 2; padding: 2em;';
          _this.div({
            "class": 'show-error',
            style: style
          });
          return _this.div({
            "class": 'show-loading',
            style: style
          }, "Loading HTML");
        };
      })(this));
    };

    function AtomHtmlPreviewView(arg) {
      var filePath, handles;
      this.editorId = arg.editorId, filePath = arg.filePath;
      this.handleEvents = bind(this.handleEvents, this);
      AtomHtmlPreviewView.__super__.constructor.apply(this, arguments);
      if (this.editorId != null) {
        this.resolveEditor(this.editorId);
        this.tmpPath = this.getPath();
      } else {
        if (atom.workspace != null) {
          this.subscribeToFilePath(filePath);
        } else {
          atom.packages.onDidActivatePackage((function(_this) {
            return function() {
              return _this.subscribeToFilePath(filePath);
            };
          })(this));
        }
      }
      handles = $("atom-pane-resize-handle");
      handles.on('mousedown', (function(_this) {
        return function() {
          return _this.onStartedResize();
        };
      })(this));
    }

    AtomHtmlPreviewView.prototype.onStartedResize = function() {
      this.css({
        'pointer-events': 'none'
      });
      return document.addEventListener('mouseup', this.onStoppedResizing.bind(this));
    };

    AtomHtmlPreviewView.prototype.onStoppedResizing = function() {
      this.css({
        'pointer-events': 'all'
      });
      return document.removeEventListener('mouseup', this.onStoppedResizing);
    };

    AtomHtmlPreviewView.prototype.serialize = function() {
      return {
        deserializer: 'AtomHtmlPreviewView',
        filePath: this.getPath(),
        editorId: this.editorId
      };
    };

    AtomHtmlPreviewView.prototype.destroy = function() {
      if (typeof editorSub !== "undefined" && editorSub !== null) {
        return this.editorSub.dispose();
      }
    };

    AtomHtmlPreviewView.prototype.subscribeToFilePath = function(filePath) {
      this.trigger('title-changed');
      this.handleEvents();
      return this.renderHTML();
    };

    AtomHtmlPreviewView.prototype.resolveEditor = function(editorId) {
      var resolve;
      resolve = (function(_this) {
        return function() {
          var ref2, ref3;
          _this.editor = _this.editorForId(editorId);
          if (_this.editor != null) {
            if (_this.editor != null) {
              _this.trigger('title-changed');
            }
            return _this.handleEvents();
          } else {
            return (ref2 = atom.workspace) != null ? (ref3 = ref2.paneForItem(_this)) != null ? ref3.destroyItem(_this) : void 0 : void 0;
          }
        };
      })(this);
      if (atom.workspace != null) {
        return resolve();
      } else {
        return atom.packages.onDidActivatePackage((function(_this) {
          return function() {
            resolve();
            return _this.renderHTML();
          };
        })(this));
      }
    };

    AtomHtmlPreviewView.prototype.editorForId = function(editorId) {
      var editor, i, len, ref2, ref3;
      ref2 = atom.workspace.getTextEditors();
      for (i = 0, len = ref2.length; i < len; i++) {
        editor = ref2[i];
        if (((ref3 = editor.id) != null ? ref3.toString() : void 0) === editorId.toString()) {
          return editor;
        }
      }
      return null;
    };

    AtomHtmlPreviewView.prototype.handleEvents = function() {
      var changeHandler, contextMenuClientX, contextMenuClientY;
      contextMenuClientX = 0;
      contextMenuClientY = 0;
      this.on('contextmenu', function(event) {
        contextMenuClientY = event.clientY;
        return contextMenuClientX = event.clientX;
      });
      atom.commands.add(this.element, {
        'atom-html-preview:open-devtools': (function(_this) {
          return function() {
            return _this.webview.openDevTools();
          };
        })(this),
        'atom-html-preview:inspect': (function(_this) {
          return function() {
            return _this.webview.inspectElement(contextMenuClientX, contextMenuClientY);
          };
        })(this),
        'atom-html-preview:print': (function(_this) {
          return function() {
            return _this.webview.print();
          };
        })(this)
      });
      changeHandler = (function(_this) {
        return function() {
          var pane;
          _this.renderHTML();
          pane = atom.workspace.paneForURI(_this.getURI());
          if ((pane != null) && pane !== atom.workspace.getActivePane()) {
            return pane.activateItem(_this);
          }
        };
      })(this);
      this.editorSub = new CompositeDisposable;
      if (this.editor != null) {
        if (atom.config.get("atom-html-preview.triggerOnSave")) {
          this.editorSub.add(this.editor.onDidSave(changeHandler));
        } else {
          this.editorSub.add(this.editor.onDidStopChanging(changeHandler));
        }
        return this.editorSub.add(this.editor.onDidChangePath((function(_this) {
          return function() {
            return _this.trigger('title-changed');
          };
        })(this)));
      }
    };

    AtomHtmlPreviewView.prototype.renderHTML = function() {
      this.showLoading();
      if (this.editor != null) {
        if (!atom.config.get("atom-html-preview.triggerOnSave") && (this.editor.getPath() != null)) {
          return this.save(this.renderHTMLCode);
        } else {
          return this.renderHTMLCode();
        }
      }
    };

    AtomHtmlPreviewView.prototype.save = function(callback) {
      var column, editorText, error, fileEnding, findTagBefore, firstSelection, lastTagRE, offset, out, outPath, ref2, row, tagIndex, tagRE;
      outPath = path.resolve(path.join(os.tmpdir(), this.editor.getTitle() + ".html"));
      out = "";
      fileEnding = this.editor.getTitle().split(".").pop();
      if (atom.config.get("atom-html-preview.enableMathJax")) {
        out += "<script type=\"text/x-mathjax-config\">\nMathJax.Hub.Config({\ntex2jax: {inlineMath: [['\\\\f$','\\\\f$']]},\nmenuSettings: {zoom: 'Click'}\n});\n</script>\n<script type=\"text/javascript\"\nsrc=\"http://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML\">\n</script>";
      }
      if (atom.config.get("atom-html-preview.preserveWhiteSpaces") && indexOf.call(atom.config.get("atom-html-preview.fileEndings"), fileEnding) >= 0) {
        out += "<style type=\"text/css\">\nbody { white-space: pre; }\n</style>";
      } else {
        out += "<base href=\"" + this.getPath() + "\">";
      }
      editorText = this.editor.getText();
      firstSelection = this.editor.getSelections()[0];
      ref2 = firstSelection.getBufferRange().start, row = ref2.row, column = ref2.column;
      if (atom.config.get("atom-html-preview.scrollToCursor")) {
        try {
          offset = this._getOffset(editorText, row, column);
          tagRE = /<((\/[\$\w\-])|br|input|link)\/?>/.source;
          lastTagRE = RegExp(tagRE + "(?![\\s\\S]*" + tagRE + ")", "i");
          findTagBefore = function(beforeIndex) {
            var matchedClosingTag;
            matchedClosingTag = editorText.slice(0, beforeIndex).match(lastTagRE);
            if (matchedClosingTag) {
              return matchedClosingTag.index + matchedClosingTag[0].length;
            } else {
              return -1;
            }
          };
          tagIndex = findTagBefore(offset);
          if (tagIndex > -1) {
            editorText = (editorText.slice(0, tagIndex)) + "\n" + scrollInjectScript + "\n" + (editorText.slice(tagIndex));
          }
        } catch (error1) {
          error = error1;
          return -1;
        }
      }
      out += editorText;
      this.tmpPath = outPath;
      return fs.writeFile(outPath, out, (function(_this) {
        return function() {
          try {
            return _this.renderHTMLCode();
          } catch (error1) {
            error = error1;
            return _this.showError(error);
          }
        };
      })(this));
    };

    AtomHtmlPreviewView.prototype.renderHTMLCode = function() {
      var error, webview;
      if (this.webview == null) {
        webview = document.createElement("webview");
        webview.setAttribute("sandbox", "allow-scripts allow-same-origin");
        webview.setAttribute("style", "height: 100%");
        this.webview = webview;
        this.append($(webview));
      }
      this.webview.src = this.tmpPath;
      try {
        this.find('.show-error').hide();
        this.find('.show-loading').hide();
        this.webview.reload();
      } catch (error1) {
        error = error1;
        null;
      }
      return atom.commands.dispatch('atom-html-preview', 'html-changed');
    };

    AtomHtmlPreviewView.prototype._getOffset = function(text, row, column) {
      var line_re, match, match_index, offset;
      if (column == null) {
        column = 0;
      }
      line_re = /\n/g;
      match_index = null;
      while (row--) {
        if (match = line_re.exec(text)) {
          match_index = match.index;
        } else {
          return -1;
        }
      }
      offset = match_index + column;
      if (offset < text.length) {
        return offset;
      } else {
        return -1;
      }
    };

    AtomHtmlPreviewView.prototype.getTitle = function() {
      if (this.editor != null) {
        return (this.editor.getTitle()) + " Preview";
      } else {
        return "HTML Preview";
      }
    };

    AtomHtmlPreviewView.prototype.getURI = function() {
      return "html-preview://editor/" + this.editorId;
    };

    AtomHtmlPreviewView.prototype.getPath = function() {
      if (this.editor != null) {
        return this.editor.getPath();
      }
    };

    AtomHtmlPreviewView.prototype.showError = function(result) {
      var failureMessage;
      failureMessage = result != null ? result.message : void 0;
      return this.find('.show-error').html($$$(function() {
        this.h2('Previewing HTML Failed');
        if (failureMessage != null) {
          return this.h3(failureMessage);
        }
      })).show();
    };

    AtomHtmlPreviewView.prototype.showLoading = function() {
      return this.find('.show-loading').show();
    };

    return AtomHtmlPreviewView;

  })(ScrollView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy91Y2hpaGEvLmF0b20vcGFja2FnZXMvYXRvbS1odG1sLXByZXZpZXcvbGliL2F0b20taHRtbC1wcmV2aWV3LXZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSxxSEFBQTtJQUFBOzs7OztFQUFBLEVBQUEsR0FBd0IsT0FBQSxDQUFRLElBQVI7O0VBQ3hCLE1BQW9DLE9BQUEsQ0FBUSxNQUFSLENBQXBDLEVBQUMsNkNBQUQsRUFBc0I7O0VBQ3RCLE9BQXdCLE9BQUEsQ0FBUSxzQkFBUixDQUF4QixFQUFDLFVBQUQsRUFBSSxjQUFKLEVBQVM7O0VBQ1QsSUFBQSxHQUF3QixPQUFBLENBQVEsTUFBUjs7RUFDeEIsRUFBQSxHQUF3QixPQUFBLENBQVEsSUFBUjs7RUFFeEIsa0JBQUEsR0FBcUI7O0VBeUJyQixNQUFNLENBQUMsT0FBUCxHQUNNOzs7SUFDSixJQUFJLENBQUMsYUFBYSxDQUFDLEdBQW5CLENBQXVCLG1CQUF2Qjs7a0NBRUEsU0FBQSxHQUFzQjs7a0NBQ3RCLGdCQUFBLEdBQXNCLFNBQUE7YUFBTyxJQUFBLFVBQUEsQ0FBQTtJQUFQOztrQ0FDdEIsbUJBQUEsR0FBc0IsU0FBQTthQUFPLElBQUEsVUFBQSxDQUFBO0lBQVA7O0lBRXRCLG1CQUFDLENBQUEsV0FBRCxHQUFjLFNBQUMsS0FBRDthQUNSLElBQUEsbUJBQUEsQ0FBb0IsS0FBcEI7SUFEUTs7SUFHZCxtQkFBQyxDQUFBLE9BQUQsR0FBVSxTQUFBO2FBQ1IsSUFBQyxDQUFBLEdBQUQsQ0FBSztRQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sdUNBQVA7UUFBZ0QsUUFBQSxFQUFVLENBQUMsQ0FBM0Q7T0FBTCxFQUFtRSxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7QUFDakUsY0FBQTtVQUFBLEtBQUEsR0FBUTtVQUNSLEtBQUMsQ0FBQSxHQUFELENBQUs7WUFBQSxDQUFBLEtB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LE1BQU0sQ0FBQyxRQUFSLENBQUEsQ0FBRCxDQUFBLEdBQW9CLFdBRHhCO09BQUEsTUFBQTtlQUdFLGVBSEY7O0lBRFE7O2tDQU1WLE1BQUEsR0FBUSxTQUFBO2FBQ04sd0JBQUEsR0FBeUIsSUFBQyxDQUFBO0lBRHBCOztrQ0FHUixPQUFBLEdBQVMsU0FBQTtNQUNQLElBQUcsbUJBQUg7ZUFDRSxJQUFDLENBQUEsTUFBTSxDQUFDLE9BQVIsQ0FBQSxFQURGOztJQURPOztrQ0FJVCxTQUFBLEdBQVcsU0FBQyxNQUFEO0FBQ1QsVUFBQTtNQUFBLGNBQUEsb0JBQWlCLE1BQU0sQ0FBRTthQUV6QixJQUFDLENBQUEsSUFBRCxDQUFNLGFBQU4sQ0FDQSxDQUFDLElBREQsQ0FDTSxHQUFBLENBQUksU0FBQTtRQUNSLElBQUMsQ0FBQSxFQUFELENBQUksd0JBQUo7UUFDQSxJQUFzQixzQkFBdEI7aUJBQUEsSUFBQyxDQUFBLEVBQUQsQ0FBSSxjQUFKLEVBQUE7O01BRlEsQ0FBSixDQUROLENBSUEsQ0FBQyxJQUpELENBQUE7SUFIUzs7a0NBU1gsV0FBQSxHQUFhLFNBQUE7YUFDWCxJQUFDLENBQUEsSUFBRCxDQUFNLGVBQU4sQ0FBc0IsQ0FBQyxJQUF2QixDQUFBO0lBRFc7Ozs7S0F6UG1CO0FBaENsQyIsInNvdXJjZXNDb250ZW50IjpbImZzICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ2ZzJ1xue0NvbXBvc2l0ZURpc3Bvc2FibGUsIERpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbSdcbnskLCAkJCQsIFNjcm9sbFZpZXd9ICA9IHJlcXVpcmUgJ2F0b20tc3BhY2UtcGVuLXZpZXdzJ1xucGF0aCAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAncGF0aCdcbm9zICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ29zJ1xuXG5zY3JvbGxJbmplY3RTY3JpcHQgPSBcIlwiXCJcbjxzY3JpcHQ+XG4oZnVuY3Rpb24gKCkge1xuICB2YXIgc2NyaXB0VGFnID0gZG9jdW1lbnQuc2NyaXB0c1tkb2N1bWVudC5zY3JpcHRzLmxlbmd0aCAtIDFdO1xuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywoKT0+e1xuICAgIHZhciBlbGVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNwYW5cIilcbiAgICB0cnkge1xuICAgICAgLy8gU2Nyb2xsIHRvIHRoaXMgY3VycmVudCBzY3JpcHQgdGFnXG4gICAgICBlbGVtLnN0eWxlLndpZHRoID0gMTAwXG4gICAgICAvLyBDZW50ZXIgdGhlIHNjcm9sbFlcbiAgICAgIGVsZW0uc3R5bGUuaGVpZ2h0ID0gXCIyMHZoXCJcbiAgICAgIGVsZW0uc3R5bGUubWFyZ2luVG9wID0gXCItMjB2aFwiXG4gICAgICBlbGVtLnN0eWxlLm1hcmdpbkxlZnQgPSAtMTAwXG4gICAgICBlbGVtLnN0eWxlLmRpc3BsYXkgPSBcImJsb2NrXCJcbiAgICAgIHZhciBwYXIgPSBzY3JpcHRUYWcucGFyZW50Tm9kZVxuICAgICAgcGFyLmluc2VydEJlZm9yZShlbGVtLCBzY3JpcHRUYWcpXG4gICAgICBlbGVtLnNjcm9sbEludG9WaWV3KClcbiAgICB9IGNhdGNoIChlcnJvcikge31cbiAgICB0cnkgeyBlbGVtLnJlbW92ZSgpIH0gY2F0Y2ggKGVycm9yKSB7fVxuICAgIHRyeSB7IHNjcmlwdFRhZy5yZW1vdmUoKSB9IGNhdGNoIChlcnJvcikge31cbiAgfSwgZmFsc2UpXG59KSgpO1xuPC9zY3JpcHQ+XG5cIlwiXCJcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgQXRvbUh0bWxQcmV2aWV3VmlldyBleHRlbmRzIFNjcm9sbFZpZXdcbiAgYXRvbS5kZXNlcmlhbGl6ZXJzLmFkZCh0aGlzKVxuXG4gIGVkaXRvclN1YiAgICAgICAgICAgOiBudWxsXG4gIG9uRGlkQ2hhbmdlVGl0bGUgICAgOiAtPiBuZXcgRGlzcG9zYWJsZSgpXG4gIG9uRGlkQ2hhbmdlTW9kaWZpZWQgOiAtPiBuZXcgRGlzcG9zYWJsZSgpXG5cbiAgQGRlc2VyaWFsaXplOiAoc3RhdGUpIC0+XG4gICAgbmV3IEF0b21IdG1sUHJldmlld1ZpZXcoc3RhdGUpXG5cbiAgQGNvbnRlbnQ6IC0+XG4gICAgQGRpdiBjbGFzczogJ2F0b20taHRtbC1wcmV2aWV3IG5hdGl2ZS1rZXktYmluZGluZ3MnLCB0YWJpbmRleDogLTEsID0+XG4gICAgICBzdHlsZSA9ICd6LWluZGV4OiAyOyBwYWRkaW5nOiAyZW07J1xuICAgICAgQGRpdiBjbGFzczogJ3Nob3ctZXJyb3InLCBzdHlsZTogc3R5bGVcbiAgICAgIEBkaXYgY2xhc3M6ICdzaG93LWxvYWRpbmcnLCBzdHlsZTogc3R5bGUsIFwiTG9hZGluZyBIVE1MXCJcblxuICBjb25zdHJ1Y3RvcjogKHtAZWRpdG9ySWQsIGZpbGVQYXRofSkgLT5cbiAgICBzdXBlclxuXG4gICAgaWYgQGVkaXRvcklkP1xuICAgICAgQHJlc29sdmVFZGl0b3IoQGVkaXRvcklkKVxuICAgICAgQHRtcFBhdGggPSBAZ2V0UGF0aCgpICMgYWZ0ZXIgcmVzb2x2ZUVkaXRvclxuICAgIGVsc2VcbiAgICAgIGlmIGF0b20ud29ya3NwYWNlP1xuICAgICAgICBAc3Vic2NyaWJlVG9GaWxlUGF0aChmaWxlUGF0aClcbiAgICAgIGVsc2VcbiAgICAgICAgIyBAc3Vic2NyaWJlIGF0b20ucGFja2FnZXMub25jZSAnYWN0aXZhdGVkJywgPT5cbiAgICAgICAgYXRvbS5wYWNrYWdlcy5vbkRpZEFjdGl2YXRlUGFja2FnZSA9PlxuICAgICAgICAgIEBzdWJzY3JpYmVUb0ZpbGVQYXRoKGZpbGVQYXRoKVxuXG4gICAgIyBEaXNhYmxlIHBvaW50ZXItZXZlbnRzIHdoaWxlIHJlc2l6aW5nXG4gICAgaGFuZGxlcyA9ICQoXCJhdG9tLXBhbmUtcmVzaXplLWhhbmRsZVwiKVxuICAgIGhhbmRsZXMub24gJ21vdXNlZG93bicsID0+IEBvblN0YXJ0ZWRSZXNpemUoKVxuXG4gIG9uU3RhcnRlZFJlc2l6ZTogLT5cbiAgICBAY3NzICdwb2ludGVyLWV2ZW50cyc6ICdub25lJ1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIgJ21vdXNldXAnLCBAb25TdG9wcGVkUmVzaXppbmcuYmluZCB0aGlzXG5cbiAgb25TdG9wcGVkUmVzaXppbmc6IC0+XG4gICAgQGNzcyAncG9pbnRlci1ldmVudHMnOiAnYWxsJ1xuICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIgJ21vdXNldXAnLCBAb25TdG9wcGVkUmVzaXppbmdcblxuICBzZXJpYWxpemU6IC0+XG4gICAgZGVzZXJpYWxpemVyIDogJ0F0b21IdG1sUHJldmlld1ZpZXcnXG4gICAgZmlsZVBhdGggICAgIDogQGdldFBhdGgoKVxuICAgIGVkaXRvcklkICAgICA6IEBlZGl0b3JJZFxuXG4gIGRlc3Ryb3k6IC0+XG4gICAgIyBAdW5zdWJzY3JpYmUoKVxuICAgIGlmIGVkaXRvclN1Yj9cbiAgICAgIEBlZGl0b3JTdWIuZGlzcG9zZSgpXG5cbiAgc3Vic2NyaWJlVG9GaWxlUGF0aDogKGZpbGVQYXRoKSAtPlxuICAgIEB0cmlnZ2VyICd0aXRsZS1jaGFuZ2VkJ1xuICAgIEBoYW5kbGVFdmVudHMoKVxuICAgIEByZW5kZXJIVE1MKClcblxuICByZXNvbHZlRWRpdG9yOiAoZWRpdG9ySWQpIC0+XG4gICAgcmVzb2x2ZSA9ID0+XG4gICAgICBAZWRpdG9yID0gQGVkaXRvckZvcklkKGVkaXRvcklkKVxuXG4gICAgICBpZiBAZWRpdG9yP1xuICAgICAgICBAdHJpZ2dlciAndGl0bGUtY2hhbmdlZCcgaWYgQGVkaXRvcj9cbiAgICAgICAgQGhhbmRsZUV2ZW50cygpXG4gICAgICBlbHNlXG4gICAgICAgICMgVGhlIGVkaXRvciB0aGlzIHByZXZpZXcgd2FzIGNyZWF0ZWQgZm9yIGhhcyBiZWVuIGNsb3NlZCBzbyBjbG9zZVxuICAgICAgICAjIHRoaXMgcHJldmlldyBzaW5jZSBhIHByZXZpZXcgY2Fubm90IGJlIHJlbmRlcmVkIHdpdGhvdXQgYW4gZWRpdG9yXG4gICAgICAgIGF0b20ud29ya3NwYWNlPy5wYW5lRm9ySXRlbSh0aGlzKT8uZGVzdHJveUl0ZW0odGhpcylcblxuICAgIGlmIGF0b20ud29ya3NwYWNlP1xuICAgICAgcmVzb2x2ZSgpXG4gICAgZWxzZVxuICAgICAgIyBAc3Vic2NyaWJlIGF0b20ucGFja2FnZXMub25jZSAnYWN0aXZhdGVkJywgPT5cbiAgICAgIGF0b20ucGFja2FnZXMub25EaWRBY3RpdmF0ZVBhY2thZ2UgPT5cbiAgICAgICAgcmVzb2x2ZSgpXG4gICAgICAgIEByZW5kZXJIVE1MKClcblxuICBlZGl0b3JGb3JJZDogKGVkaXRvcklkKSAtPlxuICAgIGZvciBlZGl0b3IgaW4gYXRvbS53b3Jrc3BhY2UuZ2V0VGV4dEVkaXRvcnMoKVxuICAgICAgcmV0dXJuIGVkaXRvciBpZiBlZGl0b3IuaWQ/LnRvU3RyaW5nKCkgaXMgZWRpdG9ySWQudG9TdHJpbmcoKVxuICAgIG51bGxcblxuICBoYW5kbGVFdmVudHM6ID0+XG4gICAgY29udGV4dE1lbnVDbGllbnRYID0gMFxuICAgIGNvbnRleHRNZW51Q2xpZW50WSA9IDBcblxuICAgIEBvbiAnY29udGV4dG1lbnUnLCAoZXZlbnQpIC0+XG4gICAgICBjb250ZXh0TWVudUNsaWVudFkgPSBldmVudC5jbGllbnRZXG4gICAgICBjb250ZXh0TWVudUNsaWVudFggPSBldmVudC5jbGllbnRYXG5cbiAgICBhdG9tLmNvbW1hbmRzLmFkZCBAZWxlbWVudCxcbiAgICAgICdhdG9tLWh0bWwtcHJldmlldzpvcGVuLWRldnRvb2xzJzogPT5cbiAgICAgICAgQHdlYnZpZXcub3BlbkRldlRvb2xzKClcbiAgICAgICdhdG9tLWh0bWwtcHJldmlldzppbnNwZWN0JzogPT5cbiAgICAgICAgQHdlYnZpZXcuaW5zcGVjdEVsZW1lbnQoY29udGV4dE1lbnVDbGllbnRYLCBjb250ZXh0TWVudUNsaWVudFkpXG4gICAgICAnYXRvbS1odG1sLXByZXZpZXc6cHJpbnQnOiA9PlxuICAgICAgICBAd2Vidmlldy5wcmludCgpXG5cblxuICAgIGNoYW5nZUhhbmRsZXIgPSA9PlxuICAgICAgQHJlbmRlckhUTUwoKVxuICAgICAgcGFuZSA9IGF0b20ud29ya3NwYWNlLnBhbmVGb3JVUkkoQGdldFVSSSgpKVxuICAgICAgaWYgcGFuZT8gYW5kIHBhbmUgaXNudCBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lKClcbiAgICAgICAgcGFuZS5hY3RpdmF0ZUl0ZW0odGhpcylcblxuICAgIEBlZGl0b3JTdWIgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuXG4gICAgaWYgQGVkaXRvcj9cbiAgICAgIGlmIGF0b20uY29uZmlnLmdldChcImF0b20taHRtbC1wcmV2aWV3LnRyaWdnZXJPblNhdmVcIilcbiAgICAgICAgQGVkaXRvclN1Yi5hZGQgQGVkaXRvci5vbkRpZFNhdmUgY2hhbmdlSGFuZGxlclxuICAgICAgZWxzZVxuICAgICAgICBAZWRpdG9yU3ViLmFkZCBAZWRpdG9yLm9uRGlkU3RvcENoYW5naW5nIGNoYW5nZUhhbmRsZXJcbiAgICAgIEBlZGl0b3JTdWIuYWRkIEBlZGl0b3Iub25EaWRDaGFuZ2VQYXRoID0+IEB0cmlnZ2VyICd0aXRsZS1jaGFuZ2VkJ1xuXG4gIHJlbmRlckhUTUw6IC0+XG4gICAgQHNob3dMb2FkaW5nKClcbiAgICBpZiBAZWRpdG9yP1xuICAgICAgaWYgbm90IGF0b20uY29uZmlnLmdldChcImF0b20taHRtbC1wcmV2aWV3LnRyaWdnZXJPblNhdmVcIikgJiYgQGVkaXRvci5nZXRQYXRoKCk/XG4gICAgICAgIEBzYXZlKEByZW5kZXJIVE1MQ29kZSlcbiAgICAgIGVsc2VcbiAgICAgICAgQHJlbmRlckhUTUxDb2RlKClcblxuICBzYXZlOiAoY2FsbGJhY2spIC0+XG4gICAgIyBUZW1wIGZpbGUgcGF0aFxuICAgIG91dFBhdGggPSBwYXRoLnJlc29sdmUgcGF0aC5qb2luKG9zLnRtcGRpcigpLCBAZWRpdG9yLmdldFRpdGxlKCkgKyBcIi5odG1sXCIpXG4gICAgb3V0ID0gXCJcIlxuICAgIGZpbGVFbmRpbmcgPSBAZWRpdG9yLmdldFRpdGxlKCkuc3BsaXQoXCIuXCIpLnBvcCgpXG5cbiAgICBpZiBhdG9tLmNvbmZpZy5nZXQoXCJhdG9tLWh0bWwtcHJldmlldy5lbmFibGVNYXRoSmF4XCIpXG4gICAgICBvdXQgKz0gXCJcIlwiXG4gICAgICA8c2NyaXB0IHR5cGU9XCJ0ZXh0L3gtbWF0aGpheC1jb25maWdcIj5cbiAgICAgIE1hdGhKYXguSHViLkNvbmZpZyh7XG4gICAgICB0ZXgyamF4OiB7aW5saW5lTWF0aDogW1snXFxcXFxcXFxmJCcsJ1xcXFxcXFxcZiQnXV19LFxuICAgICAgbWVudVNldHRpbmdzOiB7em9vbTogJ0NsaWNrJ31cbiAgICAgIH0pO1xuICAgICAgPC9zY3JpcHQ+XG4gICAgICA8c2NyaXB0IHR5cGU9XCJ0ZXh0L2phdmFzY3JpcHRcIlxuICAgICAgc3JjPVwiaHR0cDovL2Nkbi5tYXRoamF4Lm9yZy9tYXRoamF4L2xhdGVzdC9NYXRoSmF4LmpzP2NvbmZpZz1UZVgtQU1TLU1NTF9IVE1Mb3JNTUxcIj5cbiAgICAgIDwvc2NyaXB0PlxuICAgICAgXCJcIlwiXG5cbiAgICBpZiBhdG9tLmNvbmZpZy5nZXQoXCJhdG9tLWh0bWwtcHJldmlldy5wcmVzZXJ2ZVdoaXRlU3BhY2VzXCIpIGFuZCBmaWxlRW5kaW5nIGluIGF0b20uY29uZmlnLmdldChcImF0b20taHRtbC1wcmV2aWV3LmZpbGVFbmRpbmdzXCIpXG4gICAgICAjIEVuY2xvc2UgaW4gPHByZT4gc3RhdGVtZW50IHRvIHByZXNlcnZlIHdoaXRlc3BhY2VzXG4gICAgICBvdXQgKz0gXCJcIlwiXG4gICAgICA8c3R5bGUgdHlwZT1cInRleHQvY3NzXCI+XG4gICAgICBib2R5IHsgd2hpdGUtc3BhY2U6IHByZTsgfVxuICAgICAgPC9zdHlsZT5cbiAgICAgIFwiXCJcIlxuICAgIGVsc2VcbiAgICAgICMgQWRkIGJhc2UgdGFnOyBhbGxvdyByZWxhdGl2ZSBsaW5rcyB0byB3b3JrIGRlc3BpdGUgYmVpbmcgbG9hZGVkXG4gICAgICAjIGFzIHRoZSBzcmMgb2YgYW4gd2Vidmlld1xuICAgICAgb3V0ICs9IFwiPGJhc2UgaHJlZj1cXFwiXCIgKyBAZ2V0UGF0aCgpICsgXCJcXFwiPlwiXG5cbiAgICAjIFNjcm9sbCBpbnRvIHZpZXdcbiAgICBlZGl0b3JUZXh0ID0gQGVkaXRvci5nZXRUZXh0KClcbiAgICBmaXJzdFNlbGVjdGlvbiA9IHRoaXMuZWRpdG9yLmdldFNlbGVjdGlvbnMoKVswXVxuICAgIHsgcm93LCBjb2x1bW4gfSA9IGZpcnN0U2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKCkuc3RhcnRcblxuICAgIGlmIGF0b20uY29uZmlnLmdldChcImF0b20taHRtbC1wcmV2aWV3LnNjcm9sbFRvQ3Vyc29yXCIpXG4gICAgICB0cnlcbiAgICAgICAgb2Zmc2V0ID0gQF9nZXRPZmZzZXQoZWRpdG9yVGV4dCwgcm93LCBjb2x1bW4pXG5cbiAgICAgICAgdGFnUkUgPSAvPCgoXFwvW1xcJFxcd1xcLV0pfGJyfGlucHV0fGxpbmspXFwvPz4vLnNvdXJjZVxuICAgICAgICBsYXN0VGFnUkU9IC8vLyN7dGFnUkV9KD8hW1xcc1xcU10qI3t0YWdSRX0pLy8vaVxuICAgICAgICBmaW5kVGFnQmVmb3JlID0gKGJlZm9yZUluZGV4KSAtPlxuICAgICAgICAgICNzYW1wbGUgPSBlZGl0b3JUZXh0LnNsaWNlKHN0YXJ0SW5kZXgsIHN0YXJ0SW5kZXggKyAzMDApXG4gICAgICAgICAgbWF0Y2hlZENsb3NpbmdUYWcgPSBlZGl0b3JUZXh0LnNsaWNlKDAsIGJlZm9yZUluZGV4KS5tYXRjaChsYXN0VGFnUkUpXG4gICAgICAgICAgaWYgbWF0Y2hlZENsb3NpbmdUYWdcbiAgICAgICAgICAgIHJldHVybiBtYXRjaGVkQ2xvc2luZ1RhZy5pbmRleCArIG1hdGNoZWRDbG9zaW5nVGFnWzBdLmxlbmd0aFxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJldHVybiAtMVxuXG4gICAgICAgIHRhZ0luZGV4ID0gZmluZFRhZ0JlZm9yZShvZmZzZXQpXG4gICAgICAgIGlmIHRhZ0luZGV4ID4gLTFcbiAgICAgICAgICBlZGl0b3JUZXh0ID0gXCJcIlwiXG4gICAgICAgICAgI3tlZGl0b3JUZXh0LnNsaWNlKDAsIHRhZ0luZGV4KX1cbiAgICAgICAgICAje3Njcm9sbEluamVjdFNjcmlwdH1cbiAgICAgICAgICAje2VkaXRvclRleHQuc2xpY2UodGFnSW5kZXgpfVxuICAgICAgICAgIFwiXCJcIlxuXG4gICAgICBjYXRjaCBlcnJvclxuICAgICAgICByZXR1cm4gLTFcblxuICAgIG91dCArPSBlZGl0b3JUZXh0XG5cbiAgICBAdG1wUGF0aCA9IG91dFBhdGhcbiAgICBmcy53cml0ZUZpbGUgb3V0UGF0aCwgb3V0LCA9PlxuICAgICAgdHJ5XG4gICAgICAgIEByZW5kZXJIVE1MQ29kZSgpXG4gICAgICBjYXRjaCBlcnJvclxuICAgICAgICBAc2hvd0Vycm9yIGVycm9yXG5cbiAgcmVuZGVySFRNTENvZGU6ICgpIC0+XG4gICAgdW5sZXNzIEB3ZWJ2aWV3P1xuICAgICAgd2VidmlldyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJ3ZWJ2aWV3XCIpXG4gICAgICAjIEZpeCBmcm9tIEBrd2FhayAoaHR0cHM6Ly9naXRodWIuY29tL3dlYkJveGlvL2F0b20taHRtbC1wcmV2aWV3L2lzc3Vlcy8xLyNpc3N1ZWNvbW1lbnQtNDk2MzkxNjIpXG4gICAgICAjIEFsbG93cyBmb3IgdGhlIHVzZSBvZiByZWxhdGl2ZSByZXNvdXJjZXMgKHNjcmlwdHMsIHN0eWxlcylcbiAgICAgIHdlYnZpZXcuc2V0QXR0cmlidXRlKFwic2FuZGJveFwiLCBcImFsbG93LXNjcmlwdHMgYWxsb3ctc2FtZS1vcmlnaW5cIilcbiAgICAgIHdlYnZpZXcuc2V0QXR0cmlidXRlKFwic3R5bGVcIiwgXCJoZWlnaHQ6IDEwMCVcIilcbiAgICAgIEB3ZWJ2aWV3ID0gd2Vidmlld1xuICAgICAgQGFwcGVuZCAkIHdlYnZpZXdcblxuICAgIEB3ZWJ2aWV3LnNyYyA9IEB0bXBQYXRoXG4gICAgdHJ5XG4gICAgICBAZmluZCgnLnNob3ctZXJyb3InKS5oaWRlKClcbiAgICAgIEBmaW5kKCcuc2hvdy1sb2FkaW5nJykuaGlkZSgpXG4gICAgICBAd2Vidmlldy5yZWxvYWQoKVxuXG4gICAgY2F0Y2ggZXJyb3JcbiAgICAgIG51bGxcblxuICAgICMgQHRyaWdnZXIoJ2F0b20taHRtbC1wcmV2aWV3Omh0bWwtY2hhbmdlZCcpXG4gICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaCAnYXRvbS1odG1sLXByZXZpZXcnLCAnaHRtbC1jaGFuZ2VkJ1xuXG4gICMgR2V0IHRoZSBvZmZzZXQgb2YgYSBmaWxlIGF0IGEgc3BlY2lmaWMgUG9pbnQgaW4gdGhlIGZpbGVcbiAgX2dldE9mZnNldDogKHRleHQsIHJvdywgY29sdW1uPTApIC0+XG4gICAgbGluZV9yZSA9IC9cXG4vZ1xuICAgIG1hdGNoX2luZGV4ID0gbnVsbFxuICAgIHdoaWxlIHJvdy0tXG4gICAgICBpZiBtYXRjaCA9IGxpbmVfcmUuZXhlYyh0ZXh0KVxuICAgICAgICBtYXRjaF9pbmRleCA9IG1hdGNoLmluZGV4XG4gICAgICBlbHNlXG4gICAgICAgIHJldHVybiAtMVxuICAgIG9mZnNldCA9IG1hdGNoX2luZGV4ICsgY29sdW1uXG4gICAgcmV0dXJuIGlmIG9mZnNldCA8IHRleHQubGVuZ3RoIHRoZW4gb2Zmc2V0IGVsc2UgLTFcblxuXG4gIGdldFRpdGxlOiAtPlxuICAgIGlmIEBlZGl0b3I/XG4gICAgICBcIiN7QGVkaXRvci5nZXRUaXRsZSgpfSBQcmV2aWV3XCJcbiAgICBlbHNlXG4gICAgICBcIkhUTUwgUHJldmlld1wiXG5cbiAgZ2V0VVJJOiAtPlxuICAgIFwiaHRtbC1wcmV2aWV3Oi8vZWRpdG9yLyN7QGVkaXRvcklkfVwiXG5cbiAgZ2V0UGF0aDogLT5cbiAgICBpZiBAZWRpdG9yP1xuICAgICAgQGVkaXRvci5nZXRQYXRoKClcblxuICBzaG93RXJyb3I6IChyZXN1bHQpIC0+XG4gICAgZmFpbHVyZU1lc3NhZ2UgPSByZXN1bHQ/Lm1lc3NhZ2VcblxuICAgIEBmaW5kKCcuc2hvdy1lcnJvcicpXG4gICAgLmh0bWwgJCQkIC0+XG4gICAgICBAaDIgJ1ByZXZpZXdpbmcgSFRNTCBGYWlsZWQnXG4gICAgICBAaDMgZmFpbHVyZU1lc3NhZ2UgaWYgZmFpbHVyZU1lc3NhZ2U/XG4gICAgLnNob3coKVxuXG4gIHNob3dMb2FkaW5nOiAtPlxuICAgIEBmaW5kKCcuc2hvdy1sb2FkaW5nJykuc2hvdygpXG4iXX0=
