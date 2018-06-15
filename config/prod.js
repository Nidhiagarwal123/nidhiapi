var config = {
	port: 8088,
	url: 'https://api.zinetgo.com',
	secret:'zinetgo.com',

	database:{
		host: '35.154.97.96',
		port: 28015,
		db: 'api'
	},
	redis: {
		url:'redis://35.154.143.92:6379'
	},
	onground:{
		apiKey: '6ec1c63b-08a6-444f-ae6e-72a97d47c079', 
		orgId: 'e1377573-9016-4dd5-8e5a-458e6a663d0b',
		portfolioId: 'aef44bac-a05e-4b75-bd88-470395ec9bbc'
	},
	sms:{
		msg91:{
			authKey: '655f3fc946bebe14ee5379e3bb421ef88a634be2',
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
				path: '/home/ec2-user/api/uploads',
				accessPath: '/uploads'
			}
		}
	}
};





module.exports = config;

