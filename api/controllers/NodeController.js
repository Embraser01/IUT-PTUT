function queryNodesUpdate(nodes) {
    var request_node = "UPDATE Node SET ";
    var part_req1 = "`parent_node` = (CASE `id` ";
    var part_req2 = "`label` = (CASE `id` ";
    var part_req3 = "WHERE `id` IN (";

    // Escape all things, we are not sure if id is an int or not

    _.forEach(nodes, function (n) {
        part_req1 += "WHEN '" + EscapeService.escape(n.id.toString()) + "' THEN '" + EscapeService.escape(n.parent_node.toString()) + "' ";
        part_req2 += "WHEN '" + EscapeService.escape(n.id.toString()) + "' THEN '" + EscapeService.escape(n.label) + "' ";
        part_req3 += EscapeService.escape(n.id.toString()) + ",";
    });
    part_req1 += "ELSE `parent_node` END), ";
    part_req2 += "ELSE `label` END) ";
    part_req3 = part_req3.slice(0, -1) + ");";

    request_node += part_req1 + part_req2 + part_req3;
    return request_node;
}

function queryStylesUpdate(nodes, req) {
    var request_style = "UPDATE Style SET ";
    var part_req1 = "`style` = (CASE `node` ";
    var part_req2 = "WHERE `owner` = " + req.user.id + " AND `node` IN (";

    _.forEach(nodes, function (n) {
        part_req1 += "WHEN '" + EscapeService.escape(n.id.toString()) + "' THEN '" + EscapeService.escape(SerializeService.serialize(n.style)) + "' ";
        part_req2 += EscapeService.escape(n.id.toString()) + ",";
    });
    part_req1 += "ELSE `style` END) ";
    part_req2 = part_req2.slice(0, -1) + ");";

    request_style += part_req1 + part_req2;
    return request_style;
}


module.exports = {

    new: function (req, res) {
        var nodes = req.param('nodes');

        var formatted_nodes = [];
        _.forEach(nodes, function (n) {
            formatted_nodes.push({
                parent_node: n.parent_node,
                label: n.label,
                mindmap: req.param('id'),
                owner: req.user.id
            });
        });


        Node.create(formatted_nodes).exec(function (err, new_nodes) {
            if (err) console.log(err);

            var formatted_styles = [];
            _.forEach(nodes, function (n, key) {
                formatted_styles.push({
                    style: n.style,
                    node: new_nodes[key].id,
                    owner: req.user.id
                });
            });

            Style.create(formatted_styles).exec(function (err, new_styles) {
                if (err) return;

                if (new_nodes) {

                    _.forEach(new_nodes, function (n, key) {
                        n.style = SerializeService.unserialize(new_styles[key].style);
                        //n.parent_node = n.parent_node.id;

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


        var ids = [];
        _.forEach(nodes, function (n) {
            ids.push(n.id);
        });


        Node.query(queryNodesUpdate(nodes), function (err) {
            if (err) return console.log(err);

            if (updateStyle === 'yes') {
                Style.query(queryStylesUpdate(nodes, req), function (err) {
                    if (err) return console.log(err);

                    Node.find({where: {id: ids}}).populate('styles').exec(function (err, nodes) {
                        if (err) return console.log(err);

                        if (nodes) {
                            _.forEach(nodes, function (n) {
                                // On laisse un seul style
                                n.style = SerializeService.unserialize(n.styles[0].style);
                                n.styles = null;

                                // Remplace 0 par null pour le parent
                                if (n.parent_node === 0) n.parent_node = null;
                            });
                        }

                        MindMapMsgService.send('Update_nodes_w_style', req, nodes); // Notify users
                        return res.json(nodes);
                    });
                });

            } else {
                Node.find({where: {id: ids}}).populate('styles').exec(function (err, nodes) {
                    if (err) return console.log(err);

                    if (nodes) {
                        _.forEach(nodes, function (n) {
                            // On laisse un seul style
                            n.style = SerializeService.unserialize(n.styles[0].style);
                            n.styles = null;

                            // Remplace 0 par null pour le parent
                            if (n.parent_node === 0) n.parent_node = null;
                        });
                    }

                    MindMapMsgService.send('Update_nodes', req, nodes); // Notify users
                    return res.json(nodes);

                });
            }
        });
    },


    delete: function (req, res) {
        var nodes = req.param('nodes');
        var ids = [];
        _.forEach(nodes, function (n) {
            ids.push(n.id);
        });

        Node.destroy({id: ids}).exec(function (err) {
            if (err) return console.log(err);

            Style.destroy({node: ids}).exec(function (err) {
                if (err) return console.log(err);

                MindMapMsgService.send('Delete_nodes', req, nodes); // Notify users
                return res.json(ids);
            });
        });
    },

    getAll: function (req, res) {

        Node.find({where: {mindmap: req.param('id')}}).populate('style', {owner: req.user.id}).exec(function (err, nodes) {
            if (err) return res.serverError();

            console.log(nodes);
            res.jsonx(nodes);
        });
    }
}