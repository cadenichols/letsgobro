'use strict';

let Vacation = require('../../models/vacation');

module.exports = {
  handler: function(request, reply) {
    Vacation.findById(request.params.vacationId, (err, vacation) => {
      if(err || !vacation) {
        reply().code(400);
      } else {
        reply({vacation:vacation});
      }
    });
  }
};
