Unblock-File -Path C:\printer\start.ps1

$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-NoProfile -NoExit -WindowStyle Hidden -ExecutionPolicy Bypass -File C:\printer\start.ps1"

$trigger = (New-ScheduledTaskTrigger -AtStartup), (New-ScheduledTaskTrigger -AtLogon)

$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable

$task = New-ScheduledTask -Action $action -Trigger $trigger -Settings $settings

Register-ScheduledTask -TaskName "startThermalPrinter" -InputObject $task