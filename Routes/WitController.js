var path = require('path');
var wit = require(path.resolve('./APIs/wit.js')).api;

var controller = function (app) {

    app.get('/', function (req, res) {
        res.send("Available");
    })

    app.post('/', function (req, res) {
        var userMsg = req.body.userMsg;
        var sessionId = req.body.id;
        var context = req.body.context;
        wit.NLP(sessionId, userMsg, context)
            .then(function (result) {
                res.send(result);
            }).catch(function (result) {
                res.end(result)
            })
    });
    // app.post('/', function(req, res){

    // });
}

module.exports = controller;