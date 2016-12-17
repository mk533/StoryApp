var express = require('express');

var app = express();
var port = process.env.PORT || 3000;

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

var storyRouter = express.Router();
var mysql = require('mysql');


var connection = mysql.createConnection({
    host: "localhost",
    user: "MK",
    password: "sairam",
    database: "storyapp"
});

connection.connect(function (err) {
    if (err) {
        console.log("Error Connecting Database");
    }
    console.log('connected as id ' + connection.threadId);
});

storyRouter.route('/Mystories')
    .post(function (req, res) {
        values = {
            slug: req.body.slug,
            genre: req.body.genre,
            content: req.body.content,
            created_by: req.body.created_by
        };
        console.log(values);
        var query2 = 'insert into Stories SET ?';
        connection.query(query2, values,
            function (err, rows, fields) {
                if (err) {

                    console.log(err);
                    res.status(500).message(err);

                } else {
                    res.send(rows);
                }
            });
    })
    .get(function (req, res) {
        connection.query('select * from Stories WHERE created_by="Special_User"', function (err, rows, fields) {
            if (err)
                res.status(500).message(err);
            res.json(rows);
        });
    });

storyRouter.route('/Otherstories')
    .get(function (req, res) {
        connection.query('select * from stories where created_by<>"Special_User"', function (err, rows, fields) {
            if (err)
                res.status(500).message(err);
            res.json(rows);
        });
    });

storyRouter.route('/Mystories/:id')

.put(function (req, res) {
        values = [req.body.content, req.params.id];
        connection.query('UPDATE Stories SET content=CONCAT(content,?) WHERE story_id=?', values, function (err, rows, fields) {
            if (err)
                res.status(500).message(err);
            res.json(rows);
        });
    })
    .delete(function (req, res) {
        values = [req.params.id];
        connection.query('delete from Stories where story_id=?', values, function (err, rows, fields) {
            if (err)
                res.status(500).message(err);
            res.json(rows);

        })
    })
    .get(function (req, res) {
        values = [req.params.id];
        var query1 = 'select * from Stories where story_id = ?';
        connection.query(query1, values,
            function (err, rows, fields) {
                if (err)
                    res.status(500).message(err);
                res.json(rows);
            });
    });
app.use('/api', storyRouter);

app.get('/', function (req, res) {
    res.send("Welcome to Story  API");
});

app.listen(port, function () {
    console.log("Server running on port:" + port);
})
