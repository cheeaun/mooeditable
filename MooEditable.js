/*
 *  $Id$
 *
 * The MIT License
 *
 * Copyright (c) 2007, 2008 Lim Chee Aun <cheeaun@gmail.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

/**
 * MooEditable.js
 * MooEditable class for contentEditable-capable browsers
 *
 * @package     MooEditable
 * @subpackage  Core
 * @author      Lim Chee Aun <cheeaun@gmail.com>
 * @author      Marc Fowler <marc.fowler@defraction.net>
 * @author      Radovan Lozej <http://xrado.hopto.org/>
 * @author      mindplay.dk <http://www.mindplay.dk/>
 * @license     http://www.opensource.org/licenses/mit-license.php MIT License
 * @link        http://code.google.com/p/mooeditable/
 * @since       1.0
 * @version     $Revision: 8 $
 * @credits     Most code is based on Stefan's work "Safari Supports Content Editing!"
 *                  <http://www.xs4all.nl/~hhijdra/stefan/ContentEditable.html>
 *              Main reference from Peter-Paul Koch's "execCommand compatibility" research
 *                  <http://www.quirksmode.org/dom/execCommand.html>
 *              Some ideas inspired by TinyMCE <http://tinymce.moxiecode.com/>
 *              Some functions inspired by Inviz's "Most tiny wysiwyg you ever seen"
 *                  <http://forum.mootools.net/viewtopic.php?id=746>,
 *                  <http://forum.mootools.net/viewtopic.php?id=5740>
 *              Some regex from Cameron Adams's widgEditor
 *                  <http://themaninblue.com/experiment/widgEditor/>
 *              Some code from Juan M Martinez's jwysiwyg, the WYSIWYG jQuery Plugin
 *                  <http://private.tietokone.com.ar/jquery.wysiwyg/>,
 *                  <http://code.google.com/p/jwysiwyg/>
 *              IE support referring Robert Bredlau's "Rich Text Editing" part 1 and 2 articles
 *                  <http://www.rbredlau.com/drupal/node/6>
 *              Tango icons from the Tango Desktop Project
 *                  <http://tango.freedesktop.org/>
 *              Additional tango icons from Tango OpenOffice set by Jimmacs
 *                  <http://www.gnome-look.org/content/show.php/Tango+OpenOffice?content=54799>
 */

var MooEditable = new Class({

	Implements: [Events, Options],

	options:{
		toolbar: true,
		cleanup: false,
		buttons: 'bold,italic,underline,strikethrough,|,insertunorderedlist,insertorderedlist,indent,outdent,|,undo,redo,|,createlink,unlink,|,urlimage,|,toggleview'
	},

	initialize: function(el,options) {
		this.setOptions(options);
		this.textarea = el;
		this.build();
	},

	build: function() {
		// Build the container
		this.container = new Element('div',{
			'id': (this.textarea.id) ? this.textarea.id+'-container' : null,
			'class': 'mooeditable-container',
			'styles': {
				'width': this.textarea.getSize().x,
				'margin': this.textarea.getStyle('margin')
			}
		});

		// Put textarea inside container
		this.container.wraps(this.textarea);

		// Fix IE bug, refer "IE/Win Inherited Margins on Form Elements" <http://positioniseverything.net/explorer/inherited_margin.html>
		if(Browser.Engine.trident) new Element('span').wraps(this.textarea);

		// Build the iframe
		var pads = this.textarea.getStyle('padding').split(' ');
		pads = pads.map(function(p) { return (p == 'auto') ? 0 : p.toInt(); });

		this.iframe = new IFrame({
			'class': 'mooeditable-iframe',
			'styles': {
				'width': this.textarea.getStyle('width').toInt() + pads[1] + pads[3],
				'height': this.textarea.getStyle('height').toInt() + pads[0] + pads[2],
				'border-color': this.textarea.getStyle('border-color'),
				'border-width': this.textarea.getStyle('border-width'),
				'border-style': this.textarea.getStyle('border-style')
			}
		});

		this.textarea.setStyles({
			'margin': 0,
			'display': 'none',
			'resize': 'none', // disable resizable textareas in Safari
			'outline': 'none' // disable focus ring in Safari
		});

		this.iframe.inject(this.container, 'top');

		// contentWindow and document references
		this.win = this.iframe.contentWindow;
		this.doc = this.win.document;

		// Build the content of iframe
		var documentTemplate = '\
			<html style="cursor: text; height: 100%">\
				<body id=\"editable\" style="font-family: sans-serif; border: 0">'+
				this.cleanup(this.textarea.get('value')) +
				'</body>\
			</html>\
		';
		this.doc.open();
		this.doc.write(documentTemplate);
		this.doc.close();

		// Turn on Design Mode
		this.doc_designMode = false;
		try {
			this.doc.designMode = 'on';
			this.doc_designMode = true;
		} catch(e) {
			// Will fail on Gecko if the editor is placed in an hidden container element
			// The design mode will be set ones the editor is focused
			$(this.doc).addEvent('focus', function() {
				if (!this.doc_designMode) {
					try {
						this.doc.designMode = 'on';
						this.doc_designMode = true;
					} catch(e) {}
				}
			}.bind(this));
		}

		// In IE6, after designMode is on, it forgots what is this.doc. Weird.
		if(Browser.Engine.trident4) this.doc = this.win.document;

		// Assign view mode
		this.mode = 'iframe';

		// Update the event for textarea's corresponding labels
		if(this.textarea.id && $$('label[for="'+this.textarea.id+'"]')) {
			$$('label[for="'+this.textarea.id+'"]').addEvent('click', function(e) {
				if(this.mode == 'iframe') {
					e = new Event(e).stop();
					this.win.focus();
				}
			}.bind(this));
		}

		// Update & cleanup content before submit
		this.form = this.textarea.getParent('form');
		if(this.form) this.form.addEvent('submit',function() {
			if(this.mode=='iframe') this.saveContent();
		}.bind(this));
		
		// Mootoolize document and body
		if (!this.doc.$family) this.doc = new Document(this.doc);
		$(this.doc.body);

		this.doc.addEvents({
			'keypress': this.keyListener.bind(this),
			'focus': this.checkStates.bind(this),
			'click': this.checkStates.bind(this),
			'keyup': this.checkStates.bind(this)
		});

		this.textarea.addEvent('keypress', this.keyListener.bind(this));

		this.iframe.addEvent('load', function() {
			// styleWithCSS, not supported in IE and Opera
			if (!Browser.Engine.trident && !Browser.Engine.presto) this.execute('styleWithCSS', false, false);
		}.bind(this));

		this.buildToolbar();
	},

	buildToolbar: function() {
		this.toolbar = new Element('div',{ 'class': 'mooeditable-toolbar' });
		if(this.options.toolbar) this.toolbar.inject(this.iframe, 'before');
		this.keys = [];
		var toolbarButtons = this.options.buttons.split(',');
		toolbarButtons.each(function(command, idx) {
			var b;
			var klass = this;
			if (command == '|') b = new Element('span',{ 'class': 'toolbar-separator' });
			else{
				b = new Element('button',{
					'class': command+'-button toolbar-button',
					'title': MooEditable.Actions[command]['title'] + ((MooEditable.Actions[command]['shortcut']) ? ' ( Ctrl+' + MooEditable.Actions[command]['shortcut'].toUpperCase() + ' )' : ''),
					'events': {
						'click': function(e) {
							e.stop();
							if (!this.hasClass('disabled')) {
								klass.win.focus();
								klass.action(command);
								if (this.mode == 'iframe') klass.checkStates();
							}
						},
						'mousedown': function(e) { e.stop(); }
					}
				});

				// add hover effect for IE6
				if(Browser.Engine.trident4) b.addEvents({
					'mouseenter': function(e) { this.addClass('hover'); },
					'mouseleave': function(e) { this.removeClass('hover'); }
				});
				// shortcuts
				var key = MooEditable.Actions[command]['shortcut'];
				if (key) this.keys[key] = b;

				b.set('text', MooEditable.Actions[command]['title']);
			}
			b.inject(this.toolbar);
		}.bind(this));
	},

	keyListener: function(event) {
		var event = new Event(event);
		if (!event.control) return;
		event.stop();
		if (this.keys[event.key]) this.keys[event.key].fireEvent('click',event);
	},

	action: function(command) {
		var action = MooEditable.Actions[command];
		action.command ? action.command(this) : this.execute(command, false, '');
	},

	execute: function(command, param1, param2) {
		if (!this.busy) {
			this.busy = true;
			this.doc.execCommand(command, param1, param2);
			this.saveContent();
			this.busy = false;
		}
		return false;
	},

	toggleView: function() {
		if (this.mode == 'textarea') {
			this.mode = 'iframe';
			this.iframe.setStyle('display', '');
			this.setContent(this.textarea.value);
			this.enableToolbar();
			this.textarea.setStyle('display', 'none');
		} else {
			this.mode = 'textarea';
			this.textarea.setStyle('display', '');
			this.saveContent();
			this.disableToolbar('toggleview');
			this.iframe.setStyle('display', 'none');
		}
		// toggling from textarea to iframe needs the delay to get focus working
		(function() {
			(this.mode=='iframe' ? this.win : this.textarea).focus();
		}).bind(this).delay(10);
	},
	
	disableToolbar: function(b) {
		this.toolbar.getElements('.toolbar-button').each(function(item) {
			if (!item.hasClass(b+'-button')) {
				item.addClass('disabled');
				item.removeClass('active');
				item.set('opacity', 0.4);
			}
		});

		this.toolbar.getElement('.'+b+'-button').addClass('onActive');
	},
	
	enableToolbar: function() {
		this.toolbar.getElements('.toolbar-button').each(function(item) {
			item.removeClass('disabled');
			item.removeClass('onActive');
			item.set('opacity', 1);
		});
	},
	
	getContent: function() {
		return this.cleanup(this.doc.getElementById('editable').innerHTML);
	},
	
	setContent: function(newContent) {
		(function() {
			this.doc.getElementById('editable').set('html', newContent);
		}).bind(this).delay(1); // dealing with Adobe AIR's webkit bug
	},

	saveContent: function() {
		this.textarea.set('value', this.getContent());
	},

	getSelection: function() {
		if (Browser.Engine.trident) return this.doc.selection.createRange().text;
		return this.win.getSelection();
	},

	getSelectedNode: function() {
		var parentNode = null;

		if (Browser.Engine.trident) parentNode = this.doc.selection.createRange().parentElement();
		else parentNode = this.win.getSelection().anchorNode.parentNode;
		
		while (parentNode.nodeType == 3) parentNode = parentNode.parentNode; // 3 = textNode

		return parentNode;
	},
	
	createRange: function() {
		if (Browser.Engine.trident) return this.doc.selection.createRange();
		else {
			var sel = this.win.getSelection();
			if ($type(sel)) {
				try {
					return sel.getRangeAt(0);
				} catch(e) {
					return this.doc.createRange();
				}
			}
			else return this.doc.createRange();
		}
	},
	
	addRange: function(range) {
		if(range.select) range.select();
		else {
			var s = this.getSelection();
			if (s.removeAllRanges && s.addRange) {
				s.removeAllRanges();
				s.addRange(range);
			}
		}
	},
	
	checkStates: function() {
		MooEditable.Actions.each(function(action, command) {
			var button = this.toolbar.getElement('.' + command + '-button');
			if (!button) return;
			button.removeClass('active');
			
			if (action.tags) {
				var el = this.getSelectedNode();

				do {
					if (el.nodeType != 1) break;
					if (action.tags.contains(el.tagName.toLowerCase()))
						button.addClass('active');
				}
				while (el = el.parentNode);
			}
			
			if(action.css) {
				var el = this.getSelectedNode();

				do {
					if (el.nodeType != 1) break;
					for (var prop in action.css)
						if ($(el).getStyle(prop) == action.css[prop])
							button.addClass('active');
				}
				while (el = el.parentNode);
			}
		}.bind(this));
	},

	cleanup: function(source) {
		if(!this.options.cleanup) return source.trim();
		
		// Webkit cleanup
		source = source.replace(/<br class\="webkit-block-placeholder">/gi, "<br />");
		source = source.replace(/<span class="Apple-style-span">(.*)<\/span>/gi, '$1');
		source = source.replace(/ class="Apple-style-span"/gi, '');
		source = source.replace(/<span style="">/gi, '');

		// Remove padded paragraphs
		source = source.replace(/<p>\s*<br \/>\s*<\/p>/gi, '<p>\u00a0</p>');
		source = source.replace(/<p>(&nbsp;|\s)*<\/p>/gi, '<p>\u00a0</p>');
		source = source.replace(/\s*<br \/>\s*<\/p>/gi, '</p>');

		// Replace improper BRs
		source = source.replace(/<br>/gi, "<br />");

		// Remove leading and trailing BRs
		source = source.replace(/<br \/>$/gi, '');
		source = source.replace(/^<br \/>/gi, '');

		// Remove useless BRs
		source = source.replace(/><br \/>/gi, '>');

		// Remove BRs right before the end of blocks
		source = source.replace(/<br \/>\s*<\/(h1|h2|h3|h4|h5|h6|li|p)/gi, '</$1');

		// Remove empty tags
		source = source.replace(/(<[^\/]>|<[^\/][^>]*[^\/]>)\s*<\/[^>]*>/gi, '');

		// Semantic conversion
		source = source.replace(/<span style="font-weight: bold;">(.*)<\/span>/gi, '<strong>$1</strong>');
		source = source.replace(/<span style="font-style: italic;">(.*)<\/span>/gi, '<em>$1</em>');
		source = source.replace(/<b(\s+|>)/g, '<strong$1');
		source = source.replace(/<\/b(\s+|>)/g, '</strong$1');
		source = source.replace(/<i(\s+|>)/g, '<em$1');
		source = source.replace(/<\/i(\s+|>)/g, '</em$1');
		source = source.replace(/<u(\s+|>)/g, '<span style="text-decoration: underline;"$1');
		source = source.replace(/<\/u(\s+|>)/g, "</span$1");

		// Replace uppercase element names with lowercase
		source = source.replace(/<[^> ]*/g, function(match) { return match.toLowerCase(); });

		// Replace uppercase attribute names with lowercase
		source = source.replace(/<[^>]*>/g, function(match) {
			match = match.replace(/ [^=]+=/g, function(match2) { return match2.toLowerCase(); });
			return match;
		});

		// Put quotes around unquoted attributes
		source = source.replace(/<[^>]*>/g, function(match) {
			match = match.replace(/( [^=]+=)([^"][^ >]*)/g, "$1\"$2\"");
			return match;
		});

		// Final trim
		source = source.trim();

		return source;
	}
});

MooEditable.Actions = new Hash({

	bold: { title: 'Bold', shortcut: 'b', tags: ['b','strong'], css: {'font-weight':'bold'} },
	italic: { title: 'Italic', shortcut: 'i', tags: ['i','em'], css: {'font-style':'italic'} },
	underline: { title: 'Underline', shortcut: 'u', tags: ['u'], css: {'text-decoration':'underline'} },
	strikethrough: { title: 'Strikethrough', shortcut: 's', tags: ['s','strike'], css: {'font-style':'line-through'} },
	insertunorderedlist: { title: 'Unordered List', tags: ['ul'] },
	insertorderedlist: { title: 'Ordered List', tags: ['ol'] },
	indent: { title: 'Indent', tags: ['blockquote'] },
	outdent: { title: 'Outdent' },
	undo: { title: 'Undo', shortcut: 'z' },
	redo: { title: 'Redo', shortcut: 'y' },
	unlink: { title: 'Remove Hyperlink' },

	createlink: {
		title: 'Add Hyperlink',
		shortcut: 'l',
		tags: ['a'],
		command: function(me) {
			if (me.getSelection() == '')
				MooEditable.Dialogs.alert(me, 'createlink', 'Please select the text you wish to hyperlink.');
			else
				MooEditable.Dialogs.prompt(me, 'createlink', 'Enter url','http://', function(url) {
					me.execute('createlink', false, url.trim());
				});
		}
	},

	urlimage: {
		title: 'Add Image',
		shortcut: 'm',
		command: function(me) {
			MooEditable.Dialogs.prompt(me, 'urlimage', 'Enter image url','http://', function(url) {
				me.execute("insertimage", false, url.trim());
			});
		}
	},

	toggleview: {
		title: 'Toggle View',
		shortcut: 't',
		command: function(me) { me.toggleView(); }
	}

});

MooEditable.Dialogs = new Hash({

	alert: function(me, el, str) {
		// Adds the alert bar
		if (!me.alertbar) {
			me.alertbar = new Element('div', { 'class': 'alertbar dialog-toolbar' });
			me.alertbar.inject(me.toolbar, 'after');
			
			me.alertbar.strLabel = new Element('span', { 'class': 'alertbar-label' });

			me.alertbar.okButton = new Element('button', {
				'class': 'alertbar-ok input-button',
				'text': 'OK',
				'events': {
					'click': function(e) {
						e.stop();
						me.alertbar.setStyle('display','none');
						me.enableToolbar();
						me.doc.removeEvents('mousedown');
					}
				}
			});
			
			new Element('div').adopt(me.alertbar.strLabel, me.alertbar.okButton).inject(me.alertbar);
		}
		else if (me.alertbar.getStyle('display') == 'none') me.alertbar.setStyle('display', '');
		
		me.alertbar.strLabel.set('text', str);
		me.alertbar.okButton.focus();
		
		me.doc.addEvent('mousedown', function(e) { e.stop(); });
		me.disableToolbar(el);
	},
	
	prompt: function(me, el, q, a, fn) {
		me.range = me.createRange(); // store the range
		
		// Adds the prompt bar
		if (!me.promptbar) {
			me.promptbar = new Element('div', { 'class': 'promptbar dialog-toolbar' });
			me.promptbar.inject(me.toolbar, 'after');
			
			me.promptbar.qLabel = new Element('label', {
				'class': 'promptbar-label',
				'for': 'promptbar-'+me.container.uid
			});
			
			me.promptbar.aInput = new Element('input', {
				'class': 'promptbar-input input-text',
				'id': 'promptbar-'+me.container.uid,
				'type': 'text'
			});
			
			me.promptbar.okButton = new Element('button', {
				'class': 'promptbar-ok input-button',
				'text': 'OK',
				'events': {
					'click': function(e) {
						e.stop();
						me.addRange(me.range);
						fn.run(me.promptbar.aInput.value);
						me.promptbar.setStyle('display','none');
						me.enableToolbar();
						me.doc.removeEvents('mousedown');
					}
				}
			});

			me.promptbar.cancelButton = new Element('button', {
				'class': 'promptbar-cancel input-button',
				'text': 'Cancel',
				'events': {
					'click': function(e) {
						e.stop();
						me.promptbar.setStyle('display','none');
						me.enableToolbar();
						me.doc.removeEvents('mousedown');
					}
				}
			});
			
			new Element('div').adopt(me.promptbar.qLabel, me.promptbar.aInput, me.promptbar.okButton, me.promptbar.cancelButton).inject(me.promptbar);
		}
		else if (me.promptbar.getStyle('display') == 'none') me.promptbar.setStyle('display', '');
		
		// Set the label and input
		me.promptbar.qLabel.set('text', q);
		me.promptbar.aInput.set('value', a);
		me.promptbar.aInput.focus();
		
		// Disables iframe and toolbar
		me.doc.addEvent('mousedown', function(e) { e.stop(); });
		me.disableToolbar(el);
	}
});