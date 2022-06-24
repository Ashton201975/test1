const express = require('express');
const cors = require('cors');
const session = require('express-session');
const path = require('path');


const exphbs = require('express-handlebars');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const FlashMessenger = require('flash-messenger');
const passport = require('passport');

const mainRoute = require('./routes/main');

// const productRoute = require('./routes/product/product.route');
// const ingredientRoute = require('./routes/product/ingredient.route');
const userRoute = require('./routes/user');
const promotionRoute = require('./routes/promotion');
const reviewRoute = require('./routes/review');

const app = express();

app.set('view engine', 'handlebars');

const vidjotDB = require('./config/DBConnection');
vidjotDB.setUpDB(false);


const MySQLStore = require('express-mysql-session');

const db = require('./config/db'); // db.js config file

const authenticate = require('./config/passport');
authenticate.localStrategy(passport);


app.use("/static", express.static('./static/'));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));


// Body parser middleware to parse HTTP body in order to read HTTP data
app.use(bodyParser.urlencoded({
	extended: false
}));
app.use(bodyParser.json());

// Creates static folder for publicly accessible HTML, CSS and Javascript files
app.use(express.static(path.join(__dirname, 'public')));

// Method override middleware to use other HTTP methods such as PUT and DELETE
app.use(methodOverride('_method'));

// Enables session to be stored using browser's Cookie ID
app.use(cookieParser());



app.use(session({
	key: 'vidjot_session',
	secret: 'tojiv',
	store: new MySQLStore({
		host: db.host,
		port: 3306,
		user: db.username,
		password: db.password,
		database: db.database,
		clearExpired: true,
		// How frequently expired sessions will be cleared; milliseconds:
		checkExpirationInterval: 900000,
		// The maximum age of a valid session; milliseconds:
		expiration: 900000,
	}),
	resave: false,
	saveUninitialized: false,
}));


app.use(passport.initialize());
app.use(passport.session());

app.use(flash());
app.use(FlashMessenger.middleware);

app.use(function (req, res, next) {
	res.locals.success_msg = req.flash('success_msg');
	res.locals.error_msg = req.flash('error_msg');
	res.locals.error = req.flash('error');
	res.locals.user = req.user || null;
	next();
});

const {formatDate, radioCheck, replaceCommas} = require('./helpers/hbs');
const Promotion = require('./models/Promotion');


app.engine('handlebars', exphbs.engine({
	helpers: {
		formatDate: formatDate,
		radioCheck: radioCheck,
		replaceCommas: replaceCommas
	},
	defaultLayout: 'main' 
}));


app.use('/', mainRoute)
// app.use('/api/v1/products', productRoute);
// app.use('/api/v1/ingredients', ingredientRoute);
app.use('/user', userRoute);
app.use('/promotion', promotionRoute);
app.use('/review', reviewRoute)

const port = 5000;

// Starts the server and listen to port 5000
app.listen(port, () => {
	console.log(`Server started on port ${port}`);
});



