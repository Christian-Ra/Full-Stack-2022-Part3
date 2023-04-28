const mongoose = require("mongoose");

if (process.argv.length < 3) {
  console.log("Password is required as an argument");
  process.exit(1);
}

const password = process.argv[2];
const newName = process.argv[3];
const newNumber = process.argv[4];

mongoose.set("strictQuery", false);
mongoose.connect(url);

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});

const Person = mongoose.model("Person", personSchema);

if (process.argv.length === 3) {
  console.log("Phonebook: ");
  //if given just password, return all contacts
  Person.find({}).then((result) => {
    result.forEach((person) => {
      console.log(person);
    });
    mongoose.connection.close();
  });
} else {
  const person = new Person({
    name: newName,
    number: newNumber,
  });

  person.save().then((result) => {
    console.log("contact saved!");
    mongoose.connection.close();
  });
}
