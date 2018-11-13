// setup
const wavesurfer = WaveSurfer.create({
  container: "#waveform",
  waveColor: "violet",
  progressColor: "purple"
});

// autoload test file
wavesurfer.load("audio/Vivaldi-The_Four_Seasons/01_-_Spring_Mvt_1_Allegro.mp3");

// upload track to play
document.querySelector("#upload-track").addEventListener("change", function() {
  let trackUrl = URL.createObjectURL(this.files[0]);
  console.log(trackUrl);
  wavesurfer.load(trackUrl);
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

document.querySelector(".stop-button").addEventListener("click", function() {
  wavesurfer.stop();
  if (wavesurfer.isPlaying()) {
    let pp = document.querySelector(".play-pause-button");
    pp.classList.remove("fa-pause");
    pp.classList.add("fa-play");
  }
});
