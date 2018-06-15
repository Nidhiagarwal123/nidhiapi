var thinky = require(__dirname+'/../util/thinky.js'),
    r = thinky.r,
    env         = require(__dirname+'/../../env'),
    config      = require(__dirname+'/../../config/' + env.name),
    Contact = require(__dirname+'/../model/contact.js'), 
    Portfolio = require(__dirname+'/../model/portfolio.js');  

// list contacts
// TODO: all filter, page size and offset, columns, sort
exports.listContacts = function (req, res) {
    var count;
    var pno=1,offset=0,limit=10;
    if(req.query.psize != undefined && req.query.psize != null && !isNaN(req.query.psize)){
        limit = parseInt(req.query.psize);
    }

    if(req.query.pno != undefined && req.query.pno != null && !isNaN(req.query.pno)){
       pno =  parseInt(req.query.pno);
    }

    offset = (pno -1) * limit;

    var sort =req.query.sort;
    var pluck = req.query.pluck;
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    var tokenObject = JSON.parse(req.decoded);
    if(sort == undefined || sort == null ){
        Contact.filter({portfolioId: tokenObject.portfolioId}).count().execute().then(function(total) {
                count = total;
                console.log(total);
            });    
        Contact.orderBy(r.desc('createdOn')).filter({portfolioId: tokenObject.portfolioId}).getJoin({customer: true}).skip(offset).limit(limit).run().then(function(contacts) {
            res.json({
                data: contacts,
                total: count,
                pno: pno,
                psize: limit
            });
        }).error(handleError(res));
        handleError(res);
    }else{
        var result =sort.substring(0, 1);
        var sortLength =sort.length;
        if(result ==='-'){
            field=sort.substring(1,sortLength);
            console.log("field--"+field);
            console.log(typeof field);
            console.log("has field--"+Contact.hasFields(field));
            if(Contact.hasFields(field)){
                Contact.filter({portfolioId: tokenObject.portfolioId}).count().execute().then(function(total) {
                    count = total;
                    console.log(total);
                });    
                Contact.orderBy(r.desc(field)).filter({portfolioId: tokenObject.portfolioId}).skip(offset).limit(limit).run().then(function(contacts) {
                res.json({
                    data: contacts,
                    total: count,
                    pno: pno,
                    psize: limit
                });
                }).error(handleError(res));
                handleError(res);   
            }else{
                res.status(500).send({ message: 'No field exist.'});
            }    
        }else{
            field=sort.substring(0,sortLength);
            console.log("field--"+field);
            console.log("has field--"+Contact.hasFields(field));
            if(Contact.hasFields(field)){
                Contact.filter({portfolioId: tokenObject.portfolioId}).count().execute().then(function(total) {
                    count = total;
                    console.log(total);
                });    
                Contact.orderBy(r.asc(field)).filter({portfolioId: tokenObject.portfolioId}).skip(offset).limit(limit).run().then(function(contacts) {
                res.json({
                    data: contacts,
                    total: count,
                    pno: pno,
                    psize: limit
                });
                }).error(handleError(res));
                handleError(res);  
            }else{
                res.status(500).send({ message: 'No field exist.'});
            }       
        }
    }    
};

// get by id
exports.getContact = function (req, res) {
    var id = req.params.id;
    Contact.get(id).getJoin({branch: true}).run().then(function(contact) {
     res.json({
         contact: contact
     });
    }).error(handleError(res));
};


// delete by id
exports.deleteContact = function (req, res) {
    var id = req.params.id;
    Contact.get(id).delete().run().then(function(branch) {
        res.json({
            status: "success"
        });
    }).error(handleError(res));
};


// Add user
exports.addExternalContact = function (req, res) {
    var key = req.params.key;
    if(key == undefined || key == null){
        return res.send(500, {error: 'API key not set'});
    }
    var data, newContact;
    if(req.query.data){
        //do nothing
        data = JSON.parse(req.query.data);
        newContact =  new Contact(data);
    }else{
       newContact = new Contact(req.body);
    }

    if(newContact == undefined || key == null){
        return res.send(500, {error: 'Not data passed to API'});
    }else{
        var message = newContact.message;
        if(newContact.mobile == undefined || newContact.mobile == null || newContact.mobile == ""){
            return res.send(500, {error: 'Missing required field mobile'});
        }
        if(newContact.name == undefined || newContact.name == null || newContact.name == ""){
            return res.send(500, {error: 'Missing required field name'});
        }
        if(newContact.email == undefined || newContact.email == null || newContact.email == ""){
            return res.send(500, {error: 'Missing required field email'});
        }
        if(message == undefined || message == null || message == ""){
            message = '';
        }
        if(newContact.address == undefined || newContact.address == null || newContact.address == ""){
            newContact.address = '';
        }
        Portfolio.filter({tpKey:key}).run().then(function(result){
            if(result && result.length >0){
                var portfolio = result[0];
                newContact.portfolioId = portfolio.id;
                var mob = parseInt(newContact.mobile);
                newContact.save().then(function(contact) {
                    // if(portfolio.enableSms === true){
                    //      var portfolioSmsId = portfolio.smsProvider.senderId;
                    //     if(portfolioSmsId == undefined || portfolioSmsId == null || portfolioSmsId === ""){
                    //         portfolioSmsId = config.sms.msg91.senderId;
                    //     }

                    //     console.log('portfolio.portfolioSmsId: '+ portfolioSmsId);

                    //     var authKey = portfolio.smsProvider.authKey;
                    //     if(authKey == undefined || authKey == null || authKey === ""){
                    //         authKey = config.sms.msg91.authKey;
                    //     }
                    //     console.log('portfolio.authKey: '+ authKey);

                    //     if(portfolio.mobile != undefined && portfolio.mobile != null){
                    //           smsService.sendSms(req, authKey, portfolioSmsId, portfolio.mobile,'Dear '+portfolio.name +'! You have received a new inquiry.Please find below details '+'.\n\n'+'From:'+' '+contact.name +'.\n'+'Mobile:'+' ' + contact.mobile +'.\n'+'Date:'+' '+contact.email+'.\n'+'Message:'+' '+contact.message+'. \n\nBest,\nTeam Zinetgo');
                    //     }

                    //     if(contact.mobile != undefined && contact.mobile != null){
                    //         smsService.sendSms(req, authKey, portfolioSmsId, contact.mobile,'Dear user, your request for inquiry with '+ portfolio.name + ' is confirmed. Our customer care will contact you shortly. For any queries please call us at '+ portfolio.mobile +' \n\nBest,\n'+ portfolio.name);
                    //     }

                    // }
                    // if(portfolio.enableEmail === true){
                    //     if(portfolio.email != undefined && portfolio.email != null){
                    //         emailService.sendEmail(config.smtp.gmail, {
                    //             portfolioId: portfolio.id, 
                    //             from: '"Zinetgo.com" <support@zinetgo.com>', // sender message
                    //             to: portfolio.email, // list of receivers
                    //             subject: 'You have received a new inquiry request', // Subject line
                    //             text: 'Dear '+portfolio.name +'! You have received a new inquiry request.Please find below details '+'.<br><br>'+'From:'+' '+contact.name +'.<br>'+'Mobile:'+' ' + contact.mobile +'.<br>'+'Date:'+' '+contact.email+'.<br>'+'Address:'+' '+contact.address+'. \n\nBest,\nTeam Zinetgo', // plain text
                    //             html: '<b>Dear '+portfolio.name +'</b>!<br><br>You have received a new inquiry request.Please find below details '+'.<br><br>'+'From:'+' '+contact.name +'.<br>'+'Mobile:'+' ' + contact.mobile +'.<br>'+'Date:'+' '+contact.email+'.<br>'+'Address:'+' '+contact.address+'.<br><br>Best,<br>Team Zinetgo' // html body
                    //         });
                    //     }
                    //     var portfolioEmailId,portfolioSenderName;

                    //     if(portfolio.emailProvider){
                    //       portfolioEmailId= portfolio.emailProvider.auth.user;
                    //       portfolioSenderName= portfolio.emailProvider.auth.name;
                    //     }
                    //     if(!portfolioEmailId){
                    //       portfolioEmailId = portfolio.email;
                    //     }
                    //     if(!portfolioSenderName){
                    //       portfolioSenderName = portfolio.name;
                    //     }

                    //     console.log('portfolio.emailProvider: '+ portfolio.emailProvider);

                        

                    //     if(contact.email != undefined && contact.email != null){
                    //         emailService.sendEmail(portfolio.emailProvider, {
                    //             from: '"'+portfolioSenderName +'" <'+portfolioEmailId+'>', // sender message
                    //             to: contact.email, // list of receivers
                    //             subject: 'We have received your request for inquiry request', // Subject line
                    //             text: 'Dear '+contact.name +'! We have received your inquiry request '+'.\n\nBest,\n'+portfolio.name, // plain text
                    //             html: '<b>Dear '+contact.name +'</b>!<br><br>We have received your inquiry request '+'.<br><br>Best,<br>'+portfolio.name
                    //         });
                    //     }
                    // }    
                    res.json({
                        result: {'status':'success','message':'Thank you for your interest.We will contact you shortly'}
                    });
                }).error(handleError(res));
            }
        }).error(function(error){
        });
    }    
};

// update user
exports.updateContact = function (req, res) {
    Contact.get(req.body.id).update(req.body).then(function(result) {
        var user = JSON.parse(req.decoded);
        result.updatedBy =user.userId;
        result.updatedOn =r.now();
        res.json({
            result: result
        });
    }).error(handleError(res));
};

function handleError(res) {
    return function(error) {
        console.log(error.message);
        return res.send(500, {error: error.message});
    }
}
