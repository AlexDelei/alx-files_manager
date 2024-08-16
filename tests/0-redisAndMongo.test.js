import { expect, use, should } from 'chai';
import chaiHttp from 'chai-http';
import { promisify } from 'util';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

use(chaiHttp);
should();

describe('testing the clients for MongoDB and Redis', () => {
  describe('redis Client', () => {
    before(async () => {
      redisClient.client.flushall('ASYNC');
    });

    after(async () => {
      redisClient.client.flushall('ASYNC');
    });

    it('shows that connection is alive', async () => {
      expect(redisClient.isAlive()).to.equal(true);
    });

    it('returns key as null because it does not exist', async () => {
      expect(await redisClient.get('dublin')).to.equal(undefined);
    });

    it('set key can be called without issue', async () => {
      expect(await redisClient.set('alex', 12, 1)).to.equal(undefined);
    });

    it('returns key with null because it expired', async () => {
      const sleep = promisify(setTimeout);
      await sleep(1000);
      expect(await redisClient.get('dublin')).to.equal(null);
    });
  });

  describe('db client', () => {
    before(async () => {
      await dbClient.db.collection('users').deleteMany({});
      await dbClient.db.collection('files').deleteMany({});
    });

    after(async () => {
      await dbClient.db.collection('users').deleteMany({});
      await dbClient.db.collection('files').deleteMany({});
    });

    it('shows that connection is alive', () => {
      expect(dbClient.isAlive()).to.equal(true);
    });

    it('shows the number of user documents', async () => {
      await dbClient.db.collection('users').deleteMany({});
      expect(await dbClient.nbUsers()).to.equal(0);

      await dbClient.db.collection('users').insertOne({ name: 'Brian' });
      await dbClient.db.collection('users').insertOne({ name: 'John' });
      expect(await dbClient.nbUsers()).to.equal(2);
    });

    it('shows the number of file documents', async () => {
      await dbClient.db.collection('files').deleteMany({});
      expect(await dbClient.nbFiles()).to.equal(0);

      await dbClient.db.collection('files').insertOne({ name: 'Accounts File' });
      await dbClient.db.collection('files').insertOne({ name: 'Register' });
      expect(await dbClient.nbUsers()).to.equal(2);
    });
  });
});
