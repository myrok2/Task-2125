<?php 

/**
 * Class that takes care of setting up options
 * and any other things that are
 * fundamental for the plugin to work correctly
 */

namespace AgileAlliance\Events;
use AgileAlliance\Events\Helpers;

class Setup {

  /**
   * Constructor method
   */

  public $pluginData;
  protected $pluginFile = 'aaevents.php';
  protected $filePath = '/../';
  
  public function __construct() {
    $this->pluginData = get_plugin_data(__DIR__ . $this->filePath . $this->pluginFile, false);
  }

  public static function setOptions() {
    $setup = new Setup;
    $currentVersion = get_option('aae_version'); 

    // Check whether there's a new plugin version
    if(version_compare($currentVersion, $setup->pluginData['Version'], 'lt')) {
      update_option('aae_version', $setup->pluginData['Version'], true);
      $setup->updateRegStatuses();
      $setup->updateCountries();
      $setup->updateStates();
      $setup->updateProvinces();
      $setup->updateAttendeeTypes();
    } 
  }

  /**
   * Define Event Registration Statuses
   */

  public function updateRegStatuses() {
    $statuses = ['Needs Payment' => 'unpaid', 
                 'On Hold' => 'onHold',
                 'Registered' => 'registered',
                 'Changes Made' => 'changed',
                 'Transferred' => 'transferred',
                 'Cancelled' => 'cancelled'];
    update_option('aae_reg_statuses', $statuses, false);
  }

  /**
   * Define attendee types
   */

  public function updateAttendeeTypes() {
    $attendeeTypes = ['Attendee' => 'attendee',
                      'Speaker' => 'speaker',
                      'Program Team' => 'program team',
                      'Board Member' => 'board member',
                      'Sponsor' => 'sponsor',
                      'Press' => 'press',
                      'Industry analyst' => 'industry analyst',
                      'Volunteer' => 'volunteer',
                      'Staff' => 'staff'
                    ];
    update_option('aae_attendee_types', $attendeeTypes, false);
  }

  /**
   * Update list of Canadian provinces
   * usually used in forms
   */

  public function updateProvinces() {
    $provinces = [ 'Alberta' => 'AB',
                   'British Columbia' => 'BC',
                   'Manitoba' => 'MB',
                   'New Brunswick' => 'NB',
                   'Newfoundland and Labrador' => 'NL',
                   'Nova Scotia' => 'NS',
                   'Ontario' => 'ON',
                   'Prince Edward Island' => 'PE',
                   'Quebec' => 'QC',
                   'Saskatchewan' => 'SK',
                   'Northwest Territories' => 'NT',
                   'Nunavut' => 'NU',
                   'Yukon' => 'YT'];

    update_option('aae_provinces', $provinces, true);
  }

  /**
   * Update the list of US states
   * usually used in forms
   */

  public function updateStates() {
     $states = [ 'Alabama' => 'AL',
                 'Alaska' => 'AK',
                 'American Samoa' => 'AS',
                 'Arizona' => 'AZ',
                 'Arkansas' => 'AR',
                 'Armed Forces Americas' => 'AA',
                 'Armed Forces Pacific' => 'AP',
                 'Armed Forces Others' => 'AE',
                 'California' => 'CA',
                 'Colorado' => 'CO',
                 'Connecticut' => 'CT',
                 'Delaware' => 'DE',
                 'District Of Columbia' => 'DC',
                 'Florida' => 'FL',
                 'Georgia' => 'GA',
                 'Guam' => 'GU',
                 'Hawaii' => 'HI',
                 'Idaho' => 'ID',
                 'Illinois' => 'IL',
                 'Indiana' => 'IN',
                 'Iowa' => 'IA',
                 'Kansas' => 'KS',
                 'Kentucky' => 'KY',
                 'Louisiana' => 'LA',
                 'Maine' => 'ME',
                 'Maryland' => 'MD',
                 'Massachusetts' => 'MA',
                 'Michigan' => 'MI',
                 'Minnesota' => 'MN',
                 'Mississippi' => 'MS',
                 'Missouri' => 'MO',
                 'Montana' => 'MT',
                 'Nebraska' => 'NE',
                 'Nevada' => 'NV',
                 'New Hampshire' => 'NH',
                 'New Jersey' => 'NJ',
                 'New Mexico' => 'NM',
                 'New York' => 'NY',
                 'North Carolina' => 'NC',
                 'North Dakota' => 'ND',
                 'Northern Mariana Islands' => 'MP',
                 'Ohio' => 'OH',
                 'Oklahoma' => 'OK',
                 'Oregon' => 'OR',
                 'Pennsylvania' => 'PA',
                 'Puerto Rico' => 'PR',
                 'Rhode Island' => 'RI',
                 'South Carolina' => 'SC',
                 'South Dakota' => 'SD',
                 'Tennessee' => 'TN',
                 'Texas' => 'TX',
                 'United States Minor Outlying Islands' => 'UM',
                 'Utah' => 'UT',
                 'Vermont' => 'VT',
                 'Virgin Islands' => 'VI',
                 'Virginia' => 'VA',
                 'Washington' => 'WA',
                 'West Virginia' => 'WV',
                 'Wisconsin' => 'WI',
                 'Wyoming' => 'WY'];

    update_option('aae_states', $states, true);
  }

  /**
   * Update the list of countries.
   * Ususally used in forms
   */

  public function updateCountries() {
    $countries = ['Afghanistan' => 'AF',
                  'Åland Islands' => 'AX',
                  'Albania' => 'AL',
                  'Algeria' => 'DZ',
                  'American Samoa' => 'AS',
                  'Andorra' => 'AD',
                  'Angola' => 'AO',
                  'Anguilla' => 'AI',
                  'Antarctica' => 'AQ',
                  'Antigua and Barbuda' => 'AG',
                  'Argentina' => 'AR',
                  'Armenia' => 'AM',
                  'Aruba' => 'AW',
                  'Australia' => 'AU',
                  'Austria' => 'AT',
                  'Azerbaijan' => 'AZ',
                  'Bahamas' => 'BS',
                  'Bahrain' => 'BH',
                  'Bangladesh' => 'BD',
                  'Barbados' => 'BB',
                  'Belarus' => 'BY',
                  'Belgium' => 'BE',
                  'Belize' => 'BZ',
                  'Benin' => 'BJ',
                  'Bermuda' => 'BM',
                  'Bhutan' => 'BT',
                  'Bolivia, Plurinational State of' => 'BO',
                  'Bonaire, Sint Eustatius and Saba' => 'BQ',
                  'Bosnia and Herzegovina' => 'BA',
                  'Botswana' => 'BW',
                  'Bouvet Island' => 'BV',
                  'Brazil' => 'BR',
                  'British Indian Ocean Territory' => 'IO',
                  'Brunei Darussalam' => 'BN',
                  'Bulgaria' => 'BG',
                  'Burkina Faso' => 'BF',
                  'Burundi' => 'BI',
                  'Cambodia' => 'KH',
                  'Cameroon' => 'CM',
                  'Canada' => 'CA',
                  'Cape Verde' => 'CV',
                  'Cayman Islands' => 'KY',
                  'Central African Republic' => 'CF',
                  'Chad' => 'TD',
                  'Chile' => 'CL',
                  'China' => 'CN',
                  'Christmas Island' => 'CX',
                  'Cocos (Keeling) Islands' => 'CC',
                  'Colombia' => 'CO',
                  'Comoros' => 'KM',
                  'Congo' => 'CG',
                  'Congo, the Democratic Republic of the' => 'CD',
                  'Cook Islands' => 'CK',
                  'Costa Rica' => 'CR',
                  'Côte d\'Ivoire' => 'CI',
                  'Croatia' => 'HR',
                  'Cuba' => 'CU',
                  'Curaçao' => 'CW',
                  'Cyprus' => 'CY',
                  'Czech Republic' => 'CZ',
                  'Denmark' => 'DK',
                  'Djibouti' => 'DJ',
                  'Dominica' => 'DM',
                  'Dominican Republic' => 'DO',
                  'Ecuador' => 'EC',
                  'Egypt' => 'EG',
                  'El Salvador' => 'SV',
                  'Equatorial Guinea' => 'GQ',
                  'Eritrea' => 'ER',
                  'Estonia' => 'EE',
                  'Ethiopia' => 'ET',
                  'Falkland Islands (Malvinas)' => 'FK',
                  'Faroe Islands' => 'FO',
                  'Fiji' => 'FJ',
                  'Finland' => 'FI',
                  'France' => 'FR',
                  'French Guiana' => 'GF',
                  'French Polynesia' => 'PF',
                  'French Southern Territories' => 'TF',
                  'Gabon' => 'GA',
                  'Gambia' => 'GM',
                  'Georgia' => 'GE',
                  'Germany' => 'DE',
                  'Ghana' => 'GH',
                  'Gibraltar' => 'GI',
                  'Greece' => 'GR',
                  'Greenland' => 'GL',
                  'Grenada' => 'GD',
                  'Guadeloupe' => 'GP',
                  'Guam' => 'GU',
                  'Guatemala' => 'GT',
                  'Guernsey' => 'GG',
                  'Guinea' => 'GN',
                  'Guinea-Bissau' => 'GW',
                  'Guyana' => 'GY',
                  'Haiti' => 'HT',
                  'Heard Island and McDonald Islands' => 'HM',
                  'Holy See (Vatican City State)' => 'VA',
                  'Honduras' => 'HN',
                  'Hong Kong' => 'HK',
                  'Hungary' => 'HU',
                  'Iceland' => 'IS',
                  'India' => 'IN',
                  'Indonesia' => 'ID',
                  'Iran, Islamic Republic of' => 'IR',
                  'Iraq' => 'IQ',
                  'Ireland' => 'IE',
                  'Isle of Man' => 'IM',
                  'Israel' => 'IL',
                  'Italy' => 'IT',
                  'Jamaica' => 'JM',
                  'Japan' => 'JP',
                  'Jersey' => 'JE',
                  'Jordan' => 'JO',
                  'Kazakhstan' => 'KZ',
                  'Kenya' => 'KE',
                  'Kiribati' => 'KI',
                  'Korea, Democratic People\'s Republic of' => 'KP',
                  'Korea, Republic of' => 'KR',
                  'Kuwait' => 'KW',
                  'Kyrgyzstan' => 'KG',
                  'Lao People\'s Democratic Republic' => 'LA',
                  'Latvia' => 'LV',
                  'Lebanon' => 'LB',
                  'Lesotho' => 'LS',
                  'Liberia' => 'LR',
                  'Libya' => 'LY',
                  'Liechtenstein' => 'LI',
                  'Lithuania' => 'LT',
                  'Luxembourg' => 'LU',
                  'Macao' => 'MO',
                  'Macedonia, the former Yugoslav Republic of' => 'MK',
                  'Madagascar' => 'MG',
                  'Malawi' => 'MW',
                  'Malaysia' => 'MY',
                  'Maldives' => 'MV',
                  'Mali' => 'ML',
                  'Malta' => 'MT',
                  'Marshall Islands' => 'MH',
                  'Martinique' => 'MQ',
                  'Mauritania' => 'MR',
                  'Mauritius' => 'MU',
                  'Mayotte' => 'YT',
                  'Mexico' => 'MX',
                  'Micronesia, Federated States of' => 'FM',
                  'Moldova, Republic of' => 'MD',
                  'Monaco' => 'MC',
                  'Mongolia' => 'MN',
                  'Montenegro' => 'ME',
                  'Montserrat' => 'MS',
                  'Morocco' => 'MA',
                  'Mozambique' => 'MZ',
                  'Myanmar' => 'MM',
                  'Namibia' => 'NA',
                  'Nauru' => 'NR',
                  'Nepal' => 'NP',
                  'Netherlands' => 'NL',
                  'New Caledonia' => 'NC',
                  'New Zealand' => 'NZ',
                  'Nicaragua' => 'NI',
                  'Niger' => 'NE',
                  'Nigeria' => 'NG',
                  'Niue' => 'NU',
                  'Norfolk Island' => 'NF',
                  'Northern Mariana Islands' => 'MP',
                  'Norway' => 'NO',
                  'Oman' => 'OM',
                  'Pakistan' => 'PK',
                  'Palau' => 'PW',
                  'Palestinian Territory, Occupied' => 'PS',
                  'Panama' => 'PA',
                  'Papua New Guinea' => 'PG',
                  'Paraguay' => 'PY',
                  'Peru' => 'PE',
                  'Philippines' => 'PH',
                  'Pitcairn' => 'PN',
                  'Poland' => 'PL',
                  'Portugal' => 'PT',
                  'Puerto Rico' => 'PR',
                  'Qatar' => 'QA',
                  'Réunion' => 'RE',
                  'Romania' => 'RO',
                  'Russian Federation' => 'RU',
                  'Rwanda' => 'RW',
                  'Saint Barthélemy' => 'BL',
                  'Saint Helena, Ascension and Tristan da Cunha' => 'SH',
                  'Saint Kitts and Nevis' => 'KN',
                  'Saint Lucia' => 'LC',
                  'Saint Martin (French part)' => 'MF',
                  'Saint Pierre and Miquelon' => 'PM',
                  'Saint Vincent and the Grenadines' => 'VC',
                  'Samoa' => 'WS',
                  'San Marino' => 'SM',
                  'Sao Tome and Principe' => 'ST',
                  'Saudi Arabia' => 'SA',
                  'Senegal' => 'SN',
                  'Serbia' => 'RS',
                  'Seychelles' => 'SC',
                  'Sierra Leone' => 'SL',
                  'Singapore' => 'SG',
                  'Sint Maarten (Dutch part)' => 'SX',
                  'Slovakia' => 'SK',
                  'Slovenia' => 'SI',
                  'Solomon Islands' => 'SB',
                  'Somalia' => 'SO',
                  'South Africa' => 'ZA',
                  'South Georgia and the South Sandwich Islands' => 'GS',
                  'South Sudan' => 'SS',
                  'Spain' => 'ES',
                  'Sri Lanka' => 'LK',
                  'Sudan' => 'SD',
                  'Suriname' => 'SR',
                  'Svalbard and Jan Mayen' => 'SJ',
                  'Swaziland' => 'SZ',
                  'Sweden' => 'SE',
                  'Switzerland' => 'CH',
                  'Syrian Arab Republic' => 'SY',
                  'Taiwan, Province of China' => 'TW',
                  'Tajikistan' => 'TJ',
                  'Tanzania, United Republic of' => 'TZ',
                  'Thailand' => 'TH',
                  'Timor-Leste' => 'TL',
                  'Togo' => 'TG',
                  'Tokelau' => 'TK',
                  'Tonga' => 'TO',
                  'Trinidad and Tobago' => 'TT',
                  'Tunisia' => 'TN',
                  'Turkey' => 'TR',
                  'Turkmenistan' => 'TM',
                  'Turks and Caicos Islands' => 'TC',
                  'Tuvalu' => 'TV',
                  'Uganda' => 'UG',
                  'Ukraine' => 'UA',
                  'United Arab Emirates' => 'AE',
                  'United Kingdom' => 'GB',
                  'United States' => 'US',
                  'United States Minor Outlying Islands' => 'UM',
                  'Uruguay' => 'UY',
                  'Uzbekistan' => 'UZ',
                  'Vanuatu' => 'VU',
                  'Venezuela, Bolivarian Republic of' => 'VE',
                  'Viet Nam' => 'VN',
                  'Virgin Islands, British' => 'VG',
                  'Virgin Islands, U.S.' => 'VI',
                  'Wallis and Futuna' => 'WF',
                  'Western Sahara' => 'EH',
                  'Yemen' => 'YE',
                  'Zambia' => 'ZM',
                  'Zimbabwe' => 'ZW'];

      update_option('aae_countries', $countries, true);
  }

  /**
   * Scripts and stylesheets for the plugin
   */

  public static function assetLoader() {
    wp_enqueue_script('event-registration', plugins_url('../js/eventRegistration.js', __FILE__), ['jquery'], '', true);
  }

  public static function adminAssetLoader() {
    if(get_current_screen()->base === 'event_page_aa-event-reports') {
      wp_enqueue_style('datatables', plugins_url('../css/datatables.css', __FILE__));
    }
  }
}