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

const UserChapterRead = function() {
	this.id = null;
	this.userId = null;
	this.chapter = null;
	this.lastReadDate = null;
};
UserChapterRead.prototype.create = function(obj) {
	if (!obj) {
		return null;
	}

	let userChapterRead = new UserChapterRead();
	userChapterRead.id = obj['id'] ? obj['id'] : null;
	userChapterRead.userId = obj['userId'] ? obj['userId'] : null;
	userChapterRead.chapter = obj['chapter'] ? obj['chapter'] : null;
	userChapterRead.lastReadDate = obj['lastReadDate'] ? obj['lastReadDate'] : null;
	return userChapterRead;
}
module.exports = UserChapterRead;