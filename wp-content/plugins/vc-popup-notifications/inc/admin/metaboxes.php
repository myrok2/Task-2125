<?php

/**
 * Adds a box to the main column on the Post and Page edit screens.
 */
class Vc_Popup_Notification_Metabox {

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

		add_action( 'add_meta_boxes', array( $this, 'vcpopup_admin_add_meta_box' ) );
		add_filter( 'vcpopup_get_location', array( $this, 'get_location' ), 5, 2 );
		add_filter( 'vcpopup_get_post_types', array( $this, 'get_post_types' ), 1, 3 );
		add_filter( 'vcpopup_get_taxonomies_for_select', array( $this, 'get_taxonomies_for_select' ), 1, 2 );
		add_action( 'vcpopup_create_field', array( $this, 'create_field' ), 1 );
		add_action( 'wp_ajax_vcpopup_render_location', array( $this, 'ajax_render_location' ) );
		add_action( 'save_post', array( $this, 'save_post' ) );

	}
	function vcpopup_admin_add_meta_box() {

		add_meta_box( 'vcpopup_location', __( "Popup Notification Location Rules", 'vcpopup' ), array( $this, 'vcpopup_html_location_box' ), 'vcpopup', 'normal', 'high' );

	}


	function vcpopup_html_location_box( $post ) {

		// Add a nonce field so we can check for it later.
		wp_nonce_field( 'vcpopup_html_location_box', 'vcpopup_html_location_box_nonce' );


		// vars
		$groups = apply_filters( 'vcpopup_get_location', array(), $post->ID );


		// at lease 1 location rule
		if ( empty( $groups ) ) {
			$groups = array(

				// group_0
				array(

					// rule_0
					array(
						'param'  => 'post_type',
						'operator' => '==',
						'value'  => 'post',
						'order_no' => 0,
						'group_no' => 0
					)
				)

			);
		}


?>
<!-- Hidden Fields -->
<div style="display:none;">
	<input type="hidden" name="vcpopup_nonce" value="<?php echo wp_create_nonce( 'vcpopup_condition' ); ?>" />
</div>
<!-- / Hidden Fields -->
<table class="vcpopup_input widefat" id="vcpopup_location">
	<tbody>
	<tr>
		<td class="label">
		<?php

		$vc_popup_show_cond = get_post_meta( $post->ID, 'vc_popup_show_cond', true );
?>
			<label for="post_type"><input type="radio" <?php  echo checked( $vc_popup_show_cond, 'global', true );  ?> value="global" name="vc_popup_show_cond"><?php _e( "Show Globally", 'vcpn' ); ?></label>
			<p class="description"><?php _e( "If this is checked then popup will be shown on all pages", 'vcpn' ); ?></p>
		</td>
		<td>
			<div class="location-groups">

<?php if ( is_array( $groups ) ): ?>
	<?php foreach ( $groups as $group_id => $group ):
				$group_id = 'group_' . $group_id;
?>
		<div class="location-group" data-id="<?php echo $group_id; ?>">
			<?php if ( $group_id == 'group_0' ): ?>
				<h4> <input type="radio" <?php  echo checked( $vc_popup_show_cond, 'not_global', true );  ?> value="not_global" name="vc_popup_show_cond"><?php _e( "Show only if", 'vcpn' ); ?></h4>
			<?php else: ?>
				<h4><?php _e( "or", 'vcpn' ); ?></h4>
			<?php endif; ?>
			<?php if ( is_array( $group ) ): ?>
			<table class="vcpopup_input widefat">
				<tbody>
					<?php foreach ( $group as $rule_id => $rule ):
				$rule_id = 'rule_' . $rule_id;
?>
					<tr data-id="<?php echo $rule_id; ?>">
					<td class="param"><?php

		$choices = array(
			__( "Basic", 'vcpn' ) => array(
				'post_type'  => __( "Post Type", 'vcpn' ),
				'user_type'  => __( "Logged in User Type", 'vcpn' ),
			),
			__( "Post", 'vcpn' ) => array(
				'post'   => __( "Post", 'vcpn' ),
				//'post_category' => __( "Post Category", 'vcpn' ),
				// 'post_format' => __( "Post Format", 'vcpn' ),
				// 'post_status' => __( "Post Status", 'vcpn' ),
				'taxonomy'  => __( "Taxonomy", 'vcpn' ),
			),
			__( "Page", 'vcpn' ) => array(
				'page'   => __( "Page", 'vcpn' ),
				'page_type'  => __( "Page Type", 'vcpn' ),
				//'page_parent' => __( "Page Parent", 'vcpn' ),
				'page_template' => __( "Page Template", 'vcpn' ),
			),
			// __( "Other", 'vcpn' ) => array(
			// 	'ef_media'  => __( "Attachment", 'vcpn' ),
			// 	'ef_taxonomy' => __( "Taxonomy Term", 'vcpn' ),
			// 	// 'ef_user'  => __( "User", 'vcpn' ),
			// )
		);


		// allow custom location rules
		$choices = apply_filters( 'vcpopup_rule_types', $choices );


		// create field
		$args = array(
			'type' => 'select',
			'name' => 'location[' . $group_id . '][' . $rule_id . '][param]',
			'value' => $rule['param'],
			'choices' => $choices,
		);

		do_action( 'vcpopup_create_field', $args );

		?></td>
					<td class="operator"><?php

		$choices = array(
			'==' => __( "is equal to", 'vcpn' ),
			'!=' => __( "is not equal to", 'vcpn' ),
		);


		// allow custom location rules
		$choices = apply_filters( 'vcpopup_rule_operators', $choices );


		// create field
		do_action( 'vcpopup_create_field', array(
				'type' => 'select',
				'name' => 'location[' . $group_id . '][' . $rule_id . '][operator]',
				'value' => $rule['operator'],
				'choices' => $choices
			) );

		?></td>
					<td class="value"><?php

		$this->ajax_render_location( array(
				'group_id' => $group_id,
				'rule_id' => $rule_id,
				'value' => $rule['value'],
				'param' => $rule['param'],
			) );

		?></td>
					<td class="add">
						<a href="#" class="location-add-rule button"><?php _e( "and", 'vcpn' ); ?></a>
					</td>
					<td class="remove">
						<a href="#" class="location-remove-rule vcpopup-button-remove">
							<span class="dashicons dashicons-minus"></span>
						</a>
					</td>
					</tr>
					<?php endforeach; ?>
				</tbody>
			</table>
			<?php endif; ?>
		</div>
	<?php endforeach; ?>

	<h4><?php _e( "or", 'vcpn' ); ?></h4>

	<a class="button location-add-group" href="#"><?php _e( "Add rule group", 'vcpn' ); ?></a>

<?php endif; ?>

			</div>
		</td>
	</tr>
	</tbody>
</table>

<?php
	}


	/*
	*  ajax_render_location
	*
	*  @description: creates the HTML for the field group location metabox. Called from both Ajax and PHP
	*  @since 3.1.6
	*  @created: 23/06/12
	*/

	function ajax_render_location( $options = array() ) {
		// defaults
		$defaults = array(
			'group_id' => 0,
			'rule_id' => 0,
			'value' => null,
			'param' => null,
		);

		$is_ajax = false;
		if ( isset( $_POST['nonce'] ) && wp_verify_nonce( $_POST['nonce'], 'vcpopup_nonce' ) ) {
			$is_ajax = true;
		}


		// Is AJAX call?
		if ( $is_ajax ) {
			$options = array_merge( $defaults, $_POST );
		}
		else {
			$options = array_merge( $defaults, $options );
		}

		// vars
		$choices = array();


		// some case's have the same outcome
		if ( $options['param'] == "page_parent" ) {
			$options['param'] = "page";
		}


		switch ( $options['param'] ) {
		case "post_type":

			// all post types except attachment
			$choices = apply_filters( 'vcpopup_get_post_types', array(), array( 'attachment' ) );

			break;


		case "page":

			$post_type = 'page';
			$posts = get_posts( array(
					'posts_per_page'   => -1,
					'post_type'     => $post_type,
					'orderby'     => 'menu_order title',
					'order'      => 'ASC',
					'post_status'    => 'any',
					'suppress_filters'   => false,
					'update_post_meta_cache' => false,
				) );

			if ( $posts ) {
				// sort into hierachial order!
				if ( is_post_type_hierarchical( $post_type ) ) {
					$posts = get_page_children( 0, $posts );
				}

				foreach ( $posts as $page ) {
					$title = '';
					$ancestors = get_ancestors( $page->ID, 'page' );
					if ( $ancestors ) {
						foreach ( $ancestors as $a ) {
							$title .= '- ';
						}
					}

					$title .= apply_filters( 'the_title', $page->post_title, $page->ID );


					// status
					if ( $page->post_status != "publish" ) {
						$title .= " ($page->post_status)";
					}

					$choices[ $page->ID ] = $title;

				}
				// foreach($pages as $page)

			}

			break;


		case "page_type" :

			$choices = array(
				'front_page' => __( "Front Page", 'vcpn' ),
				'posts_page' => __( "Posts Page", 'vcpn' ),
				'top_level'  => __( "Top Level Page (parent of 0)", 'vcpn' ),
				'parent'  => __( "Parent Page (has children)", 'vcpn' ),
				'child'   => __( "Child Page (has parent)", 'vcpn' ),
			);

			break;

		case "page_template" :

			$choices = array(
				'default' => __( "Default Template", 'vcpn' ),
			);

			$templates = get_page_templates();
			foreach ( $templates as $k => $v ) {
				$choices[$v] = $k;
			}

			break;

		case "post" :

			$post_types = get_post_types();

			unset( $post_types['page'], $post_types['attachment'], $post_types['revision'] , $post_types['nav_menu_item'], $post_types['vcpopup']  );

			if ( $post_types ) {
				foreach ( $post_types as $post_type ) {

					$posts = get_posts( array(
							'numberposts' => '-1',
							'post_type' => $post_type,
							'post_status' => array( 'publish', 'private', 'draft', 'inherit', 'future' ),
							'suppress_filters' => false,
						) );

					if ( $posts ) {
						$choices[$post_type] = array();

						foreach ( $posts as $post ) {
							$title = apply_filters( 'the_title', $post->post_title, $post->ID );

							// status
							if ( $post->post_status != "publish" ) {
								$title .= " ($post->post_status)";
							}

							$choices[$post_type][$post->ID] = $title;

						}
						// foreach($posts as $post)
					}
					// if( $posts )
				}
				// foreach( $post_types as $post_type )
			}
			// if( $post_types )


			break;

		case "post_category" :

			$terms = get_terms( 'category', array( 'hide_empty' => false ) );

			if ( !empty( $terms ) ) {

				foreach ( $terms as $term ) {

					$choices[ $term->term_id ] = $term->name;

				}

			}

			break;

		case "post_format" :

			$choices = get_post_format_strings();

			break;

		case "post_status" :

			$choices = array(
				'publish' => __( 'Publish' ),
				'pending' => __( 'Pending Review' ),
				'draft'  => __( 'Draft' ),
				'future' => __( 'Future' ),
				'private' => __( 'Private' ),
				'inherit' => __( 'Revision' ),
				'trash'  => __( 'Trash' )
			);

			break;

		case "user_type" :

			global $wp_roles;

			$choices = $wp_roles->get_names();

			if ( is_multisite() ) {
				$choices['super_admin'] = __( 'Super Admin' );
			}

			break;

		case "taxonomy" :

			$choices = array();
			$simple_value = true;
			$choices = apply_filters( 'vcpopup_get_taxonomies_for_select', $choices, $simple_value );

			break;

		case "ef_taxonomy" :

			$choices = array( 'all' => __( 'All', 'vcpn' ) );
			$taxonomies = get_taxonomies( array( 'public' => true ), 'objects' );

			foreach ( $taxonomies as $taxonomy ) {
				$choices[ $taxonomy->name ] = $taxonomy->labels->name;
			}

			// unset post_format (why is this a public taxonomy?)
			if ( isset( $choices['post_format'] ) ) {
				unset( $choices['post_format'] ) ;
			}


			break;

		case "ef_user" :

			global $wp_roles;

			$choices = array_merge( array( 'all' => __( 'All', 'vcpn' ) ), $wp_roles->get_names() );

			break;


		case "ef_media" :

			$choices = array( 'all' => __( 'All', 'vcpn' ) );

			break;

		}


		// allow custom location rules
		$choices = apply_filters( 'vcpopup_rule_values' . $options['param'], $choices );


		// create field
		do_action( 'vcpopup_create_field', array(
				'type' => 'select',
				'name' => 'location[' . $options['group_id'] . '][' . $options['rule_id'] . '][value]',
				'value' => $options['value'],
				'choices' => $choices,
			) );


		// ajax?
		if ( $is_ajax ) {
			die();
		}

	}



	/*
	*  get_taxonomies_for_select
	*
	*  @description:
	*  @since: 3.6
	*  @created: 27/01/13
	*/

	function get_taxonomies_for_select( $choices, $simple_value = false ) {
		// vars
		$post_types = get_post_types();


		if ( $post_types ) {
			foreach ( $post_types as $post_type ) {
				$post_type_object = get_post_type_object( $post_type );
				$taxonomies = get_object_taxonomies( $post_type );
				if ( $taxonomies ) {
					foreach ( $taxonomies as $taxonomy ) {
						if ( !is_taxonomy_hierarchical( $taxonomy ) ) continue;
						$terms = get_terms( $taxonomy, array( 'hide_empty' => false ) );
						if ( $terms ) {
							foreach ( $terms as $term ) {
								$value = $taxonomy . ':' . $term->term_id;

								if ( $simple_value ) {
									$value = $term->term_id;
								}

								$choices[$post_type_object->label . ': ' . $taxonomy][$value] = $term->name;
							}
						}
					}
				}
			}
		}

		return $choices;
	}


	/*
	*  get_post_types
	*
	*  @description:
	*  @since: 3.5.5
	*  @created: 16/12/12
	*/

	function get_post_types( $post_types, $exclude = array(), $include = array() ) {
		// get all custom post types
		$post_types = array_merge( $post_types, get_post_types() );


		// core include / exclude
		$acf_includes = array_merge( array(), $include );
		$acf_excludes = array_merge( array( 'acf', 'vcpopup', 'revision', 'nav_menu_item' ), $exclude );


		// include
		foreach ( $acf_includes as $p ) {
			if ( post_type_exists( $p ) ) {
				$post_types[ $p ] = $p;
			}
		}


		// exclude
		foreach ( $acf_excludes as $p ) {
			unset( $post_types[ $p ] );
		}


		return $post_types;

	}



	function create_field( $field ) {
		// vars
		$optgroup = false;
		$field = $this->load_field_defaults( $field );


		// determin if choices are grouped (2 levels of array)
		if ( is_array( $field['choices'] ) ) {
			foreach ( $field['choices'] as $k => $v ) {
				if ( is_array( $v ) ) {
					$optgroup = true;
				}
			}
		}


		// value must be array
		if ( !is_array( $field['value'] ) ) {
			// perhaps this is a default value with new lines in it?
			if ( strpos( $field['value'], "\n" ) !== false ) {
				// found multiple lines, explode it
				$field['value'] = explode( "\n", $field['value'] );
			}
			else {
				$field['value'] = array( $field['value'] );
			}
		}


		// trim value
		$field['value'] = array_map( 'trim', $field['value'] );


		// multiple select
		$multiple = '';
		// if( $field['multiple'] )
		// {
		//  // create a hidden field to allow for no selections
		//  echo '<input type="hidden" name="' . $field['name'] . '" />';

		//  $multiple = ' multiple="multiple" size="5" ';
		//  $field['name'] .= '[]';
		// }


		// html
		echo '<select id="' . $field['id'] . '" class="' . $field['class'] . '" name="' . $field['name'] . '" ' . $multiple . ' >';


		// null
		if ( $field['allow_null'] ) {
			echo '<option value="null">- ' . __( "Select", 'acf' ) . ' -</option>';
		}

		// loop through values and add them as options
		if ( is_array( $field['choices'] ) ) {
			foreach ( $field['choices'] as $key => $value ) {
				if ( $optgroup ) {
					// this select is grouped with optgroup
					if ( $key != '' ) echo '<optgroup label="'.$key.'">';

					if ( is_array( $value ) ) {
						foreach ( $value as $id => $label ) {
							$selected = in_array( $id, $field['value'] ) ? 'selected="selected"' : '';

							echo '<option value="'.$id.'" '.$selected.'>'.$label.'</option>';
						}
					}

					if ( $key != '' ) echo '</optgroup>';
				}
				else {
					$selected = in_array( $key, $field['value'] ) ? 'selected="selected"' : '';
					echo '<option value="'.$key.'" '.$selected.'>'.$value.'</option>';
				}
			}
		}

		echo '</select>';
	}


	/*
	*  load_field_defaults
	*
	*  @description: applies default values to the field after it has been loaded
	*  @since 3.5.1
	*  @created: 14/10/12
	*/

	function load_field_defaults( $field ) {
		// validate $field
		if ( !is_array( $field ) ) {
			$field = array();
		}


		// defaults
		$defaults = array(
			'key' => '',
			'label' => '',
			'name' => '',
			'_name' => '',
			'type' => 'text',
			'order_no' => 1,
			'instructions' => '',
			'required' => 0,
			'id' => '',
			'class' => '',
			'conditional_logic' => array(
				'status' => 0,
				'allorany' => 'all',
				'rules' => 0
			),
		);
		$field = array_merge( $defaults, $field );





		// class
		if ( !$field['class'] ) {
			$field['class'] = $field['type'];
		}


		// id
		if ( !$field['id'] ) {
			$id = $field['name'];
			$id = str_replace( '][', '_', $id );
			$id = str_replace( 'fields[', '', $id );
			$id = str_replace( '[', '-', $id ); // location rules (select) does'nt have "fields[" in it
			$id = str_replace( ']', '', $id );

			$field['id'] = 'vcpopup-field-' . $id;
		}


		// _name
		if ( !$field['_name'] ) {
			$field['_name'] = $field['name'];
		}


		// clean up conditional logic keys
		if ( !empty( $field['conditional_logic']['rules'] ) ) {
			$field['conditional_logic']['rules'] = array_values( $field['conditional_logic']['rules'] );
		}


		// return
		return $field;
	}

	/*
	*  save_post
	*
	*  @description: Saves the field / location / option data for a field group
	*/

	function save_post( $post_id ) {
		// do not save if this is an auto save routine
		if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
			return $post_id;
		}


		//verify nonce
		if ( !isset( $_POST['vcpopup_nonce'] ) || !wp_verify_nonce( $_POST['vcpopup_nonce'], 'vcpopup_condition' ) ) {
			return $post_id;
		}



		// only save once! WordPress save's a revision as well.
		if ( wp_is_post_revision( $post_id ) ) {
			return $post_id;
		}


		/*
		*  save location rules
		*/

		if ( isset( $_POST['location'] ) && is_array( $_POST['location'] ) ) {
			delete_post_meta( $post_id, 'rule' );


			// clean array keys
			$_POST['location'] = array_values( $_POST['location'] );
			foreach ( $_POST['location'] as $group_id => $group ) {
				if ( is_array( $group ) ) {
					// clean array keys
					$group = array_values( $group );
					foreach ( $group as $rule_id => $rule ) {
						$rule['order_no'] = $rule_id;
						$rule['group_no'] = $group_id;
						add_post_meta( $post_id, 'rule', $rule );
					}
				}
			}

			unset( $_POST['location'] );
		}

		if ( isset( $_POST['vc_popup_show_cond'] ) ) {
			update_post_meta( $post_id, 'vc_popup_show_cond', $_POST['vc_popup_show_cond'] );
		}




	}


	/*
	*  get_location
	*
	*/

	public static function get_location( $location, $post_id ) {
		// loaded by PHP already?
		if ( !empty( $location ) ) {
			return $location;
		}


		// vars
		$groups = array();
		$group_no = 0;


		// get all rules
		$rules = get_post_meta( $post_id, 'rule', false );

		if ( is_array( $rules ) ) {
			foreach ( $rules as $rule ) {
				// if field group was duplicated, it may now be a serialized string!
				$rule = maybe_unserialize( $rule );


				// does this rule have a group?
				// + groups were added in 4.0.4
				if ( !isset( $rule['group_no'] ) ) {
					$rule['group_no'] = $group_no;

					// sperate groups?
					if ( get_post_meta( $post_id, 'allorany', true ) == 'any' ) {
						$group_no++;
					}
				}


				// add to group
				$groups[ $rule['group_no'] ][ $rule['order_no'] ] = $rule;


				// sort rules
				ksort( $groups[ $rule['group_no'] ] );

			}

			// sort groups
			ksort( $groups );
		}


		// return fields
		return $groups;
	}



}
