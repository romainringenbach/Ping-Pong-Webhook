var fs = require('fs');
var http = require('http');

var configuration = JSON.parse(fs.readFileSync('server_configuration.json', 'utf8'));

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
			if (post.name == "pong") {
				subscribe(post);
			}
			// use post['blah'], etc.
		});
	}
});

server.listen(configuration.port, function () {
	console.log('Server listening at port %d', configuration.port);
});

var serverIO = http.createServer(function (request, response) {
});

serverIO.listen(configuration.portIO, function () {
	console.log('Server listening at port %d', configuration.portIO);
});

var io = require('socket.io').listen(serverIO);

var subscribers = new Array();
function subscribe(data){

	subscribers.push(data.config);
	console.log('subscriber : ',data.config);
}

// see nodejs http documentation
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

function pong(message){
	console.log("PONG : "+message);
	for (var i = 0; i < subscribers.length; i++) {

		// see nodejs http documentation
		var options = {
			hostname: subscribers[i].url,
			port: subscribers[i].port,
			path: subscribers[i].path,
			method: 'POST',
			data: {
				name: "PONG",
				message: message,
			},
			success: function(data){
			  console.log(data);
			}
		};

		post(options);

	}

	console.log(options);

};

// see socket.io documentation

io.on('connection', function (socket) {

	socket.emit('pong','Welcom');

	socket.on('toPing', function (data) {
		console.log(data.message);
		pong(data.message);
		socket.emit('pong',data.message);
	});

	socket.on('disconnect', function () {
		io.emit('user disconnected');
	});

});
