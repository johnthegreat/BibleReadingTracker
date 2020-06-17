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

const UserProvider = require('../../controllers/lib/UserProvider');
/**
 * @type {UserProvider}
 */
const userProvider = new UserProvider();

const userChapterReadProvider = require('../../controllers/lib/UserChapterReadProvider');

/**
 * @param {Request} req
 * @param {Response} res
 */
exports.deleteAccount = async function(req,res) {
	if (!req.isAuthenticated()) {
		return req.status(401).send();
	}

	try {
		await userChapterReadProvider.deleteUserChaptersReadByUserId(req.user.id);
		await userProvider.deleteUser(req.user.id);

		req.logout();
		req.session.destroy(function(err) {
			if (err) {
				console.log('Error : Failed to destroy the session during logout.', err);
			}
			req.user = null;
			res.status(204).send();
		});
	} catch (e) {
		res.status(500).send(e);
	}
};

module.exports = exports;