'use strict';

let Vacation = require('../../models/vacation');

module.exports = {
  handler: function(request, reply) {
    Vacation.findById(request.params.vacation, (err, v) => {
      v.purchase(request.payload, (err, charge) => {
        v.setItinerary(request.payload.itinerary.connections);
        v.save(() =>{
          reply();
        });
      });
    });
  }
};
