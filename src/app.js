require('./db');
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');


const User = mongoose.model('User');
const Internship = mongoose.model('Internship');

const path = require('path');
const app = express();
const flash = require('connect-flash');

const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
// require('mongoose/node_modules/mongodb');
app.use(flash());


passport.use(new LocalStrategy(
    User.authenticate()
  ));

  passport.serializeUser(function(user, done) {
    done(null, user.username);
  });
  
  passport.deserializeUser(function(username, done) {
    User.findOne({username: username}, function (err, user) {
        done(err, user);
      });
  });
  

const sessStore = new MongoDBStore({
    uri: process.env.MONGODB_URI || 'mongodb://localhost/hackNYU',
});

const sessionOptions = {
    secret: 'secret cookie thang (store this elsewhere!)',
    resave: true,
    saveUninitialized: true,
    store: sessStore
};

app.use(session(sessionOptions));

app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'hbs');

app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());
app.use(passport.session());

app.get('/', checkAuthenticated, function(req, res) {
    
    Internship.find({user: req.user.username}, function(err, internship){
        if(err){
            throw err;
        }
        else{
            if(internship === null || internship === undefined){
                res.render('index', {user: req.user.username});
            }
            else{
                const temp =[];
                internship.forEach(internship => temp.push(internship));
                res.render('index', {internship: temp, user: req.user.username});
            }
        }
    });
    
});
app.post('/', checkAuthenticated, function(req, res) {
    const company = req.body.company;
    const position = req.body.position;
    const status = req.body.status;
    const date = (req.body.date).substring(0,15);
    const obj = {
        user: req.user.username,
        company: company,
        role: position,
        status: status,
        date: date
    };
    new Internship(obj).save(function(){
        if (req.session.internship === undefined) {
            req.session.internship = [];
            req.session.internship.push(obj); 
        } 
        else {
            req.session.internship.push(obj);
        }
    });
    res.redirect('/');
});

app.get('/login', function(req, res) {
    if(req.query.message !== undefined){
        res.render('login', {message: req.query.message});
    }
    else{
        res.render('login');
    }
});

app.post('/login', passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash : true
    }),
    function(req, res){
        res.redirect('/');
    });


app.get('/create', function(req, res) {
    res.render('create');
});

app.post('/create', function(req, res){
    User.register(new User({username:req.body.username}), 
      req.body.password, function(err){
    if (err) {
      res.render('error',{message: "Error", err:'Your registration information is not valid. Please try a different username.'});
    } else {
      passport.authenticate('local')(req, res, function() {
        res.redirect('/');
      });
    }
  });  
});


function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect('/login');
  }
app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
  });

app.listen(process.env.PORT || 5000);
