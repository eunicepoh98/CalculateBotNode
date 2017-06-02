var wit = module.exports = {};

var witConfig = require('../config').wit;
const { Wit, log } = require('node-wit');

var serverToken = witConfig.serverToken;
var sessionResult = {};

wit.api = {
    NLP: function (sessionId, userMsg, prevContext) {
        return new Promise((resolve, reject) => {
            client.runActions(sessionId, userMsg, prevContext)
                .then((context1) => {
                    var result = sessionResult[sessionId];
                    //console.log(result);
                    delete sessionResult[sessionId];
                    //console.log('The session state is now for ' + sessionId + ': ' + JSON.stringify(context1));
                    var res = {
                        "botMessage": result.response.text,
                        "context": result.request.context
                    }
                    resolve(res);
                })
        })
    }
}

const actions = {
    send(request, response) {
        const { sessionId, context, entities } = request;
        const { text, quickreplies } = response;
        sessionResult[sessionId] = { "response": response, "request": request };
    },
    ['getOperation']({ context, entities }) {
        const operation = firstEntityValue(entities, 'operation');
        if (operation) {
            context.operation = operation;
            delete context.missingOperation;
            delete context.yesResult;
            delete context.noResult;
        } else {
            context.missingOperation = true;
        }
        return context;
    },
    ['getFirstNumber']({ context, entities }) {
        console.log("context: " + JSON.stringify(context));
        const firstNumber = firstEntityValue(entities, 'number');
        if (firstNumber) {
            context.operation = context['operation'];
            context.firstNumber = firstNumber;
            delete context.missingFirstNumber;
        } else {
            context.operation = context['operation'];
            context.missingFirstNumber = true;
        }
        return context;
    },
    ['getSecondNumber']({ context, entities }) {
        const secondNumber = firstEntityValue(entities, 'number');
        if (secondNumber) {
            context.operation = context['operation'];
            context.firstNumber = context['firstNumber'];
            context.secondNumber = secondNumber;
            delete context.missingSecondNumber;
        } else {
            context.operation = context['operation'];
            context.firstNumber = context['firstNumber'];
            context.missingSecondNumber = true;
        }
        return context;
    },
    ['calculateMaths']({ context, entities }) {
        const reply = firstEntityValue(entities, 'yes_no');
        var operation = context['operation'];
        var firstNo = context['firstNumber'];
        var secondNo = context['secondNumber'];
        var result;
        switch (operation) {
            case 'add':
                result = firstNo + secondNo;
                break;
            case 'subtract':
                result = firstNo - secondNo;
                break;
            case 'divide':
                result = firstNo / secondNo;
                break;
            case 'multiply':
                result = firstNo * secondNo;
                break;
        }
        switch (reply) {
            case 'yes':
                delete context.operation;
                delete context.firstNumber;
                delete context.secondNumber;
                context.yesResult = result;
                break;
            case 'no':
                delete context.operation;
                delete context.firstNumber;
                delete context.secondNumber;
                context.noResult = result;
                break;
        }
        return context;
    }
}
const firstEntityValue = (entities, entity) => {
    const val = entities && entities[entity] &&
        Array.isArray(entities[entity]) &&
        entities[entity].length > 0 &&
        entities[entity][0].value
        ;
    if (!val) {
        return null;
    }
    return typeof val === 'object' ? val.value : val;
};
const client = new Wit({ accessToken: serverToken, actions });