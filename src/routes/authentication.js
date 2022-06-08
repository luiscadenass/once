const express = require('express');
const router = express.Router();
const app = express();


const passport = require('passport');
const { isLoggedIn, isNotLoggedIn } = require('../lib/auth');

router.get('/register', isNotLoggedIn, (req, res)=>{
    res.render('auth/register')
});

router.post('/register', passport.authenticate('local.register', {
    successRedirect: '/local',
    failureRedirect: '/register'
}));

router.get('/login', (req, res)=>{
    res.render('auth/login')
});

router.post('/login', isNotLoggedIn, (req, res, next)=>{
    passport.authenticate('local.login',{
        successRedirect: 'local',
        failureRedirect: 'login'
    }), function(req, res, next){

    }
});

router.get('/local', isLoggedIn, (req, res)=>{
    res.render('local');
});

router.get('/logout', function(req, res) {
    console.log("I am Logout")
    req.logout(); 
    req.session.destroy((err)=>res.redirect('/'));
});


module.exports = router;