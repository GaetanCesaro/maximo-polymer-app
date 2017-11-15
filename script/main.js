/*
* Licensed Materials - Property of IBM
* 5724-U18
* Copyright IBM Corporation. 2016
*/
	$M = null;
	mapNameValuePairs = function(myValues, pairSep, valueSep){
		var map = {};
		if(myValues===''){
			return map;
		}
		myValues = myValues.substring(1);
		if(!pairSep){
			pairSep = '&';
		}
		if(!valueSep){
			valueSep = '=';
		}
		myValues = unescape(myValues);
		var props;
		myValues.split(pairSep).forEach(function(pair){
			props = pair.split(valueSep);
			map[props[0]] = props[1];
		});
		return map;
	};

	window.urlParams = this.mapNameValuePairs(document.location.search);
	var maximoProperties = sessionStorage.getItem('maximoProperties');
	var props;
	if(maximoProperties && !window.urlParams.nohash && !window.urlParams.touch && !window.urlParams.debug && !window.urlParams.logLevel && !window.urlParams.markListeners && !window.urlParams.skin && !window.urlParams.dir && !window.urlParams.carousel && !window.urlParams.mock){
		props = JSON.parse(maximoProperties); 
	}
	else {
		props = {  
			'touch': window.urlParams.touch?window.urlParams.touch:false,
			'nohash': window.urlParams.test?window.urlParams.nohash:false,
			'debug': window.urlParams.debug?window.urlParams.debug:false,
			'logLevel': window.urlParams.logLevel?window.urlParams.logLevel:0,
			'markListeners': window.urlParams.markListeners?window.urlParams.markListeners:false,
			'skin': window.urlParams.skin?window.urlParams.skin:'',
			'mock': window.urlParams.mock?window.urlParams.mock:false,
			'dir': window.urlParams.dir?window.urlParams.dir:'',
			'carousel': window.urlParams.carousel?window.urlParams.carousel:false
		};
	}
	window.markPolymerListeners = (props.markListeners !== 'false' || props.debug === 'true');
	sessionStorage.setItem("maximoProperties", JSON.stringify(props));
	getScrollbarWidth = function() {
		if(!this.scrollbarWidth){
			var div, body, W = window.browserScrollbarWidth;
			if (W === undefined) {
			    body = document.body; 
			    div = document.createElement('div');
			    div.innerHTML = '<div style="width: 50px; height: 50px; position: absolute; left: -100px; top: -100px; overflow: auto;"><div style="width: 1px; height: 100px;"></div></div>';
			    div = div.firstChild;
			    body.appendChild(div);
			    W = window.browserScrollbarWidth = div.offsetWidth - div.clientWidth;
			    body.removeChild(div);
			}
			this.scrollbarWidth = W + 2;
		}
		return this.scrollbarWidth;
	}