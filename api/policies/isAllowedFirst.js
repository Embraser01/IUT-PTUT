module.exports = function (req, res, next) {

    // TODO Check if an user is allowed to load this mindmap

    var mindmapId = parseInt(req.param('id'));

    if (!mindmapId) return res.badRequest();


    PermissionService.get(req, mindmapId, function (perm) {
        //console.log(perm);
    });

    var time_start = Date.now();
    PermissionService.get(req, mindmapId, 83, function (perm) {
            //console.log("Perm node n 3 en " + (Date.now() - time_start) + "ms : ", perm);
        });

    var mindmap = _.find(sails.mindmaps, function (mm) {
        return mm.id === mindmapId;
    });

    if (mindmap) {

        var user = _.find(mindmap.users, function (user) {
            return user.id === req.user.id;
        });

        if (!user) {
            mindmap.users.push({
                id: req.user.id,
                display_name: req.user.display_name,
                img_url: req.user.img_url,
                sockets: []
            });
        }
        req.mindmap = mindmap;

        return next();
    } else {

        MindMap.findOne(mindmapId).exec(function (err, mindmap) {
            if (err) {
                console.log(err);
                return res.serverError();
            }

            if (!mindmap) return res.forbidden();
            /*
             Node.findOne({where: {mindmap: mindmap.id, parent_node: null}}).populate('permission').exec(function (err, node) {

             });*/

            var data = {
                id: mindmap.id,
                name: mindmap.name,
                users: [{
                    id: req.user.id,
                    display_name: req.user.display_name,
                    img_url: req.user.img_url,
                    sockets: []
                }]
            };

            sails.mindmaps.push(data);

            req.mindmap = data;

            return next();

        });
    }
};