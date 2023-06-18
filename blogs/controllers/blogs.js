const blogsRouter = require("express").Router();
const User = require("../models/user");
const Blog = require("../models/blog");
const jwt = require("jsonwebtoken");

blogsRouter.get("/", async (request, response) => {
  const blogs = await Blog.find({}).populate("user", { username: 1, name: 1 });
  response.json(blogs);
});

blogsRouter.get("/:id", (request, response, next) => {
  Blog.findById(request.params.id)
    .then((blog) => {
      if (blog) {
        response.json(blog);
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => next(error));
});

blogsRouter.post("/", async (request, response) => {
  const body = request.body;

  const user = await User.findById(body.userId);

  if (!body.title || !body.url) {
    return response.status(400).json({
      error: "Missing url/title",
    });
  }

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    user: user.id,
    likes: body.likes,
  });

  const savedBlog = await blog.save();
  user.blogs = user.blogs.concat(savedBlog._id);
  await user.save();

  response.json(savedBlog);
});

blogsRouter.delete("/:id", async (request, response) => {
  await Blog.findByIdAndRemove(request.params.id);
  response.status(204).end();
});

blogsRouter.put("/:id", (request, response, next) => {
  const { author, title, url, likes } = request.body;
  const blog = {
    author: author,
    title: title,
    url: url,
    likes: likes,
  };

  Blog.findByIdAndUpdate(
    request.params.id,
    { blog },
    { new: true, runValidators: true, context: "query" }
  )
    .then((updatedBlog) => response.json(updatedBlog))
    .catch((error) => next(error));
});

module.exports = blogsRouter;
