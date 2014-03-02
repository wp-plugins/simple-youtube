<?php
/*
Plugin Name: Simple YouTube
Plugin URI: http://roidayan.com
Description: YouTube with playlist
Version: 1.01
Author: Roi Dayan
Author URI: http://roidayan.com
License: GPLv2
*/

/* TODO
    settings page for:
        default class
        default template
*/

class WPSimpleYouTube {
    function WPSimpleYouTube() {
        $this->setup();
        
        if (!is_admin()) {
            add_action('init', array(&$this, 'add_styles'));
            add_action('wp_enqueue_scripts', array(&$this, 'add_scripts'));
            add_shortcode('youtube', array(&$this, 'shortcode'));
        }
    }
    
    function setup() {
        $this->plugin_url = plugin_dir_url(__FILE__);
        $this->settings = strtolower(__CLASS__.'_settings');
    }
    
    function shortcode($atts, $content = null) {
        extract(shortcode_atts(array(
            'width' => 325,
            'height' => 256,
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
                        $m = explode(',', $line);
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
        wp_enqueue_style('youtube-playlist',
                         $this->plugin_url . 'inc/playlist.css',
                         false, '1.0', 'all');
    }
    
    function add_scripts() {
        wp_enqueue_script('jquery',
            'http://ajax.googleapis.com/ajax/libs/jquery/1.2.6/jquery.min.js',
            null, '1.2.6', false);
        wp_enqueue_script('swfobject',
            $this->plugin_url . 'inc/swfobject.js',
            null, '2.2', false);
        wp_enqueue_script('youtube.playlist',
            $this->plugin_url . 'inc/youtube.playlist.js',
            null, '1.0', false);
    }
        
    function embed_player($video, $width, $height, $playlist, $side, $class, $vparams) {
        $salt = substr(md5(uniqid(rand(), true)), 0, 10);
        $hash = __CLASS__.'_'. md5($media.$salt);
        $hash_pl = $hash.'_pl';
        $flash_version = 8;
            
        $html = "<div id=\"$hash\" style=\"float:left;width:{$width}px; height:{$height}px;\">
            You need Flash player $flash_version+ and JavaScript enabled to view this video.
            </div>";
        $video_url = "http://www.youtube.com/v/$video?enablejsapi=1&playerapiid=$hash&version=3";
        if (!empty($vparams))
            $video_url = $video_url.'&'.str_replace('|', '&', $vparams);
            
        $script = "var params = { allowScriptAccess: 'always' };
            var atts = { id: '$hash', align: 'left' };
            swfobject.embedSWF('$video_url', '$hash',
                    '$width', '$height', '$flash_version',
                    null, null, params, atts);";
    
        /* build playlist */
        if (count($playlist) > 0) {
            $playlist_div = "<div id=\"$hash_pl\" style=\"float:left;\"></div>";
            
            $tmp = array();
            foreach ($playlist as $m) {
                $title = trim($m[0]);
                $time = trim($m[1]);
                $tmp[] = "{'title': '$title', 'time': '$time'}";
            }
            $data = '[' . implode(',', $tmp) . ']';
        
            $ytopts = array("'playerId': '$hash'",
                    "'playlist': $data");
            if (!empty($class))
                $ytopts[] = "'class': '$class'";
            $ytopts = implode(',', $ytopts);
            
            $ytplaylist = "jQuery('#$hash_pl').ytplaylist({ $ytopts });";
            
            if ($side == 'right')
                $html = "$html $playlist_div";
            else
                $html = "$playlist_div $html";
            
            $script .= $ytplaylist;
        }
    
        $script = "<script type=\"text/javascript\">
        jQuery(document).ready(function(){
            $script
        }); </script>";
    
        $html = "<div>$html</div><div style=\"clear:both;\"></div>$script";
    
        return $html;
    }
}

new WPSimpleYouTube();
?>