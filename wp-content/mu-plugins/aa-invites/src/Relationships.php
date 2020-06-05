<?php namespace AgileAlliance\Invites;

class Relationships {

	protected $relationship = [];

	public function __construct() {
		$this->relationship[] = [
			'name' => 'sender_to_invite',
			'from' => 'user',
			'to' => 'invite',
			'cardinality' => 'one-to-many',
			'reciprocal' => true,
			'self_connections' => false,
			'title' => 'Invite Sender',
			'can_create_post' => false
		];
	}

	public function __invoke() {
		array_reduce($this->relationship, function($carry, $item){
			p2p_register_connection_type($item);
		});
	}

}