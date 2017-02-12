(function() {
  var os, vm;

  vm = require('vm');

  os = require('os');


  /*
    == ATOM-TERMINAL-PANEL  UTILS PLUGIN ==
  
    Atom-terminal-panel builtin plugin v1.0.0
    -isis97
  
    Contains commands for easier console usage.
  
    MIT License
    Feel free to do anything with this file.
   */

  module.exports = {
    "tmpdir": {
      "description": "Describes current machine.",
      "variable": function(state) {
        return os.tmpdir();
      }
    },
    "whoami": {
      "description": "Describes the current machine.",
      "variable": function(state) {
        return os.hostname() + ' [' + os.platform() + ' ; ' + os.type() + ' ' + os.release() + ' (' + os.arch() + ' x' + os.cpus().length + ')' + '] ' + (process.env.USERNAME || process.env.LOGNAME || process.env.USER);
      }
    },
    "os.hostname": {
      "description": "Returns the hostname of the operating system.",
      "variable": function(state) {
        return os.hostname();
      }
    },
    "os.type": {
      "description": "Returns the operating system name.",
      "variable": function(state) {
        return os.type();
      }
    },
    "os.platform": {
      "description": "Returns the operating system platform.",
      "variable": function(state) {
        return os.platform();
      }
    },
    "os.arch": {
      "description": 'Returns the operating system CPU architecture. Possible values are "x64", "arm" and "ia32".',
      "variable": function(state) {
        return os.arch();
      }
    },
    "os.release": {
      "description": "Returns the operating system release.",
      "variable": function(state) {
        return os.release();
      }
    },
    "os.uptime": {
      "description": "Returns the system uptime in seconds.",
      "variable": function(state) {
        return os.uptime();
      }
    },
    "os.totalmem": {
      "description": "Returns the total amount of system memory in bytes.",
      "variable": function(state) {
        return os.totalmem();
      }
    },
    "os.freemem": {
      "description": "Returns the amount of free system memory in bytes.",
      "variable": function(state) {
        return os.freemem();
      }
    },
    "os.cpus": {
      "description": "Returns the node.js JSON-format information about CPUs characteristics.",
      "variable": function(state) {
        return JSON.stringify(os.cpus());
      }
    },
    "terminal": {
      "description": "Shows the native terminal in the current location.",
      "command": function(state, args) {
        var o;
        o = state.util.os();
        if (o.windows) {
          return state.exec('start cmd.exe', args, state);
        } else {
          return state.message('%(label:error:Error) The "terminal" command is currently not supported on platforms other than windows.');
        }
      }
    },
    "settings": {
      "description": "Shows the ATOM settings.",
      "command": function(state, args) {
        return state.exec('application:show-settings', args, state);
      }
    },
    "eval": {
      "description": "Evaluates any javascript code.",
      "params": "[CODE]",
      "command": function(state, args) {
        vm.runInThisContext(args[0]);
        return null;
      }
    },
    "web": {
      "description": "Shows any web page.",
      "params": "[ADDRESS]",
      "command": function(state, args) {
        var address;
        address = args.join(' ');
        state.message("<iframe style='height:3000%;width:90%;' src='http://www." + address + "'></iframe>");
        return null;
      }
    },
    "web-atom": {
      "description": "Shows any web page.",
      "params": "[ADDRESS]",
      "command": function(state, args) {
        var query;
        query = args.join(' ');
        state.message("<iframe style='height:3000%;width:90%;' src='https://atom.io/packages/search?q=" + query + "'></iframe>");
        return null;
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy91Y2hpaGEvLmF0b20vcGFja2FnZXMvYXRvbS10ZXJtaW5hbC1wYW5lbC9jb21tYW5kcy91dGlscy9pbmRleC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUjs7RUFDTCxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVI7OztBQUVMOzs7Ozs7Ozs7Ozs7RUFXQSxNQUFNLENBQUMsT0FBUCxHQUNFO0lBQUEsUUFBQSxFQUNFO01BQUEsYUFBQSxFQUFlLDRCQUFmO01BQ0EsVUFBQSxFQUFZLFNBQUMsS0FBRDtlQUFXLEVBQUUsQ0FBQyxNQUFILENBQUE7TUFBWCxDQURaO0tBREY7SUFHQSxRQUFBLEVBQ0U7TUFBQSxhQUFBLEVBQWUsZ0NBQWY7TUFDQSxVQUFBLEVBQVksU0FBQyxLQUFEO2VBQVcsRUFBRSxDQUFDLFFBQUgsQ0FBQSxDQUFBLEdBQWdCLElBQWhCLEdBQXVCLEVBQUUsQ0FBQyxRQUFILENBQUEsQ0FBdkIsR0FBdUMsS0FBdkMsR0FBK0MsRUFBRSxDQUFDLElBQUgsQ0FBQSxDQUEvQyxHQUEyRCxHQUEzRCxHQUFpRSxFQUFFLENBQUMsT0FBSCxDQUFBLENBQWpFLEdBQWdGLElBQWhGLEdBQXVGLEVBQUUsQ0FBQyxJQUFILENBQUEsQ0FBdkYsR0FBbUcsSUFBbkcsR0FBMEcsRUFBRSxDQUFDLElBQUgsQ0FBQSxDQUFTLENBQUMsTUFBcEgsR0FBNkgsR0FBN0gsR0FBbUksSUFBbkksR0FBMEksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVosSUFBd0IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFwQyxJQUErQyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQTVEO01BQXJKLENBRFo7S0FKRjtJQU1BLGFBQUEsRUFDRTtNQUFBLGFBQUEsRUFBZSwrQ0FBZjtNQUNBLFVBQUEsRUFBWSxTQUFD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QTtRQUFBLEtBQUEsR0FBUSxJQUFJLENBQUMsSUFBTCxDQUFVLEdBQVY7UUFDUixLQUFLLENBQUMsT0FBTixDQUFjLGlGQUFBLEdBQWtGLEtBQWxGLEdBQXdGLGFBQXRHO0FBQ0EsZUFBTztNQUhFLENBRlg7S0E1REY7O0FBZkYiLCJzb3VyY2VzQ29udGVudCI6WyJ2bSA9IHJlcXVpcmUgJ3ZtJ1xub3MgPSByZXF1aXJlICdvcydcblxuIyMjXG4gID09IEFUT00tVEVSTUlOQUwtUEFORUwgIFVUSUxTIFBMVUdJTiA9PVxuXG4gIEF0b20tdGVybWluYWwtcGFuZWwgYnVpbHRpbiBwbHVnaW4gdjEuMC4wXG4gIC1pc2lzOTdcblxuICBDb250YWlucyBjb21tYW5kcyBmb3IgZWFzaWVyIGNvbnNvbGUgdXNhZ2UuXG5cbiAgTUlUIExpY2Vuc2VcbiAgRmVlbCBmcmVlIHRvIGRvIGFueXRoaW5nIHdpdGggdGhpcyBmaWxlLlxuIyMjXG5tb2R1bGUuZXhwb3J0cyA9XG4gIFwidG1wZGlyXCI6XG4gICAgXCJkZXNjcmlwdGlvblwiOiBcIkRlc2NyaWJlcyBjdXJyZW50IG1hY2hpbmUuXCJcbiAgICBcInZhcmlhYmxlXCI6IChzdGF0ZSkgLT4gb3MudG1wZGlyKClcbiAgXCJ3aG9hbWlcIjpcbiAgICBcImRlc2NyaXB0aW9uXCI6IFwiRGVzY3JpYmVzIHRoZSBjdXJyZW50IG1hY2hpbmUuXCJcbiAgICBcInZhcmlhYmxlXCI6IChzdGF0ZSkgLT4gb3MuaG9zdG5hbWUoKSArICcgWycgKyBvcy5wbGF0Zm9ybSgpICsgJyA7ICcgKyBvcy50eXBlKCkgKyAnICcgKyBvcy5yZWxlYXNlKCkgKyAnICgnICsgb3MuYXJjaCgpICsgJyB4JyArIG9zLmNwdXMoKS5sZW5ndGggKyAnKScgKyAnXSAnICsgKHByb2Nlc3MuZW52LlVTRVJOQU1FIG9yIHByb2Nlc3MuZW52LkxPR05BTUUgb3IgcHJvY2Vzcy5lbnYuVVNFUilcbiAgXCJvcy5ob3N0bmFtZVwiOlxuICAgIFwiZGVzY3JpcHRpb25cIjogXCJSZXR1cm5zIHRoZSBob3N0bmFtZSBvZiB0aGUgb3BlcmF0aW5nIHN5c3RlbS5cIlxuICAgIFwidmFyaWFibGVcIjogKHN0YXRlKSAtPiBvcy5ob3N0bmFtZSgpXG4gIFwib3MudHlwZVwiOlxuICAgIFwiZGVzY3JpcHRpb25cIjogXCJSZXR1cm5zIHRoZSBvcGVyYXRpbmcgc3lzdGVtIG5hbWUuXCJcbiAgICBcInZhcmlhYmxlXCI6IChzdGF0ZSkgLT4gb3MudHlwZSgpXG4gIFwib3MucGxhdGZvcm1cIjpcbiAgICBcImRlc2NyaXB0aW9uXCI6IFwiUmV0dXJucyB0aGUgb3BlcmF0aW5nIHN5c3RlbSBwbGF0Zm9ybS5cIlxuICAgIFwidmFyaWFibGVcIjogKHN0YXRlKSAtPiBvcy5wbGF0Zm9ybSgpXG4gIFwib3MuYXJjaFwiOlxuICAgIFwiZGVzY3JpcHRpb25cIjogJ1JldHVybnMgdGhlIG9wZXJhdGluZyBzeXN0ZW0gQ1BVIGFyY2hpdGVjdHVyZS4gUG9zc2libGUgdmFsdWVzIGFyZSBcIng2NFwiLCBcImFybVwiIGFuZCBcImlhMzJcIi4nXG4gICAgXCJ2YXJpYWJsZVwiOiAoc3RhdGUpIC0+IG9zLmFyY2goKVxuICBcIm9zLnJlbGVhc2VcIjpcbiAgICBcImRlc2NyaXB0aW9uXCI6IFwiUmV0dXJucyB0aGUgb3BlcmF0aW5nIHN5c3RlbSByZWxlYXNlLlwiXG4gICAgXCJ2YXJpYWJsZVwiOiAoc3RhdGUpIC0+IG9zLnJlbGVhc2UoKVxuICBcIm9zLnVwdGltZVwiOlxuICAgIFwiZGVzY3JpcHRpb25cIjogXCJSZXR1cm5zIHRoZSBzeXN0ZW0gdXB0aW1lIGluIHNlY29uZHMuXCJcbiAgICBcInZhcmlhYmxlXCI6IChzdGF0ZSkgLT4gb3MudXB0aW1lKClcbiAgXCJvcy50b3RhbG1lbVwiOlxuICAgIFwiZGVzY3JpcHRpb25cIjogXCJSZXR1cm5zIHRoZSB0b3RhbCBhbW91bnQgb2Ygc3lzdGVtIG1lbW9yeSBpbiBieXRlcy5cIlxuICAgIFwidmFyaWFibGVcIjogKHN0YXRlKSAtPiBvcy50b3RhbG1lbSgpXG4gIFwib3MuZnJlZW1lbVwiOlxuICAgIFwiZGVzY3JpcHRpb25cIjogXCJSZXR1cm5zIHRoZSBhbW91bnQgb2YgZnJlZSBzeXN0ZW0gbWVtb3J5IGluIGJ5dGVzLlwiXG4gICAgXCJ2YXJpYWJsZVwiOiAoc3RhdGUpIC0+IG9zLmZyZWVtZW0oKVxuICBcIm9zLmNwdXNcIjpcbiAgICBcImRlc2NyaXB0aW9uXCI6IFwiUmV0dXJucyB0aGUgbm9kZS5qcyBKU09OLWZvcm1hdCBpbmZvcm1hdGlvbiBhYm91dCBDUFVzIGNoYXJhY3RlcmlzdGljcy5cIlxuICAgIFwidmFyaWFibGVcIjogKHN0YXRlKSAtPiBKU09OLnN0cmluZ2lmeShvcy5jcHVzKCkpXG4gIFwidGVybWluYWxcIjpcbiAgICBcImRlc2NyaXB0aW9uXCIgOiBcIlNob3dzIHRoZSBuYXRpdmUgdGVybWluYWwgaW4gdGhlIGN1cnJlbnQgbG9jYXRpb24uXCJcbiAgICBcImNvbW1hbmRcIjogKHN0YXRlLCBhcmdzKS0+XG4gICAgICBvID0gc3RhdGUudXRpbC5vcygpXG4gICAgICBpZiBvLndpbmRvd3NcbiAgICAgICAgc3RhdGUuZXhlYyAnc3RhcnQgY21kLmV4ZScsIGFyZ3MsIHN0YXRlXG4gICAgICBlbHNlXG4gICAgICAgIHN0YXRlLm1lc3NhZ2UgJyUobGFiZWw6ZXJyb3I6RXJyb3IpIFRoZSBcInRlcm1pbmFsXCIgY29tbWFuZCBpcyBjdXJyZW50bHkgbm90IHN1cHBvcnRlZCBvbiBwbGF0Zm9ybXMgb3RoZXIgdGhhbiB3aW5kb3dzLidcblxuICBcInNldHRpbmdzXCI6XG4gICAgXCJkZXNjcmlwdGlvblwiOiBcIlNob3dzIHRoZSBBVE9NIHNldHRpbmdzLlwiXG4gICAgXCJjb21tYW5kXCI6IChzdGF0ZSwgYXJncyktPlxuICAgICAgc3RhdGUuZXhlYyAnYXBwbGljYXRpb246c2hvdy1zZXR0aW5ncycsIGFyZ3MsIHN0YXRlXG4gIFwiZXZhbFwiOlxuICAgIFwiZGVzY3JpcHRpb25cIjogXCJFdmFsdWF0ZXMgYW55IGphdmFzY3JpcHQgY29kZS5cIlxuICAgIFwicGFyYW1zXCI6IFwiW0NPREVdXCJcbiAgICBcImNvbW1hbmRcIjogKHN0YXRlLCBhcmdzKS0+XG4gICAgICAodm0ucnVuSW5UaGlzQ29udGV4dCBhcmdzWzBdKVxuICAgICAgcmV0dXJuIG51bGxcbiAgXCJ3ZWJcIjpcbiAgICBcImRlc2NyaXB0aW9uXCI6IFwiU2hvd3MgYW55IHdlYiBwYWdlLlwiXG4gICAgXCJwYXJhbXNcIjogXCJbQUREUkVTU11cIlxuICAgIFwiY29tbWFuZFwiOiAoc3RhdGUsIGFyZ3MpLT5cbiAgICAgIGFkZHJlc3MgPSBhcmdzLmpvaW4oJyAnKVxuICAgICAgc3RhdGUubWVzc2FnZSBcIjxpZnJhbWUgc3R5bGU9J2hlaWdodDozMDAwJTt3aWR0aDo5MCU7JyBzcmM9J2h0dHA6Ly93d3cuI3thZGRyZXNzfSc+PC9pZnJhbWU+XCJcbiAgICAgIHJldHVybiBudWxsXG4gIFwid2ViLWF0b21cIjpcbiAgICBcImRlc2NyaXB0aW9uXCI6IFwiU2hvd3MgYW55IHdlYiBwYWdlLlwiXG4gICAgXCJwYXJhbXNcIjogXCJbQUREUkVTU11cIlxuICAgIFwiY29tbWFuZFwiOiAoc3RhdGUsIGFyZ3MpLT5cbiAgICAgIHF1ZXJ5ID0gYXJncy5qb2luKCcgJylcbiAgICAgIHN0YXRlLm1lc3NhZ2UgXCI8aWZyYW1lIHN0eWxlPSdoZWlnaHQ6MzAwMCU7d2lkdGg6OTAlOycgc3JjPSdodHRwczovL2F0b20uaW8vcGFja2FnZXMvc2VhcmNoP3E9I3txdWVyeX0nPjwvaWZyYW1lPlwiXG4gICAgICByZXR1cm4gbnVsbFxuIl19
