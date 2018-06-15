var thinky = require(__dirname+'/../util/thinky.js'),
    og = require(__dirname+'/../util/og.js'),
    r = thinky.r,
    Media = require(__dirname+'/../model/media.js'),
   
    env = require(__dirname+'/../../env'),
    config = require(__dirname+'/../../config/'+ env.name),
    fs = require('fs'),
    mkdirp = require('mkdirp'),
    s3 = require('s3'),
    // this is just to fix a bug in s3 module
    //https://github.com/andrewrk/node-s3-client/issues/69
    AWS = require('aws-sdk');


exports.listMedias = function (req, res) {
    var count;
    var pno=1,offset=0,limit=10;

    if(req.query.psize != undefined && req.query.psize != null && !isNaN(req.query.psize)){
        limit = parseInt(req.query.psize);
    }

    if(req.query.pno != undefined && req.query.pno != null && !isNaN(req.query.pno)){
       pno =  parseInt(req.query.pno);
    }

    offset = (pno -1) * limit;

    var token = req.body.token || req.query.token || req.headers['x-access-token'];
  //  var tokenObject = JSON.parse(req.decoded);


    var filter={
        status : 'active'
    }
    if(req.query.forId !=null || req.query.forId !=undefined){
        filter.forId = req.query.forId;
    }
    if(req.decoded !=undefined && req.decoded !=null){
        var tokenObject = JSON.parse(req.decoded);
        filter.portfolioId =tokenObject.portfolioId;
        Media.orderBy({index: r.desc('createdOn')}).filter(filter).getJoin({item :true,category: true}).skip(offset).limit(limit).run().then(function(items) {
            Media.filter(filter).count().execute().then(function(total) {
                var count = total;
                res.json({
                    data: items,
                    total: count,
                    pno: pno,
                    psize: limit
                });
            }).error(handleError(res));
        }).error(handleError(res));
    }else{
        var apiKey = req.apikey ;
        UserProfile.filter({apiKey: apiKey}).run().then(function(portfolio){
            if(portfolio && portfolio.length >0){
                var portId = portfolio[0].portfolioId;
                filter.portfolioId = portId
                console.log("filter="+JSON.stringify(filter));
                Media.orderBy({index: r.desc('createdOn')}).filter(filter).hasFields('forId','coverImage').getJoin({item :true,category: true}).skip(offset).limit(limit).run().then(function(items) {
                    Media.filter(filter).hasFields('forId','coverImage').count().execute().then(function(total) {
                        var count = total;
                        res.json({
                            data: items,
                            total: count,
                            pno: pno,
                            psize: limit
                        });
                    }).error(handleError(res));
                }).error(handleError(res));

            }else{
                res.status(500).send({ message: 'Invalid API key'});
            }
        }).error(handleError(res));
    }
};

// Add media
exports.addMedia = function (req, res, mediaFor) {
    var forId = req.params.id;

    if (!req.files || forId == undefined) {
        res.status(500).send({error: 'Invalid media upload inputs.'});
        return;
    }

    var tokenData = JSON.parse(req.decoded);
    var file = req.files['files[]'];

    var obj = new Object();
    obj.name = file.name;
    obj.mime = file.mimetype;
    obj.forId = forId;
    obj.userId = tokenData.userId;
    obj.updatedBy =  tokenData.userId;
    obj.portfolioId = tokenData.portfolioId;
    obj.centerId = tokenData.centerId;
    obj.updatedOn = r.now();
    
    var newMedia = new Media(obj);
    if(config.media.upload.to == 'local'){
        this.uploadLocal(file,newMedia,res);
    }else{
        this.uploadS3(file,newMedia,res);
    }
};

exports.uploadMedia = function(file, mediaId, callback){
    if(config.media.upload.to == 'local'){
        var dir = og.getMediaPath(mediaId);
        mkdirp(dir, function (err) {
            if (err) {
                callback({error: err.message}, null);
            }else{
                file.mv( dir + '/' + file.name, function(err) {
                    if (err) {
                        callback({error: err.message}, null);
                    }
                    else {
                        callback(null, {success: 'media uploaded', mediaId: mediaId});
                    }
                });
            }
        });
    }else{
        var awsS3Client = new AWS.S3({
            endpoint: 's3.ap-south-1.amazonaws.com',
            signatureVersion: 'v4',
            region: 'ap-south-1',
            accessKeyId: config.media.upload.s3.accessKeyId,
            secretAccessKey: config.media.upload.s3.secretAccessKey
        });

        var client = s3.createClient({
          s3Client: awsS3Client
        });

        client.maxAsyncS3= 20;
        client.s3RetryCount = 3;
        client.s3RetryDelay = 1000;
        client.multipartUploadThreshold = 20971520;
        client.multipartUploadSize = 15728640;

        var dir = 'media/'+ og.getIdPath(mediaId) + '/' + file.name;
        file.mv( config.media.upload.local.path + '/' + file.name, function(err) {
            if (err) {
                console.log('----- err--'+JSON.stringify(err));
                //return {error: 'Internal server error'};
                callback({error: err.message}, null);
            }else {
                console.log('----- no err');
                 var params = {
                  localFile: config.media.upload.local.path + '/' + file.name,
                  s3Params: {
                    Bucket: config.media.upload.s3.bucket,
                    Key: dir,
                    ACL: 'public-read'
                    // other options supported by putObject, except Body and ContentLength.
                    // See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#putObject-property
                  }
                };

                var uploader = client.uploadFile(params);
                uploader.on('error', function(err) {
                    console.log('file -- '+ file);
                    console.log('error --- > '+ err);
                    fs.unlink(config.media.upload.local.path + '/' + file.name, (err) => {
                      if (err)  callback({error: err.message}, null);//return {error: 'Internal server error'};

                    });
                    return {error: err.message};
                });
                uploader.on('progress', function() {

                    console.log('in progress----------');
                  // console.log("progress", uploader.progressMd5Amount,
                  //           uploader.progressAmount, uploader.progressTotal);
                });
                uploader.on('end', function() {

                    fs.unlink(config.media.upload.local.path + '/' + file.name, (err) => {
                       if (err)  callback({error: err.message}, null);//return {error: err.message};
                    });
                    callback(null,{success: 'uploaded successfully', mediaId: mediaId});
                });
            }
        });

    }
};

exports.uploadPdf = function(file, mediaId, callback){
    if(config.media.upload.to == 'local'){
        var dir = og.getMediaPath(mediaId);
        mkdirp(dir, function (err) {
            if (err) {
                callback({error: err.message}, null);
            }else{
                file.mv( dir + '/' + file.name, function(err) {
                    if (err) {
                        callback({error: err.message}, null);
                    }
                    else {
                        callback(null, {success: 'media uploaded', mediaId: mediaId});
                    }
                });
            }
        });
    }else{
        var awsS3Client = new AWS.S3({
            endpoint: 's3.ap-south-1.amazonaws.com',
            signatureVersion: 'v4',
            region: 'ap-south-1',
            accessKeyId: config.media.upload.s3.accessKeyId,
            secretAccessKey: config.media.upload.s3.secretAccessKey
        });

        var client = s3.createClient({
          s3Client: awsS3Client
        });

        client.maxAsyncS3= 20;
        client.s3RetryCount = 3;
        client.s3RetryDelay = 1000;
        client.multipartUploadThreshold = 20971520;
        client.multipartUploadSize = 15728640;

        var dir = 'media/' + file.name;
         var params = {
          localFile: config.media.upload.local.path + '/' + file.name,
          s3Params: {
            Bucket: config.media.upload.s3.bucket,
            Key: dir,
            ACL: 'public-read'
            // other options supported by putObject, except Body and ContentLength.
            // See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#putObject-property
          }
        };

        var uploader = client.uploadFile(params);
        uploader.on('error', function(err) {
            console.log('file -- '+ file);
            console.log('error --- > '+ err);
            fs.unlink(config.media.upload.local.path + '/' + file.name, (err) => {
              if (err)  callback({error: err.message}, null);//return {error: 'Internal server error'};

            });
            return {error: err.message};
        });
        uploader.on('progress', function() {

            console.log('in progress----------');
          
        });
        uploader.on('end', function() {

            fs.unlink(config.media.upload.local.path + '/' + file.name, (err) => {
               if (err)  callback({error: err.message}, null);//return {error: err.message};
            });
            callback(null,{success: 'uploaded successfully', mediaId: mediaId});

        });

    }
};

exports.uploadLocal = function(file,newMedia,res){
    newMedia.save().then(function(result) {
        var dir = og.getMediaPath(result.id);
        mkdirp(dir, function (err) {
            if (err) {
                console.error(err);
                res.status(500).send({error: err.message});

            }else{
                file.mv( dir + '/' + file.name, function(err) {
                    if (err) {
                        res.status(500).send({error: err.message});
                    }
                    else {
                        var uploadedFiles = [{
                            url: og.getMediaAcceesPath(result.id)+ '/' + file.name,
                            thumbnailUrl: og.getMediaAcceesPath(result.id) + '/' + file.name,
                            name: result.name,
                            type: result.mime,
                            size: result.size,
                            deleteUrl: '/media/'+result.id,
                            deleteType: 'DELETE'
                        }];

                        res.json({
                            files: uploadedFiles,
                            media: result
                        });
                    }
                });
            }
        });
    }).error(handleError(res));
};

exports.uploadS3 = function(file,newMedia,res){
    var awsS3Client = new AWS.S3({
        endpoint: 's3.ap-south-1.amazonaws.com',
        signatureVersion: 'v4',
        region: 'ap-south-1',
        accessKeyId: config.media.upload.s3.accessKeyId,
        secretAccessKey: config.media.upload.s3.secretAccessKey
    });

    var client = s3.createClient({
      s3Client: awsS3Client
    });

    client.maxAsyncS3= 20;
    client.s3RetryCount = 3;
    client.s3RetryDelay = 1000;
    client.multipartUploadThreshold = 20971520;
    client.multipartUploadSize = 15728640;

    newMedia.save().then(function(result) {
        var dir = 'media/'+ og.getIdPath(result.id) + '/' + file.name;
        file.mv( config.media.upload.local.path + '/' + file.name, function(err) {
            if (err) {
                res.status(500).send({error: 'Internal server error'});
            }
            else {
                 var params = {
                  localFile: config.media.upload.local.path + '/' + file.name,
                  s3Params: {
                    Bucket: config.media.upload.s3.bucket,
                    Key: dir,
                    ACL: 'public-read'
                    // other options supported by putObject, except Body and ContentLength.
                    // See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#putObject-property
                  }
                };

                var uploader = client.uploadFile(params);
                uploader.on('error', function(err) {
                    console.log('file -- '+ file);
                    console.log('error --- > '+ err);
                    fs.unlink(config.media.upload.local.path + '/' + file.name, (err) => {
                      if (err) return res.send(500, {error: 'Internal server error'});
                    });
                    return res.status(500).send({error: err.message})
                });
                uploader.on('progress', function() {
                  // console.log("progress", uploader.progressMd5Amount,
                  //           uploader.progressAmount, uploader.progressTotal);
                });
                uploader.on('end', function() {
                    fs.unlink(config.media.upload.local.path + '/' + file.name, (err) => {
                       if (err) return res.status(500).send({error: err.message});
                    });

                    console.log('config.media.upload.s3.accessUrl --> '+ config.media.upload.s3.accessUrl);
                    var uploadedFiles = [{
                        url: config.media.upload.s3.accessUrl + '/media/' + og.getIdPath(result.id)+ '/' + file.name,
                        thumbnailUrl: config.media.upload.s3.accessUrl + '/media/' + og.getIdPath(result.id)+ '/' + file.name,
                        name: result.name,
                        type: result.mime,
                        size: result.size,
                        deleteUrl: '/media/'+result.id,
                        deleteType: 'DELETE'
                    }];
                    Media.get(result.id).update({coverImage:uploadedFiles[0].url}).run().then(function(mediaresult){
                        console.log(uploadedFiles[0].url);
                        res.json({
                            files: uploadedFiles,
                            media: mediaresult
                        });
                    });   

                });
            }
        });
    }).error(handleError(res));
};

function handleError(res) {
    return function(error) {
        console.log('kkkk-->');
        console.log(error.message);
        //return res.send(500, {error: error.message});
        return res.status(500).send({error: err.message})
    }
}
