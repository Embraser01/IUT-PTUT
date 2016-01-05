var passport = require('passport')
    , LocalStrategy = require('passport-local').Strategy
    , FacebookStrategy = require('passport-facebook').Strategy
    , GoogleStrategy = require('passport-google-oauth').OAuth2Strategy
    , TwitterStrategy = require('passport-twitter').Strategy;
var crypto = require('crypto');


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

var verifyExtHandler = function (token, tokenSecret, profile, done) {
    process.nextTick(function () {

        console.log(profile);
        User.findOne({ext_id: profile.id}, function (err, user) {
            if (user) {
                return done(null, user);
            } else {

                var data = {
                    provider: profile.provider,
                    ext_id: profile.id
                };

                if (profile.emails && profile.emails[0] && profile.emails[0].value) {
                    data.mail = profile.emails[0].value;
                }
                if (profile.name) {
                    data.display_name = (profile.name.givenName || profile.displayName || '');
                    data.display_name += ' ' + (profile.name.familyName || '');

                    // TODO Ameliorer le chargement du nom
                }

                User.create(data, function (err, user) {
                    return done(err, user);
                });
            }
        });
    });
};

var verifyHandler = function (mail, password, done) {

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

};

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
}, verifyHandler));

passport.use(new FacebookStrategy({
    clientID: "1495800297394232",
    clientSecret: "fcd8ebebdca9b3a1bd3ed86d0493dd47",
    callbackURL: "http://mindmap.finch4.xyz/auth/facebook"
}, verifyExtHandler));

passport.use(new GoogleStrategy({
    clientID: '1029741521146-eb56ggu46da490ta054ladk6sdjet09h.apps.googleusercontent.com',
    clientSecret: 'LvX-UkhMxccaQ2G2MPXEcAUx',
    callbackURL: 'http://mindmap.finch4.xyz/auth/google'
}, verifyExtHandler));

passport.use(new TwitterStrategy({
    consumerKey: '3yWc5VDMuRiCxmv54UsfgSh1Z',
    consumerSecret: '0MQ0TGu9d7cVYt2FapeU6rrTWQNIvGgEDH7aXBbMs6OC4GOObJ',
    callbackURL: 'http://mindmap.finch4.xyz/auth/twitter'
}, verifyExtHandler));
