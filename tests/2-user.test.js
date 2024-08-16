import {
  expect, use, should, request,
} from 'chai';
import { ObjectId } from 'mongodb';
import chaiHttp from 'chai-http';
import Sinon from 'sinon';
import app from '../server';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

use(chaiHttp);
should();

describe('testing user endpoint', () => {
  const auth = 'Basic Ym9iQGR5bGFuLmNvbTp0b3RvMTIzNCE=';
  let token = '';
  let userId = '';
  const user = {
    email: 'bob@dylan.com',
    password: 'toto1234!',
  };

  before(async () => {
    redisClient.client.flushall('ASYNC');
    await dbClient.db.collection('users').deleteMany({});
    await dbClient.db.collection('files').deleteMany({});
  });

  after(async () => {
    redisClient.client.flushall('ASYNC');
    await dbClient.db.collection('users').deleteMany({});
    await dbClient.db.collection('files').deleteMany({});
  });

  describe('save user records', () => {
    it('returns the id and email of created user', async () => {
      const response = await request(app).post('/users').send(user);
      const body = JSON.parse(response.text);

      expect(body.email).to.equal(user.email);
      expect(body).to.have.property('id');
      expect(response.statusCode).to.equal(201);

      userId = body.id;
      const userMongo = await dbClient.db.collection('users').findOne({
        _id: ObjectId(userId),
      });
      expect(userMongo).to.exist;
    });

    it('fails to create user because password is missing', async () => {
      const user = {
        email: 'bob@dylan.com',
      };
      const response = await request(app).post('/users').send(user);
      const body = JSON.parse(response.text);

      expect(body).to.eql({ error: 'Missing password' });
      expect(response.statusCode).to.equal(400);
    });

    it('fails to create user because email is missing', async () => {
      const user = {
        password: 'toto1234!',
      };
      const response = await request(app).post('/users').send(user);
      const body = JSON.parse(response.text);

      expect(body).to.eql({ error: 'Missing email' });
      expect(response.statusCode).to.equal(400);
    });

    it('fails to create a user because it already exists', async () => {
      const user = {
        email: 'bob@dylan.com',
        password: 'toto1234!',
      };
      const response = await request(app).post('/users').send(user);
      const body = JSON.parse(response.text);

      expect(body).to.eql({ error: 'Already exist' });
      expect(response.statusCode).to.equal(400);
    });
  });

  describe('authenticating a user', () => {
    it('fails of no user is found', async () => {
      const response = await request(app).get('/connect').send();
      const body = JSON.parse(response.text);

      expect(body).to.eql({ error: 'Unauthorized' });
      expect(response.statusCode).to.equal(401);
    });

    it('returns a token if user exists', async () => {
      const spy = Sinon.spy(redisClient, 'set');

      const response = await request(app)
        .get('/connect')
        .set('Authorization', auth)
        .send();
      const body = JSON.parse(response.text);
      token = body.token;

      expect(body).to.have.property('token');
      expect(response.statusCode).to.equal(200);
      expect(
        spy.calledOnceWithExactly(`auth_${token}`, 86400, userId),
      ).to.be.true;

      spy.restore();
    });

    it('token exists in redis', async () => {
      const redisToken = await redisClient.get(`auth_${token}`);
      expect(redisToken).to.exist;
    });
  });

  describe('disauthenticate the user', () => {
    after(async () => {
      redisClient.client.flushall('ASYNC');
    });

    it('should response with unauthorized for no token', async () => {
      const response = await request(app).get('/disconnect').send();
      const body = JSON.parse(response.text);

      expect(body).to.eql({ error: 'Unauthorized' });
      expect(response.statusCode).to.equal(401);
    });

    it('should sign out the user based on the token', async () => {
      const response = await request(app)
        .get('/disconnect')
        .set('X-Token', token)
        .send();
      expect(response.text).to.be.equal('');
      expect(response.statusCode).to.equal(204);
    });

    it('token no longer exists in redis', async () => {
      const redisToken = await redisClient.get(`auth_${token}`);
      expect(redisToken).to.not.exist;
    });
  });

  describe('retreive user', () => {
    before(async () => {
      const response = await request(app)
        .get('/connect')
        .set('Authorization', auth)
        .send();
      const body = JSON.parse(response.text);
      token = body.token;
    });

    it('invalid authorization', async () => {
      const response = await request(app).get('/users/me').send();
      const body = JSON.parse(response.text);

      expect(body).to.be.eql({ error: 'Unauthorized' });
      expect(response.statusCode).to.equal(401);
    });

    it('should retreive the user based on the token', async () => {
      const response = await request(app)
        .get('/users/me')
        .set('X-Token', token)
        .send();
      const body = JSON.parse(response.text);

      expect(body).to.be.eql({ id: userId, email: user.email });
      expect(response.statusCode).to.equal(200);
    });
  });
});
