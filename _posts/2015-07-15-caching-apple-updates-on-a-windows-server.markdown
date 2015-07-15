---
layout: post
title: "Caching Apple Downloads on a Windows Server"
date: "2015-07-15"
categories: [work]
---

Yesterday I posted about [caching apple downloads](/2015/07/14/caching-apple-downloads.html) which was great but most of my schools do not have a linux server available nor do they have the spare equipment to setup anything that could be considered reliable enough.

Now we do have plenty of Windows capacity so we need to run squid on a Windows server.

A quick google and yes there is [a version of squid for Windows](http://docs.diladele.com/tutorials/installing_squid_windows/index.html) which I installed to D:\Squid.

The default config is pretty good and is 2 line changes away from being a caching server and then only needs the rules for the Apple download servers.

{% gist 771d6b4bab433900ea75 %}

When I first tried to start squid with this config squid crashed on launch with an error about the cache not having the right folders in it. Running `D:\Squid\bin\squid.exe -z` fixed this.

I then used the same PAC file as before modified to point at this proxy server which I hosted on IIS and then pointed all the iPads too.

Its working the same as the other install as at the end of the day it is the same proxy server program just different OS.

[My original article](/2015/07/14/caching-apple-downloads.html) has more about what we are actually doing with this config.
