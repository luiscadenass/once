const express = require('express');
const morgan = require('morgan');
const { engine } = require('express-handlebars');
const path = require('path');
const session = require('express-session');
const mysqlstore = require('express-mysql-session');
const passport = require('passport');


const { database } = require ('./keys');

const app = express();
require('./lib/passport');

app.set('port', process.env.PORT || 4020);
app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', engine({
    defaultlayout: "main",
    layoutsDir: path.join(app.get('views'), 'layout'),
    partialsDir: path.join(app.get('views'), 'partials'),
    extname :'.hbs',
    helpers: require('./lib/handlebars')
}))
app.set('view engine', '.hbs');

app.use(session({
    secret: 'session',
    resave: false,
    saveUninitialized: false,
    store: new mysqlstore(database)
}));
app.use(morgan('dev'));
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());

// GLOBAL-VARS
app.use((req, res, next)=>{
    app.locals.user = req.user;
    next();
});

// ROUTERS
app.use(require('./routes'));

// PUBLIC
app.use(express.static(path.join(__dirname, 'public')));

//

app.listen(app.get('port'), ()=>{
    console.log('SERVIDOR EJECUTANDOSE EN EL PUERTO', app.get('port'));
})