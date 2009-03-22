Class: MooEditable.Group {#MooEditable-Group}
=============================================

An extension to the base MooEditable class for having multiple MooEditable instances on a page controlled by one toolbar.

### Implements:

[Options][]


MooEditable.Group Method: constructor {#MooEditable-Group:constructor}
----------------------------------------------------------------------

### Syntax:

	var myMooEditableGroupInstance = new MooEditable.Group([options]);
	
### Arguments:

1. options - (*object*, optional) The options object. Options from [MooEditable][] can be applied as well.

### Options:

* actions       - (*string*: defaults to a string shown below) A string indicating the toolbar items and their arrangement (space-separated).

		'bold italic underline strikethrough | insertunorderedlist insertorderedlist indent outdent | undo redo | createlink unlink, | urlimage | toggleview'



MooEditable.Group Method: add {#MooEditable-Group:add}
------------------------------------------------------

Adds a textarea to be instantiated as a MooEditable.Group.Item object.

### Syntax:

	myMooEditable.add(textarea);
	
### Arguments:

1. textarea - (*mixed*) A string of the id for an Element or an Element reference of the textarea this editor modifies.
	
### Returns:

* (*object*) The MooEditable.Group.Item instance.



Class: MooEditable.Group.Item {#MooEditable-Group-Item}
=======================================================

Wrapped MooEditable for the MooEditable.Group class.

### Extends:

[MooEditable][]


MooEditable.Group.Item Method: constructor {#MooEditable-Group-Item:constructor}
--------------------------------------------------------------------------------

### Syntax:

	var myMooEditableGroupItemInstance = new MooEditable.Group.Item(textarea, group[, options]);
	
### Arguments:

1. textarea - (*mixed*) A string of the id for an Element or an Element reference of the textarea this editor modifies.
2. group    - (*object*) A [MooEditable.Group](#MooEditable-Group) object.
3. options  - (*object*, optional) The options object. See [MooEditable][].



[Options]: http://mootools.net/docs/Class/Class.Extras#Options
[MooEditable]: /MooEditable/MooEditable