module.exports = {
    index: function (req, res) {

        MindMap.findByMindMapId(req.param('id')).exec(function (err, mindmap){
            MindMap.subscribe(req, req.param('id'), ['message']);
        });

        return res.view('mindmap/index', mindmap);
    },


    leave: function (req, res) {

        MindMap.findByMindMapId(req.param('id')).exec(function (err, mindmap){
            MindMap.unsubscribe(req, req.param('id'), ['message']);
        });

        return res.redirect('/');
    }

};