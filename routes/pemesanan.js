//import express
const express = require("express")
const detail_pemesanan = require("../models/detail_pemesanan")

const app = express()
app.use(express.json())

const sequelize = require(`sequelize`);
const { Op } = require("sequelize"); 
const operator = sequelize.Op;

//import model
const models = require("../models/index")
const User = models.user
const Pemesanan = models.pemesanan
const Tp_kamar = models.tipe_kamar
const Kamar = models.kamar
const Detail_pemesanan = models.detail_pemesanan
const auth = require("../auth") 
const { verifyRole } = require("../must");
const user = require("../models/user");

//endpoint untuk menampilkan semua data
app.get("/", auth, (req, res) => {

    Pemesanan.findAll({ include: ["tipe_kamar", "user", "detail_pemesanan"] })
        .then(result => {
            res.json({
                data: result
            })
        })
        .catch(err => {
            res.json({
                msg: err.massage
            })
        })
})

//endpoint untuk menampilkan data berdasarkan id
app.get("/:id", auth, (req, res) => {

    let param = ({ id_pemesanan: req.params.id })
    Pemesanan.findOne({ where: param, include: ["tipe_kamar", "user", 'customer'] })
        .then(result => {
            res.json({
                data: result
            })
        })
        .catch(err => {
            res.json({
                msg: err.massage
            })
        })
})

//endpoint untuk menampilkan data customer di pemesanan berdasar id
app.get("/customer/:id", auth, 
    verifyRole("manager", "resepsionis"),
    (req, res) => {

    let param = ({ id_customer: req.params.id })
    Pemesanan.findAll({ where: param, include: ["tipe_kamar", "user", 'customer'] })
        .then(result => {
            res.json({
                data: result
            })
        })
        .catch(err => {
            res.json({
                msg: err.massage
            })
        })
})

//endpoint untuk menyimpan data, METHOD: POST
app.post('/', auth, async (req, res) => {

    let tw = Date.now()

    let numberRandom = Math.floor(Math.random() * (10000000 - 99999999) + 99999999);

    let requestData = {
        nomor_pemesanan: numberRandom,
        id_customer: req.body.id_customer,
        tgl_pemesanan: tw,
        tgl_check_in: req.body.tgl_check_in,
        tgl_check_out: req.body.tgl_check_out,
        jumlah_kamar: req.body.jumlah_kamar,
        id_tipe_kamar: req.body.id_tipe_kamar,
        status_pemesanan: req.body.status_pemesanan,
        id_user: req.body.id_user
    
    };

    // rooms data
    let dataKamar = await Kamar.findAll({
        where: {
            id_tipe_kamar: requestData.id_tipe_kamar,
        },
    });

    // room type data
    let dataTipeKamar = await Tp_kamar.findOne({
        where: { id_tipe_kamar: requestData.id_tipe_kamar },
    });

    //  booking data
    let dataPemesanan = await Tp_kamar.findAll({
        attributes: ["id_tipe_kamar", "nama_tipe_kamar"],
        where: { id_tipe_kamar: requestData.id_tipe_kamar },
        include: [
            {
                model: Kamar,
                as: "kamar",
                attributes: ["id_kamar", "id_tipe_kamar"],
                include: [
                    {
                        model: Detail_pemesanan,
                        as: "detail_pemesanan",
                        attributes: ["tgl_akses"],
                        where: {
                            tgl_akses: {
                                [operator.between]: [
                                    requestData.tgl_check_in,
                                    requestData.tgl_check_out,
                                ],
                            },
                        },
                    },
                ],
            },
        ],
    });

    // get available rooms
    let bookedRoomIds = dataPemesanan[0].kamar.map((room) => room.id_kamar);
    let availableRooms = dataKamar.filter((room) => !bookedRoomIds.includes(room.id_kamar));


    // process add data room where status is available to one list
    let roomsDataSelected = availableRooms.slice(0, requestData.jumlah_kamar);

    //count day
    let checkInDate = new Date(requestData.tgl_check_in);
    let checkOutDate = new Date(requestData.tgl_check_out);
    const dayTotal = Math.round(
        (checkOutDate - checkInDate) / (1000 * 3600 * 24)
    );

    // process add detail
    if (
        dataKamar == null ||
        availableRooms.length < requestData.jumlah_kamar ||
        dayTotal == 0 ||
        roomsDataSelected == null
    ) {
        return res.json({
            message: "Room not available!",
        });
    } else {
        await Pemesanan
            .create(requestData)
            .then(async (result) => {
                // process to add booking detail
                for (let i = 0; i < dayTotal; i++) {
                    for (let j = 0; j < roomsDataSelected.length; j++) {
                        let tgl_akses = new Date(checkInDate);
                        tgl_akses.setDate(tgl_akses.getDate() + i);
                        let requestDataDetail = {
                            id_pemesanan: result.id_pemesanan,
                            id_kamar: roomsDataSelected[j].id_kamar,
                            tgl_akses: tgl_akses,
                            harga: result.jumlah_kamar*dataTipeKamar.harga,
                        };
                        await Detail_pemesanan.create(requestDataDetail);
                    }
                }
                return res.json({
                    data: result,
                    statusCode: res.statusCode,
                    message: "New user has been created",
                });
            })
            .catch((error) => {
                return res.json({
                    message: error.message,
                });
            });
    }
})

//endpoint untuk mengubah data, METHOD: PUT
app.put("/:id", auth,
    verifyRole("manager", "resepsionis"),
    (req, res) => {
        
    let param = { id_pemesanan: req.params.id }
    let tw = Date.now()
    let data = {
        nomor_pemesanan: req.body.nomor_pemesanan,
        id_customer: req.body.id_customer,
        tgl_pemesanan: new Date(tw),
        tgl_check_in: req.body.tgl_check_in,
        tgl_check_out: req.body.tgl_check_out,
        jumlah_kamar: req.body.jumlah_kamar,
        id_tipe_kamar: req.body.id_tipe_kamar,
        status_pemesanan: req.body.status_pemesanan,
        id_user: req.body.id_user
    }

    Pemesanan.update(data, { where: param, include: ['tipe_kamar', 'user'] })
        .then(result => {
            res.json({
                message: "data has been updated",
                data: result
            })
        })
        .catch(error => {
            res.json({
                message: error.message
            })
        })
})

// filtering pemesanan berdasarkan tgl_pemesanan
app.get("/filter/:tgl_pemesanan", auth, async (req, res) => { // endpoint untuk mencari data pemesanan berdasarkan tanggal pemesanan
    const param = { tgl_pemesanan: req.params.tgl_pemesanan }; // inisialisasi parameter yang akan dikirimkan melalui parameter
  
    Pemesanan
     .findAll({ // mengambil data pemesanan berdasarkan tanggal pemesanan yang dikirimkan melalui parameter
        where: {
          tgl_pemesanan: {
            [Op.between]: [
              param.tgl_pemesanan + " 00:00:00",
              param.tgl_pemesanan + " 23:59:59",
            ], // mencari data pemesanan berdasarkan tanggal pemesanan yang dikirimkan melalui parameter
          }
        },
        include: [ // join tabel user dan kamar
          {
            model: User,
            as: "user",
          },
          {
            model: Tp_kamar,
            as: "tipe_kamar",
          },
        ],
      })
      .then((result) => { // jika berhasil
        if (result.length === 0) { // jika data tidak ditemukan
          res.status(404).json({ // mengembalikan response dengan status code 404 dan pesan data tidak ditemukan
            status: "error",
            message: "data tidak ditemukan",
          });
        } else { // jika data ditemukan
          res.status(200).json({ // mengembalikan response dengan status code 200 dan pesan data ditemukan
            status: "success",
            message: "data ditemukan",
            data: result,
          });
        }
      })
      .catch((error) => { // jika gagal
        res.status(400).json({ // mengembalikan response dengan status code 400 dan pesan error
          status: "error",
          message: error.message,
        });
      });
  });

//endpoint untuk menghapus data, METHOD: DELETE
app.delete("/:id", auth, async (req, res) => {
    try {
        let param = { id_pemesanan: req.params.id }
        let result = await Pemesanan.findOne({ where: param, include: ['tipe_kamar', 'user'] })

        // delete data
        Pemesanan.destroy({ where: param, include: ['tipe_kamar', 'user'] })
            .then(result => {

                res.json({
                    message: "data has been deleted",
                })
            })
            .catch(error => {
                res.json({
                    message: error.message
                })
            })

    } catch (error) {
        res.json({
            message: error.message
        })
    }
})
 
module.exports = app