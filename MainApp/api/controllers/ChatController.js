module.exports = {

    public: function (req, res) {
        MindMap.message(req.param('id'), {
            from: {
                id: req.session.user.id,
                firstname: req.session.user.firstname,
                name: req.session.user.name
            },
            msg: req.param('msg')
        }, req);

        Message.create({
            data: req.param('msg'),

            owner: req.session.user.id,
            mindmap: req.param('id')
        }).exec(function(err, message){});
    },
};