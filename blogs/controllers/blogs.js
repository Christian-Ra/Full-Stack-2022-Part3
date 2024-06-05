const blogsRouter = require("express").Router();
const middleware = require("../utils/middleware");
const Blog = require("../models/blog");

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

blogsRouter.post("/:id/comments", async (request, response, next) => {
  const { comment } = request.body;
  Blog.findById(request.params.id)
    .then((blog) => {
      if (blog) {
        blog.comments = blog.comments.concat(comment);
        blog.save();
        response.json(blog);
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => next(error));
});

blogsRouter.post("/", middleware.userExtractor, async (request, response) => {
  const body = request.body;
  const user = request.user;

  if (!body.title || !body.url) {
    return response.status(400).json({
      error: "Missing url/title",
    });
  }

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    user: user._id,
    likes: body.likes,
    comments: body.comments,
  });

  const savedBlog = await blog.save();
  await savedBlog.populate("user", { username: 1, name: 1 });
  user.blogs = user.blogs.concat(savedBlog._id);
  await user.save();

  response.json(savedBlog);
});

blogsRouter.delete(
  "/:id",
  middleware.userExtractor,
  async (request, response) => {
    const user = request.user;
    const blog = await Blog.findById(request.params.id);

    if (blog.user.toString() !== user.id.toString()) {
      return response.status(401).json({ error: "unauthorized token used" });
    }

    await Blog.findByIdAndRemove(request.params.id);
    response.status(204).end();
  }
);

blogsRouter.put("/:id", async (request, response, next) => {
  const { author, title, url, likes, comments } = request.body;
  const updatedBlog = await Blog.findByIdAndUpdate(
    request.params.id,
    { author, title, url, likes, comments },
    { new: true, runValidators: true, context: "query" }
  );
  await updatedBlog.populate("user", { username: 1, name: 1 });
  response.json(updatedBlog);
});

module.exports = blogsRouter;
