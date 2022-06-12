const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const conn = require('../database');
const helpers = require('./helpers');

//LOGEO
passport.use('local.login', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
}, async(req, username, password, done) =>{
    if (req.body.username !== '' && req.body.password !== ''){
        const rows = await conn.query('SELECT * FROM users WHERE username = ?', [username]);
        // VALIDACIÓN DE USUARIO
        if (rows.length > 0){
            const user = rows[0];
            const validPassword = await helpers.compPassword(password, user.password);
            // VALIDACIÓN DE CONTRASEÑA
            if (validPassword){
                done(null, user);
            }else{
                done(null, false, req.flash('danger', 'La contraseña no es correcta'))
            }
        }else{
            return done(null, false, req.flash('danger', 'El usuario ingresado no existe'));
        }
    }
}));

// REGISTRO
passport.use('local.register', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
}, async (req, username, password, done) =>{
    const { usern, fullname, email, passw } = req.body;
    const newUser = {
        username,
        fullname,
        email,
        password
    };
    // VALIDACIÓN CAMPOS VACÍOS
    if (usern !== '' && fullname !== '' && email !== '' && passw !== ''){
        // VALIDACIÓN USUARIO < 15 CARÁCTERES
        if (newUser.username.length>15) {
            return done(null, false, req.flash('danger', 'El nombre de usuario no debe tener más de 15 carácteres'));
                // VALIDACIÓN USUARIO >= 3 CARÁCTERES
        } else if (newUser.username.length<3) {
            return done(null, false, req.flash('danger', 'El nombre de usuario debe tener al menos 3 carácteres'));
                // VALIDACIÓN NOMBRE < 100 CARÁCTERES
        } else if (newUser.fullname.length>100) {
            return done(null, false, req.flash('danger', 'El nombre no debe tener más de 100 carácteres'));
                // VALICACIÓN NOMBRE <=3 CARÁCTERES
        } else if (newUser.fullname.length<3) {
            return done(null, false, req.flash('danger', 'El nombre debe tener al menos 3 carácteres'));
                // VALIDACIÓN CORREO < 50 CARÁCTERES
        } else if (newUser.email.length>50) {
            return done(null, false, req.flash('danger', 'El correo eléctronico no debe tener más de 50 carácteres'));
                // VALIDACIÓN FORMATO CORREO ELÉCTRONICO
        }else if (/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(newUser.email)) {
            return done(null, false, req.flash('danger', 'Ingrese un correo eléctronico válido'));
                // VALIDACIÓN CONTRASEÑA >= 8
        } else if (newUser.password.length>8) {
            const rows = await conn.query('SELECT * FROM users WHERE username = ?', [username]);
            // VALIDACIÓN USUARIO EN USO
            if (rows.length > 0){
                return done(null, false, req.flash('warning', 'El nombre de usuario ingresado ya se encuentra en uso'));
            } else {
                newUser.password = await helpers.encryptPassword(password);
                const result = await conn.query('INSERT INTO users SET ?', [newUser]);
                newUser.id = result.insertId;
                console.log("NUEVO USUARIO REGISTRADO: ", newUser.username);
                return done(null, newUser);
            }
        } else {
            return done(null, false, req.flash('danger', 'La contraseña como mínimo debe detener 8 carácteres'));
        }
    } 


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