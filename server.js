/*
 * Webevent Server
 */
(function() {
	Object.defineProperties(Array.prototype, {
		add: {value: function add(value) {
			return -1 == this.indexOf(value) && !!this.push(value);
		}},
		has: {value: function has(value) {
			return -1 < this.indexOf(value);
		}},
		del: {value: function del(value) {
			var i = this.indexOf(value);
			return -1 < i && !!this.splice(i, 1);
		}}
	});
}).call(this);

(function() {
	var extend  = require('node.extend');
	var connect = require('connect');

	var htdocs = __dirname + "/htdocs";
	var port = 8080;

	var status = {sockets : new Array()};

	var server = connect.createServer(
		connect.static(htdocs)
	).listen(port);

	console.log("[HTTP server] root path : " + htdocs);
	console.log("[HTTP server] listen on :" + port);
	
	var io = require('socket.io').listen(server);

	io.sockets.on('connection', function(socket) {
		status.sockets.add(socket);
		console.log("[HTTP server] connect " + getAddress(socket,true));
		socket.on('disconnect', function(){
			status.sockets.del(socket);
			console.log("[HTTP server] disconnect " + getAddress(socket,true));
		});

		function getAddress(s, toStr) {
			var addr = s.handshake.address;
			if (toStr) {
				return "Address[" + addr.address + ":" + addr.port+"]";
			} else {
				return addr;
			}
		}

		function broadcast(name, regSocket) {
			regSocket.on(name, function (data) {
				regSocket.broadcast.emit(name, data);
			});
		}
		broadcast('event_keydown', socket);
		broadcast('event_keyup', socket);
		broadcast('event_keypress', socket);
		broadcast('event_click', socket);
		broadcast('event_dblclick', socket);
		broadcast('event_mousedown', socket);
		broadcast('event_mouseup', socket);
		
		socket.on('query_status', function(data) {
			// query server status，type=[online],response=query_status_{type}
			try {
				data = extend({type: null}, data);
				var emitName = 'query_status';
				var query = {online: []};
				for (var idx in status.sockets) {
					var s = status.sockets[idx];
					var addr = getAddress(s, false);
					query.online.push(addr);
				}
				if (data.type != null) {
					emitName += '_' + data.type;
					socket.emit(emitName, query[data.type]);
				} else {
					socket.emit(emitName, query);
				}
			} catch(err) {
				console.log(err);
			}
		});
		socket.on('register_event', function (registration) {
			registration = extend({name:null, broadcast:true, handler:null}, registration);
			console.log("[HTTP server] register event name=" + registration.name + ",broadcast=" + registration.broadcast);

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

