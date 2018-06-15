// Import
var thinky = require(__dirname+'/../util/thinky.js'),
    r = thinky.r,
    type = thinky.type;


var Media = thinky.createModel('media', {
    id: type.string(),
    imageCredit: type.string(),
    url:  type.string(),
    profileImage:type.string()
});

module.exports = Media;
