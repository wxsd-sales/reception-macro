import xapi from 'xapi';


// Webex details
const BOT_API_KEY = '#############';

// Who you want to notify, this can also be a space ID
const TO = 'staff@example.com';

// Set the number for the auto dial button to call
const NUMBER = 'staff@example.com';

// Set the number for the auto dial button to call
const CALL_BACK = 'device@example.com';

// Device Location, used for the notification
const DEVICE_LOCATION = 'Reception';

// Show call controls while in call
const SHOW_INCALL_CONTROLS = true;

// Allow the device to auto answer calls which match
// the regular expressions below
const ALLOW_AUTO_ANSWER = true;

// Allow for additional calls to be recieved
const REJECT_ADDITIONAL_CALLS = true;

// Create your array of regular expressions
const AUTOANSWER_NUMBERS_REGEX = [/^12345.*@example.com$/, 
                                  /^user.*@example.com$/,
                                  /^.*1231232/];

// By default, this macro hides the Settings UI and
// Call Controls. If you wish to test this macro without
// hiding these, change this value to false.
const HIDE_UI = true;

// While this macro is running and the above HIDE_UI value
// is set to true, it may still be neccessary to open
// the settings menu. For that reason, you can set a secret
// keyword which can be used as the check in name which will
// toggle the settings menu visibility. It isn't case sensitive.
// Set it to a blank keyword if you do not want this feature available.
const UNLOCK_KEYWORD = 'settings';


///////////////////////////////////
// Do not change anything below
///////////////////////////////////


const WEBEX_URL = 'https://webexapis.com/v1/messages';
const WEBEX_PEOPLE = 'https://webexapis.com/v1/people';

// Varibles to store states
let tempName = '';
let activeCall = false;
let tempSettings = false;


// Enable the HTTP client if it isn't already
xapi.Config.HttpClient.Mode.get().then(value => {
  console.log('HTTP Client is : ' + value);
  if(value == 'Off'){
    console.log('Enabling HTTP Client');
    xapi.Config.HttpClient.Mode.set('On');
  }
});

// Hide the user interface
xapi.Config.UserInterface.Features.HideAll.get().then(value => {
  console.log('Hide UI is : ' + value);
  if(value == 'False' && HIDE_UI){
    console.log('Hiding the UI');
    xapi.Config.UserInterface.Features.HideAll.set("True");
  }
});

// Hide the settings menu
xapi.Config.UserInterface.SettingsMenu.Visibility.get().then(value => {
  console.log('Settings Visibility is : ' + value);
  if(value == 'Auto' && HIDE_UI){
    console.log('Hiding the settings');
    xapi.Config.UserInterface.SettingsMenu.Visibility.set('Hidden');
  }
});


// Add the Button to the touch panel
// Change the color, icon and name as desired
xapi.command('UserInterface Extensions Panel Save', {
    PanelId: 'send_email'
    }, `<Extensions>
      <Version>1.8</Version>
      <Panel>
        <Order>1</Order>
        <Type>Home</Type>
        <Icon>Home</Icon>
        <Color>#A866FF</Color>
        <Name>Check In</Name>
        <ActivityType>Custom</ActivityType>
      </Panel>
    </Extensions>`);

// Add the Button to the touch panel
xapi.command('UserInterface Extensions Panel Save', {
    PanelId: 'place_call'
    }, `<Extensions>
      <Version>1.8</Version>
      <Panel>
        <Order>1</Order>
        <Type>Home</Type>
        <Icon>Helpdesk</Icon>
        <Color>#FF0000</Color>
        <Name>Call for assistance</Name>
        <ActivityType>Custom</ActivityType>
      </Panel>
    </Extensions>`);

// This function displays the panel depending on state
function showPanel(state){

  let message = '';
  let name = '';
  let name_button = '';
  let submit = '';
  switch(state){
    case 'initial':
      message = 'Please enter your name to check in';
      name = '';
      name_button = 'Enter Name';
      submit = '';
      break;
    case 'submit':
      message = 'Press check in when ready';
      name_button = 'Change';
      name = `<Widget>
                  <WidgetId>name_text</WidgetId>
                  <Name>Name: ${tempName}</Name>
                  <Type>Text</Type>
                  <Options>size=2;fontSize=normal;align=center</Options>
                </Widget>`;
      submit = `<Row>
                    <Widget>
                      <WidgetId>submit_button</WidgetId>
                      <Name>Check In</Name>
                      <Type>Button</Type>
                      <Options>size=2</Options>
                    </Widget>
                  </Row>`;
      break;
  }

  let panel = `<Extensions>
    <Version>1.8</Version>
    <Panel>
      <Order>9</Order>
      <Origin>local</Origin>
      <Type>Never</Type>
      <Icon>Webex</Icon>
      <Color>#A8660</Color>
      <Name>Check_In_1</Name>
      <ActivityType>Custom</ActivityType>
      <Page>
        <Name>Check In</Name>
        <Row>
          <Widget>
            <WidgetId>message</WidgetId>
            <Name>${message}</Name>
            <Type>Text</Type>
            <Options>size=4;fontSize=normal;align=center</Options>
          </Widget>
        </Row>
        <Row>
          ${name}
          <Widget>
            <WidgetId>enter_name</WidgetId>
            <Name>${name_button}</Name>
            <Type>Button</Type>
            <Options>size=2</Options>
          </Widget>
        </Row>
        ${submit}
        <PageId>ticTac~Toe</PageId>
        <Options>hideRowNames=1</Options>
      </Page>
    </Panel>
  </Extensions>
  `;

  xapi.command('UserInterface Extensions Panel Save', {
        PanelId: 'Check_In_1'
    }, panel
  ).then((event) => {
          xapi.command('UserInterface Extensions Panel Open', {
              PanelId: 'Check_In_1'
          })
      });
}

function generateAdaptiveCard(name){

  const timestamp = new Date();

  let hour = timestamp.getUTCHours();
  let minute = timestamp.getUTCMinutes();
  const offset = timestamp.getTimezoneOffset()

  if(hour.toString().length < 2) hour = '0' + hour;
  if(minute.toString().length < 2) minute = '0' + minute;

  const time = `${hour}:${minute} UTC ${offset/60}`;

  console.log(time);

  const attachment = [
    {
        "contentType": "application/vnd.microsoft.card.adaptive",
        "content": {
          "type": "AdaptiveCard",
          "body": [
              {
                  "type": "ColumnSet",
                  "columns": [
                      {
                          "type": "Column",
                          "items": [
                              {
                                  "type": "Image",
                                  "style": "Person",
                                  "url": "https://i.imgur.com/jl8Abob.png",
                                  "size": "Medium",
                                  "height": "50px"
                              }
                          ],
                          "width": "auto"
                      },
                      {
                          "type": "Column",
                          "items": [
                              {
                                  "type": "TextBlock",
                                  "text": "Reception check in system",
                                  "weight": "Lighter",
                                  "color": "Accent"
                              },
                              {
                                  "type": "TextBlock",
                                  "weight": "Bolder",
                                  "text": `Someone just checked into ${DEVICE_LOCATION}`,
                                  "wrap": true,
                                  "color": "Light",
                                  "size": "Medium",
                                  "spacing": "Small"
                              }
                          ],
                          "width": "stretch"
                      }
                  ]
              },
              {
                  "type": "ColumnSet",
                  "columns": [
                      {
                          "type": "Column",
                          "width": 35,
                          "items": [
                              {
                                  "type": "TextBlock",
                                  "text": "Name:",
                                  "color": "Light"
                              },
                              {
                                  "type": "TextBlock",
                                  "text": "Time:",
                                  "weight": "Lighter",
                                  "color": "Light",
                                  "spacing": "Small"
                              }
                          ]
                      },
                      {
                          "type": "Column",
                          "width": 65,
                          "items": [
                              {
                                  "type": "TextBlock",
                                  "text": name,
                                  "color": "Light"
                              },
                              {
                                  "type": "TextBlock",
                                  "text": time,
                                  "color": "Light",
                                  "weight": "Lighter",
                                  "spacing": "Small"
                              }
                          ]
                      }
                  ],
                  "spacing": "Padding",
                  "horizontalAlignment": "Center"
              },
              {
                  "type": "TextBlock",
                  "text": "You can greet them using the link below:"
              },
              {
                  "type": "ColumnSet",
                  "columns": [
                      {
                          "type": "Column",
                          "width": "auto",
                          "items": [
                              {
                                  "type": "Image",
                                  "altText": "",
                                  "style": "Person",
                                  "url": "https://i.imgur.com/tet32tw.png",
                                  "size": "stretch",
                                  "width": "20px"
                              }
                          ],
                          "spacing": "Small"
                      },
                      {
                          "type": "Column",
                          "width": "Stretch",
                          "items": [
                              {
                                  "type": "TextBlock",
                                  "text": `[Dial the device](webexteams://meet?sip=${CALL_BACK})`,
                                  "size": "Medium"
                              }
                          ],
                          "verticalContentAlignment": "Center",
                          "spacing": "Small"
                      }
                  ]
              }
          ],
          "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
          "version": "1.2"
      }
    }
  ];

  return attachment;
}

// Listen for clicks on the buttons
xapi.Event.UserInterface.Extensions.Widget.Action.on((event) => {

    if (event.Type !== 'clicked')
      return
      
    if (event.WidgetId == 'enter_name'){
      console.log('enter name clicked');
      xapi.command('UserInterface Message TextInput Display', {
            FeedbackId: 'enter_name',
            Text: 'Please enter your name',
            InputType: 'SingleLine',
            Placeholder: 'Name',
            Duration: 0,
          }).catch((error) => { console.error(error); });
    }
    else if (event.WidgetId == 'submit_button'){
      console.log('submit button clicked');
      xapi.command('UserInterface Extensions Panel Close');

      let PAYLOAD = { 
        "text": `${tempName} just checked in at the: ${DEVICE_LOCATION}`,
        "markdown" : `## ${tempName} just checked in at the: ${DEVICE_LOCATION}\n[Click here to call the device](tel:${CALL_BACK})`,
        "attachments" : generateAdaptiveCard(tempName)
      }

      if (TO.indexOf('@') > -1){
        PAYLOAD["toPersonEmail"] = TO
      } else {
        PAYLOAD["roomId"] = TO
      }

      sendMessage(PAYLOAD);
    }
    
  });

// Listen for text inputs
xapi.event.on('UserInterface Message TextInput Response', (event) => {
  switch(event.FeedbackId){
    case 'enter_name':
      tempName = event.Text;
      console.log('Name: ' + tempName);
      if(tempName.toLowerCase() == UNLOCK_KEYWORD.toLowerCase() && tempName != ''){
        toggleSettings();
      } else {
        showPanel('submit');
      }
      break; 
  }
});


// Listen for initial button presses
xapi.event.on('UserInterface Extensions Panel Clicked', (event) => {
    if(event.PanelId == 'send_email'){
      tempName = '';
      console.log('Send Email Selected');
      showPanel('initial')
    } else if (event.PanelId == 'place_call') {
      console.log('Place Call Selected');

      xapi.Command.Dial(
        {  Number: NUMBER });

    }
});


// This function will use the Webex people API to convert a persons
// Webex ID to their email for use with the regular expression auto answer
function convertSparkId(event){

  const id = event.RemoteURI.substring(6);

  console.log('Converting ID: ' +id);

  const URL = WEBEX_PEOPLE + '?id=' + id;

  xapi.command('HttpClient Get', {
    Header: [
    "Content-Type: application/json",
    "Authorization: Bearer " + BOT_API_KEY] , 
    Url: URL,
    ResultBody: 'plaintext'
  })
  .then((result) => {
    console.log('People check sent');
    console.log(typeof(result));
    const body = JSON.parse(result.Body);
    const email = body.items[0].emails[0];
    console.log('ID to email: ' + email);
    event.RemoteURI = email;
    regxCheck(event);
  })
  .catch((err) => {
    console.log("Failed: " + JSON.stringify(err));
  });

}

function toggleSettings(){
  
  console.log("Setting UI toggle");

  if(!tempSettings){
    tempSettings = true;
    xapi.Config.UserInterface.SettingsMenu.Visibility.set('Auto');
    xapi.command('UserInterface Extensions Panel Close');
    xapi.Command.UserInterface.Message.Alert.Display
        ({ Duration: 3
        , Text: 'Settings visibility has been enabled'
        , Title: 'Settings Toggled'});
  } else {
    tempSettings = false;
    xapi.Config.UserInterface.SettingsMenu.Visibility.set('Hidden');
    xapi.command('UserInterface Extensions Panel Close');
    xapi.Command.UserInterface.Message.Alert.Display
        ({ Duration: 3
        , Text: 'Settings visibility has been disabled'
        , Title: 'Settings Toggled'});

  }




}


// This function sends an email via mailgun
// the payload requires a payload object containting
// to, from, subject and text
function sendMessage(data){

  console.log('Sending Webex Message');

  console.log(data);

  // Sending payload
  xapi.command('HttpClient Post', {
    Header: [
    "Content-Type: application/json",
    "Authorization: Bearer " + BOT_API_KEY] , 
    Url: WEBEX_URL,
    ResultBody: 'plaintext'
  }, JSON.stringify(data))
  .then((result) => {
    console.log('Message sent');
    console.log(result);
    xapi.Command.UserInterface.Message.Alert.Display
      ({ Duration: 3
      , Text: 'Check in successful'
      , Title: 'Success'});
  })
  .catch((err) => {
    console.log("Failed: " + JSON.stringify(err));
    console.log(err);
        
    // Should close panel and notifiy errors
    xapi.Command.UserInterface.Message.Alert.Display
        ({ Duration: 3
        , Text: 'Could not send message'
        , Title: 'Error'});
  });

}

// This function will detect if a call is in an answered state
// and enable call controls if enabled for this macro
function detectCallAnswered(event){

  // Log all Call Answerstate events
  console.log(event);
  
  // Check that it is Answered and that currentMarco is true
  if(event != 'Answered' && SHOW_INCALL_CONTROLS == true )
    return;
 
  console.log('Call answered, showing call controls');
  xapi.Config.UserInterface.Features.HideAll.set("False");
    

}

// This fuction will remove the SIP and Spark etc prefixes
function normaliseRemoteURI(number){
 
  var regex = /^(sip:|h323:|spark:|h320:|webex:|locus:)/gi;
  number = number.replace(regex, '');
  
  console.log('Normalised Remote URI to: ' + number);
  return number;
}

// This function will detect if a call ending or receiving a call
function detectCall(event){

  console.log(event);

  if(event == 'Connecting' && SHOW_INCALL_CONTROLS == true){
    console.log('Call Ringing, showing call controls');
    xapi.Config.UserInterface.Features.HideAll.set("False");
  }

}


// This function checks the calling number against our regular expression list
function regxCheck(event){

  const normalisedURI = normaliseRemoteURI(event.RemoteURI);

  const isMatch = AUTOANSWER_NUMBERS_REGEX.some(rx => rx.test(normalisedURI));

  if(isMatch){
    answerCall(event);
  } else {
    console.log('Did not match Regex, call ignored');
  }

}

// This function handles all incoming numbing checking
function checkNumber(event){

  // For numbers begining with spark we need to convert to a URI
  if (event.RemoteURI.indexOf('spark:') > -1)
  {
    convertSparkId(event);
  } else {
    // Otherwise we send it straight to the regular expression check
    regxCheck(event);
  } 

}

// Handles all incoming call events
async function checkCall(event){

  console.log('Incoming call');
  console.log(event);

  // If there is no current call and auto answer is enabled, check the number
  if(!activeCall && ALLOW_AUTO_ANSWER){
    checkNumber(event); 
  } else {

    // Reject the call if that is our preference 
    if(REJECT_ADDITIONAL_CALLS){
      console.log('Additional Call Rejected');
      xapi.Command.Call.Reject(
        { CallId: event.CallId });
      return;
    }

    // Otherwise ingnore incoming call
    console.log('Ignoring this call')


    // We won't bother to answer this additional call and let the system handle
    // it with its default behaviour
  }
    
}


// This fuction will store the current call information and answer the call
function answerCall(event) {
  
  console.log('Answering call')
  
  // Set active Call to true
  activeCall = true;

  xapi.Command.Call.Accept(
    { CallId: event.CallId }).catch(
      (error) =>{
        console.error(error);
      });

}


function disconnecting(event){

  console.log('Call disconnecting, hiding the call controls');
  activeCall = false;
  if(HIDE_UI){
    xapi.Config.UserInterface.Features.HideAll.set("True");
  }

}


// Subscribe to the Call Status and send it to our custom functions
xapi.Status.Call.AnswerState.on(detectCallAnswered);
xapi.Status.Call.Status.on(detectCall);
xapi.Event.IncomingCallIndication.on(checkCall);
xapi.Event.CallDisconnect.on(disconnecting);
