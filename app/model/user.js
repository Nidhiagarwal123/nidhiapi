// Import
var thinky = require(__dirname+'/../util/thinky.js'),
    r = thinky.r,
    type = thinky.type;


var User = thinky.createModel('user', {
    id: type.string(),
    mobile: type.number().integer().min(1000000000).max(9999999999).required(),
    password: type.string(),
    createdOn: type.date().default(r.now),
    createdBy: type.string(),
    updatedBy: type.string(),
    updatedOn: type.date(),
    email: type.string().email(),
    emailValidated: type.boolean(),
    verificationToken: type.string(),
    name: type.string(),
    dob:type.date(),
    address:type.string(),
    profileImage:type.string(),
    referralCode: type.string(),
    status: type.string().enum(["active", "inactive","approval pending","suspended"]).required().default("active")
});

module.exports = User;


var Portfolio = require(__dirname+'/portfolio.js');
User.hasMany(Portfolio, "portfolio", "id", "userId");


User.pre('save', function(next) {
    User.filter({mobile:parseInt(this.mobile),portfolioId:this.portfolioId}).run().then(function(result) {
        if(result.length > 0){
            next(new Error("Mobile already registered."));
        }else{
            next();
        }
    });
});