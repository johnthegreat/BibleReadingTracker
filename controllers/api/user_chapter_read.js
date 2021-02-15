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
const moment = require('moment');

const UserChapterRead = require('../../models/UserChapterRead');
const userChapterReadProvider = require('../lib/UserChapterReadProvider');

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
exports.getUserChaptersRead = async function(req,res) {
	try {
		let userChaptersRead = await userChapterReadProvider.getChaptersReadByUser(req.user['id']);
		res.status(200).send(userChaptersRead);
	} catch (err) {
		console.error(err);
		res.status(500).send('Internal Error');
	}
}

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
exports.markAsRead = function(req,res) {
	if (_.isEmpty(req.query['chapter']) || !_.isString(req.query['chapter'])) {
		res.status(400).send();
		return;
	} else if (req.query['chapter'].length > 45) {
		res.status(400).send();
		return;
	}

	let userChapterRead = new UserChapterRead();
	userChapterRead.userId = req.user.id;
	userChapterRead.chapter = req.query['chapter'];
	userChapterRead.lastReadDate = moment.utc().format('YYYY-MM-DD');
	userChapterReadProvider.createOrUpdateChapterRead(userChapterRead).then(function(_userChapterRead) {
		res.status(200).send(_userChapterRead);
	}).catch(function(err) {
		console.error(err);
		res.status(500).send('Internal Error');
	});
};

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
exports.markAsUnread = async function(req,res) {
	if (_.isEmpty(req.query['chapter']) || !_.isString(req.query['chapter'])) {
		res.status(400).send();
		return;
	} else if (req.query['chapter'].length > 45) {
		res.status(400).send();
		return;
	}

	let chapter = req.query['chapter'];
	try {
		let userChapterRead = await userChapterReadProvider.getUserChapterReadByUniqueKey(req.user.id, chapter);
		if (userChapterRead !== null) {
			await userChapterReadProvider.deleteUserChapterRead(userChapterRead.id);
			res.status(204).send();
		} else {
			res.status(404).send();
		}
	} catch (err) {
		console.error(err);
		res.status(500).send('Internal Error');
	}
};

module.exports = exports;