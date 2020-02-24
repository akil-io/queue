'use strict'

var debug = require('debug')('env:rabbitmq:pubsub');
var Queue = require('./queue');

class PubSub extends Queue {
	constructor(_name, _handler) {
		super(_name, _handler);
	}
	async onChannel(_ch) {
		debug("rmq > create channel");
		this.channel = _ch;
		this.channel.assertExchange(this.name, 'fanout', {durable: false});

		if (this.handler) {
			debug("rmq > assert queue");
			this.onQueue(await this.channel.assertQueue('', {exclusive: true}));
		}
	}
	onQueue(q) {
		debug("rmq > create queue");
		this.queue = q.queue;
		this.channel.bindQueue(q.queue, this.name, '');
	    this.channel.consume(q.queue, this.onTask.bind(this), {noAck: true});
	}
	onTask(_msg) {
		debug("rmq > consume task");
		var reject = (function (_err, _requeue) {
			if (_requeue == undefined) _requeue = true;
			//this.nack(_msg, false, _requeue);
		}).bind(this);
		var ack = (function () {
			//this.channel.ack(_msg);
		}).bind(this);
		var msgJson = this.decode(_msg);
		if (msgJson instanceof Error) {
			reject(msgJson, false);
		}
		this.handler(msgJson, reject, ack);
	}
	send(_msg) {
		debug("rmq > send task");
		this.channel.publish(this.name, '', this.encode(_msg));
	}
}

module.exports = PubSub;