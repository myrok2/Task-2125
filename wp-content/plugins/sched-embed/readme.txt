=== Sched Embed ===
Contributors: sched, codeforthepeople, johnbillion, simonwheatley
Tags: sched, sched.org, sched.com, embed, shortcode
Requires at least: 3.4
Tested up to: 4.7
Stable tag: trunk
License: GPL v2 or later

Embed event content from sched.com into your WordPress site.

== Description ==

This plugin provides a shortcode which allows you to embed event content from sched.com into your WordPress site.

Due to WordPress security restrictions, Authors and Contributors on your site will be unable to use the standard embed code provided by sched.com. If you use WordPress Multisite then nobody on your site will be able to use the standard embed code at all. This plugin allows you to embed event content from sched.com using a simple shortcode instead.

Embedding event content into your WordPress site requires a paid account on sched.com. [View available plans here.](http://sched.com/plans)

Plugin development was sponsored by [Internet Retailing](http://internetretailing.net).

== Installation ==

You can install this plugin directly from your WordPress dashboard:

 1. Go to the *Plugins* menu and click *Add New*.
 2. Search for *Sched Embed*.
 3. Click *Install Now* next to the *Sched Embed* plugin.
 4. Activate the plugin.

Alternatively, see the guide to [Manually Installing Plugins](http://codex.wordpress.org/Managing_Plugins#Manual_Plugin_Installation).

= Usage =

Embed content from your sched.com event by adding the following shortcode to your post or page content:

`[sched url="http://example.sched.com/"]`

Replace `http://example.sched.com/` with the URL of the event page you wish to embed. You can use the URL of any page of your event on sched.com. Simply copy the URL of the page from sched.com and paste it into your shortcode.

== Frequently Asked Questions ==

= What can I embed with this shortcode? =

You can embed any of your sched.com event pages. Simply copy the URL of the page from sched.com and paste it into your shortcode.

= Can I specify the width of the embed? =

You can specify the width of the embed using the `width` attribute:

`[sched url="http://example.sched.com/" width="500"]`

Note that sched.com only supports widths of 500, 600, 700, 800 and 900 (pixels). The default width is 990 pixels.

= Can I hide the sidebar in the embed? =

You can hide the sidebar in the embed by setting the `sidebar` attribute to 'no':

`[sched url="http://example.sched.com/" sidebar="no"]`

= Can I improve the colour scheme for use on a dark background colour? =

You can specify a colour scheme which is suitable for use on a dark background by setting the `background` attribute to 'dark':

`[sched url="http://example.sched.com/" background="dark"]`

Note that this does not put a dark background behind the schedule, it simply changes the text colour to be suitable for a dark background if your site has one.

= Can I specify the fallback text? =

You can specify the fallback text which will be shown to users who have JavaScript disabled:

`[sched url="http://example.sched.com/"]View my event on sched.com[/sched]`

If you don't specify this, the title of the event page will be used.

== Screenshots ==

1. An embedded event schedule

== Upgrade Notice ==

= 1.1 =
* Allow any event page from sched.com to be embedded.

== Changelog ==

= 1.1.3 =
* Made the compiled URL schemaless (//)
* Domain changes (sched.org -> sched.com)
* Allow `[sched.com]` to be used as the shortcode

= 1.1.2 =
* Version bump

= 1.1.1 =
* Sched.com taking over the ownership over plugin.

= 1.1 =
* Allow any event page from sched.com to be embedded.

= 1.0.1 =
* Allow `[sched.org]` to be used as the shortcode in addition to `[sched]`.

= 1.0 =
* Initial release.
