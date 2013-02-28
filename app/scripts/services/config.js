'use strict';

movieMakerApp.factory('config' ,function() {

	var config = {
		demoUrl : 'data/demo.json',
		tabsUrl : 'data/items.json',
		fps : 60,
		screenWidth : 400,
		screenHeight : 300,
		timelineWidth : 800,
		audio5js : {
			swf_path : 'components/audio5js.swf'
		}
	};


	return config;
	
});
