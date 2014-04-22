'use strict';

angular.module('movieMakerApp').factory('$timeline' ,['$window', 'config', 'util', function($window, config, util) {

var $ = angular.element;

	function Timeline(elements, outputSelector, onReadyCallback){
		this.elements = elements || {};
		this.tweens = [];
		this.timeline = null;
		this.output = $(outputSelector);
		this.ready = util.isIpad() ? true : false;
		this.onReadyCallback = onReadyCallback;


		if(!!this.elements)
			this.updateElements();
	}

	Timeline.getType = function(el){
		return el.type == 'image' || el.type == 'title' ? 'video' : el.type;
	};

	Timeline.prototype = {
	/*	getElementsByType : function(t){
			return $.grep(this.elements, function(el ,i){
				return Timeline.getType(el) == t;
			});
		},*/
		onReady : function(){
			this.setupTimeline();
			this.ready = true;
	//		console.log('TIMELINE READY');
			if(angular.isFunction(this.onReadyCallback))
				this.onReadyCallback();
		},
		updateElements : $window._.debounce(function(keepProgress){
			if(util.isIpad())
				{
					$('#projector video').remove();
				}

			this.ready = util.isIpad() ? true : false;
			if(this.timeline)
				{
					this.latestDuration = this.timeline.totalDuration();
					var p = this.timeline.progress();
					this.timeline.kill();
					this.timeline.clear();
					this.timeline = null;
				}
			if(this.tweens.length)
				this.tweens = [];

			var t = 0;
			angular.forEach(this.elements.visual, function(el){
				t += el.duration;
			})
			this.elements.music[0].duration = t;

			this
				.setupTweens()
		//		.setupTimeline()
		//		.setupTimelineOutput();


			if(this.timeline)
				{
					if(keepProgress && p)
						this.timeline.progress(p);
				}
	//		console.log('new duration is : ' + this.getDuration());

			return this;
		}, 300),

		checkIfItemsAreReady : function(){
			if(util.isIpad())
				{
					this.onReady();
					return;
				}

			var self = this,
					waitingFor = $.grep(self.tweens, function(el, i){
					return !el.isReady;
				}).length;

	//		console.log('checkIfItemsAreReady', self.tweens.length, waitingFor);

			if(waitingFor == 0)
				self.onReady();

		},

		setupTweens : function(){
			var self = this,
				tweens = this.tweens = [],
				totalDuration;

			angular.forEach(this.elements, function(arr, type){
/*				if(type == 'music')
					return;*/
		//		console.log('=============> ', type);
				totalDuration = 0;
				angular.forEach(arr, function(el, i){
			//		console.log('===> ', el.name);

					el.originalDelay =  el.delay;
					el._delay =  el.delay;

					if(type == 'audio')
						{
							totalDuration = $window.Math.max(totalDuration, el.delay + el.duration);
						}
	/*				else if(type == 'music')
						{
							el._delay = el.delay = 0;
							el.duration = totalDuration;
						}*/
					else
						{
							el._delay += totalDuration;
							totalDuration += el.duration;
							/*if(type == 'music'){
								el.duration = totalDuration;
								console.error(el);
							}*/
						}

				//	el._tween = el._tween || ItemFactory(el);
			/*		var tw = el._tween;
					console.log(tw instanceof Item);
					if(tw instanceof Item)
						{
							tw.ready = true;
							el._tween = tw;
							console.log(tw);
						}
					else*/


				});
			});
			angular.forEach(this.elements, function(arr, type){
			//	if(type != 'music')
				angular.forEach(arr, function(el, i){
					el._tween =  ItemFactory(el, function(){
						self.checkIfItemsAreReady();
					});
					tweens.push(el._tween);
				});
			});


/*			angular.forEach(this.elements.music, function(el, i){
				el.duration = totalDuration || 60;
				el.delay = 0;
				el._tween = ItemFactory(el, onReadyCallback);
				tweens.push(el._tween);
			});*/


			self._totalDuration = totalDuration;


			this.checkIfItemsAreReady();


			return this;
		},

		setupTimeline : function(){
			var self = this;
			this.timeline = /*this.timeline || */new util.tween.timelineMax({
				progress : 100,
				onUpdate : function(){
					self.latestDuration = this.totalDuration();

					self.onUpdate();
				},

				// settings
				paused : true
		//		smoothChildTiming : true,
			});

			this.timeline.parent = this;

			this.timeline.clear();

			this.timeline.insertMultiple(
				$.map(
					$.grep(this.tweens, function(el, i){
						return true;
						return el.data.type != 'music';
					})
					//this.tweens
				, function(el, i){
					if(el.tween)
						el.tween._timeline = self.timeline;
					return el.tween;
				})
			);



			//console.warn("######", totalDuration);
			/*if(this.elements.music && this.elements.music.length)
				{
					var musicEl = this.elements.music[0];
					musicEl.duration = this.timeline.duration();
					musicEl._tween = ItemFactory(musicEl);
					musicEl._tween.isReady = true;
					musicEl._tween.initOutputElement();
					musicEl._tween.initTween();
					musicEl._tween.tween._timeline =  this.timeline;

					var existingTween = $.grep(this.tweens, function(el){
						return el.data.type == 'music';
					})[0];

					if(existingTween)
						{
							this.tweens.splice(this.tweens.indexOf(existingTween), 1, musicEl._tween);
						}
					this.timeline.insert(musicEl._tween.tween);
				}*/


			this.setupTimelineOutput();

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

			var totalDuration = this.getDuration() || this.latestDuration;

	//		console.log('timeline setup', totalDuration);


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

		},

		getCleanElementsCopy : function(){
			var elements = {};
			angular.forEach(angular.extend({}, this.elements), function(arr, type){
				elements[type] = $.map(arr, function(el, i){
					var result = {};
					angular.forEach(config.neededItemAttributes, function(v, j){
						result[v] = el[v];
					});
					return result;
				});
			});
			return elements;
		}
	};




	// Item base class
	function Item(data, onReady){
		this.data = data;
		this.tween = null;
		this.output = null;
		this.progress = 0;
		this.onReady = onReady;
		this.isReady = false;

		if(!arguments.length)
			return this;

		// this.initTween();
	}

	Item.prototype = {
		constructor : Item,
		initTween : function(){
			var self = this;
	//		console.log(this.data.duration);
			this.tween = util.tween.tweenMax.to(this, this.data.duration,{
				progress : 100,
				delay : this.data._delay || 0,
			//	paused : true,
				onInit : function(){
		//			console.log('init');
					self.onInit();
				},
				onStart : function(){
		//			console.log('start');
					self.onStart();
				},
				onUpdate : function(){
			//		console.log('update');
					self.onUpdate();
				},
				onComplete : function(){
		//			console.log('complete');
					self.onComplete();
				}
			});

			this.tween.owner = this;
		},
		initOutputElement : function(){},
		ready : function(){
			this.initTween();
			this.isReady = true;
			if(angular.isFunction(this.onReady))
				this.onReady();
		},
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

	angular.extend(ImageItem.prototype, {constructor : ImageItem},
	!util.isIpad() ? {
		initOutputElement : function(){
			this.output = $('<img src="'+ this.data.source +'" alt="" class="item image-item" />');
			this.ready();
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
	} : {});


	// VideoItem base class
	function VideoItem () {
		this.ctx = null;
		this.vid = null;
		ImageItem.apply(this, arguments);
		if(!arguments.length)
			return this;
	}
	VideoItem.prototype = new ImageItem();

	angular.extend(VideoItem.prototype, {constructor : VideoItem},
	!util.isIpad() ? {
		initOutputElement : function(){
			var self = this,
				F = function(){
					self.vid.removeEventListener('canplaythrough', F);
			//		console.info('video ready',self, self.ready, self.vid);
					self.vid.isReady = true;
					self.ready();
				};

			this.vid = util.createVideoElement(this.data);
			if(this.vid.isReady)
				F();
			else
				this.vid.addEventListener('canplaythrough', F, false);



			this.output = angular.element('<canvas class="item image-video" width="'+ config.screenWidth +'" height="'+config.screenHeight+'"/>');
			this.ctx = this.output.get(0).getContext('2d');
		},
		onStart : function(){
			this.vid.currentTime = 0;
			this.onUpdate();
		},
		onUpdate : function(){
			if(!this.tween.timeline || !this.tween.timeline.parent || !this.tween.timeline.parent.ready)
				return;
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
	} : {});

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
			constructor : AudioItem
		},

		!util.isIpad() ? {
		initOutputElement : function(){
			var self = this,
				F = function(){
					self.audio.removeEventListener('canplaythrough', F);
					self.audio.removeEventListener('canplay', F);
					self.audio.isReady = true;
		//			console.info('audio ready', self.audio);
					self.audio.pause();

					self.ready();
				};

			this.audio = util.createAudioElement(this.data);

			if(this.audio.isReady)
				F();
			else
				{
					this.audio.addEventListener('canplaythrough', F, false);
					this.audio.addEventListener('canplay', F, false);
				}
/*
			this.audio.addEventListener('canplay', function(){
				console.info('audio ready2', self.audio);
				self.ready();
			}, false);*/
		},
		onStart : function(){
			this.audio.currentTime = 0;
			this.audio.pause();

			this.onUpdate();
		},
		onUpdate : function(){
/*			if(this.tween && this.tween._timeline && !this.tween.timeline)
				this.tween.timeline = this.tween._timeline;

			if(!this.tween.timeline
				// || !this.tween.timeline.parent || !this.tween.timeline.parent.ready
			)
				{
					window.CCC = $.extend({},this);
					console.error(window.CCC);
					return;
				}
*/
			if(!this.tween.timeline || !this.tween.timeline.parent || !this.tween.timeline.parent.ready)
				return;

			if(this.tween.timeline.paused())
				{
					this.audio.pause();
				}
			else if(this.audio.paused)
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
	} : {});

	// Visual Item factory
	function ItemFactory(data, onReady){
	//	console.log('visual item', data);
		return data.type == 'video'
					? new VideoItem(data, onReady)
					: data.type == 'image' || data.type == 'title'
						? new ImageItem(data, onReady)
						: data.type == 'audio' || data.type == 'music'
							? new AudioItem(data, onReady)
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
