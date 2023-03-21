//import
const express = require('express');
const cors = require('cors');
const path = require('path')
const session = require("express-session");
const store = new session.MemoryStore()

//implementasi
const app = express();
app.use(cors());
app.use(session({
    secret:'some secret',
    cookie:{max : 30000},
    saveUninitialized: false,
    store
}))

//endpoint nanti ditambahkan di sini
app.use('/image/user', express.static(path.join(__dirname,'./image/user')))
app.use('/image/tipe_kamar', express.static(path.join(__dirname,'./image/tipe_kamar')))
app.use('/image/customer', express.static(path.join(__dirname,'./image/customer')))

const Auth = require('./routes/auth');
app.use("/login", Auth)

const User = require('./routes/user');
app.use("/user", User)

const Customer = require('./routes/customer');
app.use("/customer", Customer)

const Tipe_kamar = require('./routes/tipe_kamar');
app.use("/tipe_kamar", Tipe_kamar)

const Kamar = require('./routes/kamar')
app.use("/kamar", Kamar)

const Pemesanan = require('./routes/pemesanan')
app.use('/pemesanan', Pemesanan)

const Detail_pemesanan = require('./routes/detail_pemesanan')
app.use('/detail_pemesanan', Detail_pemesanan)

const Filter_room = require('./routes/filter_kamar')
app.use('/filter-room', Filter_room)

//run server
app.listen(3000, () => {
    console.log('server run on port 3000')
})