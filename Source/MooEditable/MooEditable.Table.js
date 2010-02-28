/*
---

script: MooEditable.Table.js

description: Extends MooEditable to insert table with manipulation options.

license: MIT-style license

authors:
- Radovan Lozej
- Ryan Mitchell

requires:
# - MooEditable
# - MooEditable.UI
# - MooEditable.Actions

provides:
- MooEditable.UI.TableDialog
- MooEditable.Actions.tableadd
- MooEditable.Actions.tableedit
- MooEditable.Actions.tablerowadd
- MooEditable.Actions.tablerowedit
- MooEditable.Actions.tablerowspan
- MooEditable.Actions.tablerowsplit
- MooEditable.Actions.tablerowdelete
- MooEditable.Actions.tablecoladd
- MooEditable.Actions.tablecoledit
- MooEditable.Actions.tablecolspan
- MooEditable.Actions.tablecolsplit
- MooEditable.Actions.tablecoldelete

usage: |
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

MooEditable.lang.set({
	tableColumns: 'columns',
	tableRows: 'rows',
	tableWidth: 'width',
	tableClass: 'class',
	tableType: 'type',
	tableHeader: 'Header',
	tableCell: 'Cell',
	tableAlign: 'align',
	tableAlignNone: 'none',
	tableAlignCenter: 'center',
	tableAlignRight: 'right',
	tableValign: 'vertical align',
	tableValignNone: 'none',
	tableValignTop: 'top',
	tableValignMiddle: 'middle',
	tableValignBottom: 'bottom',
	addTable: 'Add Table',
	editTable: 'Edit Table',
	addTableRow: 'Add Table Row',
	editTableRow: 'Edit Table Row',
	mergeTableRow: 'Merge Table Row',
	splitTableRow: 'Split Table Row',
	deleteTableRow: 'Delete Table Row',
	addTableCol: 'Add Table Column',
	editTableCol: 'Edit Table Column',
	mergeTableCell: 'Merge Table Cell',
	splitTableCell: 'Split Table Cell',
	deleteTableCol: 'Delete Table Column'
});

MooEditable.UI.TableDialog = function(editor, dialog){
	var html = {
		tableadd: MooEditable.lang.get('tableColumns') + ' <input type="text" class="table-c" value="" size="4"> '
			+ MooEditable.lang.get('tableRows') + ' <input type="text" class="table-r" value="" size="4"> ',
		tableedit: MooEditable.lang.get('tableWidth') + ' <input type="text" class="table-w" value="" size="4"> '
			+ MooEditable.lang.get('tableClass') + ' <input type="text" class="table-c" value="" size="15"> ',
		tablerowedit: MooEditable.lang.get('tableClass') + ' <input type="text" class="table-c" value="" size="15"> '
			+ MooEditable.lang.get('tableType') + ' <select class="table-c-type">'
				+ '<option value="th">' + MooEditable.lang.get('tableHeader') + '</option>'
				+ '<option value="td">' + MooEditable.lang.get('tableCell') + '</option>'
			+ '</select> ',
		tablecoledit: MooEditable.lang.get('tableWidth') + ' <input type="text" class="table-w" value="" size="4"> '
			+ MooEditable.lang.get('tableClass') + ' <input type="text" class="table-c" value="" size="15"> '
			+ MooEditable.lang.get('tableAlign') + ' <select class="table-a">'
				+ '<option>' + MooEditable.lang.get('tableAlignNone') + '</option>'
				+ '<option>' + MooEditable.lang.get('tableAlignLeft') + '</option>'
				+ '<option>' + MooEditable.lang.get('tableAlignCenter') + '</option>'
				+ '<option>' + MooEditable.lang.get('tableAlignRight') + '</option>'
			+ '</select> '
			+ MooEditable.lang.get('tableValign') + ' <select class="table-va">'
				+ '<option>' + MooEditable.lang.get('tableValignNone') + '</option>'
				+ '<option>' + MooEditable.lang.get('tableValignTop') + '</option>'
				+ '<option>' + MooEditable.lang.get('tableValignMiddle') + '</option>'
				+ '<option>' + MooEditable.lang.get('tableValignBottom') + '</option>'
			+ '</select> '
	};
	html[dialog] += '<button class="dialog-button dialog-ok-button">' + MooEditable.lang.get('ok') + '</button>'
		+ '<button class="dialog-button dialog-cancel-button">' + MooEditable.lang.get('cancel') + '</button>';
		
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
				for (var r = 0; r<row; r++){
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
				this.el.getElement('.table-c-type').set('value', editor.selection.getNode().get('tag'));
			},
			click: function(e){
				var node = editor.selection.getNode().getParent('tr');
				node.className = this.el.getElement('.table-c').value;
				node.getElements('td, th').each(function(c){
					if (this.el.getElement('.table-c-type') != c.get('tag')){
						var n = editor.doc.createElement(this.el.getElement('.table-c-type').get('value'));
						$(n).set('html', c.get('html')).replaces(c);
					}
				}, this);
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
		'class': 'mooeditable-table-dialog',
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
		title: MooEditable.lang.get('addTable'),
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
		title: MooEditable.lang.get('editTable'),
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
		title: MooEditable.lang.get('editTableRow'),
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
		title: MooEditable.lang.get('mergeTableRow'),
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
	
	tablerowsplit:{
		title: MooEditable.lang.get('splitTableRow'),
		command: function(){
			var node = this.selection.getNode();
			if (node.get('tag') != 'td') node = node.getParent('td');
			if (node){
				var index = node.cellIndex;
				var row = node.getParent().rowIndex;
				if (node.getProperty('rowspan')){
					var rows = parseInt(node.getProperty('rowspan'));
					for (i=1; i<rows; i++){
						node.getParent().getParent().childNodes[row+i].insertCell(index);
					}
					node.removeProperty('rowspan');
				}
			}
		},
		states: function(node){
			if (node.get('tag') != 'td') return;
			if (node){
				if (node.getProperty('rowspan') && parseInt(node.getProperty('rowspan')) > 1){
					this.el.addClass('onActive');
				}
			}
		}
	},
	
	tablerowdelete:{
		title: MooEditable.lang.get('deleteTableRow'),
		command: function(){
			var node = this.selection.getNode().getParent('tr');
			if (node) node.getParent().deleteRow(node.rowIndex);
		}
	},
	
	tablecoladd:{
		title: MooEditable.lang.get('addTableCol'),
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
		title: MooEditable.lang.get('editTableCol'),
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
		title: MooEditable.lang.get('mergeTableCell'),
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
		
	tablecolsplit:{
		title: MooEditable.lang.get('splitTableCell'),
		command: function(){
			var node = this.selection.getNode();
			if (node.get('tag')!='td') node = node.getParent('td');
			if (node){
				var index = node.cellIndex + 1;
				if(node.getProperty('colspan')){
					var cols = parseInt(node.getProperty('colspan'));
					for (i=1;i<cols;i++){
						node.getParent().insertCell(index+i);
					}
					node.removeProperty('colspan');
				}
			}
		},
		states: function(node){
			if (node.get('tag')!='td') return;
			if (node){
				if (node.getProperty('colspan') && parseInt(node.getProperty('colspan')) > 1){
					this.el.addClass('onActive');
				}
			}
		}
	},
	
	tablecoldelete:{
		title: MooEditable.lang.get('deleteTableCol'),
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
