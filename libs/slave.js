var _ = require ('lodash'),
	Q = require ('q');


module.exports = function () {
	this.features = {};
};

_.extend (module.exports.prototype, {
	settings: null,
	socket: null,
	features: null,
	currentStatus: 'free',
	retry: 1000,
	_error: function (error) {
		console.error (error);
	},

	connect: function (io, url) {
		if (this.socket) {
			throw new Error ('Already connected');
		}


		console.log ('Connecting to master', url);

		(this.socket = io.connect (url))
			.on ('connect', _.bind (this.connected, this))
			.on ('disconnect', _.bind (this.disconnected, this))
			.on ('error', _.bind (this.error, this))
			.on ('task', _.bind (this.handle, this));

		return this;
	},

	error: function (error) {
		this.socket = null;
		this._error.call (this, error);
	},

	fail: function (callback) {
		this._error = callback;

		return this;
	},

	connected: function () {
		console.log ('Connected to master');
		this.syncSettings ();
	},

	disconnected: function (error) {
		console.error ('Disconnected from master');

		this.socket = null;
	},

	disconnect: function () {
		if (this.socket) {
			this.socket.disconnect ();
			this.socket = null;
		}
	},

	syncSettings: function () {
		if (this.socket) {
			this.socket.emit ('settings', {
				features: _.keys (this.features),
				status: this.currentStatus
			});
		}
	},

	status: function (status) {
		this.currentStatus = status;
		this.syncSettings ();

		return this;
	},

	use: function (feature, callback) {
		this.features [feature] = callback;

		return this;
	},

	handle: function (task) {
		console.log ('Processing task', task._id);

		Q.when (this.feature (task.feature))
			.then (function (callback) {
				// TODO: Pass something to process found documents
				// return Q.when (callback (task))
			})
			.then (console.log)		// TODO: Report task is ready
			.fail (console.error)	// TODO: Report task error
			.done ();
	},

	feature: function (feature) {
		var callback = this.features [feature];

		switch (typeof callback) {
			case 'function':
				return callback;

			case 'undefined':
				throw new Error ('Callback not found for feature ' + feature);

			default:
				throw new Error ('Callback for feature ' + feature + ' is not a function');
		}
	}
});
