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

describe("initial load of blogs data", () => {
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
});

describe("when posting a new blog", () => {
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
    // console.log(blogsAtEnd);
    expect(blogsAtEnd).toHaveLength(helper.blogs.length + 1);

    const likes = blogsAtEnd.map((b) => b.likes);
    // console.log(likes);
    expect(likes).toContain(0);
  });
});

describe("invalid blogs are not uploaded to db", () => {
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
});

describe("data in db can be updated or removed", () => {
  test("deletion of existing blog", async () => {
    blogsAtStart = await helper.blogsInDb();
    blogToDelete = blogsAtStart[0];

    await api.delete(`/api/blogs/${blogToDelete.id}`).expect(204);

    const blogsAtEnd = await helper.blogsInDb();
    expect(blogsAtEnd).toHaveLength(blogsAtStart.length - 1);

    const contents = blogsAtEnd.map((b) => b.title);
    expect(contents).not.toContain(blogToDelete.title);
  });

  test("like total of existing blog can be updated", async () => {
    blogsAtStart = await helper.blogsInDb();
    blogToUpdate = blogsAtStart[0];
    const updatedBlog = {
      author: blogToUpdate.author,
      title: blogToUpdate.title,
      url: blogToUpdate.url,
      user: blogToUpdate.user,
      likes: blogToUpdate.likes + 1,
    };

    //test if put request is successful
    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(updatedBlog)
      .expect(200);

    //test if data successfully updated
    blogsAtEnd = await helper.blogsInDb();
    expect(blogToUpdate.likes).toEqual(blogsAtEnd[0].likes);
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});
