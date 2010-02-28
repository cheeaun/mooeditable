/*
---

script: MooEditable.Image.js

description: Extends MooEditable to insert image with manipulation options.

license: MIT-style license

authors:
- Radovan Lozej

requires:
# - MooEditable
# - MooEditable.UI
# - MooEditable.Actions

provides: [MooEditable.UI.ImageDialog, MooEditable.Actions.image]

usage: |
  Add the following tags in your html
  <link rel="stylesheet" href="MooEditable.css">
  <link rel="stylesheet" href="MooEditable.Image.css">
  <script src="mootools.js"></script>
  <script src="MooEditable.js"></script>
  <script src="MooEditable.Image.js"></script>

  <script>
  window.addEvent('domready', function(){
    var mooeditable = $('textarea-1').mooEditable({
      actions: 'bold italic underline strikethrough | image | toggleview'
    });
  });
  </script>

...
*/

MooEditable.lang.set({
	imageAlt: 'alt',
	imageClass: 'class',
	imageAlign: 'align',
	imageAlignNone: 'none',
	imageAlignLeft: 'left',
	imageAlignCenter: 'center',
	imageAlignRight: 'right',
	addEditImage: 'Add/Edit Image'
});

MooEditable.UI.ImageDialog = function(editor){
	var html = MooEditable.lang.get('enterImageURL') + ' <input type="text" class="dialog-url" value="" size="15"> '
		+ MooEditable.lang.get('imageAlt') + ' <input type="text" class="dialog-alt" value="" size="8"> '
		+ MooEditable.lang.get('imageClass') + ' <input type="text" class="dialog-class" value="" size="8"> '
		+ MooEditable.lang.get('imageAlign') + ' <select class="dialog-align">'
			+ '<option>' + MooEditable.lang.get('imageAlignNone') + '</option>'
			+ '<option>' + MooEditable.lang.get('imageAlignLeft') + '</option>'
			+ '<option>' + MooEditable.lang.get('imageAlignCenter') + '</option>'
			+ '<option>' + MooEditable.lang.get('imageAlignRight') + '</option>'
		+ '</select> '
		+ '<button class="dialog-button dialog-ok-button">' + MooEditable.lang.get('ok') + '</button> '
		+ '<button class="dialog-button dialog-cancel-button">' + MooEditable.lang.get('cancel') + '</button>';
		
	return new MooEditable.UI.Dialog(html, {
		'class': 'mooeditable-image-dialog',
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
						src: this.el.getElement('.dialog-url').get('value').trim(),
						alt: this.el.getElement('.dialog-alt').get('value').trim(),
						'class': this.el.getElement('.dialog-class').get('value').trim(),
						align: this.el.getElement('.dialog-align').get('value')
					}).inject(div);
					editor.selection.insertContent(div.get('html'));
				}
			}
		}
	});
};

MooEditable.Actions.extend({
	
	image: {
		title: MooEditable.lang.get('addEditImage'),
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
