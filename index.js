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

var mysql      = require('mysql');
var connection = mysql.createConnection({
    host     : hostname,
    user     : username,
    password : password,
    database: database
});


connection.query('SELECT 1 + 1 AS solution', function(err, rows, fields) {
    if (err) throw err;
    console.log('The solution is: ', rows[0].solution);
});



/*===== APP INIT =====*/

app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

connection.connect();

/*===== SESSION INIT ======*/

var sessionMiddleware = session({
    secret: "cestpasmoimaisenvraisimaisbon"
});

io.use(function(socket, next) {
    sessionMiddleware(socket.request, socket.request.res, next);
});

app.use(sessionMiddleware);


/*===== ROUTES =====*/

var sess;

// Accueil

app.get('/', function (req, res) {
    sess = req.session;
    if (!sess.mail) res.redirect('/login');
    else res.render('index.ejs', {mail: sess.mail.split('@')[0]});
});

// Login

app.get('/login', function (req, res) {
    sess = req.session;
    if (sess.mail) res.redirect('/');
    else res.render('login.ejs');
});


app.post('/login/auth', function (req, res) {
    sess = req.session;

    sess.mail = req.body.mail;
    sess.password = req.body.password;

    res.redirect('/');
});


// Logout

app.get('/logout', function (req, res) {
    req.session.destroy(function (err) {
        if (err) console.log(err);
        else res.redirect('/');
    });
});


// Default Error 404

app.use(function (req, res, next) {
    res.setHeader('Content-Type', 'text/html');
    res.render(404, 'errors/404.ejs');
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