/*global google:true, jQuery:true*/

;(function ($, win) {
	'use strict';
	
	var MapMarker = win.MapMarker = function(opt_options) {
		var self = this, labelClasses = '';

		var defaults = {
			content: '',
			visible: true,
			customClasses: '',
			clickable: true,
			markerOffset: new google.maps.Point(0,0)
		};

		this.options = $.extend(defaults, opt_options);

		this.setValues(this.options);

		if (this.options.clickable) {
			labelClasses = ' pointer';
		}

		if (this.options.customClasses) {
			labelClasses += ' ' + this.options.customClasses;
		}

		this.$node = $('<div style="position:absolute;"><div style="position:relative;"><div class="map-marker-wrapper" style="display:' + (this.options.visible ? 'block' : 'none') + ';"><span class="map-marker"><span class="map-marker-label' + labelClasses + '">' + this.options.content + '</span></span></div></div></div>');

		this.$node
			.on('click.map-marker-events', 'span.map-marker', function(e) {
				if (self.get('clickable')) {
					e.stopPropagation();
					google.maps.event.trigger(self, "click");
				}
			})
			.on('touchstart.map-marker-events', 'span.map-marker', function(e) {
				if (self.get('clickable')) {
					e.stopPropagation();
					google.maps.event.trigger(self, "click");
				}
			})
		;
	};

	MapMarker.prototype = new google.maps.OverlayView();

	MapMarker.prototype.getVisible = function() {
		return this.get('visible');
	};

	MapMarker.prototype.setOption = function(o,v) {
		this.set(o, v);
		this.draw();
	};	

	MapMarker.prototype.setVisible = function(visible) {
		this.set('visible', visible);
		if (this.$node && this.$node.length) {
			if (visible) {
				this.$node.find('.map-marker-wrapper').show();
			} else {
				this.$node.find('.map-marker-wrapper').hide();
			}
		}
	};

	MapMarker.prototype.addNode = function(n) {
		if (this.$node && this.$node.length) {
			this.$node.find(':first-child').append(n);
		}
	}

	MapMarker.prototype.addMarkerClass = function(a) {
		if (this.$node && this.$node.length) {
			this.$node.find('span.map-marker').addClass(a);
		}
	};

	MapMarker.prototype.removeMarkerClass = function(a) {
		if (this.$node && this.$node.length) {
			this.$node.find('span.map-marker').removeClass(a);
		}
	};

	MapMarker.prototype.setContent = function(v) {
		this.set('content', v);
		if (this.$node && this.$node.length) {
			this.$node.find('span.map-marker-label').html(v);
		}
	};

	MapMarker.prototype.getPosition = function() {
		return this.get('position');
	};	

	MapMarker.prototype.onAdd = function() {
		var self = this;

		this.getPanes().overlayImage.appendChild(this.$node[0]);
		this.getPanes().overlayMouseTarget.appendChild(this.$node[0]);
		
		this.$node.css({
			'marginTop': ((this.$node.height() * 0.5) * -1)
		});

		// Ensures the label is redrawn if the text or position is changed.
		this.listeners_ = [
			google.maps.event.addListener(this, 'position_changed', function() {
				self.draw();
			}),
			google.maps.event.addListener(this, 'visible_changed', function() {
				self.draw();
			}),
			google.maps.event.addDomListener(this.$node[0], 'click', function() { 
				google.maps.event.trigger(self, 'click');
			}),
			google.maps.event.addDomListener(this.$node[0], 'mouseover', function() { 
				google.maps.event.trigger(self, 'mouseover');
			}),
			google.maps.event.addDomListener(this.$node[0], 'mouseout', function() { 
				google.maps.event.trigger(self, 'mouseout');
			})
		];
	};

	MapMarker.prototype.onRemove = function() {
		var i, I;
		this.$node.off('.map-marker-events').remove();		
		for (i = 0, I = this.listeners_.length; i < I; ++i) {
			google.maps.event.removeListener(this.listeners_[i]);
		}
	};

	MapMarker.prototype.getPixelPostion = function() {
		var pos;
		try {
			pos = this.getProjection().fromLatLngToDivPixel(this.get('position'));
		} catch (e) {
			pos = {x:0,y:0};
		}
		return pos;
	};

	MapMarker.prototype.draw = function() {
		var position = this.getPixelPostion();
		var offsets = this.get('markerOffset');
		this.$node.css({
			'left': position.x - offsets.x,
			'top': position.y - offsets.y
		});
	};
}(jQuery, window));