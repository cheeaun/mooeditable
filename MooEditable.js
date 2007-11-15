/*
Script: MooEditable.js
	MooEditable class for contentEditable-capable browsers

License:
	MIT-style license.

Author:
	Lim Chee Aun <cheeaun@gmail.com>
	
Changelog:
	0.2 (15 Nov 2007)
		- Fixed padding of textareas and iframe's doc for Safari 3 beta
		- Added instant update of content to textareas
		- Added compatibility for Internet Explorer 7
		- Better compatibility with Adobe AIR's webkit
		- More regex to cleanup the messy code made by Internet Explorer
		- Removed 'mode' option, not very useful anyway
	0.1 (12 Nov 2007)
		- first initial release

Credits:
	- Most code is based on Stefan's work "Safari Supports Content Editing!" <http://www.xs4all.nl/~hhijdra/stefan/ContentEditable.html>
	- Main reference from Peter-Paul Koch's "execCommand compatibility" research <http://www.quirksmode.org/dom/execCommand.html>
	- Some ideas inspired by TinyMCE <http://tinymce.moxiecode.com/>
	- Some functions inspired by Inviz's "Most tiny wysiwyg you ever seen" <http://forum.mootools.net/viewtopic.php?id=746>, <http://forum.mootools.net/viewtopic.php?id=5740>
	- Some regex from Cameron Adams's widgEditor <http://themaninblue.com/experiment/widgEditor/>
	- Tango icons from the Tango Desktop Project <http://tango.freedesktop.org/>
	- Additional tango icons from Tango OpenOffice set by Jimmacs <http://www.gnome-look.org/content/show.php/Tango+OpenOffice?content=54799>
	- IE support referring Robert Bredlau's "Rich Text Editing" part 1 and 2 articles <http://www.rbredlau.com/drupal/node/6>
*/

var MooEditable = new Class({

	options:{
		toolbar: true,
		styleWithCSS: true,
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
		if (this.options.initialize) this.options.initialize.call(this);
	},

	build: function(el){
		var id = el.className ? el.className : el.id ? el.id : 'mooeditable';
		elStyles = el.getStyles('width','height','padding','margin','border');

		// Build the container
		var container = new Element('div',{
			'class': id + '-container',
			'styles': {
				'width': elStyles['width'].toInt() + elStyles['padding'].split(' ')[1].toInt() + elStyles['padding'].split(' ')[3].toInt(),
				'margin': elStyles['margin']
			}
		});
		
		// Put textarea inside container
		container.injectBefore(el);
		el.injectInside(container);
		el.setStyles({
			'margin': 0,
			'display': 'none',
			'resize': 'none', // disable resizable textareas in Safari
			'outline': 'none' // disable focus ring in Safari
		});
		
		// Build the iframe
		var iframe = new Element('iframe',{
			'class': id + '-iframe',
			'styles':{
				'width': '100%',
				'height': elStyles['height'].toInt() + elStyles['padding'].split(' ')[0].toInt() + elStyles['padding'].split(' ')[2].toInt(),
				'border': elStyles['border']
			}
		});
		iframe.injectBefore(el);

		// Build the content of iframe
		var w3c = iframe.contentDocument !== undefined ? true : false;
		var doc = w3c ? iframe.contentDocument : iframe.contentWindow.document;
		doc.open('text/html');
		doc.write('<html style="cursor: text; height: 100%"><body id="editable" style="font-family: helvetica, arial, sans-serif; border: 0; margin: 1px; padding: '+ elStyles['padding'] +'">');
		doc.write(el.innerHTML);
		doc.write('</body></html>');
		doc.close();
		doc.designMode = 'on';
		
		if (this.options.toolbar) this.buildToolbar(el,iframe,id);

		// Ensures textarea content is always updated		
		if(doc.addEventListener) doc.addEventListener('keyup', function(e){
			el.value = this.cleanup(doc.getElementById('editable').innerHTML);
		}.bind(this), false);
		if(doc.addEventListener) doc.addEventListener('click', function(e){
			el.value = this.cleanup(doc.getElementById('editable').innerHTML);
		}.bind(this), false);
	},
	
	buildToolbar: function(el,iframe,id){
		var toolbar = new Element('div',{
			'class': id + '-toolbar',
			'styles': {
				'width': '100%'
			}
		});
		toolbar.injectBefore(iframe);
		
		var toolbarButtons = this.options.buttons.split(',');

		for (var i=0 ; i<toolbarButtons.length ; i++){
			var command = toolbarButtons[i];
			var b = new Element('a',{
				'class': (command == 'separator') ? 'toolbar-separator' : command+'-button toolbar-button',
				'title': this.options.text[command]
			});
			b.setText(this.options.text[command]);
			b.injectInside(toolbar);
		}

		toolbar.getElements('.toolbar-button').each(function(item){
			item.addEvent('mousedown', function(e){
				e = new Event(e);
				if(!item.hasClass('disabled')){
					var command = item.className.split(' ')[0].split('-')[0];
					var w3c = iframe.contentDocument !== undefined ? true : false;
					var doc = w3c ? iframe.contentDocument : iframe.contentWindow.document;
					switch(command){
						case 'createlink': 
							var url = prompt('Enter URL','http://');
							this.execute(el, doc, e, command, false, url);
							break;
						case 'toggleview':
							this.toggle(el,iframe,toolbar);
							break;
						default:
							if(!window.ie) this.execute(el, doc, e, 'styleWithCSS', false, this.options.styleWithCSS);
							this.execute(el, doc, e, command, false, '');
					}
				}
			}.bind(this));
		}.bind(this));
	},
	
	toggle: function(el,iframe,toolbar) {
		if (iframe.getStyle('display') == 'none') {
			iframe.setStyle('display', '');
			var w3c = iframe.contentDocument !== undefined ? true : false;
			var doc = w3c ? iframe.contentDocument : iframe.contentWindow.document;
			(function(){
			doc.getElementById('editable').innerHTML = el.value;
			}).delay(1); // dealing with Adobe AIR's webkit bug
			toolbar.getElements('.toolbar-button').each(function(item){
				item.removeClass('disabled');
				item.setOpacity(1);
			});
			el.setStyle('display', 'none');
		}
		else{
			el.setStyle('display', '');
			var w3c = iframe.contentDocument !== undefined ? true : false;
			var doc = w3c ? iframe.contentDocument : iframe.contentWindow.document;
			el.value = this.cleanup(doc.getElementById('editable').innerHTML);
			toolbar.getElements('.toolbar-button').each(function(item){
				if (!item.hasClass('toggleview-button')) {
					item.addClass('disabled');
					item.setOpacity(0.4);
				}
			});
			iframe.setStyle('display', 'none');
		}
	},
	
	execute: function(el, doc, event, command, param1, param2){
	    if (!this.busy){
			this.busy = true;
			doc.execCommand(command, param1, param2);
			el.value = this.cleanup(doc.getElementById('editable').innerHTML);
			event.preventDefault();
			this.busy = false;
		}
		return false;
	},
	
	cleanup: function(source){
		// Remove leading and trailing whitespace
		source = source.replace(/^\s+/, '');
		source = source.replace(/\s+$/, '');
		
		// Remove trailing BRs
		source = source.replace(/<br>$/, '');

		// Remove BRs right before the end of blocks
		source = source.replace(/<br>\s*<\/(h1|h2|h3|h4|h5|h6|li|p)/gi, '</$1');
		
		// Remove empty tags
		source = source.replace(/(<[^\/]>|<[^\/][^>]*[^\/]>)\s*<\/[^>]*>/gi, '');
		
		// Webkit cleanup
		source = source.replace(/ class=\"Apple-style-span\"/gi, '');
		source = source.replace(/<SPAN style=\"\">/gi, '');
		
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
		
		return source;
	}
});

MooEditable.implement(new Options, new Events);
