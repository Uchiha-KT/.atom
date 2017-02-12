
/*
  == ATOM-TERMINAL-PANEL  FILE-MANIP PLUGIN ==

  Atom-terminal-panel builtin plugin v1.0.0
  -isis97

  Contains commands for file system manipulation.

  MIT License
  Feel free to do anything with this file.
 */

(function() {
  module.exports = {
    "@": {
      "description": "Access native environment variables.",
      "command": function(state, args) {
        return state.parseTemplate("%(env." + args[0] + ")");
      }
    },
    "cp": {
      "params": "[file]... [destination]",
      "description": "Copies one/or more files to the specified directory (e.g cp ./test.js ./test/)",
      "command": function(state, args) {
        var e, srcs, tgt;
        srcs = args.slice(0, -1);
        tgt = args.slice(-1);
        try {
          return (state.util.cp(srcs, tgt)) + ' files copied.';
        } catch (error) {
          e = error;
          return state.consoleAlert('Failed to copy the given entries ' + e);
        }
      }
    },
    "mkdir": {
      "params": "[name]...",
      "description": "Create one/or more directories.",
      "params": "[FOLDER NAME]",
      "command": function(state, args) {
        var e;
        try {
          return state.util.mkdir(args);
        } catch (error) {
          e = error;
          return state.consoleAlert('Failed to create directory ' + e);
        }
      }
    },
    "rmdir": {
      "params": "[directory]...",
      "description": "Remove one/or more directories.",
      "command": function(state, args) {
        var e;
        try {
          return state.util.rmdir(args);
        } catch (error) {
          e = error;
          return state.consoleAlert('Failed to remove directory ' + e);
        }
      }
    },
    "rename": {
      "params": "[name] [new name]",
      "description": "Rename the given file/directory.",
      "command": function(state, args) {
        var e;
        try {
          return state.util.rename(args[0], args[1]);
        } catch (error) {
          e = error;
          return state.consoleAlert('Failed to rename file /or directory ' + e);
        }
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy91Y2hpaGEvLmF0b20vcGFja2FnZXMvYXRvbS10ZXJtaW5hbC1wYW5lbC9jb21tYW5kcy9maWxlLW1hbmlwL2luZGV4LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7Ozs7OztBQUFBO0VBV0EsTUFBTSxDQUFDLE9BQVAsR0FDRTtJQUFBLEdBQUEsRUFDRTtNQUFBLGFBQUEsRUFBZSxzQ0FBZjtNQUNBLFNBQUEsRUFBVyxTQUFDLEtBQUQsRUFBUSxJQUFSO0FBQ1QsZUFBTyxLQUFLLENBQUMsYUFBTixDQUFvQixRQUFBLEdBQVMsSUFBSyxDQUFBLENBQUEsQ0FBZCxHQUFpQixHQUFyQztNQURFLENBRFg7S0FERjtJQUtBLElBQUEsRUFDRTtNQUFBLFFBQUEsRUFBVSx5QkFBVjtNQUNBLGFBQUEsRUFBZSxnRkFEZjtNQUVBLFNBQUEsRUFBVyxTQUFDLEtBQUQsRUFBUSxJQUFSO0FBQ1QsWUFBQTtRQUFBLElBQUEsR0FBTyxJQUFLO1FBQ1osR0FBQSxHQUFNLElBQUs7QUFDWDtBQUNFLGlCQUFPLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFYLENBQWMsSUFBZCxFQUFvQixHQUFwQixDQUFELENBQUEsR0FBNEIsaUJBRHJDO1NBQUEsYUFBQTtVQUVNO2lCQUNKLEtBQUssQ0FBQyxZQUFOLENBQW1CLG1DQUFBLEdBQW9DLENBQXZELEVBSEY7O01BSFMsQ0FGWDtLQU5GO0lBZ0JBLE9BQUEsRUFDRTtNQUFBLFFBQUEsRUFBVSxXQUFWO01BQ0EsYUFBQSxFQUFlLGlDQURmO01BRUEsUUFBQSxFQUFVLGVBRlY7TUFHQSxTQUFBLEVBQVcsU0FBQyxLQUFELEVBQVEsSUFBUjtBQUNULFlBQUE7QUFBQTtBQUNFLGlCQUFPLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBWCxDQUFpQixJQUFqQixFQURUO1NBQUEsYUFBQTtVQUVNO2lCQUNKLEtBQUssQ0FBQyxZQUFOLENBQW1CLDZCQUFBLEdBQThCLENBQWpELEVBSEY7O01BRFMsQ0FIWDtLQWpCRjtJQTBCQSxPQUFBLEVBQ0U7TUFBQSxRQUFBLEVBQVUsZ0JBQVY7TUFDQSxhQUFBLEVBQWUsaUNBRGY7TUFFQSxTQUFBLEVBQVcsU0FBQyxLQUFELEVBQVEsSUFBUjtBQUNULFlBQUE7QUFBQTtBQUNFLGlCQUFPLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBWCxDQUFpQixJQUFqQixFQURUO1NBQUEsYUFBQTtVQUVNO2lCQUNKLEtBQUssQ0FBQyxZQUFOLENBQW1CLDZCQUFBLEdBQThCLENBQWpELEVBSEY7O01BRFMsQ0FGWDtLQTNCRjtJQW1DQSxRQUFBLEVBQ0U7TUFBQSxRQUFBLEVBQVUsbUJBQVY7TUFDQSxhQUFBLEVBQWUsa0NBRGY7TUFFQSxTQUFBLEVBQVcsU0FBQyxLQUFELEVBQVEsSUFBUjtBQUNULFlBQUE7QUFBQTtBQUNFLGlCQUFPLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBWCxDQUFrQixJQUFLLENBQUEsQ0FBQSxDQUF2QixFQUEyQixJQUFLLENBQUEsQ0FBQSxDQUFoQyxFQURUO1NBQUEsYUFBQTtVQUVNO2lCQUNKLEtBQUssQ0FBQyxZQUFOLENBQW1CLHNDQUFBLEdBQXVDLENBQTFELEVBSEY7O01BRFMsQ0FGWDtLQXBDRjs7QUFaRiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuICA9PSBBVE9NLVRFUk1JTkFMLVBBTkVMICBGSUxFLU1BTklQIFBMVUdJTiA9PVxuXG4gIEF0b20tdGVybWluYWwtcGFuZWwgYnVpbHRpbiBwbHVnaW4gdjEuMC4wXG4gIC1pc2lzOTdcblxuICBDb250YWlucyBjb21tYW5kcyBmb3IgZmlsZSBzeXN0ZW0gbWFuaXB1bGF0aW9uLlxuXG4gIE1JVCBMaWNlbnNlXG4gIEZlZWwgZnJlZSB0byBkbyBhbnl0aGluZyB3aXRoIHRoaXMgZmlsZS5cbiMjI1xubW9kdWxlLmV4cG9ydHMgPVxuICBcIkBcIjpcbiAgICBcImRlc2NyaXB0aW9uXCI6IFwiQWNjZXNzIG5hdGl2ZSBlbnZpcm9ubWVudCB2YXJpYWJsZXMuXCJcbiAgICBcImNvbW1hbmRcIjogKHN0YXRlLCBhcmdzKS0+XG4gICAgICByZXR1cm4gc3RhdGUucGFyc2VUZW1wbGF0ZSBcIiUoZW52LlwiK2FyZ3NbMF0rXCIpXCJcblxuICBcImNwXCI6XG4gICAgXCJwYXJhbXNcIjogXCJbZmlsZV0uLi4gW2Rlc3RpbmF0aW9uXVwiXG4gICAgXCJkZXNjcmlwdGlvblwiOiBcIkNvcGllcyBvbmUvb3IgbW9yZSBmaWxlcyB0byB0aGUgc3BlY2lmaWVkIGRpcmVjdG9yeSAoZS5nIGNwIC4vdGVzdC5qcyAuL3Rlc3QvKVwiXG4gICAgXCJjb21tYW5kXCI6IChzdGF0ZSwgYXJncyktPlxuICAgICAgc3JjcyA9IGFyZ3NbLi4tMl1cbiAgICAgIHRndCA9IGFyZ3NbLTEuLl1cbiAgICAgIHRyeVxuICAgICAgICByZXR1cm4gKHN0YXRlLnV0aWwuY3Agc3JjcywgdGd0KSArICcgZmlsZXMgY29waWVkLidcbiAgICAgIGNhdGNoIGVcbiAgICAgICAgc3RhdGUuY29uc29sZUFsZXJ0ICdGYWlsZWQgdG8gY29weSB0aGUgZ2l2ZW4gZW50cmllcyAnK2VcblxuICBcIm1rZGlyXCI6XG4gICAgXCJwYXJhbXNcIjogXCJbbmFtZV0uLi5cIlxuICAgIFwiZGVzY3JpcHRpb25cIjogXCJDcmVhdGUgb25lL29yIG1vcmUgZGlyZWN0b3JpZXMuXCJcbiAgICBcInBhcmFtc1wiOiBcIltGT0xERVIgTkFNRV1cIlxuICAgIFwiY29tbWFuZFwiOiAoc3RhdGUsIGFyZ3MpIC0+XG4gICAgICB0cnlcbiAgICAgICAgcmV0dXJuIHN0YXRlLnV0aWwubWtkaXIgYXJnc1xuICAgICAgY2F0Y2ggZVxuICAgICAgICBzdGF0ZS5jb25zb2xlQWxlcnQgJ0ZhaWxlZCB0byBjcmVhdGUgZGlyZWN0b3J5ICcrZVxuXG4gIFwicm1kaXJcIjpcbiAgICBcInBhcmFtc1wiOiBcIltkaXJlY3RvcnldLi4uXCJcbiAgICBcImRlc2NyaXB0aW9uXCI6IFwiUmVtb3ZlIG9uZS9vciBtb3JlIGRpcmVjdG9yaWVzLlwiXG4gICAgXCJjb21tYW5kXCI6IChzdGF0ZSwgYXJncykgLT5cbiAgICAgIHRyeVxuICAgICAgICByZXR1cm4gc3RhdGUudXRpbC5ybWRpciBhcmdzXG4gICAgICBjYXRjaCBlXG4gICAgICAgIHN0YXRlLmNvbnNvbGVBbGVydCAnRmFpbGVkIHRvIHJlbW92ZSBkaXJlY3RvcnkgJytlXG5cbiAgXCJyZW5hbWVcIjpcbiAgICBcInBhcmFtc1wiOiBcIltuYW1lXSBbbmV3IG5hbWVdXCJcbiAgICBcImRlc2NyaXB0aW9uXCI6IFwiUmVuYW1lIHRoZSBnaXZlbiBmaWxlL2RpcmVjdG9yeS5cIlxuICAgIFwiY29tbWFuZFwiOiAoc3RhdGUsIGFyZ3MpIC0+XG4gICAgICB0cnlcbiAgICAgICAgcmV0dXJuIHN0YXRlLnV0aWwucmVuYW1lIGFyZ3NbMF0sIGFyZ3NbMV1cbiAgICAgIGNhdGNoIGVcbiAgICAgICAgc3RhdGUuY29uc29sZUFsZXJ0ICdGYWlsZWQgdG8gcmVuYW1lIGZpbGUgL29yIGRpcmVjdG9yeSAnK2VcbiJdfQ==
