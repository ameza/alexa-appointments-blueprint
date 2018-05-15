// dotenv brings in the environment variables from the .env file and
// adds them to process.env
require("dotenv").config();

var handler = require("./dist").default; // the generated module
var bst = require('bespoken-tools');

// Export the handler for the lambda, wrapping the call in Logless to
// capture all the requests and responses
console.log('key:'+process.env.BST_SECRET_KEY);

exports.handler = bst.Logless.capture(process.env.BST_SECRET_KEY, handler);