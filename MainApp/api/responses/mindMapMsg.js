/**
 * MindMap Response ( socket message )
 *
 * Usage:
 * return res.mindMapMsg();
 * return res.mindMapMsg('NewMessage', data );
 *
 * @param  {String} type
 * @param  {Object} data
 */

module.exports = function mindMapMsg(type, data) {

    // Get access to `req`, `res`, & `sails`
    var req = this.req;
    var res = this.res;
    var sails = req._sails;

    sails.log.silly('res.mindMapMsg() :: Sending a MindMap message ("OK") response');

    // Set status code
    res.status(200);

    // Send something
    data = data || {};


    MindMap.message(req.param('id'), {
        header : type,
        msg: data
    }, req);


    return res.jsonx(data);
};
