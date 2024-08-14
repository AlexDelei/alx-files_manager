import sha1 from 'sha1';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';

class UsersController {
  static async postNew(req, res) {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).send({ error: 'Missing email' });
    }
    if (!password) {
      return res.status(400).send({ error: 'Missing password' });
    }
    const alreadyExists = await dbClient.db.collection('users').findOne({ email });
    if (alreadyExists) {
      return res.status(400).send({ error: 'Already exist' });
    }
    const securePassword = sha1(password);
    const newUser = { email, password: securePassword };
    const saved = await dbClient.db.collection('users').insertOne(newUser);

    return res.status(201).send(
      {
        id: saved.insertedId,
        email: newUser.email,
      },
    );
  }

  static async getMe(req, res) {
    // extract token from the header 'X-Token: <token>'
    const tokenHeader = req.header('X-Token');
    const token = tokenHeader.split(':')[1];

    // Query redis with the key 'auth_<token>' to get the user id
    const userId = await redisClient.get(`auth_${token}`);

    // Find the user in our db
    const user = dbClient.db.collection('users').findOne({ _id: userId });
    if (!user) {
      return res.status(401).send({ error: 'Unauthorized' });
    }

    // response - user object 'OK'
    return res.status(200).json({ id: userId, email: user.email });
  }
}

export default UsersController;
