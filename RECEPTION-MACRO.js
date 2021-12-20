import xapi from 'xapi';


// Email details
const WEBHOOK_URL = '###############';


// Set the number for the auto dial button to call
const NUMBER = '#########';

// Add the Button to the touch panel
xapi.command('UserInterface Extensions Panel Save', {
    PanelId: 'send_email'
    }, `<Extensions>
      <Version>1.8</Version>
      <Panel>
        <Order>1</Order>
        <Type>Statusbar</Type>
        <Icon>Home</Icon>
        <Color>#A866FF</Color>
        <Name>Sign In</Name>
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
        <Type>Statusbar</Type>
        <Icon>Helpdesk</Icon>
        <Color>#FF0000</Color>
        <Name>Call for assistance</Name>
        <ActivityType>Custom</ActivityType>
      </Panel>
    </Extensions>`);


///////////////////////////////////
// Do not change anything below
///////////////////////////////////

// Varible to store temp name
let PAYLOAD = { 
  'to': 'wimills@cisco.com',
  'name': '',
  'message':  ''
}


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
  console.log('UI Features is : ' + value);
  if(value == 'False'){
    console.log('Hidding the UI');
    xapi.Config.UserInterface.Features.HideAll.set("True");
  }
});



// Listen for initial button presses
xapi.event.on('UserInterface Extensions Panel Clicked', (event) => {
    if(event.PanelId == 'send_email'){
      PAYLOAD.name = '';
      PAYLOAD.name = '';
      PAYLOAD.message = '';
      console.log('Send Email Selected');
      xapi.command("UserInterface Message Prompt Display", {
            Title: "Reception Sign In"
          , Text: 'Please enter your name below'
          , FeedbackId: 'sign_in_form'
          , 'Option.1': 'Tap to enter name:'
        }).catch((error) => { console.error(error); });
    } else if (event.PanelId == 'place_call') {
      console.log('Place Call Selected');

      xapi.Command.Dial(
        {  Number: NUMBER });

    }
});


// Listen for text inputs and display correct content
xapi.event.on('UserInterface Message TextInput Response', (event) => {
  switch(event.FeedbackId){
    case 'enter_name':
      PAYLOAD.name = event.Text;
      console.log('Name Entered: ' + PAYLOAD.name);
      xapi.command("UserInterface Message Prompt Display", {
            Title: "Reception Sign In"
          , Text: 'Please enter your name below'
          , FeedbackId: 'sign_in_form'
          , 'Option.1': 'Tap to change name: ' + PAYLOAD.name
          , 'Option.2': 'Tap to sign in'
        }).catch((error) => { console.error(error); });
      break; 
  }
});



// Handle all the Text Inputs
xapi.event.on('UserInterface Message Prompt Response', (event) => {
  console.log('FeedbackId: ' + event.FeedbackId + ' Option: '+ event.OptionId);
  switch(event.FeedbackId){
    case 'sign_in_form':
      switch(event.OptionId){
        case '1':   // This choice handles the name input
          xapi.command('UserInterface Message TextInput Display', {
            FeedbackId: 'enter_name',
            Text: 'Please enter your name',
            InputType: 'SingleLine',
            Placeholder: '',
            Duration: 0,
          }).catch((error) => { console.error(error); });
          break;
        case '2':   // This choice sends the email notification
          sendEmail();
          break;
      }
    break;
  }
});



function sendEmail(){

  console.log('Sending Email');




  const date = Date.now();


  PAYLOAD.message = new Date();

  console.log(PAYLOAD);

  xapi.command('HttpClient Post', { 
    Header: ["Content-Type: application/json"], 
    Url: WEBHOOK_URL,
    ResultBody: 'plaintext'
  }, 
    JSON.stringify(PAYLOAD))
  .then((result) => {
     xapi.Command.UserInterface.Message.Alert.Display
        ({ Duration: 3
        , Text: 'Sign in successful'
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


