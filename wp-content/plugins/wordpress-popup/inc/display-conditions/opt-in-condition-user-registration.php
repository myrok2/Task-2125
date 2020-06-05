<?php

class Opt_In_Condition_User_Registration extends Opt_In_Condition_Abstract {
	public function is_allowed( Hustle_Model $optin ){

		if ( ! empty( $this->args->from_date ) && is_user_logged_in() ) {

			$user = get_userdata( get_current_user_id() );
			$registration_date = $user->user_registered;
			$show_from_date = strtotime( "+". $this->args->from_date . " days", strtotime( $registration_date ) );
			$today = strtotime( date('Y/m/d') );

			if( ! empty( $this->args->to_date ) ) {
				$show_to_date = strtotime( "+" . $this->args->to_date . " days", strtotime( $registration_date ) );
				if( $today >= $show_from_date && $today <= $show_to_date ){
					return true;
				}else{
					return false;
				}
			} elseif( $today >= $show_from_date ) {
				return true;
			} else {
				return false;
			}

		}

		return true;
	}

	public function label() {
		return isset( $this->args->from_reg ) ? __("Show based on registration date", 'wordpress-popup') : null;
	}
}
