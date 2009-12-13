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
* Fully degradable when Javascript disabled
* Works in Internet Explorer 6/7/8, Firefox 2/3, Opera 9/10 and Safari 3/4

How to Use
----------

There are two ways. Note that `textarea-1` is the `id` of a `textarea` element. This is the simple one:

	#JS
	$('textarea-1').mooEditable();

And this is the classic one:

	#JS
	new MooEditable('textarea-1');
