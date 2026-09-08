# kesai-labs.github.io
KE:SAI Website


Page titles and descriptions are maintained in `site-metadata.json`. Blog titles
also populate the first (English) article heading and the blog listing. Use
`overrides` for intentional browser or social metadata variants; translated
headings remain in the article HTML.

After editing metadata, run:

```sh
python3 scripts/sync_metadata.py
python3 scripts/sync_metadata.py --check
```

Commit the generated HTML alongside the metadata. Deployment also runs the
generator, so metadata is present in the static HTML without JavaScript.
The framework post uses `abstract_from_opening` to copy its first paragraph
into the listing as plain text without article-local citations. Other listing
abstracts remain editorially maintained in `blog/index.html`.

Blog typography is shared in `site.css`. For new posts, load `/site.css`, wrap
article content in `.blog-body`, and use `<h2>` for section titles. Start figure
captions with `<figcaption><strong>Figure 1.</strong> …</figcaption>` (or `Table 1.`).
These inherit the standard section-title size and amber caption labels. Older
`.section-eyebrow` headings inside `.blog-body` use the same heading style;
category/date eyebrows outside the body keep their smaller style. Keep `post.css`
for post-specific layouts and widgets rather than redefining shared typography.
