'use strict';

movieMakerApp.controller('MainCtrl', ['$scope', 'config', 'util', '$http' ,'$timeout', '$window', '$timeline',
function($scope, config, util, $http, $timeout, $window, $timeline) {

	var $ = angular.element,
		$tracksContainer = $('#timelines'),
		$timeTracker = $('#timeTracker'),
		timeline = {
			currentTime : 0
		};

	
	$scope.isTablet = util.isIpad();
	$scope.loaded = true;

	
	
	$scope.keyDown = function(){
//		console.log(arguments);
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


	$scope.projectorClickHandler = function($event){
		if(!$scope.isTablet)
			$scope.togglePlayState();
		else
			{
				var $v = $('#projector video');
				if($v.length == 0)
					$scope.downloadMovie();
			}
	}

	$scope.togglePlayState = function(){

		if(!$scope.tracks.ready)
			return;

		console.log('togglePlay state');

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
					if((el.tween && el.tween._active) || ((el._tween && el._tween._active)))
						el.onPause();
				});
			}
	}

	$scope.changeProgress = function(obj){

		if(!$scope.tracks.ready)
			return;


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
		if(!$scope.tracks || !$scope.tracks.timeline || !$scope.tracks.ready)
			return;

		var left = ($event.pageX - $tracksContainer.offset().left) / config.timelineWidth * 100,
			title = left * $scope.tracks.timeline.totalDuration() / 100;
	
		util.$safeApply($scope, function(){
			$scope.tooltip.title = title.toFixed(2) + 's';
			$scope.tooltip.left = left + '%';
		});
	}



function initTimeline(){
	$window.T = $scope.tracks = new $timeline.track($scope.timelines, '#screen', function(){
		util.$safeApply($scope, function(){
			$scope.tracks.ready = true;
		});
	});

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
					//		console.log('timelines changed',arguments);
							util.$safeApply($scope, function(){
								$scope.tracks.updateElements(true);
							});
						}
				});
			});
		});


	$scope.progress = 0;


	$scope.currentPage = 0;
	$scope.itemPerPage = 6;
	$scope.allPages = [];
	$scope.visiblePagination = false;
	$scope.allSubpanes = [];	


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

		/*$window._audios = [];
		$window._videos = [];

		angular.forEach(data, function(track, i){
			console.log(arguments);
			angular.forEach(track.content, function(el, j){
				console.log('+', arguments);
				if(el.type == 'video')
					$window._videos.push(util.createVideoElement(el));
				else if(el.type == 'audio' || el.type == 'music')
					$window._audios.push(util.createAudioElement(el));

			});
		});*/
	});

	$scope.selectTab = function(pane){

		angular.forEach($scope.panes, function(val, key){
			val.active = false;
		});
		pane.active = true;

		$scope.subpanes = [];
		$scope.allSubpanes = [];

		angular.forEach(pane.content, function(val, key){
			if($.inArray(val.type, $scope.allSubpanes) < 0){
				$scope.allSubpanes.push(val.type);
				$scope.subpanes.push({
					title : val.type,
					type : val.type,
					active : false
				});
			}
		});

		$scope.subtype = pane.subtab ? "video" : "";
		$scope.currentPage = 0;
		$scope.pagedItems = pane.content;
		$scope.totalItems = $scope.pagedItems.length;
		$scope.allPages = new Array(parseInt($scope.totalItems / $scope.itemPerPage) + ($scope.totalItems % $scope.itemPerPage > 0 ? 1 : 0));
		$scope.visiblePagination = $scope.allPages.length > 1 ? true : false;
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
		$scope.visiblePagination = $scope.allPages.length > 1 ? true : false;
	};


	$scope.sortTracks = function(a, b) {alert(4);
	//	console.log(arguments);
		return 0;
	};

	$scope.onDragStart = function(options){
	/*	if()
		util.createAudioElement(options.item);*/
	}

	$scope.onDrop = function(options){
	//	console.warn('drop', arguments);
		window.O = options;
		if(!options.item)
			return;

		var el = $(options.event.target),
			name = el.data('trackType'),
			item = angular.extend({}, options.item);

		if(!$scope.tracks.elements[name])
			$scope.tracks.elements[name] = [];


		// if it's an audio, place it exactly where it's dropped
		// => change it's delay	
		if(item.type == 'audio')
			{
				var left = options.event.pageX - $(options.scope).offset().left,
					leftPercent = left * 100 / config.timelineWidth,
					delay = leftPercent * $scope.tracks.timeline.totalDuration() / 100;

				item.delay = delay;	
				console.log({
					left : left,
					delay : delay,
					leftPercent : leftPercent,
					timelineWidth : config.timelineWidth,
					totalDuration : $scope.tracks.timeline.totalDuration()
				});				
			}

		// if it's a music item, remove the existing music elements in the track
		// because we only need one music item in the music track
		else if(item.type == 'music')
			{
			/*	console.log(item);
				return;*/
				$scope.tracks.elements[name].splice(0, $scope.tracks.elements[name].length);
			}

		$scope.tracks.elements[name].push(item);
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

	//	return;

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
			delay = percent * $scope.tracks.getDuration() / 100;

			
			this.throttledUpdateElements = this.throttledUpdateElements || _.debounce(function(){
			//	console.error('yeah', delay);
				$scope.tracks.updateElements();
			}, 500);

			util.$safeApply($scope,function(){
			//	console.log(movementPercent,percent + '%', delay);
				item.cssLeft = percent;
				item.delay = delay;
				self.throttledUpdateElements();
			});

	}


	$scope.downloadMovie = function($event){

		util.$safeApply($scope, function(){
			$scope.loading = true;
		});

		var preferredType = util.isIpad() ? util.preferredVideoType : 'mp4',
			data = {
				baseUrl : $window.location.href.replace(/#.*$/,''),
				json : JSON.stringify($scope.tracks.getCleanElementsCopy()),
				preferredType : preferredType
			};

		console.log(preferredType);

		if($scope._currentDownload)
			$scope._currentDownload.abort();

		$scope._currentDownload = $.ajax({
				url : config.downloadUrl, 
				data : data,
				dataType : 'json',
				method : 'post'
			})
			.done(function(response){
				$window.R = response;
				var src = response.file;
				$scope.downloadSuccess(src);
			})
			.fail(function(status, response){
				// error
				console.error('download fail', arguments);
			})
			.always(function(){
				util.$safeApply($scope, function(){
					$scope.loading = false;
				});
			});
	}

	$scope.cancelDownload = function($event){
		$event.preventDefault();

		util.$safeApply($scope, function(){
			$scope.loading = false;
		});
		
		if($scope._currentDownload)
			$scope._currentDownload.abort();
	}

	$scope.downloadSuccess = function(src){
		if($scope.isTablet)
			{
				var $v = $('<video />')
							.addClass('response-video')
							.width(config.screenWidth)
							.height(config.screenHeight),
					v = $v.get(0);

				v.width = config.screenWidth;
				v.height = config.screenHeight;
				v.poster = $scope.tracks.elements.visual[0].thumb;
				v.controls = 'controls';
				v.autoplay = true;
				v.src = src;



				$v
					.appendTo($scope.tracks.output)
					.show();
			}
		else
			window.open(src);				

	}	


	$window.util  = util;
	$window.$scope = $scope;
}]);
