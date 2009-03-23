Class: MooEditable.UI.MenuList {#MooEditable-UI-MenuList}
=========================================================

UI Class to create a menu list (select) element.

### Implements:

[Events][], [Options][]


MooEditable.UI.MenuList Method: constructor {#MooEditable-UI-MenuList:constructor}
----------------------------------------------------------------------------------

### Syntax:

	var myMooEditableMenuList = new MooEditable.UI.MenuList([options]);
	
### Arguments:

1. options - (*object*, optional) The options object.

### Options:

* title - (*string*: defaults to null) The title of the menulist.
* name  - (*string*: defaults to null) The unique name of the menulist.
* class - (*string*: defaults to null) The class name of the menulist.
* list  - (*array*: defaults to empty array) An array of objects containing the text and value for the options of the menulist.
	* text - (*string*) The text of the option.
	* value - (*string*) The value of the option.

### Events:

* action - Executed when the action of the menulist is executed.



MooEditable.UI.MenuList Method: enable {#MooEditable-UI-MenuList:enable}
------------------------------------------------------------------------

Enables the menulist.

### Syntax:

	myMooEditableMenuList.enable();
	
### Returns:

* (*object*) This MooEditable.UI.MenuList instance.



MooEditable.UI.MenuList Method: disable {#MooEditable-UI-MenuList:disable}
--------------------------------------------------------------------------

Disables the menulist.

### Syntax:

	myMooEditableMenuList.disable();
	
### Returns:

* (*object*) This MooEditable.UI.MenuList instance.



MooEditable.UI.MenuList Method: activate {#MooEditable-UI-MenuList:activate}
----------------------------------------------------------------------------

Activates the menulist.

### Syntax:

	myMooEditableMenuList.activate([value]);
	
### Arguments:

1. value - (*string*, optional) The value of the option to be activated.

### Returns:

* (*object*) This MooEditable.UI.MenuList instance.



MooEditable.UI.MenuList Method: deactivate {#MooEditable-UI-MenuList:deactivate}
--------------------------------------------------------------------------------

Deactivates the menulist.

### Syntax:

	myMooEditableMenuList.deactivate();
	
### Returns:

* (*object*) This MooEditable.UI.MenuList instance.



[Events]: http://mootools.net/docs/Class/Class.Extras#Events
[Options]: http://mootools.net/docs/Class/Class.Extras#Options