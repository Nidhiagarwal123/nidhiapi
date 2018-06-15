var thinky = require(__dirname+'/../util/thinky.js'),
    r = thinky.r,
   geoip = require('geoip-lite'),
   ipify = require('ipify');
   var publicIp = require('public-ip');
    
    exports.log=function logger(req,res,next){
        publicIp.v4().then(ip => {
            console.log(ip);
            var geo = geoip.lookup(ip);
            console.log(geo);
            console.log("accessed by---"+ new Date(), req.method, req.url);
            console.log('User-Agent: ' + req.headers['user-agent']);
            //var tokenObject = JSON.parse(req.decoded);
            r.table("feed").insert([
            {ip: ip,loc: geo,method: req.method,userAgent:req.headers['user-agent'],url: req.url,createdOn:r.now(),aDate: new Date()}
            ]).run()
        });
        
      next()
    };

    /*orgId: req.decoded.orgId,portfolioId: req.decoded.portfolioId,
    createdBy :req.decoded.userId,updatedBy :req.decoded.userId,*/

