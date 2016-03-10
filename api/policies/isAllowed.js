module.exports = function (req, res, next) {

    var mindmapId = parseInt(req.param('id'));

    if (!mindmapId) return res.badRequest();

    var mindmap = _.find(sails.mindmaps, function (mm) {
        return mm.id === mindmapId;
    });

    if (mindmap) {
        var user = _.find(mindmap.users, function (user) {
            return user.id === req.user.id;
        });

        if (!user) return res.forbidden();


        var compare_perm = {
            p_read: false,
            p_write: false,
            p_delete: false,
            p_unlock: false,
            p_assign: false
        };

        var tmp = req.path.split('/');

        switch (tmp[2]) { // Make the perm object to have to go on ( no need to check on global permission (chat only))
            case "node":
            case "search":
                switch (tmp[3]) {
                    case "new":
                    case "update":
                        compare_perm.p_write = true;
                        break;
                    case "delete":
                        compare_perm.p_delete = true;
                        break;
                    case "perm":
                        compare_perm.p_assign = true;
                        break;
                }
                compare_perm.p_read = true;
                break;
        }

        req.nodes = req.param("nodes");
        req.mindmap = mindmap;
        req.mindmapUser = user;
        req.mindmapSocket = user.sockets; // List of the user's sockets

        var nodes = [];
        _.forEach(req.nodes, function (n){
            if(typeof n === "object") nodes.push(n.parent_node);
            else if(typeof n === "number") nodes.push(n);
        });

        if (compare_perm.p_read) { // TODO Remove limitation of one node :c
            PermissionService.get(req, mindmap.id, nodes[0], function (perms) {
                if (!comparePerm(compare_perm, perms)) return res.forbidden();

                req.perm = perms;
                return next();
            });
        } else {
            return next();
        }
    } else {
        return res.forbidden();
    }
};

function comparePerm(perms1, perms2) {
    return perms1.p_read == perms2.p_read
        && perms1.p_write == perms2.p_write
        && perms1.p_unlock == perms2.p_unlock
        && perms1.p_assign == perms2.p_assign
}