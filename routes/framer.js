const express = require('express');
const https = require('https');
const querystring = require('querystring'); 

//const authCode = '12ade23ed9b83f6e340fedee355ac357aa37bd83537d0c931a';
//const vendorId = 18370;
const authCode = '26e261a96e12bea2d9cecd2a568db1268f3836b7e7c88cc714';
const vendorId = 33958;

var globalOptions = {
  host: 'vendors.paddle.com',
  port: 443,
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  }
};

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  callPaddleAPI('/api/2.0/subscription/plans', { }, function(apiResp) {
    res.render('framer', {plans : apiResp.response});
  });
});

/* GET home page. */
router.get('/plan/:planId', function(req, res, next) {
  callPaddleAPI('/api/2.0/subscription/users', { plan: req.params.planId }, function(apiResp) {
    console.log(apiResp);
    res.render('framer-users', {users : apiResp.response});
  });
});

function callPaddleAPI(thePath, postData, callback) {
  let options = globalOptions;
  postData.vendor_auth_code = authCode;
  postData.vendor_id = vendorId;

  let myData = querystring.stringify(postData);

  options.path = thePath;

  var req = https.request(options, function(res) {
    let response = "";
  
    res.on('data', function(chunk) {
      response += chunk;
    });
  
    res.on('end', function() {
      callback(JSON.parse(response));
    });
  
    res.on('close', function() {
      callback(JSON.parse(response));
    });
  });
  
  req.write(myData);
  req.end();
}

module.exports = router;