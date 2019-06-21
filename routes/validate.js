// A Node/Express example, that can be modified for non Express usage
// npm install php-serialize
// npm install crypto
// npm install querystring
const express = require('express');
const querystring = require('querystring');
const crypto = require('crypto');
const Serialize = require('php-serialize');

const router = express.Router();
const pubKey = `-----BEGIN PUBLIC KEY-----
...
-----END PUBLIC KEY-----`

function ksort(obj){
    let keys = Object.keys(obj).sort();
    let sortedObj = {};
  
    for (var i in keys) {
      sortedObj[keys[i]] = obj[keys[i]];
    }
  
    return sortedObj;
  }

function validateWebhook(jsonObj) {
    const mySig = Buffer.from(jsonObj.p_signature, 'base64');
    delete jsonObj.p_signature;
    // Need to serailise array and assign to data object
    jsonObj = ksort(jsonObj);
    for (var property in jsonObj) {
        if (jsonObj.hasOwnProperty(property) && (typeof jsonObj[property]) !== "string") {
            if (Array.isArray(jsonObj[property])) { // is it an array
                jsonObj[property] = jsonObj[property].toString();
            } else { //if its not an array and not a string, then it is a JSON obj
                jsonObj[property] = JSON.stringify(jsonObj[property]);
            }
        }
    }
    const serialized = Serialize.serialize(jsonObj);
    // End serailise data object
    const verifier = crypto.createVerify('sha1');
    verifier.update(serialized);
    verifier.end();

    let verification = verifier.verify(pubKey, mySig);

    if (verification) {
        return 'Yay! Signature is valid!';
    } else {
        return 'The signature is invalid!';
    }
}

/* Validate a Paddle webhook to this endpoint */
router.post('/', function(req, res, next) {
    res.send(validateWebhook(req.body));
});

module.exports = router;