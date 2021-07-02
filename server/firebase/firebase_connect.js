const firebase = require('firebase');

const projectID = "maya-db-c399";
const apiKey = "hY5T0ePEjalMDpEOXEdaxUw"
const dataBaseName = "maya-db-c3999-default-rtdb"

const app = firebase.initializeApp({
    apiKey,
    authDomain: `${projectID}.firebaseapp.com`,
    databaseURL: `https://${dataBaseName}.firebaseio.com`,
});

module.exports = app;