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

const _ = require('lodash');
const db = require('./DatabaseProvider');

const UserChapterRead = require('../../models/UserChapterRead');

const UserChapterReadProvider = function() {};
const userChapterReadProvider = new UserChapterReadProvider();

UserChapterReadProvider.prototype.getChaptersReadByUser = function(userId) {
	return new Promise(function(resolve, reject) {
		db.all('SELECT * FROM `user_chapter_read` WHERE `userId` = ?',[userId],function(err,records) {
			if (err) {
				reject(err);
				return;
			}

			resolve(_.map(records,UserChapterRead.prototype.create));
		});
	});
};

UserChapterReadProvider.prototype.getUserChapterReadByUniqueKey = function(userId,chapter) {
	return new Promise(function(resolve, reject) {
		db.all('SELECT * FROM `user_chapter_read` WHERE `userId` = ? AND `chapter` = ?',[userId,chapter],function(err,records) {
			if (err) {
				reject(err);
				return;
			}

			if (records.length === 0) {
				resolve(null);
				return;
			}

			resolve(UserChapterRead.prototype.create(_.first(records)));
		});
	});
};

/**
 *
 * @param {UserChapterRead} userChapterRead
 * @returns {Promise<unknown>}
 */
UserChapterReadProvider.prototype.createOrUpdateChapterRead = function(userChapterRead) {
	return new Promise(function(resolve, reject) {
		db.run('INSERT INTO `user_chapter_read` (userId, chapter, lastReadDate) VALUES (?,?,?) ON CONFLICT(userId,chapter) DO UPDATE SET `lastReadDate` = ?',
			[userChapterRead.userId,userChapterRead.chapter,userChapterRead.lastReadDate,userChapterRead.lastReadDate],function(err) {
				if (err) {
					reject(err);
					return;
				}

				userChapterReadProvider.getUserChapterReadByUniqueKey(userChapterRead.userId,userChapterRead.chapter).then(function(_userChapterRead) {
					resolve(_userChapterRead);
				}).catch(function(err) {
					reject(err);
				});
			});
	});
};

UserChapterReadProvider.prototype.deleteUserChapterRead = function(userChapterReadId) {
	return new Promise(function(resolve, reject) {
		db.run('DELETE FROM `user_chapter_read` WHERE `id` = ?',[userChapterReadId],function(err) {
			if (err) {
				reject(err);
				return;
			}

			resolve();
		});
	});
};

UserChapterReadProvider.prototype.deleteUserChaptersReadByUserId = function(userId) {
	return new Promise(function(resolve, reject) {
		db.run('DELETE FROM `user_chapter_read` WHERE `userId` = ?',[userId],function(err) {
			if (err) {
				return reject(err);
			}
			resolve();
		});
	});
};

module.exports = userChapterReadProvider;