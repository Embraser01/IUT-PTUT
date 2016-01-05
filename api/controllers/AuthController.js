var passport = require('passport');

module.exports = {

    //===== VIEWS =====//

    signup: function (req, res) {

        if (req.session.signup_error) {
            var error = req.session.signup_error;

            req.session.signup_error = null;
            // TODO Erreurs
            return res.view('auth/signup', DataViewService.create('Inscription', {}));
        }

        return res.view('auth/signup', DataViewService.create('Inscription'));
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

        User.signup({
            display_name: req.param('firstname') + ' ' + req.param('name'),
            mail: req.param('mail'),
            password: req.param('password'),
            passwordConfirmation: req.param('passwordConfirmation')
        }, function (err, user) {
            if (err) {
                req.session.signup_error = {message: err.message};
                return res.redirect('/auth/signup');
            }

            req.logIn(user, function (err) {
                if (err) return res.serverError();

                if (req.wantsJSON) return res.ok('Signup successful !');
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