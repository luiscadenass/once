const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const conn = require('../database');
const helpers = require('./helpers');

passport.use('local.login', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
}, async(req, username, password, done) =>{
    const rows = await conn.query('SELECT * FROM users WHERE username = ?', [username]);
        if (rows.length > 0){
            const user = rows[0];
            const validPassword = await helpers.compPassword(password, user.password);
            if (validPassword){
                done(null, user);
            }else{
                done(null, false)
            }
        }else{
            return done(null, false);
        }

}));

passport.use('local.register', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
}, async (req, username, password, done) =>{
    const { fullname, email } = req.body
    const newUser = {
        username,
        fullname,
        email,
        password
    };
    newUser.password = await helpers.encryptPassword(password);
    const result = await conn.query('INSERT INTO users SET ?', [newUser]);
    newUser.id = result.insertId;
    console.log(result);
    return done(null, newUser);

}));

passport.serializeUser((user, done) =>{
    done(null, user.id);
});

passport.deserializeUser(async (id, done) =>{
     await conn.query('SELECT * FROM users WHERE id = ?', [id], (err, result)=>{
         if (err){
             throw err;
         }else{
             if (result.length>0){
                 console.log('Hay algo en la consulta');
                 return done(null, result[0]);
             }else{
                 console.log('La consulta está vacía');
                 return done(null, false);
             }
         }
     });
    return done(null, rows[0]);
});