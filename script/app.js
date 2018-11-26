// setup wavesurfer
const wavesurfer = WaveSurfer.create({
  container: "#waveform",
  waveColor: "darkorchid",
  progressColor: "purple",
  responsive: true
});

// autoload test file and set volume to 50%
wavesurfer.load("audio/Vivaldi-The_Four_Seasons/01_-_Spring_Mvt_1_Allegro.mp3");
wavesurfer.setVolume(0.5);

// upload track to play
document.querySelector("#upload-track").addEventListener("change", function() {
  let trackUrl = URL.createObjectURL(this.files[0]);
  console.log(trackUrl);
  wavesurfer.load(trackUrl);

  // create and add new song element to the playlist
  // let song = document.createElement("div");
  // song.classList.add("song");
  // let songname = document.createElement("p");
  // songname.classList.add("song-name");
  // let songlength = document.createElement("p");
  // songlength.classList.add("song-length");

  // songname.innerHTML("en sang");
  // songlength.innerHTML("0:00");

  let songhtml = "";
  songhtml +=
    "<div class='song'><p class='song-name>en sang</p><p class='song-length'>0:00</p></div>";

  let playlist = document.getElementsByClassName("playlist");

  // document.querySelector(".playlist").insertAdjacentHTML(
  //   beforeend,
  //   `<div class="song">
  //       <p class="song-name">${trackUrl}</p>
  //       <p class="song-length">0:00</p>
  //     </div>`
  // );
});

// play-pause event handler
document
  .querySelector(".play-pause-button")
  .addEventListener("click", function() {
    if (!wavesurfer.isPlaying()) {
      this.classList.remove("fa-play");
      this.classList.add("fa-pause");
    } else {
      this.classList.remove("fa-pause");
      this.classList.add("fa-play");
    }
    wavesurfer.playPause();
  });

// mute-unmute event handler
document
  .querySelector(".mute-unmute-button")
  .addEventListener("click", function() {
    if (!wavesurfer.getMute()) {
      this.classList.remove("fa-volume-down");
      this.classList.add("fa-volume-mute");
    } else {
      this.classList.remove("fa-volume-mute");
      this.classList.add("fa-volume-down");
    }
    wavesurfer.toggleMute();
  });

// stop-button event handler
document.querySelector(".stop-button").addEventListener("click", function() {
  wavesurfer.stop();
  if (wavesurfer.isPlaying()) {
    let pp = document.querySelector(".play-pause-button");
    pp.classList.remove("fa-pause");
    pp.classList.add("fa-play");
  }
});

// volume-slider event handler
document.querySelector(".volume-slider").addEventListener("change", function() {
  wavesurfer.setVolume(this.value / 100);
  let voltext = document.querySelector(".volume-text");
  voltext.innerHTML = `${this.value}%`;
});
