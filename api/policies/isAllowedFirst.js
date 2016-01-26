module.exports = function (req, res, next) {

    // TODO Check if an user is allowed to load this mindmap
    // Use only at join, check if he is allowed and put mindmap info in req.session.mindmap (id, name)
    req.session.mindmapList = req.session.mindmapList || [];
    var mindmapId = parseInt(req.param('id'));

    if(!mindmapId) return res.badRequest();

    var mindmap = _.find(req.session.mindmapList, function (mm) {
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
            

            var data = {
                id: mindmap.id,
                name: mindmap.name,
                sockets: []
            };

            req.session.mindmapList.push(data);

            req.mindmap = data;

            return next();

        });
    }
};