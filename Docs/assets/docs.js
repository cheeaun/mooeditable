var Docs = {

	urls: ['MooEditable/MooEditable.md'],
	mds: '',
	count: 0,
	
	// inspired by http://cssgallery.info/mootools-ajax-request-for-local-files/
	getContent: function(url, fn){
		if (document.location.protocol == 'file:'){
			var mdIFrame = new IFrame({
				'class': 'md-iframe',
				src: url,
				styles: {
					visibility: 'hidden',
					position: 'absolute',
					left: '-999em',
					top: 0
				},
				events: {
					load: function(){
						Docs.mds += $(this.contentWindow.document.body).getElement('pre').get('text');
						Docs.count++;
						if (Docs.count == Docs.urls.length){
							fn();
							Docs.disposeIframes();
						}
					}
				}
			}).inject(document.body);
		} else {
			new Request({
				url: url,
				method: 'get',
				onSuccess: function(md){
					Docs.mds += md;
					Docs.count++;
					if (Docs.count == Docs.urls.length) fn();
				}
			}).send();
		}
	},
	
	parse: function(){
		var html = new Showdown.converter().makeHtml(Docs.mds);
		var sd = $('docs').set('html', html);
		
		// anchorize the headings
		var anchor = (/\{#(.*)\}/);
		sd.getElements('h1, h2, h3, h4, h5, h6').each(function(h){
			var matches = h.innerHTML.match(anchor);
			if (matches) h.set('id', matches[1]);
			h.innerHTML = h.innerHTML.replace(anchor, '');
		});
		
		// prettify code
		sd.getElements('pre').addClass('prettyprint');
		prettyPrint();
	},
	
	disposeIframes: function(){
		setTimeout(function(){
			$$('.md-iframe').dispose();
		}, 1000);
	},
	
	start: function(){
		Docs.urls.each(function(url){
			Docs.getContent(url, Docs.parse);
		});
	}
	
};

window.addEvent('domready', Docs.start);