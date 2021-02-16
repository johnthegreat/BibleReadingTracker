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
const moment = require('moment');
const crypto = require("crypto");

const UserAuthToken = require('../../models/UserAuthToken');
const userAuthTokenProvider = require('../lib/UserAuthTokenProvider');

// https://stackoverflow.com/questions/6984139/how-can-i-get-the-sha1-hash-of-a-string-in-node-js
const sha1 = function(data) {
	return crypto.createHash("sha1").update(data).digest("hex");
}

const MAX_ALLOWED_USER_AUTH_TOKENS = 1;

/**
 * Returns an authToken guaranteed to be unique (ensures no records have this authToken in the database)
 *
 * @returns {Promise<string>}
 */
const generateUniqueAuthToken = async function() {
	let authToken;
	let foundUnique = false;
	do {
		// Note: sha1 returns a string exactly 40 characters long.
		authToken = sha1(crypto.randomBytes(32));
		let userAuthToken = await userAuthTokenProvider.getUserAuthTokenByKey(authToken);
		if (userAuthToken === null) {
			foundUnique = true;
		}
	} while (!foundUnique);
	return authToken;

};

const apiFieldsToOmit = ['userId'];

/**
 * GET /api/authToken
 *
 * @param {Request} req
 * @param {Response} res
 * @return {Promise<void>}
 */
exports.index = async function(req,res) {
	try {
		let userApiKeys = await userAuthTokenProvider.getUserAuthTokensByUserId(req.user.id);
		userApiKeys = _.map(userApiKeys, function (userApiKey) {
			return _.omit(userApiKey, apiFieldsToOmit);
		});
		res.status(200).send(userApiKeys);
	} catch (e) {
		console.error(e);
		res.status(500).send('Internal Error');
	}
};

/**
 * POST /api/authToken
 *
 * @param {Request} req
 * @param {Response} res
 * @return {Promise<void>}
 */
exports.create = async function(req,res) {
	try {
		let existingUserAuthTokens = await userAuthTokenProvider.getUserAuthTokensByUserId(req.user.id);
		if (existingUserAuthTokens.length >= MAX_ALLOWED_USER_AUTH_TOKENS) {
			res.status(400).send({ message: 'Limit reached, you can\'t create any more.' });
			return;
		}

		let userAuthToken = new UserAuthToken();
		userAuthToken.userId = req.user.id;
		userAuthToken.authToken = await generateUniqueAuthToken();
		userAuthToken.createdAt = moment.utc().format('YYYY-MM-DD HH:mm:ss');
		userAuthToken.expires = moment.utc().add(1,'month').endOf('month').format('YYYY-MM-DD HH:mm:ss');
		userAuthToken = await userAuthTokenProvider.createUserAuthToken(userAuthToken);
		res.status(201).send(_.omit(userAuthToken,apiFieldsToOmit));
	} catch (e) {
		console.error(e);
		res.status(500).send('Internal Error');
	}
};

/**
 * DELETE /api/userAuthToken/:userAuthTokenId
 * @param {Request} req
 * @param {Response} res
 * @return {Promise<void>}
 */
exports.delete = async function(req,res) {
	try {
		let userAuthTokenId = parseInt(req.params.userAuthTokenId);
		if (isNaN(userAuthTokenId)) {
			res.status(400).send();
			return;
		}

		const userAuthTokens = await userAuthTokenProvider.getUserAuthTokensByUserId(req.user.id);
		const userOwnsAuthTokenId = (_.filter(userAuthTokens,function(userAuthToken) {
			return userAuthToken.id === userAuthTokenId
		})).length > 0;
		if (userOwnsAuthTokenId) {
			await userAuthTokenProvider.deleteUserApiKeyById(userAuthTokenId);
			res.status(204).send();
		} else {
			res.status(400).send();
		}
	} catch (e) {
		console.error(e);
		res.status(500).send('Internal Error');
	}
};
