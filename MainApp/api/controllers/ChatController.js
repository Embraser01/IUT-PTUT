module.exports = {

    public: function (req, res) {
        MindMap.message(req.param('id'), {
            from: {
                id: req.session.user.id,
                firstname: req.session.user.firstname,
                name: req.session.user.name
            },
            msg: req.param('msg')
        }, req)
    },
};