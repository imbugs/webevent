(function($){
	if (!window.console) console = {};
	console.log = console.log || function(){};

	$.fn.subevent= function(options) {
		var elem = this;
		var socket = io.connect();
		var options = options || {keyboard: true, mouse: true};
		
		var reconnect = -1;
		socket.on('disconnect', function(){
			if(reconnect < 0) {
				reconnect = setInterval(function() {
					console.log('socket.io try reconnect to server.');
					socket.disconnect();
					socket = io.connect();
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
			}
		});	
		
		if (options.keyboard) {
			keyboard(elem);
		}
	
		if (options.mouse) {
			mouse(elem);
		}
	
		function mouse(elem) {
			socket.on('event_click', function(e){
				triggerEvent(elem, 'click', e);
			});
			socket.on('event_dblclick', function(e){
				triggerEvent(elem, 'dblclick', e);
			});
			socket.on('event_mousedown', function(e){
				triggerEvent(elem, 'mousedown', e);
			});
			socket.on('event_mouseup', function(e){
				triggerEvent(elem, 'mouseup', e);
			});
		}
	
		function keyboard(elem) {
			socket.on('event_keydown', function(e){
				triggerEvent(elem, 'keydown', e);
			});
	
			socket.on('event_keyup', function(e){
				triggerEvent(elem, 'keyup', e);
			});
			
			socket.on('event_keypress', function(e){
				triggerEvent(elem, 'keypress', e);
			});
		};
	
		function triggerEvent(elem, name, data) {
			var event = jQuery.Event(name, {
				// key event properties
				altKey: data.altKey,
				ctrlKey: data.ctrlKey,
				shiftKey: data.shiftKey,
				keyCode: data.keyCode,
				which: data.which,
				// mouse event properties
				clientX: data.clientX,
				clientY: data.clientY,
				detail: data.detail,
				layerX: data.layerX,
				layerY: data.layerY,
				offsetX: data.offsetX,
				offsetY: data.offsetY,
				pageX: data.pageX,
				pageY: data.pageY,
				screenX: data.screenX,
				screenY: data.screenY
			});
			$(elem).trigger(event); 
		}
	}
})(jQuery);
