import xapi from 'xapi';


// Webex details
const BOT_API_KEY = '#########';

// Who you want to notify
const TO = 'staff@example.com';

// Set the number for the auto dial button to call
const NUMBER = 'staff@example.com';

// Set the number for the auto dial button to call
const CALL_BACK = 'reception@example.com';

// Show call controls while in call
const SHOW_INCALL_CONTROLS = true;

// Allow the device to auto answer calls which match
// the regular expressions below
const ALLOW_AUTO_ANSWER = true;

// Create your array of regular expressions
const AUTOANSWER_NUMBERS_REGEX = [/^12345.*@example.com$/, 
                                  /^staff.*@example.com$/,
                                  /^.*1231232/];

///////////////////////////////////
// Do not change anything below
///////////////////////////////////


const WEBEX_URL = 'https://webexapis.com/v1/messages';

// Varible to store name entered
let tempName = '';
let activeCall = false;


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
  if(value == 'False'){
    console.log('Hiding the UI');
    xapi.Config.UserInterface.Features.HideAll.set("True");
  }
});

// Hide the settings menu
xapi.Config.UserInterface.SettingsMenu.Visibility.get().then(value => {
  console.log('Settings Visibility is : ' + value);
  if(value == 'Auto'){
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
      name_button = 'Change Name';
      name = `<Widget>
                  <WidgetId>name_text</WidgetId>
                  <Name>Name Entered: ${tempName}</Name>
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
  
  const time = `${timestamp.getUTCHours()}:${timestamp.getUTCMinutes()}`;

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
      const timestamp = new Date();

      const PAYLOAD = { 
        "toPersonEmail": TO,
        "text": `${tempName} just checked in at the: ${DEVICE_LOCATION}`,
        "markdown" : `## ${tempName} just checked in at the: ${DEVICE_LOCATION}\n[Click here to call the device](tel:${CALL_BACK})`,
        "attachments" : generateAdaptiveCard(tempName)
      }
      sendMessage(PAYLOAD);
    }
    
  });

// Listen for text inputs
xapi.event.on('UserInterface Message TextInput Response', (event) => {
  switch(event.FeedbackId){
    case 'enter_name':
      tempName = event.Text;
      console.log('Name Entered: ' + tempName);
      showPanel('submit');
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

  console.log (event);

  if(event == 'Disconnecting' ){
    console.log('Call disconnecting, hiding the call controls');
    activeCall = false;
    xapi.Config.UserInterface.Features.HideAll.set("True");
  } else if(event == 'Connecting' && SHOW_INCALL_CONTROLS == true){
    console.log('Call Ringing, showing call controls');
    xapi.Config.UserInterface.Features.HideAll.set("False");
  }

}

// Handles all incoming call events
async function checkCall(event){

  console.log('Incoming call');
  console.log(event);

  // If there is no current call, record it and answer it
  if(!activeCall && ALLOW_AUTO_ANSWER){
   
    // Check RemoteURI against regex numbers

    const normalisedURI = normaliseRemoteURI(event.RemoteURI);

    const isMatch = AUTOANSWER_NUMBERS_REGEX.some(rx => rx.test(normalisedURI));

    if(isMatch){
      answerCall(event);
    } else {
      console.log('Did not match Regex, call ignored');
    }
  
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

// Subscribe to the Call Status and send it to our custom functions
xapi.Status.Call.AnswerState.on(detectCallAnswered);
xapi.Status.Call.Status.on(detectCall);
xapi.Event.IncomingCallIndication.on(checkCall);
