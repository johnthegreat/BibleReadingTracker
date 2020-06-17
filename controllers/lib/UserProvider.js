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

const User = require('../../models/User');

const UserProvider = function() {};
const userProvider = new UserProvider();

UserProvider.prototype.getUsers = function() {
	return new Promise(function(resolve, reject) {
		db.serialize(function() {
			db.exec("SELECT * FROM `users` ORDER BY `name` ASC",function(err,records) {
				if (err) {
					reject(err);
					return;
				}

				resolve(_.map(records,function(record) {
					return User.prototype.create(record);
				}));
			});
		});
	});
};

/**
 *
 * @param {User} user
 * @return {Promise<User>}
 */
UserProvider.prototype.createUser = function(user) {
	return new Promise(function(resolve, reject) {
		let query = "INSERT INTO `users` (`name`, `username`, `password`) VALUES (?,?,?)";
		let values = [user.name,user.username,user.password];
		db.run(query,values,function(err) {
			if (err) {
				reject(err);
				return;
			}

			let insertId = this.lastID;
			userProvider.getUserById(insertId).then(function(user) {
				resolve(user);
			}).catch(function(err) {
				reject(err);
			});
		});
	});
};

/**
 *
 * @param userId
 * @return {Promise<User>}
 */
UserProvider.prototype.getUserById = function(userId) {
	return new Promise(function (resolve, reject) {
		db.all("SELECT * FROM `users` WHERE `id` = ? LIMIT 1",[userId],function(err,records) {
			if (err) {
				reject(err);
				return;
			}

			if (records.length === 0) {
				resolve(null);
				return;
			}
			resolve(User.prototype.create(_.first(records)));
		});
	});
};

UserProvider.prototype.getUserByUsername = function(username) {
	return new Promise(function (resolve, reject) {
		db.all("SELECT * FROM `users` WHERE `username` = ? LIMIT 1",[username],function(err,records) {
			if (err) {
				reject(err);
				return;
			}
			if (records.length === 0) {
				resolve(null);
				return;
			}
			resolve(User.prototype.create(_.first(records)));
		});
	});
};

UserProvider.prototype.getUserByPasswordResetToken = function(passwordResetToken) {
	return new Promise(function(resolve, reject) {
		db.query("SELECT * FROM `users` WHERE `passwordResetToken` = ?",[passwordResetToken],function(err,records) {
			if (err) {
				return reject(err);
			}
			if (records.length === 1) {
				resolve(User.prototype.create(_.first(records)));
			} else {
				resolve(null);
			}
		});
	});
};

/**
 *
 * @param {User} user
 * @return {Promise<unknown>}
 */
UserProvider.prototype.updateUser = function(user) {
	return new Promise(function(resolve, reject) {
		let query = "UPDATE `users` SET `name` = ?, `username` = ?, `password` = ?, `lastLoginDt` = ?, `passwordResetToken` = ?, `passwordResetExpires` = ? WHERE `id` = ?";
		db.run(query,[user.name,user.username,user.password,user.lastLoginDt,user.passwordResetToken,user.passwordResetExpires,user.id],function(err) {
			if (err) {
				reject(err);
				return;
			}

			userProvider.getUserById(user.id).then(function(user) {
				resolve(user);
			}).catch(function(err) {
				reject(err);
			});
		});
	});
};

UserProvider.prototype.deleteUser = function(userId) {
	return new Promise(function(resolve, reject) {
		db.run("DELETE FROM `users` WHERE `id` = ?",[userId],function(err) {
			if (err) {
				return reject(err);
			}
			resolve();
		});
	});
};

module.exports = UserProvider;
