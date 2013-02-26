'use strict';

movieMakerApp.factory('config' ,function() {

	var config = {
		demoUrl : 'data/demo.json',
		tabsUrl : 'data/tabs.json',
		fps : 60,
		screenWidth : 400,
		screenHeight : 300,
		timelineWidth : 800
	};


	return config;
	
});
