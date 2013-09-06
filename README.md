**Note**: This project is currently **on hiatus**. [Watch out for the forks](https://github.com/cheeaun/mooeditable/network) instead.

MooEditable
===========

A simple web-based WYSIWYG editor, written in [MooTools](http://mootools.net/).

![Screenshot](http://cheeaun.github.com/mooeditable/mooeditable-screenshot.png)

Features
--------

* Clean interface
* Customizable buttons
* Tango icons
* Lightweight
* Works in [A-graded desktop web browsers](http://developer.yahoo.com/yui/articles/gbs/)

How to Use
----------

There are two ways. Note that `textarea-1` is the `id` of a `textarea` element. This is the simple one:

	#JS
	$('textarea-1').mooEditable();

And this is the Classic one:

	#JS
	new MooEditable('textarea-1');
