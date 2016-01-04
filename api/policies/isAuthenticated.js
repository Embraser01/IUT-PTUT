var passport = require('passport');

module.exports = function (req, res, next) {

    if(req.isSocket)
    {
        if(req.session &&
            req.session.passport &&
            req.session.passport.user)
        {
            //Use this:

            // Initialize Passport
            passport.initialize()(req, res, function () {
                // Use the built-in sessions
                passport.session()(req, res, function () {
                    // Make the user available throughout the frontend
                    res.locals.user = req.user;
                    //the user should be deserialized by passport now;
                    next();
                });
            });

            //Or this if you dont care about deserializing the user:
            //req.user = req.session.passport.user;
            //return next();

        }
        else{
            res.json(401);
        }


    }
    else if (req.isAuthenticated()) {
        return next();
    }
    else{
        // User is not allowed
        // (default res.forbidden() behavior can be overridden in `config/403.js`)
        return res.redirect('/auth/login');
    }
};