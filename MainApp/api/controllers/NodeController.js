module.exports = {

    new: function (req, res) {
        var nodes = req.param('nodes');

        var formatted_nodes = [];
        _.forEach(nodes, function (n) {
            formatted_nodes.push({
                label: n.label,
                mindmap: req.param('id'),
                owner: req.session.user.id,
                parent_node: n.parent_node
            });
        });


        Node.create(formatted_nodes).exec(function (err, new_nodes) {
            if (err) console.log(err);

            var formatted_styles = [];
            _.forEach(nodes, function (n, key) {
                formatted_styles.push({
                    style: n.style,
                    fold: n.fold,
                    node: new_nodes[key].id,
                    owner: req.session.user.id
                });
            });

            Style.create(formatted_styles).exec(function (err, new_styles) {
                if (err) return;

                if (new_nodes) {

                    _.forEach(new_nodes, function (n, key) {
                        n.style = SerializeService.unserialize(new_styles[key].style);
                        n.parent_node = n.parent_node.id;

                        if (n.parent_node === 0) n.parent_node = null;
                    });
                }

                MindMapMsgService.send('New_nodes', req, new_nodes); // Notify users
                return res.json(new_nodes);
            });
        });
    },

    update: function (req, res) {
        var nodes = req.param('nodes');
        var updateStyle = req.param('style');


        var formatted_nodes = [];
        _.forEach(nodes, function (n) {
            formatted_nodes.push({
                label: n.label,
                parent_node: n.parent_node
            });
        });

        var formatted_nodes_id = [];
        _.forEach(nodes, function (n) {
            formatted_nodes_id.push(n.id);
        });


        Node.update(formatted_nodes_id, formatted_nodes).exec(function (err, new_nodes) {
            if (err) console.log(err);

            if (updateStyle === 'yes') {

                var formatted_styles = [];
                _.forEach(nodes, function (n) {
                    formatted_styles.push({
                        style: n.style,
                        fold: n.fold
                    });
                });

                var formatted_styles_id = [];
                _.forEach(nodes, function (n) {
                    formatted_nodes_id.push({
                        node: n.id,
                        owner: req.session.user.id
                    });
                });

                Style.update(formatted_styles_id, formatted_styles).exec(function (err, new_styles) {
                    if (err) return;

                    if (new_nodes) {

                        _.forEach(new_nodes, function (n, key) {
                            n.style = SerializeService.unserialize(new_styles[key].style);
                            n.parent_node = n.parent_node.id;

                            if (n.parent_node === 0) n.parent_node = null;
                        });
                    }
                    MindMapMsgService.send('Update_nodes_w_style', req, new_nodes); // Notify users
                });
            } else {
                MindMapMsgService.send('Update_nodes', req, new_nodes); // Notify users
            }

            return res.json(new_nodes);
        });
    },


    delete: function (req, res) {

    },

    getAll: function (req, res) {

        Node.find({where: {mindmap: req.param('id')}}).populate('style', {owner: req.session.user.id}).exec(function (err, nodes) {
            if (err) return res.serverError();

            console.log(nodes);
            res.jsonx(nodes);
        });


    }
}