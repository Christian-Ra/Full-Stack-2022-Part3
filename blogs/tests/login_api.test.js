const bcrypt = require("bcrypt");
const supertest = require("supertest");
const mongoose = require("mongoose");
const helper = require("../utils/list_helper.js");
const app = require("../app");
const api = supertest(app);
const User = require("../models/user.js");

describe("when there is initially one user in db", () => {
  beforeEach(async () => {
    await User.deleteMany({});

    const passwordHash = await bcrypt.hash("secreto", 10);
    const user = new User({ username: "root", passwordHash });

    await user.save();
  });

  test("creation succeeds with a fresh username", async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: "crustyrazor",
      name: "Christian Razo",
      password: "gioooooooo",
    };

    await api
      .post("/api/users")
      .send(newUser)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1);

    const usernames = usersAtEnd.map((u) => u.username);
    expect(usernames).toContain(newUser.username);
  });

  test("Creation fails with proper statuscode and message if username already taken", async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: "root",
      name: "Superuser",
      password: "sailainen",
    };

    const result = await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    expect(result.body.error).toContain("expected `username` to be unique");

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toEqual(usersAtStart);
  });
});
describe("When an invalid username/password is given on user creation", () => {
  test("Creation fails with proper statuscode if username is invalid", async () => {
    const usersAtStart = await helper.usersInDb();

    const invalidUser = {
      username: "ab",
      name: "invalid",
      password: "valid",
    };

    const result = await api
      .post("/api/users")
      .send(invalidUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    expect(result.body.error).toContain(
      "shorter than the minimum allowed length (3)"
    );

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toEqual(usersAtStart);
  });

  test("Creation fails with proper statuscode if password is invalid", async () => {
    const usersAtStart = await helper.usersInDb();

    const invalidPass = {
      username: "abcd",
      name: "invalid",
      password: "13",
    };

    const result = await api
      .post("/api/users")
      .send(invalidPass)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    expect(result.body.error).toContain(
      "password length must have minimum length (3)"
    );

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toEqual(usersAtStart);
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});
