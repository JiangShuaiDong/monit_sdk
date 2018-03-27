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
        w['M2_TAGS'] = _mtags;
        M2_TAGS.push(['M2_SERVER_URL', 'http://analysis.brandwisdom.cn/m.gif']); //数据输出URL
        M2_TAGS.push(['pid', '项目名称']); //项目id
        M2_TAGS.push(['uid', 'uid']); //用户id
        M2_TAGS.push(['hid', 'hid']); //酒店id
        M2_TAGS.push(['m2attr','cccid', '23232']); //自定义参数
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