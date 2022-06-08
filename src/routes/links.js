const express = require('express');
const router = express.Router();

const conn = require('../database');

router.get('/add', (req, res)=>{
    res.send('Form');
});

module.exports = router;