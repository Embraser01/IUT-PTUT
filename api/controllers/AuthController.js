var passport = require('passport');

module.exports = {

    //===== VIEWS =====//

    signup: function (req, res) {
        var errors = req.session.signup_errors || null;
        var inputs = req.session.signup_inputs || {};

        req.session.signup_errors = null;
        req.session.signup_inputs = null;

        return res.view('auth/signup', DataViewService.create('Inscription', {
            errors: errors,
            inputs: inputs
        }));
    },

    login: function (req, res) {

        if (req.session['login_error']) {
            var error = req.session.login_error;

            req.session.login_error = null;
            return res.view('auth/login', DataViewService.create('Connexion', {}));
        }

        return res.view('auth/login', DataViewService.create('Connexion'));
    },


    //===== PROCESS =====//

    processSignup: function (req, res) {

        var inputs = {
            firstname: req.param('firstname'),
            lastname: req.param('lastname'),
            mail: req.param('mail'),
            password: req.param('password'),
            password_confirmation: req.param('password_confirmation')
        };

        User.signup(inputs, function (err, user) {
            if (err) {
                req.flash('error', "Merci d'apporter les modifications nécessaires afin de valider votre inscription");
                req.session.signup_errors = err;
                req.session.signup_inputs = inputs;
                return res.redirect('/auth/signup');
            }

            req.logIn(user, function (err) {
                if (err) {
                    req.flash('error', "Il y a eu un soucis interne durant votre inscription");
                    return res.serverError();
                }

                if (req.wantsJSON)
                    return res.ok('Signup successful !');

                req.flash('success', "Votre inscription s'est correctement terminée");
                return res.redirect('/');
            });
        });
    },

    processLogin: function (req, res) {

        passport.authenticate('local', function (err, user, info) {
            if (err) {
                req.session.login_error = {message: err.message};
                return res.redirect('/auth/login');
            }
            if (!user) { // Not found in database
                req.session.login_error = {message: 'User not found'};
                return res.redirect('/auth/login');
            }
            req.logIn(user, function (err) {
                if (err) res.send(err);

                // TODO rememeber me : req.session.cookie.maxAge = 1000 * 60 * 3;

                return res.redirect('/');
            })
        })(req, res);
    },


    // https://developers.facebook.com/docs/
    // https://developers.facebook.com/docs/reference/login/
    facebook: function (req, res) {
        passport.authenticate('facebook', {
            failureRedirect: '/auth/login'
        }, function (err, user) {
            if (err) return console.log(err);
            req.logIn(user, function (err) {
                if (err) {
                    console.log(err);
                    res.serverError();
                    return;
                }

                return res.redirect('/');
            });
        })(req, res);
    },

    // https://developers.google.com/
    // https://developers.google.com/accounts/docs/OAuth2Login#scope-param
    google: function (req, res) {
        passport.authenticate('google', {
            failureRedirect: '/auth/login',
            scope: ['https://www.googleapis.com/auth/plus.login']
        }, function (err, user) {
            if (err) return console.log(err);

            req.logIn(user, function (err) {
                if (err) {
                    console.log(err);
                    res.serverError();
                    return;
                }

                return res.redirect('/');
            });
        })(req, res);
    },

    // https://apps.twitter.com/
    // https://apps.twitter.com/app/new
    twitter: function (req, res) {
        passport.authenticate('twitter', {failureRedirect: '/auth/login'}, function (err, user) {
            if(err) return console.log(err);
            req.logIn(user, function (err) {
                if (err) {
                    console.log(err);
                    res.serverError();
                    return;
                }

                return res.redirect('/');
            });
        })(req, res);
    },


    processLogout: function (req, res) {

        req.logout();

        return res.redirect('/auth/login');
    }
};
