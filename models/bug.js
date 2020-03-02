const mongoose = require('mongoose')
const Schema = mongoose.Schema

const bugSchema = new Schema({
    author: {type: Schema.Types.ObjectId, ref: 'User'},
    description: {type: String, requred: true},
    recreation: String,
    status: {type: String, required: true, default: 'Open'},
    project: { type: Schema.Types.ObjectId, ref: 'Project'},
})

const Bug = mongoose.model('bug', bugSchema)
 module.exports = Bug
