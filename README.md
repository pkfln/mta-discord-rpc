[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]

<!-- PROJECT LOGO -->
<br />
<p align="center">
  <a href="https://github.com/pkfln/mta-discord-rpc">
    <img src="assets/mtasa.png" alt="Logo" width="128" height="128">
  </a>

  <h3 align="center">MTA Discord Rich Presence</h3>

  <p align="center">
    External Rich Presence Manager for Multi Theft Auto: San Andreas.
    <br />
    <br />
    <a href="https://github.com/pkfln/mta-discord-rpc/issues">Report an issue</a>
  </p>
</p>



<!-- TABLE OF CONTENTS -->
## Table of Contents

- [Table of Contents](#table-of-contents)
- [Installation](#installation)
  - [Testing](#testing)
  - [Installing](#installing)
  - [Updating](#updating)
- [Why?](#why)
- [Adding server assets](#adding-server-assets)
- [Troubleshooting](#troubleshooting)
  - [Discord shows "MTA: San Andreas" as my current game](#discord-shows-mta-san-andreas-as-my-current-game)
  - [Rich presence is not showing MTA anymore, even though I restarted MTA multiple times already](#rich-presence-is-not-showing-mta-anymore-even-though-i-restarted-mta-multiple-times-already)
  - [The status gets set to "Idle", even though I'm still connected to the server](#the-status-gets-set-to-idle-even-though-im-still-connected-to-the-server)
- [Contributing](#contributing)
- [Known bugs](#known-bugs)
- [License](#license)



<!-- INSTALLATION -->
## Installation

### Testing

First make sure it works for you before you install it. **It's recommended to be on the latest Windows 10 Build (I haven't tested it on any other OS or earlier versions of Windows).**

1. Close your MTA:SA instance if you have it running.
2. Download the newest release from the <a href="https://github.com/pkfln/mta-discord-rpc/releases">releases page</a> (mta-discord-rpc.exe).
3. Open the folder containing the downloaded executable.
4. Execute the file by double-clicking it.
5. If you're not getting any errors, try to open MTA:SA.
6. Check your Discord Rich Presence status and see, if it's setting your status.
7. If everything works so far, you're ready to install it. If you do get some errors, try to fix them or open a new issue. Also don't forget to check the [Troubleshooting](#troubleshooting) section.

### Installing

1. Press <kbd>Win</kbd> + <kbd>R</kbd>, you should then see the Run window.
2. Type in `shell:startup` and press <kbd>Enter</kbd>.
3. Either create a shortcut to the executable you just downloaded or move it into this new folder window.
4. Next time you login to your Windows, mta-discord-rpc will automatically start.

To uninstall it / disable it from the Windows startup, simply delete the downloaded executable or the shortcut you created.

### Updating
To update, close MTA:SA and mta-discord-rpc.exe (through the Task Manager). Then download the latest build from the <a href="https://github.com/pkfln/mta-discord-rpc/releases">releases page</a> and repeat the installation process.



<!-- WHY -->
## Why?

Since you can't really make clientsided modifications for MTA (or at least not that I know of), I decided to do it this way, so that it doesn't interfer with the actual process and is fully external. MTA had rich presence support in the past, but it got removed for some reason.



<!-- ADDING SERVER ASSETS -->
## Adding server assets

If you want your server logo to be shown on the rich presence instead of the default MTA logo, create a pull request with your server logo.
1. Fork this project
2. Create your branch (e.g. asset/my-server): `git checkout -b asset/my-server`
3. Add your server logo in the assets directory. Make sure your logo has a background and a minimum size of 512x512 (1024x1024 recommended). Only PNGs are currently supported. Name your file in the following format: `[ip]_[port].png` (no hostnames).
4. Stage your file: `git add assets/127.0.0.1_22003.png`
4. Commit your changes: `git commit -m 'Add server logo for Localhost'`
5. Push your new changes: `git push origin asset/my-server`
6. Open a Pull Request



<!-- TROUBLESHOOTING -->
## Troubleshooting

### Discord shows "MTA: San Andreas" as my current game

You probably added it manually to your Game Activity detection list. Remove it from there in the Discord settings.


### Rich presence is not showing MTA anymore, even though I restarted MTA multiple times already

Logout from Windows & log back in, that should fix it.



### The status gets set to "Idle", even though I'm still connected to the server

This often happens on servers which change your MTA:SA nickname (for instance, when you login to a server with a custom account system). Make sure the nickname you've set in the MTA:SA settings is equal to the one you have on the server you're connected to.
"Supernicks" (the ones you set on a specific server to be able to use multiple color codes in your name) shouldn't matter, since they usually don't change your real MTA:SA nickname.
If this isn't reproducible, it probably happened while the server was lagging / your ping to the server was very high for a longer period.



<!-- CONTRIBUTING -->
## Contributing

Coming soon.



<!-- KNOWN BUGS -->
## Known bugs

- Having multiple Discord instances open won't display the rich presence



<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE` for more information.






<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[contributors-shield]: https://img.shields.io/github/contributors/pkfln/mta-discord-rpc.svg?style=flat-square
[contributors-url]: https://github.com/pkfln/mta-discord-rpc/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/pkfln/mta-discord-rpc.svg?style=flat-square
[forks-url]: https://github.com/pkfln/mta-discord-rpc/network/members
[stars-shield]: https://img.shields.io/github/stars/pkfln/mta-discord-rpc.svg?style=flat-square
[stars-url]: https://github.com/pkfln/mta-discord-rpc/stargazers
[issues-shield]: https://img.shields.io/github/issues/pkfln/mta-discord-rpc.svg?style=flat-square
[issues-url]: https://github.com/pkfln/mta-discord-rpc/issues
[license-shield]: https://img.shields.io/github/license/pkfln/mta-discord-rpc.svg?style=flat-square
[license-url]: https://github.com/pkfln/mta-discord-rpc/blob/master/LICENSE
