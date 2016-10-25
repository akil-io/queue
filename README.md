# RabbitMQ wrapper for PubSub, RPC, Queue based on official examples for amqplib

## Init

```javascript
var RabbitMQ = require('env-rmq').RabbitMQ;

var rmq = new RabbitMQ(config);
rmq.connect(function () {
	debug('connected');
	callback(null, rmq);
});
```

## Queue

### Worker - handle task

```javascript
rmq.worker('my-queue-name', function (msg, reject, ack) {
	ack();
});
```

### Client - send task

```javascript
rmq.worker('my-queue-name').send({
	someField: "Hello world!"
});
```

## PubSub

### Listener

```javascript
rmq.pubsub('my-pub-name', function (msg, reject, ack) {
	ack();
});
```

### Sender

```javascript
rmq.pubsub('my-pub-name').send({
	someField: "Hello world!"
});
```

## RPC

### Server

```javascript
rmq.rpc('my-function', function (msg, reject, ack) {
	ack({
		returnValue:"OK!"
	});
});
```

### Client

```javascript
rmq.pubsub('my-function').call({
	someField: "Hello world!"
}, function (result) {
	console.log("RETURNED VALUE:", result);
});
```