<?php

class Opt_In_Condition_Page_Templates extends Opt_In_Condition_Abstract {
	public function is_allowed( Hustle_Model $optin ){

		if ( isset( $this->args->templates ) ) {

			if ( 'except' === $this->args->filter_type ) {
				return ! in_array( get_page_template_slug( get_the_ID() ), $this->args->templates, true );
			} elseif ( 'only' === $this->args->filter_type ) {
				return in_array( get_page_template_slug( get_the_ID() ), $this->args->templates, true );
			}
		}

		return true;
	}

	public function label() {
		return isset( $this->args->templates ) ? __( 'For Specific template', 'wordpress-popup') : "";
	}
}
