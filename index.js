import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import passport from 'passport';
import path from 'path';
import { Strategy } from 'passport-facebook';

let session = require('express-session');


/** passport setup */
passport.use(new Strategy({
    clientID: 'facebook-app-id',
    clientSecret: 'facebook-app-secret',
    callbackURL: "http://localhost:3000/auth/facebook/callback",
    profileFields: ['id', 'displayName','email'],
    enableProof: true
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

mongoose.Promise = global.Promise;

mongoose.connect('mongodb://localhost/social_login')
  .then(() =>  console.log('connection successful'))
  .catch((err) => console.error(err));


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

app.get('/auth/facebook', passport.authenticate('facebook', {scope:"email"}));

app.get('/auth/facebook/callback', passport.authenticate('facebook', { successRedirect: '/account', failureRedirect: '/' }));

app.use('/auth/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

app.listen(3000);