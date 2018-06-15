// Import
var uuid = require('node-uuid'),
    thinky = require(__dirname+'/../util/thinky.js'),
    r = thinky.r,
    type = thinky.type,
    User = require(__dirname+'/user.js');

var Portfolio = thinky.createModel('portfolio', {
    id: type.string(),
    name:type.string().required(),    
    userId: type.string(),
    createdOn: type.date().default(r.now()),
    createdBy: type.string(),
    updatedBy: type.string(),
    updatedOn: type.date(),
    profileImage:type.string(),
    description:type.string(),
    experience:[{position:type.string(),company_name:type.string(),work_period:type.string(),location:type.string(),description:type.string()}],
    education:[{description:type.string(),duration:type.string(),university:type.string(),course:type.string()}],
    skills:[{course_name:type.string(),experience:type.string(),description:type.string(),other_skills:type.string(),persent:type.string()}],
    status: type.string().enum(["active", "inactive"]).required().default("active"),
    number:type.string(),
    email:type.string(),
    position:type.string(),
    social: {
        linkdin:type.string(),
        google_plus:type.string(),
        github:type.string(),
        skype:type.string(),
        twitter:type.string()
    }
});

module.exports = Portfolio;
Portfolio.belongsTo(User,"user","userId","id");


Portfolio.ensureIndex("createdOn");
Portfolio.ensureIndex("name");

Portfolio.pre('save', function(next) {
    Portfolio.filter({name: this.name,userId: this.userId}).run().then(function(result) {
        if(result.length > 0){
            next(new Error("This Portfolio already in list."));
        }else{
            next();
        }
    });
});