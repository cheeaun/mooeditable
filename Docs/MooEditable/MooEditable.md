Class: MooEditable {#MooEditable}
=================================

A simple web-based WYSIWYG editor. 

### Implements:

[Events](http://mootools.net/docs/Class/Class.Extras#Events), [Options](http://mootools.net/docs/Class/Class.Extras#Options)


MooEditable Method: constructor {#MooEditable:constructor}
----------------------------------------------------------

### Syntax:

	var myMooEditableInstance = new MooEditable(textarea[, options]);

### Arguments:

1. textarea      - (*mixed*) A string of the id for an Element or an Element reference of the textarea this editor modifies
2. options - (*object*, optional) The options object.

### Options:

* toolbar       - (*boolean*: defaults to true) Whether or not to show the toolbar.
* cleanup:      - (*boolean*: defaults to true) Whether or not to clean up the HTML source.
* paragraphise  - (*boolean*: defaults to true) Whether or not to create `<p>` tags when pressing 'Enter'.
* xhtml         - (*boolean*: defaults to true) Whether or not to produce XHTML-valid output (empty/void elements with trailing slash).
* semantics     - (*boolean*: defaults to true) Whether or not to produce semantic markup (strong/em instead of b/i).
* buttons       - (*string*: defaults to a string shown below) A string indicating the buttons and their arrangement on the toolbar.

		'bold, italic, underline, strikethrough, |, insertunorderedlist, insertorderedlist, indent, outdent, |, undo, redo, |, createlink, unlink, |, urlimage, |, toggleview'
		
* mode          - (*string*: defaults to 'icons') Can be 'icons', 'text' and 'icons-text'.
	* 'icons'      - Iconic buttons.
	* 'text'       - Textual buttons.
	* 'icons-text' - Icon and text on the buttons.
* handleSubmit  - (*boolean*: defaults to true) Whether or not to attach a submit listener to the textarea's parent form, to save content to textarea before submit.
* handleLabel   - (*boolean*: defaults to true) Whether or not to attach a click listener to the textarea's related label tag, to focus on the iframe instead.
* baseCSS       - (*string*: defaults to a string shown below) A string indicating the base CSS code.

		html{ height: 100%; cursor: text }
		body{ font-family: sans-serif; border: 0; }
		
* extraCSS      - (*string*: defaults to null) A string indicating the extra CSS code besides the base.
* externalCSS   - (*string*: defaults to null) A string indicating the URL of the external CSS file. No `<link>` tag HTML needed.
* html          - (*string*: defaults to a string show below) A string indicating the HTML of the iframe content.
		
		<html>
		<head>
		<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
		<style>{BASECSS} {EXTRACSS}</style>
		{EXTERNALCSS}
		</head>
		<body>{CONTENT}</body>
		</html>
