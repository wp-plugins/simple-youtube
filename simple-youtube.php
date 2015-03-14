<?php
/*
Plugin Name: Simple YouTube
Plugin URI: http://roidayan.com
Description: YouTube with playlist
Version: 1.5
Author: Roi Dayan
Author URI: http://roidayan.com
License: GPLv2
*/

class WPSimpleYouTube {

    function __construct() {
		$this->plugin_url = plugin_dir_url(__FILE__);
        $this->settings = strtolower(__CLASS__.'_settings');

        if (!is_admin()) {
            add_action('init', array(&$this, 'add_styles'));
            add_action('wp_enqueue_scripts', array(&$this, 'add_scripts'));
            add_shortcode('youtube', array(&$this, 'shortcode'));
        }
    }

    function shortcode($atts, $content = null) {
        extract(shortcode_atts(array(
            'width' => 400,
            'height' => '',
            'video' => '',
            'side' => 'left',
            'class' => '',
            'vparams' => ''
        ), $atts));

        $r = '';
        $playlist = null;

        if (!empty($video)) {
            if (!empty($content)) {
                $content = strip_tags($content);
                $content_lines = explode("\n", $content);
                $playlist = array();
                foreach ($content_lines as $line) {
                    if (!empty($line)) {
                        $playlist[] = explode(',', $line);
                    }
                }
            }

            $r = $this->embed_player($video, intval($width), intval($height),
                                     $playlist, $side, $class, $vparams);
        }

        return $r;
    }

    function add_styles() {
        wp_enqueue_style('youtube-playlist', $this->plugin_url . 'inc/playlist.css', false, '1.0', 'all');
    }

    function add_scripts() {
        wp_enqueue_script('jquery');
		wp_enqueue_script('youtube-api', '//www.youtube.com/player_api', array('jquery'), '1.0', false);
		wp_enqueue_script('youtube-playlist', $this->plugin_url . 'inc/youtube.playlist.js', array('youtube-api'), '1.0', false);
    }

    function embed_player($video, $width, $height, $playlist, $side, $class, $vparams) {
        $salt = substr(md5(uniqid(rand(), true)), 0, 10);
        $hash = __CLASS__.'_'. md5($media.$salt);
        $hash_pl = $hash.'_pl';

        $html = '<div id="' . $hash . '" class="ytplayer" data-video="'.$video.'"'.
				' data-videow="'.$width.'" data-videoh="'.$height.'">';
        // TODO vparams not being used
		$script = '';

        /* build playlist */
        if (count($playlist) > 0) {
            $playlist_div = '<div class="ytplaylist '.$class.'" style="float:'.$side.';"></div>';

            $data = array();
            foreach ($playlist as $m) {
                $title = trim($m[0]);
                $time = trim($m[1]);
                $data[] = array(
							'title' => $title,
							'time' => $time
						);
            }
			
			$json_data = json_encode($data);

			$html .= $playlist_div;
			$html .= <<<EOT
<script>
if (!window.ytplaylist)
	window.ytplaylist = {};
ytplaylist['$hash'] = $json_data;
</script>
EOT;

        }

        $html .= "</div>$script";

        return $html;
    }
}

new WPSimpleYouTube();