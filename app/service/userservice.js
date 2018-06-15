var uuid = require('node-uuid'),
    crypto = require('crypto'),
    jwt    = require('jsonwebtoken'),
    thinky = require(__dirname+'/../util/thinky.js'),
    r = thinky.r,
    env = require(__dirname+'/../../env'),
    config = require(__dirname+'/../../config/'+ env.name),
    redis = require('redis'),
    redis_cli = redis.createClient(config.redis),
    User = require(__dirname+'/../model/user.js'),
    
    parser = require('ua-parser-js'),
    og = require(__dirname+'/../util/og.js'),
    otp = require('otplib/lib/authenticator');

//var client = redis.createClient(port, host);

// list users
// TODO: all filter, page size and offset, columns, sort
exports.listUsers = function (req, res) {
    var tokenObject = JSON.parse(req.decoded);
    var orgId = tokenObject.orgId;

    var count;
    var pno=1,offset=0,limit=10;
    if(req.query.psize != undefined && req.query.psize != null && !isNaN(req.query.psize)){
        limit = parseInt(req.query.psize);
    }

    if(req.query.pno != undefined && req.query.pno != null && !isNaN(req.query.pno)){
       pno =  parseInt(req.query.pno);
    }

    offset = (pno -1) * limit;

    var filter={
        portfolioId :tokenObject.portfolioId,
        status:'active',
    }

    if(req.query.userType && req.query.userType!=null) {
        filter.userType=req.query.userType;
    }
    User.orderBy({index: r.desc('createdOn')}).filter(filter).getJoin({portfolio: true}).skip(offset).limit(limit).run().then(function(users) {
       r.table("user").filter(filter).count().run().then(function(total) {
        res.json({
            data: users,
            total: (total!=undefined?total:0),
            pno: pno,
            psize: limit
        });
    });    
    }).error(handleError(res)); 
    handleError(res);
};

exports.login = function(req, res) {
    var mobile = req.body.mobile, password=req.body.password, apiKey=req.body.apiKey;
    if(mobile ==undefined || mobile ==null || password == undefined || password == null
        || apiKey == undefined || apiKey == null){
        return res.status(500).send({error: 'Invalid request: mobile, password or api key is not set'});
    }

    User.filter({"mobile": mobile, "password": crypto.createHash('md5').update(password).digest("hex")}).run().then(function(users) {
        console.log("user--"+users.length);
        if(users && users.length > 0){
            var user = users[0];
            if(user.status=='active'){
                var token = uuid.v4();
                og.saveToken(token,JSON.stringify(user));
                res.json({success: true,id: user.id,token: token,mobile: mobile,email: user.email,name: user.name});
            }else if(user.status=='approval pending'){
                res.json({ success: false,user: user,message: 'Your account verification pending'});
            }else if(user.status=='suspended'){
                res.json({ success: false, message: 'Your have payment due.Please make payment for uninterrepted Service'});
            }
        }else{
            res.json({ success: false, message: 'Authentication failed. Invalid mobile number or password' });
        }
    }).error(function(res){
        res.json({ success: false, message: 'Authentication failed. Invalid mobile number or password.' });
    });
};

exports.logout = function(req,res){
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    if(token){
        if(og.deleteToken(token)){
            res.json({ success: true, message: 'Logout successful' });
        }else{
            return res.status(500).send({error: 'Couldn\'t logout please again'});
        }
    }else{
        return res.status(500).send({error: 'Couldn\'t logout please again'});
    }
};

// get by id
// exports.getUser = function (req, res) {
//     var id = req.params.id;
//     var user = JSON.parse(req.decoded);
//     if(user.roles.indexOf('admin')>-1 || user.createdBy === id){
//         User.get(id).getJoin({org: true}).run().then(function(usr) {
//              res.json({
//             result: usr
//             })
//         }).error(handleError(res));
//     }else{
//      res.status(401).send({ error: 'Do not have permission' });
//     }
// };

// // delete by id
// exports.deleteUser = function (req, res) {
//     var id = req.params.id;
//     User.get(id).delete().execute().then(function() {
//         res.json({
//             status: "success"
//         });
//     }).error(handleError(res));
// };

// // Add user
// exports.addUser = function (req, res) {
//     var newUser = new User(req.body);
//     var user = JSON.parse(req.decoded);
//     //generate a token with email id
//     if(newUser.email != undefined && newUser.email != null){
//         var verificationToken = jwt.sign({email: newUser.email}, config.secret,{expiresIn:"7d"});
//         //set the apiKey with token value
//         newUser.verificationToken = verificationToken;
//     }
//     console.log("password===="+newUser.password);
//     var passwd = newUser.password;
//     newUser.password = crypto.createHash('md5').update(newUser.password).digest("hex");
//     newUser.createdBy =user.userId;
//     newUser.updatedBy =user.userId;
//     newUser.updatedOn =r.now();
//     newUser.createdOn =r.now();
//     newUser.portfolioId = user.portfolioId;
//     newUser.orgId = user.orgId;
//     newUser.save().then(function(result) {
//         if(result.blogUserType && result.blogUserType !=null){
//             if(result.blogUserType === 'Author'){
//                var per = {'/api/blogs/':["GET"],'/api/blog/':["GET","PUT","POST","DELETE"],'/api/blog-categories/':["GET"],'/api/blog-category/':["GET"]}

//             }else if(result.blogUserType === 'Editor'){
//                 var per = {'/api/blogs/':["GET"],'/api/blog/':["GET","PUT","POST","DELETE"],'/api/blog-categories/':["GET"],'/api/blog-category/':["GET"]}

//             }else if(result.blogUserType === 'admin'){
//                 var per = {'/api/blogs/':["GET"],'/api/blog/':["GET","PUT","POST","DELETE"],'/api/blog-categories/':["GET"],'/api/users/':["GET"],'/api/user/':["GET","PUT","POST","DELETE"]}
//             }
//             r.table("userProfile").insert([
//             {apiKey:user.apiKey,orgId: result.orgId,portfolioId:result.portfolioId,createdBy :result.createdBy,updatedBy :result.updatedBy,createdOn:r.now(),userId:result.id,mobile: result.mobile,permissions:per,roles:["blog",result.blogUserType]
//            }
//             ]).run()
//         }else{
//             r.table("userProfile").insert([
//             {apiKey:user.apiKey,orgId: result.orgId,portfolioId:result.portfolioId,createdBy :result.createdBy,updatedBy :result.updatedBy,createdOn:r.now(),userId:result.id,mobile: result.mobile,permissions:{'/api/employees/':["GET"],'/api/employee/':["GET","PUT","POST","DELETE"],'/api/designations/':["GET"],'/api/departments/':["GET"]},roles:["blog",result.userType]
//            }
//            ]).run()
//         }
//         Portfolio.get(result.portfolioId).run().then(function(port){
//             if(port.enableEmail === true){
//                 emailConfig.filter({portfolioId:result.portfolioId}).run().then(function(eConfig){
//                     var portfolioEmailId,portfolioSenderName;
//                     if(eConfig && eConfig.length>0){
//                         var mailConf = eConfig[0];
//                         portfolioEmailId= mailConf.gmail.auth.user;
//                         portfolioSenderName= mailConf.gmail.auth.name;
//                         var sender =mailConf.gmail;
//                     }else{
//                         var sender =config.smtp.gmail;
//                     }
//                     console.log("sender-----"+JSON.stringify(sender));
                    
//                     if(newUser.email != undefined && newUser.email != null){
//                         emailService.sendEmail(sender,{
//                             portfolioId: user.portfolioId,
//                             createdBy: user.userId,
//                             updatedBy: user.userId,
//                             from: '"Zinetgo Support" <support@zinetgo.com>', // sender address
//                             to: newUser.email, // list of receivers
//                             subject: 'Zinetgo registeration successful', // Subject line
//                             text: 'Dear '+newUser.name +'! Your Zinetgo account is successfully created. Please confirm your email by <a href="">clicking this link</a>.  \nYour login credentials are \n\n Mobile: '+ newUser.mobile + '\nPassword: '+ passwd + '\n\nBest,\nTeam Zinetgo', // plaintext body
//                             html: '<b>Dear '+newUser.name +'</b>!<br><br>Your Zinetgo account is successfully created. Please confirm your email by <a href="'+ config.url+ '/verify/' + verificationToken+'">clicking this link</a>. <br>Your login credentials are <br> Mobile: '+ newUser.mobile + '<br>Password: '+ passwd + '<br><br>Best,<br>Team Zinetgo' // html body
//                         });
//                     }
//                 });
//             }
//             if(port.enableSms === true){
//                 smsService.sendSms(req, newUser.mobile,'Dear' +result.name+'!'+' '+ 'You have been registered with Zinetgo. Your login credentials are \n\n Mobile: '+ newUser.mobile + '\nPassword: '+ passwd + '\n\nBest,\nTeam Zinetgo');
//             }
//         });
//         res.json({
//             result: result
//         });
//     }).error(handleError(res));
// };

// exports.uploadAvtar = function (req, res) {

//     mediaService.addMedia(req,res);
// }

// // update user
// exports.updateUser = function (req, res) {
//     var usr = new User(req.body);
//     var user = JSON.parse(req.decoded);
//     usr.updatedBy =user.userId;
//     usr.updatedOn =r.now();
//     User.get(usr.id).update(usr).then(function(result) {
//         res.json({
//             result: result
//         });
//     }).error(handleError(res));
// };

// exports.signUp = function (req, res) {
//     var mobile = req.body.mobile, password=req.body.password, name=req.body.name, apiKey=req.body.apiKey;
//     if(mobile ==undefined || mobile ==null || password == undefined || password == null
//     || name ==undefined || name ==null || apiKey == undefined || apiKey == null){
//     return res.status(500).send({error: 'Invalid request: mobile,name, password or api key is not set'});
//     }
//     var data, newUser;
//     if(req.query.data){
//         //do nothing
//         data = JSON.parse(req.query.data);
//         newUser =  new User(data);
//     }else{
//        var data = {};
//        data.mobile = mobile;
//        data.name = name;
//        data.email = req.body.email;
//        data.password = password;
//        newUser =  new User(data);
//     }
//     console.log(newUser.password);
//     console.log(req.body.confirm_password);

//     if(newUser == undefined || apiKey == null){
//         return res.send(500, {error: 'Not data passed to API'});
//     }else{
//         if(newUser.mobile == undefined || newUser.mobile == null || newUser.mobile == ""){
//             return res.send(500, {error: 'Missing required field mobile'});
//         }
//         if(newUser.name == undefined || newUser.name == null || newUser.name == ""){
//             return res.send(500, {error: 'Missing required field name'});
//         }
//         if(newUser.password == undefined || newUser.password == null || newUser.password == ""){
//             return res.send(500, {error: 'Missing required field password'});
//         }
//         if(newUser.password !== req.body.confirm_password){
//             return res.send(500, {error: 'password and confirmation does not matched'});
//         }   
//         //validate(newUser);
//         // TODO: check for the following mandatory fields
//         // Mobile, Name, Service
//         //return res.send(500, {error: 'Not data passed to API'});

//         Portfolio.filter({apiKey:apiKey}).run().then(function(result){
//            if(result && result.length >0){
//                 var portfolio = result[0];

//                 newUser.portfolioId = portfolio.id;

//                 var mob = parseInt(newUser.mobile);

//                 UserProfile.filter({portfolioId:portfolio.id,mobile:mob}).run().then(function(user) {
//                   if(user && user.length > 0){
//                     //exists
//                     return res.send(500, {error: 'Mobile no already exists'});
//                   }else{
//                         //not exist create new
//                         newUser.password = crypto.createHash('md5').update(newUser.password).digest("hex");
//                         var passwd = newUser.password;
//                         Customer.filter({portfolioId: portfolio.id,mobile: mob}).run().then(function(cus){
//                             if(!cus || cus.length<1){
//                                 newUser.save().then(function(usr) {
//                                     var newShoppingCart = new ShoppingCart({
//                                         orgId: result[0].orgId,
//                                         userId: usr.id,
//                                         portfolioId: result[0].id,
//                                         createdBy: usr.id,
//                                         updatedBy :usr.id
//                                     });

//                                     newShoppingCart.save().then(function(cart){
                                    
//                                         var newUserProfile = new UserProfile({
//                                             mobile: mobile,
//                                             orgId: result[0].orgId,
//                                             userId: usr.id,
//                                             portfolioId: result[0].id,
//                                             apiKey: apiKey,
//                                             createdBy: usr.id,
//                                             updatedBy :usr.id,
//                                             roles: ["user"],
//                                             cartId: cart.id,
//                                             wallet:0,
//                                              permissions: { "/api/change-password/": ["POST"] ,"/api/order/": ["GET","PUT","POST","DELETE"] ,"/api/orders/": ["GET"] ,"/api/user/": ["GET","PUT","POST","DELETE"] ,"/api/users/": ["GET"] ,"/api/wishlist/": ["GET","PUT","POST" ,"DELETE"] ,"/api/wishlists/": ["GET"] ,"/api/userProfile/": ["GET","PUT"],"/api/wallet/":["GET"]}
//                                         });
//                                         newUserProfile.save().then(function(userProfile){
//                                             r.table("customer").insert([
//                                             {id:usr.id,name: usr.name,mobile:mobile,email:usr.email,orgId: userProfile.orgId,portfolioId: userProfile.portfolioId,createdBy :usr.id,updatedBy :usr.id,createdOn:r.now(),status:"active"}
//                                             ]).run()

//                                             // get the sms api key
//                                            // get the sender id
//                                             var portfolioSmsId = portfolio.smsProvider.senderId;
//                                             if(portfolioSmsId == undefined || portfolioSmsId == null || portfolioSmsId === ""){
//                                                portfolioSmsId = config.sms.msg91.senderId;
//                                             }

//                                             console.log('portfolio.portfolioSmsId: '+ portfolioSmsId);

//                                             var authKey = portfolio.smsProvider.authKey;
//                                             if(authKey == undefined || authKey == null || authKey === ""){
//                                                authKey = config.sms.msg91.authKey;
//                                             }
//                                             console.log('portfolio.authKey: '+ authKey);

//                                             if(portfolio.mobile != undefined && portfolio.mobile != null){
//                                              //smsService.sendSms(req, config.sms.msg91.authKey,config.sms.msg91.senderId, portfolio.mobile,'You have received a new user request' + 'from '+newUser.name + ' ' + newUser.mobile +'.\n\nBest,\n'+ portfolio.name);
//                                              smsService.sendSms(req, authKey, portfolioSmsId, newUser.mobile,'You have been successfully registered with  '+' ' +portfolio.name +' \n\nBest,\n'+ portfolio.name);
//                                             }

//                                             var portfolioEmailId,portfolioSenderName;

//                                             if(portfolio.emailProvider){
//                                               portfolioEmailId= portfolio.emailProvider.auth.user;
//                                               portfolioSenderName= portfolio.emailProvider.auth.name;
//                                             }
//                                             if(!portfolioEmailId){
//                                               portfolioEmailId = portfolio.email;
//                                             }
//                                             if(!portfolioSenderName){
//                                               portfolioSenderName = portfolio.name;
//                                             }

//                                             console.log('portfolio.emailProvider: '+ portfolio.emailProvider);

//                                             if(newUser.email != undefined && newUser.email != null){
//                                               emailService.sendEmail(portfolio.emailProvider, {
//                                                     from: '"'+portfolioSenderName +'" <'+portfolioEmailId+'>', // sender address
//                                                     to: newUser.email, // list of receivers
//                                                     subject: 'You have been registered with'+portfolio.name+' in mobile number is :' + newUser.mobile, // Subject line
//                                                     text: 'Dear '+newUser.name +'! You have been registered with '+portfolio.name+' in Mobile number is :' + newUser.mobile+'.\n\nBest,\n'+portfolio.name, // plain text
//                                                     html: '<b>Dear '+newUser.name +'</b>!<br><br>! You have been registered with '+portfolio.name+' '+'in Mobile number is :' + newUser.mobile+'.<br><br>Best,<br>'+portfolio.name
//                                                 });
//                                             }
//                                         }).error(function(error) {
//                                         console.log(error.message);
//                                         return res.status(500).send({error: error.message});
//                                        });        
//                                     });
//                                     res.json({success: true,'message':'! You have been registered with '+' '+portfolio.name+' ' +'in Mobile number is :' + newUser.mobile});
//                                }).error(handleError(res));
//                             }else{
//                                 var cust = cus[0];
//                                 var newShoppingCart = new ShoppingCart({
//                                     orgId: result[0].orgId,
//                                     userId: cust.id,
//                                     portfolioId: result[0].id,
//                                     createdBy: cust.id,
//                                     updatedBy :cust.id
//                                 });
//                                 newShoppingCart.save().then(function(cart){
//                                     var newUserProfile = new UserProfile({
//                                         mobile: mobile,
//                                         orgId: result[0].orgId,
//                                         userId: cust.id,
//                                         portfolioId: result[0].id,
//                                         apiKey: apiKey,
//                                         createdBy: cust.id,
//                                         updatedBy :cust.id,
//                                         roles: ["user"],
//                                         cartId: cart.id,
//                                         mobile: mobile,
//                                         wallet:0,
//                                         permissions: { "/api/change-password/": ["POST"] ,"/api/order/": ["GET","PUT","POST","DELETE"] ,"/api/orders/": ["GET"] ,"/api/user/": ["GET","PUT","POST","DELETE"] ,"/api/users/": ["GET"] ,"/api/wishlist/": ["GET","PUT","POST" ,"DELETE"] ,"/api/wishlists/": ["GET"] ,"/api/userProfile/": ["GET","PUT"],"/api/wallet/":["GET"]}
//                                     });
//                                     newUserProfile.save().then(function(userProfile){
//                                         r.table("user").insert([
//                                         {id:cust.id,name: cust.name,mobile:mobile,email:cust.email,password:passwd, orgId: userProfile.orgId,portfolioId: userProfile.portfolioId,createdBy :cust.id,updatedBy :cust.id,createdOn:r.now(),status:"active"}
//                                         ]).run()

//                                         var portfolioSmsId = portfolio.smsProvider.senderId;
//                                         if(portfolioSmsId == undefined || portfolioSmsId == null || portfolioSmsId === ""){
//                                            portfolioSmsId = config.sms.msg91.senderId;
//                                         }

//                                         console.log('portfolio.portfolioSmsId: '+ portfolioSmsId);

//                                         var authKey = portfolio.smsProvider.authKey;
//                                         if(authKey == undefined || authKey == null || authKey === ""){
//                                            authKey = config.sms.msg91.authKey;
//                                         }
//                                         console.log('portfolio.authKey: '+ authKey);

//                                         if(portfolio.mobile != undefined && portfolio.mobile != null){
//                                          smsService.sendSms(req, config.sms.msg91.authKey,config.sms.msg91.senderId, portfolio.mobile,'You have received a new user request' + 'from '+cust.name + ' ' + cust.mobile +'.\n\nBest,\n'+ portfolio.name);
//                                          smsService.sendSms(req, authKey, portfolioSmsId, cust.mobile,'You have been successfully registered with  '+' ' +portfolio.name +' \n\nBest,\n'+ portfolio.name);
//                                         }
//                                         if(portfolio.email != undefined && portfolio.email != null){
//                                             emailService.sendEmail(config.smtp.gmail, {
//                                                 portfolioId: portfolio.id,
//                                                 from: '"Hurreh Support" <support@hurreh.com>', // sender address
//                                                 to: portfolio.email, // list of receivers
//                                                 subject: 'You have been registered with '+ portfolio.name, // Subject line
//                                                 text: 'Dear '+portfolio.name +'! You have received a new user request from ' +cust.name + ' ' +cust.mobile + '.\n\nBest,\n'+ portfolio.name, // plain text
//                                                 html: '<b>Dear '+portfolio.name +'</b>!<br><br>You have received a new user request from ' +cust.name +' '+cust.mobile +'.\n\nBest,\n'+ portfolio.name // html body
//                                             });
//                                         }

//                                         var portfolioEmailId,portfolioSenderName;

//                                         if(portfolio.emailProvider){
//                                           portfolioEmailId= portfolio.emailProvider.auth.user;
//                                           portfolioSenderName= portfolio.emailProvider.auth.name;
//                                         }
//                                         if(!portfolioEmailId){
//                                           portfolioEmailId = portfolio.email;
//                                         }
//                                         if(!portfolioSenderName){
//                                           portfolioSenderName = portfolio.name;
//                                         }

//                                         console.log('portfolio.emailProvider: '+ portfolio.emailProvider);

//                                         if(cust.email != undefined && cust.email != null){
//                                           emailService.sendEmail(portfolio.emailProvider, {
//                                                 from: '"'+portfolioSenderName +'" <'+portfolioEmailId+'>', // sender address
//                                                 to: cust.email, // list of receivers
//                                                 subject: 'You have been registered with'+portfolio.name+' in mobile number is :' + cust.mobile, // Subject line
//                                                 text: 'Dear '+cust.name +'! You have been registered with '+portfolio.name+' in Mobile number is :' + cust.mobile+'.\n\nBest,\n'+portfolio.name, // plain text
//                                                 html: '<b>Dear '+cust.name +'</b>!<br><br>! You have been registered with '+portfolio.name+' '+'in Mobile number is :' + cust.mobile+'.<br><br>Best,<br>'+portfolio.name
//                                             });
//                                         }
//                                     }).error(function(error) {
//                                     console.log(error.message);
//                                     return res.status(500).send({error: error.message});
//                                    });
//                                 }).error(handleError(res));   
//                                 res.json({success: true,'message':'! You have been registered with '+' '+portfolio.name+' ' +'in Mobile number is :' + cust.mobile});
//                             }
//                         });
//                     }
//                }).error(handleError(res));
//             }else{
//                 return res.send(500, {error: 'Invalid user'});
//             }
//        }).error(function(error){
//       });
//     }
// };

// exports.forgot= function(req, res) {
//   var mobile = req.body.mobile,apiKey=req.body.apiKey ;
//   if(mobile ==undefined || mobile ==null || apiKey == undefined || apiKey == null ){
//     return res.status(500).send({error: 'Invalid request: mobile or api key is not set'});
//   }
  
//   Portfolio.filter({apiKey:req.body.apiKey}).run().then(function(result){
//         if(result && result.length >0){
//           var portfolio = result[0];
//           User.filter({ mobile: mobile,portfolioId:portfolio.id}).run().then(function(user) {
//                 console.log("user length"+user.length);
//                 if(!user || user.length < 1){
//                   return res.send(500, {error: 'No account with this mobile number exists.'});
//                 }else{
//                     UserProfile.filter({ mobile: mobile, portfolioId: portfolio.id}).run().then(function(userProf){
//                         if(!userProf || userProf.length < 1){
//                             return res.send(500, {error: "User doesn't exists."});
//                         }else{
//                             var secret = otp.generateSecret();
//                             var code = otp.generate(secret);
//                             var time = Date.now() + 1200000; // 20 min
//                             console.log('user=='+user.length);
//                             console.log('user--'+JSON.stringify(user[0]));
//                             var value = {'expTime': time,
//                                 'userId':user[0].id,
//                                 'mobile':user[0].mobile,
//                                 'email': user[0].email,
//                                 'name': user[0].name
//                             };
//                             console.log('token value'+JSON.stringify(value));
//                             og.saveToken(code,JSON.stringify(value));
//                             var email =user[0].email;
//                             var portfolioSmsId = portfolio.smsProvider.senderId;
//                             if(portfolioSmsId == undefined || portfolioSmsId == null || portfolioSmsId === ""){
//                             portfolioSmsId = config.sms.msg91.senderId;
//                             }
//                             console.log('portfolio.portfolioSmsId: '+ portfolioSmsId);
//                             var authKey = portfolio.smsProvider.authKey;
//                             if(authKey == undefined || authKey == null || authKey === ""){
//                                 authKey = config.sms.msg91.authKey;
//                             }
//                             console.log('portfolio.authKey: '+ authKey);

//                             if(portfolio.mobile != undefined && portfolio.mobile != null){
//                                 smsService.sendSms(req, authKey, portfolioSmsId, mobile,'Reset password request otp is  '+' ' +code);
//                             }
//                             res.json({
//                             status: 'success'
//                             });
//                         }
//                     }).error(handleError(res));     
//                 }
//             }).error(handleError(res));      
//         }else{
//             return res.send(500, {error: 'Invalid API KEY'});
//         }
//   }).error(function(error){

//   });
        
// };

// exports.reset =function(req,res){
//     var apiKey=req.body.apiKey ;
//     if(apiKey == undefined || apiKey == null){
//         return res.status(500).send({error: 'Invalid request: api key is not set'});
//     }
//     var otp = req.body.otp;
//     if (otp) {
//         redis_cli.get(otp, function(err, reply) {
//             if (reply && reply != null) {
//                 console.log('exists -- '+ reply);
//                 otpValue = JSON.parse(reply);
//                 console.log(reply);
//                 var now = Date.parse(new Date());
//                 console.log('now---'+now);
//                 console.log('expTime--'+otpValue.expTime);
//                 var mobile = otpValue.mobile;
//                 if(otpValue.expTime >= now){
//                     console.log("password--"+req.body.newPassword);
//                     var newPassword = crypto.createHash('md5').update(req.body.newPassword).digest("hex");
//                     User.get(otpValue.userId).update({password: newPassword}).then(function(userPwd){
//                         og.deleteToken(otp);
//                         Portfolio.filter({apiKey:req.body.apiKey}).run().then(function(result){
//                             if(result && result.length >0){
//                                 var portfolio = result[0];
//                                 var portfolioSmsId = portfolio.smsProvider.senderId;
//                               if(portfolioSmsId == undefined || portfolioSmsId == null || portfolioSmsId === ""){
//                                portfolioSmsId = config.sms.msg91.senderId;
//                               }
//                               console.log('portfolio.portfolioSmsId: '+ portfolioSmsId);
//                               var authKey = portfolio.smsProvider.authKey;
//                               if(authKey == undefined || authKey == null || authKey === ""){
//                                 authKey = config.sms.msg91.authKey;
//                               }
//                               console.log('portfolio.authKey: '+ authKey);

//                               if(portfolio.mobile != undefined && portfolio.mobile != null){
//                                 //smsService.sendSms(req, config.sms.msg91.authKey,config.sms.msg91.senderId, portfolio.mobile,'! Password of  ' +mobile+ ' ' +' email'+ email + ' '+'has been changed'+'. \n\nBest,\nHurreh.com');
//                                 smsService.sendSms(req, authKey, portfolioSmsId, mobile,'This is a confirmation that the password for your account ' + mobile + ' has just been changed.\n'+' \n\nBest,\n'+ portfolio.name);
//                               }


//                                var portfolioEmailId,portfolioSenderName;

//                                 if(portfolio.emailProvider){
//                                     portfolioEmailId= portfolio.emailProvider.auth.user;
//                                     portfolioSenderName= portfolio.emailProvider.auth.name;
//                                     var emailProvider = portfolio.emailProvider;
//                                 }else{
//                                     var emailProvider = config.smtp.gmail;
//                                 }
//                                 if(!portfolioEmailId){
//                                     portfolioEmailId = portfolio.email;
//                                 }
//                                 if(!portfolioSenderName){
//                                     portfolioSenderName = portfolio.name;
//                                 }

//                                 console.log('portfolio. : '+ portfolio.emailProvider);

                                
//                                 emailService.sendEmail(emailProvider, {
//                                     from: '"'+portfolioSenderName +'" <'+portfolioEmailId+'>', // sender address
//                                     to: otpValue.email, // list of receivers
//                                     subject: 'Your password has been successfully changed', // Subject line
//                                     text: 'Dear '+otpValue.name +'! Your password has been successfully changed'+'.\n\nBest,\n'+portfolio.name, // plain text
//                                     html: '<b>Dear '+otpValue.name +'</b>!<br><br>! Your password has been successfully changed.\n'+'.<br><br>Best,<br>'+portfolio.name
//                                 });
//                             }
//                         }).error(handleError(res));
//                     }).error(handleError(res));
//                     res.json({ success: true, message: 'Password changed successful' });
//                 }else{
//                     og.deleteToken(otp);
//                     return res.send(401, {error: 'time out'});
//                 }    
//             } else {
//                 console.log('doesn\'t exist');
//                 return res.send(401, {error: 'Otp does not exists'});
//             }
//         });
//     }else{
//         return res.send(401, {error: 'Otp not found'});
//     }
// };

// exports.changePassword = function(req,res){
//     var tokenObject = JSON.parse(req.decoded);
//     console.log("password change---"+JSON.stringify(req.body));
//     User.filter({id:tokenObject.userId}).run().then(function(usr){
//         var password =usr[0].password;
//         var oldPassword = crypto.createHash('md5').update(req.body.oldPassword).digest("hex");
//         var newPassword = crypto.createHash('md5').update(req.body.newPassword).digest("hex");
//         if(oldPassword === password){
//             User.get(usr[0].id).update({password:newPassword}).then(function(result){
//                 Portfolio.filter({apiKey:tokenObject.apiKey}).run().then(function(port){
//                     if(port && port.length >0){
//                         var portfolio = port[0];
//                         var portfolioSmsId = portfolio.smsProvider.senderId;
//                       if(portfolioSmsId == undefined || portfolioSmsId == null || portfolioSmsId === ""){
//                        portfolioSmsId = config.sms.msg91.senderId;
//                       }
//                       console.log('portfolio.portfolioSmsId: '+ portfolioSmsId);
//                       var authKey = portfolio.smsProvider.authKey;
//                       if(authKey == undefined || authKey == null || authKey === ""){
//                         authKey = config.sms.msg91.authKey;
//                       }
//                       var portfolioEmailId,portfolioSenderName;

//                         if(portfolio.emailProvider){
//                           portfolioEmailId= portfolio.emailProvider.auth.user;
//                           portfolioSenderName= portfolio.emailProvider.auth.name;
//                         }
//                         if(!portfolioEmailId){
//                           portfolioEmailId = portfolio.email;
//                         }
//                         if(!portfolioSenderName){
//                           portfolioSenderName = portfolio.name;
//                         }
//                       console.log('portfolio.authKey: '+ authKey);

//                         //smsService.sendSms(req, config.sms.msg91.authKey,config.sms.msg91.senderId, portfolio.mobile,'! Password of  ' +mobile+ ' ' +' email'+ email + ' '+'has been changed'+'. \n\nBest,\nHurreh.com');
//                         smsService.sendSms(req, authKey, portfolioSmsId, usr[0].mobile,'This is a confirmation that the password for your account has just been changed successfully.\n'+' \n\nBest,\n'+ portfolio.name);
                      
//                      emailService.sendEmail(config.smtp.gmail, {
//                             portfolioId: portfolio.id,
//                             from: '"'+portfolioSenderName +'" <'+portfolioEmailId+'>', // sender address
//                             to: usr[0].email, // list of receivers
//                             subject: 'Password changed ', // Subject line
//                             text: 'Dear '+usr[0].name +'! Your password has been successfully changed'+'. \n\nBest,'+'\n\n'+portfolio.name, // plain text
//                             html: '<b>Dear '+usr[0].name +'</b>!<br><br>Your password has been successfully changed.'+'<br><br>Best,<br>'+portfolio.name // html body
//                        });
//                     }
//                 });
//             });
//             res.json({ success: true, message: 'Password successfully changed' });
//         }else{
//             res.status(500).send({error: 'password did not matched'});
//         }
//     });
// };


// exports.verifyEmail = function(req, res){
//     var token = req.params.token;
//     if (token!=undefined && token != null) {
//         // 1. decode the token for basic validity
//         jwt.verify(token, config.secret, function(err, decoded) {
//           if (err || decoded.email == undefined || decoded.email == null) {
//             return res.json({ success: false, message: err|| "Invalid token" });
//           } else {
//             // 2. get the user with the verification token
//             User.filter({verificationToken:token}).run().then(function(result) {
//                 if(result.length > 0){
//                     var user = result[0];
//                     // 3. validate the email in token and in user table
//                     if(user.email == decoded.email){
//                         // valid token and update user
//                         User.get(user.id).update({emailValidate:true,verificationToken:null}).execute();
//                         res.json({
//                              message: 'Email verified successfully'
//                          });
//                     }
//                 }
//             });
//           }
//         });
//     } else{
//         return res.status(403).send({
//             success: false,
//             message: 'Invalid url or token'
//         });
//     }
// };

function handleError(res) {
    return function(error) {
        console.log(error.message);
        return res.status(500).send({error: error.message});
    }
}
