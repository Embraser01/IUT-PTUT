// MindMapMsgService.js - in api/services
module.exports = {

    send: function (type, req, data, mindmap_id) {

        // Send something
        data = data || {};
        mindmap_id = mindmap_id || req.param('id');


        MindMap.message(mindmap_id, {
            header: type,
            msg: data
        }, req);
    }

}