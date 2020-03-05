const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
    username: {type: String, unique: true, required: true},
    password: String,
    projects: [{ type: Schema.Types.ObjectId, ref: 'Project'}],
    currentProject: { type: Schema.Types.ObjectId, ref: 'Project'}
}, {
    timestamps: true
})

const User = mongoose.model('user', userSchema)
 module.exports = User
