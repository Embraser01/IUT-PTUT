module.exports = {
    index: function (req, res) {

        MindMap.findByMindMapId(req.param('id')).exec(function (err, mindmap){

        });

        return res.view('mindmap/index', mindmap);
    },


    leave: function (req, res) {

        MindMap.findByMindMapId(req.param('id')).exec(function (err, mindmap){
        });

        return res.redirect('/');
    }
};