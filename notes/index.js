console.log("hello world");
require("dotenv").config();

//* same as: import http from 'http'
const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const Note = require("./models/note");

app.use(express.json());
app.use(cors());
app.use(express.static("build"));

mongoose.set("strictQuery", false);

const noteSchema = new mongoose.Schema({
  content: String,
  important: Boolean,
});

noteSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

// const Note = mongoose.model("Note", noteSchema);

let notes = [
  {
    id: 1,
    content: "HTML is easy",
    important: true,
  },
  {
    id: 2,
    content: "Browser can execute only JavaScript",
    important: false,
  },
  {
    id: 3,
    content: "GET and POST are the most important methods of HTTP protocol",
    important: true,
  },
];

app.get("/", (request, response) => {
  response.send("<h1>Hello World!</h1>");
  //! Since the parameter is a string, express automatically sets the
  //! value of the Content-Type header to be text/html
});

// app.get("/api/notes", (request, response) => {
//   response.json(notes);
// });

app.get("/api/notes", (request, response) => {
  Note.find({}).then((notes) => {
    response.json(notes);
  });
});

const generateId = () => {
  const maxId = notes.length > 0 ? Math.max(...notes.map((n) => n.id)) : 0;
  return maxId + 1;
};

app.post("/api/notes", (request, response) => {
  const body = request.body;

  if (!body.content) {
    return response.status(400).json({
      error: "content missing",
    });
  }
  const note = new Note({
    content: body.content,
    important: body.important || false,
  });

  note.save().then((savedNote) => {
    response.json(savedNote);
  });
});

app.get("/api/notes/:id", (request, response) => {
  Note.findById(request.params.id).then((note) => {
    response.json(note);
  });
});

app.delete("/api/notes/:id", (request, response) => {
  const id = Number(request.params.id);
  notes = notes.filter((note) => note.id !== id);

  response.status(204).end();
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

/* 
 The code uses the createServer method of the http module to create a new web server. 
 An event handler is registered to the server that is called every time an HTTP request 
 is made to the server's address http://localhost:3001.
 */

// const app = http.createServer((request, response) => {
//   response.writeHead(200, { "Content-Type": "application/json" });
//   response.end(JSON.stringify(notes));
// });
