'use strict'

var debug 	= require('debug')('env:rabbitmq');
var amqp = require('amqplib');

var Worker = require('./lib/worker');
var Rpc = require('./lib/rpc');
var PubSub = require('./lib/pubsub');

class RabbitMQ {
	constructor(_config) {
		this.config = _config;
		this.connection = null;
		this.queue = new Map();
	}

	async connect() {
		this.connection = await amqp.connect(this.config.uri);
	}

	worker(_name, _handler) {
		debug('rmq > call to worker...', this.connection);
		if (this.connection == null) return;

		if (this.queue.has(_name)) {
			if (_handler) {
				return new Error("Queue already in use");
			} else {
				return this.queue.get(_name);
			}
		}

		this.queue.set(_name, new Worker(_name, _handler));

		return this.queue.get(_name).register(this.connection);
	}

	rpc(_name, _handler) {
		if (this.connection == null) return;

		if (this.queue.has(_name)) {
			if (_handler) {
				return new Error("Queue already in use");
			} else {
				return this.queue.get(_name);
			}
		}
		this.queue.set(_name, new Rpc(_name, _handler));

		return this.queue.get(_name).register(this.connection);
	}

	pubsub(_name, _handler) {
		if (this.connection == null) return;

		if (this.queue.has(_name)) {
			if (_handler) {
				return new Error("Queue already in use");
			} else {
				return this.queue.get(_name);
			}
		}
		this.queue.set(_name, new PubSub(_name, _handler));

		return this.queue.get(_name).register(this.connection);
	}
}

module.exports.RabbitMQ = RabbitMQ;