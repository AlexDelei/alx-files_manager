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
    return !!this.client && !!this.client.topology && this.client.topology.isConnected()
  }

  async nbUsers() {
    try {
      await this.client.connect();
      const db = this.client.db(this.dbName);
      const usersCollection = db.collection('users');
      return await usersCollection.countDocuments();
    } catch (error) {
      console.log(error);
      return 0;
    }
  }

  async nbFiles() {
    try {
      await this.client.connect();
      const db = this.client.db(this.dbName);
      const filesCollection = db.collection('files');
      return await filesCollection.countDocuments();
    } catch (error) {
      console.log(error);
      return 0;
    }
  }
}

const dbClient = new DBClient();
export default dbClient;
