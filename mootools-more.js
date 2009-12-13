//MooTools More, <http://mootools.net/more>. Copyright (c) 2006-2009 Aaron Newton <http://clientcide.com/>, Valerio Proietti <http://mad4milk.net> & the MooTools team <http://mootools.net/developers>, MIT Style License.

MooTools.More={version:"1.2.4.2",build:"bd5a93c0913cce25917c48cbdacde568e15e02ef"};(function(){var c=this;var b=function(){if(c.console&&console.log){try{console.log.apply(console,arguments);
}catch(d){console.log(Array.slice(arguments));}}else{Log.logged.push(arguments);}return this;};var a=function(){this.logged.push(arguments);return this;
};this.Log=new Class({logged:[],log:a,resetLog:function(){this.logged.empty();return this;},enableLog:function(){this.log=b;this.logged.each(function(d){this.log.apply(this,d);
},this);return this.resetLog();},disableLog:function(){this.log=a;return this;}});Log.extend(new Log).enableLog();Log.logger=function(){return this.log.apply(this,arguments);
};})();Request.JSONP=new Class({Implements:[Chain,Events,Options,Log],options:{url:"",data:{},retries:0,timeout:0,link:"ignore",callbackKey:"callback",injectScript:document.head},initialize:function(a){this.setOptions(a);
if(this.options.log){this.enableLog();}this.running=false;this.requests=0;this.triesRemaining=[];},check:function(){if(!this.running){return true;}switch(this.options.link){case"cancel":this.cancel();
return true;case"chain":this.chain(this.caller.bind(this,arguments));return false;}return false;},send:function(c){if(!$chk(arguments[1])&&!this.check(c)){return this;
}var e=$type(c),a=this.options,b=$chk(arguments[1])?arguments[1]:this.requests++;if(e=="string"||e=="element"){c={data:c};}c=$extend({data:a.data,url:a.url},c);
if(!$chk(this.triesRemaining[b])){this.triesRemaining[b]=this.options.retries;}var d=this.triesRemaining[b];(function(){var f=this.getScript(c);this.log("JSONP retrieving script with url: "+f.get("src"));
this.fireEvent("request",f);this.running=true;(function(){if(d){this.triesRemaining[b]=d-1;if(f){f.destroy();this.send(c,b).fireEvent("retry",this.triesRemaining[b]);
}}else{if(f&&this.options.timeout){f.destroy();this.cancel().fireEvent("failure");}}}).delay(this.options.timeout,this);}).delay(Browser.Engine.trident?50:0,this);
return this;},cancel:function(){if(!this.running){return this;}this.running=false;this.fireEvent("cancel");return this;},getScript:function(c){var b=Request.JSONP.counter,d;
Request.JSONP.counter++;switch($type(c.data)){case"element":d=document.id(c.data).toQueryString();break;case"object":case"hash":d=Hash.toQueryString(c.data);
}var e=c.url+(c.url.test("\\?")?"&":"?")+(c.callbackKey||this.options.callbackKey)+"=Request.JSONP.request_map.request_"+b+(d?"&"+d:"");if(e.length>2083){this.log("JSONP "+e+" will fail in Internet Explorer, which enforces a 2083 bytes length limit on URIs");
}var a=new Element("script",{type:"text/javascript",src:e});Request.JSONP.request_map["request_"+b]=function(f){this.success(f,a);}.bind(this);return a.inject(this.options.injectScript);
},success:function(b,a){if(a){a.destroy();}this.running=false;this.log("JSONP successfully retrieved: ",b);this.fireEvent("complete",[b]).fireEvent("success",[b]).callChain();
}});Request.JSONP.counter=0;Request.JSONP.request_map={};