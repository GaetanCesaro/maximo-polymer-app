/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016
 */
/*
A Chart Type dialog component.
 */
Polymer({
	is: 'maximo-charttype-dialog',
  	behaviors: [BaseComponent],
	properties : {
		width: {
			type : String,
			value : '120px'
		},
		height: {
			type : String,
			value : '120px'
		},
		allowedtypes : {
			type: String,
			notify: true,
			observer: '_haveTypes'
		},
		typemap : {
			type: Object,
			value:null
		}
	},
  	ready : function(){
  	},
  	attached: function(e){
  		$j('maximo-dialog')[0].close = function(e){
  	  		$j('maximo-dialog')[0].closeMe();
  	  		if (e){
  	  			e.stopPropagation();
  	  		}
  	  	};
  	},
  	pickedChart : function(e) {
  		if (e.target) {
  			var charttype = e.currentTarget.attributes.getNamedItem('charttype');  		
  			if (charttype) { 
  				if (this.typemap) {
  					if (this.typemap[charttype.value]) {
  						this.parent.fire('newttype', charttype.value);
  						this.closeDialog();
  				  		e.stopPropagation(); 
					}
  				}
  				else {
					this.parent.fire('newttype', charttype.value);
  					this.closeDialog();  					
					e.stopPropagation(); 
  				}
  			}
  		}  		
  	},
  	_haveTypes : function () {
  		if (this.allowedtypes && this.allowedtypes.length > 0) {
  			this.typemap = {};
  			var types = this.allowedtypes.split(',');
  			for (var ii = 0; ii < types.length; ii++) {  					
  				this.typemap[types[ii]] = types[ii];
  			}
  			this.toggleClass('iconEnabled',this.typemap.barchart,this.$.barchart);
  			this.toggleClass('iconDisabled',!this.typemap.barchart,this.$.barchart);
  			this.toggleClass('iconEnabled',this.typemap.linechart,this.$.linechart);
  			this.toggleClass('iconDisabled',!this.typemap.linechart,this.$.linechart);
  			this.toggleClass('iconEnabled',this.typemap.piechart,this.$.piechart);
  			this.toggleClass('iconDisabled',!this.typemap.piechart,this.$.piechart);
  			this.toggleClass('iconEnabled',this.typemap.mapchart,this.$.mapchart);
  			this.toggleClass('iconDisabled',!this.typemap.mapchart,this.$.mapchart);
  			this.toggleClass('iconEnabled',this.typemap.heatmap,this.$.heatmap);
  			this.toggleClass('iconDisabled',!this.typemap.heatmap,this.$.heatmap);
  		}
  		else {
  			this.typemap=null;
  		}

  	}

});