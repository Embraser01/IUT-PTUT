/*
 * isAllowedFirst.js  :
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

module.exports = function (req, res, next) {

    var mindmapId = parseInt(req.param('id'));

    if (!mindmapId) return res.badRequest();


    PermissionService.get(req, mindmapId, function (perm) {

        if(!perm.p_read){
            return res.forbidden();
        }

        var mindmap = _.find(sails.mindmaps, function (mm) {
            return mm.id === mindmapId;
        });

        if (mindmap) {

            var user = _.find(mindmap.users, function (user) {
                return user.id === req.user.id;
            });

            if (!user) {
                mindmap.users.push({
                    id: req.user.id,
                    display_name: req.user.display_name,
                    img_url: req.user.img_url,
                    sockets: []
                });
            }
            req.mindmap = mindmap;

            return next();
        } else {

            MindMap.findOne(mindmapId).exec(function (err, mindmap) {
                if (err) {
                    console.log(err);
                    return res.serverError();
                }

                if (!mindmap) return res.forbidden();

                var data = {
                    id: mindmap.id,
                    name: mindmap.name,
                    users: [{
                        id: req.user.id,
                        display_name: req.user.display_name,
                        img_url: req.user.img_url,
                        sockets: []
                    }]
                };

                sails.mindmaps.push(data);

                req.mindmap = data;

                return next();

            });
        }
    });
};