var env 		= require(__dirname+'/env'),
    config 		= require(__dirname+'/config/'+ env.name),
    express     = require('express'),
    app         = express(),
    bodyParser  = require('body-parser'),
    morgan      = require('morgan'),
    jwt    		= require('jsonwebtoken'),
    apiRoutes 	= express.Router(),
    fileUpload = require('express-fileupload'),
    redis = require('redis'),
    redis_cli = redis.createClient(config.redis),
    compress = require('compression'),
    log = require('./app/middleware/logger'),
    errorhandler = require('./app/middleware/errorHandler'),
    accesscontrol = require('./app/middleware/accessController');
    //var cron = require('./app/service/cronJob');

var cors = require('cors')

var userService = require(__dirname+'/app/service/userservice'),
    blogService = require(__dirname+'/app/service/blogservice'),
    portfolioService = require(__dirname+'/app/service/portfolioservice'),
    contactService = require(__dirname+'/app/service/contactservice'),
    projectservice = require(__dirname+'/app/service/projectservice');
   



var port = process.env.PORT || config.port || 8088;
app.set('superSecret', config.secret);

//Enable GZIP       
app.use(compress());

//app.use(log.log);

// use body parser so we can get info from POST and/or URL parameters
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


//file upload
app.use(fileUpload());
apiRoutes.use(function(req, res, next) {
	var token = req.body.token || req.query.token || req.headers['x-access-token'];
    var apiKey = req.body.apikey || req.query.apikey || req.headers['x-api-key'];
    // console.log("apiKey=="+apiKey);
    // console.log("apiKey=="+token);
    if (token) {
        redis_cli.get(token, function(err, reply) {
            if (reply && reply != null) {
                req.decoded = reply;
                next();
            } else {
                console.log('doesn\'t exist');
                return (errorhandler.inValid(res));
            }
        });
    }else if(apiKey){
        //validate the API and get the portfolio object from that key
        req.apikey = apiKey;
        next();

    }else{
        return (errorhandler.unAuthorised(res));
    }
});


app.use(cors());


app.use('/api', apiRoutes);
//app.use(accesscontrol.access);

// routes
// basic route
app.get('/', function(req, res) {
    res.send('API is up and running!! at http://localhost:' + port + '/api');
});

app.route('/login').post(userService.login);
// app.route('/signUp').post(userService.signUp);

// BLOG API ROUTES
app.route('/api/blog').post(blogService.addBlog);
app.route('/api/blog/:id').put(blogService.updateBlog);
app.route('/api/blog/:uName').get(blogService.getBlog);
app.route('/api/blog/:id').delete(blogService.deleteBlog);
app.route('/api/blogs').get(blogService.listBlogs);
app.route('/api/breaking-news').get(blogService.listBreakingBlogs);
app.route('/api/blogs/:id').get(blogService.listBlogs);


// PORTFOLIO API ROUTES
app.route('/api/portfolio').post(portfolioService.addPortfolio);
app.route('/api/portfolio/:id').put(portfolioService.updatePortfolio);
app.route('/api/portfolio').get(portfolioService.getPortfolio);
app.route('/api/portfolio/:id').delete(portfolioService.deletePortfolio);
//app.route('/api/portfolios').get(portfolioService.listPortfolios);

//PROJECT API ROUTES
app.route('/api/project').post(projectservice.addProject);
app.route('/api/project').put(projectservice.updateProject);
app.route('/api/project/:id').get(projectservice.getProject);
app.route('/api/project/:id').delete(projectservice.deleteProject);
app.route('/api/projects').get(projectservice.listProjects);


// CONTACT API ROUTES
app.route('/api/contact').put(contactService.updateContact);
app.route('/api/contact/:id').get(contactService.getContact);
app.route('/api/contact/:id').delete(contactService.deleteContact);
app.route('/api/contacts').get(contactService.listContacts);
app.route('/contactUs/:key').post(contactService.addExternalContact);
app.route('/contactUs/:key').get(contactService.addExternalContact);
//PROJECT API ROUTES
// app.route('api/project').post(projectservice.getProject);

//app.use(log.log);
app.use(errorhandler.notFound);
app.use(errorhandler.error);
app.use(errorhandler.unAuthorised);


// start the server
app.listen(port);
console.log('API server is up and running');
