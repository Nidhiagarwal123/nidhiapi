var thinky = require(__dirname+'/../util/thinky.js'),
r = thinky.r;


exports.access=function controller(req,res,next){
    console.log("url -------"+req.url);
    var ur =req.url;
    if(req.apikey){
        console.log("extrenal call");
        next();
    }else if(ur.includes("/api/logout") || ur.includes("/api/dashboard/") ||
      ur.includes("/login") || ur.includes("/register")|| ur.includes("/signUp") ||  ur.includes("/api/pay")){
        console.log("register/login/logout/dashboard/signUp called");
        next();
    }else{
        if( ur.indexOf("/", 5)>-1){
          var iNo=ur.indexOf("/", 5);
          var reqUrl = ur.substring(0, iNo+1);
        }else{
            var iNo=ur.indexOf("?", 5);
            var reqUr = ur.substring(0, iNo);
            var reqUrl=reqUr+'/';
        }
        console.log("new url----------- "+reqUrl);
        console.log("have token")
        if(reqUrl === '/lead/' || reqUrl ==='/api/applyCoupon/' || reqUrl ==='/' || reqUrl === '/subscribe/'|| reqUrl === '/contactUs/'){
            next();
        }else{
            console.log('else start');
            var tokenObject = JSON.parse(req.decoded);
            var permission =tokenObject.permissions;
            var meth = req.method;
             var propVal = permission[reqUrl];
             var reqMethod = req.method;
            if(permission.hasOwnProperty(reqUrl)){
                console.log("granted own property");
                if(propVal.indexOf(reqMethod)>-1){
                    console.log(" method granted");
                    next();
                }else{
                    console.log(" method not granted");
                   res.status(401).send({ error: 'Do not have permission' });
                }
            }else{
                console.log("Url not granted");
                res.status(401).send({ error: 'Do not have permission' });
            }
        }
        console.log('else end');    
    }
};
