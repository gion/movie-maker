/**
 * VERSION: beta 1.41
 * DATE: 2012-10-12
 * JavaScript
 * UPDATES AND DOCS AT: http://www.greensock.com
 *
 * Copyright (c) 2008-2012, GreenSock. All rights reserved. 
 * This work is subject to the terms in http://www.greensock.com/terms_of_use.html or for 
 * Club GreenSock members, the software agreement that was issued with your membership.
 * 
 * @author: Jack Doyle, jack@greensock.com
 **/
(window._gsQueue || (window._gsQueue = [])).push( function() {

	_gsDefine("plugins.ScrollToPlugin", ["plugins.TweenPlugin"], function(TweenPlugin) {
		
		var ScrollToPlugin = function(props, priority) {
				TweenPlugin.call(this, "scrollTo");
				this._overwriteProps.pop();
			},
			p = ScrollToPlugin.prototype = new TweenPlugin("scrollTo"),
			_doc = document.documentElement,
			_window = window,
			_setRatio = TweenPlugin.prototype.setRatio; //speed optimization (quicker lookup)
		
		p.constructor = ScrollToPlugin;
		ScrollToPlugin.API = 2;
		
		p._onInitTween = function(target, value, tween) {
			this._wdw = (target === _window);
			this._target = target;
			this._tween = tween;
			if (typeof(value) !== "object") {
				value = {y:Number(value)}; //if we don't receive an object as the parameter, assume the user intends "y".
			}
			this._autoKill = value.autoKill;
			this.x = this.xPrev = this.getX();
			this.y = this.yPrev = this.getY();
			if (value.x != null) {
				this._addTween(this, "x", this.x, value.x, "scrollTo_x", true);
			} else {
				this.skipX = true;
			}
			if (value.y != null) {
				this._addTween(this, "y", this.y, value.y, "scrollTo_y", true);
			} else {
				this.skipY = true;
			}
			return true;
		};

		p.getX = function() {
			return (!this._wdw) ? this._target.scrollLeft : (_window.pageXOffset != null) ? _window.pageXOffset : (_doc.scrollLeft != null) ? _doc.scrollLeft : document.body.scrollLeft;
		};

		p.getY = function() {
			return (!this._wdw) ? this._target.scrollTop : (_window.pageYOffset != null) ? _window.pageYOffset : (_doc.scrollTop != null) ? _doc.scrollTop : document.body.scrollTop;
		}
		
		p._kill = function(lookup) {
			if (lookup.scrollTo_x) {
				this.skipX = true;
			}
			if (lookup.scrollTo_x) {
				this.skipY = true;
			}
			return TweenPlugin.prototype._kill.call(this, lookup);
		};

		p._checkAutoKill = function() {
			if (this._autoKill && this.skipX && this.skipY) {
				this._tween.kill();
			}
		};
		
		p.setRatio = function(v) {
			_setRatio.call(this, v);

			var x = this.getX(),
				y = this.getY();

			if (!this.skipX && x !== this.xPrev) {
				this.skipX = true; //if the user scrolls separately, we should stop tweening!
				this._checkAutoKill();
			}
			if (!this.skipY && y !== this.yPrev) {
				this.skipY = true; //if the user scrolls separately, we should stop tweening!
				this._checkAutoKill();
			}
			if (this._wdw) {
				_window.scrollTo((!this.skipX) ? this.x : x, (!this.skipY) ? this.y : y);
			} else {
				if (!this.skipY) {
					this._target.scrollTop = this.y;
				}
				if (!this.skipX) {
					this._target.scrollLeft = this.x;
				}
			}
			this.xPrev = this.x;
			this.yPrev = this.y;
		};
		
		TweenPlugin.activate([ScrollToPlugin]);
		
		return ScrollToPlugin;
		
	}, true);

}); if (window._gsDefine) { _gsQueue.pop()(); }