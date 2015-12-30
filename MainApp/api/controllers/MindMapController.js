module.exports = {
    index: function (req, res) {

        MindMap.findOne(req.param('id')).exec(function (err, mindmap){
            return res.view('mindmap/index', {mindmap: mindmap});
        });
    },


    join: function (req, res) {
        MindMap.findOne(req.param('id')).exec(function (err, mindmap){
            if(err) return res.ok('This id doesn\'t exist! ');

            MindMap.subscribe(req.socket, mindmap.id);

            return res.ok();
        });
    },


    leave: function (req, res) {

        MindMap.findOne(req.param('id')).exec(function (err, mindmap){
            if(err) return res.ok('This id doesn\'t exist! ');

            MindMap.unsubscribe(req.socket, mindmap.id);

            return res.ok();
        });
    }
};