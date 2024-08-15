import sha1 from 'sha1';
import Queue from 'bull/lib/queue';
import dbClient from '../utils/db';
import userUtils from '../utils/user';
import { ObjectId } from 'mongodb';

const userQueue = new Queue('userQueue');

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

    await userQueue.add({
      userId: saved.insertedId.toString(),
    })

    return res.status(201).send(
      {
        id: saved.insertedId,
        email,
      },
    );
  }

  static async getMe(req, res) {
    const { userId } = userUtils.getUserCreds(req);

    const user = await userUtils.getUser({ _id: ObjectId(userId) });

    if (!user) {
      return res.status(401).send({ error: 'Unauthorized' });
    }

    const validUser = { id: user._id, ...user };
    delete validUser._id;
    delete validUser.password;

    return res.status(200).json(validUser);
  }
}

export default UsersController;
