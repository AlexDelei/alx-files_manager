import sha1 from 'sha1';
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

    return res.status(201).json(
      {
        id: saved.insertedId,
        email,
      },
    );
  }
}

export default UsersController;
