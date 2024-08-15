import sha1 from 'sha1';
import { v4 as uuidv4 } from 'uuid';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';

class AuthController {
  static async getConnect(req, res) {
    // Extracting the authorization header
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Basic')) {
      return res.status(401).send({ error: 'Unauathorized' });
    }

    // Decoding the base64 credentials
    // const base64Creds = authHeader.split(' ')[1];
    // const decodedCreds = Buffer.from(base64Creds, 'base64').toString('ascii');
    // const [email, password] = decodedCreds.split(':');

    // hashing the password
    // const hashedPwd = sha1(password);

    // Finding the user from our database
    // const user = dbClient.db.collection('users').findOne({ email });
    // if (!user) {
    //   return res.status(401).send({ error: 'Unauthorized' });
    // }

    // Generating the token for the user
    // const token = uuidv4();

    // Storing the credentials Temporarily with Redis
    // const key = `auth_${token}`;
    // await redisClient.SETEX(key, 86400, user.id.toString());

    // response 'OK'
    return res.status(200).json({ authHeader });
  }

  static async getDisconnect(req, res) {
    // extract token from the header
    const headerToken = req.header('X-Token');
    const token = headerToken.split(':')[1];

    // find the user from redis server
    const user = await redisClient.get(`auth_${token}`);
    if (!user) {
      return res.status(401).send({ error: 'Unauthorized' });
    }
    // delete the token
    await redisClient.del(`auth_${token}`);

    return res.status(204);
  }
}

export default AuthController;
