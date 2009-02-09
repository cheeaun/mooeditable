/*
Script: MooEditable.js
	Class for creating a WYSIWYG editor, for contentEditable-capable browsers.

License:
	MIT-style license.

Copyright:
	Copyright (c) 2007-2009 [Lim Chee Aun](http://cheeaun.com).
	
Build: %build%

Credits:
	- Code inspired by Stefan's work [Safari Supports Content Editing!](http://www.xs4all.nl/~hhijdra/stefan/ContentEditable.html) from [safari gets contentEditable](http://walkah.net/blog/walkah/safari-gets-contenteditable)
	- Main reference from Peter-Paul Koch's [execCommand compatibility](http://www.quirksmode.org/dom/execCommand.html)
	- Some ideas and code inspired by [TinyMCE](http://tinymce.moxiecode.com/)
	- Some functions inspired by Inviz's [Most tiny wysiwyg you ever seen](http://forum.mootools.net/viewtopic.php?id=746), [mooWyg (Most tiny WYSIWYG 2.0)](http://forum.mootools.net/viewtopic.php?id=5740)
	- Some regex from Cameron Adams's [widgEditor](http://widgeditor.googlecode.com/)
	- Some code from Juan M Martinez's [jwysiwyg](http://jwysiwyg.googlecode.com/)
	- Some reference from MoxieForge's [PunyMCE](http://punymce.googlecode.com/)
	- IE support referring Robert Bredlau's [Rich Text Editing](http://www.rbredlau.com/drupal/node/6)
	- Tango icons from the [Tango Desktop Project](http://tango.freedesktop.org/)
	- Additional Tango icons from Jimmacs' [Tango OpenOffice](http://www.gnome-look.org/content/show.php/Tango+OpenOffice?content=54799)
*/

var MooEditable = new Class({

	Implements: [Events, Options],

	options: {
		toolbar: true,
		cleanup: true,
		paragraphise: true,
		xhtml : true,
		semantics : true,
		buttons: 'bold, italic, underline, strikethrough, |, insertunorderedlist, insertorderedlist, indent, outdent, |, undo, redo, |, createlink, unlink, |, urlimage, |, toggleview',
		mode: 'icons',
		handleSubmit: true,
		handleLabel: true,
		baseCSS: 'html{ height: 100%; cursor: text }\
			body{ font-family: sans-serif; border: 0; }',
		extraCSS: '',
		externalCSS: '',
		html: '<html>\
			<head>\
			<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">\
			<style>{BASECSS} {EXTRACSS}</style>\
			{EXTERNALCSS}\
			</head>\
			<body>{CONTENT}</body>\
			</html>'
	},

	initialize: function(el,options){
		this.setOptions(options);
		this.textarea = $(el);
		this.textarea.store('MooEditable', this);
		this.build();
	},
	
	toElement: function(){
		return this.textarea;
	},
	
	build: function(){
		var self = this;
		
		// Build the container
		this.container = new Element('div', {
			id: (this.textarea.id) ? this.textarea.id + '-container' : null,
			'class': 'mooeditable-container',
			styles: {
				width: this.textarea.getSize().x,
				margin: this.textarea.getStyle('margin')
			}
		});

		this.textarea.setStyles({
			margin: 0,
			display: 'none',
			resize: 'none', // disable resizable textareas in Safari
			outline: 'none' // disable focus ring in Safari
		});
		
		// Build the iframe
		var pads = this.textarea.getStyle('padding').split(' ');
		pads = pads.map(function(p){ return (p == 'auto') ? 0 : p.toInt(); });

		this.iframe = new IFrame({
			'class': 'mooeditable-iframe',
			styles: {
				width: this.textarea.getStyle('width').toInt() + pads[1] + pads[3],
				height: this.textarea.getStyle('height').toInt() + pads[0] + pads[2],
				'border-color': this.textarea.getStyle('border-color'),
				'border-width': this.textarea.getStyle('border-width'),
				'border-style': this.textarea.getStyle('border-style')
			}
		});
		
		this.buildToolbar();
		this.attach();
		
		// Update the event for textarea's corresponding labels
		if (this.options.handleLabel && this.textarea.id) $$('label[for="'+this.textarea.id+'"]').addEvent('click', function(e){
			if (self.mode == 'iframe'){
				e.stop();
				self.focus();
			}
		});

		// Update & cleanup content before submit
		if (this.options.handleSubmit){
			this.form = this.textarea.getParent('form');
			if (this.form) this.form.addEvent('submit', function(){
				if (self.mode == 'iframe') self.saveContent();
			});
		}
	},

	buildToolbar: function(){
		var self = this;
		this.toolbar = new Element('div', {'class': 'mooeditable-toolbar'});
		this.keys = [];

		var toolbarButtons = this.options.buttons.split(',');
		var buttons = toolbarButtons.map(function(command, idx){
			command = command.trim();
			if (command == '|') return new Element('span', {'class': 'toolbar-separator'});
			var b = new Element('button', {
				'class': command + '-button toolbar-button',
				title: MooEditable.Actions[command]['title'] + ((MooEditable.Actions[command]['shortcut']) ? ' ( Ctrl+' + MooEditable.Actions[command]['shortcut'].toUpperCase() + ' )' : ''),
				events: {
					click: function(e){
						e.stop();
						if (!this.hasClass('disabled')){
							self.focus();
							self.action(command);
							if (self.mode == 'iframe') self.checkStates();
						}
					},
					mousedown: function(e){ e.stop(); }
				}
			});
			// apply toolbar mode
			b.addClass(MooEditable.Actions[command]['mode'] || self.options.mode);

			// add hover effect for IE
			if (Browser.Engine.trident) b.addEvents({
				mouseenter: function(e){ this.addClass('hover'); },
				mouseleave: function(e){ this.removeClass('hover'); }
			});
			// shortcuts
			var key = MooEditable.Actions[command]['shortcut'];
			if (key) self.keys[key] = b;

			b.set('text', MooEditable.Actions[command]['title']);
			return b;
		});

		this.toolbarButtons = new Elements(buttons);
	},

	attach: function(){
		var self = this;

		// Put textarea inside container
		this.container.wraps(this.textarea);

		// Fix IE bug, refer "IE/Win Inherited Margins on Form Elements" <http://positioniseverything.net/explorer/inherited_margin.html>
		if (Browser.Engine.trident) new Element('span').wraps(this.textarea);

		this.iframe.inject(this.container, 'top');

		// contentWindow and document references
		this.win = this.iframe.contentWindow;
		this.doc = this.win.document;

		// Build the content of iframe
		var docHTML = this.options.html.substitute({
			BASECSS: this.options.baseCSS,
			EXTRACSS: this.options.extraCSS,
			EXTERNALCSS: (this.options.externalCSS) ? '<link rel="stylesheet" href="' + this.options.externalCSS + '">': '',
			CONTENT: this.cleanup(this.textarea.get('value')),
		});
		this.doc.open();
		this.doc.write(docHTML);
		this.doc.close();

		// Turn on Design Mode
		// IE fired load event twice if designMode is set
		(Browser.Engine.trident) ? this.doc.body.contentEditable = true : this.doc.designMode = 'On';

		// Assign view mode
		this.mode = 'iframe';

		// document.window for IE, for new Document code below
		if (Browser.Engine.trident) this.doc.window = this.win;

		// Mootoolize document and body
		if (!this.doc.$family) new Document(this.doc);
		$(this.doc.body);

		this.doc.addEvents({
			keypress: this.keyListener.bind(this),
			keydown: this.enterListener.bind(this)
		});
		this.textarea.addEvent('keypress', this.keyListener.bind(this));

		var styleCSS = function(){
			// styleWithCSS, not supported in IE and Opera
			if (!['trident', 'presto'].contains(Browser.Engine.name)) self.execute('styleWithCSS', false, false);
			self.doc.removeEvent('focus', styleCSS);
		};
		this.doc.addEvent('focus', styleCSS);

		// make images selectable and draggable in Safari
		if (Browser.Engine.webkit) this.doc.addEvent('click', function(e){
			var el = e.target;
			if (el.get('tag') == 'img') self.selectNode(el);
		});

		if (this.options.toolbar){
			this.toolbar.inject(this.iframe, 'before');
			this.toolbarButtons.inject(this.toolbar);
			this.doc.addEvents({
				keyup: this.checkStates.bind(this),
				mouseup: this.checkStates.bind(this)
			});
		}

		this.selection = new MooEditable.Selection(this);
		
		return this;
	},
	
	detach: function(){
		this.saveContent();
		this.mode = 'textarea';
		this.textarea.setStyle('display', '').inject(this.container, 'before');
		this.textarea.removeEvents('keypress');
		this.container.destroy();
		return this;
	},

	keyListener: function(e){
		if (e.control && this.keys[e.key]){
			e.stop();
			this.keys[e.key].fireEvent('click', e);
		}
	},

	enterListener: function(e){
		if (e.key == 'enter'){
			if (this.options.paragraphise && !e.shift){
				if (Browser.Engine.gecko || Browser.Engine.webkit){
					var node = this.selection.getNode();
					var blockEls = /^(H[1-6]|P|DIV|ADDRESS|PRE|FORM|TABLE|LI|OL|UL|TD|CAPTION|BLOCKQUOTE|CENTER|DL|DT|DD)$/;
					var isBlock = node.getParents().include(node).some(function(el){
						return el.nodeName.test(blockEls);
					});
					if (!isBlock) this.execute('insertparagraph');
				}
			}
			else {
				if (Browser.Engine.trident){
					var r = this.selection.getRange();
					var node = this.selection.getNode();
					if (node.get('tag') != 'li'){
						if (r){
							this.selection.insertContent('<br>');
							this.selection.collapse(false);
						}
					}
					e.stop();
				}
			}
		}
	},

	focus: function(){
		(this.mode=='iframe' ? this.win : this.textarea).focus();
		return this;
	},

	action: function(command){
		var action = MooEditable.Actions[command];
		var args = action.arguments || [];
		if (action.command){
			($type(action.command) == 'function') ? action.command.attempt(args, this) : this.execute(action.command, false, args);
		} else {
			this.execute(command, false, args);
		}
	},

	execute: function(command, param1, param2){
		if (!this.busy){
			this.busy = true;
			this.doc.execCommand(command, param1, param2);
			this.saveContent();
			this.busy = false;
		}
		return false;
	},

	toggleView: function(){
		if (this.mode == 'textarea'){
			this.mode = 'iframe';
			this.iframe.setStyle('display', '');
			this.setContent(this.textarea.value);
			this.enableToolbar();
			this.textarea.setStyle('display', 'none');
		} else {
			this.saveContent();
			this.mode = 'textarea';
			this.textarea.setStyle('display', '');
			this.disableToolbar('toggleview');
			this.iframe.setStyle('display', 'none');
		}
		// toggling from textarea to iframe needs the delay to get focus working
		(function(){ this.focus(); }).bind(this).delay(10);

		return this;
	},

	disableToolbar: function(b){
		this.toolbarButtons.each(function(item){
			(!item.hasClass(b+'-button')) ? item.addClass('disabled').set('opacity', 0.4) : item.addClass('onActive');
		});
		return this;
	},

	enableToolbar: function(){
		this.toolbarButtons.removeClass('disabled').removeClass('onActive').set('opacity', 1);
		return this;
	},

	getContent: function(){
		return this.cleanup(this.doc.body.get('html'));
	},

	setContent: function(newContent){
		(function(){
			this.doc.body.set('html', newContent);
		}).bind(this).delay(1); // dealing with Adobe AIR's webkit bug
		return this;
	},

	saveContent: function(){
		if (this.mode == 'iframe') this.textarea.set('value', this.getContent());
		return this;
	},

	checkStates: function(){
		MooEditable.Actions.each(function(action, command){
			var button = this.toolbarButtons.filter('.' + command + '-button');
			if (!button) return;
			button.removeClass('active');

			if (action.tags){
				var el = this.selection.getNode();

				if (el) do {
					if ($type(el) != 'element') break;
					if (action.tags.contains(el.tagName.toLowerCase())) button.addClass('active');
				}
				while (el = el.parentNode);
			}

			if (action.css){
				var el = this.selection.getNode();

				if (el) do {
					if ($type(el) != 'element') break;
					for (var prop in action.css)
						if ($(el).getStyle(prop).contains(action.css[prop]))
							button.addClass('active');
				}
				while (el = el.parentNode);
			}
		}.bind(this));
	},

	cleanup: function(source){
		if (!this.options.cleanup) return source.trim();
		
		do {
			var oSource = source;

			// Webkit cleanup
			source = source.replace(/<br class\="webkit-block-placeholder">/gi, "<br />");
			source = source.replace(/<span class="Apple-style-span">(.*)<\/span>/gi, '$1');
			source = source.replace(/ class="Apple-style-span"/gi, '');
			source = source.replace(/<span style="">/gi, '');

			// Remove padded paragraphs
			source = source.replace(/<p>\s*<br ?\/?>\s*<\/p>/gi, '<p>\u00a0</p>');
			source = source.replace(/<p>(&nbsp;|\s)*<\/p>/gi, '<p>\u00a0</p>');
			if (!this.options.semantics){
				source = source.replace(/\s*<br ?\/?>\s*<\/p>/gi, '</p>');
			}


			// Replace improper BRs (only if XHTML : true)
			if (this.options.xhtml){
				source = source.replace(/<br>/gi, "<br />");
			}

			if (this.options.semantics){
				//remove divs from <li>
				if (Browser.Engine.trident){
					source = source.replace(/<li>\s*<div>(.+?)<\/div><\/li>/g, '<li>$1</li>');
				}
				//remove stupid apple divs
				if (Browser.Engine.webkit){
					source = source.replace(/^([\w\s]+.*?)<div>/i, '<p>$1</p><div>');
					source = source.replace(/<div>(.+?)<\/div>/ig, '<p>$1</p>');
				}

				//<p> tags around a list will get moved to after the list
				if (['gecko', 'presto', 'webkit'].contains(Browser.Engine.name)){
					//not working properly in safari?
					source = source.replace(/<p>[\s\n]*(<(?:ul|ol)>.*?<\/(?:ul|ol)>)(.*?)<\/p>/ig, '$1<p>$2</p>');
					source = source.replace(/<\/(ol|ul)>\s*(?!<(?:p|ol|ul|img).*?>)((?:<[^>]*>)?\w.*)$/g, '</$1><p>$2</p>');
				}

				source = source.replace(/<br[^>]*><\/p>/g, '</p>');			//remove <br>'s that end a paragraph here.
				source = source.replace(/<p>\s*(<img[^>]+>)\s*<\/p>/ig, '$1\n'); 	//if a <p> only contains <img>, remove the <p> tags

				//format the source
				source = source.replace(/<p([^>]*)>(.*?)<\/p>(?!\n)/g, '<p$1>$2</p>\n');  	//break after paragraphs
				source = source.replace(/<\/(ul|ol|p)>(?!\n)/g, '</$1>\n'); 			//break after </p></ol></ul> tags
				source = source.replace(/><li>/g, '>\n\t<li>'); 				//break and indent <li>
				source = source.replace(/([^\n])<\/(ol|ul)>/g, '$1\n</$2>');  			//break before </ol></ul> tags
				source = source.replace(/([^\n])<img/ig, '$1\n<img'); 				//move images to their own line
				source = source.replace(/^\s*$/g, '');						//delete empty lines in the source code (not working in opera)
			}

			// Remove leading and trailing BRs
			source = source.replace(/<br ?\/?>$/gi, '');
			source = source.replace(/^<br ?\/?>/gi, '');

			// Remove useless BRs
			source = source.replace(/><br ?\/?>/gi, '>');

			// Remove BRs right before the end of blocks
			source = source.replace(/<br ?\/?>\s*<\/(h1|h2|h3|h4|h5|h6|li|p)/gi, '</$1');

			// Semantic conversion
			source = source.replace(/<span style="font-weight: bold;">(.*)<\/span>/gi, '<strong>$1</strong>');
			source = source.replace(/<span style="font-style: italic;">(.*)<\/span>/gi, '<em>$1</em>');
			source = source.replace(/<b\b[^>]*>(.*?)<\/b[^>]*>/gi, '<strong>$1</strong>');
			source = source.replace(/<i\b[^>]*>(.*?)<\/i[^>]*>/gi, '<em>$1</em>');
			source = source.replace(/<u\b[^>]*>(.*?)<\/u[^>]*>/gi, '<span style="text-decoration: underline;">$1</span>');

			// Replace uppercase element names with lowercase
			source = source.replace(/<[^> ]*/g, function(match){return match.toLowerCase();});

			// Replace uppercase attribute names with lowercase
			source = source.replace(/<[^>]*>/g, function(match){
				   match = match.replace(/ [^=]+=/g, function(match2){return match2.toLowerCase();});
				   return match;
			});

			// Put quotes around unquoted attributes
			source = source.replace(/<[^>]*>/g, function(match){
				   match = match.replace(/( [^=]+=)([^"][^ >]*)/g, "$1\"$2\"");
				   return match;
			});

			//make img tags xhtml compatable
			//           if (this.options.xhtml){
			//                source = source.replace(/(<(?:img|input)[^/>]*)>/g, '$1 />');
			//           }

			//remove double <p> tags and empty <p> tags
			source = source.replace(/<p>(?:\s*)<p>/g, '<p>');
			source = source.replace(/<\/p>\s*<\/p>/g, '</p>');
			source = source.replace(/<p>\W*<\/p>/g, '');

			// Final trim
			source = source.trim();
		}
		while (source != oSource);

		return source;
	}

});

MooEditable.Selection = new Class({

	initialize: function(editor){
		this.win = editor.win;
		this.doc = editor.doc;
	},

	getSelection: function(){
		return (this.win.getSelection) ? this.win.getSelection() : this.doc.selection;
	},

	getRange: function(){
		var s = this.getSelection();

		if (!s) return null;

		try {
			return s.rangeCount > 0 ? s.getRangeAt(0) : (s.createRange ? s.createRange() : null);
		} catch (e){
			// IE bug when used in frameset
			return this.doc.body.createTextRange();
		}
	},

	setRange: function(range){
		if (range.select){
			$try(function(){
				range.select();
			});
		} else {
			var s = this.getSelection();
			if (s.addRange){
				s.removeAllRanges();
				s.addRange(range);
			}
		}
	},

	selectNode: function(node, collapse){
		var r = this.getRange();
		var s = this.getSelection();

		if (r.moveToElementText){
			$try(function(){
				r.moveToElementText(node);
				r.select();
			});
		} else if (s.addRange){
			collapse ? r.selectNodeContents(node) : r.selectNode(node);
			s.removeAllRanges();
			s.addRange(r);
		} else {
			s.setBaseAndExtent(node, 0, node, 1);
		}

		return node;
	},

	isCollapsed: function(){
		var r = this.getRange();
		if (r.item) return false;
		return r.boundingWidth == 0 || this.getSelection().isCollapsed;
	},

	collapse: function(toStart){
		var r = this.getRange();
		var s = this.getSelection();

		if (r.select){
			r.collapse(toStart);
			r.select();
		} else {
			toStart ? s.collapseToStart() : s.collapseToEnd();
		}
	},

	getContent: function(){
		var r = this.getRange();
		var body = new Element('body');

		if (this.isCollapsed()) return '';

		if (r.cloneContents){
			body.appendChild(r.cloneContents());
		} else if ($defined(r.item) || $defined(r.htmlText)){
			body.set('html', r.item ? r.item(0).outerHTML : r.htmlText);
		} else {
			body.set('html', r.toString());
		}

		var content = body.get('html');
		return content;
	},

	getText : function(){
		var r = this.getRange();
		var s = this.getSelection();

		return this.isCollapsed() ? '' : r.text || s.toString();
	},

	getNode: function(){
		var r = this.getRange();

		if (!Browser.Engine.trident){
			var el = null;

			if (r){
				el = r.commonAncestorContainer;

				// Handle selection a image or other control like element such as anchors
				if (!r.collapsed)
					if (r.startContainer == r.endContainer)
						if (r.startOffset - r.endOffset < 2)
							if (r.startContainer.hasChildNodes())
								el = r.startContainer.childNodes[r.startOffset];

				while ($type(el) != 'element') el = el.parentNode;
			}

			return $(el);
		}

		return $(r.item ? r.item(0) : r.parentElement());
	},

	insertContent: function(content){
		var r = this.getRange();

		if (r.insertNode){
			r.deleteContents();
			r.insertNode(r.createContextualFragment(content));
		} else {
			// Handle text and control range
			(r.pasteHTML) ? r.pasteHTML(content) : r.item(0).outerHTML = content;
		}
	}

});

MooEditable.Actions = new Hash({

	bold: {
		title: 'Bold',
		shortcut: 'b',
		tags: ['b', 'strong'],
		css: {'font-weight': 'bold'}
	},
	
	italic: {
		title: 'Italic',
		shortcut: 'i',
		tags: ['i', 'em'],
		css: {'font-style': 'italic'}
	},
	
	underline: {
		title: 'Underline',
		shortcut: 'u',
		tags: ['u'],
		css: {'text-decoration': 'underline'}
	},
	
	strikethrough: {
		title: 'Strikethrough',
		shortcut: 's',
		tags: ['s', 'strike'],
		css: {'text-decoration': 'line-through'}
	},
	
	insertunorderedlist: {
		title: 'Unordered List',
		tags: ['ul']
	},
	
	insertorderedlist: {
		title: 'Ordered List',
		tags: ['ol']
	},
	
	indent: {
		title: 'Indent',
		tags: ['blockquote']
	},
	
	outdent: {title: 'Outdent'},
	
	undo: {
		title: 'Undo',
		shortcut: 'z'
	},
	
	redo: {
		title: 'Redo',
		shortcut: 'y'
	},
	
	unlink: {title: 'Remove Hyperlink'},

	createlink: {
		title: 'Add Hyperlink',
		shortcut: 'l',
		tags: ['a'],
		command: function(){
			if (this.selection.getSelection() == ''){
				MooEditable.Dialogs.alert(this, 'createlink', 'Please select the text you wish to hyperlink.');
			} else {
				MooEditable.Dialogs.prompt(this, 'createlink', 'Enter url', 'http://', function(url){
					this.execute('createlink', false, url.trim());
				}.bind(this));
			}
		}
	},

	urlimage: {
		title: 'Add Image',
		shortcut: 'm',
		command: function(){
			MooEditable.Dialogs.prompt(this, 'urlimage', 'Enter image url', 'http://', function(url){
				this.execute("insertimage", false, url.trim());
			}.bind(this));
		}
	},

	toggleview: {
		title: 'Toggle View',
		shortcut: 't',
		command: function(){ this.toggleView(); }
	}

});

MooEditable.Dialogs = new Hash({

	alert: function(me, el, str){
		// Adds the alert bar
		if (!me.alertbar){
			me.alertbar = new Element('div', {'class': 'alertbar dialog-toolbar'});
			me.alertbar.inject(me.toolbar, 'after');

			me.alertbar.strLabel = new Element('span', {'class': 'alertbar-label'});

			me.alertbar.okButton = new Element('button', {
				'class': 'alertbar-ok input-button',
				text: 'OK',
				events: {
					click: function(e){
						e.stop();
						me.alertbar.setStyle('display','none');
						me.enableToolbar();
						me.doc.removeEvents('mousedown');
					}
				}
			});

			new Element('div').adopt(me.alertbar.strLabel, me.alertbar.okButton).inject(me.alertbar);
		} else if (me.alertbar.getStyle('display') == 'none'){
			me.alertbar.setStyle('display', '');
		}

		me.alertbar.strLabel.set('text', str);
		me.alertbar.okButton.focus();

		me.doc.addEvent('mousedown', function(e){ e.stop(); });
		me.disableToolbar(el);
	},

	prompt: function(me, el, q, a, fn){
		me.range = me.selection.getRange(); // store the range

		// Adds the prompt bar
		if (!me.promptbar){
			me.promptbar = new Element('div', {'class': 'promptbar dialog-toolbar'});
			me.promptbar.inject(me.toolbar, 'after');

			me.promptbar.qLabel = new Element('label', {
				'class': 'promptbar-label',
				'for': 'promptbar-' + me.container.uid
			});

			me.promptbar.aInput = new Element('input', {
				'class': 'promptbar-input input-text',
				id: 'promptbar-' + me.container.uid,
				type: 'text'
			});

			me.promptbar.okButton = new Element('button', {
				'class': 'promptbar-ok input-button',
				text: 'OK'
			});

			me.promptbar.cancelButton = new Element('button', {
				'class': 'promptbar-cancel input-button',
				text: 'Cancel',
				events: {
					click: function(e){
						e.stop();
						me.promptbar.setStyle('display','none');
						me.enableToolbar();
						me.doc.removeEvents('mousedown');
					}
				}
			});

			new Element('div').adopt(me.promptbar.qLabel, me.promptbar.aInput, me.promptbar.okButton, me.promptbar.cancelButton).inject(me.promptbar);
		} else if (me.promptbar.getStyle('display') == 'none'){
			me.promptbar.setStyle('display', '');
		}

		// Update the fn for the OK button event (memory leak?)
		me.promptbar.okButton.addEvent('click', function(e){
			e.stop();
			me.selection.setRange(me.range);
			fn(me.promptbar.aInput.value);
			me.promptbar.setStyle('display','none');
			me.enableToolbar();
			me.doc.removeEvents('mousedown');
			this.removeEvents('click');
		});

		// Set the label and input
		me.promptbar.qLabel.set('text', q);
		me.promptbar.aInput.set('value', a);
		me.promptbar.aInput.focus();

		// Disables iframe and toolbar
		me.doc.addEvent('mousedown', function(e){ e.stop(); });
		me.disableToolbar(el);
	}
});

Element.Properties.mooeditable = {

	set: function(options){
		return this.eliminate('mooeditable').store('mooeditable:options', options);
	},

	get: function(options){
		if (options || !this.retrieve('mooeditable')){
			if (options || !this.retrieve('mooeditable:options')) this.set('mooeditable', options);
			this.store('mooeditable', new MooEditable(this, this.retrieve('mooeditable:options')));
		}
		return this.retrieve('mooeditable');
	}

};

Element.implement({

	mooEditable: function(options){
		return this.get('mooeditable', options);
	}

});
