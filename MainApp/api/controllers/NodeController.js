module.exports = {

    new: function (req, res) {
        var nodes = req.param('nodes');

        // TODO Creation multiple (lodash)

        Node.create({
                label: nodes[0].label,
                mindmap: req.param('id'),
                owner: req.session.user.id,
                parent_node: nodes[0].parent_node
            })
            .exec(function (err, node) {
                if (err) console.log(err);

                node.styles.add({
                    style: nodes[0].style,
                    fold: nodes[0].fold,
                    owner: req.session.user.id
                });

                node.save(function (err, node) {
                    if (err) return;

                    if (node) {
                        // On laisse un seul style
                        node.style = SerializeService.unserialize(node.styles[0].style);
                        node.styles = null;

                        // Unpopulate parent node
                        node.parent_node = node.parent_node.id;

                        // Remplace 0 par null pour le parent
                        if (node.parent_node === 0) node.parent_node = null;
                    }

                    return res.json([node]);
                });
            });
    },

    update: function (req, res) {
        var node = req.param('node');

        Node.update(node.id, {
                label: node.label,
                parent_node: node.parent_node
            })
            .exec(function (err, nodes) {

                Style.update({
                    node: nodes[0].id,
                    owner: req.session.user.id
                }, {
                    style: node.style,
                    fold: node.folded
                }).exec(function (err, node) {
                    res.json(node);
                });
            });
    },

    getAll: function (req, res) {

        Node.find({where: {mindmap: req.param('id')}}).populate('style', {owner: req.session.user.id}).exec(function (err, nodes) {
            if (err) return res.serverError();

            console.log(nodes);
            res.jsonx(nodes);
        });


    }
}