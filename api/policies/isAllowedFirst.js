module.exports = function (req, res, next) {

    // TODO Check if an user is allowed to load this mindmap
    // Use only at join, check if he is allowed and put mindmap info in req.session.mindmap (id, name)

    MindMap.findOne(req.param('id')).exec(function (err, mindmap) {
        if (err) return res.serverError();

        if (!mindmap) return res.notFound();

        req.session.mindmapList = req.session.mindmapList || [];

        var data = {
            id: mindmap.id,
            name: mindmap.name,
            sockets: [sails.sockets.id(req.socket)]
        };

        req.session.mindmapList.push(data);

        req.mindmap = data;

        return next();

    });
};