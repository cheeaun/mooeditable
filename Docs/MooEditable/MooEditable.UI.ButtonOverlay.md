Class: MooEditable.UI.ButtonOverlay {#MooEditable-UI-ButtonOverlay}
===================================================================

UI Class to create a button element with a popup overlay.

### Extends:

[MooEditable.UI.Button][]


MooEditable.UI.ButtonOverlay Method: constructor {#MooEditable-UI-ButtonOverlay:constructor}
----------------------------------------------------------------------

### Syntax:

	var myMooEditableUIButtonOverlayInstance = new MooEditable.UI.ButtonOverlay([options]);
	
### Arguments:

1. options - (*object*, optional) The options object. Also inherited are all the options from [MooEditable.UI.Button][].

### Options:

* overlayHTML         - (*string*: defaults to null) The HTML source for the overlay.
* overlayClass        - (*string*: defaults to null) The class name of the overlay.
* overlaySize         - (*object*) The size of the overlay.
	* x - (*mixed*: defaults to 150) The value to which to set the width of overlay.
	* y - (*mixed*: defaults to 'auto') The value to which to set the height of overlay.
* overlayContentClass - The class name of the overlay content.

### Events:

* openOverlay - Executed when the overlay is opened.
* closeOverlay - Executed when the overlay is closed.



[MooEditable.UI.Button]:/MooEditable/MooEditable#MooEditable.UI.Button