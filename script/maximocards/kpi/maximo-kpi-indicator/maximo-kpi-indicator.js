/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016,2017
 */
Polymer({
	is: 'maximo-kpi-indicator',
  	behaviors: [BaseComponent],
  	listeners: {
		'iron-overlay-closed': '_overlayClosed',
		'iron-overlay-canceled': '_overlayCanceled'
  	},
	properties : {
		kpiname : {
			type: String,
			notify: true
		},
		kpiData : {
			type: Object,
			notify: true,
			observer: '_parseData'
		},
		data : {
			type: Number,
			notify: true
		},
		decimal : {
			type: String,
			value: '',
			notify: true
		},
		unit : {
			type: String,
			notify: true
		},
		cautionmin : {
			type: String,
			notify: true
		},
		cautionmax : {
			type: String,
			notify: true
		},
		warndisplay : {
			type: Boolean,
			value: false,
			notify: true
		},
		expandedKpi : {
			type: Object
		},
		overlayOpened: {
			type: Boolean,
			value: false
		},
		chartdata : {
			type:Array
		},
		labels : {
			type:Array
		},
		chartoptions: {
			type: Object,
			value: {}
		},
		kpihistoryuri: {
			type: String
		},
		kpiHistory : {
			type: Object
		},
		trendstyle : {
			type: String,
			notify: true
		}

	},
  	created : function(){
  		
  	},
  	ready : function(){

  	},
  	attached: function(){
  		if($M.workScape.panelScroll){
  			$j(this.$.carddiv).toggleClass('carouselCard',true);
  		}
  	},
  	_handleKpiRecordDataRefreshed : function() {
  		
  	},
  	
  	_parseData: function (kpi) {
  		
  		if (kpi && kpi.length > 0) {
  			var tmpdata = kpi[0].kpivalue;
  			if (typeof(tmpdata) === 'number') {
  				this.data = Math.floor(tmpdata);
  				if ( (tmpdata - this.data) > 0 ) {
  					var decStr = tmpdata.toString();
  					this.decimal = decStr.substring(decStr.indexOf('.'));
  				}
  			}else{
  				this.data = tmpdata;
  			}
  		}
  		
  		this._styleData();
  	},
  	
  	_styleData : function(){	
  		
  		this._analyzeTrend(this.kpiData[0]);
  		
  		if(this.kpiData[0].cautionmin > this.kpiData[0].cautionmax){
  			if(this.cautionmin!=='' && this.kpiData[0].kpivalue >= this.kpiData[0].cautionmin ){
  				this.toggleClass('good',true,this.$.maindata);
  			} else if((this.cautionmin!=='' && this.cautionmax!=='') && (this.kpiData[0].kpivalue > this.kpiData[0].cautionmax) && (this.kpiData[0].kpivalue < this.kpiData[0].cautionmin) ){
  				this.toggleClass('caution',true,this.$.maindata);
  			} else if(this.cautionmax!=='' && this.kpiData[0].kpivalue < this.kpiData[0].cautionmax ){
  	  			this.toggleClass('danger',true,this.$.maindata);
  	  			this.warndisplay = true;
  	  		}
  			
  		} else {
  	  		if(this.cautionmin!=='' && this.kpiData[0].kpivalue <= this.kpiData[0].cautionmin ){
  	  			this.toggleClass('good',true,this.$.maindata);
  	  		} else if((this.cautionmin!=='' && this.cautionmax!=='') && (this.kpiData[0].kpivalue > this.kpiData[0].cautionmin) && (this.kpiData[0].kpivalue < this.kpiData[0].cautionmax) ){
  	  			this.toggleClass('caution',true,this.$.maindata);
  	  		} else if(this.cautionmax!=='' && this.kpiData[0].kpivalue >= this.kpiData[0].cautionmax ){
  	  			this.toggleClass('danger',true,this.$.maindata);
  	  			this.warndisplay = true;
  	  		}
  		}
  	},
  	
  	_analyzeTrend : function (kpi) {
  		
  		if (kpi == null || kpi.lastkpivalue == null){
  			this.trendstyle = '';
  		}else if (kpi.kpivalue < kpi.lastkpivalue){
  			this.trendstyle = 'transform: rotate(45deg);';
  		}else if (kpi.kpivalue > kpi.lastkpivalue){
  			this.trendstyle = 'transform: rotate(315deg);';
  		}else {
  			this.trendstyle = '';
  		}
	
  	},
  	
  	expandKpi: function(){
		if(this.$.kpisection.opened === false && this.$.kpisection.lastvalue === undefined)
		{
			var screenWidth = $j(window).width();
			var parentPos = $j(this.$.carddiv).position();
			var parentHeight = $j(this.$.carddiv).height();
			var overlayWidth = $j(this.$.kpisection).width();
			var headerHeight = 0;
			if($M.workScape.panelScroll){
				headerHeight = $M.workScape.$.headerbar.offsetHeight + 10;
			}
			
			if (parentPos.left + overlayWidth < screenWidth){
				this.$.kpisection.style.left = parentPos.left + 'px';
			}else{
				this.$.kpisection.style.right = screenWidth + 'px';
				this.$.kpisection.style.left = (screenWidth - overlayWidth) + 'px';
			}
			this.$.kpisection.style.top = (parentPos.top + parentHeight + headerHeight) + 'px';

			this.kpihistoryuri = this.kpiData[0].href + '/kpi_history';
			this.$.historycollection.refreshRecords();

			var self = this;
	  		$j(window).one('scroll resize', function(){
	  			if(self.$.kpisection.opened === true)
	  			{
	  				self.$.kpisection.opened = false;
	  			}
	  		});

			this.$.kpisection.opened = true;
			this.$.kpisection.lastvalue = this.$.kpisection.opened;
		}
		else{
			this.$.kpisection.opened = false;
			this.$.kpisection.lastvalue = this.$.kpisection.opened;
		}
  	},

  	_overlayClosed: function(e){
  		this.$.kpisection.lastvalue = undefined;
  	},

  	_overlayCanceled: function(e){
  		if ($M.dialogCount() > 0){
  			e.preventDefault();
  		}
  	},

  	_handleKpiHistoryRefreshed: function(){
  		this.chartdata = $M.createAttrArrayFromRecords(this.kpiHistory,'kpivalue');
  		this.labels = [];
  		for(var i=0; i<this.chartdata.length; i++){
  	  		this.labels.push(moment(this.kpiHistory[i].recordedon).format('l'));
  		}
  		this.chartoptions = {};  		
  		this.chartoptions.rmargin = 30;
  		this.chartoptions.tmargin = 0;
  		this.chartoptions.bmargin = 60;
  		this.chartoptions.lmargin = 30;  		
  		this.$.chart.showChart();	

  		// fix position after loading chart
  		var popupHeight = $j(this.$.exp_carddiv).height();
  		if ($j(this.$.kpisection).position().top + popupHeight > $j(window).height()){
  			var footerHeight = $j('#workscape_footer') ? $j('#workscape_footer').height(): 0;
  			var headerHeight = $j('#workscape_headerbar') ? $j('#workscape_headerbar').height(): 0;
			var top = ($j(window).height() - popupHeight - footerHeight);
			this.$.kpisection.style.top = (top < headerHeight ? headerHeight: top) + 'px';
  			this.$.kpisection.style.maxHeight = popupHeight + 'px';
  			this.$.kpisection.style.height = popupHeight + 'px';
  		}
  	}

});
