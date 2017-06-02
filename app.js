// call the packages we need
var express = require('express');
var cors = require('cors');
var app = express();
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));// support encoded bodies
app.use(bodyParser.json()); //Support JSON encoded bodies
app.use(cors());//Enable cors for all routes
var port = process.env.VCAP_APP_PORT || 3000;

require("./Routes/WitController.js")(app);

var router = express.Router(); // get an instance of the express Router

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);
