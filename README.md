# Reception-Macro

This macro replaces the interface on your Cisco Telepresence with a Reception Check-In system with two buttons. One button will allow a guest to check in and notify staff via email or as a Webex message send via a bot, the other button will automatically dial a member of staff.

## Flow of the check in process
![ezgif-2-6041f9e0f5](https://user-images.githubusercontent.com/21026209/148802958-06ecd19b-f57e-4ee5-8845-a28078257d17.gif)

## Requirements
1. A CE9.X or RoomOS Cisco Telepresence.
2. An Mailgun account or webhook to email service or Webex Bot account

## Setup
1. Depending on your deployment option (email, webhook or bot), modify parameters at the beginning of the macro.
For instance, for a Webex Bot account add the  ``BOT_API_KEY``, ``TO``, ``NUMBER``,  ``CALL_BACK`` parameters.
2. Upload the Macro ``RECEPTION_MACRO_*`` onto your device either through the web interface or via Control Hub.

## Uninstall
This macro hides the UI elements on your device, so to show them again, do the following.
1. Disable or remove the macro
2. Run the following commands on the CLI of your device:  
``xConfiguration UserInterface Features HideAll: False``.  
``xConfiguration UserInterface SettingsMenu Visibility: Auto``.  
More infromation available here:  
https://roomos.cisco.com/xapi/Configuration.UserInterface.Features.HideAll/
https://roomos.cisco.com/xapi/Configuration.UserInterface.SettingsMenu.Visibility.  
Alternatively you can run the ``Show-UI`` Macro to show the UI again.

## Webex Bot Account Setup
If you are intending to get notifications via Webex, you will need a bot account.
1. Sign into your Webex account and create a bot account [here](https://developer.webex.com/my-apps/new/bot)
2. Copy the bot access token use this in the ``RECEPTION_MACRO_WEBEX`` macro usder the ``BOT_API_KEY``
![image](https://user-images.githubusercontent.com/21026209/149517203-727afde3-9691-403b-9da3-db0c0464e887.png)


## Mailgun Account Setup
If you prefer to send the check in notification via an email, you can use services such as mailgun. You will need to create an account.
1. Create and new mailgun account [here](https://signup.mailgun.com/new/signup)
2. After creating your account, you can use the free sandbox to test the macro. Navigate to the sandbox domain to copy the details and setup your verified email addresses to test with. Then copy the parameters into the ``RECEPTION_MACRO_WEBEX`` macro.
![image](https://user-images.githubusercontent.com/21026209/149517957-25b218bb-6c5a-44c1-98fb-22b200a52e8a.png)
3. Ensure the all mailgun parameters are entered in the macro.
![image](https://user-images.githubusercontent.com/21026209/149520441-696c77a4-838f-418d-a23e-67c84f4a3446.png)



## Example of the Webex notification
![image](https://user-images.githubusercontent.com/21026209/149518970-5c17a16f-9005-400e-8b6e-650a46a69819.png)


## Example of the email notification
![image](https://user-images.githubusercontent.com/21026209/149518629-8d79765c-5007-41ff-8fd2-2a1c3fc4bb37.png)
