import express from 'express';

const app = express(),
	port = 3000;

app.get('/', (req, res) => {
	res.send('Hello World!');
});

app.listen(port, () => console.log('barebones app is listening to port 3000!'));
