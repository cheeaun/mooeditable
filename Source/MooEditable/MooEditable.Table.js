/*
---

script: MooEditable.Table.js

description: Extends MooEditable to insert table with manipulation options.

license: MIT-style license

authors:
- Radovan Lozej

requires:
- /MooEditable
- /MooEditable.UI
- /MooEditable.Actions

usage:
	Add the following tags in your html
	<link rel="stylesheet" href="MooEditable.css">
	<link rel="stylesheet" href="MooEditable.Table.css">
	<script src="mootools.js"></script>
	<script src="MooEditable.js"></script>
	<script src="MooEditable.Table.js"></script>

	<script>
	window.addEvent('domready', function(){
		var mooeditable = $('textarea-1').mooEditable({
			actions: 'bold italic underline strikethrough | table | toggleview'
		});
	});
	</script>

...
*/

MooEditable.UI.TableDialog = function(editor, dialog){
	var html = {
		tableadd: 'columns <input type="text" class="table-c" value="" size="4" /> '
			+ 'rows <input type="text" class="table-r" value="" size="4" /> ',
		tableedit: 'width <input type="text" class="table-w" value="" size="4" /> '
			+ 'class <input type="text" class="table-c" value="" size="15" /> ',
		tablerowedit: 'class <input type="text" class="table-c" value="" size="15" /> ',
		tablecoledit: 'width <input type="text" class="table-w" value="" size="4" /> '
			+ 'class <input type="text" class="table-c" value="" size="15" /> '
			+ 'align <select class="table-a"><option>none</option><option>left</option><option>center</option><option>right</option></select> '
			+ 'valign <select class="table-va"><option>none</option><option>top</option><option>middle</option><option>bottom</option></select> '
	};
	html[dialog] += '<button class="dialog-button dialog-ok-button">OK</button>'
		+ '<button class="dialog-button dialog-cancel-button">Cancel</button>';
		
	var action = {
		tableadd: {
			click: function(e){
				var col = this.el.getElement('.table-c').value.toInt();
				var row = this.el.getElement('.table-r').value.toInt();
				if (!(row>0 && col>0)) return;
				var div, table, tbody, ro = [];
				div = new Element('tdiv');
				table = new Element('table').set('border', 0).set('width', '100%').inject(div);
				tbody = new Element('tbody').inject(table);
				for (var r = 0;r<row;r++){
					ro[r] = new Element('tr').inject(tbody, 'bottom');
					for (var c=0; c<col; c++) new Element('td').set('html', '&nbsp;').inject(ro[r], 'bottom');
				}
				editor.selection.insertContent(div.get('html'));
			}
		},
		tableedit: {
			load: function(e){
				var node = editor.selection.getNode().getParent('table');
				this.el.getElement('.table-w').set('value', node.get('width'));
				this.el.getElement('.table-c').set('value', node.className);
			},
			click: function(e){
				var node = editor.selection.getNode().getParent('table');
				node.set('width', this.el.getElement('.table-w').value);
				node.className = this.el.getElement('.table-c').value;
			}
		},
		tablerowedit: {
			load: function(e){
				var node = editor.selection.getNode().getParent('tr');
				this.el.getElement('.table-c').set('value', node.className);
			},
			click: function(e){
				var node = editor.selection.getNode().getParent('tr');
				node.className = this.el.getElement('.table-c').value;
			}
		},
		tablecoledit: {
			load : function(e){
				var node = editor.selection.getNode();
				if (node.get('tag') != 'td') node = node.getParent('td');
				this.el.getElement('.table-w').set('value', node.get('width'));
				this.el.getElement('.table-c').set('value', node.className);
				this.el.getElement('.table-a').set('value', node.get('align'));
				this.el.getElement('.table-va').set('value', node.get('valign'));
			},
			click: function(e){
				var node = editor.selection.getNode();
				if (node.get('tag') != 'td') node = node.getParent('td');
				node.set('width', this.el.getElement('.table-w').value);
				node.className = this.el.getElement('.table-c').value;
				node.set('align', this.el.getElement('.table-a').value);
				node.set('valign', this.el.getElement('.table-va').value);
			}
		}
	};
	
	return new MooEditable.UI.Dialog(html[dialog], {
		'class': 'mooeditable-prompt-dialog',
		onOpen: function(){
			if (action[dialog].load) action[dialog].load.apply(this);
			var input = this.el.getElement('input');
			(function(){ input.focus(); }).delay(10);
		},
		onClick: function(e){
			if (e.target.tagName.toLowerCase() == 'button') e.preventDefault();
			var button = document.id(e.target);
			if (button.hasClass('dialog-cancel-button')){
				this.close();
			} else if (button.hasClass('dialog-ok-button')){
				this.close();
				action[dialog].click.apply(this);
			}
		}
	});
};

MooEditable.Actions.extend({

	tableadd:{
		title: 'Add Table',
		dialogs: {
			prompt: function(editor){
				return MooEditable.UI.TableDialog(editor, 'tableadd');
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
				return MooEditable.UI.TableDialog(editor, 'tableedit');
			}
		},
		command: function(){
			if (this.selection.getNode().getParent('table')) this.dialogs.tableedit.prompt.open();
		}
	},
	
	tablerowadd:{
		title: 'Add Row',
		command: function(){
			var node = this.selection.getNode().getParent('tr');
			if (node) node.clone().inject(node, 'after');
		}
	},
	
	tablerowedit:{
		title: 'Edit Row',
		dialogs: {
			prompt: function(editor){
				return MooEditable.UI.TableDialog(editor, 'tablerowedit');
			}
		},
		command: function(){
			if (this.selection.getNode().getParent('table')) this.dialogs.tablerowedit.prompt.open();
		}
	},
	
	tablerowspan:{
		title: 'Merge Row',
		command: function(){
			var node = this.selection.getNode();
			if (node.get('tag') != 'td') node = node.getParent('td');
			if (node){
				var index = node.cellIndex;
				var row = node.getParent().rowIndex;
				if (node.getParent().getParent().childNodes[row+node.rowSpan]){
					node.getParent().getParent().childNodes[row+node.rowSpan].deleteCell(index);
					node.rowSpan++;
				}
			}
		}
	},
	
	tablerowdelete:{
		title: 'Delete Row',
		command: function(){
			var node = this.selection.getNode().getParent('tr');
			if (node) node.getParent().deleteRow(node.rowIndex);
		}
	},
	
	tablecoladd:{
		title: 'Add Column',
		command: function(){
			var node = this.selection.getNode();
			if (node.get('tag') != 'td') node = node.getParent('td');
			if (node){
				var index = node.cellIndex;
				var len = node.getParent().getParent().childNodes.length;
				for (var i=0; i<len; i++){
					var ref = $(node.getParent().getParent().childNodes[i].childNodes[index]);
					ref.clone().inject(ref, 'after');
				}
			}
		}
	},
	
	tablecoledit:{
		title: 'Edit Column',
		dialogs: {
			prompt: function(editor){
				return MooEditable.UI.TableDialog(editor, 'tablecoledit');
			}
		},
		command: function(){
			if (this.selection.getNode().getParent('table')) this.dialogs.tablecoledit.prompt.open();
		}
	},
	
	tablecolspan:{
		title: 'Merge Cell',
		command: function(){
			var node = this.selection.getNode();
			if (node.get('tag')!='td') node = node.getParent('td');
			if (node){
				var index = node.cellIndex + 1;
				if (node.getParent().childNodes[index]){
					node.getParent().deleteCell(index);
					node.colSpan++;
				}
			}
		}
	},
	
	tablecoldelete:{
		title: 'Delete Column',
		command: function(){
			var node = this.selection.getNode();
			if (node.get('tag') != 'td') node = node.getParent('td');
			if (node){
				var len = node.getParent().getParent().childNodes.length;
				var index = node.cellIndex;
				var tt = node.getParent().getParent();
				for (var i=0; i<len; i++) tt.childNodes[i].deleteCell(index);
			}
		}
	}
	
});
