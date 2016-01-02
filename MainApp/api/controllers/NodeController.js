module.exports = {

    new: function (req, res) {
        var node = req.param('node');

        Node.create({
                label: node.label,
                mindmap: req.param('id'),
                owner: req.session.user.id,
                parent_node: node.parent_node
            })
            .exec(function (err, node) {

                Style.create({
                    style: node.style,
                    fold: node.folded,
                    node: node.id,
                    owner: req.session.user.id
                }).exec();

                // TODO Success notification
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
                }).exec();
            });
    },

    getAll: function (req, res) {

        Node.find({where: {mindmap: req.param('id')}}).populate('style', {owner: req.session.user.id}).exec(function (err, nodes){
            if(err) return res.serverError();


            MindMap.message(req.param('id'), {
                dataType: 'GetAll',
                nodes: nodes
            }, req);
        });


    }
}