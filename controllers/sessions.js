const bcrypt = require('bcrypt')
const express = require('express')
const sessions = express.Router()
const User = require('../models/users.js')


sessions.get('/new', (req, res) => {
    res.render('sessions/welcome.ejs', {
        currentUser: req.session.currentUser
    })
})

// On session form submit (log in)
sessions.post('/', (req, res) => {
    User.findOne({username: req.body.username}, (err, foundUser) => {
        if (err) {
            console.log(err);
            res.send('The database had a problem.')
        } else if (!foundUser) {
            // res.send('<a href="/">Sorry, no user found </a>')
            res.render('sessions/welcome-failure.ejs', {
                currentUser: req.session.currentUser
            })
        } else {
            if (bcrypt.compareSync(req.body.password, foundUser.password)) {
                req.session.currentUser = foundUser
                console.log(`${foundUser} has logged in.`);
                res.redirect('/tracker')
            } else {
                res.send('<a href="/">password does not match </a>')
            }
        }
    })
})

// session logout
sessions.delete('/', (req, res) => {
  req.session.destroy(() => {
    console.log('User has logged out.');
    res.redirect('/')
  })
})


module.exports = sessions
