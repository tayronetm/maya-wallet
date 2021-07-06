const express = require('express');
const Binance = require('binance-api-node').default
const cors = require('cors');
const { nanoid } = require('nanoid')
const path = require("path");

const app = express();
const port = 3001;
const firebase = require("./firebase/firebase_connect");
const binance = Binance();

app.use(express.json())
app.use(cors());

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
  res.sendFile('index.html');
});

app.get('/prices', async (req, res) => {
  const query = req.query.name;
  const responseAPI = await binance.prices({ symbol: query });
  const priceFormatted = Number(responseAPI[query]).toFixed(2);
  res.send({ name: query, price: priceFormatted });
});

app.get('/operations', async ({ body }, res) => {
  firebase.database().ref(`/operations`)
    .once('value').then(snapshot => {
      res.send(snapshot.val())
    });
});

app.get('/resumes', async ({ body }, res) => {
  firebase.database().ref(`/resumes`)
    .once('value').then(snapshot => {
      res.send(snapshot.val())
    });
});

app.post('/resumes/push', async ({ body }, res) => {
  console.log(body)
  const id = nanoid()
  firebase.database().ref(`/resumes/`).push({
    id,
    asset: body.asset,
    currentPrice: body.currentPrice,
    pm: body.pm,
    totalQuantity: body.totalQuantity,
    valueInvestTotal: body.valueInvestTotal,
    currentValue: body.currentValue,
    lp: body.lp,
    variation: body.variation
  });
  res.send('foi')
  // gambiarra(firebase.database().ref(`/resumes`), res)
});

app.post('/resumes/set', async ({ body }, res) => {
  console.log(body)
  const id = nanoid()
  firebase.database().ref(`/resumes/`).set({
    id,
    asset: body.asset,
    currentPrice: body.currentPrice,
    pm: body.pm,
    totalQuantity: body.totalQuantity,
    valueInvestTotal: body.valueInvestTotal,
    currentValue: body.currentValue,
    lp: body.lp,
    variation: body.variation
  });
  res.send('foi')
  // gambiarra(firebase.database().ref(`/resumes`), res)
});

app.post('/operations', async (req, res) => {
  console.log('post operations')
  firebase.database().ref(`/operations/`).push({
    asset: req.body.asset,
    date: req.body.date,
    hour: req.body.hour,
    valueInvest: req.body.valueInvest,
    quantity: req.body.quantity,
  })
  res.send('foi')
  // gambiarra(firebase.database().ref(`/operations`), res)
});

app.put('/resumes/:id', async (req, res) => {
  const id = req.params.id;
  console.log('ID', id)
  firebase.database().ref(`/resumes/${id}`).set({
    asset: req.body.asset,
    currentPrice: req.body.currentPrice,
    pm: req.body.pm,
    totalQuantity: req.body.totalQuantity,
    valueInvestTotal: req.body.valueInvestTotal,
    currentValue: req.body.currentValue,
    lp: req.body.lp,
    variation: req.body.variation
  });
  res.send("Data saved successfully.");
});

app.listen(process.env.PORT || port)