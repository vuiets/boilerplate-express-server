import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';

dotenv.config();

const app = express(),
	{ PORT } = process.env;

app.use(cors());

app.get('/', (req, res) => {
	return res.send('Received a GET HTTP method');
});

app.post('/', (req, res) => {
	return res.send('Received a POST HTTP method');
});

app.put('/', (req, res) => {
	return res.send('Received a PUT HTTP method');
});

app.delete('/', (req, res) => {
	return res.send('Received a DELETE HTTP method');
});

app.listen(PORT, () => console.log('barebones app is listening to port 3000!'));
