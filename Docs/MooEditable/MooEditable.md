Class: MooEditable {#MooEditable}
=================================

A simple web-based WYSIWYG editor. 

### Implements:

[Events][], [Options][]


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
* actions       - (*string*: defaults to a string shown below) A string indicating the toolbar items and their arrangement (space-separated).

		'bold italic underline strikethrough | insertunorderedlist insertorderedlist indent outdent | undo redo | createlink unlink, | urlimage | toggleview'
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

### Events:

* render - Executed when the editor is rendered.
* attach - Executed when the editor is attached.
* detach - Executed when the editor is detached.
* editorMouseUp - Executed when 'mouseup' event is fired on the editor.
* editorMouseDown - Executed when 'mousedown' event is fired on the editor.
* editorContextMenu - Executed when 'contextmenu' event is fired on the editor.
* editorClick - Executed when 'click' event is fired on the editor.
* editorDoubleClick - Executed when 'doubleclick' event is fired on the editor.
* editorKeyPress - Executed when 'keypress' event is fired on the editor.
* editorKeyUp - Executed when 'keyup' event is fired on the editor.
* editorKeyDown - Executed when 'keydown' event is fired on the editor.
* dialogOpen - Executed when dialog is opened.
* dialogClose - Executed when dialog is closed.

### Example:

	var myMooEditable = new MooEditable('myTextarea', {
		handleSubmit: false,
		onRender: function(){
			alert('Done rendering.');
		}
	});



MooEditable Method: attach {#MooEditable:attach}
------------------------------------------------

Attaches the editor and replace the textarea.

### Syntax:

	myMooEditable.attach();
	
### Returns:

* (*object*) This MooEditable instance.



MooEditable Method: detach {#MooEditable:detach}
------------------------------------------------

Detaches the editor and replaced the textarea.

### Syntax:

	myMooEditable.detach();
	
### Returns:

* (*object*) This MooEditable instance.



MooEditable Method: toggleView {#MooEditable:toggleView}
------------------------------------------------

Toggles the editor view of the source or the WYSIWYG content.

### Syntax:

	myMooEditable.toggleView();
	
### Returns:

* (*object*) This MooEditable instance.



MooEditable Method: getContent {#MooEditable:getContent}
------------------------------------------------

Returns the source of the editor content.

### Syntax:

	myMooEditable.getContent();
	
### Returns:

* (*string*) The HTML source of the content



MooEditable Method: setContent {#MooEditable:setContent}
------------------------------------------------

Sets the source of the editor content.

### Syntax:

	myMooEditable.setContent('<p>Hello World.</p>');
	
### Returns:

* (*object*) This MooEditable instance.



MooEditable Method: saveContent {#MooEditable:saveContent}
------------------------------------------------

Saves the source of the WYSIWYG content to the textarea.

### Syntax:

	myMooEditable.saveContent();
	
### Returns:

* (*object*) This MooEditable instance.



Hash: MooEditable.Actions {#MooEditable-Actions}
================================================

This Hash contains the objects that specifies all 'actions' for the editor. The list of actions are:

* bold
* italic
* underline
* strikethrough
* insertunorderedlist
* insertorderedlist
* indent
* outdent
* undo
* redo
* unlink
* createlink
* urlimage
* toggleview



Native: Element {#Element}
================================================

Custom Native to allow all of its methods to be used with any DOM element via the dollar function [$][].

Element Method: mooEditable
---------------------------

Initializes the MooEditable instance on the element.

### Syntax:

	var myMooEditable = myElement.mooEditable([options]);

### Arguments:

* options - (*object*, optional) See [MooEditable](#MooEditable) for acceptable options.

### Returns:

* (*object*) The MooEditable instance that was created.

### Examples:

	var myMooEditable = $('myElement').mooEditable({
		onRender: function(){
			alert('Done rendering.');
		}
	});
	
### See Also:

* [MooEditable](#MooEditable)



[$]: http://mootools.net/docs/Element/Element/#dollar
[Events]: http://mootools.net/docs/Class/Class.Extras#Events
[Options]: http://mootools.net/docs/Class/Class.Extras#Options