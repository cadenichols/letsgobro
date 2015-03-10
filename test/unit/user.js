/* jshint expr:true */

'use strict';

require('babel/register');

var User = require('../../server/models/user');
var expect = require('chai').expect;
var Lab = require('lab');
var lab = exports.lab = Lab.script();
var describe = lab.describe;
var it = lab.it;
var beforeEach = lab.beforeEach;
require('../../server/index');
var cp = require('child_process');
var dbname = process.env.MONGO_URL.split('/')[3];
var jwt = require('jwt-simple');
var moment = require('moment');

describe('User Model', function() {
  beforeEach(function(done) {
    cp.execFile(__dirname + '/../scripts/clean-db.sh', [dbname], {cwd:__dirname + '/../scripts'}, function(){
      done();
    });
  });

  describe('.register', function() {
    it('should register a user', function(done) {
      User.register({email:'fay@aol.com', password:'123'}, function(err, user) {
        expect(err).to.not.be.ok;
        expect(user.email).to.equal('fay@aol.com');
        expect(user.password).to.have.length(60);
        expect(user.createdAt).to.be.instanceof(Date);
        expect(user._id).to.be.ok;
        expect(user).to.be.ok;
        done();
      });
    });

    it('should NOT register a user - duplicate email', function(done) {
      User.register({email:'bob@aol.com', password:'123'}, function(err, user) {
        expect(err).to.be.ok;
        expect(user).to.not.be.ok;
        done();
      });
    });
  });

  describe('.authenticate', function() {
    it('should authenticate a user', function(done) {
      User.authenticate({email:'bob@aol.com', password:'123'}, function(err, user) {
        expect(err).to.not.be.ok;
        expect(user.email).to.equal('bob@aol.com');
        expect(user.password).to.equal(null);
        expect(user.createdAt).to.be.instanceof(Date);
        expect(user._id).to.be.ok;
        expect(user).to.be.ok;
        done();
      });
    });

    it('should NOT authenticate a user - bad email', function(done) {
      User.authenticate({email:'wrong@aol.com', password:'123'}, function(err, user) {
        expect(err).to.be.ok;
        expect(user).to.not.be.ok;
        done();
      });
    });

    it('should NOT authenticate a user - bad password', function(done) {
      User.authenticate({email:'bob@aol.com', password:'wrong'}, function(err, user) {
        expect(err).to.be.ok;
        expect(user).to.not.be.ok;
        done();
      });
    });

    it('should NOT authenticate a user - bad email and password', function(done) {
      User.authenticate({email:'wrong@aol.com', password:'wrong'}, function(err, user) {
        expect(err).to.be.ok;
        expect(user).to.not.be.ok;
        done();
      });
    });
  });
  describe('#token', function() {
    it('should create a valid user token', function(done) {
      var steve = new User({email:'steve@aol.com', password:123});
      var token = steve.token();
      var decodedToken = jwt.decode(token, process.env.TOKEN_SECRET);
      expect(token.split('.')).to.have.length.of(3);
      expect(decodedToken.sub).to.equal(steve._id.toString());
      expect(decodedToken.iat).to.be.at.most(moment().unix());
      expect(decodedToken.exp).to.be.at.least(moment().unix());
      done();
    });
  });
  describe('.create', function() {
    it('should create a new user if the given profile does not exist', function(done) {
      var profileObject = {github: 12345, displayName:'Barry Fooson', photoUrl:'picofbarry.jpg'};
      User.create('github', profileObject, function(err, user) {
        expect(err).to.not.be.ok;
        expect(user._id).to.be.ok;
        expect(moment(user.createdAt).unix()).to.be.within(moment().unix()-1,moment().unix()+1);
        expect(user.github).to.equal('12345');
        expect(user.displayName).to.equal('Barry Fooson');
        expect(user.photoUrl).to.equal('picofbarry.jpg');
        done();
      });
    });
    it('should return the user object if it already exists', function(done) {
      var profileObject = {github: 54321, displayName:'Barry Fooson', photoUrl:'picofbarry.jpg'};
      User.create('github', profileObject, function(err, user) {
        expect(err).to.not.be.ok;
        expect(user._id).to.be.ok;
        expect(user.email).to.equal('bob@aol.com');
        expect(user.github).to.equal('54321');
        done();
      });
    });
  });
});
