module.exports = function (req, res, next) {

    // If `req.session.me` exists, that means the user is logged in.
    if (!req.session.user) return next();

    // If this is not an HTML-wanting browser, e.g. AJAX/sockets/cURL/etc.,
    // send a 401 response letting the user agent know they need to login to
    // access this endpoint.
    if (req.wantsJSON) {
        return res.send(401);
    }

    console.log('Connecté !' + req.session.user);
    // Otherwise if this is an HTML-wanting browser, do a redirect.
    return res.redirect('/');
};