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

1. textarea      - (*mixed*) A string of the id for an Element or an Element reference of the textarea this editor modifies.
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
* rootElement   - (*string*: defaults to 'p') A string indicating the root element of the editor content.
* baseURL       - (*string*: defaults to null) A string indicating the editor content's base URL for resolving relative URLs.
* dimensions    - (*object*: defaults to null) An object with x/y values indicating the width and height of the editor. Useful when the editor is not displayed when initialized.

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

Detaches the editor and replaced by the original textarea.

### Syntax:

	myMooEditable.detach();
	
### Returns:

* (*object*) This MooEditable instance.



MooEditable Method: focus {#MooEditable:focus}
----------------------------------------------

Focus on the editor, regardless of which view is shown.

### Syntax:

	myMooEditable.focus();
	
### Returns:

* (*object*) This MooEditable instance.



MooEditable Method: toggleView {#MooEditable:toggleView}
--------------------------------------------------------

Toggles the editor view of the source or the WYSIWYG content.

### Syntax:

	myMooEditable.toggleView();
	
### Returns:

* (*object*) This MooEditable instance.



MooEditable Method: getContent {#MooEditable:getContent}
--------------------------------------------------------

Returns the source of the editor content.

### Syntax:

	myMooEditable.getContent();
	
### Returns:

* (*string*) The HTML source of the content



MooEditable Method: setContent {#MooEditable:setContent}
--------------------------------------------------------

Sets the source of the editor content.

### Syntax:

	myMooEditable.setContent('<p>Hello World.</p>');
	
### Returns:

* (*object*) This MooEditable instance.



MooEditable Method: saveContent {#MooEditable:saveContent}
----------------------------------------------------------

Saves the source of the WYSIWYG content to the textarea.

### Syntax:

	myMooEditable.saveContent();
	
### Returns:

* (*object*) This MooEditable instance.



Object: MooEditable.UI {#MooEditable-UI}
========================================

This Object contains the interface classes for MooEditable.



Class: MooEditable.UI.Toolbar {#MooEditable-UI-Toolbar}
=======================================================

The toolbar interface.

### Implements:

[Events][], [Options][]


MooEditable.UI.Toolbar Method: constructor {#MooEditable-UI-Toolbar:constructor}
--------------------------------------------------------------------------------

### Syntax:

	var myMooEditableToolbar = new MooEditable.UI.Toolbar([options]);

### Arguments:

1. options - (*object*, optional) The options object.

### Options:

* class - (*string*: defaults to null) The class name of the toolbar.

### Events:

* itemAction - Executed when an action of an item on the toolbar is executed.



MooEditable.UI.Toolbar Method: addItem {#MooEditable-UI-Toolbar:addItem}
------------------------------------------------------------------------

Add an item to the toolbar.

### Syntax:

	myMooEditableToolbar.addItem('item');
	
### Arguments:

1. item - (*string*) An action name that matches one already specified in [MooEditable.Actions](#MooEditable-Actions) hash.

### Returns:

* (*object*) The MooEditable.UI.<var>item</var> instance.



MooEditable.UI.Toolbar Method: getItem {#MooEditable-UI-Toolbar:getItem}
------------------------------------------------------------------------

Returns the item from the toolbar.

### Syntax:

	var myItem = myMooEditableToolbar.getItem('item');
	
### Arguments:

1. item - (*string*) An action name that matches one already specified in [MooEditable.Actions](#MooEditable-Actions) hash.

### Returns:

* (*object*) The MooEditable.Actions.<var>item</var> object.



MooEditable.UI.Toolbar Method: addSeparator {#MooEditable-UI-Toolbar:addSeparator}
----------------------------------------------------------------------------------

Add a separator to the toolbar.

### Syntax:

	myMooEditableToolbar.addSeparator();

### Returns:

* (*object*) The Element object of the separator.



MooEditable.UI.Toolbar Method: enable {#MooEditable-UI-Toolbar:enable}
----------------------------------------------------------------------

Enables all the items on the toolbar.

### Syntax:

	myMooEditableToolbar.enable();

### Returns:

* (*object*) This MooEditable.UI.Toolbar instance.



MooEditable.UI.Toolbar Method: disable {#MooEditable-UI-Toolbar:disable}
------------------------------------------------------------------------

Disables the items on the toolbar.

### Syntax:

	myMooEditableToolbar.disable(except);

### Arguments:

1. except - (*string*) An action name that matches one already specified in [MooEditable.Actions](#MooEditable-Actions) hash, to be excepted from becoming disabled on the toolbar.

### Returns:

* (*object*) This MooEditable.UI.Toolbar instance.



MooEditable.UI.Toolbar Method: show {#MooEditable-UI-Toolbar:show}
------------------------------------------------------------------

Shows the toolbar.

### Syntax:

	myMooEditableToolbar.show();

### Returns:

* (*object*) This MooEditable.UI.Toolbar instance.



MooEditable.UI.Toolbar Method: hide {#MooEditable-UI-Toolbar:hide}
------------------------------------------------------------------

Hides the toolbar.

### Syntax:

	myMooEditableToolbar.hide();

### Returns:

* (*object*) This MooEditable.UI.Toolbar instance.



Class: MooEditable.UI.Button {#MooEditable-UI-Button}
=====================================================

The button interface.

### Implements:

[Events][], [Options][]


MooEditable.UI.Button Method: constructor {#MooEditable-UI-Button:constructor}
------------------------------------------------------------------------------

### Syntax:

	var myMooEditableButton = new MooEditable.UI.Button([options]);

### Arguments:

1. options - (*object*, optional) The options object.

### Options:

* title    - (*string*: defaults to null) The title of the button.
* name     - (*string*: defaults to null) The unique name of the button.
* text     - (*string*: defaults to 'Button') The text shown on the button.
* class    - (*string*: defaults to null) The class name of the button.
* shortcut - (*string*: defaults to null) The keyboard shortcut key to trigger the action of the button.
* mode     - (*string*: defaults to 'icon') Can be 'icon', 'text' or 'icon-text'.
	* 'icon'      - Iconic button
	* 'text'      - Textual button
	* 'icon-text' - Icon and text shown on the button.

### Events:

* action - Executed when the action of the button is executed.



MooEditable.UI.Button Method: enable {#MooEditable-UI-Button:enable}
--------------------------------------------------------------------

Enables the button.

### Syntax:

	myMooEditableButton.enable();
	
### Returns:

* (*object*) This MooEditable.UI.Button instance.



MooEditable.UI.Button Method: disable {#MooEditable-UI-Button:disable}
----------------------------------------------------------------------

Disables the button.

### Syntax:

	myMooEditableButton.disable();
	
### Returns:

* (*object*) This MooEditable.UI.Button instance.



MooEditable.UI.Button Method: activate {#MooEditable-UI-Button:activate}
------------------------------------------------------------------------

Activates the button.

### Syntax:

	myMooEditableButton.activate();
	
### Returns:

* (*object*) This MooEditable.UI.Button instance.



MooEditable.UI.Button Method: deactivate {#MooEditable-UI-Button:deactivate}
----------------------------------------------------------------------------

Deactivates the button.

### Syntax:

	myMooEditableButton.deactivate();
	
### Returns:

* (*object*) This MooEditable.UI.Button instance.



Class: MooEditable.UI.Dialog {#MooEditable-UI-Dialog}
=====================================================

The dialog interface.

### Implements:

[Events][], [Options][]


MooEditable.UI.Dialog Method: constructor {#MooEditable-UI-Dialog:constructor}
------------------------------------------------------------------------------

### Syntax:

	var myMooEditableDialog = new MooEditable.UI.Dialog([options]);

### Arguments:

1. options - (*object*, optional) The options object.

### Options:

* class    - (*string*: defaults to null) The class name of the dialog.
* contentClass    - (*string*: defaults to null) The class name of the dialog content.

### Events:

* open - Executed when the dialog is opened.
* close - Executed when the dialog is closed.



MooEditable.UI.Dialog Method: open {#MooEditable-UI-Dialog:open}
----------------------------------------------------------------

Opens the dialog.

### Syntax:

	myMooEditableDialog.open();
	
### Returns:

* (*object*) This MooEditable.UI.Dialog instance.



MooEditable.UI.Dialog Method: close {#MooEditable-UI-Dialog:close}
------------------------------------------------------------------

Closes the dialog.

### Syntax:

	myMooEditableDialog.close();
	
### Returns:

* (*object*) This MooEditable.UI.Dialog instance.



Function: MooEditable.UI.AlertDialog {#MooEditable-UI-AlertDialog}
==================================================================

The alert dialog interface. Replacement for `alert()`.

### Syntax:

	var myMooEditableAlertDialog = MooEditable.UI.AlertDialog(text);

### Arguments:

1. text - (*string*) A string to be shown on the alert dialog.



Function: MooEditable.UI.PromptDialog {#MooEditable-UI-PromptDialog}
==================================================================

The prompt dialog interface. Replacement for `prompt()`.

### Syntax:

	var myMooEditablePromptDialog = MooEditable.UI.PromptDialog(question[, answer, fn]);

### Arguments:

1. question - (*string*) A string to be shown as the question on the prompt dialog.
2. answer   - (*string*, optional) A string to be shown in the answer field on the prompt dialog.
3. fn       - (*function*, optional) Executed when the OK button of the prompt dialog is clicked.



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

Element Method: mooEditable {#Element:mooEditable}
--------------------------------------------------

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