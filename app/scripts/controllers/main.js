'use strict';

movieMakerApp.controller('MainCtrl', ['$scope', 'config', 'util', '$http' ,'$timeout', '$window', '$timeline',
function($scope, config, util, $http, $timeout, $window, $timeline) {
	var $ = angular.element,
		$tracksContainer = $('#timelines'),
		$timeTracker = $('#timeTracker'),
		timeline = {
			currentTime : 0
		};

	
	$scope.loaded = true;

	
	
	$scope.keyDown = function(){
		console.log(arguments);
	};

	$scope.screen = {
		width : config.screenWidth,
		height : config.screenHeight
	};
	$scope.tooltip = {
		title: "0.00s",
		left : 0
	};
	$scope.timelineWidth = config.timelineWidth;
	$scope.stopped = true;
	$scope.shouldStop = true;

	$scope.togglePlayState = function(){
		if($scope.tracks.timeline.paused())
			{
				$scope.tracks.timeline.play();
			}
		else
		if(!$scope.tracks.timeline._active && $scope.tracks.timeline.progress() == 1)
			{
				$scope.tracks.timeline.pause();
				$scope.tracks.timeline.progress(0);
				$scope.tracks.timeline.play();
			}
		else
			{
				$scope.tracks.timeline.pause();
				$scope.tracks.tweens.forEach(function(el, i){
					if(el.tween._active)
						el.onPause();
				});
			}
	}

	$scope.changeProgress = function(obj){
		if($.isArray(obj))
			{
				var $event = obj[0],
					el = obj[1];
			}
		else
			$event = obj;

		var paused = $scope.tracks.timeline.paused();
		
		$scope.tracks.timeline.pause();

		$scope.tracks.timeline.progress(($event.pageX - $tracksContainer.offset().left) / config.timelineWidth);
		
		if(!paused)
			$scope.tracks.timeline.play();
	}

	$scope.updateTooltip = function($event){
		if(!$scope.tracks || !$scope.tracks.timeline)
			return;

		var left = ($event.pageX - $tracksContainer.offset().left) / config.timelineWidth * 100,
			title = left * $scope.tracks.timeline.totalDuration() / 100;
	
		util.$safeApply($scope, function(){
			$scope.tooltip.title = title.toFixed(2) + 's';
			$scope.tooltip.left = left + '%';
		});
	}



function initTimeline(){
	$window.T = $scope.tracks = new $timeline.track($scope.timelines, '#screen');

	$scope.tracks.onUpdate = function(){
		//timeTracker.css('left', $scope.tracks.timeline.progress() * 100 + '%');
		

		util.$safeApply($scope, function(){

			angular.forEach($scope.tracks.timeline.getChildren(), function(el, i){
				el.owner.activate(el._active);
			});
			
			$scope.progress = $scope.tracks.timeline.progress() * 100;

		});
	}
}




	$http.get(config.demoUrl).success(function(data){
		$scope.timelines = data;	
		
		initTimeline();

		angular.forEach($scope.tracks.elements, function(track, i){
			$scope.$watch(function(){
				return $.map(track, function(el){ if(el) return el.name; return '';}).join('|');
			}, function(newVal, oldVal){
					
					if(!!newVal && $scope.tracks)
						{
							console.log('timelines changed',arguments);
							util.$safeApply($scope, function(){
								$scope.tracks.updateElements(true);
							});
						}
				});
			});
		});


	$scope.progress = 0;

	$http.get(config.tabsUrl).success(function(data){

		$scope.panes = data;	
	});
	/*$scope.panes = [
		{
			title:"Dynamic Title 1", 
			content:"Dynamic content 1",
			active : true 
		},
		{ 
			title:"Dynamic Title 2", 
			content:"Dynamic content 2",
			active : false
		}
	];*/

	$scope.selectTab = function(pane){

		angular.forEach($scope.panes, function(val, key){
			val.active = false;
		});

		pane.active = true;
	}



	$scope.sortTracks = function(a, b) {alert(4);
		console.log(arguments);
		return 0;
	};



	$scope.onDrop = function(options){
		window.O = options;
		if(!options.item)
			return;

		var el = $(options.event.target),
			name = el.data('trackType');
		$scope.tracks.elements[name].push(options.item);
	}

	$scope.removeItemFromTrack = function(e){
		e.preventDefault();
		e.stopPropagation();
		var el = $(e.target),
			scopeName = el.closest('ul').data('trackType'),
			i = el.closest('li').index();
		//util.$safeApply($scope, function(){
			$scope.tracks.elements[scopeName].splice(i, 1);
			$scope.tracks.updateElements(true);
		//});
	}


	$scope.moveAudioItem = function(obj){
		var self = this,
			e = obj[0],
			el = obj[1],
			originalLeft = obj[2],
			scopeName = el.closest('ul').data('trackType'),
			i = el.index(),
			originalDelay = parseFloat(originalLeft.el.replace('%','')) * 100 / config.timelineWidth,
			item = $scope.tracks.elements[scopeName][i],
			movementPercent = (e.pageX - originalLeft.event) * 100 / config.timelineWidth,
			percent = originalDelay + movementPercent,
			delay = percent * $scope.tracks.timeline.totalDuration() / 100;

			
			this.throttledUpdateElements = this.throttledUpdateElements || _.throttle(function(){
			//	console.error('yeah', delay);
				$scope.tracks.updateElements();
			}, 1000);

			util.$safeApply($scope,function(){
			//	console.log(movementPercent,percent + '%', delay);
				item.cssLeft = percent;
				item.delay = delay;
				self.throttledUpdateElements();
			});

	}

}]);
