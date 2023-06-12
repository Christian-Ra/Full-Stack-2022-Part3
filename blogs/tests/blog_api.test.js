const mongoose = require("mongoose");
const supertest = require("supertest");
const helper = require("../utils/list_helper");
const app = require("../app");
const api = supertest(app);
const Blog = require("../models/blog");

beforeEach(async () => {
  await Blog.deleteMany({});
  console.log("cleared");

  const blogObjects = helper.blogs.map((blog) => new Blog(blog));
  const promiseArray = blogObjects.map((blog) => blog.save());
  await Promise.all(promiseArray);
});

test("blogs are returned as json", async () => {
  await api
    .get("/api/blogs")
    .expect(200)
    .expect("Content-type", /application\/json/);
});

test("correct amount of blogs are returned", async () => {
  const blogs = await api.get("/api/blogs");

  expect(blogs.body).toHaveLength(helper.blogs.length);
});

test("blogs contain id property", async () => {
  const blogs = await api.get("/api/blogs");

  expect(blogs.body[0].id).toBeDefined();
});

test("can suceesfully post a new blog", async () => {
  const newBlog = {
    title: "Go To Statement Considered Harmful",
    author: "Edsger W. Dijkstra",
    url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
    likes: 5,
  };

  await api
    .post("/api/blogs")
    .send(newBlog)
    .expect(201)
    .expect("Content-Type", /application\/json/);

  const blogsAtEnd = await helper.blogsInDb();
  expect(blogsAtEnd).toHaveLength(helper.blogs.length + 1);

  const contents = blogsAtEnd.map((b) => b.title);
  expect(contents).toContain("Go To Statement Considered Harmful");
});

test("blog posted without like property defined returns zero", async () => {
  const noLikeBlog = {
    title: "Go To Statement Considered Harmful",
    author: "Edsger W. Dijkstra",
    url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
  };

  await api
    .post("/api/blogs")
    .send(noLikeBlog)
    .expect(201)
    .expect("Content-Type", /application\/json/);

  const blogsAtEnd = await helper.blogsInDb();
  console.log(blogsAtEnd);
  expect(blogsAtEnd).toHaveLength(helper.blogs.length + 1);

  const likes = blogsAtEnd.map((b) => b.likes);
  console.log(likes);
  expect(likes).toContain(0);
});

test("blog posted without title or url properties return status code 400", async () => {
  const noTitleBlog = {
    author: "Christian Razo",
    url: "SomerandoURL.com",
  };
  const noUrlBlog = {
    title: "Rip this blog",
    author: "Christian Razo",
  };

  await api.post("/api/blogs").send(noTitleBlog).expect(400);

  await api.post("/api/blogs").send(noUrlBlog).expect(400);

  const blogsAtEnd = await helper.blogsInDb();
  expect(blogsAtEnd).toHaveLength(helper.blogs.length);
});

afterAll(async () => {
  await mongoose.connection.close();
});
