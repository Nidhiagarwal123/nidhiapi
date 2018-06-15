// Import
var uuid = require('node-uuid'),
    thinky = require(__dirname+'/../util/thinky.js'),
    r = thinky.r,
    type = thinky.type,
    Portfolio = require(__dirname+'/portfolio.js');

var Contact = thinky.createModel('contact', {
    id: type.string(),
    portfolioId:type.string(),
    name: type.string().required(),
    mobile:type.number().required(),
    email:type.string(),
    address:type.string(),
    message: type.string(),
    customerId: type.string(),
    description:type.string(),
    status: type.string().enum(["active", "inactive"]).required().default("active")
});

module.exports = Contact;

Contact.ensureIndex("createdOn");
// unique key on portfolio id & mobile number

Contact.belongsTo(Portfolio,"portfolio","portfolioId","id");
