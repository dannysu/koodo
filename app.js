var restify = require('restify');

var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function respond(request, response, next) {
    var output = '';

    var client = restify.createStringClient({
        url: 'https://selfserve.koodomobile.com',
        userAgent: 'Mozilla/5.0 (Linux; U; Android 4.2.1; eng-; Nexus 4 Build/JOP40D) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30 API-Key/CD49E21E5388AC02 OEM/Lge Model/Nexus_4 OS_Platform/Android OS_Version/4.2.1 app_version/1.0.1'
    });

    client.basicAuth(process.env.KOODO_USERNAME, process.env.KOODO_PASSWORD);

    client.post('/method/login', {
        lang: 'en',
        rememberme: ''
    }, function(err, req, res, data) {
        var obj = JSON.parse(data);
        var msisdn = obj.msisdn;

        client.post('/method/summary/usage', {
            msisdn: msisdn
        }, function(err, req, res, data) {
            var obj = JSON.parse(data);

            var from = new Date(obj.from);
            obj.from = months[from.getMonth()] + ' ' + from.getDate() + ', ' + from.getFullYear();
            var to = new Date(obj.to);
            obj.to = months[to.getMonth()] + ' ' + to.getDate() + ', ' + to.getFullYear();

            var dots = require("dot").process({path: "./views"});
            var html = dots.usage(obj);
            response.setHeader('Content-Type', 'text/html');
            response.writeHead(200);
            response.end(html);
            next();
        });
    });
}

var server = restify.createServer();
server.get('/', respond);

server.listen(process.env.VCAP_APP_PORT || 8080, function() {
    console.log('%s listening at %s', server.name, server.url);
});
