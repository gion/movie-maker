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
			
		getExtentsion : function(f){
			return f.replace(/^.*\.([^.]{2,10}$)/,'$1'); 
		},
		
		preferredVideoType : 'webm',

		_getSource : function(mediaObject, sources, setPreferredType){
			if(mediaObject.canPlayType)
				{
					angular.forEach(sources, function(el, i){
						el.canPlay = el.type ? mediaObject.canPlayType(el.type) : "";
						el.extension = util.getExtentsion(el.src);
					});

					sources = sources.sort(function(el1, el2){
						var b = el2.canPlay,
							a = el1.canPlay;

						if(el1.extenstion == 'mp3') return 1;
						if(el2.extenstion == 'mp3') return -1;
							
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

			if(setPreferredType)
				angular.forEach(sources, function(el, i){
					if(el.extension != 'ogg' && el.extension != 'ogv' && el.canPlay)
						util.preferredVideoType = el.extension;
				});

			// if it's an audio, remove the mp3 from the list
			if(/audio/i.test(mediaObject.constructor.toString()))
				{
					sources = $window.$.grep(sources, function(el){
						return el.extension != 'mp3' && el.extension != 'wav';
					});
				}
	//		console.log(sources);
			window.sources = sources;
			return sources[sources.length-1];
		},

		createVideoElement : function(videoObject){
			this.cache = this.cache || {};
			if(!this.cache[videoObject.id])
				{
					var v = angular.element('<video/>'),
						source = this._getSource(v.get(0),videoObject.source, true);

					v
						.attr('preload', 'auto')
						.attr('autobuffer', '')
						.attr('src', source.src);

					if(source.type)
						v.attr('type', source.type);
					this.cache[videoObject.id] =  v;
	//				console.log('create video', v);
				}
			else
				{
	//				console.log('return cached video', this.cache[videoObject.id]);
				}

			return this.cache[videoObject.id].get(0);
		},

		createAudioElement : function(audioObject){

			
			this.cache = this.cache || {};

			if(!this.cache[audioObject.id])
				{
					var $a = angular.element('<audio/>'),
						a = $a.get(0),
						source = this._getSource(a, audioObject.source);
					a.autoplay = false;
					a.src = source.src;
					this.cache[audioObject.id] = a;
			
				}
			else
				{
	//				console.log('return cached audio', this.cache[audioObject.id]);
				}

			return this.cache[audioObject.id];
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
		},

		isTheSameObj : function(a, b){
			return !!a?JSON.stringify(a):null == !!b?JSON.stringify(b):null;
		},

		isIpad : function(){
			return /iPad/i.test($window.navigator.userAgent);
		}
	};


	return util;
}]);
