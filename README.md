# After Hours

**Small desktop tools that do one thing well.**

This is the website for After Hours — a little shelf of free Windows apps I build
in my spare time. The site is the front door: you browse the apps, read what each
one does, and download the one you want. That's it.

**→ <https://itsadityakr.github.io/after_hours/>**

---

## Why I made this

Every so often my computer would annoy me in some small, specific way.

My status would flip to "Away" while I was reading something on the other screen.
I'd want the PC to shut down after a download finished, so I'd sit there waiting
for it. I'd wish I could add one item to the right-click menu without wading
through the registry. I'd want to turn the volume down without walking back to my
desk.

Each of those is too small to be worth buying software for, and the free options
tend to come with an installer full of extras, an account to create, or a "pro"
upsell. So I wrote my own — after work, one evening at a time. Hence the name.

Once there were a few of them, they were scattered across separate code
repositories with no obvious way in. This site pulls them into one place so
anyone can find them, see what they do, and grab a copy.

---

## What's on the site

A card for every app, with search, filters, and a favourites list so you can pin
the ones you care about. Click a card and you get the full story on that app:
what it does, what it needs to run, what it does with your data, and buttons to
download it or read the code.

There is also a dark mode, which follows your system by default.

### The apps

**Me Not AFK** — Keeps your screen awake and your status green. Useful when
you're reading, on a call, or just away from the keyboard for a few minutes and
would rather not look offline. Set how often it nudges the computer, and set a
timer so it switches itself off.

**Shut Me Down** — Tell your PC to shut down, restart, sleep, hibernate, lock or
sign out — either after a delay or at a particular time. There's a countdown you
can watch, and you can cancel at any point. Handy for overnight downloads or
falling asleep to something.

**Context Menu Tool** — Adds your own entries to the Windows right-click menu,
without opening the registry editor. Pick a name, pick an icon, point it at
whatever you want to run. You can edit or remove anything you've added.

**Control Deck** — Turns your phone into a remote for your PC. Scan a QR code and
you get volume, media buttons, display and power controls from your phone's
browser. Nothing to install on the phone, and it all stays on your home WiFi.
This one is still in beta.

---

## What I promise

- **Free.** All of it, permanently. No trial, no pro version, no ads.
- **No accounts.** Nothing to sign up for. Nothing to log into.
- **No tracking.** The apps don't phone home. Your settings live on your own
  machine and stay there.
- **Open.** The code for every app is public. If you don't trust a download, read
  the source, or build it yourself.
- **Yours to keep.** MIT licensed — use it, change it, ship it in something else.

---

## Getting an app

Open the site, pick an app, click download. You'll land on its releases page on
GitHub, where you can grab the latest build.

The apps are portable, so there's no installer to run — download it and open it.
Windows may warn you about an unrecognised app the first time, because these
builds aren't signed with a paid certificate. Choosing "More info → Run anyway"
gets you past it.

They're on the chunky side (75–95 MB) because each app ships with everything it
needs to run rather than relying on anything already on your machine.

---

## Something missing or broken?

Every app has an issues page on GitHub — that's the best place to report a bug or
ask for a feature. If you'd rather fix it yourself, pull requests are welcome, and
you're free to fork any of these and take them in your own direction.

---

## Supporting the work

There's a "Buy me a coffee" button on the site with a UPI QR code. Entirely
optional — the apps don't change either way. It's just a nice way to say
something here saved you some time.

---

## About this repository

This repository holds the published website itself — the files that get served
when you visit it. The source code the site is built from lives separately.

MIT licensed. © 2026 Aditya Kumar.
