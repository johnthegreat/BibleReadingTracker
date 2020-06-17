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
const { Strategy: LocalStrategy } = require('passport-local');
const bcrypt = require('bcrypt');
const UserProvider = require('../controllers/lib/UserProvider');

/**
 *
 * @type {UserProvider}
 */
const userProvider = new UserProvider();

passport.serializeUser(function(user, done) {
	done(null, user.id);
});

passport.deserializeUser(function(id, done) {
	userProvider.getUserById(id).then(function (user) {
		done(null, user);
	}).catch(function (err) {
		done(err, null);
	});
});

/**
 * Sign in using Username and Password.
 */
passport.use(new LocalStrategy({ usernameField: 'username' }, (username, password, done) => {
	userProvider.getUserByUsername(username).then(function(user) {
		if (!user) {
			return done(null, false, { msg: `Username ${username} not found.` });
		}

		bcrypt.compare(password, user.password, function(err, isMatch) {
			if (err) { return done(err); }
			if (isMatch) {
				return done(null, user);
			}
			return done(null, false, { msg: 'Invalid username or password.' });
		});
	}).catch(function(err) {
		done(err);
	});
}));

/**
 * Login Required middleware.
 */
exports.isAuthenticated = (req, res, next) => {
	if (req.isAuthenticated()) {
		return next();
	}
	res.redirect('/account/login');
};