const express = require('express');
const morgan = require('morgan');
const list = [];

const hostname = '127.0.0.1';
const port = 3000;

const app = express();

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/', express.static(__dirname + '/src'))

app.get('/students', (req, res) =>{
    res.json(list);
});

app.put('/students', (req, res) =>{
    if('id' in req.body && 'fio' in req.body && 'course' in req.body
        && 'spec' in req.body && 'number' in req.body && !isNaN(+req.body.course))
    {
        list.push(req.body);
        res.status(201);
    }
    else
        res.status(400);
});

app.post('/students', (req, res) =>{
    if('id' in req.body && 'fio' in req.body && 'course' in req.body
        && 'spec' in req.body && 'number' in req.body && !isNaN(+req.body.course))
    {
        let i = 0;
        for(; i < list.length; i++)
            if(list[i].id == req.body.id)
                break;
                
        if(i < list.length)
        {
            list[i].fio = req.body.fio;
            list[i].course = req.body.course;
            list[i].spec = req.body.spec;
            list[i].number = req.body.number;
            res.status(202);
        }
        else
            res.status(400);
    }
    else
        res.status(400);
});

app.delete('/students', (req, res) =>{
    for(let i = 0; i < list.length; i++)
        if(req.body.indexOf(list[i].id) != -1)
            list.splice(i--, 1);

    res.status(202);
});

app.get('/last-id', (req, res) =>{
    res.send(list.length == 0 ? "0" : `${+list[list.length - 1].id + 1}`);
});

app.listen(port);
console.log(`Running server at http://${hostname}:${port}`);