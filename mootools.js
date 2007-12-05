//MooTools, My Object Oriented Javascript Tools. Copyright (c) 2006-2007 Valerio Proietti, <http://mad4milk.net>, MIT Style License.

var MooTools = {
	'version': '1.2dev',
	'build': '1295'
};

var Native = function(options){
	options = options || {};

	var afterImplement = options.afterImplement || function(){};
	var generics = options.generics;
	generics = (generics !== false);
	var legacy = options.legacy;
	var initialize = options.initialize;
	var protect = options.protect;
	var name = options.name;

	var object = initialize || legacy;

	object.constructor = Native;
	object.$family = {name: 'native'};
	if (legacy && initialize) object.prototype = legacy.prototype;
	object.prototype.constructor = object;

	if (name){
		var family = name.toLowerCase();
		object.prototype.$family = {name: family};
		Native.typize(object, family);
	}

	var add = function(obj, name, method, force){
		if (!protect || force || !obj.prototype[name]) obj.prototype[name] = method;
		if (generics) Native.genericize(obj, name, protect);
		afterImplement.call(obj, name, method);
		return obj;
	};

	object.implement = function(a1, a2, a3){
		if (typeof a1 == 'string') return add(this, a1, a2, a3);
		for (var p in a1) add(this, p, a1[p], a2);
		return this;
	};

	object.alias = function(existing, property, force){
		existing = this.prototype[existing];
		if (existing) add(this, property, existing, force);
		return this;
	};

	return object;
};

Native.implement = function(objects, properties){
	for (var i = 0, l = objects.length; i < l; i++) objects[i].implement(properties);
};

Native.genericize = function(object, property, check){
	if ((!check || !object[property]) && typeof object.prototype[property] == 'function') object[property] = function(){
		var args = Array.prototype.slice.call(arguments);
		return object.prototype[property].apply(args.shift(), args);
	};
};

Native.typize = function(object, family){
	if (!object.type) object.type = function(item){
		return ($type(item) === family);
	};
};

(function(objects){
	for (var name in objects) Native.typize(objects[name], name.toLowerCase());
})({'Boolean': Boolean, 'Native': Native, 'Object': Object});

(function(objects){
	for (var name in objects) new Native({name: name, initialize: objects[name], protect: true});
})({'String': String, 'Function': Function, 'Number': Number, 'Array': Array, 'RegExp': RegExp, 'Date': Date});

(function(object, methods){
	for (var i = 0, l = methods.length; i < l; i++) Native.genericize(object, methods[i], true);
	return arguments.callee;
})
(Array, ['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift', 'concat', 'join', 'slice', 'toString', 'valueOf', 'indexOf', 'lastIndexOf'])
(String, ['charAt', 'charCodeAt', 'concat', 'indexOf', 'lastIndexOf', 'match', 'replace', 'search', 'slice', 'split', 'substr', 'substring', 'toLowerCase', 'toUpperCase', 'valueOf']);

function $chk(obj){
	return !!(obj || obj === 0);
};

function $clear(timer){
	clearTimeout(timer);
	clearInterval(timer);
	return null;
};

function $defined(obj){
	return (obj != undefined);
};

function $empty(){};

function $arguments(i){
	return function(){
		return arguments[i];
	};
};

function $lambda(value){
	return (typeof value == 'function') ? value : function(){
		return value;
	};
};

function $extend(original, extended){
	for (var key in (extended || {})) original[key] = extended[key];
	return original;
};

function $unlink(object){
	if ($type(object) != 'object') return object;
	var unlinked = {};
	for (var p in object) unlinked[p] = $unlink(object[p]);
	return unlinked;
};

function $merge(){
	var mix = {};
	for (var i = 0, l = arguments.length; i < l; i++){
		var object = arguments[i];
		if ($type(object) != 'object') continue;
		for (var key in object){
			var op = object[key], mp = mix[key];
			mix[key] = (mp && $type(op) == 'object' && $type(mp) == 'object') ? $merge(mp, op) : $unlink(op);
		}
	}
	return mix;
};

function $pick(){
	for (var i = 0, l = arguments.length; i < l; i++){
		if ($defined(arguments[i])) return arguments[i];
	}
	return null;
};

function $random(min, max){
	return Math.floor(Math.random() * (max - min + 1) + min);
};

function $splat(obj){
	var type = $type(obj);
	return (type) ? ((type != 'array' && type != 'arguments') ? [obj] : obj) : [];
};

var $time = Date.now || function(){
	return new Date().getTime();
};

function $try(fn, bind, args){
	try {
		return fn.apply(bind, $splat(args));
	} catch(e){
		return false;
	}
};

function $type(obj){
	if (obj == undefined) return false;
	if (obj.$family) return (obj.$family.name == 'number' && !isFinite(obj)) ? false : obj.$family.name;
	if (obj.nodeName){
		switch (obj.nodeType){
			case 1: return 'element';
			case 3: return (/\S/).test(obj.nodeValue) ? 'textnode' : 'whitespace';
		}
	} else if (typeof obj.length == 'number'){
		return (obj.callee) ? 'arguments' : 'collection';
	}
	return typeof obj;
};

var Hash = new Native({

	name: 'Hash',

	initialize: function(object){
		if ($type(object) == 'hash') object = $unlink(object.getClean());
		for (var key in object){
			if (!this[key]) this[key] = object[key];
		}
		return this;
	}

});

Hash.implement({

	getLength: function(){
		var length = 0;
		for (var key in this){
			if (this.hasOwnProperty(key)) length++;
		}
		return length;
	},

	forEach: function(fn, bind){
		for (var key in this){
			if (this.hasOwnProperty(key)) fn.call(bind, this[key], key, this);
		}
	},

	getClean: function(){
		var clean = {};
		for (var key in this){
			if (this.hasOwnProperty(key)) clean[key] = this[key];
		}
		return clean;
	}

});

Hash.alias('forEach', 'each');

function $H(object){
	return new Hash(object);
};

Array.implement({

	forEach: function(fn, bind){
		for (var i = 0, l = this.length; i < l; i++) fn.call(bind, this[i], i, this);
	}

});

Array.alias('forEach', 'each');

function $A(iterable){
	if ($type(iterable) == 'collection'){
		var array = [];
		for (var i = 0, l = iterable.length; i < l; i++) array[i] = iterable[i];
		return array;
	}
	return Array.prototype.slice.call(iterable);
};

function $each(iterable, fn, bind){
	var type = $type(iterable);
	((type == 'arguments' || type == 'collection' || type == 'array') ? Array : Hash).each(iterable, fn, bind);
};

var Browser = new Hash({
	Engine: {'name': 'unknown', 'version': ''},
	Platform: {'name': (navigator.platform.match(/mac|win|linux|nix/i) || ['other'])[0].toLowerCase()}, 
	Features: {'xhr': !!(window.XMLHttpRequest), 'xpath': !!(document.evaluate)}
});

if (window.opera) Browser.Engine.name = 'presto';
else if (window.ActiveXObject) Browser.Engine = {'name': 'trident', 'version': (Browser.Features.xhr) ? 5 : 4};
else if (!navigator.taintEnabled) Browser.Engine = {'name': 'webkit', 'version': (Browser.Features.xpath) ? 420 : 419};
else if (document.getBoxObjectFor != null) Browser.Engine.name = 'gecko';
Browser.Engine[Browser.Engine.name] = Browser.Engine[Browser.Engine.name + Browser.Engine.version] = true;
Browser.Platform[Browser.Platform.name] = true;

function $exec(text){
	if (!text) return text;
	if (window.execScript){
		window.execScript(text);
	} else {
		var script = document.createElement('script');
		script.setAttribute('type', 'text/javascript');
		script.text = text;
		document.head.appendChild(script);
		document.head.removeChild(script);
	}
	return text;
};

Native.UID = 0;

var Window = new Native({

	name: 'Window',

	legacy: window.Window,

	initialize: function(win){
		if (!win.Element){
			win.Element = $empty;
			if (Browser.Engine.webkit) win.document.createElement("iframe");
			win.Element.prototype = (Browser.Engine.webkit) ? window["[[DOMElement.prototype]]"] : {};
		}
		win.uid = Native.UID++;
		return $extend(win, Window.Prototype);
	},

	afterImplement: function(property, value){
		window[property] = Window.Prototype[property] = value;
	}

});

Window.Prototype = {$family: {name: 'window'}};

new Window(window);

var Document = new Native({

	name: 'Document',

	legacy: window.Document,

	initialize: function(doc){
		doc.head = doc.getElementsByTagName('head')[0];
		doc.html = doc.getElementsByTagName('html')[0];
		doc.window = doc.defaultView || doc.parentWindow;
		if (Browser.Engine.trident4) $try(function(){
			doc.execCommand("BackgroundImageCache", false, true);
		});
		doc.uid = Native.UID++;
		return $extend(doc, Document.Prototype);
	},

	afterImplement: function(property, value){
		document[property] = Document.Prototype[property] = value;
	}

});

Document.Prototype = {$family: {name: 'document'}};

new Document(document);

Array.implement({

	every: function(fn, bind){
		for (var i = 0, l = this.length; i < l; i++){
			if (!fn.call(bind, this[i], i, this)) return false;
		}
		return true;
	},

	filter: function(fn, bind){
		var results = [];
		for (var i = 0, l = this.length; i < l; i++){
			if (fn.call(bind, this[i], i, this)) results.push(this[i]);
		}
		return results;
	},

	indexOf: function(item, from){
		var len = this.length;
		for (var i = (from < 0) ? Math.max(0, len + from) : from || 0; i < len; i++){
			if (this[i] === item) return i;
		}
		return -1;
	},

	map: function(fn, bind){
		var results = [];
		for (var i = 0, l = this.length; i < l; i++) results[i] = fn.call(bind, this[i], i, this);
		return results;
	},

	some: function(fn, bind){
		for (var i = 0, l = this.length; i < l; i++){
			if (fn.call(bind, this[i], i, this)) return true;
		}
		return false;
	},

	associate: function(keys){
		var obj = {}, length = Math.min(this.length, keys.length);
		for (var i = 0; i < length; i++) obj[keys[i]] = this[i];
		return obj;
	},

	link: function(object){
		var result = {};
		for (var i = 0, l = this.length; i < l; i++){
			for (var key in object){
				if (object[key](this[i])){
					result[key] = this[i];
					delete object[key];
					break;
				}
			}
		}
		return result;
	},

	contains: function(item, from){
		return this.indexOf(item, from) != -1;
	},

	extend: function(array){
		for (var i = 0, j = array.length; i < j; i++) this.push(array[i]);
		return this;
	},

	getLast: function(){
		return (this.length) ? this[this.length - 1] : null;
	},

	getRandom: function(){
		return (this.length) ? this[$random(0, this.length - 1)] : null;
	},

	include: function(item){
		if (!this.contains(item)) this.push(item);
		return this;
	},

	merge: function(array){
		for (var i = 0, l = array.length; i < l; i++) this.include(array[i]);
		return this;
	},

	remove: function(item){
		for (var i = this.length; i--; i){
			if (this[i] === item) this.splice(i, 1);
		}
		return this;
	},

	empty: function(){
		this.length = 0;
		return this;
	},

	flatten: function(){
		var array = [];
		for (var i = 0, l = this.length; i < l; i++){
			var type = $type(this[i]);
			if (!type) continue;
			array = array.concat((type == 'array' || type == 'collection' || type == 'arguments') ? Array.flatten(this[i]) : this[i]);
		}
		return array;
	},

	hexToRgb: function(array){
		if (this.length != 3) return null;
		var rgb = this.map(function(value){
			if (value.length == 1) value += value;
			return value.toInt(16);
		});
		return array ? rgb : 'rgb(' + rgb + ')';
	},

	rgbToHex: function(array){
		if (this.length < 3) return null;
		if (this.length == 4 && this[3] == 0 && !array) return 'transparent';
		var hex = [];
		for (var i = 0; i < 3; i++){
			var bit = (this[i] - 0).toString(16);
			hex.push((bit.length == 1) ? '0' + bit : bit);
		}
		return array ? hex : '#' + hex.join('');
	}

});

Function.implement({

	extend: function(properties){
		for (var property in properties) this[property] = properties[property];
		return this;
	},

	create: function(options){
		var self = this;
		options = options || {};
		return function(event){
			var args = options.arguments;
			args = $defined(args) ? $splat(args) : Array.slice(arguments, (options.event) ? 1 : 0);
			if (options.event) args = [event || window.event].extend(args);
			var returns = function(){
				return self.apply(options.bind || null, args);
			};
			if (options.delay) return setTimeout(returns, options.delay);
			if (options.periodical) return setInterval(returns, options.periodical);
			if (options.attempt) return $try(returns);
			return returns();
		};
	},

	pass: function(args, bind){
		return this.create({'arguments': args, 'bind': bind});
	},

	attempt: function(args, bind){
		return this.create({'arguments': args, 'bind': bind, 'attempt': true})();
	},

	bind: function(bind, args){
		return this.create({'bind': bind, 'arguments': args});
	},

	bindWithEvent: function(bind, args){
		return this.create({'bind': bind, 'event': true, 'arguments': args});
	},

	delay: function(delay, bind, args){
		return this.create({'delay': delay, 'bind': bind, 'arguments': args})();
	},

	periodical: function(interval, bind, args){
		return this.create({'periodical': interval, 'bind': bind, 'arguments': args})();
	},

	run: function(args, bind){
		return this.apply(bind, $splat(args));
	}

});

Number.implement({

	limit: function(min, max){
		return Math.min(max, Math.max(min, this));
	},

	round: function(precision){
		precision = Math.pow(10, precision || 0);
		return Math.round(this * precision) / precision;
	},

	times: function(fn, bind){
		for (var i = 0; i < this; i++) fn.call(bind, i, this);
	},

	toFloat: function(){
		return parseFloat(this);
	},

	toInt: function(base){
		return parseInt(this, base || 10);
	}

});

Number.alias('times', 'each');

(function(math){
	var methods = {};
	math.each(function(name){
		if (!Number[name]) methods[name] = function(){
			return Math[name].apply(null, [this].concat($A(arguments)));
		};
	});
	Number.implement(methods);
})(['abs', 'acos', 'asin', 'atan', 'atan2', 'ceil', 'cos', 'exp', 'floor', 'log', 'max', 'min', 'pow', 'sin', 'sqrt', 'tan']);

String.implement({

	test: function(regex, params){
		return (($type(regex) == 'string') ? new RegExp(regex, params) : regex).test(this);
	},

	contains: function(string, separator){
		return (separator) ? (separator + this + separator).indexOf(separator + string + separator) > -1 : this.indexOf(string) > -1;
	},

	trim: function(){
		return this.replace(/^\s+|\s+$/g, '');
	},

	clean: function(){
		return this.replace(/\s{2,}/g, ' ').trim();
	},

	camelCase: function(){
		return this.replace(/-\D/g, function(match){
			return match.charAt(1).toUpperCase();
		});
	},

	hyphenate: function(){
		return this.replace(/[A-Z]/g, function(match){
			return ('-' + match.charAt(0).toLowerCase());
		});
	},

	capitalize: function(){
		return this.replace(/\b[a-z]/g, function(match){
			return match.toUpperCase();
		});
	},

	escapeRegExp: function(){
		return this.replace(/([-.*+?^${}()|[\]\/\\])/g, '\\$1');
	},

	toInt: function(base){
		return parseInt(this, base || 10);
	},

	toFloat: function(){
		return parseFloat(this);
	},

	hexToRgb: function(array){
		var hex = this.match(/^#?(\w{1,2})(\w{1,2})(\w{1,2})$/);
		return (hex) ? hex.slice(1).hexToRgb(array) : null;
	},

	rgbToHex: function(array){
		var rgb = this.match(/\d{1,3}/g);
		return (rgb) ? rgb.rgbToHex(array) : null;
	},

	stripScripts: function(option){
		var scripts = '';
		var text = this.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, function(){
			scripts += arguments[1] + '\n';
			return '';
		});
		if (option === true) $exec(scripts);
		else if ($type(option) == 'function') option(scripts, text);
		return text;
	}

});

Hash.implement({

	has: Object.prototype.hasOwnProperty,

	keyOf: function(value){
		for (var key in this){
			if (this.hasOwnProperty(key) && this[key] === value) return key;
		}
		return null;
	},

	hasValue: function(value){
		return (Hash.keyOf(this, value) !== null);
	},

	extend: function(properties){
		Hash.each(properties, function(value, key){
			Hash.set(this, key, value);
		}, this);
		return this;
	},

	merge: function(properties){
		Hash.each(properties, function(value, key){
			Hash.include(this, key, value);
		}, this);
		return this;
	},

	remove: function(key){
		if (this.hasOwnProperty(key)) delete this[key];
		return this;
	},

	get: function(key){
		return (this.hasOwnProperty(key)) ? this[key] : null;
	},

	set: function(key, value){
		if (!this[key] || this.hasOwnProperty(key)) this[key] = value;
		return this;
	},

	empty: function(){
		Hash.each(this, function(value, key){
			delete this[key];
		}, this);
		return this;
	},

	include: function(key, value){
		var k = this[key];
		if (!$defined(k)) this[key] = value;
		return this;
	},

	map: function(fn, bind){
		var results = new Hash;
		Hash.each(this, function(value, key){
			results.set(key, fn.call(bind, value, key, this));
		}, this);
		return results;
	},

	filter: function(fn, bind){
		var results = new Hash;
		Hash.each(this, function(value, key){
			if (fn.call(bind, value, key, this)) results.set(key, value);
		}, this);
		return results;
	},

	every: function(fn, bind){
		for (var key in this){
			if (this.hasOwnProperty(key) && !fn.call(bind, this[key], key)) return false;
		}
		return true;
	},

	some: function(fn, bind){
		for (var key in this){
			if (this.hasOwnProperty(key) && fn.call(bind, this[key], key)) return true;
		}
		return false;
	},

	getKeys: function(){
		var keys = [];
		Hash.each(this, function(value, key){
			keys.push(key);
		});
		return keys;
	},

	getValues: function(){
		var values = [];
		Hash.each(this, function(value){
			values.push(value);
		});
		return values;
	},

	toQueryString: function(){
		var queryString = [];
		Hash.each(this, function(value, key){
			$splat(value).each(function(val){
				queryString.push(key + '=' + encodeURIComponent(val));
			});
		});
		return queryString.join('&');
	}

});

Hash.alias('keyOf', 'indexOf').alias('hasValue', 'contains').alias('remove', 'erase');

var Class = new Native({

	name: 'Class',

	initialize: function(properties){

		properties = properties || {};

		var klass = function(){
			for (var property in this) this[property] = $unlink(this[property]);

			['Implements', 'Extends'].each(function(Property){
				if (!this[Property]) return;
				Class[Property](this, this[Property]);
				delete this[Property];
			}, this);

			this.constructor = klass;

			var self = (arguments[0] !== $empty && this.initialize && $type(this.initialize) == 'function') ? this.initialize.apply(this, arguments) : this;
			if (this.options && this.options.initialize) this.options.initialize.call(this);
			return self;
		};

		$extend(klass, this);
		klass.constructor = Class;
		klass.prototype = properties;
		return klass;
	}

});

Class.implement({

	implement: function(){
		Class.Implements(this.prototype, Array.slice(arguments));
		return this;
	}

});

Class.Implements = function(self, klasses){
	$splat(klasses).each(function(klass){
		$extend(self, ($type(klass) == 'class') ? new klass($empty) : klass);
	});
};

Class.Extends = function(self, klass){
	klass = new klass($empty);
	for (var property in klass){
		var kp = klass[property];
		var sp = self[property];
		self[property] = (function(previous, current){
			if ($defined(current) && previous != current){
				var type = $type(current);
				if (type != $type(previous)) return current;
				switch (type){
					case 'function': return function(){
						current.parent = this.parent = previous.bind(this);
						return current.apply(this, arguments);
					};
					case 'object': return $merge(previous, current);
					default: return current;
				}
			}
			return previous;
		})(kp, sp);
	}
};

Class.prototype.extend = function(properties){
	properties.Extends = this;
	return new Class(properties);
};

var Chain = new Class({

	chain: function(){
		this.$chain = (this.$chain || []).extend(arguments);
		return this;
	},

	callChain: function(){
		if (this.$chain && this.$chain.length) this.$chain.shift().apply(this, arguments);
		return this;
	},

	clearChain: function(){
		if (this.$chain) this.$chain.empty();
		return this;
	}

});

var Events = new Class({

	addEvent: function(type, fn, internal){
		if (fn != $empty){
			this.$events = this.$events || {};
			this.$events[type] = this.$events[type] || [];
			this.$events[type].include(fn);
			if (internal) fn.internal = true;
		}
		return this;
	},

	addEvents: function(events){
		for (var type in events) this.addEvent(type, events[type]);
		return this;
	},

	fireEvent: function(type, args, delay){
		if (!this.$events || !this.$events[type]) return this;
		this.$events[type].each(function(fn){
			fn.create({'bind': this, 'delay': delay, 'arguments': args})();
		}, this);
		return this;
	},

	removeEvent: function(type, fn){
		if (!this.$events || !this.$events[type]) return this;
		if (!fn.internal) this.$events[type].remove(fn);
		return this;
	},

	removeEvents: function(type){
		for (var e in this.$events){
			if (type && type != e) continue;
			var fns = this.$events[e];
			for (var i = fns.length; i--; i) this.removeEvent(e, fns[i]);
		}
		return this;
	}

});

var Options = new Class({

	setOptions: function(){
		this.options = $merge.run([this.options].extend(arguments));
		if (!this.addEvent) return this;
		for (var option in this.options){
			if ($type(this.options[option]) != 'function' || !(/^on[A-Z]/).test(option)) continue;
			this.addEvent(option, this.options[option]);
			delete this.options[option];
		}
		return this;
	}

});

Document.implement({

	newElement: function(tag, props){
		if (Browser.Engine.trident && props){
			['name', 'type', 'checked'].each(function(attribute){
				if (!props[attribute]) return;
				tag += ' ' + attribute + '="' + props[attribute] + '"';
				if (attribute != 'checked') delete props[attribute];
			});
			tag = '<' + tag + '>';
		}
		return $.element(this.createElement(tag)).set(props);
	},

	newTextNode: function(text){
		return this.createTextNode(text);
	},

	getDocument: function(){
		return this;
	},

	getWindow: function(){
		return this.defaultView || this.parentWindow;
	}

});

var Element = new Native({

	name: 'Element',

	legacy: window.Element,

	initialize: function(tag, props){
		var konstructor = Element.Constructors.get(tag);
		if (konstructor) return konstructor(props);
		if (typeof tag == 'string') return document.newElement(tag, props);
		return $(tag).set(props);
	},

	afterImplement: function(key, value){
		if (!Array[key]) Elements.implement(key, Elements.multi(key));
		Element.Prototype[key] = value;
	}

});

Element.Prototype = {$family: {name: 'element'}};

Element.Constructors = new Hash;

var IFrame = new Native({

	name: 'IFrame',

	generics: false,

	initialize: function(){
		Native.UID++;
		var params = Array.link(arguments, {properties: Object.type, iframe: $defined});
		var props = params.properties || {};
		var iframe = $(params.iframe) || false;
		var onload = props.onload || $empty;
		delete props.onload;
		props.id = props.name = $pick(props.id, props.name, iframe.id, iframe.name, 'IFrame_' + Native.UID);
		((iframe = iframe || new Element('iframe'))).set(props);
		var onFrameLoad = function(){
			var host = $try(function(){
				return iframe.contentWindow.location.host;
			});
			if (host && host == window.location.host){
				iframe.window = iframe.contentWindow;
				var win = new Window(iframe.window);
				var doc = new Document(iframe.window.document);
				$extend(win.Element.prototype, Element.Prototype);
			}
			onload.call(iframe.contentWindow);
		};
		(!window.frames[props.id]) ? iframe.addListener('load', onFrameLoad) : onFrameLoad();
		return iframe;
	}

});

var Elements = new Native({

	initialize: function(elements, options){
		options = $extend({ddup: true, cash: true}, options);
		elements = elements || [];
		if (options.ddup || options.cash){
			var uniques = {};
			var returned = [];
			for (var i = 0, l = elements.length; i < l; i++){
				var el = $.element(elements[i], !options.cash);
				if (options.ddup){
					if (uniques[el.uid]) continue;
					uniques[el.uid] = true;
				}
				returned.push(el);
			}
			elements = returned;
		}
		return (options.cash) ? $extend(elements, this) : elements;
	}

});

Elements.implement({

	filterBy: function(filter){
		if (!filter) return this;
		return new Elements(this.filter(($type(filter) == 'string') ? function(item){
			return item.match(filter);
		} : filter));
	}

});

Elements.multi = function(property){
	return function(){
		var items = [];
		var elements = true;
		for (var i = 0, j = this.length; i < j; i++){
			var returns = this[i][property].apply(this[i], arguments);
			items.push(returns);
			if (elements) elements = ($type(returns) == 'element');
		}
		return (elements) ? new Elements(items) : items;
	};
};

Window.implement({

	$: function(el, notrash){
		if (el && el.$attributes) return el;
		var type = $type(el);
		return ($[type]) ? $[type](el, notrash, this.document) : null;
	},

	$$: function(selector){
		if (arguments.length == 1 && typeof selector == 'string') return this.document.getElements(selector);
		var elements = [];
		var args = Array.flatten(arguments);
		for (var i = 0, l = args.length; i < l; i++){
			var item = args[i];
			switch ($type(item)){
				case 'element': item = [item]; break;
				case 'string': item = this.document.getElements(item, true); break;
				default: item = false;
			}
			if (item) elements.extend(item);
		}
		return new Elements(elements);
	},

	getDocument: function(){
		return this.document;
	},

	getWindow: function(){
		return this;
	}

});

$.string = function(id, notrash, doc){
	id = doc.getElementById(id);
	return (id) ? $.element(id, notrash) : null;
};

$.element = function(el, notrash){
	el.uid = el.uid || [Native.UID++];
	if (!notrash && Garbage.collect(el) && !el.$family) $extend(el, Element.Prototype);
	return el;
};

$.textnode = $.window = $.document = $arguments(0);

Native.implement([Element, Document], {

	getElement: function(selector, notrash){
		return $(this.getElements(selector, true)[0] || null, notrash);
	},

	getElements: function(tags, nocash){
		tags = tags.split(',');
		var elements = [];
		var ddup = (tags.length > 1);
		tags.each(function(tag){
			var partial = this.getElementsByTagName(tag.trim());
			(ddup) ? elements.extend(partial) : elements = partial;
		}, this);
		return new Elements(elements, {ddup: ddup, cash: !nocash});
	}

});

Element.Storage = {

	get: function(uid){
		return (this[uid] = this[uid] || {});
	}

};

Element.Inserters = new Hash({

	before: function(context, element){
		if (element.parentNode) element.parentNode.insertBefore(context, element);
	},

	after: function(context, element){
		if (!element.parentNode) return;
		var next = element.nextSibling;
		(next) ? element.parentNode.insertBefore(context, next) : element.parentNode.appendChild(context);
	},

	bottom: function(context, element){
		element.appendChild(context);
	},

	top: function(context, element){
		var first = element.firstChild;
		(first) ? element.insertBefore(context, first) : element.appendChild(context);
	}

});

Element.Inserters.inside = Element.Inserters.bottom;

Element.implement({

	getDocument: function(){
		return this.ownerDocument;
	},

	getWindow: function(){
		return this.ownerDocument.getWindow();
	},

	getElementById: function(id, nocash){
		var el = this.ownerDocument.getElementById(id);
		if (!el) return null;
		for (var parent = el.parentNode; parent != this; parent = parent.parentNode){
			if (!parent) return null;
		}
		return $.element(el, nocash);
	},

	set: function(prop, value){
		switch ($type(prop)){
			case 'object':
				for (var p in prop) this.set(p, prop[p]);
				break;
			case 'string':
				var property = Element.Properties.get(prop);
				(property && property.set) ? property.set.apply(this, Array.slice(arguments, 1)) : this.setProperty(prop, value);
		}
		return this;
	},

	get: function(prop){
		var property = Element.Properties.get(prop);
		return (property && property.get) ? property.get.apply(this, Array.slice(arguments, 1)) : this.getProperty(prop);
	},

	erase: function(prop){
		var property = Element.Properties.get(prop);
		(property && property.erase) ? property.erase.apply(this, Array.slice(arguments, 1)) : this.removeProperty(prop);
		return this;
	},

	match: function(tag){
		return (!tag || Element.get(this, 'tag') == tag);
	},

	inject: function(el, where){
		Element.Inserters.get(where || 'bottom')(this, $(el, true));
		return this;
	},

	wraps: function(el, where){
		el = $(el, true);
		return this.replaces(el).grab(el);
	},

	grab: function(el, where){
		Element.Inserters.get(where || 'bottom')($(el, true), this);
		return this;
	},

	appendText: function(text, where){
		return this.grab(this.getDocument().newTextNode(text), where);
	},

	adopt: function(){
		Array.flatten(arguments).each(function(element){
			this.appendChild($(element, true));
		}, this);
		return this;
	},

	dispose: function(){
		return this.parentNode.removeChild(this);
	},

	clone: function(contents){
		var temp = new Element('div').grab(this.cloneNode(contents !== false));
		Array.each(temp.getElementsByTagName('*'), function(element){
			if (element.id) element.removeAttribute('id');
		});
		return new Element('div').set('html', temp.innerHTML).getFirst();
	},

	replaces: function(el){
		el = $(el, true);
		el.parentNode.replaceChild(this, el);
		return this;
	},

	hasClass: function(className){
		return this.className.contains(className, ' ');
	},

	addClass: function(className){
		if (!this.hasClass(className)) this.className = (this.className + ' ' + className).clean();
		return this;
	},

	removeClass: function(className){
		this.className = this.className.replace(new RegExp('(^|\\s)' + className + '(?:\\s|$)'), '$1').clean();
		return this;
	},

	toggleClass: function(className){
		return this.hasClass(className) ? this.removeClass(className) : this.addClass(className);
	},

	getComputedStyle: function(property){
		var result = false;
		if (this.currentStyle) result = this.currentStyle[property.camelCase()];
		else result = this.getWindow().getComputedStyle(this, null).getPropertyValue([property.hyphenate()]);
		return result;
	},

	empty: function(){
		var elements = $A(this.getElementsByTagName('*'));
		elements.each(function(element){
			$try(Element.prototype.dispose, element);
		});
		Garbage.trash(elements);
		$try(Element.prototype.set, this, ['html', '']);
		return this;
	},

	destroy: function(){
		Garbage.kill(this.empty().dispose());
		return null;
	},

	toQueryString: function(){
		var queryString = [];
		this.getElements('input, select, textarea', true).each(function(el){
			var name = el.name, type = el.type, value = Element.get(el, 'value');
			if (value === false || !name || el.disabled) return;
			$splat(value).each(function(val){
				queryString.push(name + '=' + encodeURIComponent(val));
			});
		});
		return queryString.join('&');
	},

	getProperty: function(attribute){
		var EA = Element.Attributes, key = EA.Props[attribute];
		var value = (key) ? this[key] : this.getAttribute(attribute);
		return (EA.Bools[attribute]) ? !!value : value;
	},

	getProperties: function(){
		var args = $A(arguments);
		return args.map(function(attr){
			return this.getProperty(attr);
		}, this).associate(args);
	},

	setProperty: function(attribute, value){
		var EA = Element.Attributes, key = EA.Props[attribute], hasValue = $defined(value);
		if (key && EA.Bools[attribute]) value = (value || !hasValue) ? true : false;
		else if (!hasValue) return this.removeProperty(attribute);
		(key) ? this[key] = value : this.setAttribute(attribute, value);
		return this;
	},

	setProperties: function(attributes){
		for (var attribute in attributes) this.setProperty(attribute, attributes[attribute]);
		return this;
	},

	removeProperty: function(attribute){
		var EA = Element.Attributes, key = EA.Props[attribute], isBool = (key && EA.Bools[attribute]);
		(key) ? this[key] = (isBool) ? false : '' : this.removeAttribute(attribute);
		return this;
	},

	removeProperties: function(){
		Array.each(arguments, this.removeProperty, this);
		return this;
	}

});

(function(){

var walk = function(element, walk, start, match, all, nocash){
	var el = element[start || walk];
	var elements = [];
	while (el){
		if (el.nodeType == 1 && Element.match(el, match)){
			elements.push(el);
			if (!all) break;
		}
		el = el[walk];
	}
	return (all) ? new Elements(elements, {ddup: false, cash: !nocash}) : $(elements[0], nocash);
};

Element.implement({

	getPrevious: function(match, nocash){
		return walk(this, 'previousSibling', null, match, false, nocash);
	},

	getAllPrevious: function(match, nocash){
		return walk(this, 'previousSibling', null, match, true, nocash);
	},

	getNext: function(match, nocash){
		return walk(this, 'nextSibling', null, match, false, nocash);
	},

	getAllNext: function(match, nocash){
		return walk(this, 'nextSibling', null, match, true, nocash);
	},

	getFirst: function(match, nocash){
		return walk(this, 'nextSibling', 'firstChild', match, false, nocash);
	},

	getLast: function(match, nocash){
		return walk(this, 'previousSibling', 'lastChild', match, false, nocash);
	},

	getParent: function(match, nocash){
		return walk(this, 'parentNode', null, match, false, nocash);
	},

	getParents: function(match, nocash){
		return walk(this, 'parentNode', null, match, true, nocash);
	},

	getChildren: function(match, nocash){
		return walk(this, 'nextSibling', 'firstChild', match, true, nocash);
	},

	hasChild: function(el){
		if (!(el = $(el, true))) return false;
		return Element.getParents(el, this.get('tag'), true).contains(this);
	}

});

})();

Element.alias('dispose', 'remove').alias('getLast', 'getLastChild');

Element.Properties = new Hash;

Element.Properties.style = {

	set: function(style){
		this.style.cssText = style;
	},

	get: function(){
		return this.style.cssText;
	},

	erase: function(){
		this.style.cssText = '';
	}

};

Element.Properties.value = {get: function(){
	switch (Element.get(this, 'tag')){
		case 'select':
			var values = [];
			Array.each(this.options, function(option){
				if (option.selected) values.push(option.value);
			});
			return (this.multiple) ? values : values[0];
		case 'input': if (['checkbox', 'radio'].contains(this.type) && !this.checked) return false;
		default: return $pick(this.value, false);
	}
}};

Element.Properties.tag = {get: function(){
	return this.tagName.toLowerCase();
}};

Element.Properties.html = {set: function(){
	return this.innerHTML = Array.flatten(arguments).join('');
}};

Native.implement([Element, Window, Document], {

	addListener: function(type, fn){
		if (this.addEventListener) this.addEventListener(type, fn, false);
		else this.attachEvent('on' + type, fn);
		return this;
	},

	removeListener: function(type, fn){
		if (this.removeEventListener) this.removeEventListener(type, fn, false);
		else this.detachEvent('on' + type, fn);
		return this;
	},

	retrieve: function(property, dflt){
		var storage = Element.Storage.get(this.uid);
		var prop = storage[property];
		if ($defined(dflt) && !$defined(prop)) prop = storage[property] = dflt;
		return $pick(prop);
	},

	store: function(property, value){
		var storage = Element.Storage.get(this.uid);
		storage[property] = value;
		return this;
	},

	eliminate: function(property){
		var storage = Element.Storage.get(this.uid);
		delete storage[property];
		return this;
	}

});

Element.Attributes = new Hash({
	Props: {'html': 'innerHTML', 'class': 'className', 'for': 'htmlFor', 'text': (Browser.Engine.trident) ? 'innerText' : 'textContent'},
	Bools: ['compact', 'nowrap', 'ismap', 'declare', 'noshade', 'checked', 'disabled', 'readonly', 'multiple', 'selected', 'noresize', 'defer'],
	Camels: ['value', 'accessKey', 'cellPadding', 'cellSpacing', 'colSpan', 'frameBorder', 'maxLength', 'readOnly', 'rowSpan', 'tabIndex', 'useMap']
});

(function(EA){

	var EAB = EA.Bools, EAC = EA.Camels;
	EA.Bools = EAB = EAB.associate(EAB);
	Hash.extend(Hash.merge(EA.Props, EAB), EAC.associate(EAC.map(function(v){
		return v.toLowerCase();
	})));
	EA.remove('Camels');

})(Element.Attributes);

var Garbage = {

	Elements: {},

	ignored: {'object': 1, 'embed': 1, 'OBJECT': 1, 'EMBED': 1},

	collect: function(el){
		if (el.$attributes) return true;
		if (Garbage.ignored[el.tagName]) return false;
		Garbage.Elements[el.uid] = el;
		el.$attributes = {};
		return true;
	},

	trash: function(elements){
		for (var i = elements.length, el; i--; i) Garbage.kill(elements[i]);
	},

	kill: function(el){
		if (!el || !el.$attributes) return;
		delete Garbage.Elements[el.uid];
		if (el.retrieve('events')) el.removeEvents();
		for (var p in el.$attributes) el.$attributes[p] = null;
		if (Browser.Engine.trident){
			for (var d in Element.Prototype) el[d] = null;
		}
		el.$attributes = el.uid = null;
	},

	empty: function(){
		for (var uid in Garbage.Elements) Garbage.kill(Garbage.Elements[uid]);
	}

};

window.addListener('beforeunload', function(){
	window.addListener('unload', Garbage.empty);
	if (Browser.Engine.trident) window.addListener('unload', CollectGarbage);
});

var Event = new Native({

	name: 'Event',

	initialize: function(event, win){
		win = win || window;
		event = event || win.event;
		if (event.$extended) return event;
		this.$extended = true;
		var type = event.type;
		var target = event.target || event.srcElement;
		while (target && target.nodeType == 3) target = target.parentNode;
		if (type.test(/DOMMouseScroll|mousewheel/)){
			this.wheel = (event.wheelDelta) ? event.wheelDelta / 120 : -(event.detail || 0) / 3;
		} else if (type.test(/key/)){
			this.code = event.which || event.keyCode;
			var key = Event.Keys.keyOf(this.code);
			if (type == 'keydown'){
				var fKey = this.code - 111;
				if (fKey > 0 && fKey < 13) key = 'f' + fKey;
			}
			this.key = key || String.fromCharCode(this.code).toLowerCase();
		} else if (type.test(/(click|mouse|menu)/)){
			this.page = {
				x: event.pageX || event.clientX + win.document.documentElement.scrollLeft,
				y: event.pageY || event.clientY + win.document.documentElement.scrollTop
			};
			this.client = {
				x: event.pageX ? event.pageX - win.pageXOffset : event.clientX,
				y: event.pageY ? event.pageY - win.pageYOffset : event.clientY
			};
			this.rightClick = (event.which == 3) || (event.button == 2);
			var related = null;
			if (type.test(/over|out/)){
				switch (type){
					case 'mouseover': related = event.relatedTarget || event.fromElement; break;
					case 'mouseout': related = event.relatedTarget || event.toElement;
				}
				if ((function(){
					while (related && related.nodeType == 3) related = related.parentNode;
				}).create({attempt: Browser.Engine.gecko})() === false) related = false;
			}
		}

		return $extend(this, {
			event: event,
			type: type,
			relatedTarget: related,
			target: target,
			shift: event.shiftKey,
			control: event.ctrlKey,
			alt: event.altKey,
			meta: event.metaKey
		});
	}

});

Event.Keys = new Hash({
	'enter': 13,
	'up': 38,
	'down': 40,
	'left': 37,
	'right': 39,
	'esc': 27,
	'space': 32,
	'backspace': 8,
	'tab': 9,
	'delete': 46
});

Event.implement({

	stop: function(){
		return this.stopPropagation().preventDefault();
	},

	stopPropagation: function(){
		if (this.event.stopPropagation) this.event.stopPropagation();
		else this.event.cancelBubble = true;
		return this;
	},

	preventDefault: function(){
		if (this.event.preventDefault) this.event.preventDefault();
		else this.event.returnValue = false;
		return this;
	}

});

Element.Properties.events = {set: function(events){
	this.addEvents(events);
}};

Native.implement([Element, Window, Document], {

	addEvent: function(type, fn){
		var events = this.retrieve('events', {});
		events[type] = events[type] || {'keys': [], 'values': []};
		if (events[type].keys.contains(fn)) return this;
		events[type].keys.push(fn);
		var realType = type, custom = Element.Events.get(type), condition = fn, self = this;
		if (custom){
			if (custom.onAdd) custom.onAdd.call(this, fn);
			if (custom.condition){
				condition = function(event){
					if (custom.condition.call(this, event)) return fn.call(this, event);
					return false;
				};
			}
			realType = custom.base || realType;
		}
		var defn = function(){
			return fn.call(self);
		};
		var nativeEvent = Element.NativeEvents[realType] || 0;
		if (nativeEvent){
			if (nativeEvent == 2){
				defn = function(event){
					event = new Event(event, self.getWindow());
					if (condition.call(self, event) === false) event.stop();
				};
			}
			this.addListener(realType, defn);
		}
		events[type].values.push(defn);
		return this;
	},

	removeEvent: function(type, fn){
		var events = this.retrieve('events');
		if (!events || !events[type]) return this;
		var pos = events[type].keys.indexOf(fn);
		if (pos == -1) return this;
		var key = events[type].keys.splice(pos, 1)[0];
		var value = events[type].values.splice(pos, 1)[0];
		var custom = Element.Events.get(type);
		if (custom){
			if (custom.onRemove) custom.onRemove.call(this, fn);
			type = custom.base || type;
		}
		return (Element.NativeEvents[type]) ? this.removeListener(type, value) : this;
	},

	addEvents: function(events){
		for (var event in events) this.addEvent(event, events[event]);
		return this;
	},

	removeEvents: function(type){
		var events = this.retrieve('events');
		if (!events) return this;
		if (!type){
			for (var evType in events) this.removeEvents(evType);
			events = null;
		} else if (events[type]){
			while (events[type].keys[0]) this.removeEvent(type, events[type].keys[0]);
			events[type] = null;
		}
		return this;
	},

	fireEvent: function(type, args, delay){
		var events = this.retrieve('events');
		if (!events || !events[type]) return this;
		events[type].keys.each(function(fn){
			fn.create({'bind': this, 'delay': delay, 'arguments': args})();
		}, this);
		return this;
	},

	cloneEvents: function(from, type){
		from = $(from);
		var fevents = from.retrieve('events');
		if (!fevents) return this;
		if (!type){
			for (var evType in fevents) this.cloneEvents(from, evType);
		} else if (fevents[type]){
			fevents[type].keys.each(function(fn){
				this.addEvent(type, fn);
			}, this);
		}
		return this;
	}

});

Element.NativeEvents = {
	'click': 2, 'dblclick': 2, 'mouseup': 2, 'mousedown': 2, 'contextmenu': 2,
	'mousewheel': 2, 'DOMMouseScroll': 2,
	'mouseover': 2, 'mouseout': 2, 'mousemove': 2, 'selectstart': 2, 'selectend': 2,
	'keydown': 2, 'keypress': 2, 'keyup': 2,
	'focus': 2, 'blur': 2, 'change': 2, 'reset': 2, 'select': 2, 'submit': 2,
	'load': 1, 'unload': 1, 'beforeunload': 1, 'resize': 1, 'move': 1, 'DOMContentLoaded': 1, 'readystatechange': 1,
	'error': 1, 'abort': 1, 'scroll': 1
};

(function(){

var checkRelatedTarget = function(event){
	var related = event.relatedTarget;
	if (!related) return true;
	return ($type(this) != 'document' && related != this && related.prefix != 'xul' && !this.hasChild(related));
};

Element.Events = new Hash({

	mouseenter: {

		base: 'mouseover',

		condition: checkRelatedTarget

	},

	mouseleave: {

		base: 'mouseout',

		condition: checkRelatedTarget

	},

	mousewheel: {

		base: (Browser.Engine.gecko) ? 'DOMMouseScroll' : 'mousewheel'

	}

});

})();

Element.Properties.styles = {set: function(styles){
	this.setStyles(styles);
}};

Element.Properties.opacity = {

	set: function(opacity){
		if (opacity == 0){
			if (this.style.visibility != 'hidden') this.style.visibility = 'hidden';
		} else {
			if (this.style.visibility != 'visible') this.style.visibility = 'visible';
		}
		if (!this.currentStyle || !this.currentStyle.hasLayout) this.style.zoom = 1;
		if (Browser.Engine.trident) this.style.filter = (opacity == 1) ? '' : 'alpha(opacity=' + opacity * 100 + ')';
		this.style.opacity = opacity;
		this.store('opacity', opacity);
	},

	get: function(){
		return this.retrieve('opacity', 1);
	}

};

Element.implement({

	setStyle: function(property, value){
		switch (property){
			case 'opacity': return this.set('opacity', parseFloat(value));
			case 'float': property = (Browser.Engine.trident) ? 'styleFloat' : 'cssFloat';
		}
		property = property.camelCase();
		if ($type(value) != 'string'){
			var map = (Element.Styles.get(property) || '@').split(' ');
			value = $splat(value).map(function(val, i){
				if (!map[i]) return '';
				return ($type(val) == 'number') ? map[i].replace('@', Math.round(val)) : val;
			}).join(' ');
		} else if (value == String(Number(value))){
			value = Math.round(value);
		}
		this.style[property] = value;
		return this;
	},

	getStyle: function(property){
		switch (property){
			case 'opacity': return this.get('opacity');
			case 'float': property = (Browser.Engine.trident) ? 'styleFloat' : 'cssFloat';
		}
		property = property.camelCase();
		var result = this.style[property];
		if (!$chk(result)){
			result = [];
			for (var style in Element.ShortStyles){
				if (property != style) continue;
				for (var s in Element.ShortStyles[style]) result.push(this.getStyle(s));
				return result.join(' ');
			}
			result = this.getComputedStyle(property);
		}
		if (result){
			result = String(result);
			var color = result.match(/rgba?\([\d\s,]+\)/);
			if (color) result = result.replace(color[0], color[0].rgbToHex());
		}
		if (Browser.Engine.presto || (Browser.Engine.trident && !$chk(parseInt(result)))){
			if (property.test(/^(height|width)$/)){
				var values = (property == 'width') ? ['left', 'right'] : ['top', 'bottom'], size = 0;
				values.each(function(value){
					size += this.getStyle('border-' + value + '-width').toInt() + this.getStyle('padding-' + value).toInt();
				}, this);
				return this['offset' + property.capitalize()] - size + 'px';
			}
			if (Browser.Engine.presto && String(result).test('px')) return result;
			if (property.test(/(border(.+)Width|margin|padding)/)) return '0px';
		}
		return result;
	},

	setStyles: function(styles){
		for (var style in styles) this.setStyle(style, styles[style]);
		return this;
	},

	getStyles: function(){
		var result = {};
		Array.each(arguments, function(key){
			result[key] = this.getStyle(key);
		}, this);
		return result;
	}

});

Element.Styles = new Hash({
	'width': '@px', 'height': '@px', 'left': '@px', 'top': '@px', 'bottom': '@px', 'right': '@px',
	'backgroundColor': 'rgb(@, @, @)', 'backgroundPosition': '@px @px', 'color': 'rgb(@, @, @)',
	'fontSize': '@px', 'letterSpacing': '@px', 'lineHeight': '@px', 'clip': 'rect(@px @px @px @px)',
	'margin': '@px @px @px @px', 'padding': '@px @px @px @px', 'border': '@px @ rgb(@, @, @) @px @ rgb(@, @, @) @px @ rgb(@, @, @)',
	'borderWidth': '@px @px @px @px', 'borderStyle': '@ @ @ @', 'borderColor': 'rgb(@, @, @) rgb(@, @, @) rgb(@, @, @) rgb(@, @, @)',
	'zIndex': '@', 'zoom': '@', 'fontWeight': '@',
	'textIndent': '@px', 'opacity': '@'
});

Element.ShortStyles = {'margin': {}, 'padding': {}, 'border': {}, 'borderWidth': {}, 'borderStyle': {}, 'borderColor': {}};

['Top', 'Right', 'Bottom', 'Left'].each(function(direction){
	var Short = Element.ShortStyles;
	var All = Element.Styles;
	['margin', 'padding'].each(function(style){
		var sd = style + direction;
		Short[style][sd] = All[sd] = '@px';
	});
	var bd = 'border' + direction;
	Short.border[bd] = All[bd] = '@px @ rgb(@, @, @)';
	var bdw = bd + 'Width', bds = bd + 'Style', bdc = bd + 'Color';
	Short[bd] = {};
	Short.borderWidth[bdw] = Short[bd][bdw] = All[bdw] = '@px';
	Short.borderStyle[bds] = Short[bd][bds] = All[bds] = '@';
	Short.borderColor[bdc] = Short[bd][bdc] = All[bdc] = 'rgb(@, @, @)';
});

Native.implement([Element, Document], {

	getElements: function(selectors, nocash){
		var Local = {};
		selectors = selectors.split(',');
		var elements = [], j = selectors.length;
		var ddup = (j > 1);
		for (var i = 0; i < j; i++){
			var selector = selectors[i], items = [], separators = [];
			selector = selector.trim().replace(Selectors.sRegExp, function(match){
				if (match.charAt(2)) match = match.trim();
				separators.push(match.charAt(0));
				return ':)' + match.charAt(1);
			}).split(':)');
			for (var k = 0, l = selector.length; k < l; k++){
				var sel = Selectors.parse(selector[k]);
				if (!sel) return [];
				var temp = Selectors.Method.getParam(items, separators[k - 1] || false, this, sel, Local);
				if (!temp) break;
				items = temp;
			}
			var partial = Selectors.Method.getItems(items, this);
			elements = (ddup) ? elements.concat(partial) : partial;
		}
		return new Elements(elements, {ddup: ddup, cash: !nocash});
	}

});

Window.implement({

	$E: function(selector){
		return this.document.getElement(selector);
	}

});

var Selectors = {

	'regExp': (/:([^-:(]+)[^:(]*(?:\((["']?)(.*?)\2\))?|\[(\w+)(?:([!*^$~|]?=)(["']?)(.*?)\6)?\]|\.[\w-]+|#[\w-]+|\w+|\*/g),

	'sRegExp': (/\s*([+>~\s])[a-zA-Z#.*\s]/g)

};

Selectors.parse = function(selector){
	var params = {'tag': '*', 'id': null, 'classes': [], 'attributes': [], 'pseudos': []};
	selector = selector.replace(Selectors.regExp, function(bit){
		switch (bit.charAt(0)){
			case '.': params.classes.push(bit.slice(1)); break;
			case '#': params.id = bit.slice(1); break;
			case '[': params.attributes.push([arguments[4], arguments[5], arguments[7]]); break;
			case ':':
				var xparser = Selectors.Pseudo.get(arguments[1]);
				if (!xparser){
					params.attributes.push([arguments[1], arguments[3] ? '=' : '', arguments[3]]);
					break;
				}
				var pseudo = {'name': arguments[1], 'parser': xparser, 'argument': (xparser.parser) ? xparser.parser(arguments[3]) : arguments[3]};
				params.pseudos.push(pseudo);
			break;
			default: params.tag = bit;
		}
		return '';
	});
	return params;
};

Selectors.Pseudo = new Hash;

Selectors.XPath = {

	getParam: function(items, separator, context, params){
		var temp = context.namespaceURI ? 'xhtml:' : '';
		switch (separator){
			case ' ': temp += '//'; break;
			case '>': temp += '/'; break;
			case '+': temp += '/following-sibling::*[1]/self::'; break;
			case '~': temp += '/following-sibling::'; break;
		}
		temp += params.tag;
		var i;
		for (i = params.pseudos.length; i--; i){
			var pseudo = params.pseudos[i];
			if (pseudo.parser && pseudo.parser.xpath) temp += pseudo.parser.xpath(pseudo.argument);
			else temp += ($chk(pseudo.argument)) ? '[@' + pseudo.name + '="' + pseudo.argument + '"]' : '[@' + pseudo.name + ']';
		}
		if (params.id) temp += '[@id="' + params.id + '"]';
		for (i = params.classes.length; i--; i) temp += '[contains(concat(" ", @class, " "), " ' + params.classes[i] + ' ")]';
		for (i = params.attributes.length; i--; i){
			var bits = params.attributes[i];
			switch (bits[1]){
				case '=': temp += '[@' + bits[0] + '="' + bits[2] + '"]'; break;
				case '*=': temp += '[contains(@' + bits[0] + ', "' + bits[2] + '")]'; break;
				case '^=': temp += '[starts-with(@' + bits[0] + ', "' + bits[2] + '")]'; break;
				case '$=': temp += '[substring(@' + bits[0] + ', string-length(@' + bits[0] + ') - ' + bits[2].length + ' + 1) = "' + bits[2] + '"]'; break;
				case '!=': temp += '[@' + bits[0] + '!="' + bits[2] + '"]'; break;
				case '~=': temp += '[contains(concat(" ", @' + bits[0] + ', " "), " ' + bits[2] + ' ")]'; break;
				case '|=': temp += '[contains(concat("-", @' + bits[0] + ', "-"), "-' + bits[2] + '-")]'; break;
				default: temp += '[@' + bits[0] + ']';
			}
		}
		items.push(temp);
		return items;
	},

	getItems: function(items, context){
		var elements = [];
		var doc = context.ownerDocument || context;
		var xpath = doc.evaluate('.//' + items.join(''), context, Selectors.XPath.resolver, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
		for (var i = 0, j = xpath.snapshotLength; i < j; i++) elements[i] = xpath.snapshotItem(i);
		return elements;
	},

	resolver: function(prefix){
		return (prefix == 'xhtml') ? 'http://www.w3.org/1999/xhtml' : false;
	}

};

Selectors.Filter = {

	getParam: function(items, separator, context, params, Local){
		var found = [];
		var tag = params.tag;
		if (separator){
			var uniques = {}, child, children, item, k, l;
			var add = function(child){
				child.uid = child.uid || [Native.UID++];
				if (!uniques[child.uid] && Selectors.Filter.match(child, params, Local)){
					uniques[child.uid] = true;
					found.push(child);
					return true;
				}
				return false;
			};
			for (var i = 0, j = items.length; i < j; i++){
				item = items[i];
				switch(separator){
					case ' ':
						children = item.getElementsByTagName(tag);
						params.tag = false;
						for (k = 0, l = children.length; k < l; k++) add(children[k]);
					break;
					case '>':
						children = item.childNodes;
						for (k = 0, l = children.length; k < l; k++){
							if (children[k].nodeType == 1) add(children[k]);
						}
					break;
					case '+':
						while ((item = item.nextSibling)){
							if (item.nodeType == 1){
								add(item);
								break;
							}
						}
					break;
					case '~':
						while ((item = item.nextSibling)){
							if (item.nodeType == 1 && add(item)) break;
						}
					break;
				}
			}
			return found;
		}
		if (params.id){
			el = context.getElementById(params.id, true);
			params.id = false;
			return (el && Selectors.Filter.match(el, params, Local)) ? [el] : false;
		} else {
			items = context.getElementsByTagName(tag);
			params.tag = false;
			for (var m = 0, n = items.length; m < n; m++){
				if (Selectors.Filter.match(items[m], params, Local)) found.push(items[m]);
			}
		}
		return found;
	},

	getItems: $arguments(0)

};

Selectors.Filter.match = function(el, params, Local){
	Local = Local || {};

	if (params.id && params.id != el.id) return false;
	if (params.tag && params.tag != '*' && params.tag != el.tagName.toLowerCase()) return false;

	var i;

	for (i = params.classes.length; i--; i){
		if (!el.className || !el.className.contains(params.classes[i], ' ')) return false;
	}

	for (i = params.attributes.length; i--; i){
		var bits = params.attributes[i];
		var result = Element.prototype.getProperty.call(el, bits[0]);
		if (!result) return false;
		if (!bits[1]) continue;
		var condition;
		switch (bits[1]){
			case '=': condition = (result == bits[2]); break;
			case '*=': condition = (result.contains(bits[2])); break;
			case '^=': condition = (result.substr(0, bits[2].length) == bits[2]); break;
			case '$=': condition = (result.substr(result.length - bits[2].length) == bits[2]); break;
			case '!=': condition = (result != bits[2]); break;
			case '~=': condition = result.contains(bits[2], ' '); break;
			case '|=': condition = result.contains(bits[2], '-');
		}

		if (!condition) return false;
	}

	for (i = params.pseudos.length; i--; i){
		if (!params.pseudos[i].parser.filter.call(el, params.pseudos[i].argument, Local)) return false;
	}

	return true;
};

Selectors.Method = (Browser.Features.xpath) ? Selectors.XPath : Selectors.Filter;

Element.implement({

	match: function(selector){
		return (!selector || Selectors.Filter.match(this, Selectors.parse(selector)));
	}

});

Selectors.Pseudo.enabled = {

	xpath: function(){
		return '[not(@disabled)]';
	},

	filter: function(){
		return !(this.disabled);
	}
};
Selectors.Pseudo.empty = {

	xpath: function(){
		return '[not(node())]';
	},

	filter: function(){
		return !(this.innerText || this.textContent || '').length;
	}

};
Selectors.Pseudo.contains = {

	xpath: function(argument){
		return '[contains(text(), "' + argument + '")]';
	},

	filter: function(argument){
		for (var i = this.childNodes.length; i--; i){
			var child = this.childNodes[i];
			if (child.nodeName && child.nodeType == 3 && child.nodeValue.contains(argument)) return true;
		}
		return false;
	}

};

Selectors.Pseudo.nth = {

	parser: function(argument){
		argument = (argument) ? argument.match(/^([+-]?\d*)?([devon]+)?([+-]?\d*)?$/) : [null, 1, 'n', 0];
		if (!argument) return false;
		var inta = parseInt(argument[1]);
		var a = ($chk(inta)) ? inta : 1;
		var special = argument[2] || false;
		var b = parseInt(argument[3]) || 0;
		b = b - 1;
		while (b < 1) b += a;
		while (b >= a) b -= a;
		switch (special){
			case 'n': return {'a': a, 'b': b, 'special': 'n'};
			case 'odd': return {'a': 2, 'b': 0, 'special': 'n'};
			case 'even': return {'a': 2, 'b': 1, 'special': 'n'};
			case 'first': return {'a': 0, 'special': 'index'};
			case 'last': return {'special': 'last'};
			case 'only': return {'special': 'only'};
			default: return {'a': (a - 1), 'special': 'index'};
		}
	},

	xpath: function(argument){
		switch (argument.special){
			case 'n': return '[count(preceding-sibling::*) mod ' + argument.a + ' = ' + argument.b + ']';
			case 'last': return '[count(following-sibling::*) = 0]';
			case 'only': return '[not(preceding-sibling::* or following-sibling::*)]';
			default: return '[count(preceding-sibling::*) = ' + argument.a + ']';
		}
	},

	filter: function(argument, Local){
		var count = 0, el = this;
		switch (argument.special){
			case 'n':
				Local.Positions = Local.Positions || {};
				if (!Local.Positions[this.uid]){
					var children = this.parentNode.childNodes;
					for (var i = 0, l = children.length; i < l; i++){
						var child = children[i];
						if (child.nodeType != 1) continue;
						child.uid = child.uid || [Native.UID++];
						Local.Positions[child.uid] = count++;
					}
				}
				return (Local.Positions[this.uid] % argument.a == argument.b);
			case 'last':
				while ((el = el.nextSibling)){
					if (el.nodeType == 1) return false;
				}
				return true;
			case 'only':
				var prev = el;
				while((prev = prev.previousSibling)){
					if (prev.nodeType == 1) return false;
				}
				var next = el;
				while ((next = next.nextSibling)){
					if (next.nodeType == 1) return false;
				}
				return true;
			case 'index':
				while ((el = el.previousSibling)){
					if (el.nodeType == 1 && ++count > argument.a) return false;
				}
				return true;
		}
		return false;
	}

};

Selectors.Pseudo.extend({

	'even': {
		parser: function(){
			return {'a': 2, 'b': 1, 'special': 'n'};
		},
		xpath: Selectors.Pseudo.nth.xpath,
		filter: Selectors.Pseudo.nth.filter
	},

	'odd': {
		parser: function(){
			return {'a': 2, 'b': 0, 'special': 'n'};
		},
		xpath: Selectors.Pseudo.nth.xpath,
		filter: Selectors.Pseudo.nth.filter
	},

	'first': {
		parser: function(){
			return {'a': 0, 'special': 'index'};
		},
		xpath: Selectors.Pseudo.nth.xpath,
		filter: Selectors.Pseudo.nth.filter
	},

	'last': {
		parser: function(){
			return {'special': 'last'};
		},
		xpath: Selectors.Pseudo.nth.xpath,
		filter: Selectors.Pseudo.nth.filter
	},

	'only': {
		parser: function(){
			return {'special': 'only'};
		},
		xpath: Selectors.Pseudo.nth.xpath,
		filter: Selectors.Pseudo.nth.filter
	}

});

Element.Events.domready = {

	onAdd: function(fn){

		if (Browser.loaded) return fn.call(this);

		var self = this, win = this.getWindow(), doc = this.getDocument();

		var domready = function(){
			if (!arguments.callee.done){
				arguments.callee.done = true;
				fn.call(self);
			};
			return true;
		};

		var states = (Browser.Engine.webkit) ? ['loaded', 'complete'] : 'complete';

		var check = function(context){
			if (states.contains(context.readyState)) return domready();
			return false;
		};

		if (doc.readyState && Browser.Engine.webkit){

			(function(){
				if (!check(doc)) arguments.callee.delay(50);
			})();

		} else if (doc.readyState && Browser.Engine.trident){

			var script = $('ie_domready');
			if (!script){
				var src = (win.location.protocol == 'https:') ? '//:' : 'javascript:void(0)';
				doc.write('<script id="ie_domready" defer src="' + src + '"><\/script>');
				script = $('ie_domready');
			}
			if (!check(script)) script.addEvent('readystatechange', check.pass(script));

		} else {

			win.addEvent('load', domready);
			doc.addEvent('DOMContentLoaded', domready);

		}

		return null;
	}

};

window.addEvent('domready', function(){
	Browser.loaded = true;
});

(function(){

var objects = function(self){
	var doc, great = true;
	switch ($type(self)){
		case 'window': doc = self.document; break;
		case 'document': doc = self; break;
		case 'element': doc = self.ownerDocument; great = false;
	}
	return {doc: doc, win: doc.window, self: self, great: (great || self === doc.body || self === doc.html)};
};

var great = function(self){
	return objects(self).great;
};

var Dimensions = {

	positioned: function(self){
		if (great(self)) return true;
		var style = self.style.position || (self.style.position = Element.getComputedStyle(self, 'position'));
		return (style != 'static');
	},

	getOffsetParent: function(self){
		if (!Browser.Engine.trident) return self.offsetParent;
		var el = self;
		while ((el = el.parentNode)){
			if (Dimensions.positioned(el)) return el;
		}
		return false;
	},

	getOffsetSize: function(self){
		var obj = {}, dims = {X: 'Width', Y: 'Height'}, objs = objects(self);
		for (var Z in dims) obj[Z.toLowerCase()] = (function(){
			if (objs.great){
				if (Browser.Engine.webkit419) return objs.win['inner' + dims[Z]];
				if (Browser.Engine.presto) return objs.doc.body['client' + dims[Z]];
				return objs.doc.documentElement['client' + dims[Z]];
			} else {
				return self['offset' + dims[Z]];
			}
		})();
		return obj;
	},

	getScrollSize: function(self){
		var obj = {}, dims = {X: 'Width', Y: 'Height'}, objs = objects(self);
		for (var Z in dims) obj[Z.toLowerCase()] = (function(){
			if (objs.great){
				var delement = objs.doc.documentElement;
				if (Browser.Engine.trident) return Math.max(delement['offset' + dims[Z]], delement['scroll' + dims[Z]]);
				if (Browser.Engine.webkit) return objs.doc.body['scroll' + dims[Z]];
				return delement['scroll' + dims[Z]];
			} else {
				return self['scroll' + dims[Z]];
			}
		})();
		return obj;
	},

	getScroll: function(self){
		var obj = {}, dims = {X: 'Left', Y: 'Top'}, objs = objects(self);
		for (var Z in dims) obj[Z.toLowerCase()] = (function(){
			return (objs.great) ? objs.win['page' + Z + 'Offset'] || objs.doc.documentElement['scroll' + dims[Z]] : self['scroll' + dims[Z]];
		})();
		return obj;
	},

	getPosition: function(self, relative){
		if (great(self) || relative == self) return {x: 0, y: 0};
		var el = self, left = 0, top = 0, position;

		while (el){
			var offsetParent = Dimensions.getOffsetParent(el);
			if (!offsetParent) break;
			position = Dimensions.getRelativePosition(el, !great(offsetParent));
			left += position.x;
			top += position.y;
			el = offsetParent;
		}

		var rpos = (relative) ? Dimensions.getPosition($(relative, true)) : {x: 0, y: 0};
		return {x: left - rpos.x, y: top - rpos.y};
	},

	getRelativePosition: function(self, client){
		if (great(self)) return {x: 0, y: 0};

		var el = self, left = self.offsetLeft, top = self.offsetTop;

		if (Browser.Engine.trident){
			while ((el = el.offsetParent) && !Dimensions.positioned(el)){
				left += el.offsetLeft;
				top += el.offsetTop;
			}
			el = self;
		}

		var position = {x: left, y: top}, isPositioned = Dimensions.positioned(self);

		while ((el = el.parentNode)){
			var isOffsetParent = Dimensions.positioned(el);
			if ((!isOffsetParent || client) && ((!isPositioned || isOffsetParent) || Browser.Engine.presto)){
				var scroll = Dimensions.getScroll(el);
				position.x -= scroll.x;
				position.y -= scroll.y;
			}
			if (isOffsetParent) break;
		}

		return position;
	},

	getCoordinates: function(self, relative){
		var position = Dimensions.getPosition(self, relative), size = Dimensions.getOffsetSize(self);
		var obj = {'top': position.y, 'left': position.x, 'width': size.x, 'height': size.y};
		obj.right = obj.left + obj.width;
		obj.bottom = obj.top + obj.height;
		return obj;
	}

};

var methods = {};

Hash.each(Dimensions, function(value, key){
	methods[key] = function(arg){
		return value(this, arg);
	};
});

Native.implement([Element, Document], methods);

Document.implement({

	scrollTo: function(x, y){
		this.getWindow().scrollTo(x, y);
	}

});

Element.implement({

	scrollTo: function(x, y){
		this.scrollLeft = x;
		this.scrollTop = y;
	},

	computePosition: function(obj, client){
		var scroll, el = this;
		var position = {
			left: obj.x - (this.getComputedStyle('margin-left').toInt() || 0),
			top: obj.y - (this.getComputedStyle('margin-top').toInt() || 0)
		};
		if (client){
			scroll = Dimensions.getScroll(Dimensions.getOffsetParent(this));
			position.left += scroll.x;
			position.top += scroll.y;
		}
		if (Browser.Engine.presto){
			while ((el = el.parentNode) && el != this.offsetParent){
				scroll = Dimensions.getScroll(el);
				position.left += scroll.x;
				position.top += scroll.y;
			}
		}
		return position;
	},

	position: function(obj, client){
		return this.setStyles(this.computePosition(obj, client));
	}

});

})();

var Group = new Class({

	initialize: function(){
		this.instances = Array.flatten(arguments);
		this.events = {};
		this.checker = {};
	},

	addEvent: function(type, fn){
		this.checker[type] = this.checker[type] || {};
		this.events[type] = this.events[type] || [];
		if (this.events[type].contains(fn)) return false;
		else this.events[type].push(fn);
		this.instances.each(function(instance, i){
			instance.addEvent(type, this.check.bind(this, [type, instance, i]));
		}, this);
		return this;
	},

	check: function(type, instance, i){
		this.checker[type][i] = true;
		var every = this.instances.every(function(current, j){
			return this.checker[type][j] || false;
		}, this);
		if (!every) return;
		this.checker[type] = {};
		this.events[type].each(function(event){
			event.call(this, this.instances, instance);
		}, this);
	}

});

var Request = new Class({

	Implements: [Chain, Events, Options],

	options: {/*
		onRequest: $empty,
		onSuccess: $empty,
		onFailure: $empty,
		onException: $empty,*/
		url: '',
		data: '',
		headers: {},
		async: true,
		method: 'post',
		link: 'ignore',
		isSuccess: null,
		emulation: true,
		urlEncoded: true,
		encoding: 'utf-8',
		evalScripts: false,
		evalResponse: false
	},

	getXHR: function(){
		return (window.XMLHttpRequest) ? new XMLHttpRequest() : ((window.ActiveXObject) ? new ActiveXObject('Microsoft.XMLHTTP') : false);
	},

	initialize: function(options){
		if (!(this.xhr = this.getXHR())) return;
		this.setOptions(options);
		this.options.isSuccess = this.options.isSuccess || this.isSuccess;
		this.headers = new Hash(this.options.headers).extend({
			'X-Requested-With': 'XMLHttpRequest',
			'Accept': 'text/javascript, text/html, application/xml, text/xml, */*'
		});
	},

	onStateChange: function(){
		if (this.xhr.readyState != 4 || !this.running) return;
		this.running = false;
		this.status = 0;
		$try(function(){
			this.status = this.xhr.status;
		}, this);
		if (this.options.isSuccess.call(this, this.status)){
			this.response = {text: this.xhr.responseText, xml: this.xhr.responseXML};
			this.success(this.response.text, this.response.xml);
		} else {
			this.response = {text: null, xml: null};
			this.failure();
		}
		this.xhr.onreadystatechange = $empty;
	},

	isSuccess: function(){
		return ((this.status >= 200) && (this.status < 300));
	},

	processScripts: function(text){
		if (this.options.evalResponse || (/(ecma|java)script/).test(this.getHeader('Content-type'))) return $exec(text);
		return text.stripScripts(this.options.evalScripts);
	},

	success: function(text, xml){
		this.onSuccess(this.processScripts(text), xml);
	},

	onSuccess: function(){
		this.fireEvent('onComplete', arguments).fireEvent('onSuccess', arguments).callChain();
	},

	failure: function(){
		this.onFailure();
	},

	onFailure: function(){
		this.fireEvent('onComplete').fireEvent('onFailure', this.xhr);
	},

	setHeader: function(name, value){
		this.headers.set(name, value);
		return this;
	},

	getHeader: function(name){
		return $try(function(){
			return this.getResponseHeader(name);
		}, this.xhr) || null;
	},

	check: function(){
		if (!this.running) return true;
		switch (this.options.link){
			case 'cancel': this.cancel(); return true;
			case 'chain': this.chain(this.send.bind(this, arguments)); return false;
		}
		return false;
	},

	send: function(options){
		if (!this.check(options)) return this;
		this.running = true;

		var type = $type(options);
		if (type == 'string' || type == 'element') options = {data: options};

		var old = this.options;
		options = $extend({data: old.data, url: old.url, method: old.method}, options);
		var data = options.data, url = options.url, method = options.method;

		switch($type(data)){
			case 'element': data = $(data).toQueryString(); break;
			case 'object': case 'hash': data = Hash.toQueryString(data);
		}

		if (this.options.emulation && ['put', 'delete'].contains(method)){
			var _method = '_method=' + method;
			data = (data) ? _method + '&' + data : _method;
			method = 'post';
		}

		if (this.options.urlEncoded && method == 'post'){
			var encoding = (this.options.encoding) ? '; charset=' + this.options.encoding : '';
			this.headers.set('Content-type', 'application/x-www-form-urlencoded' + encoding);
		}

		if (data && method == 'get'){
			url = url + (url.contains('?') ? '&' : '?') + data;
			data = null;
		}

		this.xhr.open(method.toUpperCase(), url, this.options.async);

		this.xhr.onreadystatechange = this.onStateChange.bind(this);

		this.headers.each(function(value, key){
			try{
				this.xhr.setRequestHeader(key, value);
			} catch(e){
				this.fireEvent('onException', [e, key, value]);
			}
		}, this);

		this.fireEvent('onRequest');
		this.xhr.send(data);
		if (!this.options.async) this.onStateChange();
		return this;
	},

	cancel: function(){
		if (!this.running) return this;
		this.running = false;
		this.xhr.abort();
		this.xhr.onreadystatechange = $empty;
		this.xhr = this.getXHR();
		this.fireEvent('onCancel');
		return this;
	}

});

(function(){

var methods = {};
['get', 'post', 'GET', 'POST', 'PUT', 'DELETE'].each(function(method){
	methods[method] = function(){
		var params = Array.link(arguments, {url: String.type, data: $defined});
		return this.send($extend(params, {method: method.toLowerCase()}));
	};
});

Request.implement(methods);

})();

Element.Properties.send = {

	get: function(options){
		if (options || !this.retrieve('send')) this.set('send', options);
		return this.retrieve('send');
	},

	set: function(options){
		var send = this.retrieve('send');
		if (send) send.cancel();
		return this.store('send', new Request($extend({
			data: this, link: 'cancel', method: this.get('method') || 'post', url: this.get('action')
		}, options)));
	}

};

Element.implement({

	send: function(url){
		var sender = this.get('send');
		sender.send({data: this, url: url || sender.options.url});
		return this;
	}

});

Request.HTML = new Class({

	Extends: Request,

	options: {
		update: false,
		evalScripts: true,
		filter: false
	},

	processHTML: function(text){
		var match = text.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
		return (match) ? match[1] : text;
	},

	success: function(text){
		var opts = this.options, res = this.response;
		res.html = this.processHTML(text).stripScripts(function(script){
			res.javascript = script;
		});
		var node = new Element('div', {html: res.html});
		res.elements = node.getElements('*');
		res.tree = (opts.filter) ? res.elements.filterBy(opts.filter) : $A(node.childNodes).filter(function(el){
			return ($type(el) != 'whitespace');
		});
		if (opts.update) $(opts.update).empty().adopt(res.tree);
		if (opts.evalScripts) $exec(res.javascript);
		this.onSuccess(res.tree, res.elements, res.html, res.javascript);
	}

});

Element.Properties.load = {

	get: function(options){
		if (options || !this.retrieve('load')) this.set('load', options);
		return this.retrieve('load');
	},

	set: function(options){
		var load = this.retrieve('load');
		if (load) load.cancel();
		return this.store('load', new Request.HTML($extend({link: 'cancel', update: this, method: 'get'}, options)));
	}

};

Element.implement({

	load: function(){
		this.get('load').send(Array.link(arguments, {data: Object.type, url: String.type}));
		return this;
	}

});
