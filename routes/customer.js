//import express
const express = require("express")

//import auth
const auth = require("../auth")
const jwt = require("jsonwebtoken")
const SECRET_KEY = "Dreamland"

require("dotenv").config();

const app = express()
app.use(express.json())

const bcrypt = require("bcrypt");


//import multer
const multer = require("multer")
const path = require("path")
const fs = require("fs")

//import model
const models = require("../models/index")
const Customer = models.customer
const Tp_kamar = models.tipe_kamar
const Detail_pemesanan = models.detail_pemesanan

//method untuk check type file
const checkFileType = function (file, cb) {
    //Allowed file extensions
    const fileTypes = /jpeg|jpg|png|gif|svg/;

    //check extension names
    const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());

    const mimeType = fileTypes.test(file.mimetype);

    if (mimeType && extName) {
        return cb(null, true);
    } else {
        cb("Error: You can Only Upload Images!!");
    }
};

//config storage foto
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./image/user")
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname))
    }
})
let upload = multer({
    storage: storage,
    limits: { fileSize: 10000000 },
    fileFilter: (req, file, cb) => {
        checkFileType(file, cb);
    },
})

//endpoint untuk melihat semua customer
app.get("/",  (req, res) => {
    Customer.findAll()
        .then(result => {
            res.json({
                customer: result
            })
        })
        .catch(error => {
            res.json({
                message: error.message
            })
        })
})

//endpoint untuk melihat customer berdasarkan id
app.get("/:id",  (req, res) => {
    let param = { id_customer: req.params.id }

    Customer.findOne({ where: param })
        .then(result => {
            res.json({
                data: result
            })
        })
        .catch(err => {
            res.json({
                msg: err.message
            })
        })
})

//endpoint untuk melihat pesanan customer
app.get("/pesan/:id", auth, (req, res) => {

    let param = ({ id_customer: req.params.id })
    Customer.findOne({ where: param, include: ["tipe_kamar", "detail_pemesanan", 'customer'] })
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



//endpoint untuk menyimpan data, METHOD: POST, function: create
app.post("/", upload.single("foto"), async (req, res) => {
    const salt = await bcrypt.genSalt(10);


    if (!req.file) {
        res.json({
            message: "No uploaded file"
        })
    } else {
        let data = {
            name: req.body.name,
            foto: req.file.filename,
            username : req.body.username,
            email: req.body.email,
            password: await bcrypt.hash(req.body.password, salt)
        }
        Customer.create(data)
            .then(result => {
                res.json({
                    message: "data has been inserted",
                    data: result,
                })
            })
            .catch(error => {
                res.json({
                    message: error.message
                })
            })
    }
})

//endpoint untuk update data, METHOD: PUT
app.put("/:id", upload.single("foto"), async (req, res) => {

    const salt = await bcrypt.genSalt(10);
    
    let param = { id_customer: req.params.id }
    let data = {
        name: req.body.name,
        foto: req.body.filename,
        username: req.body.username,
        email: req.body.email,
        password: await bcrypt.hash(req.body.password,salt)
    }
    if (req.file) {
        // get data by id
        const row = await Customer.findOne({ where: param })
            .then(result => {
                let oldFileName = result.foto

                // delete old file
                let dir = path.join(__dirname, "./image/user", oldFileName)
                fs.unlink(dir, err => console.log(err))
            })
            .catch(error => {
                console.log(error.message);
            })

        // set new filename
        data.foto = req.file.filename
    }

    if (req.body.password) {
        data.password = await bcrypt.hash(req.body.password,salt)
    }

    await Customer.update(data, { where: param })
        .then(result => {
            res.json({
                message: "data has been updated",
            })
        })
        .catch(error => {
            res.json({
                message: error.message
            })
        })
})


//endpoint untuk menghapus data, METHOD: DELETE
app.delete("/:id", auth, async (req, res) => {
    try {
        let param = { id_customer: req.params.id }
        let result = await Customer.findOne({ where: param })
        let oldFileName = result.foto

        // delete old file
        let dir = path.join(__dirname, "./image/user", oldFileName)
        fs.unlink(dir, err => console.log(err))

        // delete data
        Customer.destroy({ where: param })
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