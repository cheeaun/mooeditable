/*
Script: MooEditable.js
	MooEditable class for contentEditable-capable browsers

License:
	MIT-style license.

Author:
	Lim Chee Aun <cheeaun@gmail.com>
	
Contributor(s):
	Marc Fowler <marc.fowler@defraction.net>

Credits:
	- Most code is based on Stefan's work "Safari Supports Content Editing!" <http://www.xs4all.nl/~hhijdra/stefan/ContentEditable.html>
	- Main reference from Peter-Paul Koch's "execCommand compatibility" research <http://www.quirksmode.org/dom/execCommand.html>
	- Some ideas inspired by TinyMCE <http://tinymce.moxiecode.com/>
	- Some functions inspired by Inviz's "Most tiny wysiwyg you ever seen" <http://forum.mootools.net/viewtopic.php?id=746>, <http://forum.mootools.net/viewtopic.php?id=5740>
	- Some regex from Cameron Adams's widgEditor <http://themaninblue.com/experiment/widgEditor/>
	- IE support referring Robert Bredlau's "Rich Text Editing" part 1 and 2 articles <http://www.rbredlau.com/drupal/node/6>
	- Tango icons from the Tango Desktop Project <http://tango.freedesktop.org/>
	- Additional tango icons from Tango OpenOffice set by Jimmacs <http://www.gnome-look.org/content/show.php/Tango+OpenOffice?content=54799>
*/

var MooEditable = new Class({

//	Implements: [Events, Options],

	options:{
		toolbar: true,
		buttons: 'bold,italic,strikethrough,separator,insertunorderedlist,insertorderedlist,indent,outdent,separator,undo,redo,separator,createlink,unlink,toggleview',
		text: {
			'bold': 'Bold',
			'italic': 'Italic',
			'strikethrough': 'Strikethrough',
			'insertunorderedlist': 'Unordered List',
			'insertorderedlist': 'Ordered List',
			'indent': 'Indent',
			'outdent': 'Outdent',
			'undo': 'Undo',
			'redo': 'Redo',
			'createlink': 'Add Hyperlink',
			'unlink': 'Remove Hyperlink',
			'separator': '|',
			'toggleview': 'Toggle View'
		}
	},

	initialize: function(elements,options){
		this.setOptions(options);
		$$(elements).each(this.build, this);
	},

	build: function(el){
		var id = el.className ? el.className : el.id ? el.id : 'mooeditable';
		var elStyles = el.getStyles('width','height','padding','margin','border','border-width');
		var sides = ['top','right','bottom','left'];
		for (var i = 0; i < sides.length; i++) {
			elStyles['padding-' + sides[i]] = elStyles['padding'].split(' ')[i];
			elStyles['border-' + sides[i] + '-width'] = elStyles['border-width'].split(' ')[i];
		}

		// Build the container
		var container = new Element('div',{
			'class': id + '-container',
			'styles': {
				'width': elStyles['width'].toInt() + elStyles['padding-right'].toInt() + elStyles['padding-left'].toInt() + elStyles['border-right-width'].toInt() + elStyles['border-left-width'].toInt(),
				'margin': elStyles['margin']
			}
		});
		
		// Put textarea inside container
		container.inject(el, 'before');
		el.setStyles({
			'margin': 0,
			'display': 'none',
			'resize': 'none', // disable resizable textareas in Safari
			'outline': 'none' // disable focus ring in Safari
		});
//		if(Browser.Engine.trident){
		if(window.ie){
			// Fix IE bug, refer "IE/Win Inherited Margins on Form Elements" <http://positioniseverything.net/explorer/inherited_margin.html>
			var span = new Element('span');
			span.inject(container, 'bottom');
			el.inject(span, 'bottom');
		}
		else el.inject(container, 'bottom');
		
		// Build the iframe
		var iframe = new Element('iframe',{
			'class': id + '-iframe',
			'styles':{
				'width': elStyles['width'].toInt() + elStyles['padding-right'].toInt() + elStyles['padding-left'].toInt(),
				'height': elStyles['height'].toInt() + elStyles['padding-top'].toInt() + elStyles['padding-bottom'].toInt(),
				'border': elStyles['border']
			}
		});
		iframe.inject(container, 'top');

		// Build the content of iframe
		var doc = iframe.contentWindow.document;
		doc.open();
		doc.write('<html style="cursor: text; height: 100%">');
		doc.write('<body id="editable" style="font-family: helvetica, arial, sans-serif; border: 0; margin: 1px; padding: '+ elStyles['padding'] +'">');
		doc.write('<p>'+el.value+'</p>');
		doc.write('</body></html>');
		doc.close();
		
		// Turn on Design Mode
		doc.designMode = 'on';

		// Update the event for textarea's corresponding labels
		if(el.id) $$('label[for="'+el.id+'"]').addEvent('click', function(e){
			if(iframe.getStyle('display') != 'none'){
				e = new Event(e).stop();
				iframe.contentWindow.focus();
			}
		});

		// Ensures textarea content is always updated
		var events = ['mousedown', 'mouseup', 'mouseout', 'mouseover', 'click', 'keydown', 'keyup', 'keypress'];
		for(var i = 0; i < events.length; i++){
			if($type(document.addEventListener) == 'function'){
				doc.addEventListener(events[i], function(oEvent){
					el.value = this.cleanup(doc.getElementById('editable').innerHTML);
				}.bind(this), false);
			}
			else{
				iframe.contentWindow.document.attachEvent('on' + events[i], function(){
					el.value = this.cleanup(iframe.contentWindow.document.getElementById('editable').innerHTML);
				}.bind(this));
			}
		}
		
		if(this.options.toolbar) this.buildToolbar(el,iframe,id);
	},
	
	buildToolbar: function(el,iframe,id){
		var toolbar = new Element('div',{
			'class': id + '-toolbar'
		});
		toolbar.inject(iframe, 'before');
		
		var toolbarButtons = this.options.buttons.split(',');

		for (var i=0 ; i<toolbarButtons.length ; i++){
			var command = toolbarButtons[i];
			var b;
			if (command == 'separator'){
				b = new Element('span',{
					'class': 'toolbar-separator'
				});
			}
			else{
				b = new Element('button',{
					'class': command+'-button toolbar-button',
					'title': this.options.text[command]
				});
			}
//			b.set('text', this.options.text[command]);
			b.setText(this.options.text[command]);
			b.inject(toolbar, 'bottom');
		}

		toolbar.getElements('.toolbar-button').each(function(item){
			item.addEvent('click', function(e){
				e = new Event(e).stop();
				if (!item.hasClass('disabled')){
					var command = item.className.split(' ')[0].split('-')[0];
					this.action(command, el, iframe, toolbar);
				}
				iframe.contentWindow.focus();
			}.bind(this));

			// remove focus rings off the buttons in Firefox
			item.addEvent('mousedown', function(e){ new Event(e).stop(); });

			// add hover effect for IE6
//			if(Browser.Engine.trident4) item.addEvents({
			if(window.ie6) item.addEvents({
				'mouseenter': function(e){ this.addClass('hover'); },
				'mouseleave': function(e){ this.removeClass('hover'); }
			});
		}.bind(this));
	},
	
	action: function(command, el, iframe, toolbar){
		var win = iframe.contentWindow;
		var doc = win.document;
		var selection = '';
		switch(command){
			case 'createlink': 
				if (doc.selection){
					selection = doc.selection.createRange().text;
					if (selection == ''){
						alert("Please select the text you wish to hyperlink.");
						break;
					}
				}
				else{
					selection = win.getSelection();
					if (selection == ''){
						alert("Please select the text you wish to hyperlink.");
						break;
					}
				}
				var url = prompt('Enter URL','http://');
				if (url) this.execute(el, doc, command, false, url.trim());
				break;
			case 'toggleview':
				this.toggle(el,iframe,toolbar);
				break;
			default:
//				if (!Browser.Engine.trident) this.execute(el, doc, 'styleWithCSS', false, this.options.styleWithCSS);
				if (!window.ie) this.execute(el, doc, 'styleWithCSS', false, false);
				this.execute(el, doc, command, false, '');
		}
	},
	
	execute: function(el, doc, command, param1, param2){
	    if (!this.busy){
			this.busy = true;
			doc.execCommand(command, param1, param2);
			el.value = this.cleanup(doc.getElementById('editable').innerHTML);
			this.busy = false;
		}
		return false;
	},
	
	toggle: function(el,iframe,toolbar) {
		if (iframe.getStyle('display') == 'none') {
			iframe.setStyle('display', '');
			var doc = iframe.contentWindow.document;
			(function(){
			doc.getElementById('editable').innerHTML = el.value;
			}).delay(1); // dealing with Adobe AIR's webkit bug
			toolbar.getElements('.toolbar-button').each(function(item){
				item.removeClass('disabled');
//				item.set('opacity', 1);
				item.setOpacity(1);
			});
			el.setStyle('display', 'none');
		} else {
			el.setStyle('display', '');
			var doc = iframe.contentWindow.document;
			el.value = this.cleanup(doc.getElementById('editable').innerHTML);
			toolbar.getElements('.toolbar-button').each(function(item){
				if (!item.hasClass('toggleview-button')) {
					item.addClass('disabled');
//					item.set('opacity', 0.4);
					item.setOpacity(0.4);
				}
			});
			iframe.setStyle('display', 'none');
		}
	},
	
	cleanup: function(source){
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
		
		// Remove trailing BRs
		source = source.replace(/<br \/>$/gi, '');

		// Remove useless BRs
		source = source.replace(/><br \/>/gi, '>');

		// Remove BRs right before the end of blocks
		source = source.replace(/<br \/>\s*<\/(h1|h2|h3|h4|h5|h6|li|p)/gi, '</$1');
		
		// Remove empty tags
		source = source.replace(/(<[^\/]>|<[^\/][^>]*[^\/]>)\s*<\/[^>]*>/gi, '');

		// Semantic conversion
		source = source.replace(/<span style="font-weight: bold;">(.*)<\/span>/gi, '<strong>$1</strong>');
		source = source.replace(/<span style="font-style: italic;">(.*)<\/span>/gi, '<em>$1</em>');
		source = source.replace(/<b(\s+|>)/g, "<strong$1");
		source = source.replace(/<\/b(\s+|>)/g, "</strong$1");
		source = source.replace(/<i(\s+|>)/g, "<em$1");
		source = source.replace(/<\/i(\s+|>)/g, "</em$1");
		
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
		
		// Final trim
		source = source.trim();
		
		return source;
	}
});

MooEditable.implement(new Options, new Events);
