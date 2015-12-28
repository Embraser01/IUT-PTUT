module.exports = {
    login: function (req, res) {
        return res.view('auth/login');
    },

    signup: function (req, res) {
        return res.view('auth/signup');
    },



    processLogin: function (req, res) {

        User.login({
            mail: req.param('mail'),
            password: req.param('password')
        }, function (err, user) {
            if (err) return res.ok(err);

            req.session.user = user;

            if (req.wantsJSON) {
                return res.ok('Login successful !');
            }

            return res.redirect('/');
        });
    },

    processLogout: function (req, res) {
        req.session.user = null;

        if (req.wantsJSON) {
            return res.ok('Logged out successfully!');
        }

        User.subscribe(req, user, 'message');

        // Get updates about users being created
        User.watch(req);

        // Get updates about rooms being created
        MindMap.watch(req);

        // Publish this user creation event to every socket watching the User model via User.watch()
        User.publishCreate(user, req);

        return res.redirect('/auth/login');
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

            req.session.user = user;

            if (req.wantsJSON) {
                return res.ok('Signup successful !');
            }

            User.subscribe(req, user, 'message');

            // Get updates about users being created
            User.watch(req);

            // Get updates about rooms being created
            Room.watch(req);

            // Publish this user creation event to every socket watching the User model via User.watch()
            User.publishCreate(user, req);

            return res.redirect('/');
        });
    }
};