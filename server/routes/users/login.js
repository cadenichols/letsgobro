'use strict';

var User = require('../../models/user');
var Joi = require('joi');

module.exports = {
  auth: false,
  validate: {
    payload: {
      email: Joi.string().email(),
      password: Joi.string().required()
    }
  },
  handler: function(request, reply) {
    User.authenticate(request.payload, function(err, user) {
      if(err){
        reply().code(400);
      }else{
        let token = user.token();
        reply({token:token, user:user});
      }
    });
  }
};
