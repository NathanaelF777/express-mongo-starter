const bcrypt = require('bcrypt')
const express = require('express')
const users = express.Router()
const User = require('../models/users.js')


// Show Sign Up Form
users.get('/new', (req, res) => {
    res.render('users/new.ejs', {
        currentUser: req.session.currentUser
    })
})

// Create New User
users.post('/', async (req, res) => {
    if (req.body.password === req.body.password2) {
        if (await User.exists({username: req.body.username}).then()) {
            res.render('users/new-usernamefail.ejs')
            } else {
            req.body.password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10))
            User.create(req.body, (err, createdUser) => {
                if (err) {
                    console.log(err);
                } else {
                    createdUser.currentProject = {
                        name: 'placeholder',
                        description: 'make a project',
                        creator: createdUser,
                        users: [createdUser]
                    }
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
