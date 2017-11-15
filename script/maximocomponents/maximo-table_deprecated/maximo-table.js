/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016
 */
Polymer({
	is: 'maximo-table',
	behaviors: [BaseComponent, LoadingComponent],
	properties: {
		label: {
        	type: String,
        	notify:true
		},
		collection: {
			type: Object,
			value : function(){
				return {};
			}
		},
		itemsId : {
			type: String,
			value: '',
			notify: true,
			observer: '_setItems'
		},
		items : {
			type: Object,
			value: null,
			notify: true,
			observer: 'renderDataRows'
		},
		styleScope : {
			type: String,
			value: 'maximo-table',
			notify: true
		},
		initialized: {
			type: Object,
			valjue: false
		},
		eventContext: {
			type: Object,
			observer: 'setEventContext'
		}
	},
	attached: function(){
		this.initialized = true;
		if(this.loading && this.items){
			this.renderDataRows();
		}
	},
	created: function(){
		this.columns = [];
		var table = this;
		$j(this.childNodes).each(function(){ 
			var child = $j(this)[0];
			if(child.tagName==='MAXIMO-TABLECOL'){
				table.columns.push(child);
			}
		});
	},
	ready: function() {
		this.renderHeadings();
		if(!this.collection){
			$j(this.$.searchbar).attr({'display':'none'});
		}
		$j(this.$.wrapper).attr({'class': 'style-scope maximo-table '+ this.styleScope + ' wrapper ' +$M.dir});
		$j(this.$.table).attr({'class': 'style-scope maximo-table '+ this.styleScope + ' table ' +$M.dir});
		$j(this.$.title).attr({'class': 'style-scope maximo-table '+ this.styleScope + ' title ' +$M.dir});
		$j(this.$.searchbar).attr({'class': 'style-scope maximo-table '+ this.styleScope + ' searchbar ' +$M.dir});
		$j(this.$.header).attr({'class': 'style-scope maximo-table '+ this.styleScope + ' header ' +$M.dir});
		$j(this.$.body).attr({'class': 'style-scope maximo-table '+ this.styleScope + ' body ' +$M.dir});
  	},
	_setItems: function(newValue){
		if(newValue !== ''){
			this.items = window.resources[newValue];
		}
	},
	setEventContext: function(newValue){
		if(typeof newValue === 'string'){
			var target =  $M.getGlobalResource(newValue);
			this.eventTarget = target;
			return;
		}
		this.eventTarget = newValue;
	},
  	renderHeadings: function(){
  		var row = this.insertRow('header');
  		var table = this;
  		this.columns.forEach(function(column){
  	  		var th = document.createElement('th');
  	  		$j(th).attr({'class': 'style-scope maximo-table '+ this.styleScope + ' ' +$M.dir});
  	  		var label = $j(column).attr('label');
  	  		th.innerHTML = label&&label.length>0?table.localize(label):''; 
  	  		row.appendChild(th);
  		});
		var loadingRow = this.insertRow();
		var loadingCell = loadingRow.insertCell();
		$j(loadingCell).attr({'class': 'style-scope maximo-table '+ this.styleScope + ' noRows ' +$M.dir,'colspan':this.columns.length,'stopHover':'true'});
		loadingCell.innerHTML = this.localize('uitext', 'mxapibase', 'Loading');
  	},
  	refresh: function(){
  		this.renderDataRows();
  	},
  	renderDataRows: function(){
  		if(!this.initialized){
  			this.loading = true;
  			return;
  		}
  		if(typeof this.items === 'string'){
  			this.items = $M.getGlobalResource(this.items);
  			if(!this.items){
  				this.items = [];
  			}
  		}
  		var table = this;
  		var rows = table.$.body.rows;
  		for(var rowIndex = rows.length-1; rowIndex>=0 ;rowIndex--){
  			table.$.body.deleteRow(rowIndex);
  		}
  		this.items.forEach(function(item){
  			var row = table.insertRow();
  	  		table.columns.forEach(function(column){
  	  			column.render(row, column, item);
  	  		});
  		});
  		if(this.items.length === 0){
  			var row = this.insertRow();
  			var cell = row.insertCell();
  			$j(cell).attr({'class': 'style-scope maximo-table '+ this.styleScope + ' noRows ' +$M.dir,'colspan':table.columns.length,'stopHover':'true'});
  			cell.innerHTML = this.localize('uitext', 'mxapibase', 'NoRowstodisplay');
  		}
  	},
  	insertRow: function(type){
  		var parent = this.$.body;
  		if(type && type === 'header'){
  			parent = this.$.header;
  		}
  		var row = parent.insertRow();
		$j(row).attr({'class':'style-scope maximo-table '+ this.styleScope + ' ' +$M.dir});
		return row;
  	},
  	appendChild: function(parent,child){ //will add child and set class scope
  		$j(child).attr({'class':'style-scope maximo-table '+ this.styleScope + ' ' +$M.dir});
  		parent.appendChild(child);
  	}
});
