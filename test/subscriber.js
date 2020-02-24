const RabbitMQ = require('../index.js').RabbitMQ;
const { uri } = require('./config.js');

(async function () {
	const rmq = new RabbitMQ({ uri });
	await rmq.connect();

	console.log('RMQ Connected...');

	rmq.pubsub('testPs', function (msg, reject, ack) {
		console.log('Event: ', msg);
		ack();    
	});
})();