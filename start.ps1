Start-Transcript -Path C:\printer\start.log -Append
Set-Location -Path C:\printer
node .\express.js
Stop-Transcript