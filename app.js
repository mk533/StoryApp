var express = require('express');
var app = express();
var port = process.env.PORT || 3000;
var cookieParser = require('cookie-parser');

var passport = require('passport');
var session = require('express-session');
var bodyParser = require('body-parser');
var helpers = require('express-helpers');
helpers(app);
app.use(express.static('views'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(cookieParser());
app.use(session({
    secret: 'stories'
}));
var i;
var methodOverride = require('method-override');
app.use(methodOverride(function (req, res) {
    console.log("in override method");
    // console.log(i);
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        values = [req.body.edit_event_title,
                  req.body.edit_event_content,
                  i];
        connection.query('UPDATE events SET event_title=?,event_content=? where event_id=?', values, function (err, results) {
            if (err) {
                throw err;
            } else {
                console.log(results);
                // res.redirect('events/' + i);
            }
        });

    }
}));
require('./passport')(app);

var storyRouter = express.Router();
var mysql = require('mysql');


var connection = mysql.createConnection({
    host: "localhost",
    user: "MK",
    password: "sairam",
    database: "storyapp",
    multipleStatements: true
});

connection.connect(function (err) {
    if (err) {
        console.log("Error Connecting Database");
    }
    console.log('connected as id ' + connection.threadId);
});
app.set('view engine', 'ejs');

storyRouter.route('/SignUp')
    .post(function (req, res) {
        values = {
            username: req.body.username,
            password: req.body.password
        };
        var query2 = 'insert into Users SET ?';
        connection.query(query2, values,
            function (err, rows, fields) {
                if (err) {
                    console.log(err);
                    res.status(500).message(err);
                } else {
                    res.send(rows);
                }
            });

    });
storyRouter.route('/SignIn')
    .post(passport.authenticate('local', {
            failureRedirect: '/'
        }),
        function (req, res) {
            res.redirect('/profile');
        });


//storyRouter.route('/profile').get(function (req, res) {
//res.render('profile',title:(req.user.username).toStringfy());
//res.json(req.user.username);
//});

/*NOT BUILT ejs FILES YET tested thorught POSTMAN
 */

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
app.use('/', storyRouter);

storyRouter.route('/')
    .get(function (req, res) {
        var events = [{}];
        //console.log("In events");
        connection.query('select * from events', function (err, results) {
            if (err) {
                throw err;
            } else {

                //  events:(results);
                //console.log(results);
                res.render('index', {
                    events: results
                });
                //console.log(events);
                //  console.log(events.event_title);
            }
        });
    });
var obj = [{}];
var obj1 = [{
    flag: false,
}];
var order = [{}];
storyRouter.route('/events/order/:id')
    .get(function (req, res) {
        values = [req.params.id];
        connection.query('select orders.event_price from orders inner join events on events.event_id=orders.event_id  where events.event_id=? order by event_price DESC LIMIT 1', values, function (err, results) {
            if (err) {

                throw err;
            } else {
                // console.log(results);
                //console.log(results[0].event_id);
                res.render('order', {
                    order: results[0]
                });
            }
        });
    })
    .post(function (req, res) {
        values = {
            event_id: req.params.id,
            username: req.user.username,
            event_price: 0
        };
        connection.query('insert into orders SET ?', values, function (err, results) {
            if (err) {
                // console.log("Query1");
                //  console.log(err);
                throw err;
            } else {
                values = [req.params.id];
                connection.query('UPDATE orders o INNER JOIN events e on o.event_id = e.event_id SET o.event_price=e.event_price where e.event_id=? ', values,
                    function (err, results) {
                        if (err) {
                            // console.log("Query2");
                            throw err;
                        } else {
                            values = [req.params.id, req.params.id];
                            connection.query('update  orders SET orders.event_price=(select early_bird_perc from events where events.event_id=?) where event_id=? LIMIT 10', values, function (err, results) {
                                if (err) {
                                    throw err;
                                } else {
                                    res.redirect('/events/order/' + req.params.id);
                                }

                            })
                        }
                    });
            }
        });
    });
storyRouter.route('/events/:id')

.get(function (req, res) {
        i = req.params.id;
        // console.log("In events with id  " + req.params.id);
        values = [
             req.params.id,
            req.params.id
        ];

        connection.query('SELECT events.event_id, events.event_title, events.event_content, events.event_price, events.created_by, events.early_bird_perc, comments.comment_id, comments.username, comments.comment FROM events LEFT OUTER JOIN comments ON events.event_id = comments.event_id where events.event_id = ?;select count( * ) as number from orders where event_id = ? ', values,
            function (err, results) {
                if (err) {
                    throw err;
                } else {
                    obj[0].user = req.user.username;
                    // console.log(results[0][0].event_title);
                    obj1[0].flag = (results[0][0].created_by == req.user.username);
                    // console.log(obj1[0].flag);
                    //console.log(req.user.username);
                    // console.log(results[0]);
                    //console.log(results[1]);
                    results[1][0].flag = (obj1[0].flag);
                    results[0][0].user = (obj[0].user);
                    //console.log(results[1]);
                    res.render('event', {
                            obj: results[0],
                            obj1: results[1]
                        })
                        // console.log(results);
                        //   console.log(results[1].number);
                        //    console.log(results.length);
                        //  console.log(results[0].username + ':' + results[0].comment);
                        //console.log(results[1].username + ':' + results[1].comment);
                }
            });
    })
    .post(function (req, res) {
        // console.log("here in comment post");
        values = {
            username: req.user.username,
            comment: req.body.new_comment,
            event_id: req.params.id,
        };

        connection.query('insert into comments SET ?', values, function (err, results) {
            if (err) {
                throw err;
            } else {
                res.redirect('/events/' + req.params.id);
            }
        });


    });


storyRouter.route('/events')
    .post(function (req, res) {
        values = {
            event_title: req.body.event_title,
            event_content: req.body.event_content,
            created_by: req.user.username,
            event_price: req.body.event_price,
            early_bird_perc: req.body.early_bird_prec

        };
        //    console.log("In Create events");
        // console.log(req.user.username);
        console.log(req.body.event_price);
        console.log(req.body.early_bird_prec);
        connection.query('INSERT into events SET ? ', values, function (err, results) {
            if (err) {
                throw err;
            } else {
                res.redirect('/')
            }

        });
    });

storyRouter.route('/profile')
    .get(function (req, res) {
        // console.log("In Profile");
        res.render('profile', {
            title: (req.user.username),
        });
    });
storyRouter.route('/edited')
    .post(function (req, res) {
        res.redirect('/');
    });

app.listen(port, function () {
    console.log("Server running on port:" + port);
})