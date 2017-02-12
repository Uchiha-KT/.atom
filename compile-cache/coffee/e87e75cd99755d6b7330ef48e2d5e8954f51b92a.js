
/*
WakaTime
Description: Analytics for programmers.
Maintainer:  WakaTime <support@wakatime.com>
License:     BSD, see LICENSE for more details.
Website:     https://wakatime.com/
 */

(function() {
  var AdmZip, Logger, StatusBarTileView, checkCLI, cliLocation, debug, downloadFile, endsWith, enoughTimePassed, execFile, extractCLI, fileIsIgnored, finishActivation, formatDate, fs, getLatestCliVersion, getUserHome, ini, installCLI, installPython, isCLIInstalled, isCLILatest, isPythonInstalled, isValidApiKey, lastFile, lastHeartbeat, log, os, packageVersion, path, pluginReady, pythonLocation, removeCLI, request, rimraf, saveApiKey, sendHeartbeat, settingChangedHandler, setupConfigs, setupEventHandlers, statusBarIcon, unzip;

  log = null;

  packageVersion = null;

  lastHeartbeat = 0;

  lastFile = '';

  statusBarIcon = null;

  pluginReady = false;

  AdmZip = require('adm-zip');

  fs = require('fs');

  os = require('os');

  path = require('path');

  execFile = require('child_process').execFile;

  request = require('request');

  rimraf = require('rimraf');

  ini = require('ini');

  StatusBarTileView = require('./status-bar-tile-view');

  Logger = require('./logger');

  module.exports = {
    activate: function(state) {
      log = new Logger('WakaTime');
      if (atom.config.get('wakatime.debug')) {
        log.setLevel('DEBUG');
      }
      packageVersion = atom.packages.getLoadedPackage('wakatime').metadata.version;
      log.debug('Initializing WakaTime v' + packageVersion + '...');
      setupConfigs();
      this.settingChangedObserver = atom.config.observe('wakatime', settingChangedHandler);
      return isPythonInstalled(function(installed) {
        if (!installed) {
          if (os.type() === 'Windows_NT') {
            return installPython(checkCLI);
          } else {
            return window.alert('Please install Python (https://www.python.org/downloads/) and restart Atom to enable the WakaTime plugin.');
          }
        } else {
          return checkCLI();
        }
      });
    },
    consumeStatusBar: function(statusBar) {
      statusBarIcon = new StatusBarTileView();
      statusBarIcon.init();
      this.statusBarTile = statusBar != null ? statusBar.addRightTile({
        item: statusBarIcon,
        priority: 300
      }) : void 0;
      if (atom.config.get('wakatime.showStatusBarIcon')) {
        statusBarIcon.show();
      } else {
        statusBarIcon.hide();
      }
      if (pluginReady) {
        statusBarIcon.setTitle('WakaTime ready');
        return statusBarIcon.setStatus();
      }
    },
    deactivate: function() {
      var ref, ref1;
      if ((ref = this.statusBarTile) != null) {
        ref.destroy();
      }
      if (statusBarIcon != null) {
        statusBarIcon.destroy();
      }
      return (ref1 = this.settingChangedObserver) != null ? ref1.dispose() : void 0;
    }
  };

  checkCLI = function() {
    var beenawhile, currentTime, hours, lastInit;
    if (!isCLIInstalled()) {
      return installCLI(function() {
        log.debug('Finished installing wakatime-cli.');
        return finishActivation();
      });
    } else {
      hours = 24;
      lastInit = atom.config.get('wakatime-hidden.lastInit');
      currentTime = Math.round((new Date).getTime() / 1000);
      beenawhile = parseInt(lastInit, 10) + 3600 * hours < currentTime;
      if ((lastInit == null) || beenawhile || atom.config.get('wakatime.debug')) {
        atom.config.set('wakatime-hidden.lastInit', currentTime);
        return isCLILatest(function(latest) {
          if (!latest) {
            return installCLI(function() {
              log.debug('Finished installing wakatime-cli.');
              return finishActivation();
            });
          } else {
            return finishActivation();
          }
        });
      } else {
        return finishActivation();
      }
    }
  };

  finishActivation = function() {
    pluginReady = true;
    setupEventHandlers();
    if (atom.config.get('wakatime.showStatusBarIcon')) {
      if (statusBarIcon != null) {
        statusBarIcon.show();
      }
    } else {
      if (statusBarIcon != null) {
        statusBarIcon.hide();
      }
    }
    if (statusBarIcon != null) {
      statusBarIcon.setTitle('WakaTime ready');
    }
    if (statusBarIcon != null) {
      statusBarIcon.setStatus();
    }
    return log.debug('Finished initializing WakaTime.');
  };

  settingChangedHandler = function(settings) {
    var apiKey;
    if (settings.showStatusBarIcon) {
      if (statusBarIcon != null) {
        statusBarIcon.show();
      }
    } else {
      if (statusBarIcon != null) {
        statusBarIcon.hide();
      }
    }
    if (atom.config.get('wakatime.debug')) {
      log.setLevel('DEBUG');
    } else {
      log.setLevel('INFO');
    }
    apiKey = settings.apikey;
    if (isValidApiKey(apiKey)) {
      atom.config.set('wakatime.apikey', '');
      atom.config.set('wakatime.apikey', 'Saved in your ~/.wakatime.cfg file');
      return saveApiKey(apiKey);
    }
  };

  saveApiKey = function(apiKey) {
    var configFile;
    configFile = path.join(getUserHome(), '.wakatime.cfg');
    return fs.readFile(configFile, 'utf-8', function(err, inp) {
      var base, base1, contents, currentKey, currentSection, found, j, len, line, parts, ref;
      if (err != null) {
        log.debug('Error: could not read wakatime config file');
      }
      if ((base = String.prototype).startsWith == null) {
        base.startsWith = function(s) {
          return this.slice(0, s.length) === s;
        };
      }
      if ((base1 = String.prototype).endsWith == null) {
        base1.endsWith = function(s) {
          return s === '' || this.slice(-s.length) === s;
        };
      }
      contents = [];
      currentSection = '';
      found = false;
      if (inp != null) {
        ref = inp.split('\n');
        for (j = 0, len = ref.length; j < len; j++) {
          line = ref[j];
          if (line.trim().startsWith('[') && line.trim().endsWith(']')) {
            if (currentSection === 'settings' && !found) {
              contents.push('api_key = ' + apiKey);
              found = true;
            }
            currentSection = line.trim().substring(1, line.trim().length - 1).toLowerCase();
            contents.push(line);
          } else if (currentSection === 'settings') {
            parts = line.split('=');
            currentKey = parts[0].trim();
            if (currentKey === 'api_key') {
              if (!found) {
                contents.push('api_key = ' + apiKey);
                found = true;
              }
            } else {
              contents.push(line);
            }
          } else {
            contents.push(line);
          }
        }
      }
      if (!found) {
        if (currentSection !== 'settings') {
          contents.push('[settings]');
        }
        contents.push('api_key = ' + apiKey);
      }
      return fs.writeFile(configFile, contents.join('\n'), {
        encoding: 'utf-8'
      }, function(err2) {
        var msg;
        if (err2 != null) {
          msg = 'Error: could not write to wakatime config file';
          log.error(msg);
          if (statusBarIcon != null) {
            statusBarIcon.setStatus('Error');
          }
          return statusBarIcon != null ? statusBarIcon.setTitle(msg) : void 0;
        }
      });
    });
  };

  getUserHome = function() {
    return process.env[process.platform === 'win32' ? 'USERPROFILE' : 'HOME'] || '';
  };

  setupConfigs = function() {
    var configFile;
    configFile = path.join(getUserHome(), '.wakatime.cfg');
    return fs.readFile(configFile, 'utf-8', function(err, configContent) {
      var commonConfigs;
      if (err != null) {
        log.debug('Error: could not read wakatime config file');
        settingChangedHandler(atom.config.get('wakatime'));
        return;
      }
      commonConfigs = ini.decode(configContent);
      if ((commonConfigs != null) && (commonConfigs.settings != null) && isValidApiKey(commonConfigs.settings.api_key)) {
        atom.config.set('wakatime.apikey', '');
        return atom.config.set('wakatime.apikey', 'Saved in your ~/.wakatime.cfg file');
      } else {
        return settingChangedHandler(atom.config.get('wakatime'));
      }
    });
  };

  isValidApiKey = function(key) {
    var re;
    if (key == null) {
      return false;
    }
    re = new RegExp('^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$', 'i');
    return re.test(key);
  };

  enoughTimePassed = function(time) {
    return lastHeartbeat + 120000 < time;
  };

  setupEventHandlers = function(callback) {
    return atom.workspace.observeTextEditors(function(editor) {
      var buffer;
      try {
        buffer = editor.getBuffer();
        buffer.onDidSave(function(e) {
          var file, lineno;
          file = buffer.file;
          if ((file != null) && file) {
            lineno = null;
            if (editor.cursors.length > 0) {
              lineno = editor.cursors[0].getCurrentLineBufferRange().end.row + 1;
            }
            return sendHeartbeat(file, lineno, true);
          }
        });
        buffer.onDidChange(function(e) {
          var file, lineno;
          file = buffer.file;
          if ((file != null) && file) {
            lineno = null;
            if (editor.cursors.length > 0) {
              lineno = editor.cursors[0].getCurrentLineBufferRange().end.row + 1;
            }
            return sendHeartbeat(file, lineno);
          }
        });
        editor.onDidChangeCursorPosition(function(e) {
          var file, lineno;
          file = buffer.file;
          if ((file != null) && file) {
            lineno = null;
            if (editor.cursors.length > 0) {
              lineno = editor.cursors[0].getCurrentLineBufferRange().end.row + 1;
            }
            return sendHeartbeat(file, lineno);
          }
        });
      } catch (error1) {}
      if (callback != null) {
        return callback();
      }
    });
  };

  isPythonInstalled = function(callback) {
    return pythonLocation(function(result) {
      return callback(result != null);
    });
  };

  pythonLocation = function(callback, locations) {
    var args, i, location, pattern;
    if (global.cachedPythonLocation != null) {
      return callback(global.cachedPythonLocation);
    } else {
      if (locations == null) {
        locations = [__dirname + path.sep + 'python' + path.sep + 'pythonw', 'pythonw', 'python', '/usr/local/bin/python', '/usr/bin/python'];
        i = 26;
        while (i < 50) {
          locations.push('\\python' + i + '\\pythonw');
          locations.push('\\Python' + i + '\\pythonw');
          i++;
        }
      }
      args = ['--version'];
      if (locations.length === 0) {
        callback(null);
        return;
      }
      pattern = /\d+\.\d+/;
      location = locations[0];
      return execFile(location, args, function(error, stdout, stderr) {
        if (error == null) {
          if ((stdout != null) && stdout.match(pattern) || (stderr != null) && stderr.match(pattern)) {
            global.cachedPythonLocation = location;
            return callback(location);
          }
        } else {
          locations.splice(0, 1);
          return pythonLocation(callback, locations);
        }
      });
    }
  };

  installPython = function(callback) {
    var arch, pyVer, url, zipFile;
    pyVer = '3.5.2';
    arch = 'win32';
    if (os.arch().indexOf('x64') > -1) {
      arch = 'amd64';
    }
    url = 'https://www.python.org/ftp/python/' + pyVer + '/python-' + pyVer + '-embed-' + arch + '.zip';
    log.debug('downloading python...');
    if (statusBarIcon != null) {
      statusBarIcon.setStatus('downloading python...');
    }
    zipFile = __dirname + path.sep + 'python.zip';
    return downloadFile(url, zipFile, function() {
      log.debug('extracting python...');
      if (statusBarIcon != null) {
        statusBarIcon.setStatus('extracting python...');
      }
      return unzip(zipFile, __dirname + path.sep + 'python', function() {
        fs.unlink(zipFile);
        log.debug('Finished installing python.');
        if (callback != null) {
          return callback();
        }
      });
    });
  };

  isCLIInstalled = function() {
    return fs.existsSync(cliLocation());
  };

  isCLILatest = function(callback) {
    return pythonLocation(function(python) {
      var args;
      if (python != null) {
        args = [cliLocation(), '--version'];
        return execFile(python, args, function(error, stdout, stderr) {
          var currentVersion;
          if (error == null) {
            currentVersion = stderr.trim();
            log.debug('Current wakatime-cli version is ' + currentVersion);
            log.debug('Checking for updates to wakatime-cli...');
            return getLatestCliVersion(function(latestVersion) {
              if (currentVersion === latestVersion) {
                log.debug('wakatime-cli is up to date.');
                if (callback != null) {
                  return callback(true);
                }
              } else {
                if (latestVersion != null) {
                  log.debug('Found an updated wakatime-cli v' + latestVersion);
                  if (callback != null) {
                    return callback(false);
                  }
                } else {
                  log.debug('Unable to find latest wakatime-cli version from GitHub.');
                  if (callback != null) {
                    return callback(true);
                  }
                }
              }
            });
          } else {
            if (callback != null) {
              return callback(false);
            }
          }
        });
      } else {
        if (callback != null) {
          return callback(false);
        }
      }
    });
  };

  getLatestCliVersion = function(callback) {
    var url;
    url = 'https://raw.githubusercontent.com/wakatime/wakatime/master/wakatime/__about__.py';
    return request.get(url, function(error, response, body) {
      var j, len, line, match, re, ref, version;
      version = null;
      if (!error && response.statusCode === 200) {
        re = new RegExp(/__version_info__ = \('([0-9]+)', '([0-9]+)', '([0-9]+)'\)/g);
        ref = body.split('\n');
        for (j = 0, len = ref.length; j < len; j++) {
          line = ref[j];
          match = re.exec(line);
          if (match != null) {
            version = match[1] + '.' + match[2] + '.' + match[3];
          }
        }
      }
      if (callback != null) {
        return callback(version);
      }
    });
  };

  cliLocation = function() {
    var dir;
    dir = __dirname + path.sep + 'wakatime-master' + path.sep + 'wakatime' + path.sep + 'cli.py';
    return dir;
  };

  installCLI = function(callback) {
    var url, zipFile;
    log.debug('Downloading wakatime-cli...');
    if (statusBarIcon != null) {
      statusBarIcon.setStatus('downloading wakatime-cli...');
    }
    url = 'https://github.com/wakatime/wakatime/archive/master.zip';
    zipFile = __dirname + path.sep + 'wakatime-master.zip';
    return downloadFile(url, zipFile, function() {
      return extractCLI(zipFile, callback);
    });
  };

  extractCLI = function(zipFile, callback) {
    log.debug('Extracting wakatime-master.zip file...');
    if (statusBarIcon != null) {
      statusBarIcon.setStatus('extracting wakatime-cli...');
    }
    return removeCLI(function() {
      return unzip(zipFile, __dirname, callback);
    });
  };

  removeCLI = function(callback) {
    var e;
    if (fs.existsSync(__dirname + path.sep + 'wakatime-master')) {
      try {
        return rimraf(__dirname + path.sep + 'wakatime-master', function() {
          if (callback != null) {
            return callback();
          }
        });
      } catch (error1) {
        e = error1;
        log.warn(e);
        if (callback != null) {
          return callback();
        }
      }
    } else {
      if (callback != null) {
        return callback();
      }
    }
  };

  downloadFile = function(url, outputFile, callback) {
    var out, r;
    r = request(url);
    out = fs.createWriteStream(outputFile);
    r.pipe(out);
    return r.on('end', function() {
      return out.on('finish', function() {
        if (callback != null) {
          return callback();
        }
      });
    });
  };

  unzip = function(file, outputDir, callback) {
    var e, zip;
    if (fs.existsSync(file)) {
      try {
        zip = new AdmZip(file);
        return zip.extractAllTo(outputDir, true);
      } catch (error1) {
        e = error1;
        return log.warn(e);
      } finally {
        fs.unlink(file);
        if (callback != null) {
          callback();
        }
      }
    }
  };

  sendHeartbeat = function(file, lineno, isWrite) {
    var currentFile, time;
    if ((file.path == null) || file.path === void 0) {
      log.debug('Skipping file because path does not exist: ' + file.path);
      return;
    }
    if (fileIsIgnored(file.path)) {
      log.debug('Skipping file because path matches ignore pattern: ' + file.path);
      return;
    }
    time = Date.now();
    currentFile = file.path;
    if (isWrite || enoughTimePassed(time) || lastFile !== currentFile) {
      return pythonLocation(function(python) {
        var args, j, len, proc, realPath, ref, rootDir;
        if (python == null) {
          return;
        }
        args = [cliLocation(), '--file', currentFile, '--plugin', 'atom-wakatime/' + packageVersion];
        if (isWrite) {
          args.push('--write');
        }
        if (lineno != null) {
          args.push('--lineno');
          args.push(lineno);
        }
        if (atom.config.get('wakatime.debug')) {
          args.push('--verbose');
        }
        if (atom.project.contains(file.path)) {
          currentFile = file.path;
          ref = atom.project.rootDirectories;
          for (j = 0, len = ref.length; j < len; j++) {
            rootDir = ref[j];
            realPath = rootDir.realPath;
            if (currentFile.indexOf(realPath) > -1) {
              args.push('--alternate-project');
              args.push(path.basename(realPath));
              break;
            }
          }
        }
        log.debug(python + ' ' + args.join(' '));
        proc = execFile(python, args, function(error, stdout, stderr) {
          var msg, status, title, today;
          if (error != null) {
            if ((stderr != null) && stderr !== '') {
              log.warn(stderr);
            }
            if ((stdout != null) && stdout !== '') {
              log.warn(stdout);
            }
            if (proc.exitCode === 102) {
              msg = null;
              status = null;
              title = 'WakaTime Offline, coding activity will sync when online.';
            } else if (proc.exitCode === 103) {
              msg = 'An error occured while parsing ~/.wakatime.cfg. Check ~/.wakatime.log for more info.';
              status = 'Error';
              title = msg;
            } else if (proc.exitCode === 104) {
              msg = 'Invalid API Key. Make sure your API Key is correct!';
              status = 'Error';
              title = msg;
            } else {
              msg = error;
              status = 'Error';
              title = 'Unknown Error (' + proc.exitCode + '); Check your Dev Console and ~/.wakatime.log for more info.';
            }
            if (msg != null) {
              log.warn(msg);
            }
            if (statusBarIcon != null) {
              statusBarIcon.setStatus(status);
            }
            return statusBarIcon != null ? statusBarIcon.setTitle(title) : void 0;
          } else {
            if (statusBarIcon != null) {
              statusBarIcon.setStatus();
            }
            today = new Date();
            return statusBarIcon != null ? statusBarIcon.setTitle('Last heartbeat sent ' + formatDate(today)) : void 0;
          }
        });
        lastHeartbeat = time;
        return lastFile = file.path;
      });
    }
  };

  fileIsIgnored = function(file) {
    var ignore, j, len, pattern, patterns, re;
    if (endsWith(file, 'COMMIT_EDITMSG') || endsWith(file, 'PULLREQ_EDITMSG') || endsWith(file, 'MERGE_MSG') || endsWith(file, 'TAG_EDITMSG')) {
      return true;
    }
    patterns = atom.config.get('wakatime.ignore');
    if (patterns == null) {
      return true;
    }
    ignore = false;
    for (j = 0, len = patterns.length; j < len; j++) {
      pattern = patterns[j];
      re = new RegExp(pattern, 'gi');
      if (re.test(file)) {
        ignore = true;
        break;
      }
    }
    return ignore;
  };

  endsWith = function(str, suffix) {
    if ((str != null) && (suffix != null)) {
      return str.indexOf(suffix, str.length - suffix.length) !== -1;
    }
    return false;
  };

  formatDate = function(date) {
    var ampm, hour, minute, months;
    months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    ampm = 'AM';
    hour = date.getHours();
    if (hour > 11) {
      ampm = 'PM';
      hour = hour - 12;
    }
    if (hour === 0) {
      hour = 12;
    }
    minute = date.getMinutes();
    if (minute < 10) {
      minute = '0' + minute;
    }
    return months[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear() + ' ' + hour + ':' + minute + ' ' + ampm;
  };

  debug = function(callback) {
    var e;
    if (fs.existsSync(__dirname + path.sep + 'wakatime-master')) {
      try {
        return rimraf(__dirname + path.sep + 'wakatime-master', function() {
          if (callback != null) {
            return callback();
          }
        });
      } catch (error1) {
        e = error1;
        log.warn(e);
        if (callback != null) {
          return callback();
        }
      }
    } else {
      if (callback != null) {
        return callback();
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy91Y2hpaGEvLmF0b20vcGFja2FnZXMvd2FrYXRpbWUvbGliL3dha2F0aW1lLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7O0FBQUE7QUFBQSxNQUFBOztFQVNBLEdBQUEsR0FBTTs7RUFDTixjQUFBLEdBQWlCOztFQUNqQixhQUFBLEdBQWdCOztFQUNoQixRQUFBLEdBQVc7O0VBQ1gsYUFBQSxHQUFnQjs7RUFDaEIsV0FBQSxHQUFjOztFQUdkLE1BQUEsR0FBUyxPQUFBLENBQVEsU0FBUjs7RUFDVCxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVI7O0VBQ0wsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSOztFQUNMLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFDUCxRQUFBLEdBQVcsT0FBQSxDQUFRLGVBQVIsQ0FBd0IsQ0FBQzs7RUFDcEMsT0FBQSxHQUFVLE9BQUEsQ0FBUSxTQUFSOztFQUNWLE1BQUEsR0FBUyxPQUFBLENBQVEsUUFBUjs7RUFDVCxHQUFBLEdBQU0sT0FBQSxDQUFRLEtBQVI7O0VBRU4saUJBQUEsR0FBb0IsT0FBQSxDQUFRLHdCQUFSOztFQUNwQixNQUFBLEdBQVMsT0FBQSxDQUFRLFVBQVI7O0VBRVQsTUFBTSxDQUFDLE9BQVAsR0FDRTtJQUFBLFFBQUEsRUFBVSxTQUFDLEtBQUQ7TUFDUixHQUFBLEdBQVUsSUFBQSxNQUFBLENBQU8sVUFBUDtNQUNWLElBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLGdCQUFoQixDQUFIO1FBQ0UsR0FBRyxDQUFDLFFBQUosQ0FBYSxPQUFiLEVBREY7O01BRUEsY0FBQSxHQUFpQixJQUFJLENBQUMsUUFBUSxDQUFDLGdCQUFkLENBQStCLFVBQS9CLENBQTBDLENBQUMsUUFBUSxDQUFDO01BQ3JFLEdBQUcsQ0FBQyxLQUFKLENBQVUseUJBQUEsR0FBNEIsY0FBNUIsR0FBNkMs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QUMsR0FBakIsR0FBdUIsaUJBQTlCLEVBQWlELFNBQUE7VUFDL0MsSUFBRyxnQkFBSDttQkFDRSxRQUFBLENBQUEsRUFERjs7UUFEK0MsQ0FBakQsRUFERjtPQUFBLGNBQUE7UUFLTTtRQUNKLEdBQUcsQ0FBQyxJQUFKLENBQVMsQ0FBVDtRQUNBLElBQUcsZ0JBQUg7aUJBQ0UsUUFBQSxDQUFBLEVBREY7U0FQRjtPQURGO0tBQUEsTUFBQTtNQVdFLElBQUcsZ0JBQUg7ZUFDRSxRQUFBLENBQUEsRUFERjtPQVhGOztFQURNO0FBN2ZSIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG5XYWthVGltZVxuRGVzY3JpcHRpb246IEFuYWx5dGljcyBmb3IgcHJvZ3JhbW1lcnMuXG5NYWludGFpbmVyOiAgV2FrYVRpbWUgPHN1cHBvcnRAd2FrYXRpbWUuY29tPlxuTGljZW5zZTogICAgIEJTRCwgc2VlIExJQ0VOU0UgZm9yIG1vcmUgZGV0YWlscy5cbldlYnNpdGU6ICAgICBodHRwczovL3dha2F0aW1lLmNvbS9cbiMjI1xuXG4jIHBhY2thZ2UtZ2xvYmFsIGF0dHJpYnV0ZXNcbmxvZyA9IG51bGxcbnBhY2thZ2VWZXJzaW9uID0gbnVsbFxubGFzdEhlYXJ0YmVhdCA9IDBcbmxhc3RGaWxlID0gJydcbnN0YXR1c0Jhckljb24gPSBudWxsXG5wbHVnaW5SZWFkeSA9IGZhbHNlXG5cbiMgcGFja2FnZSBkZXBlbmRlbmNpZXNcbkFkbVppcCA9IHJlcXVpcmUgJ2FkbS16aXAnXG5mcyA9IHJlcXVpcmUgJ2ZzJ1xub3MgPSByZXF1aXJlICdvcydcbnBhdGggPSByZXF1aXJlICdwYXRoJ1xuZXhlY0ZpbGUgPSByZXF1aXJlKCdjaGlsZF9wcm9jZXNzJykuZXhlY0ZpbGVcbnJlcXVlc3QgPSByZXF1aXJlICdyZXF1ZXN0J1xucmltcmFmID0gcmVxdWlyZSAncmltcmFmJ1xuaW5pID0gcmVxdWlyZSAnaW5pJ1xuXG5TdGF0dXNCYXJUaWxlVmlldyA9IHJlcXVpcmUgJy4vc3RhdHVzLWJhci10aWxlLXZpZXcnXG5Mb2dnZXIgPSByZXF1aXJlICcuL2xvZ2dlcidcblxubW9kdWxlLmV4cG9ydHMgPVxuICBhY3RpdmF0ZTogKHN0YXRlKSAtPlxuICAgIGxvZyA9IG5ldyBMb2dnZXIoJ1dha2FUaW1lJylcbiAgICBpZiBhdG9tLmNvbmZpZy5nZXQgJ3dha2F0aW1lLmRlYnVnJ1xuICAgICAgbG9nLnNldExldmVsKCdERUJVRycpXG4gICAgcGFja2FnZVZlcnNpb24gPSBhdG9tLnBhY2thZ2VzLmdldExvYWRlZFBhY2thZ2UoJ3dha2F0aW1lJykubWV0YWRhdGEudmVyc2lvblxuICAgIGxvZy5kZWJ1ZyAnSW5pdGlhbGl6aW5nIFdha2FUaW1lIHYnICsgcGFja2FnZVZlcnNpb24gKyAnLi4uJ1xuICAgIHNldHVwQ29uZmlncygpXG4gICAgQHNldHRpbmdDaGFuZ2VkT2JzZXJ2ZXIgPSBhdG9tLmNvbmZpZy5vYnNlcnZlICd3YWthdGltZScsIHNldHRpbmdDaGFuZ2VkSGFuZGxlclxuXG4gICAgaXNQeXRob25JbnN0YWxsZWQoKGluc3RhbGxlZCkgLT5cbiAgICAgIGlmIG5vdCBpbnN0YWxsZWRcbiAgICAgICAgaWYgb3MudHlwZSgpIGlzICdXaW5kb3dzX05UJ1xuICAgICAgICAgIGluc3RhbGxQeXRob24oY2hlY2tDTEkpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICB3aW5kb3cuYWxlcnQoJ1BsZWFzZSBpbnN0YWxsIFB5dGhvbiAoaHR0cHM6Ly93d3cucHl0aG9uLm9yZy9kb3dubG9hZHMvKSBhbmQgcmVzdGFydCBBdG9tIHRvIGVuYWJsZSB0aGUgV2FrYVRpbWUgcGx1Z2luLicpXG4gICAgICBlbHNlXG4gICAgICAgIGNoZWNrQ0xJKClcbiAgICApXG5cbiAgY29uc3VtZVN0YXR1c0JhcjogKHN0YXR1c0JhcikgLT5cbiAgICBzdGF0dXNCYXJJY29uID0gbmV3IFN0YXR1c0JhclRpbGVWaWV3KClcbiAgICBzdGF0dXNCYXJJY29uLmluaXQoKVxuICAgIEBzdGF0dXNCYXJUaWxlID0gc3RhdHVzQmFyPy5hZGRSaWdodFRpbGUoaXRlbTogc3RhdHVzQmFySWNvbiwgcHJpb3JpdHk6IDMwMClcblxuICAgICMgc2V0IHN0YXR1cyBiYXIgaWNvbiB2aXNpYmlsaXR5XG4gICAgaWYgYXRvbS5jb25maWcuZ2V0ICd3YWthdGltZS5zaG93U3RhdHVzQmFySWNvbidcbiAgICAgIHN0YXR1c0Jhckljb24uc2hvdygpXG4gICAgZWxzZVxuICAgICAgc3RhdHVzQmFySWNvbi5oaWRlKClcblxuICAgIGlmIHBsdWdpblJlYWR5XG4gICAgICBzdGF0dXNCYXJJY29uLnNldFRpdGxlKCdXYWthVGltZSByZWFkeScpXG4gICAgICBzdGF0dXNCYXJJY29uLnNldFN0YXR1cygpXG5cbiAgZGVhY3RpdmF0ZTogLT5cbiAgICBAc3RhdHVzQmFyVGlsZT8uZGVzdHJveSgpXG4gICAgc3RhdHVzQmFySWNvbj8uZGVzdHJveSgpXG4gICAgQHNldHRpbmdDaGFuZ2VkT2JzZXJ2ZXI/LmRpc3Bvc2UoKVxuXG5jaGVja0NMSSA9ICgpIC0+XG4gIGlmIG5vdCBpc0NMSUluc3RhbGxlZCgpXG4gICAgaW5zdGFsbENMSSgtPlxuICAgICAgbG9nLmRlYnVnICdGaW5pc2hlZCBpbnN0YWxsaW5nIHdha2F0aW1lLWNsaS4nXG4gICAgICBmaW5pc2hBY3RpdmF0aW9uKClcbiAgICApXG4gIGVsc2VcblxuICAgICMgb25seSBjaGVjayBmb3IgdXBkYXRlcyB0byB3YWthdGltZS1jbGkgZXZlcnkgMjQgaG91cnNcbiAgICBob3VycyA9IDI0XG5cbiAgICBsYXN0SW5pdCA9IGF0b20uY29uZmlnLmdldCAnd2FrYXRpbWUtaGlkZGVuLmxhc3RJbml0J1xuICAgIGN1cnJlbnRUaW1lID0gTWF0aC5yb3VuZCAobmV3IERhdGUpLmdldFRpbWUoKSAvIDEwMDBcbiAgICBiZWVuYXdoaWxlID0gcGFyc2VJbnQobGFzdEluaXQsIDEwKSArIDM2MDAgKiBob3VycyA8IGN1cnJlbnRUaW1lXG5cbiAgICBpZiBub3QgbGFzdEluaXQ/IG9yIGJlZW5hd2hpbGUgb3IgYXRvbS5jb25maWcuZ2V0KCd3YWthdGltZS5kZWJ1ZycpXG4gICAgICBhdG9tLmNvbmZpZy5zZXQgJ3dha2F0aW1lLWhpZGRlbi5sYXN0SW5pdCcsIGN1cnJlbnRUaW1lXG4gICAgICBpc0NMSUxhdGVzdCgobGF0ZXN0KSAtPlxuICAgICAgICBpZiBub3QgbGF0ZXN0XG4gICAgICAgICAgaW5zdGFsbENMSSgtPlxuICAgICAgICAgICAgbG9nLmRlYnVnICdGaW5pc2hlZCBpbnN0YWxsaW5nIHdha2F0aW1lLWNsaS4nXG4gICAgICAgICAgICBmaW5pc2hBY3RpdmF0aW9uKClcbiAgICAgICAgICApXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBmaW5pc2hBY3RpdmF0aW9uKClcbiAgICAgIClcbiAgICBlbHNlXG4gICAgICBmaW5pc2hBY3RpdmF0aW9uKClcblxuZmluaXNoQWN0aXZhdGlvbiA9ICgpIC0+XG4gIHBsdWdpblJlYWR5ID0gdHJ1ZVxuICBzZXR1cEV2ZW50SGFuZGxlcnMoKVxuXG4gICMgc2V0IHN0YXR1cyBiYXIgaWNvbiB2aXNpYmlsaXR5XG4gIGlmIGF0b20uY29uZmlnLmdldCAnd2FrYXRpbWUuc2hvd1N0YXR1c0Jhckljb24nXG4gICAgc3RhdHVzQmFySWNvbj8uc2hvdygpXG4gIGVsc2VcbiAgICBzdGF0dXNCYXJJY29uPy5oaWRlKClcblxuICBzdGF0dXNCYXJJY29uPy5zZXRUaXRsZSgnV2FrYVRpbWUgcmVhZHknKVxuICBzdGF0dXNCYXJJY29uPy5zZXRTdGF0dXMoKVxuICBsb2cuZGVidWcgJ0ZpbmlzaGVkIGluaXRpYWxpemluZyBXYWthVGltZS4nXG5cbnNldHRpbmdDaGFuZ2VkSGFuZGxlciA9IChzZXR0aW5ncykgLT5cbiAgaWYgc2V0dGluZ3Muc2hvd1N0YXR1c0Jhckljb25cbiAgICBzdGF0dXNCYXJJY29uPy5zaG93KClcbiAgZWxzZVxuICAgIHN0YXR1c0Jhckljb24/LmhpZGUoKVxuICBpZiBhdG9tLmNvbmZpZy5nZXQgJ3dha2F0aW1lLmRlYnVnJ1xuICAgIGxvZy5zZXRMZXZlbCgnREVCVUcnKVxuICBlbHNlXG4gICAgbG9nLnNldExldmVsKCdJTkZPJylcbiAgYXBpS2V5ID0gc2V0dGluZ3MuYXBpa2V5XG4gIGlmIGlzVmFsaWRBcGlLZXkoYXBpS2V5KVxuICAgIGF0b20uY29uZmlnLnNldCAnd2FrYXRpbWUuYXBpa2V5JywgJycgIyBjbGVhciBzZXR0aW5nIHNvIGl0IHVwZGF0ZXMgaW4gVUlcbiAgICBhdG9tLmNvbmZpZy5zZXQgJ3dha2F0aW1lLmFwaWtleScsICdTYXZlZCBpbiB5b3VyIH4vLndha2F0aW1lLmNmZyBmaWxlJ1xuICAgIHNhdmVBcGlLZXkgYXBpS2V5XG5cbnNhdmVBcGlLZXkgPSAoYXBpS2V5KSAtPlxuICBjb25maWdGaWxlID0gcGF0aC5qb2luIGdldFVzZXJIb21lKCksICcud2FrYXRpbWUuY2ZnJ1xuICBmcy5yZWFkRmlsZSBjb25maWdGaWxlLCAndXRmLTgnLCAoZXJyLCBpbnApIC0+XG4gICAgaWYgZXJyP1xuICAgICAgbG9nLmRlYnVnICdFcnJvcjogY291bGQgbm90IHJlYWQgd2FrYXRpbWUgY29uZmlnIGZpbGUnXG4gICAgU3RyaW5nOjpzdGFydHNXaXRoID89IChzKSAtPiBAc2xpY2UoMCwgcy5sZW5ndGgpID09IHNcbiAgICBTdHJpbmc6OmVuZHNXaXRoICAgPz0gKHMpIC0+IHMgPT0gJycgb3IgQHNsaWNlKC1zLmxlbmd0aCkgPT0gc1xuICAgIGNvbnRlbnRzID0gW11cbiAgICBjdXJyZW50U2VjdGlvbiA9ICcnXG4gICAgZm91bmQgPSBmYWxzZVxuICAgIGlmIGlucD9cbiAgICAgIGZvciBsaW5lIGluIGlucC5zcGxpdCgnXFxuJylcbiAgICAgICAgaWYgbGluZS50cmltKCkuc3RhcnRzV2l0aCgnWycpIGFuZCBsaW5lLnRyaW0oKS5lbmRzV2l0aCgnXScpXG4gICAgICAgICAgaWYgY3VycmVudFNlY3Rpb24gPT0gJ3NldHRpbmdzJyBhbmQgbm90IGZvdW5kXG4gICAgICAgICAgICBjb250ZW50cy5wdXNoKCdhcGlfa2V5ID0gJyArIGFwaUtleSlcbiAgICAgICAgICAgIGZvdW5kID0gdHJ1ZVxuICAgICAgICAgIGN1cnJlbnRTZWN0aW9uID0gbGluZS50cmltKCkuc3Vic3RyaW5nKDEsIGxpbmUudHJpbSgpLmxlbmd0aCAtIDEpLnRvTG93ZXJDYXNlKClcbiAgICAgICAgICBjb250ZW50cy5wdXNoKGxpbmUpXG4gICAgICAgIGVsc2UgaWYgY3VycmVudFNlY3Rpb24gPT0gJ3NldHRpbmdzJ1xuICAgICAgICAgIHBhcnRzID0gbGluZS5zcGxpdCgnPScpXG4gICAgICAgICAgY3VycmVudEtleSA9IHBhcnRzWzBdLnRyaW0oKVxuICAgICAgICAgIGlmIGN1cnJlbnRLZXkgPT0gJ2FwaV9rZXknXG4gICAgICAgICAgICBpZiBub3QgZm91bmRcbiAgICAgICAgICAgICAgY29udGVudHMucHVzaCgnYXBpX2tleSA9ICcgKyBhcGlLZXkpXG4gICAgICAgICAgICAgIGZvdW5kID0gdHJ1ZVxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIGNvbnRlbnRzLnB1c2gobGluZSlcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGNvbnRlbnRzLnB1c2gobGluZSlcblxuICAgIGlmIG5vdCBmb3VuZFxuICAgICAgaWYgY3VycmVudFNlY3Rpb24gIT0gJ3NldHRpbmdzJ1xuICAgICAgICBjb250ZW50cy5wdXNoKCdbc2V0dGluZ3NdJylcbiAgICAgIGNvbnRlbnRzLnB1c2goJ2FwaV9rZXkgPSAnICsgYXBpS2V5KVxuXG4gICAgZnMud3JpdGVGaWxlIGNvbmZpZ0ZpbGUsIGNvbnRlbnRzLmpvaW4oJ1xcbicpLCB7ZW5jb2Rpbmc6ICd1dGYtOCd9LCAoZXJyMikgLT5cbiAgICAgIGlmIGVycjI/XG4gICAgICAgIG1zZyA9ICdFcnJvcjogY291bGQgbm90IHdyaXRlIHRvIHdha2F0aW1lIGNvbmZpZyBmaWxlJ1xuICAgICAgICBsb2cuZXJyb3IgbXNnXG4gICAgICAgIHN0YXR1c0Jhckljb24/LnNldFN0YXR1cygnRXJyb3InKVxuICAgICAgICBzdGF0dXNCYXJJY29uPy5zZXRUaXRsZShtc2cpXG5cbmdldFVzZXJIb21lID0gLT5cbiAgcHJvY2Vzcy5lbnZbaWYgcHJvY2Vzcy5wbGF0Zm9ybSA9PSAnd2luMzInIHRoZW4gJ1VTRVJQUk9GSUxFJyBlbHNlICdIT01FJ10gfHwgJydcblxuc2V0dXBDb25maWdzID0gLT5cbiAgY29uZmlnRmlsZSA9IHBhdGguam9pbiBnZXRVc2VySG9tZSgpLCAnLndha2F0aW1lLmNmZydcbiAgZnMucmVhZEZpbGUgY29uZmlnRmlsZSwgJ3V0Zi04JywgKGVyciwgY29uZmlnQ29udGVudCkgLT5cbiAgICBpZiBlcnI/XG4gICAgICBsb2cuZGVidWcgJ0Vycm9yOiBjb3VsZCBub3QgcmVhZCB3YWthdGltZSBjb25maWcgZmlsZSdcbiAgICAgIHNldHRpbmdDaGFuZ2VkSGFuZGxlciBhdG9tLmNvbmZpZy5nZXQoJ3dha2F0aW1lJylcbiAgICAgIHJldHVyblxuICAgIGNvbW1vbkNvbmZpZ3MgPSBpbmkuZGVjb2RlIGNvbmZpZ0NvbnRlbnRcbiAgICBpZiBjb21tb25Db25maWdzPyBhbmQgY29tbW9uQ29uZmlncy5zZXR0aW5ncz8gYW5kIGlzVmFsaWRBcGlLZXkoY29tbW9uQ29uZmlncy5zZXR0aW5ncy5hcGlfa2V5KVxuICAgICAgYXRvbS5jb25maWcuc2V0ICd3YWthdGltZS5hcGlrZXknLCAnJyAjIGNsZWFyIHNldHRpbmcgc28gaXQgdXBkYXRlcyBpbiBVSVxuICAgICAgYXRvbS5jb25maWcuc2V0ICd3YWthdGltZS5hcGlrZXknLCAnU2F2ZWQgaW4geW91ciB+Ly53YWthdGltZS5jZmcgZmlsZSdcbiAgICBlbHNlXG4gICAgICBzZXR0aW5nQ2hhbmdlZEhhbmRsZXIgYXRvbS5jb25maWcuZ2V0KCd3YWthdGltZScpXG5cbmlzVmFsaWRBcGlLZXkgPSAoa2V5KSAtPlxuICBpZiBub3Qga2V5P1xuICAgIHJldHVybiBmYWxzZVxuICByZSA9IG5ldyBSZWdFeHAoJ15bMC05QS1GXXs4fS1bMC05QS1GXXs0fS00WzAtOUEtRl17M30tWzg5QUJdWzAtOUEtRl17M30tWzAtOUEtRl17MTJ9JCcsICdpJylcbiAgcmV0dXJuIHJlLnRlc3Qga2V5XG5cbmVub3VnaFRpbWVQYXNzZWQgPSAodGltZSkgLT5cbiAgcmV0dXJuIGxhc3RIZWFydGJlYXQgKyAxMjAwMDAgPCB0aW1lXG5cbnNldHVwRXZlbnRIYW5kbGVycyA9IChjYWxsYmFjaykgLT5cbiAgYXRvbS53b3Jrc3BhY2Uub2JzZXJ2ZVRleHRFZGl0b3JzIChlZGl0b3IpIC0+XG4gICAgdHJ5XG4gICAgICBidWZmZXIgPSBlZGl0b3IuZ2V0QnVmZmVyKClcbiAgICAgIGJ1ZmZlci5vbkRpZFNhdmUgKGUpIC0+XG4gICAgICAgIGZpbGUgPSBidWZmZXIuZmlsZVxuICAgICAgICBpZiBmaWxlPyBhbmQgZmlsZVxuICAgICAgICAgIGxpbmVubyA9IG51bGxcbiAgICAgICAgICBpZiBlZGl0b3IuY3Vyc29ycy5sZW5ndGggPiAwXG4gICAgICAgICAgICBsaW5lbm8gPSBlZGl0b3IuY3Vyc29yc1swXS5nZXRDdXJyZW50TGluZUJ1ZmZlclJhbmdlKCkuZW5kLnJvdyArIDFcbiAgICAgICAgICBzZW5kSGVhcnRiZWF0KGZpbGUsIGxpbmVubywgdHJ1ZSlcbiAgICAgIGJ1ZmZlci5vbkRpZENoYW5nZSAoZSkgLT5cbiAgICAgICAgZmlsZSA9IGJ1ZmZlci5maWxlXG4gICAgICAgIGlmIGZpbGU/IGFuZCBmaWxlXG4gICAgICAgICAgbGluZW5vID0gbnVsbFxuICAgICAgICAgIGlmIGVkaXRvci5jdXJzb3JzLmxlbmd0aCA+IDBcbiAgICAgICAgICAgIGxpbmVubyA9IGVkaXRvci5jdXJzb3JzWzBdLmdldEN1cnJlbnRMaW5lQnVmZmVyUmFuZ2UoKS5lbmQucm93ICsgMVxuICAgICAgICAgIHNlbmRIZWFydGJlYXQoZmlsZSwgbGluZW5vKVxuICAgICAgZWRpdG9yLm9uRGlkQ2hhbmdlQ3Vyc29yUG9zaXRpb24gKGUpIC0+XG4gICAgICAgIGZpbGUgPSBidWZmZXIuZmlsZVxuICAgICAgICBpZiBmaWxlPyBhbmQgZmlsZVxuICAgICAgICAgIGxpbmVubyA9IG51bGxcbiAgICAgICAgICBpZiBlZGl0b3IuY3Vyc29ycy5sZW5ndGggPiAwXG4gICAgICAgICAgICBsaW5lbm8gPSBlZGl0b3IuY3Vyc29yc1swXS5nZXRDdXJyZW50TGluZUJ1ZmZlclJhbmdlKCkuZW5kLnJvdyArIDFcbiAgICAgICAgICBzZW5kSGVhcnRiZWF0KGZpbGUsIGxpbmVubylcbiAgICBpZiBjYWxsYmFjaz9cbiAgICAgIGNhbGxiYWNrKClcblxuaXNQeXRob25JbnN0YWxsZWQgPSAoY2FsbGJhY2spIC0+XG4gIHB5dGhvbkxvY2F0aW9uKChyZXN1bHQpIC0+XG4gICAgY2FsbGJhY2socmVzdWx0PylcbiAgKVxuXG5weXRob25Mb2NhdGlvbiA9IChjYWxsYmFjaywgbG9jYXRpb25zKSAtPlxuICBpZiBnbG9iYWwuY2FjaGVkUHl0aG9uTG9jYXRpb24/XG4gICAgY2FsbGJhY2soZ2xvYmFsLmNhY2hlZFB5dGhvbkxvY2F0aW9uKVxuICBlbHNlXG4gICAgaWYgbm90IGxvY2F0aW9ucz9cbiAgICAgIGxvY2F0aW9ucyA9IFtcbiAgICAgICAgX19kaXJuYW1lICsgcGF0aC5zZXAgKyAncHl0aG9uJyArIHBhdGguc2VwICsgJ3B5dGhvbncnLFxuICAgICAgICAncHl0aG9udycsXG4gICAgICAgICdweXRob24nLFxuICAgICAgICAnL3Vzci9sb2NhbC9iaW4vcHl0aG9uJyxcbiAgICAgICAgJy91c3IvYmluL3B5dGhvbicsXG4gICAgICBdXG4gICAgICBpID0gMjZcbiAgICAgIHdoaWxlIGkgPCA1MFxuICAgICAgICBsb2NhdGlvbnMucHVzaCAnXFxcXHB5dGhvbicgKyBpICsgJ1xcXFxweXRob253J1xuICAgICAgICBsb2NhdGlvbnMucHVzaCAnXFxcXFB5dGhvbicgKyBpICsgJ1xcXFxweXRob253J1xuICAgICAgICBpKytcbiAgICBhcmdzID0gWyctLXZlcnNpb24nXVxuICAgIGlmIGxvY2F0aW9ucy5sZW5ndGggaXMgMFxuICAgICAgY2FsbGJhY2sobnVsbClcbiAgICAgIHJldHVyblxuICAgIHBhdHRlcm4gPSAvXFxkK1xcLlxcZCsvXG4gICAgbG9jYXRpb24gPSBsb2NhdGlvbnNbMF1cbiAgICBleGVjRmlsZShsb2NhdGlvbiwgYXJncywgKGVycm9yLCBzdGRvdXQsIHN0ZGVycikgLT5cbiAgICAgIGlmIG5vdCBlcnJvcj9cbiAgICAgICAgaWYgc3Rkb3V0PyBhbmQgc3Rkb3V0Lm1hdGNoKHBhdHRlcm4pIG9yIHN0ZGVycj8gYW5kIHN0ZGVyci5tYXRjaChwYXR0ZXJuKVxuICAgICAgICAgIGdsb2JhbC5jYWNoZWRQeXRob25Mb2NhdGlvbiA9IGxvY2F0aW9uXG4gICAgICAgICAgY2FsbGJhY2sobG9jYXRpb24pXG4gICAgICBlbHNlXG4gICAgICAgIGxvY2F0aW9ucy5zcGxpY2UoMCwgMSlcbiAgICAgICAgcHl0aG9uTG9jYXRpb24oY2FsbGJhY2ssIGxvY2F0aW9ucylcbiAgICApXG5cbmluc3RhbGxQeXRob24gPSAoY2FsbGJhY2spIC0+XG4gIHB5VmVyID0gJzMuNS4yJ1xuICBhcmNoID0gJ3dpbjMyJ1xuICBpZiBvcy5hcmNoKCkuaW5kZXhPZigneDY0JykgPiAtMVxuICAgIGFyY2ggPSAnYW1kNjQnXG4gIHVybCA9ICdodHRwczovL3d3dy5weXRob24ub3JnL2Z0cC9weXRob24vJyArIHB5VmVyICsgJy9weXRob24tJyArIHB5VmVyICsgJy1lbWJlZC0nICsgYXJjaCArICcuemlwJ1xuXG4gIGxvZy5kZWJ1ZyAnZG93bmxvYWRpbmcgcHl0aG9uLi4uJ1xuICBzdGF0dXNCYXJJY29uPy5zZXRTdGF0dXMoJ2Rvd25sb2FkaW5nIHB5dGhvbi4uLicpXG5cbiAgemlwRmlsZSA9IF9fZGlybmFtZSArIHBhdGguc2VwICsgJ3B5dGhvbi56aXAnXG4gIGRvd25sb2FkRmlsZSh1cmwsIHppcEZpbGUsIC0+XG5cbiAgICBsb2cuZGVidWcgJ2V4dHJhY3RpbmcgcHl0aG9uLi4uJ1xuICAgIHN0YXR1c0Jhckljb24/LnNldFN0YXR1cygnZXh0cmFjdGluZyBweXRob24uLi4nKVxuXG4gICAgdW56aXAoemlwRmlsZSwgX19kaXJuYW1lICsgcGF0aC5zZXAgKyAncHl0aG9uJywgLT5cbiAgICAgIGZzLnVubGluayh6aXBGaWxlKVxuICAgICAgbG9nLmRlYnVnICdGaW5pc2hlZCBpbnN0YWxsaW5nIHB5dGhvbi4nXG4gICAgICBpZiBjYWxsYmFjaz9cbiAgICAgICAgY2FsbGJhY2soKVxuICAgIClcbiAgKVxuXG5pc0NMSUluc3RhbGxlZCA9ICgpIC0+XG4gIHJldHVybiBmcy5leGlzdHNTeW5jKGNsaUxvY2F0aW9uKCkpXG5cbmlzQ0xJTGF0ZXN0ID0gKGNhbGxiYWNrKSAtPlxuICBweXRob25Mb2NhdGlvbigocHl0aG9uKSAtPlxuICAgIGlmIHB5dGhvbj9cbiAgICAgIGFyZ3MgPSBbY2xpTG9jYXRpb24oKSwgJy0tdmVyc2lvbiddXG4gICAgICBleGVjRmlsZShweXRob24sIGFyZ3MsIChlcnJvciwgc3Rkb3V0LCBzdGRlcnIpIC0+XG4gICAgICAgIGlmIG5vdCBlcnJvcj9cbiAgICAgICAgICBjdXJyZW50VmVyc2lvbiA9IHN0ZGVyci50cmltKClcbiAgICAgICAgICBsb2cuZGVidWcgJ0N1cnJlbnQgd2FrYXRpbWUtY2xpIHZlcnNpb24gaXMgJyArIGN1cnJlbnRWZXJzaW9uXG4gICAgICAgICAgbG9nLmRlYnVnICdDaGVja2luZyBmb3IgdXBkYXRlcyB0byB3YWthdGltZS1jbGkuLi4nXG4gICAgICAgICAgZ2V0TGF0ZXN0Q2xpVmVyc2lvbigobGF0ZXN0VmVyc2lvbikgLT5cbiAgICAgICAgICAgIGlmIGN1cnJlbnRWZXJzaW9uID09IGxhdGVzdFZlcnNpb25cbiAgICAgICAgICAgICAgbG9nLmRlYnVnICd3YWthdGltZS1jbGkgaXMgdXAgdG8gZGF0ZS4nXG4gICAgICAgICAgICAgIGlmIGNhbGxiYWNrP1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKHRydWUpXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgIGlmIGxhdGVzdFZlcnNpb24/XG4gICAgICAgICAgICAgICAgbG9nLmRlYnVnICdGb3VuZCBhbiB1cGRhdGVkIHdha2F0aW1lLWNsaSB2JyArIGxhdGVzdFZlcnNpb25cbiAgICAgICAgICAgICAgICBpZiBjYWxsYmFjaz9cbiAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGZhbHNlKVxuICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgbG9nLmRlYnVnICdVbmFibGUgdG8gZmluZCBsYXRlc3Qgd2FrYXRpbWUtY2xpIHZlcnNpb24gZnJvbSBHaXRIdWIuJ1xuICAgICAgICAgICAgICAgIGlmIGNhbGxiYWNrP1xuICAgICAgICAgICAgICAgICAgY2FsbGJhY2sodHJ1ZSlcbiAgICAgICAgICApXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBpZiBjYWxsYmFjaz9cbiAgICAgICAgICAgIGNhbGxiYWNrKGZhbHNlKVxuICAgICAgKVxuICAgIGVsc2VcbiAgICAgIGlmIGNhbGxiYWNrP1xuICAgICAgICBjYWxsYmFjayhmYWxzZSlcbiAgKVxuXG5nZXRMYXRlc3RDbGlWZXJzaW9uID0gKGNhbGxiYWNrKSAtPlxuICB1cmwgPSAnaHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL3dha2F0aW1lL3dha2F0aW1lL21hc3Rlci93YWthdGltZS9fX2Fib3V0X18ucHknXG4gIHJlcXVlc3QuZ2V0KHVybCwgKGVycm9yLCByZXNwb25zZSwgYm9keSkgLT5cbiAgICB2ZXJzaW9uID0gbnVsbFxuICAgIGlmICFlcnJvciBhbmQgcmVzcG9uc2Uuc3RhdHVzQ29kZSA9PSAyMDBcbiAgICAgIHJlID0gbmV3IFJlZ0V4cCgvX192ZXJzaW9uX2luZm9fXyA9IFxcKCcoWzAtOV0rKScsICcoWzAtOV0rKScsICcoWzAtOV0rKSdcXCkvZylcbiAgICAgIGZvciBsaW5lIGluIGJvZHkuc3BsaXQoJ1xcbicpXG4gICAgICAgIG1hdGNoID0gcmUuZXhlYyhsaW5lKVxuICAgICAgICBpZiBtYXRjaD9cbiAgICAgICAgICB2ZXJzaW9uID0gbWF0Y2hbMV0gKyAnLicgKyBtYXRjaFsyXSArICcuJyArIG1hdGNoWzNdXG4gICAgaWYgY2FsbGJhY2s/XG4gICAgICBjYWxsYmFjayh2ZXJzaW9uKVxuICApXG5cbmNsaUxvY2F0aW9uID0gKCkgLT5cbiAgZGlyID0gX19kaXJuYW1lICsgcGF0aC5zZXAgKyAnd2FrYXRpbWUtbWFzdGVyJyArIHBhdGguc2VwICsgJ3dha2F0aW1lJyArIHBhdGguc2VwICsgJ2NsaS5weSdcbiAgcmV0dXJuIGRpclxuXG5pbnN0YWxsQ0xJID0gKGNhbGxiYWNrKSAtPlxuICBsb2cuZGVidWcgJ0Rvd25sb2FkaW5nIHdha2F0aW1lLWNsaS4uLidcbiAgc3RhdHVzQmFySWNvbj8uc2V0U3RhdHVzKCdkb3dubG9hZGluZyB3YWthdGltZS1jbGkuLi4nKVxuICB1cmwgPSAnaHR0cHM6Ly9naXRodWIuY29tL3dha2F0aW1lL3dha2F0aW1lL2FyY2hpdmUvbWFzdGVyLnppcCdcbiAgemlwRmlsZSA9IF9fZGlybmFtZSArIHBhdGguc2VwICsgJ3dha2F0aW1lLW1hc3Rlci56aXAnXG4gIGRvd25sb2FkRmlsZSh1cmwsIHppcEZpbGUsIC0+XG4gICAgZXh0cmFjdENMSSh6aXBGaWxlLCBjYWxsYmFjaylcbiAgKVxuXG5leHRyYWN0Q0xJID0gKHppcEZpbGUsIGNhbGxiYWNrKSAtPlxuICBsb2cuZGVidWcgJ0V4dHJhY3Rpbmcgd2FrYXRpbWUtbWFzdGVyLnppcCBmaWxlLi4uJ1xuICBzdGF0dXNCYXJJY29uPy5zZXRTdGF0dXMoJ2V4dHJhY3Rpbmcgd2FrYXRpbWUtY2xpLi4uJylcbiAgcmVtb3ZlQ0xJKC0+XG4gICAgdW56aXAoemlwRmlsZSwgX19kaXJuYW1lLCBjYWxsYmFjaylcbiAgKVxuXG5yZW1vdmVDTEkgPSAoY2FsbGJhY2spIC0+XG4gIGlmIGZzLmV4aXN0c1N5bmMoX19kaXJuYW1lICsgcGF0aC5zZXAgKyAnd2FrYXRpbWUtbWFzdGVyJylcbiAgICB0cnlcbiAgICAgIHJpbXJhZihfX2Rpcm5hbWUgKyBwYXRoLnNlcCArICd3YWthdGltZS1tYXN0ZXInLCAtPlxuICAgICAgICBpZiBjYWxsYmFjaz9cbiAgICAgICAgICBjYWxsYmFjaygpXG4gICAgICApXG4gICAgY2F0Y2ggZVxuICAgICAgbG9nLndhcm4gZVxuICAgICAgaWYgY2FsbGJhY2s/XG4gICAgICAgIGNhbGxiYWNrKClcbiAgZWxzZVxuICAgIGlmIGNhbGxiYWNrP1xuICAgICAgY2FsbGJhY2soKVxuXG5kb3dubG9hZEZpbGUgPSAodXJsLCBvdXRwdXRGaWxlLCBjYWxsYmFjaykgLT5cbiAgciA9IHJlcXVlc3QodXJsKVxuICBvdXQgPSBmcy5jcmVhdGVXcml0ZVN0cmVhbShvdXRwdXRGaWxlKVxuICByLnBpcGUob3V0KVxuICByLm9uKCdlbmQnLCAtPlxuICAgIG91dC5vbignZmluaXNoJywgLT5cbiAgICAgIGlmIGNhbGxiYWNrP1xuICAgICAgICBjYWxsYmFjaygpXG4gICAgKVxuICApXG5cbnVuemlwID0gKGZpbGUsIG91dHB1dERpciwgY2FsbGJhY2spIC0+XG4gIGlmIGZzLmV4aXN0c1N5bmMoZmlsZSlcbiAgICB0cnlcbiAgICAgIHppcCA9IG5ldyBBZG1aaXAoZmlsZSlcbiAgICAgIHppcC5leHRyYWN0QWxsVG8ob3V0cHV0RGlyLCB0cnVlKVxuICAgIGNhdGNoIGVcbiAgICAgIGxvZy53YXJuIGVcbiAgICBmaW5hbGx5XG4gICAgICBmcy51bmxpbmsoZmlsZSlcbiAgICAgIGlmIGNhbGxiYWNrP1xuICAgICAgICBjYWxsYmFjaygpXG5cbnNlbmRIZWFydGJlYXQgPSAoZmlsZSwgbGluZW5vLCBpc1dyaXRlKSAtPlxuICBpZiBub3QgZmlsZS5wYXRoPyBvciBmaWxlLnBhdGggaXMgdW5kZWZpbmVkXG4gICAgbG9nLmRlYnVnICdTa2lwcGluZyBmaWxlIGJlY2F1c2UgcGF0aCBkb2VzIG5vdCBleGlzdDogJyArIGZpbGUucGF0aFxuICAgIHJldHVyblxuICBpZiBmaWxlSXNJZ25vcmVkKGZpbGUucGF0aClcbiAgICBsb2cuZGVidWcgJ1NraXBwaW5nIGZpbGUgYmVjYXVzZSBwYXRoIG1hdGNoZXMgaWdub3JlIHBhdHRlcm46ICcgKyBmaWxlLnBhdGhcbiAgICByZXR1cm5cblxuICB0aW1lID0gRGF0ZS5ub3coKVxuICBjdXJyZW50RmlsZSA9IGZpbGUucGF0aFxuICBpZiBpc1dyaXRlIG9yIGVub3VnaFRpbWVQYXNzZWQodGltZSkgb3IgbGFzdEZpbGUgaXNudCBjdXJyZW50RmlsZVxuICAgIHB5dGhvbkxvY2F0aW9uIChweXRob24pIC0+XG4gICAgICByZXR1cm4gdW5sZXNzIHB5dGhvbj9cbiAgICAgIGFyZ3MgPSBbY2xpTG9jYXRpb24oKSwgJy0tZmlsZScsIGN1cnJlbnRGaWxlLCAnLS1wbHVnaW4nLCAnYXRvbS13YWthdGltZS8nICsgcGFja2FnZVZlcnNpb25dXG4gICAgICBpZiBpc1dyaXRlXG4gICAgICAgIGFyZ3MucHVzaCgnLS13cml0ZScpXG4gICAgICBpZiBsaW5lbm8/XG4gICAgICAgIGFyZ3MucHVzaCgnLS1saW5lbm8nKVxuICAgICAgICBhcmdzLnB1c2gobGluZW5vKVxuICAgICAgaWYgYXRvbS5jb25maWcuZ2V0ICd3YWthdGltZS5kZWJ1ZydcbiAgICAgICAgYXJncy5wdXNoKCctLXZlcmJvc2UnKVxuXG4gICAgICBpZiBhdG9tLnByb2plY3QuY29udGFpbnMoZmlsZS5wYXRoKVxuICAgICAgICBjdXJyZW50RmlsZSA9IGZpbGUucGF0aFxuICAgICAgICBmb3Igcm9vdERpciBpbiBhdG9tLnByb2plY3Qucm9vdERpcmVjdG9yaWVzXG4gICAgICAgICAgcmVhbFBhdGggPSByb290RGlyLnJlYWxQYXRoXG4gICAgICAgICAgaWYgY3VycmVudEZpbGUuaW5kZXhPZihyZWFsUGF0aCkgPiAtMVxuICAgICAgICAgICAgYXJncy5wdXNoKCctLWFsdGVybmF0ZS1wcm9qZWN0JylcbiAgICAgICAgICAgIGFyZ3MucHVzaChwYXRoLmJhc2VuYW1lKHJlYWxQYXRoKSlcbiAgICAgICAgICAgIGJyZWFrXG5cbiAgICAgIGxvZy5kZWJ1ZyBweXRob24gKyAnICcgKyBhcmdzLmpvaW4oJyAnKVxuXG4gICAgICBwcm9jID0gZXhlY0ZpbGUocHl0aG9uLCBhcmdzLCAoZXJyb3IsIHN0ZG91dCwgc3RkZXJyKSAtPlxuICAgICAgICBpZiBlcnJvcj9cbiAgICAgICAgICBpZiBzdGRlcnI/IGFuZCBzdGRlcnIgIT0gJydcbiAgICAgICAgICAgIGxvZy53YXJuIHN0ZGVyclxuICAgICAgICAgIGlmIHN0ZG91dD8gYW5kIHN0ZG91dCAhPSAnJ1xuICAgICAgICAgICAgbG9nLndhcm4gc3Rkb3V0XG4gICAgICAgICAgaWYgcHJvYy5leGl0Q29kZSA9PSAxMDJcbiAgICAgICAgICAgIG1zZyA9IG51bGxcbiAgICAgICAgICAgIHN0YXR1cyA9IG51bGxcbiAgICAgICAgICAgIHRpdGxlID0gJ1dha2FUaW1lIE9mZmxpbmUsIGNvZGluZyBhY3Rpdml0eSB3aWxsIHN5bmMgd2hlbiBvbmxpbmUuJ1xuICAgICAgICAgIGVsc2UgaWYgcHJvYy5leGl0Q29kZSA9PSAxMDNcbiAgICAgICAgICAgIG1zZyA9ICdBbiBlcnJvciBvY2N1cmVkIHdoaWxlIHBhcnNpbmcgfi8ud2FrYXRpbWUuY2ZnLiBDaGVjayB+Ly53YWthdGltZS5sb2cgZm9yIG1vcmUgaW5mby4nXG4gICAgICAgICAgICBzdGF0dXMgPSAnRXJyb3InXG4gICAgICAgICAgICB0aXRsZSA9IG1zZ1xuICAgICAgICAgIGVsc2UgaWYgcHJvYy5leGl0Q29kZSA9PSAxMDRcbiAgICAgICAgICAgIG1zZyA9ICdJbnZhbGlkIEFQSSBLZXkuIE1ha2Ugc3VyZSB5b3VyIEFQSSBLZXkgaXMgY29ycmVjdCEnXG4gICAgICAgICAgICBzdGF0dXMgPSAnRXJyb3InXG4gICAgICAgICAgICB0aXRsZSA9IG1zZ1xuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIG1zZyA9IGVycm9yXG4gICAgICAgICAgICBzdGF0dXMgPSAnRXJyb3InXG4gICAgICAgICAgICB0aXRsZSA9ICdVbmtub3duIEVycm9yICgnICsgcHJvYy5leGl0Q29kZSArICcpOyBDaGVjayB5b3VyIERldiBDb25zb2xlIGFuZCB+Ly53YWthdGltZS5sb2cgZm9yIG1vcmUgaW5mby4nXG5cbiAgICAgICAgICBpZiBtc2c/XG4gICAgICAgICAgICBsb2cud2FybiBtc2dcbiAgICAgICAgICBzdGF0dXNCYXJJY29uPy5zZXRTdGF0dXMoc3RhdHVzKVxuICAgICAgICAgIHN0YXR1c0Jhckljb24/LnNldFRpdGxlKHRpdGxlKVxuXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBzdGF0dXNCYXJJY29uPy5zZXRTdGF0dXMoKVxuICAgICAgICAgIHRvZGF5ID0gbmV3IERhdGUoKVxuICAgICAgICAgIHN0YXR1c0Jhckljb24/LnNldFRpdGxlKCdMYXN0IGhlYXJ0YmVhdCBzZW50ICcgKyBmb3JtYXREYXRlKHRvZGF5KSlcbiAgICAgIClcbiAgICAgIGxhc3RIZWFydGJlYXQgPSB0aW1lXG4gICAgICBsYXN0RmlsZSA9IGZpbGUucGF0aFxuXG5maWxlSXNJZ25vcmVkID0gKGZpbGUpIC0+XG4gIGlmIGVuZHNXaXRoKGZpbGUsICdDT01NSVRfRURJVE1TRycpIG9yIGVuZHNXaXRoKGZpbGUsICdQVUxMUkVRX0VESVRNU0cnKSBvciBlbmRzV2l0aChmaWxlLCAnTUVSR0VfTVNHJykgb3IgZW5kc1dpdGgoZmlsZSwgJ1RBR19FRElUTVNHJylcbiAgICByZXR1cm4gdHJ1ZVxuICBwYXR0ZXJucyA9IGF0b20uY29uZmlnLmdldCgnd2FrYXRpbWUuaWdub3JlJylcbiAgaWYgbm90IHBhdHRlcm5zP1xuICAgIHJldHVybiB0cnVlXG5cbiAgaWdub3JlID0gZmFsc2VcbiAgZm9yIHBhdHRlcm4gaW4gcGF0dGVybnNcbiAgICByZSA9IG5ldyBSZWdFeHAocGF0dGVybiwgJ2dpJylcbiAgICBpZiByZS50ZXN0KGZpbGUpXG4gICAgICBpZ25vcmUgPSB0cnVlXG4gICAgICBicmVha1xuICByZXR1cm4gaWdub3JlXG5cbmVuZHNXaXRoID0gKHN0ciwgc3VmZml4KSAtPlxuICBpZiBzdHI/IGFuZCBzdWZmaXg/XG4gICAgcmV0dXJuIHN0ci5pbmRleE9mKHN1ZmZpeCwgc3RyLmxlbmd0aCAtIHN1ZmZpeC5sZW5ndGgpICE9IC0xXG4gIHJldHVybiBmYWxzZVxuXG5mb3JtYXREYXRlID0gKGRhdGUpIC0+XG4gIG1vbnRocyA9IFtcbiAgICAgICdKYW4nLFxuICAgICAgJ0ZlYicsXG4gICAgICAnTWFyJyxcbiAgICAgICdBcHInLFxuICAgICAgJ01heScsXG4gICAgICAnSnVuJyxcbiAgICAgICdKdWwnLFxuICAgICAgJ0F1ZycsXG4gICAgICAnU2VwJyxcbiAgICAgICdPY3QnLFxuICAgICAgJ05vdicsXG4gICAgICAnRGVjJyxcbiAgXVxuICBhbXBtID0gJ0FNJ1xuICBob3VyID0gZGF0ZS5nZXRIb3VycygpXG4gIGlmIChob3VyID4gMTEpXG4gICAgYW1wbSA9ICdQTSdcbiAgICBob3VyID0gaG91ciAtIDEyXG4gIGlmIChob3VyID09IDApXG4gICAgaG91ciA9IDEyXG4gIG1pbnV0ZSA9IGRhdGUuZ2V0TWludXRlcygpXG4gIGlmIChtaW51dGUgPCAxMClcbiAgICBtaW51dGUgPSAnMCcgKyBtaW51dGVcbiAgcmV0dXJuIG1vbnRoc1tkYXRlLmdldE1vbnRoKCldICsgJyAnICsgZGF0ZS5nZXREYXRlKCkgKyAnLCAnICsgZGF0ZS5nZXRGdWxsWWVhcigpICsgJyAnICsgaG91ciArICc6JyArIG1pbnV0ZSArICcgJyArIGFtcG1cblxuZGVidWcgPSAoY2FsbGJhY2spIC0+XG4gIGlmIGZzLmV4aXN0c1N5bmMoX19kaXJuYW1lICsgcGF0aC5zZXAgKyAnd2FrYXRpbWUtbWFzdGVyJylcbiAgICB0cnlcbiAgICAgIHJpbXJhZihfX2Rpcm5hbWUgKyBwYXRoLnNlcCArICd3YWthdGltZS1tYXN0ZXInLCAtPlxuICAgICAgICBpZiBjYWxsYmFjaz9cbiAgICAgICAgICBjYWxsYmFjaygpXG4gICAgICApXG4gICAgY2F0Y2ggZVxuICAgICAgbG9nLndhcm4gZVxuICAgICAgaWYgY2FsbGJhY2s/XG4gICAgICAgIGNhbGxiYWNrKClcbiAgZWxzZVxuICAgIGlmIGNhbGxiYWNrP1xuICAgICAgY2FsbGJhY2soKVxuIl19
