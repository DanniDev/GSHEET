import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import axios from 'axios';
import nodemailer from 'nodemailer';

const app = express();

// init env vars
dotenv.config();

//middlewares
app.use(express.json());
app.use(morgan('dev'));



const PORT = process.env.PORT || 5000;

app.get('*', function (req, res) {
	return res.redirect('https://www.google.com/');
});

// RECEIVED CLOSE CRM POST WEBHOOK REQUEST
//CLOSE WEBHOOK POST ENDPOINT
app.post('/textnow', async (req, res) => {
	console.log('CLOSE CRM WEBHOOK POST REQUEST ===>');
	// GET THE DATA OR THE INFO OF THE SMS FROM THE CLOSE CRM WEBHOOK
	const { event } = req.body;
	const { local_phone_formatted, contact_id, lead_id, text } = event.data;

	// CHECK TO SEE IF IT'S SMS INBOUND
	if (event.data.direction !== 'inbound') {
		console.log('OUTBOUND ALERT');
		return res.end();
	}

	// CHECK IF IT CAME FROM EXISTING LEAD
	if (lead_id && event.data.direction === 'inbound') {
		// FETCH THE LEAD THE SMS CAME FROM
		const response = await axios.get(
			`https://api.close.com/api/v1/lead/${lead_id}`,
			{
				headers: {
					Accept: 'application/json',
				},
				auth: {
					username: process.env.API_KEY,
				},
			}
		);

		// GET THE DATA FROM THE LEAD FETCH RESPONSE
		const { data: result } = response;

		// GET THE LEAD NAME AND CONTACTS OF THE LEAD
		const { contacts } = result;

		// LOOP THROUGH THE CONTACTS FOR THE LEAD CONTACT OR SENDER
		const contact = await contacts.find((contact) => contact.id === contact_id);

		// FORWARD LEAD TEXT TO CLIENT AS SMS
		// const config = {
		// 	headers: {
		// 		'Content-Type': 'application/json',
		// 	},
		// };

		// const { data } = await axios.get(
		// 	`https://sms.arkesel.com/sms/api?action=send-sms&api_key=${process.env.SMS_KEY}&to=17702035144&from=LEAD&sms=LEAD NAME : ${result.name}%0aCONTACT : ${contact.name}%0aPHONE : ${contact.phones[0].phone}%0aMESSAGE : ${text}`,
		// 	config
		// );

		// console.log('LEAD ARKESEL SMS => ', data);

		// CONST FROG SMS API
		const config = {
			headers: {
				'Content-Type': 'application/json',
			},
		};

		const payload = {
			username: 'dannyDesign',
			password: '@Service111',
			senderid: 'LEAD',
			destinations: [
				{
					destination: '17702035144',
					msgid: 101, //client's transaction id
				},
			],
			message: `LEAD NAME : ${result.name}\nCONTACT : ${contact.name}\nPHONE : ${contact.phones[0].phone}\nMESSAGE : ${text}`,
			service: 'SMS', //(SMS | EMAIL | VOICE)
			smstype: 'text', //optional. Use only for SMS (text | flash)
		};

		const { data } = await axios.post(
			'https://frog.wigal.com.gh/api/v2/sendmsg',
			payload,
			config
		);

		console.log('FROG LEAD SMS => ', data);

		// MAILING SMTP CONFIGUATION
		const transporter = nodemailer.createTransport({
			host: 'server233.web-hosting.com',
			port: 465,
			secure: true, // true for 465, false for other ports
			auth: {
				user: 'info@merkadobarkada.com', // your domain email address
				pass: process.env.USER_PASS, // your password
			},
		});

		// MAIL SENDER OPTIONS
		const mailOptions = {
			from: '"Zap-Alike Server" <info@merkadobarkada.com>', // sender address (who sends)
			to: ['dr4lyf@gmail.com', 'aandrfamilyhousing@gmail.com'], // list of receivers (who receives)
			subject: `New Sms from ${result.name}`, // Subject line
			text: `LEAD NAME : ${result.name}\nCONTACT : ${contact.name}\nPHONE : ${contact.phones[0].phone}\nMESSAGE : ${text}`, // plaintext body
			// html: template,
		};

		// // SEND THE MAIL
		await transporter.sendMail(mailOptions, (error, response) => {
			error ? console.log(error) : console.log(response);
			transporter.close();
		});

		return res.end();
	}
	if (!lead_id || lead_id === undefined) {
		if (event.data.direction === 'inbound') {
			// FORWARD LEAD TEXT TO CLIENT AS SMS
			// const config = {
			// 	headers: {
			// 		'Content-Type': 'application/json',
			// 	},
			// };

			// const { data } = await axios.get(
			// 	`https://sms.arkesel.com/sms/api?action=send-sms&api_key=${process.env.SMS_KEY}&to=17702035144&from=LEAD&sms=LEAD NAME : Not Assigned%0aCONTACT : Not Set%0aPHONE : ${event.data.remote_phone}%0aMESSAGE : ${text}`,
			// 	config
			// );

			//FROG SMS
			const config = {
				headers: {
					'Content-Type': 'application/json',
				},
			};

			const payload = {
				username: 'dannyDesign',
				password: '@Service111',
				senderid: 'LEAD',
				destinations: [
					{
						destination: '17702035144',
						msgid: 101, //client's transaction id
					},
				],
				message: `LEAD NAME : Not Assigned\nCONTACT : Not Set\nPHONE : ${event.data.remote_phone}\nMESSAGE : ${text}`,
				service: 'SMS', //(SMS | EMAIL | VOICE)
				smstype: 'text', //optional. Use only for SMS (text | flash)
			};

			const { data } = await axios.post(
				'https://frog.wigal.com.gh/api/v2/sendmsg',
				payload,
				config
			);

			console.log('FROG UNLEAD SMS => ', data);

			// MAILING SMTP CONFIGUATION
			const transporter = nodemailer.createTransport({
				host: 'server233.web-hosting.com',
				port: 465,
				secure: true, // true for 465, false for other ports
				auth: {
					user: 'info@merkadobarkada.com', // your domain email address
					pass: process.env.USER_PASS, // your password
				},
			});

			// MAIL SENDER OPTIONS
			const mailOptions = {
				from: '"Zap-Alike Server" <info@merkadobarkada.com>', // sender address (who sends)
				to: ['dr4lyf@gmail.com', 'aandrfamilyhousing@gmail.com'], // list of receivers (who receives)
				subject: `New Sms from not assigned lead`, // Subject line
				text: `LEAD NAME : Not Assigned\nCONTACT : Not Set\nPHONE : ${event.data.remote_phone}\nMESSAGE : ${text}`, // plain text body
				// html: template,
			};

			// SEND THE MAIL
			await transporter.sendMail(mailOptions, (error, response) => {
				error ? console.log(error) : console.log(response);
				transporter.close();
			});

			return res.end();
		}
	}
});

app.listen(PORT, () =>
	console.log(
		`Server running on port ${PORT} in ${process.env.NODE_ENV} mode...`
	)
);
