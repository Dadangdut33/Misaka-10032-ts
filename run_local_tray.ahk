#NoTrayIcon
#Persistent

global hBatFile

/* Setup Tray icon and add item that will handle
* double click events
*/
Menu Tray, Icon
Menu Tray, Icon, C:\windows\system32\cmd.exe
Menu Tray, Add, Show / Hide MisakaBot, TrayClick
Menu Tray, Add, Close MisakaBot, CloseItem
Menu Tray, Default, Show / Hide MisakaBot

;// Run program or batch file hidden
DetectHiddenWindows On
Run run_local.bat,, Hide, PID
WinWait ahk_pid %PID%
hBatFile := WinExist()
DetectHiddenWindows Off
return

TrayClick:
OnTrayClick()
return

;// Show / hide program or batch file on double click
OnTrayClick() {
    if DllCall("IsWindowVisible", "Ptr", hBatFile) {
        WinHide ahk_id %hBatFile%

    } else {
        WinShow ahk_id %hBatFile%
        WinActivate ahk_id %hBatFile%
    }
}

CloseItem() {

       DetectHiddenWindows On
       WinWait ahk_class ConsoleWindowClass
       Process, Close, cmd.exe
       DetectHiddenWindows Off
       ExitApp

}