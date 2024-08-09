import redisClient from '../utils/redis';
import dbClient from '../utils/db'

class AppController {
  static getStatus(request, response) {
    return response.status(200).send({redisClient});
  }

  static async getStats(request, response) {
    const users = await dbClient.nbUsers();
    const files = await dbClient.nbFiles();

    return response.status(200).send({ users, files });
  }
}

module.exports = AppController;
