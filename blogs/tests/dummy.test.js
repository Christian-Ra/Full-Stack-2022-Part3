const listHelper = require("../utils/list_helper");

test("dummy returns one", () => {
  const blogs = [];

  const result = listHelper.dummy(blogs);
  expect(result).toBe(1);
});

describe("total likes", () => {
  test("when list has only one blog, equals the likes of that", () => {
    const result = listHelper.totalLikes(oneBlogList);
    expect(result).toBe(5);
  });

  test("when given a full list of blogs, returns total number of likes", () => {
    const result = listHelper.totalLikes(blogs);
    expect(result).toBe(41);
  });
});
