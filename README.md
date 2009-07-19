MooEditable
===========

About
-----
A simple web-based WYSIWYG editor, written in [MooTools](http://mootools.net/).

Features
--------

* Clean interface
* Customizable buttons
* Tango icons
* Lightweight
* Fully degradable when Javascript disabled
* Works in Internet Explorer 6/7/8, Firefox 2/3, Opera 9/10 and Safari 3/4

Requirements
------------

[Mootools 1.2.3 Core](http://mootools.net/download), with minimum requirements of:

* Class.Extras
* Element.Event
* Element.Style
* Element.Dimensions
* Selectors
* Request.HTML (if uses AJAX submit)

Examples
--------

The basic code:

	window.addEvent('load', function(){
		$('textarea-1').mooEditable();
	});

