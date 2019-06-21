var express = require('express');
var querystring = require('querystring');
var https = require('https');

var router = express.Router();

function postToDevMate(pass) {
    // We want to return an entire promise, so the calling function can resolve with the
    // returned license key from the DevMate API
    return new Promise((resolve, reject) => {
        let newPassThrough = JSON.parse(pass);
        // Build the post string from an object
        try {
            let post_data = querystring.stringify({
                'email': newPassThrough.email,
                'company': newPassThrough.company,
                'last_name': newPassThrough.last_name,
                'first_name': newPassThrough.first_name
            });

            // An object of options to indicate where to post to
            // The 'path' has been fetched from the DevMate UI "Partner Licensing" for a specific license type
            let post_options = {
                host: 'activations.devmate.com',
                port: '443',
                path: '/order.php?bundle_id=com.jamie.Paddle-SDK-Test&link1=001-2b7913b0-17775',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': Buffer.byteLength(post_data)
                }
            };

            const body = [];
            // Set up the request, this will not actuall send the POST request yet
            var post_req = https.request(post_options, function(res) {
                res.setEncoding('utf8');
                res.on('data', (chunk) => body.push(chunk));
                res.on('end', () => resolve(body.join('')));
                res.on('error', (err) => reject(err));
            });

            // Now post the data, and close the connection
            post_req.write(post_data);
            post_req.end();
        } catch (err) {
            console.log(err);
        }
    })
}

/* Currently taking webhook fulfillment request, parsing passthrough, and calling devmate API to create
 * customer and generate license to return to Paddle for distribution */
router.post('/', function(req, res, next) {
    if (!req.body.alert_name) {
        postToDevMate(req.body.passthrough) // These are fields gathered on form, name, surname, company, email
            .then(result => {
                res.send(result);
            })
            .catch(err => {
                res.status(400).send(err);
            });
    }
});

module.exports = router;