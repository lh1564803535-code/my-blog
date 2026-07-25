@chcp 65001 >nul
@echo off
set ADMIN_OPEN=1
echo 正在启动博客可视化后台（关闭本窗口即停止后台）...
node "%~dp0tools\admin-server.cjs"
pause
