const express = require('express');
const morgan = require('morgan');
const fetch = require('node-fetch');
const sql = '172.18.0.2';

const hostname = '127.0.0.1';
const port = 3000;

const app = express();

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/', express.static(__dirname + '/src'))

app.get('/students', (req, res) =>{
    try
    {
        fetch(`http://${sql}:4200/_sql`, {
            method: 'POST',
            body:JSON.stringify({
                'stmt':'select * from Students'
            })
        })
        .then(res => res.json())
        .then(result => {
            res.json(result.rows);
        });
    }
    catch
    {
        res.status(500);
    }
});

app.put('/students', (req, res) =>{
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
});

app.post('/students', (req, res) =>{
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
        res.status(400);
});

app.delete('/students', (req, res) =>{
    fetch(`http://${sql}:4200/_sql`, {
        method: 'POST',
        body:JSON.stringify({
            'stmt':`delete from Students where ${req.body.map(item => 'ID = ' + item).join(' or ')}`
            })
    });

    res.status(202);
});

app.get('/last-id', (req, res) =>{
    fetch(`http://${sql}:4200/_sql`, {
            method: 'POST',
            body:JSON.stringify({
                'stmt':'select ID from Students Order by ID desc'
            })
        })
        .then(res => res.json())
        .then(result => {
            res.send(result.rowcount == 0 ? "0" : `${+result.rows[0][0] + 1}`);
        });
    
});

app.listen(port);
console.log(`Running server at http://${hostname}:${port}`);