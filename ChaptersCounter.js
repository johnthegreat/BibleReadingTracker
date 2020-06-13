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

const bibleDataRepository = require('./BibleDataRepository');
let books = bibleDataRepository.getBooks();
console.log(books);

let totalChapters = 0;
for(let i=0;i<books.length;i++) {
    let book = books[i];
    let numChapters = bibleDataRepository.getNumberOfChaptersInBook(book);
    console.log(book + "\t" + numChapters);
    totalChapters += numChapters;
}
console.log("Total Chapters\t" + totalChapters);