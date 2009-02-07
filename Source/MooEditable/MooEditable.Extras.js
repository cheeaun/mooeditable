/*
Script: MooEditable.Extras.js
	Extends MooEditable to include more (simple) toolbar buttons.

License:
	MIT-style license.
*/

MooEditable.Actions.extend({

	h1 :{
		title: 'H1',
		tags: ['h1'],
		arguments: '<h1>',
		command: 'formatBlock',
		mode: 'text'
	},
	
	h2 :{
		title: 'H2',
		tags: ['h2'],
		arguments: '<h2>',
		command: 'formatBlock',
		mode: 'text'
	},
	
	h3 :{
		title: 'H3',
		tags: ['h3'],
		arguments: '<h3>',
		command: 'formatBlock',
		mode: 'text'
	},
	
	paragraph :{
		title: 'P',
		tags: ['p'],
		arguments: '<p>',
		command: 'formatBlock',
		mode: 'text'
	},
	
	justifyLeft:{
		title: 'left',
		css:{'text-align': 'left'},
		mode: 'text'
	},
	
	justifyRight:{
		title: 'right',
		css:{'text-align': 'right'},
		mode: 'text'
	},
	
	justifyCenter:{
		title: 'center',
		css:{'text-align': 'center'},
		mode: 'text'
	},
	
	justifyFull:{
		title: 'justify',
		css:{'text-align': 'justify'},
		mode: 'text'
	}

});
