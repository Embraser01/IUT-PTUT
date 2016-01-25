module.exports = function (req, res, next) {

    // TODO Check if an user is allowed to load this mindmap
    // For that we can use req.session.mindmapList, so if the user has not join yet, reject all of his request
    return next();
};