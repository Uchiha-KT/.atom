'use babel';

var __hasProp = ({}).hasOwnProperty,
    __extends = function __extends(child, parent) {
  for (var key in parent) {
    if (__hasProp.call(parent, key)) child[key] = parent[key];
  }function ctor() {
    this.constructor = child;
  }ctor.prototype = parent.prototype;child.prototype = new ctor();child.__super__ = parent.prototype;return child;
},
    $ = require('atom-space-pen-views').$,
    FileView = require('./file-view'),
    getIconHandler = require('../helpers.js').getIconHandler,
    View = require('atom-space-pen-views').View;

module.exports = DirectoryView = (function (parent) {
  __extends(DirectoryView, parent);

  function DirectoryView() {
    DirectoryView.__super__.constructor.apply(this, arguments);
  }

  DirectoryView.content = function () {
    var _this = this;

    return this.li({
      'class': 'directory entry list-nested-item collapsed'
    }, function () {
      _this.div({
        'class': 'header list-item',
        outlet: 'header'
      }, function () {
        return _this.span({
          'class': 'name icon',
          outlet: 'name'
        });
      });
      _this.ol({
        'class': 'entries list-tree',
        outlet: 'entries'
      });
    });
  };

  DirectoryView.prototype.initialize = function (directory) {
    // DirectoryView.__super__.initialize.apply(this, arguments);

    var self = this;

    self.item = directory;
    self.name.text(self.item.name);
    self.name.attr('data-name', self.item.name);
    self.name.attr('data-path', self.item.remote);

    var addIconToElement = getIconHandler();
    if (addIconToElement) {
      var element = self.name[0] || self.name;
      var path = self.item && self.item.local;
      this.iconDisposable = addIconToElement(element, path, { isDirectory: true });
    } else {
      self.name.addClass(self.item.type && self.item.type == 'l' ? 'icon-file-symlink-directory' : 'icon-file-directory');
    }

    if (self.item.isExpanded || self.item.isRoot) {
      self.expand();
    }

    if (self.item.isRoot) {
      self.addClass('project-root');
    }

    // Trigger repaint
    self.item.$folders.onValue(function () {
      self.repaint();
    });
    self.item.$files.onValue(function () {
      self.repaint();
    });
    self.item.$isExpanded.onValue(function () {
      self.setClasses();
    });
    self.item.on('destroyed', function () {
      self.destroy();
    });
    self.repaint();

    // Events
    self.on('mousedown', function (e) {
      e.stopPropagation();

      var view = $(this).view();
      var button = e.originalEvent ? e.originalEvent.button : 0;
      var selectKey = process.platform === 'darwin' ? 'metaKey' : 'ctrlKey'; // on mac the select key for multiple files is the meta key
      var $selected = $('.remote-ftp-view .selected');

      if (!view) return;

      if ((button === 0 || button === 2) && !(button === 2 && $selected.length > 1)) {
        if (!e[selectKey]) {
          $selected.removeClass('selected');
          $('.remote-ftp-view .entries.list-tree').removeClass('multi-select');
        } else {
          $('.remote-ftp-view .entries.list-tree').addClass('multi-select');
        }
        view.toggleClass('selected');

        if (button === 0 && !e[selectKey]) {
          if (view.item.status === 0) view.open();
          view.toggle();
        }
      }
    });

    self.on('dblclick', function (e) {
      e.stopPropagation();

      var view = $(this).view();
      if (!view) return;

      view.open();
    });
  };

  DirectoryView.prototype.destroy = function () {
    this.item = null;

    if (this.iconDisposable) {
      this.iconDisposable.dispose();
      this.iconDisposable = null;
    }

    this.remove();
  };

  DirectoryView.prototype.repaint = function (recursive) {
    var self = this,
        views = self.entries.children().map(function () {
      return $(this).view();
    }).get(),
        folders = [],
        files = [];

    self.entries.children().detach();

    if (self.item) {
      self.item.folders.forEach(function (item) {
        for (var a = 0, b = views.length; a < b; ++a) {
          if (views[a] && views[a] instanceof DirectoryView && views[a].item == item) {
            folders.push(views[a]);
            return;
          }
        }
        folders.push(new DirectoryView(item));
      });
    }
    if (self.item) {
      self.item.files.forEach(function (item) {
        for (var a = 0, b = views.length; a < b; ++a) {
          if (views[a] && views[a] instanceof FileView && views[a].item == item) {
            files.push(views[a]);
            return;
          }
        }
        files.push(new FileView(item));
      });
    }

    // TODO Destroy left over...

    views = folders.concat(files);

    views.sort(function (a, b) {
      if (a.constructor != b.constructor) {
        return a instanceof DirectoryView ? -1 : 1;
      }
      if (a.item.name == b.item.name) {
        return 0;
      }

      return a.item.name.toLowerCase().localeCompare(b.item.name.toLowerCase());
    });

    views.forEach(function (view) {
      self.entries.append(view);
    });
  };

  DirectoryView.prototype.setClasses = function () {
    if (this.item.isExpanded) {
      this.addClass('expanded').removeClass('collapsed');
    } else {
      this.addClass('collapsed').removeClass('expanded');
    }
  };

  DirectoryView.prototype.expand = function (recursive) {
    this.item.isExpanded = true;

    if (recursive) {
      this.entries.children().each(function () {
        var view = $(this).view();
        if (view && view instanceof DirectoryView) {
          view.expand(true);
        }
      });
    }
  };

  DirectoryView.prototype.collapse = function (recursive) {
    this.item.isExpanded = false;

    if (recursive) {
      this.entries.children().each(function () {
        var view = $(this).view();
        if (view && view instanceof DirectoryView) {
          view.collapse(true);
        }
      });
    }
  };

  DirectoryView.prototype.toggle = function (recursive) {
    if (this.item.isExpanded) {
      this.collapse(recursive);
    } else {
      this.expand(recursive);
    }
  };

  DirectoryView.prototype.open = function () {
    this.item.open();
  };

  DirectoryView.prototype.refresh = function () {
    this.item.open();
  };

  return DirectoryView;
})(View);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGU6Ly8vQzovVXNlcnMvdWNoaWhhLy5hdG9tL3BhY2thZ2VzL1JlbW90ZS1GVFAvbGliL3ZpZXdzL2RpcmVjdG9yeS12aWV3LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFdBQVcsQ0FBQzs7QUFFWixJQUFJLFNBQVMsR0FBRyxDQUFBLEdBQUUsQ0FBQyxjQUFjO0lBQy9CLFNBQVMsR0FBRyxTQUFaLFNBQVMsQ0FBYSxLQUFLLEVBQUUsTUFBTSxFQUFFO0FBQUUsT0FBSyxJQUFNLEdBQUcsSUFBSSxNQUFNLEVBQUU7QUFBRSxRQUFJLFNBQVMsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxFQUFFLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7R0FBRSxBQUFDLFNBQVMsSUFBSSxHQUFHO0FBQUUsUUFBSSxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUM7R0FBRSxBQUFDLElBQUksQ0FBQyxTQUFTLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQyxBQUFDLEtBQUssQ0FBQyxTQUFTLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQyxBQUFDLEtBQUssQ0FBQyxTQUFTLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQyxBQUFDLE9BQU8sS0FBSyxDQUFDO0NBQUU7SUFDbFMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLENBQUM7SUFDckMsUUFBUSxHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUM7SUFDakMsY0FBYyxHQUFHLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQyxjQUFjO0lBQ3hELElBQUksR0FBRyxPQUFPLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxJQUFJLENBQUM7O0FBRTlDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsYUFBYSxHQUFJLENBQUEsVUFBVSxNQUFNLEVBQUU7QUFDbEQsV0FBUyxDQUFDLGFBQWEsRUFBRSxNQUFNLENBQUMsQ0FBQzs7QUFFakMsV0FBUyxhQUFhLEdB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LEVBQUUsQ0FBQztHQUNsQixDQUFDOztBQUVGLGVBQWEsQ0FBQyxTQUFTLENBQUMsT0FBTyxHQUFHLFlBQVk7QUFDNUMsUUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztHQUNsQixDQUFDOztBQUVGLFNBQU8sYUFBYSxDQUFDO0NBQ3RCLENBQUEsQ0FBQyxJQUFJLENBQUMsQUFBQyxDQUFDIiwiZmlsZSI6ImZpbGU6Ly8vQzovVXNlcnMvdWNoaWhhLy5hdG9tL3BhY2thZ2VzL1JlbW90ZS1GVFAvbGliL3ZpZXdzL2RpcmVjdG9yeS12aWV3LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmxldCBfX2hhc1Byb3AgPSB7fS5oYXNPd25Qcm9wZXJ0eSxcbiAgX19leHRlbmRzID0gZnVuY3Rpb24gKGNoaWxkLCBwYXJlbnQpIHsgZm9yIChjb25zdCBrZXkgaW4gcGFyZW50KSB7IGlmIChfX2hhc1Byb3AuY2FsbChwYXJlbnQsIGtleSkpIGNoaWxkW2tleV0gPSBwYXJlbnRba2V5XTsgfSBmdW5jdGlvbiBjdG9yKCkgeyB0aGlzLmNvbnN0cnVjdG9yID0gY2hpbGQ7IH0gY3Rvci5wcm90b3R5cGUgPSBwYXJlbnQucHJvdG90eXBlOyBjaGlsZC5wcm90b3R5cGUgPSBuZXcgY3RvcigpOyBjaGlsZC5fX3N1cGVyX18gPSBwYXJlbnQucHJvdG90eXBlOyByZXR1cm4gY2hpbGQ7IH0sXG4gICQgPSByZXF1aXJlKCdhdG9tLXNwYWNlLXBlbi12aWV3cycpLiQsXG4gIEZpbGVWaWV3ID0gcmVxdWlyZSgnLi9maWxlLXZpZXcnKSxcbiAgZ2V0SWNvbkhhbmRsZXIgPSByZXF1aXJlKCcuLi9oZWxwZXJzLmpzJykuZ2V0SWNvbkhhbmRsZXIsXG4gIFZpZXcgPSByZXF1aXJlKCdhdG9tLXNwYWNlLXBlbi12aWV3cycpLlZpZXc7XG5cbm1vZHVsZS5leHBvcnRzID0gRGlyZWN0b3J5VmlldyA9IChmdW5jdGlvbiAocGFyZW50KSB7XG4gIF9fZXh0ZW5kcyhEaXJlY3RvcnlWaWV3LCBwYXJlbnQpO1xuXG4gIGZ1bmN0aW9uIERpcmVjdG9yeVZpZXcoKSB7XG4gICAgRGlyZWN0b3J5Vmlldy5fX3N1cGVyX18uY29uc3RydWN0b3IuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfVxuXG4gIERpcmVjdG9yeVZpZXcuY29udGVudCA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5saSh7XG4gICAgICBjbGFzczogJ2RpcmVjdG9yeSBlbnRyeSBsaXN0LW5lc3RlZC1pdGVtIGNvbGxhcHNlZCcsXG4gICAgfSwgKCkgPT4ge1xuICAgICAgdGhpcy5kaXYoe1xuICAgICAgICBjbGFzczogJ2hlYWRlciBsaXN0LWl0ZW0nLFxuICAgICAgICBvdXRsZXQ6ICdoZWFkZXInLFxuICAgICAgfSwgKCkgPT4gdGhpcy5zcGFuKHtcbiAgICAgICAgY2xhc3M6ICduYW1lIGljb24nLFxuICAgICAgICBvdXRsZXQ6ICduYW1lJyxcbiAgICAgIH0pKTtcbiAgICAgIHRoaXMub2woe1xuICAgICAgICBjbGFzczogJ2VudHJpZXMgbGlzdC10cmVlJyxcbiAgICAgICAgb3V0bGV0OiAnZW50cmllcycsXG4gICAgICB9KTtcbiAgICB9KTtcbiAgfTtcblxuICBEaXJlY3RvcnlWaWV3LnByb3RvdHlwZS5pbml0aWFsaXplID0gZnVuY3Rpb24gKGRpcmVjdG9yeSkge1xuXHRcdC8vIERpcmVjdG9yeVZpZXcuX19zdXBlcl9fLmluaXRpYWxpemUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblxuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgc2VsZi5pdGVtID0gZGlyZWN0b3J5O1xuICAgIHNlbGYubmFtZS50ZXh0KHNlbGYuaXRlbS5uYW1lKTtcbiAgICBzZWxmLm5hbWUuYXR0cignZGF0YS1uYW1lJywgc2VsZi5pdGVtLm5hbWUpO1xuICAgIHNlbGYubmFtZS5hdHRyKCdkYXRhLXBhdGgnLCBzZWxmLml0ZW0ucmVtb3RlKTtcblxuICAgIGNvbnN0IGFkZEljb25Ub0VsZW1lbnQgPSBnZXRJY29uSGFuZGxlcigpO1xuICAgIGlmIChhZGRJY29uVG9FbGVtZW50KSB7XG4gICAgICBjb25zdCBlbGVtZW50ID0gc2VsZi5uYW1lWzBdIHx8IHNlbGYubmFtZTtcbiAgICAgIGNvbnN0IHBhdGggPSBzZWxmLml0ZW0gJiYgc2VsZi5pdGVtLmxvY2FsO1xuICAgICAgdGhpcy5pY29uRGlzcG9zYWJsZSA9IGFkZEljb25Ub0VsZW1lbnQoZWxlbWVudCwgcGF0aCwgeyBpc0RpcmVjdG9yeTogdHJ1ZSB9KTtcbiAgICB9IGVsc2VcdFx0XHR7IHNlbGYubmFtZS5hZGRDbGFzcyhzZWxmLml0ZW0udHlwZSAmJiBzZWxmLml0ZW0udHlwZSA9PSAnbCcgPyAnaWNvbi1maWxlLXN5bWxpbmstZGlyZWN0b3J5JyA6ICdpY29uLWZpbGUtZGlyZWN0b3J5Jyk7IH1cblxuICAgIGlmIChzZWxmLml0ZW0uaXNFeHBhbmRlZCB8fCBzZWxmLml0ZW0uaXNSb290KVx0XHRcdHsgc2VsZi5leHBhbmQoKTsgfVxuXG4gICAgaWYgKHNlbGYuaXRlbS5pc1Jvb3QpXHRcdFx0eyBzZWxmLmFkZENsYXNzKCdwcm9qZWN0LXJvb3QnKTsgfVxuXG5cdFx0Ly8gVHJpZ2dlciByZXBhaW50XG4gICAgc2VsZi5pdGVtLiRmb2xkZXJzLm9uVmFsdWUoKCkgPT4geyBzZWxmLnJlcGFpbnQoKTsgfSk7XG4gICAgc2VsZi5pdGVtLiRmaWxlcy5vblZhbHVlKCgpID0+IHsgc2VsZi5yZXBhaW50KCk7IH0pO1xuICAgIHNlbGYuaXRlbS4kaXNFeHBhbmRlZC5vblZhbHVlKCgpID0+IHsgc2VsZi5zZXRDbGFzc2VzKCk7IH0pO1xuICAgIHNlbGYuaXRlbS5vbignZGVzdHJveWVkJywgKCkgPT4geyBzZWxmLmRlc3Ryb3koKTsgfSk7XG4gICAgc2VsZi5yZXBhaW50KCk7XG5cblx0XHQvLyBFdmVudHNcbiAgICBzZWxmLm9uKCdtb3VzZWRvd24nLCBmdW5jdGlvbiAoZSkge1xuICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcblxuICAgICAgY29uc3QgdmlldyA9ICQodGhpcykudmlldygpO1xuICAgICAgY29uc3QgYnV0dG9uID0gZS5vcmlnaW5hbEV2ZW50ID8gZS5vcmlnaW5hbEV2ZW50LmJ1dHRvbiA6IDA7XG4gICAgICBjb25zdCBzZWxlY3RLZXkgPSBwcm9jZXNzLnBsYXRmb3JtID09PSAnZGFyd2luJyA/ICdtZXRhS2V5JyA6ICdjdHJsS2V5JzsgLy8gb24gbWFjIHRoZSBzZWxlY3Qga2V5IGZvciBtdWx0aXBsZSBmaWxlcyBpcyB0aGUgbWV0YSBrZXlcbiAgICAgIGNvbnN0ICRzZWxlY3RlZCA9ICQoJy5yZW1vdGUtZnRwLXZpZXcgLnNlbGVjdGVkJyk7XG5cbiAgICAgIGlmICghdmlldykgcmV0dXJuO1xuXG4gICAgICBpZiAoKGJ1dHRvbiA9PT0gMCB8fCBidXR0b24gPT09IDIpICYmICEoYnV0dG9uID09PSAyICYmICRzZWxlY3RlZC5sZW5ndGggPiAxKSkge1xuICAgICAgICBpZiAoIWVbc2VsZWN0S2V5XSkge1xuICAgICAgICAgICRzZWxlY3RlZC5yZW1vdmVDbGFzcygnc2VsZWN0ZWQnKTtcbiAgICAgICAgICAkKCcucmVtb3RlLWZ0cC12aWV3IC5lbnRyaWVzLmxpc3QtdHJlZScpLnJlbW92ZUNsYXNzKCdtdWx0aS1zZWxlY3QnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAkKCcucmVtb3RlLWZ0cC12aWV3IC5lbnRyaWVzLmxpc3QtdHJlZScpLmFkZENsYXNzKCdtdWx0aS1zZWxlY3QnKTtcbiAgICAgICAgfVxuICAgICAgICB2aWV3LnRvZ2dsZUNsYXNzKCdzZWxlY3RlZCcpO1xuXG4gICAgICAgIGlmIChidXR0b24gPT09IDAgJiYgIWVbc2VsZWN0S2V5XSkge1xuICAgICAgICAgIGlmICh2aWV3Lml0ZW0uc3RhdHVzID09PSAwKSB2aWV3Lm9wZW4oKTtcbiAgICAgICAgICB2aWV3LnRvZ2dsZSgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBzZWxmLm9uKCdkYmxjbGljaycsIGZ1bmN0aW9uIChlKSB7XG4gICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgICBjb25zdCB2aWV3ID0gJCh0aGlzKS52aWV3KCk7XG4gICAgICBpZiAoIXZpZXcpIHJldHVybjtcblxuICAgICAgdmlldy5vcGVuKCk7XG4gICAgfSk7XG4gIH07XG5cbiAgRGlyZWN0b3J5Vmlldy5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLml0ZW0gPSBudWxsO1xuXG4gICAgaWYgKHRoaXMuaWNvbkRpc3Bvc2FibGUpIHtcbiAgICAgIHRoaXMuaWNvbkRpc3Bvc2FibGUuZGlzcG9zZSgpO1xuICAgICAgdGhpcy5pY29uRGlzcG9zYWJsZSA9IG51bGw7XG4gICAgfVxuXG4gICAgdGhpcy5yZW1vdmUoKTtcbiAgfTtcblxuICBEaXJlY3RvcnlWaWV3LnByb3RvdHlwZS5yZXBhaW50ID0gZnVuY3Rpb24gKHJlY3Vyc2l2ZSkge1xuICAgIGxldCBzZWxmID0gdGhpcyxcbiAgICAgIHZpZXdzID0gc2VsZi5lbnRyaWVzLmNoaWxkcmVuKCkubWFwKGZ1bmN0aW9uICgpIHsgcmV0dXJuICQodGhpcykudmlldygpOyB9KS5nZXQoKSxcbiAgICAgIGZvbGRlcnMgPSBbXSxcbiAgICAgIGZpbGVzID0gW107XG5cbiAgICBzZWxmLmVudHJpZXMuY2hpbGRyZW4oKS5kZXRhY2goKTtcblxuICAgIGlmIChzZWxmLml0ZW0pIHtcbiAgICAgIHNlbGYuaXRlbS5mb2xkZXJzLmZvckVhY2goKGl0ZW0pID0+IHtcbiAgICAgICAgZm9yIChsZXQgYSA9IDAsIGIgPSB2aWV3cy5sZW5ndGg7IGEgPCBiOyArK2EpXHRcdFx0XHR7XG4gICAgICAgICAgaWYgKHZpZXdzW2FdICYmIHZpZXdzW2FdIGluc3RhbmNlb2YgRGlyZWN0b3J5VmlldyAmJiB2aWV3c1thXS5pdGVtID09IGl0ZW0pIHtcbiAgICAgICAgICAgIGZvbGRlcnMucHVzaCh2aWV3c1thXSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGZvbGRlcnMucHVzaChuZXcgRGlyZWN0b3J5VmlldyhpdGVtKSk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgaWYgKHNlbGYuaXRlbSkge1xuICAgICAgc2VsZi5pdGVtLmZpbGVzLmZvckVhY2goKGl0ZW0pID0+IHtcbiAgICAgICAgZm9yIChsZXQgYSA9IDAsIGIgPSB2aWV3cy5sZW5ndGg7IGEgPCBiOyArK2EpXHRcdFx0XHR7XG4gICAgICAgICAgaWYgKHZpZXdzW2FdICYmIHZpZXdzW2FdIGluc3RhbmNlb2YgRmlsZVZpZXcgJiYgdmlld3NbYV0uaXRlbSA9PSBpdGVtKSB7XG4gICAgICAgICAgICBmaWxlcy5wdXNoKHZpZXdzW2FdKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZmlsZXMucHVzaChuZXcgRmlsZVZpZXcoaXRlbSkpO1xuICAgICAgfSk7XG4gICAgfVxuXG5cdFx0Ly8gVE9ETyBEZXN0cm95IGxlZnQgb3Zlci4uLlxuXG4gICAgdmlld3MgPSBmb2xkZXJzLmNvbmNhdChmaWxlcyk7XG5cbiAgICB2aWV3cy5zb3J0KChhLCBiKSA9PiB7XG4gICAgICBpZiAoYS5jb25zdHJ1Y3RvciAhPSBiLmNvbnN0cnVjdG9yKVx0XHRcdFx0eyByZXR1cm4gYSBpbnN0YW5jZW9mIERpcmVjdG9yeVZpZXcgPyAtMSA6IDE7IH1cbiAgICAgIGlmIChhLml0ZW0ubmFtZSA9PSBiLml0ZW0ubmFtZSlcdFx0XHRcdHsgcmV0dXJuIDA7IH1cblxuICAgICAgcmV0dXJuIGEuaXRlbS5uYW1lLnRvTG93ZXJDYXNlKCkubG9jYWxlQ29tcGFyZShiLml0ZW0ubmFtZS50b0xvd2VyQ2FzZSgpKTtcbiAgICB9KTtcblxuICAgIHZpZXdzLmZvckVhY2goKHZpZXcpID0+IHtcbiAgICAgIHNlbGYuZW50cmllcy5hcHBlbmQodmlldyk7XG4gICAgfSk7XG4gIH07XG5cbiAgRGlyZWN0b3J5Vmlldy5wcm90b3R5cGUuc2V0Q2xhc3NlcyA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5pdGVtLmlzRXhwYW5kZWQpIHtcbiAgICAgIHRoaXMuYWRkQ2xhc3MoJ2V4cGFuZGVkJykucmVtb3ZlQ2xhc3MoJ2NvbGxhcHNlZCcpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmFkZENsYXNzKCdjb2xsYXBzZWQnKS5yZW1vdmVDbGFzcygnZXhwYW5kZWQnKTtcbiAgICB9XG4gIH07XG5cbiAgRGlyZWN0b3J5Vmlldy5wcm90b3R5cGUuZXhwYW5kID0gZnVuY3Rpb24gKHJlY3Vyc2l2ZSkge1xuICAgIHRoaXMuaXRlbS5pc0V4cGFuZGVkID0gdHJ1ZTtcblxuICAgIGlmIChyZWN1cnNpdmUpIHtcbiAgICAgIHRoaXMuZW50cmllcy5jaGlsZHJlbigpLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgICBjb25zdCB2aWV3ID0gJCh0aGlzKS52aWV3KCk7XG4gICAgICAgIGlmICh2aWV3ICYmIHZpZXcgaW5zdGFuY2VvZiBEaXJlY3RvcnlWaWV3KVx0XHRcdFx0XHR7IHZpZXcuZXhwYW5kKHRydWUpOyB9XG4gICAgICB9KTtcbiAgICB9XG4gIH07XG5cbiAgRGlyZWN0b3J5Vmlldy5wcm90b3R5cGUuY29sbGFwc2UgPSBmdW5jdGlvbiAocmVjdXJzaXZlKSB7XG4gICAgdGhpcy5pdGVtLmlzRXhwYW5kZWQgPSBmYWxzZTtcblxuICAgIGlmIChyZWN1cnNpdmUpIHtcbiAgICAgIHRoaXMuZW50cmllcy5jaGlsZHJlbigpLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgICBjb25zdCB2aWV3ID0gJCh0aGlzKS52aWV3KCk7XG4gICAgICAgIGlmICh2aWV3ICYmIHZpZXcgaW5zdGFuY2VvZiBEaXJlY3RvcnlWaWV3KVx0XHRcdFx0XHR7IHZpZXcuY29sbGFwc2UodHJ1ZSk7IH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcblxuICBEaXJlY3RvcnlWaWV3LnByb3RvdHlwZS50b2dnbGUgPSBmdW5jdGlvbiAocmVjdXJzaXZlKSB7XG4gICAgaWYgKHRoaXMuaXRlbS5pc0V4cGFuZGVkKSB7XG4gICAgICB0aGlzLmNvbGxhcHNlKHJlY3Vyc2l2ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZXhwYW5kKHJlY3Vyc2l2ZSk7XG4gICAgfVxuICB9O1xuXG4gIERpcmVjdG9yeVZpZXcucHJvdG90eXBlLm9wZW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5pdGVtLm9wZW4oKTtcbiAgfTtcblxuICBEaXJlY3RvcnlWaWV3LnByb3RvdHlwZS5yZWZyZXNoID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuaXRlbS5vcGVuKCk7XG4gIH07XG5cbiAgcmV0dXJuIERpcmVjdG9yeVZpZXc7XG59KFZpZXcpKTtcbiJdfQ==