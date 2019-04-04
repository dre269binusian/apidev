var express = require("express");
var app = express();
var cfenv = require("cfenv");
var bodyParser = require('body-parser');
var pgp = require('pg-promise')(/*options*/);
var db = pgp('postgres://fefzxjzs:5Rr7c1mU1Sb8y4ec6oaNOqHliSWcpJKb@isilo.db.elephantsql.com:5432/fefzxjzs');
var md5 = require('md5');
// var login = require('./controllers/LoginController');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

// var cloudant, mydb;


// load local VCAP configuration  and service credentials
// var vcapLocal;
// try {
//   vcapLocal = require('./vcap-local.json');
//   console.log("Loaded local VCAP", vcapLocal);
// } catch (e) { }
//
// const appEnvOpts = vcapLocal ? { vcap: vcapLocal} : {}

// const appEnv = cfenv.getAppEnv(appEnvOpts);

// Load the Cloudant library.
// var Cloudant = require('@cloudant/cloudant');
// if (appEnv.services['cloudantNoSQLDB'] || appEnv.getService(/cloudant/)) {
//
//   // Initialize database with credentials
//   if (appEnv.services['cloudantNoSQLDB']) {
//     // CF service named 'cloudantNoSQLDB'
//     cloudant = Cloudant(appEnv.services['cloudantNoSQLDB'][0].credentials);
//   } else {
//      // user-provided service with 'cloudant' in its name
//      cloudant = Cloudant(appEnv.getService(/cloudant/).credentials);
//   }
// } else if (process.env.CLOUDANT_URL){
//   cloudant = Cloudant(process.env.CLOUDANT_URL);
// }
// if(cloudant) {
//   //database name
//   var dbName = 'mydb';
//
//   // Create a new "mydb" database.
//   cloudant.db.create(dbName, function(err, data) {
//     if(!err) //err if database doesn't already exists
//       console.log("Created database: " + dbName);
//   });
//
//   // Specify the database we are going to use (mydb)...
//   mydb = cloudant.db.use(dbName);
// }

//serve static file (index.html, images, css)
// app.use(express.static(__dirname + '/views'));


/**
 * Endpoint to get a JSON array of all the kategori in the database
 * REST API example:
 * <code>
 * GET http://localhost:3000/kategori
 * </code>
 *
 * Response:
 * [ "Bob", "Jane", "nisa", "lala" ]
 * @return An array of all the kategori names
 */
app.get('/', (req, res) => {
  db.any('SELECT * FROM kategori')
      .then(function (data) {
        res.send({
          "status" : 200,
          "result" : data
        })
        // console.log(data);

      })
      .catch(function (error) {
        // res.send('asds')
        console.log('aaaaa');
      })
});

/**
 * Endpoint to get a JSON array of all the events in the database
 * REST API example:
 * <code>
 * GET http://localhost:3000/event
 * </code>
 *
 * Response:
 * [ "Bob", "Jane", "nisa", "lala" ]
 * @return An array of all the event list
 */
app.get('/event', (req, res) => {
  db.any('SELECT * FROM event')
      .then(function (data) {
        res.send({
          "status" : 200,
          "result" : data
        })
        // console.log(data);
      })
      .catch(function (error) {
        console.log('event kosong');
      })
});

// app.use('/login', login);


app.post('/login', (req, res, next) => {
  let status = 200, error = null;
  let dataLoginNya = {
    email: req.body.email,
    password: md5(req.body.password)
  }

  if(!req.body.email){
    status = 422;
    error = 'Email kosong';
  }

  if(!req.body.password){
    status = 422;
    error = 'Password kosong';
  }


  let sql = 'SELECT * FROM users WHERE email = ${email} AND password = ${password}';
  db.any(sql, dataLoginNya)
      .then(function (data) {
        res.send({
          "status" : 200,
          "result" : data
        })
      })
      .catch(function (error) {
        console.log(dataLoginNya);
      })
});


var port = process.env.PORT || 3000
app.listen(port, function() {
    console.log("To view your app, open this link in your browser: http://localhost:" + port);
});
