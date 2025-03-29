import { startServer } from "./src/server.js"
import { createClient } from 'redis';

const client = createClient();

client.on('connect', function() {
    console.log('Connected!');
});

startServer()