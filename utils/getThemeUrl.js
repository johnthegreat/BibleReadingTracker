/*
 * BibleReadingTracker - Bible reading tracker web application
 * Copyright (c) 2021 John Nahlen
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

// https://bootswatch.com/4/
const themes = require('../data/themes.json');

/**
 *
 * @param {string} themeName
 * @return {null|*}
 */
const getThemeUrl = function(themeName) {
	const foundThemes = _.filter(themes,function(theme) {
		return theme['name'] === themeName;
	});
	if (foundThemes.length > 0) {
		const foundTheme = _.first(foundThemes);
		return foundTheme['url'];
	}
	return null;
};

module.exports = getThemeUrl;
