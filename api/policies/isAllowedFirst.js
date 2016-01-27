module.exports = function (req, res, next) {

    // TODO Check if an user is allowed to load this mindmap

    var mindmapId = parseInt(req.param('id'));

    if(!mindmapId) return res.badRequest();

    var mindmap = _.find(sails.mindmaps, function (mm) {
        return mm.id === mindmapId;
    });

    if (mindmap) {
        req.mindmap = mindmap;

        return next();
    } else {

        MindMap.findOne(mindmapId).exec(function (err, mindmap) {
            if (err) {
                console.log(err);
                return res.serverError();
            }

            if (!mindmap) return res.notFound();
/*
            Node.findOne({where: {mindmap: mindmap.id, parent_node: null}}).populate('permission').exec(function (err, node) {

            });*/

            var data = {
                id: mindmap.id,
                name: mindmap.name,
                users: []
            };

            sails.mindmaps.push(data);

            req.mindmap = data;

            return next();

        });
    }
};