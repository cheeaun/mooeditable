/*
---

script: MooEditable.Group.js

description: Extends MooEditable to have multiple instances on a page controlled by one toolbar.

license: MIT-style license

authors:
- Ryan Mitchell

requires:
# - MooEditable
# - MooEditable.UI
# - MooEditable.Actions

provides: [MooEditable.Group]

...
*/

MooEditable.Group = new Class({

	Implements: [Options],
	
	options: {
		actions: 'bold italic underline strikethrough | insertunorderedlist insertorderedlist indent outdent | undo redo | createlink unlink | urlimage | toggleview'
	},
    
	initialize: function(toolbarEl, options){
		this.setOptions(options);
		this.actions = this.options.actions.clean().split(' ');
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
		document.id(toolbarEl).adopt(this.toolbar);
	},

	add: function(textarea, options){
		return this.activeEditor = new MooEditable.Group.Item(textarea, this, $merge({toolbar: false}, this.options, options));
	}
	
});


MooEditable.Group.Item = new Class({

	Extends: MooEditable,

	initialize: function(textarea, group, options){
		var self = this;
		this.group = group;
		this.parent(textarea, options);
		this.addEvent('attach', function(){
			var focus = function(){
				self.group.activeEditor = self;
			};
			self.textarea.addEvent('focus', focus);
			self.win.addEvent('focus', focus);
		});
	}

});