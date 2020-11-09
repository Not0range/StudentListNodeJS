const express = require('express');
const morgan = require('morgan');
const fetch = require('node-fetch');
const jwt = require('jwt-simple');
const cookieParser = require('cookie-parser');

const sql = 'localhost';//'172.18.0.2';
const hostname = '127.0.0.1';
const port = 3000;
const secret = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.';

const app = express();

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/', express.static(__dirname + '/src'))

app.get('/students', (req, res) =>{
    fetch(`http://${sql}:4200/_sql`, {
        method: 'POST',
        body:JSON.stringify({
            'stmt':'select * from Students order by id'
        })
    })
    .then(res => res.json())
    .then(result => {
        res.json(result.rows);
    });
});

app.put('/students', (req, res) =>{
    fetch(`http://${sql}:4200/_sql`, {
        method: 'POST',
        body:JSON.stringify({
            'stmt':`select * from Cookies Where Cookie = '${req.cookies.id}'`
        })
    })
    .then(chk => chk.json())
    .then(chk_result => {
        if(chk_result.rowcount > 0){
            if('id' in req.body && 'fio' in req.body && 'course' in req.body
                && 'spec' in req.body && 'number' in req.body && !isNaN(+req.body.course)){
                fetch(`http://${sql}:4200/_sql`, {
                    method: 'POST',
                    body:JSON.stringify({
                        'stmt':`insert into Students 
                        values(${req.body.id}, '${req.body.fio}', 
                            ${req.body.course}, '${req.body.spec}', '${req.body.number}')`
                        })
                });
                res.status(201);
            }
            else
                res.status(400);
        }
        else
            res.status(401);
    });
});

app.post('/students', (req, res) =>{
    fetch(`http://${sql}:4200/_sql`, {
        method: 'POST',
        body:JSON.stringify({
            'stmt':`select * from Cookies Where Cookie = '${req.cookies.id}'`
        })
    })
    .then(chk => chk.json())
    .then(chk_result => {
        if(chk_result.rowcount > 0){
            if('id' in req.body && 'fio' in req.body && 'course' in req.body
                && 'spec' in req.body && 'number' in req.body && !isNaN(+req.body.course)){
                    fetch(`http://${sql}:4200/_sql`, {
                        method: 'POST',
                        body:JSON.stringify({
                            'stmt':`update Students set
                            fio = '${req.body.fio}', 
                            course = ${req.body.course}, 
                            spec = '${req.body.spec}', 
                            num = '${req.body.number}' where ID = ${req.body.id}`
                            })
                    });
            }
            else
                res.sendStatus(400);
        }
        else
            res.sendStatus(401);
    });
});

app.delete('/students', (req, res) =>{
    fetch(`http://${sql}:4200/_sql`, {
        method: 'POST',
        body:JSON.stringify({
            'stmt':`select * from Cookies Where Cookie = '${req.cookies.id}'`
        })
    })
    .then(chk => chk.json())
    .then(chk_result => {
        if(chk_result.rowcount > 0){
            fetch(`http://${sql}:4200/_sql`, {
                method: 'POST',
                body:JSON.stringify({
                    'stmt':`delete from Students where ${req.body.map(item => 'ID = ' + item).join(' or ')}`
                    })
            });
            res.status(202);
        }
        else
            res.sendStatus(401);
    });
});

app.get('/last-id', (req, res) =>{
    fetch(`http://${sql}:4200/_sql`, {
        method: 'POST',
        body:JSON.stringify({
            'stmt':'select ID from Students Order by ID desc Limit 1'
        })
    })
    .then(res => res.json())
    .then(result => {
        res.send(result.rowcount == 0 ? "0" : `${+result.rows[0][0] + 1}`);
    });
});

app.get('/login', (req, res) =>{
    fetch(`http://${sql}:4200/_sql`, {
        method: 'POST',
        body:JSON.stringify({
            'stmt':`Refresh table Cookies`
        })
    })
    .then(() =>{
        fetch(`http://${sql}:4200/_sql`, {
            method: 'POST',
            body:JSON.stringify({
                'stmt':`select Cookies.ID, Cookies.Cookie, Logins.login from Cookies, Logins Where Cookies.Cookie = '${req.cookies.id}' and Cookies.ID = Logins.ID`
            })
        })
        .then(chk => chk.json())
        .then(chk_result => {
            if(chk_result.rowcount > 0)
                res.send(chk_result.rows[0][2].toString());
            else
                res.sendStatus(401);
        });
    });
});

app.post('/login', (req, res) =>{
    if('login' in req.body && 'password' in req.body)
    {
        fetch(`http://${sql}:4200/_sql`, {
            method: 'POST',
            body:JSON.stringify({
                'stmt':`select * from Logins Where login = '${req.body.login.toLowerCase()}' and password = '${req.body.password}'`
            })
        })
        .then(rst => rst.json())
        .then(result => {
            if(result.rowcount > 0)
            {
                let str = jwt.encode({login: req.body.login}, secret);
                fetch(`http://${sql}:4200/_sql`, {
                    method: 'POST',
                    body:JSON.stringify({
                        'stmt':`select * from Cookies Where Cookie = '${str}'`
                    })
                })
                .then(rst2 => rst2.json())
                .then(result2 => {
                    if(result2.rowcount == 0){
                        fetch(`http://${sql}:4200/_sql`, {
                            method: 'POST',
                            body:JSON.stringify({
                                'stmt':`insert into Cookies values(${result.rows[0][0]}, '${str}')`
                            })
                        }).then(() => res.cookie('id', str).redirect('/'));
                    }
                    else
                        res.cookie('id', str).redirect('/');
                })
            }
            else
                res.sendStatus(403);
        });
    }
    else
        res.sendStatus(400);
});

app.get('/logout', (req, res) =>{
    fetch(`http://${sql}:4200/_sql`, {
        method: 'POST',
        body:JSON.stringify({
            'stmt':`select * from Cookies Where Cookie = '${req.cookies.id}'`
        })
    })
    .then(chk => chk.json())
    .then(chk_result => {
        if(chk_result.rowcount > 0)
            fetch(`http://${sql}:4200/_sql`, {
                method: 'POST',
                body:JSON.stringify({
                    'stmt':`delete from Cookies Where Cookie = '${req.cookies.id}'`
                })
            })
            .then(r => {
                if(r.ok)
                    res.clearCookie('id').redirect('/');
                else
                    res.sendStatus(401);
            })
        else
            res.sendStatus(401);
    });
})

app.listen(port);
console.log(`Running server at http://${hostname}:${port}`);