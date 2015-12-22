/*===== MODULES =====*/

var express = require('express');
var session = require('express-session');

var bodyParser = require('body-parser');

var app = express();

var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var ent = require('ent');


// MySQL

var params = require('./params/param.js');

var mysql = require('mysql');
var connection = mysql.createConnection({
    host: params.hostname,
    user: params.username,
    password: params.password,
    database: params.database
});


connection.query('SELECT 1 + 1 AS solution', function (err, rows, fields) {
    if (err) throw err;
    console.log('The solution is: ', rows[0].solution);
});


/*===== FUNCTIONS =====*/


function requireLogin(req, res, next){
    if(!req.session.mail) return next(new Error("You have to be log"));

    next();
}


/*===== APP INIT =====*/

app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


/*===== SESSION INIT ======*/

var sessionMiddleware = session({
    secret: "cestpasmoimaisenvraisimaisbon"
});

io.use(function (socket, next) {
    sessionMiddleware(socket.request, socket.request.res, next);
});

app.use(sessionMiddleware);


/*===== ROUTES =====*/

var sess;

// Accueil

app.get('/', requireLogin, function (req, res) {
    sess = req.session;
    if (!sess.mail) res.redirect('/login');
    else res.render('index.ejs', {mail: sess.mail.split('@')[0]});

    next();
});



app.post('/login/auth', function (req, res) {
    sess = req.session;

    sess.mail = req.body.mail;
    sess.password = req.body.password;

    res.redirect('/');

    next();
});


// Logout

app.get('/logout', requireLogin, function (req, res) {
    req.session.destroy(function (err) {
        if (err) console.log(err);
        else res.redirect('/');
    });

    next();
});


// Login

app.get('/login', function (req, res) {
    sess = req.session;
    if (sess.mail) res.redirect('/');
    else res.render('login.ejs');

    next();
});



// Default Error 404

app.use(function (err, req, res, next) {
    res.status(404);
    res.render('errors/404.ejs');
});


/*===== SOCKET.IO =====*/

io.sockets.on('connection', function (socket) {

    socket.on('nouveau_client', function () {
        console.log(socket.request.session);
        socket.pseudo = sess.mail.split('@')[0];
        socket.broadcast.emit('nouveau_client', socket.pseudo);
    });

    // Dès qu'on reçoit un message, on récupère le pseudo de son auteur et on le transmet aux autres personnes
    socket.on('message', function (message) {

        if (message != null && message != "") {
            message = ent.encode(message);
            socket.broadcast.emit('message', {pseudo: socket.pseudo, message: message});
        }
    });
});

server.listen(8000);


/*==== END SERVER ====*/

connection.end();