var thinky = require(__dirname+'/../util/thinky.js'),
    r = thinky.r,
    uuid = require('node-uuid'),
    Portfolio = require(__dirname+'/../model/portfolio.js'),
    Media = require(__dirname+'/../model/media.js'),
    MediaService = require(__dirname+'/mediaservice.js'),
    og = require(__dirname+'/../util/og.js'),
    env = require(__dirname+'/../../env'),
    config = require(__dirname+'/../../config/'+ env.name);

// list portfolios
// TODO: all filter, page size and offset, columns, sort
/*exports.listPortfolios = function (req, res) {
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
        userId :tokenObject.userId,
        status:'active'
    }

    if(req.decoded !=undefined && req.decoded !=null){
        var tokenObject = JSON.parse(req.decoded);
        filter.portfolioId =tokenObject.portfolioId;
        Portfolio.orderBy({index: r.desc('createdOn')}).filter(filter).getJoin({user: true}).skip(offset).limit(limit).run().then(function(users) {
           r.table("portfolio").filter(filter).count().run().then(function(total) {
            res.json({
                data: users,
                total: (total!=undefined?total:0),
                pno: pno,
                psize: limit
            });
        });    
        }).error(handleError(res)); 
        handleError(res);

    }else{
        var apiKey = req.apikey ;
        Portfolio.filter({apiKey: apiKey}).run().then(function(portfolio){
        else{
                res.status(404).send({ error: 'Not Found' });
            }
        });    
    }
    
};*/
// get by id
exports.getPortfolio = function (req, res) {
    if(req.decoded !=undefined && req.decoded !=null){
        var tokenObject = JSON.parse(req.decoded);
        Portfolio.filter({createdBy:tokenObject.userId}).run().then(function(portfolio) {
         res.json({
             portfolio: portfolio[0]
         });
        }).error(handleError(res));
    }else if(req.apikey){
        Portfolio.filter({apiKey:req.apikey}).run().then(function(portfolio) {
         res.json({
             portfolio: portfolio[0]
         });
        }).error(handleError(res));
    }else{
        return res.status(404).send({message:'not found'});
    }
};

// delete by id
exports.deletePortfolio = function (req, res) {
    var id = req.params.id;
    Portfolio.get(id).delete().run().then(function(org) {
        res.json({
            status: "success"
        });
    }).error(handleError(res));
};

// Add portfolio
exports.addPortfolio = function (req, res) {
    var newPortfolio = new Portfolio(req.body);
    var user = JSON.parse(req.decoded);
     newPortfolio.createdBy=user.userId;
     newPortfolio.apiKey= uuid.v4();
     newPortfolio.tpKey= uuid.v4();
     newPortfolio.updatedBy =user.userId;
    newPortfolio.updatedOn =r.now();
    console.log(newPortfolio);
    newPortfolio.save().then(function(result) {
        res.json({
            result: result
        });
    }).error(handleError(res));
};

// update portfolio
exports.updatePortfolio = function (req, res) {
    var id = req.params.id;
    Portfolio.get(id).run().then(function(result) {
        if(result){
            var user = JSON.parse(req.decoded);
            var data = req.body;
            data.updatedBy =user.userId;
            data.updatedOn =r.now();
            Portfolio.get(result.id).update(data).then(function(port){
                res.json({
                    result: result
                })
            }).error(handleError(res));
        }else{
            return res.status(404).send({message:'not found'})
        }
    }).error(handleError(res));
};

// var uploadDocument = function(file,user,portfolio, callback){
//     //var user = JSON.parse(req.decoded);
//     if(file){
//         var obj = new Object();
//         obj.name = file.name;
//         obj.mime = file.mimetype;
//         obj.forId = portfolio.id;
//         obj.userId = user.userId;
//         obj.updatedBy =  user.userId;
//         obj.portfolioId = portfolio.id;
//         obj.updatedOn = r.now();
//         var newMedia = new Media(obj);
//     }
//     newMedia.save().then(function(media) {  
//         console.log('comes here');
//         //MediaService.uploadMedia(file, media.id, callback);
//     });
// }
// exports.uploadAdhar = function (req, res) {
//     var user = JSON.parse(req.decoded);
//     if (!req.files){
//         return res.send(500, {error: 'No file to upload'});
//     }else{
//         Portfolio.filter({uName: req.params.uname}).run().then(function(portfolio){
//             if(user.roles.indexOf('super-admin') > -1 || user.roles.indexOf('aggregator') > -1 || user.portfolioId === portfolio[0].id ){
//                 var file = req.files.adhar;
//                 console.log(req.files.adhar);
//                 var meCallback = function(error, data){
//                     console.log('data --- > ' + JSON.stringify(data));
//                     if(!error){
//                         var port = {};
//                         port.adhar = config.media.upload.s3.accessUrl + '/media/'+ og.getIdPath(data.mediaId) + '/' + file.name;
//                         port.mediaId = data.mediaId;
//                         port.updatedBy = user.userId;
//                         port.updatedOn = r.now();
//                         console.log(port.mediaId);
//                         Portfolio.get(portfolio[0].id).update(port).then(function(result) {
//                             res.json({
//                                 result: result
//                             });
//                         }).error(handleError(res));
//                     }else{
//                         return res.send(500, {error: error.message});
//                     }
//                 }
//                 uploadDocument(file,user,portfolio[0],meCallback);
//             }else{
//                  return res.send(500, {error: 'Do not have permission'});
//             }    
//         })
//     }
// };

// exports.uploadPan = function (req, res) {
//     var user = JSON.parse(req.decoded);
//     if (!req.files){
//         return res.send(500, {error: 'No file to upload'});
//     }else{
//         Portfolio.filter({uName: req.params.uname}).run().then(function(portfolio){
//             if(user.roles.indexOf('super-admin') > -1 || user.roles.indexOf('aggregator') > -1 || user.portfolioId === portfolio[0].id ){
//                 var file = req.files.pan;
//                 console.log(req.files.pan);
//                 var meCallback = function(error, data){
//                     console.log('data --- > ' + JSON.stringify(data));
//                     if(!error){
//                         var port = {};
//                         port.pan = config.media.upload.s3.accessUrl + '/media/'+ og.getIdPath(data.mediaId) + '/' + file.name;
//                         port.mediaId = data.mediaId;
//                         port.updatedBy = user.userId;
//                         port.updatedOn = r.now();
//                         console.log(port.mediaId);
//                         Portfolio.get(portfolio[0].id).update(port).then(function(result) {
//                             res.json({
//                                 result: result
//                             });
//                         }).error(handleError(res));
//                     }else{
//                         return res.send(500, {error: error.message});
//                     }
//                 }
//                 uploadDocument(file,user,portfolio[0],meCallback);
//             }else{
//                  return res.send(500, {error: 'Do not have permission'});
//             }    
//         })
//     }
// };

// exports.uploadServiceTax = function (req, res) {
//     var user = JSON.parse(req.decoded);
//     if (!req.files){
//         return res.send(500, {error: 'No file to upload'});
//     }else{
//         Portfolio.filter({uName: req.params.uname}).run().then(function(portfolio){
//             if(user.roles.indexOf('super-admin') > -1 || user.roles.indexOf('aggregator') > -1 || user.portfolioId === portfolio[0].id ){
            
//                 var file = req.files.serviceTax;
//                 console.log(req.files.serviceTax);
//                 var meCallback = function(error, data){
//                     console.log('data --- > ' + JSON.stringify(data));
//                     if(!error){
//                         var port = {};
//                         port.serviceTax = config.media.upload.s3.accessUrl + '/media/'+ og.getIdPath(data.mediaId) + '/' + file.name;
//                         port.mediaId = data.mediaId;
//                         port.updatedBy = user.userId;
//                         port.updatedOn = r.now();
//                         console.log(port.mediaId);
//                         Portfolio.get(portfolio[0].id).update(port).then(function(result) {
//                             res.json({
//                                 result: result
//                             });
//                         }).error(handleError(res));
//                     }else{
//                         return res.send(500, {error: error.message});
//                     }
//                 }
//                 uploadDocument(file,user,portfolio[0],meCallback);
//             }else{
//                  return res.send(500, {error: 'Do not have permission'});
//             }
//         })
//     }
// };

// exports.uploadAddress = function (req, res) {
//     var user = JSON.parse(req.decoded);
//     if (!req.files){
//         return res.send(500, {error: 'No file to upload'});
//     }else{
//         Portfolio.filter({uName: req.params.uname}).run().then(function(portfolio){
//             if(user.roles.indexOf('super-admin') > -1 || user.roles.indexOf('aggregator') > -1 || user.portfolioId === portfolio[0].id ){
//                 var file = req.files.addressProof;
//                 console.log(req.files.addressProof);
//                 var meCallback = function(error, data){
//                     console.log('data --- > ' + JSON.stringify(data));
//                     if(!error){
//                         var port = {};
//                         port.addressProof = config.media.upload.s3.accessUrl + '/media/'+ og.getIdPath(data.mediaId) + '/' + file.name;
//                         port.mediaId = data.mediaId;
//                         port.updatedBy = user.userId;
//                         port.updatedOn = r.now();
//                         console.log(port.mediaId);
//                         Portfolio.get(portfolio[0].id).update(port).then(function(result) {
//                             res.json({
//                                 result: result
//                             });
//                         }).error(handleError(res));
//                     }else{
//                         return res.send(500, {error: error.message});
//                     }
//                 }
//                 uploadDocument(file,user,portfolio[0],meCallback);
//             }else{
//                  return res.send(500, {error: 'Do not have permission'});
//             }
//         })
//     }
// };

// exports.uploadLetterHead = function (req, res) {
//     var user = JSON.parse(req.decoded);
//     if (!req.files){
//         return res.send(500, {error: 'No file to upload'});
//     }else{
//         Portfolio.filter({uName: req.params.uname}).run().then(function(portfolio){
//             console.log(user.portfolioId );
//             console.log(portfolio[0].id);

//             if(user.roles.indexOf('super-admin') > -1 || user.roles.indexOf('aggregator') > -1 || user.portfolioId === portfolio[0].id ){
               
//                 var file = req.files.letterh;
//                 console.log(req.files.letterh);
//                 var meCallback = function(error, data){
//                     console.log('data --- > ' + JSON.stringify(data));
//                     if(!error){
//                         var port = {};
//                         port.letterheadheader = config.media.upload.s3.accessUrl + '/media/'+ og.getIdPath(data.mediaId) + '/' + file.name;
//                         port.mediaId = data.mediaId;
//                         port.updatedBy = user.userId;
//                         port.updatedOn = r.now();
//                         console.log(port.mediaId);
//                         Portfolio.get(portfolio[0].id).update(port).then(function(result) {
//                             res.json({
//                                 result: result
//                             });
//                         }).error(handleError(res));
//                     }else{
//                         return res.send(500, {error: error.message});
//                     }
//                 }
//                 uploadDocument(file,user,portfolio[0],meCallback);
//             }else{
//                  return res.send(500, {error: 'Do not have permission'});
//             }
//         })
//     }
// };

// exports.uploadLetterHeadFooter = function (req, res) {
//     var user = JSON.parse(req.decoded);
//     if (!req.files){
//         return res.send(500, {error: 'No file to upload'});
//     }else{
//         Portfolio.filter({uName: req.params.uname}).run().then(function(portfolio){
//             if(user.roles.indexOf('super-admin') > -1 || user.roles.indexOf('aggregator') > -1 || user.portfolioId === portfolio[0].id ){
               
//                 var file = req.files.letterhf;
//                 console.log(req.files.letterhf);
//                 var meCallback = function(error, data){
//                     console.log('data --- > ' + JSON.stringify(data));
//                     if(!error){
//                         var port = {};
//                         port.letterheadfooter = config.media.upload.s3.accessUrl + '/media/'+ og.getIdPath(data.mediaId) + '/' + file.name;
//                         port.mediaId = data.mediaId;
//                         port.updatedBy = user.userId;
//                         port.updatedOn = r.now();
//                         console.log(port.mediaId);
//                         Portfolio.get(portfolio[0].id).update(port).then(function(result) {
//                             res.json({
//                                 result: result
//                             });
//                         }).error(handleError(res));
//                     }else{
//                         return res.send(500, {error: error.message});
//                     }
//                 }
//                 uploadDocument(file,user,portfolio[0],meCallback);
//             }else{
//                  return res.send(500, {error: 'Do not have permission'});
//             }
//         })
//     }
// };

// exports.listservicePortfolio = function (req, res) {
//     var count;
//     var pno=1,offset=0,limit=10;
//     if(req.query.psize != undefined && req.query.psize != null && !isNaN(req.query.psize)){
//         limit = parseInt(req.query.psize);
//     }

//     if(req.query.pno != undefined && req.query.pno != null && !isNaN(req.query.pno)){
//        pno =  parseInt(req.query.pno);
//     }

//     offset = (pno -1) * limit;


//     var token = req.body.token || req.query.token || req.headers['x-access-token'];
//     var tokenObject = JSON.parse(req.decoded);
//     var itemId = req.params.id;

//     if(tokenObject.roles.indexOf('aggregator') >0 || tokenObject.roles.indexOf('super-admin') >0){
//         Item.orderBy({index: r.desc('createdOn')}).filter({mpId: tokenObject.portfolioId,mpServiceId: itemId,status:'active'}).getJoin({portfolio: true}).skip(offset).limit(limit).run().then(function(portfolios){
//             Item.filter({mpId: tokenObject.portfolioId,mpServiceId: itemId,status:'active'}).count().execute().then(function(total) {
//             count = total;
//             console.log(count);
//                 res.json({
//                     data: portfolios,
//                     total: count,
//                     pno: pno,
//                     psize: limit
//                 });
//             }).error(handleError(res));  
//         }).error(handleError(res));
//         handleError(res);
//     }else{
//         return res.send(500, {error: 'Do not have permission'});
//     }
    
// };

// exports.rechargeWallet = function (req, res) {
//   if(!req.body.amount || req.body.amount == null || req.body.amount ==='' || parseInt(req.body.amount)<2000){
//         return res.send(500, {error: 'Please Enter valid amount above 2000'}); 
//   }
//   var tokenObject = JSON.parse(req.decoded);
//   Portfolio.get(tokenObject.portfolioId).run().then(function(portfolio){
//       Portfolio.filter({apiKey: tokenObject.apiKey}).run().then(function(main){
//             if(main && main.length >0 && main[0].instamojo){
//                 var iapikey = main[0].instamojo.apiKey;
//                 var authtoken = main[0].instamojo.authtoken;
//             }else{
//                 var iapikey = "346152816498133c4e68755a2aec12ad";
//                 var authtoken = "85265f2ccbd0e0f5a41752c3734374b3";
//             }
//             var sd = main[0];
//             if(portfolio){
//               Insta.setKeys(iapikey, authtoken);
//               var data = new Insta.PaymentData();
//               var amnt = parseInt(req.body.amount);
//               data.purpose = req.body.purpose;            // REQUIRED 
//               data.amount = amnt;                  // REQUIRED 
//               data.redirect_url=req.body.redirect_url;
//               data.currency                = 'INR';
//               data.buyer_name              = portfolio.name;
//               data.email                   = portfolio.email;
//               data.phone                   = portfolio.mobile;
//               data.send_sms                = false;
//               data.send_email              = false;
//               data.allow_repeated_payments = false;
//                 var newPayment = new Payment({
//                     orgId: portfolio.orgId,
//                     portfolioId: portfolio.id,
//                     orderId: data.purpose,
//                     amount: data.amnt,
//                     paymentDate: new Date(),
//                     paymentMode: 'Credit/Debit Card'
//                   });
//                     if(tokenObject.mpId && tokenObject.mpId !=null){
//                         newPayment.mpId = tokenObject.mpId;
//                     }
//                  console.log(JSON.stringify(data));
//                   newPayment.save().then(function(payment){
//                     data.webhook = 'https://api.zinetgo.com/api/update-wallet/'+ payment.id + '?apikey='+portfolio.apiKey,
//                     Insta.createPayment(data, function(error, response) {
//                       if (error) {
//                         // some error 
//                         res.status(500).send({ error: error });
//                       } else {
//                         // Payment redirection link at response.payment_request.longurl 
//                       console.log("payment done");
//                         console.log(response);
//                         response.paymentId = payment.id;
//                         res.json({
//                            result:JSON.parse(response)
//                         });
//                       } 
//                     });
//                 });
//             }else{
//               return res.send(500, {error: 'Invalid request'}); 
//             }
//         })
//   });
// };


// exports.updateWallet = function (req, res) {
//     console.log("id---"+req.params.id);
//     var record = req.body;
//     record.updatedOn =r.now();
//     Payment.get(req.params.id).update(record).then(function(result) {
//         console.log("phone==="+req.body.buyer_phone);
//         var mob= req.body.buyer_phone.substr(3, req.body.buyer_phone.length-1);
//         console.log("mobile--"+mob);
//         console.log("purpose--"+req.body.purpose);
//         var mobile=parseInt(mob);
//         Portfolio.filter({uName:req.body.purpose}).run().then(function(portf){
//             if(portf && portf.length>0){
//                 var port = portf[0];
//                 if(result.mpId && result.mpId !=null){
//                     if(port.trunetoWallet){
//                         var nwallt = parseInt(port.trunetoWallet) + parseInt(result.amount);
//                     }else{
//                          var nwallt = parseInt(result.amount);
//                     }
//                     var obj = { trunetoWallet: parseInt(nwallt) };
//                 }else{
//                     if(port.wallet){
//                         var nwallt = parseInt(port.wallet) + parseInt(result.amount);
//                     }else{
//                          var nwallt = parseInt(result.amount);
//                     }
//                     var obj = { wallet: parseInt(nwallt) };
//                 }
                
//                 Portfolio.get(port.id).update(obj).then(function(updatedOrder){
//                     Portfolio.filter({apiKey: req.query.apikey}).run().then(function(portfo){
//                         if(portfo && portfo.length>0){
//                             var portfolio = portfo[0];
//                             var newWalletTransaction = new WalletTransaction({
//                                 portfolioId:port.id,
//                                 beforeBal: parseInt(port.wallet) || 0,
//                                 afterBal: parseInt(updatedOrder.wallet),
//                                 deposite: parseInt(result.amount),
//                                 comments: 'Recharged of amount '+result.amount
//                             });
//                             if(result.mpId && result.mpId !=null){
//                                 newWalletTransaction.mpId = result.mpId;
//                             }

//                             newWalletTransaction.save().then(function(walletTran){
//                                 emailConfig.filter({portfolioId:user.portfolioId}).run().then(function(eConfig){
//                                     if(eConfig && eConfig.length>0){
//                                         var mailConf = eConfig[0];
//                                         portfolioEmailId= mailConf.gmail.auth.user;
//                                         portfolioSenderName= mailConf.gmail.auth.name;
//                                         var sender = mailConf.gmail;
//                                     }else{
//                                         var sender = config.smtp.gmail;
//                                     }
//                                     if(!portfolioEmailId){
//                                       portfolioEmailId = portfolio.email;
//                                     }
//                                     if(!portfolioSenderName){
//                                       portfolioSenderName = portfolio.name;
//                                     } 


//                                     var portfolioSmsId = mailConf.smsConfig.smsProvider.senderId;
//                                     if(portfolioSmsId == undefined || portfolioSmsId == null || portfolioSmsId === ""){
//                                         portfolioSmsId = config.sms.msg91.senderId;
//                                     }

//                                     var authKey = mailConf.smsConfig.smsProvider.authKey;
//                                     if(authKey == undefined || authKey == null || authKey === ""){
//                                         authKey = config.sms.msg91.authKey;
//                                     }
//                                     console.log('portfolio.authKey-----------: '+ authKey);
//                                     console.log('portfolio portfolioSmsId-----------: '+ portfolioSmsId);

//                                     if(portfolio.mobile != undefined && portfolio.mobile != null){
//                                      smsService.sendSms(req, config.sms.msg91.authKey,config.sms.msg91.senderId, portfolio.mobile,port.name+' has recharged its wallet with Rs. '+result.amount+'\n\n Team '+ portfolio.name);
//                                      smsService.sendSms(req, authKey, portfolioSmsId, mobile,'Amount of Rs. '+result.amount+' has been credited to your truneto.com wallet. Your current available balance is '+updatedOrder.wallet+'. For more details please visit'+ portfolio.website);
//                                     }
//                                     if(portfolio.email != undefined && portfolio.email != null){
//                                         emailService.sendEmail(config.smtp.gmail, {
//                                             from: '"Zinetgo" <support@zinetgo.com>', // sender address
//                                             to: portfolio.email, // list of receivers
//                                             subject: 'Wallet recharged of Rs. '+result.amount+' by '+port.name, // Subject line
//                                             text: 'Dear '+portfolio.name +'!\n\n'+ port.name+' has recharged its wallet with Rs. '+result.amount+ 'Best,\n'+'Team Zinetgo', // plain text
//                                             html: 'Dear '+portfolio.name +'!<br><br>'+ port.name+' has recharged its wallet with Rs. '+result.amount+ 'Best,\n'+'Team Zinetgo' // plain text
//                                         });
//                                     }

//                                     var portfolioEmailId,portfolioSenderName;

//                                     if(portfolio.emailProvider){
//                                       portfolioEmailId= portfolio.emailProvider.auth.user;
//                                       portfolioSenderName= portfolio.emailProvider.auth.name;
//                                     }
//                                     if(!portfolioEmailId){
//                                       portfolioEmailId = portfolio.email;
//                                     }
//                                     if(!portfolioSenderName){
//                                       portfolioSenderName = portfolio.name;
//                                     }
//                                     console.log('portfolio.emailProvider: '+ portfolio.emailProvider);

//                                     if(req.body.buyer != undefined && req.body.buyer != null){
//                                       emailService.sendEmail(sender, {
//                                             from: '"'+portfolioSenderName +'" <'+portfolioEmailId+'>', // sender address
//                                             to: req.body.buyer, // list of receivers
//                                             subject: 'Your order has been successfully placed'+'\n\n order id:'+req.body.purpose, // Subject line
//                                             text: 'Dear '+req.body.buyer_name+'<br><br>'+'Amount '+result.amount+' has been credited to your wallet.Your current available balance is '+updatedOrder.wallet+'. For more details please visit'+ portfolio.website, // plain text
//                                             html: 'Dear '+req.body.buyer_name +'!<br><br>Amount '+result.amount+' has been credited to your wallet.Your current available balance is '+updatedOrder.wallet+ '. For more details please visit '+ portfolio.website
//                                         });
//                                     }
//                                 });
//                             });
//                         }
//                     });
//                     res.json({
//                         result: result
//                     });
//                 }); 
//             }else {
//                 return res.send(500, {error: 'Invalid request'});
//             }
//         });
//     }).error(handleError(res));
// };


// exports.walletRecharge = function (req, res) {
//    var tokenObject = JSON.parse(req.decoded);
//     Portfolio.filter({uName:req.params.id}).run().then(function(portf){
//         if(portf && portf.length>0){
//             var port = portf[0];
//             if(tokenObject.roles.indexOf('aggregator')>-1){
//                if(port.trunetoWallet){
//                 var nwallt = parseInt(port.trunetoWallet) + parseInt(req.body.amount);
//                 }else{
//                     var nwallt = parseInt(req.body.amount);
//                 } 
//                 Portfolio.get(port.id).update({trunetoWallet: parseInt(nwallt)}).then(function(updatedOrder){
//                     var newWalletTransaction = new WalletTransaction({
//                         portfolioId:port.id,
//                         beforeBal: parseInt(port.trunetoWallet) || 0,
//                         afterBal: parseInt(updatedOrder.trunetoWallet),
//                         deposite: parseInt(req.body.amount),
//                         comments: req.body.comments || 'Recharged of amount '+req.body.amount,
//                         mpId: tokenObject.portfolioId
//                     });
//                     newWalletTransaction.save().then(function(walletTran){
//                         Portfolio.get(tokenObject.portfolioId).run().then(function(portfolio){
//                             if(portfolio){
//                                 emailConfig.filter({portfolioId:tokenObject.portfolioId}).run().then(function(eConfig){
//                                     if(eConfig && eConfig.length>0){
                                        
//                                         var mailConf = eConfig[0];
//                                         console.log(mailConf);
//                                         portfolioEmailId= mailConf.emailConfig.gmail.auth.user;
//                                         portfolioSenderName= mailConf.emailConfig.gmail.auth.name;
//                                         var sender = mailConf.gmail;
//                                     }else{
//                                          console.log('portfolio.else-----------: ');
//                                         var sender = config.smtp.gmail;
//                                     }
//                                     if(!portfolioEmailId){
//                                       portfolioEmailId = portfolio.email;
//                                     }
//                                     if(!portfolioSenderName){
//                                       portfolioSenderName = portfolio.name;
//                                     } 

//                                     var portfolioSmsId = mailConf.smsConfig.smsProvider.senderId;
//                                     if(portfolioSmsId == undefined || portfolioSmsId == null || portfolioSmsId === ""){
//                                         portfolioSmsId = config.sms.msg91.senderId;
//                                     }

//                                     var authKey = mailConf.smsConfig.smsProvider.authKey;
//                                     if(authKey == undefined || authKey == null || authKey === ""){
//                                         authKey = config.sms.msg91.authKey;
//                                     }
//                                     console.log('portfolio.authKey-----------: '+ authKey);
//                                     console.log('portfolio portfolioSmsId-----------: '+ portfolioSmsId);

//                                     if(portfolio.mobile != undefined && portfolio.mobile != null){
//                                      //smsService.sendSms(req, config.sms.msg91.authKey,config.sms.msg91.senderId, port.mobile,port.name+' has recharged its wallet with Rs. '+result.amount+'\n\n Team '+ portfolio.name);
//                                      smsService.sendSms(req, authKey, portfolioSmsId, port.mobile,'Amount of Rs. '+req.body.amount+' has been credited to your '+portfolio.name +' wallet. Your current available balance is '+nwallt+'. For more details please visit '+ portfolio.website);
//                                     }
                                    
//                                     var portfolioEmailId,portfolioSenderName;

//                                     if(portfolio.emailProvider){
//                                       portfolioEmailId= portfolio.emailProvider.auth.user;
//                                       portfolioSenderName= portfolio.emailProvider.auth.name;
//                                     }
//                                     if(!portfolioEmailId){
//                                       portfolioEmailId = portfolio.email;
//                                     }
//                                     if(!portfolioSenderName){
//                                       portfolioSenderName = portfolio.name;
//                                     }
//                                     console.log('portfolio.emailProvider: '+ portfolio.emailProvider);

//                                     if(req.body.buyer != undefined && req.body.buyer != null){
//                                       emailService.sendEmail(sender, {
//                                             from: '"'+portfolioSenderName +'" <'+portfolioEmailId+'>', // sender address
//                                             to: port.email, // list of receivers
//                                             subject: 'Your '+portfolio.name+' wallet has been recharged amount of Rs. '+req.body.amount,
//                                             text: 'Dear '+port.name+'<br><br>'+'Amount '+req.body.amount+' has been credited to your wallet.Your current available balance is '+nwallt+'. For more details please visit'+ portfolio.website, // plain text
//                                             html: 'Dear '+port.name +'!<br><br>Amount '+req.body.amount+' has been credited to your wallet.Your current available balance is '+nwallt+ '. For more details please visit '+ portfolio.website
//                                         });
//                                     }
//                                 });
//                             }
//                             res.json({
//                                 result: walletTran
//                             });
//                         });
//                     });
                
//                 });
//             }else if(tokenObject.roles.indexOf('super-admin')>-1){
//                 if(port.wallet){
//                 var nwallt = parseInt(port.wallet) + parseInt(req.body.amount);
//                 }else{
//                     var nwallt = parseInt(req.body.amount);
//                 } 
//                 Portfolio.get(port.id).update({wallet: parseInt(nwallt)}).then(function(updatedOrder){
//                     var newWalletTransaction = new WalletTransaction({
//                         portfolioId:port.id,
//                         beforeBal: parseInt(port.wallet) || 0,
//                         afterBal: parseInt(updatedOrder.wallet),
//                         deposite: parseInt(req.body.amount),
//                         comments: req.body.comments || 'Recharged of amount '+req.body.amount
//                     });
//                     newWalletTransaction.save().then(function(walletTran){
//                         Portfolio.get(tokenObject.portfolioId).run().then(function(portfolio){
//                             if(portfolio){
//                                 emailConfig.filter({portfolioId:tokenObject.portfolioId}).run().then(function(eConfig){
//                                     if(eConfig && eConfig.length>0){
//                                         var mailConf = eConfig[0];
//                                         portfolioEmailId= mailConf.emailConfig.gmail.auth.user;
//                                         portfolioSenderName= mailConf.emailConfig.gmail.auth.name;
//                                         var sender = mailConf.gmail;
//                                     }else{
//                                         var sender = config.smtp.gmail;
//                                     }
//                                     if(!portfolioEmailId){
//                                       portfolioEmailId = portfolio.email;
//                                     }
//                                     if(!portfolioSenderName){
//                                       portfolioSenderName = portfolio.name;
//                                     } 


//                                     var portfolioSmsId = mailConf.smsConfig.smsProvider.senderId;
//                                     if(portfolioSmsId == undefined || portfolioSmsId == null || portfolioSmsId === ""){
//                                         portfolioSmsId = config.sms.msg91.senderId;
//                                     }

//                                     var authKey = mailConf.smsConfig.smsProvider.authKey;
//                                     if(authKey == undefined || authKey == null || authKey === ""){
//                                         authKey = config.sms.msg91.authKey;
//                                     }
//                                     console.log('portfolio.authKey-----------: '+ authKey);
//                                     console.log('portfolio portfolioSmsId-----------: '+ portfolioSmsId);

//                                     if(portfolio.mobile != undefined && portfolio.mobile != null){
//                                      //smsService.sendSms(req, config.sms.msg91.authKey,config.sms.msg91.senderId, port.mobile,port.name+' has recharged its wallet with Rs. '+result.amount+'\n\n Team '+ portfolio.name);
//                                      smsService.sendSms(req, authKey, portfolioSmsId, port.mobile,'Amount of Rs. '+req.body.amount+' has been credited to your '+portfolio.name +'wallet. Your current available balance is '+nwallt+'. For more details please visit '+ portfolio.website);
//                                     }
                                    
//                                     var portfolioEmailId,portfolioSenderName;

//                                     if(portfolio.emailProvider){
//                                       portfolioEmailId= portfolio.emailProvider.auth.user;
//                                       portfolioSenderName= portfolio.emailProvider.auth.name;
//                                     }
//                                     if(!portfolioEmailId){
//                                       portfolioEmailId = portfolio.email;
//                                     }
//                                     if(!portfolioSenderName){
//                                       portfolioSenderName = portfolio.name;
//                                     }
//                                     console.log('portfolio.emailProvider: '+ portfolio.emailProvider);

//                                     if(req.body.buyer != undefined && req.body.buyer != null){
//                                       emailService.sendEmail(sender, {
//                                             from: '"'+portfolioSenderName +'" <'+portfolioEmailId+'>', // sender address
//                                             to: port.email, // list of receivers
//                                             subject: 'Your '+portfolio.name+' wallet has been recharged amount of Rs. '+result.amount,
//                                             text: 'Dear '+port.name+'<br><br>'+'Amount '+req.body.amount+' has been credited to your wallet.Your current available balance is '+nwallt+'. For more details please visit'+ portfolio.website, // plain text
//                                             html: 'Dear '+port.name +'!<br><br>Amount '+req.body.amount+' has been credited to your wallet.Your current available balance is '+nwallt+ '. For more details please visit '+ portfolio.website
//                                         });
//                                     }
//                                     res.json({
//                                         result: walletTran
//                                     });
//                                 });
//                             }
//                         });
//                     });
//                 });
//             }else{
//                 return res(401,{error:'Invalid request'})
//             }
//         }else{
//             return res(401,{error:'Invalid request'});
//         }
//     });
// };

// exports.walletRefund = function (req, res) {
//    var tokenObject = JSON.parse(req.decoded);
//     Portfolio.filter({uName:req.params.id}).run().then(function(portf){
//         if(portf && portf.length>0){
//             var port = portf[0];
//             if(tokenObject.roles.indexOf('aggregator')>-1){
//                if(port.trunetoWallet){
//                 var nwallt = parseInt(port.trunetoWallet) + parseInt(req.body.amount);
//                 }else{
//                     var nwallt = parseInt(req.body.amount);
//                 } 
//                 Portfolio.get(port.id).update({trunetoWallet: parseInt(nwallt)}).then(function(updatedOrder){
//                     var newWalletTransaction = new WalletTransaction({
//                         portfolioId:port.id,
//                         beforeBal: parseInt(port.trunetoWallet) || 0,
//                         afterBal: parseInt(updatedOrder.trunetoWallet),
//                         deposite: parseInt(req.body.amount),
//                         comments: req.body.comments || 'Refunded  amount '+req.body.amount,
//                         mpId: tokenObject.portfolioId
//                     });
//                     newWalletTransaction.save().then(function(walletTran){
//                         Portfolio.get(tokenObject.portfolioId).run().then(function(portfolio){
//                             if(portfolio){
//                                 var twallet = parseInt(portfolio.wallet) - parseInt(req.body.amount);

//                                 var newWalletTransaction1 = new WalletTransaction({
//                                     portfolioId:portfolio.id,
//                                     beforeBal: parseInt(portfolio.wallet) || 0,
//                                     afterBal: parseInt(twallet),
//                                     withdrawl: parseInt(req.body.amount),
//                                     comments: req.body.comments || 'Refunded  amount '+req.body.amount
//                                 });
//                                 Portfolio.get(portfolio.id).update({wallet : twallet}).then(function(portfolio1){
//                                     newWalletTransaction1.save().then(function(walletTran){
//                                         emailConfig.filter({portfolioId:tokenObject.portfolioId}).run().then(function(eConfig){
//                                             if(eConfig && eConfig.length>0){
                                                
//                                                 var mailConf = eConfig[0];
//                                                 console.log(mailConf);
//                                                 portfolioEmailId= mailConf.emailConfig.gmail.auth.user;
//                                                 portfolioSenderName= mailConf.emailConfig.gmail.auth.name;
//                                                 var sender = mailConf.gmail;
//                                             }else{
//                                                  console.log('portfolio.else-----------: ');
//                                                 var sender = config.smtp.gmail;
//                                             }
//                                             if(!portfolioEmailId){
//                                               portfolioEmailId = portfolio.email;
//                                             }
//                                             if(!portfolioSenderName){
//                                               portfolioSenderName = portfolio.name;
//                                             } 

//                                             var portfolioSmsId = mailConf.smsConfig.smsProvider.senderId;
//                                             if(portfolioSmsId == undefined || portfolioSmsId == null || portfolioSmsId === ""){
//                                                 portfolioSmsId = config.sms.msg91.senderId;
//                                             }

//                                             var authKey = mailConf.smsConfig.smsProvider.authKey;
//                                             if(authKey == undefined || authKey == null || authKey === ""){
//                                                 authKey = config.sms.msg91.authKey;
//                                             }
//                                             console.log('portfolio.authKey-----------: '+ authKey);
//                                             console.log('portfolio portfolioSmsId-----------: '+ portfolioSmsId);

//                                             if(portfolio.mobile != undefined && portfolio.mobile != null){
//                                              //smsService.sendSms(req, config.sms.msg91.authKey,config.sms.msg91.senderId, port.mobile,port.name+' has recharged its wallet with Rs. '+result.amount+'\n\n Team '+ portfolio.name);
//                                              smsService.sendSms(req, authKey, portfolioSmsId, port.mobile,'Amount of Rs. '+req.body.amount+' has been refunded to your '+portfolio.name +'wallet. Your current available balance is '+nwallt+'. For more details please visit '+ portfolio.website);
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

//                                             if(req.body.buyer != undefined && req.body.buyer != null){
//                                               emailService.sendEmail(sender, {
//                                                     from: '"'+portfolioSenderName +'" <'+portfolioEmailId+'>', // sender address
//                                                     to: port.email, // list of receivers
//                                                     subject: 'Your '+portfolio.name+' wallet has been refunded amount of Rs. '+req.body.amount,
//                                                     text: 'Dear '+port.name+'<br><br>'+'Amount '+req.body.amount+' has been refunded to your wallet.Your current available balance is '+nwallt+'. For more details please visit'+ portfolio.website, // plain text
//                                                     html: 'Dear '+port.name +'!<br><br>Amount '+req.body.amount+' has been refunded to your wallet.Your current available balance is '+nwallt+ '. For more details please visit '+ portfolio.website
//                                                 });
//                                             }
//                                         });
//                                     });
//                                 });
//                             }
//                             res.json({
//                                 result: walletTran
//                             });
//                         });
//                     });
                
//                 });
//             }else if(tokenObject.roles.indexOf('super-admin')>-1){
//                 if(port.trunetoWallet){
//                 var nwallt = parseInt(port.wallet) + parseInt(req.body.amount);
//                 }else{
//                     var nwallt = parseInt(req.body.amount);
//                 } 
//                 Portfolio.get(port.id).update({wallet: parseInt(nwallt)}).then(function(updatedOrder){
//                     var newWalletTransaction = new WalletTransaction({
//                         portfolioId:port.id,
//                         beforeBal: parseInt(port.wallet) || 0,
//                         afterBal: parseInt(updatedOrder.wallet),
//                         deposite: parseInt(req.body.amount),
//                         comments: req.body.comments || 'Refunded amount '+req.body.amount
//                     });
//                     newWalletTransaction.save().then(function(walletTran){
//                         Portfolio.get(tokenObject.portfolioId).run().then(function(portfolio){
//                             if(portfolio){
//                                 var twallet = parseInt(portfolio.wallet) - parseInt(req.body.amount);
//                                 var newWalletTransaction1 = new WalletTransaction({
//                                     portfolioId:portfolio.id,
//                                     beforeBal: parseInt(portfolio.wallet) || 0,
//                                     afterBal: parseInt(twallet),
//                                     withdrawl: parseInt(req.body.amount),
//                                     comments: req.body.comments || 'Refunded  amount '+req.body.amount
//                                 });
//                                 Portfolio.get(portfolio.id).update({wallet : twallet}).then(function(portfolio1){
//                                     newWalletTransaction1.save().then(function(walletTran){
//                                         emailConfig.filter({portfolioId:tokenObject.portfolioId}).run().then(function(eConfig){
//                                             if(eConfig && eConfig.length>0){
//                                                 var mailConf = eConfig[0];
//                                                 portfolioEmailId= mailConf.emailConfig.gmail.auth.user;
//                                                 portfolioSenderName= mailConf.emailConfig.gmail.auth.name;
//                                                 var sender = mailConf.gmail;
//                                             }else{
//                                                 var sender = config.smtp.gmail;
//                                             }
//                                             if(!portfolioEmailId){
//                                               portfolioEmailId = portfolio.email;
//                                             }
//                                             if(!portfolioSenderName){
//                                               portfolioSenderName = portfolio.name;
//                                             } 


//                                             var portfolioSmsId = mailConf.smsConfig.smsProvider.senderId;
//                                             if(portfolioSmsId == undefined || portfolioSmsId == null || portfolioSmsId === ""){
//                                                 portfolioSmsId = config.sms.msg91.senderId;
//                                             }

//                                             var authKey = mailConf.smsConfig.smsProvider.authKey;
//                                             if(authKey == undefined || authKey == null || authKey === ""){
//                                                 authKey = config.sms.msg91.authKey;
//                                             }
//                                             console.log('portfolio.authKey-----------: '+ authKey);
//                                             console.log('portfolio portfolioSmsId-----------: '+ portfolioSmsId);

//                                             if(portfolio.mobile != undefined && portfolio.mobile != null){
//                                              //smsService.sendSms(req, config.sms.msg91.authKey,config.sms.msg91.senderId, port.mobile,port.name+' has recharged its wallet with Rs. '+result.amount+'\n\n Team '+ portfolio.name);
//                                              smsService.sendSms(req, authKey, portfolioSmsId, port.mobile,'Amount of Rs. '+req.body.amount+' has been refunded to your '+portfolio.name +'wallet. Your current available balance is '+nwallt+'. For more details please visit '+ portfolio.website);
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

//                                             if(req.body.buyer != undefined && req.body.buyer != null){
//                                               emailService.sendEmail(sender, {
//                                                     from: '"'+portfolioSenderName +'" <'+portfolioEmailId+'>', // sender address
//                                                     to: port.email, // list of receivers
//                                                     subject: 'Your '+portfolio.name+' wallet has been refunded amount of Rs. '+result.amount,
//                                                     text: 'Dear '+port.name+'<br><br>'+'Amount '+req.body.amount+' has been refunded to your wallet.Your current available balance is '+nwallt+'. For more details please visit'+ portfolio.website, // plain text
//                                                     html: 'Dear '+port.name +'!<br><br>Amount '+req.body.amount+' has been refunded to your wallet.Your current available balance is '+nwallt+ '. For more details please visit '+ portfolio.website
//                                                 });
//                                             }
//                                             res.json({
//                                                 result: walletTran
//                                             });
//                                         });
//                                     });
//                                 });
//                             }
//                         });
//                     });
//                 });
//             }else{
//                 return res(401,{error:'Invalid request'})
//             }
//         }else{
//             return res(401,{error:'Invalid request'});
//         }
//     });
// };

// exports.walletDeduct = function (req, res) {
//    var tokenObject = JSON.parse(req.decoded);
//     Portfolio.filter({uName:req.params.id}).run().then(function(portf){
//         if(portf && portf.length>0){
//             var port = portf[0];
//             if(tokenObject.roles.indexOf('aggregator')>-1){
//                if(port.trunetoWallet){
//                 var nwallt = parseInt(port.trunetoWallet) - parseInt(req.body.amount);
//                 }else{
//                     var nwallt = 0-parseInt(req.body.amount);
//                 } 
//                 Portfolio.get(port.id).update({trunetoWallet: parseInt(nwallt)}).then(function(updatedOrder){
//                     var newWalletTransaction = new WalletTransaction({
//                         portfolioId:port.id,
//                         beforeBal: parseInt(port.trunetoWallet) || 0,
//                         afterBal: parseInt(updatedOrder.trunetoWallet),
//                         withdrawl: parseInt(req.body.amount),
//                         comments: req.body.comments || 'Deducted  amount '+req.body.amount,
//                         mpId: tokenObject.portfolioId
//                     });
//                     newWalletTransaction.save().then(function(walletTran){
//                         Portfolio.get(tokenObject.portfolioId).run().then(function(portfolio){
//                             if(portfolio){
//                                 var twallet = parseInt(portfolio.wallet) + parseInt(req.body.amount);
//                                 var newWalletTransaction1 = new WalletTransaction({
//                                     portfolioId:portfolio.id,
//                                     beforeBal: parseInt(portfolio.wallet) || 0,
//                                     afterBal: parseInt(twallet),
//                                     deposite: parseInt(req.body.amount),
//                                     comments: req.body.comments || 'Deducted  amount '+req.body.amount,
//                                 });
//                                 Portfolio.get(portfolio.id).update({wallet : twallet}).then(function(portfolio1){
//                                     newWalletTransaction1.save().then(function(walletTran){
//                                         emailConfig.filter({portfolioId:tokenObject.portfolioId}).run().then(function(eConfig){
//                                             if(eConfig && eConfig.length>0){
                                                
//                                                 var mailConf = eConfig[0];
//                                                 console.log(mailConf);
//                                                 portfolioEmailId= mailConf.emailConfig.gmail.auth.user;
//                                                 portfolioSenderName= mailConf.emailConfig.gmail.auth.name;
//                                                 var sender = mailConf.gmail;
//                                             }else{
//                                                  console.log('portfolio.else-----------: ');
//                                                 var sender = config.smtp.gmail;
//                                             }
//                                             if(!portfolioEmailId){
//                                               portfolioEmailId = portfolio.email;
//                                             }
//                                             if(!portfolioSenderName){
//                                               portfolioSenderName = portfolio.name;
//                                             } 

//                                             var portfolioSmsId = mailConf.smsConfig.smsProvider.senderId;
//                                             if(portfolioSmsId == undefined || portfolioSmsId == null || portfolioSmsId === ""){
//                                                 portfolioSmsId = config.sms.msg91.senderId;
//                                             }

//                                             var authKey = mailConf.smsConfig.smsProvider.authKey;
//                                             if(authKey == undefined || authKey == null || authKey === ""){
//                                                 authKey = config.sms.msg91.authKey;
//                                             }
//                                             console.log('portfolio.authKey-----------: '+ authKey);
//                                             console.log('portfolio portfolioSmsId-----------: '+ portfolioSmsId);

//                                             if(portfolio.mobile != undefined && portfolio.mobile != null){
//                                              //smsService.sendSms(req, config.sms.msg91.authKey,config.sms.msg91.senderId, port.mobile,port.name+' has recharged its wallet with Rs. '+result.amount+'\n\n Team '+ portfolio.name);
//                                              smsService.sendSms(req, authKey, portfolioSmsId, port.mobile,'Amount of Rs. '+req.body.amount+' has been deducted from your '+portfolio.name +'wallet. Your current available balance is '+nwallt+'. For more details please visit '+ portfolio.website);
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

//                                             if(req.body.buyer != undefined && req.body.buyer != null){
//                                               emailService.sendEmail(sender, {
//                                                     from: '"'+portfolioSenderName +'" <'+portfolioEmailId+'>', // sender address
//                                                     to: port.email, // list of receivers
//                                                     subject: 'Your '+portfolio.name+' wallet has been deducted amount of Rs. '+req.body.amount,
//                                                     text: 'Dear '+port.name+'<br><br>'+'Amount '+req.body.amount+' has been deducted from your wallet.Your current available balance is '+nwallt+'. For more details please visit'+ portfolio.website, // plain text
//                                                     html: 'Dear '+port.name +'!<br><br>Amount '+req.body.amount+' has been deducted from your wallet.Your current available balance is '+nwallt+ '. For more details please visit '+ portfolio.website
//                                                 });
//                                             }
//                                         });
//                                     });   
//                                 });
//                             }
//                             res.json({
//                                 result: walletTran
//                             });
//                         });
//                     });
                
//                 });
//             }else if(tokenObject.roles.indexOf('super-admin')>-1){
//                 if(port.trunetoWallet){
//                 var nwallt = parseInt(port.wallet) - parseInt(req.body.amount);
//                 }else{
//                     var nwallt = 0-parseInt(req.body.amount);
//                 } 
//                 Portfolio.get(port.id).update({wallet: parseInt(nwallt)}).then(function(updatedOrder){
//                     var newWalletTransaction = new WalletTransaction({
//                         portfolioId:port.id,
//                         beforeBal: parseInt(port.wallet) || 0,
//                         afterBal: parseInt(updatedOrder.wallet),
//                         withdrawl: parseInt(req.body.amount),
//                         comments: req.body.comments || 'Deducted amount '+req.body.amount
//                     });
//                     newWalletTransaction.save().then(function(walletTran){
//                         Portfolio.get(tokenObject.portfolioId).run().then(function(portfolio){
//                             if(portfolio){
//                                 var twallet = parseInt(portfolio.wallet) + parseInt(req.body.amount);
//                                 var newWalletTransaction1 = new WalletTransaction({
//                                     portfolioId:portfolio.id,
//                                     beforeBal: parseInt(portfolio.wallet) || 0,
//                                     afterBal: parseInt(twallet),
//                                     deposite: parseInt(req.body.amount),
//                                     comments: req.body.comments || 'Deducted  amount '+req.body.amount,
//                                 });
//                                 Portfolio.get(portfolio.id).update({wallet : twallet}).then(function(portfolio1){
//                                     newWalletTransaction1.save().then(function(walletTran){
//                                         emailConfig.filter({portfolioId:tokenObject.portfolioId}).run().then(function(eConfig){
//                                             if(eConfig && eConfig.length>0){
//                                                 var mailConf = eConfig[0];
//                                                 portfolioEmailId= mailConf.emailConfig.gmail.auth.user;
//                                                 portfolioSenderName= mailConf.emailConfig.gmail.auth.name;
//                                                 var sender = mailConf.gmail;
//                                             }else{
//                                                 var sender = config.smtp.gmail;
//                                             }
//                                             if(!portfolioEmailId){
//                                               portfolioEmailId = portfolio.email;
//                                             }
//                                             if(!portfolioSenderName){
//                                               portfolioSenderName = portfolio.name;
//                                             } 


//                                             var portfolioSmsId = mailConf.smsConfig.smsProvider.senderId;
//                                             if(portfolioSmsId == undefined || portfolioSmsId == null || portfolioSmsId === ""){
//                                                 portfolioSmsId = config.sms.msg91.senderId;
//                                             }

//                                             var authKey = mailConf.smsConfig.smsProvider.authKey;
//                                             if(authKey == undefined || authKey == null || authKey === ""){
//                                                 authKey = config.sms.msg91.authKey;
//                                             }
//                                             console.log('portfolio.authKey-----------: '+ authKey);
//                                             console.log('portfolio portfolioSmsId-----------: '+ portfolioSmsId);

//                                             if(portfolio.mobile != undefined && portfolio.mobile != null){
//                                              //smsService.sendSms(req, config.sms.msg91.authKey,config.sms.msg91.senderId, port.mobile,port.name+' has recharged its wallet with Rs. '+result.amount+'\n\n Team '+ portfolio.name);
//                                              smsService.sendSms(req, authKey, portfolioSmsId, port.mobile,'Amount of Rs. '+req.body.amount+' has been deducted from your '+portfolio.name +'wallet. Your current available balance is '+nwallt+'. For more details please visit '+ portfolio.website);
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

//                                             if(req.body.buyer != undefined && req.body.buyer != null){
//                                               emailService.sendEmail(sender, {
//                                                     from: '"'+portfolioSenderName +'" <'+portfolioEmailId+'>', // sender address
//                                                     to: port.email, // list of receivers
//                                                     subject: 'Your '+portfolio.name+' wallet has been deducted amount of Rs. '+result.amount,
//                                                     text: 'Dear '+port.name+'<br><br>'+'Amount '+req.body.amount+' has been deducted from your wallet.Your current available balance is '+nwallt+'. For more details please visit'+ portfolio.website, // plain text
//                                                     html: 'Dear '+port.name +'!<br><br>Amount '+req.body.amount+' has been deducted from your wallet.Your current available balance is '+nwallt+ '. For more details please visit '+ portfolio.website
//                                                 });
//                                             }
//                                             res.json({
//                                                 result: walletTran
//                                             });
//                                         });
//                                     });
//                                 });
//                             }
//                         });
//                     });
//                 });
//             }else{
//                 return res(401,{error:'Invalid request'})
//             }
//         }else{
//             return res(401,{error:'Invalid request'});
//         }
//     });
// };

function handleError(res) {
    return function(error) {
        console.log(error.message);
        return res.send(500, {error: error.message});
    }
}
