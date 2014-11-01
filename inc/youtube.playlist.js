/**
 * youtube.playlist 1.0
 * by Roi Dayan
 *
 * Author: Roi Dayan <roi.dayan@gmail.com>
 * Copyright (c) 2012  Roi Dayan
 *
 * License: GPLv2
 * Website: http://roidayan.com
 */

/*
    TODO - marked inline.
*/

/**
 * Helper function to convert time string to seconds
 * @param time time string as minutes:seconds
 * @return seconds
 */
function convertToSeconds(time) {
    if (typeof(time) === 'number')
        return parseInt(time);
    var s = time.split(':');
    if (s.length == 1)
        return parseInt(s);
    return parseInt(s[0])*60 + parseInt(s[1]);
}

YTPlaylistReady = [];
/* youtube callback api */
if (!('onYouTubePlayerAPIReady' in window)) {
	window.onYouTubePlayerAPIReady = function() {
		jQuery('.ytplayer').each(function(idx) {
			jQuery(this).ytplaylist();
		});
		//if (YTPlaylistReady.indexOf(playerId) < 0)
		//    YTPlaylistReady.push(playerId);


		// TODO need to bind to inner function per player
		// probably need to save dictionary of playerId and annymous function

		//var player = document.getElementById(playerId);
		//player.addEventListener("onStateChange", "onytplayerStateChange");
	}
}

jQuery( document ).ready(function( $ ) {
	//
});

/**
 * jquery plugin
 */
(function($) {
    var methods = {
        init: function(options) {
            // defaults
            var settings = {
                'playerId': '',
                'playlist': '',
                'template': '<a href="#">${title}</a>',
                'playingClass': 'playing',
                'pausedClass': 'paused',
                'class': 'clips'
            };
            // merge with options
            $.extend(settings, options);

            var selected_idx = -1;

            function toString(clip) {
                var el = settings.template;

                $.each(clip, function(key, val) {
                    if (!$.isFunction(val)) {
                        el = el.replace("$\{" +key+ "\}", val).replace("$%7B" +key+ "%7D", val);
                    }
                });
                return el;
            }

            function getEls(wrap) {
                var els = wrap.find("a");
                return els.length ? els : wrap.children();
            }

            function clearCSS(els) {
                els.removeClass(settings.playingClass);
                els.removeClass(settings.pausedClass);
            }

            function play(el, index) {
                var play = true;
				var player = el.data('ytplaylist').player;
				if (!player)
					return;
				var playlist = getPlaylist(el);
				if (!playlist)
					return;

                if (el.hasClass(settings.playingClass) ||
                    el.hasClass(settings.pausedClass))
                {
					if ( index == selected_idx )
						play = (el.hasClass(settings.playingClass) ? false : true);
					else
						play = true;

					clearCSS(el);

					if (play)
						el.addClass(settings.playingClass);
					else
						el.addClass(settings.pausedClass);
                    //el.toggleClass(settings.playingClass+' '+settings.pausedClass);
                } else {
                    el.addClass(settings.playingClass);
                }

                if (play) {
                    var item = playlist[index];
                    player.seekTo(item.seconds, /* allowSeekAhead */ true);
                    player.playVideo();
                } else {
                    player.pauseVideo();
                }

                return el;
            }

			function getPlaylist($this) {
				return ytplaylist[$this.attr('id')];
			}

            function buildPlaylist($this) {
				var playlist = getPlaylist($this);
				if (!playlist)
					return;

				var wrap = $this.find('.ytplaylist');

                wrap.addClass(settings['class']);
                wrap.empty();

                $.each(playlist, function() {
                    this.seconds = convertToSeconds(this.time);
                    wrap.append(toString(this));
                });

                bindClicks($this);
            }

            function bindClicks($this) {
				var wrap = $this.find('.ytplaylist');
                var els = getEls(wrap);

                els.unbind("click.ytplaylist")
                    .bind("click.ytplaylist", function(event) {
                        event.preventDefault();
                        var index = els.index(this);
                        return play($this, index);
                });
            }

            function checkPlayer($this) {
                // TODO only need to activate timer when player is playing
                var player = $this.data('ytplaylist').player;
				if (!player)
					return;

				var playlist = getPlaylist($this);
				if (!playlist)
					return;
				if (!player.getPlayerState)
					return; // YT not ready yet.
                var state = player.getPlayerState();
                var STATE_PLAYING = 1;
                var curTime = player.getCurrentTime();
                var i = 0;
                var index = -1;

                $.each(playlist, function() {
                    if (this.seconds <= curTime)
                        index = i;
                    i++;
                });

                /* check if we need to change class */
                var els = getEls($this);
                var cls = (state == STATE_PLAYING ? settings.playingClass : settings.pausedClass);
                var refresh = $(els[index]).hasClass(cls) ? false : true;

                if (refresh || (index >= 0 && index != selected_idx)) {
                    clearCSS(els);
                    $(els[index]).addClass(cls);
                    selected_idx = index;
                }
            }

			function newPlayer(params, playerOptions) {
				var DEFAULT_PLAYER_WIDTH = 400;
				var height = playerOptions.height;
				var width = playerOptions.width || DEFAULT_PLAYER_WIDTH;
				var playerContainer = document.createElement('div');

				params.container.appendChild(playerContainer);
				var YOUTUBE_CONTROLS_HEIGHT = 30;
				var PLAYER_HEIGHT_TO_WIDTH_RATIO = 9 / 16;
				
				return new YT.Player(playerContainer, {
					height: height ||
							width * PLAYER_HEIGHT_TO_WIDTH_RATIO + YOUTUBE_CONTROLS_HEIGHT,
					width: width,
					playerVars: playerOptions.playerVars || { autohide: 1 },
					videoId: params.video,
					events: {
					  //onReady: playerOptions.onReady,
					  //onStateChange: playerOptions.onStateChange,
					  //onPlaybackQualityChange: playerOptions.onPlaybackQualityChange,
					  //onError: playerOptions.onError
					}
				});
			}

            return this.each(function () {
                var $this = $(this);
                var data = $this.data('ytplaylist');

                if (!data) {
                    // If the plugin hasn't been initialized yet

					var params = {
						'video': $this.data('video'),
						'container': this,
					};

					var playerOptions = {
						'width': $this.data('videow'),
						'height': $this.data('videoh')
					};
					var player = newPlayer(params, playerOptions);

                    var timerId = setInterval(function () {checkPlayer($this);}, 400);

                    $this.data('ytplaylist', {
                        'params': params,
                        'timerId': timerId,
						'player': player
                    });

					YTPlaylistReady.push($this);
                    buildPlaylist($this);
                }
            });
        },

        destroy: function () {
            return this.each(function () {
                var $this = $(this);
                var data = $this.data('ytplaylist');
                clearInterval(data.timerId);
                $(window).unbind('.ytplaylist');
                data.ytplaylist.remove();
                $this.removeData('ytplaylist');
            });
        }
    };

    $.fn.ytplaylist = function(method) {
        if ( methods[method] ) {
            return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
        } else if ( typeof method === 'object' || ! method ) {
            return methods.init.apply( this, arguments );
        } else {
            $.error( 'Method ' +  method + ' does not exist on jQuery.ytplaylist' );
        }
    };

})(jQuery);