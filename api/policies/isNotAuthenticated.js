/*
 * isNotAuthenticated.js  :
 * Copyright (C) 2016  Hugo ALLIAUME Benjamin CHAZELLE Marc-Antoine FERNANDES
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

var passport = require('passport');

module.exports = function (req, res, next) {

    if (req.isSocket) {
        if (req.session && req.session.passport && !req.session.passport.user) {

            // Initialize Passport
            passport.initialize()(req, res, function () {
                // Use the built-in sessions
                passport.session()(req, res, function () {

                    req.session.user = req.session.passport.user;
                    return next();
                });
            });
        } else {
            return res.json(401);
        }

    } else {
        if (!req.isAuthenticated()) return next();

        return res.redirect('/');
    }
};