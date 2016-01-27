module.exports = {

    public: function (req, res) {

        Message.create({
            data: req.param('msg'),

            owner: req.session.user.id,
            mindmap: req.mindmap.id
        }).exec(function (err, message) {

            var data = {
                data: EscapeService.html(message.data),
                user: {
                    display_name: req.user.display_name,
                    img_url: req.user.img_url
                },
                createdAt: message.createdAt
            };

            MindMapMsgService.send('Chat_public', req, data); // Notify users before load style
            return res.json(data);
        });
    },


    getAll: function (req, res) {

        var page = parseInt(req.param('page')) || 1;

        Message.find().where({mindmap: req.mindmap.id}).sort({createdAt: 'desc'}).paginate({
            page: page,
            limit: 30
        }).populate('owner').exec(function (err, messages) {
            if (err) return res.serverError();

            var data = [];

            _.forEach(messages, function (message) {
                data.push({
                    data: EscapeService.html(message.data),
                    user: {
                        display_name: message.owner.display_name,
                        img_url: message.owner.img_url
                    },
                    createdAt: message.createdAt
                })
            });

            return res.json(data);
        });
    }
};