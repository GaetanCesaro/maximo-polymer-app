var $j = jQuery.noConflict();

String.prototype.bool = function() {
    return (/^true$/i).test(this.toLowerCase());
};

var maximo = {
		mobile: false,
		touch: false,
		rtl: false,
		dir: 'ltr',
		debug: false,
		skin: '',
		alerts : {
			info : 0,
			warn : 1,
			error : 2
		},
		components: {},
		elementCounts: {},
		lang : 'en', //TODO - need to get this from user/document
		dialogs: {
			map: {},
			stack: []
		},
		addComponent: function(component){
			var nodeName = component.nodeName.toLowerCase();
			component.initialized=true;
			if(this.components[component.id] && component._templateInstance){
				component.id = component._templateInstance._rootDataHost.id + component.idSep +component.id;
				component.modifiedId = true;
			}
			var parentComponent = null;
			if(component.parentNode){
				if((component.parentNode !== component.parentElement && component.parentNode.host)){
					parentComponent = component.parentNode.host;
				}
				else if(this.elementCounts[component.parentNode.nodeName.toLowerCase()]){
					parentComponent = component.parentNode;
				}
			}
			try {
				if(this.debug){
					if(!component.id){
						throw 'No id defined for ';
					}
					if(this.components[component.id]){
						if(component.parentNode.nodeName !== '#document-fragment'){
							throw 'Duplicate id defined for ';
						}
					}	
				}
			}
			catch (error){
				var info = ' ';
				Object.keys(component.attributes).forEach(function(key){
					var attribute = component.attributes[key];
					if(attribute.name !== 'class'){
						info+= attribute.name+'="'+attribute.value+'" ';
					}
				});
				var errorString = '';
				switch(error){
					case 'missing':
						errorString = 'No id defined for ';
						break;
					case 'duplicate':
						break;
				}
				console.error(error +'<'+ nodeName + info +'>. ');// + host);
			}
			finally {
				this.components[component.id] = component;
				var nodeCount = parseInt(this.elementCounts[nodeName]);
				if(isNaN(nodeCount)){
					nodeCount = 0;
					this.elementCounts[nodeName] = ++nodeCount;
				}
			}
		},
		
		mapNameValuePairs: function(myValues, pairSep, valueSep){
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
		},
		init: function(properties){
			this.urlParams = this.mapNameValuePairs(document.location.search);
			this.touch = this.urlParams.touch?this.urlParams.touch.bool():properties.touch?properties.touch:this.touch;
			this.skin = this.urlParams.skin?this.urlParams.skin:properties.skin?properties.skin:this.skin;
			this.dir = this.urlParams.dir?this.urlParams.dir:properties.dir?properties.dir:this.dir;
			this.dir = this.dir.toLowerCase();
			$j(document).attr({'dir':this.dir});
			if(this.dir === 'rtl'){
				this.skin+=' rtl';
			}
			try{ 
				if(!!('ontouchstart' in window)){
					this.skin+=' touch';
					this.touch = true;
				}
				/* Make scrollbars visible on webkit
				 * Body will not show a scrollbar on mobile
				 * internal scrollable areas will 
				 */ { 
					var touchStyle = document.createElement('style');
					
				    $j.get('css/touch.css', function(css){
				    	css = css.replace(new RegExp('{scroll-size}', 'g'), $M.touch?'4':'8');
				    	css = css.replace(new RegExp('{thumb-color}', 'g'), $M.touch?'rgba(0, 0, 0, .3)':'rgba(0, 0, 0, .08)');
				    	css = css.replace(new RegExp('{track-color}', 'g'), $M.touch?'rgba(0, 0, 0, .08)':'transparent');
				    	touchStyle.appendChild(document.createTextNode(css));
					    document.head.appendChild(touchStyle);
				    });
				}

			}
			catch(e){
				//not touch!
			}
		},
		showOverlay: function(owner){ //if over is passed in we place overlay over it in z-index, otherwise we place it at z-index 50. Dialogs start at 100.
			var layer = document.createElement('div');
			layer.className = 'maxWait';
			$j('body').append(layer);
			var zIndex = $j(owner).css('z-index');
			if(!zIndex){
				zIndex = 50; 
			}
			layer.id = owner.id+'_underlay';
			$j(layer).css({'z-index':(zIndex-1)});
		},
		alert: function(message, type){
			var typeTitle = 'System Message';
			var icon, className;
			switch(type){
				case this.alerts.info:
					className = 'svgAlertBlue';
					icon = 'info';
					break;
				case this.alerts.warn:
					className = 'svgAlertYellow';
					icon = 'warning';
					break;
				case this.alerts.error:
					className = 'svgAlertRed';
					icon = 'error';
					break;
				default:
					type = 'info';
					className = 'svgAlertBlue';
					icon = 'info';
					break;
			}
			var content = '<div class="msgInternal" style="line-height: 30px; margin: 5px 10px;"><iron-icon icon="'+icon+'" class="messageIcon '+className+'" style="transform: scale(2)"></iron-icon><label style="margin: 0px 20px">'+message+'</label></div>';
			var count = 0;
			var id = '';
			do{
				id = 'Sys'+type+count;
				count++;
			}
			while ($j('#'+id).length>0);
			this.showDialog(id, typeTitle, content, false);
	  		window.setTimeout(function(){
				var internalElements = $j('#'+id).find('.msgInternal').find('*');
				internalElements.each(function() {
					var className = $j(this).attr('class');
					if(className){
						$j(this).attr('class', className+' maximo-dialog');
					}
				});
				$j('#'+id+'_dialog').attr('role','alertdialog');
	  		});
		},
		showDialog : function(id, title, content, fullSize){
			if(typeof this.dialogs.map[id] === 'number'){
				console.warn('already showing dialog with the id: '+id +'!');
				this.flashElement($j('#'+id));
				return;
			}
			this.toggleBlur(true);
			this.toggleScroll(false);
			var props = {'id': id,'title':title, 'fullSize': fullSize};
			if(typeof content === 'object'){
				props.contentObject = content;
			}
			else if(content.indexOf('maximo-') === 0){
				props.contentObject = document.createElement(content);
			}
			else { //must be string content
				props.content = content;
			}
			var dialog = Polymer.Base.create('maximo-dialog', props);
			$j('body').append(dialog);
			if($j('body').prop('offsetHeight') < $j('body').prop('scrollHeight')){
				this.toggleScroll(false);
			}
		},
		closeDialog: function(){
			var dialogCount = this.dialogCount();
			if(dialogCount===0){
				this.toggleScroll(true);
			}
			this.toggleBlur(false);
		},
		toggleBlur: function(state){
			if(typeof state !== 'boolean'){
				state = true;
			}
			var target = $j('.maximo-workscape.wrapper');
			if(target.length===0){
				target = $j('.loginpanel');
			}
			var dialogCount = this.dialogCount();
			if(dialogCount>0){
				target = $j('#'+this.dialogs.stack[dialogCount-1]);
			}
			target.toggleClass('song2',state);
			return target;
		},
		toggleScroll : function(scroll){
			if(scroll){
				$j('body').removeClass('fixedVertical');
				$j('body').scrollTop(this.bodyScroll);
				if(this.stopScroll){
					this.stopScroll.unbind();
					this.stopScroll = null;
				}
			}
			else if($j('body').prop('scrollHeight')>$j('body').height()){
				var bs = this.bodyScroll = $j('body').scrollTop();
				this.stopScroll = $j(window).scroll(function(){
					$j('body').scrollTop(bs);
				});
			}
		},
		dialogCount: function(){
			return this.dialogs.stack.length;
		},
		flashElement: function(element){
			$M.highlightElement(element);
			window.setTimeout(function(){
				$M.highlightElement(element);
			}, 500);
		},
		highlightElement: function(element){
			var transition = element.css('transition');
			element.css({'transition':'all .3s'});
			element.css({'transform':'scale(1.05)'});
			window.setTimeout(function(){
				element.css({'transform':'scale(1)'});
				if(transition){
					window.setTimeout(function(){
						element.css({'transition':transition});
					}, 500);
				}
			}, 300);			
		},
		toggleWait: function(state){
			if(typeof state !== 'boolean'){
				state = true;
			}
			var zIndexTarget = this.toggleBlur(state);
			if(zIndexTarget.css('z-index')){
				var zIndex = parseInt(zIndexTarget.css('z-index'))+1;
				$j('#WAIT_wait').css({'z-index':zIndex});
			}
			$j('#WAIT_wait').css({'display':state?'inline':'none'});
			this.toggleScroll(!state);
		},
		localize: function(key){
			/* stub for resolving labels */
			var strings = this.resources.strings;
			var lang = strings[this.lang];
			if(lang){
				if(lang[key]){
					return lang[key];
				}
			}
			return key;
		},
		resources: {
			/* TODO - These will be filled by some other method (request from maximo?) */
			strings : {
				es : {
					'MORE INFO': 'MÁS INFORMACIÓN',
					'CLOSE':'FINALIZAR',
					'ASSIGN':'ASIGNAR',
					'CHANGE STATUS':'CAMBIAR ESTADO',
					'Work to Assign':'Trabajar para Asignar',
					'Work in Progress':'Trabajo en progreso',
					'Work to Close':'Trabajar para Finalizar',
					'Recommended Labor':'recomendada Trabajo',
					'Completeness':'el lo completo',
					'Assigned Labor':'Asignado Trabajo',
					'My Team':'Mi equipo',
					'Work Completed on Time':'Trabajos terminados a tiempo',
					'Day Shift':'Turno de dia',
					'Night Shift':'Turno nocturno',
					'Weekend Shift':'Fin de semana Turno',
					'Supervisor':'El Supervisor',
					'Technician':'Técnico',
					'Engineer':'Ingeniero'
					
					
				}
			}
		}
};

$M = maximo;

$M.init({
	//dir: 'rtl',
	//skin: 'sampleSkin'
	//touch: false 
});

