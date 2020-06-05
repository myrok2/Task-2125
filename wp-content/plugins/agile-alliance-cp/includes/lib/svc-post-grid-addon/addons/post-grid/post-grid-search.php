<?php

	use Paradigm\Concepts\Functional as F;

	$search_script_handle = 'svc-post-grid-search';

	wp_localize_script($search_script_handle, 'searchObj', [
		'ajaxUrl' => admin_url( 'admin-ajax.php' ),
		'gridId' => $svc_grid_id
	]);

	wp_enqueue_script($search_script_handle);

	$query_loop_m = New F\Identity( $query_loop );
	$explode_curry = F\curry( 'explode', 2);
	$explode_pipe  = $explode_curry('|');
	$explode_colon = $explode_curry(':');
	$explode_comma = $explode_curry(',');

	$loop_settings = $query_loop_m
		->bind($explode_pipe);

	$post_types = $loop_settings
		->bind(function($set) {
			return $set[3];
		})
		->bind($explode_colon)
		->bind(function($set) {
			return $set[1];
		})
		->bind($explode_comma);

	$post_types_with_label = $post_types
		->bind(function($post_types) {
			$prefix = 'aa_';
			$pattern = '/^'.$prefix.'/';
			return array_reduce($post_types, function($carry, $item) use ($prefix, $pattern) {

				if (preg_match( $pattern, $item )) {
					$carry[$item] = str_replace( $prefix, '' , $item);
				} else {
					if ($item === 'post') {
						$carry[$item] = 'blog';
					} else {
						$carry[$item] = $item;
					}
				}

				if ( strpos($carry[$item], '_'  )  ) {
					$carry[$item] = str_replace( '_', ' ' , $carry[$item]  );
				}

				$carry[$item] = ucwords($carry[$item]);

				return $carry;

			}, []);

		});

	$post_types_to_html = $post_types_with_label
		->bind(function($post_types) {
			return array_chunk( $post_types, 3, true );
		})
		->bind(function($post_types_chuncks) {
			$html = '';

			foreach($post_types_chuncks as $chunck_key => $post_types_set) {
//				$html .= '<ul style="float:left; list-style-type: none; margin-right: 8px;">';
					foreach($post_types_set as $post_type => $post_type_label) {
						$html .= '<li>';
							$html .= '<div class="checkbox">';
								$html .= '<label>';
									$html .= '<input type="checkbox" value="'. $post_type.'" name="post-type">' . $post_type_label;
 								$html .= '</label>';
							$html .= '</div>';
						$html .= '</li>';
					}
//				$html .= '</ul>';

			}

			return $html;
		})
		->extract();

?>


<div class="resource-grid-search">
	<div class="container-fluid">
		<div class="col-md-4 resource-grid-search__section resource-grid-search__section--light">
			<span class="resource-grid-search__search-accent">
				<i class="fa fa-search"></i>
			</span>
			<input class="resource-grid-search__search aa_input" type="text" name="search-keyword" placeholder="Search Resources">
		</div>
		<div class="col-md-8 resource-grid-search__section resource-grid-search__section--dark resource-grid-search__tools">
			<div class="dropdown aa_dropdown">
				<button class="btn aa_fake-dropdown dropdown-toggle resource-grid-search__filter" type="button" id="filter" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
					Resource Type
					<i class="fa fa-chevron-down aa_icon"></i>
				</button>
				<ul class="dropdown-menu resource-grid-search__dropdown js-filter-dropdown" aria-labelledby="filter">
					<?php echo $post_types_to_html; ?>
				</ul>
			</div>
			<div class="aa_dropdown">
				<div class="dropdown aa_dropdown">
					<button class="btn aa_fake-dropdown dropdown-toggle resource-grid-search__sort" type="button" id="sort" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
						Sort : <span id="current-sort-option"></span>
						<i class="fa fa-chevron-down aa_icon"></i>
					</button>
					<ul class="dropdown-menu resource-grid-search__dropdown" aria-labelledby="sort">
						<li><a href="#desc">Newest</a></li>
						<li><a href="#asc">Oldest</a></li>
					</ul>
				</div>
			</div>
			<button id="search-submit" class="btn aa_btn aa_border-purple aa_border-purple-primary">Search</button>
		</div>
	</div>
</div>

<div id="total-results-found" style="text-align: center; margin-bottom: 18px; font-size: 1em; font-style: italic; display:none;">
	Found <span id="results-num">15</span> result<span id="results-is-plural" style="display:none;">s</span>
</div>


