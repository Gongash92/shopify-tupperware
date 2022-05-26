// Utility function
function Util () {};

/* 
	class manipulation functions
*/
Util.hasClass = function(el, className) {
	if (el.classList) return el.classList.contains(className);
	else return !!el.getAttribute('class').match(new RegExp('(\\s|^)' + className + '(\\s|$)'));
};

Util.addClass = function(el, className) {
	var classList = className.split(' ');
 	if (el.classList) el.classList.add(classList[0]);
  else if (!Util.hasClass(el, classList[0])) el.setAttribute('class', el.getAttribute('class') +  " " + classList[0]);
 	if (classList.length > 1) Util.addClass(el, classList.slice(1).join(' '));
};

Util.removeClass = function(el, className) {
	var classList = className.split(' ');
	if (el.classList) el.classList.remove(classList[0]);	
	else if(Util.hasClass(el, classList[0])) {
		var reg = new RegExp('(\\s|^)' + classList[0] + '(\\s|$)');
    el.setAttribute('class', el.getAttribute('class').replace(reg, ' '));
	}
	if (classList.length > 1) Util.removeClass(el, classList.slice(1).join(' '));
};

Util.toggleClass = function(el, className, bool) {
	if(bool) Util.addClass(el, className);
	else Util.removeClass(el, className);
};

Util.setAttributes = function(el, attrs) {
  for(var key in attrs) {
    el.setAttribute(key, attrs[key]);
  }
};

/* 
  DOM manipulation
*/
Util.getChildrenByClassName = function(el, className) {
  var children = el.children,
    childrenByClass = [];
  for (var i = 0; i < el.children.length; i++) {
    if (Util.hasClass(el.children[i], className)) childrenByClass.push(el.children[i]);
  }
  return childrenByClass;
};

Util.is = function(elem, selector) {
  if(selector.nodeType){
    return elem === selector;
  }

  var qa = (typeof(selector) === 'string' ? document.querySelectorAll(selector) : selector),
    length = qa.length,
    returnArr = [];

  while(length--){
    if(qa[length] === elem){
      return true;
    }
  }

  return false;
};

/* 
	Animate height of an element
*/
Util.setHeight = function(start, to, element, duration, cb, timeFunction) {
	var change = to - start,
	    currentTime = null;

  var animateHeight = function(timestamp){  
    if (!currentTime) currentTime = timestamp;         
    var progress = timestamp - currentTime;
    if(progress > duration) progress = duration;
    var val = parseInt((progress/duration)*change + start);
    if(timeFunction) {
      val = Math[timeFunction](progress, start, to - start, duration);
    }
    element.style.height = val+"px";
    if(progress < duration) {
        window.requestAnimationFrame(animateHeight);
    } else {
    	if(cb) cb();
    }
  };
  
  //set the height of the element before starting animation -> fix bug on Safari
  element.style.height = start+"px";
  window.requestAnimationFrame(animateHeight);
};

/* 
	Smooth Scroll
*/

Util.scrollTo = function(final, duration, cb, scrollEl) {
  var element = scrollEl || window;
  var start = element.scrollTop || document.documentElement.scrollTop,
    currentTime = null;

  if(!scrollEl) start = window.scrollY || document.documentElement.scrollTop;
      
  var animateScroll = function(timestamp){
  	if (!currentTime) currentTime = timestamp;        
    var progress = timestamp - currentTime;
    if(progress > duration) progress = duration;
    var val = Math.easeInOutQuad(progress, start, final-start, duration);
    element.scrollTo(0, val);
    if(progress < duration) {
      window.requestAnimationFrame(animateScroll);
    } else {
      cb && cb();
    }
  };

  window.requestAnimationFrame(animateScroll);
};

/* 
  Focus utility classes
*/

//Move focus to an element
Util.moveFocus = function (element) {
  if( !element ) element = document.getElementsByTagName("body")[0];
  element.focus();
  if (document.activeElement !== element) {
    element.setAttribute('tabindex','-1');
    element.focus();
  }
};

/* 
  Misc
*/

Util.getIndexInArray = function(array, el) {
  return Array.prototype.indexOf.call(array, el);
};

Util.cssSupports = function(property, value) {
  if('CSS' in window) {
    return CSS.supports(property, value);
  } else {
    var jsProperty = property.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase();});
    return jsProperty in document.body.style;
  }
};

// merge a set of user options into plugin defaults
// https://gomakethings.com/vanilla-javascript-version-of-jquery-extend/
Util.extend = function() {
  // Variables
  var extended = {};
  var deep = false;
  var i = 0;
  var length = arguments.length;

  // Check if a deep merge
  if ( Object.prototype.toString.call( arguments[0] ) === '[object Boolean]' ) {
    deep = arguments[0];
    i++;
  }

  // Merge the object into the extended object
  var merge = function (obj) {
    for ( var prop in obj ) {
      if ( Object.prototype.hasOwnProperty.call( obj, prop ) ) {
        // If deep merge and property is an object, merge properties
        if ( deep && Object.prototype.toString.call(obj[prop]) === '[object Object]' ) {
          extended[prop] = extend( true, extended[prop], obj[prop] );
        } else {
          extended[prop] = obj[prop];
        }
      }
    }
  };

  // Loop through each object and conduct a merge
  for ( ; i < length; i++ ) {
    var obj = arguments[i];
    merge(obj);
  }

  return extended;
};

// Check if Reduced Motion is enabled
Util.osHasReducedMotion = function() {
  if(!window.matchMedia) return false;
  var matchMediaObj = window.matchMedia('(prefers-reduced-motion: reduce)');
  if(matchMediaObj) return matchMediaObj.matches;
  return false; // return false if not supported
}; 

/* 
	Polyfills
*/
//Closest() method
if (!Element.prototype.matches) {
	Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
}

if (!Element.prototype.closest) {
	Element.prototype.closest = function(s) {
		var el = this;
		if (!document.documentElement.contains(el)) return null;
		do {
			if (el.matches(s)) return el;
			el = el.parentElement || el.parentNode;
		} while (el !== null && el.nodeType === 1); 
		return null;
	};
}

//Custom Event() constructor
if ( typeof window.CustomEvent !== "function" ) {

  function CustomEvent ( event, params ) {
    params = params || { bubbles: false, cancelable: false, detail: undefined };
    var evt = document.createEvent( 'CustomEvent' );
    evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
    return evt;
   }

  CustomEvent.prototype = window.Event.prototype;

  window.CustomEvent = CustomEvent;
}

/* 
	Animation curves
*/
Math.easeInOutQuad = function (t, b, c, d) {
	t /= d/2;
	if (t < 1) return c/2*t*t + b;
	t--;
	return -c/2 * (t*(t-2) - 1) + b;
};

Math.easeInQuart = function (t, b, c, d) {
	t /= d;
	return c*t*t*t*t + b;
};

Math.easeOutQuart = function (t, b, c, d) { 
  t /= d;
	t--;
	return -c * (t*t*t*t - 1) + b;
};

Math.easeInOutQuart = function (t, b, c, d) {
	t /= d/2;
	if (t < 1) return c/2*t*t*t*t + b;
	t -= 2;
	return -c/2 * (t*t*t*t - 2) + b;
};

Math.easeOutElastic = function (t, b, c, d) {
  var s=1.70158;var p=d*0.7;var a=c;
  if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
  if (a < Math.abs(c)) { a=c; var s=p/4; }
  else var s = p/(2*Math.PI) * Math.asin (c/a);
  return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
};


/* JS Utility Classes */

// make focus ring visible only for keyboard navigation (i.e., tab key) 
(function() {
  var focusTab = document.getElementsByClassName('js-tab-focus'),
    shouldInit = false,
    outlineStyle = false,
    eventDetected = false;

  function detectClick() {
    if(focusTab.length > 0) {
      resetFocusStyle(false);
      window.addEventListener('keydown', detectTab);
    }
    window.removeEventListener('mousedown', detectClick);
    outlineStyle = false;
    eventDetected = true;
  };

  function detectTab(event) {
    if(event.keyCode !== 9) return;
    resetFocusStyle(true);
    window.removeEventListener('keydown', detectTab);
    window.addEventListener('mousedown', detectClick);
    outlineStyle = true;
  };

  function resetFocusStyle(bool) {
    var outlineStyle = bool ? '' : 'none';
    for(var i = 0; i < focusTab.length; i++) {
      focusTab[i].style.setProperty('outline', outlineStyle);
    }
  };

  function initFocusTabs() {
    if(shouldInit) {
      if(eventDetected) resetFocusStyle(outlineStyle);
      return;
    }
    shouldInit = focusTab.length > 0;
    window.addEventListener('mousedown', detectClick);
  };

  initFocusTabs();
  window.addEventListener('initFocusTabs', initFocusTabs);
}());

function resetFocusTabsStyle() {
  window.dispatchEvent(new CustomEvent('initFocusTabs'));
};
// Utility function
function Util () {};

/* 
	class manipulation functions
*/
Util.hasClass = function(el, className) {
	if (el.classList) return el.classList.contains(className);
	else return !!el.getAttribute('class').match(new RegExp('(\\s|^)' + className + '(\\s|$)'));
};

Util.addClass = function(el, className) {
	var classList = className.split(' ');
 	if (el.classList) el.classList.add(classList[0]);
  else if (!Util.hasClass(el, classList[0])) el.setAttribute('class', el.getAttribute('class') +  " " + classList[0]);
 	if (classList.length > 1) Util.addClass(el, classList.slice(1).join(' '));
};

Util.removeClass = function(el, className) {
	var classList = className.split(' ');
	if (el.classList) el.classList.remove(classList[0]);	
	else if(Util.hasClass(el, classList[0])) {
		var reg = new RegExp('(\\s|^)' + classList[0] + '(\\s|$)');
    el.setAttribute('class', el.getAttribute('class').replace(reg, ' '));
	}
	if (classList.length > 1) Util.removeClass(el, classList.slice(1).join(' '));
};

Util.toggleClass = function(el, className, bool) {
	if(bool) Util.addClass(el, className);
	else Util.removeClass(el, className);
};

Util.setAttributes = function(el, attrs) {
  for(var key in attrs) {
    el.setAttribute(key, attrs[key]);
  }
};

/* 
  DOM manipulation
*/
Util.getChildrenByClassName = function(el, className) {
  var children = el.children,
    childrenByClass = [];
  for (var i = 0; i < el.children.length; i++) {
    if (Util.hasClass(el.children[i], className)) childrenByClass.push(el.children[i]);
  }
  return childrenByClass;
};

Util.is = function(elem, selector) {
  if(selector.nodeType){
    return elem === selector;
  }

  var qa = (typeof(selector) === 'string' ? document.querySelectorAll(selector) : selector),
    length = qa.length,
    returnArr = [];

  while(length--){
    if(qa[length] === elem){
      return true;
    }
  }

  return false;
};

/* 
	Animate height of an element
*/
Util.setHeight = function(start, to, element, duration, cb, timeFunction) {
	var change = to - start,
	    currentTime = null;

  var animateHeight = function(timestamp){  
    if (!currentTime) currentTime = timestamp;         
    var progress = timestamp - currentTime;
    if(progress > duration) progress = duration;
    var val = parseInt((progress/duration)*change + start);
    if(timeFunction) {
      val = Math[timeFunction](progress, start, to - start, duration);
    }
    element.style.height = val+"px";
    if(progress < duration) {
        window.requestAnimationFrame(animateHeight);
    } else {
    	if(cb) cb();
    }
  };
  
  //set the height of the element before starting animation -> fix bug on Safari
  element.style.height = start+"px";
  window.requestAnimationFrame(animateHeight);
};

/* 
	Smooth Scroll
*/

Util.scrollTo = function(final, duration, cb, scrollEl) {
  var element = scrollEl || window;
  var start = element.scrollTop || document.documentElement.scrollTop,
    currentTime = null;

  if(!scrollEl) start = window.scrollY || document.documentElement.scrollTop;
      
  var animateScroll = function(timestamp){
  	if (!currentTime) currentTime = timestamp;        
    var progress = timestamp - currentTime;
    if(progress > duration) progress = duration;
    var val = Math.easeInOutQuad(progress, start, final-start, duration);
    element.scrollTo(0, val);
    if(progress < duration) {
      window.requestAnimationFrame(animateScroll);
    } else {
      cb && cb();
    }
  };

  window.requestAnimationFrame(animateScroll);
};

/* 
  Focus utility classes
*/

//Move focus to an element
Util.moveFocus = function (element) {
  if( !element ) element = document.getElementsByTagName("body")[0];
  element.focus();
  if (document.activeElement !== element) {
    element.setAttribute('tabindex','-1');
    element.focus();
  }
};

/* 
  Misc
*/

Util.getIndexInArray = function(array, el) {
  return Array.prototype.indexOf.call(array, el);
};

Util.cssSupports = function(property, value) {
  if('CSS' in window) {
    return CSS.supports(property, value);
  } else {
    var jsProperty = property.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase();});
    return jsProperty in document.body.style;
  }
};

// merge a set of user options into plugin defaults
// https://gomakethings.com/vanilla-javascript-version-of-jquery-extend/
Util.extend = function() {
  // Variables
  var extended = {};
  var deep = false;
  var i = 0;
  var length = arguments.length;

  // Check if a deep merge
  if ( Object.prototype.toString.call( arguments[0] ) === '[object Boolean]' ) {
    deep = arguments[0];
    i++;
  }

  // Merge the object into the extended object
  var merge = function (obj) {
    for ( var prop in obj ) {
      if ( Object.prototype.hasOwnProperty.call( obj, prop ) ) {
        // If deep merge and property is an object, merge properties
        if ( deep && Object.prototype.toString.call(obj[prop]) === '[object Object]' ) {
          extended[prop] = extend( true, extended[prop], obj[prop] );
        } else {
          extended[prop] = obj[prop];
        }
      }
    }
  };

  // Loop through each object and conduct a merge
  for ( ; i < length; i++ ) {
    var obj = arguments[i];
    merge(obj);
  }

  return extended;
};

// Check if Reduced Motion is enabled
Util.osHasReducedMotion = function() {
  if(!window.matchMedia) return false;
  var matchMediaObj = window.matchMedia('(prefers-reduced-motion: reduce)');
  if(matchMediaObj) return matchMediaObj.matches;
  return false; // return false if not supported
}; 

/* 
	Polyfills
*/
//Closest() method
if (!Element.prototype.matches) {
	Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
}

if (!Element.prototype.closest) {
	Element.prototype.closest = function(s) {
		var el = this;
		if (!document.documentElement.contains(el)) return null;
		do {
			if (el.matches(s)) return el;
			el = el.parentElement || el.parentNode;
		} while (el !== null && el.nodeType === 1); 
		return null;
	};
}

//Custom Event() constructor
if ( typeof window.CustomEvent !== "function" ) {

  function CustomEvent ( event, params ) {
    params = params || { bubbles: false, cancelable: false, detail: undefined };
    var evt = document.createEvent( 'CustomEvent' );
    evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
    return evt;
   }

  CustomEvent.prototype = window.Event.prototype;

  window.CustomEvent = CustomEvent;
}

/* 
	Animation curves
*/
Math.easeInOutQuad = function (t, b, c, d) {
	t /= d/2;
	if (t < 1) return c/2*t*t + b;
	t--;
	return -c/2 * (t*(t-2) - 1) + b;
};

Math.easeInQuart = function (t, b, c, d) {
	t /= d;
	return c*t*t*t*t + b;
};

Math.easeOutQuart = function (t, b, c, d) { 
  t /= d;
	t--;
	return -c * (t*t*t*t - 1) + b;
};

Math.easeInOutQuart = function (t, b, c, d) {
	t /= d/2;
	if (t < 1) return c/2*t*t*t*t + b;
	t -= 2;
	return -c/2 * (t*t*t*t - 2) + b;
};

Math.easeOutElastic = function (t, b, c, d) {
  var s=1.70158;var p=d*0.7;var a=c;
  if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
  if (a < Math.abs(c)) { a=c; var s=p/4; }
  else var s = p/(2*Math.PI) * Math.asin (c/a);
  return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
};


/* JS Utility Classes */

// make focus ring visible only for keyboard navigation (i.e., tab key) 
(function() {
  var focusTab = document.getElementsByClassName('js-tab-focus'),
    shouldInit = false,
    outlineStyle = false,
    eventDetected = false;

  function detectClick() {
    if(focusTab.length > 0) {
      resetFocusStyle(false);
      window.addEventListener('keydown', detectTab);
    }
    window.removeEventListener('mousedown', detectClick);
    outlineStyle = false;
    eventDetected = true;
  };

  function detectTab(event) {
    if(event.keyCode !== 9) return;
    resetFocusStyle(true);
    window.removeEventListener('keydown', detectTab);
    window.addEventListener('mousedown', detectClick);
    outlineStyle = true;
  };

  function resetFocusStyle(bool) {
    var outlineStyle = bool ? '' : 'none';
    for(var i = 0; i < focusTab.length; i++) {
      focusTab[i].style.setProperty('outline', outlineStyle);
    }
  };

  function initFocusTabs() {
    if(shouldInit) {
      if(eventDetected) resetFocusStyle(outlineStyle);
      return;
    }
    shouldInit = focusTab.length > 0;
    window.addEventListener('mousedown', detectClick);
  };

  initFocusTabs();
  window.addEventListener('initFocusTabs', initFocusTabs);
}());

function resetFocusTabsStyle() {
  window.dispatchEvent(new CustomEvent('initFocusTabs'));
};
function Util(){}if(Util.hasClass=function(t,e){return t.classList?t.classList.contains(e):!!t.getAttribute("class").match(new RegExp("(\\s|^)"+e+"(\\s|$)"))},Util.addClass=function(t,e){var n=e.split(" ");t.classList?t.classList.add(n[0]):Util.hasClass(t,n[0])||t.setAttribute("class",t.getAttribute("class")+" "+n[0]),1<n.length&&Util.addClass(t,n.slice(1).join(" "))},Util.removeClass=function(t,e){var n=e.split(" ");if(t.classList)t.classList.remove(n[0]);else if(Util.hasClass(t,n[0])){var o=new RegExp("(\\s|^)"+n[0]+"(\\s|$)");t.setAttribute("class",t.getAttribute("class").replace(o," "))}1<n.length&&Util.removeClass(t,n.slice(1).join(" "))},Util.toggleClass=function(t,e,n){n?Util.addClass(t,e):Util.removeClass(t,e)},Util.setAttributes=function(t,e){for(var n in e)t.setAttribute(n,e[n])},Util.getChildrenByClassName=function(t,e){t.children;for(var n=[],o=0;o<t.children.length;o++)Util.hasClass(t.children[o],e)&&n.push(t.children[o]);return n},Util.is=function(t,e){if(e.nodeType)return t===e;for(var n="string"==typeof e?document.querySelectorAll(e):e,o=n.length;o--;)if(n[o]===t)return!0;return!1},Util.setHeight=function(o,s,i,r,a,l){var u=s-o,c=null,d=function(t){c||(c=t);var e=t-c;r<e&&(e=r);var n=parseInt(e/r*u+o);l&&(n=Math[l](e,o,s-o,r)),i.style.height=n+"px",e<r?window.requestAnimationFrame(d):a&&a()};i.style.height=o+"px",window.requestAnimationFrame(d)},Util.scrollTo=function(o,s,i,t){var r=t||window,a=r.scrollTop||document.documentElement.scrollTop,l=null;t||(a=window.scrollY||document.documentElement.scrollTop);var u=function(t){l||(l=t);var e=t-l;s<e&&(e=s);var n=Math.easeInOutQuad(e,a,o-a,s);r.scrollTo(0,n),e<s?window.requestAnimationFrame(u):i&&i()};window.requestAnimationFrame(u)},Util.moveFocus=function(t){t||(t=document.getElementsByTagName("body")[0]),t.focus(),document.activeElement!==t&&(t.setAttribute("tabindex","-1"),t.focus())},Util.getIndexInArray=function(t,e){return Array.prototype.indexOf.call(t,e)},Util.cssSupports=function(t,e){return"CSS"in window?CSS.supports(t,e):t.replace(/-([a-z])/g,function(t){return t[1].toUpperCase()})in document.body.style},Util.extend=function(){var n={},o=!1,t=0,e=arguments.length;"[object Boolean]"===Object.prototype.toString.call(arguments[0])&&(o=arguments[0],t++);for(var s=function(t){for(var e in t)Object.prototype.hasOwnProperty.call(t,e)&&(o&&"[object Object]"===Object.prototype.toString.call(t[e])?n[e]=extend(!0,n[e],t[e]):n[e]=t[e])};t<e;t++){s(arguments[t])}return n},Util.osHasReducedMotion=function(){if(!window.matchMedia)return!1;var t=window.matchMedia("(prefers-reduced-motion: reduce)");return!!t&&t.matches},Element.prototype.matches||(Element.prototype.matches=Element.prototype.msMatchesSelector||Element.prototype.webkitMatchesSelector),Element.prototype.closest||(Element.prototype.closest=function(t){var e=this;if(!document.documentElement.contains(e))return null;do{if(e.matches(t))return e;e=e.parentElement||e.parentNode}while(null!==e&&1===e.nodeType);return null}),"function"!=typeof window.CustomEvent){function CustomEvent(t,e){e=e||{bubbles:!1,cancelable:!1,detail:void 0};var n=document.createEvent("CustomEvent");return n.initCustomEvent(t,e.bubbles,e.cancelable,e.detail),n}CustomEvent.prototype=window.Event.prototype,window.CustomEvent=CustomEvent}function resetFocusTabsStyle(){window.dispatchEvent(new CustomEvent("initFocusTabs"))}Math.easeInOutQuad=function(t,e,n,o){return(t/=o/2)<1?n/2*t*t+e:-n/2*(--t*(t-2)-1)+e},Math.easeInQuart=function(t,e,n,o){return n*(t/=o)*t*t*t+e},Math.easeOutQuart=function(t,e,n,o){return t/=o,-n*(--t*t*t*t-1)+e},Math.easeInOutQuart=function(t,e,n,o){return(t/=o/2)<1?n/2*t*t*t*t+e:-n/2*((t-=2)*t*t*t-2)+e},Math.easeOutElastic=function(t,e,n,o){var s=1.70158,i=.7*o,r=n;if(0==t)return e;if(1==(t/=o))return e+n;if(i||(i=.3*o),r<Math.abs(n)){r=n;s=i/4}else s=i/(2*Math.PI)*Math.asin(n/r);return r*Math.pow(2,-10*t)*Math.sin((t*o-s)*(2*Math.PI)/i)+n+e},function(){var o=document.getElementsByClassName("js-tab-focus"),t=!1,e=!1,n=!1;function s(){0<o.length&&(r(!1),window.addEventListener("keydown",i)),window.removeEventListener("mousedown",s),n=!(e=!1)}function i(t){9===t.keyCode&&(r(!0),window.removeEventListener("keydown",i),window.addEventListener("mousedown",s),e=!0)}function r(t){for(var e=t?"":"none",n=0;n<o.length;n++)o[n].style.setProperty("outline",e)}function a(){t?n&&r(e):(t=0<o.length,window.addEventListener("mousedown",s))}a(),window.addEventListener("initFocusTabs",a)}();
// Utility function
function Util () {};

/* 
	class manipulation functions
*/
Util.hasClass = function(el, className) {
	if (el.classList) return el.classList.contains(className);
	else return !!el.getAttribute('class').match(new RegExp('(\\s|^)' + className + '(\\s|$)'));
};

Util.addClass = function(el, className) {
	var classList = className.split(' ');
 	if (el.classList) el.classList.add(classList[0]);
  else if (!Util.hasClass(el, classList[0])) el.setAttribute('class', el.getAttribute('class') +  " " + classList[0]);
 	if (classList.length > 1) Util.addClass(el, classList.slice(1).join(' '));
};

Util.removeClass = function(el, className) {
	var classList = className.split(' ');
	if (el.classList) el.classList.remove(classList[0]);	
	else if(Util.hasClass(el, classList[0])) {
		var reg = new RegExp('(\\s|^)' + classList[0] + '(\\s|$)');
    el.setAttribute('class', el.getAttribute('class').replace(reg, ' '));
	}
	if (classList.length > 1) Util.removeClass(el, classList.slice(1).join(' '));
};

Util.toggleClass = function(el, className, bool) {
	if(bool) Util.addClass(el, className);
	else Util.removeClass(el, className);
};

Util.setAttributes = function(el, attrs) {
  for(var key in attrs) {
    el.setAttribute(key, attrs[key]);
  }
};

/* 
  DOM manipulation
*/
Util.getChildrenByClassName = function(el, className) {
  var children = el.children,
    childrenByClass = [];
  for (var i = 0; i < el.children.length; i++) {
    if (Util.hasClass(el.children[i], className)) childrenByClass.push(el.children[i]);
  }
  return childrenByClass;
};

Util.is = function(elem, selector) {
  if(selector.nodeType){
    return elem === selector;
  }

  var qa = (typeof(selector) === 'string' ? document.querySelectorAll(selector) : selector),
    length = qa.length,
    returnArr = [];

  while(length--){
    if(qa[length] === elem){
      return true;
    }
  }

  return false;
};

/* 
	Animate height of an element
*/
Util.setHeight = function(start, to, element, duration, cb, timeFunction) {
	var change = to - start,
	    currentTime = null;

  var animateHeight = function(timestamp){  
    if (!currentTime) currentTime = timestamp;         
    var progress = timestamp - currentTime;
    if(progress > duration) progress = duration;
    var val = parseInt((progress/duration)*change + start);
    if(timeFunction) {
      val = Math[timeFunction](progress, start, to - start, duration);
    }
    element.style.height = val+"px";
    if(progress < duration) {
        window.requestAnimationFrame(animateHeight);
    } else {
    	if(cb) cb();
    }
  };
  
  //set the height of the element before starting animation -> fix bug on Safari
  element.style.height = start+"px";
  window.requestAnimationFrame(animateHeight);
};

/* 
	Smooth Scroll
*/

Util.scrollTo = function(final, duration, cb, scrollEl) {
  var element = scrollEl || window;
  var start = element.scrollTop || document.documentElement.scrollTop,
    currentTime = null;

  if(!scrollEl) start = window.scrollY || document.documentElement.scrollTop;
      
  var animateScroll = function(timestamp){
  	if (!currentTime) currentTime = timestamp;        
    var progress = timestamp - currentTime;
    if(progress > duration) progress = duration;
    var val = Math.easeInOutQuad(progress, start, final-start, duration);
    element.scrollTo(0, val);
    if(progress < duration) {
      window.requestAnimationFrame(animateScroll);
    } else {
      cb && cb();
    }
  };

  window.requestAnimationFrame(animateScroll);
};

/* 
  Focus utility classes
*/

//Move focus to an element
Util.moveFocus = function (element) {
  if( !element ) element = document.getElementsByTagName("body")[0];
  element.focus();
  if (document.activeElement !== element) {
    element.setAttribute('tabindex','-1');
    element.focus();
  }
};

/* 
  Misc
*/

Util.getIndexInArray = function(array, el) {
  return Array.prototype.indexOf.call(array, el);
};

Util.cssSupports = function(property, value) {
  if('CSS' in window) {
    return CSS.supports(property, value);
  } else {
    var jsProperty = property.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase();});
    return jsProperty in document.body.style;
  }
};

// merge a set of user options into plugin defaults
// https://gomakethings.com/vanilla-javascript-version-of-jquery-extend/
Util.extend = function() {
  // Variables
  var extended = {};
  var deep = false;
  var i = 0;
  var length = arguments.length;

  // Check if a deep merge
  if ( Object.prototype.toString.call( arguments[0] ) === '[object Boolean]' ) {
    deep = arguments[0];
    i++;
  }

  // Merge the object into the extended object
  var merge = function (obj) {
    for ( var prop in obj ) {
      if ( Object.prototype.hasOwnProperty.call( obj, prop ) ) {
        // If deep merge and property is an object, merge properties
        if ( deep && Object.prototype.toString.call(obj[prop]) === '[object Object]' ) {
          extended[prop] = extend( true, extended[prop], obj[prop] );
        } else {
          extended[prop] = obj[prop];
        }
      }
    }
  };

  // Loop through each object and conduct a merge
  for ( ; i < length; i++ ) {
    var obj = arguments[i];
    merge(obj);
  }

  return extended;
};

// Check if Reduced Motion is enabled
Util.osHasReducedMotion = function() {
  if(!window.matchMedia) return false;
  var matchMediaObj = window.matchMedia('(prefers-reduced-motion: reduce)');
  if(matchMediaObj) return matchMediaObj.matches;
  return false; // return false if not supported
}; 

/* 
	Polyfills
*/
//Closest() method
if (!Element.prototype.matches) {
	Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
}

if (!Element.prototype.closest) {
	Element.prototype.closest = function(s) {
		var el = this;
		if (!document.documentElement.contains(el)) return null;
		do {
			if (el.matches(s)) return el;
			el = el.parentElement || el.parentNode;
		} while (el !== null && el.nodeType === 1); 
		return null;
	};
}

//Custom Event() constructor
if ( typeof window.CustomEvent !== "function" ) {

  function CustomEvent ( event, params ) {
    params = params || { bubbles: false, cancelable: false, detail: undefined };
    var evt = document.createEvent( 'CustomEvent' );
    evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
    return evt;
   }

  CustomEvent.prototype = window.Event.prototype;

  window.CustomEvent = CustomEvent;
}

/* 
	Animation curves
*/
Math.easeInOutQuad = function (t, b, c, d) {
	t /= d/2;
	if (t < 1) return c/2*t*t + b;
	t--;
	return -c/2 * (t*(t-2) - 1) + b;
};

Math.easeInQuart = function (t, b, c, d) {
	t /= d;
	return c*t*t*t*t + b;
};

Math.easeOutQuart = function (t, b, c, d) { 
  t /= d;
	t--;
	return -c * (t*t*t*t - 1) + b;
};

Math.easeInOutQuart = function (t, b, c, d) {
	t /= d/2;
	if (t < 1) return c/2*t*t*t*t + b;
	t -= 2;
	return -c/2 * (t*t*t*t - 2) + b;
};

Math.easeOutElastic = function (t, b, c, d) {
  var s=1.70158;var p=d*0.7;var a=c;
  if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
  if (a < Math.abs(c)) { a=c; var s=p/4; }
  else var s = p/(2*Math.PI) * Math.asin (c/a);
  return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
};


/* JS Utility Classes */

// make focus ring visible only for keyboard navigation (i.e., tab key) 
(function() {
  var focusTab = document.getElementsByClassName('js-tab-focus'),
    shouldInit = false,
    outlineStyle = false,
    eventDetected = false;

  function detectClick() {
    if(focusTab.length > 0) {
      resetFocusStyle(false);
      window.addEventListener('keydown', detectTab);
    }
    window.removeEventListener('mousedown', detectClick);
    outlineStyle = false;
    eventDetected = true;
  };

  function detectTab(event) {
    if(event.keyCode !== 9) return;
    resetFocusStyle(true);
    window.removeEventListener('keydown', detectTab);
    window.addEventListener('mousedown', detectClick);
    outlineStyle = true;
  };

  function resetFocusStyle(bool) {
    var outlineStyle = bool ? '' : 'none';
    for(var i = 0; i < focusTab.length; i++) {
      focusTab[i].style.setProperty('outline', outlineStyle);
    }
  };

  function initFocusTabs() {
    if(shouldInit) {
      if(eventDetected) resetFocusStyle(outlineStyle);
      return;
    }
    shouldInit = focusTab.length > 0;
    window.addEventListener('mousedown', detectClick);
  };

  initFocusTabs();
  window.addEventListener('initFocusTabs', initFocusTabs);
}());

function resetFocusTabsStyle() {
  window.dispatchEvent(new CustomEvent('initFocusTabs'));
};
// File#: _1_accordion
// Usage: codyhouse.co/license
(function () {
	var Accordion = function (element) {
		this.element = element;
		this.items = Util.getChildrenByClassName(this.element, 'js-accordion__item');
		this.version = this.element.getAttribute('data-version') ? '-' + this.element.getAttribute('data-version') : '';
		this.showClass = 'accordion' + this.version + '__item--is-open';
		this.animateHeight = (this.element.getAttribute('data-animation') == 'on');
		this.multiItems = !(this.element.getAttribute('data-multi-items') == 'off');
		// deep linking options
		this.deepLinkOn = this.element.getAttribute('data-deep-link') == 'on';
		// init accordion
		this.initAccordion();
	};

	Accordion.prototype.initAccordion = function () {
		//set initial aria attributes
		for (var i = 0; i < this.items.length; i++) {
			var button = this.items[i].getElementsByTagName('button')[0],
				content = this.items[i].getElementsByClassName('js-accordion__panel')[0],
				isOpen = Util.hasClass(this.items[i], this.showClass) ? 'true' : 'false';
			Util.setAttributes(button, { 'aria-expanded': isOpen, 'aria-controls': 'accordion-content-' + i, 'id': 'accordion-header-' + i });
			Util.addClass(button, 'js-accordion__trigger');
			Util.setAttributes(content, { 'aria-labelledby': 'accordion-header-' + i, 'id': 'accordion-content-' + i });
		}

		//listen for Accordion events
		this.initAccordionEvents();

		// check deep linking option
		this.initDeepLink();
	};

	Accordion.prototype.initAccordionEvents = function () {
		var self = this;

		this.element.addEventListener('click', function (event) {
			var trigger = event.target.closest('.js-accordion__trigger');
			//check index to make sure the click didn't happen inside a children accordion
			if (trigger && Util.getIndexInArray(self.items, trigger.parentElement) >= 0) self.triggerAccordion(trigger);
		});
	};

	Accordion.prototype.triggerAccordion = function (trigger) {
		var bool = (trigger.getAttribute('aria-expanded') === 'true');

		this.animateAccordion(trigger, bool, false);

		if (!bool && this.deepLinkOn) {
			history.replaceState(null, '', '#' + trigger.getAttribute('aria-controls'));
		}
	};

	Accordion.prototype.animateAccordion = function (trigger, bool, deepLink) {
		var self = this;
		var item = trigger.closest('.js-accordion__item'),
			content = item.getElementsByClassName('js-accordion__panel')[0],
			ariaValue = bool ? 'false' : 'true';

		if (!bool) Util.addClass(item, this.showClass);
		trigger.setAttribute('aria-expanded', ariaValue);
		self.resetContentVisibility(item, content, bool);

		if (!this.multiItems && !bool || deepLink) this.closeSiblings(item);
	};

	Accordion.prototype.resetContentVisibility = function (item, content, bool) {
		Util.toggleClass(item, this.showClass, !bool);
		content.removeAttribute("style");
		if (bool && !this.multiItems) { // accordion item has been closed -> check if there's one open to move inside viewport 
			this.moveContent();
		}
	};

	Accordion.prototype.closeSiblings = function (item) {
		//if only one accordion can be open -> search if there's another one open
		var index = Util.getIndexInArray(this.items, item);
		for (var i = 0; i < this.items.length; i++) {
			if (Util.hasClass(this.items[i], this.showClass) && i != index) {
				this.animateAccordion(this.items[i].getElementsByClassName('js-accordion__trigger')[0], true, false);
				return false;
			}
		}
	};

	Accordion.prototype.moveContent = function () { // make sure title of the accordion just opened is inside the viewport
		var openAccordion = this.element.getElementsByClassName(this.showClass);
		if (openAccordion.length == 0) return;
		var boundingRect = openAccordion[0].getBoundingClientRect();
		if (boundingRect.top < 0 || boundingRect.top > window.innerHeight) {
			var windowScrollTop = window.scrollY || document.documentElement.scrollTop;
			window.scrollTo(0, boundingRect.top + windowScrollTop);
		}
	};

	Accordion.prototype.initDeepLink = function () {
		if (!this.deepLinkOn) return;
		var hash = window.location.hash.substr(1);
		if (!hash || hash == '') return;
		var trigger = this.element.querySelector('.js-accordion__trigger[aria-controls="' + hash + '"]');
		if (trigger && trigger.getAttribute('aria-expanded') !== 'true') {
			this.animateAccordion(trigger, false, true);
			setTimeout(function () { trigger.scrollIntoView(true); });
		}
	};

	window.Accordion = Accordion;

	//initialize the Accordion objects
	var accordions = document.getElementsByClassName('js-accordion');
	if (accordions.length > 0) {
		for (var i = 0; i < accordions.length; i++) {
			(function (i) { new Accordion(accordions[i]); })(i);
		}
	}
}());
// File#: _1_anim-menu-btn
// Usage: codyhouse.co/license
(function () {
  var menuBtns = document.getElementsByClassName('js-anim-menu-btn');
  if (menuBtns.length > 0) {
    for (var i = 0; i < menuBtns.length; i++) {
      (function (i) {
        initMenuBtn(menuBtns[i]);
      })(i);
    }

    function initMenuBtn(btn) {
      btn.addEventListener('click', function (event) {
        event.preventDefault();
        var status = !Util.hasClass(btn, 'anim-menu-btn--state-b');
        Util.toggleClass(btn, 'anim-menu-btn--state-b', status);
        // emit custom event
        var event = new CustomEvent('anim-menu-btn-clicked', { detail: status });
        btn.dispatchEvent(event);
      });
    };
  }
}());
// File#: _1_article-preview-v3
// Usage: codyhouse.co/license
(function () {
  var Story3 = function (element) {
    this.element = element;
    // data attributes
    this.src = this.element.getAttribute('data-story-img-src');
    this.align = this.element.getAttribute('data-story-img-align') ? this.element.getAttribute('data-story-img-align') : 'right';
    this.offset = this.element.getAttribute('data-story-img-offset-x') ? this.element.getAttribute('data-story-img-offset-x') : '0px';
    this.width = this.element.getAttribute('data-story-img-width') ? this.element.getAttribute('data-story-img-width') : '30%';
    this.customClasses = this.element.getAttribute('data-story-img-class') ? this.element.getAttribute('data-story-img-class') : 'display@lg';
    // preview classes
    this.previewClass = 'story-v3__preview-img js-story-v3__preview-img' + ' ' + this.customClasses;
    this.previewVisibleClass = 'story-v3__preview-img--is-visible';
    this.preview = false; // will use this to store the preview img element
    // params needed for event listening
    this.eventBind = false;
    this.mousePosition = false;
    // used during mousemove
    this.previewMoving = false;
    initStory3(this);
  };

  function initStory3(story) {
    // create img preview element
    createPreview(story);
    // bind events
    story.eventBind = handleEvent.bind(story);
    story.element.addEventListener('mouseenter', story.eventBind);
  };

  function createPreview(story) {
    story.preview = document.createElement('img');
    story.element.appendChild(story.preview);
    Util.addClass(story.preview, story.previewClass);
    Util.setAttributes(story.preview, { 'aria-hidden': true, 'src': story.src });
  };

  function handleEvent(event) {
    switch (event.type) {
      case 'mouseenter': {
        showPreview(this, event);
        break;
      }
      case 'mouseleave': {
        hidePreview(this, event);
        break;
      }
      case 'mousemove': {
        movePreview(this, event);
        break;
      }
    }
  };

  function showPreview(story, event) {
    // show preview
    story.preview.setAttribute('style', getPreviewStyle(story));
    Util.addClass(story.preview, story.previewVisibleClass);
    // bind events
    story.element.addEventListener('mouseleave', story.eventBind);
    story.element.addEventListener('mousemove', story.eventBind);
    // store mouse position
    story.mousePosition = [event.clientX, event.clientY];
  };

  function hidePreview(story, event) {
    // hide image
    Util.removeClass(story.preview, story.previewVisibleClass);
    story.preview.style.transform = '';
    // remove events
    story.element.removeEventListener('mouseleave', story.eventBind);
    story.element.removeEventListener('mousemove', story.eventBind);
  };

  function movePreview(story, event) { // parallax effect
    if (story.previewMoving) return;
    story.previewMoving = true;
    window.requestAnimationFrame(function () {
      updatePreviewPosition(story, event);
      story.previewMoving = false;
    });
  };

  function updatePreviewPosition(story, event) {
    // move preview image
    var translateX = event.clientX - story.mousePosition[0],
      translateY = event.clientY - story.mousePosition[1];
    translateX = resetTranslateValue(translateX);
    translateY = resetTranslateValue(translateY);
    story.preview.style.transform = 'translateY(calc(-50% + ' + translateY + 'px)) translateX(' + translateX + 'px)';
  };

  function getPreviewStyle(story) {
    var storyRect = story.element.getBoundingClientRect(),
      horizontalStyle = '';
    if (story.align == 'right') {
      horizontalStyle = 'right:' + getValue(storyRect.width, story.offset) + 'px;';
    } else {
      horizontalStyle = 'left:' + getValue(storyRect.width, story.offset) + 'px;';
    }
    var style = 'width: ' + getValue(storyRect.width, story.width) + 'px;' + horizontalStyle;

    return style;
  };

  function getValue(width, val) {
    if (val.indexOf('%') > -1) {
      return width * parseInt(val) / 100;
    } else {
      return parseInt(val);
    }
  };

  function resetTranslateValue(val) {
    return parseInt(val / 30);
  };

  window.Story3 = Story3;

  // init the Story3 objects
  var story3 = document.getElementsByClassName('js-story-v3');
  if (story3.length > 0) {
    for (var i = 0; i < story3.length; i++) {
      (function (i) { new Story3(story3[i]); })(i);
    }
  }
}());
// File#: _1_back-to-top
// Usage: codyhouse.co/license
(function() {
  var backTop = document.getElementsByClassName('js-back-to-top')[0];
  if( backTop ) {
    var dataElement = backTop.getAttribute('data-element');
    var scrollElement = dataElement ? document.querySelector(dataElement) : window;
    var scrollDuration = parseInt(backTop.getAttribute('data-duration')) || 300, //scroll to top duration
      scrollOffsetInit = parseInt(backTop.getAttribute('data-offset-in')) || parseInt(backTop.getAttribute('data-offset')) || 0, //show back-to-top if scrolling > scrollOffset
      scrollOffsetOutInit = parseInt(backTop.getAttribute('data-offset-out')) || 0, 
      scrollOffset = 0,
      scrollOffsetOut = 0,
      scrolling = false;

    // check if target-in/target-out have been set
    var targetIn = backTop.getAttribute('data-target-in') ? document.querySelector(backTop.getAttribute('data-target-in')) : false,
      targetOut = backTop.getAttribute('data-target-out') ? document.querySelector(backTop.getAttribute('data-target-out')) : false;

    updateOffsets();
    
    //detect click on back-to-top link
    backTop.addEventListener('click', function(event) {
      event.preventDefault();
      if(!window.requestAnimationFrame) {
        scrollElement.scrollTo(0, 0);
      } else {
        dataElement ? Util.scrollTo(0, scrollDuration, false, scrollElement) : Util.scrollTo(0, scrollDuration);
      } 
      //move the focus to the #top-element - don't break keyboard navigation
      Util.moveFocus(document.getElementById(backTop.getAttribute('href').replace('#', '')));
    });
    
    //listen to the window scroll and update back-to-top visibility
    checkBackToTop();
    if (scrollOffset > 0 || scrollOffsetOut > 0) {
      scrollElement.addEventListener("scroll", function(event) {
        if( !scrolling ) {
          scrolling = true;
          (!window.requestAnimationFrame) ? setTimeout(function(){checkBackToTop();}, 250) : window.requestAnimationFrame(checkBackToTop);
        }
      });
    }

    function checkBackToTop() {
      updateOffsets();
      var windowTop = scrollElement.scrollTop || document.documentElement.scrollTop;
      if(!dataElement) windowTop = window.scrollY || document.documentElement.scrollTop;
      var condition =  windowTop >= scrollOffset;
      if(scrollOffsetOut > 0) {
        condition = (windowTop >= scrollOffset) && (window.innerHeight + windowTop < scrollOffsetOut);
      }
      Util.toggleClass(backTop, 'back-to-top--is-visible', condition);
      scrolling = false;
    }

    function updateOffsets() {
      scrollOffset = getOffset(targetIn, scrollOffsetInit, true);
      scrollOffsetOut = getOffset(targetOut, scrollOffsetOutInit);
    }

    function getOffset(target, startOffset, bool) {
      var offset = 0;
      if(target) {
        var windowTop = scrollElement.scrollTop || document.documentElement.scrollTop;
        if(!dataElement) windowTop = window.scrollY || document.documentElement.scrollTop;
        var boundingClientRect = target.getBoundingClientRect();
        offset = bool ? boundingClientRect.bottom : boundingClientRect.top;
        offset = offset + windowTop;
      }
      if(startOffset && startOffset) {
        offset = offset + parseInt(startOffset);
      }
      return offset;
    }
  }
}());
// File#: _1_color-swatches
// Usage: codyhouse.co/license
(function () {
  var ColorSwatches = function (element) {
    this.element = element;
    this.select = false;
    initCustomSelect(this); // replace <select> with custom <ul> list
    this.list = this.element.getElementsByClassName('js-color-swatches__list')[0];
    this.swatches = this.list.getElementsByClassName('js-color-swatches__option');
    this.labels = this.list.getElementsByClassName('js-color-swatch__label');
    this.selectedLabel = this.element.getElementsByClassName('js-color-swatches__color');
    this.focusOutId = false;
    initColorSwatches(this);
  };

  function initCustomSelect(element) {
    var select = element.element.getElementsByClassName('js-color-swatches__select');
    if (select.length == 0) return;
    element.select = select[0];
    var customContent = '';
    for (var i = 0; i < element.select.options.length; i++) {
      var ariaChecked = i == element.select.selectedIndex ? 'true' : 'false',
        customClass = i == element.select.selectedIndex ? ' color-swatches__item--selected' : '',
        customAttributes = getSwatchCustomAttr(element.select.options[i]);
      customContent = customContent + '<li class="color-swatches__item js-color-swatches__item' + customClass + '" role="radio" aria-checked="' + ariaChecked + '" data-value="' + element.select.options[i].value + '"><span class="js-color-swatches__option js-tab-focus" tabindex="0"' + customAttributes + '><span class="sr-only js-color-swatch__label">' + element.select.options[i].text + '</span><span aria-hidden="true" style="' + element.select.options[i].getAttribute('data-style') + '" class="color-swatches__swatch"></span></span></li>';
    }

    var list = document.createElement("ul");
    Util.setAttributes(list, { 'class': 'color-swatches__list js-color-swatches__list', 'role': 'radiogroup' });

    list.innerHTML = customContent;
    element.element.insertBefore(list, element.select);
    Util.addClass(element.select, 'is-hidden');
  };

  function initColorSwatches(element) {
    // detect focusin/focusout event - update selected color label
    element.list.addEventListener('focusin', function (event) {
      if (element.focusOutId) clearTimeout(element.focusOutId);
      updateSelectedLabel(element, document.activeElement);
    });
    element.list.addEventListener('focusout', function (event) {
      element.focusOutId = setTimeout(function () {
        resetSelectedLabel(element);
      }, 200);
    });

    // mouse move events
    for (var i = 0; i < element.swatches.length; i++) {
      handleHoverEvents(element, i);
    }

    // --select variation only
    if (element.select) {
      // click event - select new option
      element.list.addEventListener('click', function (event) {
        // update selected option
        resetSelectedOption(element, event.target);
      });

      // space key - select new option
      element.list.addEventListener('keydown', function (event) {
        if ((event.keyCode && event.keyCode == 32 || event.key && event.key == ' ') || (event.keyCode && event.keyCode == 13 || event.key && event.key.toLowerCase() == 'enter')) {
          // update selected option
          resetSelectedOption(element, event.target);
        }
      });
    }
  };

  function handleHoverEvents(element, index) {
    element.swatches[index].addEventListener('mouseenter', function (event) {
      updateSelectedLabel(element, element.swatches[index]);
    });
    element.swatches[index].addEventListener('mouseleave', function (event) {
      resetSelectedLabel(element);
    });
  };

  function resetSelectedOption(element, target) { // for --select variation only - new option selected
    var option = target.closest('.js-color-swatches__item');
    if (!option) return;
    var selectedSwatch = element.list.querySelector('.color-swatches__item--selected');
    if (selectedSwatch) {
      Util.removeClass(selectedSwatch, 'color-swatches__item--selected');
      selectedSwatch.setAttribute('aria-checked', 'false');
    }
    Util.addClass(option, 'color-swatches__item--selected');
    option.setAttribute('aria-checked', 'true');
    // update select element
    updateNativeSelect(element.select, option.getAttribute('data-value'));
  };

  function resetSelectedLabel(element) {
    var selectedSwatch = element.list.getElementsByClassName('color-swatches__item--selected');
    if (selectedSwatch.length > 0) updateSelectedLabel(element, selectedSwatch[0]);
  };

  function updateSelectedLabel(element, swatch) {
    var newLabel = swatch.getElementsByClassName('js-color-swatch__label');
    if (newLabel.length == 0) return;
    element.selectedLabel[0].textContent = newLabel[0].textContent;
  };

  function updateNativeSelect(select, value) {
    for (var i = 0; i < select.options.length; i++) {
      if (select.options[i].value == value) {
        select.selectedIndex = i; // set new value
        select.dispatchEvent(new CustomEvent('change')); // trigger change event
        break;
      }
    }
  };

  function getSwatchCustomAttr(swatch) {
    var customAttrArray = swatch.getAttribute('data-custom-attr');
    if (!customAttrArray) return '';
    var customAttr = ' ',
      list = customAttrArray.split(',');
    for (var i = 0; i < list.length; i++) {
      var attr = list[i].split(':')
      customAttr = customAttr + attr[0].trim() + '="' + attr[1].trim() + '" ';
    }
    return customAttr;
  };

  //initialize the ColorSwatches objects
  var swatches = document.getElementsByClassName('js-color-swatches');
  if (swatches.length > 0) {
    for (var i = 0; i < swatches.length; i++) {
      new ColorSwatches(swatches[i]);
    }
  }
}());
// File#: _1_countdown
// Usage: codyhouse.co/license
(function () {
  var CountDown = function (element) {
    this.element = element;
    this.labels = this.element.getAttribute('data-labels') ? this.element.getAttribute('data-labels').split(',') : [];
    this.intervalId;
    // set visible labels
    this.setVisibleLabels();
    //create countdown HTML
    this.createCountDown();
    //store time elements
    this.days = this.element.getElementsByClassName('js-countdown__value--0')[0];
    this.hours = this.element.getElementsByClassName('js-countdown__value--1')[0];
    this.mins = this.element.getElementsByClassName('js-countdown__value--2')[0];
    this.secs = this.element.getElementsByClassName('js-countdown__value--3')[0];
    this.endTime = this.getEndTime();
    //init counter
    this.initCountDown();
  };

  CountDown.prototype.setVisibleLabels = function () {
    this.visibleLabels = this.element.getAttribute('data-visible-labels') ? this.element.getAttribute('data-visible-labels').split(',') : [];
    this.visibleLabels = this.visibleLabels.map(function (label) {
      return label.trim();
    });
  };

  CountDown.prototype.createCountDown = function () {
    var wrapper = document.createElement("div");
    Util.setAttributes(wrapper, { 'aria-hidden': 'true', 'class': 'countdown__timer' });

    for (var i = 0; i < 4; i++) {
      var timeItem = document.createElement("span"),
        timeValue = document.createElement("span"),
        timeLabel = document.createElement('span');

      timeItem.setAttribute('class', 'countdown__item');
      timeValue.setAttribute('class', 'countdown__value countdown__value--' + i + ' js-countdown__value--' + i);
      timeItem.appendChild(timeValue);

      if (this.labels && this.labels.length > 0) {
        timeLabel.textContent = this.labels[i].trim();
        timeLabel.setAttribute('class', 'countdown__label');
        timeItem.appendChild(timeLabel);
      }

      wrapper.appendChild(timeItem);
    }
    // append new content to countdown element
    this.element.insertBefore(wrapper, this.element.firstChild);
    // this.element.appendChild(wrapper);
  };

  CountDown.prototype.getEndTime = function () {
    // get number of remaining seconds 
    if (this.element.getAttribute('data-timer')) return Number(this.element.getAttribute('data-timer')) * 1000 + new Date().getTime();
    else if (this.element.getAttribute('data-countdown')) return Number(new Date(this.element.getAttribute('data-countdown')).getTime());
  };

  CountDown.prototype.initCountDown = function () {
    var self = this;
    this.intervalId = setInterval(function () {
      self.updateCountDown(false);
    }, 1000);
    this.updateCountDown(true);
  };

  CountDown.prototype.updateCountDown = function (bool) {
    // original countdown function
    // https://gist.github.com/adriennetacke/f5a25c304f1b7b4a6fa42db70415bad2
    var time = parseInt((this.endTime - new Date().getTime()) / 1000),
      days = 0,
      hours = 0,
      mins = 0,
      seconds = 0;

    if (isNaN(time) || time < 0) {
      clearInterval(this.intervalId);
      this.emitEndEvent();
    } else {
      days = parseInt(time / 86400);
      time = (time % 86400);
      hours = parseInt(time / 3600);
      time = (time % 3600);
      mins = parseInt(time / 60);
      time = (time % 60);
      seconds = parseInt(time);
    }

    // hide days/hours/mins if not available 
    if (bool && days == 0 && this.visibleLabels.indexOf('d') < 0) this.days.parentElement.style.display = "none";
    if (bool && days == 0 && hours == 0 && this.visibleLabels.indexOf('h') < 0) this.hours.parentElement.style.display = "none";
    if (bool && days == 0 && hours == 0 && mins == 0 && this.visibleLabels.indexOf('m') < 0) this.mins.parentElement.style.display = "none";

    this.days.textContent = days;
    this.hours.textContent = this.getTimeFormat(hours);
    this.mins.textContent = this.getTimeFormat(mins);
    this.secs.textContent = this.getTimeFormat(seconds);
  };

  CountDown.prototype.getTimeFormat = function (time) {
    return ('0' + time).slice(-2);
  };

  CountDown.prototype.emitEndEvent = function (time) {
    var event = new CustomEvent('countDownFinished');
    this.element.dispatchEvent(event);
  };

  //initialize the CountDown objects
  var countDown = document.getElementsByClassName('js-countdown');
  if (countDown.length > 0) {
    for (var i = 0; i < countDown.length; i++) {
      (function (i) { new CountDown(countDown[i]); })(i);
    }
  }
}());
// File#: _1_custom-select
// Usage: codyhouse.co/license
(function () {
  // NOTE: you need the js code only when using the --custom-dropdown variation of the Custom Select component. Default version does nor require JS.

  var CustomSelect = function (element) {
    this.element = element;
    this.select = this.element.getElementsByTagName('select')[0];
    this.optGroups = this.select.getElementsByTagName('optgroup');
    this.options = this.select.getElementsByTagName('option');
    this.selectedOption = getSelectedOptionText(this);
    this.selectId = this.select.getAttribute('id');
    this.trigger = false;
    this.dropdown = false;
    this.customOptions = false;
    this.arrowIcon = this.element.getElementsByTagName('svg');
    this.label = document.querySelector('[for="' + this.selectId + '"]');

    this.optionIndex = 0; // used while building the custom dropdown

    initCustomSelect(this); // init markup
    initCustomSelectEvents(this); // init event listeners
  };

  function initCustomSelect(select) {
    // create the HTML for the custom dropdown element
    select.element.insertAdjacentHTML('beforeend', initButtonSelect(select) + initListSelect(select));

    // save custom elements
    select.dropdown = select.element.getElementsByClassName('js-select__dropdown')[0];
    select.trigger = select.element.getElementsByClassName('js-select__button')[0];
    select.customOptions = select.dropdown.getElementsByClassName('js-select__item');

    // hide default select
    Util.addClass(select.select, 'is-hidden');
    if (select.arrowIcon.length > 0) select.arrowIcon[0].style.display = 'none';

    // place dropdown
    placeDropdown(select);
  };

  function initCustomSelectEvents(select) {
    // option selection in dropdown
    initSelection(select);

    // click events
    select.trigger.addEventListener('click', function () {
      toggleCustomSelect(select, false);
    });
    if (select.label) {
      // move focus to custom trigger when clicking on <select> label
      select.label.addEventListener('click', function () {
        Util.moveFocus(select.trigger);
      });
    }
    // keyboard navigation
    select.dropdown.addEventListener('keydown', function (event) {
      if (event.keyCode && event.keyCode == 38 || event.key && event.key.toLowerCase() == 'arrowup') {
        keyboardCustomSelect(select, 'prev', event);
      } else if (event.keyCode && event.keyCode == 40 || event.key && event.key.toLowerCase() == 'arrowdown') {
        keyboardCustomSelect(select, 'next', event);
      }
    });
    // native <select> element has been updated -> update custom select as well
    select.element.addEventListener('select-updated', function (event) {
      resetCustomSelect(select);
    });
  };

  function toggleCustomSelect(select, bool) {
    var ariaExpanded;
    if (bool) {
      ariaExpanded = bool;
    } else {
      ariaExpanded = select.trigger.getAttribute('aria-expanded') == 'true' ? 'false' : 'true';
    }
    select.trigger.setAttribute('aria-expanded', ariaExpanded);
    if (ariaExpanded == 'true') {
      var selectedOption = getSelectedOption(select);
      Util.moveFocus(selectedOption); // fallback if transition is not supported
      select.dropdown.addEventListener('transitionend', function cb() {
        Util.moveFocus(selectedOption);
        select.dropdown.removeEventListener('transitionend', cb);
      });
      placeDropdown(select); // place dropdown based on available space
    }
  };

  function placeDropdown(select) {
    // remove placement classes to reset position
    Util.removeClass(select.dropdown, 'select__dropdown--right select__dropdown--up');
    var triggerBoundingRect = select.trigger.getBoundingClientRect();
    Util.toggleClass(select.dropdown, 'select__dropdown--right', (document.documentElement.clientWidth - 5 < triggerBoundingRect.left + select.dropdown.offsetWidth));
    // check if there's enough space up or down
    var moveUp = (window.innerHeight - triggerBoundingRect.bottom - 5) < triggerBoundingRect.top;
    Util.toggleClass(select.dropdown, 'select__dropdown--up', moveUp);
    // check if we need to set a max width
    var maxHeight = moveUp ? triggerBoundingRect.top - 20 : window.innerHeight - triggerBoundingRect.bottom - 20;
    // set max-height based on available space
    select.dropdown.setAttribute('style', 'max-height: ' + maxHeight + 'px; width: ' + triggerBoundingRect.width + 'px;');
  };

  function keyboardCustomSelect(select, direction, event) { // navigate custom dropdown with keyboard
    event.preventDefault();
    var index = Util.getIndexInArray(select.customOptions, document.activeElement);
    index = (direction == 'next') ? index + 1 : index - 1;
    if (index < 0) index = select.customOptions.length - 1;
    if (index >= select.customOptions.length) index = 0;
    Util.moveFocus(select.customOptions[index]);
  };

  function initSelection(select) { // option selection
    select.dropdown.addEventListener('click', function (event) {
      var option = event.target.closest('.js-select__item');
      if (!option) return;
      selectOption(select, option);
    });
  };

  function selectOption(select, option) {
    if (option.hasAttribute('aria-selected') && option.getAttribute('aria-selected') == 'true') {
      // selecting the same option
      select.trigger.setAttribute('aria-expanded', 'false'); // hide dropdown
    } else {
      var selectedOption = select.dropdown.querySelector('[aria-selected="true"]');
      if (selectedOption) selectedOption.setAttribute('aria-selected', 'false');
      option.setAttribute('aria-selected', 'true');
      select.trigger.getElementsByClassName('js-select__label')[0].textContent = option.textContent;
      select.trigger.setAttribute('aria-expanded', 'false');
      // new option has been selected -> update native <select> element _ arai-label of trigger <button>
      updateNativeSelect(select, option.getAttribute('data-index'));
      updateTriggerAria(select);
    }
    // move focus back to trigger
    select.trigger.focus();
  };

  function updateNativeSelect(select, index) {
    select.select.selectedIndex = index;
    select.select.dispatchEvent(new CustomEvent('change', { bubbles: true })); // trigger change event
  };

  function updateTriggerAria(select) {
    select.trigger.setAttribute('aria-label', select.options[select.select.selectedIndex].innerHTML + ', ' + select.label.textContent);
  };

  function getSelectedOptionText(select) {// used to initialize the label of the custom select button
    var label = '';
    if ('selectedIndex' in select.select) {
      label = select.options[select.select.selectedIndex].text;
    } else {
      label = select.select.querySelector('option[selected]').text;
    }
    return label;

  };

  function initButtonSelect(select) { // create the button element -> custom select trigger
    // check if we need to add custom classes to the button trigger
    var customClasses = select.element.getAttribute('data-trigger-class') ? ' ' + select.element.getAttribute('data-trigger-class') : '';

    var label = select.options[select.select.selectedIndex].innerHTML + ', ' + select.label.textContent;

    var button = '<button type="button" class="js-select__button select__button' + customClasses + '" aria-label="' + label + '" aria-expanded="false" aria-controls="' + select.selectId + '-dropdown"><span aria-hidden="true" class="js-select__label select__label">' + select.selectedOption + '</span>';
    if (select.arrowIcon.length > 0 && select.arrowIcon[0].outerHTML) {
      var clone = select.arrowIcon[0].cloneNode(true);
      Util.removeClass(clone, 'select__icon');
      button = button + clone.outerHTML;
    }

    return button + '</button>';

  };

  function initListSelect(select) { // create custom select dropdown
    var list = '<div class="js-select__dropdown select__dropdown" aria-describedby="' + select.selectId + '-description" id="' + select.selectId + '-dropdown">';
    list = list + getSelectLabelSR(select);
    if (select.optGroups.length > 0) {
      for (var i = 0; i < select.optGroups.length; i++) {
        var optGroupList = select.optGroups[i].getElementsByTagName('option'),
          optGroupLabel = '<li><span class="select__item select__item--optgroup">' + select.optGroups[i].getAttribute('label') + '</span></li>';
        list = list + '<ul class="select__list" role="listbox">' + optGroupLabel + getOptionsList(select, optGroupList) + '</ul>';
      }
    } else {
      list = list + '<ul class="select__list" role="listbox">' + getOptionsList(select, select.options) + '</ul>';
    }
    return list;
  };

  function getSelectLabelSR(select) {
    if (select.label) {
      return '<p class="sr-only" id="' + select.selectId + '-description">' + select.label.textContent + '</p>'
    } else {
      return '';
    }
  };

  function resetCustomSelect(select) {
    // <select> element has been updated (using an external control) - update custom select
    var selectedOption = select.dropdown.querySelector('[aria-selected="true"]');
    if (selectedOption) selectedOption.setAttribute('aria-selected', 'false');
    var option = select.dropdown.querySelector('.js-select__item[data-index="' + select.select.selectedIndex + '"]');
    option.setAttribute('aria-selected', 'true');
    select.trigger.getElementsByClassName('js-select__label')[0].textContent = option.textContent;
    select.trigger.setAttribute('aria-expanded', 'false');
    updateTriggerAria(select);
  };

  function getOptionsList(select, options) {
    var list = '';
    for (var i = 0; i < options.length; i++) {
      var selected = options[i].hasAttribute('selected') ? ' aria-selected="true"' : ' aria-selected="false"';
      list = list + '<li><button type="button" class="reset js-select__item select__item select__item--option" role="option" data-value="' + options[i].value + '" ' + selected + ' data-index="' + select.optionIndex + '">' + options[i].text + '</button></li>';
      select.optionIndex = select.optionIndex + 1;
    };
    return list;
  };

  function getSelectedOption(select) {
    var option = select.dropdown.querySelector('[aria-selected="true"]');
    if (option) return option;
    else return select.dropdown.getElementsByClassName('js-select__item')[0];
  };

  function moveFocusToSelectTrigger(select) {
    if (!document.activeElement.closest('.js-select')) return
    select.trigger.focus();
  };

  function checkCustomSelectClick(select, target) { // close select when clicking outside it
    if (!select.element.contains(target)) toggleCustomSelect(select, 'false');
  };

  //initialize the CustomSelect objects
  var customSelect = document.getElementsByClassName('js-select');
  if (customSelect.length > 0) {
    var selectArray = [];
    for (var i = 0; i < customSelect.length; i++) {
      (function (i) { selectArray.push(new CustomSelect(customSelect[i])); })(i);
    }

    // listen for key events
    window.addEventListener('keyup', function (event) {
      if (event.keyCode && event.keyCode == 27 || event.key && event.key.toLowerCase() == 'escape') {
        // close custom select on 'Esc'
        selectArray.forEach(function (element) {
          moveFocusToSelectTrigger(element); // if focus is within dropdown, move it to dropdown trigger
          toggleCustomSelect(element, 'false'); // close dropdown
        });
      }
    });
    // close custom select when clicking outside it
    window.addEventListener('click', function (event) {
      selectArray.forEach(function (element) {
        checkCustomSelectClick(element, event.target);
      });
    });
  }
}());
// File#: _1_details
// Usage: codyhouse.co/license
(function () {
  var Details = function (element, index) {
    this.element = element;
    this.summary = this.element.getElementsByClassName('js-details__summary')[0];
    this.details = this.element.getElementsByClassName('js-details__content')[0];
    this.htmlElSupported = 'open' in this.element;
    this.initDetails(index);
    this.initDetailsEvents();
  };

  Details.prototype.initDetails = function (index) {
    // init aria attributes 
    Util.setAttributes(this.summary, { 'aria-expanded': 'false', 'aria-controls': 'details--' + index, 'role': 'button' });
    Util.setAttributes(this.details, { 'aria-hidden': 'true', 'id': 'details--' + index });
  };

  Details.prototype.initDetailsEvents = function () {
    var self = this;
    if (this.htmlElSupported) { // browser supports the <details> element 
      this.element.addEventListener('toggle', function (event) {
        var ariaValues = self.element.open ? ['true', 'false'] : ['false', 'true'];
        // update aria attributes when details element status change (open/close)
        self.updateAriaValues(ariaValues);
      });
    } else { //browser does not support <details>
      this.summary.addEventListener('click', function (event) {
        event.preventDefault();
        var isOpen = self.element.getAttribute('open'),
          ariaValues = [];

        isOpen ? self.element.removeAttribute('open') : self.element.setAttribute('open', 'true');
        ariaValues = isOpen ? ['false', 'true'] : ['true', 'false'];
        self.updateAriaValues(ariaValues);
      });
    }
  };

  Details.prototype.updateAriaValues = function (values) {
    this.summary.setAttribute('aria-expanded', values[0]);
    this.details.setAttribute('aria-hidden', values[1]);
  };

  //initialize the Details objects
  var detailsEl = document.getElementsByClassName('js-details');
  if (detailsEl.length > 0) {
    for (var i = 0; i < detailsEl.length; i++) {
      (function (i) { new Details(detailsEl[i], i); })(i);
    }
  }
}());
// File#: _1_diagonal-movement
// Usage: codyhouse.co/license
/*
  Modified version of the jQuery-menu-aim plugin
  https://github.com/kamens/jQuery-menu-aim
  - Replaced jQuery with Vanilla JS
  - Minor changes
*/
(function() {
  var menuAim = function(opts) {
    init(opts);
  };

  window.menuAim = menuAim;

  function init(opts) {
    var activeRow = null,
      mouseLocs = [],
      lastDelayLoc = null,
      timeoutId = null,
      options = Util.extend({
        menu: '',
        rows: false, //if false, get direct children - otherwise pass nodes list 
        submenuSelector: "*",
        submenuDirection: "right",
        tolerance: 75,  // bigger = more forgivey when entering submenu
        enter: function(){},
        exit: function(){},
        activate: function(){},
        deactivate: function(){},
        exitMenu: function(){}
      }, opts),
      menu = options.menu;

    var MOUSE_LOCS_TRACKED = 3,  // number of past mouse locations to track
      DELAY = 300;  // ms delay when user appears to be entering submenu

    /**
     * Keep track of the last few locations of the mouse.
     */
    var mouseMoveFallback = function(event) {
      (!window.requestAnimationFrame) ? mousemoveDocument(event) : window.requestAnimationFrame(function(){mousemoveDocument(event);});
    };

    var mousemoveDocument = function(e) {
      mouseLocs.push({x: e.pageX, y: e.pageY});

      if (mouseLocs.length > MOUSE_LOCS_TRACKED) {
        mouseLocs.shift();
      }
    };

    /**
     * Cancel possible row activations when leaving the menu entirely
     */
    var mouseleaveMenu = function() {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // If exitMenu is supplied and returns true, deactivate the
      // currently active row on menu exit.
      if (options.exitMenu(this)) {
        if (activeRow) {
          options.deactivate(activeRow);
        }

        activeRow = null;
      }
    };

    /**
     * Trigger a possible row activation whenever entering a new row.
     */
    var mouseenterRow = function() {
      if (timeoutId) {
        // Cancel any previous activation delays
        clearTimeout(timeoutId);
      }

      options.enter(this);
      possiblyActivate(this);
    },
    mouseleaveRow = function() {
      options.exit(this);
    };

    /*
     * Immediately activate a row if the user clicks on it.
     */
    var clickRow = function() {
      activate(this);
    };  

    /**
     * Activate a menu row.
     */
    var activate = function(row) {
      if (row == activeRow) {
        return;
      }

      if (activeRow) {
        options.deactivate(activeRow);
      }

      options.activate(row);
      activeRow = row;
    };

    /**
     * Possibly activate a menu row. If mouse movement indicates that we
     * shouldn't activate yet because user may be trying to enter
     * a submenu's content, then delay and check again later.
     */
    var possiblyActivate = function(row) {
      var delay = activationDelay();

      if (delay) {
        timeoutId = setTimeout(function() {
          possiblyActivate(row);
        }, delay);
      } else {
        activate(row);
      }
    };

    /**
     * Return the amount of time that should be used as a delay before the
     * currently hovered row is activated.
     *
     * Returns 0 if the activation should happen immediately. Otherwise,
     * returns the number of milliseconds that should be delayed before
     * checking again to see if the row should be activated.
     */
    var activationDelay = function() {
      if (!activeRow || !Util.is(activeRow, options.submenuSelector)) {
        // If there is no other submenu row already active, then
        // go ahead and activate immediately.
        return 0;
      }

      function getOffset(element) {
        var rect = element.getBoundingClientRect();
        return { top: rect.top + window.pageYOffset, left: rect.left + window.pageXOffset };
      };

      var offset = getOffset(menu),
          upperLeft = {
              x: offset.left,
              y: offset.top - options.tolerance
          },
          upperRight = {
              x: offset.left + menu.offsetWidth,
              y: upperLeft.y
          },
          lowerLeft = {
              x: offset.left,
              y: offset.top + menu.offsetHeight + options.tolerance
          },
          lowerRight = {
              x: offset.left + menu.offsetWidth,
              y: lowerLeft.y
          },
          loc = mouseLocs[mouseLocs.length - 1],
          prevLoc = mouseLocs[0];

      if (!loc) {
        return 0;
      }

      if (!prevLoc) {
        prevLoc = loc;
      }

      if (prevLoc.x < offset.left || prevLoc.x > lowerRight.x || prevLoc.y < offset.top || prevLoc.y > lowerRight.y) {
        // If the previous mouse location was outside of the entire
        // menu's bounds, immediately activate.
        return 0;
      }

      if (lastDelayLoc && loc.x == lastDelayLoc.x && loc.y == lastDelayLoc.y) {
        // If the mouse hasn't moved since the last time we checked
        // for activation status, immediately activate.
        return 0;
      }

      // Detect if the user is moving towards the currently activated
      // submenu.
      //
      // If the mouse is heading relatively clearly towards
      // the submenu's content, we should wait and give the user more
      // time before activating a new row. If the mouse is heading
      // elsewhere, we can immediately activate a new row.
      //
      // We detect this by calculating the slope formed between the
      // current mouse location and the upper/lower right points of
      // the menu. We do the same for the previous mouse location.
      // If the current mouse location's slopes are
      // increasing/decreasing appropriately compared to the
      // previous's, we know the user is moving toward the submenu.
      //
      // Note that since the y-axis increases as the cursor moves
      // down the screen, we are looking for the slope between the
      // cursor and the upper right corner to decrease over time, not
      // increase (somewhat counterintuitively).
      function slope(a, b) {
        return (b.y - a.y) / (b.x - a.x);
      };

      var decreasingCorner = upperRight,
        increasingCorner = lowerRight;

      // Our expectations for decreasing or increasing slope values
      // depends on which direction the submenu opens relative to the
      // main menu. By default, if the menu opens on the right, we
      // expect the slope between the cursor and the upper right
      // corner to decrease over time, as explained above. If the
      // submenu opens in a different direction, we change our slope
      // expectations.
      if (options.submenuDirection == "left") {
        decreasingCorner = lowerLeft;
        increasingCorner = upperLeft;
      } else if (options.submenuDirection == "below") {
        decreasingCorner = lowerRight;
        increasingCorner = lowerLeft;
      } else if (options.submenuDirection == "above") {
        decreasingCorner = upperLeft;
        increasingCorner = upperRight;
      }

      var decreasingSlope = slope(loc, decreasingCorner),
        increasingSlope = slope(loc, increasingCorner),
        prevDecreasingSlope = slope(prevLoc, decreasingCorner),
        prevIncreasingSlope = slope(prevLoc, increasingCorner);

      if (decreasingSlope < prevDecreasingSlope && increasingSlope > prevIncreasingSlope) {
        // Mouse is moving from previous location towards the
        // currently activated submenu. Delay before activating a
        // new menu row, because user may be moving into submenu.
        lastDelayLoc = loc;
        return DELAY;
      }

      lastDelayLoc = null;
      return 0;
    };

    var reset = function(triggerDeactivate) {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      if (activeRow && triggerDeactivate) {
        options.deactivate(activeRow);
      }

      activeRow = null;
    };

    var destroyInstance = function() {
      menu.removeEventListener('mouseleave', mouseleaveMenu);  
      document.removeEventListener('mousemove', mouseMoveFallback);
      if(rows.length > 0) {
        for(var i = 0; i < rows.length; i++) {
          rows[i].removeEventListener('mouseenter', mouseenterRow);  
          rows[i].removeEventListener('mouseleave', mouseleaveRow);
          rows[i].removeEventListener('click', clickRow);  
        }
      }
      
    };

    /**
     * Hook up initial menu events
     */
    menu.addEventListener('mouseleave', mouseleaveMenu);  
    var rows = (options.rows) ? options.rows : menu.children;
    if(rows.length > 0) {
      for(var i = 0; i < rows.length; i++) {(function(i){
        rows[i].addEventListener('mouseenter', mouseenterRow);  
        rows[i].addEventListener('mouseleave', mouseleaveRow);
        rows[i].addEventListener('click', clickRow);  
      })(i);}
    }

    document.addEventListener('mousemove', mouseMoveFallback);

    /* Reset/destroy menu */
    menu.addEventListener('reset', function(event){
      reset(event.detail);
    });
    menu.addEventListener('destroy', destroyInstance);
  };
}());


// File#: _1_drawer
// Usage: codyhouse.co/license
(function () {
	var Drawer = function (element) {
		this.element = element;
		this.content = document.getElementsByClassName('js-drawer__body')[0];
		this.triggers = document.querySelectorAll('[aria-controls="' + this.element.getAttribute('id') + '"]');
		this.firstFocusable = null;
		this.lastFocusable = null;
		this.selectedTrigger = null;
		this.isModal = Util.hasClass(this.element, 'js-drawer--modal');
		this.showClass = "drawer--is-visible";
		this.initDrawer();
	};

	Drawer.prototype.initDrawer = function () {
		var self = this;
		//open drawer when clicking on trigger buttons
		if (this.triggers) {
			for (var i = 0; i < this.triggers.length; i++) {
				this.triggers[i].addEventListener('click', function (event) {
					event.preventDefault();
					if (Util.hasClass(self.element, self.showClass)) {
						self.closeDrawer(event.target);
						return;
					}
					self.selectedTrigger = event.target;
					self.showDrawer();
					self.initDrawerEvents();
				});
			}
		}

		// if drawer is already open -> we should initialize the drawer events
		if (Util.hasClass(this.element, this.showClass)) this.initDrawerEvents();
	};

	Drawer.prototype.showDrawer = function () {
		var self = this;
		this.content.scrollTop = 0;
		Util.addClass(this.element, this.showClass);
		this.getFocusableElements();
		Util.moveFocus(this.element);
		// wait for the end of transitions before moving focus
		this.element.addEventListener("transitionend", function cb(event) {
			Util.moveFocus(self.element);
			self.element.removeEventListener("transitionend", cb);
		});
		this.emitDrawerEvents('drawerIsOpen', this.selectedTrigger);
	};

	Drawer.prototype.closeDrawer = function (target) {
		Util.removeClass(this.element, this.showClass);
		this.firstFocusable = null;
		this.lastFocusable = null;
		if (this.selectedTrigger) this.selectedTrigger.focus();
		//remove listeners
		this.cancelDrawerEvents();
		this.emitDrawerEvents('drawerIsClose', target);
	};

	Drawer.prototype.initDrawerEvents = function () {
		//add event listeners
		this.element.addEventListener('keydown', this);
		this.element.addEventListener('click', this);
	};

	Drawer.prototype.cancelDrawerEvents = function () {
		//remove event listeners
		this.element.removeEventListener('keydown', this);
		this.element.removeEventListener('click', this);
	};

	Drawer.prototype.handleEvent = function (event) {
		switch (event.type) {
			case 'click': {
				this.initClick(event);
			}
			case 'keydown': {
				this.initKeyDown(event);
			}
		}
	};

	Drawer.prototype.initKeyDown = function (event) {
		if (event.keyCode && event.keyCode == 27 || event.key && event.key == 'Escape') {
			//close drawer window on esc
			this.closeDrawer(false);
		} else if (this.isModal && (event.keyCode && event.keyCode == 9 || event.key && event.key == 'Tab')) {
			//trap focus inside drawer
			this.trapFocus(event);
		}
	};

	Drawer.prototype.initClick = function (event) {
		//close drawer when clicking on close button or drawer bg layer 
		if (!event.target.closest('.js-drawer__close') && !Util.hasClass(event.target, 'js-drawer')) return;
		event.preventDefault();
		this.closeDrawer(event.target);
	};

	Drawer.prototype.trapFocus = function (event) {
		if (this.firstFocusable == document.activeElement && event.shiftKey) {
			//on Shift+Tab -> focus last focusable element when focus moves out of drawer
			event.preventDefault();
			this.lastFocusable.focus();
		}
		if (this.lastFocusable == document.activeElement && !event.shiftKey) {
			//on Tab -> focus first focusable element when focus moves out of drawer
			event.preventDefault();
			this.firstFocusable.focus();
		}
	}

	Drawer.prototype.getFocusableElements = function () {
		//get all focusable elements inside the drawer
		var allFocusable = this.element.querySelectorAll('[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable], audio[controls], video[controls], summary');
		this.getFirstVisible(allFocusable);
		this.getLastVisible(allFocusable);
	};

	Drawer.prototype.getFirstVisible = function (elements) {
		//get first visible focusable element inside the drawer
		for (var i = 0; i < elements.length; i++) {
			if (elements[i].offsetWidth || elements[i].offsetHeight || elements[i].getClientRects().length) {
				this.firstFocusable = elements[i];
				return true;
			}
		}
	};

	Drawer.prototype.getLastVisible = function (elements) {
		//get last visible focusable element inside the drawer
		for (var i = elements.length - 1; i >= 0; i--) {
			if (elements[i].offsetWidth || elements[i].offsetHeight || elements[i].getClientRects().length) {
				this.lastFocusable = elements[i];
				return true;
			}
		}
	};

	Drawer.prototype.emitDrawerEvents = function (eventName, target) {
		var event = new CustomEvent(eventName, { detail: target });
		this.element.dispatchEvent(event);
	};

	//initialize the Drawer objects
	var drawer = document.getElementsByClassName('js-drawer');
	if (drawer.length > 0) {
		for (var i = 0; i < drawer.length; i++) {
			(function (i) { new Drawer(drawer[i]); })(i);
		}
	}
}());
// File#: _1_google-maps
// Usage: codyhouse.co/license
function initGoogleMap() {
	var contactMap = document.getElementsByClassName('js-google-maps');
	if (contactMap.length > 0) {
		for (var i = 0; i < contactMap.length; i++) {
			initContactMap(contactMap[i]);
		}
	}
};

function initContactMap(wrapper) {
	var coordinate = wrapper.getAttribute('data-coordinates').split(',');
	var map = new google.maps.Map(wrapper, { zoom: 10, center: { lat: Number(coordinate[0]), lng: Number(coordinate[1]) } });
	var marker = new google.maps.Marker({ position: { lat: Number(coordinate[0]), lng: Number(coordinate[1]) }, map: map });
};
// File#: _1_image-magnifier
// Usage: codyhouse.co/license

(function () {
  var ImageMagnifier = function (element) {
    this.element = element;
    this.asset = this.element.getElementsByClassName('js-img-mag__asset')[0];
    this.ready = false;
    this.scale = 1;
    this.intervalId = false;
    this.moving = false;
    this.moveEvent = false;
    initImageMagnifier(this);
  };

  function initImageMagnifier(imgMag) {
    // wait for the image to be loaded
    imgMag.asset.addEventListener('load', function () {
      initImageMagnifierMove(imgMag);
    });
    if (imgMag.asset.complete) {
      initImageMagnifierMove(imgMag);
    }
  };

  function initImageMagnifierMove(imgMag) {
    if (imgMag.ready) return;
    imgMag.ready = true;
    initImageMagnifierScale(imgMag); // get image scale
    // listen to mousenter event
    imgMag.element.addEventListener('mouseenter', handleEvent.bind(imgMag));
  };

  function initImageMagnifierScale(imgMag) {
    var customScale = imgMag.element.getAttribute('data-scale');
    if (customScale) { // use custom scale set in HTML
      imgMag.scale = customScale;
    } else { // use natural width of image to get the scale value
      imgMag.scale = imgMag.asset.naturalWidth / imgMag.element.offsetWidth;
      // round to 2 places decimal
      imgMag.scale = Math.floor((imgMag.scale * 100)) / 100;
      if (imgMag.scale > 1.2) imgMag.scale = imgMag.scale - 0.2;
    }
  };

  function initImageMove(imgMag) { // add move event listeners
    imgMag.moveEvent = handleEvent.bind(imgMag);
    imgMag.element.addEventListener('mousemove', imgMag.moveEvent);
    imgMag.element.addEventListener('mouseleave', imgMag.moveEvent);
  };

  function cancelImageMove(imgMag) { // remove move event listeners
    if (imgMag.intervalId) {
      (!window.requestAnimationFrame) ? clearInterval(imgMag.intervalId) : window.cancelAnimationFrame(imgMag.intervalId);
      imgMag.intervalId = false;
    }
    if (imgMag.moveEvent) {
      imgMag.element.removeEventListener('mousemove', imgMag.moveEvent);
      imgMag.element.removeEventListener('mouseleave', imgMag.moveEvent);
      imgMag.moveEvent = false;
    }
  };

  function handleEvent(event) {
    switch (event.type) {
      case 'mouseenter':
        startMove(this, event);
        break;
      case 'mousemove':
        move(this, event);
        break;
      case 'mouseleave':
        endMove(this);
        break;
    }
  };

  function startMove(imgMag, event) {
    imgMag.moving = true;
    initImageMove(imgMag); // listen to mousemove event
    zoomImageMagnifier(imgMag, event);
  };

  function move(imgMag, event) {
    if (!imgMag.moving || imgMag.intervalId) return;
    (!window.requestAnimationFrame)
      ? imgMag.intervalId = setTimeout(function () { zoomImageMagnifier(imgMag, event); }, 250)
      : imgMag.intervalId = window.requestAnimationFrame(function () { zoomImageMagnifier(imgMag, event); });
  };

  function endMove(imgMag) {
    imgMag.moving = false;
    cancelImageMove(imgMag); // remove event listeners
    imgMag.asset.removeAttribute('style'); // reset image style
  };

  function zoomImageMagnifier(imgMag, event) { // zoom effect on mousemove
    var elementRect = imgMag.element.getBoundingClientRect();
    var translateX = (elementRect.left - event.clientX);
    var translateY = (elementRect.top - event.clientY);
    if (translateX > 0) translateX = 0; if (translateX < -1 * elementRect.width) translateX = -1 * elementRect.width;
    if (translateY > 0) translateY = 0; if (translateY < -1 * elementRect.height) translateX = -1 * elementRect.height;
    var transform = 'translateX(' + translateX * (imgMag.scale - 1) + 'px) translateY(' + translateY * (imgMag.scale - 1) + 'px) scale(' + imgMag.scale + ')';
    imgMag.asset.setAttribute('style', 'transform: ' + transform + ';');
    imgMag.intervalId = false;
  };

  // init ImageMagnifier object
  var imageMag = document.getElementsByClassName('js-img-mag');
  if (imageMag.length > 0) {
    for (var i = 0; i < imageMag.length; i++) {
      new ImageMagnifier(imageMag[i]);
    }
  }
}());
// File#: _1_lazy-load
// Usage: codyhouse.co/license
(function() {
  var LazyLoad = function(elements) {
    this.elements = elements;
    initLazyLoad(this);
  };

  function initLazyLoad(asset) {
    if(lazySupported) setAssetsSrc(asset);
    else if(intersectionObsSupported) observeAssets(asset);
    else scrollAsset(asset);
  };

  function setAssetsSrc(asset) {
    for(var i = 0; i < asset.elements.length; i++) {
      if(asset.elements[i].getAttribute('data-bg') || asset.elements[i].tagName.toLowerCase() == 'picture') { // this could be an element with a bg image or a <source> element inside a <picture>
        observeSingleAsset(asset.elements[i]);
      } else {
        setSingleAssetSrc(asset.elements[i]);
      } 
    }
  };

  function setSingleAssetSrc(img) {
    if(img.tagName.toLowerCase() == 'picture') {
      setPictureSrc(img);
    } else {
      setSrcSrcset(img);
      var bg = img.getAttribute('data-bg');
      if(bg) img.style.backgroundImage = bg;
      if(!lazySupported || bg) img.removeAttribute("loading");
    }
  };

  function setPictureSrc(picture) {
    var pictureChildren = picture.children;
    for(var i = 0; i < pictureChildren.length; i++) setSrcSrcset(pictureChildren[i]);
    picture.removeAttribute("loading");
  };

  function setSrcSrcset(img) {
    var src = img.getAttribute('data-src');
    if(src) img.src = src;
    var srcset = img.getAttribute('data-srcset');
    if(srcset) img.srcset = srcset;
  };

  function observeAssets(asset) {
    for(var i = 0; i < asset.elements.length; i++) {
      observeSingleAsset(asset.elements[i]);
    }
  };

  function observeSingleAsset(img) {
    if( !img.getAttribute('data-src') && !img.getAttribute('data-srcset') && !img.getAttribute('data-bg') && img.tagName.toLowerCase() != 'picture') return; // using the native lazyload with no need js lazy-loading

    var threshold = img.getAttribute('data-threshold') || '200px';
    var config = {rootMargin: threshold};
    var observer = new IntersectionObserver(observerLoadContent.bind(img), config);
    observer.observe(img);
  };

  function observerLoadContent(entries, observer) { 
    if(entries[0].isIntersecting) {
      setSingleAssetSrc(this);
      observer.unobserve(this);
    }
  };

  function scrollAsset(asset) {
    asset.elements = Array.prototype.slice.call(asset.elements);
    asset.listening = false;
    asset.scrollListener = eventLazyLoad.bind(asset);
    document.addEventListener("scroll", asset.scrollListener);
    asset.resizeListener = eventLazyLoad.bind(asset);
    document.addEventListener("resize", asset.resizeListener);
    eventLazyLoad.bind(asset)(); // trigger before starting scrolling/resizing
  };

  function eventLazyLoad() {
    var self = this;
    if(self.listening) return;
    self.listening = true;
    setTimeout(function() {
      for(var i = 0; i < self.elements.length; i++) {
        if ((self.elements[i].getBoundingClientRect().top <= window.innerHeight && self.elements[i].getBoundingClientRect().bottom >= 0) && getComputedStyle(self.elements[i]).display !== "none") {
          setSingleAssetSrc(self.elements[i]);

          self.elements = self.elements.filter(function(image) {
            return image.hasAttribute("loading");
          });

          if (self.elements.length === 0) {
            if(self.scrollListener) document.removeEventListener("scroll", self.scrollListener);
            if(self.resizeListener) window.removeEventListener("resize", self.resizeListener);
          }
        }
      }
      self.listening = false;
    }, 200);
  };

  window.LazyLoad = LazyLoad;

  var lazyLoads = document.querySelectorAll('[loading="lazy"]'),
    lazySupported = 'loading' in HTMLImageElement.prototype,
    intersectionObsSupported = ('IntersectionObserver' in window && 'IntersectionObserverEntry' in window && 'intersectionRatio' in window.IntersectionObserverEntry.prototype);
  
  if( lazyLoads.length > 0 ) {
    new LazyLoad(lazyLoads);
  };
  
}());
// File#: _1_header
// Usage: codyhouse.co/license
(function () {
	var mainHeader = document.getElementsByClassName('js-header');
	if (mainHeader.length > 0) {
		var trigger = mainHeader[0].getElementsByClassName('js-header__trigger')[0],
			nav = mainHeader[0].getElementsByClassName('js-header__nav')[0];

		// we'll use these to store the node that needs to receive focus when the mobile menu is closed 
		var focusMenu = false;

		//detect click on nav trigger
		trigger.addEventListener("click", function (event) {
			event.preventDefault();
			toggleNavigation(!Util.hasClass(nav, 'header__nav--is-visible'));
		});

		// listen for key events
		window.addEventListener('keyup', function (event) {
			// listen for esc key
			if ((event.keyCode && event.keyCode == 27) || (event.key && event.key.toLowerCase() == 'escape')) {
				// close navigation on mobile if open
				if (trigger.getAttribute('aria-expanded') == 'true' && isVisible(trigger)) {
					focusMenu = trigger; // move focus to menu trigger when menu is close
					trigger.click();
				}
			}
			// listen for tab key
			if ((event.keyCode && event.keyCode == 9) || (event.key && event.key.toLowerCase() == 'tab')) {
				// close navigation on mobile if open when nav loses focus
				if (trigger.getAttribute('aria-expanded') == 'true' && isVisible(trigger) && !document.activeElement.closest('.js-header')) trigger.click();
			}
		});

		// listen for resize
		var resizingId = false;
		window.addEventListener('resize', function () {
			clearTimeout(resizingId);
			resizingId = setTimeout(doneResizing, 500);
		});

		function doneResizing() {
			if (!isVisible(trigger) && Util.hasClass(mainHeader[0], 'header--expanded')) toggleNavigation(false);
		};
	}

	function isVisible(element) {
		return (element.offsetWidth || element.offsetHeight || element.getClientRects().length);
	};

	function toggleNavigation(bool) { // toggle navigation visibility on small device
		Util.toggleClass(nav, 'header__nav--is-visible', bool);
		Util.toggleClass(mainHeader[0], 'header--expanded', bool);
		trigger.setAttribute('aria-expanded', bool);
		if (bool) { //opening menu -> move focus to first element inside nav
			nav.querySelectorAll('[href], input:not([disabled]), button:not([disabled])')[0].focus();
		} else if (focusMenu) {
			focusMenu.focus();
			focusMenu = false;
		}
	};
}());
// File#: _1_pre-header
// Usage: codyhouse.co/license
(function () {
	var preHeader = document.getElementsByClassName('js-pre-header');
	if (preHeader.length > 0) {
		for (var i = 0; i < preHeader.length; i++) {
			(function (i) { addPreHeaderEvent(preHeader[i]); })(i);
		}

		function addPreHeaderEvent(element) {
			var close = element.getElementsByClassName('js-pre-header__close-btn')[0];
			if (close) {
				close.addEventListener('click', function (event) {
					event.preventDefault();
					Util.addClass(element, 'pre-header--is-hidden');
				});
			}
		}
	}
}());
// File#: _1_rating
// Usage: codyhouse.co/license
(function () {
	var Rating = function (element) {
		this.element = element;
		this.icons = this.element.getElementsByClassName('js-rating__control')[0];
		this.iconCode = this.icons.children[0].parentNode.innerHTML;
		this.initialRating = [];
		this.initialRatingElement = this.element.getElementsByClassName('js-rating__value')[0];
		this.ratingItems;
		this.selectedRatingItem;
		this.readOnly = Util.hasClass(this.element, 'js-rating--read-only');
		this.ratingMaxValue = 5;
		this.getInitialRating();
		this.initRatingHtml();
	};

	Rating.prototype.getInitialRating = function () {
		// get the rating of the product
		if (!this.initialRatingElement || !this.readOnly) {
			this.initialRating = [0, false];
			return;
		}

		var initialValue = Number(this.initialRatingElement.textContent);
		if (isNaN(initialValue)) {
			this.initialRating = [0, false];
			return;
		}

		var floorNumber = Math.floor(initialValue);
		this.initialRating[0] = (floorNumber < initialValue) ? floorNumber + 1 : floorNumber;
		this.initialRating[1] = (floorNumber < initialValue) ? Math.round((initialValue - floorNumber) * 100) : false;
	};

	Rating.prototype.initRatingHtml = function () {
		//create the star elements
		var iconsList = this.readOnly ? '<ul>' : '<ul role="radiogroup">';

		//if initial rating value is zero -> add a 'zero' item 
		if (this.initialRating[0] == 0 && !this.initialRating[1]) {
			iconsList = iconsList + '<li class="rating__item--zero rating__item--checked"></li>';
		}

		// create the stars list 
		for (var i = 0; i < this.ratingMaxValue; i++) {
			iconsList = iconsList + this.getStarHtml(i);
		}
		iconsList = iconsList + '</ul>';

		// --default variation only - improve SR accessibility including a legend element 
		if (!this.readOnly) {
			var labelElement = this.element.getElementsByTagName('label');
			if (labelElement.length > 0) {
				var legendElement = '<legend class="' + labelElement[0].getAttribute('class') + '">' + labelElement[0].textContent + '</legend>';
				iconsList = '<fieldset>' + legendElement + iconsList + '</fieldset>';
				Util.addClass(labelElement[0], 'is-hidden');
			}
		}

		this.icons.innerHTML = iconsList;

		//init object properties
		this.ratingItems = this.icons.getElementsByClassName('js-rating__item');
		this.selectedRatingItem = this.icons.getElementsByClassName('rating__item--checked')[0];

		//show the stars
		Util.removeClass(this.icons, 'rating__control--is-hidden');

		//event listener
		!this.readOnly && this.initRatingEvents();// rating vote enabled
	};

	Rating.prototype.getStarHtml = function (index) {
		var listItem = '';
		var checked = (index + 1 == this.initialRating[0]) ? true : false,
			itemClass = checked ? ' rating__item--checked' : '',
			tabIndex = (checked || (this.initialRating[0] == 0 && !this.initialRating[1] && index == 0)) ? 0 : -1,
			showHalf = checked && this.initialRating[1] ? true : false,
			iconWidth = showHalf ? ' rating__item--half' : '';
		if (!this.readOnly) {
			listItem = '<li class="js-rating__item' + itemClass + iconWidth + '" role="radio" aria-label="' + (index + 1) + '" aria-checked="' + checked + '" tabindex="' + tabIndex + '"><div class="rating__icon">' + this.iconCode + '</div></li>';
		} else {
			var starInner = showHalf ? '<div class="rating__icon">' + this.iconCode + '</div><div class="rating__icon rating__icon--inactive">' + this.iconCode + '</div>' : '<div class="rating__icon">' + this.iconCode + '</div>';
			listItem = '<li class="js-rating__item' + itemClass + iconWidth + '">' + starInner + '</li>';
		}
		return listItem;
	};

	Rating.prototype.initRatingEvents = function () {
		var self = this;

		//click on a star
		this.icons.addEventListener('click', function (event) {
			var trigger = event.target.closest('.js-rating__item');
			self.resetSelectedIcon(trigger);
		});

		//keyboard navigation -> select new star
		this.icons.addEventListener('keydown', function (event) {
			if (event.keyCode && (event.keyCode == 39 || event.keyCode == 40) || event.key && (event.key.toLowerCase() == 'arrowright' || event.key.toLowerCase() == 'arrowdown')) {
				self.selectNewIcon('next'); //select next star on arrow right/down
			} else if (event.keyCode && (event.keyCode == 37 || event.keyCode == 38) || event.key && (event.key.toLowerCase() == 'arrowleft' || event.key.toLowerCase() == 'arrowup')) {
				self.selectNewIcon('prev'); //select prev star on arrow left/up
			} else if (event.keyCode && event.keyCode == 32 || event.key && event.key == ' ') {
				self.selectFocusIcon(); // select focused star on Space
			}
		});
	};

	Rating.prototype.selectNewIcon = function (direction) {
		var index = Util.getIndexInArray(this.ratingItems, this.selectedRatingItem);
		index = (direction == 'next') ? index + 1 : index - 1;
		if (index < 0) index = this.ratingItems.length - 1;
		if (index >= this.ratingItems.length) index = 0;
		this.resetSelectedIcon(this.ratingItems[index]);
		this.ratingItems[index].focus();
	};

	Rating.prototype.selectFocusIcon = function (direction) {
		this.resetSelectedIcon(document.activeElement);
	};

	Rating.prototype.resetSelectedIcon = function (trigger) {
		if (!trigger) return;
		Util.removeClass(this.selectedRatingItem, 'rating__item--checked');
		Util.setAttributes(this.selectedRatingItem, { 'aria-checked': false, 'tabindex': -1 });
		Util.addClass(trigger, 'rating__item--checked');
		Util.setAttributes(trigger, { 'aria-checked': true, 'tabindex': 0 });
		this.selectedRatingItem = trigger;
		// update select input value
		var select = this.element.getElementsByTagName('select');
		if (select.length > 0) {
			select[0].value = trigger.getAttribute('aria-label');
		}
	};

	//initialize the Rating objects
	var ratings = document.getElementsByClassName('js-rating');
	if (ratings.length > 0) {
		for (var i = 0; i < ratings.length; i++) {
			(function (i) { new Rating(ratings[i]); })(i);
		}
	};
}());
// File#: _1_read-more
// Usage: codyhouse.co/license
(function () {
  var ReadMore = function (element) {
    this.element = element;
    this.moreContent = this.element.getElementsByClassName('js-read-more__content');
    this.count = this.element.getAttribute('data-characters') || 200;
    this.counting = 0;
    this.btnClasses = this.element.getAttribute('data-btn-class');
    this.ellipsis = this.element.getAttribute('data-ellipsis') && this.element.getAttribute('data-ellipsis') == 'off' ? false : true;
    this.btnShowLabel = 'Read more';
    this.btnHideLabel = 'Read less';
    this.toggleOff = this.element.getAttribute('data-toggle') && this.element.getAttribute('data-toggle') == 'off' ? false : true;
    if (this.moreContent.length == 0) splitReadMore(this);
    setBtnLabels(this);
    initReadMore(this);
  };

  function splitReadMore(readMore) {
    splitChildren(readMore.element, readMore); // iterate through children and hide content
  };

  function splitChildren(parent, readMore) {
    if (readMore.counting >= readMore.count) {
      Util.addClass(parent, 'js-read-more__content');
      return parent.outerHTML;
    }
    var children = parent.childNodes;
    var content = '';
    for (var i = 0; i < children.length; i++) {
      if (children[i].nodeType == Node.TEXT_NODE) {
        content = content + wrapText(children[i], readMore);
      } else {
        content = content + splitChildren(children[i], readMore);
      }
    }
    parent.innerHTML = content;
    return parent.outerHTML;
  };

  function wrapText(element, readMore) {
    var content = element.textContent;
    if (content.replace(/\s/g, '').length == 0) return '';// check if content is empty
    if (readMore.counting >= readMore.count) {
      return '<span class="js-read-more__content">' + content + '</span>';
    }
    if (readMore.counting + content.length < readMore.count) {
      readMore.counting = readMore.counting + content.length;
      return content;
    }
    var firstContent = content.substr(0, readMore.count - readMore.counting);
    firstContent = firstContent.substr(0, Math.min(firstContent.length, firstContent.lastIndexOf(" ")));
    var secondContent = content.substr(firstContent.length, content.length);
    readMore.counting = readMore.count;
    return firstContent + '<span class="js-read-more__content">' + secondContent + '</span>';
  };

  function setBtnLabels(readMore) { // set custom labels for read More/Less btns
    var btnLabels = readMore.element.getAttribute('data-btn-labels');
    if (btnLabels) {
      var labelsArray = btnLabels.split(',');
      readMore.btnShowLabel = labelsArray[0].trim();
      readMore.btnHideLabel = labelsArray[1].trim();
    }
  };

  function initReadMore(readMore) { // add read more/read less buttons to the markup
    readMore.moreContent = readMore.element.getElementsByClassName('js-read-more__content');
    if (readMore.moreContent.length == 0) {
      Util.addClass(readMore.element, 'read-more--loaded');
      return;
    }
    var btnShow = ' <button class="js-read-more__btn ' + readMore.btnClasses + '">' + readMore.btnShowLabel + '</button>';
    var btnHide = ' <button class="js-read-more__btn is-hidden ' + readMore.btnClasses + '">' + readMore.btnHideLabel + '</button>';
    if (readMore.ellipsis) {
      btnShow = '<span class="js-read-more__ellipsis" aria-hidden="true">...</span>' + btnShow;
    }

    readMore.moreContent[readMore.moreContent.length - 1].insertAdjacentHTML('afterend', btnHide);
    readMore.moreContent[0].insertAdjacentHTML('afterend', btnShow);
    resetAppearance(readMore);
    initEvents(readMore);
  };

  function resetAppearance(readMore) { // hide part of the content
    for (var i = 0; i < readMore.moreContent.length; i++) Util.addClass(readMore.moreContent[i], 'is-hidden');
    Util.addClass(readMore.element, 'read-more--loaded'); // show entire component
  };

  function initEvents(readMore) { // listen to the click on the read more/less btn
    readMore.btnToggle = readMore.element.getElementsByClassName('js-read-more__btn');
    readMore.ellipsis = readMore.element.getElementsByClassName('js-read-more__ellipsis');

    readMore.btnToggle[0].addEventListener('click', function (event) {
      event.preventDefault();
      updateVisibility(readMore, true);
    });
    readMore.btnToggle[1].addEventListener('click', function (event) {
      event.preventDefault();
      updateVisibility(readMore, false);
    });
  };

  function updateVisibility(readMore, visibile) {
    for (var i = 0; i < readMore.moreContent.length; i++) Util.toggleClass(readMore.moreContent[i], 'is-hidden', !visibile);
    // reset btns appearance
    Util.toggleClass(readMore.btnToggle[0], 'is-hidden', visibile);
    Util.toggleClass(readMore.btnToggle[1], 'is-hidden', !visibile);
    if (readMore.ellipsis.length > 0) Util.toggleClass(readMore.ellipsis[0], 'is-hidden', visibile);
    if (!readMore.toggleOff) Util.addClass(readMore.btn, 'is-hidden');
    // move focus
    if (visibile) {
      var targetTabIndex = readMore.moreContent[0].getAttribute('tabindex');
      Util.moveFocus(readMore.moreContent[0]);
      resetFocusTarget(readMore.moreContent[0], targetTabIndex);
    } else {
      Util.moveFocus(readMore.btnToggle[0]);
    }
  };

  function resetFocusTarget(target, tabindex) {
    if (parseInt(target.getAttribute('tabindex')) < 0) {
      target.style.outline = 'none';
      !tabindex && target.removeAttribute('tabindex');
    }
  };

  //initialize the ReadMore objects
  var readMore = document.getElementsByClassName('js-read-more');
  if (readMore.length > 0) {
    for (var i = 0; i < readMore.length; i++) {
      (function (i) { new ReadMore(readMore[i]); })(i);
    }
  };
}());
// File#: _1_reading-progressbar
// Usage: codyhouse.co/license
(function () {
  var readingIndicator = document.getElementsByClassName('js-reading-progressbar')[0],
    readingIndicatorContent = document.getElementsByClassName('js-reading-content')[0];

  if (readingIndicator && readingIndicatorContent) {
    var progressInfo = [],
      progressEvent = false,
      progressFallback = readingIndicator.getElementsByClassName('js-reading-progressbar__fallback')[0],
      progressIsSupported = 'value' in readingIndicator;

    progressInfo['height'] = readingIndicatorContent.offsetHeight;
    progressInfo['top'] = readingIndicatorContent.getBoundingClientRect().top;
    progressInfo['window'] = window.innerHeight;
    progressInfo['class'] = 'reading-progressbar--is-active';

    //init indicator
    setProgressIndicator();
    // wait for font to be loaded - reset progress bar
    if (document.fonts) {
      document.fonts.ready.then(function () {
        triggerReset();
      });
    }
    // listen to window resize - update progress
    window.addEventListener('resize', function (event) {
      triggerReset();
    });

    //listen to the window scroll event - update progress
    window.addEventListener('scroll', function (event) {
      if (progressEvent) return;
      progressEvent = true;
      (!window.requestAnimationFrame) ? setTimeout(function () { setProgressIndicator(); }, 250) : window.requestAnimationFrame(setProgressIndicator);
    });

    function setProgressIndicator() {
      progressInfo['top'] = readingIndicatorContent.getBoundingClientRect().top;
      if (progressInfo['height'] <= progressInfo['window']) {
        // short content - hide progress indicator
        Util.removeClass(readingIndicator, progressInfo['class']);
        progressEvent = false;
        return;
      }
      // get new progress and update element
      Util.addClass(readingIndicator, progressInfo['class']);
      var value = (progressInfo['top'] >= 0) ? 0 : 100 * (0 - progressInfo['top']) / (progressInfo['height'] - progressInfo['window']);
      readingIndicator.setAttribute('value', value);
      if (!progressIsSupported && progressFallback) progressFallback.style.width = value + '%';
      progressEvent = false;
    };

    function triggerReset() {
      if (progressEvent) return;
      progressEvent = true;
      (!window.requestAnimationFrame) ? setTimeout(function () { resetProgressIndicator(); }, 250) : window.requestAnimationFrame(resetProgressIndicator);
    };

    function resetProgressIndicator() {
      progressInfo['height'] = readingIndicatorContent.offsetHeight;
      progressInfo['window'] = window.innerHeight;
      setProgressIndicator();
    };
  }
}());
(function() {
  var ScrollFx = function(element, scrollableSelector) {
    this.element = element;
    this.options = [];
    this.boundingRect = this.element.getBoundingClientRect();
    this.windowHeight = window.innerHeight;
    this.scrollingFx = [];
    this.animating = [];
    this.deltaScrolling = [];
    this.observer = [];
    this.scrollableSelector = scrollableSelector; // if the scrollable element is not the window
    this.scrollableElement = false;
    initScrollFx(this);
    // ToDo - option to pass two selectors to target the element start and stop animation scrolling values -> to be used for sticky/fixed elements
  };

  function initScrollFx(element) {
    // do not animate if reduced motion is on
    if(Util.osHasReducedMotion()) return;
    // get scrollable element
    setScrollableElement(element);
    // get animation params
    var animation = element.element.getAttribute('data-scroll-fx');
    if(animation) {
      element.options.push(extractAnimation(animation));
    } else {
      getAnimations(element, 1);
    }
    // set Intersection Observer
    initObserver(element);
    // update params on resize
    initResize(element);
  };

  function setScrollableElement(element) {
    if(element.scrollableSelector) element.scrollableElement = document.querySelector(element.scrollableSelector);
  };

  function initObserver(element) {
    for(var i = 0; i < element.options.length; i++) {
      (function(i){
        element.scrollingFx[i] = false;
        element.deltaScrolling[i] = getDeltaScrolling(element, i);
        element.animating[i] = false;

        element.observer[i] = new IntersectionObserver(
            function(entries, observer) {
              scrollFxCallback(element, i, entries, observer);
            },
            {
              rootMargin: (element.options[i][5] -100)+"% 0px "+(0 - element.options[i][4])+"% 0px"
            }
        );

        element.observer[i].observe(element.element);

        // set initial value
        setTimeout(function(){
          animateScrollFx.bind(element, i)();
        })
      })(i);
    }
  };

  function scrollFxCallback(element, index, entries, observer) {
    if(entries[0].isIntersecting) {
      if(element.scrollingFx[index]) return; // listener for scroll event already added
      // reset delta
      resetDeltaBeforeAnim(element, index);
      triggerAnimateScrollFx(element, index);
    } else {
      if(!element.scrollingFx[index]) return; // listener for scroll event already removed
      window.removeEventListener('scroll', element.scrollingFx[index]);
      element.scrollingFx[index] = false;
    }
  };

  function triggerAnimateScrollFx(element, index) {
    element.scrollingFx[index] = animateScrollFx.bind(element, index);
    (element.scrollableElement)
        ? element.scrollableElement.addEventListener('scroll', element.scrollingFx[index])
        : window.addEventListener('scroll', element.scrollingFx[index]);
  };

  function animateScrollFx(index) {
    // if window scroll is outside the proper range -> return
    if(getScrollY(this) < this.deltaScrolling[index][0]) {
      setCSSProperty(this, index, this.options[index][1]);
      return;
    }
    if(getScrollY(this) > this.deltaScrolling[index][1]) {
      setCSSProperty(this, index, this.options[index][2]);
      return;
    }
    if(this.animating[index]) return;
    this.animating[index] = true;
    window.requestAnimationFrame(updatePropertyScroll.bind(this, index));
  };

  function updatePropertyScroll(index) { // get value
    // check if this is a theme value or a css property
    if(isNaN(this.options[index][1])) {
      // this is a theme value to update
      (getScrollY(this) >= this.deltaScrolling[index][1])
          ? setCSSProperty(this, index, this.options[index][2])
          : setCSSProperty(this, index, this.options[index][1]);
    } else {
      // this is a CSS property
      var value = this.options[index][1] + (this.options[index][2] - this.options[index][1])*(getScrollY(this) - this.deltaScrolling[index][0])/(this.deltaScrolling[index][1] - this.deltaScrolling[index][0]);
      // update css property
      setCSSProperty(this, index, value);
    }

    this.animating[index] = false;
  };

  function setCSSProperty(element, index, value) {
    if(isNaN(value)) {
      // this is a theme value that needs to be updated
      setThemeValue(element, value);
      return;
    }
    if(element.options[index][0] == '--scroll-fx-skew' || element.options[index][0] == '--scroll-fx-scale') {
      // set 2 different CSS properties for the transformation on both x and y axis
      element.element.style.setProperty(element.options[index][0]+'-x', value+element.options[index][3]);
      element.element.style.setProperty(element.options[index][0]+'-y', value+element.options[index][3]);
    } else {
      // set single CSS property
      element.element.style.setProperty(element.options[index][0], value+element.options[index][3]);
    }
  };

  function setThemeValue(element, value) {
    // if value is different from the theme in use -> update it
    if(element.element.getAttribute('data-theme') != value) {
      Util.addClass(element.element, 'scroll-fx--theme-transition');
      element.element.offsetWidth;
      element.element.setAttribute('data-theme', value);
      element.element.addEventListener('transitionend', function cb(){
        element.element.removeEventListener('transitionend', cb);
        Util.removeClass(element.element, 'scroll-fx--theme-transition');
      });
    }
  };

  function getAnimations(element, index) {
    var option = element.element.getAttribute('data-scroll-fx-'+index);
    if(option) {
      // multiple animations for the same element - iterate through them
      element.options.push(extractAnimation(option));
      getAnimations(element, index+1);
    }
    return;
  };

  function extractAnimation(option) {
    var array = option.split(',').map(function(item) {
      return item.trim();
    });
    var propertyOptions = getPropertyValues(array[1], array[2]);
    var animation = [getPropertyLabel(array[0]), propertyOptions[0], propertyOptions[1], propertyOptions[2], parseInt(array[3]), parseInt(array[4])];
    return animation;
  };

  function getPropertyLabel(property) {
    var propertyCss = '--scroll-fx-';
    for(var i = 0; i < property.length; i++) {
      propertyCss = (property[i] == property[i].toUpperCase())
          ? propertyCss + '-'+property[i].toLowerCase()
          : propertyCss +property[i];
    }
    if(propertyCss == '--scroll-fx-rotate') {
      propertyCss = '--scroll-fx-rotate-z';
    } else if(propertyCss == '--scroll-fx-translate') {
      propertyCss = '--scroll-fx-translate-x';
    }
    return propertyCss;
  };

  function getPropertyValues(val1, val2) {
    var nbVal1 = parseFloat(val1),
        nbVal2 = parseFloat(val2),
        unit = val1.replace(nbVal1, '');
    if(isNaN(nbVal1)) {
      // property is a theme value
      nbVal1 = val1;
      nbVal2 = val2;
      unit = '';
    }
    return [nbVal1, nbVal2, unit];
  };

  function getDeltaScrolling(element, index) {
    // this retrieve the max and min scroll value that should trigger the animation
    var topDelta = getScrollY(element) - (element.windowHeight - (element.windowHeight + element.boundingRect.height)*element.options[index][4]/100) + element.boundingRect.top,
        bottomDelta = getScrollY(element) - (element.windowHeight - (element.windowHeight + element.boundingRect.height)*element.options[index][5]/100) + element.boundingRect.top;
    return [topDelta, bottomDelta];
  };

  function initResize(element) {
    var resizingId = false;
    window.addEventListener('resize', function() {
      clearTimeout(resizingId);
      resizingId = setTimeout(resetResize.bind(element), 500);
    });
    // emit custom event -> elements have been initialized
    var event = new CustomEvent('scrollFxReady');
    element.element.dispatchEvent(event);
  };

  function resetResize() {
    // on resize -> make sure to update all scrolling delta values
    this.boundingRect = this.element.getBoundingClientRect();
    this.windowHeight = window.innerHeight;
    for(var i = 0; i < this.deltaScrolling.length; i++) {
      this.deltaScrolling[i] = getDeltaScrolling(this, i);
      animateScrollFx.bind(this, i)();
    }
    // emit custom event -> elements have been resized
    var event = new CustomEvent('scrollFxResized');
    this.element.dispatchEvent(event);
  };

  function resetDeltaBeforeAnim(element, index) {
    element.boundingRect = element.element.getBoundingClientRect();
    element.windowHeight = window.innerHeight;
    element.deltaScrolling[index] = getDeltaScrolling(element, index);
  };

  function getScrollY(element) {
    if(!element.scrollableElement) return window.scrollY;
    return element.scrollableElement.scrollTop;
  }

  window.ScrollFx = ScrollFx;

  var scrollFx = document.getElementsByClassName('js-scroll-fx');
  for(var i = 0; i < scrollFx.length; i++) {
    (function(i){
      var scrollableElement = scrollFx[i].getAttribute('data-scrollable-element');
      new ScrollFx(scrollFx[i], scrollableElement);
    })(i);
  }
}());

// File#: _1_sticky-banner
// Usage: codyhouse.co/license
(function() {
  var StickyBanner = function(element) {
    this.element = element;
    this.offsetIn = 0;
    this.offsetOut = 0;
    this.targetIn = this.element.getAttribute('data-target-in') ? document.querySelector(this.element.getAttribute('data-target-in')) : false;
    this.targetOut = this.element.getAttribute('data-target-out') ? document.querySelector(this.element.getAttribute('data-target-out')) : false;
    this.reset = 0;
    // check if the window is the scrollable element
    this.dataElement = this.element.getAttribute('data-element');
    this.scrollElement = this.dataElement ? document.querySelector(this.dataElement) : window;
    this.scrollingId = false;
    getBannerOffsets(this);
    initBanner(this);
  };

  function getBannerOffsets(element) { // get offset in and offset out values
    // update offsetIn
    element.offsetIn = 0;
    var windowTop = getScrollTop(element);

    if(element.targetIn) {
      var boundingClientRect = element.targetIn.getBoundingClientRect();
      element.offsetIn = boundingClientRect.top + windowTop + boundingClientRect.height;
    }
    var dataOffsetIn = element.element.getAttribute('data-offset-in');
    if(dataOffsetIn) {
      element.offsetIn = element.offsetIn + parseInt(dataOffsetIn);
    }
    // update offsetOut
    element.offsetOut = 0;
    if(element.targetOut) {
      var boundingClientRect = element.targetOut.getBoundingClientRect();
      element.offsetOut = boundingClientRect.top + windowTop - window.innerHeight;
    }
    var dataOffsetOut = element.element.getAttribute('data-offset-out');
    if(dataOffsetOut) {
      element.offsetOut = element.offsetOut + parseInt(dataOffsetOut);
    }
  };

  function initBanner(element) {
    resetBannerVisibility(element);

    element.element.addEventListener('resize-banner', function(){
      getBannerOffsets(element);
      resetBannerVisibility(element);
    });

    element.element.addEventListener('scroll-banner', function(){
      if(element.reset < 10) {
        getBannerOffsets(element);
        element.reset = element.reset + 1;
      }
      resetBannerVisibility(element);
    });

    if(element.dataElement && element.scrollElement) {
      // the scrollable element is different from the window - detect the scrolling
      element.scrollElement.addEventListener('scroll', function(event){
        if(element.scrollingId) return;
        element.scrollingId = true;
        window.requestAnimationFrame(function(){
          element.element.dispatchEvent(new CustomEvent('scroll-banner'));
          element.scrollingId = false;
        })
      });
    }
  };

  function resetBannerVisibility(element) {
    var scrollTop = getScrollTop(element),
      topTarget = false,
      bottomTarget = false;
    if(element.offsetIn < scrollTop) {
      topTarget = true;
    }
    if(element.offsetOut == 0 || scrollTop < element.offsetOut) {
      bottomTarget = true;
    }

    Util.toggleClass(element.element, 'sticky-banner--visible', bottomTarget && topTarget);
  };

  function getScrollTop(element) {
    // the scrollable element could be different from the window element
    var windowTop = element.scrollElement.scrollTop || document.documentElement.scrollTop;
    if(!element.dataElement) windowTop = window.scrollY || document.documentElement.scrollTop;
    return windowTop;
  };

  //initialize the Sticky Banner objects
	var stckyBanner = document.getElementsByClassName('js-sticky-banner');
	if( stckyBanner.length > 0 ) {
		for( var i = 0; i < stckyBanner.length; i++) {
			(function(i){new StickyBanner(stckyBanner[i]);})(i);
    }
    
    // init scroll/resize
    var resizingId = false,
      scrollingId = false,
      resizeEvent = new CustomEvent('resize-banner'),
      scrollEvent = new CustomEvent('scroll-banner');
    
    window.addEventListener('resize', function(event){
      clearTimeout(resizingId);
      resizingId = setTimeout(function(){
        doneResizing(resizeEvent);
      }, 300);
    });

    window.addEventListener('scroll', function(event){
      if(scrollingId) return;
      scrollingId = true;
      window.requestAnimationFrame 
        ? window.requestAnimationFrame(function(){
          doneResizing(scrollEvent);
          scrollingId = false;
        })
        : setTimeout(function(){
          doneResizing(scrollEvent);
          scrollingId = false;
        }, 200);

      resizingId = setTimeout(function(){
        doneResizing(resizeEvent);
      }, 300);
    });

    function doneResizing(event) {
      for( var i = 0; i < stckyBanner.length; i++) {
        (function(i){stckyBanner[i].dispatchEvent(event)})(i);
      };
    };
	}
}());
// File#: _1_sticky-hero
// Usage: codyhouse.co/license
(function() {
	var StickyBackground = function(element) {
		this.element = element;
		this.scrollingElement = this.element.getElementsByClassName('sticky-hero__content')[0];
		this.nextElement = this.element.nextElementSibling;
		this.scrollingTreshold = 0;
		this.nextTreshold = 0;
		initStickyEffect(this);
	};

	function initStickyEffect(element) {
		var observer = new IntersectionObserver(stickyCallback.bind(element), { threshold: [0, 0.1, 1] });
		observer.observe(element.scrollingElement);
		if(element.nextElement) observer.observe(element.nextElement);
	};

	function stickyCallback(entries, observer) {
		var threshold = entries[0].intersectionRatio.toFixed(1);
		(entries[0].target ==  this.scrollingElement)
			? this.scrollingTreshold = threshold
			: this.nextTreshold = threshold;

		Util.toggleClass(this.element, 'sticky-hero--media-is-fixed', (this.nextTreshold > 0 || this.scrollingTreshold > 0));
	};


	var stickyBackground = document.getElementsByClassName('js-sticky-hero'),
		intersectionObserverSupported = ('IntersectionObserver' in window && 'IntersectionObserverEntry' in window && 'intersectionRatio' in window.IntersectionObserverEntry.prototype);
	if(stickyBackground.length > 0 && intersectionObserverSupported) { // if IntersectionObserver is not supported, animations won't be triggeres
		for(var i = 0; i < stickyBackground.length; i++) {
			(function(i){ // if animations are enabled -> init the StickyBackground object
        if( Util.hasClass(stickyBackground[i], 'sticky-hero--overlay-layer') || Util.hasClass(stickyBackground[i], 'sticky-hero--scale')) new StickyBackground(stickyBackground[i]);
      })(i);
		}
	}
}());
// File#: _1_swipe-content
(function() {
	var SwipeContent = function(element) {
		this.element = element;
		this.delta = [false, false];
		this.dragging = false;
		this.intervalId = false;
		initSwipeContent(this);
	};

	function initSwipeContent(content) {
		content.element.addEventListener('mousedown', handleEvent.bind(content));
		content.element.addEventListener('touchstart', handleEvent.bind(content), {passive: true});
	};

	function initDragging(content) {
		//add event listeners
		content.element.addEventListener('mousemove', handleEvent.bind(content));
		content.element.addEventListener('touchmove', handleEvent.bind(content), {passive: true});
		content.element.addEventListener('mouseup', handleEvent.bind(content));
		content.element.addEventListener('mouseleave', handleEvent.bind(content));
		content.element.addEventListener('touchend', handleEvent.bind(content));
	};

	function cancelDragging(content) {
		//remove event listeners
		if(content.intervalId) {
			(!window.requestAnimationFrame) ? clearInterval(content.intervalId) : window.cancelAnimationFrame(content.intervalId);
			content.intervalId = false;
		}
		content.element.removeEventListener('mousemove', handleEvent.bind(content));
		content.element.removeEventListener('touchmove', handleEvent.bind(content));
		content.element.removeEventListener('mouseup', handleEvent.bind(content));
		content.element.removeEventListener('mouseleave', handleEvent.bind(content));
		content.element.removeEventListener('touchend', handleEvent.bind(content));
	};

	function handleEvent(event) {
		switch(event.type) {
			case 'mousedown':
			case 'touchstart':
				startDrag(this, event);
				break;
			case 'mousemove':
			case 'touchmove':
				drag(this, event);
				break;
			case 'mouseup':
			case 'mouseleave':
			case 'touchend':
				endDrag(this, event);
				break;
		}
	};

	function startDrag(content, event) {
		content.dragging = true;
		// listen to drag movements
		initDragging(content);
		content.delta = [parseInt(unify(event).clientX), parseInt(unify(event).clientY)];
		// emit drag start event
		emitSwipeEvents(content, 'dragStart', content.delta, event.target);
	};

	function endDrag(content, event) {
		cancelDragging(content);
		// credits: https://css-tricks.com/simple-swipe-with-vanilla-javascript/
		var dx = parseInt(unify(event).clientX), 
	    dy = parseInt(unify(event).clientY);
	  
	  // check if there was a left/right swipe
		if(content.delta && (content.delta[0] || content.delta[0] === 0)) {
	    var s = getSign(dx - content.delta[0]);
			
			if(Math.abs(dx - content.delta[0]) > 30) {
				(s < 0) ? emitSwipeEvents(content, 'swipeLeft', [dx, dy]) : emitSwipeEvents(content, 'swipeRight', [dx, dy]);	
			}
	    
	    content.delta[0] = false;
	  }
		// check if there was a top/bottom swipe
	  if(content.delta && (content.delta[1] || content.delta[1] === 0)) {
	  	var y = getSign(dy - content.delta[1]);

	  	if(Math.abs(dy - content.delta[1]) > 30) {
	    	(y < 0) ? emitSwipeEvents(content, 'swipeUp', [dx, dy]) : emitSwipeEvents(content, 'swipeDown', [dx, dy]);
	    }

	    content.delta[1] = false;
	  }
		// emit drag end event
	  emitSwipeEvents(content, 'dragEnd', [dx, dy]);
	  content.dragging = false;
	};

	function drag(content, event) {
		if(!content.dragging) return;
		// emit dragging event with coordinates
		(!window.requestAnimationFrame) 
			? content.intervalId = setTimeout(function(){emitDrag.bind(content, event);}, 250) 
			: content.intervalId = window.requestAnimationFrame(emitDrag.bind(content, event));
	};

	function emitDrag(event) {
		emitSwipeEvents(this, 'dragging', [parseInt(unify(event).clientX), parseInt(unify(event).clientY)]);
	};

	function unify(event) { 
		// unify mouse and touch events
		return event.changedTouches ? event.changedTouches[0] : event; 
	};

	function emitSwipeEvents(content, eventName, detail, el) {
		var trigger = false;
		if(el) trigger = el;
		// emit event with coordinates
		var event = new CustomEvent(eventName, {detail: {x: detail[0], y: detail[1], origin: trigger}});
		content.element.dispatchEvent(event);
	};

	function getSign(x) {
		if(!Math.sign) {
			return ((x > 0) - (x < 0)) || +x;
		} else {
			return Math.sign(x);
		}
	};

	window.SwipeContent = SwipeContent;
	
	//initialize the SwipeContent objects
	var swipe = document.getElementsByClassName('js-swipe-content');
	if( swipe.length > 0 ) {
		for( var i = 0; i < swipe.length; i++) {
			(function(i){new SwipeContent(swipe[i]);})(i);
		}
	}
}());
// File#: _1_tabs
// Usage: codyhouse.co/license
(function() {
	var Tab = function(element) {
		this.element = element;
		this.tabList = this.element.getElementsByClassName('js-tabs__controls')[0];
		this.listItems = this.tabList.getElementsByTagName('li');
		this.triggers = this.tabList.getElementsByTagName('a');
		this.panelsList = this.element.getElementsByClassName('js-tabs__panels')[0];
		this.panels = Util.getChildrenByClassName(this.panelsList, 'js-tabs__panel');
		this.hideClass = 'is-hidden';
		this.customShowClass = this.element.getAttribute('data-show-panel-class') ? this.element.getAttribute('data-show-panel-class') : false;
		this.layout = this.element.getAttribute('data-tabs-layout') ? this.element.getAttribute('data-tabs-layout') : 'horizontal';
		// deep linking options
		this.deepLinkOn = this.element.getAttribute('data-deep-link') == 'on';
		// init tabs
		this.initTab();
	};

	Tab.prototype.initTab = function() {
		//set initial aria attributes
		this.tabList.setAttribute('role', 'tablist');
		for( var i = 0; i < this.triggers.length; i++) {
			var bool = (i == 0),
				panelId = this.panels[i].getAttribute('id');
			this.listItems[i].setAttribute('role', 'presentation');
			Util.setAttributes(this.triggers[i], {'role': 'tab', 'aria-selected': bool, 'aria-controls': panelId, 'id': 'tab-'+panelId});
			Util.addClass(this.triggers[i], 'js-tabs__trigger'); 
			Util.setAttributes(this.panels[i], {'role': 'tabpanel', 'aria-labelledby': 'tab-'+panelId});
			Util.toggleClass(this.panels[i], this.hideClass, !bool);

			if(!bool) this.triggers[i].setAttribute('tabindex', '-1'); 
		}

		//listen for Tab events
		this.initTabEvents();

		// check deep linking option
		this.initDeepLink();
	};

	Tab.prototype.initTabEvents = function() {
		var self = this;
		//click on a new tab -> select content
		this.tabList.addEventListener('click', function(event) {
			if( event.target.closest('.js-tabs__trigger') ) self.triggerTab(event.target.closest('.js-tabs__trigger'), event);
		});
		//arrow keys to navigate through tabs 
		this.tabList.addEventListener('keydown', function(event) {
			;
			if( !event.target.closest('.js-tabs__trigger') ) return;
			if( tabNavigateNext(event, self.layout) ) {
				event.preventDefault();
				self.selectNewTab('next');
			} else if( tabNavigatePrev(event, self.layout) ) {
				event.preventDefault();
				self.selectNewTab('prev');
			}
		});
	};

	Tab.prototype.selectNewTab = function(direction) {
		var selectedTab = this.tabList.querySelector('[aria-selected="true"]'),
			index = Util.getIndexInArray(this.triggers, selectedTab);
		index = (direction == 'next') ? index + 1 : index - 1;
		//make sure index is in the correct interval 
		//-> from last element go to first using the right arrow, from first element go to last using the left arrow
		if(index < 0) index = this.listItems.length - 1;
		if(index >= this.listItems.length) index = 0;	
		this.triggerTab(this.triggers[index]);
		this.triggers[index].focus();
	};

	Tab.prototype.triggerTab = function(tabTrigger, event) {
		var self = this;
		event && event.preventDefault();	
		var index = Util.getIndexInArray(this.triggers, tabTrigger);
		//no need to do anything if tab was already selected
		if(this.triggers[index].getAttribute('aria-selected') == 'true') return;
		
		for( var i = 0; i < this.triggers.length; i++) {
			var bool = (i == index);
			Util.toggleClass(this.panels[i], this.hideClass, !bool);
			if(this.customShowClass) Util.toggleClass(this.panels[i], this.customShowClass, bool);
			this.triggers[i].setAttribute('aria-selected', bool);
			bool ? this.triggers[i].setAttribute('tabindex', '0') : this.triggers[i].setAttribute('tabindex', '-1');
		}

		// update url if deepLink is on
		if(this.deepLinkOn) {
			history.replaceState(null, '', '#'+tabTrigger.getAttribute('aria-controls'));
		}
	};

	Tab.prototype.initDeepLink = function() {
		if(!this.deepLinkOn) return;
		var hash = window.location.hash.substr(1);
		var self = this;
		if(!hash || hash == '') return;
		for(var i = 0; i < this.panels.length; i++) {
			if(this.panels[i].getAttribute('id') == hash) {
				this.triggerTab(this.triggers[i], false);
				setTimeout(function(){self.panels[i].scrollIntoView(true);});
				break;
			}
		};
	};

	function tabNavigateNext(event, layout) {
		if(layout == 'horizontal' && (event.keyCode && event.keyCode == 39 || event.key && event.key == 'ArrowRight')) {return true;}
		else if(layout == 'vertical' && (event.keyCode && event.keyCode == 40 || event.key && event.key == 'ArrowDown')) {return true;}
		else {return false;}
	};

	function tabNavigatePrev(event, layout) {
		if(layout == 'horizontal' && (event.keyCode && event.keyCode == 37 || event.key && event.key == 'ArrowLeft')) {return true;}
		else if(layout == 'vertical' && (event.keyCode && event.keyCode == 38 || event.key && event.key == 'ArrowUp')) {return true;}
		else {return false;}
	};
	
	//initialize the Tab objects
	var tabs = document.getElementsByClassName('js-tabs');
	if( tabs.length > 0 ) {
		for( var i = 0; i < tabs.length; i++) {
			(function(i){new Tab(tabs[i]);})(i);
		}
	}
}());
(function () {
  var themeSwitch = document.getElementById('theme-switch');
  if (themeSwitch) {
    var htmlElement = document.getElementsByTagName("html")[0];
    initTheme();

    themeSwitch.addEventListener('change', function (event) {
      resetTheme(event.target);
    });

    function initTheme() {
      if (htmlElement.getAttribute('data-theme') == 'dark') {
        themeSwitch.querySelector('input[value="dark"]').checked = true;
      }
    };

    function resetTheme(target) {
      if (target.value == 'dark') {
        htmlElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('themeSwitch', 'dark');
      } else {
        htmlElement.removeAttribute('data-theme');
        localStorage.removeItem('themeSwitch');
      }
    };
  }
}());
// File#: _1_tilted-img-slideshow
// Usage: codyhouse.co/license
(function() {
  var TiltedSlideshow = function(element) {
    this.element = element;
    this.list = this.element.getElementsByClassName('js-tilted-slideshow__list')[0];
    this.images = this.list.getElementsByClassName('js-tilted-slideshow__item');
    this.selectedIndex = 0;
    this.animating = false;
    // classes
    this.orderClasses = ['tilted-slideshow__item--top', 'tilted-slideshow__item--middle', 'tilted-slideshow__item--bottom'];
    this.moveClasses = ['tilted-slideshow__item--move-out', 'tilted-slideshow__item--move-in'];
    this.interactedClass = 'tilted-slideshow--interacted';
    initTiltedSlideshow(this);
  };

  function initTiltedSlideshow(slideshow) {
    if(!animateImgs) removeTransitions(slideshow);
    
    slideshow.list.addEventListener('click', function(event) {
      Util.addClass(slideshow.element, slideshow.interactedClass);
      animateImgs ? animateImages(slideshow) : switchImages(slideshow);
    });
  };

  function removeTransitions(slideshow) {
    // if reduced motion is on or css variables are not supported -> do not animate images
    for(var i = 0; i < slideshow.images.length; i++) {
      slideshow.images[i].style.transition = 'none';
    }
  };

  function switchImages(slideshow) {
    // if reduced motion is on or css variables are not supported -> switch images without animation
    resetOrderClasses(slideshow);
    resetSelectedIndex(slideshow);
  };

  function resetSelectedIndex(slideshow) {
    // update the index of the top image
    slideshow.selectedIndex = resetIndex(slideshow, slideshow.selectedIndex + 1);
  };

  function resetIndex(slideshow, index) {
    // make sure index is < 3
    if(index >= slideshow.images.length) index = index - slideshow.images.length;
    return index;
  };

  function resetOrderClasses(slideshow) {
    // update the orderClasses for each images
    if(!animateImgs) {
      // top image -> remove top class and add bottom class
      Util.addClass(slideshow.images[slideshow.selectedIndex], slideshow.orderClasses[2]);
      Util.removeClass(slideshow.images[slideshow.selectedIndex], slideshow.orderClasses[0]);
    }

    // middle image -> remove middle class and add top class
    var middleImage = slideshow.images[resetIndex(slideshow, slideshow.selectedIndex + 1)];
    Util.addClass(middleImage, slideshow.orderClasses[0]);
    Util.removeClass(middleImage, slideshow.orderClasses[1]);

    // bottom image -> remove bottom class and add middle class
    var bottomImage = slideshow.images[resetIndex(slideshow, slideshow.selectedIndex + 2)];
    Util.addClass(bottomImage, slideshow.orderClasses[1]);
    Util.removeClass(bottomImage, slideshow.orderClasses[2]);
  };

  function animateImages(slideshow) {
    if(slideshow.animating) return;
    slideshow.animating = true;

    // reset order classes for middle/bottom images
    resetOrderClasses(slideshow);
    
    // animate top image
    var topImage = slideshow.images[slideshow.selectedIndex];
    // remove top class and add move out class
    Util.removeClass(topImage, slideshow.orderClasses[0]);
    Util.addClass(topImage, slideshow.moveClasses[0]);
    
    topImage.addEventListener('transitionend', function cb(event) {
      // remove transition
			topImage.style.transition = 'none';
			topImage.removeEventListener("transitionend", cb);
      
      setTimeout(function(){
        // add bottom + move-in class, remove move-out class
        Util.removeClass(topImage, slideshow.moveClasses[0]);
        Util.addClass(topImage, slideshow.moveClasses[1]+' '+ slideshow.orderClasses[2]);
        setTimeout(function(){
          topImage.style.transition = '';
          // remove move-in class
          Util.removeClass(topImage, slideshow.moveClasses[1]);
          topImage.addEventListener('transitionend', function cbn(event) {
            // reset animating property and selectedIndex index
            resetSelectedIndex(slideshow);
            slideshow.animating = false;
            topImage.removeEventListener("transitionend", cbn);
          });
        }, 10);
      }, 10);
		});
  };

  var tiltedSlideshow = document.getElementsByClassName('js-tilted-slideshow'),
    animateImgs = !Util.osHasReducedMotion() && ('CSS' in window) && CSS.supports('color', 'var(--color-var)');
  if(tiltedSlideshow.length > 0) {
    for(var i = 0; i < tiltedSlideshow.length; i++) {
      new TiltedSlideshow(tiltedSlideshow[i]);
    }
  }
}());
// File#: _1_vertical-timeline
// Usage: codyhouse.co/license
(function() {
	var VTimeline = function(element) {
    this.element = element;
    this.sections = this.element.getElementsByClassName('js-v-timeline__section');
    this.animate = this.element.getAttribute('data-animation') && this.element.getAttribute('data-animation') == 'on' ? true : false;
    this.animationClass = 'v-timeline__section--animate';
    this.animationDelta = '-150px';
    initVTimeline(this);
  };

  function initVTimeline(element) {
    if(!element.animate) return;
    for(var i = 0; i < element.sections.length; i++) {
      var observer = new IntersectionObserver(vTimelineCallback.bind(element, i),
      {rootMargin: "0px 0px "+element.animationDelta+" 0px"});
		  observer.observe(element.sections[i]);
    }
  };

  function vTimelineCallback(index, entries, observer) {
    if(entries[0].isIntersecting) {
      Util.addClass(this.sections[index], this.animationClass);
      observer.unobserve(this.sections[index]);
    } 
  };

  //initialize the VTimeline objects
  var timelines = document.querySelectorAll('.js-v-timeline'),
    intersectionObserverSupported = ('IntersectionObserver' in window && 'IntersectionObserverEntry' in window && 'intersectionRatio' in window.IntersectionObserverEntry.prototype),
    reducedMotion = Util.osHasReducedMotion();
	if( timelines.length > 0) {
		for( var i = 0; i < timelines.length; i++) {
      if(intersectionObserverSupported && !reducedMotion) (function(i){new VTimeline(timelines[i]);})(i);
      else timelines[i].removeAttribute('data-animation');
		}
	}
}());
// File#: _2_carousel
// Usage: codyhouse.co/license
(function() {
  var Carousel = function(opts) {
    this.options = Util.extend(Carousel.defaults , opts);
    this.element = this.options.element;
    this.listWrapper = this.element.getElementsByClassName('carousel__wrapper')[0];
    this.list = this.element.getElementsByClassName('carousel__list')[0];
    this.items = this.element.getElementsByClassName('carousel__item');
    this.initItems = []; // store only the original elements - will need this for cloning
    this.itemsNb = this.items.length; //original number of items
    this.visibItemsNb = 1; // tot number of visible items
    this.itemsWidth = 1; // this will be updated with the right width of items
    this.itemOriginalWidth = false; // store the initial width to use it on resize
    this.selectedItem = 0; // index of first visible item 
    this.translateContainer = 0; // this will be the amount the container has to be translated each time a new group has to be shown (negative)
    this.containerWidth = 0; // this will be used to store the total width of the carousel (including the overflowing part)
    this.ariaLive = false;
    // navigation
    this.controls = this.element.getElementsByClassName('js-carousel__control');
    this.animating = false;
    // autoplay
    this.autoplayId = false;
    this.autoplayPaused = false;
    //drag
    this.dragStart = false;
    // resize
    this.resizeId = false;
    // used to re-initialize js
    this.cloneList = [];
    // store items min-width
    this.itemAutoSize = false;
    // store translate value (loop = off)
    this.totTranslate = 0;
    // modify loop option if navigation is on
    if(this.options.nav) this.options.loop = false;
    // store counter elements (if present)
    this.counter = this.element.getElementsByClassName('js-carousel__counter');
    this.counterTor = this.element.getElementsByClassName('js-carousel__counter-tot');
    initCarouselLayout(this); // get number visible items + width items
    setItemsWidth(this, true); 
    insertBefore(this, this.visibItemsNb); // insert clones before visible elements
    updateCarouselClones(this); // insert clones after visible elements
    resetItemsTabIndex(this); // make sure not visible items are not focusable
    initAriaLive(this); // set aria-live region for SR
    initCarouselEvents(this); // listen to events
    initCarouselCounter(this);
    Util.addClass(this.element, 'carousel--loaded');
  };
  
  //public carousel functions
  Carousel.prototype.showNext = function() {
    showNextItems(this);
  };

  Carousel.prototype.showPrev = function() {
    showPrevItems(this);
  };

  Carousel.prototype.startAutoplay = function() {
    startAutoplay(this);
  };

  Carousel.prototype.pauseAutoplay = function() {
    pauseAutoplay(this);
  };
  
  //private carousel functions
  function initCarouselLayout(carousel) {
    // evaluate size of single elements + number of visible elements
    var itemStyle = window.getComputedStyle(carousel.items[0]),
      containerStyle = window.getComputedStyle(carousel.listWrapper),
      itemWidth = parseFloat(itemStyle.getPropertyValue('width')),
      itemMargin = parseFloat(itemStyle.getPropertyValue('margin-right')),
      containerPadding = parseFloat(containerStyle.getPropertyValue('padding-left')),
      containerWidth = parseFloat(containerStyle.getPropertyValue('width'));

    if(!carousel.itemAutoSize) {
      carousel.itemAutoSize = itemWidth;
    }

    // if carousel.listWrapper is hidden -> make sure to retrieve the proper width
    containerWidth = getCarouselWidth(carousel, containerWidth);

    if( !carousel.itemOriginalWidth) { // on resize -> use initial width of items to recalculate 
      carousel.itemOriginalWidth = itemWidth;
    } else {
      itemWidth = carousel.itemOriginalWidth;
    }

    if(carousel.itemAutoSize) {
      carousel.itemOriginalWidth = parseInt(carousel.itemAutoSize);
      itemWidth = carousel.itemOriginalWidth;
    }
    // make sure itemWidth is smaller than container width
    if(containerWidth < itemWidth) {
      carousel.itemOriginalWidth = containerWidth
      itemWidth = carousel.itemOriginalWidth;
    }
    // get proper width of elements
    carousel.visibItemsNb = parseInt((containerWidth - 2*containerPadding + itemMargin)/(itemWidth+itemMargin));
    carousel.itemsWidth = parseFloat( (((containerWidth - 2*containerPadding + itemMargin)/carousel.visibItemsNb) - itemMargin).toFixed(1));
    carousel.containerWidth = (carousel.itemsWidth+itemMargin)* carousel.items.length;
    carousel.translateContainer = 0 - ((carousel.itemsWidth+itemMargin)* carousel.visibItemsNb);
    // flexbox fallback
    if(!flexSupported) carousel.list.style.width = (carousel.itemsWidth + itemMargin)*carousel.visibItemsNb*3+'px';
    
    // this is used when loop == off
    carousel.totTranslate = 0 - carousel.selectedItem*(carousel.itemsWidth+itemMargin);
    if(carousel.items.length <= carousel.visibItemsNb) carousel.totTranslate = 0;

    centerItems(carousel); // center items if carousel.items.length < visibItemsNb
    alignControls(carousel); // check if controls need to be aligned to a different element
  };

  function setItemsWidth(carousel, bool) {
    for(var i = 0; i < carousel.items.length; i++) {
      carousel.items[i].style.width = carousel.itemsWidth+"px";
      if(bool) carousel.initItems.push(carousel.items[i]);
    }
  };

  function updateCarouselClones(carousel) { 
    if(!carousel.options.loop) return;
    // take care of clones after visible items (needs to run after the update of clones before visible items)
    if(carousel.items.length < carousel.visibItemsNb*3) {
      insertAfter(carousel, carousel.visibItemsNb*3 - carousel.items.length, carousel.items.length - carousel.visibItemsNb*2);
    } else if(carousel.items.length > carousel.visibItemsNb*3 ) {
      removeClones(carousel, carousel.visibItemsNb*3, carousel.items.length - carousel.visibItemsNb*3);
    }
    // set proper translate value for the container
    setTranslate(carousel, 'translateX('+carousel.translateContainer+'px)');
  };

  function initCarouselEvents(carousel) {
    // listen for click on previous/next arrow
    // dots navigation
    if(carousel.options.nav) {
      carouselCreateNavigation(carousel);
      carouselInitNavigationEvents(carousel);
    }

    if(carousel.controls.length > 0) {
      carousel.controls[0].addEventListener('click', function(event){
        event.preventDefault();
        showPrevItems(carousel);
        updateAriaLive(carousel);
      });
      carousel.controls[1].addEventListener('click', function(event){
        event.preventDefault();
        showNextItems(carousel);
        updateAriaLive(carousel);
      });

      // update arrow visility -> loop == off only
      resetCarouselControls(carousel);
      // emit custom event - items visible
      emitCarouselActiveItemsEvent(carousel)
    }
    // autoplay
    if(carousel.options.autoplay) {
      startAutoplay(carousel);
      // pause autoplay if user is interacting with the carousel
      if(!carousel.options.autoplayOnHover) {
        carousel.element.addEventListener('mouseenter', function(event){
          pauseAutoplay(carousel);
          carousel.autoplayPaused = true;
        });
        carousel.element.addEventListener('mouseleave', function(event){
          carousel.autoplayPaused = false;
          startAutoplay(carousel);
        });
      }
      if(!carousel.options.autoplayOnFocus) {
        carousel.element.addEventListener('focusin', function(event){
          pauseAutoplay(carousel);
          carousel.autoplayPaused = true;
        });
      
        carousel.element.addEventListener('focusout', function(event){
          carousel.autoplayPaused = false;
          startAutoplay(carousel);
        });
      }
    }
    // drag events
    if(carousel.options.drag && window.requestAnimationFrame) {
      //init dragging
      new SwipeContent(carousel.element);
      carousel.element.addEventListener('dragStart', function(event){
        if(event.detail.origin && event.detail.origin.closest('.js-carousel__control')) return;
        if(event.detail.origin && event.detail.origin.closest('.js-carousel__navigation')) return;
        if(event.detail.origin && !event.detail.origin.closest('.carousel__wrapper')) return;
        Util.addClass(carousel.element, 'carousel--is-dragging');
        pauseAutoplay(carousel);
        carousel.dragStart = event.detail.x;
        animateDragEnd(carousel);
      });
      carousel.element.addEventListener('dragging', function(event){
        if(!carousel.dragStart) return;
        if(carousel.animating || Math.abs(event.detail.x - carousel.dragStart) < 10) return;
        var translate = event.detail.x - carousel.dragStart + carousel.translateContainer;
        if(!carousel.options.loop) {
          translate = event.detail.x - carousel.dragStart + carousel.totTranslate; 
        }
        setTranslate(carousel, 'translateX('+translate+'px)');
      });
    }
    // reset on resize
    window.addEventListener('resize', function(event){
      pauseAutoplay(carousel);
      clearTimeout(carousel.resizeId);
      carousel.resizeId = setTimeout(function(){
        resetCarouselResize(carousel);
        // reset dots navigation
        resetDotsNavigation(carousel);
        resetCarouselControls(carousel);
        setCounterItem(carousel);
        startAutoplay(carousel);
        centerItems(carousel); // center items if carousel.items.length < visibItemsNb
        alignControls(carousel);
        // emit custom event - items visible
        emitCarouselActiveItemsEvent(carousel)
      }, 250)
    });
    // keyboard navigation
    carousel.element.addEventListener('keydown', function(event){
			if(event.keyCode && event.keyCode == 39 || event.key && event.key.toLowerCase() == 'arrowright') {
				carousel.showNext();
			} else if(event.keyCode && event.keyCode == 37 || event.key && event.key.toLowerCase() == 'arrowleft') {
				carousel.showPrev();
			}
		});
  };

  function showPrevItems(carousel) {
    if(carousel.animating) return;
    carousel.animating = true;
    carousel.selectedItem = getIndex(carousel, carousel.selectedItem - carousel.visibItemsNb);
    animateList(carousel, '0', 'prev');
  };

  function showNextItems(carousel) {
    if(carousel.animating) return;
    carousel.animating = true;
    carousel.selectedItem = getIndex(carousel, carousel.selectedItem + carousel.visibItemsNb);
    animateList(carousel, carousel.translateContainer*2+'px', 'next');
  };

  function animateDragEnd(carousel) { // end-of-dragging animation
    carousel.element.addEventListener('dragEnd', function cb(event){
      carousel.element.removeEventListener('dragEnd', cb);
      Util.removeClass(carousel.element, 'carousel--is-dragging');
      if(event.detail.x - carousel.dragStart < -40) {
        carousel.animating = false;
        showNextItems(carousel);
      } else if(event.detail.x - carousel.dragStart > 40) {
        carousel.animating = false;
        showPrevItems(carousel);
      } else if(event.detail.x - carousel.dragStart == 0) { // this is just a click -> no dragging
        return;
      } else { // not dragged enought -> do not update carousel, just reset
        carousel.animating = true;
        animateList(carousel, carousel.translateContainer+'px', false);
      }
      carousel.dragStart = false;
    });
  };

  function animateList(carousel, translate, direction) { // takes care of changing visible items
    pauseAutoplay(carousel);
    Util.addClass(carousel.list, 'carousel__list--animating');
    var initTranslate = carousel.totTranslate;
    if(!carousel.options.loop) {
      translate = noLoopTranslateValue(carousel, direction);
    }
    setTimeout(function() {setTranslate(carousel, 'translateX('+translate+')');});
    if(transitionSupported) {
      carousel.list.addEventListener('transitionend', function cb(event){
        if(event.propertyName && event.propertyName != 'transform') return;
        Util.removeClass(carousel.list, 'carousel__list--animating');
        carousel.list.removeEventListener('transitionend', cb);
        animateListCb(carousel, direction);
      });
    } else {
      animateListCb(carousel, direction);
    }
    if(!carousel.options.loop && (initTranslate == carousel.totTranslate)) {
      // translate value was not updated -> trigger transitionend event to restart carousel
      carousel.list.dispatchEvent(new CustomEvent('transitionend'));
    }
    resetCarouselControls(carousel);
    setCounterItem(carousel);
    // emit custom event - items visible
    emitCarouselActiveItemsEvent(carousel)
  };

  function noLoopTranslateValue(carousel, direction) {
    var translate = carousel.totTranslate;
    if(direction == 'next') {
      translate = carousel.totTranslate + carousel.translateContainer;
    } else if(direction == 'prev') {
      translate = carousel.totTranslate - carousel.translateContainer;
    } else if(direction == 'click') {
      translate = carousel.selectedDotIndex*carousel.translateContainer;
    }
    if(translate > 0)  {
      translate = 0;
      carousel.selectedItem = 0;
    }
    if(translate < - carousel.translateContainer - carousel.containerWidth) {
      translate = - carousel.translateContainer - carousel.containerWidth;
      carousel.selectedItem = carousel.items.length - carousel.visibItemsNb;
    }
    if(carousel.visibItemsNb > carousel.items.length) translate = 0;
    carousel.totTranslate = translate;
    return translate + 'px';
  };

  function animateListCb(carousel, direction) { // reset actions after carousel has been updated
    if(direction) updateClones(carousel, direction);
    carousel.animating = false;
    // reset autoplay
    startAutoplay(carousel);
    // reset tab index
    resetItemsTabIndex(carousel);
  };

  function updateClones(carousel, direction) {
    if(!carousel.options.loop) return;
    // at the end of each animation, we need to update the clones before and after the visible items
    var index = (direction == 'next') ? 0 : carousel.items.length - carousel.visibItemsNb;
    // remove clones you do not need anymore
    removeClones(carousel, index, false);
    // add new clones 
    (direction == 'next') ? insertAfter(carousel, carousel.visibItemsNb, 0) : insertBefore(carousel, carousel.visibItemsNb);
    //reset transform
    setTranslate(carousel, 'translateX('+carousel.translateContainer+'px)');
  };

  function insertBefore(carousel, nb, delta) {
    if(!carousel.options.loop) return;
    var clones = document.createDocumentFragment();
    var start = 0;
    if(delta) start = delta;
    for(var i = start; i < nb; i++) {
      var index = getIndex(carousel, carousel.selectedItem - i - 1),
        clone = carousel.initItems[index].cloneNode(true);
      Util.addClass(clone, 'js-clone');
      clones.insertBefore(clone, clones.firstChild);
    }
    carousel.list.insertBefore(clones, carousel.list.firstChild);
    emitCarouselUpdateEvent(carousel);
  };

  function insertAfter(carousel, nb, init) {
    if(!carousel.options.loop) return;
    var clones = document.createDocumentFragment();
    for(var i = init; i < nb + init; i++) {
      var index = getIndex(carousel, carousel.selectedItem + carousel.visibItemsNb + i),
        clone = carousel.initItems[index].cloneNode(true);
      Util.addClass(clone, 'js-clone');
      clones.appendChild(clone);
    }
    carousel.list.appendChild(clones);
    emitCarouselUpdateEvent(carousel);
  };

  function removeClones(carousel, index, bool) {
    if(!carousel.options.loop) return;
    if( !bool) {
      bool = carousel.visibItemsNb;
    }
    for(var i = 0; i < bool; i++) {
      if(carousel.items[index]) carousel.list.removeChild(carousel.items[index]);
    }
  };

  function resetCarouselResize(carousel) { // reset carousel on resize
    var visibleItems = carousel.visibItemsNb;
    // get new items min-width value
    resetItemAutoSize(carousel);
    initCarouselLayout(carousel); 
    setItemsWidth(carousel, false);
    resetItemsWidth(carousel); // update the array of original items -> array used to create clones
    if(carousel.options.loop) {
      if(visibleItems > carousel.visibItemsNb) {
        removeClones(carousel, 0, visibleItems - carousel.visibItemsNb);
      } else if(visibleItems < carousel.visibItemsNb) {
        insertBefore(carousel, carousel.visibItemsNb, visibleItems);
      }
      updateCarouselClones(carousel); // this will take care of translate + after elements
    } else {
      // reset default translate to a multiple value of (itemWidth + margin)
      var translate = noLoopTranslateValue(carousel);
      setTranslate(carousel, 'translateX('+translate+')');
    }
    resetItemsTabIndex(carousel); // reset focusable elements
  };

  function resetItemAutoSize(carousel) {
    if(!cssPropertiesSupported) return;
    // remove inline style
    carousel.items[0].removeAttribute('style');
    // get original item width 
    carousel.itemAutoSize = getComputedStyle(carousel.items[0]).getPropertyValue('width');
  };

  function resetItemsWidth(carousel) {
    for(var i = 0; i < carousel.initItems.length; i++) {
      carousel.initItems[i].style.width = carousel.itemsWidth+"px";
    }
  };

  function resetItemsTabIndex(carousel) {
    var carouselActive = carousel.items.length > carousel.visibItemsNb;
    var j = carousel.items.length;
    for(var i = 0; i < carousel.items.length; i++) {
      if(carousel.options.loop) {
        if(i < carousel.visibItemsNb || i >= 2*carousel.visibItemsNb ) {
          carousel.items[i].setAttribute('tabindex', '-1');
        } else {
          if(i < j) j = i;
          carousel.items[i].removeAttribute('tabindex');
        }
      } else {
        if( (i < carousel.selectedItem || i >= carousel.selectedItem + carousel.visibItemsNb) && carouselActive) {
          carousel.items[i].setAttribute('tabindex', '-1');
        } else {
          if(i < j) j = i;
          carousel.items[i].removeAttribute('tabindex');
        }
      }
    }
    resetVisibilityOverflowItems(carousel, j);
  };

  function startAutoplay(carousel) {
    if(carousel.options.autoplay && !carousel.autoplayId && !carousel.autoplayPaused) {
      carousel.autoplayId = setInterval(function(){
        showNextItems(carousel);
      }, carousel.options.autoplayInterval);
    }
  };

  function pauseAutoplay(carousel) {
    if(carousel.options.autoplay) {
      clearInterval(carousel.autoplayId);
      carousel.autoplayId = false;
    }
  };

  function initAriaLive(carousel) { // create an aria-live region for SR
    if(!carousel.options.ariaLive) return;
    // create an element that will be used to announce the new visible slide to SR
    var srLiveArea = document.createElement('div');
    Util.setAttributes(srLiveArea, {'class': 'sr-only js-carousel__aria-live', 'aria-live': 'polite', 'aria-atomic': 'true'});
    carousel.element.appendChild(srLiveArea);
    carousel.ariaLive = srLiveArea;
  };

  function updateAriaLive(carousel) { // announce to SR which items are now visible
    if(!carousel.options.ariaLive) return;
    carousel.ariaLive.innerHTML = 'Item '+(carousel.selectedItem + 1)+' selected. '+carousel.visibItemsNb+' items of '+carousel.initItems.length+' visible';
  };

  function getIndex(carousel, index) {
    if(index < 0) index = getPositiveValue(index, carousel.itemsNb);
    if(index >= carousel.itemsNb) index = index % carousel.itemsNb;
    return index;
  };

  function getPositiveValue(value, add) {
    value = value + add;
    if(value > 0) return value;
    else return getPositiveValue(value, add);
  };

  function setTranslate(carousel, translate) {
    carousel.list.style.transform = translate;
    carousel.list.style.msTransform = translate;
  };

  function getCarouselWidth(carousel, computedWidth) { // retrieve carousel width if carousel is initially hidden
    var closestHidden = carousel.listWrapper.closest('.sr-only');
    if(closestHidden) { // carousel is inside an .sr-only (visually hidden) element
      Util.removeClass(closestHidden, 'sr-only');
      computedWidth = carousel.listWrapper.offsetWidth;
      Util.addClass(closestHidden, 'sr-only');
    } else if(isNaN(computedWidth)){
      computedWidth = getHiddenParentWidth(carousel.element, carousel);
    }
    return computedWidth;
  };

  function getHiddenParentWidth(element, carousel) {
    var parent = element.parentElement;
    if(parent.tagName.toLowerCase() == 'html') return 0;
    var style = window.getComputedStyle(parent);
    if(style.display == 'none' || style.visibility == 'hidden') {
      parent.setAttribute('style', 'display: block!important; visibility: visible!important;');
      var computedWidth = carousel.listWrapper.offsetWidth;
      parent.style.display = '';
      parent.style.visibility = '';
      return computedWidth;
    } else {
      return getHiddenParentWidth(parent, carousel);
    }
  };

  function resetCarouselControls(carousel) {
    if(carousel.options.loop) return;
    // update arrows status
    if(carousel.controls.length > 0) {
      (carousel.totTranslate == 0) 
        ? carousel.controls[0].setAttribute('disabled', true) 
        : carousel.controls[0].removeAttribute('disabled');
      (carousel.totTranslate == (- carousel.translateContainer - carousel.containerWidth) || carousel.items.length <= carousel.visibItemsNb) 
        ? carousel.controls[1].setAttribute('disabled', true) 
        : carousel.controls[1].removeAttribute('disabled');
    }
    // update carousel dots
    if(carousel.options.nav) {
      var selectedDot = carousel.navigation.getElementsByClassName(carousel.options.navigationItemClass+'--selected');
      if(selectedDot.length > 0) Util.removeClass(selectedDot[0], carousel.options.navigationItemClass+'--selected');

      var newSelectedIndex = getSelectedDot(carousel);
      if(carousel.totTranslate == (- carousel.translateContainer - carousel.containerWidth)) {
        newSelectedIndex = carousel.navDots.length - 1;
      }
      Util.addClass(carousel.navDots[newSelectedIndex], carousel.options.navigationItemClass+'--selected');
    }

    (carousel.totTranslate == 0 && (carousel.totTranslate == (- carousel.translateContainer - carousel.containerWidth) || carousel.items.length <= carousel.visibItemsNb))
        ? Util.addClass(carousel.element, 'carousel--hide-controls')
        : Util.removeClass(carousel.element, 'carousel--hide-controls');
  };

  function emitCarouselUpdateEvent(carousel) {
    carousel.cloneList = [];
    var clones = carousel.element.querySelectorAll('.js-clone');
    for(var i = 0; i < clones.length; i++) {
      Util.removeClass(clones[i], 'js-clone');
      carousel.cloneList.push(clones[i]);
    }
    emitCarouselEvents(carousel, 'carousel-updated', carousel.cloneList);
  };

  function carouselCreateNavigation(carousel) {
    if(carousel.element.getElementsByClassName('js-carousel__navigation').length > 0) return;
  
    var navigation = document.createElement('ol'),
      navChildren = '';

    var navClasses = carousel.options.navigationClass+' js-carousel__navigation';
    if(carousel.items.length <= carousel.visibItemsNb) {
      navClasses = navClasses + ' is-hidden';
    }
    navigation.setAttribute('class', navClasses);

    var dotsNr = Math.ceil(carousel.items.length/carousel.visibItemsNb),
      selectedDot = getSelectedDot(carousel),
      indexClass = carousel.options.navigationPagination ? '' : 'sr-only'
    for(var i = 0; i < dotsNr; i++) {
      var className = (i == selectedDot) ? 'class="'+carousel.options.navigationItemClass+' '+carousel.options.navigationItemClass+'--selected js-carousel__nav-item"' :  'class="'+carousel.options.navigationItemClass+' js-carousel__nav-item"';
      navChildren = navChildren + '<li '+className+'><button class="reset js-tab-focus" style="outline: none;"><span class="'+indexClass+'">'+ (i+1) + '</span></button></li>';
    }
    navigation.innerHTML = navChildren;
    carousel.element.appendChild(navigation);
  };

  function carouselInitNavigationEvents(carousel) {
    carousel.navigation = carousel.element.getElementsByClassName('js-carousel__navigation')[0];
    carousel.navDots = carousel.element.getElementsByClassName('js-carousel__nav-item');
    carousel.navIdEvent = carouselNavigationClick.bind(carousel);
    carousel.navigation.addEventListener('click', carousel.navIdEvent);
  };

  function carouselRemoveNavigation(carousel) {
    if(carousel.navigation) carousel.element.removeChild(carousel.navigation);
    if(carousel.navIdEvent) carousel.navigation.removeEventListener('click', carousel.navIdEvent);
  };

  function resetDotsNavigation(carousel) {
    if(!carousel.options.nav) return;
    carouselRemoveNavigation(carousel);
    carouselCreateNavigation(carousel);
    carouselInitNavigationEvents(carousel);
  };

  function carouselNavigationClick(event) {
    var dot = event.target.closest('.js-carousel__nav-item');
    if(!dot) return;
    if(this.animating) return;
    this.animating = true;
    var index = Util.getIndexInArray(this.navDots, dot);
    this.selectedDotIndex = index;
    this.selectedItem = index*this.visibItemsNb;
    animateList(this, false, 'click');
  };

  function getSelectedDot(carousel) {
    return Math.ceil(carousel.selectedItem/carousel.visibItemsNb);
  };

  function initCarouselCounter(carousel) {
    if(carousel.counterTor.length > 0) carousel.counterTor[0].textContent = carousel.itemsNb;
    setCounterItem(carousel);
  };

  function setCounterItem(carousel) {
    if(carousel.counter.length == 0) return;
    var totalItems = carousel.selectedItem + carousel.visibItemsNb;
    if(totalItems > carousel.items.length) totalItems = carousel.items.length;
    carousel.counter[0].textContent = totalItems;
  };

  function centerItems(carousel) {
    if(!carousel.options.justifyContent) return;
    Util.toggleClass(carousel.list, 'justify-center', carousel.items.length < carousel.visibItemsNb);
  };

  function alignControls(carousel) {
    if(carousel.controls.length < 1 || !carousel.options.alignControls) return;
    if(!carousel.controlsAlignEl) {
      carousel.controlsAlignEl = carousel.element.querySelector(carousel.options.alignControls);
    }
    if(!carousel.controlsAlignEl) return;
    var translate = (carousel.element.offsetHeight - carousel.controlsAlignEl.offsetHeight);
    for(var i = 0; i < carousel.controls.length; i++) {
      carousel.controls[i].style.marginBottom = translate + 'px';
    }
  };

  function emitCarouselActiveItemsEvent(carousel) {
    emitCarouselEvents(carousel, 'carousel-active-items', {firstSelectedItem: carousel.selectedItem, visibleItemsNb: carousel.visibItemsNb});
  };

  function emitCarouselEvents(carousel, eventName, eventDetail) {
    var event = new CustomEvent(eventName, {detail: eventDetail});
    carousel.element.dispatchEvent(event);
  };

  function resetVisibilityOverflowItems(carousel, j) {
    if(!carousel.options.overflowItems) return;
    var itemWidth = carousel.containerWidth/carousel.items.length,
      delta = (window.innerWidth - itemWidth*carousel.visibItemsNb)/2,
      overflowItems = Math.ceil(delta/itemWidth);

    for(var i = 0; i < overflowItems; i++) {
      var indexPrev = j - 1 - i; // prev element
      if(indexPrev >= 0 ) carousel.items[indexPrev].removeAttribute('tabindex');
      var indexNext = j + carousel.visibItemsNb + i; // next element
      if(indexNext < carousel.items.length) carousel.items[indexNext].removeAttribute('tabindex');
    }
  };

  Carousel.defaults = {
    element : '',
    autoplay : false,
    autoplayOnHover: false,
		autoplayOnFocus: false,
    autoplayInterval: 5000,
    loop: true,
    nav: false,
    navigationItemClass: 'carousel__nav-item',
    navigationClass: 'carousel__navigation',
    navigationPagination: false,
    drag: false,
    justifyContent: false,
    alignControls: false,
    overflowItems: false
  };

  window.Carousel = Carousel;

  //initialize the Carousel objects
  var carousels = document.getElementsByClassName('js-carousel'),
    flexSupported = Util.cssSupports('align-items', 'stretch'),
    transitionSupported = Util.cssSupports('transition'),
    cssPropertiesSupported = ('CSS' in window && CSS.supports('color', 'var(--color-var)'));

  if( carousels.length > 0) {
    for( var i = 0; i < carousels.length; i++) {
      (function(i){
        var autoplay = (carousels[i].getAttribute('data-autoplay') && carousels[i].getAttribute('data-autoplay') == 'on') ? true : false,
          autoplayInterval = (carousels[i].getAttribute('data-autoplay-interval')) ? carousels[i].getAttribute('data-autoplay-interval') : 5000,
          autoplayOnHover = (carousels[i].getAttribute('data-autoplay-hover') && carousels[i].getAttribute('data-autoplay-hover') == 'on') ? true : false,
					autoplayOnFocus = (carousels[i].getAttribute('data-autoplay-focus') && carousels[i].getAttribute('data-autoplay-focus') == 'on') ? true : false,
          drag = (carousels[i].getAttribute('data-drag') && carousels[i].getAttribute('data-drag') == 'on') ? true : false,
          loop = (carousels[i].getAttribute('data-loop') && carousels[i].getAttribute('data-loop') == 'off') ? false : true,
          nav = (carousels[i].getAttribute('data-navigation') && carousels[i].getAttribute('data-navigation') == 'on') ? true : false,
          navigationItemClass = carousels[i].getAttribute('data-navigation-item-class') ? carousels[i].getAttribute('data-navigation-item-class') : 'carousel__nav-item',
          navigationClass = carousels[i].getAttribute('data-navigation-class') ? carousels[i].getAttribute('data-navigation-class') : 'carousel__navigation',
          navigationPagination = (carousels[i].getAttribute('data-navigation-pagination') && carousels[i].getAttribute('data-navigation-pagination') == 'on') ? true : false,
          overflowItems = (carousels[i].getAttribute('data-overflow-items') && carousels[i].getAttribute('data-overflow-items') == 'on') ? true : false,
          alignControls = carousels[i].getAttribute('data-align-controls') ? carousels[i].getAttribute('data-align-controls') : false,
          justifyContent = (carousels[i].getAttribute('data-justify-content') && carousels[i].getAttribute('data-justify-content') == 'on') ? true : false;
        new Carousel({element: carousels[i], autoplay : autoplay, autoplayOnHover: autoplayOnHover, autoplayOnFocus: autoplayOnFocus,autoplayInterval : autoplayInterval, drag: drag, ariaLive: true, loop: loop, nav: nav, navigationItemClass: navigationItemClass, navigationPagination: navigationPagination, navigationClass: navigationClass, overflowItems: overflowItems, justifyContent: justifyContent, alignControls: alignControls});
      })(i);
    }
  };
}());
// File#: _2_comments
// Usage: codyhouse.co/license
(function () {
  function initVote(element) {
    var voteCounter = element.getElementsByClassName('js-comments__vote-label');
    element.addEventListener('click', function () {
      var pressed = element.getAttribute('aria-pressed') == 'true';
      element.setAttribute('aria-pressed', !pressed);
      Util.toggleClass(element, 'comments__vote-btn--pressed', !pressed);
      resetCounter(voteCounter, pressed);
      emitKeypressEvents(element, voteCounter, pressed);
    });
  };

  function resetCounter(voteCounter, pressed) { // update counter value (if present)
    if (voteCounter.length == 0) return;
    var count = parseInt(voteCounter[0].textContent);
    voteCounter[0].textContent = pressed ? count - 1 : count + 1;
  };

  function emitKeypressEvents(element, label, pressed) { // emit custom event when vote is updated
    var count = (label.length == 0) ? false : parseInt(label[0].textContent);
    var event = new CustomEvent('newVote', { detail: { count: count, upVote: !pressed } });
    element.dispatchEvent(event);
  };

  var voteCounting = document.getElementsByClassName('js-comments__vote-btn');
  if (voteCounting.length > 0) {
    for (var i = 0; i < voteCounting.length; i++) {
      (function (i) { initVote(voteCounting[i]); })(i);
    }
  }
}());
// File#: _2_drawer-navigation
// Usage: codyhouse.co/license
(function () {
  function initDrNavControl(element) {
    var circle = element.getElementsByTagName('circle');
    if (circle.length > 0) {
      // set svg attributes to create fill-in animation on click
      initCircleAttributes(element, circle[0]);
    }

    var drawerId = element.getAttribute('aria-controls'),
      drawer = document.getElementById(drawerId);
    if (drawer) {
      // when the drawer is closed without click (e.g., user presses 'Esc') -> reset trigger status
      drawer.addEventListener('drawerIsClose', function (event) {
        if (!event.detail || (event.detail && !event.detail.closest('.js-dr-nav-control[aria-controls="' + drawerId + '"]'))) resetTrigger(element);
      });
    }
  };

  function initCircleAttributes(element, circle) {
    // set circle stroke-dashoffset/stroke-dasharray values
    var circumference = (2 * Math.PI * circle.getAttribute('r')).toFixed(2);
    circle.setAttribute('stroke-dashoffset', circumference);
    circle.setAttribute('stroke-dasharray', circumference);
    Util.addClass(element, 'dr-nav-control--ready-to-animate');
  };

  function resetTrigger(element) {
    Util.removeClass(element, 'anim-menu-btn--state-b');
  };

  var drNavControl = document.getElementsByClassName('js-dr-nav-control');
  if (drNavControl.length > 0) initDrNavControl(drNavControl[0]);
}());
// File#: _2_dropdown
// Usage: codyhouse.co/license
(function() {
	var Dropdown = function(element) {
		this.element = element;
		this.trigger = this.element.getElementsByClassName('js-dropdown__trigger')[0];
		this.dropdown = this.element.getElementsByClassName('js-dropdown__menu')[0];
		this.triggerFocus = false;
		this.dropdownFocus = false;
		this.hideInterval = false;
		// sublevels
		this.dropdownSubElements = this.element.getElementsByClassName('js-dropdown__sub-wrapper');
		this.prevFocus = false; // store element that was in focus before focus changed
		this.addDropdownEvents();
	};
	
	Dropdown.prototype.addDropdownEvents = function(){
		//place dropdown
		var self = this;
		this.placeElement();
		this.element.addEventListener('placeDropdown', function(event){
			self.placeElement();
		});
		// init dropdown
		this.initElementEvents(this.trigger, this.triggerFocus); // this is used to trigger the primary dropdown
		this.initElementEvents(this.dropdown, this.dropdownFocus); // this is used to trigger the primary dropdown
		// init sublevels
		this.initSublevels(); // if there are additional sublevels -> bind hover/focus events
	};

	Dropdown.prototype.placeElement = function() {
		// remove inline style first
		this.dropdown.removeAttribute('style');
		// check dropdown position
		var triggerPosition = this.trigger.getBoundingClientRect(),
			isRight = (window.innerWidth < triggerPosition.left + parseInt(getComputedStyle(this.dropdown).getPropertyValue('width')));

		var xPosition = isRight ? 'right: 0px; left: auto;' : 'left: 0px; right: auto;';
		this.dropdown.setAttribute('style', xPosition);
	};

	Dropdown.prototype.initElementEvents = function(element, bool) {
		var self = this;
		element.addEventListener('mouseenter', function(){
			bool = true;
			self.showDropdown();
		});
		element.addEventListener('focus', function(){
			self.showDropdown();
		});
		element.addEventListener('mouseleave', function(){
			bool = false;
			self.hideDropdown();
		});
		element.addEventListener('focusout', function(){
			self.hideDropdown();
		});
	};

	Dropdown.prototype.showDropdown = function(){
		if(this.hideInterval) clearInterval(this.hideInterval);
		// remove style attribute
		this.dropdown.removeAttribute('style');
		this.placeElement();
		this.showLevel(this.dropdown, true);
	};

	Dropdown.prototype.hideDropdown = function(){
		var self = this;
		if(this.hideInterval) clearInterval(this.hideInterval);
		this.hideInterval = setTimeout(function(){
			var dropDownFocus = document.activeElement.closest('.js-dropdown'),
				inFocus = dropDownFocus && (dropDownFocus == self.element);
			// if not in focus and not hover -> hide
			if(!self.triggerFocus && !self.dropdownFocus && !inFocus) {
				self.hideLevel(self.dropdown, true);
				// make sure to hide sub/dropdown
				self.hideSubLevels();
				self.prevFocus = false;
			}
		}, 300);
	};

	Dropdown.prototype.initSublevels = function(){
		var self = this;
		var dropdownMenu = this.element.getElementsByClassName('js-dropdown__menu');
		for(var i = 0; i < dropdownMenu.length; i++) {
			var listItems = dropdownMenu[i].children;
			// bind hover
	    new menuAim({
	      menu: dropdownMenu[i],
	      activate: function(row) {
	      	var subList = row.getElementsByClassName('js-dropdown__menu')[0];
	      	if(!subList) return;
	      	Util.addClass(row.querySelector('a'), 'dropdown__item--hover');
	      	self.showLevel(subList);
	      },
	      deactivate: function(row) {
	      	var subList = row.getElementsByClassName('dropdown__menu')[0];
	      	if(!subList) return;
	      	Util.removeClass(row.querySelector('a'), 'dropdown__item--hover');
	      	self.hideLevel(subList);
	      },
	      submenuSelector: '.js-dropdown__sub-wrapper',
	    });
		}
		// store focus element before change in focus
		this.element.addEventListener('keydown', function(event) { 
			if( event.keyCode && event.keyCode == 9 || event.key && event.key == 'Tab' ) {
				self.prevFocus = document.activeElement;
			}
		});
		// make sure that sublevel are visible when their items are in focus
		this.element.addEventListener('keyup', function(event) {
			if( event.keyCode && event.keyCode == 9 || event.key && event.key == 'Tab' ) {
				// focus has been moved -> make sure the proper classes are added to subnavigation
				var focusElement = document.activeElement,
					focusElementParent = focusElement.closest('.js-dropdown__menu'),
					focusElementSibling = focusElement.nextElementSibling;

				// if item in focus is inside submenu -> make sure it is visible
				if(focusElementParent && !Util.hasClass(focusElementParent, 'dropdown__menu--is-visible')) {
					self.showLevel(focusElementParent);
				}
				// if item in focus triggers a submenu -> make sure it is visible
				if(focusElementSibling && !Util.hasClass(focusElementSibling, 'dropdown__menu--is-visible')) {
					self.showLevel(focusElementSibling);
				}

				// check previous element in focus -> hide sublevel if required 
				if( !self.prevFocus) return;
				var prevFocusElementParent = self.prevFocus.closest('.js-dropdown__menu'),
					prevFocusElementSibling = self.prevFocus.nextElementSibling;
				
				if( !prevFocusElementParent ) return;
				
				// element in focus and element prev in focus are siblings
				if( focusElementParent && focusElementParent == prevFocusElementParent) {
					if(prevFocusElementSibling) self.hideLevel(prevFocusElementSibling);
					return;
				}

				// element in focus is inside submenu triggered by element prev in focus
				if( prevFocusElementSibling && focusElementParent && focusElementParent == prevFocusElementSibling) return;
				
				// shift tab -> element in focus triggers the submenu of the element prev in focus
				if( focusElementSibling && prevFocusElementParent && focusElementSibling == prevFocusElementParent) return;
				
				var focusElementParentParent = focusElementParent.parentNode.closest('.js-dropdown__menu');
				
				// shift tab -> element in focus is inside the dropdown triggered by a siblings of the element prev in focus
				if(focusElementParentParent && focusElementParentParent == prevFocusElementParent) {
					if(prevFocusElementSibling) self.hideLevel(prevFocusElementSibling);
					return;
				}
				
				if(prevFocusElementParent && Util.hasClass(prevFocusElementParent, 'dropdown__menu--is-visible')) {
					self.hideLevel(prevFocusElementParent);
				}
			}
		});
	};

	Dropdown.prototype.hideSubLevels = function(){
		var visibleSubLevels = this.dropdown.getElementsByClassName('dropdown__menu--is-visible');
		if(visibleSubLevels.length == 0) return;
		while (visibleSubLevels[0]) {
			this.hideLevel(visibleSubLevels[0]);
	 	}
	 	var hoveredItems = this.dropdown.getElementsByClassName('dropdown__item--hover');
	 	while (hoveredItems[0]) {
			Util.removeClass(hoveredItems[0], 'dropdown__item--hover');
	 	}
	};

	Dropdown.prototype.showLevel = function(level, bool){
		if(bool == undefined) {
			//check if the sublevel needs to be open to the left
			Util.removeClass(level, 'dropdown__menu--left');
			var boundingRect = level.getBoundingClientRect();
			if(window.innerWidth - boundingRect.right < 5 && boundingRect.left + window.scrollX > 2*boundingRect.width) Util.addClass(level, 'dropdown__menu--left');
		}
		Util.addClass(level, 'dropdown__menu--is-visible');
		Util.removeClass(level, 'dropdown__menu--is-hidden');
	};

	Dropdown.prototype.hideLevel = function(level, bool){
		if(!Util.hasClass(level, 'dropdown__menu--is-visible')) return;
		Util.removeClass(level, 'dropdown__menu--is-visible');
		Util.addClass(level, 'dropdown__menu--is-hidden');
		
		level.addEventListener('transitionend', function cb(event){
			if(event.propertyName != 'opacity') return;
			level.removeEventListener('transitionend', cb);
			Util.removeClass(level, 'dropdown__menu--is-hidden dropdown__menu--left');
			if(bool && !Util.hasClass(level, 'dropdown__menu--is-visible')) level.setAttribute('style', 'width: 0px');
		});
	};

	window.Dropdown = Dropdown;

	var dropdown = document.getElementsByClassName('js-dropdown');
	if( dropdown.length > 0 ) { // init Dropdown objects
		for( var i = 0; i < dropdown.length; i++) {
			(function(i){new Dropdown(dropdown[i]);})(i);
		}
	}
}());
// File#: _2_points-of-interest
// Usage: codyhouse.co/license
(function() {
  function initPoi(element) {
    element.addEventListener('click', function(event){
      var poiItem = event.target.closest('.js-poi__item');
      if(poiItem) Util.addClass(poiItem, 'poi__item--visited');
    });
  };

  var poi = document.getElementsByClassName('js-poi');
  for(var i = 0; i < poi.length; i++) {
    (function(i){initPoi(poi[i]);})(i);
  }
}());
// File#: _2_multiple-custom-select
// Usage: codyhouse.co/license
(function () {
	var MultiCustomSelect = function (element) {
		this.element = element;
		this.select = this.element.getElementsByTagName('select')[0];
		this.optGroups = this.select.getElementsByTagName('optgroup');
		this.options = this.select.getElementsByTagName('option');
		this.selectId = this.select.getAttribute('id');
		this.trigger = false;
		this.dropdown = false;
		this.customOptions = false;
		this.arrowIcon = this.element.getElementsByTagName('svg');
		this.label = document.querySelector('[for="' + this.selectId + '"]');
		this.selectedOptCounter = 0;

		this.optionIndex = 0; // used while building the custom dropdown

		// label options
		this.noSelectText = this.element.getAttribute('data-no-select-text') || 'Select';
		this.multiSelectText = this.element.getAttribute('data-multi-select-text') || '{n} items selected';
		this.nMultiSelect = this.element.getAttribute('data-n-multi-select') || 1;
		this.noUpdateLabel = this.element.getAttribute('data-update-text') && this.element.getAttribute('data-update-text') == 'off';
		this.insetLabel = this.element.getAttribute('data-inset-label') && this.element.getAttribute('data-inset-label') == 'on';

		// init
		initCustomSelect(this); // init markup
		initCustomSelectEvents(this); // init event listeners
	};

	function initCustomSelect(select) {
		// create the HTML for the custom dropdown element
		select.element.insertAdjacentHTML('beforeend', initButtonSelect(select) + initListSelect(select));

		// save custom elements
		select.dropdown = select.element.getElementsByClassName('js-multi-select__dropdown')[0];
		select.trigger = select.element.getElementsByClassName('js-multi-select__button')[0];
		select.customOptions = select.dropdown.getElementsByClassName('js-multi-select__option');

		// hide default select
		Util.addClass(select.select, 'is-hidden');
		if (select.arrowIcon.length > 0) select.arrowIcon[0].style.display = 'none';
	};

	function initCustomSelectEvents(select) {
		// option selection in dropdown
		initSelection(select);

		// click events
		select.trigger.addEventListener('click', function (event) {
			event.preventDefault();
			toggleCustomSelect(select, false);
		});
		if (select.label) {
			// move focus to custom trigger when clicking on <select> label
			select.label.addEventListener('click', function () {
				Util.moveFocus(select.trigger);
			});
		}
		// keyboard navigation
		select.dropdown.addEventListener('keydown', function (event) {
			if (event.keyCode && event.keyCode == 38 || event.key && event.key.toLowerCase() == 'arrowup') {
				keyboardCustomSelect(select, 'prev', event);
			} else if (event.keyCode && event.keyCode == 40 || event.key && event.key.toLowerCase() == 'arrowdown') {
				keyboardCustomSelect(select, 'next', event);
			}
		});
	};

	function toggleCustomSelect(select, bool) {
		var ariaExpanded;
		if (bool) {
			ariaExpanded = bool;
		} else {
			ariaExpanded = select.trigger.getAttribute('aria-expanded') == 'true' ? 'false' : 'true';
		}
		select.trigger.setAttribute('aria-expanded', ariaExpanded);
		if (ariaExpanded == 'true') {
			var selectedOption = getSelectedOption(select);
			Util.moveFocus(selectedOption); // fallback if transition is not supported
			select.dropdown.addEventListener('transitionend', function cb() {
				Util.moveFocus(selectedOption);
				select.dropdown.removeEventListener('transitionend', cb);
			});
			placeDropdown(select); // place dropdown based on available space
		}
	};

	function placeDropdown(select) {
		var triggerBoundingRect = select.trigger.getBoundingClientRect();
		Util.toggleClass(select.dropdown, 'multi-select__dropdown--right', (window.innerWidth < triggerBoundingRect.left + select.dropdown.offsetWidth));
		// check if there's enough space up or down
		var moveUp = (window.innerHeight - triggerBoundingRect.bottom) < triggerBoundingRect.top;
		Util.toggleClass(select.dropdown, 'multi-select__dropdown--up', moveUp);
		// check if we need to set a max height
		var maxHeight = moveUp ? triggerBoundingRect.top - 20 : window.innerHeight - triggerBoundingRect.bottom - 20;
		// set max-height (based on available space) and width
		select.dropdown.setAttribute('style', 'max-height: ' + maxHeight + 'px; width: ' + triggerBoundingRect.width + 'px;');
	};

	function keyboardCustomSelect(select, direction, event) { // navigate custom dropdown with keyboard
		event.preventDefault();
		var index = Util.getIndexInArray(select.customOptions, document.activeElement.closest('.js-multi-select__option'));
		index = (direction == 'next') ? index + 1 : index - 1;
		if (index < 0) index = select.customOptions.length - 1;
		if (index >= select.customOptions.length) index = 0;
		Util.moveFocus(select.customOptions[index].getElementsByClassName('js-multi-select__checkbox')[0]);
	};

	function initSelection(select) { // option selection
		select.dropdown.addEventListener('change', function (event) {
			var option = event.target.closest('.js-multi-select__option');
			if (!option) return;
			selectOption(select, option);
		});
		select.dropdown.addEventListener('click', function (event) {
			var option = event.target.closest('.js-multi-select__option');
			if (!option || !Util.hasClass(event.target, 'js-multi-select__option')) return;
			selectOption(select, option);
		});
	};

	function selectOption(select, option) {
		if (option.hasAttribute('aria-selected') && option.getAttribute('aria-selected') == 'true') {
			// deselecting that option
			option.setAttribute('aria-selected', 'false');
			// update native select element
			updateNativeSelect(select, option.getAttribute('data-index'), false);
		} else {
			option.setAttribute('aria-selected', 'true');
			// update native select element
			updateNativeSelect(select, option.getAttribute('data-index'), true);

		}
		var triggerLabel = getSelectedOptionText(select);
		select.trigger.getElementsByClassName('js-multi-select__label')[0].innerHTML = triggerLabel[0]; // update trigger label
		Util.toggleClass(select.trigger, 'multi-select__button--active', select.selectedOptCounter > 0);
		updateTriggerAria(select, triggerLabel[1]); // update trigger arai-label
	};

	function updateNativeSelect(select, index, bool) {
		select.options[index].selected = bool;
		select.select.dispatchEvent(new CustomEvent('change', { bubbles: true })); // trigger change event
	};

	function updateTriggerAria(select, ariaLabel) { // new label for custom triegger
		select.trigger.setAttribute('aria-label', ariaLabel);
	};

	function getSelectedOptionText(select) {// used to initialize the label of the custom select button
		var noSelectionText = '<span class="multi-select__term">' + select.noSelectText + '</span>';
		if (select.noUpdateLabel) return [noSelectionText, select.noSelectText];
		var label = '';
		var ariaLabel = '';
		select.selectedOptCounter = 0;

		for (var i = 0; i < select.options.length; i++) {
			if (select.options[i].selected) {
				if (select.selectedOptCounter != 0) label = label + ', '
				label = label + '' + select.options[i].text;
				select.selectedOptCounter = select.selectedOptCounter + 1;
			}
		}

		if (select.selectedOptCounter > select.nMultiSelect) {
			label = '<span class="multi-select__details">' + select.multiSelectText.replace('{n}', select.selectedOptCounter) + '</span>';
			ariaLabel = select.multiSelectText.replace('{n}', select.selectedOptCounter) + ', ' + select.noSelectText;
		} else if (select.selectedOptCounter > 0) {
			ariaLabel = label + ', ' + select.noSelectText;
			label = '<span class="multi-select__details">' + label + '</span>';
		} else {
			label = noSelectionText;
			ariaLabel = select.noSelectText;
		}

		if (select.insetLabel && select.selectedOptCounter > 0) label = noSelectionText + label;
		return [label, ariaLabel];
	};

	function initButtonSelect(select) { // create the button element -> custom select trigger
		// check if we need to add custom classes to the button trigger
		var customClasses = select.element.getAttribute('data-trigger-class') ? ' ' + select.element.getAttribute('data-trigger-class') : '';

		var triggerLabel = getSelectedOptionText(select);
		var activeSelectionClass = select.selectedOptCounter > 0 ? ' multi-select__button--active' : '';

		var button = '<button class="js-multi-select__button multi-select__button' + customClasses + activeSelectionClass + '" aria-label="' + triggerLabel[1] + '" aria-expanded="false" aria-controls="' + select.selectId + '-dropdown"><span aria-hidden="true" class="js-multi-select__label multi-select__label">' + triggerLabel[0] + '</span>';
		if (select.arrowIcon.length > 0 && select.arrowIcon[0].outerHTML) {
			button = button + select.arrowIcon[0].outerHTML;
		}

		return button + '</button>';

	};

	function initListSelect(select) { // create custom select dropdown
		var list = '<div class="js-multi-select__dropdown multi-select__dropdown" aria-describedby="' + select.selectId + '-description" id="' + select.selectId + '-dropdown">';
		list = list + getSelectLabelSR(select);
		if (select.optGroups.length > 0) {
			for (var i = 0; i < select.optGroups.length; i++) {
				var optGroupList = select.optGroups[i].getElementsByTagName('option'),
					optGroupLabel = '<li><span class="multi-select__item multi-select__item--optgroup">' + select.optGroups[i].getAttribute('label') + '</span></li>';
				list = list + '<ul class="multi-select__list" role="listbox" aria-multiselectable="true">' + optGroupLabel + getOptionsList(select, optGroupList) + '</ul>';
			}
		} else {
			list = list + '<ul class="multi-select__list" role="listbox" aria-multiselectable="true">' + getOptionsList(select, select.options) + '</ul>';
		}
		return list;
	};

	function getSelectLabelSR(select) {
		if (select.label) {
			return '<p class="sr-only" id="' + select.selectId + '-description">' + select.label.textContent + '</p>'
		} else {
			return '';
		}
	};

	function getOptionsList(select, options) {
		var list = '';
		for (var i = 0; i < options.length; i++) {
			var selected = options[i].hasAttribute('selected') ? ' aria-selected="true"' : ' aria-selected="false"',
				checked = options[i].hasAttribute('selected') ? 'checked' : '';
			list = list + '<li class="js-multi-select__option" role="option" data-value="' + options[i].value + '" ' + selected + ' data-label="' + options[i].text + '" data-index="' + select.optionIndex + '"><input aria-hidden="true" class="checkbox js-multi-select__checkbox" type="checkbox" id="' + select.selectId + '-' + options[i].value + '-' + select.optionIndex + '" ' + checked + '><label class="multi-select__item multi-select__item--option" aria-hidden="true" for="' + select.selectId + '-' + options[i].value + '-' + select.optionIndex + '"><span>' + options[i].text + '</span></label></li>';
			select.optionIndex = select.optionIndex + 1;
		};
		return list;
	};

	function getSelectedOption(select) { // return first selected option
		var option = select.dropdown.querySelector('[aria-selected="true"]');
		if (option) return option.getElementsByClassName('js-multi-select__checkbox')[0];
		else return select.dropdown.getElementsByClassName('js-multi-select__option')[0].getElementsByClassName('js-multi-select__checkbox')[0];
	};

	function moveFocusToSelectTrigger(select) {
		if (!document.activeElement.closest('.js-multi-select')) return
		select.trigger.focus();
	};

	function checkCustomSelectClick(select, target) { // close select when clicking outside it
		if (!select.element.contains(target)) toggleCustomSelect(select, 'false');
	};

	//initialize the CustomSelect objects
	var customSelect = document.getElementsByClassName('js-multi-select');
	if (customSelect.length > 0) {
		var selectArray = [];
		for (var i = 0; i < customSelect.length; i++) {
			(function (i) { selectArray.push(new MultiCustomSelect(customSelect[i])); })(i);
		}

		// listen for key events
		window.addEventListener('keyup', function (event) {
			if (event.keyCode && event.keyCode == 27 || event.key && event.key.toLowerCase() == 'escape') {
				// close custom select on 'Esc'
				selectArray.forEach(function (element) {
					moveFocusToSelectTrigger(element); // if focus is within dropdown, move it to dropdown trigger
					toggleCustomSelect(element, 'false'); // close dropdown
				});
			}
		});
		// close custom select when clicking outside it
		window.addEventListener('click', function (event) {
			selectArray.forEach(function (element) {
				checkCustomSelectClick(element, event.target);
			});
		});
	}
}());
// File#: _2_slideshow
// Usage: codyhouse.co/license
(function () {
	var Slideshow = function (opts) {
		this.options = slideshowAssignOptions(Slideshow.defaults, opts);
		this.element = this.options.element;
		this.items = this.element.getElementsByClassName('js-slideshow__item');
		this.controls = this.element.getElementsByClassName('js-slideshow__control');
		this.selectedSlide = 0;
		this.autoplayId = false;
		this.autoplayPaused = false;
		this.navigation = false;
		this.navCurrentLabel = false;
		this.ariaLive = false;
		this.moveFocus = false;
		this.animating = false;
		this.supportAnimation = Util.cssSupports('transition');
		this.animationOff = (!Util.hasClass(this.element, 'slideshow--transition-fade') && !Util.hasClass(this.element, 'slideshow--transition-slide') && !Util.hasClass(this.element, 'slideshow--transition-prx'));
		this.animationType = Util.hasClass(this.element, 'slideshow--transition-prx') ? 'prx' : 'slide';
		this.animatingClass = 'slideshow--is-animating';
		initSlideshow(this);
		initSlideshowEvents(this);
		initAnimationEndEvents(this);
	};

	Slideshow.prototype.showNext = function () {
		showNewItem(this, this.selectedSlide + 1, 'next');
	};

	Slideshow.prototype.showPrev = function () {
		showNewItem(this, this.selectedSlide - 1, 'prev');
	};

	Slideshow.prototype.showItem = function (index) {
		showNewItem(this, index, false);
	};

	Slideshow.prototype.startAutoplay = function () {
		var self = this;
		if (this.options.autoplay && !this.autoplayId && !this.autoplayPaused) {
			self.autoplayId = setInterval(function () {
				self.showNext();
			}, self.options.autoplayInterval);
		}
	};

	Slideshow.prototype.pauseAutoplay = function () {
		var self = this;
		if (this.options.autoplay) {
			clearInterval(self.autoplayId);
			self.autoplayId = false;
		}
	};

	function slideshowAssignOptions(defaults, opts) {
		// initialize the object options
		var mergeOpts = {};
		mergeOpts.element = (typeof opts.element !== "undefined") ? opts.element : defaults.element;
		mergeOpts.navigation = (typeof opts.navigation !== "undefined") ? opts.navigation : defaults.navigation;
		mergeOpts.autoplay = (typeof opts.autoplay !== "undefined") ? opts.autoplay : defaults.autoplay;
		mergeOpts.autoplayInterval = (typeof opts.autoplayInterval !== "undefined") ? opts.autoplayInterval : defaults.autoplayInterval;
		mergeOpts.swipe = (typeof opts.swipe !== "undefined") ? opts.swipe : defaults.swipe;
		return mergeOpts;
	};

	function initSlideshow(slideshow) { // basic slideshow settings
		// if no slide has been selected -> select the first one
		if (slideshow.element.getElementsByClassName('slideshow__item--selected').length < 1) Util.addClass(slideshow.items[0], 'slideshow__item--selected');
		slideshow.selectedSlide = Util.getIndexInArray(slideshow.items, slideshow.element.getElementsByClassName('slideshow__item--selected')[0]);
		// create an element that will be used to announce the new visible slide to SR
		var srLiveArea = document.createElement('div');
		Util.setAttributes(srLiveArea, { 'class': 'sr-only js-slideshow__aria-live', 'aria-live': 'polite', 'aria-atomic': 'true' });
		slideshow.element.appendChild(srLiveArea);
		slideshow.ariaLive = srLiveArea;
	};

	function initSlideshowEvents(slideshow) {
		// if slideshow navigation is on -> create navigation HTML and add event listeners
		if (slideshow.options.navigation) {
			// check if navigation has already been included
			if (slideshow.element.getElementsByClassName('js-slideshow__navigation').length == 0) {
				var navigation = document.createElement('ol'),
					navChildren = '';

				var navClasses = 'slideshow__navigation js-slideshow__navigation';
				if (slideshow.items.length <= 1) {
					navClasses = navClasses + ' is-hidden';
				}

				navigation.setAttribute('class', navClasses);
				for (var i = 0; i < slideshow.items.length; i++) {
					var className = (i == slideshow.selectedSlide) ? 'class="slideshow__nav-item slideshow__nav-item--selected js-slideshow__nav-item"' : 'class="slideshow__nav-item js-slideshow__nav-item"',
						navCurrentLabel = (i == slideshow.selectedSlide) ? '<span class="sr-only js-slideshow__nav-current-label">Current Item</span>' : '';
					navChildren = navChildren + '<li ' + className + '><button class="reset"><span class="sr-only">' + (i + 1) + '</span>' + navCurrentLabel + '</button></li>';
				}
				navigation.innerHTML = navChildren;
				slideshow.element.appendChild(navigation);
			}

			slideshow.navCurrentLabel = slideshow.element.getElementsByClassName('js-slideshow__nav-current-label')[0];
			slideshow.navigation = slideshow.element.getElementsByClassName('js-slideshow__nav-item');

			var dotsNavigation = slideshow.element.getElementsByClassName('js-slideshow__navigation')[0];

			dotsNavigation.addEventListener('click', function (event) {
				navigateSlide(slideshow, event, true);
			});
			dotsNavigation.addEventListener('keyup', function (event) {
				navigateSlide(slideshow, event, (event.key.toLowerCase() == 'enter'));
			});
		}
		// slideshow arrow controls
		if (slideshow.controls.length > 0) {
			// hide controls if one item available
			if (slideshow.items.length <= 1) {
				Util.addClass(slideshow.controls[0], 'is-hidden');
				Util.addClass(slideshow.controls[1], 'is-hidden');
			}
			slideshow.controls[0].addEventListener('click', function (event) {
				event.preventDefault();
				slideshow.showPrev();
				updateAriaLive(slideshow);
			});
			slideshow.controls[1].addEventListener('click', function (event) {
				event.preventDefault();
				slideshow.showNext();
				updateAriaLive(slideshow);
			});
		}
		// swipe events
		if (slideshow.options.swipe) {
			//init swipe
			new SwipeContent(slideshow.element);
			slideshow.element.addEventListener('swipeLeft', function (event) {
				slideshow.showNext();
			});
			slideshow.element.addEventListener('swipeRight', function (event) {
				slideshow.showPrev();
			});
		}
		// autoplay
		if (slideshow.options.autoplay) {
			slideshow.startAutoplay();
			// pause autoplay if user is interacting with the slideshow
			slideshow.element.addEventListener('mouseenter', function (event) {
				slideshow.pauseAutoplay();
				slideshow.autoplayPaused = true;
			});
			slideshow.element.addEventListener('focusin', function (event) {
				slideshow.pauseAutoplay();
				slideshow.autoplayPaused = true;
			});
			slideshow.element.addEventListener('mouseleave', function (event) {
				slideshow.autoplayPaused = false;
				slideshow.startAutoplay();
			});
			slideshow.element.addEventListener('focusout', function (event) {
				slideshow.autoplayPaused = false;
				slideshow.startAutoplay();
			});
		}
		// detect if external buttons control the slideshow
		var slideshowId = slideshow.element.getAttribute('id');
		if (slideshowId) {
			var externalControls = document.querySelectorAll('[data-controls="' + slideshowId + '"]');
			for (var i = 0; i < externalControls.length; i++) {
				(function (i) { externalControlSlide(slideshow, externalControls[i]); })(i);
			}
		}
		// custom event to trigger selection of a new slide element
		slideshow.element.addEventListener('selectNewItem', function (event) {
			// check if slide is already selected
			if (event.detail) {
				if (event.detail - 1 == slideshow.selectedSlide) return;
				showNewItem(slideshow, event.detail - 1, false);
			}
		});

		// keyboard navigation
		slideshow.element.addEventListener('keydown', function (event) {
			if (event.keyCode && event.keyCode == 39 || event.key && event.key.toLowerCase() == 'arrowright') {
				slideshow.showNext();
			} else if (event.keyCode && event.keyCode == 37 || event.key && event.key.toLowerCase() == 'arrowleft') {
				slideshow.showPrev();
			}
		});
	};

	function navigateSlide(slideshow, event, keyNav) {
		// user has interacted with the slideshow navigation -> update visible slide
		var target = (Util.hasClass(event.target, 'js-slideshow__nav-item')) ? event.target : event.target.closest('.js-slideshow__nav-item');
		if (keyNav && target && !Util.hasClass(target, 'slideshow__nav-item--selected')) {
			slideshow.showItem(Util.getIndexInArray(slideshow.navigation, target));
			slideshow.moveFocus = true;
			updateAriaLive(slideshow);
		}
	};

	function initAnimationEndEvents(slideshow) {
		// remove animation classes at the end of a slide transition
		for (var i = 0; i < slideshow.items.length; i++) {
			(function (i) {
				slideshow.items[i].addEventListener('animationend', function () { resetAnimationEnd(slideshow, slideshow.items[i]); });
				slideshow.items[i].addEventListener('transitionend', function () { resetAnimationEnd(slideshow, slideshow.items[i]); });
			})(i);
		}
	};

	function resetAnimationEnd(slideshow, item) {
		setTimeout(function () { // add a delay between the end of animation and slideshow reset - improve animation performance
			if (Util.hasClass(item, 'slideshow__item--selected')) {
				if (slideshow.moveFocus) Util.moveFocus(item);
				emitSlideshowEvent(slideshow, 'newItemVisible', slideshow.selectedSlide);
				slideshow.moveFocus = false;
			}
			Util.removeClass(item, 'slideshow__item--' + slideshow.animationType + '-out-left slideshow__item--' + slideshow.animationType + '-out-right slideshow__item--' + slideshow.animationType + '-in-left slideshow__item--' + slideshow.animationType + '-in-right');
			item.removeAttribute('aria-hidden');
			slideshow.animating = false;
			Util.removeClass(slideshow.element, slideshow.animatingClass);
		}, 100);
	};

	function showNewItem(slideshow, index, bool) {
		if (slideshow.items.length <= 1) return;
		if (slideshow.animating && slideshow.supportAnimation) return;
		slideshow.animating = true;
		Util.addClass(slideshow.element, slideshow.animatingClass);
		if (index < 0) index = slideshow.items.length - 1;
		else if (index >= slideshow.items.length) index = 0;
		// skip slideshow item if it is hidden
		if (bool && Util.hasClass(slideshow.items[index], 'is-hidden')) {
			slideshow.animating = false;
			index = bool == 'next' ? index + 1 : index - 1;
			showNewItem(slideshow, index, bool);
			return;
		}
		// index of new slide is equal to index of slide selected item
		if (index == slideshow.selectedSlide) {
			slideshow.animating = false;
			return;
		}
		var exitItemClass = getExitItemClass(slideshow, bool, slideshow.selectedSlide, index);
		var enterItemClass = getEnterItemClass(slideshow, bool, slideshow.selectedSlide, index);
		// transition between slides
		if (!slideshow.animationOff) Util.addClass(slideshow.items[slideshow.selectedSlide], exitItemClass);
		Util.removeClass(slideshow.items[slideshow.selectedSlide], 'slideshow__item--selected');
		slideshow.items[slideshow.selectedSlide].setAttribute('aria-hidden', 'true'); //hide to sr element that is exiting the viewport
		if (slideshow.animationOff) {
			Util.addClass(slideshow.items[index], 'slideshow__item--selected');
		} else {
			Util.addClass(slideshow.items[index], enterItemClass + ' slideshow__item--selected');
		}
		// reset slider navigation appearance
		resetSlideshowNav(slideshow, index, slideshow.selectedSlide);
		slideshow.selectedSlide = index;
		// reset autoplay
		slideshow.pauseAutoplay();
		slideshow.startAutoplay();
		// reset controls/navigation color themes
		resetSlideshowTheme(slideshow, index);
		// emit event
		emitSlideshowEvent(slideshow, 'newItemSelected', slideshow.selectedSlide);
		if (slideshow.animationOff) {
			slideshow.animating = false;
			Util.removeClass(slideshow.element, slideshow.animatingClass);
		}
	};

	function getExitItemClass(slideshow, bool, oldIndex, newIndex) {
		var className = '';
		if (bool) {
			className = (bool == 'next') ? 'slideshow__item--' + slideshow.animationType + '-out-right' : 'slideshow__item--' + slideshow.animationType + '-out-left';
		} else {
			className = (newIndex < oldIndex) ? 'slideshow__item--' + slideshow.animationType + '-out-left' : 'slideshow__item--' + slideshow.animationType + '-out-right';
		}
		return className;
	};

	function getEnterItemClass(slideshow, bool, oldIndex, newIndex) {
		var className = '';
		if (bool) {
			className = (bool == 'next') ? 'slideshow__item--' + slideshow.animationType + '-in-right' : 'slideshow__item--' + slideshow.animationType + '-in-left';
		} else {
			className = (newIndex < oldIndex) ? 'slideshow__item--' + slideshow.animationType + '-in-left' : 'slideshow__item--' + slideshow.animationType + '-in-right';
		}
		return className;
	};

	function resetSlideshowNav(slideshow, newIndex, oldIndex) {
		if (slideshow.navigation) {
			Util.removeClass(slideshow.navigation[oldIndex], 'slideshow__nav-item--selected');
			Util.addClass(slideshow.navigation[newIndex], 'slideshow__nav-item--selected');
			slideshow.navCurrentLabel.parentElement.removeChild(slideshow.navCurrentLabel);
			slideshow.navigation[newIndex].getElementsByTagName('button')[0].appendChild(slideshow.navCurrentLabel);
		}
	};

	function resetSlideshowTheme(slideshow, newIndex) {
		var dataTheme = slideshow.items[newIndex].getAttribute('data-theme');
		if (dataTheme) {
			if (slideshow.navigation) slideshow.navigation[0].parentElement.setAttribute('data-theme', dataTheme);
			if (slideshow.controls[0]) slideshow.controls[0].parentElement.setAttribute('data-theme', dataTheme);
		} else {
			if (slideshow.navigation) slideshow.navigation[0].parentElement.removeAttribute('data-theme');
			if (slideshow.controls[0]) slideshow.controls[0].parentElement.removeAttribute('data-theme');
		}
	};

	function emitSlideshowEvent(slideshow, eventName, detail) {
		var event = new CustomEvent(eventName, { detail: detail });
		slideshow.element.dispatchEvent(event);
	};

	function updateAriaLive(slideshow) {
		slideshow.ariaLive.innerHTML = 'Item ' + (slideshow.selectedSlide + 1) + ' of ' + slideshow.items.length;
	};

	function externalControlSlide(slideshow, button) { // control slideshow using external element
		button.addEventListener('click', function (event) {
			var index = button.getAttribute('data-index');
			if (!index || index == slideshow.selectedSlide + 1) return;
			event.preventDefault();
			showNewItem(slideshow, index - 1, false);
		});
	};

	Slideshow.defaults = {
		element: '',
		navigation: true,
		autoplay: false,
		autoplayInterval: 5000,
		swipe: false
	};

	window.Slideshow = Slideshow;

	//initialize the Slideshow objects
	var slideshows = document.getElementsByClassName('js-slideshow');
	if (slideshows.length > 0) {
		for (var i = 0; i < slideshows.length; i++) {
			(function (i) {
				var navigation = (slideshows[i].getAttribute('data-navigation') && slideshows[i].getAttribute('data-navigation') == 'off') ? false : true,
					autoplay = (slideshows[i].getAttribute('data-autoplay') && slideshows[i].getAttribute('data-autoplay') == 'on') ? true : false,
					autoplayInterval = (slideshows[i].getAttribute('data-autoplay-interval')) ? slideshows[i].getAttribute('data-autoplay-interval') : 5000,
					swipe = (slideshows[i].getAttribute('data-swipe') && slideshows[i].getAttribute('data-swipe') == 'on') ? true : false;
				new Slideshow({ element: slideshows[i], navigation: navigation, autoplay: autoplay, autoplayInterval: autoplayInterval, swipe: swipe });
			})(i);
		}
	}
}());

// File#: _3_mega-site-navigation
// Usage: codyhouse.co/license
(function() {
  var MegaNav = function(element) {
    this.element = element;
    this.search = this.element.getElementsByClassName('js-mega-nav__search');
    this.searchActiveController = false;
    this.menu = this.element.getElementsByClassName('js-mega-nav__nav');
    this.menuItems = this.menu[0].getElementsByClassName('js-mega-nav__item');
    this.menuActiveController = false;
    this.itemExpClass = 'mega-nav__item--expanded';
    this.classIconBtn = 'mega-nav__icon-btn--state-b';
    this.classSearchVisible = 'mega-nav__search--is-visible';
    this.classNavVisible = 'mega-nav__nav--is-visible';
    this.classMobileLayout = 'mega-nav--mobile';
    this.classDesktopLayout = 'mega-nav--desktop';
    this.layout = 'mobile';
    // store dropdown elements (if present)
    this.dropdown = this.element.getElementsByClassName('js-dropdown');
    // expanded class - added to header when subnav is open
    this.expandedClass = 'mega-nav--expanded';
    // check if subnav should open on hover
    this.hover = this.element.getAttribute('data-hover') && this.element.getAttribute('data-hover') == 'on';
    initMegaNav(this);
  };

  function initMegaNav(megaNav) {
    setMegaNavLayout(megaNav); // switch between mobile/desktop layout
    initSearch(megaNav); // controll search navigation
    initMenu(megaNav); // control main menu nav - mobile only
    initSubNav(megaNav); // toggle sub navigation visibility
    
    megaNav.element.addEventListener('update-menu-layout', function(event){
      setMegaNavLayout(megaNav); // window resize - update layout
    });
  };

  function setMegaNavLayout(megaNav) {
    var layout = getComputedStyle(megaNav.element, ':before').getPropertyValue('content').replace(/\'|"/g, '');
    if(layout == megaNav.layout) return;
    megaNav.layout = layout;
    Util.toggleClass(megaNav.element, megaNav.classDesktopLayout, megaNav.layout == 'desktop');
    Util.toggleClass(megaNav.element, megaNav.classMobileLayout, megaNav.layout != 'desktop');
    if(megaNav.layout == 'desktop') {
      closeSubNav(megaNav, false);
      // if the mega navigation has dropdown elements -> make sure they are in the right position (viewport awareness)
      triggerDropdownPosition(megaNav);
    } 
    closeSearch(megaNav, false);
    resetMegaNavOffset(megaNav); // reset header offset top value
    resetNavAppearance(megaNav); // reset nav expanded appearance
  };

  function resetMegaNavOffset(megaNav) {
    document.documentElement.style.setProperty('--mega-nav-offset-y', megaNav.element.getBoundingClientRect().top+'px');
  };

  function closeNavigation(megaNav) { // triggered by Esc key press
    // close search
    closeSearch(megaNav);
    // close nav
    if(Util.hasClass(megaNav.menu[0], megaNav.classNavVisible)) {
      toggleMenu(megaNav, megaNav.menu[0], 'menuActiveController', megaNav.classNavVisible, megaNav.menuActiveController, true);
    }
    //close subnav 
    closeSubNav(megaNav, false);
    resetNavAppearance(megaNav); // reset nav expanded appearance
  };

  function closeFocusNavigation(megaNav) { // triggered by Tab key pressed
    // close search when focus is lost
    if(Util.hasClass(megaNav.search[0], megaNav.classSearchVisible) && !document.activeElement.closest('.js-mega-nav__search')) {
      toggleMenu(megaNav, megaNav.search[0], 'searchActiveController', megaNav.classSearchVisible, megaNav.searchActiveController, true);
    }
    // close nav when focus is lost
    if(Util.hasClass(megaNav.menu[0], megaNav.classNavVisible) && !document.activeElement.closest('.js-mega-nav__nav')) {
      toggleMenu(megaNav, megaNav.menu[0], 'menuActiveController', megaNav.classNavVisible, megaNav.menuActiveController, true);
    }
    // close subnav when focus is lost
    for(var i = 0; i < megaNav.menuItems.length; i++) {
      if(!Util.hasClass(megaNav.menuItems[i], megaNav.itemExpClass)) continue;
      var parentItem = document.activeElement.closest('.js-mega-nav__item');
      if(parentItem && parentItem == megaNav.menuItems[i]) continue;
      closeSingleSubnav(megaNav, i);
    }
    resetNavAppearance(megaNav); // reset nav expanded appearance
  };

  function closeSearch(megaNav, bool) {
    if(megaNav.search.length < 1) return;
    if(Util.hasClass(megaNav.search[0], megaNav.classSearchVisible)) {
      toggleMenu(megaNav, megaNav.search[0], 'searchActiveController', megaNav.classSearchVisible, megaNav.searchActiveController, bool);
    }
  } ;

  function initSearch(megaNav) {
    if(megaNav.search.length == 0) return;
    // toggle search
    megaNav.searchToggles = document.querySelectorAll('[aria-controls="'+megaNav.search[0].getAttribute('id')+'"]');
    for(var i = 0; i < megaNav.searchToggles.length; i++) {(function(i){
      megaNav.searchToggles[i].addEventListener('click', function(event){
        // toggle search
        toggleMenu(megaNav, megaNav.search[0], 'searchActiveController', megaNav.classSearchVisible, megaNav.searchToggles[i], true);
        // close nav if it was open
        if(Util.hasClass(megaNav.menu[0], megaNav.classNavVisible)) {
          toggleMenu(megaNav, megaNav.menu[0], 'menuActiveController', megaNav.classNavVisible, megaNav.menuActiveController, false);
        }
        // close subnavigation if open
        closeSubNav(megaNav, false);
        resetNavAppearance(megaNav); // reset nav expanded appearance
      });
    })(i);}
  };

  function initMenu(megaNav) {
    if(megaNav.menu.length == 0) return;
    // toggle nav
    megaNav.menuToggles = document.querySelectorAll('[aria-controls="'+megaNav.menu[0].getAttribute('id')+'"]');
    for(var i = 0; i < megaNav.menuToggles.length; i++) {(function(i){
      megaNav.menuToggles[i].addEventListener('click', function(event){
        // toggle nav
        toggleMenu(megaNav, megaNav.menu[0], 'menuActiveController', megaNav.classNavVisible, megaNav.menuToggles[i], true);
        // close search if it was open
        if(Util.hasClass(megaNav.search[0], megaNav.classSearchVisible)) {
          toggleMenu(megaNav, megaNav.search[0], 'searchActiveController', megaNav.classSearchVisible, megaNav.searchActiveController, false);
        }
        resetNavAppearance(megaNav); // reset nav expanded appearance
      });
    })(i);}
  };

  function toggleMenu(megaNav, element, controller, visibleClass, toggle, moveFocus) {
    var menuIsVisible = Util.hasClass(element, visibleClass);
    Util.toggleClass(element, visibleClass, !menuIsVisible);
    Util.toggleClass(toggle, megaNav.classIconBtn, !menuIsVisible);
    menuIsVisible ? toggle.removeAttribute('aria-expanded') : toggle.setAttribute('aria-expanded', 'true');
    if(menuIsVisible) {
      if(toggle && moveFocus) toggle.focus();
      megaNav[controller] = false;
    } else {
      if(toggle) megaNav[controller] = toggle;
			getFirstFocusable(element).focus(); // move focus to first focusable element
    }
  };

  function getFirstFocusable(element) {
    var focusableEle = element.querySelectorAll('[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable], audio[controls], video[controls], summary'),
		  firstFocusable = false;
    for(var i = 0; i < focusableEle.length; i++) {
      if( focusableEle[i].offsetWidth || focusableEle[i].offsetHeight || focusableEle[i].getClientRects().length ) {
        firstFocusable = focusableEle[i];
        break;
      }
    }
    return firstFocusable;
  };

  function initSubNav(megaNav) {
    // toggle subnavigation visibility
    megaNav.element.addEventListener('click', function(event){
      if(megaNav.hover && megaNav.layout == 'desktop') return; // data-hover="on"
      toggleSubNav(megaNav, event);
    });

    if(megaNav.hover) { // data-hover="on" => use mouse events 
      megaNav.element.addEventListener('mouseover', function(event) {
        if(megaNav.layout != 'desktop') return;
        toggleSubNav(megaNav, event)
      });

      megaNav.element.addEventListener('mouseout', function(event){
        if(megaNav.layout != 'desktop') return;
        var mainItem = event.target.closest('.js-mega-nav__item');
        if(!mainItem) return;
        var triggerBtn = mainItem.getElementsByClassName('js-mega-nav__control');
        if(triggerBtn.length < 1) return;
        var itemExpanded = Util.hasClass(mainItem, megaNav.itemExpClass);
        if(!itemExpanded) return;
        var mainItemHover = event.relatedTarget;
        if(mainItemHover && mainItem.contains(mainItemHover)) return;
        
        Util.toggleClass(mainItem, megaNav.itemExpClass, !itemExpanded);
        itemExpanded ? triggerBtn[0].removeAttribute('aria-expanded') : triggerBtn[0].setAttribute('aria-expanded', 'true');
      });
    }
  };

  function toggleSubNav(megaNav, event) {
    var triggerBtn = event.target.closest('.js-mega-nav__control');
    if(!triggerBtn) return;
    var mainItem = triggerBtn.closest('.js-mega-nav__item');
    if(!mainItem) return;
    var itemExpanded = Util.hasClass(mainItem, megaNav.itemExpClass);
    if(megaNav.hover && itemExpanded && megaNav.layout == 'desktop') return;
    Util.toggleClass(mainItem, megaNav.itemExpClass, !itemExpanded);
    itemExpanded ? triggerBtn.removeAttribute('aria-expanded') : triggerBtn.setAttribute('aria-expanded', 'true');
    if(megaNav.layout == 'desktop' && !itemExpanded) closeSubNav(megaNav, mainItem);
    // close search if open
    closeSearch(megaNav, false);
    resetNavAppearance(megaNav); // reset nav expanded appearance
  };

  function closeSubNav(megaNav, selectedItem) {
    // close subnav when a new sub nav element is open
    if(megaNav.menuItems.length == 0 ) return;
    for(var i = 0; i < megaNav.menuItems.length; i++) {
      if(megaNav.menuItems[i] != selectedItem) closeSingleSubnav(megaNav, i);
    }
  };

  function closeSingleSubnav(megaNav, index) {
    Util.removeClass(megaNav.menuItems[index], megaNav.itemExpClass);
    var triggerBtn = megaNav.menuItems[index].getElementsByClassName('js-mega-nav__control');
    if(triggerBtn.length > 0) triggerBtn[0].removeAttribute('aria-expanded');
  };

  function triggerDropdownPosition(megaNav) {
    // emit custom event to properly place dropdown elements - viewport awarness
    if(megaNav.dropdown.length == 0) return;
    for(var i = 0; i < megaNav.dropdown.length; i++) {
      megaNav.dropdown[i].dispatchEvent(new CustomEvent('placeDropdown'));
    }
  };

  function resetNavAppearance(megaNav) {
    ( (megaNav.element.getElementsByClassName(megaNav.itemExpClass).length > 0 && megaNav.layout == 'desktop') || megaNav.element.getElementsByClassName(megaNav.classSearchVisible).length > 0 ||(megaNav.element.getElementsByClassName(megaNav.classNavVisible).length > 0 && megaNav.layout == 'mobile'))
      ? Util.addClass(megaNav.element, megaNav.expandedClass)
      : Util.removeClass(megaNav.element, megaNav.expandedClass);
  };

  //initialize the MegaNav objects
  var megaNav = document.getElementsByClassName('js-mega-nav');
  if(megaNav.length > 0) {
    var megaNavArray = [];
    for(var i = 0; i < megaNav.length; i++) {
      (function(i){megaNavArray.push(new MegaNav(megaNav[i]));})(i);
    }

    // key events
    window.addEventListener('keyup', function(event){
			if( (event.keyCode && event.keyCode == 27) || (event.key && event.key.toLowerCase() == 'escape' )) { // listen for esc key events
        for(var i = 0; i < megaNavArray.length; i++) {(function(i){
          closeNavigation(megaNavArray[i]);
        })(i);}
			}
			// listen for tab key
			if( (event.keyCode && event.keyCode == 9) || (event.key && event.key.toLowerCase() == 'tab' )) { // close search or nav if it looses focus
        for(var i = 0; i < megaNavArray.length; i++) {(function(i){
          closeFocusNavigation(megaNavArray[i]);
        })(i);}
			}
    });

    window.addEventListener('click', function(event){
      if(!event.target.closest('.js-mega-nav')) closeNavigation(megaNavArray[0]);
    });
    
    // resize - update menu layout
    var resizingId = false,
      customEvent = new CustomEvent('update-menu-layout');
    window.addEventListener('resize', function(event){
      clearTimeout(resizingId);
      resizingId = setTimeout(doneResizing, 200);
    });

    function doneResizing() {
      for( var i = 0; i < megaNavArray.length; i++) {
        (function(i){megaNavArray[i].element.dispatchEvent(customEvent)})(i);
      };
    };

    (window.requestAnimationFrame) // init mega site nav layout
      ? window.requestAnimationFrame(doneResizing)
      : doneResizing();
  }
}());
// File#: _3_thumbnail-slideshow
// Usage: codyhouse.co/license
(function () {
	var ThumbSlideshow = function (element) {
		this.element = element;
		this.slideshow = this.element.getElementsByClassName('slideshow')[0];
		this.slideshowItems = this.slideshow.getElementsByClassName('js-slideshow__item');
		this.carousel = this.element.getElementsByClassName('thumbslide__nav-wrapper')[0];
		this.carouselList = this.carousel.getElementsByClassName('thumbslide__nav-list')[0];
		this.carouselListWrapper = this.carousel.getElementsByClassName('thumbslide__nav')[0];
		this.carouselControls = this.element.getElementsByClassName('js-thumbslide__tb-control');
		// custom obj
		this.slideshowObj = false;
		// thumb properties
		this.thumbItems = false;
		this.thumbOriginalWidth = false;
		this.thumbOriginalHeight = false;
		this.thumbVisibItemsNb = false;
		this.itemsWidth = false;
		this.itemsHeight = false;
		this.itemsMargin = false;
		this.thumbTranslateContainer = false;
		this.thumbTranslateVal = 0;
		// vertical variation
		this.thumbVertical = Util.hasClass(this.element, 'thumbslide--vertical');
		// recursive update 
		this.recursiveDirection = false;
		// drag events 
		this.thumbDragging = false;
		this.dragStart = false;
		// resize
		this.resize = false;
		// image load -> store info about thumb image being loaded
		this.loaded = false;
		initThumbs(this);
		initSlideshow(this);
		checkImageLoad(this);
	};

	function initThumbs(thumbSlider) { // create thumb items
		var carouselItems = '';
		for (var i = 0; i < thumbSlider.slideshowItems.length; i++) {
			var url = thumbSlider.slideshowItems[i].getAttribute('data-thumb'),
				alt = thumbSlider.slideshowItems[i].getAttribute('data-alt');
			if (!alt) alt = 'Image Preview';
			carouselItems = carouselItems + '<li class="thumbslide__nav-item"><img src="' + url + '" data-alt="' + alt + '">' + '</li>';
		}
		thumbSlider.carouselList.innerHTML = carouselItems;
		if (!thumbSlider.thumbVertical) initThumbsLayout(thumbSlider);
		else loadThumbsVerticalLayout(thumbSlider);
	};

	function initThumbsLayout(thumbSlider) {  // set thumbs visible numbers + width
		// evaluate size of single elements + number of visible elements
		thumbSlider.thumbItems = thumbSlider.carouselList.getElementsByClassName('thumbslide__nav-item');

		var itemStyle = window.getComputedStyle(thumbSlider.thumbItems[0]),
			containerStyle = window.getComputedStyle(thumbSlider.carouselListWrapper),
			itemWidth = parseFloat(itemStyle.getPropertyValue('width')),
			itemMargin = parseFloat(itemStyle.getPropertyValue('margin-right')),
			containerPadding = parseFloat(containerStyle.getPropertyValue('padding-left')),
			containerWidth = parseFloat(containerStyle.getPropertyValue('width'));

		if (!thumbSlider.thumbOriginalWidth) { // on resize -> use initial width of items to recalculate 
			thumbSlider.thumbOriginalWidth = itemWidth;
		} else {
			itemWidth = thumbSlider.thumbOriginalWidth;
		}
		// get proper width of elements
		thumbSlider.thumbVisibItemsNb = parseInt((containerWidth - 2 * containerPadding + itemMargin) / (itemWidth + itemMargin));
		thumbSlider.itemsWidth = ((containerWidth - 2 * containerPadding + itemMargin) / thumbSlider.thumbVisibItemsNb) - itemMargin;
		thumbSlider.thumbTranslateContainer = (((thumbSlider.itemsWidth + itemMargin) * thumbSlider.thumbVisibItemsNb));
		thumbSlider.itemsMargin = itemMargin;
		// flexbox fallback
		if (!flexSupported) thumbSlider.carouselList.style.width = (thumbSlider.itemsWidth + itemMargin) * thumbSlider.slideshowItems.length + 'px';
		setThumbsWidth(thumbSlider);
	};

	function checkImageLoad(thumbSlider) {
		if (!thumbSlider.thumbVertical) { // no need to wait for image load, we already have their width
			updateVisibleThumb(thumbSlider, 0);
			updateThumbControls(thumbSlider);
			initTbSlideshowEvents(thumbSlider);
		} else { // wait for image to be loaded -> need to know the right height
			var image = new Image();
			image.onload = function () { thumbSlider.loaded = true; }
			image.onerror = function () { thumbSlider.loaded = true; }
			image.src = thumbSlider.slideshowItems[0].getAttribute('data-thumb');
		}
	};

	function loadThumbsVerticalLayout(thumbSlider) {
		// this is the vertical layout -> we need to make sure the thumb are loaded before checking the value of their height
		if (thumbSlider.loaded) {
			initThumbsVerticalLayout(thumbSlider);
			updateVisibleThumb(thumbSlider, 0);
			updateThumbControls(thumbSlider);
			initTbSlideshowEvents(thumbSlider);
		} else { // wait for thumbs to be loaded
			setTimeout(function () {
				loadThumbsVerticalLayout(thumbSlider);
			}, 100);
		}
	}

	function initThumbsVerticalLayout(thumbSlider) {
		// evaluate size of single elements + number of visible elements
		thumbSlider.thumbItems = thumbSlider.carouselList.getElementsByClassName('thumbslide__nav-item');

		var itemStyle = window.getComputedStyle(thumbSlider.thumbItems[0]),
			containerStyle = window.getComputedStyle(thumbSlider.carouselListWrapper),
			itemWidth = parseFloat(itemStyle.getPropertyValue('width')),
			itemHeight = parseFloat(itemStyle.getPropertyValue('height')),
			itemRatio = itemWidth / itemHeight,
			itemMargin = parseFloat(itemStyle.getPropertyValue('margin-bottom')),
			containerPadding = parseFloat(containerStyle.getPropertyValue('padding-top')),
			containerWidth = parseFloat(containerStyle.getPropertyValue('width')),
			containerHeight = parseFloat(containerStyle.getPropertyValue('height'));

		if (!flexSupported) containerHeight = parseFloat(window.getComputedStyle(thumbSlider.element).getPropertyValue('height'));

		if (!thumbSlider.thumbOriginalHeight) { // on resize -> use initial width of items to recalculate 
			thumbSlider.thumbOriginalHeight = itemHeight;
			thumbSlider.thumbOriginalWidth = itemWidth;
		} else {
			resetOriginalSize(thumbSlider);
			itemHeight = thumbSlider.thumbOriginalHeight;
		}
		// get proper height of elements
		thumbSlider.thumbVisibItemsNb = parseInt((containerHeight - 2 * containerPadding + itemMargin) / (itemHeight + itemMargin));
		thumbSlider.itemsHeight = ((containerHeight - 2 * containerPadding + itemMargin) / thumbSlider.thumbVisibItemsNb) - itemMargin;
		thumbSlider.itemsWidth = thumbSlider.itemsHeight * itemRatio,
			thumbSlider.thumbTranslateContainer = (((thumbSlider.itemsHeight + itemMargin) * thumbSlider.thumbVisibItemsNb));
		thumbSlider.itemsMargin = itemMargin;
		// flexbox fallback
		if (!flexSupported) {
			thumbSlider.carousel.style.height = (thumbSlider.itemsHeight + itemMargin) * thumbSlider.slideshowItems.length + 'px';
			thumbSlider.carouselListWrapper.style.height = containerHeight + 'px';
		}
		setThumbsWidth(thumbSlider);
	};

	function setThumbsWidth(thumbSlider) { // set thumbs width
		for (var i = 0; i < thumbSlider.thumbItems.length; i++) {
			thumbSlider.thumbItems[i].style.width = thumbSlider.itemsWidth + "px";
			if (thumbSlider.thumbVertical) thumbSlider.thumbItems[i].style.height = thumbSlider.itemsHeight + "px";
		}

		if (thumbSlider.thumbVertical) {
			var padding = parseFloat(window.getComputedStyle(thumbSlider.carouselListWrapper).getPropertyValue('padding-left'));
			thumbSlider.carousel.style.width = (thumbSlider.itemsWidth + 2 * padding) + "px";
			if (!flexSupported) thumbSlider.slideshow.style.width = (parseFloat(window.getComputedStyle(thumbSlider.element).getPropertyValue('width')) - (thumbSlider.itemsWidth + 2 * padding) - 10) + 'px';
		}
	};

	function initSlideshow(thumbSlider) { // for the main slideshow, we are using the Slideshow component -> we only need to initialize the object
		var autoplay = (thumbSlider.slideshow.getAttribute('data-autoplay') && thumbSlider.slideshow.getAttribute('data-autoplay') == 'on') ? true : false,
			autoplayInterval = (thumbSlider.slideshow.getAttribute('data-autoplay-interval')) ? thumbSlider.slideshow.getAttribute('data-autoplay-interval') : 5000,
			swipe = (thumbSlider.slideshow.getAttribute('data-swipe') && thumbSlider.slideshow.getAttribute('data-swipe') == 'on') ? true : false;
		thumbSlider.slideshowObj = new Slideshow({ element: thumbSlider.slideshow, navigation: false, autoplay: autoplay, autoplayInterval: autoplayInterval, swipe: swipe });
	};

	function initTbSlideshowEvents(thumbSlider) {
		// listen for new slide selection -> 'newItemSelected' custom event is emitted each time a new slide is selected
		thumbSlider.slideshowObj.element.addEventListener('newItemSelected', function (event) {
			updateVisibleThumb(thumbSlider, event.detail);
		});

		// click on a thumbnail -> update slide in slideshow
		thumbSlider.carouselList.addEventListener('click', function (event) {
			if (thumbSlider.thumbDragging) return;
			var selectedOption = event.target.closest('.thumbslide__nav-item');
			if (!selectedOption || Util.hasClass(selectedOption, 'thumbslide__nav-item--active')) return;
			thumbSlider.slideshowObj.showItem(Util.getIndexInArray(thumbSlider.carouselList.getElementsByClassName('thumbslide__nav-item'), selectedOption));
		});

		// reset thumbnails on resize
		window.addEventListener('resize', function (event) {
			if (thumbSlider.resize) return;
			thumbSlider.resize = true;
			window.requestAnimationFrame(resetThumbsResize.bind(thumbSlider));
		});

		// enable drag on thumbnails
		new SwipeContent(thumbSlider.carouselList);
		thumbSlider.carouselList.addEventListener('dragStart', function (event) {
			var coordinate = getDragCoordinate(thumbSlider, event);
			thumbSlider.dragStart = coordinate;
			thumbDragEnd(thumbSlider);
		});
		thumbSlider.carouselList.addEventListener('dragging', function (event) {
			if (!thumbSlider.dragStart) return;
			var coordinate = getDragCoordinate(thumbSlider, event);
			if (thumbSlider.slideshowObj.animating || Math.abs(coordinate - thumbSlider.dragStart) < 20) return;
			Util.addClass(thumbSlider.element, 'thumbslide__nav-list--dragging');
			thumbSlider.thumbDragging = true;
			Util.addClass(thumbSlider.carouselList, 'thumbslide__nav-list--no-transition');
			var translate = thumbSlider.thumbVertical ? 'translateY' : 'translateX';
			setTranslate(thumbSlider, translate + '(' + (thumbSlider.thumbTranslateVal + coordinate - thumbSlider.dragStart) + 'px)');
		});
	};

	function thumbDragEnd(thumbSlider) {
		thumbSlider.carouselList.addEventListener('dragEnd', function cb(event) {
			var coordinate = getDragCoordinate(thumbSlider, event);
			thumbSlider.thumbTranslateVal = resetTranslateToRound(thumbSlider, thumbSlider.thumbTranslateVal + coordinate - thumbSlider.dragStart);
			thumbShowNewItems(thumbSlider, false);
			thumbSlider.dragStart = false;
			Util.removeClass(thumbSlider.carouselList, 'thumbslide__nav-list--no-transition');
			thumbSlider.carouselList.removeEventListener('dragEnd', cb);
			setTimeout(function () {
				thumbSlider.thumbDragging = false;
			}, 50);
			Util.removeClass(thumbSlider.element, 'thumbslide__nav-list--dragging');
		});
	};

	function getDragCoordinate(thumbSlider, event) { // return the drag value based on direction of thumbs navugation
		return thumbSlider.thumbVertical ? event.detail.y : event.detail.x;
	}

	function resetTranslateToRound(thumbSlider, value) { // at the ed of dragging -> set translate of coontainer to right value
		var dimension = getItemDimension(thumbSlider);
		return Math.round(value / (dimension + thumbSlider.itemsMargin)) * (dimension + thumbSlider.itemsMargin);
	};

	function resetThumbsResize() { // reset thumbs width on resize
		var thumbSlider = this;
		if (!thumbSlider.thumbVertical) initThumbsLayout(thumbSlider);
		else initThumbsVerticalLayout(thumbSlider);
		setThumbsWidth(thumbSlider);
		var dimension = getItemDimension(thumbSlider);
		// reset the translate value of the thumbs container as well
		if ((-1) * thumbSlider.thumbTranslateVal % (dimension + thumbSlider.itemsMargin) > 0) {
			thumbSlider.thumbTranslateVal = -1 * parseInt(((-1) * thumbSlider.thumbTranslateVal) / (dimension + thumbSlider.itemsMargin)) * (dimension + thumbSlider.itemsMargin);
			thumbShowNewItems(thumbSlider, false);
		}
		thumbSlider.resize = false;
	};

	function thumbShowNewItems(thumbSlider, direction) { // when a new slide is selected -> update position of thumbs navigation
		var dimension = getItemDimension(thumbSlider);
		if (direction == 'next') thumbSlider.thumbTranslateVal = thumbSlider.thumbTranslateVal - thumbSlider.thumbTranslateContainer;
		else if (direction == 'prev') thumbSlider.thumbTranslateVal = thumbSlider.thumbTranslateVal + thumbSlider.thumbTranslateContainer;
		// make sure translate value is correct
		if (-1 * thumbSlider.thumbTranslateVal >= (thumbSlider.thumbItems.length - thumbSlider.thumbVisibItemsNb) * (dimension + thumbSlider.itemsMargin)) thumbSlider.thumbTranslateVal = -1 * ((thumbSlider.thumbItems.length - thumbSlider.thumbVisibItemsNb) * (dimension + thumbSlider.itemsMargin));
		if (thumbSlider.thumbTranslateVal > 0) thumbSlider.thumbTranslateVal = 0;

		var translate = thumbSlider.thumbVertical ? 'translateY' : 'translateX';
		setTranslate(thumbSlider, translate + '(' + thumbSlider.thumbTranslateVal + 'px)');
		updateThumbControls(thumbSlider);
	};

	function updateVisibleThumb(thumbSlider, index) { // update selected thumb
		// update selected thumbnails
		var selectedThumb = thumbSlider.carouselList.getElementsByClassName('thumbslide__nav-item--active');
		if (selectedThumb.length > 0) Util.removeClass(selectedThumb[0], 'thumbslide__nav-item--active');
		Util.addClass(thumbSlider.thumbItems[index], 'thumbslide__nav-item--active');
		// update carousel translate value if new thumb is not visible
		recursiveUpdateThumb(thumbSlider, index);
	};

	function recursiveUpdateThumb(thumbSlider, index) { // recursive function used to update the position of thumbs navigation (eg when going from last slide to first one)
		var dimension = getItemDimension(thumbSlider);
		if (((index + 1 - thumbSlider.thumbVisibItemsNb) * (dimension + thumbSlider.itemsMargin) + thumbSlider.thumbTranslateVal >= 0) || (index * (dimension + thumbSlider.itemsMargin) + thumbSlider.thumbTranslateVal <= 0 && thumbSlider.thumbTranslateVal < 0)) {
			var increment = ((index + 1 - thumbSlider.thumbVisibItemsNb) * (dimension + thumbSlider.itemsMargin) + thumbSlider.thumbTranslateVal >= 0) ? 1 : -1;
			if (!thumbSlider.recursiveDirection || thumbSlider.recursiveDirection == increment) {
				thumbSlider.thumbTranslateVal = -1 * increment * (dimension + thumbSlider.itemsMargin) + thumbSlider.thumbTranslateVal;
				thumbSlider.recursiveDirection = increment;
				recursiveUpdateThumb(thumbSlider, index);
			} else {
				thumbSlider.recursiveDirection = false;
				thumbShowNewItems(thumbSlider, false);
			}
		} else {
			thumbSlider.recursiveDirection = false;
			thumbShowNewItems(thumbSlider, false);
		}
	}

	function updateThumbControls(thumbSlider) { // reset thumb controls style
		var dimension = getItemDimension(thumbSlider);
		Util.toggleClass(thumbSlider.carouselListWrapper, 'thumbslide__nav--scroll-start', (thumbSlider.thumbTranslateVal != 0));
		Util.toggleClass(thumbSlider.carouselListWrapper, 'thumbslide__nav--scroll-end', (thumbSlider.thumbTranslateVal != -1 * ((thumbSlider.thumbItems.length - thumbSlider.thumbVisibItemsNb) * (dimension + thumbSlider.itemsMargin))) && (thumbSlider.thumbItems.length > thumbSlider.thumbVisibItemsNb));
		if (thumbSlider.carouselControls.length == 0) return;
		Util.toggleClass(thumbSlider.carouselControls[0], 'thumbslide__tb-control--disabled', (thumbSlider.thumbTranslateVal == 0));
		Util.toggleClass(thumbSlider.carouselControls[1], 'thumbslide__tb-control--disabled', (thumbSlider.thumbTranslateVal == -1 * ((thumbSlider.thumbItems.length - thumbSlider.thumbVisibItemsNb) * (dimension + thumbSlider.itemsMargin))));
	};

	function getItemDimension(thumbSlider) {
		return thumbSlider.thumbVertical ? thumbSlider.itemsHeight : thumbSlider.itemsWidth;
	}

	function setTranslate(thumbSlider, translate) {
		thumbSlider.carouselList.style.transform = translate;
		thumbSlider.carouselList.style.msTransform = translate;
	};

	function resetOriginalSize(thumbSlider) {
		if (!Util.cssSupports('color', 'var(--var-name)')) return;
		var thumbWidth = parseInt(getComputedStyle(thumbSlider.element).getPropertyValue('--thumbslide-thumbnail-auto-size'));
		if (thumbWidth == thumbSlider.thumbOriginalWidth) return;
		thumbSlider.thumbOriginalHeight = parseFloat((thumbSlider.thumbOriginalHeight) * (thumbWidth / thumbSlider.thumbOriginalWidth));
		thumbSlider.thumbOriginalWidth = thumbWidth;
	};

	//initialize the ThumbSlideshow objects
	var thumbSlideshows = document.getElementsByClassName('js-thumbslide'),
		flexSupported = Util.cssSupports('align-items', 'stretch');
	if (thumbSlideshows.length > 0) {
		for (var i = 0; i < thumbSlideshows.length; i++) {
			(function (i) {
				new ThumbSlideshow(thumbSlideshows[i]);
			})(i);
		}
	}
}());
// File#: _4_product-v2
// Usage: codyhouse.co/license
(function () {
  function initColorSwatches(product) {
    var slideshow = product.getElementsByClassName('js-product-v2__slideshow'),
      colorSwatches = product.getElementsByClassName('js-color-swatches__select');
    if (slideshow.length == 0 || colorSwatches.length == 0) return; // no slideshow available

    var slideshowItems = slideshow[0].getElementsByClassName('js-slideshow__item'); // slideshow items

    colorSwatches[0].addEventListener('change', function (event) { // new color has been selected
      selectNewSlideshowItem(colorSwatches[0].options[colorSwatches[0].selectedIndex].value, slideshow[0], slideshowItems);
    });
  };

  function selectNewSlideshowItem(value, slideshow, items) {
    var selectedItem = document.getElementById('item-' + value);
    if (!selectedItem) return;
    var event = new CustomEvent('selectNewItem', { detail: Util.getIndexInArray(items, selectedItem) + 1 });
    slideshow.dispatchEvent(event); // reveal new slide
  };

  var productV2 = document.getElementsByClassName('js-product-v2');
  if (productV2.length > 0) {
    for (var i = 0; i < productV2.length; i++) {
      (function (i) {
        initColorSwatches(productV2[i]);
      })(i);
    }
  }
}());
/* axios v0.21.1 | (c) 2020 by Matt Zabriskie */
!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports.axios=t():e.axios=t()}(this,function(){return function(e){function t(r){if(n[r])return n[r].exports;var o=n[r]={exports:{},id:r,loaded:!1};return e[r].call(o.exports,o,o.exports,t),o.loaded=!0,o.exports}var n={};return t.m=e,t.c=n,t.p="",t(0)}([function(e,t,n){e.exports=n(1)},function(e,t,n){"use strict";function r(e){var t=new i(e),n=s(i.prototype.request,t);return o.extend(n,i.prototype,t),o.extend(n,t),n}var o=n(2),s=n(3),i=n(4),a=n(22),u=n(10),c=r(u);c.Axios=i,c.create=function(e){return r(a(c.defaults,e))},c.Cancel=n(23),c.CancelToken=n(24),c.isCancel=n(9),c.all=function(e){return Promise.all(e)},c.spread=n(25),c.isAxiosError=n(26),e.exports=c,e.exports.default=c},function(e,t,n){"use strict";function r(e){return"[object Array]"===R.call(e)}function o(e){return"undefined"==typeof e}function s(e){return null!==e&&!o(e)&&null!==e.constructor&&!o(e.constructor)&&"function"==typeof e.constructor.isBuffer&&e.constructor.isBuffer(e)}function i(e){return"[object ArrayBuffer]"===R.call(e)}function a(e){return"undefined"!=typeof FormData&&e instanceof FormData}function u(e){var t;return t="undefined"!=typeof ArrayBuffer&&ArrayBuffer.isView?ArrayBuffer.isView(e):e&&e.buffer&&e.buffer instanceof ArrayBuffer}function c(e){return"string"==typeof e}function f(e){return"number"==typeof e}function p(e){return null!==e&&"object"==typeof e}function d(e){if("[object Object]"!==R.call(e))return!1;var t=Object.getPrototypeOf(e);return null===t||t===Object.prototype}function l(e){return"[object Date]"===R.call(e)}function h(e){return"[object File]"===R.call(e)}function m(e){return"[object Blob]"===R.call(e)}function y(e){return"[object Function]"===R.call(e)}function g(e){return p(e)&&y(e.pipe)}function v(e){return"undefined"!=typeof URLSearchParams&&e instanceof URLSearchParams}function x(e){return e.replace(/^\s*/,"").replace(/\s*$/,"")}function w(){return("undefined"==typeof navigator||"ReactNative"!==navigator.product&&"NativeScript"!==navigator.product&&"NS"!==navigator.product)&&("undefined"!=typeof window&&"undefined"!=typeof document)}function b(e,t){if(null!==e&&"undefined"!=typeof e)if("object"!=typeof e&&(e=[e]),r(e))for(var n=0,o=e.length;n<o;n++)t.call(null,e[n],n,e);else for(var s in e)Object.prototype.hasOwnProperty.call(e,s)&&t.call(null,e[s],s,e)}function E(){function e(e,n){d(t[n])&&d(e)?t[n]=E(t[n],e):d(e)?t[n]=E({},e):r(e)?t[n]=e.slice():t[n]=e}for(var t={},n=0,o=arguments.length;n<o;n++)b(arguments[n],e);return t}function j(e,t,n){return b(t,function(t,r){n&&"function"==typeof t?e[r]=S(t,n):e[r]=t}),e}function C(e){return 65279===e.charCodeAt(0)&&(e=e.slice(1)),e}var S=n(3),R=Object.prototype.toString;e.exports={isArray:r,isArrayBuffer:i,isBuffer:s,isFormData:a,isArrayBufferView:u,isString:c,isNumber:f,isObject:p,isPlainObject:d,isUndefined:o,isDate:l,isFile:h,isBlob:m,isFunction:y,isStream:g,isURLSearchParams:v,isStandardBrowserEnv:w,forEach:b,merge:E,extend:j,trim:x,stripBOM:C}},function(e,t){"use strict";e.exports=function(e,t){return function(){for(var n=new Array(arguments.length),r=0;r<n.length;r++)n[r]=arguments[r];return e.apply(t,n)}}},function(e,t,n){"use strict";function r(e){this.defaults=e,this.interceptors={request:new i,response:new i}}var o=n(2),s=n(5),i=n(6),a=n(7),u=n(22);r.prototype.request=function(e){"string"==typeof e?(e=arguments[1]||{},e.url=arguments[0]):e=e||{},e=u(this.defaults,e),e.method?e.method=e.method.toLowerCase():this.defaults.method?e.method=this.defaults.method.toLowerCase():e.method="get";var t=[a,void 0],n=Promise.resolve(e);for(this.interceptors.request.forEach(function(e){t.unshift(e.fulfilled,e.rejected)}),this.interceptors.response.forEach(function(e){t.push(e.fulfilled,e.rejected)});t.length;)n=n.then(t.shift(),t.shift());return n},r.prototype.getUri=function(e){return e=u(this.defaults,e),s(e.url,e.params,e.paramsSerializer).replace(/^\?/,"")},o.forEach(["delete","get","head","options"],function(e){r.prototype[e]=function(t,n){return this.request(u(n||{},{method:e,url:t,data:(n||{}).data}))}}),o.forEach(["post","put","patch"],function(e){r.prototype[e]=function(t,n,r){return this.request(u(r||{},{method:e,url:t,data:n}))}}),e.exports=r},function(e,t,n){"use strict";function r(e){return encodeURIComponent(e).replace(/%3A/gi,":").replace(/%24/g,"$").replace(/%2C/gi,",").replace(/%20/g,"+").replace(/%5B/gi,"[").replace(/%5D/gi,"]")}var o=n(2);e.exports=function(e,t,n){if(!t)return e;var s;if(n)s=n(t);else if(o.isURLSearchParams(t))s=t.toString();else{var i=[];o.forEach(t,function(e,t){null!==e&&"undefined"!=typeof e&&(o.isArray(e)?t+="[]":e=[e],o.forEach(e,function(e){o.isDate(e)?e=e.toISOString():o.isObject(e)&&(e=JSON.stringify(e)),i.push(r(t)+"="+r(e))}))}),s=i.join("&")}if(s){var a=e.indexOf("#");a!==-1&&(e=e.slice(0,a)),e+=(e.indexOf("?")===-1?"?":"&")+s}return e}},function(e,t,n){"use strict";function r(){this.handlers=[]}var o=n(2);r.prototype.use=function(e,t){return this.handlers.push({fulfilled:e,rejected:t}),this.handlers.length-1},r.prototype.eject=function(e){this.handlers[e]&&(this.handlers[e]=null)},r.prototype.forEach=function(e){o.forEach(this.handlers,function(t){null!==t&&e(t)})},e.exports=r},function(e,t,n){"use strict";function r(e){e.cancelToken&&e.cancelToken.throwIfRequested()}var o=n(2),s=n(8),i=n(9),a=n(10);e.exports=function(e){r(e),e.headers=e.headers||{},e.data=s(e.data,e.headers,e.transformRequest),e.headers=o.merge(e.headers.common||{},e.headers[e.method]||{},e.headers),o.forEach(["delete","get","head","post","put","patch","common"],function(t){delete e.headers[t]});var t=e.adapter||a.adapter;return t(e).then(function(t){return r(e),t.data=s(t.data,t.headers,e.transformResponse),t},function(t){return i(t)||(r(e),t&&t.response&&(t.response.data=s(t.response.data,t.response.headers,e.transformResponse))),Promise.reject(t)})}},function(e,t,n){"use strict";var r=n(2);e.exports=function(e,t,n){return r.forEach(n,function(n){e=n(e,t)}),e}},function(e,t){"use strict";e.exports=function(e){return!(!e||!e.__CANCEL__)}},function(e,t,n){"use strict";function r(e,t){!s.isUndefined(e)&&s.isUndefined(e["Content-Type"])&&(e["Content-Type"]=t)}function o(){var e;return"undefined"!=typeof XMLHttpRequest?e=n(12):"undefined"!=typeof process&&"[object process]"===Object.prototype.toString.call(process)&&(e=n(12)),e}var s=n(2),i=n(11),a={"Content-Type":"application/x-www-form-urlencoded"},u={adapter:o(),transformRequest:[function(e,t){return i(t,"Accept"),i(t,"Content-Type"),s.isFormData(e)||s.isArrayBuffer(e)||s.isBuffer(e)||s.isStream(e)||s.isFile(e)||s.isBlob(e)?e:s.isArrayBufferView(e)?e.buffer:s.isURLSearchParams(e)?(r(t,"application/x-www-form-urlencoded;charset=utf-8"),e.toString()):s.isObject(e)?(r(t,"application/json;charset=utf-8"),JSON.stringify(e)):e}],transformResponse:[function(e){if("string"==typeof e)try{e=JSON.parse(e)}catch(e){}return e}],timeout:0,xsrfCookieName:"XSRF-TOKEN",xsrfHeaderName:"X-XSRF-TOKEN",maxContentLength:-1,maxBodyLength:-1,validateStatus:function(e){return e>=200&&e<300}};u.headers={common:{Accept:"application/json, text/plain, */*"}},s.forEach(["delete","get","head"],function(e){u.headers[e]={}}),s.forEach(["post","put","patch"],function(e){u.headers[e]=s.merge(a)}),e.exports=u},function(e,t,n){"use strict";var r=n(2);e.exports=function(e,t){r.forEach(e,function(n,r){r!==t&&r.toUpperCase()===t.toUpperCase()&&(e[t]=n,delete e[r])})}},function(e,t,n){"use strict";var r=n(2),o=n(13),s=n(16),i=n(5),a=n(17),u=n(20),c=n(21),f=n(14);e.exports=function(e){return new Promise(function(t,n){var p=e.data,d=e.headers;r.isFormData(p)&&delete d["Content-Type"];var l=new XMLHttpRequest;if(e.auth){var h=e.auth.username||"",m=e.auth.password?unescape(encodeURIComponent(e.auth.password)):"";d.Authorization="Basic "+btoa(h+":"+m)}var y=a(e.baseURL,e.url);if(l.open(e.method.toUpperCase(),i(y,e.params,e.paramsSerializer),!0),l.timeout=e.timeout,l.onreadystatechange=function(){if(l&&4===l.readyState&&(0!==l.status||l.responseURL&&0===l.responseURL.indexOf("file:"))){var r="getAllResponseHeaders"in l?u(l.getAllResponseHeaders()):null,s=e.responseType&&"text"!==e.responseType?l.response:l.responseText,i={data:s,status:l.status,statusText:l.statusText,headers:r,config:e,request:l};o(t,n,i),l=null}},l.onabort=function(){l&&(n(f("Request aborted",e,"ECONNABORTED",l)),l=null)},l.onerror=function(){n(f("Network Error",e,null,l)),l=null},l.ontimeout=function(){var t="timeout of "+e.timeout+"ms exceeded";e.timeoutErrorMessage&&(t=e.timeoutErrorMessage),n(f(t,e,"ECONNABORTED",l)),l=null},r.isStandardBrowserEnv()){var g=(e.withCredentials||c(y))&&e.xsrfCookieName?s.read(e.xsrfCookieName):void 0;g&&(d[e.xsrfHeaderName]=g)}if("setRequestHeader"in l&&r.forEach(d,function(e,t){"undefined"==typeof p&&"content-type"===t.toLowerCase()?delete d[t]:l.setRequestHeader(t,e)}),r.isUndefined(e.withCredentials)||(l.withCredentials=!!e.withCredentials),e.responseType)try{l.responseType=e.responseType}catch(t){if("json"!==e.responseType)throw t}"function"==typeof e.onDownloadProgress&&l.addEventListener("progress",e.onDownloadProgress),"function"==typeof e.onUploadProgress&&l.upload&&l.upload.addEventListener("progress",e.onUploadProgress),e.cancelToken&&e.cancelToken.promise.then(function(e){l&&(l.abort(),n(e),l=null)}),p||(p=null),l.send(p)})}},function(e,t,n){"use strict";var r=n(14);e.exports=function(e,t,n){var o=n.config.validateStatus;n.status&&o&&!o(n.status)?t(r("Request failed with status code "+n.status,n.config,null,n.request,n)):e(n)}},function(e,t,n){"use strict";var r=n(15);e.exports=function(e,t,n,o,s){var i=new Error(e);return r(i,t,n,o,s)}},function(e,t){"use strict";e.exports=function(e,t,n,r,o){return e.config=t,n&&(e.code=n),e.request=r,e.response=o,e.isAxiosError=!0,e.toJSON=function(){return{message:this.message,name:this.name,description:this.description,number:this.number,fileName:this.fileName,lineNumber:this.lineNumber,columnNumber:this.columnNumber,stack:this.stack,config:this.config,code:this.code}},e}},function(e,t,n){"use strict";var r=n(2);e.exports=r.isStandardBrowserEnv()?function(){return{write:function(e,t,n,o,s,i){var a=[];a.push(e+"="+encodeURIComponent(t)),r.isNumber(n)&&a.push("expires="+new Date(n).toGMTString()),r.isString(o)&&a.push("path="+o),r.isString(s)&&a.push("domain="+s),i===!0&&a.push("secure"),document.cookie=a.join("; ")},read:function(e){var t=document.cookie.match(new RegExp("(^|;\\s*)("+e+")=([^;]*)"));return t?decodeURIComponent(t[3]):null},remove:function(e){this.write(e,"",Date.now()-864e5)}}}():function(){return{write:function(){},read:function(){return null},remove:function(){}}}()},function(e,t,n){"use strict";var r=n(18),o=n(19);e.exports=function(e,t){return e&&!r(t)?o(e,t):t}},function(e,t){"use strict";e.exports=function(e){return/^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(e)}},function(e,t){"use strict";e.exports=function(e,t){return t?e.replace(/\/+$/,"")+"/"+t.replace(/^\/+/,""):e}},function(e,t,n){"use strict";var r=n(2),o=["age","authorization","content-length","content-type","etag","expires","from","host","if-modified-since","if-unmodified-since","last-modified","location","max-forwards","proxy-authorization","referer","retry-after","user-agent"];e.exports=function(e){var t,n,s,i={};return e?(r.forEach(e.split("\n"),function(e){if(s=e.indexOf(":"),t=r.trim(e.substr(0,s)).toLowerCase(),n=r.trim(e.substr(s+1)),t){if(i[t]&&o.indexOf(t)>=0)return;"set-cookie"===t?i[t]=(i[t]?i[t]:[]).concat([n]):i[t]=i[t]?i[t]+", "+n:n}}),i):i}},function(e,t,n){"use strict";var r=n(2);e.exports=r.isStandardBrowserEnv()?function(){function e(e){var t=e;return n&&(o.setAttribute("href",t),t=o.href),o.setAttribute("href",t),{href:o.href,protocol:o.protocol?o.protocol.replace(/:$/,""):"",host:o.host,search:o.search?o.search.replace(/^\?/,""):"",hash:o.hash?o.hash.replace(/^#/,""):"",hostname:o.hostname,port:o.port,pathname:"/"===o.pathname.charAt(0)?o.pathname:"/"+o.pathname}}var t,n=/(msie|trident)/i.test(navigator.userAgent),o=document.createElement("a");return t=e(window.location.href),function(n){var o=r.isString(n)?e(n):n;return o.protocol===t.protocol&&o.host===t.host}}():function(){return function(){return!0}}()},function(e,t,n){"use strict";var r=n(2);e.exports=function(e,t){function n(e,t){return r.isPlainObject(e)&&r.isPlainObject(t)?r.merge(e,t):r.isPlainObject(t)?r.merge({},t):r.isArray(t)?t.slice():t}function o(o){r.isUndefined(t[o])?r.isUndefined(e[o])||(s[o]=n(void 0,e[o])):s[o]=n(e[o],t[o])}t=t||{};var s={},i=["url","method","data"],a=["headers","auth","proxy","params"],u=["baseURL","transformRequest","transformResponse","paramsSerializer","timeout","timeoutMessage","withCredentials","adapter","responseType","xsrfCookieName","xsrfHeaderName","onUploadProgress","onDownloadProgress","decompress","maxContentLength","maxBodyLength","maxRedirects","transport","httpAgent","httpsAgent","cancelToken","socketPath","responseEncoding"],c=["validateStatus"];r.forEach(i,function(e){r.isUndefined(t[e])||(s[e]=n(void 0,t[e]))}),r.forEach(a,o),r.forEach(u,function(o){r.isUndefined(t[o])?r.isUndefined(e[o])||(s[o]=n(void 0,e[o])):s[o]=n(void 0,t[o])}),r.forEach(c,function(r){r in t?s[r]=n(e[r],t[r]):r in e&&(s[r]=n(void 0,e[r]))});var f=i.concat(a).concat(u).concat(c),p=Object.keys(e).concat(Object.keys(t)).filter(function(e){return f.indexOf(e)===-1});return r.forEach(p,o),s}},function(e,t){"use strict";function n(e){this.message=e}n.prototype.toString=function(){return"Cancel"+(this.message?": "+this.message:"")},n.prototype.__CANCEL__=!0,e.exports=n},function(e,t,n){"use strict";function r(e){if("function"!=typeof e)throw new TypeError("executor must be a function.");var t;this.promise=new Promise(function(e){t=e});var n=this;e(function(e){n.reason||(n.reason=new o(e),t(n.reason))})}var o=n(23);r.prototype.throwIfRequested=function(){if(this.reason)throw this.reason},r.source=function(){var e,t=new r(function(t){e=t});return{token:t,cancel:e}},e.exports=r},function(e,t){"use strict";e.exports=function(e){return function(t){return e.apply(null,t)}}},function(e,t){"use strict";e.exports=function(e){return"object"==typeof e&&e.isAxiosError===!0}}])});
//# sourceMappingURL=axios.min.map
// Download: https://gist.github.com/stewartknapman/8d8733ea58d2314c373e94114472d44c

var Shopify = Shopify || {};
// ---------------------------------------------------------------------------
// Money format handler
// ---------------------------------------------------------------------------
Shopify.money_format = "{{amount_no_decimals_with_comma_separator}} RSD";
Shopify.formatMoney = function (cents, format) {
  if (typeof cents == 'string') { cents = cents.replace('.', ''); }
  var value = '';
  var placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
  var formatString = (format || this.money_format);

  function defaultOption(opt, def) {
    return (typeof opt == 'undefined' ? def : opt);
  }

  function formatWithDelimiters(number, precision, thousands, decimal) {
    precision = defaultOption(precision, 2);
    thousands = defaultOption(thousands, ',');
    decimal = defaultOption(decimal, '.');

    if (isNaN(number) || number == null) { return 0; }

    number = (number / 100.0).toFixed(precision);

    var parts = number.split('.'),
      dollars = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + thousands),
      cents = parts[1] ? (decimal + parts[1]) : '';

    return dollars + cents;
  }

  switch (formatString.match(placeholderRegex)[1]) {
    case 'amount':
      value = formatWithDelimiters(cents, 2);
      break;
    case 'amount_no_decimals':
      value = formatWithDelimiters(cents, 0);
      break;
    case 'amount_with_comma_separator':
      value = formatWithDelimiters(cents, 2, '.', ',');
      break;
    case 'amount_no_decimals_with_comma_separator':
      value = formatWithDelimiters(cents, 0, ',', ',');
      break;
  }

  return formatString.replace(placeholderRegex, value);
};
