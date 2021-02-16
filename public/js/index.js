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

let markChapterAsRead = function(chapter) {
	'use strict';
	return new Promise(function(resolve, reject) {
		$.ajax({
			method: 'put',
			url: '/api/chapter_read',
			data: {
				chapter: chapter
			},
			success: resolve,
			error: reject
		});
	});
};

let markChapterAsUnread = function(chapter) {
	'use strict';
	return new Promise(function(resolve, reject) {
		$.ajax({
			method: 'delete',
			url: '/api/chapter_read',
			data: {
				chapter: chapter
			},
			success: resolve,
			error: reject
		});
	});
};

let getBooks = function() {
	'use strict';
	return new Promise(function(resolve, reject) {
		$.ajax({
			method: 'get',
			url: '/api/books',
			success: resolve,
			error: reject
		});
	});
};

let getChaptersRead = function() {
	'use strict';
	return new Promise(function(resolve, reject) {
		$.ajax({
			method: 'get',
			url: '/api/chapter_read',
			success: resolve,
			error: reject
		});
	});
};
