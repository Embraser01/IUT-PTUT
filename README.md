# MindMap Collaboratif

## Presentation

  C'est une plate-forme d'édition collaborative de carte mentale avec une gestion avancée des droits.
  Le projet s'est déroulé de novembre 2015 à mars 2016.
  C'est le projet de fin d'étude fait par 3 étudiants de l'IUT Informatique Lyon 1 - Site Bourg-en-Bresse :
*    ALLIAUME Hugo
*    CHAZELLE Benjamin
*    FERNANDES Marc-Antoine

## Mise en ligne

### Dépendance

-  [Node JS](https://nodejs.org) V4.4.0 LTS
-  [MySQL](http://dev.mysql.com/downloads/)
-  Navigateur récent
  -  Chrome
  -  Mozilla
  -  Edge
  

### Téléchargement et installation des dépendances

Cloner le repo avec Git :
```bash
git clone https://github.com/Embraser01/IUT-PTUT.git
```

Installer les dépendances

```bash
cd IUT-PTUT/
npm install
```

###  Configuration

Créer les trois fichiers suivant dans /config:

-  connections.js (gère la connexion à la base de données)
```javascript

module.exports.connections = {

  mysql: {
    adapter: 'sails-mysql',
    host: 'localhost',
    user: 'XXXXXX',
    password: 'XXXXXX',
    database: 'XXXXXXX'
  },
};

```

-  local.js (gère le mode du serveur et le port, en production, les fichiers sont minifiés)

```javascript

module.exports = {
    port: process.env.PORT || 8000, // Changer le port de connexion ici
    
    //environment: 'production'
    environment: 'development'

};
```

-  passport.js (Gère la connexion depuis l'intérieur et l'extérieur)

```javascript

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

        User.findOne({ext_id: profile.id}, function (err, user) {
            if (user) {
                return done(null, user);
            } else {

                var data = {
                    provider: profile.provider,
                    ext_id: profile.id
                };

                if (profile.name) {
                    data.display_name = (profile.name.givenName || profile.displayName || '');
                    data.display_name += ' ' + (profile.name.familyName || '');

                } else {
                    data.display_name = profile.displayName || ('Guest from ' + data.provider);
                }

                if(profile.photos && profile.photos[0]) data.img_url = profile.photos[0].value;

                if(profile.provider == 'facebook') data.img_url = 'https://graph.facebook.com/' + profile.id + '/picture';

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
        // Changer le "N'importeQuoi..." ici et dans /api/models/User.js dans la fonction signup par une autre chaine de caractère
        if (user.password === crypto.createHash('sha256').update("N'importeQuoi..." + crypto.createHash('sha256').update(password).digest('hex')).digest('hex')) {

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

// Remplacer les 'XXXXX' par vos clés et 'yourhost.com' par votre nom de domaine
passport.use(new FacebookStrategy({
    clientID: "XXXXXX",
    clientSecret: "XXXXXX",
    callbackURL: "http://yourhost.com/auth/facebook"
}, verifyExtHandler));

passport.use(new GoogleStrategy({
    clientID: 'XXXXXX',
    clientSecret: 'XXXXXXXXXXXX',
    callbackURL: 'http://yourhost.com/auth/google'
}, verifyExtHandler));

passport.use(new TwitterStrategy({
    consumerKey: 'XXXXXX',
    consumerSecret: 'XXXXXX',
    callbackURL: 'http://yourhost.com/auth/twitter'
}, verifyExtHandler));

```


Forcer la construction de la base de données (changer la première fois et remettre par défaut ('safe') )

-  /config/model.js

```javascript

migrate: 'drop'

```

### Lancer le serveur
```bash
sails lift
```


## Licence

[Copyright (C) 2016  Hugo ALLIAUME Benjamin CHAZELLE Marc-Antoine FERNANDES](https://github.com/Embraser01/IUT-PTUT/blob/master/LICENSE)
