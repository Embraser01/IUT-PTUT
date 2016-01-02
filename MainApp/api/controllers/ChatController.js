module.exports = {

    public: function (req, res) {

        Message.create({
            data: req.param('msg'),

            owner: req.session.user.id,
            mindmap: req.param('id')
        }).exec(function(err, message){

            return res.mindMapMsg('Chat_public', message);
        });
    },
};