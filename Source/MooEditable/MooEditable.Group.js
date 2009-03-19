/*
Script: MooEditable.Group.js
	A MooEditable extension for having multiple MooEditable instances on a page controlled by one toolbar.

License:
	MIT-style license.
*/

MooEditable.Group = new Class({

	Implements: [Options],
	
	options: {
		actions: 'bold italic underline strikethrough | insertunorderedlist insertorderedlist indent outdent | undo redo | createlink unlink | urlimage | toggleview'
	},
    
	initialize: function(toolbarEl, options){
		this.setOptions(options);
		this.actions = this.options.actions.clean().split(' ');
		// setup toolbar
		var self = this;
		this.toolbar = new MooEditable.UI.Toolbar({
			onItemAction: function(){
				var args = $splat(arguments);
				var item = args[0];
                if (!self.activeEditor) return;
                self.activeEditor.focus();
                self.activeEditor.action(item.name, args);
                if (self.activeEditor.mode == 'iframe') self.activeEditor.checkStates();
			}
		}).render(this.actions);
		$(toolbarEl).adopt(this.toolbar);
	},

	add: function(el, options){
		var editor = new MooEditable.Group.Item(el, this, $merge({toolbar:false}, options));
		this.activeEditor = editor;
		return editor;
	}
	
});


MooEditable.Group.Item = new Class({

	Extends: MooEditable,

	initialize: function(el, group, options){
		this.group = group;
		this.parent(el, options);
		// add focus events
		this.textarea.addEvent('focus', function(){
			this.group.activeEditor = this;
		}.bind(this));
		// safari doesnt fire onfocus event, so make it onclick
		this.win.addEvent('focus', function(){
			this.group.activeEditor = this;
		}.bind(this));
	}

});