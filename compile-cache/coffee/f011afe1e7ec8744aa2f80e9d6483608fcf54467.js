
/*
  Atom-terminal-panel
  Copyright by isis97
  MIT licensed

  This file contains basic, simple utilities used by coffeescript files.
 */

(function() {
  var indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  if (typeof global === "undefined" || global === null) {
    throw "apt-utils: No global node.js namespace present.";
  }

  global.include = function(name) {
    var e, e2, r;
    if (window.cliUtilsIncludeLog == null) {
      window.cliUtilsIncludeLog = [];
    }
    if (name == null) {
      setTimeout((function(_this) {
        return function() {
          return atom.notifications.addError("atom-terminal-panel: Dependency error. Module with null-value name cannot be required.");
        };
      })(this), 500);
      return;
    }
    if ((name.indexOf('atp-')) === 0) {
      name = './' + name;
    }
    r = null;
    try {
      r = require(name);
    } catch (error) {
      e = error;
      if (indexOf.call(window.cliUtilsIncludeLog, name) >= 0) {
        return r;
      } else {
        window.cliUtilsIncludeLog.push(name);
      }
      try {
        setTimeout((function(_this) {
          return function() {
            return atom.notifications.addError("atom-terminal-panel: Dependency error. Module [" + name + "] cannot be required.");
          };
        })(this), 500);
      } catch (error) {
        e2 = error;
      }
      throw e;
      throw "Dependency error. Module [" + name + "] cannot be required.";
    }
    return r;
  };

  global.generateRandomID = function() {
    var chars, i, j, length, ref, result;
    length = 32;
    chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    result = '';
    for (i = j = ref = length; j > 1; i = j += -1) {
      result += chars[Math.round(Math.random() * (chars.length - 1))];
    }
    return result;
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy91Y2hpaGEvLmF0b20vcGFja2FnZXMvYXRvbS10ZXJtaW5hbC1wYW5lbC9saWIvYXRwLXV0aWxzLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7O0FBQUE7QUFBQSxNQUFBOztFQVFBLElBQU8sZ0RBQVA7QUFDRSxVQUFNLGtEQURSOzs7RUFHQSxNQUFNLENBQUMsT0FBUCxHQUFpQixTQUFDLElBQUQ7QUFDZixRQUFBO0lBQUEsSUFBTyxpQ0FBUDtNQUNFLE1BQU0sQ0FBQyxrQkFBUCxHQUE0QixHQUQ5Qjs7SUFFQSxJQUFPLFlBQVA7TUFDRSxVQUFBLENBQVcsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO2lCQUNULElBQUksQ0FBQyxhQUFhLENBQUMsUUFBbkIsQ0FBNEIsd0ZBQTVCO1FBRFM7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVgsRUFFRSxHQUZGO0FBR0EsYUFKRjs7SUFLQSxJQUFHLENBQUMsSUFBSSxDQUFDLE9BQUwsQ0FBYSxNQUFiLENBQUQsQ0FBQSxLQUF5QixDQUE1QjtNQUNFLElBQUEsR0FBTyxJQUFBLEdBQUssS0FEZDs7SUFHQSxDQUFBLEdBQUk7QUFDSjtNQUNFLENBQUEsR0FBSSxPQUFBLENBQVEsSUFBUixFQUROO0tBQUEsYUFBQTtNQUVNO01BQ0osSUFBRyxhQUFRLE1BQU0sQ0FBQyxrQkFBZixFQUFBLElBQUEsTUFBSDtBQUNFLGVBQU8sRUFEVDtPQUFBLE1BQUE7UUFHRSxNQUFNLENBQUMsa0JBQWtCLENBQUMsSUFBMUIsQ0FBK0IsSUFBL0IsRUFIRjs7QUFJQTtRQUNFLFVBQUEsQ0FBVyxDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFBO21CQUNULElBQUksQ0FBQyxhQUFhLENBQUMsUUFBbkIsQ0FBNEIsaURBQUEsR0FBa0QsSUFBbEQsR0FBdUQsdUJBQW5GO1VBRFM7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVgsRUFFRSxHQUZGLEVBREY7T0FBQSxhQUFBO1FBSU0sV0FKTjs7QUFLQSxZQUFNO0FBQ04sWUFBTSw0QkFBQSxHQUE2QixJQUE3QixHQUFrQyx3QkFiMUM7O0FBY0EsV0FBTztFQTFCUTs7RUE2QmpCLE1BQU0sQ0FBQyxnQkFBUCxHQUEwQixTQUFBO0FBQ3hCLFFBQUE7SUFBQSxNQUFBLEdBQVM7SUFDVCxLQUFBLEdBQVE7SUFDUixNQUFBLEdBQVM7QUFDVCxTQUFTLHdDQUFUO01BQ0UsTUFBQSxJQUFVLEtBQU0sQ0FBQSxJQUFJLENBQUMsS0FBTCxDQUFXLElBQUksQ0FBQyxNQUFMLENBQUEsQ0FBQSxHQUFnQixDQUFDLEtBQUssQ0FBQyxNQUFOLEdBQWUsQ0FBaEIsQ0FBM0IsQ0FBQTtBQURsQjtBQUVBLFdBQU87RUFOaUI7QUF4QzFCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4gIEF0b20tdGVybWluYWwtcGFuZWxcbiAgQ29weXJpZ2h0IGJ5IGlzaXM5N1xuICBNSVQgbGljZW5zZWRcblxuICBUaGlzIGZpbGUgY29udGFpbnMgYmFzaWMsIHNpbXBsZSB1dGlsaXRpZXMgdXNlZCBieSBjb2ZmZWVzY3JpcHQgZmlsZXMuXG4jIyNcblxuaWYgbm90IGdsb2JhbD9cbiAgdGhyb3cgXCJhcHQtdXRpbHM6IE5vIGdsb2JhbCBub2RlLmpzIG5hbWVzcGFjZSBwcmVzZW50LlwiXG5cbmdsb2JhbC5pbmNsdWRlID0gKG5hbWUpIC0+XG4gIGlmIG5vdCB3aW5kb3cuY2xpVXRpbHNJbmNsdWRlTG9nP1xuICAgIHdpbmRvdy5jbGlVdGlsc0luY2x1ZGVMb2cgPSBbXVxuICBpZiBub3QgbmFtZT9cbiAgICBzZXRUaW1lb3V0ICgpID0+XG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IgXCJhdG9tLXRlcm1pbmFsLXBhbmVsOiBEZXBlbmRlbmN5IGVycm9yLiBNb2R1bGUgd2l0aCBudWxsLXZhbHVlIG5hbWUgY2Fubm90IGJlIHJlcXVpcmVkLlwiXG4gICAgLCA1MDBcbiAgICByZXR1cm5cbiAgaWYgKG5hbWUuaW5kZXhPZiAnYXRwLScpID09IDBcbiAgICBuYW1lID0gJy4vJytuYW1lXG5cbiAgciA9IG51bGxcbiAgdHJ5XG4gICAgciA9IHJlcXVpcmUgbmFtZVxuICBjYXRjaCBlXG4gICAgaWYgbmFtZSBpbiB3aW5kb3cuY2xpVXRpbHNJbmNsdWRlTG9nXG4gICAgICByZXR1cm4gclxuICAgIGVsc2VcbiAgICAgIHdpbmRvdy5jbGlVdGlsc0luY2x1ZGVMb2cucHVzaCBuYW1lXG4gICAgdHJ5XG4gICAgICBzZXRUaW1lb3V0ICgpID0+XG4gICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvciBcImF0b20tdGVybWluYWwtcGFuZWw6IERlcGVuZGVuY3kgZXJyb3IuIE1vZHVsZSBbXCIrbmFtZStcIl0gY2Fubm90IGJlIHJlcXVpcmVkLlwiXG4gICAgICAsIDUwMFxuICAgIGNhdGNoIGUyXG4gICAgdGhyb3cgZVxuICAgIHRocm93IFwiRGVwZW5kZW5jeSBlcnJvci4gTW9kdWxlIFtcIituYW1lK1wiXSBjYW5ub3QgYmUgcmVxdWlyZWQuXCJcbiAgcmV0dXJuIHJcblxuXG5nbG9iYWwuZ2VuZXJhdGVSYW5kb21JRCA9ICgpIC0+XG4gIGxlbmd0aCA9IDMyXG4gIGNoYXJzID0gJzAxMjM0NTY3ODlhYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ekFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaJ1xuICByZXN1bHQgPSAnJ1xuICBmb3IgaSBpbiBbbGVuZ3RoLi4uMV0gYnkgLTFcbiAgICByZXN1bHQgKz0gY2hhcnNbTWF0aC5yb3VuZChNYXRoLnJhbmRvbSgpICogKGNoYXJzLmxlbmd0aCAtIDEpKV1cbiAgcmV0dXJuIHJlc3VsdFxuIl19
