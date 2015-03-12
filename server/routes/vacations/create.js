'use strict';

let Vacation = require('../../models/vacation');
let Joi = require('joi');

module.exports = {
  validate: {
    payload: {
      title: Joi.string().min(3).required(),
      departureDate: Joi.date().min('now').required(),
      arrivalDate: Joi.date().min('now').required(),
      departureAirport: Joi.string().length(3).required(),
      arrivalAirport: Joi.string().length(3).required()
    }
  },
  handler: function(request, reply) {
    request.payload.userId = request.auth.credentials._id;
    request.payload.departureAirport = request.payload.departureAirport.toUpperCase();
    request.payload.arrivalAirport = request.payload.arrivalAirport.toUpperCase();
    let vacation = new Vacation(request.payload);
    vacation.save((err,v) => {
      reply({vacationId: v._id});
    });
  }
};
