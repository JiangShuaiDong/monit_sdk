# monit_sdk
用户操作数据采集
M2
============

## Monit中文文档
*一个简单的数据收集SDK*

### M2嵌入文档

 `M2_PNAME` 和 `M2_URL`参数为项目id为必填

```js

 (function(){
        var _mtags = _mtags || [], w = window;
         _mtags.push(['M2_SERVER_URL', '数据输出URL']); //数据输出URL
        _mtags.push(['pid', '项目名称']); //项目id
        _mtags.push(['uid', 'uid']); //用户id
        _mtags.push(['hid', 'hid']); //酒店id
        _mtags.push(['m2attr','cccid', '23232']); //自定义参数
        w['M2_TAGS'] = _mtags;
        (function() {
                var s = document.createElement('script');
                s.type='text/javascript';
                s.async = true;
                s.src = 'SDK文件地址';
                var x = document.getElementsByTagName('script')[0];
                x.parentNode.insertBefore(s, x);
        })();
    })();

```

### M2 常用方法

```js

        M2.getQuest('e||null','{b:111}自定义参数','埋点id')；
        M2.setMoint('e||null','{b:111}自定义参数','埋点id')；

```