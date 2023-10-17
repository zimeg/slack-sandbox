const { openCustomModalFunc } = require('./open-custom-modal');

module.exports.register = (app) => {
  app.function(openCustomModalFunc);
};
