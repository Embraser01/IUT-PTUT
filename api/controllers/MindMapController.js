var default_style = {
    order: 1,
    dx: 0,
    folded: false,
    container: {
        kind: "none",
        borderThickness: "0",
        borderColor: "#263238",
        background: "white",
        radius: "7"
    },
    font: {
        family: "sans-serif",
        size: "24",
        color: "#006064",
        weight: "bold ",
        style: "italic ",
        decoration: "none",
        align: "right"
    },
    parentBranch: {
        color: "#42a5f5"
    },
    unifiedChildren: {
        dx: false,
        container: false,
        font: false,
        parentBranch: false
    }
};

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

                if (nodes) {
                    _.forEach(nodes, function (n) {
                        // On laisse un seul style
                        var tmp = default_style;

                        _.forEach(n.styles, function (style) {
                            tmp = (style.owner == req.user.id) ? style : tmp;
                        });

                        n.style = SerializeService.unserialize(tmp);
                        n.styles = null;

                        // Remplace 0 par null pour le parent
                        if (n.parent_node === 0) n.parent_node = null;
                    });
                }
                return res.json({
                    nodes: nodes,
                    user: req.user.id
                });
            });
        });
    }
};