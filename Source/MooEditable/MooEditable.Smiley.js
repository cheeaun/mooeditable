/*
Script: MooEditable.UI.Smiley.js
	UI Class to create smiley images from a dropdown.
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
		overlaySize: {x:'auto', y:'auto'},
		overlayHTML: (function(){
			
			var pathToImages = '../../Assets/MooEditable/Smiley/';
			var html = '';
			var smileys = ['angryface', 'blush', 'gasp', 'grin', 'halo', 'lipsaresealed', 'smile', 'undecided', 'wink'];
						
			$each(smileys, function(sm){
				html+= '<img src="'+ pathToImages + sm +'.png" style="padding:1px 2px;"></img>'; 
			},self);
	           
			return html;
		})()
	},
	command: function(buttonOverlay, e){
		var el = e.target;
		if (el.tagName.toLowerCase() != 'img') return;
		var src = $(el).get('src');
		
		var fragment =  '<img style="border:0 none;" CONTENTEDITABLE = "false" src="'+src+'"></img>';
		this.selection.insertContent(fragment);
		
		this.focus();
	}
};
