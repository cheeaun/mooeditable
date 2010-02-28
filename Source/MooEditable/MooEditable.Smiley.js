/*
---

script: MooEditable.Smiley.js

description: Extends MooEditable to insert smiley/emoticons.

license: MIT-style license

authors:
- Olivier Refalo

requires:
# - MooEditable
# - MooEditable.UI
# - MooEditable.UI.ButtonOverlay
# - MooEditable.Actions

provides: [MooEditable.Actions.smiley]

usage: |
  Add the following tags in your html
  <link rel="stylesheet" href="MooEditable.css">
  <link rel="stylesheet" href="MooEditable.Smiley.css">
  <script src="mootools.js"></script>
  <script src="MooEditable.js"></script>
  <script src="MooEditable.UI.ButtonOverlay.js"></script>
  <script src="MooEditable.Smiley.js"></script>

  <script>
  window.addEvent('domready', function(){
    var mooeditable = $('textarea-1').mooEditable({
      actions: 'bold italic underline strikethrough | smiley | toggleview'
    });
  });
  </script>

...
*/

MooEditable.Actions.Settings.smiley = {
	imagesPath: '../../Assets/MooEditable/Smiley/',
	smileys: ['angryface', 'blush', 'gasp', 'grin', 'halo', 'lipsaresealed', 'smile', 'undecided', 'wink'],
	fileExt: '.png'
};

MooEditable.lang.set({
	insertSmiley: 'Insert Smiley'
});

MooEditable.Actions.smiley = {
	type: 'button-overlay',
	title: MooEditable.lang.get('insertSmiley'),
	options: {
		overlaySize: {x: 'auto'},
		overlayHTML: (function(){
			var settings = MooEditable.Actions.Settings.smiley;
			var html = '';
			settings.smileys.each(function(s){
				html += '<img src="'+ settings.imagesPath + s + settings.fileExt + '" alt="" class="smiley-image">'; 
			});
			return html;
		})()
	},
	command: function(buttonOverlay, e){
		var el = e.target;
		if (el.tagName.toLowerCase() != 'img') return;
		var src = $(el).get('src');
		var content = '<img style="border:0;" class="smiley" src="' + src + '" alt="">';
		this.focus();
		this.selection.insertContent(content);
	},
	events: {
		attach: function(editor){
			if (Browser.Engine.trident){
				// addListener instead of addEvent, because controlselect is a native event in IE
				editor.doc.addListener('controlselect', function(e){
					var el = e.target;
					if (el.tagName.toLowerCase() != 'img') return;
					if (!$(el).hasClass('smiley')) return;
					e.preventDefault();
				});
			}
		},
		editorMouseDown: function(e, editor){
			var el = e.target;
			var isSmiley = (el.tagName.toLowerCase() == 'img') && $(el).hasClass('smiley');
			$try(function(){
				editor.doc.execCommand('enableObjectResizing', false, !isSmiley);
			});
		}
	}
};
