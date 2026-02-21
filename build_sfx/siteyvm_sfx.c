/*
 * SITEY-VM Self-Extracting Installer
 * Basit SFX: payload ZIP cikart -> Program Files\SiteyVM -> SiteyVM.bat calistir
 *
 * Payload, EXE sonuna eklenmis ZIP dosyasidir.
 * Payload offset, EXE'nin en son 8 byte'inda DWORD olarak saklanir.
 * Yapi: [stub.exe] [zip data] [4-byte zip_size] [4-byte magic 0x564D5346]
 */
#include <windows.h>
#include <commctrl.h>
#include <shlobj.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define INSTALL_DIR_NAME "SiteyVM"
#define MAGIC_FOOTER     0x564D5346
#define IDC_PROGRESS     101
#define IDC_STATUS       102

static DWORD r16(const unsigned char *p) { return p[0]|(p[1]<<8); }
static DWORD r32(const unsigned char *p) { return p[0]|(p[1]<<8)|(p[2]<<16)|((DWORD)p[3]<<24); }

static BOOL read_footer(const char *exe, DWORD *zip_offset, DWORD *zip_size) {
    HANDLE h = CreateFileA(exe, GENERIC_READ, FILE_SHARE_READ, NULL, OPEN_EXISTING, 0, NULL);
    if (h == INVALID_HANDLE_VALUE) return FALSE;
    DWORD fsz = GetFileSize(h, NULL);
    if (fsz < 16) { CloseHandle(h); return FALSE; }

    unsigned char tail[8];
    SetFilePointer(h, fsz - 8, NULL, FILE_BEGIN);
    DWORD rd;
    ReadFile(h, tail, 8, &rd, NULL);
    CloseHandle(h);

    DWORD zs = r32(tail);
    DWORD mg = r32(tail + 4);
    if (mg != MAGIC_FOOTER) return FALSE;
    if (zs == 0 || zs > fsz - 8) return FALSE;

    *zip_size = zs;
    *zip_offset = fsz - 8 - zs;
    return TRUE;
}

static void mkdirs(const char *path) {
    char t[MAX_PATH];
    lstrcpynA(t, path, MAX_PATH);
    for (char *p = t + 3; *p; p++) {
        if (*p == '\\') { *p = 0; CreateDirectoryA(t, NULL); *p = '\\'; }
    }
    CreateDirectoryA(t, NULL);
}

static void mkparent(const char *fp) {
    char t[MAX_PATH];
    lstrcpynA(t, fp, MAX_PATH);
    char *s = strrchr(t, '\\');
    if (s) { *s = 0; mkdirs(t); }
}

static int zip_count(const unsigned char *z, DWORD zs) {
    DWORD p = 0; int n = 0;
    while (p + 30 <= zs) {
        if (r32(z+p) != 0x04034b50) break;
        WORD fl = r16(z+p+6);
        DWORD cs = r32(z+p+18);
        WORD nl = r16(z+p+26), el = r16(z+p+28);
        n++;
        p += 30 + nl + el + cs;
        if (fl & 8) {
            if (p+4 <= zs && r32(z+p)==0x08074b50) p += 16; else p += 12;
        }
    }
    return n;
}

static BOOL zip_extract(const unsigned char *z, DWORD zs,
                        const char *dest, HWND hProg, int total) {
    DWORD p = 0; int done = 0;
    while (p + 30 <= zs) {
        if (r32(z+p) != 0x04034b50) break;
        WORD fl = r16(z+p+6), mt = r16(z+p+8);
        DWORD cs = r32(z+p+18), us = r32(z+p+22);
        WORD nl = r16(z+p+26), el = r16(z+p+28);

        char nm[MAX_PATH]={0};
        DWORD cl = nl < MAX_PATH-1 ? nl : MAX_PATH-1;
        memcpy(nm, z+p+30, cl);
        for (int i=0; nm[i]; i++) if(nm[i]=='/') nm[i]='\\';

        DWORD doff = p + 30 + nl + el;

        if (fl & 8) {
            DWORD dp = doff + cs;
            if (dp+4 <= zs && r32(z+dp)==0x08074b50) {
                cs = r32(z+dp+4); us = r32(z+dp+8);
            }
        }

        char fp[MAX_PATH];
        wsprintfA(fp, "%s\\%s", dest, nm);
        int ne = lstrlenA(nm);

        if (ne > 0 && nm[ne-1] == '\\') {
            mkdirs(fp);
        } else if (mt == 0 && doff + us <= zs) {
            mkparent(fp);
            HANDLE ho = CreateFileA(fp, GENERIC_WRITE, 0, NULL,
                                    CREATE_ALWAYS, FILE_ATTRIBUTE_NORMAL, NULL);
            if (ho != INVALID_HANDLE_VALUE) {
                if (us > 0) { DWORD w; WriteFile(ho, z+doff, us, &w, NULL); }
                CloseHandle(ho);
            }
        }
        done++;
        if (hProg && total > 0)
            SendMessage(hProg, PBM_SETPOS, (done*95)/total, 0);

        p = doff + cs;
        if (fl & 8) {
            if (p+4 <= zs && r32(z+p)==0x08074b50) p += 16; else p += 12;
        }
    }
    return done > 0;
}

static BOOL make_shortcut(const char *target, const char *lnk,
                          const char *wd, const char *ico) {
    CoInitialize(NULL);
    IShellLinkA *sl = NULL;
    HRESULT hr = CoCreateInstance(&CLSID_ShellLink, NULL, CLSCTX_INPROC_SERVER,
                                  &IID_IShellLinkA, (void**)&sl);
    if (SUCCEEDED(hr) && sl) {
        sl->lpVtbl->SetPath(sl, target);
        sl->lpVtbl->SetWorkingDirectory(sl, wd);
        if (ico && ico[0]) sl->lpVtbl->SetIconLocation(sl, ico, 0);
        IPersistFile *pf = NULL;
        sl->lpVtbl->QueryInterface(sl, &IID_IPersistFile, (void**)&pf);
        if (pf) {
            WCHAR wl[MAX_PATH];
            MultiByteToWideChar(CP_ACP, 0, lnk, -1, wl, MAX_PATH);
            pf->lpVtbl->Save(pf, wl, TRUE);
            pf->lpVtbl->Release(pf);
        }
        sl->lpVtbl->Release(sl);
    }
    CoUninitialize();
    return SUCCEEDED(hr);
}

typedef struct {
    HWND hDlg, hProg, hStat;
    char exe[MAX_PATH], dir[MAX_PATH];
    BOOL ok;
} CTX;
static CTX g;

static DWORD WINAPI worker(LPVOID param) {
    CTX *c = (CTX*)param;

    SetWindowTextA(c->hStat, "Payload okunuyor...");
    DWORD zoff, zsz;
    if (!read_footer(c->exe, &zoff, &zsz)) {
        SetWindowTextA(c->hStat, "HATA: Payload bulunamadi!");
        c->ok = FALSE;
        PostMessage(c->hDlg, WM_APP+1, 0, 0);
        return 1;
    }

    HANDLE hf = CreateFileA(c->exe, GENERIC_READ, FILE_SHARE_READ,
                            NULL, OPEN_EXISTING, 0, NULL);
    if (hf == INVALID_HANDLE_VALUE) {
        SetWindowTextA(c->hStat, "HATA: Dosya acilamadi!");
        c->ok = FALSE;
        PostMessage(c->hDlg, WM_APP+1, 0, 0);
        return 1;
    }

    unsigned char *zd = (unsigned char*)malloc(zsz);
    if (!zd) {
        CloseHandle(hf);
        SetWindowTextA(c->hStat, "HATA: Bellek yetersiz!");
        c->ok = FALSE;
        PostMessage(c->hDlg, WM_APP+1, 0, 0);
        return 1;
    }

    SetFilePointer(hf, zoff, NULL, FILE_BEGIN);
    DWORD rd; ReadFile(hf, zd, zsz, &rd, NULL);
    CloseHandle(hf);

    if (r32(zd) != 0x04034b50) {
        free(zd);
        SetWindowTextA(c->hStat, "HATA: Gecersiz ZIP verisi!");
        c->ok = FALSE;
        PostMessage(c->hDlg, WM_APP+1, 0, 0);
        return 1;
    }

    SetWindowTextA(c->hStat, "Dosyalar cikariliyor...");
    mkdirs(c->dir);
    int tot = zip_count(zd, zsz);
    SendMessage(c->hProg, PBM_SETRANGE, 0, MAKELPARAM(0,100));
    SendMessage(c->hProg, PBM_SETPOS, 0, 0);

    BOOL ok = zip_extract(zd, zsz, c->dir, c->hProg, tot);
    free(zd);

    if (!ok) {
        SetWindowTextA(c->hStat, "HATA: Cikarma basarisiz!");
        c->ok = FALSE;
        PostMessage(c->hDlg, WM_APP+1, 0, 0);
        return 1;
    }

    SendMessage(c->hProg, PBM_SETPOS, 97, 0);
    SetWindowTextA(c->hStat, "Kisayol olusturuluyor...");
    char dk[MAX_PATH];
    if (SHGetFolderPathA(NULL, CSIDL_COMMON_DESKTOPDIRECTORY, NULL, 0, dk)==S_OK) {
        char l[MAX_PATH], b[MAX_PATH], ic[MAX_PATH];
        wsprintfA(l, "%s\\SiteyVM.lnk", dk);
        wsprintfA(b, "%s\\SiteyVM.bat", c->dir);
        wsprintfA(ic, "%s\\icon.ico", c->dir);
        make_shortcut(b, l, c->dir, ic);
    }

    SendMessage(c->hProg, PBM_SETPOS, 100, 0);
    SetWindowTextA(c->hStat, "Kurulum tamamlandi!");
    c->ok = TRUE;
    PostMessage(c->hDlg, WM_APP+1, 0, 0);
    return 0;
}

static INT_PTR CALLBACK DlgProc(HWND hDlg, UINT msg, WPARAM wP, LPARAM lP) {
    switch(msg) {
    case WM_INITDIALOG:
        SendMessage(hDlg, WM_SETICON, ICON_BIG,
                    (LPARAM)LoadIcon(GetModuleHandle(NULL), MAKEINTRESOURCE(1)));
        g.hDlg = hDlg;
        g.hProg = GetDlgItem(hDlg, IDC_PROGRESS);
        g.hStat = GetDlgItem(hDlg, IDC_STATUS);
        g.ok = FALSE;
        { HANDLE t = CreateThread(NULL,0,worker,&g,0,NULL); if(t) CloseHandle(t); }
        return TRUE;
    case WM_APP+1:
        if (g.ok) {
            char m[512];
            wsprintfA(m,
                "SITEY-VM basariyla kuruldu!\n\n"
                "Konum: %s\n\n"
                "Masaustunde SiteyVM kisayolu olusturuldu.",
                g.dir);
            MessageBoxA(hDlg, m, "SITEY-VM", MB_ICONINFORMATION);
            char b[MAX_PATH];
            wsprintfA(b, "%s\\SiteyVM.bat", g.dir);
            ShellExecuteA(NULL, "open", b, NULL, g.dir, SW_SHOW);
            EndDialog(hDlg, 1);
        } else {
            MessageBoxA(hDlg,
                "Kurulum sirasinda hata olustu.\nTekrar deneyin.",
                "SITEY-VM Hata", MB_ICONERROR);
            EndDialog(hDlg, 0);
        }
        return TRUE;
    case WM_COMMAND:
        if (LOWORD(wP)==IDCANCEL) EndDialog(hDlg, 0);
        return TRUE;
    case WM_CLOSE:
        EndDialog(hDlg, 0);
        return TRUE;
    }
    return FALSE;
}

int WINAPI WinMain(HINSTANCE hI, HINSTANCE hP, LPSTR cmd, int sw) {
    (void)hP; (void)cmd; (void)sw;
    InitCommonControls();

    char pf[MAX_PATH];
    if (SHGetFolderPathA(NULL, CSIDL_PROGRAM_FILES, NULL, 0, pf)!=S_OK)
        lstrcpyA(pf, "C:\\Program Files");
    wsprintfA(g.dir, "%s\\%s", pf, INSTALL_DIR_NAME);
    GetModuleFileNameA(NULL, g.exe, MAX_PATH);

    BYTE buf[1024];
    memset(buf, 0, sizeof(buf));

    /* DLGTEMPLATE */
    BYTE *p = buf;
    *(DWORD*)p = WS_POPUP|WS_CAPTION|WS_SYSMENU|DS_CENTER; p+=4; /* style */
    *(DWORD*)p = 0; p+=4; /* exstyle */
    *(WORD*)p = 2; p+=2;  /* cdit */
    *(short*)p = 0; p+=2; /* x */
    *(short*)p = 0; p+=2; /* y */
    *(short*)p = 260; p+=2; /* cx */
    *(short*)p = 55; p+=2; /* cy */
    *(WORD*)p = 0; p+=2;  /* menu */
    *(WORD*)p = 0; p+=2;  /* class */
    /* title: "SITEY-VM Kurulum" */
    WCHAR *tw = (WCHAR*)p;
    wcscpy(tw, L"SITEY-VM Kurulum");
    p += (wcslen(tw)+1)*2;

    /* Item 1: Static text */
    while ((ULONG_PTR)p & 3) p++;
    *(DWORD*)p = WS_CHILD|WS_VISIBLE|SS_LEFT; p+=4;
    *(DWORD*)p = 0; p+=4;
    *(short*)p = 10; p+=2;  /* x */
    *(short*)p = 6; p+=2;   /* y */
    *(short*)p = 240; p+=2; /* cx */
    *(short*)p = 10; p+=2;  /* cy */
    *(WORD*)p = IDC_STATUS; p+=2;
    *(WORD*)p = 0xFFFF; p+=2;
    *(WORD*)p = 0x0082; p+=2; /* STATIC */
    WCHAR *st = (WCHAR*)p;
    wcscpy(st, L"Hazirlaniyor...");
    p += (wcslen(st)+1)*2;
    *(WORD*)p = 0; p+=2;

    /* Item 2: Progress bar */
    while ((ULONG_PTR)p & 3) p++;
    *(DWORD*)p = WS_CHILD|WS_VISIBLE; p+=4;
    *(DWORD*)p = 0; p+=4;
    *(short*)p = 10; p+=2;  /* x */
    *(short*)p = 22; p+=2;  /* y */
    *(short*)p = 240; p+=2; /* cx */
    *(short*)p = 14; p+=2;  /* cy */
    *(WORD*)p = IDC_PROGRESS; p+=2;
    WCHAR pc[] = L"msctls_progress32";
    memcpy(p, pc, sizeof(pc)); p += sizeof(pc);
    *(WORD*)p = 0; p+=2;
    *(WORD*)p = 0; p+=2;

    DialogBoxIndirectA(hI, (DLGTEMPLATE*)buf, NULL, DlgProc);
    return 0;
}