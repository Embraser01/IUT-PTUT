module.exports = {
    index: function (req, res) {

        MindMap.findOne(req.param('id')).exec(function (err, mindmap) {
            if(err) return res.serverError();

            Message.find().where({mindmap: mindmap.id}).populate('owner').exec(function(err, messages){
                if(err) return res.serverError();

                return res.view('mindmap/index', {mindmap: mindmap, messages: messages});
            });
        });
    },


    join: function (req, res) {
        MindMap.findOne(req.param('id')).exec(function (err, mindmap) {

            MindMap.subscribe(req.socket, mindmap.id);

            // TODO Renvoyer les noeuds en une fois
            return res.ok();
        });
    },


    leave: function (req, res) {

        MindMap.findOne(req.param('id')).exec(function (err, mindmap) {

            MindMap.unsubscribe(req.socket, mindmap.id);

            return res.ok();
        });
    }
};