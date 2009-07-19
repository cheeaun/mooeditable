/*
Script: MooEditable.UI.Forecolor.js
	Extends MooEditable to change the color of the text from a list a predefined colors.

Usage:
   Add the following tags in your html
   <link rel="stylesheet" type="text/css" href="MooEditable.Forecolor.css">
   <script type="text/javascript" src="mootools.js"></script>
   <script type="text/javascript" src="MooEditable.js"></script>
   <script type="text/javascript" src="MooEditable.UI.ButtonOverlay.js"></script>
   <script type="text/javascript" src="MooEditable.Forecolor.js"></script>

   <script type="text/javascript">
	window.addEvent('load', function(){
		var mooeditable = $('textarea-1').mooEditable({
			actions: 'bold italic underline strikethrough | forecolor | toggleview'
		});
   </script>

License:
	MIT-style license.

Author:
    Olivier Refalo orefalo@yahoo.com
*/

MooEditable.Actions.forecolor = {
	type: 'button-overlay',
	title: 'Change Color',
	options: {
		overlaySize: {x: 'auto'},
		overlayHTML: (function(){
			var colors = [
				['000000', '993300', '333300', '003300', '003366', '000077', '333399', '333333'],
				['770000', 'ff6600', '777700', '007700', '007777', '0000ff', '666699', '777777'],
				['ff0000', 'ff9900', '99cc00', '339966', '33cccc', '3366f0', '770077', '999999'],
				['ff00ff', 'ffcc00', 'ffff00', '00ff00', '00ffff', '00ccff', '993366', 'cccccc'],
				['ff99cc', 'ffcc99', 'ffff99', 'ccffcc', 'ccffff', '99ccff', 'cc9977', 'ffffff']
			];
			var html = '';
			colors.each(function(row){
				row.each(function(c){
					html += '<a href="#" class="forecolor-colorpicker-color" style="background-color: #' + c + '" title="#' + c.toUpperCase() + '"></a>'; 
				});
				html += '<span class="forecolor-colorpicker-br"></span>';
			});
			return html;
		})()
	},
	command: function(buttonOverlay, e){
		var el = e.target;
		if (el.tagName.toLowerCase() != 'a') return;
		var color = $(el).getStyle('background-color');
		this.execute('forecolor', false, color);
		this.focus();
	}
};

