(function() {
  var Logger;

  Logger = (function() {
    function Logger(name) {
      this.levels = {
        'ERROR': 40,
        'WARN': 30,
        'INFO': 20,
        'DEBUG': 10
      };
      this.name = name;
      this.level = 'INFO';
    }

    Logger.prototype.setLevel = function(level) {
      var key, keys;
      try {
        level = level.toUpperCase();
      } catch (error) {}
      if (this.levels[level] == null) {
        keys = [];
        for (key in this.levels) {
          keys.push(key);
        }
        this._log('ERROR', 'Level must be one of: ' + keys.join(', '));
        return;
      }
      return this.level = level;
    };

    Logger.prototype.log = function(level, msg) {
      level = level.toUpperCase();
      if ((this.levels[level] != null) && this.levels[level] >= this.levels[this.level]) {
        return this._log(level, msg);
      }
    };

    Logger.prototype._log = function(level, msg) {
      var origLine;
      level = level.toUpperCase();
      origLine = this.originalLine();
      if (origLine[0] != null) {
        msg = '[' + origLine[0] + ':' + origLine[1] + '] ' + msg;
      }
      msg = '[' + level + '] ' + msg;
      msg = '[' + this.name + '] ' + msg;
      switch (level) {
        case 'DEBUG':
          return console.log(msg);
        case 'INFO':
          return console.log(msg);
        case 'WARN':
          return console.warn(msg);
        case 'ERROR':
          return console.error(msg);
      }
    };

    Logger.prototype.originalLine = function() {
      var e, file, first, i, len, line, m, ref, s;
      e = new Error('dummy');
      file = null;
      line = null;
      first = true;
      ref = e.stack.split('\n');
      for (i = 0, len = ref.length; i < len; i++) {
        s = ref[i];
        if (!first) {
          if (s.indexOf('at Logger.') === -1) {
            m = s.match(/\(?.+[\/\\]([^:]+):(\d+):\d+\)?$/);
            if (m != null) {
              file = m[1];
              line = m[2];
              break;
            }
          }
        }
        first = false;
      }
      return [file, line];
    };

    Logger.prototype.debug = function(msg) {
      return this.log('DEBUG', msg);
    };

    Logger.prototype.info = function(msg) {
      return this.log('INFO', msg);
    };

    Logger.prototype.warn = function(msg) {
      return this.log('WARN', msg);
    };

    Logger.prototype.error = function(msg) {
      return this.log('ERROR', msg);
    };

    return Logger;

  })();

  module.exports = Logger;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy91Y2hpaGEvLmF0b20vcGFja2FnZXMvd2FrYXRpbWUvbGliL2xvZ2dlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFNO0lBRVMsZ0JBQUMsSUFBRDtNQUNYLElBQUMsQ0FBQSxNQUFELEdBQ0U7UUFBQSxPQUFBLEVBQVMsRUFBVDtRQUNBLE1BQUEsRUFBUSxFQURSO1FBRUEsTUFBQSxFQUFRLEVBRlI7UUFHQSxPQUFBLEVBQVMsRUFIVDs7TUFJRixJQUFDLENBQUEsSUFBRCxHQUFRO01BQ1IsSUFBQyxDQUFBLEtBQUQsR0FBUztJQVBFOztxQkFTYixRQUFBLEdBQVUsU0FBQyxLQUFEO0FBQ1IsVUFBQTtBQUFBO1FBQ0UsS0FBQSxHQUFRLEtBQUssQ0FBQyxXQUFOLENBQUEsRUFEVjtPQUFBO01BRUEsSUFBTywwQkFBUDtRQUNFLElBQUEsR0FBTztBQUNQLGFBQUEsa0JBQUE7VUFDRSxJQUFJLENBQUMsSUFBTCxDQUFVLEdBQVY7QUFERjtRQUVBLElBQUMsQ0FBQSxJQUFELENBQU0sT0FBTixFQUFlLHdCQUFBLEdBQTJCLElBQUksQ0FBQyxJQUFMLENBQVUsSUFBVixDQUExQztBQUNBLGVBTEY7O2FBTUEsSUFBQyxDQUFBLEtBQUQsR0FBUztJQVREOztxQkFXVixHQUFBLEdBQUssU0FBQyxLQUFELEVBQVEsR0FBUjtNQUNILEtBQUEsR0FBUSxLQUFLLENBQUMsV0FBTixDQUFBO01BQ1IsSUFBRyw0QkFBQSxJQUFvQixJQUFDLENBQUEsTUFBTyxDQUFBLEtBQUEsQ0FBUixJQUFrQixJQUFDLENBQUEsTUFBTyxDQUFBLElBQUMsQ0FBQSxLQUFELENBQWpEO2VBQ0UsSUFBQyxDQUFBLElBQUQsQ0FBTSxLQUFOLEVBQWEsR0FBYixFQURGOztJQUZHOztxQkFLTCxJQUFBLEdBQU0sU0FBQyxLQUFELEVBQVEsR0FBUjtBQUNKLFVBQUE7TUFBQSxLQUFBLEdBQVEsS0FBSyxDQUFDLFdBQU4sQ0FBQTtNQUNSLFFBQUEsR0FBVyxJQUFDLENBQUEsWUFBRCxDQUFBO01BQ1gsSUFBRyxtQkFBSDtRQUNFLEdBQUEsR0FBTSxHQUFBLEdBQU0sUUFBUyxDQUFBLENBQUEsQ0FBZixHQUFvQixHQUFwQixHQUEwQixRQUFTLENBQUEsQ0FBQSxDQUFuQyxHQUF3QyxJQUF4QyxHQUErQyxJQUR2RDs7TUFFQSxHQUFBLEdBQU0sR0FBQSxHQUFNLEtBQU4sR0FBYyxJQUFkLEdBQXFCO01BQzNCLEdBQUEsR0FBTSxHQUFBLEdBQU0sSUFBQyxDQUFBLElBQVAsR0FBYyxJQUFkLEdBQXFCO0FBQzNCLGNBQU8sS0FBUDtBQUFBLGFBQ08sT0FEUDtpQkFDb0IsT0FBTyxDQUFDLEdBQVIsQ0FBWSxHQUFaO0FBRHBCLGFBRU8sTUFGUDtpQkFFbUIsT0FBTyxDQUFDLEdBQVIsQ0FBWSxHQUFaO0FBRm5CLGFBR08sTUFIUDtpQkFHbUIsT0FBTyxDQUFDLElBQVIsQ0FBYSxHQUFiO0FBSG5CLGFBSU8sT0FKUDtpQkFJb0IsT0FBTyxDQUFDLEtBQVIsQ0FBYyxHQUFkO0FBSnBCO0lBUEk7O3FCQWFOLFlBQUEsR0FBYyxTQUFBO0FBQ1osVUFBQTtNQUFBLENBQUEsR0FBUSxJQUFBLEtBQUEsQ0FBTSxPQUFOO01BQ1IsSUFBQSxHQUFPO01BQ1AsSUFBQSxHQUFPO01BQ1AsS0FBQSxHQUFRO0FBQ1I7QUFBQSxXQUFBLHFDQUFBOztRQUNFLElBQUcsQ0FBSSxLQUFQO1VBQ0UsSUFBRyxDQUFDLENBQUMsT0FBRixDQUFVLFlBQVYsQ0FBQSxLQUEyQixDQUFDLENBQS9CO1lBQ0UsQ0FBQSxHQUFJLENBQUMsQ0FBQyxLQUFGLENBQVEsa0NBQVI7WUFDSixJQUFHLFNBQUg7Y0FDRSxJQUFBLEdBQU8sQ0FBRSxDQUFBLENBQUE7Y0FDVCxJQUFBLEdBQU8sQ0FBRSxDQUFBLENBQUE7QUFDVCxvQkFIRjthQUZGO1dBREY7O1FBT0EsS0FBQSxHQUFRO0FBUlY7QUFTQSxhQUFPLENBQUMsSUFBRCxFQUFPLElBQVA7SUFkSzs7cUJBZ0JkLEtBQUEsR0FBTyxTQUFDLEdBQUQ7YUFDTCxJQUFDLENBQUEsR0FBRCxDQUFLLE9BQUwsRUFBYyxHQUFkO0lBREs7O3FCQUdQLElBQUEsR0FBTSxTQUFDLEdBQUQ7YUFDSixJQUFDLENBQUEsR0FBRCxDQUFLLE1BQUwsRUFBYSxHQUFiO0lBREk7O3FCQUdOLElBQUEsR0FBTSxTQUFDLEdBQUQ7YUFDSixJQUFDLENBQUEsR0FBRCxDQUFLLE1BQUwsRUFBYSxHQUFiO0lBREk7O3FCQUdOLEtBQUEsR0FBTyxTQUFDLEdBQUQ7YUFDTCxJQUFDLENBQUEsR0FBRCxDQUFLLE9BQUwsRUFBYyxHQUFkO0lBREs7Ozs7OztFQUdULE1BQU0sQ0FBQyxPQUFQLEdBQWlCO0FBcEVqQiIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIExvZ2dlclxuXG4gIGNvbnN0cnVjdG9yOiAobmFtZSkgLT5cbiAgICBAbGV2ZWxzID1cbiAgICAgICdFUlJPUic6IDQwXG4gICAgICAnV0FSTic6IDMwXG4gICAgICAnSU5GTyc6IDIwXG4gICAgICAnREVCVUcnOiAxMFxuICAgIEBuYW1lID0gbmFtZVxuICAgIEBsZXZlbCA9ICdJTkZPJ1xuXG4gIHNldExldmVsOiAobGV2ZWwpIC0+XG4gICAgdHJ5XG4gICAgICBsZXZlbCA9IGxldmVsLnRvVXBwZXJDYXNlKClcbiAgICBpZiBub3QgQGxldmVsc1tsZXZlbF0/XG4gICAgICBrZXlzID0gW11cbiAgICAgIGZvciBrZXkgb2YgQGxldmVsc1xuICAgICAgICBrZXlzLnB1c2gga2V5XG4gICAgICBAX2xvZyAnRVJST1InLCAnTGV2ZWwgbXVzdCBiZSBvbmUgb2Y6ICcgKyBrZXlzLmpvaW4oJywgJylcbiAgICAgIHJldHVyblxuICAgIEBsZXZlbCA9IGxldmVsXG5cbiAgbG9nOiAobGV2ZWwsIG1zZykgLT5cbiAgICBsZXZlbCA9IGxldmVsLnRvVXBwZXJDYXNlKClcbiAgICBpZiBAbGV2ZWxzW2xldmVsXT8gYW5kIEBsZXZlbHNbbGV2ZWxdID49IEBsZXZlbHNbQGxldmVsXVxuICAgICAgQF9sb2cgbGV2ZWwsIG1zZ1xuXG4gIF9sb2c6IChsZXZlbCwgbXNnKSAtPlxuICAgIGxldmVsID0gbGV2ZWwudG9VcHBlckNhc2UoKVxuICAgIG9yaWdMaW5lID0gQG9yaWdpbmFsTGluZSgpXG4gICAgaWYgb3JpZ0xpbmVbMF0/XG4gICAgICBtc2cgPSAnWycgKyBvcmlnTGluZVswXSArICc6JyArIG9yaWdMaW5lWzFdICsgJ10gJyArIG1zZ1xuICAgIG1zZyA9ICdbJyArIGxldmVsICsgJ10gJyArIG1zZ1xuICAgIG1zZyA9ICdbJyArIEBuYW1lICsgJ10gJyArIG1zZ1xuICAgIHN3aXRjaCBsZXZlbFxuICAgICAgd2hlbiAnREVCVUcnIHRoZW4gY29uc29sZS5sb2cgbXNnXG4gICAgICB3aGVuICdJTkZPJyB0aGVuIGNvbnNvbGUubG9nIG1zZ1xuICAgICAgd2hlbiAnV0FSTicgdGhlbiBjb25zb2xlLndhcm4gbXNnXG4gICAgICB3aGVuICdFUlJPUicgdGhlbiBjb25zb2xlLmVycm9yIG1zZ1xuXG4gIG9yaWdpbmFsTGluZTogKCkgLT5cbiAgICBlID0gbmV3IEVycm9yKCdkdW1teScpXG4gICAgZmlsZSA9IG51bGxcbiAgICBsaW5lID0gbnVsbFxuICAgIGZpcnN0ID0gdHJ1ZVxuICAgIGZvciBzIGluIGUuc3RhY2suc3BsaXQoJ1xcbicpXG4gICAgICBpZiBub3QgZmlyc3RcbiAgICAgICAgaWYgcy5pbmRleE9mKCdhdCBMb2dnZXIuJykgPT0gLTFcbiAgICAgICAgICBtID0gcy5tYXRjaCAvXFwoPy4rW1xcL1xcXFxdKFteOl0rKTooXFxkKyk6XFxkK1xcKT8kL1xuICAgICAgICAgIGlmIG0/XG4gICAgICAgICAgICBmaWxlID0gbVsxXVxuICAgICAgICAgICAgbGluZSA9IG1bMl1cbiAgICAgICAgICAgIGJyZWFrXG4gICAgICBmaXJzdCA9IGZhbHNlXG4gICAgcmV0dXJuIFtmaWxlLCBsaW5lXVxuXG4gIGRlYnVnOiAobXNnKSAtPlxuICAgIEBsb2cgJ0RFQlVHJywgbXNnXG5cbiAgaW5mbzogKG1zZykgLT5cbiAgICBAbG9nICdJTkZPJywgbXNnXG5cbiAgd2FybjogKG1zZykgLT5cbiAgICBAbG9nICdXQVJOJywgbXNnXG5cbiAgZXJyb3I6IChtc2cpIC0+XG4gICAgQGxvZyAnRVJST1InLCBtc2dcblxubW9kdWxlLmV4cG9ydHMgPSBMb2dnZXJcbiJdfQ==
