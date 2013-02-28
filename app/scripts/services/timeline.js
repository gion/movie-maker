'use strict';

movieMakerApp.factory('$timeline' ,['$window', 'config', 'util', function($window, config, util) {

var $ = angular.element;

	function Timeline(elements, outputSelector){
		this.elements = elements || {};
		this.tweens = [];
		this.timeline = null;
		this.output = $(outputSelector);

		if(!!this.elements)
			this.updateElements();
	}
	
	Timeline.getType = function(el){
		return el.type == 'image' ? 'video' : el.type;
	};

	Timeline.prototype = {
	/*	getElementsByType : function(t){
			return $.grep(this.elements, function(el ,i){
				return Timeline.getType(el) == t;
			});
		},*/
		updateElements : function(keepProgress){
			if(this.timeline)
				{
					var p = this.timeline.progress();
					this.timeline.kill();
					this.timeline.clear();
					this.timeline = null;
				}
			if(this.tweens.length)
				this.tweens = [];


			this
				.setupTweens()
				.setupTimeline()
				.setupTimelineOutput();

			if(keepProgress && p)
				this.timeline.progress(p);

			console.log('new duration is : ' + this.getDuration());

			return this;
		},

		setupTweens : function(){
			var tweens = this.tweens = [],
				totalDuration;

			angular.forEach(this.elements, function(arr, type){
				console.log('=============> ', type);
				totalDuration = 0;
				angular.forEach(arr, function(el, i){
					console.log('===> ', el.name);

					el.originalDelay =  el.delay;
					el._delay =  el.delay;

					if(type == 'audio')
						{
							totalDuration = $window.Math.max(totalDuration, el.delay + el.duration);
						}
					else
						{
							el._delay += totalDuration;
							totalDuration += el.duration;
						}

				//	el._tween = el._tween || ItemFactory(el);
					el._tween = ItemFactory(el);

					tweens.push(el._tween);
				});
			});
			return this;
		},

		setupTimeline : function(){
			var self = this;
			this.timeline = /*this.timeline || */new util.tween.timelineMax({
				progress : 100,
				onUpdate : function(){
					self.onUpdate();
				},

				// settings
				paused : true
		//		smoothChildTiming : true,
			});

			this.timeline.clear();

			this.timeline.insertMultiple(
				$.map(this.tweens, function(el, i){
					return el.tween;
				})
			);

			return this;
		},

		setupTimelineOutput : function(){
			this.output.empty();
			var o = this.output;
			
			angular.forEach(this.tweens, function(el, i){
				if(!el.output)
					return;
				var lastChild = o.children().first();
				if(lastChild.length == 0)
					el.output.appendTo(o);
				else
					el.output.insertBefore(lastChild);
			});

			var totalDuration = this.getDuration();

			console.log('timeline setup', totalDuration);


			angular.forEach(this.elements, function(arr, type){
				angular.forEach(arr, function(el, i){
					el.cssWidth = el.duration * 100 / totalDuration;
					var left = el.originalDelay * 100 / totalDuration;

					if(el.type == 'audio')
						{
							el.cssLeft = left;
							el.cssMarginLeft = 0;
						}
					else if(el.type == 'music')
						{
							el.cssLeft = 0;
							el.cssMarginLeft = 0;
							el.cssWidth = 100;
						}
					else
						{
							el.cssLeft = 0;
							//el.cssMarginLeft = left;
						}
				});
			});


			return this;
		},

		_getDuration : function(){
			return this.timeline ? this.timeline.duration() : 0;
		},

		getTrackDuration : function(track){
			var total = 0,
				d = 0;

			
			angular.forEach(this.elements[track], function(el, i){
				d = el.duration + el.delay;
				if(track == 'visual')
					total += d;
				else
					total = $window.Math.max(total, d);
			});

			return total;
		},

		getDuration : function(){
		//	return 60;
			return $window.Math.max(this.getTrackDuration('audio'), this.getTrackDuration('visual'));
		},

		getElementsAt : function(percent){
			var elements = [],
				duration = this.getDuration(),
				targetedDuration = percent * duration / 100,
				currentDuration = 0;

			this.elements.forEach(function(el, i){
				if(currentDuration <= targetedDuration)
					elements.push(el);
				currentDuration += (el.duration || 0) + (el.delay || 0);
			});

			return elements;
		},

		addElement : function(el){
			this.elements.push(el);
			this.timeline.totalDuration(this.getDuration());
		},

		removeElement : function(el){
			this.elements.splice(this.elements.idnexOf(el), 1);
			this.timeline.totalDuration(this.getDuration());
		},

		setProgress : function(x){
			this.tweenlite.progress(x);
		},

		onUpdate : function(){

		}
	};




	// Item base class
	function Item(data){
		this.data = data;
		this.tween = null;
		this.output = null;
		this.progress = 0;

		if(!arguments.length)
			return this;

		this.initTween();
	}

	Item.prototype = {
		constructor : Item,
		initTween : function(){
			var self = this;
			console.log(this.data.duration);
			this.tween = util.tween.tweenMax.to(this, this.data.duration,{
				progress : 100,
				delay : this.data._delay || 0,
			//	paused : true,
				onInit : function(){
					console.log('init');
					self.onInit();
				},
				onStart : function(){
					console.log('start');
					self.onStart();
				},
				onUpdate : function(){
			//		console.log('update');
					self.onUpdate();
				},
				onComplete : function(){
					console.log('complete');
					self.onComplete();
				}
			});

			this.tween.owner = this;
		},
		initOutputElement : function(){},
		onStart : function(){},
		onUpdate : function(){},
		onComplete : function(){},
		onInit : function(){},
		activate : function(active){
			this.data.active = !!active;
		}
	};



	// ImageItem base class
	function ImageItem(){
		Item.apply(this, arguments);

		if(!arguments.length)
			return this;

		this.initOutputElement();
	}
	ImageItem.prototype = new Item();

	angular.extend(ImageItem.prototype, {
		constructor : ImageItem,
		initOutputElement : function(){
			this.output = $('<img src="'+ this.data.source +'" alt="" class="item image-item" />');
		},
		onStart : function(){
			this.output.addClass('active');
		},
		onUpdate : function(){
			// for eg, you can do something with this.progress
		},
		onPause : function(){
		},
		onComplete : function(){
			this.output.removeClass('active');
		},

		activate : function(active){
			Item.prototype.activate.apply(this, arguments);
			this.output.toggleClass('active', !!active);
		}
	});


	// VideoItem base class
	function VideoItem () {
		this.ctx = null;
		this.vid = null;
		ImageItem.apply(this, arguments);
		if(!arguments.length)
			return this;
	}
	VideoItem.prototype = new ImageItem();

	angular.extend(VideoItem.prototype, {
		constructor : VideoItem,
		initOutputElement : function(){
			this.vid = util.createVideoElement(this.data);

			this.output = angular.element('<canvas class="item image-video" width="'+ config.screenWidth +'" height="'+config.screenHeight+'"/>');
			this.ctx = this.output.get(0).getContext('2d');
		},
		onStart : function(){
			this.vid.currentTime = 0;
			this.onUpdate();
		},
		onUpdate : function(){
			//console.log(this.tween.paused(), this.vid.paused);
			if(this.tween.timeline.paused())
				{
					this.vid.pause()
				}
			else if(this.vid.paused)
				this.vid.play();

			// this.ctx.drawImage(this.vid, 0, 0, this.vid.videoWidth, this.vid.videoHeight, 0, 0, config.screenWidth, config.screenHeight);
			this.ctx.drawImage(this.vid, 0, 0, config.screenWidth, config.screenHeight);
		},
		onPause : function(){
			this.vid.pause();
			this.vid.currentTime = this.tween.time();
		},
		onComplete : function(){
			this.vid.pause();
		}
	});	

	// VideoItem base class
	function AudioItem () {
		this.audio = null;
		Item.apply(this, arguments);
		if(!arguments.length)
			return this;
		this.initOutputElement();
	}
	AudioItem.prototype = new Item();

	angular.extend(AudioItem.prototype, {
		constructor : AudioItem,
		initOutputElement : function(){
			this.audio = util.createAudioElement(this.data);
		},
		onStart : function(){
			this.audio.seek(0);
			this.onUpdate();
		},
		onUpdate : function(){
			if(this.tween.timeline.paused())
				{
					this.audio.pause();
				}
			else if(!this.audio.playing)
				{
					this.audio.currentTime = this.tween.time();
					this.audio.play();
				}
		},
		onPause : function(){
			this.audio.pause();
			this.audio.currentTime = this.tween.time();
		},
		onComplete : function(){
			this.audio.pause();
		}
	});	

	// Visual Item factory
	function ItemFactory(data){
	//	console.log('visual item', data);
		return data.type == 'video' 
					? new VideoItem(data)
					: data.type == 'image'
						? new ImageItem(data)
						: data.type == 'audio' || data.type == 'music'
							? new AudioItem(data)
							: null; 
	}
	

	var timeline = {
		track : Timeline,
		item : Item,
		imageItem : ImageItem,
		videoItem : VideoItem,
		audioItem : AudioItem,
		factory : ItemFactory
	};

	return timeline;

}]);
