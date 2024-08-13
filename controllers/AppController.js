import redisClient from '../utils/redis';
import dbClient from '../utils/db';

class AppController {
  static getStatus(request, response) {
    const status = {
      redis: redisClient.isAlive(),
      db: dbClient.isAlive(),
    };
    return response.status(200).json(status);
  }

  static async getStats(request, response) {
    try {
      const users = await dbClient.nbUsers();
      const files = await dbClient.nbFiles();
      const stats = {
        users,
        files,
      };

      return response.status(200).json(stats);
    } catch (error) {
      console.log(`An error occured trying to fetch stats: ${error}`);
      return response.status(500).send('Internal Server Error');
    }
  }
}

export default AppController;
