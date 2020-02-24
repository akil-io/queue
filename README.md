# RabbitMQ wrapper for PubSub, RPC, Queue based on official examples for amqplib

## Init

```javascript
const RabbitMQ = require('env-rmq').RabbitMQ;

const rmq = new RabbitMQ({
	uri: 'amqp://user:password@localhost/'
});
rmq.connect().then(() => {
	console.log('Ready.');
}).catch(err => {
	console.log('Error: ', err);
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
// Assert channel on application loading
rmq.worker('my-queue-name');

// Send task everywhere
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
// Assert channel on application loading
rmq.pubsub('my-pub-name');

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
// Assert channel on application loading
rmq.rpc('my-function');

rmq.rpc('my-function').call({
	someField: "Hello world!"
}).then(result => {
	console.log("RETURNED VALUE:", result);
});
```