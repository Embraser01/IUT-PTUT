module.exports = {
    index: function (req, res) {

        // TODO ajouter le noeud racine pour afficher quelque chose avant le chargement
        MindMap.findOne(req.param('id')).exec(function (err, mindmap) {
            if (err) return res.serverError();

            if (!mindmap) return res.notFound(); // TODO Delete this when isAllowed done

            // TODO Move messages load in ChatController (socket)
            Message.find().where({mindmap: mindmap.id}).populate('owner').exec(function (err, messages) {
                if (err) return res.serverError();

                return res.view('mindmap/index', DataViewService.create(mindmap.name, {
                    mindmap: mindmap,
                    messages: messages
                }));
            });
        });
    },


    create: function (req, res) {

        if (!req.param('name')) return res.redirect('/');

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
        MindMap.findOne(req.param('id')).exec(function (err, mindmap) {

            MindMap.subscribe(req.socket, mindmap.id);
            req.session.mindmapList = (req.session.mindmapList) ? req.session.mindmapList.push(mindmap.id) : [mindmap.id];

            MindMapMsgService.send('User_connect', null, user, mindmap.id); // Notify users


            // TODO Stream data to go faster #BarryAllen

            Node.find({where: {mindmap: req.param('id')}}).sort({height: 'asc'}).populate('styles').exec(function (err, nodes) {
                if (err) return res.serverError();

                nodes = SerializeService.styleLoad(nodes, req.session.user.id);

                return res.json({
                    nodes: nodes,
                    user: req.user.id
                });
            });
        });
    }
};