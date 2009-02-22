/*
Script: MooEditable.Group.js
	A MooEditable extension for having multiple MooEditable instances on a page controlled by one toolbar.

License:
	MIT-style license.
*/

MooEditable.Group = new Class({

	Extends: MooEditable,
		
	initialize: function(toolbarEl, editorEl, options){
		this.setOptions(options);
		this.actions = this.options.actions.clean().split(' ');
		this.keys = {};
		this.actions.each(function(action){
			var act = MooEditable.Actions[action];
			if (!act || !act.options) return;
			var key = act.options.shortcut;
			if (key) this.keys[key] = action;
		}.bind(this));
		this.options.toolbar = false; // no toolbars for the editors
		this.addInstance(editorEl);
        self = this;
		this.toolbar = new MooEditable.UI.Toolbar({
			'class': 'mooeditable-toolbar',
			onItemAction: function(){
				var args = $splat(arguments);
				var item = args[0];
				self.focus();
				self.action(item.name, Array.slice(args, 1));
				if (self.mode == 'iframe') self.checkStates();
			}
		});
		$(toolbarEl).adopt(this.toolbar.render(this.actions));
	},
	
	addInstance: function(el){
		this.textarea = $(el);
		this.textarea.store('MooEditable', this);
		this.render();
		// add focus events
		this.textarea.addEvent('focus',function(event){ 
			this.textarea = $(event.target); 
			this.iframe = $(this.textarea.getProperty("id") + "-container").getChildren("iframe")[0];
			this.win = this.iframe.contentWindow;
			this.doc = this.win.document;
			this.mode = 'textarea';
		}.bindWithEvent(this));
		// safari doesnt fire onfocus event, so make it onclick
		this.doc.addEvent((Browser.Engine.webkit) ? 'click' : 'focus',function(event){
			this.self.win = this.win;
			this.self.iframe = $(this.win.name);
			this.self.doc = this.win.document;
			this.self.selection = new MooEditable.Selection(this.self);
			this.self.textarea = this.self.iframe.getParent().getChildren("textarea")[0];
			this.self.mode = 'iframe';
		}.bindWithEvent({self:this, win:this.win}));
	}

});
