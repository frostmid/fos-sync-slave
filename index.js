var	SocketIO = require ('socket.io-client'),
	_ = require ('lodash'),
	
	Slave = require ('./libs/slave.js');


function MonitorTwitter (task) {
	// this.emit ('error', 'not yet implemented');
	// this.emit ('ready');
	// this.emit ('pause');
}



(new Slave (SocketIO))
	.use ('urn:fos:sync:feature/21b165b499c27b6d95d366f6a2557a07', MonitorTwitter)
	.fail (function (error) {
		console.error (error);

		var reconnect = _.bind (function () {
			this.connect (SocketIO, 'http://127.0.0.1:8001')
		}, this);
		
		_.delay (reconnect, 1000);
	})
	.connect (SocketIO, 'http://127.0.0.1:8001');
