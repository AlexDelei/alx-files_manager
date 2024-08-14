import sha1 from 'sha1';
import dbClient from '../utils/db';

class UsersController {
  static async postNew(req, res) {
    return res.status(200).send(req.body);
  }
}

export default UsersController;
