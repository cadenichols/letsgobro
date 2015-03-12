/* jshint camelcase:false */

'use strict';

let mongoose = require('mongoose');
let request = require('request');
let _ = require('lodash');
let moment = require('moment');
let Vacation;

let vacationSchema = mongoose.Schema({
  title: {type: String, required: true},
  departureDate: {type: Date, required: true},
  arrivalDate: {type: Date, required: true},
  departureAirport: {type: String, required: true},
  arrivalAirport: {type: String, required: true},
  userId: {type: mongoose.Schema.ObjectId, ref: 'User', required: true},
  createdAt: {type: Date, default: Date.now, required: true}
});

vacationSchema.statics.flights = function(o, cb) {
  o.departureDate = moment(o.departureDate).format('YYYY-MM-DD');
  o.arrivalDate = moment(o.arrivalDate).format('YYYY-MM-DD');
  let options = {
    method: 'POST',
    url: 'https://api.test.sabre.com/v1/auth/token',
    headers: {
      'Authorization': process.env.SABRE_KEY,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  };
  request(options, function(err, response, body){
    if (err) {
      console.log('ERR1:', err);
      cb(err);
    }
    let token = JSON.parse(body).access_token;
    let options = {
      method: 'GET',
      url: 'https://api.test.sabre.com/v1/shop/flights/?origin=' + o.departureAirport +
      '&destination=' + o.arrivalAirport + '&departuredate=' + moment(o.departureDate).format('YYYY-MM-DD') +
      '&returndate=' + moment(o.arrivalDate).format('YYYY-MM-DD'),
      headers: {
        'Authorization': 'Bearer ' + token
      }
    };
    request(options, function(err, response, body){
      if (err) {
        console.log('ERR2:', err);
        cb(err);
      }
      body = JSON.parse(body);
      let results = _.map(body.PricedItineraries, itinerary => {
        let baseFare = itinerary.AirItineraryPricingInfo.ItinTotalFare.BaseFare.Amount;
        let taxArray = itinerary.AirItineraryPricingInfo.ItinTotalFare.Taxes.Tax;
        let taxes = _.reduce(_.pluck(taxArray, 'Amount'), (sum, n) => { return sum + n; });
        let connections = _.map(itinerary.AirItinerary.OriginDestinationOptions.OriginDestinationOption, option => {
          return _.map(option.FlightSegment, segment => {
            let segmentInfo = _.pick(segment, ['DepartureAirport', 'ArrivalAirport', 'DepartureDateTime', 'ArrivalDateTime', 'OperatingAirline']);
            segmentInfo.DepartureDateTime = moment(segmentInfo.DepartureDateTime).format('lll');
            segmentInfo.ArrivalDateTime = moment(segmentInfo.ArrivalDateTime).format('lll');
            return segmentInfo;
          });
        });
        return {baseFare:baseFare, taxes:taxes, connections:connections};
      });
      cb(null, results);
    });
  });
};

Vacation = mongoose.model('Vacation', vacationSchema);
module.exports = Vacation;
