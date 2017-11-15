/*
 * IBM Confidential
 *
 * OCO Source Materials
 *
 * 5724-U18
 *
 * Copyright IBM Corp. 2017
 *
 * The source code for this program is not published or otherwise
 * divested of its trade secrets, irrespective of what has
 * been deposited with the U.S. Copyright Office.
 */
function MaximoQbe(qbeWhere){
	
	/* Clone the existing record if there is any */
    this.qbeObject = $j.extend(true, {}, qbeWhere);
    
    /**
     * Set qbeObject based on key, operator, value. If qbeObject is not initialized, set it as an empty object
     * Value support both array and "," separate string
     */
    
    this.set = function(key, operator, value){
    	if(this.qbeObject === undefined){
    		this.clear();
    	}
    	this._addNewAttrWhere(key, operator, value);
    	return this;
    },
    
    /**
     * Set qbeObject with in clause
     */
    
    this.setIn = function(key, value){			
    	this._addNewAttrWhere(key, 'in', value);
    	return this;
	},
	
    /**
     * Set qbeObject with = operator
     */
	
    this.setEquals = function(key, value){			
    	this._addNewAttrWhere(key, '=', value);
    	return this;
	},
	
	
    /**
     * Set qbeObject with != operator
     */
	
    this.setNotEquals = function(key, value){			
    	this._addNewAttrWhere(key, '!=', value);
    	return this;
	},
	
    /**
     * Set qbeObject with > operator
     */
	
    this.setGreater = function(key, value){			
    	this._addNewAttrWhere(key, '>', value);
    	return this;
	},
	
    /**
     * Set qbeObject with < operator
     */
	
    this.setLess = function(key, value){			
    	this._addNewAttrWhere(key, '<', value);
    	return this;
	},
	
    /**
     * Set qbeObject with >= operator
     */
	
    this.setGreaterEquals = function(key, value){			
    	this._addNewAttrWhere(key, '>=', value);
    	return this;
	},
	
    /**
     * Set qbeObject with <= operator
     */
	
    this.setLessEquals = function(key, value){			
    	this._addNewAttrWhere(key, '<=', value);
    	return this;
	},
    
	/** 
	 * We always reset the qbeWhere if there is key conflict
	 */
    
    this._addNewAttrWhere = function(key, operator, value){
		
		/* Return when key or operator(value) is undefined */
		if(key === undefined || operator === undefined){
			return;
		}
		
    	var localKey = key;
    	var localOperator = operator;
    	var localValue = value;
    	
    	/* Support set('assetnum','AH001') by taking it as set('assetnum','=', 'AH001') */
    	if(localValue === undefined){
    		localOperator = '=';
    		localValue = operator;
    	}
    	
    	var attrWhere = {};
    	attrWhere.operator = localOperator;
    	
    	/* handle in clause with valueset */
    	if(localOperator === 'in'){
    		var localValueArray = [];
    		/* Avoid the check issue when localValue = 0 */
    		if(localValue !== undefined){
    			if(typeof localValue === 'string'){
    				localValueArray = localValue.split(',');
    			}else if(Array.isArray(localValue)){
    				localValueArray = localValue;
    			}

    		}
    		
    		attrWhere.valueset = localValueArray;
    	}else{
    		if(!(typeof localValue === 'string')){
    			console.log('Array is only supported with IN clause. Skip current set');
    			return;
    		}
    		attrWhere.value = localValue;
    	}
    	/* if there is no qbewhere, initializing it as an empty object */
    	if(this.qbeObject.qbewhere === undefined || this.qbeObject.qbewhere === null){
    		this.qbeObject.qbewhere = {};
    	}
    	this.qbeObject.qbewhere[key] = attrWhere;
	},
	
	/**
	 * Clear current qbe Object
	 */
	
	this.clear = function(){
		this.qbeObject = {'qbewhere':{}};
	},
	
	/**
	 * Return current qbe object as JSON
	 */
	
	this.toJSON = function(){
    	if(this.qbeObject === undefined){
    		this.clear();
    	}
		return this.qbeObject;
	},
	
	/**
	 * Return current qbe object as String
	 */
	
	this.toString = function(){
    	if(this.qbeObject === undefined){
    		this.clear();
    	}
		return JSON.stringify(this.qbeObject);
	},
	
	/**
	 * Set qbe mode as And
	 */
	
	this.setModeAnd = function(){
    	if(this.qbeObject === undefined){
    		this.clear();
    	}
    	this.qbeObject.qbemodeor = false;
    	return this;
	},
	
	/**
	 * Set qbe mode as Or
	 */
	
	this.setModeOr = function(){
    	if(this.qbeObject === undefined){
    		this.clear();
    	}
    	this.qbeObject.qbemodeor = true;
    	return this;
	}
}