const express = require('express');
const router = express.Router();
const app = express();

const conn = require('../database');

const passport = require('passport');
const { isLoggedIn, isNotLoggedIn } = require('../lib/auth');

router.get('', (req, res)=>{
    res.render('index', {layout: '2.hbs'});
});

router.get('/register', (req, res)=>{
    res.render('auth/register', {layout: '2.hbs'});
});

router.post('/register', passport.authenticate('local.register', {
    successRedirect: 'local',
    failureRedirect: 'register'
}));

router.get('/login', (req, res)=>{
    res.render('auth/login', {layout: '2.hbs'});
});

router.post('/login', (req, res, next)=>{
    passport.authenticate('local.login',{
        successRedirect: 'local',
        failureRedirect: 'login',
        failureFlash: true
        })(req, res, next)
});

router.get('/local', isLoggedIn, async (req, res)=>{
    const products = await conn.query('SELECT * FROM inventory');
    res.render('crud/local', { products });
});

router.post('/local', async (req, res)=>{
    const { product_name, product_quantity, product_presentation, product_description } = req.body
    const newItem = {
        product_name,
        product_quantity,
        product_presentation,
        product_description
    };
    // VALIDACIÓN CAMPOS VACÍOS
    if (product_name !== '' && product_quantity !== '' && product_description !== '' && product_presentation !== ''){
        await conn.query('INSERT INTO inventory set ?', [newItem]);
        req.flash('success', 'Guardado  correctamente');
        res.redirect('/local');
    } else {
        req.flash('danger', 'Por favor, rellene todos los campos');
        res.redirect('/local');
    }
});

router.get('/edit/:id', isLoggedIn, async (req, res)=>{
    const { id } = req.params;
    const products = await conn.query('SELECT * FROM inventory WHERE ID = ?', [id]);
    res.render('crud/edit', {products: products[0]});
});

router.post('/edit/:id', async (req, res)=>{
    const { id } = req.params;
    const { product_name, product_quantity, product_description, product_presentation } = req.body
    const newItem = {
        product_name,
        product_quantity,
        product_description,
        product_presentation
    };
    // VALIDACIÓN CAMPOS VACÍOS
    if (product_name !== '' && product_quantity !== '' && product_description !== '' && product_presentation !== ''){
        await conn.query('UPDATE inventory set ? WHERE id = ?', [newItem, id]);
        req.flash('success', 'Guardado  correctamente');
        res.redirect('/local');
    } else {
        req.flash('danger', 'Por favor, rellene todos los campos');
        res.redirect('/local');
    }
});

router.get('/delete/:id', isLoggedIn, async (req, res)=>{
    const { id } = req.params;
    await conn.query('DELETE FROM inventory WHERE ID = ?', [id]);
    req.flash('success', 'Eliminado correctamente');
    res.redirect('/local');
});

module.exports = router;