const mongoose = require('mongoose')
const Schema = mongoose.Schema

const bugSchema = new Schema({
    author: String,
    description: {type: String, requred: true},
    recreation: String,
    status: {type: String, required: true, default: 'Open'},
    project: { type: Schema.Types.ObjectId, ref: 'Project'}
}, {
    timestamps: true
});



const projectSchema = new Schema({
    name: {type: String, required: true},
    creator: {type: Schema.Types.ObjectId, ref: 'User'},
    users: [{type: Schema.Types.ObjectId, ref: 'User'}],
    description: {type: String, requred: true},
    bugs: [bugSchema]
})

const Bug = mongoose.model('bug', bugSchema)

const Project = mongoose.model('project', projectSchema)
 module.exports = {
     Project: Project,
     Bug: Bug
    }
