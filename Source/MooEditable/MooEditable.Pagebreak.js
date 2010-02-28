/*
---

script: MooEditable.Pagebreak.js

description: Extends MooEditable with pagebreak plugin

license: MIT-style license

authors:
- Ryan Mitchell

requires:
# - MooEditable
# - MooEditable.UI
# - MooEditable.Actions

provides: [MooEditable.Actions.pagebreak]

usage: |
  Add the following tags in your html
  <link rel="stylesheet" href="MooEditable.css">
  <link rel="stylesheet" href="MooEditable.Pagebreak.css">
  <script src="mootools.js"></script>
  <script src="MooEditable.js"></script>
  <script src="MooEditable.Pagebreak.js"></script>

  <script>
  window.addEvent('domready', function(){
    var mooeditable = $('textarea-1').mooEditable({
      actions: 'bold italic underline strikethrough | pagebreak | toggleview',
      externalCSS: '../../Assets/MooEditable/Editable.css'
    });
  });
  </script>

...
*/

MooEditable.Actions.Settings.pagebreak = {
	imageFile: '../../Assets/MooEditable/Other/pagebreak.gif'
};

MooEditable.lang.set({
	pageBreak: 'Page break'
});

MooEditable.Actions.extend({
	
	pagebreak: {
		title: MooEditable.lang.get('pageBreak'),
		command: function(){
			this.selection.insertContent('<img class="mooeditable-visual-aid mooeditable-pagebreak">');
		},
		events: {
			beforeToggleView: function(){ // code to run when switching from iframe to textarea
				if (this.mode == 'iframe'){
					var s = this.getContent().replace(/<img([^>]*)class="mooeditable-visual-aid mooeditable-pagebreak"([^>]*)>/gi, '<!-- page break -->');
					this.setContent(s);
				} else {
					var s = this.textarea.get('value').replace(/<!-- page break -->/gi, '<img class="mooeditable-visual-aid mooeditable-pagebreak">');
					this.textarea.set('value', s);
				}
			},
			render: function(){
				this.options.extraCSS = 'img.mooeditable-pagebreak { display:block; width:100%; height:16px; background: url('
					+ MooEditable.Actions.Settings.pagebreak.imageFile + ') repeat-x; }'
					+ this.options.extraCSS;
			}
		}
	}
		
});
