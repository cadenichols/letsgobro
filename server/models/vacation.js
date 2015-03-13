/* jshint camelcase:false */

'use strict';

let mongoose = require('mongoose');
let request = require('request');
let _ = require('lodash');
let moment = require('moment');
let stripe = require('stripe')(process.env.STRIPE_SECRET);
let Vacation;

let vacationSchema = mongoose.Schema({
  title: {type: String, required: true},
  departureDate: {type: Date, required: true},
  arrivalDate: {type: Date, required: true},
  departureAirport: {type: String, required: true},
  arrivalAirport: {type: String, required: true},
  userId: {type: mongoose.Schema.ObjectId, ref: 'User', required: true},
  createdAt: {type: Date, default: Date.now, required: true},
  flight:{
    charge:{
      id: String,
      amount: Number,
      date: Date
    },
    itinerary:{
      outgoingSegments:[{
        departureAirport: String,
        arrivalAirport: String,
        departureDateTime: Date,
        arrivalDateTime: Date,
        airlineCode: String,
        flightNumber: Number,
        duration: Number
      }],
      returningSegments:[{
        departureAirport: String,
        arrivalAirport: String,
        departureDateTime: Date,
        arrivalDateTime: Date,
        airlineCode: String,
        flightNumber: Number,
        duration: Number
      }]
    }
  }
});

vacationSchema.methods.setItinerary = function(o) {
  o[0].forEach((segment) => {
    this.flight.itinerary.outgoingSegments.push(parseSegment(segment));
  });
  o[1].forEach((segment) => {
    this.flight.itinerary.returningSegments.push(parseSegment(segment));
  });
};

function parseSegment(segment) {
  let segmentObject = {};
  segmentObject.departureAirport = segment.DepartureAirport.LocationCode;
  segmentObject.arrivalAirport = segment.ArrivalAirport.LocationCode;
  segmentObject.departureDateTime = moment(segment.DepartureDateTime, 'MMM DD, YYYY hh:ss A').toDate();
  segmentObject.arrivalDateTime = moment(segment.ArrivalDateTime, 'MMM DD, YYYY hh:ss A').toDate();
  segmentObject.airlineCode = segment.OperatingAirline.Code;
  segmentObject.flightNumber = segment.OperatingAirline.FlightNumber;
  segmentObject.duration = segment.ElapsedTime;
  return segmentObject;
}

vacationSchema.methods.purchase = function(o, cb) {
  stripe.charges.create({
    amount: o.cost,
    currency: 'usd',
    source: o.token,
    description: o.description
  }, (err, charge) => {
    if(!err) {
      console.log('model vacation charge:', charge);
      this.flight.charge.id = charge.id;
      this.flight.charge.amount = charge.amount / 100;
      this.flight.charge.date = new Date();
    }
    cb(err, charge);
  });
};

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
          let segment = _.map(option.FlightSegment, segment => {
            let segmentInfo = _.pick(segment, ['DepartureAirport', 'ArrivalAirport', 'DepartureDateTime', 'ArrivalDateTime', 'OperatingAirline', 'ElapsedTime']);
            segmentInfo.DepartureDateTime = moment(segmentInfo.DepartureDateTime).format('lll');
            segmentInfo.ArrivalDateTime = moment(segmentInfo.ArrivalDateTime).format('lll');
            segmentInfo.ElapsedTimeHumanized = moment.duration(segmentInfo.ElapsedTime, 'minutes').humanize();
            return segmentInfo;
          });
          return segment;
        });
        return {baseFare:baseFare, taxes:taxes, connections:connections};
      });
      cb(null, results);
    });
  });
};

Vacation = mongoose.model('Vacation', vacationSchema);
module.exports = Vacation;
