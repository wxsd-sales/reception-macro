import xapi from 'xapi';

// Hide the user interface
xapi.Config.UserInterface.Features.HideAll.get().then(value => {
  console.log('Hide UI is : ' + value);
  if(value == 'True'){
    console.log('Showing the UI');
    xapi.Config.UserInterface.Features.HideAll.set("False");
  }
});

// Hide the settings menu
xapi.Config.UserInterface.SettingsMenu.Visibility.get().then(value => {
  console.log('Settings Visibility is : ' + value);
  if(value == 'Hidden'){
    console.log('Showing the settings');
    xapi.Config.UserInterface.SettingsMenu.Visibility.set('Auto');
  }
});