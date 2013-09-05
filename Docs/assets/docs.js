var Docs = {
	urls: [
		'MooEditable/MooEditable.md',
		'MooEditable/MooEditable.UI.MenuList.md',
		'MooEditable/MooEditable.UI.ButtonOverlay.md',
		'MooEditable/MooEditable.Extras.md',
		'MooEditable/MooEditable.Group.md'
	],
	remote: false,
	githubAPI: {
		blob: 'https://api.github.com/repos/cheeaun/mooeditable/contents/Docs/{path}'
	},

	start: function(){
		Docs.generateMenu();

		var href = window.location.hash.slice(1);
		if (href && /(\.md)/.test(href)) Docs.getContent(href, Docs.parse);

		document.addEvent('click', function(e){
			if (e.target.tagName.toLowerCase() != 'a') return;
			var hrefsplit = e.target.href.split('#');
			var href = hrefsplit[1];
			if (!href || !/(\.md)/.test(href)) return;
			Docs.getContent(href, Docs.parse);
			if (hrefsplit.length>2) setTimeout(function(){
				var id = location.hash = hrefsplit[2];
				var to = $(id.replace(/\./g, '-')).getCoordinates();
				window.scrollTo(0, to.top);
			}, 1000);
		});
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
		if (!Docs.contentCache) Docs.contentCache = {};
		if (Docs.contentCache[url]){
			fn(url, Docs.contentCache[url]);
			return;
		}

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
						Docs.contentCache[url] = doc;
						fn(url, doc);
						Docs.disposeIframes();
					}
				}
			}).inject(document.body);
		} else if (Docs.remote){
			new Request.JSONP({
				url: Docs.githubAPI.blob.substitute({
					path: url
				}),
				onSuccess: function(doc){
					var data = doc.data.content.replace(/\n/ig, '');
					data = atob(data);
					Docs.contentCache[url] = data;
					fn(url, data);
				}
			}).send();
		} else {
			new Request({
				url: url,
				method: 'get',
				onSuccess: function(doc){
					Docs.contentCache[url] = doc;
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

		// hash methods list
		var headings = sd.getElements('h1');
		var methods = sd.getElements('h2');

		var html = '<ul>';
		headings.each(function(heading){
			var href = heading.get('id');
			var text = heading.get('text').split(':')[1].trim();
			html += '<li><a href="#' + href + '"><strong>' + text + '</strong></a>';
			html += '<ul>';
			methods.filter('[id^=' + href + ':]').each(function(method){
				var href = method.get('id');
				var text = href.split(':')[1];
				html += '<li><a href="#' + href + '">' + text + '</a></li>';
			});
			html += '</ul></li>';
		});
		html += '</ul>';
		$('methods').set('html', html);

		// hack some links
		sd.getElements('a[href^=/]').each(function(a){
			var href = Docs.remote ? a.get('href').slice(1) : a.href;
			var hrefsplit = href.split('#');
			var path = hrefsplit[0].replace(/([a-z:\/]+:\/{1,3})/i, '');
			var href = '#' + path + '.md';
			if (hrefsplit.length>1) href += '#' + hrefsplit[1];
			a.href = href;
		});

		// prettify code
		sd.getElements('pre').addClass('prettyprint');
		prettyPrint();

		// scroll to top
		window.scrollTo(0, 0);
	},

	disposeIframes: function(){
		setTimeout(function(){
			$$('.md-iframe').dispose();
		}, 100);
	},

};

window.addEvent('domready', Docs.start);