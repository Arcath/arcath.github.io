---
layout: post
title: "A Jekyll extension for Atom"
date: 2014-04-02
categories: [Atom, Jekyll]
summary: Useful snippets and shortcuts to make your life easier when editing a Jekyll site in Atom.
---

I recently got into the [Atom] beta and have been using it for the past couple of weeks with no problems at all. One of the big features of [Atom] is that it is _hackable_ to the point that it comes by default with a _make new package_ command.

The only package I really use at the moment is [Zen] which is super simple, if you look at the source all it does it attach a couple of extra classes and supply a stylesheet.

Most of my work at the moment has been focused around [Jekyll] so it was as good a place as any to start thinking about a package. I quickly wrote [jekyll-new-post] and threw it out into the wild but pretty much as soon as I fixed issue #1 I started thinking of other things I could get [Atom] to do for me and it quickly became apparent that _jekyll-new-post_ was to focused a name.

## [Jekyll-Atom]

Instead of creating hundreds of Jekyll themed packages I decided to bundle everything into one, this way if you are using Jekyll you just install this 1 package and get all the functionality instead of picking and choosing.

### What can it do?

First off it provides a bunch of snippets for HTML/GFM/MD e.g. `jv` expands to {% raw %}`{{ ... }}`{% endraw %}. A full list of the snippets appears in the settings when you install the package.

It then currently has 3 commands that can be triggered a multitude of ways. One to open the layout for the current document, so this post has `layout:post` in its front matter if I press `Cmd+Alt+L` Atom will open `_layouts/post.html` for me. Secondly it adds a command to the pallet to open `_config.yml` not the most ground breaking feature but its nice to have. Lastly it provides the same box as [jekyll-new-post] making that plugin redundant, anyone using it will need to disable it before using [Jekyll-Atom].

I'm using this new plugin here with no issue but if you find one you can open an [issue on the github repo](https://github.com/Arcath/jekyll-atom/issues) and I will look at it.

I have a couple of ideas for expanding it but I need to look more at how [Atom] works behind the scenes and wether I can link into things like autocomplete.

[Atom]: https://atom.io
[Jekyll-Atom]: https://atom.io/packages/jekyll
[Zen]: https://atom.io/packages/Zen
[Jekyll]: http://jekyllrb.com
[jekyll-new-post]: https://github.com/Arcath/jekyll-new-post
