import { createClient } from 'redis';

export const client = createClient({url: 'redis://default@127.0.0.1:6380'});
client.on('error', (err) => console.log('Redis Client Error', err));
client.connect()