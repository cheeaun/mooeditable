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
		this.options.toolbar = false; // no toolbars for the editors
		this.addInstance(editorEl);
		this.toolbar = new MooEditable.UI.Toolbar(this);
		$(toolbarEl).adopt(this.toolbar.render());
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
