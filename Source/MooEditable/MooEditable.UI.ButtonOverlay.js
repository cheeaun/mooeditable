/*
Script: MooEditable.UI.ButtonOverlay.js
	UI Class to create a button element with a popup overlay.

License:
	MIT-style license.

Copyright:
	Copyright (c) 2007-2009 [Lim Chee Aun](http://cheeaun.com).
*/

MooEditable.UI.ButtonOverlay = new Class({

	Extends: MooEditable.UI.Button,

	options: {
		/*
		onOpenOverlay: $empty,
		onCloseOverlay: $empty,
		*/
		overlayHTML: '',
		overlayClass: '',
		overlaySize: {x: 150, y: 'auto'},
		overlayContentClass: ''
	},

	initialize: function(options){
		this.parent(options);
		this.render();
		this.el.addClass('mooeditable-ui-buttonOverlay');
		this.renderOverlay(this.options.overlayHTML);
	},
	
	renderOverlay: function(html){
		var self = this;
		this.overlay = new Element('div', {
			'class': 'mooeditable-ui-button-overlay ' + self.name + '-overlay ' + self.options.overlayClass,
			html: '<div class="overlay-content ' + self.options.overlayContentClass + '">' + html + '</div>',
			styles: {
				display: 'none',
				position: 'absolute',
				width: self.options.overlaySize.x,
				height: self.options.overlaySize.y
			},
			events: {
				click: self.clickOverlay.bind(self)
			}
		}).inject(document.body).store('MooEditable.UI.ButtonOverlay', this);
		this.overlayVisible = false;
		window.addEvent('click', function(e){
			var el = e.target;
			if (el == self.el) return;
			if (Element.hasClass(el, self.name + '-overlay')) return;
			if (Element.getParents(el, '.' + self.name + '-overlay').length) return;
			self.closeOverlay();
		});
	},
	
	openOverlay: function(){
		if (this.overlayVisible) return;
		this.overlay.setStyle('display', '');
		this.overlayVisible = true;
		this.activate();
		this.fireEvent('openOverlay', this);
		return this;
	},
	
	closeOverlay: function(){
		if (!this.overlayVisible) return;
		this.overlay.setStyle('display', 'none');
		this.overlayVisible = false;
		this.deactivate();
		this.fireEvent('closeOverlay', this);
		return this;
	},
	
	clickOverlay: function(e){
		e.preventDefault();
		this.action(e);
		this.closeOverlay();
	},
	
	click: function(e){
		e.preventDefault();
		if (this.disabled) return;
		if (this.overlayVisible){
			this.closeOverlay();
			return;
		} else {
			var coords = this.el.getCoordinates();
			this.overlay.setStyles({
				top: coords.bottom,
				left: coords.left
			});
			this.openOverlay();
		}
	}
	
});