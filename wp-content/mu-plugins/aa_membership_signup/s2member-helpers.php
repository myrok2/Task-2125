<?php namespace AgileAlliance\Membership\Signup\s2member\Helpers;

/**
 * Class S2Helper
 * @package AgileAlliance\Membership\Signup\s2member\Helpers
 */

Class S2Helper
{
	const S2LABEL_FORMAT = 'S2MEMBER_LEVEL%d_LABEL';

	/**
	 * Returns the level label, by passing the level integer
	 *
	 * @param $level
	 *
	 * @return mixed
	 */
	public static function get_label_by_level($level)
	{
		$result = constant(sprintf(self::S2LABEL_STRING, $level));
		return $result;
	}

	/**
	 * Returns the level number, by passing the level label string
	 *
	 * @param $label
	 *
	 * @return int
	 */
	public static function get_level_by_label($label)
	{
		for ($i = 0; $i <= MEMBERSHIP_LEVELS; $i++) {
			$tmp_label = constant(sprintf(self::S2LABEL_FORMAT, $i));
			if (strcasecmp($tmp_label, $label) === 0) {
				return $i; // Level number.
			}
		}
	}

}