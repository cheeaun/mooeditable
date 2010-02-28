/*
---

script: MooEditable.Charmap.js

description: Extends MooEditable with a characters map

license: MIT-style license

authors:
- Ryan Mitchell

requires:
# - MooEditable
# - MooEditable.UI
# - MooEditable.Actions

provides: [MooEditable.UI.CharacterDialog, MooEditable.Actions.charmap]

usage: |
  Add the following tags in your html
  <link rel="stylesheet" href="MooEditable.css">
  <link rel="stylesheet" href="MooEditable.Charmap.css">
  <script src="mootools.js"></script>
  <script src="MooEditable.js"></script>
  <script src="MooEditable.Charmap.js"></script>

  <script>
  window.addEvent('domready', function(){
    var mooeditable = $('textarea-1').mooEditable({
      actions: 'bold italic underline strikethrough | charmap | toggleview',
      externalCSS: '../../Assets/MooEditable/Editable.css'
    });
  });
  </script>

...
*/

MooEditable.Actions.Settings.charmap = {
	chars: [
		['&nbsp;', '&#160;'],
		['&amp;', '&#38;'],
		['&quot;', '&#34;'],
		['&cent;', '&#162;'],
		['&euro;', '&#8364;'],
		['&pound;', '&#163;'],
		['&yen;', '&#165;'],
		['&copy;', '&#169;'],
		['&reg;', '&#174;'],
		['&trade;', '&#8482;'],
		['&permil;', '&#8240;'],
		['&micro;', '&#181;'],
		['&middot;', '&#183;'],
		['&bull;', '&#8226;'],
		['&hellip;', '&#8230;'],
		['&prime;', '&#8242;'],
		['&Prime;', '&#8243;'],
		['&sect;', '&#167;'],
		['&para;', '&#182;'],
		['&szlig;', '&#223;'],
		['&lsaquo;', '&#8249;'],
		['&rsaquo;', '&#8250;'],
		['&laquo;', '&#171;'],
		['&raquo;', '&#187;'],
		['&lsquo;', '&#8216;'],
		['&rsquo;', '&#8217;'],
		['&ldquo;', '&#8220;'],
		['&rdquo;', '&#8221;'],
		['&sbquo;', '&#8218;'],
		['&bdquo;', '&#8222;'],
		['&lt;', '&#60;'],
		['&gt;', '&#62;'],
		['&le;', '&#8804;'],
		['&ge;', '&#8805;'],
		['&ndash;', '&#8211;'],
		['&mdash;', '&#8212;'],
		['&macr;', '&#175;'],
		['&oline;', '&#8254;'],
		['&curren;', '&#164;'],
		['&brvbar;', '&#166;'],
		['&uml;', '&#168;'],
		['&iexcl;', '&#161;'],
		['&iquest;', '&#191;'],
		['&circ;', '&#710;'],
		['&tilde;', '&#732;'],
		['&deg;', '&#176;'],
		['&minus;', '&#8722;'],
		['&plusmn;', '&#177;'],
		['&divide;', '&#247;'],
		['&frasl;', '&#8260;'],
		['&times;', '&#215;'],
		['&sup1;', '&#185;'],
		['&sup2;', '&#178;'],
		['&sup3;', '&#179;'],
		['&frac14;', '&#188;'],
		['&frac12;', '&#189;'],
		['&frac34;', '&#190;'],
		['&fnof;', '&#402;'],
		['&int;', '&#8747;'],
		['&sum;', '&#8721;'],
		['&infin;', '&#8734;'],
		['&radic;', '&#8730;'],
		['&sim;', '&#8764;'],
		['&cong;', '&#8773;'],
		['&asymp;', '&#8776;'],
		['&ne;', '&#8800;'],
		['&equiv;', '&#8801;'],
		['&isin;', '&#8712;'],
		['&notin;', '&#8713;'],
		['&ni;', '&#8715;'],
		['&prod;', '&#8719;'],
		['&and;', '&#8743;'],
		['&or;', '&#8744;'],
		['&not;', '&#172;'],
		['&cap;', '&#8745;'],
		['&cup;', '&#8746;'],
		['&part;', '&#8706;'],
		['&forall;', '&#8704;'],
		['&exist;', '&#8707;'],
		['&empty;', '&#8709;'],
		['&nabla;', '&#8711;'],
		['&lowast;', '&#8727;'],
		['&prop;', '&#8733;'],
		['&ang;', '&#8736;'],
		['&acute;', '&#180;'],
		['&cedil;', '&#184;'],
		['&ordf;', '&#170;'],
		['&ordm;', '&#186;'],
		['&dagger;', '&#8224;'],
		['&Dagger;', '&#8225;'],
		['&Agrave;', '&#192;'],
		['&Aacute;', '&#193;'],
		['&Acirc;', '&#194;'],
		['&Atilde;', '&#195;'],
		['&Auml;', '&#196;'],
		['&Aring;', '&#197;'],
		['&AElig;', '&#198;'],
		['&Ccedil;', '&#199;'],
		['&Egrave;', '&#200;'],
		['&Eacute;', '&#201;'],
		['&Ecirc;', '&#202;'],
		['&Euml;', '&#203;'],
		['&Igrave;', '&#204;'],
		['&Iacute;', '&#205;'],
		['&Icirc;', '&#206;'],
		['&Iuml;', '&#207;'],
		['&ETH;', '&#208;'],
		['&Ntilde;', '&#209;'],
		['&Ograve;', '&#210;'],
		['&Oacute;', '&#211;'],
		['&Ocirc;', '&#212;'],
		['&Otilde;', '&#213;'],
		['&Ouml;', '&#214;'],
		['&Oslash;', '&#216;'],
		['&OElig;', '&#338;'],
		['&Scaron;', '&#352;'],
		['&Ugrave;', '&#217;'],
		['&Uacute;', '&#218;'],
		['&Ucirc;', '&#219;'],
		['&Uuml;', '&#220;'],
		['&Yacute;', '&#221;'],
		['&Yuml;', '&#376;'],
		['&THORN;', '&#222;'],
		['&agrave;', '&#224;'],
		['&aacute;', '&#225;'],
		['&acirc;', '&#226;'],
		['&atilde;', '&#227;'],
		['&auml;', '&#228;'],
		['&aring;', '&#229;'],
		['&aelig;', '&#230;'],
		['&ccedil;', '&#231;'],
		['&egrave;', '&#232;'],
		['&eacute;', '&#233;'],
		['&ecirc;', '&#234;'],
		['&euml;', '&#235;'],
		['&igrave;', '&#236;'],
		['&iacute;', '&#237;'],
		['&icirc;', '&#238;'],
		['&iuml;', '&#239;'],
		['&eth;', '&#240;'],
		['&ntilde;', '&#241;'],
		['&ograve;', '&#242;'],
		['&oacute;', '&#243;'],
		['&ocirc;', '&#244;'],
		['&otilde;', '&#245;'],
		['&ouml;', '&#246;'],
		['&oslash;', '&#248;'],
		['&oelig;', '&#339;'],
		['&scaron;', '&#353;'],
		['&ugrave;', '&#249;'],
		['&uacute;', '&#250;'],
		['&ucirc;', '&#251;'],
		['&uuml;', '&#252;'],
		['&yacute;', '&#253;'],
		['&thorn;', '&#254;'],
		['&yuml;', '&#255;'],
		['&Alpha;', '&#913;'],
		['&Beta;', '&#914;'],
		['&Gamma;', '&#915;'],
		['&Delta;', '&#916;'],
		['&Epsilon;', '&#917;'],
		['&Zeta;', '&#918;'],
		['&Eta;', '&#919;'],
		['&Theta;', '&#920;'],
		['&Iota;', '&#921;'],
		['&Kappa;', '&#922;'],
		['&Lambda;', '&#923;'],
		['&Mu;', '&#924;'],
		['&Nu;', '&#925;'],
		['&Xi;', '&#926;'],
		['&Omicron;', '&#927;'],
		['&Pi;', '&#928;'],
		['&Rho;', '&#929;'],
		['&Sigma;', '&#931;'],
		['&Tau;', '&#932;'],
		['&Upsilon;', '&#933;'],
		['&Phi;', '&#934;'],
		['&Chi;', '&#935;'],
		['&Psi;', '&#936;'],
		['&Omega;', '&#937;'],
		['&alpha;', '&#945;'],
		['&beta;', '&#946;'],
		['&gamma;', '&#947;'],
		['&delta;', '&#948;'],
		['&epsilon;', '&#949;'],
		['&zeta;', '&#950;'],
		['&eta;', '&#951;'],
		['&theta;', '&#952;'],
		['&iota;', '&#953;'],
		['&kappa;', '&#954;'],
		['&lambda;', '&#955;'],
		['&mu;', '&#956;'],
		['&nu;', '&#957;'],
		['&xi;', '&#958;'],
		['&omicron;', '&#959;'],
		['&pi;', '&#960;'],
		['&rho;', '&#961;'],
		['&sigmaf;', '&#962;'],
		['&sigma;', '&#963;'],
		['&tau;', '&#964;'],
		['&upsilon;', '&#965;'],
		['&phi;', '&#966;'],
		['&chi;', '&#967;'],
		['&psi;', '&#968;'],
		['&omega;', '&#969;'],
		['&alefsym;', '&#8501;'],
		['&piv;', '&#982;'],
		['&real;', '&#8476;'],
		['&thetasym;', '&#977;'],
		['&upsih;', '&#978;'],
		['&weierp;', '&#8472;'],
		['&image;', '&#8465;'],
		['&larr;', '&#8592;'],
		['&uarr;', '&#8593;'],
		['&rarr;', '&#8594;'],
		['&darr;', '&#8595;'],
		['&harr;', '&#8596;'],
		['&crarr;', '&#8629;'],
		['&lArr;', '&#8656;'],
		['&uArr;', '&#8657;'],
		['&rArr;', '&#8658;'],
		['&dArr;', '&#8659;'],
		['&hArr;', '&#8660;'],
		['&there4;', '&#8756;'],
		['&sub;', '&#8834;'],
		['&sup;', '&#8835;'],
		['&nsub;', '&#8836;'],
		['&sube;', '&#8838;'],
		['&supe;', '&#8839;'],
		['&oplus;', '&#8853;'],
		['&otimes;', '&#8855;'],
		['&perp;', '&#8869;'],
		['&sdot;', '&#8901;'],
		['&lceil;', '&#8968;'],
		['&rceil;', '&#8969;'],
		['&lfloor;', '&#8970;'],
		['&rfloor;', '&#8971;'],
		['&lang;', '&#9001;'],
		['&rang;', '&#9002;'],
		['&loz;', '&#9674;'],
		['&spades;', '&#9824;'],
		['&clubs;', '&#9827;'],
		['&hearts;', '&#9829;'],
		['&diams;', '&#9830;']
	]
};

MooEditable.lang.set({
	insertCustomCharacter: 'Insert custom character',
	insertCharacter: 'Insert character'
});

MooEditable.UI.CharacterDialog = function(editor){
	var html = MooEditable.lang.get('insertCharacter') + ' <select class="char">';
	var chars = MooEditable.Actions.Settings.charmap.chars;
	for (var i=0, len=chars.length; i<len; i++) {
		html += '<option data-code="' + chars[i][0] + '">' + chars[i][1] + '</option>';
	}
	html += '</select>'
		+ '<button class="dialog-button dialog-ok-button">' + MooEditable.lang.get('ok') + '</button>'
		+ '<button class="dialog-button dialog-cancel-button">' + MooEditable.lang.get('cancel') + '</button>';
	return new MooEditable.UI.Dialog(html, {
		'class': 'mooeditable-charmap-dialog',
		onClick: function(e){
			if (e.target.tagName.toLowerCase() == 'button') e.preventDefault();
			var button = document.id(e.target);
			if (button.hasClass('dialog-cancel-button')){
				this.close();
			} else if (button.hasClass('dialog-ok-button')){
				this.close();
				var sel = button.getPrevious('select.char');
				var div = new Element('div').set('html', sel.options[sel.selectedIndex].getProperty('data-code').trim());
				editor.selection.insertContent(div.get('html'));
			}
		}
	});
};

MooEditable.Actions.extend({
	
	charmap: {
		title: MooEditable.lang.get('insertCustomCharacter'),
		dialogs: {
			prompt: function(editor){
				return MooEditable.UI.CharacterDialog(editor);
			}
		},
		command: function() {
			this.dialogs.charmap.prompt.open();
		},
		events: {
			toggleView: function(){
				if (this.mode == 'textarea'){
					var s = this.textarea.get('value');
					// when switching from iframe to textarea, we need to convert special symbols to html entities
					MooEditable.Actions.Settings.charmap.chars.each(function(e){
						if (!['&amp;', '&gt;', '&lt;', '&quot;', '&nbsp;'].contains(e[0])){
							var r = new RegExp(String.fromCharCode(parseInt(e[1].replace('&#', '').replace(';', ''))), 'g');
							s = s.replace(r, e[0]);
						}
					}, this);
					this.textarea.set('value', s);
				}
			}
		}
	}
	
});
