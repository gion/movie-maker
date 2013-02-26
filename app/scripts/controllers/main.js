'use strict';

movieMakerApp.controller('MainCtrl', ['$scope', 'config', 'util', '$http' ,'$timeout', '$window', '$timeline',
function($scope, config, util, $http, $timeout, $window, $timeline) {
	var $ = angular.element;
	
	$scope.loaded = true;

/*	$(window).load(function(){
		util.$safeApply($scope, function(){
			scope.loaded = true;
		});
	});*/

	
	
	$scope.keyDown = function(){
		console.log(arguments);
	};
	$scope.$watch('progress', function(){
	//	console.log('progress changed');
	});

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
		if($scope.VisualTimeline.timeline.paused())
			$scope.VisualTimeline.timeline.play();
		else
			{
				$scope.VisualTimeline.timeline.pause();
				$scope.VisualTimeline.tweens.forEach(function(el, i){
					if(el.tween._active)
						el.onPause();
				});
			}
	}

	$scope.changeProgress = function($event){
		var paused = $scope.VisualTimeline.timeline.paused();
		
		$scope.VisualTimeline.timeline.pause();

		$scope.VisualTimeline.timeline.progress(($event.pageX - angular.element('#timelines').offset().left) / config.timelineWidth);
		
		if(!paused)
			$scope.VisualTimeline.timeline.play();
	}

	$scope.updateTooltip = function($event){
		var left = ($event.pageX - angular.element('#timelines').offset().left) / config.timelineWidth * 100,
			title = left * $scope.VisualTimeline.timeline.totalDuration() / 100;
	
		util.$safeApply($scope, function(){
			$scope.tooltip.title = title.toFixed(2) + 's';
			$scope.tooltip.left = left + '%';
		});
	}

	var timeline = {
		currentTime : 0
	};

	var timeTracker = angular.element('#timeTracker');


/*
	$scope.$watch('timelines', function(newVal, oldVal){
		
		console.log(arguments, !!newVal, !!newVal.audio, !!newVal.music, !!newVal.visual);
		if(!!newVal && newVal.audio && newVal.visual && newVal.music && !util.isTheSameObj(newVal.visual, oldVal.visual))
			{
				initTimeline();
			}
		console.log('timelines changed');
	});*/

	var initTimeline = function initTimeline(){
		console.log('init timeline');
		var items = $scope.timelines.visual.concat($scope.timelines.audio).concat($scope.timelines.music);


		$window.T = $scope.VisualTimeline = new $timeline.track(items);
		

		$scope.VisualTimeline.onUpdate = function(){
			//timeTracker.css('left', $scope.VisualTimeline.timeline.progress() * 100 + '%');
			

			util.$safeApply($scope, function(){

				angular.forEach($scope.VisualTimeline.timeline.getChildren(), function(el, i){
					el.owner.activate(el._active);
				});
				
				$scope.progress = $scope.VisualTimeline.timeline.progress() * 100;

			});
		}
	}

	$http.get(config.demoUrl).success(function(data){
		$scope.timelines = data;	
		initTimeline();
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

}]);
