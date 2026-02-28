; SITEY-VM Demo - NSIS Installer Script
; Build: makensis installer.nsi

!include "MUI2.nsh"
!include "nsDialogs.nsh"
!include "LogicLib.nsh"
!include "FileFunc.nsh"

!define APP_NAME "SITEY-VM"
!define APP_NAME_ASCII "SiteyVM"
!define APP_VERSION "1.4.0"
!define APP_PUBLISHER "SITEY Bilisim"
!define APP_URL "https://www.siteyvm.com"
!define APP_EXE "SiteyVM.exe"
!define APP_PORT "5000"

Name "${APP_NAME} Demo"
OutFile "SiteyVM_Demo_Setup_v${APP_VERSION}.exe"
InstallDir "$PROGRAMFILES\${APP_NAME_ASCII}"
InstallDirRegKey HKLM "Software\${APP_NAME_ASCII}" "InstallDir"
RequestExecutionLevel admin
SetCompressor /SOLID lzma
BrandingText "${APP_NAME} Demo v${APP_VERSION} - ${APP_PUBLISHER}"

!define MUI_ABORTWARNING
!define MUI_ICON "siteyvm.ico"
!define MUI_UNICON "siteyvm.ico"

!define MUI_WELCOMEPAGE_TITLE "SITEY-VM Zafiyet Yonetim Platformu"
!define MUI_WELCOMEPAGE_TEXT "Bu sihirbaz SITEY-VM Demo surumunu bilgisayariniza kuracaktir.$\r$\n$\r$\nOzellikler:$\r$\n- Zafiyet tarama ve yonetimi$\r$\n- Web tabanli arayuz$\r$\n- Yerel agdan erisim$\r$\n- Otomatik IP algilama$\r$\n- Windows servisi destegi$\r$\n$\r$\nDevam etmek icin Ileri'ye tiklayin."

!define MUI_FINISHPAGE_RUN "$INSTDIR\${APP_EXE}"
!define MUI_FINISHPAGE_RUN_TEXT "${APP_NAME}'i simdi baslat"
!define MUI_FINISHPAGE_SHOWREADME "$INSTDIR\KULLANIM.txt"
!define MUI_FINISHPAGE_SHOWREADME_TEXT "Kullanim kilavuzunu goster"
!define MUI_FINISHPAGE_LINK "${APP_PUBLISHER} Web Sitesi"
!define MUI_FINISHPAGE_LINK_LOCATION "${APP_URL}"

!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_LICENSE "LICENSE.txt"
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH

!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES

!insertmacro MUI_LANGUAGE "Turkish"

Section "Ana Dosyalar" SecMain
    SectionIn RO

    SetOutPath "$INSTDIR"

    nsExec::ExecToLog '"$INSTDIR\${APP_EXE}" stop'
    nsExec::ExecToLog 'taskkill /F /IM ${APP_EXE}'
    Sleep 2000

    File /r "dist\SiteyVM\*.*"

    File "KULLANIM.txt"
    File "LICENSE.txt"

    WriteRegStr HKLM "Software\${APP_NAME_ASCII}" "InstallDir" "$INSTDIR"
    WriteRegStr HKLM "Software\${APP_NAME_ASCII}" "Version" "${APP_VERSION}"
    WriteRegStr HKLM "Software\${APP_NAME_ASCII}" "Port" "${APP_PORT}"

    WriteUninstaller "$INSTDIR\Uninstall.exe"

    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_NAME_ASCII}" \
        "DisplayName" "${APP_NAME} Demo"
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_NAME_ASCII}" \
        "UninstallString" '"$INSTDIR\Uninstall.exe"'
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_NAME_ASCII}" \
        "DisplayIcon" "$INSTDIR\${APP_EXE}"
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_NAME_ASCII}" \
        "Publisher" "${APP_PUBLISHER}"
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_NAME_ASCII}" \
        "DisplayVersion" "${APP_VERSION}"
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_NAME_ASCII}" \
        "URLInfoAbout" "${APP_URL}"

    ${GetSize} "$INSTDIR" "/S=0K" $0 $1 $2
    IntFmt $0 "0x%08X" $0
    WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_NAME_ASCII}" \
        "EstimatedSize" "$0"
SectionEnd

Section "Baslat Menusu Kisayollari" SecShortcuts
    CreateDirectory "$SMPROGRAMS\${APP_NAME}"
    CreateShortCut "$SMPROGRAMS\${APP_NAME}\${APP_NAME}.lnk" "$INSTDIR\${APP_EXE}" "" "$INSTDIR\${APP_EXE}"
    CreateShortCut "$SMPROGRAMS\${APP_NAME}\Kaldir.lnk" "$INSTDIR\Uninstall.exe"
    CreateShortCut "$DESKTOP\${APP_NAME}.lnk" "$INSTDIR\${APP_EXE}" "" "$INSTDIR\${APP_EXE}"
SectionEnd

Section "Windows Baslangicindan Calistir" SecAutoStart
    WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Run" \
        "${APP_NAME_ASCII}" '"$INSTDIR\${APP_EXE}" --background'
SectionEnd

Section "Guvenlik Duvari Kurali" SecFirewall
    nsExec::ExecToLog 'netsh advfirewall firewall delete rule name="${APP_NAME} Server"'
    nsExec::ExecToLog 'netsh advfirewall firewall add rule name="${APP_NAME} Server" dir=in action=allow protocol=TCP localport=${APP_PORT}'
    nsExec::ExecToLog 'netsh advfirewall firewall add rule name="${APP_NAME} Server" dir=out action=allow protocol=TCP localport=${APP_PORT}'
SectionEnd

Section "Uninstall"
    nsExec::ExecToLog '"$INSTDIR\${APP_EXE}" stop'
    nsExec::ExecToLog '"$INSTDIR\${APP_EXE}" remove'
    nsExec::ExecToLog 'taskkill /F /IM ${APP_EXE}'
    Sleep 2000

    nsExec::ExecToLog 'netsh advfirewall firewall delete rule name="${APP_NAME} Server"'

    DeleteRegValue HKCU "Software\Microsoft\Windows\CurrentVersion\Run" "${APP_NAME_ASCII}"

    RMDir /r "$SMPROGRAMS\${APP_NAME}"
    Delete "$DESKTOP\${APP_NAME}.lnk"

    RMDir /r "$INSTDIR"

    DeleteRegKey HKLM "Software\${APP_NAME_ASCII}"
    DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_NAME_ASCII}"
SectionEnd

!insertmacro MUI_FUNCTION_DESCRIPTION_BEGIN
    !insertmacro MUI_DESCRIPTION_TEXT ${SecMain} "Temel uygulama dosyalari (zorunlu)"
    !insertmacro MUI_DESCRIPTION_TEXT ${SecShortcuts} "Baslat menusu ve masaustu kisayollari"
    !insertmacro MUI_DESCRIPTION_TEXT ${SecAutoStart} "Windows basladiginda uygulamayi otomatik calistir"
    !insertmacro MUI_DESCRIPTION_TEXT ${SecFirewall} "Yerel agdan erisim icin guvenlik duvari kurali ekle"
!insertmacro MUI_FUNCTION_DESCRIPTION_END
