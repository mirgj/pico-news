import { ObjectID } from 'mongodb';
import { expect } from 'chai';
import { logger } from '../../../src/helpers/logger';
import { Collections } from '../../../src/constants/index';
import { __Rewire__ } from '../../../src/db/users-manager';
import sinon from 'sinon';
import * as usersManager from '../../../src/db/users-manager';

const dbMock = {
  findOne: (find, project) => { },
  insertOne: (data) => { },
  updateOne: (find, set) => { },
};
const dbStateMock = {
  defaultDbInstance: {
    collection: (name) => {
      return dbMock;
    },
  },
};

describe('## manager/users-manager.js unit tests', () => {

  before(() => {
    logger.transports[0].level = 'error';

    __Rewire__('dbState', dbStateMock);
  });
  let collectionSpy;

  beforeEach(() => {
    collectionSpy = sinon.spy(dbStateMock.defaultDbInstance, 'collection');
  });

  afterEach(() => {
    collectionSpy.restore();
  });


  describe('# findOneByUsername', () => {

    it('it should call findOneByUsername correctly', async() => {
      const userNameTest = 'test';
      const returnUser = { username: 'test' };
      const findOneSpy = sinon.stub(dbMock, 'findOne').returns(Promise.resolve(returnUser));

      const result = await usersManager.findOneByUsername(userNameTest);

      findOneSpy.restore();
      sinon.assert.calledOnce(collectionSpy);
      sinon.assert.calledWithExactly(collectionSpy, Collections.Users);
      sinon.assert.calledOnce(findOneSpy);
      sinon.assert.calledWithExactly(findOneSpy, { username: userNameTest });

      expect(collectionSpy.calledBefore(findOneSpy)).to.be.true;
      expect(result).to.be.not.null;
      expect(result).to.be.an('object');
      expect(result).to.be.equal(returnUser);
    });

    it('it should fail to call findOneByUsername', async() => {
      const userNameTest = 'test';
      const error = new Error('error');
      const findOneSpy = sinon.stub(dbMock, 'findOne').returns(Promise.reject(error));

      try {
        await usersManager.findOneByUsername(userNameTest);
        throw new Error('should fail');
      } catch (err) {
        expect(err).to.not.be.null;
        expect(err).to.be.equal(error);
      } finally {
        findOneSpy.restore();
        sinon.assert.calledOnce(collectionSpy);
        sinon.assert.calledWithExactly(collectionSpy, Collections.Users);
        sinon.assert.calledOnce(findOneSpy);
        sinon.assert.calledWithExactly(findOneSpy, { username: userNameTest });

        expect(collectionSpy.calledBefore(findOneSpy)).to.be.true;
      }
    });

  });

  describe('# findOne', () => {

    it('it should call findOne correctly', async() => {
      const userIdTest = '507f1f77bcf86cd799439011';
      const returnUser = { username: 'test' };
      const findOneSpy = sinon.stub(dbMock, 'findOne').returns(Promise.resolve(returnUser));

      const result = await usersManager.findOne(userIdTest);

      findOneSpy.restore();
      sinon.assert.calledOnce(collectionSpy);
      sinon.assert.calledWithExactly(collectionSpy, Collections.Users);
      sinon.assert.calledOnce(findOneSpy);
      sinon.assert.calledWithExactly(findOneSpy, { _id: ObjectID(userIdTest) }, { fields: { password: 0 } });

      expect(collectionSpy.calledBefore(findOneSpy)).to.be.true;
      expect(result).to.be.not.null;
      expect(result).to.be.an('object');
      expect(result).to.be.equal(returnUser);
    });

    it('it should fail to call findOne with a wrong ObjectID', async() => {
      const userIdTest = 'wrong ObjectID';
      const returnUser = { username: 'test' };
      const findOneSpy = sinon.stub(dbMock, 'findOne').returns(Promise.resolve(returnUser));

      try {
        await usersManager.findOne(userIdTest);
        throw new Error('should fail');
      } catch (err) {
        expect(err).to.not.be.null;
        expect(err.message).to.not.be.null;
        expect(err.message).to.be.a('string');
        expect(err.message).to.be.equal('Argument passed in must be a single String of 12 bytes or a string of 24 hex characters');
      } finally {
        findOneSpy.restore();
        sinon.assert.calledOnce(collectionSpy);
        sinon.assert.calledWithExactly(collectionSpy, Collections.Users);
        sinon.assert.notCalled(findOneSpy);

        expect(collectionSpy.calledBefore(findOneSpy)).to.be.true;
      }
    });

    it('it should fail to call findOne', async() => {
      const userIdTest = '507f1f77bcf86cd799439011';
      const error = new Error('error');
      const findOneSpy = sinon.stub(dbMock, 'findOne').returns(Promise.reject(error));

      try {
        await usersManager.findOne(userIdTest);
        throw new Error('should fail');
      } catch (err) {
        expect(err).to.not.be.null;
        expect(err).to.be.equal(error);
      } finally {
        findOneSpy.restore();
        sinon.assert.calledOnce(collectionSpy);
        sinon.assert.calledWithExactly(collectionSpy, Collections.Users);
        sinon.assert.calledOnce(findOneSpy);
        sinon.assert.calledWithExactly(findOneSpy, { _id: ObjectID(userIdTest) }, { fields: { password: 0 } });

        expect(collectionSpy.calledBefore(findOneSpy)).to.be.true;
      }
    });

  });

  describe('# create', () => {

    it('it should create the user correctly', async() => {
      const usernameTest = 'username';
      const passwordTest = 'password';
      const returnValue = { acknowledged: true };
      const insertOneSpy = sinon.stub(dbMock, 'insertOne').returns(Promise.resolve(returnValue));

      const result = await usersManager.create(usernameTest, passwordTest);

      insertOneSpy.restore();
      sinon.assert.calledOnce(collectionSpy);
      sinon.assert.calledWithExactly(collectionSpy, Collections.Users);
      sinon.assert.calledOnce(insertOneSpy);
      sinon.assert.calledWithExactly(insertOneSpy, {
        username: usernameTest,
        password: passwordTest,
        karma: 1,
        created_on: sinon.match.date,
      });

      expect(collectionSpy.calledBefore(insertOneSpy)).to.be.true;
      expect(result).to.be.not.null;
      expect(result).to.be.an('object');
      expect(result).to.be.equal(returnValue);
    });

    it('it should fail to create the user', async() => {
      const usernameTest = 'username';
      const passwordTest = 'password';
      const returnValue = new Error('err');
      const insertOneSpy = sinon.stub(dbMock, 'insertOne').returns(Promise.reject(returnValue));

      try {
        await usersManager.create(usernameTest, passwordTest);
        throw new Error('should fail');
      } catch (err) {
        expect(err).to.not.be.null;
        expect(err).to.be.equal(returnValue);
      } finally {
        insertOneSpy.restore();

        sinon.assert.calledOnce(collectionSpy);
        sinon.assert.calledWithExactly(collectionSpy, Collections.Users);
        sinon.assert.calledOnce(insertOneSpy);
        sinon.assert.calledWithExactly(insertOneSpy, {
          username: usernameTest,
          password: passwordTest,
          karma: 1,
          created_on: sinon.match.date,
        });

        expect(collectionSpy.calledBefore(insertOneSpy)).to.be.true;
      }
    });

  });

  describe('# update', () => {

    it('it should update the user correctly', async() => {
      const userIdTest = '507f1f77bcf86cd799439011';
      const email = 'test@test.com';
      const about = 'this is a test';
      const returnValue = { acknowledged: true };
      const updateOneSpy = sinon.stub(dbMock, 'updateOne').returns(Promise.resolve(returnValue));

      const result = await usersManager.update(userIdTest, email, about);

      updateOneSpy.restore();
      sinon.assert.calledOnce(collectionSpy);
      sinon.assert.calledWithExactly(collectionSpy, Collections.Users);
      sinon.assert.calledOnce(updateOneSpy);
      sinon.assert.calledWithExactly(updateOneSpy, { _id: ObjectID(userIdTest) }, {
        $set: {
          email: email,
          about: about,
          updated_on: sinon.match.date,
        },
      });

      expect(collectionSpy.calledBefore(updateOneSpy)).to.be.true;
      expect(result).to.be.not.null;
      expect(result).to.be.an('object');
      expect(result).to.be.equal(returnValue);
    });

    it('it should update the user email and clean the about field', async() => {
      const userIdTest = '507f1f77bcf86cd799439011';
      const email = 'test@test.com';
      const returnValue = { acknowledged: true };
      const updateOneSpy = sinon.stub(dbMock, 'updateOne').returns(Promise.resolve(returnValue));

      const result = await usersManager.update(userIdTest, email, null);

      updateOneSpy.restore();
      sinon.assert.calledOnce(collectionSpy);
      sinon.assert.calledWithExactly(collectionSpy, Collections.Users);
      sinon.assert.calledOnce(updateOneSpy);
      sinon.assert.calledWithExactly(updateOneSpy, { _id: ObjectID(userIdTest) }, {
        $set: {
          email: email,
          updated_on: sinon.match.date,
        },
        $unset: {
          about: 1,
        },
      });

      expect(collectionSpy.calledBefore(updateOneSpy)).to.be.true;
      expect(result).to.be.not.null;
      expect(result).to.be.an('object');
      expect(result).to.be.equal(returnValue);
    });

    it('it should update the user about and clean the email', async() => {
      const userIdTest = '507f1f77bcf86cd799439011';
      const about = 'this is a about field';
      const returnValue = { acknowledged: true };
      const updateOneSpy = sinon.stub(dbMock, 'updateOne').returns(Promise.resolve(returnValue));

      const result = await usersManager.update(userIdTest, null, about);

      updateOneSpy.restore();
      sinon.assert.calledOnce(collectionSpy);
      sinon.assert.calledWithExactly(collectionSpy, Collections.Users);
      sinon.assert.calledOnce(updateOneSpy);
      sinon.assert.calledWithExactly(updateOneSpy, { _id: ObjectID(userIdTest) }, {
        $set: {
          about: about,
          updated_on: sinon.match.date,
        },
        $unset: {
          email: 1,
        },
      });

      expect(collectionSpy.calledBefore(updateOneSpy)).to.be.true;
      expect(result).to.be.not.null;
      expect(result).to.be.an('object');
      expect(result).to.be.equal(returnValue);
    });

    it('it should fail to update the user with a wrong ObjectID', async() => {
      const userIdTest = 'wrong ObjectID';
      const email = 'test@test.com';
      const about = 'this is a test';
      const returnValue = { acknowledged: true };
      const updateOneSpy = sinon.stub(dbMock, 'updateOne').returns(Promise.resolve(returnValue));

      try {
        await usersManager.update(userIdTest, email, about);
        throw new Error('should fail');
      } catch (err) {
        expect(err).to.not.be.null;
        expect(err.message).to.not.be.null;
        expect(err.message).to.be.a('string');
        expect(err.message).to.be.equal('Argument passed in must be a single String of 12 bytes or a string of 24 hex characters');
      } finally {
        updateOneSpy.restore();
        sinon.assert.calledOnce(collectionSpy);
        sinon.assert.calledWithExactly(collectionSpy, Collections.Users);
        sinon.assert.notCalled(updateOneSpy);
      }
    });

    it('it should fail to update the user', async() => {
      const userIdTest = '507f1f77bcf86cd799439011';
      const email = 'test@test.com';
      const about = 'this is a test';
      const returnValue = new Error('error');
      const updateOneSpy = sinon.stub(dbMock, 'updateOne').returns(Promise.reject(returnValue));

      try {
        await usersManager.update(userIdTest, email, about);
        throw new Error('should fail');
      } catch (err) {
        expect(err).to.not.be.null;
        expect(err).to.be.equal(returnValue);
      } finally {
        updateOneSpy.restore();
        sinon.assert.calledOnce(collectionSpy);
        sinon.assert.calledWithExactly(collectionSpy, Collections.Users);
        sinon.assert.calledOnce(updateOneSpy);
        sinon.assert.calledWithExactly(updateOneSpy, { _id: ObjectID(userIdTest) }, {
          $set: {
            email: email,
            about: about,
            updated_on: sinon.match.date,
          },
        });

        expect(collectionSpy.calledBefore(updateOneSpy)).to.be.true;
      }
    });

  });

  describe('# incrementVote', () => {

    it('it should fail to increment the vote with a wrong ObjectID', async() => {
      const userIdTest = 'wrong ObjectID';
      const voteDiff = -1;
      const returnValue = { acknowledged: true };
      const updateOneSpy = sinon.stub(dbMock, 'updateOne').returns(Promise.resolve(returnValue));

      try {
        await usersManager.incrementVote(userIdTest, voteDiff);
        throw new Error('should fail');
      } catch (err) {
        expect(err).to.not.be.null;
        expect(err.message).to.not.be.null;
        expect(err.message).to.be.a('string');
        expect(err.message).to.be.equal('Argument passed in must be a single String of 12 bytes or a string of 24 hex characters');
      } finally {
        updateOneSpy.restore();
        sinon.assert.calledOnce(collectionSpy);
        sinon.assert.calledWithExactly(collectionSpy, Collections.Users);
        sinon.assert.notCalled(updateOneSpy);
      }
    });

    it('should increment the vote correctly', async() => {
      const userIdTest = '507f1f77bcf86cd799439011';
      const voteDiff = -1;
      const returnValue = { acknowledged: true };
      const updateOneSpy = sinon.stub(dbMock, 'updateOne').returns(Promise.resolve(returnValue));

      const result = await usersManager.incrementVote(userIdTest, voteDiff);

      updateOneSpy.restore();
      sinon.assert.calledOnce(collectionSpy);
      sinon.assert.calledWithExactly(collectionSpy, Collections.Users);
      sinon.assert.calledOnce(updateOneSpy);
      sinon.assert.calledWithExactly(updateOneSpy, { _id: ObjectID(userIdTest) }, { $inc: { karma: voteDiff } });

      expect(collectionSpy.calledBefore(updateOneSpy)).to.be.true;
      expect(result).to.be.not.null;
      expect(result).to.be.an('object');
      expect(result).to.be.equal(returnValue);
    });

  });

});
