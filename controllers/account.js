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

const User = require('../models/User');
const UserProvider = require('./lib/UserProvider');
/**
 *
 * @type {UserProvider}
 */
const userProvider = new UserProvider();

const MAX_PASSWORD_LENGTH = 70;

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
exports.getRegister = function(req,res) {
	res.render('account/register', {
		title: 'Register'
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
		title: 'Login'
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
exports.getProfile = function(req,res) {
	res.render('account/profile',{
		title: 'Profile'
	});
};

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
exports.postProfile = function(req,res) {
	if (!_.isString(req.body['name']) && req.body['name'].trim() > 255) {
		return req.flash('errors',{msg: 'Please enter a valid name.' });
	} else if (!_.isString(req.body['username']) || req.body['username'].trim().length > 255) {
		return req.flash('errors',{msg: 'Please enter a valid username.' });
	}

	req.user.name = req.body['name'].trim();
	req.user.username = req.body['username'].trim();
	userProvider.updateUser(req.user).then(function() {
		res.redirect('/account/profile');
	}).catch(function(err) {
		res.redirect('/account/profile');
	});
};

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
exports.logout = function(req,res) {
	req.logout();
	req.session.destroy((err) => {
		if (err) console.log('Error : Failed to destroy the session during logout.', err);
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

module.exports = exports;
