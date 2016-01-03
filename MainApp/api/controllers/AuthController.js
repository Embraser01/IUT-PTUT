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
            name: req.param('name'),
            firstname: req.param('firstname'),
            mail: req.param('mail'),
            password: req.param('password'),
            passwordConfirmation: req.param('passwordConfirmation')
        }, function (err, user) {
            if (err) {
                req.session.signup_error = {message: err.message};
                return res.redirect('/auth/signup');
            }

            req.session.user = user;

            if (req.wantsJSON) return res.ok('Signup successful !');
            return res.redirect('/');
        });
    },

    processLogin: function (req, res) {

        User.login({
            mail: req.param('mail'),
            password: req.param('password')
        }, function (err, user) {
            if (err) {
                req.session.login_error = {message: err.message};
                return res.redirect('/auth/login');
            }
            if (!user) { // Not found in database
                req.session.login_error = {message: 'User not found'};
                return res.redirect('/auth/login');
            }

            req.session.user = user;

            if (req.wantsJSON) return res.ok('Login successful !');
            return res.redirect('/');
        });
    },

    processLogout: function (req, res) {
        req.session.user = null;

        if (req.wantsJSON) {
            return res.ok('Logged out successfully!');
        }

        return res.redirect('/auth/login');
    }
};