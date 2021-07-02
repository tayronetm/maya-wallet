const firebase = require("./firebase_connect");
import { nanoid } from 'nanoid'

module.exports = {
  saveResume(req, callback){
    let aseet = req.asset;

    firebase.database().ref(`resumes/${aseet}`).set({
      asset: req.asset,
      currentPrice: req.currentPrice,
      pm: req.pm,
      totalQuantity: req.totalQuantity,
      valueInvestTotal: req.valueInvestTotal,
      currentValue: req.currentValue,
      lp: req.lp,
      variation: req.variation
    });
    callback(null, {"statuscode": 200, "message": "OK"})
  },

  saveOperation(req, callback){
    const id = nanoid()
    firebase.database().ref(`operations/${id}`).set({
      name: req.name,
      date: req.date,
      hour: req.hour,
      valueInvest: req.valueInvest,
      quantity: req.quantity,
    });
    callback(null, {"statuscode": 200, "message": "OK"})
  },

  getOperations(res){
    firebase.database().ref(`/operations`)
    .once('value').then(snapshot => {
      res.json(snapshot.val())
    });
  },
}