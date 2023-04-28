require("dotenv").config();
const Person = require("./models/person");

const express = require("express");
const app = express();
const cors = require("cors");
const morgan = require("morgan");
const mongoose = require("mongoose");
var logger = morgan("tiny");

mongoose.set("strictQuery", false);

const personSchema = new mongoose.Schema({
  name: String,
  important: Boolean,
});

personSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

morgan.token("body", function getBody(req) {
  return JSON.stringify(req.body);
});

app.use(express.json());
// app.use(logger);
app.use(
  morgan(":method :url :status :res[content-length] :response-time :body")
);
app.use(cors());
app.use(express.static("build"));

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

app.get("/api/persons", (request, response) => {
  Person.find({}).then((notes) => {
    response.json(notes);
  });
});

app.get("/api/info", (request, response) => {
  console.log("routing to info");
  const date = new Date();
  response.send(`Phonebook has info for ${persons.length} people ${date}`);
});

app.post("/api/persons", (request, response) => {
  const body = request.body;

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: "Name and / or number missing, post failed",
    });
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  });

  person.save().then((savedPerson) => {
    response.json(savedPerson);
  });
});

app.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find((person) => person.id === id);
  if (person) {
    response.json(person);
  } else {
    response.status(404).end();
  }
});

app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  persons = persons.filter((person) => person.id !== id);

  response.status(204).end();
});

app.use(unknownEndpoint);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
