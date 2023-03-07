const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const passport = require("passport");
const path = require("path");
const config = require('./config/db')
const account = require('./routes/account')
const session = require('express-session');
const Post = require('./models/post');

const app = express(); 

const port = 3000;

app.use(passport.initialize()); // ініціалізація бібліотеки
app.use(session({
	secret: 'some_secret_key',
	resave: false,
	saveUninitialized: false
  })); // використання сесій
require('./config/passport')(passport); // будемо викликати функцію записану в passport.js

app.use(cors());

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true, parameterLimit: 1000000}));

mongoose.connect(config.db);

mongoose.connection.on('connected', () => {
	console.log('Successful connection to the database')
});

mongoose.connection.on('error', (err) => {
	console.log('Not successful connection to the database' + err)
});

app.listen(port, () => {
	console.log("The server was running on the port:" + port)
});

app.get('/', (req, res) => {
	Post.find().then( posts => res.json(posts))
});

app.get('/post/:id', (req, res) => {
	let url = req.url.split('/')
	id = url[2]
	Post.findById(id).then( post => res.json(post))
});

app.get('/reg', (req, res) => {
	res.send("Registration page!")
});

app.get('/auth', (req, res) => {
	res.send("Login page!")
});

app.get('/dashboard', (req, res) => {
	res.send("Dashboard!")
});

app.use('/account', account);

app.delete('/post/:id',  (req, res) => { // passport.authenticate('jwt', { session: true}),
	let url = req.url.split('/')
	id = url[2]
	Post.deleteOne({ _id: id}).then( () => res.json( { success: true}))
});