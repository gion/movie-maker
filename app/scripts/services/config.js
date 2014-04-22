'use strict';

angular.module('movieMakerApp').factory('config' ,function() {

	var config = {
		demoUrl : 'data/demo.json',
		tabsUrl : 'data/items.json',
		downloadUrl : '/api/v1/save-movie',
		fps : 60,
		screenWidth : 400,
		screenHeight : 300,
		timelineWidth : 800,
		audio5js : {
			swf_path : 'components/audio5js.swf'
		},
		neededItemAttributes : 'id name type thumb source fallback delay duration'.split(' ')
	};

	return config;

});
