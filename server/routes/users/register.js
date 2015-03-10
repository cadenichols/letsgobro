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
  handler: function(request, reply){
    User.register(request.payload, (err, user) => {
      if(err) { return reply().code(400); }
      let token = user.token();
      reply({token:token, user:user});
    });
  }
};
