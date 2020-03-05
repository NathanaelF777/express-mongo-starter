// Dependencies
const router = require('express').Router();
const models = require('../models/project.js');
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
    models.Project.find({}, (err, data) => {
        res.render('tracker/bugs.ejs')
    })
})

// index
router.get('/', isAuthenticated, async (req, res) => {
    let currentProjects = []
    const loadProjects = async () => {
        for (project of req.session.currentUser.projects) {
            models.Project.findById(project, (err, data) => {
                currentProjects.push(data)
            })
        }
        return
    }
    await loadProjects().then(
        models.Project.find({_id: req.session.currentUser.projects}, (err, foundProjects) => {
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
    );
})

// new
router.get('/new', isAuthenticated, (req, res) => {
    res.render('tracker/new.ejs', {
        currentUser: req.session.currentUser
    });
})

// seed
router.get('/seed', isAuthenticated, (req, res) => {
    models.Bug.create([
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

//User show
router.get('/user', isAuthenticated, (req, res) => {
    User.findById(req.session.currentUser._id, (err, user) => {
        let projectNumber = 0
        for (project of user.projects) {
            projectNumber++
        }
        if (err) {
            res.send(err)
        } else {
            res.render('tracker/showaccount.ejs', {
                currentUser: user,
                projectNumber: projectNumber
            })
        }
    })
})

// Show
router.get('/:id', (req, res) => {
    models.Project.findById(req.params.id, (err, foundProject) => {
        User.findById(foundProject.creator, (err, foundUser) => {
            if (err) {
                res.send(err)
            } else {
                let creator = foundUser.username
                let bugCount = 0;
                let userCount = 0;
                for (bug of foundProject.bugs) {
                    bugCount++
                }
                for (user of foundProject.users) {
                    userCount++
                }
                if (err) {
                    res.send(err.message)
                } else {
                    res.render('tracker/show.ejs', {
                        project: foundProject,
                        currentUser: req.session.currentUser,
                        bugCount: bugCount,
                        creator: creator,
                        userCount: userCount
                    })
                }
            }
        })
    })
})


// Edit
router.get('/:id/edit', isAuthenticated, (req, res) => {
    models.Bug.findById(req.params.id, (err, foundLog) => {
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
    let openBugs = []
    let inProgressBugs = []
    let testingBugs = []
    let closedBugs = []
    let currentProject = {}
    models.Project.findById(req.session.currentUser.currentProject, (err, foundProject) => {
        // console.log(foundProject);
        for (bug of foundProject.bugs) {
            if (bug.status === 'Open') {
                openBugs.push(bug)
            } else if (bug.status === 'In Progress') {
                inProgressBugs.push(bug)
            } else if (bug.status === 'Testing') {
                testingBugs.push(bug)
            } else {
                closedBugs.push(bug)
            }
        }
        if (err) {
            res.send(err)
        } else {
            console.log(openBugs);
            console.log(inProgressBugs);
            res.render('tracker/bugs.ejs', {
                currentUser: req.session.currentUser,
                currentProject: foundProject || currentProject,
                openBugs: openBugs,
                inProgressBugs: inProgressBugs,
                testingBugs: testingBugs,
                closedBugs: closedBugs
            })
        }
    })
})

// Bug Show
router.get('/:id/bugs/:bug', isAuthenticated, (req, res) => {
    models.Project.findById(req.params.id, (err, currentProject) => {
        if (err) {
            res.send(err)
        } else {
            let bug = currentProject.bugs.id(req.params.bug)
            res.render('tracker/showbugs.ejs', {
                project: currentProject,
                bug: bug,
                currentUser: req.session.currentUser
            })
        }
    })
})


// ***************** Functional *******************//

// create
router.post('/', isAuthenticated, (req, res) => {
    req.body.creator = req.session.currentUser;
    req.body.users = [req.session.currentUser];
    models.Project.create(req.body, (err, newProject) => {
        if (err) {
            console.log(err.message);
            res.send("There was a problem. Please try again.")
        } else {
            console.log(`New project created: ${newProject}`);
            User.findById(req.session.currentUser._id, (err, foundUser) => {
                foundUser.projects.push(newProject)
                req.session.currentUser = foundUser
                foundUser.save()
                res.redirect('/tracker')
            })
        }
    })
})

// Join
router.post('/join', isAuthenticated, (req, res) => {
    User.findById(req.session.currentUser._id, (err, user) => {
        if (err) {
            res.send(err)
        } else {
            user.projects.push(req.body.projectId)
            req.session.currentUser = user
            user.save()
            res.redirect('/tracker')
        }
    })
})


// DELETE
router.delete('/:id', isAuthenticated, (req, res) => {
    User.findById(req.session.currentUser._id, (err, currentUser) => {
        console.log();
        if (err) {
            res.send(err.message);
        } else {
            currentUser.projects.pull({_id: req.params.id})
            currentUser.currentProject = currentUser.projects[0];
            req.session.currentUser = currentUser
            currentUser.save();
            models.Project.findByIdAndDelete(req.params.id, (err, deletedProject) => {
                if (err) {
                    res.send(err)
                } else {
                    for (user of deletedProject.users) {
                        User.findById(user, (err, foundUser) => {
                            foundUser.projects.pull({_id: req.params.id})
                        })
                    }
                    console.log(`${deletedProject} has been deleted.`);
                    res.redirect('/tracker')
                }
            })
        }
    })
})


// Create // BUG:
router.post('/:id/new', isAuthenticated, (req, res) => {
    User.findById(req.session.currentUser._id, (err, user) => {
        console.log(user);
        req.body.author = user.username;
        req.body.project = req.params.id;
        models.Bug.create(req.body, (err, newBug) => {
            if (err) {
                res.send(err)
            } else {
                console.log(newBug);
                models.Project.findByIdAndUpdate(req.params.id, {$push: {bugs: newBug}}, (err, results) => {
                    console.log(results);
                    res.redirect(`/tracker/${req.params.id}/bugs`)
                })
            }
        })
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

//Bug change
router.put('/bug/:id/change', isAuthenticated, (req, res) => {
    models.Project.findById(req.session.currentUser.currentProject, (err, currentProject) => {
            let foundBug = currentProject.bugs.id(req.params.id)
            console.log(foundBug);
            if (foundBug.status === 'Open') {
                foundBug.status = 'In Progress';
                currentProject.save((err, bug) => {
                    if (err) {
                        res.send(err)
                    } else {
                        res.redirect(`/tracker/${req.session.currentUser.currentProject}/bugs`)
                    }
                })
            } else if (foundBug.status === 'In Progress') {
                foundBug.status = 'Testing';
                currentProject.save((err, bug) => {
                    if (err) {
                        res.send(err)
                    } else {
                        res.redirect(`/tracker/${req.session.currentUser.currentProject}/bugs`)
                    }
                })
            } else if (foundBug.status === 'Testing') {
                let preBug = foundBug
                foundBug.status = 'Closed';
                currentProject.save((err, bug) => {
                    if (err) {
                        res.send(err)
                    } else {
                        res.redirect(`/tracker/${req.session.currentUser.currentProject}/bugs`)
                    }
                })
            }
        })
    })

    //Bug revert
    router.put('/bug/:id/revert', isAuthenticated, (req, res) => {
        models.Project.findById(req.session.currentUser.currentProject, (err, currentProject) => {
                let foundBug = currentProject.bugs.id(req.params.id)
                console.log(foundBug);
                if (foundBug.status === 'Closed') {
                    foundBug.status = 'Testing';
                    currentProject.save((err, bug) => {
                        if (err) {
                            res.send(err)
                        } else {
                            res.redirect(`/tracker/${req.session.currentUser.currentProject}/bugs`)
                        }
                    })
                } else if (foundBug.status === 'Testing') {
                    foundBug.status = 'In Progress';
                    currentProject.save((err, bug) => {
                        if (err) {
                            res.send(err)
                        } else {
                            res.redirect(`/tracker/${req.session.currentUser.currentProject}/bugs`)
                        }
                    })
                } else if (foundBug.status === 'In Progress') {
                    let preBug = foundBug
                    foundBug.status = 'Open';
                    currentProject.save((err, bug) => {
                        if (err) {
                            res.send(err)
                        } else {
                            res.redirect(`/tracker/${req.session.currentUser.currentProject}/bugs`)
                        }
                    })
                }
            })
        })

router.delete('/:id/bugs/:bug', isAuthenticated, (req, res) => {
    models.Project.findById(req.params.id, (err, project) => {
        if (err) {
            res.send(err)
        } else {
            project.bugs.pull({_id: req.params.bug});
            project.save()
            res.redirect(`/tracker/${req.session.currentUser.currentProject}/bugs`)
        }
    })
})




// Export Router:
module.exports = router;
