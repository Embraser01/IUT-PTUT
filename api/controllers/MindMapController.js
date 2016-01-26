module.exports = {
    index: function (req, res) {

        // TODO ajouter le noeud racine pour afficher quelque chose avant le chargement


        // TODO Move messages load in ChatController (socket)
        Message.find().where({mindmap: req.mindmap.id}).populate('owner').exec(function (err, messages) {
            if (err) return res.serverError();

            return res.view('mindmap/index', DataViewService.create(req.mindmap.name, {
                mindmap: req.mindmap,
                messages: messages
            }));
        });
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


        if (!req.session.mindmapList) return res.badRequest(); // That means that the user didn't pass by the isAllowedFirst/Index

        // Search if the user is already connected in the same mindmap
        _.forEach(req.session.mindmapList, function (mm) {
            if (mm.id == mindmap.id) {
                mm.sockets.push(sails.sockets.id(req.socket));
            }
        });


        var user = {
            id: req.session.user.id,
            display_name: req.session.user.display_name,
            img_url: req.session.user.img_url
        };

        MindMapMsgService.send('User_connect', null, user, mindmap.id); // Notify users


        // TODO Stream data to go faster #BarryAllen

        Node.find({where: {mindmap: mindmap.id}}).sort({height: 'asc'}).populate('styles').exec(function (err, nodes) {
            if (err) return res.serverError();

            nodes = SerializeService.styleLoad(nodes, req.session.user.id);

            return res.json({
                nodes: nodes,
                user: req.user.id
            });
        });

    }
};
        