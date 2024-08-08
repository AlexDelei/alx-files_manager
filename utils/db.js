const { MongoClient } = require('mongodb');

class DBClient {
  constructor() {
    this.host = process.env.HOST || 'localhost';
    this.port = process.env.PORT || 27017;
    this.dbName = process.env.DB_DATABASE || 'files_manager';

    this.url = `mongodb://${this.host}:${this.port}`;
    this.client = new MongoClient(this.url);
  }

  isAlive() {
    return this.client.connect();
  }

  async nbUsers() {
    this.client.connect();
    const db = this.client.db(this.dbName);
    return db.collection('users').countDocuments();
  }

  async nbFiles() {
    this.client.connect();
    const db = this.client.db(this.dbName);
    return db.collection('files').countDocuments();
  }
}

const dbClient = new DBClient();
export default dbClient;
