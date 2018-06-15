var thinky = require(__dirname+'/../util/thinky.js'),
    r = thinky.r,
    uuid = require('node-uuid'),
    Project = require(__dirname+'/../model/project.js'),
    Portfolio = require(__dirname+'/../model/portfolio.js'),
    Media = require(__dirname+'/../model/media.js'),
    MediaService = require(__dirname+'/mediaservice.js'),
    og = require(__dirname+'/../util/og.js'),
    env = require(__dirname+'/../../env'),
    config = require(__dirname+'/../../config/'+ env.name);


    
exports.listProjects = function (req, res) {
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
        status:'active'
    }

    if(req.decoded !=undefined && req.decoded !=null){
        var tokenObject = JSON.parse(req.decoded);
        filter.createdBy = tokenObject.userId;
        Project.orderBy({index: r.desc('createdOn')}).filter(filter).getJoin({user: true}).skip(offset).limit(limit).run().then(function(projects) {
           r.table("project").filter(filter).count().run().then(function(total) {
            res.json({
                data: projects,
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
           filter.createdBy = portfolio[0].createdBy;
           Project.filter(filter).skip(offset).limit(limit).run().then(function(projectsData) {
                r.table("project").filter(filter).count().run().then(function(total) {
                res.json({
                    data: projectsData,
                    total: (total!=undefined?total:0),
                    pno: pno,
                    psize: limit
                });
            });    
            }).error(handleError(res)); 
            handleError(res);
        });    
    }
};


    // get project
    exports.getProject = function (req, res) {
        if(req.decoded !=undefined && req.decoded !=null){
            var tokenObject = JSON.parse(req.decoded);
            Project.filter({createdBy:tokenObject.userId}).run().then(function(project) {
             res.json({
                 project: project[0]
             });
            }).error(handleError(res));
        }else if(req.apikey){
            Portfolio.filter({apiKey:req.apikey}).run().then(function(project) {
             res.json({
                 project: project[0]
             });
            }).error(handleError(res));
        }else{
            return res.status(404).send({message:'not found'});
        }
    };
    
    // delete by id
    exports.deleteProject = function (req, res) {
        var id = req.params.id;
        Project.get(id).delete().run().then(function(org) {
            res.json({
                status: "success"
            });
        }).error(handleError(res));
    };
    
    // Add project
    exports.addProject = function (req, res) {
        var newProject = new Project(req.body);
        var user = JSON.parse(req.decoded);
         newProject.createdBy=user.userId;
         newProject.updatedBy =user.userId;
        newProject.updatedOn =r.now();
        newProject.save().then(function(result) {
            res.json({
                result: result
            });
        }).error(handleError(res));
    };
    
    // update project
    exports.updateProject = function (req, res) {
        var id = req.params.id;
        Project.get(id).run().then(function(result) {
            if(result){
                var user = JSON.parse(req.decoded);
                var data = req.body;
                data.updatedBy =user.userId;
                data.updatedOn =r.now();
                Project.get(result.id).update(data).then(function(port){
                    res.json({
                        result: result
                    })
                }).error(handleError(res));
            }else{
                return res.status(404).send({message:'not found'})
            }
        }).error(handleError(res));
    };

    function handleError(res) {
        return function(error) {
            console.log(error.message);
            return res.send(500, {error: error.message});
        }
    }