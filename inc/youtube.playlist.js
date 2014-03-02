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
function onYouTubePlayerReady(playerId) {
    if (YTPlaylistReady.indexOf(playerId) < 0)
        YTPlaylistReady.push(playerId);

    // TODO need to bind to inner function per player
    // probably need to save dictionary of playerId and annymous function
    
    //var player = document.getElementById(playerId);
    //player.addEventListener("onStateChange", "onytplayerStateChange");
}

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
                'class': 'clips low2'
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

            function playerIsReady() {
                if (YTPlaylistReady.indexOf(settings.playerId) < 0)
                    return false;
                return true;
            }
            
            function play(el, index) {
                if (!playerIsReady())
                    return;
                
                var play = true;
                
                if (el.hasClass(settings.playingClass) ||
                    el.hasClass(settings.pausedClass))
                {
                    play = (el.hasClass(settings.pausedClass) ? true : false);
                    el.toggleClass(settings.playingClass+' '+settings.pausedClass);
                } else {
                    el.addClass(settings.playingClass);
                }
                
                var player = getPlayer();
                
                if (play) {
                    var item = settings.playlist[index];
                    player.seekTo(item.seconds, /* allowSeekAhead */ true);
                    player.playVideo();
                } else {
                    player.pauseVideo();
                }
                
                return el;
            }

            function getPlaylist() {
                return settings.playlist;
            }
                
            function getPlayer() {
                return document.getElementById(settings.playerId);
            }
            
            function buildPlaylist(wrap) {
                wrap.addClass(settings['class']);
                wrap.empty();
                
                $.each(getPlaylist(), function() {
                    this.seconds = convertToSeconds(this.time);
                    wrap.append(toString(this)); 
                });				
                
                bindClicks(wrap);
            }
             
            function bindClicks(wrap) {			
                var els = getEls(wrap);
                els.unbind("click.ytplaylist")
                    .bind("click.ytplaylist", function(event) {
                        event.preventDefault();
                        var index = els.index(this);
                        return play($(this), index);
                });
            }
            
            function checkPlayer(wrap) {
                // TODO only need to activate timer when player is playing
                if (!playerIsReady())
                    return;
                
                var player = getPlayer();
                var state = player.getPlayerState();
                var STATE_PLAYING = 1;
                var curTime = player.getCurrentTime();
                var i = 0;
                var index = -1;
                
                $.each(getPlaylist(), function() {
                    if (this.seconds <= curTime)
                        index = i;
                    i++;
                });
                
                /* check if we need to change class */
                var els = getEls(wrap);
                var cls = (state == STATE_PLAYING ? settings.playingClass : settings.pausedClass);
                var refresh = $(els[index]).hasClass(cls) ? false : true;
                
                if (refresh || (index >= 0 && index != selected_idx)) {
                    clearCSS(els);
                    $(els[index]).addClass(cls);
                    selected_idx = index;
                }
            }

            return this.each(function () {
                var $this = $(this);
                var data = $this.data('ytplaylist');
                
                if (!data) {
                    // If the plugin hasn't been initialized yet
                    
                    var timerId = setInterval(function () {checkPlayer($this);}, 400);
                    
                    $this.data('ytplaylist', {
                        'playerId': settings.playerId,
                        'timerId': timerId
                    });
                    
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