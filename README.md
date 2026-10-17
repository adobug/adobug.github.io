# adobug.github.io

A small blog hosted on GitHub Pages. Posts are Markdown files rendered in the browser by [marked](https://marked.js.org/).

## Adding a post

1. Create a `.md` file in `posts/`.
2. Add an entry to the `POSTS` array in `posts.js` (`slug` must be unique).
3. Push to GitHub. The post shows up once Pages redeploys.

The post title comes from `posts.js` and is shown above the post, so start the Markdown file with `##` section headings rather than a `#` title.

## Images

Use standard Markdown: `![Alt text](image-url)`. For Google Photos or iCloud, use a direct link to the image file (right-click the image and copy the image address), or commit the image to the repo and link it with a relative path.
