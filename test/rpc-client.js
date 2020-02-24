const RabbitMQ = require('../index.js').RabbitMQ;
const { uri } = require('./config.js');

(async function () {
	const rmq = new RabbitMQ({ uri });
	await rmq.connect();

	console.log('RMQ Connected...');

	await rmq.rpc('testRpc');
	console.log('worker: test');

	console.log('send task');
	let result = await rmq.rpc('testRpc').call({hello:"world!"});
	console.log('response: ', result);
})();