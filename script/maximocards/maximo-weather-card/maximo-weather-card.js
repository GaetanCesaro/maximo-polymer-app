/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016,2017
 */
Polymer({
	
	is: 'maximo-weather-card',
	
	properties : {
		
		/**
		 * Highlighted data to display indicator value
		 */
		data: {
			type: String
		},
		
		/**
		 * Unit to measure and compare data
		 */
		unit: {
			type: String
		},
		
		/**
		 * wether location.
		 */
		location: {
			type: String
		},
		
		/**
		 * Brief description about indicator. It has language support.
		 */
		label: {
			type: String
		},
		
		/**
		 * Respective data icon to be displayed.
		 * Check our available [icon set](../../../_info/icons.html)
		 */
		icon: {
			type: String
		},
		
		/**
		 * Stores link of the card.
		 * Used when card is tapped.
		 */
		link: {
			type: String
		}
	},
	
	ready: function () {
	},
	
	attached: function(){
  		if($M.workScape.panelScroll){
  			$j(this.$.carddiv).toggleClass('carouselCard',true);
  		}
	},

	behaviors: [BaseComponent],
	
	/**
	 * Open the link provided for the card
	 */
	openLink: function () {
		
		if (this.link){
			window.open(this.link);
		}else {
			
		}
		
	}
	
});
