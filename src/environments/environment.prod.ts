export const environment = {
  production: true,
  apiGateway: {
    domain: 'api.fightfor.app',
  },
  graphql: {
    uri: 'http://api.fightfor.app/fightfor-graphql/graphql',
  },
  mapbox: {
    uri: 'http://api.fightfor.app/mapbox',
  },
  auth0: {
    clientID: 'e8OIuAxekw31C33sllws23hPUGcxS80A',
    domain: 'bearnd.auth0.com',
    responseType: 'token id_token',
    redirectUri: 'https://fightfor.app/callback',
    scope: 'openid profile email user_metadata app_metadata',
    audience: 'fightfor-backend',
  },
  braintreeGateway: {
    uri: 'http://api.fightfor.app/braintree-gateway',
    planId: 'fightfor_premium_monthly'
  },
  sentry: {
    dsn: 'https://8471eee156ee4de8bd5086f92a3a4105@sentry.io/1438884',
  },
};
