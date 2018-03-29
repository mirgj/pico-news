import { ObjectID } from 'mongodb';
import { expect } from 'chai';
import { logger } from '../../src/helpers/logger';
import { Collections } from '../../src/constants/index';
import { __Rewire__ } from '../../src/db/stories-manager';
import sinon from 'sinon';
import * as storiesManager from '../../src/db/stories-manager';

const dbMock = {
  findOne: (find, project) => { },
  aggregate: (pipeline) => { },
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
const aggregateReturnMock = (result) => {
  return {
    toArray: () => {
      return result;
    },
  };
};

describe('## Stories manager unit tests', () => {

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

  describe('# findOne', () => {
    let aggregateSpy;

    beforeEach(() => {
      aggregateSpy = sinon.stub(dbMock, 'aggregate');
    });

    afterEach(() => {
      aggregateSpy.restore();
    });

    it('it should call findOne correctly', async() => {
      const storyIdTest = '507f1f77bcf86cd799439011';
      const returnStory = { url: 'http://google.it' };
      aggregateSpy.returns(Promise.resolve(aggregateReturnMock([returnStory])));

      const result = await storiesManager.findOne(storyIdTest);

      sinon.assert.calledOnce(collectionSpy);
      sinon.assert.calledWithExactly(collectionSpy, Collections.Stories);
      sinon.assert.calledOnce(aggregateSpy);
      sinon.assert.calledWithExactly(aggregateSpy, sinon.match.array);
      const args = aggregateSpy.getCall(0).args[0];

      expect(collectionSpy.calledBefore(aggregateSpy)).to.be.true;
      expect(result).to.be.not.null;
      expect(result).to.be.an('object');
      expect(result).to.be.equal(returnStory);
      expect(args[0]).to.be.an('object');
      expect(args[0]).to.deep.equal({ $match: { _id: ObjectID(storyIdTest) } });
    });

    it('it should fail to call findOne with a wrong ObjectID', async() => {
      const storyIdTest = 'wrong ObjectID';
      const returnStory = { url: 'http://google.it' };
      aggregateSpy.returns(Promise.resolve(aggregateReturnMock([returnStory])));

      try {
        await storiesManager.findOne(storyIdTest);
        throw new Error('should fail');
      } catch (err) {
        expect(err).to.not.be.null;
        expect(err.message).to.not.be.null;
        expect(err.message).to.be.a('string');
        expect(err.message).to.be.equal('Argument passed in must be a single String of 12 bytes or a string of 24 hex characters');
      } finally {
        sinon.assert.calledOnce(collectionSpy);
        sinon.assert.calledWithExactly(collectionSpy, Collections.Stories);
        sinon.assert.notCalled(aggregateSpy);

        expect(collectionSpy.calledBefore(aggregateSpy)).to.be.true;
      }
    });

    it('it should fail to call findOne', async() => {
      const storyIdTest = '507f1f77bcf86cd799439011';
      const error = new Error('error');
      aggregateSpy.returns(Promise.reject(error));

      try {
        await storiesManager.findOne(storyIdTest);
        throw new Error('should fail');
      } catch (err) {
        expect(err).to.not.be.null;
        expect(err).to.be.equal(error);
      } finally {
        sinon.assert.calledOnce(collectionSpy);
        sinon.assert.calledWithExactly(collectionSpy, Collections.Stories);
        sinon.assert.calledOnce(aggregateSpy);
        sinon.assert.calledWithExactly(aggregateSpy, sinon.match.array);
        const args = aggregateSpy.getCall(0).args[0];

        expect(collectionSpy.calledBefore(aggregateSpy)).to.be.true;
        expect(args[0]).to.be.an('object');
        expect(args[0]).to.deep.equal({ $match: { _id: ObjectID(storyIdTest) } });
      }
    });

  });

  describe('# create', () => {

    it('it should create the story correctly', async() => {
      const userId = '507f1f77bcf86cd799439011';
      const title = 'title';
      const text = 'content text';
      const url = 'http://google.com';
      const returnValue = { acknowledged: true };
      const insertOneSpy = sinon.stub(dbMock, 'insertOne').returns(Promise.resolve(returnValue));

      const result = await storiesManager.create(userId, title, text, url);

      // collectionSpy.restore();
      insertOneSpy.restore();
      sinon.assert.calledOnce(collectionSpy);
      sinon.assert.calledWithExactly(collectionSpy, Collections.Stories);
      sinon.assert.calledOnce(insertOneSpy);
      sinon.assert.calledWithExactly(insertOneSpy, {
        user_id: ObjectID(userId),
        title: title,
        text: text,
        url: url,
        karma: 1,
        created_on: sinon.match.date,
      });

      expect(collectionSpy.calledBefore(insertOneSpy)).to.be.true;
      expect(result).to.be.not.null;
      expect(result).to.be.an('object');
      expect(result).to.be.equal(returnValue);
    });

    it('it should fail to create the user', async() => {
      const userId = '507f1f77bcf86cd799439011';
      const title = 'title';
      const text = 'content text';
      const url = 'http://google.com';
      const returnValue = new Error('err');
      const insertOneSpy = sinon.stub(dbMock, 'insertOne').returns(Promise.reject(returnValue));

      try {
        await storiesManager.create(userId, title, text, url);
        throw new Error('should fail');
      } catch (err) {
        expect(err).to.not.be.null;
        expect(err).to.be.equal(returnValue);
      } finally {
        insertOneSpy.restore();

        sinon.assert.calledOnce(collectionSpy);
        sinon.assert.calledWithExactly(collectionSpy, Collections.Stories);
        sinon.assert.calledOnce(insertOneSpy);
        sinon.assert.calledWithExactly(insertOneSpy, {
          user_id: ObjectID(userId),
          title: title,
          text: text,
          url: url,
          karma: 1,
          created_on: sinon.match.date,
        });

        expect(collectionSpy.calledBefore(insertOneSpy)).to.be.true;
      }
    });

  });

});
