module.exports = {
    login: function (req, res) {
        return res.login({
            email: req.param('email'),
            password: req.param('password'),
            successRedirect: '/',
            invalidRedirect: '/login'
        })
    },

    logout: function (req, res) {
        req.session.me = null;

        if (req.wantsJSON) {
            return res.ok('Logged out successfully!');
        }

        return res.redirect('/login');
    },

    signup: function (req, res) {

        User.signup({
            name: req.param('name'),
            email: req.param('email'),
            password: req.param('password')
        }, function (err, user) {
            if (err) return res.negociate(err);

            req.session.me = user.id;

            if (req.wantsJSON) {
                return res.ok('Signup successful !');
            }

            return res.redirect('/');
        });
    }
};