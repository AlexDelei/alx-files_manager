const redisClient = require('../utils/redis');
const dbClient = require('../utils/db');

class AppController {
  static getStatus(request, response) {
    if (redisClient.isAlive() && dbClient.isAlive()) {
      return response.status(200).send({ redis: true, db: true });
    }
    return response.status(500).send(
      { redis: redisClient.isAlive(), db: dbClient.isAlive() },
    );
  }

  static async getStats(request, response) {
    const users = await dbClient.nbUsers();
    const files = await dbClient.nbFiles();

    return response.status(200).send({ users, files });
  }
}

module.exports = AppController;
