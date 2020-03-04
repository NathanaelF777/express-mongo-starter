// Dependencies
const router = require('express').Router();
const Bug = require('../models/bug.js');
const Project = require('../models/project.js');
const User = require('../models/users.js');

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
    Project.find({}, (err, data) => {
        res.render('tracker/bugs.ejs')
    })
})

// index
router.get('/', isAuthenticated, (req, res) => {
    let currentProjects = []
    for (project of req.session.currentUser.projects) {
        Project.findById(project, (err, data) => {
            currentProjects.push(data)
        })
    }
    console.log(currentProjects);
    Project.find({_id: req.session.currentUser.projects}, (err, foundProjects) => {
        if (err) {
            console.log(err.message);
            res.send("There appears to be an error.")
        } else {
            res.render('tracker/index.ejs', {
                projects: currentProjects,
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

//Bug index
router.get('/:id/bugs', isAuthenticated, (req, res) => {
    let currentBugs = []
    let currentProject = {}
    Project.findById(req.session.currentUser.currentProject, (err, foundProject) => {
        console.log(foundProject);
        if (err) {
            res.send(err)
        } else {
            res.render('tracker/bugs.ejs', {
                currentUser: req.session.currentUser,
                currentProject: foundProject || currentProject,
                bugs: foundProject.bugs || currentBugs
            })
        }
    })
})


// ***************** Functional *******************//

// create
router.post('/', isAuthenticated, (req, res) => {
    req.body.creator = req.session.currentUser;
    req.body.users = [req.session.currentUser];
    Project.create(req.body, (err, newProject) => {
        if (err) {
            console.log(err.message);
            res.send("There was a problem. Please try again.")
        } else {
            console.log(`New project created: ${newProject}`);
            req.session.currentUser.projects.push(newProject);
            User.findByIdAndUpdate(req.session.currentUser._id, req.session.currentUser, (err, user) => {
                if (err) {
                    res.send(err)
                } else {
                    console.log(user);
                    res.redirect('/tracker')
                }
            })
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

// select
router.put('/:id/select', isAuthenticated, (req, res) => {
    User.findByIdAndUpdate(req.session.currentUser._id, {currentProject: req.params.id}, (err, updatedUser) => {
        if (err) {
            res.send(err)
        } else {
            req.session.currentUser.currentProject = req.params.id;
            res.redirect(`/tracker/${req.params.id}/bugs`)
        }
    })
})


// Export Router:
module.exports = router;
