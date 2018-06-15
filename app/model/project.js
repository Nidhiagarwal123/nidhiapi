// Import
var uuid = require('node-uuid'),
    thinky = require(__dirname+'/../util/thinky.js'),
    r = thinky.r,
    type = thinky.type,
    Portfolio = require(__dirname+'/portfolio.js');

var Project = thinky.createModel('project', {
    id: type.string(),
    name: type.string(),
    description :type.string(),
    repository :type.string(),
    profileImage:type.string(),
    technology:type.string(),
    type: type.string().enum(["frontend", "backend"]),
    status: type.string().enum(["active", "inactive"]),
    number:type.string(),
    email:type.string(),
    position:type.string()

});


module.exports = Project;
Project.ensureIndex("createdOn");
Project.ensureIndex("name");