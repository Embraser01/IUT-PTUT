module.exports = {

    search: function (req, res) {

        var search = req.param("search");
        var node_id = req.param("node") || -1;

        Permission.find({
                where: {
                    node: node_id,
                    owner: req.user.id
                },
                sort: 'updatedAt'
            })
            .populate('user')
            .populate('group', {
                name: {'contains': search}
            })
            .exec(function (err, perms) {

                console.log(search, err);
                var data = [];

                _.forEach(perms, function (p) {
                    data.push({
                        perms: {
                            p_read: p.p_read,
                            p_write: p.p_write,
                            p_delete: p.p_delete,
                            p_unlock: p.p_unlock,
                            p_assign: p.p_assign
                        },
                        id: (p.group) ? p.group.id : p.user.id,
                        isOwner: (p.user === p.owner),
                        isUser: (p.user),
                        name: (p.group) ? p.group.name : p.user.display_name
                    });
                });

                if (!search) return res.json(data);

                User.find({
                        where: {
                            display_name: {'contains': search}
                        }
                    })
                    .populate('permissions', {node: node_id})
                    .exec(function (err, users) {

                        _.forEach(users, function (u) {
                            data.push({
                                perms: {
                                    p_read: false,
                                    p_write: false,
                                    p_delete: false,
                                    p_unlock: false,
                                    p_assign: false
                                },
                                id: u.id,
                                isOwner: false,
                                isUser: true,
                                name: u.display_name
                            });
                        });

                        return res.json(data)
                    });
            });

    }
};