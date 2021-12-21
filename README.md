# RECEPTION-MACRO

This macro replaces interface on your Cisco Telepresence with a Reception Check-In system. One button will ask the guest to enter their name and notify the appropate staff via email. The send button will automatically dial a remote assistant.

![hdsupply](https://user-images.githubusercontent.com/21026209/146818562-1dfca0d4-74b1-4769-9a0e-3d6720c00fd6.png)
![name](https://user-images.githubusercontent.com/21026209/146828290-aa868bc3-e878-4990-9f92-523983d23ae4.png)
![sign_in](https://user-images.githubusercontent.com/21026209/146826597-b367a576-0b32-480e-947f-47dc9dabbc12.png)

## Requirements
1. A CE9.X or RoomOS Cisco Telepresence.
2. An Email services which can send Emails triggers by a webhook.

## Setup
1. Upload the Macro ``RECEPTION_MACRO`` on your device either through the web interface or via Control Hub.

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

