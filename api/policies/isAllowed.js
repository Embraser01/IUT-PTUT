module.exports = function (req, res, next) {

    // TODO Check if an user is allowed to load this mindmap
    // For that we can use req.session.mindmapList, so if the user has not join yet, reject all of his request
    var mindmapId = req.param('id');

    if (!mindmapId) return res.badRequest();

    var mindmap = _.find(req.session.mindmapList, function (mm) {
        return mm.mindmap_id === mindmapId;
    });

    if (mindmap) {
        req.mindmap = mindmap;
        return next();
    }

    return res.notFound();
};