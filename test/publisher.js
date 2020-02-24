const RabbitMQ = require('../index.js').RabbitMQ;
const { uri } = require('./config.js');

(async function () {
	const rmq = new RabbitMQ({ uri });
	await rmq.connect();

	console.log('RMQ Connected...');

	await rmq.pubsub('testPs');
	console.log('worker: test');

	setInterval(() => {
		console.log('send event');
		rmq.pubsub('testPs').send({at:Date.now()});
	}, 1000);
})();