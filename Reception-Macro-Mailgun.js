import xapi from 'xapi';


// Mailgun sandbox details
const API_BASE_URL = 'https://api.mailgun.net/v3/<SANDBOX-DOMAIN>/messages';
const USERNAME = 'api';
const API_Key = '################';
const TO = 'user@example.com';
const FROM = 'mailgun@<SANDBOX-DOMAIN>';


// Set the number for the auto dial button to call
const NUMBER = 'staff@example.com';


///////////////////////////////////
// Do not change anything below
///////////////////////////////////

// Convert the usernamae and password into hash for basic auth with mailgun
const hash = btoa(`${USERNAME}:${API_Key}`);

// Varible to store name entered
let  tempName = '';

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
        "to": TO,
        "from": FROM, 
        "subject": tempName+' just checked in',
        "text": `${tempName} just checked in at ${timestamp}`
      }
      mailgunSend(PAYLOAD);
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
function mailgunSend(data){

  console.log('Sending Email');

  // Convert payload to form data structure
	const parameters = `?to=${data.to}&from=${data.from}&subject=${data.subject}&text=${data.text}`;

  console.log(parameters);
  
  const URL = API_BASE_URL+encodeURI(parameters);

  // Sending payload
  xapi.command('HttpClient Post', {
    Header: [
    "Host: mailgun.org",
    "Authorization: Basic " + hash] , 
    Url: URL,
    ResultBody: 'plaintext'
  }, '')
  .then((result) => {
    console.log('Email sent');
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
        , Text: 'Could not send email'
        , Title: 'Error'});
  });

  
}
