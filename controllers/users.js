const bcrypt = require('bcrypt')
const express = require('express')
const users = express.Router()
const User = require('../models/users.js')


// Functions
const isUnique = (name) => {
    User.exists({username: name}, (err, result) => {
        if (err) {
            res.render('users/new-usernamefail.ejs')
            return result
        } else {
            console.log(result);
            return result
        }
    })
}
// Show Sign Up Form
users.get('/new', (req, res) => {
    res.render('users/new.ejs', {
        currentUser: req.session.currentUser
    })
})

// Create New User
users.post('/', (req, res) => {
    if (req.body.password === req.body.password2) {
        if (async isUnique(req.body.username)) {
            console.log(isUnique(req.body.username) + ' first');
            res.render('users/new-usernamefail.ejs')
            } else {
                console.log(isUnique(req.body.username) + ' second');
            req.body.password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10))
            User.create(req.body, (err, createdUser) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log('user is created', createdUser);
                    req.session.currentUser = createdUser
                    res.redirect('/')
                }
            })
        }
    } else {
        res.render('users/new-passfail.ejs')
    }
})

module.exports = users
