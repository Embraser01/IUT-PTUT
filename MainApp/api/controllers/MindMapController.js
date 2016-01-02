module.exports = {
    index: function (req, res) {

        MindMap.findOne(req.param('id')).exec(function (err, mindmap) {
            if (err) return res.serverError();

            Message.find().where({mindmap: mindmap.id}).populate('owner').exec(function (err, messages) {
                if (err) return res.serverError();

                return res.view('mindmap/index', {mindmap: mindmap, messages: messages});
            });
        });
    },


    join: function (req, res) {
        MindMap.findOne(req.param('id')).exec(function (err, mindmap) {

            MindMap.subscribe(req.socket, mindmap.id);

            // TODO Order by parent (something compicated) And take default style
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
                return res.json(nodes);
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