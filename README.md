


<!-- PROJECT SHIELDS -->
<!--
*** I'm using markdown "reference style" links for readability.
*** Reference links are enclosed in brackets [ ] instead of parentheses ( ).
*** See the bottom of this document for the declaration of the reference variables
*** for contributors-url, forks-url, etc. This is an optional, concise syntax you may use.
*** https://www.markdownguide.org/basic-syntax/#reference-style-links
-->
[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]


<h3 align="center">trackDL</h3>

  <p align="center">
    A node side project allowing to download your Spotify and Youtube playlists
    <br />
    ·
    <a href="https://github.com/bgrossiord/trackDL/issues">Report Bug</a>
    ·
    <a href="https://github.com/bgrossiord/trackDL/issues">Request Feature</a>
  </p>
</div>



<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
        <li><a href="#configuration">Configuration</a></li>
      </ul>
    </li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## About The Project

This is a fun side project started during summer 2022. It's using youtube and spotify apis to get tracks info from playlists.
Then looking for them on slider.kz.
It download the mp3 only if the title is approximately matching the artist and the track name, if the bitrate is 320kbps or above and if the duration difference is not above 60 seconds.
By default your mp3s will be downloaded in this project repository.
Those criterias and the download repo are configurable see the (<a href="#configuration">configuration section</a>)
A report is generated for each playlists with some alerts and a list of found an not found track search.
When you execute the program again it wont look for already found tracks.

Please surpport artists buy their tracks on [bandcamp](https://bandcamp.com/)

<p align="right">(<a href="#readme-top">back to top</a>)</p>


<!-- GETTING STARTED -->
## Getting Started

### Prerequisites

#### Node & npm
- ##### Node installation on Windows

  Just go on [official Node.js website](https://nodejs.org/) and download the installer.
Also, be sure to have `git` available in your PATH, `npm` might need it (You can find git [here](https://git-scm.com/)).

- ##### Node installation on Ubuntu

  You can install nodejs and npm easily with apt install, just run the following commands.

      $ sudo apt install nodejs
      $ sudo apt install npm

- ##### Other Operating Systems
  You can find more information about the installation on the [official Node.js website](https://nodejs.org/) and the [official NPM website](https://npmjs.org/).

* npm
  ```sh
  npm install npm@latest -g
  ```

### Installation

1. Get a free Spotify API Key follow this guide [spotify guide](https://developer.spotify.com/documentation/general/guides/authorization/app-settings/)
2. Register a youtube api app and get an api key see the api keys section of this guide [youtube guide](https://developers.google.com/youtube/registering_an_application)
3. Clone the repo
   ```sh
   git clone https://github.com/bgrossiord/trackDL.git
   ```
4. Install NPM packages
   ```sh
   npm install
   ```
5. Create & configure your `.env` file
  ```sh
  SPOTIFY_CLIENT_ID = "YOUR_SPOTIFY_CLIENT_ID"
  SPOTIFY_CLIENT_SECRET = "YOUR_SPOTIFY_CLIENT_SECRET"
  YOUTUBE_API_KEY= "YOUR_YOUTUBE_API_KEY"
  SPOTIFY_PLAYLISTS= "SPOTIFY_PLAYLIST1_ID,SPOTIFY_PLAYLIST2_ID,..."
  YOUTUBE_PLAYLISTS= "YOUTUBE_PLAYLIST1_ID,YOUTUBE_PLAYLIST2_ID,..."
   ```
6. Start the search and download 
   ```sh
   npm start
   ```
<br/>Playlist ids can be easily found at the end of the sharing link url ;)

### Configuration
The above parameters are the required ones but you can add other optionnal parameters in the .env file
   ```
  DL_REPO=Download path for tracks
  SIMILARITY_THRESHOLD=value between 0 and 1 used as threshold for rejection of the track based on title comparison see string-similarity npm package comparTwoStrings for more detail
  REJECT_TIME_DIFF=maximum difference in seconds between the track duration and the one found for rejecting the track
  WARNING_TIME_DIFF=maximum difference in seconds between the track duration and the one found for adding the track to warnings in report
  BITRATE_LIMIT=minimum bitrate for rejecting the track (320 by default)
   ```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ROADMAP -->
## Theoretical Roadmap

- [ ] Improve existing 
    - [ ] Make searchTerm more relevant (especially for youtube)
    - [ ] Allow user to reject a track that was found and not download the same in future executions
    - [ ] Add Tests
    - [ ] look into nexe to compile to a exe file https://www.npmjs.com/package/nexe
- [ ] Add a in memory DB
- [ ] Add a graphical interface usin electron
- [ ] Analyse tracks to determine music genre

See the [open issues](https://github.com/bgrossiord/trackDL/issues) for a full list of proposed features (and known issues).

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- CONTRIBUTING -->
## Contributing

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE.txt` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- CONTACT -->
## Contact

Project Link: [https://github.com/bgrossiord/trackDL](https://github.com/bgrossiord/trackDL)

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- ACKNOWLEDGMENTS -->
## Acknowledgments

* [string similarity](https://www.npmjs.com/package/string-similarity)
* [puppeteer](https://github.com/puppeteer/puppeteer)
* [googleapis](https://www.npmjs.com/package/googleapis)
* [spotify-web-api-node](https://www.npmjs.com/package/spotify-web-api-node)


<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[contributors-shield]: https://img.shields.io/github/contributors/bgrossiord/trackDL.svg?style=for-the-badge
[contributors-url]: https://github.com/bgrossiord/trackDL/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/bgrossiord/trackDL.svg?style=for-the-badge
[forks-url]: https://github.com/bgrossiord/trackDL/network/members
[stars-shield]: https://img.shields.io/github/stars/bgrossiord/trackDL.svg?style=for-the-badge
[stars-url]: https://github.com/bgrossiord/trackDL/stargazers
[issues-shield]: https://img.shields.io/github/issues/bgrossiord/trackDL.svg?style=for-the-badge
[issues-url]: https://github.com/bgrossiord/trackDL/issues
[license-shield]: https://img.shields.io/github/license/bgrossiord/trackDL.svg?style=for-the-badge
[license-url]: https://github.com/bgrossiord/trackDL/blob/master/LICENSE.txt
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/benjamin-grossiord-62505176
[product-screenshot]: images/screenshot.png