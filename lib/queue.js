'use strict'

class Queue {
	constructor(_name, _handler) {
		this.name = _name;
		this.handler = _handler;
	}
	decode(_msg) {
		var _msgJson = null;
		try {
			return JSON.parse(_msg.content.toString());
		} catch (e) {
			return e;
		}
	}
	encode(_msg) {
		return new Buffer(JSON.stringify(_msg));
	}
	register(_connection) {
		_connection.createChannel((function (_err, _ch) {
			if (_err) {
				throw _err;
			}
			this.onChannel(_ch);
		}).bind(this));
		
		return this;
	}
	onChannel(_ch) {}
	onTask(_msg) {}
}

module.exports = Queue;