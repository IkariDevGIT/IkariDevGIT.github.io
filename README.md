# IkariDev

My personal site, live at [ikari.sillytilly.org](https://ikari.sillytilly.org).

## Posting on my blog

1. Contact me on Discord (`ikaridev`) and pitch me your post.
2. Make one post file in `src/content/blog/`, for example `src/content/blog/cheese.md`:

   ```md
   ---
   title: Cheese
   description: A post about cheese.
   tags: [cheese]
   authors: [cheeseguy]
   ---

   Cheese.
   ```

3. First time posting here? Add yourself to `src/data/authors.yaml`:

   ```yaml
   cheeseguy:
     name: Cheese Guy
     links:
       - label: Website
         href: https://example.com
   ```

4. Open a pull request. In the description, write what the post is about, why you want to post it on my site, and anything else i should know.
