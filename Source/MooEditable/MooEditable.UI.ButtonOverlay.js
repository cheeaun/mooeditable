/*
---

script: MooEditable.UI.ButtonOverlay.js

description: UI Class to create a button element with a popup overlay.

license: MIT-style license

authors:
- Lim Chee Aun

requires:
# - MooEditable
# - MooEditable.UI

provides: [MooEditable.UI.ButtonOverlay]

...
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
			tabindex: 0,
			styles: {
				left: '-999em',
				position: 'absolute',
				width: self.options.overlaySize.x,
				height: self.options.overlaySize.y
			},
			events: {
				mousedown: self.clickOverlay.bind(self),
				focus: self.openOverlay.bind(self),
				blur: self.closeOverlay.bind(self)
			}
		}).inject(document.body).store('MooEditable.UI.ButtonOverlay', this);
		this.overlayVisible = false;
		
		window.addEvent('resize', function(){
			if (self.overlayVisible) self.positionOverlay();
		});
	},
	
	openOverlay: function(){
		if (this.overlayVisible) return;
		this.overlayVisible = true;
		this.activate();
		this.fireEvent('openOverlay', this);
		return this;
	},
	
	closeOverlay: function(){
		if (!this.overlayVisible) return;
		this.overlay.setStyle('left', '-999em');
		this.overlayVisible = false;
		this.deactivate();
		this.fireEvent('closeOverlay', this);
		return this;
	},
	
	clickOverlay: function(e){
		if (e.target == this.overlay || e.target.parentNode == this.overlay) return;
		this.overlay.blur();
		e.preventDefault();
		this.action(e);
	},
	
	click: function(e){
		e.preventDefault();
		if (this.disabled) return;
		if (this.overlayVisible){
			this.overlay.blur();
			return;
		} else {
			this.positionOverlay();
			this.overlay.focus();
		}
	},
	
	positionOverlay: function(){
		var coords = this.el.getCoordinates();
		this.overlay.setStyles({
			top: coords.bottom,
			left: coords.left
		});
		return this;
	}
	
});