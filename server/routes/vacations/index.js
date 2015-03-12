'use strict';

let Vacation = require('../../models/vacation');

module.exports = {
  handler: function(request, reply) {
    Vacation.find({userId: request.auth.credentials._id}, (err, vacations) => {
      if(err || !vacations) {
        reply().code(400);
      } else {
        reply({vacations:vacations});
      }
    });
  }
};
