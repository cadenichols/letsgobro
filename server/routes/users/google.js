'use strict';

let User = require('../../models/user');

module.exports = {
  auth: false,
  handler: function(request, reply){
    User.google(request.payload, profile => {
      User.create('google', profile, (err, user) => {
        let token = user.token();
        reply({token:token, user:user});
      });
    });
  }
};
