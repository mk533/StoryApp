var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mysql = require('mysql');

var connection = mysql.createConnection({
    host: "localhost",
    user: "MK",
    password: "sairam",
    database: "storyapp"
});

module.exports = function () {
    passport.use(new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password'
    }, function (username, password, done) {
        // console.log(username + ' ' +    password);
        var query = 'select * from Users where username=' + '"' + username + '"';
        //console.log("Query ... " + query);
        connection.query(query, function (err, results) {

            //console.log("Error ::: " + err);
            //console.log("Results ::: " + JSON.stringify(results));
            if (results !== undefined && results.length === 1 && results[0].password === password) {
                var user = results[0];
                //  console.log(results[0].password);
                done(null, user);
            } else {
                done('Mismatched credentials', null);
            }
        });

    }));
};