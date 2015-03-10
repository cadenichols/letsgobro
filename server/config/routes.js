'use strict';

module.exports = [
  {method: 'get', path: '/{param*}', config: require('../routes/general/static')},

  {method: 'post', path: '/login', config: require('../routes/users/login')},

  {method: 'post', path: '/auth/signup', config: require('../routes/users/register')},
  {method: 'post', path: '/auth/login', config: require('../routes/users/login')},

  {method: 'post', path: '/auth/github', config: require('../routes/users/github')},
  {method: 'post', path: '/auth/linkedin', config: require('../routes/users/linkedin')},
  {method: 'post', path: '/auth/google', config: require('../routes/users/google')},
  {method: 'post', path: '/auth/facebook', config: require('../routes/users/facebook')},
  {method: 'get', path: '/auth/twitter', config: require('../routes/users/twitter')}
];
