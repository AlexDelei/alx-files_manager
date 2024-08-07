import { createClient } from 'redis';
import { promisify } from 'util';

class RedisClient {
  constructor() {
    this.client = createClient();
    this.client.on('error', () => {
      console.log('An error occured while trying to connect to the server');
    });
  }

  isAlive() {
    const success = this.client.on('success', () => {
      return true;
    });
    if (success) return true;
    return false;
  }

  async get(key) {
    const getFunc = promisify(this.client.GET).bind(this.client);
    return getFunc(key);
  }

  async set(key, value, duration) {
    const setFunc = promisify(this.client.SETEX).bind(this.client);
    return setFunc(key, duration, value);
  }

  async del(key) {
    const delFunc = promisify(this.client.DEL).bind(this.client);
    return delFunc(key);
  }
}

const redisClient = new RedisClient();
export { redisClient };
