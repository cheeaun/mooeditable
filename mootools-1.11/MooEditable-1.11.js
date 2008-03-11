/* Backport to mootools 1.11 by T.J. Leahy <tjleahy.jr [at] gmail [dot] com>*/
/*        Requires Hash.js plugin for 1.11                                  */

/*
*
*
*   The restructured MooEditable Class
*
*
*/

var MooEditable = new Class({

    options:{
           toolbar: true,
           buttons: 'bold,italic,underline,strikethrough,|,insertunorderedlist,insertorderedlist,indent,outdent,|,undo,redo,|,createlink,unlink,|,urlimage,|,toggleview',
           xhtml : true
    },

    initialize: function(el,options){
           this.setOptions(options);
           this.textarea = el;
           this.build();
           this.buildToolbar();
    },

    build: function(){
        //custom properties
        var tWidth = this.textarea.getStyle('width').toInt();
        var tHeight = this.textarea.getStyle('height').toInt();
        var tMargin = this.textarea.getStyle('margin');
        var tId = (this.textarea.id) ? this.textarea.id+ '-container' : null;
        var tBorderColor = this.textarea.getStyle('border-color');
        var tBorderStyle = this.textarea.getStyle('border-style');
        var tBorderWidth = this.textarea.getStyle('border-width');
        
        this.container = new Element('div',{
            'id': tId,
            'class': 'mooeditable-container',
            'styles': {
                'width': tWidth,
                'margin': tMargin
            }   
        });

        this.container.injectBefore(this.textarea);
        
        // Put textarea inside container
        if(window.ie)  {
            var temp = new Element('span');
            temp.adopt(this.textarea).injectInside(this.container);
        } else {
            this.container.adopt(this.textarea);
        }

        // Build the iframe
        var pads = this.textarea.getStyle('padding').split(' ');
        pads = pads.map(function(p){ 
            return (p == 'auto') ? 0 : p.toInt(); 
        });
        
        this.iframe = new Element('iframe', {
                'class': 'mooeditable-iframe',
                'id': 'mooeditable-iframe',
                'styles': {
                       'width':  tWidth + pads[1] + pads[3], 
                       'height': tHeight + pads[0] + pads[2],
                       'border-color': tBorderColor,
                       'border-width': tBorderWidth,
                       'border-style': tBorderStyle
               }
        });
        
        this.textarea.setStyles({
               'margin': 0,
               'display': 'none',
               'resize': 'none', // disable resizable textareas in Safari
               'outline': 'none' // disable focus ring in Safari
        });

        this.iframe.injectTop(this.container);
        
        
        // contentWindow and document references
        this.win = this.iframe.contentWindow;
        this.doc = this.win.document;
        
        
        
        // Build the content of iframe
        var documentTemplate = '\
               <html style="cursor: text; height: 100%">\
                       <body id=\"editable\" style="font-family: sans-serif; border: 0">'+
                       this.cleanup(this.textarea.value) +
                       '</body>\
               </html>\
        ';
        this.doc.open();
        this.doc.write(documentTemplate);
        this.doc.close();

        // Turn on Design Mode
        this.doc.designMode = 'on';

        // In IE6, after designMode is on, it forgots what is this.doc. Weird.
        if(window.ie6) this.doc = this.win.document;

        // styleWithCSS, not supported in IE and Opera
        if (!window.ie && !window.opera) this.execute('styleWithCSS', false, false);
        
        // Assign view mode
        this.mode = 'iframe';

        // Update the event for textarea's corresponding labels
        if(this.textarea.id && $$('label[for="'+this.textarea.id+'"]')) {
               $$('label[for="'+this.textarea.id+'"]').addEvent('click', function(e){
                       if(this.mode == 'iframe'){
                               e = new Event(e).stop();
                               this.win.focus();
                       }
               }.bind(this));
        }

        // Update & cleanup content before submit        
        this.form = this.textarea.getParent();
        
        while( this.form.getTag() != 'form' ) {
            if (this.form.getTag() == 'body') {
                this.form = false;
                break;
            }
            this.form = this.form.getParent();
        }
            
        if(this.form) this.form.addEvent('submit',function(){
               if (this.mode=='iframe') this.updateContent();
        }.bind(this));

        // Keyboard shortcuts
        if (this.doc.addEventListener) this.doc.addEventListener('keypress',  this.keyListener.bind(this), true);
        else this.doc.attachEvent('onkeypress',  this.keyListener.bind(this));
        this.textarea.addEvent('keypress', this.keyListener.bind(this));
        
        
    },


    keyListener: function(event) {
           var event = new Event(event);
           if (!event.control) return;           
           if (this.keys[event.key]) {
                event.stop();
                this.keys[event.key].fireEvent('click',event);
           }
    },

    buildToolbar: function() {
           this.toolbar = new Element('div',{ 'class': 'mooeditable-toolbar' });
           if(this.options.toolbar) this.toolbar.injectBefore(this.iframe);
           this.keys = [];
           var toolbarButtons = this.options.buttons.split(',');
           toolbarButtons.each(function(command, idx) {
                   var b;
                   var klass = this;
                   if (command == '|') b = new Element('span',{ 'class': 'toolbar-separator' });
                   else {
                           b = new Element('button', {
                                   'class': command+'-button toolbar-button',
                                   'title': MooEditable.Actions.get(command).title + ((MooEditable.Actions.get(command).shortcut) ? ' ( Ctrl+' + MooEditable.Actions.get(command).shortcut.toUpperCase() + ' )' : ''),
                                   'events': {
                                           'click': function(e) {
                                                    e = new Event(e).stop()
                                                    if(!this.hasClass('disabled')) klass.action(command);
                                                    klass.win.focus();
                                           },
                                           'mousedown': function(e) { e = new Event(e).stop(); }
                                   }
                           });
                           
                           // add hover effect for IE6
                           if(window.ie6) b.addEvents({
                                   'mouseenter': function(e){ this.addClass('hover'); },
                                   'mouseleave': function(e){ this.removeClass('hover'); }
                           });
                           // shortcuts
                           var key = MooEditable.Actions.get(command).shortcut;
                           if (key) this.keys[key] = b;

                           b.setText(MooEditable.Actions.get(command['title']));
                   }
                   b.injectInside(this.toolbar);
           }.bind(this));
    },

    selection: function(){
           if (window.ie) return this.doc.selection.createRange().text;
           return this.win.getSelection();
    },

    action: function(command){
           var action = MooEditable.Actions.get(command);
           action.command ? action.command(this) : this.execute(command, false, '');
    },

    execute: function(command, param1, param2){
       if (!this.busy){
                   this.busy = true;
                   this.doc.execCommand(command, param1, param2);
                   this.updateContent();
                   this.busy = false;
           }
           return false;
    },

    toggleView: function() {
           if (this.mode == 'textarea') {
                   this.mode = 'iframe';
                   this.iframe.setStyle('display', '');
                   (function(){
                           this.doc.getElementById('editable').innerHTML = this.textarea.value;
                   }).bind(this).delay(1); // dealing with Adobe AIR's webkit bug
                   this.toolbar.getElements('.toolbar-button').each(function(item){
                           item.removeClass('disabled');
                           item.setOpacity(1);
                   });
                   this.textarea.setStyle('display', 'none');
           } else {
                   this.mode = 'textarea';
                   this.textarea.setStyle('display', '');
                   this.updateContent();
                   this.toolbar.getElements('.toolbar-button').each(function(item){
                           if (!item.hasClass('toggleview-button')) {
                                   item.addClass('disabled');
                                   item.setOpacity(0.4);
                           }
                   });
                   this.iframe.setStyle('display', 'none');
           }
           // toggling from textarea to iframe needs the delay to get focus working
           (function(){ (this.mode=='iframe' ? this.win : this.textarea).focus(); }).bind(this).delay(10);
    },

    updateContent: function(){
           this.textarea.value = this.cleanup(this.doc.getElementById('editable').innerHTML);
    },

    cleanup: function(source){
           // Webkit cleanup
           source = source.replace(/<br class\="webkit-block-placeholder">/gi, "<br />");
           source = source.replace(/<span class="Apple-style-span">(.*)<\/span>/gi, '$1');
           source = source.replace(/ class="Apple-style-span"/gi, '');
           source = source.replace(/<span style="">/gi, '');

           // Remove padded paragraphs
           source = source.replace(/<p>\s*<br ?\/?>\s*<\/p>/gi, '<p>\u00a0</p>');
           source = source.replace(/<p>(&nbsp;|\s)*<\/p>/gi, '<p>\u00a0</p>');
           source = source.replace(/\s*<br ?\/?>\s*<\/p>/gi, '</p>');

           // Replace improper BRs (only if XHTML : true)
           if (this.options.xhtml) {
                source = source.replace(/<br>/gi, "<br />");
           }
           
           //fix webkit/safari
           if (window.webkit) {
                source = source.replace(/<div>\s?(?!<(?:ol|ul)>)(.+?)<\/div>/g, '<p>$1</p>');
                source = source.replace(/<div>\s?(.+?)<\/div>/g, '$1');
                source = source.replace(/<span([^>]*)>/ig, '<p>');
                source = source.replace(/<\/span[^>]*>/ig, '<\/p>');
                source = source.replace(/^(\w.*?)(<(?:p|ol|ul)>|$)/, '<p>$1</p>$2');
           }
           
           //make Opera and Firefox(Mozilla)  use <p> tags opposed to the default <br> that is used
           if (window.gecko || window.opera) {
                source = source.replace(/(.+?)<br ?\/?>/g, '<p>$1</p>');
           }
           
           //fix <br> tags in opera
           if (window.opera) {
                source = source.replace(/<p>(.*[^<])<br>(.*[^<])<\/p>/g, '$1</p><p>$2');
           }
           
           //fixes a problem where a paragraph may not be wrapped
           if (window.gecko || window.opera || window.webkit) {
                source = source.replace(/(^|<\/(?:ol|ul|p)>)([^<]*\w.+?)(<(?:ol|ul|p)>|$)/g, '$1<p>$2</p>$3');
           }
           

           
           // Remove leading and trailing BRs
           source = source.replace(/<br ?\/?>$/gi, '');
           source = source.replace(/^<br ?\/?>/gi, '');

           // Remove useless BRs
           source = source.replace(/><br ?\/?>/gi, '>');

           // Remove BRs right before the end of blocks
           source = source.replace(/<br ?\/?>\s*<\/(h1|h2|h3|h4|h5|h6|li|p)/gi, '</$1');

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
//           if (this.options.xhtml) {
//                source = source.replace(/(<(?:img|input)[^/>]*)>/g, '$1 />');
//           }
           
           //remove double <p> tags and empty <p> tags
            source = source.replace(/<p><p>/g, '<p>');
            source = source.replace(/<\/p><\/p>/g, '</p>');
//            source = source.replace(/<p>\W*<\/p>/g, '');
            
            
           // Final trim
           source = source.trim();

           return source;
    }
});

MooEditable.Actions = new Hash({

    bold: {'title':'Bold', 'shortcut':'b'},
    italic: {'title':'Italic', 'shortcut':'i'},
    underline: {'title':'Underline', 'shortcut':'u'},
    strikethrough: {'title':'Strikethrough', 'shortcut':'s'},
    insertunorderedlist: {'title':'Unordered List', 'shortcut':''},
    insertorderedlist: {'title':'Ordered List', 'shortcut':''},
    indent: {'title':'Indent', 'shortcut':''},
    outdent: {'title':'Outdent', 'shortcut':''},
    undo: {'title':'Undo', 'shortcut':'z'},
    redo: {'title':'Redo', 'shortcut':'y'},
    unlink: {'title':'Remove Hyperlink', 'shortcut':''},
    copy: {'title' : 'Copy to Clipboard', 'shortcut' :'c'},
    

    createlink: {
           title: 'Add Hyperlink',
           shortcut: 'l',
           command: function(me) {
                   if (me.selection() == '') alert("Please select the text you wish to hyperlink.");
                   else {
                           var url = prompt('Enter url','http://');
                           if (url) me.execute('createlink', false, url.trim());
                   }
           }
    },

    urlimage: {
           title: 'Add Image',
           shortcut: 'm',
           command: function(me) {
                   var url = prompt("Enter the Image url","http://");
                   if (url) me.execute("insertimage", false, url.trim());
           }
    },

    toggleview: {
           title: 'Toggle View',
           shortcut: 't',
           command: function(me) { me.toggleView(); }
    }

});

MooEditable.implement(new Options, new Events);