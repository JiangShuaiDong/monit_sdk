var PORT = 3000;

var http = require('http');
var url = require('url');
var fs = require('fs');


var server = http.createServer(function (req, res) {

    var url = req.url;
    var file = ".." + url;
    
    fs.readFile(file, function (err, data) {
         if (err) {
            res.writeHeader(404, {'content-type': 'text/html;charset="utf-8"'});
            res.write('<h1>404错误</h1>');
            res.end();
        } else {
            if(file.indexOf('.js')<=0){
                res.writeHeader(200, {'content-type': 'text/html;charset="utf-8"'});
            } else {
                res.writeHeader(200, {'content-type': 'application/x-javascript'});
            }
            res.write(data);
            res.end();}
    });
}).listen(8889);
