'use strict';

movieMakerApp.factory('AudioService', ['config', function (config) {

		return new Audio5js(angular.extend({
			swf_path:'../../swf/audio5js.swf',
			throw_errors:true,
			format_time:true,
			ready:function () {

			}
		}, config.audio5js));
}]);