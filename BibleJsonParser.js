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

const fs = require('fs');
const _ = require('lodash');

const dir = __dirname + "/data/KJV/";

const BibleJsonParser = function() {};

BibleJsonParser.prototype.getBooks = function() {
    return JSON.parse(fs.readFileSync(dir + 'Books.json').toString());
}

BibleJsonParser.prototype.loadAllBooks = function() {
    let files = fs.readdirSync(dir).sort();
    files = _.without(files,'Books.json','LICENSE','README.md');

    let booksByName = {};
    for(let i=0;i<files.length;i++) {
        let file = files[i];
        let bookObj = JSON.parse(fs.readFileSync(dir + file, {
            encoding: 'UTF-8'
        }).toString());
        booksByName[bookObj['book']] = bookObj;
    }
    return booksByName;
};
module.exports = BibleJsonParser;
