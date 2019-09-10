// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  apiGateway: {
    domain: '192.168.0.12',
  },
  graphql: {
    uri: 'http://192.168.0.12/fightfor-graphql/graphql',
  },
  mapbox: {
    uri: 'http://192.168.0.12/mapbox',
  },
  auth0: {
    clientID: 'owOhMvKuo0cEjsuObyBfxk4y6F0jP8P1',
    domain: 'bearnd.auth0.com',
    responseType: 'token id_token',
    redirectUri: 'http://localhost:4200/callback',
    scope: 'openid profile email user_metadata app_metadata',
    audience: 'fightfor-backend-dev',
  },
  braintreeGateway: {
    uri: 'http://192.168.0.12/braintree-gateway',
    planId: 'fightfor_premium_monthly'
  },
  sentry: {
    dsn: 'https://8471eee156ee4de8bd5086f92a3a4105@sentry.io/1438884',
  },
};
