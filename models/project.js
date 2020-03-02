const mongoose = require('mongoose')
const Schema = mongoose.Schema

const projectSchema = new Schema({
    creator: {type: Schema.Types.ObjectId, ref: 'User'},
    users: [{type: Schema.Types.ObjectId, ref: 'User'}],
    description: {type: String, requred: true},
    bugs: [{type: Schema.Types.ObjectId, ref: 'Bug'}]]
})

const Project = mongoose.model('project', projectSchema)
 module.exports = Project
