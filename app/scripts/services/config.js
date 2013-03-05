'use strict';

movieMakerApp.factory('config' ,function() {

	var config = {
		demoUrl : 'data/demo.json',
		tabsUrl : 'data/items.json',
		downloadUrl : 'http://projects-directory.com:8080/video_merger/index.php?do=merge_remote',
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
