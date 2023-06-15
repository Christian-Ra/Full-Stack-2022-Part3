const mongoose = require('mongoose')

const noteSchema = new mongoose.Schema({
  content: {
    type: String,
    minLength: 5,
    required: true,
  },
  important: Boolean,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
})
//! ^^^^^ Referemces are stored in both documents. the note references the user who creates it,
//! and the user has an array of references to all the notes created by them
noteSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  },
})

module.exports = mongoose.model('Note', noteSchema)
