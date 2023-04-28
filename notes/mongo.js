const mongoose = require("mongoose");

if (process.argv.length < 3) {
  console.log("give password as argument");
  process.exit(1);
}

const password = process.argv[2];

const url = `mongodb+srv://razochr:${password}@cluster0.a3ryfck.mongodb.net/noteapp?retryWrites=true&w=majority`;

mongoose.set("strictQuery", false);
mongoose.connect(url);

const noteSchema = new mongoose.Schema({
  content: String,
  improtant: Boolean,
});

const Note = mongoose.model("Note", noteSchema);

const note = new Note({
  content: "Boy do I appreciate me some Jazz",
  improtant: true,
});

//? THe objects are retrieved from the database with the find method of the Note model. The parameter of the method
//? is an object expressing search conditions. Since the parameter is an empty oject {}, we get all of the notes stroed in the notes collection.

// Note.find({}).then((result) => {
//   result.forEach((note) => {
//     console.log(note);
//   });
//   mongoose.connection.close();
// });
note.save().then((result) => {
  console.log("note saved!");
  mongoose.connection.close(); //! If the connection is not closed, the program will never finish its execution
});
