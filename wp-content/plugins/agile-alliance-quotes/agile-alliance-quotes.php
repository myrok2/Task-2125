<?php
/*
 * Plugin Name: Agile Alliance Quotes
 * Version: 1.0
 * Plugin URI:
 * Description: Creates a widget area for Agile Alliance Quotes - Functionality based on daily-inspiration by ronbeauchamp from 1-13-2013.
 * Author: 352 Inc - Agile Alliance Team
 * Author URI: http://www.threefivetwo.com/
 * Requires at least: 4.0
 * Tested up to: 4.3.1
 *
 * Text Domain: aa-quotes
 * Domain Path: /lang/
 *
 * @package WordPress
 */

class AA_Quotes_Widget extends WP_Widget {

	/**
	 * Register widget with WordPress.
	 */
	function __construct() {
		parent::__construct(
			'AA_Quotes_Widget', // Base ID
			__( 'Agile Alliance Quotes', 'agile-alliance-quotes' ), // Name
			array( 'description' => __( 'Random Quotes for the Agile Alliance header image areas.',
				'agile-alliance-quotes'	), )
			// Args
		);
	}

	/**
	 * Front-end display of widget.
	 *
	 * @see WP_Widget::widget()
	 *
	 * @param array $args     Widget arguments.
	 * @param array $instance Saved values from database.
	 */
	public function widget( $args, $instance ) {
		$data = get_option('agilealliance_quotes');
		echo $args['before_widget'];
		echo $args['before_title'] . $data[''] . $args['after_title'];

		?>

			<div class="col-xs-12 col-sm-8 col-sm-offset-2 resources-headline">
			<?php
			/* Display Quotes */


			$quotes = array(
				"Commitment leads to action. Action brings your dream closer.\"</h2>
<br/><div class='quote-author'>- Marcia Wieder</div>",

				"People who don't take risks generally make about two big mistakes a year. People who do take risks generally make about two big mistakes a year.\"</h2>
<br/><div class='quote-author'>- Peter Drucker </div>",

				"Cherish your visions and your dreams as they are the children of your soul, the blueprints of your ultimate achievements.\"</h2>
<br/><div class='quote-author'>- Napoleon Hill </div>",

				"Old friends pass away, new friends appear. It is just like the days. An old day passes, a new day arrives. The important thing is to make it meaningful: a meaningful friend - or a meaningful day.\"</h2>
<br/><div class='quote-author'>- Dalai Lama </div>",

				"When I let go of what I am, I become what I might be\"</h2>
<br/><div class='quote-author'>- Lao Tzu </div>",

				"Every artist was first an amateur.\"</h2>
<br/><div class='quote-author'>- Ralph Waldo Emerson</div>",

				"People often say that this or that person has not yet found himself. But the self is not something one finds, it is something one creates.\"</h2>
<br/><div class='quote-author'>- Thomas S. Szasz </div>",

				"Unless you try to do something beyond what you have already mastered, you will never grow.\"</h2>
<br/><div class='quote-author'>- Ralph Waldo Emerson </div>",

				"Many of life's failures are people who did not realize how close they were to success when they gave up.\"</h2>
<br/><div class='quote-author'>- Thomas Edison</div>",

				"It doesn't matter where you are coming from. All that matters is where you are going.\"</h2>
<br/><div class='quote-author'>- Brian Tracy</div>",

				"Instead of worrying about what people say of you, why not spend time trying to accomplish something they will admire.\"</h2>
<br/><div class='quote-author'>- Dale Carnegie </div>",

				"All our dreams can come true, if we have the courage to pursue them.\"</h2>
<br/><div class='quote-author'>- Walt Disney </div>",

				"The future belongs to those who believe in the beauty of their dreams.\"</h2>
<br/><div class='quote-author'>- Eleanor Roosevelt</div>",

				"Wealth, like happiness, is never attained when sought after directly. It comes as a byproduct of providing a useful service.\"</h2>
<br/><div class='quote-author'>- Henry Ford </div>",

				"Don't judge those who try and fail, judge those who fail to try.\"</h2>
<br/><div class='quote-author'>- Unknown</div>",

				"I can accept failure, everyone fails at something. But I can't accept not trying.\"</h2>
<br/><div class='quote-author'>- Michael Jordan </div>",

				"Opportunities are like sunrises. If you wait too long, you miss them.\"</h2>
<br/><div class='quote-author'>- Unknown</div>",

				"Once you have mastered time, you will understand how true it is that most people overestimate what they can accomplish in a year - and underestimate what they can achieve in a decade.\"</h2>
<br/><div class='quote-author'>- Tony Robbins </div>",

				"The only thing in life achieved without effort is failure.\"</h2>
<br/><div class='quote-author'>- Unknown</div>",

				"If I'd had some set idea of a finish line, don't you think I would have crossed it years ago?\"</h2>
<br/><div class='quote-author'>- Bill Gates </div>",

				"The truth is that there is nothing noble in being superior to somebody else. The only real nobility is in being superior to your former self.\"</h2>
<br/><div class='quote-author'>- Whitney Young</div>",

				"Success isn't a result of spontaneous combustion. You must set yourself on fire.\"</h2>
<br/><div class='quote-author'>- Arnold H. Glasow </div>",

				"Most people have no idea of the giant capacity we can immediately command when we focus all of our resources on mastering a single area of our lives.\"</h2>
<br/><div class='quote-author'>- Tony Robbins </div>",

				"Are you bored with life? Then throw yourself into some work you believe in with all your heart, live for it, die for it, and you will find happiness that you had thought could never be yours.\"</h2>
<br/><div class='quote-author'>- Dale Carnegie </div>",

				"Failure is not a single, cataclysmic event. You don't fail overnight. Instead, failure is a few errors in judgement, repeated every day.\"</h2>
<br/><div class='quote-author'>- Jim Rohn </div>",

				"Do not anticipate trouble, or worry about what may never happen. Keep in the sunlight.\"</h2>
<br/><div class='quote-author'>- Benjamin Franklin</div>",

				"Happiness depends more on the inward disposition of mind than on outward circumstances.\"</h2>
<br/><div class='quote-author'>- Benjamin Franklin</div>",

				"What we plant in the soil of contemplation, we shall reap in the harvest of action.\"</h2>
<br/><div class='quote-author'>- Meister Eckhart </div>",

				"Success is getting what you want. Happiness is wanting what you get.\"</h2>
<br/><div class='quote-author'>- Dale Carnegie</div>",

				"Justice consists not in being neutral between right and wrong, but in finding out the right and upholding it, wherever found, against the wrong.\"</h2>
<br/><div class='quote-author'>- Theodore Roosevelt</div>",

				"Don't aim for success if you want it; just do what you love and believe in, and it will come naturally.\"</h2>
<br/><div class='quote-author'>- David Frost </div>",

				"A real decision is measured by the fact that you've taken a new action. If there's no action, you haven't truly decided.\"</h2>
<br/><div class='quote-author'>- Tony Robbins </div>",

				"Happy are those who dream dreams and are ready to pay the price to make them come true.\"</h2>
<br/><div class='quote-author'>- Leon J. Suenes</div>",

				"The only way of finding the limits of the possible is by going beyond them into the impossible.\"</h2>
<br/><div class='quote-author'>- Arthur C. Clarke</div>",

				"You cannot dream yourself into a character: you must hammer and forge yourself into one.\"</h2>
<br/><div class='quote-author'>- Henry D. Thoreau</div>",

				"Knowing is not enough; we must apply. Willing is not enough; we must do.\"</h2>
<br/><div class='quote-author'>- Johann Wolfgang von Goethe</div>",

				"Think twice before you speak, because your words and influence will plant the seed of either success or failure in the mind of another.\"</h2>
<br/><div class='quote-author'>- Napoleon Hill </div>",

				"Keep steadily before you the fact that all true success depends at last upon yourself.\"</h2>
<br/><div class='quote-author'>- Theodore T. Hunger</div>",

				"I've learned that people will forget what you said, people will forget what you did, but people will never forget how you made them feel.\"</h2>
<br/><div class='quote-author'>- Maya Angelou</div>",

				"The talent of success is nothing more than doing what you can do, well.\"</h2>
<br/><div class='quote-author'>- Henry W. Longfellow</div>",

				"We are all faced with a series of great opportunities brilliantly disguised as impossible situations.\"</h2>
<br/><div class='quote-author'>- Charles R. Swindoll </div>",

				"If you want others to be happy, practice compassion. If you want to be happy, practice compassion.\"</h2>
<br/><div class='quote-author'>- Dalai Lama </div>",

				"Life shrinks or expands in proportion to one's courage.\"</h2>
<br/><div class='quote-author'>- Anais Nin</div>",

				"I've learned that you shouldn't go through life with a catcher's mitt on both hands; you need to be able to throw something back.\"</h2>
<br/><div class='quote-author'>- Maya Angelou </div>",

				"Success is not final, failure is not fatal: it is the courage to continue that counts.\"</h2>
<br/><div class='quote-author'>- Winston Churchill </div>",

				"Know where to find the information and how to use it - That's the secret of success.\"</h2>
<br/><div class='quote-author'>- Albert Einstein </div>",

				"I've failed over and over and over again in my life and that is why I succeed.\"</h2>
<br/><div class='quote-author'>- Michael Jordan </div>",

				"Anyone who stops learning is old, whether at twenty or eighty. Anyone who keeps learning stays young. The greatest thing in life is to keep your mind young.\"</h2>
<br/><div class='quote-author'>- Henry Ford </div>",

				"Success is how high you bounce when you hit bottom.\"</h2>
<br/><div class='quote-author'>- George S. Patton</div>",

				"You can't expect abundance to work in just one direction. If the tide only came in we would all drown.\"</h2>
<br/><div class='quote-author'>- Unknown</div>",

				"If you have built castles in the air, your work need not be lost; that is where they should be. Now put foundations under them.\"</h2>
<br/><div class='quote-author'>- Henry David Thoreau</div>",

				"If there is any one secret of success, it lies in the ability to get the other person's point of view and see things from that person's angle as well as from your own.\"</h2>
<br/><div class='quote-author'>- Henry Ford </div>",

				"People take different roads seeking fulfillment and happiness. Just because they're not on your road doesn't mean they've gotten lost.\"</h2>
<br/><div class='quote-author'>- Dalai Lama</div>",

				"Happiness is not achieved by the conscious pursuit of happiness; it is generally the byproduct of other activities.\"</h2>
<br/><div class='quote-author'>- Aldous Huxley</div>",

				"Great spirits have always encountered violent opposition from mediocre minds.\"</h2>
<br/><div class='quote-author'>- Albert Einstein</div>",

				"If you are not willing to risk the unusual, you will have to settle for the ordinary.\"</h2>
<br/><div class='quote-author'>- Jim Rohn </div>",

				"Give me six hours to chop down a tree and I will spend the first four sharpening the axe.\"</h2>
<br/><div class='quote-author'>- Abraham Lincoln </div>",

				"The difference between a successful person and others is not a lack of strength, not a lack of knowledge, but rather a lack in will.\"</h2>
<br/><div class='quote-author'>- Vince Lombardi</div>",

				"You can't build a reputation on what you are going to do.\"</h2>
<br/><div class='quote-author'>- Henry Ford</div>",

				"I never looked at the consequences of missing a big shot... when you think about the consequences you always think of a negative result.\"</h2>
<br/><div class='quote-author'>- Michael Jordan </div>",

				"It is literally true that you can succeed best and quickest by helping others to succeed.\"</h2>
<br/><div class='quote-author'>- Napoleon Hill </div>",

				"Nothing is predestined: The obstacles of your past can become the gateways that lead to new beginnings.\"</h2>
<br/><div class='quote-author'>- Ralph Blum</div>",

				"The two most important requirements for major success are: first, being in the right place at the right time, and second, doing something about it.\"</h2>
<br/><div class='quote-author'>- Ray Kroc </div>",

				"Instead of worrying about what people say of you, why not spend time trying to accomplish something they will admire.\"</h2>
<br/><div class='quote-author'>- Dale Carnegie </div>",

				"Your imagination is your preview of life's coming attractions.\"</h2>
<br/><div class='quote-author'>- Albert Einstein</div>",

				"In the absence of clearly-defined goals, we become strangely loyal to performing daily trivia until ultimately we become enslaved by it.\"</h2>
<br/><div class='quote-author'>- Robert Heinlein</div>",

				"There is no passion to be found playing small - in settling for a life that is less than the one you are capable of living.\"</h2>
<br/><div class='quote-author'>- Nelson Mandela </div>",

				"The big secret in life is that there is no big secret. Whatever your goal, you can get there if you're willing to work.\"</h2>
<br/><div class='quote-author'>- Oprah Winfrey</div>",

				"Happiness is not something you postpone for the future; it is something you design for the present.\"</h2>
<br/><div class='quote-author'>- Jim Rohn </div>",

				"For to be free is not merely to cast off one's chains, but to live in a way that respects and enhances the freedom of others.\"</h2>
<br/><div class='quote-author'>- Nelson Mandela </div>",

				"All growth depends upon activity. There is no development physically or intellectually without effort, and effort means work.\"</h2>
<br/><div class='quote-author'>- Calvin Coolidge</div>",

				"It was a high counsel that I once heard given to a young person, \"Always do what you are afraid to do.\"\"</h2>
<br/><div class='quote-author'>- Ralph Waldo Emerson</div>",

				"Success is the good fortune that comes from aspiration, desperation, perspiration and inspiration.\"</h2>
<br/><div class='quote-author'>- Evan Esar</div>",

				"Success does not consist in never making blunders, but in never making the same one a second time.\"</h2>
<br/><div class='quote-author'>- Josh Billings</div>",

				"The great thing in the world is not so much where we stand as in what direction we are moving.\"</h2>
<br/><div class='quote-author'>- Oliver Wendell Holmes</div>",

				"Thousands of candles can be lit from a single candle, and the life of the candle will not be shortened. Happiness never decreases by being shared.\"</h2>
<br/><div class='quote-author'>- Buddha </div>",

				"Only after we can learn to forgive ourselves can we accept others as they are because we don't feel threatened by anything about them which is better than us.\"</h2>
<br/><div class='quote-author'>- Stephen Covey </div>",

				"When you judge another, you do not define them, you define yourself.\"</h2>
<br/><div class='quote-author'>- Wayne Dyer </div>",

				"After the game, the king and the pawn go into the same box.\"</h2>
<br/><div class='quote-author'>- Italian Proverb</div>",

				"We are the creative force of our life, and through our own decisions rather than our conditions, if we carefully learn to do certain things, we can accomplish those goals.\"</h2>
<br/><div class='quote-author'>- Stephen Covey </div>",

				"Character is like a tree and reputation like a shadow. The shadow is what we think of it; the tree is the real thing.\"</h2>
<br/><div class='quote-author'>- Abraham Lincoln </div>",

				"Commitment leads to action. Action brings your dream closer.\"</h2>
<br/><div class='quote-author'>- Marcia Wieder</div>",

				"People who don't take risks generally make about two big mistakes a year. People who do take risks generally make about two big mistakes a year.\"</h2>
<br/><div class='quote-author'>- Peter Drucker </div>",

				"Cherish your visions and your dreams as they are the children of your soul, the blueprints of your ultimate achievements.\"</h2>
<br/><div class='quote-author'>- Napoleon Hill </div>",

				"Old friends pass away, new friends appear. It is just like the days. An old day passes, a new day arrives. The important thing is to make it meaningful: a meaningful friend - or a meaningful day.\"</h2>
<br/><div class='quote-author'>- Dalai Lama </div>",

				"When I let go of what I am, I become what I might be\"</h2>
<br/><div class='quote-author'>- Lao Tzu </div>",

				"Every artist was first an amateur.\"</h2>
<br/><div class='quote-author'>- Ralph Waldo Emerson</div>",

				"People often say that this or that person has not yet found himself. But the self is not something one finds, it is something one creates.\"</h2>
<br/><div class='quote-author'>- Thomas S. Szasz </div>",

				"Unless you try to do something beyond what you have already mastered, you will never grow.\"</h2>
<br/><div class='quote-author'>- Ralph Waldo Emerson </div>",

				"Many of life's failures are people who did not realize how close they were to success when they gave up.\"</h2>
<br/><div class='quote-author'>- Thomas Edison</div>",

				"It doesn't matter where you are coming from. All that matters is where you are going.\"</h2>
<br/><div class='quote-author'>- Brian Tracy</div>",

				"Instead of worrying about what people say of you, why not spend time trying to accomplish something they will admire.\"</h2>
<br/><div class='quote-author'>- Dale Carnegie </div>",

				"All our dreams can come true, if we have the courage to pursue them.\"</h2>
<br/><div class='quote-author'>- Walt Disney </div>",

				"The future belongs to those who believe in the beauty of their dreams.\"</h2>
<br/><div class='quote-author'>- Eleanor Roosevelt</div>",

				"Wealth, like happiness, is never attained when sought after directly. It comes as a byproduct of providing a useful service.\"</h2>
<br/><div class='quote-author'>- Henry Ford </div>",

				"Don't judge those who try and fail, judge those who fail to try.\"</h2>
<br/><div class='quote-author'>- Unknown</div>",

				"I can accept failure, everyone fails at something. But I can't accept not trying.\"</h2>
<br/><div class='quote-author'>- Michael Jordan </div>",

				"Opportunities are like sunrises. If you wait too long, you miss them.\"</h2>
<br/><div class='quote-author'>- Unknown</div>",

				"Once you have mastered time, you will understand how true it is that most people overestimate what they can accomplish in a year - and underestimate what they can achieve in a decade.\"</h2>
<br/><div class='quote-author'>- Tony Robbins </div>",

				"The only thing in life achieved without effort is failure.\"</h2>
<br/><div class='quote-author'>- Unknown</div>",

				"If I'd had some set idea of a finish line, don't you think I would have crossed it years ago?\"</h2>
<br/><div class='quote-author'>- Bill Gates </div>",

				"The truth is that there is nothing noble in being superior to somebody else. The only real nobility is in being superior to your former self.\"</h2>
<br/><div class='quote-author'>- Whitney Young</div>",

				"Success isn't a result of spontaneous combustion. You must set yourself on fire.\"</h2>
<br/><div class='quote-author'>- Arnold H. Glasow </div>",

				"Most people have no idea of the giant capacity we can immediately command when we focus all of our resources on mastering a single area of our lives.\"</h2>
<br/><div class='quote-author'>- Tony Robbins </div>",

				"Are you bored with life? Then throw yourself into some work you believe in with all your heart, live for it, die for it, and you will find happiness that you had thought could never be yours.\"</h2>
<br/><div class='quote-author'>- Dale Carnegie </div>",

				"Failure is not a single, cataclysmic event. You don't fail overnight. Instead, failure is a few errors in judgement, repeated every day.\"</h2>
<br/><div class='quote-author'>- Jim Rohn </div>",

				"Do not anticipate trouble, or worry about what may never happen. Keep in the sunlight.\"</h2>
<br/><div class='quote-author'>- Benjamin Franklin</div>",

				"Happiness depends more on the inward disposition of mind than on outward circumstances.\"</h2>
<br/><div class='quote-author'>- Benjamin Franklin</div>",

				"What we plant in the soil of contemplation, we shall reap in the harvest of action.\"</h2>
<br/><div class='quote-author'>- Meister Eckhart </div>",

				"Success is getting what you want. Happiness is wanting what you get.\"</h2>
<br/><div class='quote-author'>- Dale Carnegie</div>",

				"Justice consists not in being neutral between right and wrong, but in finding out the right and upholding it, wherever found, against the wrong.\"</h2>
<br/><div class='quote-author'>- Theodore Roosevelt</div>",

				"Don't aim for success if you want it; just do what you love and believe in, and it will come naturally.\"</h2>
<br/><div class='quote-author'>- David Frost </div>",

				"A real decision is measured by the fact that you've taken a new action. If there's no action, you haven't truly decided.\"</h2>
<br/><div class='quote-author'>- Tony Robbins </div>",

				"Happy are those who dream dreams and are ready to pay the price to make them come true.\"</h2>
<br/><div class='quote-author'>- Leon J. Suenes</div>",

				"The only way of finding the limits of the possible is by going beyond them into the impossible.\"</h2>
<br/><div class='quote-author'>- Arthur C. Clarke</div>",

				"You cannot dream yourself into a character: you must hammer and forge yourself into one.\"</h2>
<br/><div class='quote-author'>- Henry D. Thoreau</div>",

				"Knowing is not enough; we must apply. Willing is not enough; we must do.\"</h2>
<br/><div class='quote-author'>- Johann Wolfgang von Goethe</div>",

				"Think twice before you speak, because your words and influence will plant the seed of either success or failure in the mind of another.\"</h2>
<br/><div class='quote-author'>- Napoleon Hill </div>",

				"Keep steadily before you the fact that all true success depends at last upon yourself.\"</h2>
<br/><div class='quote-author'>- Theodore T. Hunger</div>",

				"I've learned that people will forget what you said, people will forget what you did, but people will never forget how you made them feel.\"</h2>
<br/><div class='quote-author'>- Maya Angelou</div>",

				"The talent of success is nothing more than doing what you can do, well.\"</h2>
<br/><div class='quote-author'>- Henry W. Longfellow</div>",

				"We are all faced with a series of great opportunities brilliantly disguised as impossible situations.\"</h2>
<br/><div class='quote-author'>- Charles R. Swindoll </div>",

				"If you want others to be happy, practice compassion. If you want to be happy, practice compassion.\"</h2>
<br/><div class='quote-author'>- Dalai Lama </div>",

				"Life shrinks or expands in proportion to one's courage.\"</h2>
<br/><div class='quote-author'>- Anais Nin</div>",

				"I've learned that you shouldn't go through life with a catcher's mitt on both hands; you need to be able to throw something back.\"</h2>
<br/><div class='quote-author'>- Maya Angelou </div>",

				"Success is not final, failure is not fatal: it is the courage to continue that counts.\"</h2>
<br/><div class='quote-author'>- Winston Churchill </div>",

				"Know where to find the information and how to use it - That's the secret of success.\"</h2>
<br/><div class='quote-author'>- Albert Einstein </div>",

				"I've failed over and over and over again in my life and that is why I succeed.\"</h2>
<br/><div class='quote-author'>- Michael Jordan </div>",

				"Anyone who stops learning is old, whether at twenty or eighty. Anyone who keeps learning stays young. The greatest thing in life is to keep your mind young.\"</h2>
<br/><div class='quote-author'>- Henry Ford </div>",

				"Success is how high you bounce when you hit bottom.\"</h2>
<br/><div class='quote-author'>- George S. Patton</div>",

				"You can't expect abundance to work in just one direction. If the tide only came in we would all drown.\"</h2>
<br/><div class='quote-author'>- Unknown</div>",

				"If you have built castles in the air, your work need not be lost; that is where they should be. Now put foundations under them.\"</h2>
<br/><div class='quote-author'>- Henry David Thoreau</div>",

				"If there is any one secret of success, it lies in the ability to get the other person's point of view and see things from that person's angle as well as from your own.\"</h2>
<br/><div class='quote-author'>- Henry Ford </div>",

				"People take different roads seeking fulfillment and happiness. Just because they're not on your road doesn't mean they've gotten lost.\"</h2>
<br/><div class='quote-author'>- Dalai Lama</div>",

				"Happiness is not achieved by the conscious pursuit of happiness; it is generally the byproduct of other activities.\"</h2>
<br/><div class='quote-author'>- Aldous Huxley</div>",

				"Great spirits have always encountered violent opposition from mediocre minds.\"</h2>
<br/><div class='quote-author'>- Albert Einstein</div>",

				"If you are not willing to risk the unusual, you will have to settle for the ordinary.\"</h2>
<br/><div class='quote-author'>- Jim Rohn </div>",

				"Give me six hours to chop down a tree and I will spend the first four sharpening the axe.\"</h2>
<br/><div class='quote-author'>- Abraham Lincoln </div>",

				"The difference between a successful person and others is not a lack of strength, not a lack of knowledge, but rather a lack in will.\"</h2>
<br/><div class='quote-author'>- Vince Lombardi</div>",

				"You can't build a reputation on what you are going to do.\"</h2>
<br/><div class='quote-author'>- Henry Ford</div>",

				"I never looked at the consequences of missing a big shot... when you think about the consequences you always think of a negative result.\"</h2>
<br/><div class='quote-author'>- Michael Jordan </div>",

				"It is literally true that you can succeed best and quickest by helping others to succeed.\"</h2>
<br/><div class='quote-author'>- Napoleon Hill </div>",

				"Nothing is predestined: The obstacles of your past can become the gateways that lead to new beginnings.\"</h2>
<br/><div class='quote-author'>- Ralph Blum</div>",

				"The two most important requirements for major success are: first, being in the right place at the right time, and second, doing something about it.\"</h2>
<br/><div class='quote-author'>- Ray Kroc </div>",

				"Instead of worrying about what people say of you, why not spend time trying to accomplish something they will admire.\"</h2>
<br/><div class='quote-author'>- Dale Carnegie </div>",

				"Your imagination is your preview of life's coming attractions.\"</h2>
<br/><div class='quote-author'>- Albert Einstein</div>",

				"In the absence of clearly-defined goals, we become strangely loyal to performing daily trivia until ultimately we become enslaved by it.\"</h2>
<br/><div class='quote-author'>- Robert Heinlein</div>",

				"There is no passion to be found playing small - in settling for a life that is less than the one you are capable of living.\"</h2>
<br/><div class='quote-author'>- Nelson Mandela </div>",

				"The big secret in life is that there is no big secret. Whatever your goal, you can get there if you're willing to work.\"</h2>
<br/><div class='quote-author'>- Oprah Winfrey</div>",

				"Happiness is not something you postpone for the future; it is something you design for the present.\"</h2>
<br/><div class='quote-author'>- Jim Rohn </div>",

				"For to be free is not merely to cast off one's chains, but to live in a way that respects and enhances the freedom of others.\"</h2>
<br/><div class='quote-author'>- Nelson Mandela </div>",

				"All growth depends upon activity. There is no development physically or intellectually without effort, and effort means work.\"</h2>
<br/><div class='quote-author'>- Calvin Coolidge</div>",

				"It was a high counsel that I once heard given to a young person, \"Always do what you are afraid to do.\"\"</h2>
<br/><div class='quote-author'>- Ralph Waldo Emerson</div>",

				"Success is the good fortune that comes from aspiration, desperation, perspiration and inspiration.\"</h2>
<br/><div class='quote-author'>- Evan Esar</div>",

				"Success does not consist in never making blunders, but in never making the same one a second time.\"</h2>
<br/><div class='quote-author'>- Josh Billings</div>",

				"The great thing in the world is not so much where we stand as in what direction we are moving.\"</h2>
<br/><div class='quote-author'>- Oliver Wendell Holmes</div>",

				"Thousands of candles can be lit from a single candle, and the life of the candle will not be shortened. Happiness never decreases by being shared.\"</h2>
<br/><div class='quote-author'>- Buddha </div>",

				"Only after we can learn to forgive ourselves can we accept others as they are because we don't feel threatened by anything about them which is better than us.\"</h2>
<br/><div class='quote-author'>- Stephen Covey </div>",

				"When you judge another, you do not define them, you define yourself.\"</h2>
<br/><div class='quote-author'>- Wayne Dyer </div>",

				"After the game, the king and the pawn go into the same box.\"</h2>
<br/><div class='quote-author'>- Italian Proverb</div>",

				"We are the creative force of our life, and through our own decisions rather than our conditions, if we carefully learn to do certain things, we can accomplish those goals.\"</h2>
<br/><div class='quote-author'>- Stephen Covey </div>",

				"Character is like a tree and reputation like a shadow. The shadow is what we think of it; the tree is the real thing.\"</h2>
<br/><div class='quote-author'>- Abraham Lincoln </div>",

				"Commitment leads to action. Action brings your dream closer.\"</h2>
<br/><div class='quote-author'>- Marcia Wieder</div>",

				"People who don't take risks generally make about two big mistakes a year. People who do take risks generally make about two big mistakes a year.\"</h2>
<br/><div class='quote-author'>- Peter Drucker </div>",

				"Cherish your visions and your dreams as they are the children of your soul, the blueprints of your ultimate achievements.\"</h2>
<br/><div class='quote-author'>- Napoleon Hill </div>",

				"Old friends pass away, new friends appear. It is just like the days. An old day passes, a new day arrives. The important thing is to make it meaningful: a meaningful friend - or a meaningful day.\"</h2>
<br/><div class='quote-author'>- Dalai Lama </div>",

				"When I let go of what I am, I become what I might be\"</h2>
<br/><div class='quote-author'>- Lao Tzu </div>",

				"Every artist was first an amateur.\"</h2>
<br/><div class='quote-author'>- Ralph Waldo Emerson</div>",

				"People often say that this or that person has not yet found himself. But the self is not something one finds, it is something one creates.\"</h2>
<br/><div class='quote-author'>- Thomas S. Szasz </div>",

				"Unless you try to do something beyond what you have already mastered, you will never grow.\"</h2>
<br/><div class='quote-author'>- Ralph Waldo Emerson </div>",

				"Many of life's failures are people who did not realize how close they were to success when they gave up.\"</h2>
<br/><div class='quote-author'>- Thomas Edison</div>",

				"It doesn't matter where you are coming from. All that matters is where you are going.\"</h2>
<br/><div class='quote-author'>- Brian Tracy</div>",

				"Instead of worrying about what people say of you, why not spend time trying to accomplish something they will admire.\"</h2>
<br/><div class='quote-author'>- Dale Carnegie </div>",

				"All our dreams can come true, if we have the courage to pursue them.\"</h2>
<br/><div class='quote-author'>- Walt Disney </div>",

				"The future belongs to those who believe in the beauty of their dreams.\"</h2>
<br/><div class='quote-author'>- Eleanor Roosevelt</div>",

				"Wealth, like happiness, is never attained when sought after directly. It comes as a byproduct of providing a useful service.\"</h2>
<br/><div class='quote-author'>- Henry Ford </div>",

				"Don't judge those who try and fail, judge those who fail to try.\"</h2>
<br/><div class='quote-author'>- Unknown</div>",

				"I can accept failure, everyone fails at something. But I can't accept not trying.\"</h2>
<br/><div class='quote-author'>- Michael Jordan </div>",

				"Opportunities are like sunrises. If you wait too long, you miss them.\"</h2>
<br/><div class='quote-author'>- Unknown</div>",

				"Once you have mastered time, you will understand how true it is that most people overestimate what they can accomplish in a year - and underestimate what they can achieve in a decade.\"</h2>
<br/><div class='quote-author'>- Tony Robbins </div>",

				"The only thing in life achieved without effort is failure.\"</h2>
<br/><div class='quote-author'>- Unknown</div>",

				"If I'd had some set idea of a finish line, don't you think I would have crossed it years ago?\"</h2>
<br/><div class='quote-author'>- Bill Gates </div>",

				"The truth is that there is nothing noble in being superior to somebody else. The only real nobility is in being superior to your former self.\"</h2>
<br/><div class='quote-author'>- Whitney Young</div>",

				"Success isn't a result of spontaneous combustion. You must set yourself on fire.\"</h2>
<br/><div class='quote-author'>- Arnold H. Glasow </div>",

				"Most people have no idea of the giant capacity we can immediately command when we focus all of our resources on mastering a single area of our lives.\"</h2>
<br/><div class='quote-author'>- Tony Robbins </div>",

				"Are you bored with life? Then throw yourself into some work you believe in with all your heart, live for it, die for it, and you will find happiness that you had thought could never be yours.\"</h2>
<br/><div class='quote-author'>- Dale Carnegie </div>",

				"Failure is not a single, cataclysmic event. You don't fail overnight. Instead, failure is a few errors in judgement, repeated every day.\"</h2>
<br/><div class='quote-author'>- Jim Rohn </div>",

				"Do not anticipate trouble, or worry about what may never happen. Keep in the sunlight.\"</h2>
<br/><div class='quote-author'>- Benjamin Franklin</div>",

				"Happiness depends more on the inward disposition of mind than on outward circumstances.\"</h2>
<br/><div class='quote-author'>- Benjamin Franklin</div>",

				"What we plant in the soil of contemplation, we shall reap in the harvest of action.\"</h2>
<br/><div class='quote-author'>- Meister Eckhart </div>",

				"Success is getting what you want. Happiness is wanting what you get.\"</h2>
<br/><div class='quote-author'>- Dale Carnegie</div>",

				"Justice consists not in being neutral between right and wrong, but in finding out the right and upholding it, wherever found, against the wrong.\"</h2>
<br/><div class='quote-author'>- Theodore Roosevelt</div>",

				"Don't aim for success if you want it; just do what you love and believe in, and it will come naturally.\"</h2>
<br/><div class='quote-author'>- David Frost </div>",

				"A real decision is measured by the fact that you've taken a new action. If there's no action, you haven't truly decided.\"</h2>
<br/><div class='quote-author'>- Tony Robbins </div>",

				"Happy are those who dream dreams and are ready to pay the price to make them come true.\"</h2>
<br/><div class='quote-author'>- Leon J. Suenes</div>",

				"The only way of finding the limits of the possible is by going beyond them into the impossible.\"</h2>
<br/><div class='quote-author'>- Arthur C. Clarke</div>",

				"You cannot dream yourself into a character: you must hammer and forge yourself into one.\"</h2>
<br/><div class='quote-author'>- Henry D. Thoreau</div>",

				"Knowing is not enough; we must apply. Willing is not enough; we must do.\"</h2>
<br/><div class='quote-author'>- Johann Wolfgang von Goethe</div>",

				"Think twice before you speak, because your words and influence will plant the seed of either success or failure in the mind of another.\"</h2>
<br/><div class='quote-author'>- Napoleon Hill </div>",

				"Keep steadily before you the fact that all true success depends at last upon yourself.\"</h2>
<br/><div class='quote-author'>- Theodore T. Hunger</div>",

				"I've learned that people will forget what you said, people will forget what you did, but people will never forget how you made them feel.\"</h2>
<br/><div class='quote-author'>- Maya Angelou</div>",

				"The talent of success is nothing more than doing what you can do, well.\"</h2>
<br/><div class='quote-author'>- Henry W. Longfellow</div>",

				"We are all faced with a series of great opportunities brilliantly disguised as impossible situations.\"</h2>
<br/><div class='quote-author'>- Charles R. Swindoll </div>",

				"If you want others to be happy, practice compassion. If you want to be happy, practice compassion.\"</h2>
<br/><div class='quote-author'>- Dalai Lama </div>",

				"Life shrinks or expands in proportion to one's courage.\"</h2>
<br/><div class='quote-author'>- Anais Nin</div>",

				"I've learned that you shouldn't go through life with a catcher's mitt on both hands; you need to be able to throw something back.\"</h2>
<br/><div class='quote-author'>- Maya Angelou </div>",

				"Success is not final, failure is not fatal: it is the courage to continue that counts.\"</h2>
<br/><div class='quote-author'>- Winston Churchill </div>",

				"Know where to find the information and how to use it - That's the secret of success.\"</h2>
<br/><div class='quote-author'>- Albert Einstein </div>",

				"I've failed over and over and over again in my life and that is why I succeed.\"</h2>
<br/><div class='quote-author'>- Michael Jordan </div>",

				"Anyone who stops learning is old, whether at twenty or eighty. Anyone who keeps learning stays young. The greatest thing in life is to keep your mind young.\"</h2>
<br/><div class='quote-author'>- Henry Ford </div>",

				"Success is how high you bounce when you hit bottom.\"</h2>
<br/><div class='quote-author'>- George S. Patton</div>",

				"You can't expect abundance to work in just one direction. If the tide only came in we would all drown.\"</h2>
<br/><div class='quote-author'>- Unknown</div>",

				"If you have built castles in the air, your work need not be lost; that is where they should be. Now put foundations under them.\"</h2>
<br/><div class='quote-author'>- Henry David Thoreau</div>",

				"If there is any one secret of success, it lies in the ability to get the other person's point of view and see things from that person's angle as well as from your own.\"</h2>
<br/><div class='quote-author'>- Henry Ford </div>",

				"People take different roads seeking fulfillment and happiness. Just because they're not on your road doesn't mean they've gotten lost.\"</h2>
<br/><div class='quote-author'>- Dalai Lama</div>",

				"Happiness is not achieved by the conscious pursuit of happiness; it is generally the byproduct of other activities.\"</h2>
<br/><div class='quote-author'>- Aldous Huxley</div>",

				"Great spirits have always encountered violent opposition from mediocre minds.\"</h2>
<br/><div class='quote-author'>- Albert Einstein</div>",

				"If you are not willing to risk the unusual, you will have to settle for the ordinary.\"</h2>
<br/><div class='quote-author'>- Jim Rohn </div>",

				"Give me six hours to chop down a tree and I will spend the first four sharpening the axe.\"</h2>
<br/><div class='quote-author'>- Abraham Lincoln </div>",

				"The difference between a successful person and others is not a lack of strength, not a lack of knowledge, but rather a lack in will.\"</h2>
<br/><div class='quote-author'>- Vince Lombardi</div>",

				"You can't build a reputation on what you are going to do.\"</h2>
<br/><div class='quote-author'>- Henry Ford</div>",

				"I never looked at the consequences of missing a big shot... when you think about the consequences you always think of a negative result.\"</h2>
<br/><div class='quote-author'>- Michael Jordan </div>",

				"It is literally true that you can succeed best and quickest by helping others to succeed.\"</h2>
<br/><div class='quote-author'>- Napoleon Hill </div>",

				"Nothing is predestined: The obstacles of your past can become the gateways that lead to new beginnings.\"</h2>
<br/><div class='quote-author'>- Ralph Blum</div>",

				"The two most important requirements for major success are: first, being in the right place at the right time, and second, doing something about it.\"</h2>
<br/><div class='quote-author'>- Ray Kroc </div>",

				"Instead of worrying about what people say of you, why not spend time trying to accomplish something they will admire.\"</h2>
<br/><div class='quote-author'>- Dale Carnegie </div>",

				"Your imagination is your preview of life's coming attractions.\"</h2>
<br/><div class='quote-author'>- Albert Einstein</div>",

				"In the absence of clearly-defined goals, we become strangely loyal to performing daily trivia until ultimately we become enslaved by it.\"</h2>
<br/><div class='quote-author'>- Robert Heinlein</div>",

				"There is no passion to be found playing small - in settling for a life that is less than the one you are capable of living.\"</h2>
<br/><div class='quote-author'>- Nelson Mandela </div>",

				"The big secret in life is that there is no big secret. Whatever your goal, you can get there if you're willing to work.\"</h2>
<br/><div class='quote-author'>- Oprah Winfrey</div>",

				"Happiness is not something you postpone for the future; it is something you design for the present.\"</h2>
<br/><div class='quote-author'>- Jim Rohn </div>",

				"For to be free is not merely to cast off one's chains, but to live in a way that respects and enhances the freedom of others.\"</h2>
<br/><div class='quote-author'>- Nelson Mandela </div>",

				"All growth depends upon activity. There is no development physically or intellectually without effort, and effort means work.\"</h2>
<br/><div class='quote-author'>- Calvin Coolidge</div>",

				"It was a high counsel that I once heard given to a young person, \"Always do what you are afraid to do.\"\"</h2>
<br/><div class='quote-author'>- Ralph Waldo Emerson</div>",

				"Success is the good fortune that comes from aspiration, desperation, perspiration and inspiration.\"</h2>
<br/><div class='quote-author'>- Evan Esar</div>",

				"Success does not consist in never making blunders, but in never making the same one a second time.\"</h2>
<br/><div class='quote-author'>- Josh Billings</div>",

				"The great thing in the world is not so much where we stand as in what direction we are moving.\"</h2>
<br/><div class='quote-author'>- Oliver Wendell Holmes</div>",

				"Thousands of candles can be lit from a single candle, and the life of the candle will not be shortened. Happiness never decreases by being shared.\"</h2>
<br/><div class='quote-author'>- Buddha </div>",

				"Only after we can learn to forgive ourselves can we accept others as they are because we don't feel threatened by anything about them which is better than us.\"</h2>
<br/><div class='quote-author'>- Stephen Covey </div>",

				"When you judge another, you do not define them, you define yourself.\"</h2>
<br/><div class='quote-author'>- Wayne Dyer </div>",

				"After the game, the king and the pawn go into the same box.\"</h2>
<br/><div class='quote-author'>- Italian Proverb</div>",

				"We are the creative force of our life, and through our own decisions rather than our conditions, if we carefully learn to do certain things, we can accomplish those goals.\"</h2>
<br/><div class='quote-author'>- Stephen Covey </div>",

				"Character is like a tree and reputation like a shadow. The shadow is what we think of it; the tree is the real thing.\"</h2>
<br/><div class='quote-author'>- Abraham Lincoln </div>",

				"Commitment leads to action. Action brings your dream closer.\"</h2>
<br/><div class='quote-author'>- Marcia Wieder</div>",

				"People who don't take risks generally make about two big mistakes a year. People who do take risks generally make about two big mistakes a year.\"</h2>
<br/><div class='quote-author'>- Peter Drucker </div>",

				"Cherish your visions and your dreams as they are the children of your soul, the blueprints of your ultimate achievements.\"</h2>
<br/><div class='quote-author'>- Napoleon Hill </div>",

				"Old friends pass away, new friends appear. It is just like the days. An old day passes, a new day arrives. The important thing is to make it meaningful: a meaningful friend - or a meaningful day.\"</h2>
<br/><div class='quote-author'>- Dalai Lama </div>",

				"When I let go of what I am, I become what I might be\"</h2>
<br/><div class='quote-author'>- Lao Tzu </div>",

				"Every artist was first an amateur.\"</h2>
<br/><div class='quote-author'>- Ralph Waldo Emerson</div>",

				"People often say that this or that person has not yet found himself. But the self is not something one finds, it is something one creates.\"</h2>
<br/><div class='quote-author'>- Thomas S. Szasz </div>",

				"Unless you try to do something beyond what you have already mastered, you will never grow.\"</h2>
<br/><div class='quote-author'>- Ralph Waldo Emerson </div>",

				"Many of life's failures are people who did not realize how close they were to success when they gave up.\"</h2>
<br/><div class='quote-author'>- Thomas Edison</div>",

				"It doesn't matter where you are coming from. All that matters is where you are going.\"</h2>
<br/><div class='quote-author'>- Brian Tracy</div>",

				"Instead of worrying about what people say of you, why not spend time trying to accomplish something they will admire.\"</h2>
<br/><div class='quote-author'>- Dale Carnegie </div>",

				"All our dreams can come true, if we have the courage to pursue them.\"</h2>
<br/><div class='quote-author'>- Walt Disney </div>",

				"The future belongs to those who believe in the beauty of their dreams.\"</h2>
<br/><div class='quote-author'>- Eleanor Roosevelt</div>",

				"Wealth, like happiness, is never attained when sought after directly. It comes as a byproduct of providing a useful service.\"</h2>
<br/><div class='quote-author'>- Henry Ford </div>",

				"Don't judge those who try and fail, judge those who fail to try.\"</h2>
<br/><div class='quote-author'>- Unknown</div>",

				"I can accept failure, everyone fails at something. But I can't accept not trying.\"</h2>
<br/><div class='quote-author'>- Michael Jordan </div>",

				"Opportunities are like sunrises. If you wait too long, you miss them.\"</h2>
<br/><div class='quote-author'>- Unknown</div>",

				"Once you have mastered time, you will understand how true it is that most people overestimate what they can accomplish in a year - and underestimate what they can achieve in a decade.\"</h2>
<br/><div class='quote-author'>- Tony Robbins </div>",

				"The only thing in life achieved without effort is failure.\"</h2>
<br/><div class='quote-author'>- Unknown</div>",

				"If I'd had some set idea of a finish line, don't you think I would have crossed it years ago?\"</h2>
<br/><div class='quote-author'>- Bill Gates </div>",

				"The truth is that there is nothing noble in being superior to somebody else. The only real nobility is in being superior to your former self.\"</h2>
<br/><div class='quote-author'>- Whitney Young</div>",

				"Success isn't a result of spontaneous combustion. You must set yourself on fire.\"</h2>
<br/><div class='quote-author'>- Arnold H. Glasow </div>",

				"Most people have no idea of the giant capacity we can immediately command when we focus all of our resources on mastering a single area of our lives.\"</h2>
<br/><div class='quote-author'>- Tony Robbins </div>",

				"Are you bored with life? Then throw yourself into some work you believe in with all your heart, live for it, die for it, and you will find happiness that you had thought could never be yours.\"</h2>
<br/><div class='quote-author'>- Dale Carnegie </div>",

				"Failure is not a single, cataclysmic event. You don't fail overnight. Instead, failure is a few errors in judgement, repeated every day.\"</h2>
<br/><div class='quote-author'>- Jim Rohn </div>",

				"Do not anticipate trouble, or worry about what may never happen. Keep in the sunlight.\"</h2>
<br/><div class='quote-author'>- Benjamin Franklin</div>",

				"Happiness depends more on the inward disposition of mind than on outward circumstances.\"</h2>
<br/><div class='quote-author'>- Benjamin Franklin</div>",

				"What we plant in the soil of contemplation, we shall reap in the harvest of action.\"</h2>
<br/><div class='quote-author'>- Meister Eckhart </div>",

				"Success is getting what you want. Happiness is wanting what you get.\"</h2>
<br/><div class='quote-author'>- Dale Carnegie</div>",

				"Justice consists not in being neutral between right and wrong, but in finding out the right and upholding it, wherever found, against the wrong.\"</h2>
<br/><div class='quote-author'>- Theodore Roosevelt</div>",

				"Don't aim for success if you want it; just do what you love and believe in, and it will come naturally.\"</h2>
<br/><div class='quote-author'>- David Frost </div>",

				"A real decision is measured by the fact that you've taken a new action. If there's no action, you haven't truly decided.\"</h2>
<br/><div class='quote-author'>- Tony Robbins </div>",

				"Happy are those who dream dreams and are ready to pay the price to make them come true.\"</h2>
<br/><div class='quote-author'>- Leon J. Suenes</div>",

				"The only way of finding the limits of the possible is by going beyond them into the impossible.\"</h2>
<br/><div class='quote-author'>- Arthur C. Clarke</div>",

				"You cannot dream yourself into a character: you must hammer and forge yourself into one.\"</h2>
<br/><div class='quote-author'>- Henry D. Thoreau</div>",

				"Knowing is not enough; we must apply. Willing is not enough; we must do.\"</h2>
<br/><div class='quote-author'>- Johann Wolfgang von Goethe</div>",

				"Think twice before you speak, because your words and influence will plant the seed of either success or failure in the mind of another.\"</h2>
<br/><div class='quote-author'>- Napoleon Hill </div>",

				"Keep steadily before you the fact that all true success depends at last upon yourself.\"</h2>
<br/><div class='quote-author'>- Theodore T. Hunger</div>",

				"I've learned that people will forget what you said, people will forget what you did, but people will never forget how you made them feel.\"</h2>
<br/><div class='quote-author'>- Maya Angelou</div>",

				"The talent of success is nothing more than doing what you can do, well.\"</h2>
<br/><div class='quote-author'>- Henry W. Longfellow</div>",

				"We are all faced with a series of great opportunities brilliantly disguised as impossible situations.\"</h2>
<br/><div class='quote-author'>- Charles R. Swindoll </div>",

				"If you want others to be happy, practice compassion. If you want to be happy, practice compassion.\"</h2>
<br/><div class='quote-author'>- Dalai Lama </div>",

				"Life shrinks or expands in proportion to one's courage.\"</h2>
<br/><div class='quote-author'>- Anais Nin</div>",

				"I've learned that you shouldn't go through life with a catcher's mitt on both hands; you need to be able to throw something back.\"</h2>
<br/><div class='quote-author'>- Maya Angelou </div>",

				"Success is not final, failure is not fatal: it is the courage to continue that counts.\"</h2>
<br/><div class='quote-author'>- Winston Churchill </div>",

				"Know where to find the information and how to use it - That's the secret of success.\"</h2>
<br/><div class='quote-author'>- Albert Einstein </div>",

				"I've failed over and over and over again in my life and that is why I succeed.\"</h2>
<br/><div class='quote-author'>- Michael Jordan </div>",

				"Anyone who stops learning is old, whether at twenty or eighty. Anyone who keeps learning stays young. The greatest thing in life is to keep your mind young.\"</h2>
<br/><div class='quote-author'>- Henry Ford </div>",

				"Success is how high you bounce when you hit bottom.\"</h2>
<br/><div class='quote-author'>- George S. Patton</div>",

				"You can't expect abundance to work in just one direction. If the tide only came in we would all drown.\"</h2>
<br/><div class='quote-author'>- Unknown</div>",

				"Commitment leads to action. Action brings your dream closer.\"</h2>
<br/><div class='quote-author'>- Marcia Wieder</div>",

				"People who don't take risks generally make about two big mistakes a year. People who do take risks generally make about two big mistakes a year.\"</h2>
<br/><div class='quote-author'>- Peter Drucker </div>",

				"Cherish your visions and your dreams as they are the children of your soul, the blueprints of your ultimate achievements.\"</h2>
<br/><div class='quote-author'>- Napoleon Hill </div>",

				"Old friends pass away, new friends appear. It is just like the days. An old day passes, a new day arrives. The important thing is to make it meaningful: a meaningful friend - or a meaningful day.\"</h2>
<br/><div class='quote-author'>- Dalai Lama </div>",

				"When I let go of what I am, I become what I might be\"</h2>
<br/><div class='quote-author'>- Lao Tzu </div>",

				"Every artist was first an amateur.\"</h2>
<br/><div class='quote-author'>- Ralph Waldo Emerson</div>",

				"People often say that this or that person has not yet found himself. But the self is not something one finds, it is something one creates.\"</h2>
<br/><div class='quote-author'>- Thomas S. Szasz </div>",

				"Unless you try to do something beyond what you have already mastered, you will never grow.\"</h2>
<br/><div class='quote-author'>- Ralph Waldo Emerson </div>",

				"Many of life's failures are people who did not realize how close they were to success when they gave up.\"</h2>
<br/><div class='quote-author'>- Thomas Edison</div>",

				"It doesn't matter where you are coming from. All that matters is where you are going.\"</h2>
<br/><div class='quote-author'>- Brian Tracy</div>",

				"Instead of worrying about what people say of you, why not spend time trying to accomplish something they will admire.\"</h2>
<br/><div class='quote-author'>- Dale Carnegie </div>",

				"All our dreams can come true, if we have the courage to pursue them.\"</h2>
<br/><div class='quote-author'>- Walt Disney </div>",

				"The future belongs to those who believe in the beauty of their dreams.\"</h2>
<br/><div class='quote-author'>- Eleanor Roosevelt</div>",

				"Wealth, like happiness, is never attained when sought after directly. It comes as a byproduct of providing a useful service.\"</h2>
<br/><div class='quote-author'>- Henry Ford </div>",

				"Don't judge those who try and fail, judge those who fail to try.\"</h2>
<br/><div class='quote-author'>- Unknown</div>",

				"I can accept failure, everyone fails at something. But I can't accept not trying.\"</h2>
<br/><div class='quote-author'>- Michael Jordan </div>",

				"Opportunities are like sunrises. If you wait too long, you miss them.\"</h2>
<br/><div class='quote-author'>- Unknown</div>",

				"Once you have mastered time, you will understand how true it is that most people overestimate what they can accomplish in a year - and underestimate what they can achieve in a decade.\"</h2>
<br/><div class='quote-author'>- Tony Robbins </div>",

				"The only thing in life achieved without effort is failure.\"</h2>
<br/><div class='quote-author'>- Unknown</div>",

				"If I'd had some set idea of a finish line, don't you think I would have crossed it years ago?\"</h2>
<br/><div class='quote-author'>- Bill Gates </div>",

				"The truth is that there is nothing noble in being superior to somebody else. The only real nobility is in being superior to your former self.\"</h2>
<br/><div class='quote-author'>- Whitney Young</div>",

				"Success isn't a result of spontaneous combustion. You must set yourself on fire.\"</h2>
<br/><div class='quote-author'>- Arnold H. Glasow </div>",

				"Most people have no idea of the giant capacity we can immediately command when we focus all of our resources on mastering a single area of our lives.\"</h2>
<br/><div class='quote-author'>- Tony Robbins </div>",

				"Are you bored with life? Then throw yourself into some work you believe in with all your heart, live for it, die for it, and you will find happiness that you had thought could never be yours.\"</h2>
<br/><div class='quote-author'>- Dale Carnegie </div>",

				"Failure is not a single, cataclysmic event. You don't fail overnight. Instead, failure is a few errors in judgement, repeated every day.\"</h2>
<br/><div class='quote-author'>- Jim Rohn </div>",

				"Do not anticipate trouble, or worry about what may never happen. Keep in the sunlight.\"</h2>
<br/><div class='quote-author'>- Benjamin Franklin</div>",

				"Happiness depends more on the inward disposition of mind than on outward circumstances.\"</h2>
<br/><div class='quote-author'>- Benjamin Franklin</div>",

				"What we plant in the soil of contemplation, we shall reap in the harvest of action.\"</h2>
<br/><div class='quote-author'>- Meister Eckhart </div>",

				"Success is getting what you want. Happiness is wanting what you get.\"</h2>
<br/><div class='quote-author'>- Dale Carnegie</div>",

				"Justice consists not in being neutral between right and wrong, but in finding out the right and upholding it, wherever found, against the wrong.\"</h2>
<br/><div class='quote-author'>- Theodore Roosevelt</div>",

				"Don't aim for success if you want it; just do what you love and believe in, and it will come naturally.\"</h2>
<br/><div class='quote-author'>- David Frost </div>",

				"A real decision is measured by the fact that you've taken a new action. If there's no action, you haven't truly decided.\"</h2>
<br/><div class='quote-author'>- Tony Robbins </div>",

				"Happy are those who dream dreams and are ready to pay the price to make them come true.\"</h2>
<br/><div class='quote-author'>- Leon J. Suenes</div>",

				"The only way of finding the limits of the possible is by going beyond them into the impossible.\"</h2>
<br/><div class='quote-author'>- Arthur C. Clarke</div>",

				"You cannot dream yourself into a character: you must hammer and forge yourself into one.\"</h2>
<br/><div class='quote-author'>- Henry D. Thoreau</div>",

				"Knowing is not enough; we must apply. Willing is not enough; we must do.\"</h2>
<br/><div class='quote-author'>- Johann Wolfgang von Goethe</div>",

				"Think twice before you speak, because your words and influence will plant the seed of either success or failure in the mind of another.\"</h2>
<br/><div class='quote-author'>- Napoleon Hill </div>",

				"Keep steadily before you the fact that all true success depends at last upon yourself.\"</h2>
<br/><div class='quote-author'>- Theodore T. Hunger</div>",

				"I've learned that people will forget what you said, people will forget what you did, but people will never forget how you made them feel.\"</h2>
<br/><div class='quote-author'>- Maya Angelou</div>",

				"The talent of success is nothing more than doing what you can do, well.\"</h2>
<br/><div class='quote-author'>- Henry W. Longfellow</div>",

				"We are all faced with a series of great opportunities brilliantly disguised as impossible situations.\"</h2>
<br/><div class='quote-author'>- Charles R. Swindoll </div>",

				"If you want others to be happy, practice compassion. If you want to be happy, practice compassion.\"</h2>
<br/><div class='quote-author'>- Dalai Lama </div>",

				"Life shrinks or expands in proportion to one's courage.\"</h2>
<br/><div class='quote-author'>- Anais Nin</div>",

				"I've learned that you shouldn't go through life with a catcher's mitt on both hands; you need to be able to throw something back.\"</h2>
<br/><div class='quote-author'>- Maya Angelou </div>",

				"Success is not final, failure is not fatal: it is the courage to continue that counts.\"</h2>
<br/><div class='quote-author'>- Winston Churchill </div>",

				"Know where to find the information and how to use it - That's the secret of success.\"</h2>
<br/><div class='quote-author'>- Albert Einstein </div>",

				"I've failed over and over and over again in my life and that is why I succeed.\"</h2>
<br/><div class='quote-author'>- Michael Jordan </div>",

				"Anyone who stops learning is old, whether at twenty or eighty. Anyone who keeps learning stays young. The greatest thing in life is to keep your mind young.\"</h2>
<br/><div class='quote-author'>- Henry Ford </div>",

				"Success is how high you bounce when you hit bottom.\"</h2>
<br/><div class='quote-author'>- George S. Patton</div>",

				"You can't expect abundance to work in just one direction. If the tide only came in we would all drown.\"</h2>
<br/><div class='quote-author'>- Unknown</div>",


				"All our dreams can come true, if we have the courage to pursue them.\"</h2>
<br/><div class='quote-author'>- Walt Disney </div>",

				"The future belongs to those who believe in the beauty of their dreams.\"</h2>
<br/><div class='quote-author'>- Eleanor Roosevelt</div>",

				"Wealth, like happiness, is never attained when sought after directly. It comes as a byproduct of providing a useful service.\"</h2>
<br/><div class='quote-author'>- Henry Ford </div>",

				"Don't judge those who try and fail, judge those who fail to try.\"</h2>
<br/><div class='quote-author'>- Unknown</div>",

				"I can accept failure, everyone fails at something. But I can't accept not trying.\"</h2>
<br/><div class='quote-author'>- Michael Jordan </div>",

				"Opportunities are like sunrises. If you wait too long, you miss them.\"</h2>
<br/><div class='quote-author'>- Unknown</div>",

				"Once you have mastered time, you will understand how true it is that most people overestimate what they can accomplish in a year - and underestimate what they can achieve in a decade.\"</h2>
<br/><div class='quote-author'>- Tony Robbins </div>",

				"The only thing in life achieved without effort is failure.\"</h2>
<br/><div class='quote-author'>- Unknown</div>",

				"If I'd had some set idea of a finish line, don't you think I would have crossed it years ago?\"</h2>
<br/><div class='quote-author'>- Bill Gates </div>",

				"The truth is that there is nothing noble in being superior to somebody else. The only real nobility is in being superior to your former self.\"</h2>
<br/><div class='quote-author'>- Whitney Young</div>",

				"Success isn't a result of spontaneous combustion. You must set yourself on fire.\"</h2>
<br/><div class='quote-author'>- Arnold H. Glasow </div>",

				"Most people have no idea of the giant capacity we can immediately command when we focus all of our resources on mastering a single area of our lives.\"</h2>
<br/><div class='quote-author'>- Tony Robbins </div>",

				"Are you bored with life? Then throw yourself into some work you believe in with all your heart, live for it, die for it, and you will find happiness that you had thought could never be yours.\"</h2>
<br/><div class='quote-author'>- Dale Carnegie </div>",

				"Failure is not a single, cataclysmic event. You don't fail overnight. Instead, failure is a few errors in judgement, repeated every day.\"</h2>
<br/><div class='quote-author'>- Jim Rohn </div>",

				"Do not anticipate trouble, or worry about what may never happen. Keep in the sunlight.\"</h2>
<br/><div class='quote-author'>- Benjamin Franklin</div>",

				"Happiness depends more on the inward disposition of mind than on outward circumstances.\"</h2>
<br/><div class='quote-author'>- Benjamin Franklin</div>",

				"What we plant in the soil of contemplation, we shall reap in the harvest of action.\"</h2>
<br/><div class='quote-author'>- Meister Eckhart </div>",

				"Success is getting what you want. Happiness is wanting what you get.\"</h2>
<br/><div class='quote-author'>- Dale Carnegie</div>",

				"The only way of finding the limits of the possible is by going beyond them into the impossible.\"</h2>
<br/><div class='quote-author'>- Arthur C. Clarke</div>",

				"You cannot dream yourself into a character: you must hammer and forge yourself into one.\"</h2>
<br/><div class='quote-author'>- Henry D. Thoreau</div>",

				"Knowing is not enough; we must apply. Willing is not enough; we must do.\"</h2>
<br/><div class='quote-author'>- Johann Wolfgang von Goethe</div>",

				"Think twice before you speak, because your words and influence will plant the seed of either success or failure in the mind of another.\"</h2>
<br/><div class='quote-author'>- Napoleon Hill </div>",

				"Keep steadily before you the fact that all true success depends at last upon yourself.\"</h2>
<br/><div class='quote-author'>- Theodore T. Hunger</div>",

				"I've learned that people will forget what you said, people will forget what you did, but people will never forget how you made them feel.\"</h2>
<br/><div class='quote-author'>- Maya Angelou</div>",

				"The talent of success is nothing more than doing what you can do, well.\"</h2>
<br/><div class='quote-author'>- Henry W. Longfellow</div>",

				"We are all faced with a series of great opportunities brilliantly disguised as impossible situations.\"</h2>
<br/><div class='quote-author'>- Charles R. Swindoll </div>",

				"If you want others to be happy, practice compassion. If you want to be happy, practice compassion.\"</h2>
<br/><div class='quote-author'>- Dalai Lama </div>",

				"Life shrinks or expands in proportion to one's courage.\"</h2>
<br/><div class='quote-author'>- Anais Nin</div>",

				"I've learned that you shouldn't go through life with a catcher's mitt on both hands; you need to be able to throw something back.\"</h2>
<br/><div class='quote-author'>- Maya Angelou </div>",

				"Success is not final, failure is not fatal: it is the courage to continue that counts.\"</h2>
<br/><div class='quote-author'>- Winston Churchill </div>",

				"Know where to find the information and how to use it - That's the secret of success.\"</h2>
<br/><div class='quote-author'>- Albert Einstein </div>",

				"I've failed over and over and over again in my life and that is why I succeed.\"</h2>
<br/><div class='quote-author'>- Michael Jordan </div>",

				"Anyone who stops learning is old, whether at twenty or eighty. Anyone who keeps learning stays young. The greatest thing in life is to keep your mind young.\"</h2>
<br/><div class='quote-author'>- Henry Ford </div>",

				"Success is how high you bounce when you hit bottom.\"</h2>
<br/><div class='quote-author'>- George S. Patton</div>",

				"You can't expect abundance to work in just one direction. If the tide only came in we would all drown.\"</h2>
<br/><div class='quote-author'>- Unknown</div>",

				"All our dreams can come true, if we have the courage to pursue them.\"</h2>
<br/><div class='quote-author'>- Walt Disney </div>",

				"The future belongs to those who believe in the beauty of their dreams.\"</h2>
<br/><div class='quote-author'>- Eleanor Roosevelt</div>",

				"Wealth, like happiness, is never attained when sought after directly. It comes as a byproduct of providing a useful service.\"</h2>
<br/><div class='quote-author'>- Henry Ford </div>",

				"Don't judge those who try and fail, judge those who fail to try.\"</h2>
<br/><div class='quote-author'>- Unknown</div>",

				"I can accept failure, everyone fails at something. But I can't accept not trying.\"</h2>
<br/><div class='quote-author'>- Michael Jordan </div>",

				"Opportunities are like sunrises. If you wait too long, you miss them.\"</h2>
<br/><div class='quote-author'>- Unknown</div>",

				"Once you have mastered time, you will understand how true it is that most people overestimate what they can accomplish in a year - and underestimate what they can achieve in a decade.\"</h2><br/><div class='quote-author'>- Tony Robbins </div>",

				"The only thing in life achieved without effort is failure.\"</h2>
<br/><div class='quote-author'>- Unknown</div>",

				"If I'd had some set idea of a finish line, don't you think I would have crossed it years ago?\"</h2>
<br/><div class='quote-author'>- Bill Gates </div>",

				"The truth is that there is nothing noble in being superior to somebody else. The only real nobility is in being superior to your former self.\"</h2>
<br/><div class='quote-author'>- Whitney Young</div>",

				"Success isn't a result of spontaneous combustion. You must set yourself on fire.\"</h2>
<br/><div class='quote-author'>- Arnold H. Glasow </div>",

				"Most people have no idea of the giant capacity we can immediately command when we focus all of our resources on mastering a single area of our lives.\"</h2>
<br/><div class='quote-author'>- Tony Robbins </div>",

				"Are you bored with life? Then throw yourself into some work you believe in with all your heart, live for it, die for it, and you will find happiness that you had thought could never be yours.\"</h2>
<br/><div class='quote-author'>- Dale Carnegie </div>",

				"Failure is not a single, cataclysmic event. You don't fail overnight. Instead, failure is a few errors in judgement, repeated every day.\"</h2>
<br/><div class='quote-author'>- Jim Rohn </div>",

				"Do not anticipate trouble, or worry about what may never happen. Keep in the sunlight.\"</h2>
<br/><div class='quote-author'>- Benjamin Franklin</div>",

				"Happiness depends more on the inward disposition of mind than on outward circumstances.\"</h2>
<br/><div class='quote-author'>- Benjamin Franklin</div>",

				"What we plant in the soil of contemplation, we shall reap in the harvest of action.\"</h2>
<br/><div class='quote-author'>- Meister Eckhart </div>",

				"Success is getting what you want. Happiness is wanting what you get.\"</h2>
<br/><div class='quote-author'>- Dale Carnegie</div>"


			);


			$r = rand(0,370);

			$i = 0;

			while ($i < 366) {
				$dates[$i++] = $i++;
			}

			$v = date(z);


			if ($data['update'] == "Random"){

				echo '<div style ="padding: 10px 0;">';
				echo '<h2>"';
				echo $quotes[$v].'<br/></div>';

			} else {

				echo '<div style ="padding: 10px 0;">';
				echo '<h2>"';
				echo $quotes[$r].'<br/></div>';
			}

			?>
			</div>
		<?php

		echo $args['after_widget'];
	}

	/**
	 * Back-end widget form.
	 *
	 * @see WP_Widget::form()
	 *
	 * @param array $instance Previously saved values from database.
	 */
	public function form( $instance ) {
		//$title = ! empty( $instance['title'] ) ? $instance['title'] : __( 'New title', 'text_domain' );

		$data = get_option('agilealliance_quotes');
		?>
		<p><label>Widget Title: <input name="agilealliance_quotes_title"
					type="text" value="<?php echo $data['title']; ?>" /></label></p>

		<?php
		if (isset($_POST['agilealliance_quotes_title'])){
			$data['title'] = esc_attr($_POST['agilealliance_quotes_title']);
			$data['update'] = esc_attr($_POST['agilealliance_quotes_update']);
			update_option('agilealliance_quotes', $data);
		}

		$data = array('title' => 'Quotes', 'update' => 'Daily', 'credit' => 'No');
		if ( ! get_option('agilealliance_quotes')){
			add_option('agilealliance_quotes' , $data);
		} else {
			update_option('agilealliance_quotes' , $data);
		}
	}

} // class AA_Quotes_Widget

// register AA_Quotes_Widget widget
function register_AA_Quotes_Widget() {
	register_widget( 'AA_Quotes_Widget' );
}
add_action( 'widgets_init', 'register_AA_Quotes_Widget' );

?>