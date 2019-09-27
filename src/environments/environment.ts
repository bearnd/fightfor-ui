const protocol = 'http';
const host = window.location.host;
const hostApiGateway = '192.168.0.12';

export const environment = {
  production: false,
  protocol: protocol,
  version: '0.10.0',
  apiGateway: {
    domain: hostApiGateway,
  },
  graphql: {
    uri: protocol + '://' + hostApiGateway + '/fightfor-graphql/graphql',
  },
  mapbox: {
    uri: protocol + '://' + hostApiGateway + '/mapbox',
  },
  auth0: {
    clientID: 'owOhMvKuo0cEjsuObyBfxk4y6F0jP8P1',
    domain: 'bearnd.auth0.com',
    responseType: 'token id_token',
    redirectUri: protocol + '://' + host + '/callback',
    scope: 'openid profile email user_metadata app_metadata',
    audience: 'fightfor-backend-dev',
  },
  braintreeGateway: {
    uri: protocol + '://' + hostApiGateway + '/braintree-gateway',
    planId: 'fightfor_premium_monthly'
  },
  sentry: {
    dsn: 'https://8471eee156ee4de8bd5086f92a3a4105@sentry.io/1438884',
    environment: 'development'
  },
};
