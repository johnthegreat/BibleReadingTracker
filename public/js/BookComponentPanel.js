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

function BookComponentPanel(opts) {
	'use strict';
	opts = _.extend({
		book: 'Book Name',
		chapters: 1,
		myChaptersRead: []
	},opts);

	let bookTemplate = Handlebars.compile($('#bookComponentTemplate').html());
	this.element = $(bookTemplate({ book: opts['book'], uniq: _.uniqueId('_') }));

	let $chapterEl = $('#bookComponentChapterTemplate').clone();
	$chapterEl.removeAttr('id');
	let template = Handlebars.compile($chapterEl.html());
	for(let i=0;i<opts['chapters'];i++) {
		let chapterName = opts['book'] + ' ' + (i+1);
		let lastRead = '';
		let checked = false;

		let _filteredChaptersRead = _.filter(opts.myChaptersRead,{ chapter: chapterName });
		if (_filteredChaptersRead.length > 0) {
			let _filteredChapter = _.first(_filteredChaptersRead);
			lastRead = moment.utc(_filteredChapter['lastReadDate'],'YYYY-MM-DD').format('MM/DD/YYYY');
			checked = true;
		}
		this.element.find('div.list-group').append(template({ chapterName: chapterName, checked: checked, lastRead: lastRead }));
	}

	this.element.on('change','label input[type="checkbox"]',function(e) {
		let $checkbox = $(e.target);
		let $label = $checkbox.closest('label');
		let checked = $checkbox.is(':checked');

		let chapter = $label.text().trim();
		if (checked) {
			//$label.parent().find('div.last-read').text('06/06/2020');
			markChapterAsRead(chapter).then(function(chapterRead) {
				$label.parent().find('div.last-read').text(moment.utc(chapterRead.lastReadDate,'YYYY-MM-DD').format('MM/DD/YYYY'));
			});
		} else {
			markChapterAsUnread(chapter).then(function() {
				$label.parent().find('div.last-read').text('');
			});
		}
	});

	this.element.on('show.bs.collapse',function(e) {
		const $iconEl = this.element.find('i[data-role="icon"]');
		$iconEl.removeClass('fa-chevron-down').addClass('fa-chevron-up');
	}.bind(this));

	this.element.on('hide.bs.collapse',function() {
		const $iconEl = this.element.find('i[data-role="icon"]');
		$iconEl.removeClass('fa-chevron-up').addClass('fa-chevron-down');
	}.bind(this));

	return this;
}
