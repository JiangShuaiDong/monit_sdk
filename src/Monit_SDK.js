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
    window.console = window.console || (function () {
        var c = {};
        c.log = c.warn = c.debug = c.info = c.error = c.time = c.dir = c.profile
            = c.clear = c.exception = c.trace = c.assert = function () {
        };
        return c;
    })();
    var MONIT_SERVER_URL = '';
    var MONIT_CONIFG = {};
    var isLocal;
    //有时候monit.js会在file://或者res://协议下使用，判断下
    (function () {
        isLocal = true;
        try {
            var protocol = location.protocol.toLowerCase();
            if (protocol == 'http:' || protocol == 'https:') {
                isLocal = false;
            }
        } catch (e) {
        }
    })();

    var doc = document,
        nav = window.navigator,
        screen = window.screen,
        domain = isLocal ? '' : doc.domain.toLowerCase(),
        ua = nav.userAgent.toLowerCase();

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
            var allCookie = '' + doc.cookie;
            var index = allCookie.indexOf(name);
            if (name === undefined || name === '' || index === -1) return '';
            var ind1 = allCookie.indexOf(';', index);
            if (ind1 == -1) ind1 = allCookie.length;
            return unescape(allCookie.substring(index + name.length + 1, ind1));
        },
        set: function (name, value, days, domain, path) {
            var date = new Date();
            days = days || 30; // two years
            path = path || '/';
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            var expires = '; expires=' + date.toGMTString();
            var cookieValue = name + '=' + value + expires + '; path=' + path;

            if (domain) {
                cookieValue += '; domain=' + domain;
            }
            doc.cookie = cookieValue;
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
        trim: function (s) {
            return s.replace(/^[\s\xa0\u3000]+|[\u3000\xa0\s]+$/g, "");
        },
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
        init: function () {
            var obj = {
                title: doc.title || '',
                url: Browser.getUrl(),
                guid: Browser.getGuid(),
                referrer: Browser.getReferrer(),
                ua: ua,
                browser: Browser.getBrowser(),
                viewport: Browser.getViewportSize(),
                lang: Browser.getLang(),
                appenv: Browser.getAppenv(),
                is_admin: Browser.isAdmin
            };
            tool.forIn(obj, function (key, value) {
                MONIT_CONIFG[key] = value;
            })
        },
        isAdmin: $cookie.get('is_admin') || '',
        getLang: function () {
            var _lang = $cookie.get('felangague');
            if (!_lang) {
                _lang = nav.language || nav.systemLanguage
            }
            return _lang;
        },
        getBrowser: function () {
            var browsers = {
                '360se-ua': '360se',
                'TT': 'tencenttraveler',
                'Maxthon': 'maxthon',
                'GreenBrowser': 'greenbrowser',
                'Sogou': 'se 1.x / se 2.x',
                'TheWorld': 'theworld'
            };

            for (var i in browsers) {
                if (ua.indexOf(browsers[i]) > -1) {
                    return i;
                }
            }

            var is360se = false;
            try {
                if (+external.twGetVersion(external.twGetSecurityID(window)).replace(/\./g, "") > 1013) {
                    is360se = true;
                }
            } catch (e) {
            }

            if (is360se) {
                return "360se-noua";
            }

            var result = ua.match(/(msie|chrome|safari|firefox|opera|trident)/);
            result = result ? result[0] : '';

            if (result == 'msie') {
                result = ua.match(/msie[^;]+/) + '';
            } else if (result == 'trident') {
                ua.replace(/trident\/[0-9].*rv[ :]([0-9.]+)/ig, function (a, c) {
                    result = 'msie ' + c;
                });
            }

            return result;
        },
        getAppenv: function () {
            var env = $cookie.get('appenv') || '';
            var s_env = $sessionStorage.get('appenv');
            if (!env) {
                if (!s_env) {
                    env = 'test';
                }
                $sessionStorage.set('appenv', env);
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
                url = doc.createElement('a');
                url.href = '';
                url = url.href;
            }
            return url;
        },
        //设置单页切换URL
        setSinglePageUrl: function () {
            var url = Browser.getUrl();
            $sessionStorage.set('__singlePageUrl',url);
        },
        //获取单页切换URL
        getSinglePageUrl: function () {
            var bool = false; //true 当前页面 false 非当前页面
            var thisUrl = doc.URL;
            var __singlePageUrl = $sessionStorage.get('__singlePageUrl');

            if(__singlePageUrl.indexOf(thisUrl)>-1){
                bool = true;
            }
            $sessionStorage.set('__singlePageUrl',doc.URL);
            return bool
        },
        //获取来源
        getReferrer: function () {
            var referrerKey = "__referrer",
                id = $sessionStorage.get(referrerKey),
                newId = doc.referrer;
            if (!id) {
                id = newId || '';
                $sessionStorage.set(referrerKey, id);
            }
            return id;
        },
        //浏览器视窗大小
        getViewportSize: function () {
            var that = this;
            try {
                var doc = top.document.documentElement
                    , g = top.document.body && top.document.clientWidth && top.document.clientHeight;
            } catch (e) {
                var doc = doc.documentElement
                    , g = (e = doc.body) && doc.clientWidth && doc.clientHeight;
            }
            var vp = [];
            doc && doc.clientWidth && doc.clientHeight && ("CSS1Compat" === doc.compatMode || !g) ? vp = [doc.clientWidth, doc.clientHeight] : g && (vp = [doc.clientWidth, doc.clientHeight]);
            return tool.stringify({w: vp[0], h: vp[1]});
        },
        getGuid: function () {
            var guidKey = '__guid',
                id = $cookie.get(guidKey);

            function hash(s) {
                var h = 0,
                    g = 0,
                    i = s.length - 1;
                for (i; i >= 0; i--) {
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

                while (hLen) {
                    s += (hLen--) ^ (sLen++);
                }

                return (Math.round(Math.random() * 2147483647) ^ hash(s)) * 2147483647;
            }

            if (!id) {
                id = [hash(isLocal ? '' : doc.domain), guid(), +new Date + Math.random() + Math.random()].join('.');

                var config = {
                    expires: 30,
                    domain: 'localhost',
                    path: '/'
                };

                //如果是设置了guidCookieDomains，__guid放在guidCookieDomain域下
                var guidCookieDomains = ['bw.cn', 'brandwisdom.cn', 'jointwisdom.cn'];
                if (guidCookieDomains.length) {
                    for (var i = 0; i < guidCookieDomains.length; i++) {
                        var guidCookieDomain = guidCookieDomains[i],
                            gDomain = '.' + guidCookieDomain;

                        if ((domain.indexOf(gDomain) > 0 && domain.lastIndexOf(gDomain) == domain.length - gDomain.length) || domain == guidCookieDomain) {
                            config.domain = gDomain;
                            break;
                        }
                    }
                }
                $cookie.set(guidKey, id, config.expires, config.domain, config.path);
            }

            return id;
        },
    };
    /**
     * Element元素事件函数
     */
    var $element = {
        clickInit: function (callback) {
            $element._event(document, 'click', function (e) {
                var _target = e.target || e.srcElement;
                var eleObj = {
                    m_type: 1,
                    attributes: $element.getAttributeList(e, _target, true),
                    parent_attributes: $element.getAttributeList(e, $element.parentNode(_target, "div"), false)
                };
                if(!Browser.getSinglePageUrl()){
                    Browser.init();
                    MONIT_CONIFG['m_type'] = 3;
                    MONIT_CONIFG['cid'] = 0;
                    MONIT_CONIFG['attributes'] = $element.getAttributeList(false, true);
                    MONIT_CONIFG['parent_attributes'] = $element.getAttributeList($element.parentNode(false, "div"), false);
                    $monit.setConifg();
                    $monit.addCustom({});
                    $monit.postMonit();
                };
                tool.forIn(eleObj, function (key, value) {
                    MONIT_CONIFG[key] = value;
                })
                //发起埋点
                callback();
            }, true);
        },
        parentNode: function (el, tagName, deep) {
            deep = deep || 50;
            tagName = tagName.toUpperCase();
            if (el.tagName === 'BODY' || el.tagName === 'HTML') {
                return el;
            }
            while (el && deep-- > 0) {
                if (el.tagName === tagName && el.className !== '') {
                    return el;
                }
                el = el.parentNode;
            }
            return el;
        },
        getAttributeList: function (e, el, bool) {
            var obj = {};
            var list = el.attributes || [];
            var cid = '';
            if (!el.tagName) {
                return '';
            }
            obj['pageX'] = e.pageX;
            obj['pageY'] = e.pageY;
            obj['sw'] = window.screen.width;
            obj['sh'] = window.screen.height;
            obj['tagName'] = el.tagName;
            obj['className'] = el.className;
            obj['tagText'] = $element.getText(el);
            tool.each(list, function (item, index, list) {
                if (item.name === 'cid' && bool) {
                    cid = item.value;
                } else if (item.name === 'id' || item.name === 'value') {
                    obj[item.name] = item.value;
                } else {
                    if (item.name.indexOf('ng-') < 0 && item.name.indexOf('m2-') > -1) {
                        obj[item.name] = encodeURIComponent(item.value);
                    }
                }
            });
            MONIT_CONIFG['cid'] = cid;
            return tool.stringify(obj);
        },
        getText: function (el) {
            var str = "";

            if (el.tagName.toLowerCase() == 'input') {
                str = el.value || '';
            } else if (el.tagName.toLowerCase() != 'body' && el.tagName.toLowerCase() != 'html') {
                if (el.childNodes.length <= 1) {
                    str = el.innerText || el.textContent || el.value || el.title || '';
                }
            } else if (el.tagName.toLowerCase() == 'a') {
                if (el.childNodes.length <= 1) {
                    str = el.innerText || el.textContent || el.value || el.title || '';
                }
                str = str ? str : el.src;
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
        postMonit: function () {
            var setIMG = new Image();
            if (!MONIT_CONIFG['pid'] && !MONIT_SERVER_URL) {
                throw new TypeError('pid or M2_SERVER_URL is not null....');
            };
            var params = '&' + tool.encodeObject2URIString(MONIT_CONIFG);
            setIMG.src = MONIT_SERVER_URL + '?t=' + new Date().getTime() + params;
        },
        setConifg: function () {
            var mtags = $monit.setTags();
            var _user = mtags.user;
            var _tags = mtags.tags;
            MONIT_SERVER_URL = _user.M2_SERVER_URL || '';
            MONIT_CONIFG['pid'] = _user.pid || '';
            MONIT_CONIFG['uid'] = _user.uid || '';
            MONIT_CONIFG['hid'] = _user.hid || '';
            MONIT_CONIFG['custom_tag'] = _tags || '';
        },
        setTags: function () {
            var _tags = window.M2_TAGS || [];
            var obj2 = {}, obj3 = {};
            tool.each(_tags, function (item, index, list) {
                if (tool.isArray(item)) {
                    switch (item.length) {
                        case 2:
                            obj2[item[0]] = item[1] || '';
                            break;
                        case 3:
                            obj3[item[1]] = item[2] || '';
                            break;
                    }
                }
            });
            return {
                user: obj2,
                tags: tool.stringify(obj3)
            };
        },
        /**
         * 设置自定义属性
         * @param option Object
         */
        addCustom: function (option) {
            if (option && tool.isObject(option)) {
                var _tag = tool.parseJSON(MONIT_CONIFG['custom_tag']) || {};
                tool.forIn(option, function (key, value) {
                    _tag[key] = value;
                });
                MONIT_CONIFG['custom_tag'] = tool.stringify(_tag);
            }
            ;

        }
    }
    /**
     * 埋点方法管理类
     * @constructor
     */
    var Manager = function () {

    };
    //埋点初始化方法
    Manager.prototype.init = function () {
        //注入url防止单页web应用
        Browser.setSinglePageUrl();
        $element.clickInit(function () {
            Browser.init();
            $monit.setConifg();
            $monit.postMonit();
        });
    };
    //代码埋点方法
    Manager.prototype.setMoint = function (el, obj, cid, type) {
        var _target = el ? el.target || el.srcElement : false;
        Browser.init();
        MONIT_CONIFG['m_type'] = type || 2;
        MONIT_CONIFG['cid'] = cid;
        MONIT_CONIFG['attributes'] = $element.getAttributeList(_target, true);
        MONIT_CONIFG['parent_attributes'] = $element.getAttributeList($element.parentNode(_target, "div"), false);
        $monit.setConifg();
        $monit.addCustom(obj);
        $monit.postMonit();
    };
    //埋点历史方法
    Manager.prototype._getQuest = function (el, obj, cid) {
        var _target = el ? el.target || el.srcElement : false;
        Browser.init();
        MONIT_CONIFG['m_type'] = 2;
        MONIT_CONIFG['cid'] = cid || '';
        MONIT_CONIFG['attributes'] = $element.getAttributeList(_target, true);
        MONIT_CONIFG['parent_attributes'] = $element.getAttributeList($element.parentNode(_target, "div"), false);
        $monit.setConifg();
        $monit.addCustom(obj);
        $monit.postMonit();
    };

    var baseInstance = new Manager();
    //初始化无痕埋点
    baseInstance.init();
    baseInstance.setMoint(null, {}, 0, 3);
    /**
     * 入口
     * @param conf
     * @returns {*}
     */
    var entrance = function (conf) {
        return conf;
    };
    tool.forIn({
        getQuest: '_getQuest',
        setMoint: 'setMoint'
    }, function (key, value) {
        entrance[key] = function () {
            return baseInstance[value].apply(null, arguments);
        };
    });
    entrance.version = '0.9.0';
    return entrance;
});