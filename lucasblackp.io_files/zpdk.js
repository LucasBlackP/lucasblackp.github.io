/*! zpdk 12-07-2019 */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else if (typeof define === 'function' && (define.amd || define.cmd)) {
    define(factory);
  } else {
    root.ZaloPay = root.ZaloPay || {};
    factory.call(root, root.ZaloPay);
  }
})(this, function (ZaloPay) {

  ZaloPay = ZaloPay || {};
  ZaloPay.ua = navigator.userAgent;
  ZaloPay.jsVersion = '1.0.0';
  ZaloPay.isDebug = true;
  ZaloPay.isZaloPay = (function () {
    return ZaloPay.ua.indexOf('ZaloPayClient') > -1;
  })();
  if (!ZaloPay.isZaloPay) {
    writeLog('warn', 'Run in ZaloPayClient please!');
  }
  ZaloPay.appVersion = (function () {
    if (ZaloPay.isZaloPay) {
      var version = ZaloPay.ua.match(/ZaloPayClient\/(.*)/);
      return version && version.length ? version[1] : '';
    }
  })();
  ZaloPay.appInfo = {
    name: 'ZaloPay',
    isZaloPay: ZaloPay.isZaloPay,
    jsVersion: ZaloPay.jsVersion,
    appVersion: ZaloPay.appVersion
  };
  ZaloPay.on = function (event, fn) {
    event.split(/\s+/g).forEach(function (eventName) {
      document.addEventListener(eventName, fn, false);
    });
  };
  ZaloPay.call = function () {
    var args = [].slice.call(arguments);
    if (window.ZaloPayJSBridge && window.ZaloPayJSBridge.call) {
      var name = args[0],
        opt = args[1] || {},
        cb = args[2];
      if (!isStr(name)) {
        writeLog('error', 'ZaloPay.call', 'Request undefined function!');
        return;
      }
      if (cb === undefined && isFn(opt)) {
        cb = opt;
        opt = {};
      }
      if (!isObj(opt)) {
        writeLog('error', 'ZaloPay.call', 'Request undefined options!');
        return;
      }
      var _callback = cb;
      cb = function (result) {
        // for api without callback, don't care result, prevent loop infinity on android
        if (_callback) {
          result = checkError(result, name);
          _callback(result);
        }
      };
      'writeLog' !== name &&
        writeLog('info', 'ZaloPayJSBridge.call', name, opt, _callback);
      window.ZaloPayJSBridge.call(name, opt, cb);
    } else {
      ZaloPay._apiQueue = ZaloPay._apiQueue || [];
      ZaloPay._apiQueue.push(args);
    }
  };
  ZaloPay._ready = function (fn) {
    if (window.ZaloPayJSBridge && window.ZaloPayJSBridge.call) {
      fn && fn();
    } else {
      ZaloPay.on('ZaloPayJSBridgeReady', fn);
    }
  };
  ZaloPay.ready = ZaloPay.ready || ZaloPay._ready;

  /**
   * ZaloPay.showLoading();
   */
  ZaloPay.showLoading = function () {
    ZaloPay.call('showLoading');
  };

  /**
   * ZaloPay.hideLoading();
   */
  ZaloPay.hideLoading = function () {
    ZaloPay.call('hideLoading');
  };

  /**
   * ZaloPay.closeWindow();
   */
  ZaloPay.closeWindow = function () {
    ZaloPay.call('closeWindow');
  };

  /**
   * ZaloPay.showDialog({
   *    title: "Hello",
   *    message: "Test",
   *    button: "OK"
   * });
   * NORMAL_TYPE = 0;
   * ERROR_TYPE = 1;
   * SUCCESS_TYPE = 2;
   * WARNING_TYPE = 3;
   * INFO_NO_ICON = 4;
   * PROGRESS_TYPE = 5;
   * UPDATE_TYPE = 6;
   * INFO_TYPE = 7;
   * CUSTOM_CONTENT_VIEW = 8;
   * UPDATE = 9;
   * NO_INTERNET = 10;
   */
  ZaloPay.showDialog = function (opt) {
    if (!isObj(opt)) {
      writeLog('error', 'ZaloPay.showDialog', 'Received invalid object');
      return;
    }
    if (isStr(opt.title) && isStr(opt.message) && isStr(opt.positivebutton) && isStr(opt.negativebutton)) {
      opt = {
        title: opt.title,
        message: opt.message,
        positivebutton: opt.positivebutton,
        negativebutton: opt.negativebutton
      };
      ZaloPay.call('showDialog', opt);
    }
  };
  
  /**
   * ZaloPay.payOrder({
   *    appid: 3,
   *    appuser: "pmqc",
   *    apptime: 1486713401300,
   *    amount: 20000,
   *    apptransid: 170210144922653,
   *    embeddata: "embeddata123",
   *    item: "item123",
   *    description: "description123",
   *    mac: "5815251181fcf7d80d056ec8298f81dcc1654eb9edb3c19a961ef43eb129c307"
   * }, cb);
   * ZaloPay.payOrder({
   *    appid: 3,
   *    zptranstoken: "gOAWGD_NK4DFoq0mTA0iTw"
   * }, cb);
   */
  ZaloPay.payOrder = function (opt, cb) {
    if (!isObj(opt)) {
      writeLog('error', 'ZaloPay.payOrder', 'Received invalid object');
      return;
    }
    if (isStr(opt.zptranstoken)) {
      opt = {
        zptranstoken: opt.zptranstoken,
        appid: opt.appid
      };
      writeLog('info', 'ZaloPay.payOrder', 'Received zptranstoken', opt);
      ZaloPay.call('payOrder', opt, cb);
      return;
    } 
    writeLog('error', 'ZaloPay.payOrder', 'Received missing require param!');
  };

  /**
  else if (isStr(opt.mac)) {
    opt = {
      appid: opt.appid,
      appuser: opt.appuser,
      apptime: opt.apptime,
      amount: opt.amount,
      apptransid: opt.apptransid,
      embeddata: opt.embeddata,
      item: opt.item,
      description: opt.description,
      mac: opt.mac
    };
    writeLog('info', 'ZaloPay.payOrder', 'Received transinfo', opt);
    ZaloPay.call('payOrder', opt, cb);
    return;
  }
  */

  /**
   * ZaloPay.setToolbarActions([{
   *    iconId: "1",
   *    iconName: "personal_settingaccount",
   *    iconColor: "#000000"
   * },{
   *    iconId: "2",
   *    iconLink: "https://cdn0.iconfinder.com/data/icons/entypo/92/button2-48.png"
   * }]);
  ZaloPay.setToolbarActions = function (opt, cb) {
    if (!isArr(opt) || opt.length < 1 || !isFn(cb)) {
      writeLog('error', 'ZaloPay.setToolbarActions', 'Received invalid object');
      return;
    }
    var options = [];
    opt.forEach(function (v, k) {
      if (isStr(v.iconId)) {
        if (isStr(v.iconLink)) {
          options.push({
            iconId: v.iconId,
            func: cb.name,
            iconLink: v.iconLink,
            iconName: '',
            iconColor: ''
          });
        } else {
          if (isStr(v.iconName)) {
            if (isStr(v.iconColor)) {
              options.push({
                iconId: v.iconId,
                func: cb.name,
                iconLink: '',
                iconName: v.iconName,
                iconColor: v.iconColor
              });
            } else {
              options.push({
                iconId: v.iconId,
                func: cb.name,
                iconLink: '',
                iconName: v.iconName,
                iconColor: ''
              });
            }
          }
        }
      }
    });
    if (options.length > 0) {
      ZaloPay.call('setToolbarActions', { data: options });
      document.addEventListener(cb.name, cb, false);
      return;
    }
    writeLog(
      'error',
      'ZaloPay.setToolbarActions',
      'Received missing require param!',
      opt
    );
  };
 */

  ZaloPay._ready(function () {
    writeLog('info', 'ZaloPayJS Ready!');
    var apiQueue = ZaloPay._apiQueue || [];

    function next() {
      ZaloPay.requestAnimationFrame(function () {
        var args = apiQueue.shift();
        ZaloPay.call.apply(null, args);
        if (apiQueue.length) next();
      });
    }
    !!apiQueue.length && next();
  });

  [
    'showLoading',
    'hideLoading',
    'closeWindow',
    'showDialog',
    'payOrder'
  ].forEach(function (methodName) {
    ZaloPay[methodName] = function () {
      var args = [].slice.call(arguments);
      ZaloPay.call.apply(null, [methodName].concat(args));
    };
  });

  function isAndroid() {
    return /android/i.test(ZaloPay.ua);
  }

  function isIOS() {
    return /iphone|ipad|ipod/i.test(ZaloPay.ua);
  }

  function isArr(fn) {
    return 'array' === type(fn);
  }

  function isFn(fn) {
    return 'function' === type(fn);
  }

  function isStr(str) {
    return 'string' === type(str);
  }

  function isObj(o) {
    return 'object' === type(o);
  }

  function isNumber(num) {
    return 'number' === type(num);
  }

  function type(obj) {
    return Object.prototype.toString
      .call(obj)
      .replace(/\[object (\w+)\]/, '$1')
      .toLowerCase();
  }

  function writeLog() {
    var time = +new Date();
    var arg = [].slice.call(arguments);
    var type = arg[0].toLowerCase().trim();
    switch (type) {
      case 'error':
        arg.splice(0, 1);
        arg.length === 1
          ? console.error(time, arg[0])
          : console.error(time, arg);
        break;
      case 'warn':
        arg.splice(0, 1);
        arg.length === 1 ? console.warn(time, arg[0]) : console.warn(time, arg);
        break;
      case 'info':
        arg.splice(0, 1);
        arg.length === 1 ? console.log(time, arg[0]) : console.log(time, arg);
        break;
      default:
        type = 'info';
        arg.length === 1 ? console.log(time, arg[0]) : console.log(time, arg);
        break;
    }
    if (
      ZaloPay.isDebug &&
      ZaloPay.call &&
      window.ZaloPayJSBridge &&
      window.ZaloPayJSBridge.call
    ) {
      var opt = {
        type: type,
        time: time,
        data: JSON.stringify(arg)
      };
      ZaloPay.call('writeLog', opt);
    }
  }

  function checkError(result, name) {
    result = result || {};
    result.errorCode = result.error || 0;
    if (result.error !== 1) {
      writeLog(
        'error',
        name +
        ': errorCode[' +
        result.errorCode +
        '], message[' +
        result.errorMessage +
        ']'
      );
    } else {
      writeLog(
        'info',
        name +
        ': errorCode[' +
        result.errorCode +
        '], message[' +
        result.errorMessage +
        ']'
      );
    }
    return result;
  }

  function compareVersion(targetVersion) {
    var appVersion = ZaloPay.appVersion.split('.');
    targetVersion = targetVersion.split('.');
    for (var i = 0, n1, n2; i < appVersion.length; i++) {
      n1 = parseInt(targetVersion[i], 10) || 0;
      n2 = parseInt(appVersion[i], 10) || 0;
      if (n1 > n2) return -1;
      if (n1 < n2) return 1;
    }
    return 0;
  }
  return ZaloPay;
});