/*
---

script: MooEditable.js

description: Class for creating a WYSIWYG editor, for contentEditable-capable browsers.

license: MIT-style license

authors:
- Lim Chee Aun
- Radovan Lozej
- Ryan Mitchell
- Olivier Refalo
- T.J. Leahy

requires:
  core/1.2.4:
  - Events
  - Options
  - Element.Event
  - Element.Style
  - Element.Dimensions
  - Selectors

inspiration:
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

provides: [MooEditable, MooEditable.Selection, MooEditable.UI, MooEditable.Actions]

...
*/

(function(){

var blockEls = /^(H[1-6]|HR|P|DIV|ADDRESS|PRE|FORM|TABLE|LI|OL|UL|TD|CAPTION|BLOCKQUOTE|CENTER|DL|DT|DD|SCRIPT|NOSCRIPT|STYLE)$/i;
var urlRegex = /^(https?|ftp|rmtp|mms):\/\/(([A-Z0-9][A-Z0-9_-]*)(\.[A-Z0-9][A-Z0-9_-]*)+)(:(\d+))?\/?/i;
var protectRegex = /<(script|noscript|style)[\u0000-\uFFFF]*?<\/(script|noscript|style)>/g;

this.MooEditable = new Class({

	Implements: [Events, Options],

	options: {
		toolbar: true,
		cleanup: true,
		paragraphise: true,
		xhtml : true,
		semantics : true,
		actions: 'bold italic underline strikethrough | insertunorderedlist insertorderedlist indent outdent | undo redo | createlink unlink | urlimage | toggleview',
		handleSubmit: true,
		handleLabel: true,
		disabled: false,
		baseCSS: 'html{ height: 100%; cursor: text; } body{ font-family: sans-serif; }',
		extraCSS: '',
		externalCSS: '',
		html: '<!DOCTYPE html><html><head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"><style>{BASECSS} {EXTRACSS}</style>{EXTERNALCSS}</head><body></body></html>',
		rootElement: 'p'
	},

	initialize: function(el, options){
		this.setOptions(options);
		this.textarea = document.id(el);
		this.textarea.store('MooEditable', this);
		this.actions = this.options.actions.clean().split(' ');
		this.keys = {};
		this.dialogs = {};
		this.protectedElements = [];
		this.actions.each(function(action){
			var act = MooEditable.Actions[action];
			if (!act) return;
			if (act.options){
				var key = act.options.shortcut;
				if (key) this.keys[key] = action;
			}
			if (act.dialogs){
				$each(act.dialogs, function(dialog, name){
					dialog = dialog.attempt(this);
					dialog.name = action + ':' + name;
					if ($type(this.dialogs[action]) != 'object') this.dialogs[action] = {};
					this.dialogs[action][name] = dialog;
				}, this);
			}
			if (act.events){
				$each(act.events, function(fn, event){
					this.addEvent(event, fn);
				}, this);
			}
		}.bind(this));
		this.render();
	},
	
	toElement: function(){
		return this.textarea;
	},
	
	render: function(){
		var self = this;
		
		// Dimensions
		var dimensions = this.textarea.getSize();
		
		// Build the container
		this.container = new Element('div', {
			id: (this.textarea.id) ? this.textarea.id + '-mooeditable-container' : null,
			'class': 'mooeditable-container',
			styles: {
				width: dimensions.x
			}
		});

		// Override all textarea styles
		this.textarea.addClass('mooeditable-textarea').setStyle('height', dimensions.y);
		
		// Build the iframe
		this.iframe = new IFrame({
			'class': 'mooeditable-iframe',
			frameBorder: 0,
			src: 'javascript:""', // Workaround for HTTPs warning in IE6/7
			styles: {
				height: dimensions.y
			}
		});
		
		this.toolbar = new MooEditable.UI.Toolbar({
			onItemAction: function(){
				var args = $splat(arguments);
				var item = args[0];
				self.action(item.name, args);
			}
		});
		this.attach.delay(1, this);
		
		// Update the event for textarea's corresponding labels
		if (this.options.handleLabel && this.textarea.id) $$('label[for="'+this.textarea.id+'"]').addEvent('click', function(e){
			if (self.mode != 'iframe') return;
			e.preventDefault();
			self.focus();
		});

		// Update & cleanup content before submit
		if (this.options.handleSubmit){
			this.form = this.textarea.getParent('form');
			if (!this.form) return;
			this.form.addEvent('submit', function(){
				if (self.mode == 'iframe') self.saveContent();
			});
		}
		
		this.fireEvent('render', this);
	},

	attach: function(){
		var self = this;

		// Assign view mode
		this.mode = 'iframe';
		
		// Editor iframe state
		this.editorDisabled = false;

		// Put textarea inside container
		this.container.wraps(this.textarea);

		this.textarea.setStyle('display', 'none');
		
		this.iframe.setStyle('display', '').inject(this.textarea, 'before');
		
		$each(this.dialogs, function(action, name){
			$each(action, function(dialog){
				document.id(dialog).inject(self.iframe, 'before');
				var range;
				dialog.addEvents({
					open: function(){
						range = self.selection.getRange();
						self.editorDisabled = true;
						self.toolbar.disable(name);
						self.fireEvent('dialogOpen', this);
					},
					close: function(){
						self.toolbar.enable();
						self.editorDisabled = false;
						self.focus();
						if (range) self.selection.setRange(range);
						self.fireEvent('dialogClose', this);
					}
				});
			});
		});

		// contentWindow and document references
		this.win = this.iframe.contentWindow;
		this.doc = this.win.document;

		// Build the content of iframe
		var docHTML = this.options.html.substitute({
			BASECSS: this.options.baseCSS,
			EXTRACSS: this.options.extraCSS,
			EXTERNALCSS: (this.options.externalCSS) ? '<link rel="stylesheet" href="' + this.options.externalCSS + '">': ''
		});
		this.doc.open();
		this.doc.write(docHTML);
		this.doc.close();

		// Turn on Design Mode
		// IE fired load event twice if designMode is set
		(Browser.Engine.trident) ? this.doc.body.contentEditable = true : this.doc.designMode = 'On';

		// Mootoolize window, document and body
		if (!this.win.$family) new Window(this.win);
		if (!this.doc.$family) new Document(this.doc);
		document.id(this.doc.body);
		
		this.setContent(this.textarea.get('value'));

		// Bind all events
		this.doc.addEvents({
			mouseup: this.editorMouseUp.bind(this),
			mousedown: this.editorMouseDown.bind(this),
			mouseover: this.editorMouseOver.bind(this),
			mouseout: this.editorMouseOut.bind(this),
			mouseenter: this.editorMouseEnter.bind(this),
			mouseleave: this.editorMouseLeave.bind(this),
			contextmenu: this.editorContextMenu.bind(this),
			click: this.editorClick.bind(this),
			dbllick: this.editorDoubleClick.bind(this),
			keypress: this.editorKeyPress.bind(this),
			keyup: this.editorKeyUp.bind(this),
			keydown: this.editorKeyDown.bind(this),
			focus: this.editorFocus.bind(this),
			blur: this.editorBlur.bind(this)
		});
		this.win.addEvents({
			focus: this.editorFocus.bind(this),
			blur: this.editorBlur.bind(this)
		});
		['cut', 'copy', 'paste'].each(function(event){
			self.doc.body.addListener(event, self['editor' + event.capitalize()].bind(self));
		});
		this.textarea.addEvent('keypress', this.textarea.retrieve('mooeditable:textareaKeyListener', this.keyListener.bind(this)));
		
		// Fix window focus event not firing on Firefox 2
		if (Browser.Engine.gecko && Browser.Engine.version == 18) this.doc.addEvent('focus', function(){
			self.win.fireEvent('focus').focus();
		});

		// styleWithCSS, not supported in IE and Opera
		if (!(/trident|presto/i).test(Browser.Engine.name)){
			var styleCSS = function(){
				self.execute('styleWithCSS', false, false);
				self.doc.removeEvent('focus', styleCSS);
			};
			this.win.addEvent('focus', styleCSS);
		}

		if (this.options.toolbar){
			document.id(this.toolbar).inject(this.container, 'top');
			this.toolbar.render(this.actions);
		}
		
		if (this.options.disabled) this.disable();

		this.selection = new MooEditable.Selection(this.win);
		
		this.oldContent = this.getContent();
		
		this.fireEvent('attach', this);
		
		return this;
	},
	
	detach: function(){
		this.saveContent();
		this.textarea.setStyle('display', '').removeClass('mooeditable-textarea').inject(this.container, 'before');
		this.textarea.removeEvent('keypress', this.textarea.retrieve('mooeditable:textareaKeyListener'));
		this.container.dispose();
		this.fireEvent('detach', this);
		return this;
	},
	
	enable: function(){
		this.editorDisabled = false;
		this.toolbar.enable();
		return this;
	},
	
	disable: function(){
		this.editorDisabled = true;
		this.toolbar.disable();
		return this;
	},
	
	editorFocus: function(e){
		this.oldContent = '';
		this.fireEvent('editorFocus', [e, this]);
	},
	
	editorBlur: function(e){
		this.oldContent = this.saveContent().getContent();
		this.fireEvent('editorBlur', [e, this]);
	},
	
	editorMouseUp: function(e){
		if (this.editorDisabled){
			e.stop();
			return;
		}
		
		if (this.options.toolbar) this.checkStates();
		
		this.fireEvent('editorMouseUp', [e, this]);
	},
	
	editorMouseDown: function(e){
		if (this.editorDisabled){
			e.stop();
			return;
		}
		
		this.fireEvent('editorMouseDown', [e, this]);
	},
	
	editorMouseOver: function(e){
		if (this.editorDisabled){
			e.stop();
			return;
		}
		
		this.fireEvent('editorMouseOver', [e, this]);
	},
	
	editorMouseOut: function(e){
		if (this.editorDisabled){
			e.stop();
			return;
		}
		
		this.fireEvent('editorMouseOut', [e, this]);
	},
	
	editorMouseEnter: function(e){
		if (this.editorDisabled){
			e.stop();
			return;
		}
		
		if (this.oldContent && this.getContent() != this.oldContent){
			this.focus();
			this.fireEvent('editorPaste', [e, this]);
		}
		
		this.fireEvent('editorMouseEnter', [e, this]);
	},
	
	editorMouseLeave: function(e){
		if (this.editorDisabled){
			e.stop();
			return;
		}
		
		this.fireEvent('editorMouseLeave', [e, this]);
	},
	
	editorContextMenu: function(e){
		if (this.editorDisabled){
			e.stop();
			return;
		}
		
		this.fireEvent('editorContextMenu', [e, this]);
	},
	
	editorClick: function(e){
		// make images selectable and draggable in Safari
		if (Browser.Engine.webkit){
			var el = e.target;
			if (el.get('tag') == 'img'){
				this.selection.selectNode(el);
			}
		}
		
		this.fireEvent('editorClick', [e, this]);
	},
	
	editorDoubleClick: function(e){
		this.fireEvent('editorDoubleClick', [e, this]);
	},
	
	editorKeyPress: function(e){
		if (this.editorDisabled){
			e.stop();
			return;
		}
		
		this.keyListener(e);
		
		this.fireEvent('editorKeyPress', [e, this]);
	},
	
	editorKeyUp: function(e){
		if (this.editorDisabled){
			e.stop();
			return;
		}
		
		var c = e.code;
		// 33-36 = pageup, pagedown, end, home; 45 = insert
		if (this.options.toolbar && (/^enter|left|up|right|down|delete|backspace$/i.test(e.key) || (c >= 33 && c <= 36) || c == 45 || e.meta || e.control)){
			if (Browser.Engines.trident4){ // Delay for less cpu usage when you are typing
				$clear(this.checkStatesDelay);
				this.checkStatesDelay = this.checkStates.delay(500, this);
			} else {
				this.checkStates();
			}
		}
		
		this.fireEvent('editorKeyUp', [e, this]);
	},
	
	editorKeyDown: function(e){
		if (this.editorDisabled){
			e.stop();
			return;
		}
		
		if (e.key == 'enter'){
			if (this.options.paragraphise){
				if (e.shift && Browser.Engine.webkit){
					var s = this.selection;
					var r = s.getRange();
					
					// Insert BR element
					var br = this.doc.createElement('br');
					r.insertNode(br);
					
					// Place caret after BR
					r.setStartAfter(br);
					r.setEndAfter(br);
					s.setRange(r);
					
					// Could not place caret after BR then insert an nbsp entity and move the caret
					if (s.getSelection().focusNode == br.previousSibling){
						var nbsp = this.doc.createTextNode('\u00a0');
						var p = br.parentNode;
						var ns = br.nextSibling;
						(ns) ? p.insertBefore(nbsp, ns) : p.appendChild(nbsp);
						s.selectNode(nbsp);
						s.collapse(1);
					}
					
					// Scroll to new position, scrollIntoView can't be used due to bug: http://bugs.webkit.org/show_bug.cgi?id=16117
					this.win.scrollTo(0, Element.getOffsets(s.getRange().startContainer).y);
					
					e.preventDefault();
				} else if (Browser.Engine.gecko || Browser.Engine.webkit){
					var node = this.selection.getNode();
					var isBlock = node.getParents().include(node).some(function(el){
						return el.nodeName.test(blockEls);
					});
					if (!isBlock) this.execute('insertparagraph');
				}
			} else {
				if (Browser.Engine.trident){
					var r = this.selection.getRange();
					var node = this.selection.getNode();
					if (r && node.get('tag') != 'li'){
						this.selection.insertContent('<br>');
						this.selection.collapse(false);
					}
					e.preventDefault();
				}
			}
		}
		
		if (Browser.Engine.presto){
			var ctrlmeta = e.control || e.meta;
			if (ctrlmeta && e.key == 'x'){
				this.fireEvent('editorCut', [e, this]);
			} else if (ctrlmeta && e.key == 'c'){
				this.fireEvent('editorCopy', [e, this]);
			} else if ((ctrlmeta && e.key == 'v') || (e.shift && e.code == 45)){
				this.fireEvent('editorPaste', [e, this]);
			}
		}
		
		this.fireEvent('editorKeyDown', [e, this]);
	},
	
	editorCut: function(e){
		if (this.editorDisabled){
			e.stop();
			return;
		}
		
		this.fireEvent('editorCut', [e, this]);
	},
	
	editorCopy: function(e){
		if (this.editorDisabled){
			e.stop();
			return;
		}
		
		this.fireEvent('editorCopy', [e, this]);
	},
	
	editorPaste: function(e){
		if (this.editorDisabled){
			e.stop();
			return;
		}
		
		this.fireEvent('editorPaste', [e, this]);
	},
	
	keyListener: function(e){
		var key = (Browser.Platform.mac) ? e.meta : e.control;
		if (!key || !this.keys[e.key]) return;
		e.preventDefault();
		var item = this.toolbar.getItem(this.keys[e.key]);
		item.action(e);
	},

	focus: function(){
		(this.mode == 'iframe' ? this.win : this.textarea).focus();
		this.fireEvent('focus', this);
		return this;
	},

	action: function(command, args){
		var action = MooEditable.Actions[command];
		if (action.command && $type(action.command) == 'function'){
			action.command.run(args, this);
		} else {
			this.focus();
			this.execute(command, false, args);
			if (this.mode == 'iframe') this.checkStates();
		}
	},

	execute: function(command, param1, param2){
		if (this.busy) return;
		this.busy = true;
		this.doc.execCommand(command, param1, param2);
		this.saveContent();
		this.busy = false;
		return false;
	},

	toggleView: function(){
		this.fireEvent('beforeToggleView', this);
		if (this.mode == 'textarea'){
			this.mode = 'iframe';
			this.iframe.setStyle('display', '');
			this.setContent(this.textarea.value);
			this.textarea.setStyle('display', 'none');
		} else {
			this.saveContent();
			this.mode = 'textarea';
			this.textarea.setStyle('display', '');
			this.iframe.setStyle('display', 'none');
		}
		this.fireEvent('toggleView', this);
		this.focus.delay(10, this);
		return this;
	},

	getContent: function(){
		var protect = this.protectedElements;
		var html = this.doc.body.get('html').replace(/<!-- mooeditable:protect:([0-9]+) -->/g, function(a, b){
			return protect[parseInt(b)];
		});
		return this.cleanup(this.ensureRootElement(html));
	},

	setContent: function(content){
		var protect = this.protectedElements;
		content = content.replace(protectRegex, function(a){
			protect.push(a);
			return '<!-- mooeditable:protect:' + (protect.length-1) + ' -->';
		});
		this.doc.body.set('html', this.ensureRootElement(content));
		return this;
	},

	saveContent: function(){
		if (this.mode == 'iframe'){
			this.textarea.set('value', this.getContent());
		}
		return this;
	},
	
	ensureRootElement: function(val){
		if (this.options.rootElement){
			var el = new Element('div', {html: val.trim()});
			var start = -1;
			var create = false;
			var html = '';
			var length = el.childNodes.length;
			for (var i=0; i<length; i++){
				var childNode = el.childNodes[i];
				var nodeName = childNode.nodeName;
				if (!nodeName.test(blockEls) && nodeName !== '#comment'){
					if (nodeName === '#text'){
						if (childNode.nodeValue.trim()){
							if (start < 0) start = i;
							html += childNode.nodeValue;
						}
					} else {
						if (start < 0) start = i;
						html += new Element('div').adopt($(childNode).clone()).get('html');
					}
				} else {
					create = true;
				}
				if (i == (length-1)) create = true;
				if (start >= 0 && create){
					var newel = new Element(this.options.rootElement, {html: html});
					el.replaceChild(newel, el.childNodes[start]);
					for (var k=start+1; k<i; k++){ 
						el.removeChild(el.childNodes[k]);
						length--;
						i--;
						k--;
					}
					start = -1;
					create = false;
					html = '';
				}
			}
			val = el.get('html').replace(/\n\n/g, '');
		}
		return val;
	},

	checkStates: function(){
		var element = this.selection.getNode();
		if (!element) return;
		if ($type(element) != 'element') return;
		
		this.actions.each(function(action){
			var item = this.toolbar.getItem(action);
			if (!item) return;
			item.deactivate();

			var states = MooEditable.Actions[action]['states'];
			if (!states) return;
			
			// custom checkState
			if ($type(states) == 'function'){
				states.attempt([document.id(element), item], this);
				return;
			}
			
			try{
				if (this.doc.queryCommandState(action)){
					item.activate();
					return;
				}
			} catch(e){}
			
			if (states.tags){
				var el = element;
				do {
					var tag = el.tagName.toLowerCase();
					if (states.tags.contains(tag)){
						item.activate(tag);
						break;
					}
				}
				while ((el = Element.getParent(el)) != null);
			}

			if (states.css){
				var el = element;
				do {
					var found = false;
					for (var prop in states.css){
						var css = states.css[prop];
						if (Element.getStyle(el, prop).contains(css)){
							item.activate(css);
							found = true;
						}
					}
					if (found || el.tagName.test(blockEls)) break;
				}
				while ((el = Element.getParent(el)) != null);
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

				source = source.replace(/<br[^>]*><\/p>/g, '</p>'); // remove <br>'s that end a paragraph here.
				source = source.replace(/<p>\s*(<img[^>]+>)\s*<\/p>/ig, '$1\n'); // if a <p> only contains <img>, remove the <p> tags

				//format the source
				source = source.replace(/<p([^>]*)>(.*?)<\/p>(?!\n)/g, '<p$1>$2</p>\n'); // break after paragraphs
				source = source.replace(/<\/(ul|ol|p)>(?!\n)/g, '</$1>\n'); // break after </p></ol></ul> tags
				source = source.replace(/><li>/g, '>\n\t<li>'); // break and indent <li>
				source = source.replace(/([^\n])<\/(ol|ul)>/g, '$1\n</$2>'); //break before </ol></ul> tags
				source = source.replace(/([^\n])<img/ig, '$1\n<img'); // move images to their own line
				source = source.replace(/^\s*$/g, ''); // delete empty lines in the source code (not working in opera)
			}

			// Remove leading and trailing BRs
			source = source.replace(/<br ?\/?>$/gi, '');
			source = source.replace(/^<br ?\/?>/gi, '');

			// Remove useless BRs
			if (this.options.paragraphise) source = source.replace(/><br ?\/?>/gi, '>');

			// Remove BRs right before the end of blocks
			source = source.replace(/<br ?\/?>\s*<\/(h1|h2|h3|h4|h5|h6|li|p)/gi, '</$1');

			// Semantic conversion
			source = source.replace(/<span style="font-weight: bold;">(.*)<\/span>/gi, '<strong>$1</strong>');
			source = source.replace(/<span style="font-style: italic;">(.*)<\/span>/gi, '<em>$1</em>');
			source = source.replace(/<b\b[^>]*>(.*?)<\/b[^>]*>/gi, '<strong>$1</strong>');
			source = source.replace(/<i\b[^>]*>(.*?)<\/i[^>]*>/gi, '<em>$1</em>');
			source = source.replace(/<u\b[^>]*>(.*?)<\/u[^>]*>/gi, '<span style="text-decoration: underline;">$1</span>');
			source = source.replace(/<strong><span style="font-weight: normal;">(.*)<\/span><\/strong>/gi, '$1');
			source = source.replace(/<em><span style="font-weight: normal;">(.*)<\/span><\/em>/gi, '$1');
			source = source.replace(/<span style="text-decoration: underline;"><span style="font-weight: normal;">(.*)<\/span><\/span>/gi, '$1');
			source = source.replace(/<strong style="font-weight: normal;">(.*)<\/strong>/gi, '$1');
			source = source.replace(/<em style="font-weight: normal;">(.*)<\/em>/gi, '$1');

			// Replace uppercase element names with lowercase
			source = source.replace(/<[^> ]*/g, function(match){return match.toLowerCase();});

			// Replace uppercase attribute names with lowercase
			source = source.replace(/<[^>]*>/g, function(match){
				   match = match.replace(/ [^=]+=/g, function(match2){return match2.toLowerCase();});
				   return match;
			});

			// Put quotes around unquoted attributes
			source = source.replace(/<[^!][^>]*>/g, function(match){
				   match = match.replace(/( [^=]+=)([^"][^ >]*)/g, "$1\"$2\"");
				   return match;
			});

			//make img tags xhtml compatible <img>,<img></img> -> <img/>
			if (this.options.xhtml){
				source = source.replace(/<img([^>]+)(\s*[^\/])>(<\/img>)*/gi, '<img$1$2 />');
			}
			
			//remove double <p> tags and empty <p> tags
			source = source.replace(/<p>(?:\s*)<p>/g, '<p>');
			source = source.replace(/<\/p>\s*<\/p>/g, '</p>');
			
			// Replace <br>s inside <pre> automatically added by some browsers
			source = source.replace(/<pre[^>]*>.*?<\/pre>/gi, function(match){
				return match.replace(/<br ?\/?>/gi, '\n');
			});

			// Final trim
			source = source.trim();
		}
		while (source != oSource);

		return source;
	}

});

MooEditable.Selection = new Class({

	initialize: function(win){
		this.win = win;
	},

	getSelection: function(){
		this.win.focus();
		return (this.win.getSelection) ? this.win.getSelection() : this.win.document.selection;
	},

	getRange: function(){
		var s = this.getSelection();

		if (!s) return null;

		try {
			return s.rangeCount > 0 ? s.getRangeAt(0) : (s.createRange ? s.createRange() : null);
		} catch(e) {
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
		return this.isCollapsed() ? '' : r.text || (s.toString ? s.toString() : '');
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

			return document.id(el);
		}
		
		return document.id(r.item ? r.item(0) : r.parentElement());
	},

	insertContent: function(content){
		if (Browser.Engine.trident){
			var r = this.getRange();
			r.pasteHTML(content);
			r.collapse(false);
			r.select();
		} else {
			this.win.document.execCommand('insertHTML', false, content);
		}
	}

});

// Avoiding MooTools.lang dependency
// Wrapper functions to be used internally and for plugins, defaults to en-US
var phrases = {};
MooEditable.lang = {
	
	set: function(members){
		if (MooTools.lang) MooTools.lang.set('en-US', 'MooEditable', members);
		$extend(phrases, members);
	},
	
	get: function(key){
		if (MooTools.lang) return MooTools.lang.get('MooEditable', key);
		return key ? phrases[key] : '';
	}
	
};

MooEditable.lang.set({
	ok: 'OK',
	cancel: 'Cancel',
	bold: 'Bold',
	italic: 'Italic',
	underline: 'Underline',
	strikethrough: 'Strikethrough',
	unorderedList: 'Unordered List',
	orderedList: 'Ordered List',
	indent: 'Indent',
	outdent: 'Outdent',
	undo: 'Undo',
	redo: 'Redo',
	removeHyperlink: 'Remove Hyperlink',
	addHyperlink: 'Add Hyperlink',
	selectTextHyperlink: 'Please select the text you wish to hyperlink.',
	enterURL: 'Enter URL',
	enterImageURL: 'Enter image URL',
	addImage: 'Add Image',
	toggleView: 'Toggle View'
});

MooEditable.UI = {};

MooEditable.UI.Toolbar= new Class({

	Implements: [Events, Options],

	options: {
		/*
		onItemAction: $empty,
		*/
		'class': ''
	},
    
	initialize: function(options){
		this.setOptions(options);
		this.el = new Element('div', {'class': 'mooeditable-ui-toolbar ' + this.options['class']});
		this.items = {};
		this.content = null;
	},
	
	toElement: function(){
		return this.el;
	},
	
	render: function(actions){
		if (this.content){
			this.el.adopt(this.content);
		} else {
			this.content = actions.map(function(action){
				return (action == '|') ? this.addSeparator() : this.addItem(action);
			}.bind(this));
		}
		return this;
	},
	
	addItem: function(action){
		var self = this;
		var act = MooEditable.Actions[action];
		if (!act) return;
		var type = act.type || 'button';
		var options = act.options || {};
		var item = new MooEditable.UI[type.camelCase().capitalize()]($extend(options, {
			name: action,
			'class': action + '-item toolbar-item',
			title: act.title,
			onAction: self.itemAction.bind(self)
		}));
		this.items[action] = item;
		document.id(item).inject(this.el);
		return item;
	},
	
	getItem: function(action){
		return this.items[action];
	},
	
	addSeparator: function(){
		return new Element('span', {'class': 'toolbar-separator'}).inject(this.el);
	},
	
	itemAction: function(){
		this.fireEvent('itemAction', arguments);
	},

	disable: function(except){
		$each(this.items, function(item){
			(item.name == except) ? item.activate() : item.deactivate().disable();
		});
		return this;
	},

	enable: function(){
		$each(this.items, function(item){
			item.enable();
		});
		return this;
	},
	
	show: function(){
		this.el.setStyle('display', '');
		return this;
	},
	
	hide: function(){
		this.el.setStyle('display', 'none');
		return this;
	}
	
});

MooEditable.UI.Button = new Class({

	Implements: [Events, Options],

	options: {
		/*
		onAction: $empty,
		*/
		title: '',
		name: '',
		text: 'Button',
		'class': '',
		shortcut: '',
		mode: 'icon'
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
		var key = (Browser.Platform.mac) ? 'Cmd' : 'Ctrl';
		var shortcut = (this.options.shortcut) ? ' ( ' + key + '+' + this.options.shortcut.toUpperCase() + ' )' : '';
		var text = this.options.title || name;
		var title = text + shortcut;
		this.el = new Element('button', {
			'class': 'mooeditable-ui-button ' + self.options['class'],
			title: title,
			html: '<span class="button-icon"></span><span class="button-text">' + text + '</span>',
			events: {
				click: self.click.bind(self),
				mousedown: function(e){ e.preventDefault(); }
			}
		});
		if (this.options.mode != 'icon') this.el.addClass('mooeditable-ui-button-' + this.options.mode);
		
		this.active = false;
		this.disabled = false;

		// add hover effect for IE
		if (Browser.Engine.trident) this.el.addEvents({
			mouseenter: function(e){ this.addClass('hover'); },
			mouseleave: function(e){ this.removeClass('hover'); }
		});
		
		return this;
	},
	
	click: function(e){
		e.preventDefault();
		if (this.disabled) return;
		this.action(e);
	},
	
	action: function(){
		this.fireEvent('action', [this].concat($A(arguments)));
	},
	
	enable: function(){
		if (this.active) this.el.removeClass('onActive');
		if (!this.disabled) return;
		this.disabled = false;
		this.el.removeClass('disabled').set({
			disabled: false,
			opacity: 1
		});
		return this;
	},
	
	disable: function(){
		if (this.disabled) return;
		this.disabled = true;
		this.el.addClass('disabled').set({
			disabled: true,
			opacity: 0.4
		});
		return this;
	},
	
	activate: function(){
		if (this.disabled) return;
		this.active = true;
		this.el.addClass('onActive');
		return this;
	},
	
	deactivate: function(){
		this.active = false;
		this.el.removeClass('onActive');
		return this;
	}
	
});

MooEditable.UI.Dialog = new Class({

	Implements: [Events, Options],

	options:{
		/*
		onOpen: $empty,
		onClose: $empty,
		*/
		'class': '',
		contentClass: ''
	},

	initialize: function(html, options){
		this.setOptions(options);
		this.html = html;
		
		var self = this;
		this.el = new Element('div', {
			'class': 'mooeditable-ui-dialog ' + self.options['class'],
			html: '<div class="dialog-content ' + self.options.contentClass + '">' + html + '</div>',
			styles: {
				'display': 'none'
			},
			events: {
				click: self.click.bind(self)
			}
		});
	},
	
	toElement: function(){
		return this.el;
	},
	
	click: function(){
		this.fireEvent('click', arguments);
		return this;
	},
	
	open: function(){
		this.el.setStyle('display', '');
		this.fireEvent('open', this);
		return this;
	},
	
	close: function(){
		this.el.setStyle('display', 'none');
		this.fireEvent('close', this);
		return this;
	}

});

MooEditable.UI.AlertDialog = function(alertText){
	if (!alertText) return;
	var html = alertText + ' <button class="dialog-ok-button">' + MooEditable.lang.get('ok') + '</button>';
	return new MooEditable.UI.Dialog(html, {
		'class': 'mooeditable-alert-dialog',
		onOpen: function(){
			var button = this.el.getElement('.dialog-ok-button');
			(function(){
				button.focus();
			}).delay(10);
		},
		onClick: function(e){
			e.preventDefault();
			if (e.target.tagName.toLowerCase() != 'button') return;
			if (document.id(e.target).hasClass('dialog-ok-button')) this.close();
		}
	});
};

MooEditable.UI.PromptDialog = function(questionText, answerText, fn){
	if (!questionText) return;
	var html = '<label class="dialog-label">' + questionText
		+ ' <input type="text" class="text dialog-input" value="' + answerText + '">'
		+ '</label> <button class="dialog-button dialog-ok-button">' + MooEditable.lang.get('ok') + '</button>'
		+ '<button class="dialog-button dialog-cancel-button">' + MooEditable.lang.get('cancel') + '</button>';
	return new MooEditable.UI.Dialog(html, {
		'class': 'mooeditable-prompt-dialog',
		onOpen: function(){
			var input = this.el.getElement('.dialog-input');
			(function(){
				input.focus();
				input.select();
			}).delay(10);
		},
		onClick: function(e){
			e.preventDefault();
			if (e.target.tagName.toLowerCase() != 'button') return;
			var button = document.id(e.target);
			var input = this.el.getElement('.dialog-input');
			if (button.hasClass('dialog-cancel-button')){
				input.set('value', answerText);
				this.close();
			} else if (button.hasClass('dialog-ok-button')){
				var answer = input.get('value');
				input.set('value', answerText);
				this.close();
				if (fn) fn.attempt(answer, this);
			}
		}
	});
};

MooEditable.Actions = new Hash({

	bold: {
		title: MooEditable.lang.get('bold'),
		options: {
			shortcut: 'b'
		},
		states: {
			tags: ['b', 'strong'],
			css: {'font-weight': 'bold'}
		},
		events: {
			beforeToggleView: function(){
				if(Browser.Engine.gecko){
					var value = this.textarea.get('value');
					var newValue = value.replace(/<strong([^>]*)>/gi, '<b$1>').replace(/<\/strong>/gi, '</b>');
					if (value != newValue) this.textarea.set('value', newValue);
				}
			},
			attach: function(){
				if(Browser.Engine.gecko){
					var value = this.textarea.get('value');
					var newValue = value.replace(/<strong([^>]*)>/gi, '<b$1>').replace(/<\/strong>/gi, '</b>');
					if (value != newValue){
						this.textarea.set('value', newValue);
						this.setContent(newValue);
					}
				}
			}
		}
	},
	
	italic: {
		title: MooEditable.lang.get('italic'),
		options: {
			shortcut: 'i'
		},
		states: {
			tags: ['i', 'em'],
			css: {'font-style': 'italic'}
		},
		events: {
			beforeToggleView: function(){
				if (Browser.Engine.gecko){
					var value = this.textarea.get('value');
					var newValue = value.replace(/<embed([^>]*)>/gi, '<tmpembed$1>')
						.replace(/<em([^>]*)>/gi, '<i$1>')
						.replace(/<tmpembed([^>]*)>/gi, '<embed$1>')
						.replace(/<\/em>/gi, '</i>');
					if (value != newValue) this.textarea.set('value', newValue);
				}
			},
			attach: function(){
				if (Browser.Engine.gecko){
					var value = this.textarea.get('value');
					var newValue = value.replace(/<embed([^>]*)>/gi, '<tmpembed$1>')
						.replace(/<em([^>]*)>/gi, '<i$1>')
						.replace(/<tmpembed([^>]*)>/gi, '<embed$1>')
						.replace(/<\/em>/gi, '</i>');
					if (value != newValue){
						this.textarea.set('value', newValue);
						this.setContent(newValue);
					}
				}
			}
		}
	},
	
	underline: {
		title: MooEditable.lang.get('underline'),
		options: {
			shortcut: 'u'
		},
		states: {
			tags: ['u'],
			css: {'text-decoration': 'underline'}
		}
	},
	
	strikethrough: {
		title: MooEditable.lang.get('strikethrough'),
		options: {
			shortcut: 's'
		},
		states: {
			tags: ['s', 'strike'],
			css: {'text-decoration': 'line-through'}
		}
	},
	
	insertunorderedlist: {
		title: MooEditable.lang.get('unorderedList'),
		states: {
			tags: ['ul']
		}
	},
	
	insertorderedlist: {
		title: MooEditable.lang.get('orderedList'),
		states: {
			tags: ['ol']
		}
	},
	
	indent: {
		title: MooEditable.lang.get('indent'),
		states: {
			tags: ['blockquote']
		}
	},
	
	outdent: {
		title: MooEditable.lang.get('outdent')
	},
	
	undo: {
		title: MooEditable.lang.get('undo'),
		options: {
			shortcut: 'z'
		}
	},
	
	redo: {
		title: MooEditable.lang.get('redo'),
		options: {
			shortcut: 'y'
		}
	},
	
	unlink: {
		title: MooEditable.lang.get('removeHyperlink')
	},

	createlink: {
		title: MooEditable.lang.get('addHyperlink'),
		options: {
			shortcut: 'l'
		},
		states: {
			tags: ['a']
		},
		dialogs: {
			alert: MooEditable.UI.AlertDialog.pass(MooEditable.lang.get('selectTextHyperlink')),
			prompt: function(editor){
				return MooEditable.UI.PromptDialog(MooEditable.lang.get('enterURL'), 'http://', function(url){
					editor.execute('createlink', false, url.trim());
				});
			}
		},
		command: function(){
			var selection = this.selection;
			var dialogs = this.dialogs.createlink;
			if (selection.isCollapsed()){
				var node = selection.getNode();
				if (node.get('tag') == 'a' && node.get('href')){
					selection.selectNode(node);
					var prompt = dialogs.prompt;
					prompt.el.getElement('.dialog-input').set('value', node.get('href'));
					prompt.open();
				} else {
					dialogs.alert.open();
				}
			} else {
				var text = selection.getText();
				var prompt = dialogs.prompt;
				if (urlRegex.test(text)) prompt.el.getElement('.dialog-input').set('value', text);
				prompt.open();
			}
		}
	},

	urlimage: {
		title: MooEditable.lang.get('addImage'),
		options: {
			shortcut: 'm'
		},
		dialogs: {
			prompt: function(editor){
				return MooEditable.UI.PromptDialog(MooEditable.lang.get('enterImageURL'), 'http://', function(url){
					editor.execute('insertimage', false, url.trim());
				});
			}
		},
		command: function(){
			this.dialogs.urlimage.prompt.open();
		}
	},

	toggleview: {
		title: MooEditable.lang.get('toggleView'),
		command: function(){
			(this.mode == 'textarea') ? this.toolbar.enable() : this.toolbar.disable('toggleview');
			this.toggleView();
		}
	}

});

MooEditable.Actions.Settings = {};

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

})();
