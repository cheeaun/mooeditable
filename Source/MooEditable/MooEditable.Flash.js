/*
---

script: MooEditable.Flash.js

description: Extends MooEditable to embed Flash.

license: MIT-style license

authors:
- Radovan Lozej

requires:
- /MooEditable
- /MooEditable.UI
- /MooEditable.Actions

usage:
	Add the following tags in your html
	<link rel="stylesheet" href="MooEditable.css">
	<link rel="stylesheet" href="MooEditable.Flash.css">
	<script src="mootools.js"></script>
	<script src="MooEditable.js"></script>
	<script src="MooEditable.Flash.js"></script>

	<script>
	window.addEvent('domready', function(){
		var mooeditable = $('textarea-1').mooEditable({
			actions: 'bold italic underline strikethrough | flash | toggleview',
			externalCSS: '../../Assets/MooEditable/Editable.css'
		});
	});
	</script>

...
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
