const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

const conn = mysql.createConnection({
    host : '127.0.0.1',
    user : 'root',
    password : '',
    database : 'crud_db'
})
conn.connect((err) => {
    if (err) throw err;
    console.log('MySql Connected ...');
})

const myLog = (req, res, next) => {
    console.log("Request URL:", req.url);
    console.log("Request Type:", req.method);
    next()
}

const checkActivity = (req, res, next) => {
    if (req.body.product_price <= 0) {
        res.json({
            "error" : "product price tidak boleh <=0"
        })
    }
    else if (isNaN(req.body.product_price)) {
        res.json({
            "error" : "product price wajib diisi dengan angka"
        })
    }
    else {
        next();
    }
}

app.use(myLog)
app.use((err, req, res, next) => {
    res.status(500).send('Something broke!');
})
app.get('/api/products', (req, res) => {
    let sql = 'SELECT * FROM product';
    let query = conn.query(sql, (err, results) => {
        if (err) throw err;
        res.json(results);
    })
})
app.get('/api/products/:id', (req, res) => {
    let sql = 'SELECT * FROM product WHERE product_id=' + req.params.id;
    let query = conn.query(sql, (err, results) => {
        if (err) throw err;
        if (results.length === 0) {
            res.status(404).send('No Identity');
        }
        else {
            res.json(results);
        }
    })
})

app.post('/api/products', checkActivity, (req, res, next) => {
    let data = {
        product_name : req.body.product_name,
        product_price : req.body.product_price
    }
    let sql = 'INSERT INTO product SET ?';
    let query = conn.query(sql, data, (err, result) => {
        if (err) throw err;
        console.log(data);
        res.json({
            'response' : 'INSERT'
        })
    })
})

app.put('/api/products/:id', checkActivity, (req, res, next) => {
    let sql = "UPDATE product SET product_name='" + req.body.product_name + "',product_price='" + req.body.product_price + "'WHERE product_id=" + req.params.id;
    let query = conn.query(sql, (err, result) => {
        if (err) throw err;
        console.log(sql);
        if (result.affectedRows === 0) {
            res.status(404).send('identity not found PUT, Add data with POST');
        }
        else {
            res.json({
                'response' : 'UPDATED'
            })
        }
    })
})

app.delete('/api/products/:id', (req, res, next) => {
    let sql = 'DELETE FROM product WHERE product_id='+req.params.id;
    let query = conn.query(sql, (err, result) => {
        if (err) throw err;
        if (result.affectedRows === 0) {
            res.status(404).send('Identity already deleted');
        }
        else {
            res.json({
                'response' : 'DELETED'
            })
        }
    })
})

app.listen(3000, () => {
    console.log("Server json running at 3000");
})