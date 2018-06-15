var config = {
	host: 'http://localhost:8088',
	port: 8088,
	url: 'http://api.t.onground.in',
	secret:'staging.onground.in',
	database:{
		host: 'localhost',
		port: 28015,
		db: 'thruskills'
	},
	redis: {
		url:'redis://localhost:6379'
	},
	//figure out where is this used ???
	onground:{
		apiKey: '6ec1c63b-08a6-444f-ae6e-72a97d47c079',
		orgId: 'e1377573-9016-4dd5-8e5a-458e6a663d0b',
		portfolioId: '8bfb9fab-5014-40a6-9bda-24fa2920151f'
	},
	sms:{
		msg91:{
			authKey: 'A246dd73a132fa2fbb3efa51dae759b2e',
			senderId: 'ZNETGO',
			defaultRoute: 4
		}
	},
	smtp:{
		senderName:'zinetgo',
		gmail:{
		    host: 'smtp.gmail.com',
		    port: 465,
		    secure: true,
		    auth: {
		        user: 'support@zinetgo.com',
		        pass: 'support@123'
		    }
		}
	},


	
	media:{
		upload:{
			to: 's3', // or 'local-fs'
			s3:{
				bucket: 'qa.zinetgo.com',
				secretAccessKey: 'MVXol3v/qEGZmSc1roQWJ5kSeNWIabQO/Ejq9jah',
				accessKeyId: 'AKIAIL6LFSSYCADP65EQ',
				region: 'ap-south-1',
				accessUrl: 'https://s3.ap-south-1.amazonaws.com/qa.zinetgo.com'
			},
			local:{
				path: '/home/mnegi/bb/hurreh/api/uploads',
				accessPath: '/uploads'
			}
		}
	}
};

module.exports = config;
