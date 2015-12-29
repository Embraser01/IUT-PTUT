module.exports = {

    //===== VIEWS =====//

    login: function (req, res) {
        if (req.session['login_error']) {
            var error = "Une erreur est survenu";

            switch (error) {
                case 1:
                    error = "Mauvaise combinaison email/ mot de passe";
                    break;
            }
            req.session['login_error'] = null;
            return res.view('auth/login', {error: error});
        }

        return res.view('auth/login');
    },

    signup: function (req, res) {

        if (req.session['signup_error']) {
            var error = "Une erreur est survenu";

            switch (error) {
            }

            req.session['signup_error'] = null;
            return res.view('auth/signup', {error: error});
        }

        return res.view('auth/signup');
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
            if (err){
                req.session['signup_error'] = 1;
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
            if (err){
                req.session['login_error'] = 1;
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