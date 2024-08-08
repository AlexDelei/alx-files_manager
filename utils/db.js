const { MongoClient } = require('mongodb');

class DBClient {
  constructor() {
    this.host = process.env.HOST || 'localhost';
    this.port = process.env.PORT || 27017;
    this.db = process.env.DB_DATABASE || 'files_manager';

    this.url = `mongodb://${this.host}:${this.port}`;
    this.client = new MongoClient(this.url);
  }

  isAlive() {
    const conn = this.client.connect();
    if (conn) return true;
    return false;
  }

  async nbUsers() {
    const _db = this.client.db(this.db);
    const noUsers = await _db.collection('users').countDocuments();
    return noUsers;
  }

  async nbFiles() {
    const _db = this.client.db(this.db);
    const noFiles = await _db.collection('files').countDocuments();
    return noFiles;
  }
}

const dbClient = new DBClient();
export default dbClient;
