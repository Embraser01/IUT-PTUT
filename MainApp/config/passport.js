var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy;
var crypto = require('crypto');


//helper functions
function findById(id, fn) {
    User.findOne(id).exec(function (err, user) {
        if (err) {
            return fn(null, null);
        } else {
            return fn(null, user);
        }
    });
}

function findByMail(m, fn) {

    User.findOne({
        mail: m
    }).exec(function (err, user) {
        // Error handling
        if (err) {
            return fn(null, null);
            // The User was found successfully!
        } else {
            return fn(null, user);
        }
    });
}

// Passport session setup.
// To support persistent login sessions, Passport needs to be able to
// serialize users into and deserialize users out of the session. Typically,
// this will be as simple as storing the user ID when serializing, and finding
// the user by ID when deserializing.
passport.serializeUser(function (user, done) {
    user.password = null;
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    done(null, user);
});

// Use the LocalStrategy within Passport.
// Strategies in passport require a `verify` function, which accept
// credentials (in this case, a username and password), and invoke a callback
// with a user object.
passport.use(new LocalStrategy({
        usernameField: 'mail',
        passwordField: 'password'
    },
    function (mail, password, done) {

        // Find the user by username. If there is no user with the given
        // username, or the password is not correct, set the user to `false` to
        // indicate failure and set a flash message. Otherwise, return the
        // authenticated `user`.
        findByMail(mail, function (err, user) {
            if (err)
                return done(null, err);
            if (!user) {
                return done(null, false, {
                    message: 'Unknown mail ' + mail
                });
            }

            if (user.password === crypto.createHash('sha256').update("42IAmASalt42" + crypto.createHash('sha256').update(password).digest('hex')).digest('hex')) {

                return done(null, user, {
                    message: 'Logged In Successfully'
                });
            } else {
                return done(null, false, {
                    message: 'Invalid Password'
                });
            }
        });

    }
));