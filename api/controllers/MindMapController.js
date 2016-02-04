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
                    return res.redirect('/mm/' + mindmap.id);
                });
            });
        });
    },


    join: function (req, res) {
        var mindmap = req.mindmap;

        MindMap.subscribe(req.socket, mindmap.id);

        if(req.mindmapSocket.length === 0){
            // Means that the user is not connected

            MindMapMsgService.send('User_connect', req, {
                id: req.user.id,
                display_name: req.user.display_name,
                img_url: req.user.img_url
            });
        } else {
            // We just add the socket in the list but don't send msg to mindmap' subscribers
            req.mindmapSocket.push(sails.sockets.id(req.socket));
        }

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

        Node.find({where: {mindmap: mindmap.id}}).sort({height: 'asc'}).populate('styles').exec(function (err, nodes) {
            if (err) return res.serverError();

            nodes = SerializeService.styleLoad(nodes, req.session.user.id);

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

            _.forEach(perm.users, function (uId) {
                data.push(_.assign(fPerm, {
                    user: uId
                }));
            });

            _.forEach(perm.groups, function (gId) {
                data.push(_.assign(fPerm, {
                    group: gId
                }));
            });

            Permission.create(data).exec(function (err, perms) {
                if(err) {
                    console.log(err);
                    return res.serverError();
                }
                return res.ok();
            });
        });


    }
};
        