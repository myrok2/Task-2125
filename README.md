# Agile Alliance Site

This is a WordPress repository configured to run on the [Pantheon platform](https://pantheon.io).

Pantheon is website platform optimized and configured to run high performance sites with an amazing developer workflow. There is built-in support for features such as Varnish, Redis, Apache Solr, New Relic, Nginx, PHP-FPM, MySQL, PhantomJS and more. 

## Local Development

*Software Requirements:*

* Node 10.x / Yarn 1.9+
* Docker 18+

*Initial Setup:*

1. Clone this repo to your local workstation
1. Run `cp web/wp-config-local.example.php web/wp-config-local.php` to clone a local
   config file. You may customize if needed but the new version should remain outside
   of Git.
1. If working on the search plugin, you'll want to make a similar copy of the file below:
   `web/wp-content/plugins/agile-alliance-search/client/src/local-config.sample.js`
   Simply rename and place the file in the same directory as `local-config.js` 
1. Ensure Yarn 1.9+, run `yarn` from the project root to install dependencies
   * Note: This installs dependencies in both the following directories:
     1. `web/wp-content/themes/agilealliance`
     1. `web/wp-content/plugins/agile-alliance-search/client`
   * Compound dependency setup is possible via Yarn Workspaces config in the root package.json
1. Run `yarn build` to generate build artifacts
1. Recommended: If you wish to initialize your local environment with a DB backup from a live
   environment, retrieve a SQL dump from the Pantheon dashboard (Request from devops if
   you're unclear on how this is done) then...
   1. Create a directory in your project root called `mariadb-init`
   1. Place the sql file within this folder
   1. Uncomment the following lines in your `docker-compose.yml` file (note that the initial DB import can be large and correspondingly a lengthy process):  
       ```
       #    volumes:
       #      - ./mariadb-init:/docker-entrypoint-initdb.d # Place init .sql file(s) here.
       ```
    1. Teardown your docker environment by running `docker-compose down` in the project root
    1. Run `docker-compose up` to launch the application
    1. Pay close attention to log entries starting with `agile_alliance_mariadb`, as import
       progress will be displayed here.

*Launch Local Development Environment*

1. Run `docker-compose up` to launch local server (this might take a few minutes)
1. Open http://aa.docker.localhost:9000 to access site
1. The admin URL may require the re-addition of the port if it otherwise fails. For example, http://aa.docker.localhost:9000/wp-login.php?redirect_to=http%3A%2F%2Faa.docker.localhost%3A9000%2Fwp-admin%2F&reauth=1
1. ALT. WORKAROUND: If site loads (on :9000) BUT /wp-admin isn't accessible (just forwards on login), while the site is running: Open Kitematic and in the Traefik container, under "Hostname/Ports" set the "Docker Port" to 80. You should then be able to just use http://aa.docker.localhost/wp-admin/ ...but it may take awhile to load the first time.

## AA Custom Search

Within `web/wp-content/plugins/agile-alliance-search` lives a custom plugin
built to push all post types to ElasticSearch. 

Refer to plugin's readme to learn more about how it works:

`web/wp-content/plugins/agile-alliance-search/client/README.md`

## Front End Developer Setup

The Agile Alliance theme is based on:
- [**Roots - Sage**](http://roots.io/sage)

#### Features
* [gulp](http://gulpjs.com/) build script that compiles both Sass and Less, checks for JavaScript errors, optimizes images, and concatenates and minifies files
* [BrowserSync](http://www.browsersync.io/) for keeping multiple browsers and devices synchronized while testing, along with injecting updated CSS and JS into your browser while you're developing
* [Bower](http://bower.io/) for front-end package management
* [asset-builder](https://github.com/austinpray/asset-builder) for the JSON file based asset pipeline
* [Sass](https://github.com/twbs/bootstrap-sass) [Bootstrap](http://getbootstrap.com/)
* [Theme wrapper](https://roots.io/sage/docs/theme-wrapper/)
* ARIA roles and microformats
* Posts use the [hNews](http://microformats.org/wiki/hnews) microformat
* [Multilingual ready](https://roots.io/wpml/) and over 30 available [community translations](https://github.com/roots/sage-translations)

Install the [Soil](https://github.com/roots/soil) plugin to enable additional features:

* Cleaner output of `wp_head` and enqueued assets
* Cleaner HTML output of navigation menus
* Root relative URLs
* Nice search (`/search/query/`)
* Google CDN jQuery snippet from [HTML5 Boilerplate](http://html5boilerplate.com/)
* Google Analytics snippet from [HTML5 Boilerplate](http://html5boilerplate.com/)

---
### Installing Project Dependencies

#### Requirements

- PHP >= 5.4.X
- Node.js >= 0.12.x
- npm >= 2.1.x
- gulp >= 3.8.10
- Bower >= 1.3.12

##### Available gulp commands

* `gulp` — Compile and optimize the files in your assets directory
* `gulp watch` — Compile assets when file changes are made
* `gulp --production` — Compile assets for production (no source maps).


----

If this is your first time using Sage, please quickly familiarize yourself with the DRY Principle this site is founded on.  DRY = Don't Repeat Yourself.

[---  Read about DRY Principle - Sage Theme Wrapper](https://roots.io/sage/docs/theme-wrapper/)

----
### Configuration

Edit `lib/config.php` to enable or disable theme features

Edit `lib/init.php` to setup navigation menus, post thumbnail sizes, post formats, and sidebars.

- lib/assets.php - Enqueue stylesheets & scripts
- lib/conditional-tag-... - ConditionalTagCheck utility class.
- lib/config.php - Enable/disable theme features & config values.
- lib/extras.php - Extra helpers / functions
- lib/init.php - Register menus, sidebars theme support & addl core functionality.
- lib/titles.php - Control the output of page titles.
- lib/utils.php - Define a custom location for the searchform template.
- lib/wrapper.php - The [theme wrapper](https://roots.io/sage/docs/theme-wrapper/)

---
### Project Plug-ins

All project plug-ins used will be listed here as well as any specific information pertaining to integration.
