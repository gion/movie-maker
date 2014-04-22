"use strict";

angular.module('movieMakerApp').filter('pagination', function() {
	return function(input, currentPage, itemPerPage, pagedItems) {
		itemPerPage = itemPerPage;
		var start = currentPage * itemPerPage,
			end = start + itemPerPage;
		for (var i=start; i < end; i++)
			if(pagedItems[i]){
				input.push(pagedItems[i]);
			}else{
				return input;
			}
		return input;
	};
});
