import redisClient from '../utils/redis';
import dbClient from '../utils/db'

class AppController {
  static getStatus(request, response) {
    return response.status(200).send({ redis: redisClient.isAlive(), db: dbClient.isAlive() });
  }

  static async getStats(request, response) {
    const users = await dbClient.nbUsers();
    const files = await dbClient.nbFiles();

    return response.status(200).send({ users, files });
  }
}

module.exports = AppController;
