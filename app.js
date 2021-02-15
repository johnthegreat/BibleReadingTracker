/*
 * BibleReadingTracker - Bible reading tracker web application
 * Copyright (C) 2020 John Nahlen
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

const createError = require('http-errors');
const express = require('express');
const session = require('express-session');
const _ = require('lodash');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const helmet = require('helmet');
const dotenv = require('dotenv');
const passport = require('passport');
const sqlite3 = require('sqlite3');
const flash = require('express-flash');
const lusca = require('lusca');

const sqliteStoreFactory = require('express-session-sqlite').default;
const SqliteStore = new sqliteStoreFactory(session);

/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.config({ path: '.env' });

// Helpers
const getThemeUrl = require('./utils/getThemeUrl');
const hbs = require('hbs');
hbs.registerPartials(__dirname + '/views/partials');
// https://github.com/pillarjs/hbs
require('handlebars-helpers')({
	handlebars: hbs.handlebars
});

const app = express();
app.use(helmet());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.disable('x-powered-by');

const sqliteStoreOptions = {
	// Database library to use. Any library is fine as long as the API is compatible
	// with sqlite3, such as sqlite3-offline
	driver: sqlite3.Database,
	path: process.env.SQLITE_DB_PATH,
	// Session TTL in milliseconds
	ttl: 604800000, // one week
};

app.use(session({
	store: new SqliteStore(sqliteStoreOptions),
	resave: false,
	saveUninitialized: false,
	secret: process.env.SESSION_SECRET,
	cookie: { maxAge: 604800000 } // one week
}));

app.use(flash());
app.use((req, res, next) => {
  if (req.path.indexOf('/account') === 0) {
	  lusca.csrf()(req, res, next);
	  return;
  }
  next();
});
app.use(lusca.xframe('SAMEORIGIN'));
app.use(lusca.hsts({ maxAge: 31536000 }));
app.use(lusca.xssProtection(true));
app.use(lusca.nosniff());
app.use(lusca.referrerPolicy('same-origin'));

/**
 * API keys and Passport configuration.
 */
const passportConfig = require('./config/passport');

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
	res.locals.user = req.user;
	next();
});
app.use((req, res, next) => {
	// After successful login, redirect back to the intended page
	if (!req.user
		&& req.path !== '/account/login'
		&& req.path !== '/account/register'
		&& !req.path.match(/^\/auth/)
		&& !req.path.match(/\./)
		&& !req.path.match(/^\/api/)) {
		req.session.returnTo = req.originalUrl;
	} else if (req.user && (req.path === '/account')) {
		req.session.returnTo = req.originalUrl;
	}
	next();
});

const cacheControlMiddleware = function (req, res, next) {
	res.setHeader("Cache-Control", "public, max-age=2592000");
	res.setHeader("Expires", new Date(Date.now() + 2592000000).toUTCString());
	next();
};
app.get('/js/*', cacheControlMiddleware);
app.get('/css/*', cacheControlMiddleware);
app.get('/api/books',cacheControlMiddleware);

app.use(function setThemeUrl(req,res,next) {
	// Themes only applies to views
	if (req.path.startsWith('/api')) {
		next();
		return;
	}

	// If we wanted to set a default theme, this would be the place to do it.
	// ...

	// Check if this user has a theme preference.
	if (req.user && req.user.theme) {
		const themeUrl = getThemeUrl(req.user.theme);
		if (themeUrl !== null) {
			// The user has chosen a custom theme, use it instead.
			res.locals.themeUrl = themeUrl;
		}
	}
	next();
});

const homeController = require('./controllers/home');
app.get('/',homeController.getHome);

const aboutController = require('./controllers/about');
app.get('/about',aboutController.getAbout);

const accountController = require('./controllers/account');
//
// Public Routes
//
app.get('/account/register',accountController.getRegister);
app.post('/account/register',accountController.postRegister);
app.get('/account/login',accountController.getLogin);
app.post('/account/login',accountController.postLogin);
//app.get('/account/forgot',accountController.getForgot);
//app.post('/account/forgot',accountController.postForgot);

//
// Authenticated Routes
//
app.get('/account/profile',passportConfig.isAuthenticated,accountController.getProfile);
app.post('/account/profile',passportConfig.isAuthenticated,accountController.postProfile);
app.post('/account/password',passportConfig.isAuthenticated,accountController.postPassword);
app.get('/account/logout',passportConfig.isAuthenticated,accountController.logout);

//
// Api Routes
//
(function() {
	const booksApiController = require('./controllers/api/books');
	app.get('/api/books',booksApiController.getBooks);

	const userChapterReadApiController = require('./controllers/api/user_chapter_read');
	app.get('/api/chapter_read',passportConfig.isAuthenticated,userChapterReadApiController.getUserChaptersRead);
	app.put('/api/chapter_read',passportConfig.isAuthenticated,userChapterReadApiController.markAsRead);
	app.delete('/api/chapter_read',passportConfig.isAuthenticated,userChapterReadApiController.markAsUnread);

	const accountApiController = require('./controllers/api/account');
	app.delete('/api/account',passportConfig.isAuthenticated,accountApiController.deleteAccount);
})();

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error');
});

module.exports = app;
