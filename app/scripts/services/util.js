'use strict';

movieMakerApp.factory('util' ,['$window', 'config', function($window, config) {
	var util = {
		tween : {
			tweenLite : $window.TweenLite,
			tweenMax : $window.TweenMax,
			tweenPlugin : $window.TweenPlugin,
			timelineLite : $window.TimelineLite,
			timelineMax : $window.TimelineMax
		},

		_getSource : function(mediaObject, sources){
			if(mediaObject.canPlayType)
				{
					angular.forEach(sources, function(el, i){
						el.canPlay = el.type ? mediaObject.canPlayType(el.type) : "";
					});

					sources = sources.sort(function(el1, el2){
						var b = el1.canPlay,
							a = el2.canPlay;

						if(a == 'yes')
							return 1;
						if(b == 'yes')
							return -1;
						if(a == 'no' || a == '')
							return -1;
						if(b == 'no' || b == '')
							return 1;
						if(a=='maybe')
							return 1;
						if(b=='maybe')
							return -1;
						return 0;
					});
				}
			return sources[0];
		},

		createVideoElement : function(videoObject){
			var v = angular.element('<video/>'),
				source = this._getSource(v.get(0),videoObject.source);

			v
				.attr('preload', 'auto')
				.attr('autobuffer', '')
				.attr('src', source.src);

			if(source.type)
				v.attr('type', source.type);

			console.log('create video', v);

			return v.get(0);
		},

		createAudioElement : function(audioObject){
			var a = new Audio(),
				source = this._getSource(a, audioObject.source);

			a.src = source.src;

			console.log('new audio element', a);
			return a;
		},

		getVideoDetails : function(videoObject){

		},

		getTimelineWidth : function(timeline){
			var w = 0;



			return w;
		},

		'$safeApply' : function($scope, fn) {
			fn = fn || function() {};
			if($scope.$$phase) {
			//don't worry, the value gets set and AngularJS picks up on it...
				fn();
			}
			else {
			//this will fire to tell angularjs to notice that a change has happened
			//if it is outside of it's own behaviour...
				$scope.$apply(fn); 
			}
		}
	};

	$window.util = util;


	return util;
}]);
