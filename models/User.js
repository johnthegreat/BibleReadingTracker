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

const User = function() {
	this.id = null;
	this.name = null;
	this.username = null;
	this.password = null;
	this.lastLoginDt = null;
	this.passwordResetToken = null;
	this.passwordResetExpires = null;
};
User.prototype.create = function(obj) {
	if (!obj) {
		return null;
	}
	
	let user = new User();
	user.id = obj['id'] ? obj['id'] : null;
	user.name = obj['name'] ? obj['name'] : null;
	user.username = obj['username'] ? obj['username'] : null;
	user.password = obj['password'] ? obj['password'] : null;
	user.lastLoginDt = obj['lastLoginDt'] ? obj['lastLoginDt'] : null;
	user.passwordResetToken = obj['passwordResetToken'] ? obj['passwordResetToken'] : null;
	user.passwordResetExpires = obj['passwordResetExpires'] ? obj['passwordResetExpires'] : null;
	return user;
};
module.exports = User;
