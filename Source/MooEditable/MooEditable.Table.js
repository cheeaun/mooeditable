/*
Script: MooEditable.Table.js
	Add table

Usage:
   Add the following tags in your html
   <link rel="stylesheet" type="text/css" href="MooEditable.Table.css">
   <script type="text/javascript" src="mootools.js"></script>
   <script type="text/javascript" src="MooEditable.js"></script>
   <script type="text/javascript" src="MooEditable.Table.js"></script>

   <script type="text/javascript">
	window.addEvent('load', function(){
		var mooeditable = $('textarea-1').mooEditable({
			actions: 'bold italic underline strikethrough | table | toggleview'
		});
   </script>

License:
	MIT-style license.

Author:
    Radovan Lozej <radovan lozej gmail com>
*/

MooEditable.UI.TableDialog = function(editor){
	var html = 'columns <input type="text" class="table-c" value="" size="4" /> '
		+ 'rows <input type="text" class="table-r" value="" size="4" /> '
		+ '<input type="checkbox" class="table-h"/> header &nbsp; '
		+ '<button class="dialog-button dialog-ok-button">Insert</button>'
		+ '<button class="dialog-button dialog-cancel-button">Cancel</button>';
	return new MooEditable.UI.Dialog(html, {
		'class': 'mooeditable-prompt-dialog',
		onOpen: function(){
			var input = this.el.getElement('.table-r');
			(function(){
				input.focus();
				input.select();
			}).delay(10);
		},
		onClick: function(e){
			if (e.target.tagName.toLowerCase() == 'button') e.preventDefault();
			var button = document.id(e.target);
			if (button.hasClass('dialog-cancel-button')) this.close();
			else if (button.hasClass('dialog-ok-button')){
				this.close();
				var col = this.el.getElement('.table-c').value.toInt();
				var row = this.el.getElement('.table-r').value.toInt()+1;
				var header = this.el.getElement('.table-h').checked;
				if(!(row>0 && col>0)) return;
				var div,table,tbody,ro = [];
				div = new Element('tdiv');
				table = new Element('table').set('border','0').set('width','100%').inject(div);
				tbody = new Element('tbody').inject(table);
				var r = 1;
				if(header) r = 0;
				for(r;r<row;r++){
					ro[r] = new Element('tr').inject(tbody,'bottom');
					for(var c=0;c<col;c++){
						new Element( r==0 ? 'th' : 'td' ).set('html', r==0 ? ('header '+(c+1)) : '&nbsp;' ).inject(ro[r],'bottom');
					}
				}
				editor.selection.insertContent(div.get('html'));
			}
		}
	});
};


MooEditable.Actions.table = {
	
	title: 'Add Table',
	dialogs: {
		prompt: function(editor){
			return MooEditable.UI.TableDialog(editor);
		}
	},
	command: function(){
		this.dialogs.table.prompt.open();
	}
};
