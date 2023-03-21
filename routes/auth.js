//import express
const express = require("express")

//import auth
const auth = require("../auth")
const jwt = require("jsonwebtoken")
const SECRET_KEY = "Dreamland"

require("dotenv").config();

const app = express()
app.use(express.json())


// import md5
const bcrypt = require("bcrypt");

//import model
const models = require("../models/index")
const User = models.user
const Customer = models.customer

//login untuk user
app.post('/', async (req, res) => {
    
        const user = await User.findOne({ where: { email: req.body.email } });
        if (user !== null) {
            const password_valid = await bcrypt.compare(req.body.password, user.password);
            if (password_valid) {
                const token = jwt.sign({ "id": user.id_user, "email": user.email, role: user.role }, process.env.ACCESS_TOKEN_SECRET);
                req.session.userId = user.id_user;
                res.status(200).json({ token: token, role: user.role, id_user: user.id_user, "logged": true });
            } else {
                res.status(400).json({ error: "Password Incorrect" });
            }
        } else {
            res.status(404).json({ error: "User does not exist" });
        }
    
});

//login untuk customer
app.post('/customer', async (req, res) => {
    let data = {
        username: req.body.username
    }
    const customer = await Customer.findOne({ where: data });
    if (customer) {
        const password_valid = await bcrypt.compare(req.body.password, customer.password);
        if (password_valid) {
            token = jwt.sign({ "id": customer.id_customer, "username": customer.username, role: "user" }, process.env.ACCESS_TOKEN_SECRET
            );
            res.status(200).json({ token: token, role: "user", id_customer: customer.id_customer, "logged": true });
        } else {
            res.status(400).json({ error: "Password Incorrect" });
        }

    } else {
        res.status(404).json({ error: "User does not exist" });
    }

});


module.exports = app