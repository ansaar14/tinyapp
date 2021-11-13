const { assert } = require('chai');

const { getUserByEmail, generateRandomString, urlsForUser, isEmailTaken } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

const urlDatabase = {
  b6UTxQ: {
    longURL: 'https://www.tsn.ca',
    userID: 'user1'
  },
  i3BoGr: {
    longURL: 'https://www.google.ca',
    userID: 'user2'
  }
};


describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail(testUsers, "user@example.com");
    const expectedOutput = "userRandomID";
    assert.equal(user.id, expectedOutput);
  });
});


describe('getUserByEmail - email not in database', function() {

  it('should return undefined if email not found in database', function() {
    const user = getUserByEmail("user99@example.com", testUsers);
    const expectedOutput = undefined;
    assert(user === expectedOutput, 'function returns undefined');
  });
});


describe('generateRandomString', function() {

  it('should return a string with 6 characters', function() {
    const stringLength = generateRandomString().length;
    const expectedOutput = 6;
    assert.equal(stringLength, expectedOutput);
  });

  it('should not return the same string when called multiple times', function() {
    const string1 = generateRandomString();
    const string2 = generateRandomString();
    assert.notEqual(string1, string2);
  });
});

describe('urlsForUser', function() {

  it('should return an object of url corresponding to given user ID', function() {
    const specUrl = urlsForUser('user1', urlDatabase);
    const expectedOutput = {
      b6UTxQ: {
        longURL: 'https://www.tsn.ca',
        userID: 'user1' }
    };
    assert.deepEqual(specUrl, expectedOutput);
  });

  it('should return an empty object if no urls exist for a given user ID', function() {
    const noSpecUrls = urlsForUser('non-existent user', urlDatabase);
    const expectedOutput = {};
    assert.deepEqual(noSpecUrls, expectedOutput);
  });
});

describe('isEmailTaken', function() {

  it('should return true if email has a user in DB', function() {
    const EmailTaken = isEmailTaken(testUsers, "user@example.com");
    const expectedOutput = true;
    assert.equal(EmailTaken, expectedOutput);
  });

  it('should return false if email does not have a user in DB', function() {
    const emailNotTaken = isEmailTaken(testUsers, "nonexistent@test.com");
    const expectedOutput = false;
    assert.equal(emailNotTaken, expectedOutput);
  });
});

  
