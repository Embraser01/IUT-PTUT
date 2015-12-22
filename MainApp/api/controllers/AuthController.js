module.exports = {
    login: function (req, res) {
        return res.render('auth/login');
    },

    signup: function (req, res) {
        return res.render('auth/signup');
    },



    processLogin: function (req, res) {

        User.login({
            mail: req.param('mail'),
            password: req.param('password')
        }, function (err, user) {
            if (err) return res.ok(err);

            req.session.me = user.id;

            if (req.wantsJSON) {
                return res.ok('Login successful !');
            }

            return res.redirect('/');
        });
    },

    processLogout: function (req, res) {
        req.session.me = null;

        if (req.wantsJSON) {
            return res.ok('Logged out successfully!');
        }

        return res.redirect('/login');
    },

    processSignup: function (req, res) {

        User.signup({
            name: req.param('name'),
            firstname: req.param('firstname'),
            mail: req.param('mail'),
            password: req.param('password'),
            passwordConfirmation: req.param('passwordConfirmation')
        }, function (err, user) {
            if (err) return res.ok(err);

            req.session.me = user.id;

            if (req.wantsJSON) {
                return res.ok('Signup successful !');
            }

            return res.redirect('/');
        });
    }
};