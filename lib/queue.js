'use strict'

class Queue {
	constructor(_name, _handler) {
		this.name = _name;
		this.handler = _handler;
		this.channel = null;
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
		return new Buffer.from(JSON.stringify(_msg));
	}
	async register(_connection) {
		return this.onChannel(await _connection.createChannel());
	}
	async onChannel(_ch) {}
	onTask(_msg) {}
}

module.exports = Queue;