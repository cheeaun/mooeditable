/*
---

name: MooEditable.UI.ExtendedLinksDialog

description: Extends MooEditable, adds better link support.

license: MIT-style license

authors:
- André Fiedler <kontakt@visualdrugs.net>

requires:
- MooEditable.UI.Dialog
- MooEditable.Actions
- MooEditable.UI.AlertDialog
- More/URI

provides: [MooEditable.UI.ExtendedLinksDialog]

...
*/

(function(){
    
MooEditable.Locale.define({
    protocol: 'protocol',
    link: 'link',
    email: 'e-Mail',
    urlWithoutHttp: 'URL (without http://)',
    window: 'window',
    sameWindow: 'same window',
    newWindow: 'new window'
});

String.implement({
    camelCaseFirst: function(){
    	return this.replace(/\s*(\D)/, function(match){
    		return match.toUpperCase();
    	});
    }
});

var urlRegex = /^(https?|ftp|rmtp|mms):\/\/(([A-Z0-9][A-Z0-9_-]*)(\.[A-Z0-9][A-Z0-9_-]*)+)(:(\d+))?\/?/i;

MooEditable.UI.ExtendedLinksDialog = function(editor){
    var html = '<div class="dialog-column"><label class="dialog-label">' 
        + MooEditable.Locale.get('protocol').camelCaseFirst()+ '<br/><select class="dialog-input-protocol">'
        + '<option value="http">' + MooEditable.Locale.get('link') + '</option>'
        + '<option value="mailto">' + MooEditable.Locale.get('email') + '</option>'
        + '</select></label></div>'
		+ '<div class="dialog-column"><label class="dialog-label">'
        + MooEditable.Locale.get('urlWithoutHttp').camelCaseFirst()
        + '<br/><input type="text" class="dialog-input-url" value=""></label></div> '
		+ '<div class="dialog-column"><label class="dialog-label">'
        + MooEditable.Locale.get('window').camelCaseFirst() + '<br/><select class="dialog-input-target">'
        + '<option value="_self">' + MooEditable.Locale.get('sameWindow') + '</option>'
        + '<option value="_blank">' + MooEditable.Locale.get('newWindow') + '</option>'
        + '</select></label></div><br/>'
		+ '<button class="dialog-button dialog-ok-button">' + MooEditable.Locale.get('ok').camelCaseFirst() + '</button>'
		+ '<button class="dialog-button dialog-cancel-button">' + MooEditable.Locale.get('cancel').camelCaseFirst() + '</button>';
	return new MooEditable.UI.Dialog(html, {
		'class': 'mooeditable-prompt-dialog',
		onOpen: function(){
			var protocol_input = this.el.getElement('.dialog-input-protocol');
			var url_input = this.el.getElement('.dialog-input-url');
			var target_input = this.el.getElement('.dialog-input-target');
			var text = editor.selection.getText();
			var node = editor.selection.getNode();
			if(node.get('tag') == 'a'){
				var uri = new URI(node.href);
				protocol_input.set('value', uri.get('scheme'));
				if(uri.get('scheme') == 'mailto'){
					url_input.set('value', node.href.replace('mailto:', ''));
				}
                else {
					url_input.set('value', uri.get('host'));
				}
				target_input.set('value', node.target || '_self');
			}
			else if(urlRegex.test(text)) {
				var uri = new URI(text);
				protocol_input.set('value', uri.get('scheme'));
				url_input.set('value', uri.get('host'));
			}
			(function(){
				url_input.focus();
				url_input.select();
			}).delay(10);
		},
		onClick: function(e){
			e.preventDefault();
			if (e.target.tagName.toLowerCase() != 'button') return;
			var button = document.id(e.target);
			var protocol_input = this.el.getElement('.dialog-input-protocol');
			var url_input = this.el.getElement('.dialog-input-url');
			var target_input = this.el.getElement('.dialog-input-target');
			if (button.hasClass('dialog-cancel-button')){
				this.close();
			}
            else if (button.hasClass('dialog-ok-button')){
				if(protocol_input.get('value') == 'mailto'){
					editor.selection.insertContent('<a href="mailto:' + url_input.get('value') + '" target="' + target_input.get('value') + '">' + editor.selection.getText() + '</a>');
				}
                else {
					editor.selection.insertContent('<a href="' + protocol_input.get('value') + '://' + url_input.get('value') + '" target="' + target_input.get('value') + '">' + editor.selection.getText() + '</a>');
				}
				this.close();
			}
		}
	});
};

MooEditable.Actions.createlink.dialogs.prompt = function(editor){
	return MooEditable.UI.ExtendedLinksDialog(editor);
}
MooEditable.Actions.createlink.command = function(){
    var selection = this.selection;
    var dialogs = this.dialogs.createlink;
    if (selection.isCollapsed()){
    	var node = selection.getNode();
    	if (node.get('tag') == 'a' && node.get('href')){
    		selection.selectNode(node);
    		dialogs.prompt.open();
    	} else {
    		dialogs.alert.open();
    	}
    } else {
    	dialogs.prompt.open();
    }
}

})();