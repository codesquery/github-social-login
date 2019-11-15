import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import passport from 'passport';
import path from 'path';
import { Strategy } from 'passport-github2';

let session = require('express-session');


/** passport setup */
passport.use(new Strategy({
    clientID: '4fb763621db9d2a88652',
    clientSecret: '16e6728d73ca1f81cbaad89f964606fa1cf91e56',
    callbackURL: "http://localhost:3000/auth/github/callback"
  },
  function(accessToken, refreshToken, user, cb) {
    return cb(null,user);
  }
));

passport.serializeUser(function(user, cb) {
    cb(null, user);
  });
  
passport.deserializeUser(function(obj, cb) {
    cb(null, obj);
});



const app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

/** set app */

app.use(cors());
app.use(bodyParser.json({
    limit: '50mb'
  }));

//passport middleware
app.use(session({
    secret: 's3cr3t',
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname + '/public'));

const isAuthenticated = async (req, res, next) => {
    if (req.isAuthenticated()) { return next(); }
    res.redirect('/');
}

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/account', isAuthenticated, (req, res) => {
    res.render('success', { 'user' : req.user._json});
});

app.get('/auth/github', passport.authenticate('github', { scope: [ 'user:email' ] }));

app.get('/auth/github/callback', passport.authenticate('github', { successRedirect: '/account', failureRedirect: '/' }));

app.use('/auth/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

app.listen(3000);