# adobug.github.io

A small blog hosted on GitHub Pages. Posts are Markdown files rendered in the browser by [marked](https://marked.js.org/).

## Adding a post

1. Create a `.md` file in `posts/`.
2. Add an entry to the `POSTS` array in `posts.js` (`slug` must be unique).
3. Push to GitHub. The post shows up once Pages redeploys.

The post title comes from `posts.js` and is shown above the post, so start the Markdown file with `##` section headings rather than a `#` title.

## Drafts

Add `draft: true` to a post's entry in `posts.js` to keep it off the home page. It can still be opened at `#/post/<slug>` and shows a "Draft" label. The repo is public, so drafts aren't private, just unlisted. To publish, delete the `draft` line and set `date` to the publish date.

## Footnotes

Put `[^1]` right after a word, and `[^1]: The note text` on its own line anywhere in the post (the end is easiest). Notes can contain links and formatting but must fit on one line. They pop up on hover (tap on phones) and are listed at the end of the post, numbered in reading order. Labels can be words too, like `[^poem]`.

## Images

Use standard Markdown: `![Alt text](image-url)`. For Google Photos or iCloud, use a direct link to the image file (right-click the image and copy the image address), or commit the image to the repo and link it with a relative path.
