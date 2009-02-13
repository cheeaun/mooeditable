/*

	MooEditableGroup
	Class for having multiple MooEditable instances on a page controlled by one toolbar

*/
var MooEditableGroup = new Class({

	Extends: MooEditable,
		
	initialize: function(toolbarEl,editorEl,options){
		this.setOptions(options);
		this.options.toolbar = false; // no toolbars for the editors
		this.addInstance(editorEl);
		this.buildToolbar();
		this.toolbarButtons.inject(this.toolbar);
		$(toolbarEl).adopt(this.toolbar);
	},
	
	addInstance: function(el){
		this.textarea = $(el);
		this.textarea.store('MooEditable', this);
		this.build();
		// add focus events
		this.textarea.addEvent('focus',function(event){ 
			this.textarea = $(event.target); 
			this.iframe = $(this.textarea.getProperty("id") + "-container").getChildren("iframe")[0];
			this.win = this.iframe.contentWindow;
			this.doc = this.win.document;
		});
		this.doc.addEvent('focus',function(event){
			this.doc = $(event.target); 
			(function() { 
				this.win = $(this.doc.window);
				this.iframe = $(this.win.name);
				this.selection = new MooEditable.Selection(this);
				this.textarea = this.iframe.getParent().getChildren("textarea")[0];
			}.delay(10,this)); // delay this or it doesnt work
		}.bindWithEvent(this));
	}

});
