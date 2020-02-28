// Dependencies
const router = require('express').Router();
const Bug = require('../models/bug.js');

// Authentication Function
const isAuthenticated = (req, res, next) => {
  if (req.session.currentUser) {
    return next()
  } else {
    res.redirect('/sessions/new')
  }
}

// ***************** Presentational *******************//

// test
router.get('/test', (req, res) => {
    Bug.find({}, (err, data) => {
        res.send(data)
    })
})

// index
router.get('/', (req, res) => {
    Bug.find({}, (err, foundBugs) => {
        if (err) {
            console.log(err.message);
            res.send("There appears to be an error.")
        } else {
            res.render('tracker/index.ejs', {
                bugs: foundBugs,
                currentUser: req.session.currentUser
            })
        }
    })
})

// new
router.get('/new', isAuthenticated, (req, res) => {
    res.render('tracker/new.ejs', {
        currentUser: req.session.currentUser
    });
})

// seed
router.get('/seed', isAuthenticated, (req, res) => {
    Bug.create([
        // {
        //     title: "Pillar of Autumn",
        //     entry: "Found alien ring structure. Performing emergency crash landing.",
        //     shipsBroken: true
        // }, {
        //     title: "USS Normandy SR2",
        //     entry: "Gathering team for suicide mission beyond Omega-4 relay.",
        //     shipsBroken: false
        // }
    ], (err, data) => {
        if (err) {
            console.log(err.message);
        }
    })
    res.redirect('/tracker')
})

// Show
router.get('/:id', (req, res) => {
    Bug.findById(req.params.id, (err, foundBug) => {
        if (err) {
            res.send(err.message)
        } else {
            res.render('tracker/show.ejs', {
                title: foundBug.title,
                bug: foundBug,
                currentUser: req.session.currentUser
            })
        }
    })
})


// Edit
router.get('/:id/edit', isAuthenticated, (req, res) => {
    Bug.findById(req.params.id, (err, foundLog) => {
        if (err) {
            res.send(err.message)
        } else {
            console.log(foundLog);
            res.render('tracker/edit.ejs', {
                bug: foundBug,
                currentUser: req.session.currentUser
            })
        }
    })
})

// ***************** Functional *******************//

// create
router.post('/', isAuthenticated, (req, res) => {
    if (req.body.shipsBroken === 'on') {
        req.body.shipsBroken = true
    } else {
        req.body.shipsBroken = false
    };
    Bug.create(req.body, (err, newLog) => {
        if (err) {
            console.log(err.message);
            res.send("There was a problem. Please try again.")
        } else {
            console.log(`New bug created: ${newLog}`);
            res.redirect('/tracker')
        }
    })
})

// Update
router.put('/:id', isAuthenticated, (req, res) => {
    if (req.body.shipsBroken === 'on' || true) {
        req.body.shipsBroken = true
    } else {
        req.body.shipsBroken = false
    };
    Bug.findByIdAndUpdate(req.params.id, req.body, {new: true}, (err, updatedLog) => {
        if (err) {
            console.log(err.message);
        } else {
            console.log(`${updatedLog} has been updated.`);
            res.redirect('/tracker');
        }
    })
})

// DELETE
router.delete('/:id', isAuthenticated, (req, res) => {
    Bug.findByIdAndDelete(req.params.id, (err, deletedLog) => {
        if (err) {
            console.log(err.message);
        } else {
            console.log(`${deletedLog} has been deleted.`);
            res.redirect('/tracker')
        }
    })
})



// Export Router:
module.exports = router;
