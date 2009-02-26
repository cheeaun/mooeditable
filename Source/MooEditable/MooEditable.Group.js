/*
Script: MooEditable.Group.js
	A MooEditable extension for having multiple MooEditable instances on a page controlled by one toolbar.

License:
	MIT-style license.
*/

MooEditable.Group = new Class({

	Implements: [Options],
    
    options : {
        'actions' : 'bold italic underline strikethrough | insertunorderedlist insertorderedlist indent outdent | undo redo | createlink unlink | urlimage | toggleview'
    },
    
    elements : [],
    
    initialize : function(toolbarEl,options){
		this.setOptions(options);
		this.actions = this.options.actions.clean().split(' ');
        // setup toolbar
        var self = this;
		this.toolbar = new MooEditable.UI.Toolbar({
			'class': 'mooeditable-toolbar',
			onItemAction: function(){
				var args = $splat(arguments);
				var item = args[0];
				if(self.activeEditor){
                    self.activeEditor.focus();
                    self.activeEditor.action(item.name, Array.slice(args, 1));
                    if (self.activeEditor.mode == 'iframe') self.activeEditor.checkStates();
                }
			}
		});
		$(toolbarEl).adopt(this.toolbar.render(this.actions));
    },
    
    add : function(el,options){
		var editor = new MooEditable.Group.Item(el, this, $merge({toolbar:false},options));
		this.elements.push(el);
        this.activeEditor = editor;
		return editor;
	}
    
});


MooEditable.Group.Item = new Class({

    Extends : MooEditable,
 
	initialize : function(el,group,options){
		this.group = group;
		this.parent(el,options);
		// add focus events
		this.textarea.addEvent('focus',function(event){
            this.group.activeEditor = this;
		}.bindWithEvent(this));
		// safari doesnt fire onfocus event, so make it onclick
		this.doc.addEvent((Browser.Engine.webkit) ? 'click' : 'focus',function(event){
            this.group.activeEditor = this;
		}.bindWithEvent(this));
	}

});
