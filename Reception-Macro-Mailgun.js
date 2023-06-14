/********************************************************
 * 
 * Macro Author:      	William Mills
 *                    	Technical Solutions Specialist 
 *                    	wimills@cisco.com
 *                    	Cisco Systems
 * 
 * Version: 1-0-1
 * Released: 06/14/23
 * 
 * This Webex Device macro demos how you can turn your device
 * into a reception check in system which collects a guests details
 * and send this information to a member of staff via a Mailgun email.
 * 
 * Full Readme, source code and license details available on Github:
 * https://github.com/wxsd-sales/reception-macro
 * 
 ********************************************************/

import xapi from 'xapi';


// Mailgun sandbox details
const API_BASE_URL = 'https://api.mailgun.net/v3/<SANDBOX-DOMAIN>/messages';
const USERNAME = 'api';
const API_KEY = '################';
const TO = 'user@example.com';
const FROM = 'mailgun@<SANDBOX-DOMAIN>';

// Set the number for the auto dial button to call
const NUMBER = 'staff@example.com';

// Set the number for the auto dial button to call
const CALL_BACK = 'staff@example.com';

// Device Location, used for the notification
const DEVICE_LOCATION = 'Reception';

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

// Convert the usernamae and password into hash for basic auth with mailgun
const hash = btoa(`${USERNAME}:${API_KEY}`);

// Varible to store name entered
let tempName = '';

// Enable HTTP Client for Mailgun API requests
xapi.Config.HttpClient.Mode.set('On');

// Create and add our Check In and Call Buttons
const checkInButton = `<Extensions>
                        <Panel>
                          <Order>1</Order>
                          <Type>Home</Type>
                          <Icon>Home</Icon>
                          <Color>#A866FF</Color>
                          <Name>Check In</Name>
                          <ActivityType>Custom</ActivityType>
                        </Panel>
                      </Extensions>`

const callButton = `<Extensions>
                      <Panel>
                        <Order>2</Order>
                        <Type>Home</Type>
                        <Icon>Helpdesk</Icon>
                        <Color>#FF0000</Color>
                        <Name>Call for assistance</Name>
                        <ActivityType>Custom</ActivityType>
                      </Panel>
                    </Extensions>`;

xapi.Command.UserInterface.Extensions.Panel.Save({ PanelId: 'send_email' }, checkInButton)
xapi.Command.UserInterface.Extensions.Panel.Save({ PanelId: 'place_call' }, callButton)


// Hide the user interface
xapi.Config.UserInterface.Features.HideAll.get().then(value => {
  console.log('Hide UI is : ' + value);
  if (value == 'False') {
    console.log('Hiding the UI');
    xapi.Config.UserInterface.Features.HideAll.set("True");
  }
});

// Hide the settings menu
xapi.Config.UserInterface.SettingsMenu.Visibility.get().then(value => {
  console.log('Settings Visibility is : ' + value);
  if (value == 'Auto') {
    console.log('Hiding the settings');
    xapi.Config.UserInterface.SettingsMenu.Visibility.set('Hidden');
  }
});

// This function displays the panel depending on state
function showPanel(state) {

  let message = '';
  let name = '';
  let name_button = '';
  let submit = '';
  switch (state) {
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
    <Panel>
      <Origin>local</Origin>
      <Type>Never</Type>
      <Icon>Webex</Icon>
      <Color>#A8660</Color>
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
        <PageId>CheckIn</PageId>
        <Options>hideRowNames=1</Options>
      </Page>
    </Panel>
  </Extensions>
  `;

  xapi.Command.UserInterface.Extensions.Panel.Save({ PanelId: 'Check_In_1' }, panel)
    .then((event) => {
      xapi.Command.UserInterface.Extensions.Panel.Open({ PanelId: 'Check_In_1' })
    });
}


// Listen for clicks on the buttons
xapi.Event.UserInterface.Extensions.Widget.Action.on(event => {
  if (event.Type !== 'clicked') return;

  switch (event.WidgetId){
    case 'enter_name':
      console.log('Enter name clicked');
      xapi.Command.UserInterface.Message.TextInput.Display({
        FeedbackId: 'enter_name',
        Text: 'Please enter your name',
        InputType: 'SingleLine',
        Placeholder: 'Name',
        Duration: 0,
      }).catch((error) => console.error(error));
      break;
    case 'submit_button':
      console.log('Submit button clicked');
      xapi.Command.UserInterface.Extensions.Panel.Close();
      const timestamp = new Date().toUTCString();
      const PAYLOAD = {
        "to": TO,
        "from": FROM,
        "subject": `${tempName} just checked in at the ${DEVICE_LOCATION}`,
        "text": `${tempName} just checked in at the ${DEVICE_LOCATION} at ${timestamp}`
      }
      mailgunSend(PAYLOAD);
      break;
  }
});

// Listen for text inputs
xapi.Event.UserInterface.Message.TextInput.Response.on(event => {
  if(event.FeedbackId != 'enter_name') return;
  tempName = event.Text;
  console.log('Name Entered: ' + tempName);
  showPanel('submit');
})


// Listen for initial button presses
xapi.Event.UserInterface.Extensions.Panel.Clicked.on(event => {
  switch (event.PanelId){
    case 'send_email':
      tempName = '';
      console.log('Send Email Selected');
      showPanel('initial')
      break;
    case 'place_call':
      console.log('Place Call Selected');
      xapi.Command.Dial({ Number: NUMBER });
      break;
  }
})


// This function sends an email via mailgun
// the payload requires a payload object containting
// to, from, subject and text
function mailgunSend(data) {

  console.log('Sending Email');

  // Convert payload to form data structure
  const parameters = `?to=${data.to}&from=${data.from}&subject=${data.subject}&text=${data.text}`;

  console.log(parameters);
  console.log(hash)

  const URL = API_BASE_URL + encodeURI(parameters);

  // Sending payload

  xapi.Command.HttpClient.Post({
    Header: [
      "Authorization: Basic " + hash],
    Url: URL,
    ResultBody: 'plaintext'
  },'')
  .then((result) => {
      console.log('Email sent');
      console.log(result.Body);
      xapi.Command.UserInterface.Message.Alert.Display
        ({
          Duration: 3
          , Text: 'Check in successful'
          , Title: 'Success'
        });
    })
    .catch((err) => {
      console.log("Failed: " + JSON.stringify(err));

      // This will close the panel and notifiy an error
      xapi.Command.UserInterface.Message.Alert.Display
        ({
          Duration: 3
          , Text: 'Could not send email'
          , Title: 'Error'
        });
    });

  
}

// This function will detect if a call is in an answered state
// and enable call controls if enabled for this macro
function detectCallAnswered(event) {
  // Log all Call Answerstate events
  console.log(event);

  // Check that it is Answered and that currentMarco is true
  if (event != 'Answered' && SHOW_INCALL_CONTROLS == true) return;

  console.log('Call answered, showing call controls');
  xapi.Config.UserInterface.Features.HideAll.set("False");
}

// This function will detect if a call ending or receiving a call
function detectCall(event) {
  if (event == 'Disconnecting') {
    console.log('Call disconnecting, hiding the call controls');
    xapi.Config.UserInterface.Features.HideAll.set("True");
  } else if (event == 'Connecting' && SHOW_INCALL_CONTROLS == true) {
    console.log('Call Ringing, showing call controls');
    xapi.Config.UserInterface.Features.HideAll.set("False");
  }
}

// Handles all incoming call events
async function checkCall(event) {

  console.log('Incoming call');
  console.log(event);

  // If there is no current call, record it and answer it
  if (!activeCall && ALLOW_AUTO_ANSWER) {

    // Check RemoteURI against regex numbers

    const normalisedURI = normaliseRemoteURI(event.RemoteURI);

    const isMatch = AUTOANSWER_NUMBERS_REGEX.some(rx => rx.test(normalisedURI));

    if (isMatch) {
      answerCall(event);
    } else {
      console.log('Did not match Regex, call ignored');
    }

  } else {

    // Reject the call if that is our preference 
    if (REJECT_ADDITIONAL_CALLS) {
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
  xapi.Command.Call.Accept({ CallId: event.CallId })
  .catch((error) => console.error(error));
}

// Subscribe to the Call Status and send it to our custom functions
xapi.Status.Call.AnswerState.on(detectCallAnswered);
xapi.Status.Call.Status.on(detectCall);
xapi.Event.IncomingCallIndication.on(checkCall);
