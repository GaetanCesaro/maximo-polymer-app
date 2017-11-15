/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016,2017
 */
Polymer({
	is: 'maximo-datadesign-content',
  	behaviors: [BaseComponent],
  	listeners: {
	  	'schema-data-refreshed' : '_haveSchemaData',
		'chooseObject' : '_pickobjset',
		'chooseAttribute' : '_pickAttribute',
		'removeAttribute' : '_removeRecordsAttribute',
		'maximo-searchbar-filter-changed':'_filterPickedAttr',
		'addPickedItems' : 'addPickedItems',
		'removePickedItems' : 'removePickedItems',
		'addOrderedItems': 'addOrderedItems',
		'removeOrderedItems': 'removeOrderedItems',
		'showInfo' : '_showInfo',
		'maximo-checkbox-changed' : '_checkboxChanged',
		'editPicked' : '_editPicked',
		'chosenListChanged' : '_chosenListChanged',
		'orderedListChanged' : '_orderedListChanged',
		'attrSelectedChanged' : '_attrSelectedChanged',
		'datalist-refreshed':'_datalistRefreshed',
		'changeSortOrder':'_changeSortOrder',
		'goback':'goback',
		'gonext':'gonext'
  	},
    properties: {
    	dataset : {
    		type: Object,
    		value: null,
    		notify: true
    	},
    	objectset : {
    		type: Object,
    		value: null,
    		notify: true,
    	},
    	selected : {
    		type: Number
    	},
    	selectedObj : {
    		type: Object,
    		value: null
    	},
    	schemaInfo : {
    		type: Object,
    		value: null
    	},
    	requiredMap : {
    		type: Array,
    		value: null
    	},
    	availableList : {
    		type: Array,
    		value: [],
    		notify: true
    	},
    	pickedList : {
    		type: Array,
    		value: [],
    		notify: true,
    		observer: '_setDSPickedList'
    	},
    	orderedList : {
    		type: Array,
    		value: [],
    		notify: true,
    		observer: '_setDSOrderedList'
    	},
	},
	observers: [
	            '_changetab(dataset, selected)'
	          ],
	attached: function(){
		$j(this.$.ordereddatalist.$.datalist).css({'overflow':'hidden'});
	},
	gonext : function(e) {
		this.fire('set-step-state', {'index':1,'state':'complete'});
		this.fire('change-wizard-step',2);
	},
	goback : function (e) {
		this.fire('change-wizard-step',0);
	},
	moveSelected: function(e){
		this.fire('addPickedItems', {'eventIndex': -1, 'records':this.$.attributedatalist._selectedRecords});
	},
	moveChosen: function(e){
		this.fire('addOrderedItems', {'eventIndex': -1, 'records':this.$.chosendatalist._selectedRecords});
	},
	_lookupSetDetail : function () {
		if (this.dataset.objectset) {
			this.$.schemacollection.refreshRecords();
		}
	},
	_changetab: function(dataset, selected){
		// load data when entering the content step
		if(selected === 1){
			this.objectset = this.dataset.objectset;
			this.pickedList = this.dataset.pickedList;
			this.orderedList = this.dataset.orderedList;
			this.$.schemacollection.refreshRecords();
		} 
	},
	_setDSPickedList: function(){
		this.dataset.pickedList = this.pickedList;
	},
	_setDSOrderedList: function(){
		this.dataset.orderedList = this.orderedList;
	},
	_pickobjset : function (e) {
		if (this.dataset.editmode === true && !this.dataset.editContentInit){
			this._loadLists();
			this.toggleNext();
			this.$.chosendatalist.refresh();
			this.$.ordereddatalist.refresh();
			this.dataset.editContentInit = true;
		}
		if (e.detail._selectedRecords && (e.detail._selectedRecords.length > 0)) {
			this.selectedObj=e.detail._selectedRecords[0];
			this.uniqueid = this.dataset.objectset.intobjectname + '_' + this.selectedObj.objectname;			
			this._updateListOfAttributes();			
		}
	},
	/*
	 * loop through all of the query template attributes and load the picked/ordered lists
	 */
	_loadLists: function(){
		if (this.dataset.objectset && this.dataset.objectset.querytemplate && this.dataset.objectset.querytemplate[0].querytemplateattr){
			var qta = this.dataset.objectset.querytemplate[0].querytemplateattr;
			//perform sort on chosen selectorder.
			qta.sort(function(a, b) {
				return parseFloat(a.selectorder) - parseFloat(b.selectorder);
			});
			for (var i=0; i < qta.length; i++){
				// remove any trailing * from child attributes (otherwise the field isn't loaded into the pickedList)
				if(qta[i].selectattrname.indexOf('*') > 0 && qta[i].selectattrname.indexOf('*') === qta[i].selectattrname.length-1){
					qta[i].selectattrname = qta[i].selectattrname.substr(0,qta[i].selectattrname.length-1);
				}
				// get attribute details from schema so it can be added to pickedList
				var pickedItem = this._getAttrFromSchema(qta[i].selectattrname);
				if (pickedItem){
					pickedItem.selectorder = qta[i].selectorder;
					pickedItem.templateattrhref = qta[i].localref;
					// build object path for href... use regex to replace any . in objectname with /
					var objPath = this.objectdatalist[0].objectname + (pickedItem.objectname ? '/' + pickedItem.objectname.replace(/\./g, '/') : '');
					pickedItem.href = this.dataset.objectset.intobjectname + '_' + objPath + '_' + pickedItem.attribute;
					if (qta[i].title){
						pickedItem.title = qta[i].title;
					}
					this.dataset.pickedList.push(pickedItem);
					if (qta[i].sortbyon === true){
						var orderedItem = pickedItem;
						orderedItem.sortbyorder = qta[i].sortbyorder;
						orderedItem.sort = (qta[i].ascending === true ? 'asc': 'desc');
						this.dataset.orderedList.push(orderedItem);
					}
					this.dataset.orderedList.sort(function(a, b) {
					return parseFloat(a.sortbyorder) - parseFloat(b.sortbyorder);
					});
				}
			}
		}
	},
	/* 
	 * get the schema for a given set of object references
	 * ex: get the schema for po.poline.pocost object path
	 */
	_getSubSchema: function(objects){
		var schema = this.$.schemacollection.schema;
		var schemaTemp;
		for (var i=0; i< objects.length; i++){  // traverse any/all schemas
			schemaTemp = schema[objects[i]];
			if (!schemaTemp || schemaTemp.type !== 'array'){  // if rel name != object name, or if we're not looking at a child object, look in relationObjectMap
				schemaTemp = schema[this.objectdatalist[0].relationObjectMap[objects[i]]];
			}
			if (schemaTemp && schemaTemp.items){
				schema = schemaTemp.items.properties;  // return the properties bit (this is the attr list)
			}
		}
		return schema;
	},
	/*
	 *  get the attribute properties from the schema (length, type, title, etc)
	 */
	_getAttrFromSchema: function(attribute){
		// check for any object reference(s) and get the right schema/sub schema
		var schema = this.$.schemacollection.schema;
		var index = attribute.indexOf('.');
		var objects = [];
		var objectname;
		var relations = [];
		var relationPath;
		if (index > 0){
			objectname = attribute.substr(0, attribute.lastIndexOf('.'));	// get just the objectname, omitting the attribute
			objects = objectname.split('.');
			schema = this._getSubSchema(objects);
			attribute = attribute.substr(attribute.lastIndexOf('.')+1);	// get just the attribute name (overwrites the original!)
		}
		// now get attribute from schema
		var schemaAttr = schema[attribute];
		if (schemaAttr){
			var listObj = {};	// create object to push into list
			listObj.attribute = attribute;
			if(objectname){
				listObj.objectname = objectname.toUpperCase(); // uppercase here because that's how it is in the tree
			}
			if(schemaAttr.relation){
				listObj.relation = schemaAttr.relation;
			}
			listObj.datalistVisible = true;
			if (schemaAttr.maxLength){
				listObj.maxLength = schemaAttr.maxLength;
			}
			listObj.subType = schemaAttr.subType;
			if ((schemaAttr.title === undefined) || (schemaAttr.title === null)) {
				listObj.title = schemaAttr.upperattribute;
			}else{
				listObj.title = schemaAttr.title;
			}
			listObj.remarks = schemaAttr.remarks;
			listObj.type = schemaAttr.type;
			listObj.upperattribute = listObj.attribute.toUpperCase();
			listObj.upperdescription = listObj.title.toUpperCase();
			listObj.objectdescription = (objectname ? objectname.toUpperCase() + '.': '') + listObj.upperattribute;
			if (relationPath && relationPath.length > 0){
				listObj.relationPath = relationPath.toUpperCase();
			}
			return listObj;
		}else{
			console.log('Attribute ' + (objectname ? objectname + '.': '') + attribute + ' not found.');
		}
	},
	
	_removeRecordsAttribute: function(e){
		var index = parseInt($j(e.target).attr('datalist-index'));
		this.splice('pickedList', index, 1);
		this.$.chosendatalist.refresh();
	},
	_pickAttribute: function(e){
		if(this._noDuplicates(this.pickedList, e.detail)){
			this.push('pickedList', e.detail);
			this.$.chosendatalist.refresh();
		}
	},
	/**
	 * Called when we have schema data.  Unfortunately the schema attributes come down as a map when we need it to be an
	 * array, and the required information comes down as an array when we need it to be a map.  Fix that up here.
	 */
	_haveSchemaData  : function () {
		this.$.dataSetdatalist.toggleBlur(true);
		
		this.async(function(){

			this.objectdatalist = [];
			var dataList = this._buildObjectTree(this.schemaInfo, null);
			if (dataList) {
				this.objectdatalist.push(dataList);
			}			
			
			this.$.dataSetdatalist.refresh();

			var firstsel = this._ensureAttributesSelected(this.selectedObj);
			if (firstsel !== this.selectedObj) {
				this.selectedObj = firstsel;
				this.$.dataSetdatalist.selectRecord(this.selectedObj);	
			}			
		},100);
	},
	
	_updateListOfAttributes : function () {
		this.$.attributedatalist.toggleBlur(true);
		this.async(function(){
			var objectdescription = '';
			var relationPath = '';
			var objectname = '';
			var schemaSubset = {};
			this.requiredMap = new Map();
			var self = this;
			
			if (this.selectedObj) {
				// need to strip off top level object from object hierarchy
				if (this.selectedObj.objectname && this.selectedObj.objectname.indexOf('/') > 0){
					objectname = this.selectedObj.objectname.substr(this.selectedObj.objectname.indexOf('/')+1, this.selectedObj.objectname.length);
					if (objectname.indexOf('/')>0){  // any more /?
						objectname = objectname.replace(/\//g, '.');	// use regex to replace all / with .
					}
				}
				objectdescription = objectname ? objectname + '.' : '';
				relationPath = this.selectedObj.relation ? this.selectedObj.relation : '';
				
				if (this.selectedObj.fullRecord) {
					if (this.selectedObj.fullRecord.properties) {
						schemaSubset=this.selectedObj.fullRecord.properties;
					}
					
					if (this.selectedObj.fullRecord.required) {
						this.selectedObj.fullRecord.required.forEach(function(item) {
							self.requiredMap.set(item,item);
						});
					}
				}
			}

			var requiredOnly = this.$.mySwitch.checked;
			var temp = [];			

			Object.keys(schemaSubset).map(function(k) {
				var attr = schemaSubset[k];
				// note: if the attribute type is array, then that is child tree node.
				// filter that out for now until we decide to support showing/filtering on the full tree.
				if (attr.type && attr.type !=='array') {
					if ((!requiredOnly) || (requiredOnly && self.requiredMap.has(k))) { 
						attr.attribute = k;
						attr.upperattribute = attr.attribute.toUpperCase();
						if ((attr.title === undefined) || (attr.title === null)) {
							attr.title = attr.upperattribute;
						}
						attr.upperdescription = attr.title.toUpperCase();
						attr.datalistVisible = true;
						attr.href = self.uniqueid+'_'+attr.attribute;
						attr.objectdescription = objectdescription + attr.upperattribute;
						if (objectname && objectname.length > 0){
							attr.objectname = objectname;
						}
						if (relationPath && relationPath.length > 0){
							attr.relationPath = relationPath;
						}
						temp.push(attr);
					}
				}
			});

			temp.sort(function(a,b) {
				return a.attribute.localeCompare(b.attribute);
			});

			this.set('availableList',temp);
			
		},100);
	},
			
	/**
	 * takes the schemainfo object and builds a simpler tree out of it suitable for displaying on the datalist.
	 */
	_buildObjectTree : function(parent,relation) {
		if ((parent) && ((parent.type === 'array') || (parent.type === 'object')))
		{
			var record = {};
			record.relationObjectMap = {};
			record.objectRelationMap = {};
			record.fullRecord = parent;
			// looks strange but title has the hierarchypath
			record.objectname = parent.title;
			if (relation){
				record.relation = relation ? relation : '';
			}
			record.relationPath = (!parent.relationPath || parent.relationPath==='') ? relation: parent.relationPath + '.' + relation;
			record.datalistVisible = !$j.isEmptyObject(parent.properties);
			record.description = (!parent.description || parent.description==='') ? (!relation? parent.resource : relation) : parent.description;
			if (!$j.isEmptyObject(parent.properties)) {
				var self = this;
				var childlist = [];						
				Object.keys(parent.properties).map(function(k) {
					var attr = parent.properties[k];
					if (attr.type && attr.type ==='array') {
						var relationLower = attr.relation.toLowerCase();
						if (relationLower !== k){  // relationship name is not always same as object name:  map it so we can get schema
							record.relationObjectMap[relationLower] = k;  // for non-matching relationship name - not used
							record.objectRelationMap[k] = relationLower;  // so we can rebuild relationPath from querytemplateattr that has object path
						}
						var relationprefix = (relation && relation.length > 0) ? relation + '.' : '';
						childlist.push(self._buildObjectTree(attr.items, relationprefix + attr.relation));
					}
				});
				
				if (childlist.length > 0) {
					childlist.sort(function(a,b) {
			  			return (a.description.localeCompare(b.description));
			  		});
					record.children = childlist;
				}
			}
			return record;
		}
		return null;
	},	
	/**
	 * return true if the object has some attribute properties
	 */
	_hasAttributeProperties : function(object) {
		var rtnval = false;
		if (object && !$j.isEmptyObject(object.properties)) {
			Object.keys(object.properties).map(function(k) {
				var attr = object.properties[k];
				if (attr.type && attr.type !=='array') {
					rtnval = true;
				}
			});
		}
		return rtnval;
	},
	
	/**
	 *  ensures that we select the first object that has some valid properties 
	 */
	_ensureAttributesSelected : function (currentObj) {
		if (currentObj) {		
			if (currentObj.datalistVisible && this._hasAttributeProperties(currentObj.fullRecord)) {
				return currentObj;
			} else {
				if (currentObj.children) {
					for (var ii = 0; ii < currentObj.children.length;ii++) {
						var objhasattr = this._ensureAttributesSelected(currentObj.children[ii]);
						if (objhasattr) {
							return objhasattr;
						}
					}
				}
			}
		}
		return null;
	},
	
	_filterPickedAttr : function (e) {
		var filtervar = e.detail.value.toUpperCase();
		if(e.detail.id === this.$.selectedsearch.id){
			for (var ii = 0; ii < this.pickedList.length; ii++) {			
				this.pickedList[ii].datalistVisible = ((this.pickedList[ii].upperattribute.indexOf(filtervar) > -1) ||
						(this.pickedList[ii].upperdescription.indexOf(filtervar) > -1));
			}
			this.$.chosendatalist.refresh();
		}
	},
	_noDuplicates: function(array, record){
		for(var checkIndex=0;checkIndex<array.length;checkIndex++){
			if(array[checkIndex].href === record.href){
				return false;
			} 
		}
		return true;
	},
	/** Remove items from picked data array 
	 *	takes array of records as detail and removes 
	 *  the query template attributes from the system
	 */
	removePickedItems: function(e){
		var startLength = this.pickedList.length;
		this.pickedList = this._removeRecords(this.pickedList, e.detail);
		var card = this;	

		var deleteTemplateAttrHref = e.detail[0].templateattrhref; //fetch template attr href
		if(deleteTemplateAttrHref){
			this.$.dataDesignResource.deleteRecord(deleteTemplateAttrHref).then(function(){
				card.processRemovePickItems(e,card,startLength)
			});
		} else {
			card.processRemovePickItems(e,card,startLength)
		}	
	},
	
	/** Remove items from picked data array 
	 *  takes array of records as detail 
	 */
	processRemovePickItems : function(e,card,startLength){
		if(startLength !== card.pickedList.length){
			card.removeOrderedItems(e);
			card.toggleNext();
			if(card.pickedList.length===0){
				card.orderedList = [];
				card.$.ordereddatalist.refresh();
				$j(card.$.resetChosen).attr({'disabled':'true'});
				card.toggleNext();
				card.fire('set-step-state', {'index':1,'state':'initial'});
			}
			card.$.chosendatalist.refresh();
		}
	},
	
	reset: function(){
		this.toggleNext();
		$j(this.$.resetChosen).attr({'disabled':'true'});
		this.$.availsearch.clear();
		this.$.selectedsearch.clear();
	},
	/** Remove items from ordered data array 
	 *	takes array of records as detail 
	 */
	removeOrderedItems: function(e){
		var startLength = this.orderedList.length; 
		this.orderedList = this._removeRecords(this.orderedList, e.detail);
		if(startLength!==this.orderedList.length){
			this.$.ordereddatalist.refresh();
		}
	},
	/** Add items to picked data array
	 *	detail: {eventIndex,records}
	 */
	addPickedItems: function(e){
		if(this._selectLengthOK(e.detail.records)){
			if(this._add(e.detail.eventIndex, this.pickedList, e.detail.records, '_noDuplicates')){
				$j(this.$.resetChosen).removeAttr('disabled');
				this.toggleNext();
				this.$.selectedsearch.clear(true);
			}
			this._setDSPickedList();
		}else{
			$M.alert($M.localize('messages','mxapiwosdataset','toomanycolumns'),$M.alerts.error);
		}
	},
	/**
	 * querytemplate.selectclause (non-persistent) has a max size of 500.  determine whether the 
	 * character count of the selected columns + ',' is over the limit
	 */
	_selectLengthOK: function(records){
		var count = this._countAttrChars(this.pickedList);
		count += this._countAttrChars(records);
		if (count <= 4000){
			return true;
		}
		return false;
	},
	/**
	 * count the characters for each record attribute.  include the objectname + '.' if it is present
	 */
	_countAttrChars: function(records){
		var count = 0;
		var separator = false;
		if (records && records.length > 0){
			for (var i=0; i < records.length; i++){
				count += records[i].attribute.length + 1;  // count the attribute length + separator (comma)
				if (records[i].objectname){
					count += records[i].objectname.length + 1;  // count the relationpath + separator (period)
				}
				separator = true;
			}
			if (separator){
				count --;	// don't count the last separator
			}
		}
		return count;
	},
	toggleNext: function(){
		var next = $M.workScape.getFooterButton('gonext');
		if(next){
			$j(next).prop('disabled',!this._nextAllowed());
		}
	},
	/** Add items to ordered data array
	 *	detail: {eventIndex,records}
	 */
	addOrderedItems: function(e){
		var card = this;
		if(e.detail.records[0].relation==null){
		if(this._add(e.detail.eventIndex, this.orderedList, e.detail.records, function(array,record){
			return array.length<3 && card._noDuplicates(card.orderedList, record);
		})){
			this.$.ordereddatalist.refresh();
		}
		}else{
			var message = $M.localize('uitext','mxapiwosdataset','childSortWarning');
			$M.notify(message,$M.alerts.warn);
		}
		this._setDSOrderedList();
	},
	_add: function(index, array, records, allowed){
		var card = this;
		var added = false;
		records.forEach(function(record){
			var canAdd = true;
			if(allowed!==undefined){
				canAdd = false;
				if(card[allowed]){
					canAdd = card[allowed](array,record);
				}
				else {
					canAdd = allowed(array,record);
				}
			}
			if(canAdd){
				if(index>=0){
					array.splice(index, 0, record);
					index++;
					added = true;
				}
				else {
					array.push(record);
					added = true;
				}
			}
		});
		return added;
	},
	_removeRecords: function(array, records){
		if(records.length===0){
			return array;
		}
		var tempList = JSON.parse(JSON.stringify(array));
		var removed = 0;
		array.forEach(function(picked,index){
			records.forEach(function(record){
				if(picked.href === record.href){
					tempList.splice(index-removed, 1);
					removed++;
				}
			});
		});
		return tempList;
	},
	//Display the information 
	_showInfo: function(e){
		var infoButton = $j(e.detail.item).find('button[originalEvent=info]');
		var availableItem=e.detail.record;
		if (availableItem){
			var aliasname=document.createElement('div');
			var title=document.createElement('maximo-field');
			var objname=document.createElement('maximo-field');
			var relationshp;
			if (availableItem.relation){
				relationshp=document.createElement('maximo-field');
				$j(relationshp).attr({'label':'Relationship','datalabel':availableItem.relation});
			}
			var required=document.createElement('maximo-field');
			var maxtype=document.createElement('maximo-field');
			var length=document.createElement('maximo-field');
			var remarks=document.createElement('maximo-field');
			var tooltip = document.createElement('div');
			var objnamef = availableItem.objectname ? availableItem.objectname : this.objectdatalist[0].objectname;
			$j(aliasname).append('<p>'+ availableItem.upperattribute+'</p>');
			$j(title).attr({'label':'Title','datalabel':availableItem.title});
			$j(objname).attr({'label':'Object Name','datalabel':objnamef});
			$j(required).attr({'label':'Is this a Required Field?','datalabel':this.requiredMap.has(e.detail.record.attribute)});
			$j(maxtype).attr({'label':'Database Type','datalabel':availableItem.subType});
			$j(length).attr({'label':'Length','datalabel':availableItem.maxLength});
			$j(remarks).attr({'label':'Remarks','datalabel':availableItem.remarks});
			$j(tooltip).append(aliasname,title,objname,relationshp,required,maxtype,length,remarks);
			$M.showTooltip(tooltip,infoButton[0]);
		}
	},
	_checkboxChanged : function(e) {
		// if the value of the required fields checkbox change, refresh the collection
		if (e.target === this.$.mySwitch) {
// currently, no need to refresh collection, just redo the local refiltering			
//			this.$.schemacollection.refreshRecords();
			this._haveSchemaData();
		}
	},
	_editPicked: function(e){
		var datalist = e.target; 
		var card = this;
		if(datalist.id === this.$.chosendatalist.id){
			var li = e.detail.item;
			var editable = $j(li).find('div[data-attribute=title]');
			editable.attr({'contentEditable':'true'});
			var width = $j(li).width()-$j(li).find('div').first().width() - ($j(editable).offset().left-$j(li).offset().left);
			editable.css({'white-space':'nowrap','background':'#fff','width':width+'px'});
			editable.focus();
			var range = document.createRange();
    		range.selectNodeContents(editable[0]);
    		var sel = window.getSelection();
    		sel.removeAllRanges();
    		sel.addRange(range);
    		$j(li).find('.toolbar').css({'opacity':'0'});
    		var keys = editable.on('keydown', function(e){
    			e.stopPropagation();
    			if(e.keyCode===13){
    				$j(e.currentTarget).trigger('blur');
    				return false;
    			}
    			return (e.currentTarget.innerText.length <= 80);
			});
    		var blur = editable.on('blur', function(e){
    			card.pickedList[parseInt($j(li).attr('datalist-index'))].title = e.currentTarget.innerText;
    			$j(e.currentTarget).css({'background':'transparent','width':'auto'});
    			$j(e.currentTarget).attr({'contentEditable':'false'});
    			$j(li).find('.toolbar').css({'opacity':'1'});
    			$j(li).focus();
    			blur.off();
    			keys.off();
    			$M.removeTextSelection();
			});
		}
		
	},
	resetChosen: function(e){
		this.pickedList = [];
		this.$.chosendatalist.refresh();
		this.orderedList  = [];
		this.$.ordereddatalist.refresh();
		this._chosenListChanged();
		$j(this.$.resetChosen).attr({'disabled':'true'});
		this.toggleNext();
	},
	_orderedListChanged: function(){
		var buttons = $j(this.$.outer).find('.updown').last().find('maximo-button');
		var disabled = this.$.ordereddatalist._selectedRecords.length === 0  || this.$.ordereddatalist.items.length < 2 ||
		this.$.ordereddatalist._selectedRecords.length === this.$.ordereddatalist.items.length;
		buttons.each(function(){
			this.set('disabled',disabled);
		});
	},
	_chosenListChanged: function(){
		var buttons = $j(this.$.outer).find('.updown').first().find('maximo-button');
		if(this.$.chosendatalist._selectedRecords.length === 0){
			$j(this.$.moveOrdered).attr({'disabled':'true'});
		}
		else {
			//$j(this.$.outer).find('.updown').first().removeAttr('hidden');
			$j(this.$.moveOrdered).removeAttr('disabled');
		}
		var disabled = this.$.chosendatalist._selectedRecords.length === 0 || this.$.chosendatalist.items.length < 2 ||
		this.$.chosendatalist.items.length === this.$.chosendatalist._selectedRecords.length;
		buttons.each(function(){
			this.set('disabled',disabled);
		});
	},
	_attrSelectedChanged: function(){
		if(this.$.attributedatalist._selectedRecords.length === 0){
			$j(this.$.addButton).attr({'disabled':'true'});
		}
		else {
			$j(this.$.addButton).removeAttr('disabled');
		}
	},
	_datalistRefreshed: function(e){
		if(e.detail.id === this.$.ordereddatalist.id){
			$j(this.$.ordereddatalist).find('li').each(function(){
				var record = e.detail.itemForElement(this);
				if(record.sort===undefined){
					record.sort='asc';
				}
				var button = e.detail.addCustomToolbarButton(this, {'event':'changeSortOrder','class':'sort','icon':'maximo-based:sort-'+record.sort+'ending-lg','title':'Sort'}, -1);
				$j(button).find('iron-icon').css({'margin-top':'2px'});
			});
		}
	},
	_changeSortOrder: function(e){
		var item = $j(this.$.ordereddatalist)[0].items[parseInt($j(e.detail.item).attr('datalist-index'))];
		item.sort = item.sort==='desc'?'asc':'desc';
		var sortButton = $j(e.detail.item).find('button.sort');
		sortButton.find('iron-icon')[0].set('icon','maximo-based:sort-'+item.sort+'ending-lg');
		sortButton.find('iron-icon').attr({'icon':'maximo-based:sort-'+item.sort+'ending-lg'});
		sortButton.trigger('blur');
	},
	
	preview : function(){
		this.fire('preview');
	},
	
	_nextAllowed: function(){
		return this.pickedList.length > 0;
	}

});
