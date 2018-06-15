// file: util/thinky.js
var env 		= require(__dirname+'/../../env'),
	config 		= require(__dirname+'/../../config/'+ env.name),
	thinky = require('thinky')(config.database);
module.exports = thinky;