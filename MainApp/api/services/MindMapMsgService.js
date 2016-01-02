// MindMapMsgService.js - in api/services
module.exports = {

    send: function (type, req, data) {

        // Send something
        data = data || {};


        MindMap.message(req.param('id'), {
            header: type,
            msg: data
        }, req);
    }

}