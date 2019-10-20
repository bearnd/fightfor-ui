const host = window.location.host;
const hostApiGateway = 'api.fightfor.app';

export const environment = {
  production: false,
  version: '0.14.0',
  apiGateway: {
    domain: hostApiGateway,
  },
  graphql: {
    uri: 'https://' + hostApiGateway + '/fightfor-graphql/graphql',
  },
  mapbox: {
    uri: 'https://' + hostApiGateway + '/mapbox',
  },
  auth0: {
    clientID: 'e8OIuAxekw31C33sllws23hPUGcxS80A',
    domain: 'bearnd.auth0.com',
    responseType: 'token id_token',
    redirectUri: 'http://' + host + '/callback',
    scope: 'openid profile email user_metadata app_metadata',
    audience: 'fightfor-backend',
  },
  braintreeGateway: {
    uri: 'https://' + hostApiGateway + '/braintree-gateway',
    planId: 'fightfor_premium_monthly'
  },
  sentry: {
    dsn: 'https://8471eee156ee4de8bd5086f92a3a4105@sentry.io/1438884',
    environment: 'development'
  },
  clubhouse: {
    uri: 'https://' + hostApiGateway + '/clubhouse',
    supportProjectId: 1618,
  },
};
