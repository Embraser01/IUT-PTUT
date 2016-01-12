

module.exports = {
// For test purpose
    getOne: function (req, res) {

        Node.find().populate('styles').exec(function (err, nodes) {
            if (err) return res.serverError();

            if (nodes) {
                nodes[0].style = SerializeService.unserialize(nodes[0].styles[0].style);
                nodes[0].styles = null;

                if (nodes[0].parent_node === 0) nodes[0].parent_node = null;

            }
            console.log(nodes[0]);
            return res.json({
                node: nodes[0]
            });
        });
    },

    all: function(req, res) {

        MindMap.findOne(1).exec(function (err, mindmap) {

            Node.find({where: {mindmap: 1}}).populate('styles').exec(function (err, nodes) {
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
    }
}