/*
Script: MooEditable.UI.Smiley.js
	Extends MooEditable to insert smiley/emoticons.
	You may want to change the path of absolute path of the images

Usage:
   Add the following tags in your html
   <link rel="stylesheet" type="text/css" href="MooEditable.Smiley.css">
   <script type="text/javascript" src="mootools.js"></script>
   <script type="text/javascript" src="MooEditable.js"></script>
   <script type="text/javascript" src="MooEditable.UI.ButtonOverlay.js"></script>
   <script type="text/javascript" src="MooEditable.Smiley.js"></script>

   <script type="text/javascript">
	window.addEvent('load', function(){
		var mooeditable = $('textarea-1').mooEditable({
			actions: 'bold italic underline strikethrough | smiley | toggleview'
		});
   </script>

License:
	MIT-style license.

Author:
    Olivier Refalo orefalo@yahoo.com
*/

MooEditable.Actions.smiley = {
	type: 'button-overlay',
	title: 'Pick a Smiley!',
	options: {
		overlaySize: {x: 'auto'},
		overlayHTML: (function(){
			var pathToImages = '../../Assets/MooEditable/Smiley/';
			var smileys = ['angryface', 'blush', 'gasp', 'grin', 'halo', 'lipsaresealed', 'smile', 'undecided', 'wink'];
			var html = '';
			smileys.each(function(sm){
				html += '<img src="'+ pathToImages + sm +'.png" class="smiley-image">'; 
			});
			return html;
		})()
	},
	command: function(buttonOverlay, e){
		var el = e.target;
		if (el.tagName.toLowerCase() != 'img') return;
		var src = $(el).get('src');
		var content = '<img style="border:0;" class="smiley" src="'+src+'">';
		this.selection.insertContent(content);
		this.focus();
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
			editor.doc.execCommand('enableObjectResizing', false, !isSmiley);
		}
	}
};
