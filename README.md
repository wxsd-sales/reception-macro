# RECEPTION-MACRO

This macro replaces the interface on your Cisco Telepresence with a Reception Check-In system. One button will ask the guest to enter their name and notify the appropate staff via email. The send button will automatically dial a remote assistant.

![touch10](https://user-images.githubusercontent.com/21026209/146968820-51a4dcaa-bb24-4761-a8e0-95386fa96e8a.png)
![checkin1](https://user-images.githubusercontent.com/21026209/146968830-1eb089f0-a0ab-49d1-be80-a742f0c4c137.png)
![EnterName](https://user-images.githubusercontent.com/21026209/146968839-c74da4de-c2d1-4b92-a758-96ba0f3e4cb8.png)
![hitsend](https://user-images.githubusercontent.com/21026209/146968848-69c6f26f-f141-4706-9287-970e8b1f1e7d.png)
![success1](https://user-images.githubusercontent.com/21026209/146968856-d31b4729-262d-4f33-8bed-27426521d6ba.png)


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
This macro sends the check in notification via email using a Zapier. You will need a Zapier account with a 
1. Create and new Zap with a webhook and add an email step to it. Take note of the wekhook URL.
![image](https://user-images.githubusercontent.com/21026209/146974688-1a006def-e226-462b-b0e5-faaa68a64cf7.png)
2. On the email step, format the email you with ``To`` , ``Name``  and ``Message``
![image](https://user-images.githubusercontent.com/21026209/146975375-297dbc30-98d4-45bb-a742-b35052384d3a.png)


## Example of the email notification
![image](https://user-images.githubusercontent.com/21026209/146975955-e7407894-b279-44e8-b4fc-6a4b14d5fab8.png)
