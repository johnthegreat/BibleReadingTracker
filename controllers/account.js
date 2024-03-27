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

const passport = require('passport');
const moment = require('moment');
const _ = require('lodash');

const hashPassword = require('../utils/hashPassword');
const isValidTheme = require('../utils/isValidTheme');

const User = require('../models/User');
const UserProvider = require('./lib/UserProvider');
/**
 *
 * @type {UserProvider}
 */
const userProvider = new UserProvider();

const UserAuthToken = require('../models/UserAuthToken');
const userAuthTokenProvider = require('./lib/UserAuthTokenProvider');

const MAX_PASSWORD_LENGTH = 70;

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
exports.getRegister = function(req,res) {
	res.render('account/register', {
		title: 'Bible Reading Tracker - Register'
	});
};

/**
 *
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
 */
exports.postRegister = function(req,res,next) {
	/**
	 *
	 * @type {User}
	 */
	const user = User.prototype.create(_.pick(req.body,['name','username','password']));
	if (!_.isString(user.name) || !_.isString(user.username) || !_.isString(user.password)) {
		req.flash('errors',{msg: 'Incorrect parameters.'});
		return res.redirect('/account/register');
	}

	user.name = user.name.trim();
	user.username = user.username.trim();

	if (user.name.length === 0) {
		req.flash('errors',{msg: 'Name is required.' });
		return res.redirect('/account/register');
	} else if (user.name.length > 100) {
		req.flash('errors',{msg: 'Name must not exceed 100 characters.' });
	}

	if (user.username.length === 0) {
		req.flash('errors',{msg: 'Username is required.' });
		return res.redirect('/account/register');
	} else if (user.username.length > 255) {
		// 255 is a common default length for VARCHAR columns in (My)SQL databases.
		// This may cause information leakage regarding our use of a SQL database.
		req.flash('errors',{msg: 'Username must not exceed 255 characters.'});
		return res.redirect('/account/register');
	}

	if (user.password.length === 0) {
		req.flash('errors',{msg: 'Password is required.' });
		return res.redirect('/account/register');
	} else if (user.password.length > MAX_PASSWORD_LENGTH) {
		// It's highly unlikely anyone will choose an extremely long password.
		// This may cause information leakage regarding our use of bcrypt.
		req.flash('errors',{msg: 'Password must not exceed 70 characters.' });
		return res.redirect('/account/register');
	}

	userProvider.getUserByUsername(user.username).then(function (existingUser) {
		if (existingUser) {
			req.flash('errors', {msg: 'Account with that username already exists.'});
			return res.redirect('/account/register');
		}

		hashPassword(user.password).then(function (hash) {
			user.password = hash;
			userProvider.createUser(user).then(function (user) {
				req.logIn(user, function(err) {
					if (err) {
						return next(err);
					}
					res.redirect('/');
				});
			}).catch(function (err) {
				next(err);
			});
		}).catch(function (err) {
			next(err);
		});
	}).catch(function (err) {
		next(err);
	});
};

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
exports.getLogin = function(req,res) {
	res.render('account/login', {
		title: 'Bible Reading Tracker - Login'
	});
};

/**
 *
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
 */
exports.postLogin = function(req,res,next) {
	if (!_.has(req.body,'username') || _.isEmpty(req.body.username)) {
		req.flash('errors',{msg: 'Username must not be empty.'});
		return res.redirect('/account/login');
	} else if (!_.isString(req.body.username)) {
		req.flash('errors',{msg: 'Username is not a string.'});
		return res.redirect('/account/login');
	} else if (_.isEmpty(req.body.password)) {
		req.flash('errors',{msg: 'Password must not be empty.' });
		return res.redirect('/account/login');
	} else if (!_.isString(req.body.password)) {
		req.flash('errors',{msg: 'Password must be a string.' });
		return res.redirect('/account/login');
	} else if (req.body.password.length > MAX_PASSWORD_LENGTH) {
		req.flash('errors',{msg: 'Password must not exceed 70 characters.' });
		return res.redirect('/account/login');
	}

	passport.authenticate('local', function(err, user, info) {
		if (err) {
			return next(err);
		}
		if (!user) {
			req.flash('errors', info);
			return res.redirect('/account/login');
		}

		req.logIn(user, function(err) {
			if (err) {
				return next(err);
			}

			user.lastLoginDt = moment.utc().format("YYYY-MM-DD HH:mm:ss");
			userProvider.updateUser(user).then(function () {
				req.flash('success', {msg: 'Success! You are logged in.'});
				res.redirect(req.session.returnTo || '/');
			});
		});
	})(req, res, next);
};

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
exports.getProfile = async function(req,res) {
	const userAuthTokens = await userAuthTokenProvider.getUserAuthTokensByUserId(req.user.id);
	res.render('account/profile',{
		title: 'Bible Reading Tracker - Profile',
		userAuthTokens: userAuthTokens
	});
};

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
exports.postProfile = function(req,res) {
	let changed = false;
	if (_.has(req.body,'name') && _.has(req.body,'username' )) {
		if (!_.isString(req.body['name']) || req.body['name'].trim() > 255) {
			req.flash('errors', {msg: 'Please enter a valid name.'});
			res.redirect('/account/profile');
			return;
		} else if (!_.isString(req.body['username']) || req.body['username'].trim().length > 255) {
			req.flash('errors', {msg: 'Please enter a valid username.'});
			res.redirect('/account/profile');
			return;
		}

		req.user.name = req.body['name'].trim();
		req.user.username = req.body['username'].trim();
		changed = true;
	} else if (_.has(req.body,'theme') && _.isString(req.body['theme'])) {
		const theme = req.body['theme'];
		if (_.trim(theme).length === 0) {
			// Default theme
			req.user.theme = null;
		} else if (isValidTheme(theme)) {
			req.user.theme = theme;
		}
		changed = true;
	}

	if (changed) {
		userProvider.updateUser(req.user).then(function () {
			req.flash('info', {msg: 'Your profile has been updated!'});
		}).catch(function (err) {
			console.error(err);
			req.flash('error', { msg: 'There was an error updating your profile.' });
		}).finally(function() {
			res.redirect('/account/profile');
		});
	} else {
		res.redirect('/account/profile');
	}
};

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
exports.logout = function(req,res) {
	req.logOut(function(err) {
		if (err) {
			console.log('Error : Failed to destroy the session during logout.', err);
		}
		req.user = null;
		res.redirect('/');
	});
};

exports.postPassword = async function(req,res) {
	let error = null;
	if (!_.isString(req.body['password']) || _.isEmpty(req.body['password'])) {
		error = 'You must provide a password.';
	} else if (!_.isString(req.body['confirmPassword'])) {
		error = 'You must enter the password confirmation.';
	} else if (req.body['password'] !== req.body['confirmPassword']) {
		error = 'Password and confirm password do not match.';
	}

	if (error !== null) {
		req.flash('errors', {msg: error});
		res.redirect('/account/profile');
		return;
	}

	try {
		req.user.password = await hashPassword(req.body['password']);
		await userProvider.updateUser(req.user);
		req.flash('info', {msg: 'Your password has been updated!'});
	} catch (err) {
		console.error(err);
		req.flash('error', { msg: 'There was an error updating your password.' });
	}
	res.redirect('/account/profile');
};

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
exports.getForgot = function(req,res) {
	if (req.isAuthenticated()) {
		return res.redirect('/');
	}
	res.render('account/forgot', {
		title: 'Forgot Password'
	});
};

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
exports.postForgot = function(req,res) {
	// Not Yet Implemented
	// We would need to collect the user's e-mail address at registration for this to work.
};

// GET /account/view-qr/:authTokenId
exports.viewQrCode = async function(req,res) {
	const authTokenId = req.params.authTokenId;
	if (_.isEmpty(authTokenId)) {
		return res.status(400).send();
	}
	const authToken = await userAuthTokenProvider.getUserAuthTokenById(authTokenId);
	if (authToken === null) {
		return res.status(404).send();
	}
	if (authToken.userId !== req.user.id) {
		// 404 because, even though the object exists, it belongs to another user so we should tell them it doesn't exist to not give away that it's another user's.
		return res.status(404).send();
	}
	const url = process.env.BASE_URL + '/?authToken='+authToken.authToken;

	res.render('account/view-qr',{
		authToken: authToken,
		url: url
	});
}


module.exports = exports;
