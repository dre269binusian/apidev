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

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

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
  db.any('SELECT event.id, event.nama, event.description, event.price, event.foto, event.uri, event.lokasi,  event.available_seat, TO_CHAR(event.tanggal :: DATE, \'dd Mon yyyy\') as tanggal FROM event')
      .then(function (data) {
        res.send({
          "status" : 200,
          "result" : data
        })
      })
      .catch(function (error) {
        console.log('Event kosong ...');
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

app.get('/', (req, res) => {
  db.any('SELECT * FROM kategori')
      .then(function (data) {
        res.send({
          "status" : 200,
          "result" : data
        })
      })
      .catch(function (error) {
        console.log('Kategori Kosong ...');
      })
});

app.get('/agenda', (req, res) => {
    db.any('SELECT * FROM agenda')
        .then(function (data) {
            res.send({
                "status" : 200,
                "result" : data
            })
        })
        .catch(function (error) {
            console.log('Agenda Kosong ...');
        })
})

app.post('/transaksi',(req,res)=>{
  const { id_user, total, id_event, seat_booking, sub_total_price } = req.body
  const created_at = new Date();
  const id_user_new = parseInt(id_user);
  const total_new = parseInt(total)
  let id_transaksi_new='';
  const id_event_new = parseInt(id_event);
  const seat_booking_new = parseInt(seat_booking);
  const sub_total_price_new = parseInt(sub_total_price);
  db.task('my-task',t=>{
    return t.any('INSERT INTO transaksi(id_user,total,created_at) VALUES($1,$2,$3)',[id_user_new,total_new,created_at])
    .then(()=>{
      return t.any('SELECT max(id) from transaksi where id_user=$1',[id_user_new]).then(result=>  {return id_transaksi_new = result[0].max}).catch(e=>console.log(e))
    }).then(()=>{
      return t.any('UPDATE event SET available_seat=available_seat-$1',[seat_booking_new]).then(result=>console.log(`mantap`)).catch(e=>console.log(e))
    }).then(()=>{
      return t.any('UPDATE users SET saldo=saldo-$1 where id=$2',[total_new,id_user_new]).then(result=>console.log(`mantap`)).catch(e=>console.log(e))
    }).then(()=>{

      return t.any('INSERT INTO transaksi_detail(id_transaksi,id_event,seat_booking,sub_total_price) VALUES($1,$2,$3,$4)',[id_transaksi_new,id_event_new,seat_booking_new,sub_total_price_new]).then(result=>console.log(`mantap udah masuk ke transaksi detail`)).catch(e=>console.log(e))

    })
  }).then(data=>{
    res.status(200).json({
      status:200,
      message:'berhasil memasukkan data'
    })
  }).catch(e=>res.status(200).json({
    e,
    message:'gagal memasukkan data'
  }))
})

app.get('/transaksi',(req,res)=>{
  db.any('SELECT * FROM transaksi')
  .then(data=>{
    res.status(200).json({
      status:200,
      result:data
    })
  }).catch(e=>res.status(200).json({
    e,
    message:'terjadi error'
  }))
})

app.get('/transaksi_detail',(req,res)=>{
  db.any('SELECT * FROM transaksi_detail')
  .then(data=>{
    res.status(200).json({
      status:200,
      result:data
    })
  }).catch(e=>res.status(200).json({
    e,
    message:'terjadi error'
  }))
})

app.get('/history',(req,res)=>{
  const email = req.body.email;
  db.any('select transaksi.id, transaksi_detail.id_event, event.nama, transaksi_detail.seat_booking, transaksi.created_at from transaksi join transaksi_detail on transaksi.id = transaksi_detail.id_transaksi join event on event.id = transaksi_detail.id_event join users on users.id = transaksi.id_user where users.email =$1',[email])
  .then(result=>res.status(200).json({result,message:'inilah dia'}))
  .catch(e=>console.log(e))
})


var port = process.env.PORT || 3000
app.listen(port, function() {
    console.log("To view your app, open this link in your browser: http://localhost:" + port);
});
