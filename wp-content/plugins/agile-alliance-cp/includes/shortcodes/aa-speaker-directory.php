<?php

use Paradigm\Concepts\Functional as F;

add_shortcode('aa_speaker_directory', function() {

     $args = array(
        'nopaging' => 1,
        'post_type' => 'aa_event_session',
        'meta_key' => 'include_in_speaker_directory',
        'meta_value' => 1
    );

    $directory_public_sessions = (new F\MaybeEmpty($args))
        ->bind(function($args) {
            return new WP_Query($args);
        })
        ->bind(function($query) {
            return $query->post_count > 0 ? $query->posts : null;
        });

    function extract_post_id($post_obj) {
        return $post_obj->ID;
    }

    function get_connected_speakers($session_id) {
        return p2p_type('user_to_event_session_presenter')
            ->set_direction('to')
            ->get_connected($session_id);
    }

    function extract_users($user_query) {
        return is_array($user_query->results) ? $user_query->results : null;
    }

    $extract_presenters = F\compose('extract_users', F\compose('get_connected_speakers', 'extract_post_id'));

    $speakers = $directory_public_sessions
        ->bind(function($session) use ($extract_presenters) {
            return array_map($extract_presenters, $session);
        })
        ->bind('Paradigm\Concepts\Functional\flatten')
        ->bind(function ($users) {
            return F\reduce($users, function($carry, $user) {
                $carry[$user->ID] = $user;
                return $carry;
            }, []);
        })
        ->bind(function ($users) {
            return array_map(function($user) {
                $user->meta = array_map('current', get_user_meta($user->ID));

                $s2_fields = unserialize($user->meta['wp_s2member_custom_fields']);
                if (!empty($s2_fields) && gettype($s2_fields) === 'string') {
                    $s2_fields = unserialize($s2_fields);
                }

                $s2_fields['country_code'] =
                    $s2_fields['country_code'] !== 'country_code_placeholder' ?
                        $s2_fields['country_code'] : '';

                $user->s2meta = $s2_fields;

                return $user;
            }, $users);
        })
        ->extract();

    $directory_markup_start = "
    <style>
        .sort {
            padding: 8px 30px 0 0;
            border: none;
            display: inline-block;
            color: #666;
            text-decoration: none;
            background-color: transparent;
            height: 30px;
        }
        .sort:hover {
            text-decoration: none;
        }
        .sort:focus {
            outline:none;
        }
        .sort:after {
            display:inline-block;
            width: 0;
            height: 0;
            border-left: 5px solid transparent;
            border-right: 5px solid transparent;
            border-bottom: 5px solid transparent;
            content:\"\";
            position: relative;
            top:-10px;
            right:-5px;
        }
        .sort.asc:after {
            width: 0;
            height: 0;
            border-left: 5px solid transparent;
            border-right: 5px solid transparent;
            border-top: 5px solid #666;
            content:\"\";
            position: relative;
            top:4px;
            right:-5px;
        }
        .sort.desc:after {
            width: 0;
            height: 0;
            border-left: 5px solid transparent;
            border-right: 5px solid transparent;
            border-bottom: 5px solid #666;
            content:\"\";
            position: relative;
            top:-4px;
            right:-5px;
        }
    </style>
    <div id='speaker-directory'>
      <label>
        <input class=\"search\" placeholder=\"Search\" />
      </label>
      <table class='aa_speaker-directory table table-striped'>
        <thead>
          <tr>
            <th>
              <button class='sort' data-sort='first-name'>
                First
              </button>
            </th>
            <th>
              <button class='sort' data-sort='last-name'>
                Last
              </button>
            </th>
            <th>
              <button class='sort' data-sort='country'>
                Country
              </button>
            </th>
            <th>
              <button class='sort' data-sort='company'>
                Company
              </button>
            </th>
            <th>Profile</th>
          </tr>
        </thead>
        <tbody class='list'>
    ";

    $directory_markup = F\reduce($speakers, function($carry, $user) {
        return $carry .= "
            <tr>
              <td class='first-name'>{$user->meta['first_name']}</td>
              <td class='last-name'>{$user->meta['last_name']}</td>
              <td class='country'>{$user->s2meta['country_code']}</td>
              <td class='company'>{$user->s2meta['company']}</td>
              <td><a href='/author/$user->user_nicename'>View</a></td>
            </tr>
        ";
    }, '');

    $directory_markup_end = "
        </tbody>
      </table>
      <ul class=\"pagination\"></ul>
      </div>
      <script src=\"//cdnjs.cloudflare.com/ajax/libs/list.js/1.2.0/list.min.js\"></script>
      <script src=\"//cdnjs.cloudflare.com/ajax/libs/list.pagination.js/0.1.1/list.pagination.min.js\"></script>
      <script>
        (function() {
            var options = {
                valueNames: [ 'first-name', 'last-name', 'country', 'company' ],
                page: 20,
                plugins: [ ListPagination({}) ]
            };
            var userList = new List('speaker-directory', options)
              .sort('last-name', {  order: 'asc' });
        })(jQuery);
      </script>
     ";

    return $directory_markup_start . $directory_markup . $directory_markup_end;
});

add_action('vc_before_init', function(){
    vc_map(array(
        'name' => 'Speaker Directory',
        'base' => 'aa_speaker_directory',
        'category' => __('Agile Alliance Components','js_composer'),
    ));
});