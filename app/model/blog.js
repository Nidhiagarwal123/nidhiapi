// Import
var uuid = require('node-uuid'),
    thinky = require(__dirname+'/../util/thinky.js'),
    r = thinky.r,
    type = thinky.type,
    Portfolio = require(__dirname+'/portfolio.js'),
    User = require(__dirname+'/user.js');
   

var Blog = thinky.createModel('blog', {
    id: type.string(),
    portfolioId:type.string(),
    mobile: type.number(),
    title: type.string(),
    displayTitle: type.string(),
    content: type.string(),
    approvedBy: type.string(),
    approvedOn: type.date(),
    summary: type.string(),
    categoryId: type.string(),
    profileImage:type.string(),
    //tags: type.string(),
    approvedStatus: type.string().enum(["Pending","Approved","Disapproved"]) .default('Pending'),
    pId:type.number(),
    createdOn: type.date().default(r.now),
    updatedBy: type.string(),
    updatedBy: type.string(),
    status: type.string().enum(["active", "inactive"]).required().default("active")
});

module.exports = Blog;


Blog.belongsTo(Portfolio,"portfolio","portfolioId","id");


var User =require(__dirname+'/user.js');
Blog.belongsTo(User,"user","createdBy","id");

// var Tag = require(__dirname+'/tag.js');
// Blog.hasAndBelongsToMany(Tag, "tags", "id", "id")

Blog.ensureIndex("createdOn");
Blog.ensureIndex("title");
Blog.ensureIndex("pId");

