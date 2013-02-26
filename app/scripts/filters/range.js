"use strict";

movieMakerApp.filter('range', function() {
	return function(input, total) {
		total = parseInt(total) || 0;
		for (var i=0; i<total; i++)
			input.push(i);
		return input;
	};
});