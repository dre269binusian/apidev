const express = require('express');
let loginRoute = express.Router()

loginRoute.post('/', (req, res, next) => {
    let status = 200, error = null;
    let dataLoginNya = {
        email: req.body.email,
        password: req.body.password
    }

    if(!req.body.email){
        status = 422;
        error = 'Email kosong';
    }

    if(!req.body.password){
        status = 422;
        error = 'Password kosong';
    }


    let sql = 'SELECT * FROM users WHERE ? ';
    db.any(sql, [dataLoginNya], (error, results, fields) => {
        if(error) throw error;
        res.send({
            'status' : 200,
            'error'  : null,
            'response' : results
        });
    });

    // res.send({
    //     'status' : status,
    //     'error'  : error,
    //     'response' : dataLoginNya
    // });
});


module.exports = loginRoute;
