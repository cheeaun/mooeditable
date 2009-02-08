var Docs = {

	urls: [
		'MooEditable/MooEditable.md',
		'MooEditable/MooEditable.Extras.md'
		],
	currentDoc: '',
	
	start: function(){
		Docs.generateMenu();
		
		var hashdoc = function(){
			var href = window.location.hash.slice(1);
			if (href == Docs.currentDoc) return;
			if (!href || !/(\.md)/.test(href)){
				href = Docs.urls[0];
				window.location.hash = href;
			}
			Docs.getContent(href, Docs.parse);
			Docs.currentDoc = href;
		};
		
		hashdoc.periodical(25);
	},
	
	generateMenu: function(){
		var html = '<ul>';
		Docs.urls.each(function(url){
			var file = url.split('/')[1].slice(0, -3);
			html += '<li><a href="#' + url + '">' + file + '</a></li>';
		});
		html += '</ul>';
		
		$('menu').set('html', html);
	},
	
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
						var doc = $(this.contentWindow.document.body).getElement('pre').get('text');
						fn(url, doc);
						Docs.disposeIframes();
					}
				}
			}).inject(document.body);
		} else {
			new Request({
				url: url,
				method: 'get',
				onSuccess: function(doc){
					fn(url, doc);
				}
			}).send();
		}
	},
	
	parse: function(url, doc){
		var html = new Showdown.converter().makeHtml(doc);
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
		}, 100);
	},
	
};

window.addEvent('domready', Docs.start);