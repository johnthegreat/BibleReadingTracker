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
	userProvider.getUserByUsername(user.username).then(function (existingUser) {
		if (existingUser) {
			req.flash('errors', {msg: 'Account with that username already exists.'});
			return res.redirect('/account/register');
		}

		hashPassword(user.password).then(function (hash) {
			user.password = hash;
			let createUserPromise = userProvider.createUser(user);
			createUserPromise.then(function (user) {
				req.logIn(user, function(err) {
					if (err) {
						return next(err);
					}
					res.redirect('/');
				});
			});
			createUserPromise.catch(function (err) {
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
	req.user.name = req.body['name'];
	req.user.username = req.body['username'];
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
	if (_.isEmpty(req.body['password'])) {
		error = 'You must provide a password.';
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
	} catch (e) {
		req.flash('error', { msg: e });
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