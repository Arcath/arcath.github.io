---
layout: post
title: "Deploying Adobe Air and Air Apps"
date: 2014-02-12 09:29:33 +0000
comments: true
categories: Work
summary: "Adobe Air isn't just an awful product, its a pain to deploy as well."
---

As much as I hate Adobe Air some deluded companies think its the best way to make software and I've been forced on more than one occasion to deploy it to the whole network, which leads nicely into the big problem... __There is no MSI__ and just as annoying software for it are _.air_ files that it wants to install...

<!--more-->

Adobe Air does have a silent install option so its deployment can be scripted, my (& my companies) method of deploying silent exes is to use this script:

{% gist 8952312 %}

The script documents what you need to do but the install line for Adobe Air would be:

```
Install "\\path\to\installer.exe", "-silent -eulaAccepted", "AdobeAir-X-Y"
```

Subsitute X & Y in the key for the version you are deploying e.g. 4-0. You will need to use this method to update Air in the future, so specifiying the version number saves you having to remove the key later. Obviously drop the `-eulaAccepted` if you can't accept it for the end user and want them to do it themselves.

Air provides an installer for apps that you can run silently, but you need to run it after Air has installed (In most cases I only depoy air when it is actually needed so its going out at the same time as an app).

Our script has another install function called `Install_After` that takes a 4th option. This 4th option is a key to check before running the install, the install will then only procede if that key exists. Taking this into account the install line for an Air app would be:

```
Install_After "C:\Program Files (x86)\Adobe\Flash\AddIns\airappinstaller\airappinstaller.exe", "-silent \\path\to\air\app\with\no\spaces.air", "App", "AdobeAir-X-Y"
```

This ensures that the installer wont be run before Air is installed and can even be used to make sure that a new version of Air is installed before running.

The installed app __will not have a shortcut__ anywhere so you will need to add them manually using your domain.

Thats about it, our script makes deploying stuff via silent exes quite easy and safe. You can use GPP to delete the key files and have the script automatically re-install the software (unless the exe see the target product and ignores the request).
