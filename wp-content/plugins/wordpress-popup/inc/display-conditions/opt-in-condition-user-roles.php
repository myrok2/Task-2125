<?php

class Opt_In_Condition_User_Roles extends Opt_In_Condition_Abstract {
	public function is_allowed( Hustle_Model $optin ){
		if ( ! empty( $this->args->filter_type ) && is_user_logged_in() ) {
			$user 		 = wp_get_current_user();
			$roles 		 = ( array ) $user->roles;
			$valid_roles = array_intersect( $roles, $this->args->roles );

			if( 'except' === $this->args->filter_type ) {
				return empty( $valid_roles );
			} elseif( 'only' === $this->args->filter_type ) {
				return ! empty( $valid_roles );
			}

		}

		return true;
	}

	public function label() {
		if ( ! empty( $this->args->filter_type ) ) {
			return isset( $this->args->roles ) ? __( 'For specific roles', 'wordpress-popup') : "";
		}

		return '';
	}
}
