<?php
class VC_Pop_Global {

	//Plugin starting point.
	public static function setup() {
		$class = __CLASS__;
		new $class;
	}

	/**
	 * Add necessary hooks and filters functions
	 *
	 * @author Aman Saini
	 * @since  1.0
	 */
	function __construct() {
		add_action( 'wp_footer', array( $this, 'show_popup' ) );

		// Basic
		add_filter( 'vc_popup/rule_match/post_type', array( $this, 'rule_match_post_type' ), 10, 3 );
		add_filter( 'vc_popup/rule_match/user_type', array( $this, 'rule_match_user_type' ), 10, 3 );

		// Page
		add_filter( 'vc_popup/rule_match/page', array( $this, 'rule_match_post' ), 10, 3 );
		add_filter( 'vc_popup/rule_match/page_type', array( $this, 'rule_match_page_type' ), 10, 3 );
		add_filter( 'vc_popup/rule_match/page_parent', array( $this, 'rule_match_page_parent' ), 10, 3 );
		add_filter( 'vc_popup/rule_match/page_template', array( $this, 'rule_match_page_template' ), 10, 3 );

		// Post
		add_filter( 'vc_popup/rule_match/post', array( $this, 'rule_match_post' ), 10, 3 );
		add_filter( 'vc_popup/rule_match/post_category', array( $this, 'rule_match_post_category' ), 10, 3 );
		add_filter( 'vc_popup/rule_match/post_format', array( $this, 'rule_match_post_format' ), 10, 3 );
		add_filter( 'vc_popup/rule_match/post_status', array( $this, 'rule_match_post_status' ), 10, 3 );
		add_filter( 'vc_popup/rule_match/taxonomy', array( $this, 'rule_match_taxonomy' ), 10, 3 );
	}

	function show_popup() {
		global $post;
		$current_post = $post;
		$args = array(
			'post_type'=>'vcpopup',
			'posts_per_page' => -1,
			'post_status'=>'publish'
		);

		$popup_query = new WP_Query( $args );

		if ( $popup_query -> have_posts() ) {
			while ( $popup_query -> have_posts() ) {
				$popup_query -> the_post();
				$post_id = get_the_ID();
				$show =  get_post_meta( $post_id, 'vc_popup_show_cond', true );
				//TO DO: Make conditions work
				$match_group = true;
				if ( $show == 'global' ) {

					echo do_shortcode( get_the_content() );
				}else if ( $show == 'not_global' ) {
						if ( class_exists( 'Vc_Popup_Notification_Metabox' ) ) {
							$groups = Vc_Popup_Notification_Metabox::get_location( '', $post_id );
							if ( !empty( $groups ) && is_array( $groups ) ) {
								foreach ( $groups as $group ) {
									foreach ( $group as  $rule ) {
										// $match = true / false
										$match = apply_filters( 'vc_popup/rule_match/' . $rule['param'] , false, $rule, $current_post );

										if ( !$match ) {
											$match_group = false;
										}

									}
								}

								// if true - show popup
								if($match_group){
										echo do_shortcode( get_the_content() );
								}


							}

						}


					}

			}
		}


	}



	/*
	*  rule_match_post_type
	*
	*  @description:
	*  @since: 3.5.7
	*  @created: 3/01/13
	*/

	function rule_match_post_type( $match, $rule, $current_post ) {
		$post_type = get_post_type( $current_post->ID);

		if ( $rule['operator'] == "==" ) {
			$match = ( $post_type === $rule['value'] );
		}
		elseif ( $rule['operator'] == "!=" ) {
			$match = ( $post_type !== $rule['value'] );
		}


		return $match;
	}


	/*
	*  rule_match_post
	*
	*  @description:
	*  @since: 3.5.7
	*  @created: 3/01/13
	*/

	function rule_match_post( $match, $rule, $current_post ) {
		// validation
		if ( !$current_post->ID) {
			return false;
		}


		// translate $rule['value']
		// - this variable will hold the original post_id, but $current_post->ID will hold the translated version
		//if( function_exists('icl_object_id') )
		//{
		// $rule['value'] = icl_object_id( $rule['value'], $options['post_type'], true );
		//}


		if ( $rule['operator'] == "==" ) {
			$match = ( $current_post->ID == $rule['value'] );
		}
		elseif ( $rule['operator'] == "!=" ) {
			$match = ( $current_post->ID != $rule['value'] );
		}

		return $match;

	}


	/*
	*  rule_match_page_type
	*
	*  @description:
	*  @since: 3.5.7
	*  @created: 3/01/13
	*/

	function rule_match_page_type( $match, $rule, $current_post ) {
		// validation
		if (  !$current_post->ID ) {
			return false;
		}

		$post = get_post(  $current_post->ID );

		if ( $rule['value'] == 'front_page' ) {

			$front_page = (int) get_option( 'page_on_front' );


			if ( $rule['operator'] == "==" ) {
				$match = ( $front_page == $post->ID );
			}
			elseif ( $rule['operator'] == "!=" ) {
				$match = ( $front_page != $post->ID );
			}

		}
		elseif ( $rule['value'] == 'posts_page' ) {

			$posts_page = (int) get_option( 'page_for_posts' );


			if ( $rule['operator'] == "==" ) {
				$match = ( $posts_page == $post->ID );
			}
			elseif ( $rule['operator'] == "!=" ) {
				$match = ( $posts_page != $post->ID );
			}

		}
		elseif ( $rule['value'] == 'top_level' ) {
			$post_parent = $post->post_parent;
			if ( $options['page_parent'] ) {
				$post_parent = $options['page_parent'];
			}


			if ( $rule['operator'] == "==" ) {
				$match = ( $post_parent == 0 );
			}
			elseif ( $rule['operator'] == "!=" ) {
				$match = ( $post_parent != 0 );
			}

		}
		elseif ( $rule['value'] == 'parent' ) {

			$children = get_pages( array(
					'post_type' => $post->post_type,
					'child_of' =>  $post->ID,
				) );


			if ( $rule['operator'] == "==" ) {
				$match = ( count( $children ) > 0 );
			}
			elseif ( $rule['operator'] == "!=" ) {
				$match = ( count( $children ) == 0 );
			}

		}
		elseif ( $rule['value'] == 'child' ) {

			$post_parent = $post->post_parent;
			if ( $options['page_parent'] ) {
				$post_parent = $options['page_parent'];
			}


			if ( $rule['operator'] == "==" ) {
				$match = ( $post_parent != 0 );
			}
			elseif ( $rule['operator'] == "!=" ) {
				$match = ( $post_parent == 0 );
			}

		}

		return $match;

	}


	/*
	*  rule_match_page_parent
	*
	*  @description:
	*  @since: 3.5.7
	*  @created: 3/01/13
	*/

	function rule_match_page_parent( $match, $rule, $current_post ) {
		// validation
		if ( ! $current_post->ID ) {
			return false;
		}


		// vars
		$post = get_post( $current_post->ID);

		$post_parent = $post->post_parent;
		if ( $options['page_parent'] ) {
			$post_parent = $options['page_parent'];
		}


		if ( $rule['operator'] == "==" ) {
			$match = ( $post_parent == $rule['value'] );
		}
		elseif ( $rule['operator'] == "!=" ) {
			$match = ( $post_parent != $rule['value'] );
		}


		return $match;

	}


	/*
	*  rule_match_page_template
	*
	*  @description:
	*  @since: 3.5.7
	*  @created: 3/01/13
	*/

	function rule_match_page_template( $match, $rule, $current_post) {

			$page_template = get_post_meta( $current_post->ID, '_wp_page_template', true );



		if ( ! $page_template ) {

				$post_type = get_post_type( $current_post->ID );

			if ( $post_type == 'page' ) {
				$page_template = "default";
			}
		}



		if ( $rule['operator'] == "==" ) {
			$match = ( $page_template === $rule['value'] );
		}
		elseif ( $rule['operator'] == "!=" ) {
			$match = ( $page_template !== $rule['value'] );
		}

		return $match;

	}


	/*
	*  rule_match_post_category
	*
	*  @description:
	*  @since: 3.5.7
	*  @created: 3/01/13
	*/

	function rule_match_post_category( $match, $rule, $current_post ) {
		// validate
		if ( !$current_post->ID ) {
			return false;
		}


		// post type

			$post_type = get_post_type( $current_post->ID );



		// vars
		$taxonomies = get_object_taxonomies( $post_type );

			// no terms? Load them from the post_id
			if ( empty( $terms ) ) {
				$all_terms = get_the_terms( $current_post->ID , 'category' );
				if ( $all_terms ) {
					foreach ( $all_terms as $all_term ) {
						$terms[] = $all_term->term_id;
					}
				}
			}


			// no terms at all?
			if ( empty( $terms ) ) {
				// If no ters, this is a new post and should be treated as if it has the "Uncategorized" (1) category ticked
				if ( is_array( $taxonomies ) && in_array( 'category', $taxonomies ) ) {
					$terms[] = '1';
				}
			}




		if ( $rule['operator'] == "==" ) {
			$match = false;

			if ( $terms ) {
				if ( in_array( $rule['value'], $terms ) ) {
					$match = true;
				}
			}

		}
		elseif ( $rule['operator'] == "!=" ) {
			$match = true;

			if ( $terms ) {
				if ( in_array( $rule['value'], $terms ) ) {
					$match = false;
				}
			}

		}


		return $match;

	}


	/*
	*  rule_match_user_type
	*
	*  @description:
	*  @since: 3.5.7
	*  @created: 3/01/13
	*/

	function rule_match_user_type( $match, $rule, $options ) {
		$user = wp_get_current_user();

		if ( $rule['operator'] == "==" ) {
			if ( $rule['value'] == 'super_admin' ) {
				$match = is_super_admin( $user->ID );
			}
			else {
				$match = in_array( $rule['value'], $user->roles );
			}

		}
		elseif ( $rule['operator'] == "!=" ) {
			if ( $rule['value'] == 'super_admin' ) {
				$match = !is_super_admin( $user->ID );
			}
			else {
				$match = ( ! in_array( $rule['value'], $user->roles ) );
			}
		}

		return $match;

	}



	/*
	*  rule_match_post_format
	*
	*  @description:
	*  @since: 3.5.7
	*  @created: 3/01/13
	*/

	function rule_match_post_format( $match, $rule, $options ) {
		// vars
		$post_format = $options['post_format'];
		if ( !$post_format ) {
			// validate
			if ( !$current_post->ID ) {
				return false;
			}


			// post type
			if ( !$options['post_type'] ) {
				$options['post_type'] = get_post_type( $current_post->ID );
			}


			// does post_type support 'post-format'
			if ( post_type_supports( $options['post_type'], 'post-formats' ) ) {
				$post_format = get_post_format( $current_post->ID );

				if ( $post_format === false ) {
					$post_format = 'standard';
				}
			}
		}


		if ( $rule['operator'] == "==" ) {
			$match = ( $post_format === $rule['value'] );

		}
		elseif ( $rule['operator'] == "!=" ) {
			$match = ( $post_format !== $rule['value'] );
		}



		return $match;

	}


	/*
	*  rule_match_post_status
	*
	*  @description:
	*  @since: 3.5.7
	*  @created: 3/01/13
	*/

	function rule_match_post_status( $match, $rule, $current_post ) {
		// validate
		if ( !$current_post->ID ) {
			return false;
		}


		// vars
		$post_status = get_post_status( $current_post->ID );


		// auto-draft = draft
		if ( $post_status == 'auto-draft' ) {
			$post_status = 'draft';
		}


		// match
		if ( $rule['operator'] == "==" ) {
			$match = ( $post_status === $rule['value'] );

		}
		elseif ( $rule['operator'] == "!=" ) {
			$match = ( $post_status !== $rule['value'] );
		}


		// return
		return $match;

	}


	/*
	*  rule_match_taxonomy
	*
	*  @description:
	*  @since: 3.5.7
	*  @created: 3/01/13
	*/

	function rule_match_taxonomy( $match, $rule, $current_post ) {
		// validate
		if ( !$current_post->ID ) {
			return false;
		}


		// post type

			$post_type = get_post_type( $current_post->ID );



		// vars
		$taxonomies = get_object_taxonomies( $post_type );




			// no terms? Load them from the post_id
			if ( empty( $terms ) ) {
				if ( is_array( $taxonomies ) ) {
					foreach ( $taxonomies as $tax ) {
						$all_terms = get_the_terms( $current_post->ID, $tax );
						if ( $all_terms ) {
							foreach ( $all_terms as $all_term ) {
								$terms[] = $all_term->term_id;
							}
						}
					}
				}
			}


			// no terms at all?
			if ( empty( $terms ) ) {
				// If no ters, this is a new post and should be treated as if it has the "Uncategorized" (1) category ticked
				if ( is_array( $taxonomies ) && in_array( 'category', $taxonomies ) ) {
					$terms[] = '1';
				}
			}



		if ( $rule['operator'] == "==" ) {
			$match = false;

			if ( $terms ) {
				if ( in_array( $rule['value'], $terms ) ) {
					$match = true;
				}
			}

		}
		elseif ( $rule['operator'] == "!=" ) {
			$match = true;

			if ( $terms ) {
				if ( in_array( $rule['value'], $terms ) ) {
					$match = false;
				}
			}

		}


		return $match;

	}


    /*
	*  rule_match_ef_taxonomy
	*
	*  @description:
	*  @since: 3.5.7
	*  @created: 3/01/13
	*/

	function rule_match_ef_taxonomy( $match, $rule, $current_post )
	{

		$ef_taxonomy = $options['ef_taxonomy'];


		if( $ef_taxonomy )
		{
			if($rule['operator'] == "==")
	        {
	        	$match = ( $ef_taxonomy == $rule['value'] );

	        	// override for "all"
		        if( $rule['value'] == "all" )
				{
					$match = true;
				}

	        }
	        elseif($rule['operator'] == "!=")
	        {
	        	$match = ( $ef_taxonomy != $rule['value'] );

	        	// override for "all"
		        if( $rule['value'] == "all" )
				{
					$match = false;
				}

	        }




		}


        return $match;

    }

}
