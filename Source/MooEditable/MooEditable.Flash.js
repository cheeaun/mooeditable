/*
Script: MooEditable.Flash.js
	Flash embed

Usage:
   Add the following tags in your html
   <link rel="stylesheet" type="text/css" href="MooEditable.css">
   <link rel="stylesheet" type="text/css" href="MooEditable.Flash.css">
   <script type="text/javascript" src="mootools.js"></script>
   <script type="text/javascript" src="MooEditable.js"></script>
   <script type="text/javascript" src="MooEditable.Flash.js"></script>

   <script type="text/javascript">
	window.addEvent('load', function(){
		var mooeditable = $('textarea-1').mooEditable({
			actions: 'bold italic underline strikethrough | flash | toggleview',
			externalCSS: '../../Assets/MooEditable/Editable.css'
		});
   </script>

License:
	MIT-style license.

Author:
    Radovan Lozej <radovan lozej gmail com>
*/

MooEditable.UI.FlashDialog = function(editor){
	var html = 'embed <textarea class="dialog-f" value="" rows="2" cols="40" /></textarea> '
		+ '<button class="dialog-button dialog-ok-button">OK</button> '
		+ '<button class="dialog-button dialog-cancel-button">Cancel</button>';
	return new MooEditable.UI.Dialog(html, {
		'class': 'mooeditable-prompt-dialog',
		onOpen: function(){
			var input = this.el.getElement('.dialog-f');
			(function(){
				input.focus();
				input.select();
			}).delay(10);
		},
		onClick: function(e){
			if (e.target.tagName.toLowerCase() == 'button') e.preventDefault();
			var button = document.id(e.target);
			if (button.hasClass('dialog-cancel-button')){
				this.close();
			} else if (button.hasClass('dialog-ok-button')){
				this.close();
				var div = new Element('div').set('html', this.el.getElement('.dialog-f').get('value').trim());
				editor.selection.insertContent(div.get('html'));
			}
		}
	});
};

MooEditable.Actions.extend({
	
	flash: {
		title: 'Flash embed',
		dialogs: {
			prompt: function(editor){
				return MooEditable.UI.FlashDialog(editor);
			}
		},
		command: function(){
			this.dialogs.flash.prompt.open();
		}
	}
	
});
