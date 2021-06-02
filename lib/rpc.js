'use strict'

var Queue = require('./queue');
var uuid  = require('uuid/v1');

class Rpc extends Queue {
	constructor(_name, _handler) {
		super(_name, _handler);
		this.callback = new Map();
	}
	async onChannel(_ch) {
		this.channel = _ch;
		if (!this.handler) {
			//client
			this.onQueue(await this.channel.assertQueue('', {exclusive: true}));
		} else {
			//server
			await this.channel.assertQueue(this.name, {durable: false});
			this.channel.prefetch(1);
			this.channel.consume(this.name, this.onTask.bind(this), {noAck: false});
		}
	}
	onQueue(q) {
		//client
		this.queue = q.queue;
	    this.channel.consume(q.queue, this.onResponse.bind(this), {noAck: true});
	}
	onResponse(_msg) {
		//client
		if (this.callback.has(_msg.properties.correlationId)) {
			var msgJson = this.decode(_msg);
			this.callback.get(_msg.properties.correlationId)(msgJson);
			this.callback.delete(_msg.properties.correlationId);
		}
	}
	onTask(_msg) {
		//server
		var reject = (function (_err, _requeue) {
			if (_requeue == undefined) _requeue = true;
			this.channel.nack(_msg, false, _requeue);
		}).bind(this);
		var ack = (function (_result) {
			//answer
			this.channel.sendToQueue(
				_msg.properties.replyTo,
	        	this.encode(_result),
	        	{
	        		correlationId: _msg.properties.correlationId
	        	}
	        );
	        this.channel.ack(_msg);
		}).bind(this);
		var msgJson = this.decode(_msg);
		if (msgJson instanceof Error) {
			reject(msgJson, false);
		}
		this.handler(msgJson, reject, ack);
	}
	call(_msg, _callback) {
		//client
		var cid = uuid();
		const send = () => {
			this.channel.sendToQueue(this.name, this.encode(_msg), {
				replyTo: this.queue,
				correlationId: cid
			});
		}
		if (_callback) {
			this.callback.set(cid, _callback);
			send();
		} else return new Promise(resolve => {
			this.callback.set(cid, resolve);
			send();
		});
	}
}

module.exports = Rpc;