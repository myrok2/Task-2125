Changelog
==========

##### 3.0.5 - December 15, 2015

**Fixes**

- Button to export log was no longer working after version 3.0

**Improvements**

- Reintroduced support for `data-loading-text` on submit buttons.
- Improved logic for loading animation in submit buttons.
- Styles Builder: Success& error color is now applied to paragraph element, to make sure theme doesn't override the given style.

**Additions**

- Improved email notifications. You can now easily modify the subject line & message body of the email that is sent.


##### 3.0.4 - December 10, 2015

**Fixes**

- Not being able to access Forms page when using strict error reporting.

**Additions**

- Use `mc4wp_use_sslverify` filter to detect whether SSL verification should be used in remote requests.


##### 3.0.3 - December 1, 2015

**Fixes**

- Fatal error when visiting Forms overview page on older PHP versions.

##### 3.0.2 - November 26, 2015

**Fixes**

- Stylesheet file not loaded because of 403 error (due to incorrect file permissions).

= 3.0.1 - November 25, 2015 =

**Improvements**

- AJAX Forms: Perform core logic before triggering events, to prevent erorrs in event callbacks from messing up form flow.
- Styles Builder: Changes are now applied instantly.
- Styles Builder: Clearing a color no longer resets all styles.
- Styles Builder: Try to set correct permissions before writing stylesheet to file.
- KB Search: Make sure all links point to [mc4wp.com](https://mc4wp.com).

**Additions**

- Add link to "Appearance" tab on Forms overview page.


##### 3.0.0 - November 23, 2015

Initial release.

This plugin requires [MailChimp for WordPress](https://wordpress.org/plugins/mailchimp-for-wp/) v3.0 or higher to work.