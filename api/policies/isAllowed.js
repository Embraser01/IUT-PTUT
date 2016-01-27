module.exports = function (req, res, next) {

    // TODO Check if an user is allowed to load this mindmap
    // For that we can use req.session.mindmapList, so if the user has not join yet, reject all of his request
    var mindmapId = parseInt(req.param('id'));

    if (!mindmapId) return res.badRequest();

    var mindmap = _.find(sails.mindmaps, function (mm) {
        return mm.id === mindmapId;
    });

    if (mindmap) {

        var user = _.find(mindmap.users, function (user) {
            return user.id === req.user.id;
        });

        if(!user) return res.forbidden();

        req.mindmap = mindmap;
        return next();
    }

    return res.forbidden();
};