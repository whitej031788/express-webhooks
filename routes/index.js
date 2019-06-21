var express = require('express');
var mongoose = require('mongoose');

var router = express.Router();

var webhookSchema = new mongoose.Schema({
  content: Object
});

function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { guid: guid() });
});

/* Just store POST body in MONGO for inspection */
router.post('/', function(req, res, next) {
  var Content = mongoose.model("Content", webhookSchema);
  var jsonStr = {
    content: req.body
  };
  var myData = new Content(jsonStr);
  myData.save()
    .then(item => {
      res.send("item saved to database");
    })
    .catch(err => {
      res.status(400).send("unable to save to database");
    });
});

module.exports = router;
