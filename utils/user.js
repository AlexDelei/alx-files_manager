import redisClient from './redis';
import dbClient from './db';

const userUtils = {
  /**
   * getUserCreds - finds a user based on the token
   * @param {*} req - incoming http request
   * @returns user id and userKey
   */
  async getUserCreds(req) {
    const userObj = { userId: null, userKey: null };

    const authToken = req.header('X-Token');
    if (!authToken) {
      return userObj;
    }

    userObj.userKey = `auth_${authToken}`;
    userObj.userId = await redisClient.get(userObj.userKey);
    return userObj;
  },

  async getUser(query) {
    const user = await dbClient.db.collection('users').findOne(query);
    return user;
  },
};

export default userUtils;
