(function() {
	var extend = require('node.extend');
	var htdocs = __dirname + "/htdocs";
	var port = 8080;
	var connect = require('connect');

	var status = {online: []};

	var server = connect.createServer(
		connect.static(htdocs)
	).listen(port);

	console.log("[HTTP server] root path : " + htdocs);
	console.log("[HTTP server] listen on :" + port);
	
	var io = require('socket.io').listen(server);

	io.sockets.on('connection', function(socket) {
		var address = socket.handshake.address;
		status.online.push(address);

		socket.on('event_keydown', function (data) {
			socket.broadcast.emit('event_keydown', data);
		});
		socket.on('event_keyup', function (data) {
			socket.broadcast.emit('event_keyup', data);
		});
		socket.on('event_keypress', function (data) {
			socket.broadcast.emit('event_keypress', data);
		});
		socket.on('event_click', function (data) {
			socket.broadcast.emit('event_click', data);
		});
		socket.on('event_dblclick', function (data) {
			socket.broadcast.emit('event_dblclick', data);
		});
		socket.on('event_mousedown', function (data) {
			socket.broadcast.emit('event_mousedown', data);
		});
		socket.on('event_mouseup', function (data) {
			socket.broadcast.emit('event_mouseup', data);
		});
		socket.on('query_status', function(data) {
			data = extend({type: null}, data);
			var emitName = 'query_status';
			if (data.type != null) {
				emitName += '_' + data.type;
				socket.emit(emitName, status[data.type]);
			} else {
				socket.emit(emitName, status);
			}
		});
		socket.on('register_event', function (registration) {
			registration = extend({name:null, broadcast:true, handler:null}, registration);
			console.log(registration);
			if (registration.name == null) {
				return;
			}
			if (registration.broadcast) {
				socket.on(registration.name, function(data) {
					var d = data;
					if (registration.handler != null && typeof(registration.handler) == 'function') {
						d = registration.handler(data);
					}
					socket.broadcast.emit(registration.name, d);
				});
			} else {
				socket.on(registration.name , function(data) {
					var d = data;
					if (registration.handler != null && typeof(registration.handler) == 'function') {
						d = registration.handler(data);
					}
					socket.emit(registration.name, d);
				});
			}
		});
	});
}).call(this);

