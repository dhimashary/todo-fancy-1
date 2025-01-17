const mongoose = require('mongoose')
const Schema = mongoose.Schema

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  members: [{
    type : Schema.Types.ObjectId,
    ref: 'User'
  }],
  owner: {
    type : Schema.Types.ObjectId,
    ref: 'User'
  }
})

const Group = mongoose.model('Group', groupSchema)

module.exports = Group
