const blogsRouter = require("express").Router();
const { request } = require("express");
const Blog = require("../models/blog");

blogsRouter.get("/", async (request, response) => {
  const blogs = await Blog.find({});
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

blogsRouter.post("/", (request, response) => {
  const blog = new Blog(request.body);

  if (!blog.title || !blog.url) {
    return response.status(400).json({
      error: "Missing url/title",
    });
  }

  blog.save().then((result) => {
    response.status(201).json(result);
  });
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
