/*
---

name: MooEditable.CleanPaste

description: Extends MooEditable to insert text copied from other editors like word without all that messy style-information.

updates in this version: Improved Internet Explorer handling to break text on to new lines. Improved handling of some styles from newer versions of MS Word to remove extra style tags that were remaining.

license: MIT-style license

authors:
- André Fiedler <kontakt@visualdrugs.net>
- David Bennett <david@fuzzylime.co.uk>

requires:
- MooEditable
- MooEditable.Selection
- More/Class.Refactor

usage:
  Add the following tags in your html
  <link rel="stylesheet" href="MooEditable.css">
  <script src="mootools.js"></script>
  <script src="MooEditable.js"></script>
  <script src="MooEditable.CleanPaste.js"></script>

  <script>
  window.addEvent('domready', function(){
    var mooeditable = $('textarea-1').mooEditable();
  });
  </script>

provides: [MooEditable.CleanPaste]

...
*/

(function(){
    
    MooEditable = Class.refactor(MooEditable, {
    
        Extends: MooEditable,
        
        attach: function(){
            var ret = this.previous();
            this.doc.body.addListener('paste', this.cleanPaste.bind(this));
            return ret;
        },
        
        cleanPaste: function(e){
            var txtPastet = e.clipboardData && e.clipboardData.getData ?
                e.clipboardData.getData('text/html') : // Standard
                window.clipboardData && window.clipboardData.getData ?
                window.clipboardData.getData('Text') : // MS
                false;
            if(!!txtPastet) { // IE and Safari
	            if(window.clipboardData) this.selection.insertContent(this.cleanHtml(txtPastet, 1)); // IE
               	else this.selection.insertContent(this.cleanHtml(txtPastet)); // Safari
                new Event(e).stop();
            }
            else { // no clipboard data available
                this.selection.insertContent('<span id="INSERTION_MARKER">&nbsp;</span>');
                this.txtMarked = this.doc.body.get('html');
                this.doc.body.set('html', '');
                this.replaceMarkerWithPastedText.delay(5, this);
            }
            return this;
        },
        
        replaceMarkerWithPastedText: function(){
            var txtPastet = this.doc.body.get('html');
            var txtPastetClean = this.cleanHtml(txtPastet);
            this.doc.body.set('html', this.txtMarked);
    		var node = this.doc.body.getElementById('INSERTION_MARKER'); 
			this.selection.selectNode(node);
            this.selection.insertContent(txtPastetClean);
            return this;
        },
        
        cleanHtml: function(html, isie){
        	if(isie) {
        		html = "<p>" + html + "<\/p>";
        		html = html.replace(/\n/g, "<\/p><p>");
        	}
        	else {
        
				html = html.replace(/<o:p>\s*<\/o:p>/g, '');
				html = html.replace(/<o:p>[\s\S]*?<\/o:p>/g, '&nbsp;');
				
				// remove mso-xxx styles.
				html = html.replace(/\s*mso-[^:]+:[^;'"]+;?/gi, '');
				
				// remove margin styles.
				html = html.replace(/\s*MARGIN: 0cm 0cm 0pt\s*;/gi, '');
				html = html.replace(/\s*MARGIN: 0cm 0cm 0pt\s*"/gi, "\"");
				
				html = html.replace(/\s*TEXT-INDENT: 0cm\s*;/gi, '');
				html = html.replace(/\s*TEXT-INDENT: 0cm\s*"/gi, "\"");
				
				html = html.replace(/\s*TEXT-ALIGN: [^\s;]+;?"/gi, "\"");
				
				html = html.replace(/\s*PAGE-BREAK-BEFORE: [^\s;]+;?"/gi, "\"");
				
				html = html.replace(/\s*FONT-VARIANT: [^\s;]+;?"/gi, "\"");
				
				html = html.replace(/\s*tab-stops:[^;"]*;?/gi, '');
				html = html.replace(/\s*tab-stops:[^"]*/gi, '');
				
				// remove FONT face attributes.
				html = html.replace(/\s*face="[^"]*"/gi, '');
				html = html.replace(/\s*face=[^ >]*/gi, '');
				
				html = html.replace(/\s*FONT-FAMILY:[^;"]*;?/gi, '');
				
				// remove class attributes
				html = html.replace(/<(\w[^>]*) class=([^ |>]*)([^>]*)/gi, "<$1$3");
				
				// remove styles.
				html = html.replace(/<(\w[^>]*) style="([^\"]*)"([^>]*)/gi, "<$1$3");
				html = html.replace(/<(\w[^>]*) style='([^\']*)'([^>]*)/gi, "<$1$3");
				
				// remove style, meta and link tags
				html = html.replace(/<STYLE[^>]*>[\s\S]*?<\/STYLE[^>]*>/gi, '');
				html = html.replace(/<(?:META|LINK)[^>]*>\s*/gi, '');
				
				// remove empty styles.
				html = html.replace(/\s*style="\s*"/gi, '');
				
				html = html.replace(/<SPAN\s*[^>]*>\s*&nbsp;\s*<\/SPAN>/gi, '&nbsp;');
				
				html = html.replace(/<SPAN\s*[^>]*><\/SPAN>/gi, '');
				
				// remove lang attributes
				html = html.replace(/<(\w[^>]*) lang=([^ |>]*)([^>]*)/gi, "<$1$3");
				
				html = html.replace(/<SPAN\s*>([\s\S]*?)<\/SPAN>/gi, '$1');
				
				html = html.replace(/<FONT\s*>([\s\S]*?)<\/FONT>/gi, '$1');
				
				// remove XML elements and declarations
				html = html.replace(/<\\?\?xml[^>]*>/gi, '');
				
				// remove w: tags with contents.
				html = html.replace(/<w:[^>]*>[\s\S]*?<\/w:[^>]*>/gi, '');
				
				// remove tags with XML namespace declarations: <o:p><\/o:p>
				html = html.replace(/<\/?\w+:[^>]*>/gi, '');
				
				// remove comments [SF BUG-1481861].
				html = html.replace(/<\!--[\s\S]*?-->/g, '');
				
				html = html.replace(/<(U|I|STRIKE)>&nbsp;<\/\1>/g, '&nbsp;');
				
				html = html.replace(/<H\d>\s*<\/H\d>/gi, '');
				
				// remove "display:none" tags.
				html = html.replace(/<(\w+)[^>]*\sstyle="[^"]*DISPLAY\s?:\s?none[\s \S]*?<\/\1>/ig, '');
				
				// remove language tags
				html = html.replace(/<(\w[^>]*) language=([^ |>]*)([^>]*)/gi, "<$1$3");
				
				// remove onmouseover and onmouseout events (from MS word comments effect)
				html = html.replace(/<(\w[^>]*) onmouseover="([^\"]*)"([^>]*)/gi, "<$1$3");
				html = html.replace(/<(\w[^>]*) onmouseout="([^\"]*)"([^>]*)/gi, "<$1$3");
				
				// the original <Hn> tag send from word is something like this: <Hn style="margin-top:0px;margin-bottom:0px">
				html = html.replace(/<H(\d)([^>]*)>/gi, '<h$1>');
				
				// word likes to insert extra <font> tags, when using IE. (Wierd).
				html = html.replace(/<(H\d)><FONT[^>]*>([\s\S]*?)<\/FONT><\/\1>/gi, '<$1>$2<\/$1>');
				html = html.replace(/<(H\d)><EM>([\s\S]*?)<\/EM><\/\1>/gi, '<$1>$2<\/$1>');
				
				// remove "bad" tags
				html = html.replace(/<\s+[^>]*>/gi, '');
				
				// remove empty tags (three times, just to be sure).
				// This also removes any empty anchor
				html = html.replace(/<([^\s>]+)(\s[^>]*)?>\s*<\/\1>/g, '');
				html = html.replace(/<([^\s>]+)(\s[^>]*)?>\s*<\/\1>/g, '');
				html = html.replace(/<([^\s>]+)(\s[^>]*)?>\s*<\/\1>/g, '');
				
				// Convert <p> to <br />
				if (!this.options.paragraphise) {
					html.replace(/<p>/gi, '<br />');
					html.replace(/<\\p>/gi, '');
				}
            }
            
            return html;
        }
    });
    
})();