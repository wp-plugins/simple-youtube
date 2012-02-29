=== Simple YouTube ===
Contributors: roidayan
Donate link: http://roidayan.com
Tags: youtube, flv, player, playlist, video
Requires at least: 3.2.1
Tested up to: 3.3.1
Stable tag: 1.0

Simple youtube plugin to help embed youtube videos
with playlist by time.

== Description ==

Simple youtube plugin to help embed youtube videos.

Support for playlist by time.

i.e. playlist to jump to specific time in the video.

[example page](http://testwp.roidayan.com/2012/02/24/demo-youtube/ "example page")

playlist css is from flowplayer playlist plugin.

== Installation ==

1. Extract to plugins directory.
2. Check the settings page if you want to change the defaults.

* example1:
    `[youtube video='id']`
	where id is the youtube video id.
	
* Example2:
`	[youtube video='id' vparams='rel=0|border=0']
	From the start, 0
	Jump ahead,  1:30
	Jump again, 2:04
	[/youtube]`
	
Options for the shortcode:
*    id - youtube video id.
*	width - width of the video frame.
*    height - height of the video frame.
*	class - class of the playlist.
*	side - side of the playlist. left or right.
*    vparams - additional youtube video parameters.

Available youtube video parameters can be found here:
*    http://code.google.com/apis/youtube/player_parameters.html
    
== Frequently Asked Questions ==

= How to modify the playlist style? =

You need to edit playlist.css

== Screenshots ==

1. simple playlist on the right side
2. playlist style from flowplayer on the left side

== Changelog ==

= 1.0 =
* first