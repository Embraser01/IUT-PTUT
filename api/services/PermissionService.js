// PermissionService.js - in api/services
function getGroups(user_id) {
    Member.find({where: {user: user_id}}).exec(function (err, groups) {
        var ids = [];

        _.forEach(groups, function (g) {
            ids.push(g.id);
        });

        return ids;
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

    var groups = getGroups(req.user.id);
    Node.findOne({where: {mindmap: id, parent_node: null}}).exec(function (err, node) {

        if (!node) return cb(normalize(null));

        Permission.find({
            where: {node: node.id},
            or: [
                {user: req.user.id},
                {group: groups}
            ]
        }).exec(function (err, perms) {

            return cb(normalize(perms));
        });
    });
}

function nodeIsAllowed(req, nodes, cb) {

    var groups = getGroups(req.user.id);

    return cb("not yet implemented");
}

module.exports = {

    isAllowed: function (req, data, cb) {
        if (typeof data === 'number') return mindMapIsAllowed(req, data, cb);

        if (typeof data === 'object') return nodeIsAllowed(req, data, cb);

        throw new Error("Second argument is not valid");

    }
}
