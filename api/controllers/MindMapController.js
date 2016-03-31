/*
 * MindMapController.js  :
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
    index: function (req, res) {

        // TODO ajouter le noeud racine pour afficher quelque chose avant le chargement

        return res.view('mindmap/index', DataViewService.create(req.mindmap.name, {
            mindmap: req.mindmap
        }));
    },


    create: function (req, res) {

        if (!req.param('name')) return res.badRequest();

        MindMap.create({
            name: req.param('name'),
            owner: req.user.id
        }, function (err, mindmap) {
            if (err) {
                console.log(err);
                return res.serverError();
            }
            Node.create({
                label: 'Start here !',
                mindmap: mindmap.id,
                owner: req.user.id
            }, function (err, node) {

                if (err) {
                    console.log(err);
                    return res.serverError();
                }
                var default_style = SerializeService.getDefaultStyle();
                default_style.container.kind = "rectangle";

                Style.create({
                    style: default_style,
                    node: node.id,
                    owner: req.user.id
                }, function (err, style) {
                    if (err) {
                        console.log(err);
                        return res.serverError();
                    }

                    Permission.create({
                        node: node.id,
                        owner: req.user.id,
                        user: req.user.id,
                        p_read: true,
                        p_write: true,
                        p_delete: true,
                        p_unlock: true,
                        p_assign: true
                    }, function (err, perm) {

                        if (err) {
                            console.log(err);
                            return res.serverError();
                        }

                        return res.redirect('/mm/' + mindmap.id);
                    });
                });
            });
        });
    },


    join: function (req, res) {
        var mindmap = req.mindmap;

        MindMap.subscribe(req.socket, mindmap.id);

        if (req.mindmapSocket.length === 0) {
            // Means that the user is not yet connected to the mindmap

            MindMapMsgService.send('User_connect', req, {
                id: req.user.id,
                display_name: req.user.display_name,
                img_url: req.user.img_url
            });
        }
        // We just add the socket in the list
        req.mindmapSocket.push(sails.sockets.getId(req.socket));


        var users = [];
        _.forEach(mindmap.users, function (u) {
            if (u.id !== req.user.id) {
                users.push({
                    id: u.id,
                    display_name: u.display_name,
                    img_url: u.img_url
                });
            }
        });

        // TODO Stream data to go faster #BarryAllen
        //var time_start = Date.now();
        PermissionService.getAll(req, mindmap.id, function (nodes) {

            //console.log("Time to getAll node : " + (Date.now() - time_start) + "ms");
            //console.log(nodes);
            return res.json({
                nodes: nodes,
                user: req.user.id,
                users: users
            });
        });
    },

    perm: function (req, res) {
        var perms = req.param('perm');

        Node.findOne({where: {mindmap: req.mindmap.id, parent_node: null}}).exec(function (err, node) {

            var fPerm = {
                p_read: perms.p_read,
                p_write: perms.p_write,
                p_delete: perms.p_delete,
                p_unlock: perms.p_unlock,
                p_assign: perms.p_assign,
                owner: req.user.id,
                node: node.id
            };

            var data = [];

            _.forEach(perms.users, function (uId) {
                data.push(_.assign(fPerm, {
                    user: uId
                }));
            });

            _.forEach(perms.groups, function (gId) {
                data.push(_.assign(fPerm, {
                    group: gId
                }));
            });

            Permission.findOrCreate(data).exec(function (err, perms) {
                if (err) {
                    console.log(err);
                    return res.serverError();
                }
                return res.ok();
            });
        });


    }
};
        
