// file: util/thinky.js
var env = require(__dirname+'/../../env'),
	config = require(__dirname+'/../../config/'+ env.name),
	redis = require('redis'),
	//var timespan = require(__dirname+'/../../node_modules/jsonwebtoken/lib/timespan');
	redis_cli = redis.createClient(config.redis); //creates a new client

exports.getIdPath = function(id){
	return id.split('-').join('/');
};

exports.getMediaAcceesPath = function(id){
	return config.media.upload.local.accessPath + '/' + this.getIdPath(id);
};

exports.getMediaPath = function(mediaId){
	return config.media.upload.local.path + '/' + this.getIdPath(mediaId);
};

exports.saveToken = function(token,value){
	console.log('----> token: '+ token);
	console.log('----> token value: '+ value);
	return redis_cli.set(token,value);
};

exports.deleteToken = function(token){
	console.log('---->delete token: '+ token);
	if(redis_cli.exists(token)){
		console.log('---->delete token tue');
		return redis_cli.del(token);
	}else{
		return false;
	}
};

exports.saveOtp = function(otp,value){
	console.log('----> otp: '+ otp);
	console.log('----> otp value: '+ otp);
	return redis_cli.set(otp,value);
};

exports.deleteOtp = function(otp){
	if(redis_cli.exists(otp)){
		return redis_cli.del(otp);
	}else{
		return false;
	}
};