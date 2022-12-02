import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import fs from 'fs';

const app = express();

// init env vars
dotenv.config();

//middlewares
app.use(express.json());
app.use(morgan('dev'));

// Initialize the sheet - doc ID is the long id in the sheets URL
const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID);

const CREDENTIALS = JSON.parse(fs.readFileSync('service.json'));

// Initialize Auth - see https://theoephraim.github.io/node-google-spreadsheet/#/getting-started/authentication
await doc.useServiceAccountAuth({
	// env var values are copied from service account credentials generated by google
	// see "Authentication" section in docs for more info
	client_email: CREDENTIALS.client_email,
	private_key: CREDENTIALS.private_key,
});

await doc.loadInfo(); // loads document properties and worksheets

// work sheets
const userListSheet = doc.sheetsById[653500459];
const savedListsSheet = doc.sheetsById[2043897244];
const mainListSheet = doc.sheetsById[420019327];

const addRow = async () => {
	const newUser = {
		Email: 'dan@gmail.com',
		Name: 'Daniel',
		'User Rec ID': '1234',
	};
	const userRow = await userListSheet.addRow(newUser);
	console.log(userRow);
};

addRow();

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) =>
	res.send(
		'<h1 style="padding: 50px 20px; text-align: center">G-Sheet is connected to Softr</h1>'
	)
);

app.post('/saved-list', (req, res) => {
	console.log('received request from softr');
	const body = req.body;
	console.log(body);
});

app.listen(PORT, () =>
	console.log(
		`Server running on port ${PORT} in ${process.env.NODE_ENV} mode...`
	)
);
