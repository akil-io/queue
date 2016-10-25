'use strict'

var Queue = require('./queue');
var uuid  = require('node-uuid');

class Rpc extends Queue {
	constructor(_name, _handler) {
		super(_name, _handler);
		this.callback = new Map();
	}
	onChannel(_ch) {
		console.log("rmq > create channel");
		this.channel = _ch;
		if (!this.handler) {
			//client
			this.channel.assertQueue('', {exclusive: true}, this.onQueue.bind(this));
		} else {
			//server
			this.channel.assertQueue(this.name, {durable: false});
			this.channel.prefetch(1);
			this.channel.consume(this.name, this.onTask.bind(this), {noAck: false});
		}
	}
	onQueue(err, q) {
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
		console.log("rmq > consume task");
		var reject = (function (_err, _requeue) {
			if (_requeue == undefined) _requeue = true;
			this.nack(_msg, false, _requeue);
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
		console.log("rmq > send task");
		var cid = uuid.v4();
		this.callback.set(cid, _callback);
		this.channel.sendToQueue(this.name, this.encode(_msg), {
			replyTo: this.queue,
			correlationId: cid
		});
	}
}

module.exports = Rpc;