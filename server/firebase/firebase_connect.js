const firebase = require('firebase');

const projectID = process.env.PROJECT_ID;
const apiKey = process.env.API_KEY;
const dataBaseName = process.env.DATABASE

const app = firebase.initializeApp({
    apiKey,
    authDomain: `${projectID}.firebaseapp.com`,
    databaseURL: `https://${dataBaseName}.firebaseio.com`,
});

module.exports = app;