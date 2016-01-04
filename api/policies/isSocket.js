module.exports = function (req, res, next) {

    if (req.isSocket) return next();

    if (req.wantsJSON) return res.send(200);

    return res.redirect('/');
};