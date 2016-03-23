"use strict";
var Wunderground = require('wundergroundnode');
var Service, Characteristic;

var temperatureService;
// var observationtimeService;
// var weatherService;
// var windstringService;
var humidityService;

module.exports = function (homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    homebridge.registerAccessory("homebridge-wunderground", "WUNDERGROUND", WUTemphum);
}

function WUTemphum(log, config) {
    this.log = log;
    this.wunderground = new Wunderground(config['key']);
    this.name = config['name'];
    this.city = config['city'];
    this.timestampOfLastUpdate = 0;
}

WUTemphum.prototype = {

//    getStateObservationtime: function(callback){    
//	callback(null, this.observationtime);
//    },

//    getStateWeather: function(callback){    
//	callback(null, this.weather);
//    },

//    getStateWindstring: function(callback){    
//	callback(null, this.windstring);
//    },

    getStateHumidity: function(callback){    
	callback(null, this.humidity);
    },

    getState: function (callback) {
	// Only fetch new data once per minute
	var that = this;
	if (this.timestampOfLastUpdate + 60 < (Date.now() / 1000 | 0))
	{
	    that.wunderground.conditions().request(that.city, function(err, response){
		that.timestampOfLastUpdate = Date.now() / 1000 | 0;
		that.log('Successfully fetched weather data from wunderground.com');
    		that.temperature = response['current_observation']['temp_c'];
    		that.observationtime = response['current_observation']['observation_time'];
    		that.weather = response['current_observation']['weather'];
    		that.windstring = response['current_observation']['wind_string'];
   		that.humidity = parseInt(response['current_observation']['relative_humidity'].substr(0, response['current_observation']['relative_humidity'].length-1));
	    });
	}
	temperatureService.setCharacteristic(Characteristic.CurrentTemperature, this.temperature);
//    	observationtimeService.setCharacteristic(Characteristic.CurrentObservationtime, this.observationtime);
//    	weatherService.setCharacteristic(Characteristic.CurrentWeather, this.weather);
//    	windstringService.setCharacteristic(Characteristic.CurrentWindstring, this.windstring);
    	humidityService.setCharacteristic(Characteristic.CurrentRelativeHumidity, this.humidity);
	callback(null, this.temperature);
    },

    identify: function (callback) {
        this.log("Identify requested!");
        callback(); // success
    },

    getServices: function () {
        var informationService = new Service.AccessoryInformation();

        informationService
                .setCharacteristic(Characteristic.Manufacturer, "HomeBridge")
                .setCharacteristic(Characteristic.Model, "Weather Underground")
                .setCharacteristic(Characteristic.CurrentObservationtime, this.observationtime)
                .setCharacteristic(Characteristic.CurrentWeather, this.weather)
                .setCharacteristic(Characteristic.CurrentWindstring, this.windstring)
                .setCharacteristic(Characteristic.SerialNumber, this.city);

        temperatureService = new Service.TemperatureSensor(this.name);
        temperatureService
                .getCharacteristic(Characteristic.CurrentTemperature)
                .on('get', this.getState.bind(this));

        temperatureService
                .getCharacteristic(Characteristic.CurrentTemperature)
                .setProps({minValue: -50});
        
        temperatureService
                .getCharacteristic(Characteristic.CurrentTemperature)
                .setProps({maxValue: 50});

//        observationtimeService = new Service.ObservationtimeSensor(this.name);
//        observationtimeService
//                .getCharacteristic(Characteristic.CurrentObservationtime)
//                .on('get', this.getStateObservationtime.bind(this));

//        weatherService = new Service.WeatherSensor(this.name);
//        weatherService
//                .getCharacteristic(Characteristic.CurrentWeather)
//                .on('get', this.getStateWeather.bind(this));

//        windstringService = new Service.WindstringSensor(this.name);
//        windstringService
//                .getCharacteristic(Characteristic.CurrentWindstring)
//                .on('get', this.getStateWindstring.bind(this));

        humidityService = new Service.HumiditySensor(this.name);
        humidityService
                .getCharacteristic(Characteristic.CurrentRelativeHumidity)
                .on('get', this.getStateHumidity.bind(this));

        return [informationService, temperatureService, humidityService];

	return this.services;
    }
};

if (!Date.now) {
    Date.now = function() { return new Date().getTime(); }
}
