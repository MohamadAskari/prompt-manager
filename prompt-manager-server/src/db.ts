import { createClient } from 'redis';

let redisUrl: string;

if (process.env.RUNNING_IN_DOCKER === 'true') {
    redisUrl = 'redis://redis:6379';
} else {
    redisUrl = 'redis://127.0.0.1:6379';
}

export const client = createClient({url: "redis://redis:6379"});
client.on('error', (err) => console.log('Redis Client Error', err));
client.connect()