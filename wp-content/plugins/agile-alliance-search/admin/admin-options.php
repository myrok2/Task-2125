<?php
namespace aa\search\admin;

if (!defined('ABSPATH')) {
	exit; // Exit if accessed directly.
}

class AASearchAdminOptions {
	/**
	 * Holds the values to be used in the fields callbacks
	 */
	private $options;

	/**
	 * Start up
	 */
	public function __construct() {
		add_action('admin_menu', array($this, 'add_plugin_page'));
		add_action('admin_init', array($this, 'page_init'));
	}

	/**
	 * Add options page
	 */
	public function add_plugin_page() {
		// This page will be under "Settings"
		add_options_page(
			'Search Settings',
			'Search',
			'manage_options',
			'aa-search',
			array($this, 'create_admin_page')
		);
	}

	/**
	 * Options page callback
	 */
	public function create_admin_page() {
		// Set class property
		$this->options = get_option('aa_search_option');
		?>
		<div class="wrap">
			<h1>Search Settings</h1>
			<form method="post" action="options.php">
				<?php
				// This prints out all hidden setting fields
				settings_fields('aa_search_options');
				do_settings_sections('aa-search');
				submit_button();
				?>
			</form>
		</div>
		<?php
	}

	public function reindex_section() {
		?>
		<style>
			.aa-search__indexing {
				padding: 7px 20px 20px 20px;
				background-color: rgba(29, 20, 20, 0.08);
				border: 1px solid rgba(0, 0, 0, 0.14);
				border-radius: 3px;
				box-shadow: 2px 2px 2px rgba(0, 0, 0, 0.18) inset;
			}
		</style>
		<div class="aa-search__indexing">
			<p>The controls below allow the index to be updated and reset. Resetting the index will leave it empty so be sure to rebuild it afterwards.</p>
			<ul>
				<li><strong>Rebuild Index</strong> - Updates any existing items in the database and adds any new ones.</li>
				<li><strong>Reset Index</strong> - Deletes the index and re-creates it with the hardcoded settings of the plugin. Necessary if changes to ElasticSearch mappings or index settings have been made.</li>
			</ul>
			<p>
				<span class="code aa-search__indexing-status js-indexing-status"></span>
			</p>
			<button type="button" class="button button-primary js-indexing-trigger">Rebuild Index</button>
<!--			<button type="button" class="button button-primary js-mapping-trigger">Re-map Index</button>-->
			<button type="button" class="button button-secondary js-reset-trigger">Reset Index (This will delete everything in the index)</button>
		</div>
		<?php
	}

	/**
	 * Register and add settings
	 */
	public function page_init() {
		register_setting(
			'aa_search_options', // Option group
			'aa_search_option', // Option name
			array($this, 'sanitize') // Sanitize
		);

		add_settings_section(
			'aa_search_re-index', // IDSE
			'Index Maintenance', // Title
			array($this, 'reindex_section'), // Callback
			'aa-search' // Page
		);

		add_settings_section(
			'aa_search_integrations', // ID
			'Integrations', // Title
			null, // Callback
			'aa-search' // Page
		);
		add_settings_field(
			'replace_search',
			'Replace Search',
			array($this, 'replace_search_callback'),
			'aa-search',
			'aa_search_integrations'
		);
		add_settings_field(
			'replace_archive',
			'Replace Archives',
			array($this, 'replace_archive_callback'),
			'aa-search',
			'aa_search_integrations'
		);
	}

	/**
	 * Sanitize each setting field as needed
	 */
	public function sanitize($input) {
		$new_input = array();

		if(isset($input['replace_search']))
			$new_input['replace_search'] = filter_var($input['replace_search'], FILTER_VALIDATE_BOOLEAN);

		if(isset($input['replace_archive']))
			$new_input['replace_archive'] = filter_var($input['replace_archive'], FILTER_VALIDATE_BOOLEAN);

		return $new_input;
	}


	/**
	 * Get the settings option array and print one of its values
	 */
	public function replace_search_callback() {
		$checked = isset($this->options['replace_search']) && $this->options['replace_search']
			? 'checked'
			: '';
		echo "<input type=\"checkbox\" id=\"replace_search\" name=\"aa_search_option[replace_search]\" $checked />";
	}
	public function replace_archive_callback() {
		$checked = isset($this->options['replace_archive']) && $this->options['replace_archive']
			? 'checked'
			: '';
		echo "<input type=\"checkbox\" id=\"replace_archive\" name=\"aa_search_option[replace_archive]\" $checked />";
	}
}

if(is_admin()){
	new AASearchAdminOptions();
}
