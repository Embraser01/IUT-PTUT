module.exports = {

    search: function (req, res) {

        var search = req.param("search");
        var node_id = req.param("nodes")[0] || -1;

        Permission.find({
                where: {
                    node: node_id
                },
                sort: 'updatedAt'
            })
            .populate('user', {
                name: {'contains': search}
            })
            .populate('group', {
                name: {'contains': search}
            })
            .exec(function (err, perms) {

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
                    .exec(function (err, users) {

                        _.forEach(users, function (u) {

                            if (!_.find(data, function (d) {
                                    return (d.isUser && d.id === u.id);
                                })) {
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
                            }
                        });

                        Group.find({
                                where: {
                                    name: {'contains': search}
                                }
                            })
                            .exec(function (err, groups) {

                                _.forEach(groups, function (g) {

                                    if (!_.find(data, function (d) {
                                            return (!d.isUser && d.id === g.id);
                                        })) {
                                        data.push({
                                            perms: {
                                                p_read: false,
                                                p_write: false,
                                                p_delete: false,
                                                p_unlock: false,
                                                p_assign: false
                                            },
                                            id: g.id,
                                            isOwner: false,
                                            isUser: false,
                                            name: g.name
                                        });
                                    }
                                });

                                return res.json(data)
                            });
                    });
            });

    }
};