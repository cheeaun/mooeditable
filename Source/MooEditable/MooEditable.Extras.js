/*
Script: MooEditable.Extras.js
	Extends MooEditable to include more (simple) toolbar buttons.

License:
	MIT-style license.
*/

MooEditable.Actions.extend({

	formatBlock: {
		title: 'Block Formatting',
		type: 'menu-list',
		options: {
			list: [
				{text: 'Paragraph', value: 'p'},
				{text: 'Heading 1', value: 'h1'},
				{text: 'Heading 2', value: 'h2'},
				{text: 'Heading 3', value: 'h3'}
			]
		},
		states: {
			tags: ['p', 'h1', 'h2', 'h3']
		},
		command: function(name){
			var argument = '<' + name + '>';
			this.execute('formatBlock', false, argument);
		}
	},
	
	justifyLeft:{
		title: 'Align Left',
		states: {
			css:{'text-align': 'left'}
		}
	},
	
	justifyRight:{
		title: 'Align Right',
		states: {
			css:{'text-align': 'right'}
		}
	},
	
	justifyCenter:{
		title: 'Align Center',
		states: {
			css:{'text-align': 'center'}
		}
	},
	
	justifyFull:{
		title: 'Align Justify',
		states: {
			css:{'text-align': 'justify'}
		}
	}

});
