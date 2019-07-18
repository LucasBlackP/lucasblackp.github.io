function initializeWebBridge() {
  //  alert('execute to initializeWebBridge');
    ZaloPayJSBridge = window.ZaloPayJSBridge || {};
    ZaloPayJSBridge.callbackPool = ZaloPayJSBridge.callbackPool || {};
    
    ZaloPayJSBridge.post = (function () {
        var actionQueue = [];
        var createBridge = function () {
            var iFrame;
            iFrame = document.createElement("iframe");
            iFrame.setAttribute("src", "ZaloPayJSBridge://__BRIDGE_LOADED__");
            iFrame.setAttribute("style", "display:none;");
            iFrame.setAttribute("height", "0px");
            iFrame.setAttribute("width", "0px");
            iFrame.setAttribute("frameborder", "0");
            document.body.appendChild(iFrame);
            setTimeout(function () {
                       document.body.removeChild(iFrame)
                       }, 0);
        };
        
        var callNativeHandler = function (msgObject) {
                if (window.webkit && window.webkit.messageHandlers
                    && window.webkit.messageHandlers.ZaloPayJSBridge
                    && window.webkit.messageHandlers.ZaloPayJSBridge.postMessage) {
                            window.webkit.messageHandlers.ZaloPayJSBridge.postMessage(msgObject)
                } else {
                        actionQueue.push(msgObject);
                        createBridge();
                }
        };
                            
        var getAndClearQueuedActions = function () {
                            var json = JSON.stringify(actionQueue);
                            actionQueue = [];
                            return json;
        };
                            
        return {
            callNativeHandler: callNativeHandler,
            fetchValue: getAndClearQueuedActions
        }
    })();
    
    ZaloPayJSBridge.test = function () {
        var msgObject = {
                           msgkey: "call",
                           msgdata: "test",
                           };
        ZaloPayJSBridge.post.callNativeHandler(msgObject)
    };
    
    // call
    ZaloPayJSBridge.call = function (func, param, callback) {
        if ('string' !== typeof func) {
            return;
        }
        if ('function' === typeof param) {
            callback = param;
            param = null;
        } else if (typeof param !== 'object') {
            param = null;
        }
        var clientId = '' + new Date().getTime()+(Math.random());
        if ('function' === typeof callback) {
            ZaloPayJSBridge.callbackPool[clientId] = callback;
        }
        var invokeMsg = JSON.stringify({
                                       func: func,
                                       param: param,
                                       msgType: 'call',
                                       clientId: clientId
                                       });
        var msgData = {
        func: func,
        param: param,
        msgType: 'call',
        clientId: clientId
        };
        var msgObject = {
        msgkey: "call",
        msgdata: msgData
        };
        console.log("ZaloPayJSBridge.callNativeFunction: " + invokeMsg);
        
        ZaloPayJSBridge.post.callNativeHandler(msgObject);
    }
    // callback
    ZaloPayJSBridge.callback = function (clientId, param) {
        var invokeMsg = JSON.stringify({
                                       clientId: clientId,
                                       param: param
                                       });
        var msgData = {
        param: param,
        clientId: clientId
        };

        var msgObject = {
        msgkey: "callback",
        msgdata: msgData
        };
        ZaloPayJSBridge.post(msgObject);
    }
    // trigger
    ZaloPayJSBridge.trigger = function (name, param, clientId) {
        if (name) {
            var evt = document.createEvent('Events');
            evt.initEvent(name, false, true);
            if (typeof param === 'object') {
                for (var k in param) {
                    evt[k] = param[k];
                }
            }
            evt.clientId = clientId;
            var prevent = !document.dispatchEvent(evt);
            if (clientId && name === 'back') {
                ZaloPayJSBridge.callback(clientId, {prevent: prevent});
            }if (clientId && name === 'firePullToRefresh') {
                ZaloPayJSBridge.callback(clientId, {prevent: prevent});
            }
        }
    }
    // _invokeJS
    ZaloPayJSBridge._invokeJS = function (resp) {
        
        resp = JSON.parse(resp);
        
        if (resp.msgType === 'callback') {
            var func = ZaloPayJSBridge.callbackPool[resp.clientId];
            if (!(typeof resp.keepCallback == 'boolean' && resp.keepCallback)) {
                delete ZaloPayJSBridge.callbackPool[resp.clientId];
            }
            if ('function' === typeof func) {
                setTimeout(function () {
                           func(resp.param);
                           }, 1);
            }
        } else if (resp.msgType === 'call') {
            resp.func && this.trigger(resp.func, resp.param, resp.clientId);
        }
    }
    var readyEvent = document.createEvent('Events');
    readyEvent.initEvent('ZaloPayJSBridgeReady', false, false);
    document.dispatchEvent(readyEvent);
};
