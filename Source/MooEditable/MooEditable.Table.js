/*
Script: MooEditable.Table.js
	Table manipulation

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
		+ '<button class="dialog-button dialog-ok-button">Insert</button>'
		+ '<button class="dialog-button dialog-cancel-button">Cancel</button>';
	return new MooEditable.UI.Dialog(html, {
		'class': 'mooeditable-prompt-dialog',
		onOpen: function(){
			var input = this.el.getElement('.table-c');
			(function(){ input.focus(); }).delay(10);
		},
		onClick: function(e){
			if (e.target.tagName.toLowerCase() == 'button') e.preventDefault();
			var button = document.id(e.target);
			if (button.hasClass('dialog-cancel-button')) this.close();
			else if (button.hasClass('dialog-ok-button')){
				this.close();
				var col = this.el.getElement('.table-c').value.toInt();
				var row = this.el.getElement('.table-r').value.toInt();
				if(!(row>0 && col>0)) return;
				var div,table,tbody,ro = [];
				div = new Element('tdiv');
				table = new Element('table').set('border','0').set('width','100%').inject(div);
				tbody = new Element('tbody').inject(table);
				for(var r = 0;r<row;r++){
					ro[r] = new Element('tr').inject(tbody,'bottom');
					for(var c=0;c<col;c++) new Element('td').set('html','&nbsp;').inject(ro[r],'bottom');
				}
				editor.selection.insertContent(div.get('html'));
			}
		}
	});
};

MooEditable.Actions.extend({

	tableadd:{
		title: 'Add Table',
		dialogs: {
			prompt: function(editor){
				return MooEditable.UI.TableDialog(editor);
			}
		},
		command: function(){
			this.dialogs.tableadd.prompt.open();
		}
	},
	
	tableedit:{
		title: 'Edit Table',
		dialogs: {
			prompt: function(editor){
				return MooEditable.UI.TableDialog(editor);
			}
		},
		command: function(){
			this.dialogs.tableadd.prompt.open();
		}
	},
	
	tablerowadd:{
		title: 'Add Row',
		command: function(){
			var node = this.selection.getNode().getParent('tr');
			if(node) node.clone().inject(node,'after');
		}
	},
	
	tablerowedit:{
		title: 'Edit Row',
		dialogs: {
			prompt: function(editor){
				return MooEditable.UI.TableDialog(editor);
			}
		},
		command: function(){
			this.dialogs.tableadd.prompt.open();
		}
	},
	
	tablerowspan:{
		title: 'Merge Row',
		command: function(){
			var node = this.selection.getNode();
			if(node.get('tag')!='td') node = node.getParent('td');
			if(node){
				var index = node.cellIndex;
				var row = node.getParent().rowIndex;
				if(node.getParent().getParent().childNodes[row+node.rowSpan]) {
					node.getParent().getParent().childNodes[row+node.rowSpan].deleteCell(index);
					node.rowSpan+= 1;
				}
			} 
		}
	},
	
	tablerowdelete:{
		title: 'Delete Row',
		command: function(){
			var node = this.selection.getNode().getParent('tr');
			if(node) node.getParent().deleteRow(node.rowIndex);
		}
	},
	
	tablecoladd:{
		title: 'Add Column',
		command: function(){
			var node = this.selection.getNode();
			if(node.get('tag')!='td') node = node.getParent('td');
			if(node){
				var index = node.cellIndex;
				var len = node.getParent().getParent().childNodes.length;
				for (var i=0;i<len;i++){
					var ref = node.getParent().getParent().childNodes[i].childNodes[index];
					ref.clone().inject(ref,'after');
				}
			}
		}
	},
	
	tablecoledit:{
		title: 'Edit Column',
		dialogs: {
			prompt: function(editor){
				return MooEditable.UI.TableDialog(editor);
				// class,align,width,valign
			}
		},
		command: function(){
			this.dialogs.tableadd.prompt.open();
		}
	},
	
	tablecolspan:{
		title: 'Merge Cell',
		command: function(){
			var node = this.selection.getNode();
			if(node.get('tag')!='td') node = node.getParent('td');
			if(node){
				var index = node.cellIndex + 1;
				if(node.getParent().childNodes[index]) {
					node.getParent().deleteCell(index);
					node.colSpan = node.colSpan + 1;
				}
			}
		}
	},
	
	tablecoldelete:{
		title: 'Delete Column',
		command: function(){
			var node = this.selection.getNode();
			if(node.get('tag')!='td') node = node.getParent('td');
			if(node){
				var len = node.getParent().getParent().childNodes.length;
				var index = node.cellIndex
				var tt = node.getParent().getParent();
				for (var i=0;i<len;i++) tt.childNodes[i].deleteCell(index);
			}
		}
	}
	
});
