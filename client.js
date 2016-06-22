var fs = require('fs');
var http = require('http');
var notifier = require('node-notifier');

var configuration = JSON.parse(fs.readFileSync('client_configuration.json', 'utf8'));

// CREATE HTTP SERVER

// come from : https ://stackoverflow.com/questions/4295782/how-do-you-extract-post-data-in-node-js
var server = http.createServer(function (request, response) {
	if (request.method == 'POST') {
		var body = '';

		request.on('data', function (data) {
			body += data;

			// Too much POST data, kill the connection!
			// 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
			if (body.length > 1e6)
				request.connection.destroy();
		});

		request.on('end', function () {
			var post = JSON.parse(body);
			if (post.name == "PONG") {
				pong(post);
			}
			// use post['blah'], etc.
		});
	}
});

var port = configuration.client_port;
server.listen(port, function () {
	console.log('Server listening at port %d', port);
});

// See the nodejs http documentation

function post(options){
	var req = http.request(options, (res) => {

		res.on('data', (chunk) => {
	  		data = data + `BODY: ${chunk}`;
		});
	  	res.on('end', () => {
	    	options.success(data);
	  	});
	});
	req.on('error', (e) => {
	  console.error(e);
	});
	req.write(JSON.stringify(options.data));
	req.end();
};

// Take a object (see the data returned by the webhook you want)

function pong(data){
	notifier.notify({
		'title': data.name,
		'message': data.message
	});

}

// EXEC

// See the nodejs http documentation
var options = {
	hostname: configuration.webhook_url,
	port: configuration.webhook_port,
	path: configuration.webhook_path,
	method: 'POST',
	// Data needed for a subscribtion to a webhook (see expected data by the webhook you want)
	data: {
		name: "pong",
		config: {
			url: configuration.client_url,
			port: configuration.client_port,
			path: configuration.client_path
		},
	},
	success: function(data){
	  console.log(data);
	}
};

console.log(options);

post(options);

notifier.notify({
	'title': 'PINGPONG',
	'message': 'Subscribe to pingpong webhook'
});
