'use strict'

var debug = require('debug')('env:rabbitmq:worker');
var Queue = require('./queue');

class Worker extends Queue {
	constructor(_name, _handler) {
		super(_name, _handler);
	}
	onChannel(_ch) {
		debug("rmq > create channel");
		this.channel = _ch;
		this.channel.assertQueue(this.name, {durable: true});

		if (this.handler) {
			this.channel.prefetch(1);
	    	this.channel.consume(this.name, this.onTask.bind(this), {noAck: false});
		}
	}
	onTask(_msg) {
		debug("rmq > consume task");
		var reject = (function (_err, _requeue) {
			if (_requeue == undefined) _requeue = true;
			this.nack(_msg, false, _requeue);
		}).bind(this);
		var ack = (function () {
			this.channel.ack(_msg);
		}).bind(this);
		var msgJson = this.decode(_msg);
		if (msgJson instanceof Error) {
			reject(msgJson, false);
		}
		this.handler(msgJson, reject, ack);
	}
	send(_msg) {
		debug("rmq > send task");
		this.channel.sendToQueue(this.name, this.encode(_msg), {
			persistent: true
		});
	}
}

module.exports = Worker;