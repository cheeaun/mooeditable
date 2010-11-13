/*
---

name: MooEditable.Forecolor

description: Extends MooEditable to change the color of the text from a list a predefined colors.

license: MIT-style license

authors:
- Olivier Refalo

requires:
# - MooEditable
# - MooEditable.UI
# - MooEditable.UI.ButtonOverlay
# - MooEditable.Actions

provides: [MooEditable.Actions.forecolor]

usage: |
  Add the following tags in your html
  <link rel="stylesheet" href="MooEditable.css">
  <link rel="stylesheet" href="MooEditable.Forecolor.css">
  <script src="mootools.js"></script>
  <script src="MooEditable.js"></script>
  <script src="MooEditable.UI.ButtonOverlay.js"></script>
  <script src="MooEditable.Forecolor.js"></script>

  <script>
  window.addEvent('domready', function(){
    var mooeditable = $('textarea-1').mooEditable({
      actions: 'bold italic underline strikethrough | forecolor | toggleview'
    });
  });
  </script>

...
*/

MooEditable.Actions.Settings.forecolor = {
	colors: [
		['000000', '993300', '333300', '003300', '003366', '000077', '333399', '333333'],
		['770000', 'ff6600', '777700', '007700', '007777', '0000ff', '666699', '777777'],
		['ff0000', 'ff9900', '99cc00', '339966', '33cccc', '3366f0', '770077', '999999'],
		['ff00ff', 'ffcc00', 'ffff00', '00ff00', '00ffff', '00ccff', '993366', 'cccccc'],
		['ff99cc', 'ffcc99', 'ffff99', 'ccffcc', 'ccffff', '99ccff', 'cc9977', 'ffffff']
	]
};

MooEditable.Locale.define('changeColor', 'Change Color');

MooEditable.Actions.forecolor = {
	type: 'button-overlay',
	title: MooEditable.Locale.get('changeColor'),
	options: {
		overlaySize: {x: 'auto'},
		overlayHTML: (function(){
			var html = '';
			MooEditable.Actions.Settings.forecolor.colors.each(function(row){
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
