import sha1 from 'sha1';
import { v4 as uuidv4 } from 'uuid';
import redisClient from '../utils/redis';
import userUtils from '../utils/userUtils';

class AuthController {
  /**
   * getConnect - authenticates a user is valid by generating a token and creating a
   * session using redis
   * @param {*} req - incoming request from the client with certain info
   * @param {*} res - responses from our application
   * @returns a valid token for a valid user
   */
  static async getConnect(req, res) {
    // Extracting the authorization header
    const authHeader = req.header('Authorization');

    // obtain the base64 encryption
    const creds = authHeader.split(' ')[1];
    if (!creds) {
      return res.status(401).send({ error: 'Unauthorized' });
    }

    // decode the encryption to get the email and password
    const decodedCreds = Buffer.from(creds, 'base64').toString('utf-8');
    const [email, password] = decodedCreds.split(':');
    if (!email || !password) {
      return res.status(401).send({ error: 'Unauthorized' });
    }

    // find the user from out database
    const hashedPassword = sha1(password);
    const user = await userUtils.getUser({ email, password: hashedPassword });
    if (!user) {
      return res.status(401).send({ error: 'Unauthorized' });
    }

    // create a 24hr session for our client with redis
    const token = uuidv4();
    const key = `auth_${token}`;
    await redisClient.setex(key, 86400, user._id.toString());
    return res.status(200).send({ token });
  }

  /**
   * getDisconnect - ends a user's session by deleting their token
   * from redis server
   * @param {*} req - incoming http request from client with token info
   * @param {*} res - response from our application
   * @returns nothing if the session is successfully ended
   */
  static async getDisconnect(req, res) {
    const { userId, userKey } = await userUtils.getUserCreds(req);
    if (!userId) {
      return res.status(401).send({ error: 'Unauthorized' });
    }

    await redisClient.del(userKey);
    return res.status(204);
  }
}

export default AuthController;
