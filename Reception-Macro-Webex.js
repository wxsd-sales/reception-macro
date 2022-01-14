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

///////////////////////////////////
// Do not change anything below
///////////////////////////////////


const WEBEX_URL = 'https://webexapis.com/v1/messages';

// Varible to store name entered
let  tempName = '';


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
        "text": `${tempName} just checked in at ${timestamp}`,
        "markdown" : `##${tempName} just checket in\n[Click here to call the reception device](tel:${CALL_BACK})`,
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
