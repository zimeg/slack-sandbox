const functions = require('./functions');

module.exports.registerListeners = (app) => {
  functions.register(app);
};
