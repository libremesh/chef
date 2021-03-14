WARNING: this project is no longer mainted. Please checkout it's successors:

* https://gitlab.com/openwrt/web/firmware-selector-openwrt-org
* https://github.com/sudhanshu16/openwrt-firmware-selector

The backend to create OpenWrt images on demand still exists, please see it's own repo and file issues there:

* https://github.com/aparcar/asu/

At the point of writing the Chef domain points to a *OpenWrt Firmware Wizard* web interface which allows the same functions as this (outdated) chef code.

Happy cooking.

# Chef Online Imagebuilder

![screenshot chef](https://user-images.githubusercontent.com/16000931/54073419-21681c00-4287-11e9-8592-3648431f1b41.png)

Chef uses the `API` of the [image server](https://github.com/aparcar/attendedsysupgrade-server) here.

## Features

* Easily search for devices
* Modify preinstalled packages
* Add custom startup script run on first boot
* Test various distributions, versions
* Available in [various](https://github.com/libremesh/chef/tree/master/i18n) languages

## Running instances

Currently offline due to lack of JavaScript devs, please contact me for collabiration.

* ~~[chef.libremesh.org](https://chef.libremesh.org)~~
* ~~[betachef.libremesh.org](https://betachef.libremesh.org)~~

* ~~[asu.segfault.gq](https://asu.segfault.gq/) **Development OpenWrt/snapshots only**~~

## Installation

* Clone the repository at tell your web server to load `chef.html` as index.
* Edit the `setttings.js.example` file and rename it to `settings.js`
* Edit or remove the `banner.html`

## Donations

We are now a member of [open collective](http://opencollective.com/libremesh), please consider a small donation!
