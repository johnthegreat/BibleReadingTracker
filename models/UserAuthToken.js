/*
 * BibleReadingTracker - Bible reading tracker web application
 * Copyright (C) 2021 John Nahlen
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

const UserAuthToken = function() {
	this.id = null;
	this.userId = null;
	this.authToken = null;
	this.createdAt = null;
	this.expires = null;
};
UserAuthToken.prototype.create = function(obj) {
	if (!obj) {
		return null;
	}

	let userApiKey = new UserAuthToken();
	userApiKey.id = obj['id'] ? obj['id'] : null;
	userApiKey.userId = obj['userId'] ? obj['userId'] : null;
	userApiKey.authToken = obj['authToken'] ? obj['authToken'] : null;
	userApiKey.createdAt = obj['createdAt'] ? obj['createdAt'] : null;
	userApiKey.expires = obj['expires'] ? obj['expires'] : null;
	return userApiKey;
};
module.exports = UserAuthToken;
