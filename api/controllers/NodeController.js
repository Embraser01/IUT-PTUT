function queryNodesUpdate(nodes) {
    var request_node = "UPDATE Node SET ";
    var part_req1 = "`parent_node` = (CASE `id` ";
    var part_req2 = "`label` = (CASE `id` ";
    var part_req3 = "WHERE `id` IN (";

    // Escape all things, we are not sure if id is an int or not

    _.forEach(nodes, function (n) {
        part_req1 += "WHEN '" + EscapeService.sql(n.id.toString()) + "' THEN '" + EscapeService.sql(n.parent_node.toString()) + "' ";
        part_req2 += "WHEN '" + EscapeService.sql(n.id.toString()) + "' THEN '" + EscapeService.sql(n.label) + "' ";
        part_req3 += EscapeService.sql(n.id.toString()) + ",";
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
        part_req1 += "WHEN '" + EscapeService.sql(n.id.toString()) + "' THEN '" + EscapeService.sql(SerializeService.serialize(n.style)) + "' ";
        part_req2 += EscapeService.sql(n.id.toString()) + ",";
    });
    part_req1 += "ELSE `style` END) ";
    part_req2 = part_req2.slice(0, -1) + ");";

    request_style += part_req1 + part_req2;
    return request_style;
}

function sendNodesUpdate(req, res, ids) {

    Node.find({where: {id: ids}}).populate('styles').exec(function (err, nodes) {
        if (err) return console.log(err);

        MindMapMsgService.send('Update_nodes', req, nodes); // Notify users before load style

        nodes = SerializeService.styleLoad(nodes, req.session.user.id);
        return res.json(nodes);
    });
}


module.exports = {

    new: function (req, res) {
        var nodes = req.param('nodes');
        if (!nodes) return res.badRequest();

        // TODO Create more than one node at once
        //var formatted_nodes = [];
        //_.forEach(nodes, function (n) {
        //    formatted_nodes.push({
        //        parent_node: n.parent_node,
        //        label: n.label,
        //        mindmap: req.param('id'),
        //        owner: req.user.id
        //    });
        //});

        Node.find(nodes[0].parent_node).sort({height: 'asc'}).exec(function (err, pnodes) {
            if (err) return console.log(err);

            // On est sure que le parent existe puisque on ne créer jamais la racine
            // Mais si jamais alors on renvoie un badRequest
            if (!pnodes) return res.badRequest();


            var formatted_nodes = [];
            formatted_nodes.push({
                parent_node: nodes[0].parent_node,
                label: nodes[0].label,
                mindmap: req.mindmap.id,
                owner: req.user.id,
                height: pnodes[0].height + 1
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

                        // Add the style on nodes
                        _.forEach(new_nodes, function (n, key) {
                            n.styles[0] = {
                                style: new_styles[key].style,
                                node: new_styles[key].node,
                                owner: new_styles[key].owner
                            }
                        });

                        SerializeService.styleLoad(new_nodes, req.user.id);

                        MindMapMsgService.send('New_nodes', req, new_nodes); // Notify users
                    }
                    return res.json(new_nodes);
                });
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
                // First we retreive node that already have a style define by the user
                // Then we update these ones
                // Then we insert others

                Style.find({where: {node: ids, owner: req.session.user.id}}).exec(function (err, styles) {
                    if (err) return console.log(err);

                    var toUpdate = []; // List of style that need to be update (function take a array of node)
                    var toInsert = []; // List of style that need to be insert (function take a array of style)

                    _.forEach(nodes, function (node) {
                        var tmp = _.find(styles, function (style) {
                            return style.node === node.id;
                        });

                        // If we find a style that need to be update
                        if (tmp) toUpdate.push(node);
                        else toInsert.push({
                            style: node.style,
                            node: node.id,
                            owner: req.session.user.id
                        });
                    });

                    // Make request only if necessary
                    if (toUpdate.length === 0) {
                        Style.create(toInsert).exec(function (err, styles) {
                            if (err) return console.log(err);

                            sendNodesUpdate(req, res, ids);
                        });
                    }
                    else if (toInsert.length === 0) {
                        Style.query(queryStylesUpdate(toUpdate, req), function (err, styles) {
                            if (err) return console.log(err);

                            sendNodesUpdate(req, res, ids);
                        });
                    }
                    else {
                        Style.query(queryStylesUpdate(toUpdate, req), function (err) {
                            if (err) return console.log(err);

                            Style.create(toInsert).exec(function (err, styles) {
                                if (err) return console.log(err);

                                sendNodesUpdate(req, res, ids);
                            });
                        });
                    }
                });
            } else {
                sendNodesUpdate(req, res, ids);
            }
        });
    },

    move: function (req, res) {
        // TODO Height thing
    },

    select: function (req, res) {
        // TODO Select broadcast
    },

    unselect: function (req, res) {
        // TODO Unselect broadcast
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

        Node.find({where: {mindmap: req.mindmap.id}}).populate('style', {owner: req.user.id}).exec(function (err, nodes) {
            if (err) return res.serverError();

            console.log(nodes);
            res.jsonx(nodes);
        });
    }
}