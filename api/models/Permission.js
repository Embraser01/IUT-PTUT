/*
 * Permission.js  :
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

module.exports = {

    tableName: 'Permission',

    attributes: {


        //===== ATTRIBUTES =====//

        p_read: {
            type: 'boolean',
            defaultsTo: true
        },

        p_write: {
            type: 'boolean',
            defaultsTo: false
        },

        p_delete: {
            type: 'boolean',
            defaultsTo: false
        },

        p_unlock: {
            type: 'boolean',
            defaultsTo: false
        },

        p_assign: {
            type: 'boolean',
            defaultsTo: false
        },


        //===== FOREIGN KEYS =====//

        node: {
            model: 'node'
        },

        user: {
            model: 'user'
        },

        owner: {
            model: 'user',
            required: true
        },

        group: {
            model: 'group'
        }
    }
}