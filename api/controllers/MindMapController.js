module.exports = {
    index: function (req, res) {

        // TODO ajouter le noeud racine pour afficher quelque chose avant le chargement
        MindMap.findOne(req.param('id')).exec(function (err, mindmap) {
            if (err) return res.serverError();

            Message.find().where({mindmap: mindmap.id}).populate('owner').exec(function (err, messages) {
                if (err) return res.serverError();

                return res.view('mindmap/index', DataViewService.create(mindmap.name, {mindmap: mindmap, messages: messages}));
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
                        n.style.fold = n.styles[0].fold;
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

            return res.ok();
        });
    }
};