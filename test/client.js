const RabbitMQ = require('../index.js').RabbitMQ;
const { uri } = require('./config.js');

(async function () {
	const rmq = new RabbitMQ({ uri });
	await rmq.connect();

	console.log('RMQ Connected...');

	await rmq.worker('test');
	console.log('worker: test');

	setTimeout(() => {
		console.log('send task');
		rmq.worker('test').send({hello:"world!"});
	}, 1000);
})();