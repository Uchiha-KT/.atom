
/*
  Atom-terminal-panel
  Copyright by isis97
  MIT licensed

  Terminal utility for doing simple stuff (like filesystem manip).
  The Util API can be accessed by the terminal plugins
  by calling state.util, e.g.
    "command": (state, args) ->
      state.util.rmdir './temp'
 */

(function() {
  var Util, dirname, extname, fs, ref, resolve, sep;

  fs = include('fs');

  ref = include('path'), resolve = ref.resolve, dirname = ref.dirname, extname = ref.extname, sep = ref.sep;

  Util = (function() {
    function Util() {}

    Util.prototype.os = function() {
      var isLinux, isMac, isWindows, osname;
      isWindows = false;
      isMac = false;
      isLinux = false;
      osname = process.platform || process.env.OS;
      if (/^win/igm.test(osname)) {
        isWindows = true;
      } else if (/^darwin/igm.test(osname)) {
        isMac = true;
      } else if (/^linux/igm.test(osname)) {
        isLinux = true;
      }
      return {
        windows: isWindows,
        mac: isMac,
        linux: isLinux
      };
    };

    Util.prototype.escapeRegExp = function(string) {
      if (string === null) {
        return null;
      }
      return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
    };

    Util.prototype.replaceAll = function(find, replace, str) {
      if (str == null) {
        return null;
      }
      if (str.replace == null) {
        return str;
      }
      return str.replace(new RegExp(this.escapeRegExp(find), 'g'), replace);
    };

    Util.prototype.dir = function(paths, cwd) {
      var i, len, path, rcwd, ret;
      if (paths instanceof Array) {
        ret = [];
        for (i = 0, len = paths.length; i < len; i++) {
          path = paths[i];
          ret.push(this.dir(path, cwd));
        }
        return ret;
      } else {

        /*
        if (paths.indexOf('./') == 0) or (paths.indexOf('.\\') == 0)
          return @replaceAll '\\', '/', (cwd + '/' + paths)
        else if (paths.indexOf('../') == 0) or (paths.indexOf('..\\') == 0)
          return @replaceAll '\\', '/', (cwd + '/../' + paths)
        else
          return paths
         */
        rcwd = resolve('.');
        if ((paths.indexOf('/') !== 0) && (paths.indexOf('\\') !== 0) && (paths.indexOf('./') !== 0) && (paths.indexOf('.\\') !== 0) && (paths.indexOf('../') !== 0) && (paths.indexOf('..\\') !== 0)) {
          return paths;
        } else {
          return this.replaceAll('\\', '/', this.replaceAll(rcwd + sep, '', this.replaceAll(rcwd + sep, '', resolve(cwd, paths))));
        }
      }
    };

    Util.prototype.getFileName = function(fullpath) {
      var matcher;
      if (fullpath != null) {
        matcher = /(.*:)((.*)(\\|\/))*/ig;
        return fullpath.replace(matcher, "");
      }
      return null;
    };

    Util.prototype.getFilePath = function(fullpath) {
      if (typeof fillpath === "undefined" || fillpath === null) {
        return null;
      }
      return this.replaceAll(this.getFileName(fullpath), "", fullpath);
    };

    Util.prototype.copyFile = function(sources, targets) {
      var i, len, source;
      if (targets instanceof Array) {
        if (targets[0] != null) {
          return this.copyFile(sources, targets[0]);
        }
        return 0;
      } else {
        if (sources instanceof Array) {
          for (i = 0, len = sources.length; i < len; i++) {
            source = sources[i];
            fs.createReadStream(resolve(source)).pipe(fs.createWriteStream(resolve(targets)));
          }
          return sources.length;
        } else {
          return this.copyFile([sources], targets);
        }
      }
    };

    Util.prototype.cp = function(sources, targets) {
      var e, i, isDir, j, len, len1, ret, source, stat, target;
      if (targets instanceof Array) {
        ret = 0;
        for (i = 0, len = targets.length; i < len; i++) {
          target = targets[i];
          ret += this.cp(sources, target);
        }
        return ret;
      } else {
        if (sources instanceof Array) {
          for (j = 0, len1 = sources.length; j < len1; j++) {
            source = sources[j];
            isDir = false;
            try {
              stat = fs.statSync(targets, function(e) {});
              isDir = stat.isDirectory();
            } catch (error) {
              e = error;
              isDir = false;
            }
            if (!isDir) {
              this.copyFile(source, targets);
            } else {
              this.copyFile(source, targets + '/' + (this.getFileName(source)));
            }
          }
          return sources.length;
        } else {
          return this.cp([sources], targets);
        }
      }
    };

    Util.prototype.mkdir = function(paths) {
      var i, len, path, ret;
      if (paths instanceof Array) {
        ret = '';
        for (i = 0, len = paths.length; i < len; i++) {
          path = paths[i];
          fs.mkdirSync(path, function(e) {});
          ret += 'Directory created \"' + path + '\"\n';
        }
        return ret;
      } else {
        return this.mkdir([paths]);
      }
    };

    Util.prototype.rmdir = function(paths) {
      var i, len, path, ret;
      if (paths instanceof Array) {
        ret = '';
        for (i = 0, len = paths.length; i < len; i++) {
          path = paths[i];
          fs.rmdirSync(path, function(e) {});
          ret += 'Directory removed \"' + path + '\"\n';
        }
        return ret;
      } else {
        return this.rmdir([paths]);
      }
    };

    Util.prototype.rename = function(oldpath, newpath) {
      fs.renameSync(oldpath, newpath, function(e) {});
      return 'File/directory renamed: ' + oldpath + '\n';
    };

    return Util;

  })();

  module.exports = new Util();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy91Y2hpaGEvLmF0b20vcGFja2FnZXMvYXRvbS10ZXJtaW5hbC1wYW5lbC9saWIvYXRwLXRlcm1pbmFsLXV0aWwuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7Ozs7Ozs7O0FBQUE7QUFBQSxNQUFBOztFQWFBLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUjs7RUFDTCxNQUFtQyxPQUFBLENBQVEsTUFBUixDQUFuQyxFQUFDLHFCQUFELEVBQVUscUJBQVYsRUFBbUIscUJBQW5CLEVBQTRCOztFQUV0Qjs7O21CQVNKLEVBQUEsR0FBSSxTQUFBO0FBQ0YsVUFBQTtNQUFBLFNBQUEsR0FBWTtNQUNaLEtBQUEsR0FBUTtNQUNSLE9BQUEsR0FBVTtNQUNWLE1BQUEsR0FBUyxPQUFPLENBQUMsUUFBUixJQUFvQixPQUFPLENBQUMsR0FBRyxDQUFDO01BQ3pDLElBQUcsU0FBUyxDQUFDLElBQVYsQ0FBZSxNQUFmLENBQUg7UUFDRSxTQUFBLEdBQVksS0FEZDtPQUFBLE1BRUssSUFBRyxZQUFZLENBQUMsSUFBYixDQUFrQixNQUFsQixDQUFIO1FBQ0gsS0FBQSxHQUFRLEtBREw7T0FBQSxNQUVBLElBQUcsV0FBVyxDQUFDLElBQVosQ0FBaUIsTUFBakIsQ0FBSDtRQUNILE9BQUEsR0FBVSxLQURQOztBQUVMLGFBQU87UUFDTCxPQUFBLEVBQVMsU0FESjtRQUVMLEdBQUEsRUFBSyxLQUZBO1FBR0wsS0FBQSxFQUFPLE9BSEY7O0lBWEw7O21CQW9CSixZQUFBLEdBQWMsU0FBQyxNQUFEO01BQ1osSUFBRyxNQUFBLEtBQVUsSUFBYjtBQUNFLGVBQU8sS0FEVDs7QUFFQSxhQUFPLE1BQU0sQ0FBQyxPQUFQLENBQWUsNkJBQWYsRUFBOEMsTUFBOUM7SUFISzs7bUJBU2QsVUFBQSxHQUFZLFNBQUMsSUFBRCxFQUFPLE9BQVAsRUFBZ0IsR0FBaEI7TUFDVixJQUFPLFdBQVA7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QUFDLEtBQUQsQ0FBUCxFQVBUOztJQURLOzttQkFXUCxLQUFBLEdBQU8sU0FBQyxLQUFEO0FBQ0wsVUFBQTtNQUFBLElBQUcsS0FBQSxZQUFpQixLQUFwQjtRQUNFLEdBQUEsR0FBTTtBQUNOLGFBQUEsdUNBQUE7O1VBQ0UsRUFBRSxDQUFDLFNBQUgsQ0FBYSxJQUFiLEVBQW1CLFNBQUMsQ0FBRCxHQUFBLENBQW5CO1VBQ0EsR0FBQSxJQUFPLHNCQUFBLEdBQXVCLElBQXZCLEdBQTRCO0FBRnJDO0FBR0EsZUFBTyxJQUxUO09BQUEsTUFBQTtBQU9FLGVBQU8sSUFBQyxDQUFBLEtBQUQsQ0FBTyxDQUFDLEtBQUQsQ0FBUCxFQVBUOztJQURLOzttQkFXUCxNQUFBLEdBQVEsU0FBQyxPQUFELEVBQVUsT0FBVjtNQUNOLEVBQUUsQ0FBQyxVQUFILENBQWMsT0FBZCxFQUF1QixPQUF2QixFQUFnQyxTQUFDLENBQUQsR0FBQSxDQUFoQztBQUNBLGFBQU8sMEJBQUEsR0FBMkIsT0FBM0IsR0FBbUM7SUFGcEM7Ozs7OztFQUlWLE1BQU0sQ0FBQyxPQUFQLEdBQ00sSUFBQSxJQUFBLENBQUE7QUF0TE4iLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbiAgQXRvbS10ZXJtaW5hbC1wYW5lbFxuICBDb3B5cmlnaHQgYnkgaXNpczk3XG4gIE1JVCBsaWNlbnNlZFxuXG4gIFRlcm1pbmFsIHV0aWxpdHkgZm9yIGRvaW5nIHNpbXBsZSBzdHVmZiAobGlrZSBmaWxlc3lzdGVtIG1hbmlwKS5cbiAgVGhlIFV0aWwgQVBJIGNhbiBiZSBhY2Nlc3NlZCBieSB0aGUgdGVybWluYWwgcGx1Z2luc1xuICBieSBjYWxsaW5nIHN0YXRlLnV0aWwsIGUuZy5cbiAgICBcImNvbW1hbmRcIjogKHN0YXRlLCBhcmdzKSAtPlxuICAgICAgc3RhdGUudXRpbC5ybWRpciAnLi90ZW1wJ1xuXG4jIyNcblxuZnMgPSBpbmNsdWRlICdmcydcbntyZXNvbHZlLCBkaXJuYW1lLCBleHRuYW1lLCBzZXB9ID0gaW5jbHVkZSAncGF0aCdcblxuY2xhc3MgVXRpbFxuXG4gICNcbiAgIyBEZXRlY3RzIHRoZSBvcGVyYXRpbmcgc3lzdGVtIHBsYXRmb3JtXG4gICMgRG8gb3MgPSBvcygpXG4gICMgaWYob3Mud2luZG93cykgeyAvKi4uLiovIH1cbiAgIyBpZihvcy5saW51eCkgICB7IC8qLi4uKi8gfVxuICAjIGlmKG9zLm1hYykgICAgIHsgLyouLi4qLyB9XG4gICNcbiAgb3M6ICgpIC0+XG4gICAgaXNXaW5kb3dzID0gZmFsc2VcbiAgICBpc01hYyA9IGZhbHNlXG4gICAgaXNMaW51eCA9IGZhbHNlXG4gICAgb3NuYW1lID0gcHJvY2Vzcy5wbGF0Zm9ybSBvciBwcm9jZXNzLmVudi5PU1xuICAgIGlmIC9ed2luL2lnbS50ZXN0IG9zbmFtZVxuICAgICAgaXNXaW5kb3dzID0gdHJ1ZVxuICAgIGVsc2UgaWYgL15kYXJ3aW4vaWdtLnRlc3Qgb3NuYW1lXG4gICAgICBpc01hYyA9IHRydWVcbiAgICBlbHNlIGlmIC9ebGludXgvaWdtLnRlc3Qgb3NuYW1lXG4gICAgICBpc0xpbnV4ID0gdHJ1ZVxuICAgIHJldHVybiB7XG4gICAgICB3aW5kb3dzOiBpc1dpbmRvd3NcbiAgICAgIG1hYzogaXNNYWNcbiAgICAgIGxpbnV4OiBpc0xpbnV4XG4gICAgfVxuXG4gICNcbiAgIyBFc2NhcGVzIHRoZSBnaXZlbiByZWd1bGFyIGV4cHJlc3Npb24gc3RyaW5nLlxuICAjXG4gIGVzY2FwZVJlZ0V4cDogKHN0cmluZykgLT5cbiAgICBpZiBzdHJpbmcgPT0gbnVsbFxuICAgICAgcmV0dXJuIG51bGxcbiAgICByZXR1cm4gc3RyaW5nLnJlcGxhY2UoLyhbLiorP149IToke30oKXxcXFtcXF1cXC9cXFxcXSkvZywgXCJcXFxcJDFcIik7XG5cbiAgI1xuICAjIFJlcGxhY2VzIGFsbCBvY2N1cnJlbmNlcyBvZiB0aGUgJ2ZpbmQnIHN0cmluZyB3aXRoIHRoZSAncmVwbGFjZScgcmVwbGFjZW1lbnQgaW5cbiAgIyB0aGUgJ3N0cicgdGV4dC5cbiAgI1xuICByZXBsYWNlQWxsOiAoZmluZCwgcmVwbGFjZSwgc3RyKSAtPlxuICAgIGlmIG5vdCBzdHI/XG4gICAgICByZXR1cm4gbnVsbFxuICAgIGlmIG5vdCBzdHIucmVwbGFjZT9cbiAgICAgIHJldHVybiBzdHJcbiAgICByZXR1cm4gc3RyLnJlcGxhY2UobmV3IFJlZ0V4cChAZXNjYXBlUmVnRXhwKGZpbmQpLCAnZycpLCByZXBsYWNlKVxuXG4gICNcbiAgIyBSZXNvbHZlcyB0aGUgZ2l2ZW4gcGF0aC9zLlxuICAjXG4gICMgSWYgdGhlIGZpbGUgYmVnaW5zIHdpdGggLi8gb3IgLi4vIGl0IHdpbGwgYmUgcmVkaXJlY3RlZCB0byB0aGUgZ2l2ZW4gY3dkIGRpcmVjdG9yeS5cbiAgIyBJZiB0aGUgZmlsZSBzdGFydHMgd2l0aCAvIGl0IHdpbGwgYmUgcmVkaXJlY3RlZCB0byB0aGUgY3dkIGRpc2MuXG4gICMgSWYgdGhlIGZpbGUgZG9lcyBub3Qgc3RhcnQgd2l0aCAuLyBub3IgLi4vIGFuZCAvIGl0IHdpbGwgYmUgTk9UIHJlZGlyZWN0ZWQuXG4gICNcbiAgIyBUaGlzIG1ldGhvZCBhY2NlcHRzIGFsc28gcGF0aCBhcnJheXMuXG4gICMgZS5nLlxuICAjXG4gICMgZGlyKFtcIi4vYS50eHRcIiwgXCJiLnR4dFwiXSwgXCJwYXRoXCIpXG4gICMgcmV0dXJuczpcbiAgIyBbXCJwYXRoL2EudHh0XCIsIFwiYi50eHRcIl1cbiAgI1xuICBkaXI6IChwYXRocywgY3dkKSAtPlxuICAgIGlmIHBhdGhzIGluc3RhbmNlb2YgQXJyYXlcbiAgICAgIHJldCA9IFtdXG4gICAgICBmb3IgcGF0aCBpbiBwYXRoc1xuICAgICAgICByZXQucHVzaCBAZGlyIHBhdGgsIGN3ZFxuICAgICAgcmV0dXJuIHJldFxuICAgIGVsc2VcblxuICAgICAgIyMjXG4gICAgICBpZiAocGF0aHMuaW5kZXhPZignLi8nKSA9PSAwKSBvciAocGF0aHMuaW5kZXhPZignLlxcXFwnKSA9PSAwKVxuICAgICAgICByZXR1cm4gQHJlcGxhY2VBbGwgJ1xcXFwnLCAnLycsIChjd2QgKyAnLycgKyBwYXRocylcbiAgICAgIGVsc2UgaWYgKHBhdGhzLmluZGV4T2YoJy4uLycpID09IDApIG9yIChwYXRocy5pbmRleE9mKCcuLlxcXFwnKSA9PSAwKVxuICAgICAgICByZXR1cm4gQHJlcGxhY2VBbGwgJ1xcXFwnLCAnLycsIChjd2QgKyAnLy4uLycgKyBwYXRocylcbiAgICAgIGVsc2VcbiAgICAgICAgcmV0dXJuIHBhdGhzXG4gICAgICAjIyNcblxuICAgICAgcmN3ZCA9IHJlc29sdmUgJy4nXG4gICAgICBpZiAocGF0aHMuaW5kZXhPZignLycpICE9IDApIGFuZCAocGF0aHMuaW5kZXhPZignXFxcXCcpICE9IDApIGFuZCAocGF0aHMuaW5kZXhPZignLi8nKSAhPSAwKSBhbmQgKHBhdGhzLmluZGV4T2YoJy5cXFxcJykgIT0gMCkgYW5kIChwYXRocy5pbmRleE9mKCcuLi8nKSAhPSAwKSBhbmQgKHBhdGhzLmluZGV4T2YoJy4uXFxcXCcpICE9IDApXG4gICAgICAgIHJldHVybiBwYXRoc1xuICAgICAgZWxzZVxuICAgICAgICByZXR1cm4gQHJlcGxhY2VBbGwgJ1xcXFwnLCAnLycsIChAcmVwbGFjZUFsbCByY3dkK3NlcCwgJycsIChAcmVwbGFjZUFsbCByY3dkK3NlcCwgJycsIChyZXNvbHZlIGN3ZCwgcGF0aHMpKSlcblxuICAjIE9idGFpbnMgdGhlIGZpbGUgbmFtZSBmcm9tIHRoZSBnaXZlbiBmdWxsIGZpbGVwYXRoLlxuICBnZXRGaWxlTmFtZTogKGZ1bGxwYXRoKS0+XG4gICAgaWYgZnVsbHBhdGg/XG4gICAgICBtYXRjaGVyID0gLyguKjopKCguKikoXFxcXHxcXC8pKSovaWdcbiAgICAgIHJldHVybiBmdWxscGF0aC5yZXBsYWNlIG1hdGNoZXIsIFwiXCJcbiAgICByZXR1cm4gbnVsbFxuXG4gICMgT2J0YWlucyB0aGUgZmlsZSBkaXJlY3RvcnkgZnJvbSB0aGUgZ2l2ZW4gZnVsbCBmaWxlcGF0aC5cbiAgZ2V0RmlsZVBhdGg6IChmdWxscGF0aCktPlxuICAgIGlmIG5vdCBmaWxscGF0aD9cbiAgICAgIHJldHVybiBudWxsXG4gICAgcmV0dXJuICBAcmVwbGFjZUFsbChAZ2V0RmlsZU5hbWUoZnVsbHBhdGgpLCBcIlwiLCBmdWxscGF0aClcblxuXG4gICMgQ29waWVzIHRoZSBmaWxlIGNvbnRlbnQgZnJvbSBvbmUgdG8gYW5vdGhlclxuICAjIGUuZyBjb3B5RmlsZShcImZ1bGxfcGF0aC9hLnR4dFwiLCBcImZ1bGxfcGF0aC9iLnR4dFwiKSB3aWxsIGNyZWF0ZSBuZXcgZmlsZSBiLnR4dCB3aXRoIGNvbnRlbnQgY29waWVkIGZyb20gYS50eHRcbiAgIyBUaGlzIG1ldGhvZCBhY2NlcHRzIG9ubHkgZnVsbCBmaWxlcGF0aHMuXG4gIGNvcHlGaWxlOiAoc291cmNlcywgdGFyZ2V0cykgLT5cbiAgICBpZiB0YXJnZXRzIGluc3RhbmNlb2YgQXJyYXlcbiAgICAgIGlmIHRhcmdldHNbMF0/XG4gICAgICAgIHJldHVybiBAY29weUZpbGUgc291cmNlcywgdGFyZ2V0c1swXVxuICAgICAgcmV0dXJuIDBcbiAgICBlbHNlXG4gICAgICBpZiBzb3VyY2VzIGluc3RhbmNlb2YgQXJyYXlcbiAgICAgICAgZm9yIHNvdXJjZSBpbiBzb3VyY2VzXG4gICAgICAgICAgZnMuY3JlYXRlUmVhZFN0cmVhbSAocmVzb2x2ZSBzb3VyY2UpXG4gICAgICAgICAgICAucGlwZSBmcy5jcmVhdGVXcml0ZVN0cmVhbSAocmVzb2x2ZSB0YXJnZXRzKVxuICAgICAgICByZXR1cm4gc291cmNlcy5sZW5ndGhcbiAgICAgIGVsc2VcbiAgICAgICAgcmV0dXJuIEBjb3B5RmlsZSBbc291cmNlc10sIHRhcmdldHNcblxuICAjIFdvcmtzIGxpa2UgYmFzaCBjb21tYW5kOiBjcFxuICAjIFRoaXMgbWV0aG9kIGFjY2VwdHMgb25seSBmdWxsIGZpbGVwYXRocy5cbiAgY3A6IChzb3VyY2VzLCB0YXJnZXRzKSAtPlxuICAgIGlmIHRhcmdldHMgaW5zdGFuY2VvZiBBcnJheVxuICAgICAgcmV0ID0gMFxuICAgICAgZm9yIHRhcmdldCBpbiB0YXJnZXRzXG4gICAgICAgIHJldCArPSBAY3Agc291cmNlcywgdGFyZ2V0XG4gICAgICByZXR1cm4gcmV0XG4gICAgZWxzZVxuICAgICAgaWYgc291cmNlcyBpbnN0YW5jZW9mIEFycmF5XG4gICAgICAgIGZvciBzb3VyY2UgaW4gc291cmNlc1xuICAgICAgICAgIGlzRGlyID0gZmFsc2VcbiAgICAgICAgICB0cnlcbiAgICAgICAgICAgIHN0YXQgPSBmcy5zdGF0U3luYyB0YXJnZXRzLCAoZSkgLT4gcmV0dXJuXG4gICAgICAgICAgICBpc0RpciA9IHN0YXQuaXNEaXJlY3RvcnkoKVxuICAgICAgICAgIGNhdGNoIGVcbiAgICAgICAgICAgIGlzRGlyID0gZmFsc2VcbiAgICAgICAgICBpZiBub3QgaXNEaXJcbiAgICAgICAgICAgIEBjb3B5RmlsZSBzb3VyY2UsIHRhcmdldHNcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBAY29weUZpbGUgc291cmNlLCB0YXJnZXRzICsgJy8nICsgKEBnZXRGaWxlTmFtZSBzb3VyY2UpXG4gICAgICAgIHJldHVybiBzb3VyY2VzLmxlbmd0aFxuICAgICAgZWxzZVxuICAgICAgICByZXR1cm4gQGNwIFtzb3VyY2VzXSwgdGFyZ2V0c1xuXG4gICMgQ3JlYXRlcyB0aGUgZ2l2ZW4gZGlyZWN0b3J5Ly1pZXMuXG4gIG1rZGlyOiAocGF0aHMpIC0+XG4gICAgaWYgcGF0aHMgaW5zdGFuY2VvZiBBcnJheVxuICAgICAgcmV0ID0gJydcbiAgICAgIGZvciBwYXRoIGluIHBhdGhzXG4gICAgICAgIGZzLm1rZGlyU3luYyBwYXRoLCAoZSkgLT4gcmV0dXJuXG4gICAgICAgIHJldCArPSAnRGlyZWN0b3J5IGNyZWF0ZWQgXFxcIicrcGF0aCsnXFxcIlxcbidcbiAgICAgIHJldHVybiByZXRcbiAgICBlbHNlXG4gICAgICByZXR1cm4gQG1rZGlyIFtwYXRoc11cblxuICAjIFJlbW92ZXMgdGhlIGdpdmVuIGRpcmVjdG9yeS8taWVzLlxuICBybWRpcjogKHBhdGhzKSAtPlxuICAgIGlmIHBhdGhzIGluc3RhbmNlb2YgQXJyYXlcbiAgICAgIHJldCA9ICcnXG4gICAgICBmb3IgcGF0aCBpbiBwYXRoc1xuICAgICAgICBmcy5ybWRpclN5bmMgcGF0aCwgKGUpIC0+IHJldHVyblxuICAgICAgICByZXQgKz0gJ0RpcmVjdG9yeSByZW1vdmVkIFxcXCInK3BhdGgrJ1xcXCJcXG4nXG4gICAgICByZXR1cm4gcmV0XG4gICAgZWxzZVxuICAgICAgcmV0dXJuIEBybWRpciBbcGF0aHNdXG5cbiAgIyBSZW5hbWVzIHRoZSBnaXZlbiBmaWxlLy1lcyBvci9hbmQgZGlyZWN0b3J5Ly1pZXMuXG4gIHJlbmFtZTogKG9sZHBhdGgsIG5ld3BhdGgpIC0+XG4gICAgZnMucmVuYW1lU3luYyBvbGRwYXRoLCBuZXdwYXRoLCAoZSkgLT4gcmV0dXJuXG4gICAgcmV0dXJuICdGaWxlL2RpcmVjdG9yeSByZW5hbWVkOiAnK29sZHBhdGgrJ1xcbidcblxubW9kdWxlLmV4cG9ydHMgPVxuICBuZXcgVXRpbCgpXG4iXX0=
