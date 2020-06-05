<?php
use Paradigm\Concepts\Functional as F;

add_shortcode('aa_sponsor_carousel', function($atts){

    if (!isset($atts['event_id'])) return;
    $event_id = filter_var($atts['event_id'], FILTER_SANITIZE_NUMBER_INT);

    $sponsors = new \WP_Query([
        'connected_type' => 'aa_sponsor_to_event',
        'connected_items' => $event_id,
        'connected_direction' => 'to',
        'posts_per_page' => -1,
    ]);

    if (!$sponsors || $sponsors->post_count === 0) return;

    $markup = F\reduce($sponsors->posts, function($carry, $data){

        // Skip sponsor if no featured image set
        if (!has_post_thumbnail($data->ID)) return $carry;

        $image = get_the_post_thumbnail($data->ID, [300, 200], ['class' => 'aa-sponsor-carousel__logo']);

        // Also skip if featured image has been substituted with placeholder
        if (str_contains($image, 'resource_fallback.png')) return $carry;

        $link = get_field(AA_SPONSOR_WEBSITE_LINK_FIELD, $data->ID);

        $carry .= !empty($link) ?
            "<a class='aa-sponsor-carousel__link' href='$link' target='_blank'>$image</a>" :
            "<span class='aa-sponsor-carousel__link'>$image</span>";

        return $carry;

    }, '<div class="aa-sponsor-carousel">');

    $markup .= '</div>';

    ob_start();
    ?>
    <link href="//cdn.jsdelivr.net/jquery.slick/1.5.9/slick-theme.css" rel="stylesheet" />
    <link href="//cdn.jsdelivr.net/jquery.slick/1.5.9/slick.css" rel="stylesheet" />
    <style>
        .aa-sponsor-carousel__logo {
            width: 75%;
            height: auto;
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
        }

        .aa-sponsor-carousel__link {
            padding: 0 20px;
            position: relative;
            min-height: 150px !important;
        }
        .aa-sponsor-carousel .slick-dots li {
            height: 30px;
            line-height: 0;
            opacity: 0.7;
        }
        .aa-sponsor-carousel .slick-dots li.slick-active {
            opacity: 1;
        }
        .slick-dots {
            position: static;
            margin-top: 15px;
        }
    </style>
    <script type="text/javascript">
        jQuery(document).ready(function($){
            var $carousel = $('.aa-sponsor-carousel');
            $carousel.slick(
                {
                    dots: true,
                    autoplay: true,
                    autoplaySpeed: 5000,
                    speed: 300,
                    infinite: true,
                    arrows: false,
                    slidesToScroll:5,
                    slidesToShow:5,
                    swipe: true,
                    draggable: true,
                    touchMove: true,
                    responsive: [
                        {
                            breakpoint: 1025,
                            settings: {
                                slidesToShow: 5,
                                slidesToScroll: 5,
                            }
                        },
                        {
                            breakpoint: 769,
                            settings: {
                                slidesToShow: 3,
                                slidesToScroll: 3
                            }
                        },
                        {
                            breakpoint: 481,
                            settings: {
                                slidesToShow: 2,
                                slidesToScroll: 2
                            }
                        }
                    ],
                    pauseOnHover: true,
                    pauseOnDotsHover: true,
                    customPaging: function(slider, i) {
                        return '<i type="button" style="color:#333333;" class="aa-sponsor-carousel__nav fa fa-circle" data-role="none"></i>';
                    }
                });
        });
    </script>
    <?php

    $markup .= ob_get_clean();
    return $markup;
});

add_action('vc_before_init', function(){
    $events = new \WP_Query([
        'post_type' => 'event',
        'nopaging' => 1,
        'post_status' => 'any'
    ]);

    if (!$events || $events->post_count === 0) return;

    $dropdown_options = array_map(function($event){
        return [
            $event->ID,
            $event->post_title
        ];
    }, $events->posts);

    vc_map(array(
        'name' => 'Sponsor Carousel',
        'base' => 'aa_sponsor_carousel',
        'category' => __('Agile Alliance Components','js_composer'),
        'params' => array(
            array(
                'type' => 'dropdown',
                'holder' => 'div',
                'class' => '',
                'heading' => 'Event',
                'param_name' => 'event_id',
                'value' => $dropdown_options,
                'description' => 'Select the corresponding Event to display its linked sponsors'
            )
        )
    ));
});