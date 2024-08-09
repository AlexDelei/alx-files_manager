const { MongoClient } = require('mongodb');

class DBClient {
  constructor() {
    this.host = process.env.HOST || 'localhost';
    this.port = process.env.PORT || 27017;
    this.dbName = process.env.DB_DATABASE || 'files_manager';

    this.url = `mongodb://${this.host}:${this.port}`;
    this.client = new MongoClient(this.url);

    this.client.connect()
      .then(() => {
        this.db = this.client.db(this.dbName);
        console.log('Sucessfully connected to the database');
      }).catch((error) => {
        console.log(`Can't Connect to the database ${error}`);
      });
  }

  isAlive() {
    return this.client.isConnected();
  }

  async nbUsers() {
    try {
      const usersCollection = await this.db.collection('users');
      return usersCollection.countDocuments();
    } catch (error) {
      console.log(`Error trying to fetch users: ${error}`);
      return 0;
    }
  }

  async nbFiles() {
    try {
      const filesCollection = await this.db.collection('files');
      return filesCollection.countDocuments();
    } catch (error) {
      console.log(`Error trying to fetch files: ${error}`);
      return 0;
    }
  }
}

const dbClient = new DBClient();
export default dbClient;
