/*
 * User.js  :
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

var crypto = require('crypto');
var Validator = require('validatorjs');

module.exports = {

    tableName: 'User',

    attributes: {
        //===== ATTRIBUTES =====//

        display_name: {
            type: 'string'
        },

        provider: {
            type: 'string'
        },

        ext_id: {
            type: 'string'
        },

        img_url: {
            type: 'string'
        },

        mail: {
            type: 'email',
            unique: true,
            size: 254
        },

        password: {
            type: 'string',
            size: 64
        },


        //===== FOREIGN KEYS =====//

        messages: {
            collection: 'message',
            via: 'owner'
        },

        mindmaps: {
            collection: 'mindmap',
            via: 'owner'
        },

        nodes: {
            collection: 'node',
            via: 'owner'
        },

        styles: {
            collection: 'style',
            via: 'owner'
        },

        permissions: {
            collection: 'permission',
            via: 'user'
        },

        members: {
            collection: 'member',
            via: 'user'
        }
    },


    signup: function (inputs, cb) {

        var validator = new Validator(inputs, {
            firstname: 'required|min:3',
            lastname: 'required|min:3',
            mail: 'required|email',
            password: 'required|min:6',
            password_confirmation: 'required|same:password'
        });

        if (validator.fails()) {
            return cb(validator.errors.errors);
        }

        // TODO Add image profile link
        User.create({
                display_name: inputs.firstname.trim() + ' ' + inputs.lastname.trim(),
                mail: inputs.mail.trim(),
                password: crypto.createHash('sha256').update("N'importeQuoi..." + crypto.createHash('sha256')
                        .update(inputs.password).digest('hex')).digest('hex')
            })
            .exec(cb);
    },

    login: function (inputs, cb) {

        var validator = new Validator(inputs, {
            mail: 'required|email',
            password: 'required|min:6'
        });

        if (validator.fails()) {
            return cb(validator.errors.errors);
        }

        return cb(null);
    }
}
