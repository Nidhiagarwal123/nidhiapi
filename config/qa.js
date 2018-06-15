var config = {
	port: 8088,
	url: 'http://52.66.140.144',
	secret:'qa.zinetgo.com',

	database:{
		host: '52.66.157.199',
		port: 28015,
		db: 'api'
	},
	redis: {
		url:'redis://52.66.93.218:6379'
	},
	onground:{
		apiKey: '6ec1c63b-08a6-444f-ae6e-72a97d47c079',
		orgId: 'e1377573-9016-4dd5-8e5a-458e6a663d0b',
		portfolioId: 'aef44bac-a05e-4b75-bd88-470395ec9bbc'
	},
	sms:{
		msg91:{
			authKey: 'A246dd73a132fa2fbb3efa51dae759b2e',
			senderId: 'ZNETGO',
			defaultRoute: 4
		}
	},
	smtp:{
		senderName:'zinetgo support',
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
