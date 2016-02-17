// PermissionService.js - in api/services
function getGroups(user_id, cb) {
    Member.find({where: {user: user_id}}).exec(function (err, groups) {
        var ids = [];

        _.forEach(groups, function (g) {
            ids.push(g.id);
        });

        return cb(ids);
    });
}

function normalize(perms) {
    var final_perm = {
        p_read: false,
        p_write: false,
        p_delete: false,
        p_unlock: false,
        p_assign: false
    };

    if (!perms) return final_perm;

    _.forEach(perms, function (perm) {
        final_perm.p_read |= perm.p_read;
        final_perm.p_write |= perm.p_write;
        final_perm.p_delete |= perm.p_delete;
        final_perm.p_unlock |= perm.p_unlock;
        final_perm.p_assign |= perm.p_assign;
    });

    return final_perm;
}


function mindMapIsAllowed(req, id, cb) {

    getGroups(req.user.id, function (groups) {
        Node.findOne({where: {mindmap: id, parent_node: null}}).populate('permissions', {
            or: [{user: req.user.id},
                {group: groups}]
        }).exec(function (err, node) {

            if (!node) return cb(normalize(null));

            return cb(normalize(node.permissions));
        });
    });
}

function nodeIsAllowed(req, nodes, cb) {

    getGroups(req.user.id, function (groups) {

        Node.find({where: {id: nodes}}).populate('permissions', {
            or: [{user: req.user.id},
                {group: groups}]
        }).exec(function (err, nodes) {

            if (!nodes) return cb(normalize(null));

            _.forEach(nodes, function (node) {
                node.permissions = normalize(node.permissions);
            });

            return cb(nodes);
        });
    });
}

function nodeIsAllowed2(req, mindmap_id, node , cb) {

    Node.findOne(node).exec(function (err, _node) {

        if (!_node) return cb(normalize(null));

        Node.find({
            where: {mindmap: mindmap_id, height: {'<': _node.height}},
            sort: 'height DESC'
        }).exec(function (err, nodes) {

            var list_nodes = [_node.id];
            var _parent = _node.parent_node;

            _.forEach(nodes, function (node) { // ORDER BY HEIGHT SO... NO PROBLEM ;)
                if (_parent === node.id) {
                    list_nodes.push(node.id);
                    if (node.parent_node === null) return false; // Optimisation (a little ^^)
                    _parent = node.parent_node;
                }
            });

            getGroups(req.user.id, function (groups) {
                Permission.find({
                    where: {node: list_nodes},
                    or: [{user: req.user.id},
                        {group: groups}]
                }).exec(function (err, perms) {
                    if (!perms) return cb(normalize(null));

                    return cb(normalize(perms));
                })
            });
        });
    });
}

module.exports = {

    get_old: function (req, data, cb) {
        if (typeof data === 'number') return mindMapIsAllowed(req, data, cb);

        if (typeof data === 'object') return nodeIsAllowed(req, data, cb);

        throw new Error("Second argument is not valid");

    },

    get: function (req, mindmap_id, data, cb) {

        if(!cb) return mindMapIsAllowed(req, mindmap_id, data);

        return nodeIsAllowed2(req, mindmap_id, data, cb);
    }
}
