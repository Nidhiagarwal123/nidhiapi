
exports.notFound = function notFound(req, res, next){
  res.status(404).send({ error: 'Not Found' });
};

exports.error = function error(err, req, res, next){
   console.log(err);
   res.status(500).send({ error: 'Oops Something went wrong....' });
};

exports.unAuthorised = function unAuthorised(req, res, next){
	console.log("res");
  res.status(401).send({ error: 'Sorry you dont have access persmission' });
};

exports.inValid = function inValid(req, res, next){
	console.log("res");
  res.status(403).send({ error: 'Invalid user' });
};

