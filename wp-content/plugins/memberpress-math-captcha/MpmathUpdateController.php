<?php
if(!defined('ABSPATH')) {die('You are not allowed to call this page directly.');}

class MpmathUpdateController {
  public static function load_hooks() {
    add_filter('pre_set_site_transient_update_plugins', 'MpmathUpdateController::queue_update');
    add_filter('plugins_api', 'MpmathUpdateController::plugin_info', 938541, 3);
  }

  public static function queue_update($transient, $force=false) {
    $mepr_options = MeprOptions::fetch();

    if( $force or ( false === ( $update_info = get_site_transient('mpmath_update_info') ) ) )
    {
      if(empty($mepr_options->mothership_license))
      {
        // Just here to query for the current version
        $args = array();
        if( $mepr_options->edge_updates or ( defined( "MEMBERPRESS_EDGE" ) and MEMBERPRESS_EDGE ) )
          $args['edge'] = 'true';

        $version_info = self::send_mothership_request( "/versions/latest/".MPMATH_EDITION, $args );
        $curr_version = $version_info['version'];
        $download_url = '';
      }
      else
      {
        try {
          $domain = urlencode(MeprUtils::site_domain());
          $args = compact('domain');

          if( $mepr_options->edge_updates or ( defined( "MEMBERPRESS_EDGE" ) and MEMBERPRESS_EDGE ) )
            $args['edge'] = 'true';

          $license_info = self::send_mothership_request("/versions/info/".MPMATH_EDITION."/{$mepr_options->mothership_license}", $args);
          $curr_version = $license_info['version'];
          $download_url = $license_info['url'];
          set_site_transient( 'mpmath_license_info',
                              $license_info,
                              MeprUtils::hours(12) );
        }
        catch(Exception $e)
        {
          try
          {
            // Just here to query for the current version
            $args = array();
            if( $mepr_options->edge_updates or ( defined( "MEMBERPRESS_EDGE" ) and MEMBERPRESS_EDGE ) )
              $args['edge'] = 'true';

            $version_info = self::send_mothership_request("/versions/latest/".MPMATH_EDITION, $args);
            $curr_version = $version_info['version'];
            $download_url = '';
          }
          catch(Exception $e)
          {
            if(isset($transient->response[MPMATH_PLUGIN_SLUG]))
              unset($transient->response[MPMATH_PLUGIN_SLUG]);

            return $transient;
          }
        }
      }

      set_site_transient( 'mpmath_update_info',
                          compact( 'curr_version', 'download_url' ),
                          MeprUtils::hours(12) );
    }
    else
      extract( $update_info );

    if(isset($curr_version) and version_compare($curr_version, MPMATH_VERSION, '>'))
    {
      $transient->response[MPMATH_PLUGIN_SLUG] = (object)array(
        'id'          => $curr_version,
        'slug'        => 'memberpress-math-captcha',
        'new_version' => $curr_version,
        'url'         => 'http://memberpress.com',
        'package'     => $download_url
      );
    }
    else
      unset( $transient->response[MPMATH_PLUGIN_SLUG] );

    return $transient;
  }

  public static function plugin_info($api, $action, $args) {
    global $wp_version;

    if(!isset($action) or $action != 'plugin_information')
      return $api;

    if(isset( $args->slug) and !preg_match("#.*".$args->slug.".*#", MPMATH_PLUGIN_SLUG))
      return $api;

    $mepr_options = MeprOptions::fetch();

    if(empty($mepr_options->mothership_license))
    {
      // Just here to query for the current version
      $args = array();
      if( $mepr_options->edge_updates or ( defined( "MEMBERPRESS_EDGE" ) and MEMBERPRESS_EDGE ) )
        $args['edge'] = 'true';

      $version_info = self::send_mothership_request("/versions/latest/".MPMATH_EDITION, $args);
      $curr_version = $version_info['version'];
      $version_date = $version_info['version_date'];
      $download_url = '';
    }
    else
    {
      try
      {
        $domain = urlencode(MeprUtils::site_domain());
        $args = compact('domain');

        if( $mepr_options->edge_updates or ( defined( "MEMBERPRESS_EDGE" ) and MEMBERPRESS_EDGE ) )
          $args['edge'] = 'true';

        $license_info = self::send_mothership_request("/versions/info/{$mepr_options->mothership_license}", $args);
        $curr_version = $license_info['version'];
        $version_date = $license_info['version_date'];
        $download_url = $license_info['url'];
      }
      catch(Exception $e)
      {
        try
        {
          $args = array();
          if( $mepr_options->edge_updates or ( defined( "MEMBERPRESS_EDGE" ) and MEMBERPRESS_EDGE ) )
            $args['edge'] = 'true';

          // Just here to query for the current version
          $version_info = self::send_mothership_request("/versions/latest/".MPMATH_EDITION, $args);
          $curr_version = $version_info['version'];
          $version_date = $version_info['version_date'];
          $download_url = '';
        }
        catch(Exception $e)
        {
          if(isset($transient->response[MEPR_PLUGIN_SLUG]))
            unset($transient->response[MEPR_PLUGIN_SLUG]);

          return $transient;
        }
      }
    }

    $pinfo = (object)array( "slug" => MPMATH_PLUGIN_SLUG,
                            "name" => "MemberPress Are You A Human",
                            "author" => '<a href="http://blairwilliams.com">Caseproof, LLC</a>',
                            "author_profile" => "http://blairwilliams.com",
                            "contributors" => array("Caseproof" => "http://caseproof.com"),
                            "homepage" => "http://memberpress.com",
                            "version" => $curr_version,
                            "new_version" => $curr_version,
                            "requires" => $wp_version,
                            "tested" => $wp_version,
                            "compatibility" => array($wp_version => array($curr_version => array( 100, 0, 0))),
                            "rating" => "100.00",
                            "num_ratings" => "1",
                            "downloaded" => "1000",
                            "added" => "2014-03-15",
                            "last_updated" => $version_date,
                            "tags" => array("membership" => __("Membership", 'memberpress-math-captcha'),
                                            "membership software" => __("Membership Software", 'memberpress-math-captcha'),
                                            "members" => __("Members", 'memberpress-math-captcha'),
                                            "payment" => __("Payment", 'memberpress-math-captcha'),
                                            "protection" => __("Protection", 'memberpress-math-captcha'),
                                            "rule" => __("Rule", 'memberpress-math-captcha'),
                                            "lock" => __("Lock", 'memberpress-math-captcha'),
                                            "access" => __("Access", 'memberpress-math-captcha'),
                                            "community" => __("Community", 'memberpress-math-captcha'),
                                            "admin" => __("Admin", 'memberpress-math-captcha'),
                                            "pages" => __("Pages", 'memberpress-math-captcha'),
                                            "posts" => __("Posts", 'memberpress-math-captcha'),
                                            "plugin" => __("Plugin", 'memberpress-math-captcha')),
                            "sections" => array("description" => "<p>" . __('MemberPress helps you place a simple math captcha on your MemberPress registration forms.', 'memberpress-math-captcha') . "</p>",
                                                "faq" => "<p>" . sprintf(__('You can access in-depth information about MemberPress at %1$sthe MemberPress User Manual%2$s.', 'memberpress-math-captcha'), "<a href=\"http://memberpress.com/user-manual\">", "</a>") . "</p>", "changelog" => "<p>".__('No Additional information right now', 'memberpress-math-captcha')."</p>"),
                            "download_link" => $download_url );

    return $pinfo;
  }

  public static function send_mothership_request( $endpoint,
                                                  $args=array(),
                                                  $method='get',
                                                  $domain='http://mothership.caseproof.com',
                                                  $blocking=true )
  {
    $uri = "{$domain}{$endpoint}";

    $arg_array = array( 'method'    => strtoupper($method),
                        'body'      => $args,
                        'timeout'   => 15,
                        'blocking'  => $blocking,
                        'sslverify' => false
                      );

    $resp = wp_remote_request($uri, $arg_array);

    // If we're not blocking then the response is irrelevant
    // So we'll just return true.
    if($blocking == false)
      return true;

    if(is_wp_error($resp))
      throw new Exception(__('You had an HTTP error connecting to Caseproof\'s Mothership API', 'memberpress-math-captcha'));
    else
    {
      if(null !== ($json_res = json_decode($resp['body'], true)))
      {
        if(isset($json_res['error']))
          throw new Exception($json_res['error']);
        else
          return $json_res;
      }
      else
        throw new Exception(__( 'Your License Key was invalid', 'memberpress-math-captcha'));
    }

    return false;
  }

  public static function manually_queue_update()
  {
    $transient = get_site_transient("update_plugins");
    set_site_transient("update_plugins", self::queue_update($transient, true));
  }
} //End class

