/*
 * ChatController.js  :
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

    public: function (req, res) {

        Message.create({
            data: req.param('msg'),

            owner: req.session.user.id,
            mindmap: req.mindmap.id
        }).exec(function (err, message) {

            var data = {
                data: EscapeService.html(message.data),
                user: {
                    display_name: req.user.display_name,
                    img_url: req.user.img_url
                },
                createdAt: message.createdAt
            };

            MindMapMsgService.send('Chat_public', req, data); // Notify users before load style
            return res.json(data);
        });
    },


    getAll: function (req, res) {

        var page = parseInt(req.param('page')) || 1;

        Message.find().where({mindmap: req.mindmap.id}).sort({createdAt: 'desc'}).paginate({
            page: page,
            limit: 30
        }).populate('owner').exec(function (err, messages) {
            if (err) return res.serverError();

            var data = [];

            _.forEach(messages, function (message) {
                data.push({
                    data: EscapeService.html(message.data),
                    user: {
                        display_name: message.owner.display_name,
                        img_url: message.owner.img_url
                    },
                    createdAt: message.createdAt
                })
            });

            return res.json(data);
        });
    }
};