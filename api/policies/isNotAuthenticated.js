var passport = require('passport');

module.exports = function (req, res, next) {

    if (req.isSocket) {
        if (req.session && req.session.passport && !req.session.passport.user) {

            // Initialize Passport
            passport.initialize()(req, res, function () {
                // Use the built-in sessions
                passport.session()(req, res, function () {

                    return next();
                });
            });
        } else {
            return res.json(401);
        }

    } else {
        if (!req.isAuthenticated()) return next();

        return res.redirect('/');
    }
};