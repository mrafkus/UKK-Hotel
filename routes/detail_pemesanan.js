const express = require("express")

const app = express()
app.use(express.json())

const models = require("../models/index")
const Dtl_pemesanan = models.detail_pemesanan
const Tp_kamar = models.tipe_kamar
const Customer = models.customer
const Kamar = models.kamar
const Pemesanan = models.pemesanan

app.get("/", (req, res) => {
    Dtl_pemesanan.findAll({
        include: [
            {
                model: Kamar,
                as: "kamar",
                attributes: ['nomor_kamar', 'id_tipe_kamar'],
                include: [
                    {
                        model: Tp_kamar,
                        as: "tipe_kamar",
                        // attributes: ['nama_tipe_kamar']

                    },
                ],
            },
            {
                model: Pemesanan,
                as: "pemesanan",
                include: [
                    {
                        model: Customer,
                        as: "customer",
                        // attributes: ['nama_tipe_kamar']

                    },
                ],
            },
        ],
    })
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

app.get("/:id", (req, res) => {
    let param = ({ id_pemesanan: req.params.id })
    Dtl_pemesanan.findAll({
        where: param,
        include: [
            {
                model: Kamar,
                as: "kamar",
                attributes: ['nomor_kamar', 'id_tipe_kamar'],
                include: [
                    {
                        model: Tp_kamar,
                        as: "tipe_kamar",
                        // attributes: ['nama_tipe_kamar']
                    },
                ],
            },
            {
                model: Pemesanan,
                as: "pemesanan",
                include: [
                    {
                        model: Customer,
                        as: "customer",
                        attributes: ['name','email']

                    },
                ],
            },
        ],

    })
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
app.get("/cetak/:id", (req, res) => {
    let param = ({ id_detail_pemesanan: req.params.id })
    Dtl_pemesanan.findOne({
        where: param,
        include: [
            {
                model: Kamar,
                as: "kamar",
                attributes: ['nomor_kamar', 'id_tipe_kamar'],
                include: [
                    {
                        model: Tp_kamar,
                        as: "tipe_kamar",
                        // attributes: ['nama_tipe_kamar']
                    },
                ],
            },
            {
                model: Pemesanan,
                as: "pemesanan",
                include: [
                    {
                        model: Customer,
                        as: "customer",
                        attributes: ['name','email']

                    },
                ],
            },
        ],

    })
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

app.put("/:id", (req, res) => {
    let param = { id_detail_pemesanan: req.params.id }
    let data = {
        id_pemesanan: req.body.id_pemesanan,
        id_kamar: req.body.id_kamar,
        tgl_akes: req.body.tgl_akes,
        harga: req.body.harga
    }

    Dtl_pemesanan.update(data, { where: param, include: ['kamar', 'pemesanan'] })
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

app.delete("/:id", async (req, res) => {
    try {
        let param = { id_detail_pemesanan: req.params.id }
        let result = await Dtl_pemesanan.findOne({ where: param, include: ['kamar', 'pemesanan',] })

        // delete data
        Dtl_pemesanan.destroy({ where: param, include: ['kamar', 'pemesanan',] })
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