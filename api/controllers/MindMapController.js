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

        if(!req.param('name')) return res.redirect('/');

        var style = {
            order: 1,
            dx: 0,
            folded: false,
            container: {
                kind: "rectangle",
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

                Style.create({
                    style: style,
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

            // TODO Order by parent (something complicated) And take default style
            // , {owner: req.session.user.id}
            Node.find({where: {mindmap: req.param('id')}}).populate('styles').exec(function (err, nodes) {
                if (err) return res.serverError();

                if (nodes) {
                    _.forEach(nodes, function (n) {
                        // On laisse un seul style
                        n.style = SerializeService.unserialize(n.styles[0].style);
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
    },


    leave: function (req, res) {

        MindMap.findOne(req.param('id')).exec(function (err, mindmap) {

            MindMap.unsubscribe(req.socket, mindmap.id);

            return res.json();
        });
    }
};