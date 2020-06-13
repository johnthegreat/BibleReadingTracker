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

const BibleJsonParser = require('./BibleJsonParser');
const bibleJsonParser = new BibleJsonParser();

// Possibly a good use for Redis?
let booksArray = [];
let booksByName = {};

booksArray = bibleJsonParser.getBooks();
booksByName = bibleJsonParser.loadAllBooks();

const BibleDataRepository = function() {};
BibleDataRepository.prototype.getBooks = function() {
    return booksArray;
}
BibleDataRepository.prototype.getBookByName = function(bookName) {
    return booksByName[bookName];
};
BibleDataRepository.prototype.getNumberOfChaptersInBook = function(bookName) {
    return booksByName[bookName]['chapters'].length;
}
BibleDataRepository.prototype.getBookChapter = function(bookName,chapterNumber) {
    return _.first(_.filter(booksByName[bookName]['chapters'],{ "chapter": ""+chapterNumber }));
}

const bibleDataRepository = new BibleDataRepository();
module.exports = bibleDataRepository;