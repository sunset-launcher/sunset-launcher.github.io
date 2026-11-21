(() => {
  "use strict";
  const REPO = "sunset-launcher/sunset-launcher";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(pointer: fine)").matches;
  const page = document.body.dataset.page || "home";

  /* =========================================================
     Shared layout (header / footer / decorative layers)
     ========================================================= */
  const GH_ICON = '<svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>';
  const PAGES = [
    ["home", "index.html", "nav.home", "Главная"],
    ["features", "features.html", "nav.features", "Возможности"],
    ["screenshots", "screenshots.html", "nav.screens", "Скриншоты"],
    ["download", "download.html", "nav.download", "Скачать"],
    ["changelog", "changelog.html", "nav.changelog", "Чейнджлог"],
    ["faq", "faq.html", "nav.faq", "FAQ"],
  ];

  document.body.insertAdjacentHTML("afterbegin", `
    <div class="bg-glow" aria-hidden="true"></div>
    <div class="bg-grid" aria-hidden="true"></div>
    <canvas id="particles" aria-hidden="true"></canvas>
    <div class="cursor-glow" aria-hidden="true"></div>
    <div class="progress" aria-hidden="true"></div>
    <div class="curtain" aria-hidden="true"></div>
    <div class="toast" id="toast" role="status" aria-live="polite"></div>
    <a class="skip-link" href="#main" data-i18n="a11y.skip">Перейти к содержимому</a>
    <button class="to-top" id="toTop" type="button" aria-label="Back to top"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg></button>
    <div class="palette" id="palette" aria-hidden="true">
      <div class="palette-box" role="dialog" aria-modal="true" aria-label="Command palette">
        <div class="palette-input">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>
          <input id="paletteInput" type="text" autocomplete="off" spellcheck="false" data-i18n-ph="pal.ph" placeholder="Куда перейти?" />
          <kbd>Esc</kbd>
        </div>
        <ul class="palette-list" id="paletteList" role="listbox"></ul>
        <div class="palette-foot"><span><kbd>↑</kbd><kbd>↓</kbd> <span data-i18n="pal.nav">выбор</span></span><span><kbd>Enter</kbd> <span data-i18n="pal.open">открыть</span></span></div>
      </div>
    </div>`);
  $(".page")?.setAttribute("id", "main");

  $("#app-header").outerHTML = `
    <header class="nav" id="nav">
      <div class="container nav-inner">
        <a href="index.html" class="brand">
          <img src="assets/logo.png" alt="" width="34" height="34" />
          <span>Sunset Launcher</span>
        </a>
        <nav class="nav-links" id="navLinks">
          <span class="nav-hover"></span><span class="nav-ind"></span>
          ${PAGES.map(([id, href, key, ru]) => `<a href="${href}" class="${id === page ? "active" : ""}" data-i18n="${key}">${ru}</a>`).join("")}
          <div class="nav-mobile-actions">
            <button class="btn btn-ghost btn-sm" id="paletteBtnMobile" type="button">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>
              <span data-i18n="nav.search">Поиск</span>
            </button>
            <a class="btn btn-ghost btn-sm" href="https://github.com/${REPO}" target="_blank" rel="noopener">${GH_ICON}<span>GitHub</span><em class="gh-stars" hidden></em></a>
          </div>
        </nav>
        <div class="nav-actions">
          <button class="kbd-btn" id="paletteBtn" type="button" aria-label="Search (Ctrl+K)"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg><kbd>Ctrl K</kbd></button>
          <button class="lang-btn" id="langBtn" type="button" aria-label="Switch language">EN</button>
          <a class="btn btn-ghost btn-sm gh" href="https://github.com/${REPO}" target="_blank" rel="noopener">${GH_ICON}<span>GitHub</span><em class="gh-stars" id="ghStars" hidden></em></a>
          <button class="burger" id="burger" type="button" aria-label="Menu" aria-expanded="false" aria-controls="navLinks"><span></span><span></span><span></span></button>
        </div>
      </div>
    </header>
    <div class="nav-backdrop" id="navBackdrop" aria-hidden="true"></div>`;

  $("#app-footer").outerHTML = `
    <footer class="footer">
      <div class="container">
        <div class="footer-grid">
          <div class="footer-col">
            <a href="index.html" class="brand"><img src="assets/logo.png" alt="" width="30" height="30" /><span>Sunset Launcher</span></a>
            <p class="muted" data-i18n="ft.desc">Быстрый нативный лаунчер Minecraft на чистом Rust. Без телеметрии, с открытым кодом.</p>
          </div>
          <div class="footer-col">
            <h4 data-i18n="ft.pages">Страницы</h4>
            ${PAGES.map(([, href, key, ru]) => `<a href="${href}" data-i18n="${key}">${ru}</a>`).join("")}
          </div>
          <div class="footer-col">
            <h4 data-i18n="ft.links">Ссылки</h4>
            <a href="https://github.com/${REPO}" target="_blank" rel="noopener">GitHub</a>
            <a href="https://github.com/${REPO}/releases" target="_blank" rel="noopener" data-i18n="ft.releases">Релизы</a>
            <a href="https://github.com/${REPO}/issues" target="_blank" rel="noopener" data-i18n="ft.issues">Сообщить о баге</a>
            <a href="https://modrinth.com" target="_blank" rel="noopener">Modrinth</a>
          </div>
        </div>
        <div class="footer-bottom">
          <span><span data-i18n="ft.by">Сделано</span> <a href="https://github.com/sunset-launcher" target="_blank" rel="noopener">svarka</a> &amp; Antigravity · MIT License</span>
          <span data-i18n="ft.legal">Не является официальным продуктом Minecraft. Не связано с Mojang или Microsoft.</span>
        </div>
      </div>
    </footer>`;

  /* =========================================================
     i18n — Russian lives in the HTML, English here
     ========================================================= */
  const EN = {
    "title.home": "Sunset Launcher — Fast Native Minecraft Launcher in Rust",
    "title.features": "Features — Sunset Launcher",
    "title.screenshots": "Screenshots — Sunset Launcher",
    "title.download": "Download — Sunset Launcher",
    "title.changelog": "Changelog — Sunset Launcher",
    "title.faq": "FAQ — Sunset Launcher",
    "title.404": "404 — Sunset Launcher",
    "nav.home": "Home", "nav.features": "Features", "nav.screens": "Screenshots", "nav.download": "Download", "nav.changelog": "Changelog", "nav.faq": "FAQ", "nav.search": "Search",
    "a11y.skip": "Skip to content", "pal.ph": "Where to go?", "pal.nav": "select", "pal.open": "open", "pal.empty": "Nothing found",
    "pal.pages": "Pages", "pal.actions": "Actions", "pal.cl": "Changelog",
    "pal.cl019": "v0.1.9 — CurseForge, OS installers & launch hooks",
    "pal.cl018": "v0.1.8 — Dedicated Servers & bore tunnel (CGNAT)",
    "pal.dlWin": "Download for Windows (.exe)",
    "pal.dlLinuxDeb": "Download for Linux (.deb package)",
    "pal.dlLinuxBin": "Download for Linux (binary)",
    "pal.dlMacArm": "Download for macOS (.app Apple Silicon)",
    "pal.dlMacIntel": "Download for macOS (.app Intel x64)",
    "pal.gh": "Open GitHub repository", "pal.issue": "Report a bug", "pal.lang": "Switch language to Russian", "pal.top": "Scroll to top",
    "stats.downloads": "downloads", "stats.stars": "GitHub stars",
    "how.eyebrow": "Getting started", "how.title": "From download to playing — 3 steps",
    "how.s1t": "Download", "how.s1d": "Pick the format you prefer: .exe for Windows, .deb or binary for Linux, or .app for macOS.",
    "how.s2t": "Create an instance", "how.s2d": "Pick a version and a loader, or install a Modrinth modpack in one click.",
    "how.s3t": "Play", "how.s3d": "Sign in with Microsoft, Ely.by or offline — and hit Play.",
    "nf.lead": "This chunk hasn't been generated yet. Looks like the page got lost somewhere in the Nether.", "nf.home": "Back home",
    "hero.pill": "New release", "hero.title1": "The Minecraft launcher", "hero.title2": "that just flies",
    "hero.lead": "A native launcher written in pure Rust. Mods and modpacks from Modrinth, Microsoft, Ely.by and offline accounts — no Electron, no telemetry, no bloat.",
    "hero.download": "Download for free", "hero.more": "Features", "hero.meta3": "Zero telemetry",
    "hero.fc1": "parallel downloads", "hero.fc2": "mods · shaders · packs",
    "stats.loaders": "mod loaders", "stats.dl": "download threads", "stats.lang": "UI languages", "stats.rust": "pure Rust",
    "feat.eyebrow": "Features", "feat.title": "Everything you need to play — in one window",
    "feat.sub": "From vanilla survival to a 300-mod pack. Sunset handles all the busywork.", "feat.all": "All features",
    "f1.t": "Instances & profiles", "f1.d": "Create, duplicate and edit instances. Each one lives in its own isolated folder.",
    "f1.long": "Create, duplicate, edit and delete instances. Each one lives in its own instances/<name> folder — mods, configs and worlds of different versions never get mixed up. Switch instances right from the sidebar.",
    "f1.c1": "Isolated game folders", "f1.c2": "One-click duplicate", "f1.c3": "Quick Switch & favorites",
    "f2.t": "Modrinth & .mrpack", "f2.d": "Mods, modpacks, resource packs and shaders. Import and export .mrpack.",
    "f2.long": "A built-in Modrinth catalog: search and install mods, modpacks, resource packs and shaders without leaving the launcher. Dependencies and version compatibility are resolved automatically.",
    "f2.c1": ".mrpack import & export", "f2.c2": "Shaders & resource packs", "f2.c3": "Filter by version and loader",
    "f3.t": "Lightning-fast downloads", "f3.d": "Up to 64 concurrent transfers with streaming SHA-1 verification.",
    "f3b.t": "Content management", "f3b.long": "Enable and disable individual mods without deleting them. See what is installed, which version and where it came from.",
    "f3b.c1": "Toggle files on/off", "f3b.c2": "64 parallel downloads", "f3b.c3": "On-the-fly SHA-1 checks",
    "f4.t": "Accounts & skins", "f4.d": "Microsoft, Ely.by and offline accounts with skin previews.",
    "f4.long": "Microsoft sign-in via Device Code, Ely.by accounts via authlib-injector, and offline profiles. Head and body previews are cached locally.",
    "f5.t": "Worlds & backups", "f5.d": "Quick Play straight into a world and one-click .zip backups.",
    "f6.t": "Java & JVM", "f6.d": "RAM, custom JVM args, G1GC, ZGC and Aikar's presets. Automatic Java discovery.",
    "f7.t": "Live console", "f7.d": "Real-time game log and crash detection.",
    "f7.long": "Game stdout and stderr in real time with filters. If the game crashes you get a banner with the cause, and the crash report is copied with one button.",
    "f7.c1": "Log filters", "f7.c2": "Crash detection", "f7.c3": "Copy crash report",
    "f8.t": "Themes, languages & Discord", "f8.long": "9 UI languages, customizable themes and fonts, a Ctrl+K command palette and Discord Rich Presence in your language.", "f8.c3": "9 languages",
    "f9.t": "Auto-updates", "f9.d": "Checks and installs updates from GitHub Releases.",
    "f10.t": "Privacy", "f10.d": "Zero telemetry. Tokens are stored only on your disk.",
    "f11.t": "OS integration", "f11.d": ".desktop entry on Linux and Start Menu shortcut on Windows, single-instance lock.",
    "f12.t": "Pure Rust", "f12.d": "A single native binary on eframe/egui. Instant startup and low memory use.",
    "fp.title1": "Power that", "fp.title2": "never lags", "fp.lead": "Everything Sunset Launcher can do — from installing a modpack to restoring a world from backup.",
    "fp.langsEyebrow": "Localization",
    "fp.langs": "Interface languages", "fp.langsDesc": "Translated UI, command palette and language-aware Discord Rich Presence.",
    "fp.more": "And more", "fp.moreTitle": "Little things that matter",
    "fp.ctaTitle": "Ready to try it?",
    "ld.eyebrow": "Loaders", "ld.title": "Any loader — in a couple of clicks",
    "ld.sub": "Official Mojang, Fabric/Quilt Meta and Forge/NeoForge Maven APIs, including installer processors.",
    "ld.v": "Pure Minecraft", "ld.f": "Light and fast", "ld.q": "Fabric fork", "ld.fo": "Modding classic", "ld.n": "Next generation",
    "cmp.eyebrow": "Why Sunset", "cmp.title": "Native vs Electron", "cmp.others": "Typical launcher",
    "cmp.r1": "Technology", "cmp.r2": "Telemetry", "cmp.r3": "Single binary", "cmp.r4": "Ely.by out of the box", "cmp.r5": "Open source",
    "cmp.none": "None", "cmp.often": "Often", "cmp.varies": "Varies",
    "dl.title": "Ready to play?", "dl.sub": "Download Sunset Launcher for your system. It's free and always will be.",
    "dl.src": "Source code", "dl.ver": "Latest version:", "dl.all": "All releases", "dl.copy": "Copy", "dl.copied": "Copied!", "dl.for": "Download for",
    "dl.started": "Download started…",
    "cta.screens": "View screenshots",
    "sp.title1": "Take a look", "sp.title2": "inside", "sp.lead": "Click a screenshot to open it fullscreen. Use ← → to browse.",
    "scr.fAll": "All", "scr.fUi": "Interface", "scr.fMods": "Mods", "scr.fSys": "System",
    "scr.t1": "Library", "scr.t2": "Modrinth", "scr.t3": "Mods", "scr.t4": "Accounts", "scr.t5": "Settings", "scr.t6": "Console",
    "scr.d1": "All instances and quick launch", "scr.d2": "Mods and modpacks catalog", "scr.d3": "Instance content",
    "scr.d4": "Microsoft, Ely.by, Offline", "scr.d5": "Themes, Java, language", "scr.d6": "Live game log",
    "dp.title1": "Download", "dp.rec": "Recommended", "dp.get": "Download", "dp.install": "Install", "dp.howto": "How to install",
    "hero.meta2": "MIT · Open Source",
    "dl.chooseFmt": "Choose download format", "dl.debShort": ".deb package", "dl.rpmShort": ".rpm package", "dl.appImageShort": ".AppImage", "dl.dmgShort": ".dmg", "dl.anyLinux": "Any distro",
    "dl.winExeLabel": ".exe installer", "dl.winSetupLabel": "installer", "dl.macAppLabel": ".app bundle", "dl.binChip": "bin",
    "dl.tipZip": "Portable .zip archive for Windows",
    "dl.tipDebArm": ".deb package for Linux ARM64",
    "dl.tipBinArm": "Standalone binary for Linux ARM64",
    "dl.tipMacIntel": "macOS .app bundle for Intel (x64)",
    "dl.tipMacBin": "Standalone binary for macOS",
    "dl.allFormats": "All builds, SHA-256 & install guide",
    "dp.bit64": "64-bit", "dp.archLabel": "Architecture",
    "dp.macSub": "macOS 11+ · Apple Silicon & Intel",
    "dp.binLabel": "binary",
    "dp.winSetupSub": "Setup wizard (.exe)", "dp.winExeSub": "Standalone .exe", "dp.winZipSub": "Portable archive",
    "dp.debSub": "Ubuntu / Debian / Mint", "dp.rpmSub": "Fedora / RHEL / openSUSE", "dp.appImageSub": "Portable AppImage", "dp.binSub": "Any distro · glibc",
    "dp.macDmgSub": "macOS .dmg disk image", "dp.macAppSub": "macOS .app bundle", "dp.macBinSub": "Standalone binary",
    "dp.srcDesc": "Open-source sunset-launcher/sunset-launcher repo · Rust 2021 · MIT License",
    "dp.l1": "On Ubuntu / Debian / Mint install .deb, on Fedora / RHEL / openSUSE install .rpm, or use the portable AppImage or standalone binary.",
    "dp.l2": "Choose your preferred method in the terminal:",
    "dp.termDeb": "Ubuntu / Debian — install .deb package",
    "dp.termRpm": "Fedora / RHEL / openSUSE — install .rpm package",
    "dp.termAppImage": "Any distro — run AppImage",
    "dp.termBin": "Any distro — run standalone binary",
    "dp.l3": "Installing the .deb/.rpm or launching the binary for the first time adds Sunset to your application menu automatically.",
    "dp.verifyLinux": "Verify SHA-256 (optional)",
    "dp.w1": "Download the sunset-launcher-windows-x64-setup.exe installer (or the standalone .exe / portable .zip).", "dp.w2": "Run the setup wizard (or launch the standalone .exe directly — a Start Menu shortcut is created automatically).",
    "dp.w3": "If SmartScreen appears: \"More info\" → \"Run anyway\".", "dp.verify": "PowerShell — verify SHA-256",
    "dp.m1": "Download sunset-launcher-macos-arm64.dmg (Apple Silicon M1–M4) or sunset-launcher-macos-x64.dmg (Intel), or .app.zip.",
    "dp.m2": "Open the .dmg (or extract the .app.zip) and move Sunset Launcher.app to /Applications.",
    "dp.m3": "Clear Gatekeeper quarantine before first launch of the unsigned build:",
    "dp.s1": "Install Rust via rustup.", "dp.s2": "Clone the repository and build a release:",
    "dp.req": "System requirements", "dp.r1": "OS", "dp.r2": "Memory", "dp.r2v": "4 GB+ (8 GB for modpacks)",
    "dp.r3v": "Auto-detect / Adoptium", "dp.r4": "Internet", "dp.r4v": "For the first version download",
    "dp.changes": "What's new", "dp.loading": "Loading release notes from GitHub…", "dp.noNotes": "Couldn't load release notes. See them on GitHub.",
    "dp.history": "Previous releases", "dp.fullCl": "Full changelog",
    "dp.v019.h": "Sunset Launcher v0.1.9 — CurseForge, OS Installers & Launch Hooks",
    "dp.v019.b1": "CurseForge catalog integration alongside Modrinth: search, loader/version filtering and dependency installation.",
    "dp.v019.b2": "Expanded distribution formats: Windows Inno Setup wizard (-setup.exe), Linux .rpm & .AppImage (x64 & ARM64), and macOS .dmg disk images.",
    "dp.v019.b3": "Launch hooks (wrapper, pre-launch, post-exit), custom environment variables, instance log viewer and configurable .mrpack export.",
    "dp.v019.b4": "Offline Mode, global default instance settings and responsive UI layout fixes across narrow windows.",
    "dp.v018.h": "Sunset Launcher v0.1.8 — Dedicated Servers & bore Tunnel",
    "dp.v018.b1": "Dedicated Server manager right inside the launcher: Vanilla, Paper, Purpur, Folia, Fabric, Quilt, Forge, NeoForge and Arclight with a live console and Modrinth mods/plugins.",
    "dp.v018.b2": "Expose your server to the network behind a private / CGNAT IP using the built-in bore public TCP tunnel (bore.pub), plus automatic UPnP port forwarding.",
    "dp.v018.b3": "Account token protection via OS Keyring, SHA-256 updater verification and Mojang Log4j XML exploit mitigation.",
    "dp.v018.b4": "Legacy Minecraft support (Forge ≤ 1.12.2, pre-1.7.3 assets), Prism / CurseForge modpack import and batch mod updates.",
    "cp.title1": "Release", "cp.title2": "changelog",
    "cp.lead": "Every Sunset Launcher release, new feature and technical improvement — from the latest build back to day one.",
    "cp.search": "Search versions, bore, servers, features…",
    "cp.fAll": "All changes", "cp.fNew": "New", "cp.fNet": "Servers & Network", "cp.fImp": "Improvements & Security",
    "cp.latest": "Latest release",
    "cp.tagNew": "New", "cp.tagNet": "Network", "cp.tagSec": "Security", "cp.tagImp": "Improved", "cp.tagFix": "Fixed",
    "cp.d019": "November 21, 2026",
    "cp.v019.t": "CurseForge, Native OS Installers, Launch Hooks & Responsive UI",
    "cp.v019.spotBadge": "Release Highlight · CurseForge + Native Installers",
    "cp.v019.spotTitle": "CurseForge mod discovery and packages for every major platform",
    "cp.v019.spotP1": "The Discover tab now integrates CurseForge alongside Modrinth: search mods, resource packs, shaders and modpacks, filter by instance loader and Minecraft version, install dependencies automatically and see each file's source.",
    "cp.v019.spotP2": "Packaging now covers every major OS: added a Windows Setup wizard (-setup.exe via Inno Setup), Linux .rpm packages and portable .AppImage builds (x64 & ARM64), plus macOS .dmg disk images with an app icon.",
    "cp.v019.i1": "CurseForge catalog integration in Discover: project search, compatible file selection, dependency installation and source badges.",
    "cp.v019.i2": "New installers and package formats: Windows Setup wizard (Inno Setup), Linux .rpm & .AppImage (x64 & ARM64), and macOS .dmg with .icns icon.",
    "cp.v019.i3": "Launch hooks (wrapper command like gamemoderun/mangohud, pre-launch and post-exit commands), custom environment variables and an instance log viewer.",
    "cp.v019.i4": "Configurable .mrpack export dialog (configs, options, resource packs, shaders, worlds, exclusions), global default instance settings (RAM, Java, JVM, resolution) and Offline Mode.",
    "cp.v019.i5": "Responsive UI improvements for narrow windows and long localized labels: wrapping checkboxes, adaptive Instance Settings cards, Content toolbar/list and instance header.",
    "cp.d018": "November 20, 2026",
    "cp.v018.t": "Dedicated Minecraft Servers & bore Public Tunnel for Private / CGNAT IPs",
    "cp.v018.spotBadge": "Release Highlight · Dedicated Servers + bore",
    "cp.v018.spotTitle": "Host your own server in a couple of clicks — even behind carrier-grade NAT",
    "cp.v018.spotP1": "Sunset Launcher now features a built-in Dedicated Server manager. Create and run Vanilla, Paper, Purpur, Folia, Fabric, Quilt, Forge, NeoForge and Arclight servers with automatic Java provisioning, a live server console, server.properties editing, and direct mod or plugin installation from Modrinth.",
    "cp.v018.spotP2": "So friends can join without Hamachi or Radmin VPN, two network publishing modes are included: automatic UPnP port forwarding for public IPs, and TCP tunneling powered by the open-source bore client (bore.pub) specifically for private / gray IPs behind CGNAT. The launcher downloads bore automatically, exposes the port to the network and gives you a ready-to-copy public address.",
    "cp.v018.termHead": "Public tunnel for CGNAT / private IP — bore",
    "cp.v018.boreTag": "bore (CGNAT / private IP)",
    "cp.v018.i1": "Dedicated Server manager: creation, RAM/JVM tuning, live stdout/stderr log, stdin commands, graceful shutdown and automatic Java 8/16/17/21 selection.",
    "cp.v018.i2": "Built-in bore client (ekzhang/bore) to expose servers behind private / CGNAT IPs to the network via bore.pub, plus automatic UPnP port mapping with cleanup on exit.",
    "cp.v018.i3": "Install server mods and plugins straight from Modrinth matched to your server software (Paper, Purpur, Folia, Fabric, Forge, NeoForge, Arclight) and edit core server.properties options.",
    "cp.v018.i4": "Account tokens stored in the OS Keyring, atomic 0600 JSON writes, SHA-256 verification on self-update and Log4j XML exploit protection.",
    "cp.v018.i5": "Legacy Minecraft compatibility (Forge ≤ 1.12.2 installers, pre-1.7.3 virtual/mapped assets) and Prism Launcher / CurseForge modpack import.",
    "cp.v018.i6": "Batch hash-based mod updates, world datapack management, screenshot thumbnails, active download cancellation, modular UI architecture and Linux ARM64 (.deb) & macOS builds.",
    "cp.v018.i7": "Kept the single-instance Unix domain socket path within the OS sun_path length limit.",
    "cp.d017": "November 19, 2026",
    "cp.v017.t": "UI Optimization & List Virtualization",
    "cp.v017.i1": "Virtualized rendering in the live console and mods list for smooth FPS even with thousands of log lines and hundreds of installed mods.",
    "cp.v017.i2": "Auto-hiding idle bottom status bar and a clean author badge in the sidebar.",
    "cp.v017.i3": "Fixed layout clipping on compact window sizes.",
    "cp.d016": "November 18, 2026",
    "cp.v016.t": "Readable Instance Folders & Unified Data Directory",
    "cp.v016.i1": "Instances now live in human-readable instances/<name> folders instead of UUIDs so mods, screenshots and configs are easy to locate on disk.",
    "cp.v016.i2": "Unified the main data directory under sunset-launcher while keeping backward compatibility.",
    "cp.d015": "November 18, 2026",
    "cp.v015.t": "Sunset Launcher Rebrand & Default Sunset Theme",
    "cp.v015.i1": "Added the warm Sunset default color theme and updated the launcher icon.",
    "cp.v015.i2": "Rebranded to Sunset Launcher under the sunset-launcher GitHub organization with seamless auto-update support.",
    "cp.d014": "November 18, 2026",
    "cp.v014.t": "Windows Integration & Native File Dialogs",
    "cp.v014.i1": "Native OS file dialogs (.mrpack, custom icons, Java path) and embedded Windows PE metadata and icon.",
    "cp.d013": "November 15, 2026",
    "cp.v013.t": "9 Languages, Auto-Java Manager, Theme Presets & Discord RPC",
    "cp.v013.i1": "Full 9-language UI translation, Ctrl+K command palette, theme presets, automatic Adoptium Java downloads, .mrpack export and Discord Rich Presence.",
    "cp.d010": "November 13, 2026",
    "cp.v010.t": "Initial Public Release",
    "cp.v010.i1": "Native launcher written in pure Rust and egui: Vanilla, Fabric, Quilt, Forge and NeoForge support, Modrinth catalog, Microsoft / Ely.by / Offline accounts, and Windows & Linux builds.",
    "cp.empty": "No matching changes found 🤔",
    "cp.ctaTitle": "Update to the latest release",
    "cp.ctaSub": "Try the Dedicated Server manager and bore tunnel for private / CGNAT IPs right now.",
    "dp.faqTitle": "Questions about install or SmartScreen?", "dp.faqDesc": "Answers on security, Java, game folders and modpacks are in the FAQ.", "dp.faqBtn": "Open FAQ",
    "qp.title1": "Frequently asked", "qp.title2": "questions", "qp.search": "Search questions…", "qp.empty": "Nothing found 🤔",
    "qp.help": "Didn't find an answer?", "qp.helpd": "Open an issue on GitHub — we'll sort it out.", "qp.issue": "Open an issue",
    "q1": "Is it free?", "a1": "Yes. Sunset Launcher is MIT-licensed and the source code is open on GitHub.",
    "q2": "Do I need a Minecraft license?", "a2": "Microsoft sign-in requires an owned copy of the game. Ely.by accounts and offline mode are also supported.",
    "q3": "Windows says \"Unknown publisher\". Is it dangerous?", "a3": "Releases are not code-signed yet, so SmartScreen shows a warning. Click \"More info\" → \"Run anyway\". You can verify integrity with the .sha256 file or build from source.",
    "q4": "Do you collect my data?", "a4": "No. No telemetry or analytics. Tokens and accounts are stored locally only. Network requests go only to required services: Mojang, Modrinth, mod loaders, Adoptium, Microsoft / Ely.by and GitHub for updates.",
    "q5": "Where are game files stored?", "a5": "Linux: ~/.local/share/sunset-launcher. Windows: %LOCALAPPDATA%\\sunset-launcher. macOS: ~/Library/Application Support/sunset-launcher. Inside are profiles, accounts, versions, libraries, assets and isolated instance folders.",
    "q6": "Are macOS builds and a Linux .deb package available?", "a6": "Yes! Windows (.exe, .zip), Linux (.deb packages and binaries for x64 & ARM64) and macOS (.app bundles and binaries for Apple Silicon & Intel) are available on the Download page and in sunset-launcher/sunset-launcher releases.",
    "q7": "How do I install a modpack?", "a7": "Open the Discover tab, find a modpack on Modrinth and click Install — or import a .mrpack file. The launcher creates the instance and downloads everything.",
    "q8": "Do I need to install Java manually?", "a8": "No. The launcher finds installed Java automatically and can download a suitable Adoptium build into its own folder.",
    "q9": "The game crashes. What should I do?", "a9": "Open the Console tab — you'll see a crash banner and a button to copy the crash report. Increasing RAM or picking a JVM preset in instance settings often helps.",
    "q10": "How do I update the launcher?", "a10": "Sunset checks GitHub Releases itself and offers to install the new version right from the UI.",
    "ft.desc": "A fast native Minecraft launcher in pure Rust. No telemetry, open source.", "ft.pages": "Pages", "ft.links": "Links",
    "ft.releases": "Releases", "ft.issues": "Report a bug", "ft.by": "Made by",
    "ft.legal": "Not an official Minecraft product. Not associated with Mojang or Microsoft.",
  };
  const RU = {
    ["title." + page]: document.title,
    "dl.copied": "Скопировано!", "dl.for": "Скачать для", "dl.started": "Загрузка началась…", "nav.search": "Поиск",
    "dp.noNotes": "Не удалось загрузить заметки. Смотрите их на GitHub.", "dp.history": "Предыдущие релизы",
    "stats.dl": "потоков скачивания", "stats.rust": "чистый Rust",
    "pal.empty": "Ничего не найдено", "pal.pages": "Страницы", "pal.actions": "Действия", "pal.cl": "Чейнджлог",
    "pal.cl019": "v0.1.9 — CurseForge, установщики ОС и хуки запуска",
    "pal.cl018": "v0.1.8 — Выделенные серверы и туннель bore (серый IP)",
    "fp.langsEyebrow": "Локализация",
    "pal.dlWin": "Скачать для Windows (.exe)",
    "pal.dlLinuxDeb": "Скачать для Linux (.deb пакет)",
    "pal.dlLinuxBin": "Скачать для Linux (бинарник)",
    "pal.dlMacArm": "Скачать для macOS (.app Apple Silicon)",
    "pal.dlMacIntel": "Скачать для macOS (.app Intel x64)",
    "pal.gh": "Открыть репозиторий на GitHub",
    "pal.issue": "Сообщить о баге", "pal.lang": "Switch language to English", "pal.top": "Наверх",
    "scr.t1": "Библиотека", "scr.t2": "Modrinth", "scr.t3": "Моды", "scr.t4": "Аккаунты", "scr.t5": "Настройки", "scr.t6": "Консоль",
    "scr.d1": "Все сборки и быстрый запуск", "scr.d2": "Каталог модов и модпаков", "scr.d3": "Контент сборки",
    "scr.d4": "Microsoft, Ely.by, Offline", "scr.d5": "Темы, Java, язык", "scr.d6": "Живой лог игры",
    "hero.meta2": "MIT · Открытый код",
    "how.s1d": "Выберите удобный вариант: .exe для Windows, .deb или бинарник для Linux, либо сборку для macOS.",
    "dl.chooseFmt": "Выберите формат загрузки", "dl.debShort": ".deb пакет", "dl.rpmShort": ".rpm пакет", "dl.appImageShort": ".AppImage", "dl.dmgShort": ".dmg", "dl.anyLinux": "Любой дистрибутив",
    "dl.winExeLabel": ".exe файл", "dl.winSetupLabel": "установщик", "dl.macAppLabel": "приложение .app", "dl.binChip": "бин",
    "dl.tipZip": "Портативный архив .zip для Windows",
    "dl.tipDebArm": "Пакет .deb для Linux ARM64",
    "dl.tipBinArm": "Бинарник для Linux ARM64",
    "dl.tipMacIntel": "Сборка .app для macOS Intel (x64)",
    "dl.tipMacBin": "Отдельный бинарник для macOS",
    "dl.allFormats": "Все сборки, SHA-256 и инструкции",
    "dp.bit64": "64-бит", "dp.archLabel": "Архитектура",
    "dp.macSub": "macOS 11+ · Apple Silicon и Intel",
    "dp.binLabel": "бинарник",
    "dp.winSetupSub": "Мастер установки (.exe)", "dp.winExeSub": "Исполняемый файл .exe", "dp.winZipSub": "Портативный архив",
    "dp.debSub": "Ubuntu / Debian / Mint", "dp.rpmSub": "Fedora / RHEL / openSUSE", "dp.appImageSub": "Портативный AppImage", "dp.binSub": "Любой дистрибутив · glibc",
    "dp.macDmgSub": "Образ диска .dmg", "dp.macAppSub": "Пакет приложения .app", "dp.macBinSub": "Отдельный бинарник",
    "dp.srcDesc": "Открытый репозиторий sunset-launcher/sunset-launcher · Rust 2021 · MIT License",
    "dp.l1": "На Ubuntu / Debian / Mint установите .deb, на Fedora / RHEL / openSUSE — .rpm, либо используйте портативный AppImage или бинарник.",
    "dp.l2": "Выберите нужный вариант установки в терминале:",
    "dp.termDeb": "Ubuntu / Debian — установка .deb пакета",
    "dp.termRpm": "Fedora / RHEL / openSUSE — установка .rpm пакета",
    "dp.termAppImage": "Любой дистрибутив — запуск AppImage",
    "dp.termBin": "Любой дистрибутив — запуск бинарника",
    "dp.l3": "При установке .deb/.rpm или первом запуске бинарника лаунчер автоматически появится в меню приложений.",
    "dp.verifyLinux": "Проверка SHA-256 (по желанию)",
    "dp.w1": "Скачайте установщик sunset-launcher-windows-x64-setup.exe (либо автономный .exe / портативный .zip).",
    "dp.w2": "Пройдите мастер установки (или просто запустите .exe — ярлык в меню «Пуск» создастся автоматически).",
    "dp.m1": "Скачайте sunset-launcher-macos-arm64.dmg (Apple Silicon M1–M4) или sunset-launcher-macos-x64.dmg (Intel), либо .app.zip.",
    "dp.m2": "Откройте .dmg (или распакуйте .app.zip) и перенесите Sunset Launcher.app в папку /Applications.",
    "dp.m3": "Снимите карантин Gatekeeper перед первым запуском неподписанной сборки:",
    "q5": "Где хранятся файлы игры?",
    "a5": "Linux: ~/.local/share/sunset-launcher. Windows: %LOCALAPPDATA%\\sunset-launcher. macOS: ~/Library/Application Support/sunset-launcher. Внутри — профили, аккаунты, версии, библиотеки, ассеты и изолированные папки сборок.",
    "q6": "Есть ли версия для macOS и .deb пакет для Linux?",
    "a6": "Да! На странице загрузки и в релизах sunset-launcher/sunset-launcher доступны .exe и .zip для Windows, .deb пакеты и бинарники для Linux (x64 и ARM64), а также .app и бинарники для macOS (Apple Silicon и Intel).",
  };
  $$("[data-i18n]").forEach((el) => { if (!RU[el.dataset.i18n]) RU[el.dataset.i18n] = el.textContent.trim(); });
  $$("[data-i18n-ph]").forEach((el) => { if (!RU[el.dataset.i18nPh]) RU[el.dataset.i18nPh] = el.placeholder; });
  $$("[data-i18n-title]").forEach((el) => { if (!RU[el.dataset.i18nTitle]) RU[el.dataset.i18nTitle] = el.getAttribute("title") || ""; });
  $$("[data-i18n-aria]").forEach((el) => { if (!RU[el.dataset.i18nAria]) RU[el.dataset.i18nAria] = el.getAttribute("aria-label") || ""; });

  let lang = (() => {
    try {
      const saved = localStorage.getItem("lang");
      if (saved === "ru" || saved === "en") return saved;
    } catch { /* ignore */ }
    return /^(ru|uk|be|kk)/i.test(navigator.language || "ru") ? "ru" : "en";
  })();
  const t = (k) => (lang === "en" ? EN[k] : RU[k]) ?? RU[k] ?? EN[k] ?? k;

  let latestPublishedAt = null;
  function formatRelDate() {
    const dateEl = $("#relDate");
    if (!dateEl || !latestPublishedAt) return;
    dateEl.textContent = "· " + new Date(latestPublishedAt).toLocaleDateString(
      lang === "en" ? "en-US" : "ru-RU",
      { day: "numeric", month: "long", year: "numeric" },
    );
  }

  let refreshFaqAfterLang = () => {};
  let refreshClAfterLang = () => {};
  function applyLang() {
    document.documentElement.lang = lang;
    const titleKey = "title." + page;
    if (EN[titleKey] || RU[titleKey]) document.title = t(titleKey);
    $$("[data-i18n]").forEach((el) => (el.textContent = t(el.dataset.i18n)));
    $$("[data-i18n-ph]").forEach((el) => (el.placeholder = t(el.dataset.i18nPh)));
    $$("[data-i18n-title]").forEach((el) => el.setAttribute("title", t(el.dataset.i18nTitle)));
    $$("[data-i18n-aria]").forEach((el) => el.setAttribute("aria-label", t(el.dataset.i18nAria)));
    $("#langBtn").textContent = lang === "ru" ? "EN" : "RU";
    updateDownloadCTA();
    formatRelDate();
    refreshFaqAfterLang();
    refreshClAfterLang();
    requestAnimationFrame(() => { moveInd(); moveSeg(); });
  }
  $("#langBtn").addEventListener("click", () => {
    lang = lang === "ru" ? "en" : "ru";
    try { localStorage.setItem("lang", lang); } catch { /* ignore */ }
    if (!reduceMotion) document.body.animate([{ opacity: 1 }, { opacity: .4 }, { opacity: 1 }], { duration: 350 });
    applyLang();
  });

  /* =========================================================
     Nav: scroll state, sliding indicator, burger
     ========================================================= */
  const nav = $("#nav"), links = $("#navLinks"), ind = $(".nav-ind"), hov = $(".nav-hover"), progress = $(".progress"), navBackdrop = $("#navBackdrop");
  function place(el, target) {
    if (!target || !links.offsetWidth) { el.style.opacity = 0; return; }
    el.style.opacity = 1;
    el.style.width = target.offsetWidth + "px";
    el.style.transform = `translateX(${target.offsetLeft}px)`;
  }
  function moveInd() { place(ind, $("a.active", links)); }
  $$("a", links).forEach((a) => a.addEventListener("mouseenter", () => place(hov, a)));
  links.addEventListener("mouseleave", () => (hov.style.opacity = 0));
  addEventListener("resize", moveInd);
  if (typeof ResizeObserver !== "undefined") new ResizeObserver(moveInd).observe(links);
  document.fonts?.ready.then(moveInd);

  const burger = $("#burger");
  function setMenu(open) {
    links.classList.toggle("open", open);
    burger.classList.toggle("open", open);
    navBackdrop.classList.toggle("open", open);
    nav.classList.toggle("menu-open", open);
    burger.setAttribute("aria-expanded", String(open));
  }
  function closeMenu() { setMenu(false); }
  burger.addEventListener("click", (e) => {
    e.stopPropagation();
    setMenu(!links.classList.contains("open"));
  });
  $("#paletteBtnMobile")?.addEventListener("click", () => {
    closeMenu();
    openPalette();
  });
  navBackdrop.addEventListener("click", closeMenu);
  $$("a", links).forEach((a) => a.addEventListener("click", closeMenu));
  document.addEventListener("click", (e) => {
    if (links.classList.contains("open") && !e.target.closest("#navLinks, #burger")) closeMenu();
  });
  matchMedia("(min-width: 961px)").addEventListener("change", (e) => {
    if (e.matches) closeMenu();
  });

  function onScroll() {
    nav.classList.toggle("scrolled", scrollY > 10);
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
    const m = $(".mountains");
    if (m && !reduceMotion) m.style.transform = `translateY(${scrollY * 0.15}px)`;
  }
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* =========================================================
     Page transitions
     ========================================================= */
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (a.target === "_blank" || a.hasAttribute("download")) return;
    const href = a.getAttribute("href") || "";
    if (!/^[\w-]+\.html(#.*)?$/.test(href)) return;
    const dest = new URL(href, location.href);
    if (dest.pathname === location.pathname) { if (!dest.hash) { e.preventDefault(); scrollTo({ top: 0 }); } return; }
    e.preventDefault();
    closeMenu();
    if (reduceMotion) { location.href = dest.href; return; }
    document.body.classList.add("leaving");
    setTimeout(() => (location.href = dest.href), 320);
  });
  addEventListener("pageshow", (e) => {
    if (e.persisted) document.body.classList.remove("leaving");
    closeMenu();
  });

  /* =========================================================
     Reveal on scroll + counters
     ========================================================= */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("in");
      $$("[data-count]", e.target).forEach(countUp);
      io.unobserve(e.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  $$(".reveal").forEach((el) => {
    const sibs = [...el.parentElement.children].filter((c) => c.classList.contains("reveal"));
    el.style.transitionDelay = `${Math.min(sibs.indexOf(el), 6) * 80}ms`;
    io.observe(el);
  });
  function countUp(el) {
    const end = +el.dataset.count, suffix = el.dataset.suffix || "";
    if (reduceMotion) { el.textContent = end + suffix; return; }
    const dur = 1400, start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / dur, 1);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 4))) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /* =========================================================
     Pointer effects: cursor glow, spotlight cards, magnetic buttons, tilt
     ========================================================= */
  let glowRaf = null;
  const glow = $(".cursor-glow");
  let gx = -999, gy = -999, cx = -999, cy = -999;
  function stepGlow() {
    if (document.hidden) { glowRaf = null; return; }
    cx += (gx - cx) * 0.12; cy += (gy - cy) * 0.12;
    glow.style.left = cx + "px"; glow.style.top = cy + "px";
    glowRaf = requestAnimationFrame(stepGlow);
  }
  if (finePointer && !reduceMotion) {
    addEventListener("pointermove", (e) => {
      if (cx < -500) { cx = e.clientX; cy = e.clientY; }
      gx = e.clientX; gy = e.clientY;
    });
    glowRaf = requestAnimationFrame(stepGlow);

    $$(".feature, .os-card, .cl-card").forEach((f) => f.addEventListener("pointermove", (e) => {
      const r = f.getBoundingClientRect();
      f.style.setProperty("--mx", `${e.clientX - r.left}px`);
      f.style.setProperty("--my", `${e.clientY - r.top}px`);
    }));

    $$(".magnetic").forEach((b) => {
      b.addEventListener("pointermove", (e) => {
        const r = b.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2;
        b.style.transform = `translate(${x * 0.18}px, ${y * 0.3}px)`;
      });
      b.addEventListener("pointerleave", () => (b.style.transform = ""));
    });

    const win = $("#heroWindow"), hero = $(".hero");
    if (win && hero && matchMedia("(min-width: 1001px)").matches) {
      const shine = $(".window-shine", win);
      hero.addEventListener("pointermove", (e) => {
        const x = e.clientX / innerWidth - 0.5, y = e.clientY / innerHeight - 0.5;
        win.style.transform = `rotateY(${-10 + x * 12}deg) rotateX(${5 - y * 10}deg)`;
        const r = win.getBoundingClientRect();
        shine.style.setProperty("--sx", `${e.clientX - r.left}px`);
        shine.style.setProperty("--sy", `${e.clientY - r.top}px`);
      });
      hero.addEventListener("pointerleave", () => (win.style.transform = ""));
    }
  }

  /* =========================================================
     Typed loader names (home)
     ========================================================= */
  const typedEl = $("#typed");
  if (typedEl && !reduceMotion) {
    const words = ["Fabric", "Forge", "NeoForge", "Quilt", "Vanilla"];
    let wi = 0, ci = words[0].length, deleting = true;
    (function typeLoop() {
      const w = words[wi];
      typedEl.textContent = w.slice(0, ci);
      let delay = deleting ? 55 : 95;
      if (deleting) { if (--ci < 0) { deleting = false; wi = (wi + 1) % words.length; ci = 0; delay = 250; } }
      else if (++ci > words[wi].length) { deleting = true; ci = words[wi].length; delay = 1800; }
      setTimeout(typeLoop, delay);
    })();
  }

  /* =========================================================
     OS detection + download CTAs + toast
     ========================================================= */
  const toastEl = $("#toast");
  let toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 1900);
  }

  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const fmtSize = (b) => (b > 1048576 ? (b / 1048576).toFixed(1) + " MB" : Math.round(b / 1024) + " KB");

  const ua = navigator.userAgent;
  const os = /Windows/i.test(ua)
    ? "win"
    : /Macintosh|Mac OS X/i.test(ua) && !/iPhone|iPad|iPod/i.test(ua)
      ? "mac"
      : /Linux|X11/i.test(ua) && !/Android/i.test(ua)
        ? "linux"
        : null;

  const DL_BASE = `https://github.com/${REPO}/releases/latest/download`;
  const ASSET_SPECS = {
    "win-setup": { file: "sunset-launcher-windows-x64-setup.exe", re: /^sunset-launcher-windows-x64-setup\.exe$/ },
    "win-exe": { file: "sunset-launcher-windows-x64.exe", re: /^sunset-launcher-windows-x64\.exe$/ },
    "win-zip": { file: "sunset-launcher-windows-x64-portable.zip", re: /^sunset-launcher-windows-x64-portable\.zip$/ },
    "linux-deb-x64": { file: "sunset-launcher_0.1.9_amd64.deb", re: /^sunset-launcher_.*_amd64\.deb$/ },
    "linux-deb-arm64": { file: "sunset-launcher_0.1.9_arm64.deb", re: /^sunset-launcher_.*_arm64\.deb$/ },
    "linux-rpm-x64": { file: "sunset-launcher-0.1.9-1.x86_64.rpm", re: /^sunset-launcher-.*-1\.x86_64\.rpm$/ },
    "linux-rpm-arm64": { file: "sunset-launcher-0.1.9-1.aarch64.rpm", re: /^sunset-launcher-.*-1\.aarch64\.rpm$/ },
    "linux-appimage-x64": { file: "sunset-launcher-0.1.9-x86_64.AppImage", re: /^sunset-launcher-.*-x86_64\.AppImage$/ },
    "linux-appimage-arm64": { file: "sunset-launcher-0.1.9-aarch64.AppImage", re: /^sunset-launcher-.*-aarch64\.AppImage$/ },
    "linux-bin-x64": { file: "sunset-launcher-linux-x64", re: /^sunset-launcher-linux-x64$/ },
    "linux-bin-arm64": { file: "sunset-launcher-linux-arm64", re: /^sunset-launcher-linux-arm64$/ },
    "mac-dmg-arm64": { file: "sunset-launcher-macos-arm64.dmg", re: /^sunset-launcher-macos-arm64\.dmg$/ },
    "mac-dmg-x64": { file: "sunset-launcher-macos-x64.dmg", re: /^sunset-launcher-macos-x64\.dmg$/ },
    "mac-app-arm64": { file: "sunset-launcher-macos-arm64.app.zip", re: /^sunset-launcher-macos-arm64\.app\.zip$/ },
    "mac-app-x64": { file: "sunset-launcher-macos-x64.app.zip", re: /^sunset-launcher-macos-x64\.app\.zip$/ },
    "mac-bin-arm64": { file: "sunset-launcher-macos-arm64", re: /^sunset-launcher-macos-arm64$/ },
    "mac-bin-x64": { file: "sunset-launcher-macos-x64", re: /^sunset-launcher-macos-x64$/ },
  };
  const resolvedAssets = Object.fromEntries(
    Object.entries(ASSET_SPECS).map(([k, v]) => [k, {
      name: v.file,
      url: `${DL_BASE}/${v.file}`,
      shaUrl: `${DL_BASE}/${v.file}.sha256`,
      size: null,
    }]),
  );

  function syncAssetDom() {
    $$("[data-dl-key]").forEach((el) => {
      const r = resolvedAssets[el.dataset.dlKey];
      if (r) el.href = r.url;
    });
    $$("[data-sha-key]").forEach((el) => {
      const r = resolvedAssets[el.dataset.shaKey];
      if (r) el.href = r.shaUrl;
    });
    $$("[data-asset-key]").forEach((el) => {
      const r = resolvedAssets[el.dataset.assetKey];
      if (r) el.textContent = r.size ? "· " + fmtSize(r.size) : "";
    });
    $$('[data-deb-file="amd64"]').forEach((el) => {
      el.textContent = resolvedAssets["linux-deb-x64"].name;
    });
    $$('[data-rpm-file="x86_64"]').forEach((el) => {
      el.textContent = resolvedAssets["linux-rpm-x64"].name;
    });
    $$('[data-appimage-file="x86_64"]').forEach((el) => {
      el.textContent = resolvedAssets["linux-appimage-x64"].name;
    });
  }

  function updateAssetsFromRelease(assets) {
    if (!Array.isArray(assets) || !assets.length) return;
    for (const [key, spec] of Object.entries(ASSET_SPECS)) {
      const a = assets.find((x) => spec.re.test(x.name) && !x.name.endsWith(".sha256"));
      if (!a) continue;
      const sha = assets.find((x) => x.name === `${a.name}.sha256`);
      resolvedAssets[key] = {
        name: a.name,
        url: a.browser_download_url,
        shaUrl: sha ? sha.browser_download_url : `${a.browser_download_url}.sha256`,
        size: a.size,
      };
    }
    syncAssetDom();
  }

  function updateDownloadCTA() { /* #heroDownloadText uses data-i18n="hero.download" */ }

  if (os === "win") $("#cardWin")?.classList.add("recommended");
  if (os === "linux") $("#cardLinux")?.classList.add("recommended");
  if (os === "mac") $("#cardMac")?.classList.add("recommended");
  if (os) {
    const cards = $(".os-cards"), rec = $(".os-card.recommended");
    if (cards && rec) cards.prepend(rec);
  }

  /* Hero download dropdown menu (choose .exe, .deb, binary, or macOS) */
  const heroDlDropdown = $("#heroDlDropdown"), heroBtn = $("#heroDownload"), heroDlMenu = $("#heroDlMenu"), heroDlList = $("#heroDlList");
  if (heroDlDropdown && heroBtn && heroDlMenu) {
    if (os && heroDlList) {
      const matching = $$(`[data-os-group="${os}"]`, heroDlList);
      matching.forEach((row) => row.classList.add("is-os-match"));
      for (let i = matching.length - 1; i >= 0; i--) heroDlList.prepend(matching[i]);
    }
    const setHeroMenu = (open) => {
      heroDlDropdown.classList.toggle("open", open);
      heroDlMenu.hidden = !open;
      heroBtn.setAttribute("aria-expanded", String(open));
    };
    heroBtn.addEventListener("click", (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();
      setHeroMenu(heroDlMenu.hidden);
    });
    document.addEventListener("click", (e) => {
      if (!heroDlMenu.hidden && !e.target.closest("#heroDlDropdown")) setHeroMenu(false);
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !heroDlMenu.hidden) {
        setHeroMenu(false);
        heroBtn.focus();
      }
    });
    heroDlMenu.addEventListener("click", (e) => {
      if (e.target.closest("[data-dl]")) setHeroMenu(false);
    });
  }

  /* Architecture switches on download.html */
  function setCardArch(cardOs, arch) {
    const sw = $(`[data-arch-card="${cardOs}"]`);
    if (!sw) return;
    $$(".arch-btn", sw).forEach((b) => b.classList.toggle("active", b.dataset.arch === arch));
    const bindAsset = (btnId, sizeId, shaId, key) => {
      const btn = $(btnId), size = $(sizeId), sha = $(shaId);
      if (btn) btn.dataset.dlKey = key;
      if (size) size.dataset.assetKey = key;
      if (sha) sha.dataset.shaKey = key;
    };
    if (cardOs === "linux") {
      bindAsset("#btnLinuxDeb", "#sizeLinuxDeb", "#shaLinuxDeb", `linux-deb-${arch}`);
      bindAsset("#btnLinuxRpm", "#sizeLinuxRpm", "#shaLinuxRpm", `linux-rpm-${arch}`);
      bindAsset("#btnLinuxAppImage", "#sizeLinuxAppImage", "#shaLinuxAppImage", `linux-appimage-${arch}`);
      bindAsset("#btnLinuxBin", "#sizeLinuxBin", "#shaLinuxBin", `linux-bin-${arch}`);
    } else if (cardOs === "mac") {
      bindAsset("#btnMacDmg", "#sizeMacDmg", "#shaMacDmg", `mac-dmg-${arch}`);
      bindAsset("#btnMacApp", "#sizeMacApp", "#shaMacApp", `mac-app-${arch}`);
      bindAsset("#btnMacBin", "#sizeMacBin", "#shaMacBin", `mac-bin-${arch}`);
    }
    syncAssetDom();
  }
  $$("[data-arch-card]").forEach((sw) => {
    $$(".arch-btn", sw).forEach((btn) => btn.addEventListener("click", () => setCardArch(sw.dataset.archCard, btn.dataset.arch)));
  });
  if (os === "linux" && /aarch64|arm64/i.test(ua)) setCardArch("linux", "arm64");

  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-dl]")) toast("⬇️ " + t("dl.started"));
  });

  /* =========================================================
     GitHub release data (cached + fallback)
     ========================================================= */
  function md(src) {
    const inline = (s) => esc(s)
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>")
      .replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    let out = "", inList = false;
    for (const raw of src.split(/\r?\n/)) {
      const line = raw.trim();
      const li = line.match(/^[-*]\s+(.*)/);
      if (li) { if (!inList) { out += "<ul>"; inList = true; } out += `<li>${inline(li[1])}</li>`; continue; }
      if (inList) { out += "</ul>"; inList = false; }
      if (!line) continue;
      const h = line.match(/^(#{1,6})\s+(.*)/);
      out += h ? (h[1].length <= 2 ? `<h3>${inline(h[2])}</h3>` : `<h4>${inline(h[2])}</h4>`) : `<p>${inline(line)}</p>`;
    }
    return out + (inList ? "</ul>" : "");
  }

  const LOCAL_VER = "v0.1.8";
  const parseVer = (v) => String(v || "").replace(/^v/i, "").split(/[.-]/).map((n) => parseInt(n, 10) || 0);
  const cmpVer = (a, b) => {
    const pa = parseVer(a), pb = parseVer(b);
    for (let i = 0; i < 3; i++) if ((pa[i] || 0) !== (pb[i] || 0)) return (pa[i] || 0) - (pb[i] || 0);
    return 0;
  };

  const CACHE_KEY = "gh-cache-v3", CACHE_TTL = 15 * 60 * 1000;
  async function loadGitHub() {
    try {
      const c = JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
      if (c && Date.now() - c.at < CACHE_TTL) return c.data;
    } catch { /* ignore */ }
    const [repo, releases] = await Promise.all([
      fetch(`https://api.github.com/repos/${REPO}`).then((r) => (r.ok ? r.json() : null)),
      fetch(`https://api.github.com/repos/${REPO}/releases?per_page=100`).then((r) => (r.ok ? r.json() : null)),
    ]);
    if (!repo && !releases) throw new Error("github unavailable");
    const list = Array.isArray(releases) ? releases.filter((r) => !r.draft) : [];
    const latest = list.find((r) => !r.prerelease) || list[0] || null;
    const downloads = list.reduce((sum, r) => sum + (r.assets || [])
      .filter((a) => !a.name.endsWith(".sha256"))
      .reduce((s, a) => s + a.download_count, 0), 0);
    const mapRel = (r) => ({
      tag: r.tag_name,
      name: r.name || r.tag_name,
      date: r.published_at,
      body: r.body || "",
      url: r.html_url,
      downloads: (r.assets || []).filter((a) => !a.name.endsWith(".sha256")).reduce((s, a) => s + a.download_count, 0),
    });
    const history = list.filter((r) => latest && r.id !== latest.id).slice(0, 6).map(mapRel);
    const all = list.map(mapRel);
    const data = { stars: repo?.stargazers_count ?? null, downloads: list.length ? downloads : null, latest, history, all };
    try { localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), data })); } catch { /* quota */ }
    return data;
  }

  const fmtNum = (n) => (n >= 1000 ? (n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, "") + "k" : String(n));
  function animateTo(el, end, suffix = "") {
    if (reduceMotion) { el.textContent = fmtNum(end) + suffix; return; }
    const start = performance.now(), dur = 1400;
    const step = (now) => {
      const p = Math.min((now - start) / dur, 1);
      el.textContent = fmtNum(Math.round(end * (1 - Math.pow(1 - p, 4)))) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  function setLiveStat(key, val, fallbackNum, fallbackSuffix, fallbackLabelKey) {
    $$(`[data-live="${key}"]`).forEach((el) => {
      const label = el.nextElementSibling;
      const run = () => {
        if (val != null) animateTo(el, val);
        else {
          animateTo(el, fallbackNum, fallbackSuffix);
          if (label && label.dataset.i18n) {
            label.dataset.i18n = fallbackLabelKey;
            label.textContent = t(fallbackLabelKey);
          }
        }
      };
      const host = el.closest(".reveal");
      if (!host || host.classList.contains("in")) run();
      else new IntersectionObserver((es, o) => { if (es[0].isIntersecting) { run(); o.disconnect(); } }).observe(host);
    });
  }

  loadGitHub()
    .then(({ stars, downloads, latest: d, history, all }) => {
      if (stars != null) {
        $$(".gh-stars").forEach((s) => { s.textContent = "★ " + fmtNum(stars); s.hidden = false; });
      }
      setLiveStat("downloads", downloads, 64, "", "stats.dl");
      setLiveStat("stars", stars, 100, "%", "stats.rust");

      if (!d?.tag_name) throw 0;
      const v = d.tag_name.startsWith("v") ? d.tag_name : `v${d.tag_name}`;
      const cmp = cmpVer(v, LOCAL_VER);
      if (cmp >= 0) {
        $$(".version").forEach((el) => (el.textContent = v));
        if (d.published_at) {
          latestPublishedAt = d.published_at;
          formatRelDate();
        }
      }
      updateAssetsFromRelease(d.assets || []);
      (d.assets || []).forEach((a) => $$(`[data-asset="${a.name}"]`).forEach((el) => (el.textContent = "· " + fmtSize(a.size))));

      const assetsHtml = d.assets?.length ? `<div class="assets">${d.assets.map((a) =>
        `<div class="asset"><a href="${esc(a.browser_download_url)}">${esc(a.name)}</a><span>${fmtSize(a.size)} · ⬇ ${a.download_count}</span></div>`).join("")}</div>` : "";
      const cl = $("#changelog");
      if (cl) {
        if (cmp > 0 && d.body) {
          cl.innerHTML = `<h3>${esc(d.name || v)}</h3>` + (md(d.body || "") || "") + assetsHtml;
        } else if (cmp === 0 && assetsHtml) {
          const slot = $("#changelogAssets", cl);
          if (slot) slot.innerHTML = assetsHtml;
        }
      }

      const prevList = cmp < 0
        ? [{ tag: d.tag_name, name: d.name || v, date: d.published_at, body: d.body || "", url: d.html_url,
          downloads: (d.assets || []).filter((a) => !a.name.endsWith(".sha256")).reduce((s, a) => s + a.download_count, 0) }, ...(history || [])].slice(0, 5)
        : (history || []);
      const rh = $("#relHistory");
      if (rh && prevList.length) {
        rh.hidden = false;
        rh.innerHTML = `<div class="rel-history-title" data-i18n="dp.history">${esc(t("dp.history"))}</div>` +
          prevList.map((r) => `
            <details class="rel-old">
              <summary><span>${esc(r.name)}</span><span>${r.date ? new Date(r.date).toISOString().slice(0, 10) : ""} · ⬇ ${r.downloads}</span></summary>
              <div class="rel-old-body">${md(r.body) || ""}<p><a href="${esc(r.url)}" target="_blank" rel="noopener">GitHub →</a></p></div>
            </details>`).join("");
      }

      /* Enrich changelog.html with live download counts + any newer GitHub releases */
      const clTimeline = $("#clTimeline");
      if (clTimeline && Array.isArray(all)) {
        const known = new Set($$("[data-version]", clTimeline).map((el) => el.dataset.version));
        all.forEach((r) => {
          const rv = r.tag.startsWith("v") ? r.tag : `v${r.tag}`;
          const card = $(`[data-version="${rv}"] .cl-meta`, clTimeline);
          if (card && r.downloads > 0 && !$(".cl-dl-badge", card)) {
            card.insertAdjacentHTML("afterbegin", `<span class="cl-dl-badge">⬇ ${fmtNum(r.downloads)}</span>`);
          }
        });
        const newer = all.filter((r) => {
          const rv = r.tag.startsWith("v") ? r.tag : `v${r.tag}`;
          return !known.has(rv) && cmpVer(rv, LOCAL_VER) > 0;
        });
        const extra = $("#clLiveExtra");
        if (extra && newer.length) {
          $$(".latest", clTimeline).forEach((el) => { el.classList.remove("latest"); $(".latest-pill", el)?.remove(); });
          extra.hidden = false;
          extra.innerHTML = newer.map((r, idx) => {
            const rv = r.tag.startsWith("v") ? r.tag : `v${r.tag}`;
            return `<article class="cl-entry${idx === 0 ? " latest" : ""} in" id="${esc(rv)}" data-version="${esc(rv)}" data-cats="new imp">
              <div class="cl-rail" aria-hidden="true"><span class="cl-dot"></span></div>
              <div class="cl-card">
                <header class="cl-head">
                  <div class="cl-ver-wrap">
                    <a href="#${esc(rv)}" class="cl-ver">${esc(rv)}</a>
                    ${idx === 0 ? `<span class="cl-pill latest-pill" data-i18n="cp.latest">${esc(t("cp.latest"))}</span>` : ""}
                  </div>
                  <div class="cl-meta">
                    ${r.downloads > 0 ? `<span class="cl-dl-badge">⬇ ${fmtNum(r.downloads)}</span>` : ""}
                    <time>${r.date ? new Date(r.date).toISOString().slice(0, 10) : ""}</time>
                    <a class="cl-gh" href="${esc(r.url)}" target="_blank" rel="noopener">GitHub ↗</a>
                  </div>
                </header>
                <h2 class="cl-title">${esc(r.name)}</h2>
                <div class="rel-old-body">${md(r.body) || ""}</div>
              </div>
            </article>`;
          }).join("");
        }
      }
    })
    .catch(() => {
      setLiveStat("downloads", null, 64, "", "stats.dl");
      setLiveStat("stars", null, 100, "%", "stats.rust");
      const cl = $("#changelog");
      if (cl && !cl.dataset.curatedVer) cl.innerHTML = `<p class="muted" data-i18n="dp.noNotes">${t("dp.noNotes")}</p>`;
    });

  /* =========================================================
     Download page: segmented OS tabs + copy buttons
     ========================================================= */
  const seg = $(".seg");
  function moveSeg() {
    if (!seg) return;
    const a = $(".seg-btn.active", seg), i = $(".seg-ind", seg);
    if (!a || !i) return;
    i.style.width = a.offsetWidth + "px";
    i.style.transform = `translateX(${a.offsetLeft}px)`;
  }
  if (seg) {
    const select = (osName) => {
      $$(".seg-btn", seg).forEach((b) => {
        const active = b.dataset.os === osName;
        b.classList.toggle("active", active);
        b.setAttribute("aria-selected", String(active));
      });
      $$(".os-panel").forEach((p) => p.classList.toggle("active", p.dataset.panel === osName));
      moveSeg();
    };
    $$(".seg-btn", seg).forEach((b) => b.addEventListener("click", () => select(b.dataset.os)));
    if (os === "win") select("windows");
    else if (os === "mac") select("macos");
    addEventListener("resize", moveSeg);
    if (typeof ResizeObserver !== "undefined") new ResizeObserver(moveSeg).observe(seg);
    document.fonts?.ready.then(moveSeg);
  }

  $$(".copy").forEach((btn) => btn.addEventListener("click", async () => {
    const pre = $("pre", btn.closest(".terminal")).cloneNode(true);
    $$(".c", pre).forEach((c) => c.remove());
    const text = pre.textContent.split("\n").map((l) => l.trim()).filter(Boolean).join("\n");
    try { await navigator.clipboard.writeText(text); } catch { /* ignore */ }
    btn.classList.add("done");
    btn.textContent = t("dl.copied");
    toast("📋 " + t("dl.copied"));
    setTimeout(() => { btn.classList.remove("done"); btn.textContent = t("dl.copy"); }, 1600);
  }));

  /* =========================================================
     Shared Lightbox + Screenshot Filters
     ========================================================= */
  const zoomables = $$(".shot, .zoomable");
  if (zoomables.length) {
    document.body.insertAdjacentHTML("beforeend", `
      <div class="lightbox" id="lightbox" aria-hidden="true" role="dialog" aria-modal="true" aria-label="Screenshot preview">
        <button class="lb-close" type="button" aria-label="Close">✕</button>
        <button class="lb-nav lb-prev" type="button" aria-label="Previous">‹</button>
        <figure class="lb-stage"><img id="lbImg" alt="" /><figcaption id="lbCap"></figcaption></figure>
        <button class="lb-nav lb-next" type="button" aria-label="Next">›</button>
        <div class="lb-count" id="lbCount"></div>
        <div class="lb-dots" id="lbDots"></div>
      </div>`);

    const lb = $("#lightbox"), lbImg = $("#lbImg"), lbCap = $("#lbCap"), lbCount = $("#lbCount"), lbDots = $("#lbDots");
    let activeList = [], idx = 0, opener = null;
    const visibleItems = () => zoomables.filter((el) => !el.hidden);
    const captionOf = (el) => {
      if (el.dataset.capKey) return `${t(el.dataset.capKey)} — ${t(el.dataset.descKey)}`;
      const b = $("figcaption b", el)?.textContent || "";
      const s = $("figcaption span", el)?.textContent || "";
      return s ? `${b} — ${s}` : b;
    };
    const show = (i) => {
      if (!activeList.length) return;
      idx = (i + activeList.length) % activeList.length;
      const el = activeList[idx];
      lbImg.style.opacity = 0;
      setTimeout(() => {
        lbImg.onload = () => (lbImg.style.opacity = 1);
        lbImg.src = el.dataset.src;
        lbImg.alt = $("img", el)?.alt || "";
        if (lbImg.complete) lbImg.style.opacity = 1;
        lbCap.textContent = captionOf(el);
        lbCount.textContent = `${idx + 1} / ${activeList.length}`;
        $$(".lb-dot", lbDots).forEach((d, n) => d.classList.toggle("active", n === idx));
      }, 140);
    };
    const openLb = (el) => {
      opener = el;
      activeList = visibleItems();
      const startIdx = Math.max(0, activeList.indexOf(el));
      lbDots.innerHTML = activeList.map((_, n) => `<button class="lb-dot" type="button" aria-label="Slide ${n + 1}" data-dot="${n}"></button>`).join("");
      show(startIdx);
      lb.classList.add("open");
      lb.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      $(".lb-close", lb).focus();
    };
    const closeLb = () => {
      lb.classList.remove("open");
      lb.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      opener?.focus?.();
    };

    zoomables.forEach((el) => {
      el.addEventListener("click", () => openLb(el));
      el.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openLb(el); }
      });
    });
    lbDots.addEventListener("click", (e) => {
      const d = e.target.closest("[data-dot]");
      if (d) show(+d.dataset.dot);
    });
    $(".lb-close", lb).addEventListener("click", closeLb);
    $(".lb-prev", lb).addEventListener("click", (e) => { e.stopPropagation(); show(idx - 1); });
    $(".lb-next", lb).addEventListener("click", (e) => { e.stopPropagation(); show(idx + 1); });
    lb.addEventListener("click", (e) => { if (e.target === lb) closeLb(); });
    addEventListener("keydown", (e) => {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") closeLb();
      if (e.key === "ArrowLeft") show(idx - 1);
      if (e.key === "ArrowRight") show(idx + 1);
    });
    let sx = null;
    lb.addEventListener("touchstart", (e) => (sx = e.touches[0].clientX), { passive: true });
    lb.addEventListener("touchend", (e) => {
      if (sx === null) return;
      const dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1));
      sx = null;
    });

    /* screenshot category filters */
    const filterBtns = $$(".filter-btn[data-filter]");
    if (filterBtns.length) {
      filterBtns.forEach((btn) => btn.addEventListener("click", () => {
        const cat = btn.dataset.filter;
        filterBtns.forEach((b) => b.classList.toggle("active", b === btn));
        $$(".shot").forEach((s) => {
          const match = cat === "all" || s.dataset.cat === cat;
          s.hidden = !match;
          if (match) s.classList.add("in");
        });
      }));
    }
  }

  /* =========================================================
     Changelog: search + category filter + highlighting + hash scroll
     ========================================================= */
  const clEntries = $$("#clTimeline .cl-entry");
  if (clEntries.length) {
    const clSearch = $("#clSearch"), clEmpty = $("#clEmpty"), clBtns = $$("[data-cl-filter]");
    let activeCat = "all";
    const textTargets = (entry) => [
      $(".cl-title", entry),
      ...$$(".cl-spotlight h3, .cl-spotlight p", entry),
      ...$$(".cl-list li > span:last-child", entry),
    ].filter(Boolean);
    const storeClOriginals = () => clEntries.forEach((entry) => {
      textTargets(entry).forEach((el) => (el.dataset.clOrig = el.textContent));
    });
    const markText = (str, q) => {
      if (!q) return esc(str);
      const safe = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      return esc(str).replace(new RegExp(safe, "gi"), (m) => `<mark>${m}</mark>`);
    };
    const runClFilter = () => {
      const q = (clSearch?.value || "").trim();
      const ql = q.toLowerCase();
      let shownEntries = 0;
      clEntries.forEach((entry) => {
        const verText = ($(".cl-ver", entry)?.textContent || "").toLowerCase();
        const titleEl = $(".cl-title", entry);
        const titleOrig = titleEl?.dataset.clOrig || "";
        const tagsText = $$(".cl-tags span", entry).map((s) => s.textContent).join(" ").toLowerCase();
        const headerHit = !ql || verText.includes(ql) || titleOrig.toLowerCase().includes(ql) || tagsText.includes(ql);
        if (titleEl) titleEl.innerHTML = markText(titleOrig, q);

        const spot = $(".cl-spotlight", entry);
        let spotShown = false;
        if (spot) {
          const spotCatOk = activeCat === "all" || spot.dataset.clCat === activeCat || activeCat === "new";
          const spotEls = $$("h3, p", spot);
          const spotText = spotEls.map((el) => el.dataset.clOrig || "").join("\n").toLowerCase();
          const termText = ($("pre", spot)?.textContent || "").toLowerCase();
          const spotHit = spotCatOk && (!ql || headerHit || spotText.includes(ql) || termText.includes(ql));
          spot.hidden = !spotHit;
          spotEls.forEach((el) => (el.innerHTML = markText(el.dataset.clOrig || "", q)));
          spotShown = spotHit;
        }

        let itemsShown = 0;
        $$(".cl-list li", entry).forEach((li) => {
          const catOk = activeCat === "all" || li.dataset.clCat === activeCat;
          const bodySpan = $("span:last-child", li);
          const orig = bodySpan?.dataset.clOrig || "";
          const hit = catOk && (!ql || headerHit || orig.toLowerCase().includes(ql));
          li.hidden = !hit;
          if (bodySpan) bodySpan.innerHTML = markText(orig, q);
          if (hit) itemsShown++;
        });

        const showEntry = spotShown || itemsShown > 0;
        entry.hidden = !showEntry;
        if (showEntry) {
          entry.classList.add("in");
          shownEntries++;
        }
      });
      if (clEmpty) clEmpty.hidden = shownEntries > 0;
    };
    refreshClAfterLang = () => { storeClOriginals(); runClFilter(); };
    storeClOriginals();
    clSearch?.addEventListener("input", runClFilter);
    clBtns.forEach((btn) => btn.addEventListener("click", () => {
      activeCat = btn.dataset.clFilter || "all";
      clBtns.forEach((b) => b.classList.toggle("active", b === btn));
      runClFilter();
    }));

    if (location.hash) {
      const target = clEntries.find((el) => el.id === decodeURIComponent(location.hash.slice(1)));
      if (target) {
        setTimeout(() => target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" }), 120);
      }
    }
  }

  /* =========================================================
     FAQ: search + highlighting + smooth accordion + hash open
     ========================================================= */
  const search = $("#faqSearch"), faqItems = $$("#faqList details");
  if (faqItems.length) {
    const empty = $("#faqEmpty");
    const storeOriginals = () => faqItems.forEach((d) => {
      const s = $("summary", d), p = $(".ans p", d);
      if (s) d.dataset.qOrig = s.textContent;
      if (p) d.dataset.aOrig = p.textContent;
    });
    const highlight = (str, q) => {
      if (!q) return esc(str);
      const safe = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      return esc(str).replace(new RegExp(safe, "gi"), (m) => `<mark>${m}</mark>`);
    };
    const runSearch = () => {
      if (!search) return;
      const q = search.value.trim();
      const ql = q.toLowerCase();
      let shown = 0;
      faqItems.forEach((d) => {
        const qOrig = d.dataset.qOrig || "", aOrig = d.dataset.aOrig || "";
        const hit = !ql || (qOrig + "\n" + aOrig).toLowerCase().includes(ql);
        d.hidden = !hit;
        if (hit) shown++;
        $("summary", d).innerHTML = highlight(qOrig, q);
        $(".ans p", d).innerHTML = highlight(aOrig, q);
        if (ql) d.open = hit && shown <= 3;
        else if (location.hash.slice(1) !== d.id) d.open = false;
      });
      if (empty) empty.hidden = shown > 0;
    };
    refreshFaqAfterLang = () => { storeOriginals(); runSearch(); };
    storeOriginals();
    search?.addEventListener("input", runSearch);

    /* smooth accordion height animation on click */
    const animateDetails = (d, open) => {
      const ans = $(".ans", d);
      if (!ans || reduceMotion) { d.open = open; return; }
      ans.getAnimations().forEach((a) => a.cancel());
      if (open) {
        d.open = true;
        const h = ans.scrollHeight;
        const anim = ans.animate([{ height: "0px", opacity: 0 }, { height: h + "px", opacity: 1 }], { duration: 280, easing: "cubic-bezier(.2,.8,.2,1)" });
        anim.onfinish = () => { ans.style.height = ""; };
      } else {
        const h = ans.offsetHeight;
        const anim = ans.animate([{ height: h + "px", opacity: 1 }, { height: "0px", opacity: 0 }], { duration: 220, easing: "cubic-bezier(.2,.8,.2,1)" });
        anim.onfinish = () => { d.open = false; ans.style.height = ""; };
      }
    };
    faqItems.forEach((d) => {
      const s = $("summary", d);
      s?.addEventListener("click", (e) => {
        e.preventDefault();
        const willOpen = !d.open;
        if (willOpen && !search?.value) {
          faqItems.forEach((o) => { if (o !== d && o.open) animateDetails(o, false); });
        }
        animateDetails(d, willOpen);
      });
    });

    if (location.hash) {
      const target = faqItems.find((d) => d.id === location.hash.slice(1));
      if (target) {
        target.open = true;
        setTimeout(() => target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" }), 120);
      }
    }
  }

  /* =========================================================
     Command palette (Ctrl+K) — same idea as in the launcher
     ========================================================= */
  const pal = $("#palette"), palInput = $("#paletteInput"), palList = $("#paletteList");
  const ICONS = { home: "🏠", features: "✨", screenshots: "🖼️", download: "⬇️", changelog: "📋", faq: "❓" };
  function paletteItems() {
    const go = (href) => () => {
      const a = document.createElement("a");
      a.href = href; document.body.appendChild(a); a.click(); a.remove();
    };
    const items = PAGES.map(([id, href, key]) => ({
      group: t("pal.pages"), icon: ICONS[id], label: t(key), kw: `${id} ${EN[key]} ${RU[key]} ченджлог чейнджлог обновления релизы`, run: go(href),
    }));
    items.push(
      { group: t("pal.actions"), icon: "🪟", label: t("pal.dlWin"), kw: "windows exe скачать download екзе", run: () => { toast("⬇️ " + t("dl.started")); location.href = resolvedAssets["win-exe"].url; } },
      { group: t("pal.actions"), icon: "📦", label: t("pal.dlLinuxDeb"), kw: "linux deb debian ubuntu mint деб пакет скачать download", run: () => { toast("⬇️ " + t("dl.started")); location.href = resolvedAssets["linux-deb-x64"].url; } },
      { group: t("pal.actions"), icon: "🐧", label: t("pal.dlLinuxBin"), kw: "linux binary бинарник скачать download", run: () => { toast("⬇️ " + t("dl.started")); location.href = resolvedAssets["linux-bin-x64"].url; } },
      { group: t("pal.actions"), icon: "🍎", label: t("pal.dlMacArm"), kw: "macos mac apple silicon arm64 m1 m2 m3 m4 мак макос скачать download", run: () => { toast("⬇️ " + t("dl.started")); location.href = resolvedAssets["mac-app-arm64"].url; } },
      { group: t("pal.actions"), icon: "🍎", label: t("pal.dlMacIntel"), kw: "macos mac intel x64 мак макос скачать download", run: () => { toast("⬇️ " + t("dl.started")); location.href = resolvedAssets["mac-app-x64"].url; } },
      { group: t("pal.actions"), icon: "🐙", label: t("pal.gh"), kw: "github source код исходники", run: () => open(`https://github.com/${REPO}`, "_blank", "noopener") },
      { group: t("pal.actions"), icon: "🐞", label: t("pal.issue"), kw: "bug issue баг ошибка", run: () => open(`https://github.com/${REPO}/issues`, "_blank", "noopener") },
      { group: t("pal.actions"), icon: "🌐", label: t("pal.lang"), kw: "language язык english русский", run: () => $("#langBtn").click() },
      { group: t("pal.actions"), icon: "⬆️", label: t("pal.top"), kw: "top наверх", run: () => scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }) },
    );
    if (clEntries.length) {
      clEntries.forEach((entry) => {
        const ver = $(".cl-ver", entry)?.textContent || "";
        const title = $(".cl-title", entry)?.dataset.clOrig || $(".cl-title", entry)?.textContent || "";
        items.push({
          group: t("pal.cl"), icon: "🚀", label: `${ver} — ${title}`,
          kw: `${ver} ${title} bore боре dedicated дедикейтед сервер серый ip cgnat upnp`,
          run: () => { entry.hidden = false; entry.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" }); },
        });
      });
    } else {
      items.push({
        group: t("pal.cl"), icon: "🚀", label: t("pal.cl019"),
        kw: "v0.1.9 curseforge rpm appimage dmg setup installer hooks offline mode responsive",
        run: go("changelog.html#v0.1.9"),
      });
    }
    faqItems.forEach((d) => {
      const label = d.dataset.qOrig || $("summary", d).textContent;
      items.push({
        group: "FAQ", icon: "💬", label, kw: `${label} ${d.dataset.aOrig || ""}`,
        run: () => { d.hidden = false; d.open = true; d.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" }); },
      });
    });
    return items;
  }
  let palItems = [], palShown = [], palIdx = 0;
  function renderPalette() {
    const q = palInput.value.trim().toLowerCase();
    palShown = palItems.filter((i) => !q || (i.label + " " + i.kw).toLowerCase().includes(q));
    palIdx = Math.min(palIdx, Math.max(palShown.length - 1, 0));
    if (!palShown.length) { palList.innerHTML = `<li class="palette-empty">${esc(t("pal.empty"))}</li>`; return; }
    let html = "", group = "";
    palShown.forEach((i, n) => {
      if (i.group !== group) { group = i.group; html += `<li class="palette-group">${esc(group)}</li>`; }
      html += `<li class="palette-item${n === palIdx ? " active" : ""}" role="option" data-n="${n}"><span class="pi-ico">${i.icon}</span><span>${esc(i.label)}</span><span class="pi-go">↵</span></li>`;
    });
    palList.innerHTML = html;
    $(".palette-item.active", palList)?.scrollIntoView({ block: "nearest" });
  }
  function openPalette() {
    palItems = paletteItems(); palIdx = 0; palInput.value = "";
    renderPalette();
    pal.classList.add("open"); pal.setAttribute("aria-hidden", "false");
    setTimeout(() => palInput.focus(), 30);
  }
  function closePalette() { pal.classList.remove("open"); pal.setAttribute("aria-hidden", "true"); }
  function runPalette(n) { const i = palShown[n]; if (!i) return; closePalette(); i.run(); }
  $("#paletteBtn").addEventListener("click", openPalette);
  pal.addEventListener("click", (e) => { if (e.target === pal) closePalette(); });
  palInput.addEventListener("input", () => { palIdx = 0; renderPalette(); });
  palList.addEventListener("click", (e) => { const li = e.target.closest(".palette-item"); if (li) runPalette(+li.dataset.n); });
  palList.addEventListener("mousemove", (e) => {
    const li = e.target.closest(".palette-item");
    if (!li || +li.dataset.n === palIdx) return;
    palIdx = +li.dataset.n;
    $$(".palette-item", palList).forEach((el) => el.classList.toggle("active", el === li));
  });
  addEventListener("keydown", (e) => {
    const typing = /^(INPUT|TEXTAREA)$/.test(document.activeElement?.tagName);
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      pal.classList.contains("open") ? closePalette() : openPalette();
      return;
    }
    if (!pal.classList.contains("open")) {
      if (e.key === "Escape") closeMenu();
      if (e.key === "/" && !typing) {
        const s = $("#faqSearch") || $("#clSearch");
        if (s) { e.preventDefault(); s.focus(); }
        else { e.preventDefault(); openPalette(); }
      }
      return;
    }
    if (e.key === "Escape") closePalette();
    else if (e.key === "ArrowDown") { e.preventDefault(); palIdx = (palIdx + 1) % Math.max(palShown.length, 1); renderPalette(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); palIdx = (palIdx - 1 + palShown.length) % Math.max(palShown.length, 1); renderPalette(); }
    else if (e.key === "Enter") { e.preventDefault(); runPalette(palIdx); }
  });

  /* back to top */
  const toTop = $("#toTop");
  toTop.addEventListener("click", () => scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }));
  addEventListener("scroll", () => toTop.classList.toggle("show", scrollY > 700), { passive: true });

  /* =========================================================
     Floating pixel particles (embers) — paused when tab hidden
     ========================================================= */
  const cv = $("#particles"), ctx = cv.getContext("2d");
  const colors = ["255,179,71", "255,120,51", "232,80,106", "160,120,220"];
  let W, H, parts = [], partRaf = null;
  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    W = cv.width = innerWidth * dpr;
    H = cv.height = innerHeight * dpr;
    cv.style.width = innerWidth + "px"; cv.style.height = innerHeight + "px";
    const n = Math.min(46, Math.floor(innerWidth / 32));
    parts = Array.from({ length: n }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      s: (2 + Math.random() * 5) * dpr,
      v: (0.15 + Math.random() * 0.45) * dpr,
      w: Math.random() * Math.PI * 2,
      a: 0.12 + Math.random() * 0.4,
      c: colors[Math.floor(Math.random() * colors.length)],
    }));
  }
  function tick(time) {
    if (document.hidden) { partRaf = null; return; }
    ctx.clearRect(0, 0, W, H);
    for (const p of parts) {
      p.y -= p.v;
      const x = p.x + Math.sin(time / 1800 + p.w) * 12;
      if (p.y < -10) { p.y = H + 10; p.x = Math.random() * W; }
      ctx.fillStyle = `rgba(${p.c},${p.a * (0.7 + 0.3 * Math.sin(time / 700 + p.w))})`;
      ctx.fillRect(x, p.y, p.s, p.s);
    }
    partRaf = requestAnimationFrame(tick);
  }
  addEventListener("resize", resize);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      if (!reduceMotion && !partRaf) partRaf = requestAnimationFrame(tick);
      if (finePointer && !reduceMotion && !glowRaf) glowRaf = requestAnimationFrame(stepGlow);
    }
  });
  resize();
  if (!reduceMotion) partRaf = requestAnimationFrame(tick);

  applyLang();
})();
