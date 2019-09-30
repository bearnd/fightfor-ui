const protocol = 'https';
const host = window.location.host;
const hostApiGateway = 'api.fightfor.app';

export const environment = {
  production: true,
  protocol: protocol,
  version: '0.12.0',
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
    clientID: 'e8OIuAxekw31C33sllws23hPUGcxS80A',
    domain: 'bearnd.auth0.com',
    responseType: 'token id_token',
    redirectUri: protocol + '://' + host + '/callback',
    scope: 'openid profile email user_metadata app_metadata',
    audience: 'fightfor-backend',
  },
  braintreeGateway: {
    uri: protocol + '://' + hostApiGateway + '/braintree-gateway',
    planId: 'fightfor_premium_monthly'
  },
  sentry: {
    dsn: 'https://8471eee156ee4de8bd5086f92a3a4105@sentry.io/1438884',
    environment: host === 'fightfor.app' ? 'production' : 'staging',
  },
};
