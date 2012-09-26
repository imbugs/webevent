(function($){
	if (!window.console) console = {};
	console.log = console.log || function(){};

	$.fn.pubevent= function(options) {
		var elem = this;
		var options = options || {url: null, keyboard: true, mouse: true};
		var socket = io.connect(options.url);
		
		var reconnect = -1;
		socket.on('disconnect', function(){
			if(reconnect < 0) {
				reconnect = setInterval(function() {
					console.log('socket.io try reconnect to server.');
					socket.disconnect();
					socket = io.connect(options.url);
				},2000);
			}
		});
		socket.on('connect', function(){
			if(reconnect > 0) {
				clearInterval(reconnect);
				reconnect = -1;
				console.log('socket.io success reconnect to server.');
			}
		});

		$.fn.extend({ 
			socket: function() {
				return socket;
			},
			query: function() {
				socket.emit('query_status', {type: 'online'});
			},
			broadcast: function(data) {
				socket.emit('broadcast', data);
			}
		});	

		if (options.keyboard) {
			keyboard(elem);
		}
	
		if (options.mouse) {
			mouse(elem);
		}

		status();

		function status() {
			socket.on('query_status_online',function(data){
				console.log(data);
			});
		}
		function mouse(elem) {
			$(elem).click(function(e){
				socket.emit('event_click', {
					clientX: e.clientX,
					clientY: e.clientY,
					detail: e.detail,
					layerX: e.layerX,
					layerY: e.layerY,
					offsetX: e.offsetX,
					offsetY: e.offsetY,
					pageX: e.pageX,
					pageY: e.pageY,
					screenX: e.screenX,
					screenY: e.screenY,
					which: e.which
				});
			});
			$(elem).dblclick(function(e){
				socket.emit('event_dblclick', {
					clientX: e.clientX,
					clientY: e.clientY,
					detail: e.detail,
					layerX: e.layerX,
					layerY: e.layerY,
					offsetX: e.offsetX,
					offsetY: e.offsetY,
					pageX: e.pageX,
					pageY: e.pageY,
					screenX: e.screenX,
					screenY: e.screenY,
					which: e.which
				});
			});
			$(elem).mousedown(function(e){
				socket.emit('event_mousedown', {
					clientX: e.clientX,
					clientY: e.clientY,
					detail: e.detail,
					layerX: e.layerX,
					layerY: e.layerY,
					offsetX: e.offsetX,
					offsetY: e.offsetY,
					pageX: e.pageX,
					pageY: e.pageY,
					screenX: e.screenX,
					screenY: e.screenY,
					which: e.which
				});
			});
			$(elem).mouseup(function(e){
				socket.emit('event_mouseup', {
					clientX: e.clientX,
					clientY: e.clientY,
					detail: e.detail,
					layerX: e.layerX,
					layerY: e.layerY,
					offsetX: e.offsetX,
					offsetY: e.offsetY,
					pageX: e.pageX,
					pageY: e.pageY,
					screenX: e.screenX,
					screenY: e.screenY,
					which: e.which
				});
			});
		}
	
		function keyboard(elem) {
			$(elem).keydown(function(e){
				socket.emit('event_keydown', {
					altKey: e.altKey,
					ctrlKey: e.ctrlKey,
					shiftKey: e.shiftKey,
					keyCode: e.keyCode,
					which: e.which
				});
			});
			$(elem).keyup(function(e){
				socket.emit('event_keyup', {
					altKey: e.altKey,
					ctrlKey: e.ctrlKey,
					shiftKey: e.shiftKey,
					keyCode: e.keyCode,
					which: e.which
				});
			});
			$(elem).keypress(function(e){
				socket.emit('event_keypress', {
					altKey: e.altKey,
					ctrlKey: e.ctrlKey,
					shiftKey: e.shiftKey,
					keyCode: e.keyCode,
					which: e.which
				});
			});
		};
	}
})(jQuery);
