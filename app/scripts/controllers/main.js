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

	$scope.changeProgress = function($event){
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


	$scope.currentPage = 0;
	$scope.itemPerPage = 3;
	$scope.allPages = [];
	$scope.subpanes = [
		{
			title : "Videos",
			active : true,
			type : "video"
		},
		{
			title : "Images",
			active : false,
			type : "image"
		},
		{
			title : "Titles",
			active : false,
			type : "title"
		}
	];
	


    $scope.prevPage = function () {
        if ($scope.currentPage > 0) {
            $scope.currentPage--;
        }
    };
    
    $scope.nextPage = function () {
        if ($scope.currentPage < $scope.allPages.length - 1) {
            $scope.currentPage++;
        }
    };
    
    $scope.setPage = function () {
    	$scope.currentPage = this.$index;
    };


	$http.get(config.tabsUrl).success(function(data){
		$scope.panes = data;
		$scope.selectTab(data[0]);
	});

	$scope.selectTab = function(pane){

		angular.forEach($scope.panes, function(val, key){
			val.active = false;
		});
		pane.active = true;

		$scope.subtype = pane.subtab ? "video" : "";
		$scope.currentPage = 0;
		$scope.pagedItems = pane.content;
		$scope.totalItems = $scope.pagedItems.length;
		$scope.allPages = new Array(parseInt($scope.totalItems / $scope.itemPerPage) + ($scope.totalItems % $scope.itemPerPage > 0 ? 1 : 0));
		if($scope.subtype)
			$scope.selectSubTab($scope.subpanes[0]);
	}

	$scope.selectSubTab = function(subpane){

		angular.forEach($scope.subpanes, function(val, key){
			val.active = false;
		});
		subpane.active = true;
		$scope.subtype = subpane.type;

		$scope.currentPage = 0;
		$scope.pagedItems = [];
		angular.forEach($scope.panes[0].content, function(val, key){
			if(val.type==subpane.type){
				$scope.pagedItems.push(val);
			}
		});

		$scope.totalItems = $scope.pagedItems.length;
		$scope.allPages = new Array(parseInt($scope.totalItems / $scope.itemPerPage) + ($scope.totalItems % $scope.itemPerPage > 0 ? 1 : 0));
	}

<<<<<<< HEAD
}]);
=======


	$scope.sortTracks = function(a, b) {alert(4);
		console.log(arguments);
		return 0;
	};



	$scope.onDrop = function(options){
		window.O = options;
		if(!options.item)
			return;

		var s = $(options.event.target).scope();
		s.tracks.elements[s.name].push(options.item);
	}

	$scope.removeItemFromTrack = function(e){
		e.preventDefault();
		e.stopPropagation();
		var el = $(e.target),
			scopeName = el.scope().name,
			i = el.closest('li').index();

		//util.$safeApply($scope, function(){
			$scope.tracks.elements[scopeName].splice(i, 1);
			$scope.tracks.updateElements(true);
		//});
	}

}]);
>>>>>>> af1a9dcebf1ea508912d8efdcef1c5fb073280ce
