/* jshint camelcase:false */

'use strict';

let bcrypt = require('bcrypt');
let mongoose = require('mongoose');
let Request = require('request');
let qs = require('querystring');
let jwt = require('jwt-simple');
let moment = require('moment');
let User;

let userSchema = mongoose.Schema({
  displayName: String,
  photoUrl: String,
  github: String,
  linkedin: String,
  createdAt: {type: Date, default: Date.now, required: true}
});

userSchema.statics.github = function(payload, cb) {
  let accessTokenUrl = 'https://github.com/login/oauth/access_token';
  let userApiUrl = 'https://api.github.com/user';
  let params = {
    code: payload.code,
    client_id: payload.clientId,
    redirect_uri: payload.redirectUri,
    client_secret: process.env.GITHUB_SECRET
  };

  Request.get({url:accessTokenUrl, qs:params}, (err, response, accessToken) => {
    let headers = {'User-Agent':'Satellizer'};
    accessToken = qs.parse(accessToken);
    Request.get({url:userApiUrl, qs:accessToken, headers:headers, json:true}, (err, response, profile) => {
      cb({github:profile.id, displayName:profile.name, photoUrl: profile.avatar_url});      
    });
  });
};

userSchema.statics.linkedin = function(payload, cb) {
  let accessTokenUrl = 'https://www.linkedin.com/uas/oauth2/accessToken';
  let userApiUrl = 'https://api.linkedin.com/v1/people/~:(id,first-name,last-name,email-address,picture-url)';
  console.log('CODE:', payload.code);
  let params = {
    grant_type:'authorization_code',
    code: payload.code,
    client_id: payload.clientId,
    redirect_uri: payload.redirectUri,
    client_secret: process.env.LINKEDIN_SECRET
  };

  Request.post(accessTokenUrl, {form: params, json: true}, (err, response, body) => {
    let params = {
      oauth2_access_token: body.access_token,
      format: 'json'
    };
    Request.get({ url: userApiUrl, qs: params, json: true }, (err, response, profile) => {
      cb({linkedin:profile.id, displayName:(profile.firstName + ' ' + profile.lastName), photoUrl: profile.pictureUrl});      
    });
  });
};

userSchema.statics.create = function(provider, profile, cb) {
  let query = {};
  query[provider] = profile[provider];
  User.findOne(query, (err, user) => {
    if(user) { return cb(err, user); }
    let u = new User(profile);
    u.save(cb);
  });
};

userSchema.methods.token = function() {
  let payload = {
    sub: this._id,
    iat: moment().unix(),
    exp: moment().add(1, 'days').unix()
  };
  return jwt.encode(payload, process.env.TOKEN_SECRET);
};

userSchema.statics.register = function(o, cb){
  User.findOne({email:o.email}, function(err, user){
    if(user){return cb(true);}

    user = new User(o);
    user.password = bcrypt.hashSync(o.password, 8);
    user.save(cb);
  });
};

userSchema.statics.authenticate = function(o, cb){
  User.findOne({email:o.email}, function(err, user){
    if (!user) {return cb(true);}

    var isGood = bcrypt.compareSync(o.password, user.password);
    if (!isGood) {return cb(true);}

    cb(null, user);
  });
};

User = mongoose.model('User', userSchema);
module.exports = User;
