/*
* Licensed Materials - Property of IBM
* 5724-U18
* Copyright IBM Corporation. 2016
*/
Polymer({
	is: 'maximo-tablecol',
	properties: {
		label: { //used for headings
        	type: String,
        	value: '',
        	notify: true
		},
		format: {
			type: String,
			value: ''
		},
		style : {
			type: String,
			value:''
		},
		styleWithData: {
			type: String,
			notify: true
		}
	},
	behaviors: [BaseComponent, DynamicComponent],
	allowedHTMLChildren : ['BR'],
	created: function(){
	},
	ready: function() {
		//this.table = $M.components[this.parentElement.id];		
  	},
  	render: function(row, column, record){
		var cell = row.insertCell();
		var cellId = record.href.substring(record.href.lastIndexOf('/')+1, record.href.length);
		cell.record = record;
		$j(cell).attr({'id': cellId});
		var attributes = this.attributes;
		var style = attributes.getNamedItem('style');
		if(style){
			$j(cell).attr({'style':style.value});
		}
		
  		var styleScopeValue = '';
  		var styleScope = this.parentElement.attributes.getNamedItem('style-scope');
  		if(styleScope){
  			styleScopeValue = styleScope.value;
  		}
		$j(cell).attr({'class': 'style-scope maximo-table '+ styleScopeValue + ' ' +$M.dir});
  		var attributeValue;
  		var attribute = attributes.getNamedItem('attribute');
  		if(attribute){
  			attributeValue = attribute.value;
  		}
  		var dataValue = this.resolveDataAttribute(record, attributeValue);
  		if(typeof dataValue === 'undefined' ){
  			dataValue = '&nbsp;';
  		}
  		else {
  			$j(cell).attr({'data-value':dataValue});
  		}
  		if(column.firstElementChild.childElementCount===0){
  			//cell.appendChild(Polymer.Base.create('MAXIMO-LABEL', {'id':cellId+'_label','label':dataValue})); //may be tougher with accessibility
  			var heading = $j('<h4>', {id: 'heading' + $j(cell)[0].id });
  			$j(heading).html(dataValue);
  			
  			$j(cell).append(heading);
  			//cell.innerHTML = dataValue;
  			if(this.styleWithData){
	  			var styleWithDataArray = this.styleWithData.split(',');
	  			var styleName;
	  			for (var index in styleWithDataArray) {
	  				styleName = styleWithDataArray[index];
	  				var styles = {};
	  				styles[styleName] = dataValue;
	  				$j(cell).css(styles);
	  			}
  			}
  		}
  		else {
  			var tableCol = this;
  			var badChild = $M.localize('messages', 'mxapibase', 'MAXIMOTABLECOL0cannotcontainachildoftype1');
  			$j(column.firstElementChild.children).each(function(index, child){
  		  		if((typeof child.allowedOnTable === 'undefined' || child.allowedOnTable() === false ) && !tableCol.allowedHTMLChildren.contains(child.tagName)){
  		  			console.warn(badChild + child.tagName);
  		  			cell.innerHTML = $M.localize('uitext', 'mxapibase', 'INVALID');
  		  			$j(cell).css({'color':'red'});
  		  			$j(cell).attr({'title':$M.localize(badChild, [child.id, child.tagName])});
  		  			return true;
  		  		}
  				var props = {
  					'id': child.id + '_' + cellId		
  				};
  				var tapEvent;
  				for(var propIndex in child.attributes){
  					var prop = child.attributes[propIndex];
  					if(prop.value){
  	  					var propValue = prop.value;
  	  					var localize = false;
  						if(prop.name.toLowerCase()==='gesture-tap'){
  							tapEvent = propValue;
  						}
  						else {
  	  						if(propValue.startsWith('{{') &&  propValue.endsWith('}}')){
  	  							propValue = propValue.replace(/}}/g, '').replace(/{{/g,'');
  	  							if(propValue.startsWith('localize(') && propValue.endsWith(')')){
  	  								localize = true;
  		  							propValue = propValue.replace(/localize\('/g, '').replace(/'\)/g,'');
  	  							}
  	  						}
  							if(propValue.startsWith('data:')) { 
  								propValue = tableCol.resolveDataAttribute(record, propValue);
  							}
  							if(localize){
  	  							propValue = $M.localize(propValue);
  							}
  							props[prop.name] = propValue;
  						}
  					}
  					else {
  						props[prop.name] = prop.name;
  					}
  					if(child.label){
  						props.label = child.label;
  					}
  				}
  				var newChild = Polymer.Base.create(child.tagName, props);
  				newChild.onTable = true;
  				if(newChild.firstElementChild){
  					newChild.tableColTap = function(e){
  						var event = new MouseEvent('tap', {
		  				    'bubbles': true,
		  				    'cancelable': true
		  				});
						event.record = record;
		  				child.firstElementChild.dispatchEvent(event);
		  			};
  					newChild.listen(newChild, 'tap', 'tableColTap');
//  					$j(newChild.firstElementChild).on('click', function(e){
//	  					 var event = new MouseEvent('tap', {
//	  					    'bubbles': true,
//	  					    'cancelable': true
//	  					  });
//						event.record = record;
//	  					child.firstElementChild.dispatchEvent(event);
//	  				});
  				}
  				$j(cell).append(newChild);
  			});
  		}
  		$j(cell).find('*').each(function( index, child ){
  			var className = $j(child).attr('class');
  			if(className){
  				className = className.replace('style-scope', 'style-scope maximo-table');
  				$j(child).attr({'class':className,'data-ontable':'true'});
  			}
  		});
  	},
  	resolveDataAttribute: function(record, attribute){
  		var data = record;
  		if(attribute){
  			if(attribute.startsWith('data:')){
  				attribute = attribute.substring(5);
  			}
	  		var notations = attribute.split('.');
	  		notations.forEach(function(attribute){
	  			data = data[attribute];
	  		});
	  		var attributes = this.attributes;
			return $M.format(attributes.getNamedItem('format'), data);
  		}
  		return '';
  	}
});
