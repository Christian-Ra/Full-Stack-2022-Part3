const express = require("express");
const app = express();
const morgan = require("morgan");
var logger = morgan("tiny");

const requestLogger = (request, response, next) => {
  console.log("Method:", request.method);
  console.log("Path :", request.path);
  console.log("Body :", request.body);
  console.log("---");
  next();
};
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

const generateId = () => {
  return Math.floor(Math.random() * 100000);
};

app.get("/", (request, response) => {
  response.send("<h1>Hello World</h1>");
});

app.get("/api/persons", (request, response) => {
  console.log("Testing changes");
  response.json(persons);
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

  const existingContact = persons.find((p) => p.name === body.name);

  if (existingContact) {
    return response.status(400).json({
      error: "Name already exists in contact",
    });
  }
  const person = {
    name: body.name,
    number: body.number,
    id: generateId(),
  };

  persons = persons.concat(person);

  response.json(person);
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

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
