/*
---

script: MooEditable.Extras.js

description: Extends MooEditable to include more (simple) toolbar buttons.

license: MIT-style license

authors:
- Lim Chee Aun
- Ryan Mitchell

requires:
# - MooEditable
# - MooEditable.UI
# - MooEditable.UI.MenuList

provides: 
- MooEditable.Actions.formatBlock
- MooEditable.Actions.justifyleft
- MooEditable.Actions.justifyright
- MooEditable.Actions.justifycenter
- MooEditable.Actions.justifyfull
- MooEditable.Actions.removeformat
- MooEditable.Actions.insertHorizontalRule

...
*/

MooEditable.lang.set({
	blockFormatting: 'Block Formatting',
	paragraph: 'Paragraph',
	heading1: 'Heading 1',
	heading2: 'Heading 2',
	heading3: 'Heading 3',
	alignLeft: 'Align Left',
	alignRight: 'Align Right',
	alignCenter: 'Align Center',
	alignJustify: 'Align Justify',
	removeFormatting: 'Remove Formatting',
	insertHorizontalRule: 'Insert Horizontal Rule'
});

MooEditable.Actions.extend({

	formatBlock: {
		title: MooEditable.lang.get('blockFormatting'),
		type: 'menu-list',
		options: {
			list: [
				{text: MooEditable.lang.get('paragraph'), value: 'p'},
				{text: MooEditable.lang.get('heading1'), value: 'h1', style: 'font-size:24px; font-weight:bold;'},
				{text: MooEditable.lang.get('heading2'), value: 'h2', style: 'font-size:18px; font-weight:bold;'},
				{text: MooEditable.lang.get('heading3'), value: 'h3', style: 'font-size:14px; font-weight:bold;'}
			]
		},
		states: {
			tags: ['p', 'h1', 'h2', 'h3']
		},
		command: function(menulist, name){
			var argument = '<' + name + '>';
			this.focus();
			this.execute('formatBlock', false, argument);
		}
	},
	
	justifyleft:{
		title: MooEditable.lang.get('alignLeft'),
		states: {
			css: {'text-align': 'left'}
		}
	},
	
	justifyright:{
		title: MooEditable.lang.get('alignRight'),
		states: {
			css: {'text-align': 'right'}
		}
	},
	
	justifycenter:{
		title: MooEditable.lang.get('alignCenter'),
		states: {
			tags: ['center'],
			css: {'text-align': 'center'}
		}
	},
	
	justifyfull:{
		title: MooEditable.lang.get('alignJustify'),
		states: {
			css: {'text-align': 'justify'}
		}
	},
	
	removeformat: {
		title: MooEditable.lang.get('removeFormatting')
	},
	
	insertHorizontalRule: {
		title: MooEditable.lang.get('insertHorizontalRule'),
		states: {
			tags: ['hr']
		},
		command: function(){
			this.selection.insertContent('<hr>');
		}
	}

});
