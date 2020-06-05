<style>
  ol ol {
    margin-left: 30px;
    margin-top: 7px;
  }
  ol {
    margin-left: 30px;
  }
  .aside {
    float: right;
    max-width: 540px;
    box-sizing: border-box;
    margin-right: 23px;
    margin-top: 25px;
    background: #fff;
    border-left: 4px solid #fff;
    -webkit-box-shadow: 0 1px 1px 0 rgba(0,0,0,.1);
    box-shadow: 0 1px 1px 0 rgba(0,0,0,.1);
    padding: 1px 12px;
  }
</style>

<div class="aside">
  <div id="top">
    <h2>Saving CSV Files</h2>
    <p>It's important that the CSV being imported is saved correctly otherwise sessions may not be imported correctly or not at all. Refer to your corresponding operating system below for more information.</p>
    <h4>Skip to Instructions for:</h4>
    <p> <a href="#windows">Windows Users</a> <br> <a href="#mac">Mac Users </a> <br> <a href="#google">Google Sheets Users </a> </p>
  </div>
  <hr>
  <h2 id="mac">Mac</h2>
  <p> *If you use <em><strong>Excel for Mac</strong></em>, we highly recommend that you open your spreadsheet in either Numbers or Google Sheets to convert and export the final csv file to UTF-8 encoding.&nbsp;Excel for Mac does not natively support the import or export of UTF-8 encoded files.<strong></strong></p>
  <h4>If you use Numbers</h4>
  <ol>
    <li>Click on <strong>File</strong></li>
    <li>Hover over <strong>Export</strong>
      <ol>
        <li>In the submenu that appears, choose <strong>CSV</strong></li>
        <li>Click on <strong>Advanced Options </strong>to show the <strong>Text Encoding </strong>dropdown</li>
        <li>Select <strong><em>Unicode (UTF-8)</em> </strong>from the dropdown menu</li>
        <li>Click <strong>Next</strong></li>
      </ol></li>
    <li><strong>Save! </strong></li>
  </ol>
  <hr>
  <h2 id="windows">Windows</h2>
  <h4>If you use Excel 2013</h4>
  <ol>
    <li>Click on <strong>File</strong></li>
    <li>In the panel to the left, click on <strong>Save As</strong></li>
    <li>There are two options to change in the Save-As dialog that comes up
      <ol>
        <li><strong>Save as type</strong>: Choose <em>CSV (Comma delimited) </em>from the list</li>
        <li> Click on <strong>Tools </strong>next to the <em>Save </em>button
          <ol>
            <li>Choose <strong>Web Options </strong>from the dropdown</li>
            <li>Click on the <strong>Encoding </strong>tab that shows up</li>
            <li><strong>Save this document as</strong>: Choose <em><strong>Unicode (UTF-8) </strong></em>from the dropdown</li>
            <li>Click the <strong>OK </strong>button</li>
          </ol></li>
      </ol></li>
    <li><strong>Save</strong>!</li>
  </ol>
  <h4>If you use Notepad</h4>
  <ol>
    <li>Click on <strong>File</strong></li>
    <li>Choose <strong>Save As</strong></li>
    <li><strong></strong>There are three items to update in the Save dialog that comes up:<br>
      <ol>
        <li><strong>Save as type</strong>: change this to <em>All Files</em></li>
        <li><strong>File name: </strong>name your file and add the .csv extension to it - <em>e.g.: myupdates.csv</em></li>
        <li><strong>Encoding</strong>: click on the dropdown and choose <strong>UTF-8</strong></li>
      </ol></li>
    <li><strong>Save!</strong></li>
  </ol>
  <hr>
  <h2 id="google"> Google Sheets </h2>
  <ol>
    <li> Click <strong>File</strong></li>
    <li>Click on or hover over <strong>Download As</strong></li>
    <li>Choose the option <em><strong>Comma-separated values (.csv, current sheet)</strong></em></li>
    <li>After clicking on that option, your file will be automatically downloaded to your computer<em><br> </em></li>
  </ol>
</div>

<div class="wrap">
  <h2>Instructions</h2>
  <ol>
    <li>Create the event(s) you want to upload sessions for</li>
    <li>Download the 3 template files at the bottom of this page.</li>
    <li>Fill in the appropriate information in each one</li>
    <li>Submit each file one at a time</li>
  </ol>
  <strong>Refer to the instructions to the right when saving CSV files to import.</strong>
</div>

<div class="wrap">
  <h2>Import Sessions, Session Attachments, and Session Videos</h2>
  %s
  <form id="import-sessions" method="post" enctype="multipart/form-data">
    <h2>Import Sessions</h2>
    <ol>
      <li>Select an event from the select menu</li>
      <li>Select the sessions CSV file (all sessions must belong to a single conference)</li>
      <li>Click the 'Import Sessions' button below</li>
    </ol>
    <p><em>Note: Uploading the same file more than once will result in duplicated sessions</em></p>
    %s (An event only needs to be selected when importing sessions)<br>
    <label style="display:none;" for="sessionsFile">Upload Sessions</label><input type="file" name="sessionsFile" /><br>
    <input type="submit" value="Import Sessions" />


    <h2>Import Videos</h2>
    <ol>
      <li>Select the file containing the videos (multiple conferences can be in a single file.)</li>
      <li>Click the 'Import Videos' button below</li>
    </ol>
    <label style="display:none;" for="sessionsVideosFile">Upload Session Videos</label><input type="file" name="sessionsVideosFile" /></label><br>
    <input type="submit" value="Import Videos" />


    <h2>Import Attachments</h2>
    <ol>
      <li>Select the file containing the attachments (multiple conferences can be in a single file.)</li>
      <li>Click the 'Import Attachments' button below</li>
    </ol>
    <label style="display:none;" for="sessionsAttachmentsFile">Upload Session Attachments</label><input type="file" name="sessionsAttachmentsFile" /></label><br>

    <input type="submit" value="Import Attachments" />
  </form>
</div>

<div class="wrap">
  <h2>Download CSV Sample Files</h2>
  <ul>
    <li><a href="%s" download>Sessions CSV Import (use one per event)</a></li>
    <li><a href="%s" download>Sessions Videos CSV Import (works for multiple events)</a></li>
    <li><a href="%s" download>Sessions Attachments CSV Import (works for multiple events)</a></li>
  </ul>
</div>