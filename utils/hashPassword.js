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

const bcrypt = require('bcrypt');

const numRounds = process.env.BCRYPT_ROUNDS || 10;

const hashPassword = function(password) {
	return new Promise(function(resolve, reject) {
		bcrypt.genSalt(numRounds, (err, salt) => {
			if (err) {
				reject(err);
				return;
			}

			bcrypt.hash(password, salt, (err, hash) => {
				if (err) {
					reject(err);
					return;
				}
				resolve(hash);
			});
		});
	});
};
module.exports = hashPassword;
