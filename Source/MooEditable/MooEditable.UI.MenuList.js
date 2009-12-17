/*
---

script: MooEditable.UI.MenuList.js

description: UI Class to create a menu list (select) element.

license: MIT-style license

authors:
- Lim Chee Aun

requires:
# - MooEditable
# - MooEditable.UI

provides: [MooEditable.UI.MenuList]

...
*/

MooEditable.UI.MenuList = new Class({

	Implements: [Events, Options],

	options: {
		/*
		onAction: $empty,
		*/
		title: '',
		name: '',
		'class': '',
		list: []
	},

	initialize: function(options){
		this.setOptions(options);
		this.name = this.options.name;
		this.render();
	},
	
	toElement: function(){
		return this.el;
	},
	
	render: function(){
		var self = this;
		var html = '';
		this.options.list.each(function(item){
			html += '<option value="{value}" style="{style}">{text}</option>'.substitute(item);
		});
		this.el = new Element('select', {
			'class': self.options['class'],
			title: self.options.title,
			html: html,
			styles: { 'height' : '21px' },
			events: {
				change: self.change.bind(self)
			}
		});
		
		this.disabled = false;

		// add hover effect for IE
		if (Browser.Engine.trident) this.el.addEvents({
			mouseenter: function(e){ this.addClass('hover'); },
			mouseleave: function(e){ this.removeClass('hover'); }
		});
		
		return this;
	},
	
	change: function(e){
		e.preventDefault();
		if (this.disabled) return;
		var name = e.target.value;
		this.action(name);
	},
	
	action: function(){
		this.fireEvent('action', [this].concat($A(arguments)));
	},
	
	enable: function(){
		if (!this.disabled) return;
		this.disabled = false;
		this.el.set('disabled', false).removeClass('disabled').set({
			disabled: false,
			opacity: 1
		});
		return this;
	},
	
	disable: function(){
		if (this.disabled) return;
		this.disabled = true;
		this.el.set('disabled', true).addClass('disabled').set({
			disabled: true,
			opacity: 0.4
		});
		return this;
	},
	
	activate: function(value){
		if (this.disabled) return;
		var index = 0;
		if (value) this.options.list.each(function(item, i){
			if (item.value == value) index = i;
		});
		this.el.selectedIndex = index;
		return this;
	},
	
	deactivate: function(){
		this.el.selectedIndex = 0;
		this.el.removeClass('onActive');
		return this;
	}
	
});
