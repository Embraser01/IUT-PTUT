/*
 * Node.js  :
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

    tableName: 'Node',

    attributes: {


        //===== ATTRIBUTES =====//

        label: {
            type: 'string',
            required: true,
            size: 30
        },

        height: {
            type: 'integer',
            defaultsTo: 0
        },


        //===== FOREIGN KEYS =====//

        mindmap: {
            model: 'mindmap'
        },

        owner: {
            model: 'user'
        },

        styles: {
            collection: 'style',
            via: 'node'
        },

        permissions: {
            collection: 'permission',
            via: 'node'
        },

        parent_node: {
            model: 'node'
        }
    }
}