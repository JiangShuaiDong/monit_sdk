
!function (entrance) {
    "use strict";
    if ("object" === typeof exports && "undefined" !== typeof module) {
        module.exports = entrance();
    } else if ("function" === typeof define && define.amd) {
        define([], entrance());
    } else {
        var f;
        if ("undefined" !== typeof window) {
            f = window;
        } else {
            throw new Error('wrong execution environment');
        }
        f.M2 = entrance();
    }
}(function () {
    "use strict";
    var MONIT_CONIFG = {};
    var isType = function (type) {
        return function (obj) {
            return Object.prototype.toString.call(obj) === '[object ' + type + ']';
        };
    };
    /**
     * cookie函数
     */
    var $cookie = {
        get: function (name) {
            var allCookie = '' + window.document.cookie;
            var index = allCookie.indexOf(name);
            if (name === undefined || name === '' || index === -1) return '';
            var ind1 = allCookie.indexOf(';', index);
            if (ind1 == -1) ind1 = allCookie.length;
            return unescape(allCookie.substring(index + name.length + 1, ind1));
        },
        set: function (name, value, days, domain, path) {
            var date = new Date();
            days = days || 730; // two years
            path = path || '/';
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            var expires = '; expires=' + date.toGMTString();
            var cookieValue = name + '=' + value + expires + '; path=' + path;
            
            if (domain) {
                cookieValue += '; domain=' + domain;
            }
            window.document.cookie = cookieValue;
        },
        remove: function (name) {
            if ($cookie.get(name)) {
                $cookie.set(name, '', -1, '/');
            }
        }
    };
    /**
    * localStorage函数
    */
    var $localStorage = {
        is: function () {
            var mod = 'modernizr';
            try {
                window.localStorage.setItem(mod, mod);
                window.localStorage.removeItem(mod);
                return true;
            } catch (e) {
                return false;
            }
        },
        get: function (name) {
            if ($localStorage.is()) {
                return window.localStorage.getItem(name);
            } else {
                console.log('localStorage error: get ' + name);
            }
        },
        set: function (name, value) {
            if ($localStorage.is()) {
                return window.localStorage.setItem(name, value);
            } else {
                console.log('localStorage error: set name:' + name + ',value:' + value);
            }
        },
        remove: function (name) {
            if ($localStorage.is()) {
                return window.localStorage.removeItem(name);
            } else {
                console.log('localStorage error: remove ' + name);
            }
        }
    };
    /**
     * sessionStorage函数
     */
    var $sessionStorage = {
        is: function () {
            var mod = 'modernizr';
            try {
                window.sessionStorage.setItem(mod, mod);
                window.sessionStorage.removeItem(mod);
                return true;
            } catch (e) {
                return false;
            }
        },
        get: function (name) {
            if ($sessionStorage.is()) {
                return window.sessionStorage.getItem(name);
            } else {
                console.log('sessionStorage error: get ' + name);
            }
        },
        set: function (name, value) {
            if ($sessionStorage.is()) {
                return window.sessionStorage.setItem(name, value);
            } else {
                console.log('sessionStorage error: set name:' + name + ',value:' + value);
            }
        },
        remove: function (name) {
            if ($sessionStorage.is()) {
                return window.sessionStorage.removeItem(name);
            } else {
                console.log('sessionStorage error: remove ' + name);
            }
        }
    };
    /**
     * 帮助函数
     */
    var tool = {
        encodeObject2URIString: function (obj) {
            if (typeof obj === 'string') {
                return obj;
            }
            var arr = [];
            for (var n in obj) {
                if (!obj.hasOwnProperty(n) || typeof obj[n] === 'function') {
                    continue;
                }
                arr.push(encodeURIComponent(n) + '=' + encodeURIComponent(obj[n]));
            }
            return arr.join('&');
        },
        stringify: function (obj) {
            var t = typeof obj;
            var callee = tool.stringify;
            if (t !== 'object' || obj === null) {
                if (t === 'string') {
                    obj = '"' + obj + '"';
                }
                return String(obj);
            } else {
                if (typeof JSON === 'object' && JSON.stringify) {
                    return JSON.stringify(obj);
                }
                var v;
                var json = [];
                var arr = obj && obj.constructor === Array;
                for (var n in obj) {
                    if (obj.hasOwnProperty(n)) {
                        v = obj[n];
                        t = typeof v;
                        if (t === 'string') {
                            v = '"' + v + '"';
                        }
                        else if (t === 'object' && v !== null) {
                            v = callee(v);
                        }
                        json.push((arr ? '' : '"' + n + '":') + String(v));
                    }
                }
                return (arr ? '[' : '{') + String(json) + (arr ? ']' : '}');
            }
        },
        parseJSON: function (data) {
            var rvalidchars = /^[\],:{}\s]*$/;
            var rvalidescape = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g;
            var rvalidtokens = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g;
            var rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g;
            if (typeof data === 'object') {
                return data;
            }
            if (typeof data !== 'string' || !data) {
                return null;
            }
            data = data.replace(/(^\s+)|(\s+$)/g, '');
            if (rvalidchars.test(data.replace(rvalidescape, '@').replace(rvalidtokens, ']').replace(rvalidbraces, ''))) {
                return window.JSON && window.JSON.parse ? window.JSON.parse(data) : (new Function('return ' + data))();
            } else {
                return data;
            }
        },
        // 绑定函数中的this关键字
        bind: function (func, context) {
            if (Function.prototype.bind) {
                return func.bind(context);
            }
            return function () {
                func.apply(context, arguments);
            };
        },
        hasSearch: function (str, data) {
            var symbol = '';
            if (/\?/.test(str)) {
                symbol = '&';
            } else {
                symbol = '?';
            }
            return str + symbol + data;
        },
        /**
         *
         * @param obj [object] 需要遍历的那个对象
         * @param callback [function] 回调函数
         */

        forIn: function (obj, callback) {
            if (!tool.isObject(obj)) {
                return;
            }
            for (var n in obj) {
                if (obj.hasOwnProperty(n)) {
                    callback.call(null, n, obj[n]);
                }
            }
        },
        each: (function () {
            if ([].forEach) {
                return function (list) {
                    [].forEach.apply(list, [].slice.call(arguments, 1));
                };
            }
            return function (list, callback) {
                for (var i = 0, len = list.length; i < len; i++) {
                    callback.call(arguments[2], list[i], i, list);
                }
            };
        })(),
        init: function () {
            tool.each(['Object', 'String', 'Function', 'Array'], function (item) {
                tool['is' + item] = isType(item);
            });
        },
        isPureObject: function (data) {
            return !!(tool.isObject(data) && data.constructor === Object);
        }
    };
    tool.init();
    
    //浏览器相关信息
    var Browser = {
        init: function(){
            var obj = {
                title: document.title || '',
                url: Browser.getUrl(),
                guid: Browser.getGuid(),
                referrer: Browser.getReferrer(),
                userAgent:Browser.ua,
                browser: Browser.getBrowser(),
                viewportSize: Browser.getViewportSize(),
                lang: Browser.getLang(),
                appenv: Browser.getAppenv(),
                isAdmin: Browser.isAdmin
            };
            tool.forIn(obj,function(key,value){
                MONIT_CONIFG[key] = value;
            })
        },
        isAdmin: $cookie.get('is_admin') || '',
        getLang: function(){
            var _lang = $cookie.get('felangague');
            if(!_lang){
                _lang = window.navigator.language || window.navigator.systemLanguage
            }
            return _lang;
        },
        ua: window.navigator.userAgent,
        getBrowser : function() {
            var ua = Browser.ua.toLowerCase();
            var browsers = {
                '360se-ua':'360se',
                'TT':'tencenttraveler',
                'Maxthon':'maxthon',
                'GreenBrowser':'greenbrowser',
                'Sogou':'se 1.x / se 2.x',
                'TheWorld':'theworld'
            };

            for(var i in browsers){
                if(ua.indexOf(browsers[i]) > -1) {
                    return i;
                }
            }

            var is360se = false;
            try{
                if(+external.twGetVersion(external.twGetSecurityID(window)).replace(/\./g,"") > 1013) {
                    is360se = true;
                }
            }catch(e){ }

            if(is360se) {
                return "360se-noua";
            }

            var result = ua.match(/(msie|chrome|safari|firefox|opera|trident)/);
            result = result ? result[0] : '';

            if(result == 'msie') {
                result = ua.match(/msie[^;]+/) + '';
            } else if(result == 'trident') {
                ua.replace(/trident\/[0-9].*rv[ :]([0-9.]+)/ig, function(a, c) {
                    result = 'msie ' + c;
                });
            }

            return result;
        },
        getAppenv: function(){
            var env = $cookie.get('appenv') || '';
            var s_env = $sessionStorage.get('appenv');
            if(!env){
                if(!s_env){
                    env = 'test';
                }
                $sessionStorage.set('appenv',env);
            }
            return env;
        },
        //获取页面URL
        getUrl: function () {
            var url = '';
            //避免IE下设置domain后，读取location.href属性报权限错误
            try {
                url = location.href;
            } catch (e) {
                url = document.createElement('a');
                url.href = '';
                url = url.href;
            }
            return url;
        },
        //获取来源
        getReferrer: function () {
            var referrerKey = "__referrer",
                id = $sessionStorage.get(referrerKey),
                newId = window.location.referrer,
                url = document.URL || window.location.href;
            if(!id){
                if(newId && newId != id){
                    id = newId;
                }
                if(!newId){
                    id = Browser.getUrl();
                }
                $sessionStorage.set(referrerKey,id);
            }
            return id;
        },
        //浏览器视窗大小
        getViewportSize: function () {
            var that = this;
            try {
                var doc = top.document.documentElement
                    , g = (e = top.document.body) && top.document.clientWidth && top.document.clientHeight;
            } catch (e) {
                var doc = document.documentElement
                    , g = (e = document.body) && document.clientWidth && document.clientHeight;
            }
            var vp = [];
            doc && doc.clientWidth && doc.clientHeight && ("CSS1Compat" === document.compatMode || !g) ? vp = [doc.clientWidth, doc.clientHeight] : g && (vp = [doc.clientWidth, doc.clientHeight]);
            return tool.stringify({w:vp[0],h:vp[1]});
        },
		isLocal: function() {
            var _isLocal = true;
            var protocol = window.location.protocol.toLowerCase();
            if(protocol == 'http:' || protocol == 'https:') {
                _isLocal = false;
            }
            return _isLocal;
        },
        getGuid : function() {
            var guidKey = '__guid',
                nav = window.navigator,
                doc = document,
                screen = window.screen,
                domain = Browser.isLocal() ? '' : document.domain.toLowerCase(),
                ua = nav.userAgent.toLowerCase(),
                id = $cookie.get(guidKey);
            function hash(s) {
                var h = 0,
                    g = 0,
                    i = s.length - 1;
                for(i; i>= 0; i--) {
                    var code = parseInt(s.charCodeAt(i), 10);
                    h = ((h << 6) & 0xfffffff) + code + (code << 14);
                    if ((g = h & 0xfe00000) != 0) {
                        h = (h ^ (g >> 21));
                    }
                }
                return h;
            }

            function guid() {
                var s = [nav.appName, nav.version, nav.language || nav.browserLanguage, nav.platform, nav.userAgent, screen.width, 'x', screen.height, screen.colorDepth, doc.referrer].join(""),
                    sLen = s.length,
                    hLen = window.history.length;

                while(hLen) {
                    s += (hLen--) ^ (sLen++);
                }

                return (Math.round(Math.random() * 2147483647) ^ hash(s)) * 2147483647;
            }
            if(!id) {
                id = [ hash(Browser.isLocal() ? '' : doc.domain), guid(), +new Date + Math.random() + Math.random() ].join('.');

                var config = {
                    expires : 300,
                    domain: 'localhost',
                    path : '/'
                };

                //如果是设置了guidCookieDomains，__guid放在guidCookieDomain域下
                var guidCookieDomains = ['bw.cn','brandwisdom.cn','jointwisdom.cn'];
                if(guidCookieDomains.length) {
                    for(var i = 0; i < guidCookieDomains.length; i++) {
                        var guidCookieDomain = guidCookieDomains[i],
                            gDomain = '.' + guidCookieDomain;

                        if((domain.indexOf(gDomain) > 0 && domain.lastIndexOf(gDomain) == domain.length - gDomain.length) || domain == guidCookieDomain) {
                            config.domain = gDomain;
                            break;
                        }
                    }
                }
                $cookie.set(guidKey, id, config.expires,config.domain,config.path);
            }

            return id;
        },
    };
    /**
     * Element元素事件函数
     */
    var $element = {
        clickInit: function(callback){
            $element._event(document, 'click', function (e) {
                var _target = e.target || e.srcElement;
                var eleObj = {
                    m_type: 1,
                    attributes: $element.getAttributeList(_target,true),
                    parentAttributes: $element.getAttributeList($element.parentNode(_target,"div"),false)
                };
                tool.forIn(eleObj,function(key,value){
                    MONIT_CONIFG[key] = value;
                })
                console.log('发起埋点.......');
                callback();
            }, true);
        },
        parentNode : function(el, tagName, deep) {
            deep = deep || 50;
            tagName = tagName.toUpperCase();
            if(el.tagName === 'BODY' || el.tagName === 'HTML'){
                return el;
            }
            while(el && deep-- > 0) {
                if(el.tagName === tagName && el.className !=='') {
                    return el;
                }
                el = el.parentNode;
            }
            return el;
        },
        getAttributeList: function(el,bool){
            var obj = {};
            var list = el.attributes || [];
            var cid = '';
            if(!el.tagName){
                return '';
            }
        
            obj['tagName'] = el.tagName;
            obj['tagText'] = $element.getText(el);
            
            tool.each(list,function(a,b,list){
                if(a.name === 'cid'){
                    if(bool){
                        cid = a.value;
                    }else{
                        obj[a.name] = encodeURIComponent(a.value);
                    }
                }else{
                    obj[a.name] = encodeURIComponent(a.value);
                }
                MONIT_CONIFG['cid'] = cid;
            });
            return tool.stringify(obj);
        },
        getText : function(el) {
            var str = "";

            if(el.tagName.toLowerCase() == 'input') {
                str =  el.value || '';
            } else if(el.tagName.toLowerCase() != 'body' && el.tagName.toLowerCase() != 'html') {
                if(el.childNodes.length<=1){
                    str = el.innerText || el.textContent || '';
                }
            }
            
            return str.replace(/^\s*|\s*$/g, "").substr(0, 100);
        },
        _event: (function () {
            /**
             * @param {Object} element //element
             * @param {string} type //事件类型
             * @param {function(...[*])} handler //事件函数
             * @param {boolean=} useCapture
             */
            var register_event = function (element, type, handler, useCapture) {
                if (!element) {
                    console.error('No valid element provided to register_event');
                    return;
                }
    
                if (element.addEventListener) {
                    element.addEventListener(type, handler, !!useCapture);
                } else {
                    var ontype = 'on' + type;
                    var old_handler = element[ontype];
                    element[ontype] = makeHandler(element, handler, old_handler);
                }
            };
    
            function makeHandler(element, new_handler, old_handlers) {
                var handler = function (event) {
                    event = event || fixEvent(window.event);
                    if (!event) {
                        return undefined;
                    }
    
                    var ret = true;
                    var old_result, new_result;
                    //检测是否是函数
                    if (/^\s\bfunction\b/.test(old_handlers)) {
                        old_result = old_handlers(event);
                    }
                    new_result = new_handler.call(element, event);
    
                    if ((false === old_result) || (false === new_result)) {
                        ret = false;
                    }
    
                    return ret;
                };
    
                return handler;
            }
    
            function fixEvent(event) {
                if (event) {
                    event.preventDefault = fixEvent.preventDefault;
                    event.stopPropagation = fixEvent.stopPropagation;
                }
                return event;
            }
            fixEvent.preventDefault = function () {
                this.returnValue = false;
            };
            fixEvent.stopPropagation = function () {
                this.cancelBubble = true;
            };
    
            return register_event;
        })(),

    };
    /**
     * monit支撑函数
     */
    var $monit = {
        postMonit: function(){
            var setIMG = new Image();
            var img_location = "http://analysis.brandwisdom.cn/tj.gif";
            var params = '';
            var user = tool.parseJSON($sessionStorage.get('M2_USER'));
            MONIT_CONIFG['pid'] = window.M2_PNAME || '';
            MONIT_CONIFG['uid'] = user.uid || '';
            MONIT_CONIFG['hid'] = user.hid || '';
            MONIT_CONIFG['custom_tag'] = $sessionStorage.get('M2_CUSTOM_TAG') || ''
            if (!MONIT_CONIFG['pid']) {
                throw new TypeError('M2_PNAME is not null....');
            }
            tool.forIn(MONIT_CONIFG,function(key,value){
                params += '&' + key + '=' + value;
            })
            setIMG.src = img_location + '?t=' + new Date().getTime() + params;
        },
          /**
         * 设置用户信息
         * @param option Object
         */
        setUserInfo: function (option) {
            if(tool.isArray(option)||tool.isObject(option)){
                var _user = {
                    uid: option.uid || '',
                    hid: option.hid || ''
                };
                $sessionStorage.set('M2_USER',tool.stringify(_user));
            };
            tool.forIn(_user,function(key,value){
                MONIT_CONIFG[key] = value;
            });
        },
         /**
         * 设置自定义属性
         * @param option Object
         */
        setAttrs: function (option) {
            if(!tool.isObject(option)){
                throw new TypeError('格式不正确');
            };
            var _tag = $sessionStorage.get('M2_CUSTOM_TAG');
            var _tagJson = tool.parseJSON(_tag);
            if(!_tag){
                _tagJson = option;
            }else{
                tool.forIn(option,function(key,value){
                    if(tool.isArray(value) || tool.isObject(value)){
                        _tagJson[key] = tool.stringify(value);
                    }else{
                        _tagJson[key] = value;
                    }
                });
            }
            $sessionStorage.set('M2_CUSTOM_TAG',tool.stringify(_tagJson));
        },
        getAttr: function(name){
            var _tag = $sessionStorage.get('M2_CUSTOM_TAG');
            if(!_tag){
                return '无设置自定义属性';
            }
            if(name){
                return tool.parseJSON(_tag)[name];
            }
            return tool.parseJSON(_tag);
        },
        removeAttr: function(name){
            var _tag = $sessionStorage.get('M2_CUSTOM_TAG');
            var _tagJson = '';
            var _newJson = {};
            if(!_tag&&!name){
                return '无设置自定义属性';
            }
            _tagJson = tool.parseJSON(_tag);
            if(!_tagJson[name]){
                return '未查到此属性';
            }else{
                tool.forIn(_tagJson,function(key,value){
                    if(key !== name){
                        _newJson[key] = value;
                    }
                })
                $sessionStorage.set('M2_CUSTOM_TAG',tool.stringify(_newJson));
                return '删除成功';
            }
        }
    }
    /**
     * 埋点方法管理类
     * @constructor
     */
    var Manager = function () {
        Browser.init();
    };
   
    //埋点初始化方法
    Manager.prototype.init = function () {
        var that = this;
        $element.clickInit(function(){
            $monit.postMonit();
        });
    };
     //代码埋点方法
     Manager.prototype.setMoint = function (el,obj,cid) {
        var _target = el ? el.target || el.srcElement : false;
        MONIT_CONIFG['m_type'] = 3;
        MONIT_CONIFG['cid'] = cid;
        MONIT_CONIFG['attributes'] = '';
        MONIT_CONIFG['parentAttributes'] = '';
        if(_target){
            MONIT_CONIFG['attributes'] = $element.getAttributeList(_target,true);
            MONIT_CONIFG['parentAttributes'] = $element.getAttributeList($element.parentNode(_target,"div"),false);
        }
        $monit.setAttrs(obj);
        $monit.postMonit();
    };
    //埋点历史方法
    Manager.prototype._getQuest = function (el,obj,cid) {
        var _target = el ? el.target || el.srcElement : false;
        MONIT_CONIFG['m_type'] = 3;
        MONIT_CONIFG['cid'] = cid;
        MONIT_CONIFG['attributes'] = '';
        MONIT_CONIFG['parentAttributes'] = '';
        if(_target){
            MONIT_CONIFG['attributes'] = $element.getAttributeList(_target,true);
            MONIT_CONIFG['parentAttributes'] = $element.getAttributeList($element.parentNode(_target,"div"),false);
        }
        $monit.setAttrs(obj);
        $monit.postMonit();
    };

    var baseInstance = new Manager();
    //初始化无痕埋点
    baseInstance.init();
    /**
     * 入口
     * @param conf
     * @returns {*}
     */
    var entrance = function (conf) {
        if (!tool.isObject(conf)) {
            throw new TypeError('参数不正确');
        }
        var options = {

        };
        tool.forIn(options, function (key) {
            options[key] = conf[key] || options[key];
        });
        return '';
    };
    tool.forIn({
        getQuest: '_getQuest',
        setMoint: 'setMoint',
        getAttr: 'getAttr',
        setAttrs: 'setAttrs',
        removeAttr: 'removeAttr',
        setUserInfo: 'setUserInfo'
    }, function (key, value) {
        entrance[key] = function () {
            if(baseInstance[value]){
                return baseInstance[value].apply(null, arguments);
            }else{
                return $monit[value].apply(null, arguments);
            }
        };
    });
    entrance.version = '0.9.0';
    return entrance;
});