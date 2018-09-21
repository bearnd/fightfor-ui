// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  firebase: {
    apiKey: 'AIzaSyCWFGBz_92C4FWFsyZUmWV44y8A3P0v5dk',
    authDomain: 'fightfor-ui-dev.firebaseapp.com',
    databaseURL: 'https://fightfor-ui-dev.firebaseio.com',
    projectId: 'fightfor-ui-dev',
    storageBucket: 'fightfor-ui-dev.appspot.com',
    messagingSenderId: '1062613303831'
  },
  graphql: {
    uri: 'http://localhost:5555/graphql',
  },
  mapbox: {
    uri: 'https://api.mapbox.com',
    apiKey: 'pk.eyJ1IjoiYmVhcm5kIiwiYSI6ImNqbGU4emhhczBqYjczd3BjMHFsZDJsZHYifQ.fo5-TxZxgIPFNqT8sJzchw',
  }
};
