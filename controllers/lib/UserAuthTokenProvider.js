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

const _ = require('lodash');
const db = require('./DatabaseProvider');

const UserAuthToken = require('../../models/UserAuthToken');

const UserAuthTokenProvider = function() {};
const userAuthTokenProvider = new UserAuthTokenProvider();

/**
 *
 * @param {UserAuthToken} userAuthToken
 * @return {Promise<UserAuthToken>}
 */
UserAuthTokenProvider.prototype.createUserAuthToken = function(userAuthToken) {
	return new Promise(function(resolve, reject) {
		let values = [userAuthToken.userId,userAuthToken.authToken,userAuthToken.createdAt,userAuthToken.expires];
		db.run("INSERT INTO `user_authtoken` (`userId`, `authToken`, `createdAt`, `expires`) VALUES (?,?,?,?)",values,function(err,results) {
			if (err) {
				reject(err);
				return;
			}

			let insertId = this.lastID;
			userAuthTokenProvider.getUserAuthTokenById(insertId).then(function(userApiKey) {
				resolve(userApiKey);
			}).catch(function(err) {
				reject(err);
			});
		});
	});
};

/**
 *
 * @param userApiKeyId
 * @return {Promise<UserAuthToken>}
 */
UserAuthTokenProvider.prototype.getUserAuthTokenById = function(userApiKeyId) {
	return new Promise(function(resolve, reject) {
		db.all("SELECT * FROM `user_authtoken` WHERE `id` = ?",[userApiKeyId],function(err,records) {
			if (err) {
				return reject(err);
			}

			if (records.length > 0) {
				resolve(UserAuthToken.prototype.create(_.first(records)));
			} else {
				resolve(null);
			}
		});
	});
};

/**
 *
 * @param userApiKey
 * @return {Promise<UserAuthToken>}
 */
UserAuthTokenProvider.prototype.getUserAuthTokenByKey = function(userApiKey) {
	return new Promise(function (resolve, reject) {
		db.all("SELECT * FROM `user_authtoken` WHERE `authToken` = ? LIMIT 1",[userApiKey],function(err,records) {
			if (err) {
				return reject(err);
			}

			if (records.length > 0) {
				resolve(UserAuthToken.prototype.create(_.first(records)));
				return;
			}

			resolve(null);
		});
	});
};

/**
 *
 * @param userId
 * @return {Promise<UserAuthToken[]>}
 */
UserAuthTokenProvider.prototype.getUserAuthTokensByUserId = function(userId) {
	return new Promise(function(resolve, reject) {
		db.all("SELECT * FROM `user_authtoken` WHERE `userId` = ?",[userId],function(err,records) {
			if( err) {
				return reject(err);
			}

			resolve(_.map(records,function(record) {
				return UserAuthToken.prototype.create(record);
			}));
		});
	});
};

/**
 *
 * @param userApiKeyId
 * @return {Promise<unknown>}
 */
UserAuthTokenProvider.prototype.deleteUserApiKeyById = function(userApiKeyId) {
	return new Promise(function(resolve, reject) {
		db.run("DELETE FROM `user_authtoken` WHERE `id` = ?",[userApiKeyId],function(err) {
			if (err) {
				reject(err);
				return;
			}

			resolve(null);
		});
	});
};
module.exports = userAuthTokenProvider;
