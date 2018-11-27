// setup wavesurfer
const wavesurfer = WaveSurfer.create({
  container: "#waveform",
  waveColor: "darkorchid",
  progressColor: "purple",
  responsive: true
});

// global used to pass song name from upload handler to hidden audio
// I did this because I have no idea how to get the file name from a blob / HTMLAudioElement's src
var songName = "";

// autoload test file and set volume to 50%
wavesurfer.load("audio/Vivaldi-The_Four_Seasons/01_-_Spring_Mvt_1_Allegro.mp3");
wavesurfer.setVolume(0.5);

// upload track to play and add to playlist
document.querySelector("#upload-track").addEventListener("change", function() {
  let trackUrl = URL.createObjectURL(this.files[0]);
  wavesurfer.load(trackUrl);

  // get file duration, refer to event handler for more details
  let audio = document.getElementById("hidden-audio");
  audio.src = trackUrl;
  audio.load();

  // Avert your eyes!
  songName = this.files[0].name;
});

// hidden audio event-handler, used to get song duration
// modified version of https://jsfiddle.net/derickbailey/s4P2v/
document
  .getElementById("hidden-audio")
  .addEventListener("canplaythrough", function() {
    let seconds = this.duration;
    let duration = moment.duration(seconds, "seconds");

    var time = "";
    let hours = duration.hours();
    if (hours > 0) {
      time = hours + ":";
    }

    time = time + duration.minutes() + ":" + duration.seconds();

    console.log("LOADED FILE: " + this.src + "\n DURATION: " + time);

    // insert new track in the playlist
    document.getElementById("playlist").insertAdjacentHTML(
      "beforeend",
      `<div class="song">
        <p class="song-name">${songName}</p>
        <p class="song-length">${time}</p>
      </div>`
    );
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
