var thinky = require(__dirname+'/../util/thinky.js'),
    r = thinky.r,
    Blog = require(__dirname+'/../model/blog.js'),
    Portfolio = require(__dirname+'/../model/portfolio.js'),
    User = require(__dirname+'/../model/user.js'),
    env         = require(__dirname+'/../../env'),
    config      = require(__dirname+'/../../config/' + env.name);
  
  
   
// list blogs
// TODO: all filter, page size and offset, columns, sort

exports.listBlogs = function (req, res) {
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
    var filter ={
        status: 'active'
    }
    
    var input =req.query.q;
    if(input && input!=null&& input!=''){
    var q1 ="(?i)"+input;
    }else{
        var q1 ='';
    }

    var categoryId = req.query.categoryId;
    if(categoryId && categoryId !=null){
        filter.categoryId = categoryId;
    }
    var uName = req.params.id;

    if(req.query.fromDate && req.query.toDate && req.query.fromDate !=null && req.query.toDate !=null && req.query.toDate !='' && req.query.fromDate !=''){
        var fromDate = new Date(new Date(req.query.fromDate).setHours(0,0,0,0));
        var toDate = new Date(new Date(req.query.toDate).setHours(0,0,0,0));
        toDate.setDate(toDate.getDate()+1);

        
        frm=Date.parse(fromDate);
        to=Date.parse(toDate);

        var fDate=fromDate.getDate();
        var fYear=fromDate.getFullYear();
        var fMonth=fromDate.getMonth() + 1;
        if(frm==to){
            var ttDate=toDate.getDate();
            var tYear=toDate.getFullYear();
            var tMonth=toDate.getMonth() + 1; 
        }else{
            var ttDate=toDate.getDate();
            var tYear=toDate.getFullYear();
            var tMonth=toDate.getMonth() + 1;  
        }
    }


    if(req.decoded !=undefined && req.decoded !=null){
        var tokenObject = JSON.parse(req.decoded);
        if(fromDate !=undefined && toDate !=undefined && fromDate !=null && toDate !=null && !isNaN(fromDate) && !isNaN(toDate) && toDate !='' && fromDate !=''){
            
            Blog.orderBy({index: r.desc('createdOn')}).filter(filter).getJoin({category: true,user: true}).filter(function(doc){
                            return doc('title').match(q1).default(false).
            or(doc('name').match(q1).default(false));}).filter(r.row('createdOn').during(r.time(fYear, fMonth, fDate,"Z"), r.time(tYear, tMonth, ttDate,"Z"), {leftBound: "closed",rightBound: "closed"})).skip(offset).limit(limit).run().then(function(blogs) {

                r.table("blog").filter(filter).filter(function(doc){
                        return doc('title').match(q1).default(false).
            or(doc('name').match(q1).default(false));}).filter(r.row('createdOn').during(r.time(fYear, fMonth, fDate,"Z"), r.time(tYear, tMonth, ttDate,"Z"), {leftBound: "closed",rightBound: "closed"})).count().run().then(function(total) {
                res.json({
                    data: blogs,
                    total: (total!=undefined?total:0),
                    pno: pno,
                    psize: limit
                });
            });
            }).error(handleError(res)); 
                handleError(res);
        }else{
           
            Blog.orderBy({index: r.desc('createdOn')}).filter(filter).getJoin({category: true,user: true}).filter(function(doc){
                    return doc('title').match(q1).default(false).
            or(doc('name').match(q1).default(false));}).skip(offset).limit(limit).run().then(function(blogs) {

                r.table("blog").filter(filter).filter(function(doc){
                        return doc('title').match(q1).default(false).
            or(doc('name').match(q1).default(false));}).count().run().then(function(total) {
                res.json({
                    data: blogs,
                    total: (total!=undefined?total:0),
                    pno: pno,
                    psize: limit
                });
            });
            }).error(handleError(res)); 
                handleError(res);
        }
    }else{
        var apiKey = req.apikey ;
        Portfolio.filter({apiKey: apiKey}).run().then(function(portfolio){
            if(portfolio && portfolio.length >0){
                var portId = portfolio[0].id;
                filter.createdBy =  portfolio[0].createdBy;
                filter.approvedStatus ='Approved';
                // console.log("filter="+JSON.stringify(filter));
                    Blog.orderBy({index: r.desc('createdOn')}).filter(filter).getJoin({user: true }).skip(offset).limit(limit).run().then(function(blogs) {
                        r.table("blog").filter(filter).count().run().then(function(total) {
                            res.json({
                                data: blogs,
                                total: (total!=undefined?total:0),
                                pno: pno,
                                psize: limit
                            });
                        });
                    }).error(handleError(res)); 
                    handleError(res);
            }else{
                res.status(404).send({ error: 'Not Found' });
            }
        });    
    } 
};

exports.listBreakingBlogs = function (req, res) {
    var count;
    var pno=1,offset=0,limit=5;
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
    var filter ={
        status: 'active',
        isBreakingNews:true
    }
    
    var categoryId = req.query.categoryId;
    console.log("category"+categoryId);
    if(categoryId && categoryId !=null){
        filter.categoryId = categoryId;
    }
    console.log("filter="+JSON.stringify(filter));
    var uName = req.params.id;
    console.log(uName);
    if(req.decoded !=undefined && req.decoded !=null){
        var tokenObject = JSON.parse(req.decoded);
        filter.portfolioId =tokenObject.portfolioId;
        if(tokenObject.roles.indexOf('Author')>-1){
            filter.createdBy=tokenObject.userId;
        }
        if(uName && uName !=null){
            BlogCategory.filter({portfolioId:tokenObject.portfolioId ,uName: uName}).run().then(function(category){
                if(category && category.length>0){
                    var categoryId =category[0].id;
                    filter.categoryId =categoryId;
                    Blog.orderBy({index: r.desc('createdOn')}).filter(filter).skip(offset).limit(limit).run().then(function(blogs) {
                        r.table("blog").filter(filter).count().run().then(function(total) {
                            res.json({
                                data: blogs,
                                total: (total!=undefined?total:0),
                                pno: pno,
                                psize: limit
                            });
                        });
                    }).error(handleError(res)); 
                     handleError(res);
                }else{
                    res.status(404).send({ error: 'Not Found' });
                }
            })
        }else{
            Blog.orderBy({index: r.desc('createdOn')}).filter(filter).skip(offset).limit(limit).run().then(function(blogs) {
                r.table("blog").filter(filter).count().run().then(function(total) {
                    res.json({
                        data: blogs,
                        total: (total!=undefined?total:0),
                        pno: pno,
                        psize: limit
                    });
                });
            }).error(handleError(res)); 
            handleError(res);
        }
    }else{
        var apiKey = req.apikey ;
        Portfolio.filter({apiKey: apiKey}).run().then(function(portfolio){
            if(portfolio && portfolio.length >0){

                var portId = portfolio[0].id;
                filter.portfolioId = portId;
                filter.approvedStatus ='Approved';
                console.log("filter="+JSON.stringify(filter));
                if(uName && uName !=null){
                    BlogCategory.filter({portfolioId:portId,uName: uName}).run().then(function(category){
                        if(category && category.length>0){
                            var categoryId =category[0].id;
                            filter.categoryId =categoryId;
                            console.log("cat id=========="+categoryId);
                            JSON.stringify(filter);
                            Blog.orderBy({index: r.desc('createdOn')}).filter(filter).pluck('id','title','uName').skip(offset).limit(limit).run().then(function(blogs) {
                                r.table("blog").filter(filter).count().run().then(function(total) {
                                    res.json({
                                        data: blogs,
                                        total: (total!=undefined?total:0),
                                        pno: pno,
                                        psize: limit
                                    });
                                });
                            }).error(handleError(res)); 
                            handleError(res);
                        }else{
                            res.status(404).send({ error: 'Not Found' });
                        }
                    })
                }else{
                    Blog.orderBy({index: r.desc('createdOn')}).filter(filter).pluck('id','title','uName').skip(offset).limit(limit).run().then(function(blogs) {
                        r.table("blog").filter(filter).count().run().then(function(total) {
                            res.json({
                                data: blogs,
                                total: (total!=undefined?total:0),
                                pno: pno,
                                psize: limit
                            });
                        });
                    }).error(handleError(res)); 
                    handleError(res);
                }
            }else{
                res.status(404).send({ error: 'Not Found' });
            }
        });    
    } 
};
// get by uname 
exports.getBlog = function (req, res) {
    var uName = req.params.uName;
    if(req.decoded){
        var user = JSON.parse(req.decoded);
        Blog.filter({uName :uName}).getJoin({category: true,tags: true,user: true }).run().then(function(blog) {
            if (blog && blog.length>0) {
                console.log(blog[0].createdBy === user.userId);
                console.log(blog[0].createdBy);
                console.log(user.userId);
                if(blog[0].createdBy === user.userId || user.roles.indexOf('admin')>-1 || user.roles.indexOf('Editor')>-1){
                     res.json({
                        data: blog[0]
                    });
                }else{
                    res.status(401).send({ error: 'Do not have permission' });
                }
            }else {
                Blog.get(uName).getJoin({category: true,tags: true,user: true }).run().then(function(blog) {
                    if(blog && blog != null){
                        console.log(blog.createdBy === user.userId);
                        console.log(blog.createdBy);
                        console.log(user.userId);
                        if(blog.createdBy === user.userId || user.roles.indexOf('admin')>-1 || user.roles.indexOf('Editor')>-1){
                             res.json({
                                data: blog
                            });
                        }else{
                            res.status(401).send({ error: 'Do not have permission' });
                        }
                    }else {
                        return res.status(404).send({ error: 'Not Found' });
                    }
                    
                }).error(handleError(res));
            }
        }).error(handleError(res));
    }else{
        var apiKey = req.apikey ;
        var filter ={
            status: 'active',
            uName: uName,
            approvedStatus :'Approved'
        }
        var filter1 ={
            status: 'active',
            id: uName,
            approvedStatus :'Approved'
        }
        Portfolio.filter({apiKey: apiKey}).run().then(function(portfolio){
            if(portfolio && portfolio.length >0){
                var portId = portfolio[0].id;
                filter.portfolioId = portId;
                console.log("filter="+JSON.stringify(filter));
                Blog.filter(filter).getJoin({category: true,tags: true,user: true }).run().then(function(blog) {
                    if (blog && blog.length>0) {
                         res.json({
                            data: blog[0]
                        });
                    }else {
                        Blog.filter(filter1).getJoin({category: true,tags: true,user: true }).run().then(function(blog) {
                            if(blog && blog.length>0){
                                 res.json({
                                     data: blog[0]
                                });
                            }else {
                                return res.status(404).send({ error: 'Not Found' });
                            }
                        }).error(handleError(res));
                    }
                }).error(handleError(res));
            }
        }).error(handleError(res));
    }
};

// delete by id
exports.deleteBlog = function (req, res) {
    var id = req.params.id;
    var user = JSON.parse(req.decoded);
     Blog.get(id).run().then(function(deal) {
        if(deal.createdBy === user.userId || user.roles.indexOf('admin')>-1){
            Blog.get(id).delete().run().then(function(blog) {
                 res.json({
                    status: "success"
                });
            }).error(handleError(res));
        }else{
            res.status(401).send({ error: 'Do not have permission' });
        }
    }).error(handleError(res));
};

// Add user
exports.addBlog = function (req, res) {
    var newBlog = new Blog(req.body);
    var user = JSON.parse(req.decoded);
    newBlog.createdBy =user.userId;
    newBlog.updatedBy=user.userId;
    newBlog.createdOn=r.now();
    newBlog.updatedOn=r.now();
    newBlog.tags = req.body.tags;
    newBlog.uName = req.body.title.toLowerCase().split(' ').join('-');
    Blog.orderBy({index: r.desc('pId')}).filter({createdBy: user.userId}).run().then(function(blog){
        if (blog && blog.length>0) {
            blogs=blog[0];
            newBlog.pId = blogs.pId + 1;
        }else{
            newBlog.pId = 1;
        } 
        newBlog.saveAll({ tags: true}).then(function(result) {
            res.json({
                result: result
            });   
        }).error(handleError(res));
    }).error(handleError(res));
    handleError(res);
};

// update user
exports.updateBlog = function (req, res) {
    var blg = new Blog(req.body);
    var user = JSON.parse(req.decoded);
    blg.updatedBy =user.userId;
    blg.updatedOn =r.now();
    Blog.get(req.params.id).update(blg).then(function(result) {
        console.log(JSON.stringify(result));
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
