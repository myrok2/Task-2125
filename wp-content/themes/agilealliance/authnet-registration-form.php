<?php
if(!defined('WPINC')) // MUST have WordPress.
	exit("Do not access this file directly.");
?>

<div class="container">
  <div class="row">
    <div class="col-xs-12 col-md-offset-2 col-md-8">

			<div id="s2p-form"></div><!-- This is for hash anchors; do NOT remove please. -->

			<form id="s2member-pro-authnet-registration-form" class="s2member-pro-authnet-form aa_s2pro-registration-form s2member-pro-authnet-registration-form" method="post" action="%%action%%" autocomplete="off">

				<!-- Response Section (this is auto-filled after form submission). -->
				<div id="s2member-pro-authnet-registration-form-response-section" class="s2member-pro-authnet-form-section s2member-pro-authnet-registration-form-section s2member-pro-authnet-form-response-section s2member-pro-authnet-registration-form-response-section">
					<div id="s2member-pro-authnet-registration-form-response-div" class="s2member-pro-authnet-form-div s2member-pro-authnet-registration-form-div s2member-pro-authnet-form-response-div s2member-pro-authnet-registration-form-response-div">
						%%response%%
					</div>
					<div style="clear:both;"></div>
				</div>

				<!-- Options Section (this is filled by Shortcode options; when/if specified). -->
				<div id="s2member-pro-authnet-registration-form-options-section" class="s2member-pro-authnet-form-section s2member-pro-authnet-registration-form-section s2member-pro-authnet-form-options-section s2member-pro-authnet-registration-form-options-section">
					<div id="s2member-pro-authnet-registration-form-options-section-title" class="s2member-pro-authnet-form-section-title s2member-pro-authnet-registration-form-section-title s2member-pro-authnet-form-options-section-title s2member-pro-authnet-registration-form-options-section-title">
						<?php echo _x("Registration Options", "s2member-front", "s2member"); ?>
					</div>
					<div id="s2member-pro-authnet-registration-form-options-div" class="s2member-pro-authnet-form-div s2member-pro-authnet-registration-form-div s2member-pro-authnet-form-options-div s2member-pro-authnet-registration-form-options-div">
						<select name="s2p-option" id="s2member-pro-authnet-registration-options" class="s2member-pro-authnet-options s2member-pro-authnet-registration-options form-control" tabindex="-1">
							%%options%%
						</select>
					</div>
					<div style="clear:both;"></div>
				</div>

				<!-- Registration Description (this is the desc="" attribute from your Shortcode). -->
				<div id="s2member-pro-authnet-registration-form-description-section" class="s2member-pro-authnet-form-section s2member-pro-authnet-registration-form-section s2member-pro-authnet-form-description-section s2member-pro-authnet-registration-form-description-section">
					<div id="s2member-pro-authnet-registration-form-description-div" class="s2member-pro-authnet-form-div s2member-pro-authnet-registration-form-div s2member-pro-authnet-form-description-div s2member-pro-authnet-registration-form-description-div">
						%%description%%
					</div>
					<div style="clear:both;"></div>
				</div>

				<!-- Registration Details (Name, Email, Username, Password). -->
				<!-- Name fields will be hidden automatically when/if your Registration/Profile Field options dictate this behavior. -->
 				<div id="s2member-pro-authnet-registration-form-registration-section" class="s2member-pro-authnet-form-section s2member-pro-authnet-registration-form-section s2member-pro-authnet-form-registration-section s2member-pro-authnet-registration-form-registration-section">
					<div id="s2member-pro-authnet-registration-form-registration-section-title" class="s2member-pro-authnet-form-section-title s2member-pro-authnet-registration-form-section-title s2member-pro-authnet-form-registration-section-title s2member-pro-authnet-registration-form-registration-section-title">
						<?php echo _x ("Create Profile", "s2member-front", "s2member"); ?>
					</div>
					<div id="s2member-pro-authnet-registration-form-first-name-div" class="s2member-pro-authnet-form-div s2member-pro-authnet-registration-form-div s2member-pro-authnet-form-first-name-div s2member-pro-authnet-registration-form-first-name-div">
						<label for="s2member-pro-authnet-registration-first-name" id="s2member-pro-authnet-registration-form-first-name-label" class="s2member-pro-authnet-form-first-name-label s2member-pro-authnet-registration-form-first-name-label">
							<span><?php echo _x ("First Name", "s2member-front", "s2member"); ?> *</span><br />
             <!-- jQuery Form Validator Error message = data-validation-error-msg="Please enter your first name." -->
							<input type="text" aria-required="true" maxlength="100" autocomplete="off" name="s2member_pro_authnet_registration[first_name]" id="s2member-pro-authnet-registration-first-name" class="s2member-pro-authnet-first-name s2member-pro-authnet-registration-first-name form-control" value="%%first_name_value%%" tabindex="10" placeholder="First name *" data-validation="required" data-validation-error-msg="Please enter your first name."/>
						</label>
					</div>
					<div id="s2member-pro-authnet-registration-form-last-name-div" class="s2member-pro-authnet-form-div s2member-pro-authnet-registration-form-div s2member-pro-authnet-form-last-name-div s2member-pro-authnet-registration-form-last-name-div">
						<label for="s2member-pro-authnet-registration-last-name" id="s2member-pro-authnet-registration-form-last-name-label" class="s2member-pro-authnet-form-last-name-label s2member-pro-authnet-registration-form-last-name-label">
							<span><?php echo _x ("Last Name", "s2member-front", "s2member"); ?> *</span><br />
              <!-- jQuery Form Validator Error message = data-validation-error-msg="Please enter your first name." -->
							<input type="text" aria-required="true" maxlength="100" autocomplete="off" name="s2member_pro_authnet_registration[last_name]" id="s2member-pro-authnet-registration-last-name" class="s2member-pro-authnet-last-name s2member-pro-authnet-registration-last-name form-control" value="%%last_name_value%%" tabindex="20" placeholder="Last name *" data-validation="required" data-validation-error-msg="Please enter your last name." />
						</label>
					</div>
					<div id="s2member-pro-authnet-registration-form-email-div" class="s2member-pro-authnet-form-div s2member-pro-authnet-registration-form-div s2member-pro-authnet-form-email-div s2member-pro-authnet-registration-form-email-div">
						<label for="s2member-pro-authnet-registration-email" id="s2member-pro-authnet-registration-form-email-label" class="s2member-pro-authnet-form-email-label s2member-pro-authnet-registration-form-email-label">
							<span><?php echo _x ("Email Address", "s2member-front", "s2member"); ?> *</span><br />
              <!-- jQuery Form Validator Error message = GENERATED BY PLUGIN -->
							<input type="email" aria-required="true" data-expected="email" maxlength="100" autocomplete="off" name="s2member_pro_authnet_registration[email]" id="s2member-pro-authnet-registration-email" class="s2member-pro-authnet-email s2member-pro-authnet-registration-email form-control" value="%%email_value%%" tabindex="30" data-validation="email" placeholder="Email address *"/>
						</label>
					</div>

					<div id="s2member-pro-authnet-registration-form-password-div" class="s2member-pro-authnet-form-div s2member-pro-authnet-registration-form-div s2member-pro-authnet-form-password-div s2member-pro-authnet-registration-form-password-div">
						<label for="s2member-pro-authnet-registration-password1" id="s2member-pro-authnet-registration-form-password-label" class="s2member-pro-authnet-form-password-label s2member-pro-authnet-registration-form-password-label">
							<span><?php echo _x ("Password (type this twice please)", "s2member-front", "s2member"); ?> *</span><br />
              <!-- jQuery Form Validator Error message =  data-validation-length="min8" data-validation-error-msg="Password must contain at least 8 charaters." -->
							<input type="password" aria-required="true" maxlength="100" autocomplete="off" name="s2member_pro_authnet_registration[password1]" id="s2member-pro-authnet-registration-password1" class="s2member-pro-authnet-password1 s2member-pro-authnet-registration-password1 form-control" value="%%password1_value%%" tabindex="50" data-validation="length" data-validation-length="8-100" data-validation-error-msg="Password must contain at least 8 charaters." placeholder="Password *" />
						</label>
            <!-- jQuery Form Validator Error message =  data-validation-error-msg="Passwords do not match." -->
						<input type="password" maxlength="100" autocomplete="off" name="s2member_pro_authnet_registration[password2]" id="s2member-pro-authnet-registration-password2" class="s2member-pro-authnet-password2 s2member-pro-authnet-registration-password2 form-control" value="%%password2_value%%" tabindex="60" data-validation="confirmation" data-validation-confirm="s2member_pro_authnet_checkout" data-validation-error-msg="Passwords do not match." placeholder="Repeat password *" />
						<div id="s2member-pro-authnet-registration-form-password-strength" class="ws-plugin--s2member-password-strength s2member-pro-authnet-form-password-strength s2member-pro-authnet-registration-form-password-strength"><em><?php echo _x ("password strength indicator", "s2member-front", "s2member"); ?></em></div>
					</div>
					<div style="clear:both;"></div>
				</div>

				<!-- Custom Fields (Custom Registration/Profile Fields will appear here, when/if they've been configured). -->
				%%custom_fields%%

				<!-- Captcha ( A reCaptcha section, with a required security code will appear here; if captcha="1" ). -->
				%%captcha%%

				<!-- Complete Registration (this holds the submit button, and also some dynamic hidden input variables). -->
				<div id="s2member-pro-authnet-registration-form-submission-section" class="s2member-pro-authnet-form-section s2member-pro-authnet-registration-form-section s2member-pro-authnet-form-submission-section s2member-pro-authnet-registration-form-submission-section">
					<div style="display:none;" id="s2member-pro-authnet-registration-form-submission-section-title" class="s2member-pro-authnet-form-section-title s2member-pro-authnet-registration-form-section-title s2member-pro-authnet-form-submission-section-title s2member-pro-authnet-registration-form-submission-section-title">
						<?php echo _x ("Complete Registration", "s2member-front", "s2member"); ?>
					</div>
					%%opt_in%% <!-- s2Member will fill this when/if there are list servers integrated, and the Opt-In Box is turned on. -->
					<div id="s2member-pro-authnet-registration-form-submit-div" class="s2member-pro-authnet-form-div s2member-pro-authnet-registration-form-div s2member-pro-authnet-form-submit-div s2member-pro-authnet-registration-form-submit-div">
						%%hidden_inputs%% <!-- Auto-filled by the s2Member software. Do NOT remove this under any circumstance. -->
						<button type="submit" id="s2member-pro-authnet-registration-submit" class="s2member-pro-authnet-submit s2member-pro-authnet-registration-submit aa_btn btn btn-primary" tabindex="400"><?php echo esc_html (_x ("Submit Form", "s2member-front", "s2member")); ?></button>
					</div>
					<div style="clear:both;"></div>
				</div>
			</form>

    </div>
  </div>
</div>