/*
Script: MooEditable.js
	MooEditable class for contentEditable-capable browsers

License:
	MIT-style license.

Author:
	Lim Chee Aun <http://cheeaun.phoenity.com>

Credits:
	- Most code is based on Stefan's work "Safari Supports Content Editing!" <http://www.xs4all.nl/~hhijdra/stefan/ContentEditable.html>
	- Main reference from Peter-Paul Koch's "execCommand compatibility" research <http://www.quirksmode.org/dom/execCommand.html>
	- Some ideas inspired by TinyMCE <http://tinymce.moxiecode.com/>
	- Some functions inspired by Inviz's "Most tiny wysiwyg you ever seen" <http://forum.mootools.net/viewtopic.php?id=746>, <http://forum.mootools.net/viewtopic.php?id=5740>
	- Some regex from Cameron Adams's widgEditor <http://themaninblue.com/experiment/widgEditor/>
	- Tango icons from the Tango Desktop Project <http://tango.freedesktop.org/>
	- Additional tango icons from Tango OpenOffice set by Jimmacs <http://www.gnome-look.org/content/show.php/Tango+OpenOffice?content=54799>
*/

var MooEditable = new Class({

	options:{
		mode: 'design',
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
		this.busy = false;
		if (this.options.initialize) this.options.initialize.call(this);
	},

	build: function(el){
		var container = new Element('div',{
			'class': el.className + '-container',
			'styles': {
				'width': el.getStyle('width').toInt() + el.getStyle('padding-right').toInt() + el.getStyle('padding-left').toInt(),
				'margin': el.getStyle('margin')
			}
		});
		
		container.injectBefore(el);
		el.injectInside(container);
		
		el.setStyles({
			'margin': 0,
			'resize': 'none', // disable resizable textareas in Safari
			'outline': 'none' // disable focus ring in Safari
		});
		
		var iframe = new Element('iframe',{
			'class': el.className + '-iframe',
			'styles':{
				'width': '100%',
				'height': el.getStyle('height').toInt() + el.getStyle('padding-bottom').toInt() + el.getStyle('padding-top').toInt(),
				'border': el.getStyle('border')
			}
		});
		iframe.injectBefore(el);
		
		if(this.options.mode == 'design') el.setStyle('display','none');
		else iframe.setStyle('display','none');
		
		var doc = iframe.contentDocument;
		doc.open('text/html');
		doc.write('<html><body id="editable" style="font-family: helvetica, arial, sans-serif; margin: 1px; padding: '+ el.getStyle('padding') +'">');
		doc.write(el.innerHTML);
		doc.write('</body></html>');
		doc.close();
		doc.designMode = 'on';
		
		if (this.options.toolbar) this.buildToolbar(el,iframe);
		if (this.options.viewtabs) this.buildViewTabs(el,iframe);
	},
	
	buildToolbar: function(el,iframe){
		var toolbar = new Element('div',{
			'class': el.className + '-toolbar',
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
				if(!item.hasClass('disabled')){
					var command = item.className.split(' ')[0].split('-')[0];
					switch(command){
						case 'createlink': 
							var url = prompt('Enter URL','http://');
							this.execute(iframe.contentDocument, e, command, false, url);
							break;
						case 'toggleview':
							this.toggle(el,iframe,toolbar);
							break;
						default:
							this.execute(iframe.contentDocument, e, command, false, '');
					}
				}
			}.bind(this));
		}.bind(this));
	},
	
	toggle: function(el,iframe,toolbar) {
		if (iframe.getStyle('display') == 'none') {
			iframe.setStyle('display', '');
			el.setStyle('display', 'none');
			iframe.contentDocument.getElementById('editable').innerHTML = el.value;
			toolbar.getElements('.toolbar-button').each(function(item){
				item.removeClass('disabled');
				item.setOpacity(1);
			});
		}
		else{
			iframe.setStyle('display', 'none');
			el.setStyle('display', '');
			this.cleanup(iframe.contentDocument);
			el.value = iframe.contentDocument.getElementById('editable').innerHTML;
			toolbar.getElements('.toolbar-button').each(function(item){
				if (!item.hasClass('toggleview-button')) {
					item.addClass('disabled');
					item.setOpacity(0.4);
				}
			});
		}
	},
	
	execute: function(doc, event, command, param1, param2){
	    if (!this.busy){
			this.busy = true;
			doc.execCommand(command, param1, param2);
			event.preventDefault();
			event.returnValue = false;
			this.busy = false;
		}
		return false;
	},
	
	cleanup: function(doc){
		var source = doc.getElementById('editable');
		
		// Remove leading and trailing whitespace
		source.innerHTML = source.innerHTML.replace(/^\s+/, '');
		source.innerHTML = source.innerHTML.replace(/\s+$/, '');
		
		// Remove trailing BRs
		source.innerHTML = source.innerHTML.replace(/<br>$/, '');

		// Remove BRs right before the end of blocks
		source.innerHTML = source.innerHTML.replace(/<br>\s*<\/(h1|h2|h3|h4|h5|h6|li|p)/gi, '</$1');
		
		// Remove empty tags
		source.innerHTML = source.innerHTML.replace(/(<[^\/]>|<[^\/][^>]*[^\/]>)\s*<\/[^>]*>/gi, '');
		
		// Webkit cleanup
		source.innerHTML = source.innerHTML.replace(/ class=\"Apple-style-span\"/gi, '');
		source.innerHTML = source.innerHTML.replace(/<SPAN style=\"\">/gi, '');
	}
});

MooEditable.implement(new Options, new Events);
