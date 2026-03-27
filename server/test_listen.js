import express from 'express';
const app = express();
const server = app.listen(5000, () => {
  console.log('Listening on 5000');
});
server.on('error', (err) => console.error(err));
