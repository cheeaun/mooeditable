/*
Script: MooEditable.Image.js
	Image manipulation

Usage:
   Add the following tags in your html
   <link rel="stylesheet" type="text/css" href="MooEditable.Table.css">
   <script type="text/javascript" src="mootools.js"></script>
   <script type="text/javascript" src="MooEditable.js"></script>
   <script type="text/javascript" src="MooEditable.Image.js"></script>

   <script type="text/javascript">
	window.addEvent('load', function(){
		var mooeditable = $('textarea-1').mooEditable({
			actions: 'bold italic underline strikethrough | image | toggleview'
		});
   </script>

License:
	MIT-style license.

Author:
    Radovan Lozej <radovan lozej gmail com>
*/

MooEditable.UI.ImageDialog = function(editor){
	var html = 'url <input type="text" class="dialog-url" value="" size="15" /> '
		+ 'alt <input type="text" class="dialog-alt" value="" size="8" /> '
		+ 'class <input type="text" class="dialog-class" value="" size="8" /> '
		+ 'align <select class="dialog-align"><option>none</option><option>left</option><option>center</option><option>right</option></select> '
		+ '<button class="dialog-button dialog-ok-button">OK</button> '
		+ '<button class="dialog-button dialog-cancel-button">Cancel</button>';
		
	return new MooEditable.UI.Dialog(html, {
		'class': 'mooeditable-prompt-dialog',
		onOpen: function(){
			var input = this.el.getElement('.dialog-url');
			var node = editor.selection.getNode();
			if (node.get('tag') == 'img'){
				this.el.getElement('.dialog-url').set('value', node.get('src'));
				this.el.getElement('.dialog-alt').set('value', node.get('alt'));
				this.el.getElement('.dialog-class').set('value', node.className);
				this.el.getElement('.dialog-align').set('align', node.get('align'));
			}
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
				var node = editor.selection.getNode();
				if (node.get('tag') == 'img'){
					node.set('src', this.el.getElement('.dialog-url').get('value').trim());
					node.set('alt', this.el.getElement('.dialog-alt').get('value').trim());
					node.className = this.el.getElement('.dialog-class').get('value').trim();
					node.set('align', this.el.getElement('.dialog-align').get('value'));
				} else {
					var div = new Element('div');
					new Element('img', {
						'src' : this.el.getElement('.dialog-url').get('value').trim(),
						'alt' : this.el.getElement('.dialog-alt').get('value').trim(),
						'class' : this.el.getElement('.dialog-class').get('value').trim(),
						'align' : this.el.getElement('.dialog-align').get('value')
					}).inject(div);
					editor.selection.insertContent(div.get('html'));
				}
			}
		}
	});
};

MooEditable.Actions.extend({
	
	image: {
		title: 'Add/Edit Image',
		options: {
			shortcut: 'm'
		},
		dialogs: {
			prompt: function(editor){
				return MooEditable.UI.ImageDialog(editor);
			}
		},
		command: function(){
			this.dialogs.image.prompt.open();
		}
	}
	
});
