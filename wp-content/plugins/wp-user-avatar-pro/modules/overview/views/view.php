
<?php
/**
 * Plugin Overviews.
 * @package User Avatar Pro
 * @author Flipper Code <flippercode>
 **/

//Setup Product Overview Page
    
    $productInfo = array('productName' => __('WP User Avatar Pro',WPUAP_TEXT_DOMAIN),
                        'productSlug' => 'wp-user-avatar-pro',
                        'productTagLine' => 'WP User Avatar Pro - an excellent product that allows users to upload any custom user avatar even through web-cam with the facility of cropping and resizing avatar before saving',
                        'productTextDomain' => WPUAP_TEXT_DOMAIN,
                        'productIconImage' => WPUAP_URL.'core/core-assets/images/wp-poet.png',
                        'productVersion' => WPUAP_VERSION,
                        'docURL' => 'https://codecanyon.net/item/wp-user-avatar-pro/15638832',
                        'demoURL' => 'https://codecanyon.net/item/wp-user-avatar-pro/15638832',
                        'productImagePath' => WPUAP_URL.'core/core-assets/product-images/',
                        'productSaleURL' => 'https://codecanyon.net/item/wp-user-avatar-pro/15638832',
                        'multisiteLicence' => 'https://codecanyon.net/item/wp-user-avatar-pro/15638832?license=extended&open_purchase_for_item_id=15638832&purchasable=source'
    );

    $productOverviewObj = new Flippercode_Product_Overview($productInfo);

?>

