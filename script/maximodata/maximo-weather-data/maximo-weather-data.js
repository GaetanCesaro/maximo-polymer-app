/*
 * @license
 * Licensed Materials - Property of IBM
 * 5724-U18
 * Copyright IBM Corporation. 2016
 */
Polymer({
	
		is: 'maximo-weather-data',
		
		properties: {
		
			weatherData : {
				type: Object,
				notify: true
			},
			
			weatherCollection : {
				type : Array,
				value: [],
				notify: true
			},
			
			sequence: {
				type : Array,
				value: [],
				notify: true
			},
			
			windSpeed : {
				type: Object,
				readOnly: true,
			},
			
			windDirection : {
				type: Object,
				readOnly: true
			},
			
			humidity : {
				type: Object,
				readOnly: true
			},
			
			temperature : {
				type: Object,
				readOnly: true
			},
			
			postalcode : {
				type : String,
				value : '',
				notify:true
			},
			countrycode : {
				type : String,
				value : '',
				notify:true
			},
			
			ctxWeatherDataCurrent: {
				type: Object,
				observer: 'refreshcurrent',
				notify: true
			},
			
			resourceUri: {
				type:String,
				notify: true
			},
			
			weatherPortal: {
				type: String,
				value: function (){
					if($M.userInfo.postalcode && $M.userInfo.country){
						return 'https://weather.com' + 
						'/weather/today/l/' + $M.userInfo.postalcode + ':4:' + $M.userInfo.country;	
					} else {
						return 'https://www.weather.com';
					}
				}
			}
			
		},
		
	  	behaviors: [BaseComponent, HandlerWeather],
	  	
	  	ready : function () {
	  		this.$.personInfo.refreshRecords().then(function(personalinfo){
	  			if(personalinfo.response.member && personalinfo.response.member.length>0){
	  				this.postalcode = personalinfo.response.member[0].postalcode;
	  				this.countrycode = personalinfo.response.member[0].country;
	  				
	  				this.resourceUri = personalinfo.response.member[0].href;
	  				
	  				var weatherObjectCurr = {};
	  				weatherObjectCurr.postalcode=this.postalcode;
	  				weatherObjectCurr.country=this.countrycode;
	  				weatherObjectCurr.location = 'location';
	  				weatherObjectCurr.locationcode = '4';
	  				
	  				this.set('ctxWeatherDataCurrent', weatherObjectCurr);
	  			}
			}.bind(this));	  	
	  	},
	  	
		_handleRecordDataRefreshed: function(e)
		{
					
			if (!this.weatherData) {
				//trigger toast error
				$M.notify('Weather info failed. ' + e.detail.error);
			}
			
			this.weatherCollection = [];
			
			if (this.sequence && this.sequence.length > 0) {
				var ctxWeatherDataCurrent = this.get('ctxWeatherDataCurrent');
				if(this.weatherData.curweather.status === 401 || !ctxWeatherDataCurrent || !ctxWeatherDataCurrent.postalcode || !ctxWeatherDataCurrent.country){
					return;
				}	
				var array = this.sequence;
				var object = null;
				//build each object
				for (var i=0; i < array.length; i++){
					object = this._weatherObjectBuilder(array[i]);
					if ( object ) {
						this.push ('weatherCollection', object);
					}
				}
				
			}else {
				this.push ('weatherCollection', this._mountWindSpeedObject() );
				this.push ('weatherCollection', this._mountWindDirectionObject() );
				this.push ('weatherCollection', this._mountTemperatureObject() );
				this.push ('weatherCollection', this._mountHumidityObject() );
			}
			
		},
		
		_mountWindDirectionObject : function () {
		
			var windDirection = {};
			
			windDirection.unit = '';
			if(this.weatherData.curweather.observation){
				windDirection.data = this.weatherData.curweather.observation.wdir_cardinal;
				winddDirection.location = this.localize('Direction');
				windDirection.icon = 'maps:directions'; //also static
			}else{
				windDirection.data = '-';
				windDirection.location = this.localize('uitext', 'mxapibase', 'Noinfo');
				windDirection.icon = this._convertWeatherIcon(''); //default icon
			}
			windDirection.link = this.weatherPortal;
			
			this._setWindDirection(windDirection);
			return this.windDirection;
				
		},
		
		_mountWindSpeedObject : function () {
		
			var windSpeed = {};
			windSpeed.unit = '';
			
			if(this.weatherData.curweather.observation){
				windSpeed.data = this.weatherData.curweather.observation.imperial.wspd;
				windSpeed.location = this.localize('uitext', 'mxapibase', 'WindSpeed');
				windSpeed.icon = 'av:fast-forward'; //also static
				windSpeed.unit = this.localize('uitext', 'mxapibase', 'MPH');
			}else{
				windSpeed.data = '-';
				windSpeed.location = this.localize('uitext', 'mxapibase', 'Noinfo');
				windSpeed.icon = this._convertWeatherIcon(''); //also static
			}
			windSpeed.link = this.weatherPortal;
			
			this._setWindSpeed(windSpeed);
			return this.windSpeed;
		},
		
		_mountTemperatureObject : function () {
			
			var temperature = {};
				
			if(this.weatherData.curweather.observation){
				temperature.data = this.weatherData.curweather.observation.imperial.temp;
				temperature.unit = '\u00b0' + this._convertWeatherUnit(this.weatherData.curweather.metadata.units);
				temperature.label = this.weatherData.curweather.observation.phrase_32char;
				temperature.icon = this._convertWeatherIcon(this.weatherData.curweather.observation.icon_code); //also static
			}else{
				temperature.data = '-';
				temperature.unit = '';
				temperature.label = this.localize('uitext', 'mxapibase', 'Noinfo');
				temperature.icon = this._convertWeatherIcon(''); //also static
			}
			if($M.userInfo.city && $M.userInfo.stateprovince){
				temperature.location = $M.userInfo.city + ', ' + $M.userInfo.stateprovince;	
			} else {
				temperature.location = this.localize('uitext', 'mxapibase', 'CityandorStatewasnotprovided');
			}
			
			temperature.link = this.weatherPortal;
			
			this._setTemperature(temperature);
			return this.temperature;
				
		},
		
		_mountHumidityObject : function () {
		
			var humidity = {};
			
			humidity.location = this.localize('uitext', 'mxapibase', 'Humidity');
			if(this.weatherData.curweather.observation){
				humidity.data = this.weatherData.curweather.observation.imperial.rh;
				humidity.unit = '\u0025';
				humidity.icon = 'image:grain'; //also static
				humidity.location = this.localize('uitext', 'mxapibase', 'Humidity');
			}else{
				humidity.data = '-';
				humidity.unit = '';
				humidity.icon = this._convertWeatherIcon(''); //also static
				humidity.location = this.localize('uitext', 'mxapibase', 'Noinfo');
			}
			humidity.link = this.weatherPortal;
			
			this._setHumidity(humidity);
			return this.humidity;
		},
		
		_weatherObjectBuilder : function (/*String*/objectName) {
			
			var object;
			
			switch(objectName.toLowerCase()) {
				case 'windspeed':
					object = this._mountWindSpeedObject();
					break;
				case 'winddirection':
					object = this._mountWindDirectionObject();
					break;
				case 'temperature':
					object = this._mountTemperatureObject();
					break;
				case 'humidity':
					object = this._mountHumidityObject();
					break;
				default:
					console.warn(objectName + ' is not a valid option.');
			
			}
			return object;
		},
		
	    refreshcurrent: function()
	    {
	    	if(this.resourceUri){
	    		this.$.userweathercollection.loadRecord();
			}
	    },
		
		
	});
