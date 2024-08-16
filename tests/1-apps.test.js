import {
  expect, use, should, request,
} from 'chai';
import chaiHttp from 'chai-http';
import app from '../server';
import dbClient from '../utils/db';

use(chaiHttp);
should();

describe('status and stats endpoints', () => {
  describe('get /status', () => {
    it('returns the status of redis and mongo connection', async () => {
      const response = await request(app).get('/status').send();
      const body = JSON.parse(response.text);

      expect(body).to.eql({ redis: true, db: true });
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('get /stats', () => {
    before(async () => {
      await dbClient.db.collection('users').deleteMany({});
      await dbClient.db.collection('files').deleteMany({});
    });

    it('returns number of users and files in db', async () => {
      const response = await request(app).get('/stats').send();
      const body = JSON.parse(response.text);

      expect(body).to.eql({ users: 0, files: 0 });
      expect(response.statusCode).to.equal(200);
    });

    it('returns the number of users and files in db', async () => {
      await dbClient.db.collection('files').insertOne({ name: 'Boi' });
      await dbClient.db.collection('files').insertOne({ name: 'image.png' });
      await dbClient.db.collection('files').insertOne({ name: 'file.txt' });

      const response = await request(app).get('/stats').send();
      const body = JSON.parse(response.text);

      expect(body).to.eql({ users: 1, files: 2 });
      expect(response.statusCode).to.equal(200);
    });
  });
});
