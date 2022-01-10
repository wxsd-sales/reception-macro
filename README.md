# RECEPTION-MACRO

This macro replaces the interface on your Cisco Telepresence with a Reception Check-In system with two buttons. One button will allow a guest to check in and notifity staff via email, the other button will automatically dial a member of staff.

## Flow of the check in process
![ezgif-2-6041f9e0f5](https://user-images.githubusercontent.com/21026209/148802958-06ecd19b-f57e-4ee5-8845-a28078257d17.gif)

## Requirements
1. A CE9.X or RoomOS Cisco Telepresence.
2. An Email services which can send Emails triggered by a webhook.

## Setup
1. Add your email ``WEBHOOK_URL`` ``EMAIL`` and ``NUMBER``to ``RECEPTION_MACRO``.
2. Upload the Macro ``RECEPTION_MACRO`` on your device either through the web interface or via Control Hub.

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

## Zapier Account Setup
This macro sends the check in notification via email using a Zapier. You will need a Zapier account and a simple Zap connecting a webhook to an email service.
1. Create and new Zap with a webhook and add an email step to it. Take note of the wekhook URL.
![image](https://user-images.githubusercontent.com/21026209/146974688-1a006def-e226-462b-b0e5-faaa68a64cf7.png)
2. On the email step, format the email you with ``To`` , ``Name``  and ``Message``
![image](https://user-images.githubusercontent.com/21026209/146975375-297dbc30-98d4-45bb-a742-b35052384d3a.png)


## Example of the email notification
![image](https://user-images.githubusercontent.com/21026209/146975955-e7407894-b279-44e8-b4fc-6a4b14d5fab8.png)
