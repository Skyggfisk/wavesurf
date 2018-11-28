// global used to pass song name from upload handler to hidden audio
// I did this because I have no idea how to get the file name from a blob / HTMLAudioElement's src
let songName;
let db;

window.onload = function() {
  // setup wavesurfer
  const wavesurfer = WaveSurfer.create({
    container: "#waveform",
    waveColor: "darkorchid",
    progressColor: "purple",
    responsive: true
  });

  // IDB functionality
  // https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Client-side_web_APIs/Client-side_storage
  // request to open db called playlist v1.0
  let req = window.indexedDB.open("playlist", 1);

  // print to console in case of error
  req.onerror = function() {
    console.log("Failed to open database.");
  };

  // set db object in case of success
  req.onsuccess = function() {
    console.log("Opened database successfully.");
    db = req.result;
  };

  // Setup object store
  req.onupgradeneeded = function(e) {
    let db = e.target.result;

    db.createObjectStore("songs", {
      keyPath: "id",
      autoIncrement: true
    });

    // Define what data items the objectStore will contain
    // objectStore.createIndex("title", "title", { unique: false });
    // objectStore.createIndex("duration", "duration", { unique: false });
    // objectStore.createIndex("data");

    console.log("Database setup complete");
  };

  // upload track to play and add to playlist
  document
    .querySelector("#upload-track")
    .addEventListener("change", function() {
      let song = URL.createObjectURL(this.files[0]);
      wavesurfer.load(song);

      // let testObj = { title: "hello", body: "this is a body" };
      console.log(song);
      let trx = db.transaction(["songs"], "readwrite");
      let objStore = trx.objectStore("songs");
      var request = objStore.add(this.files[0]);
      request.onsuccess = function() {
        console.log("something happened");
      };

      trx.oncomplete = function() {
        console.log("Transaction completed. Added something.");
      };

      trx.onerror = function() {
        console.log("Transaction error.");
      };

      // add file to playlist, refer to event handler for more details
      let audio = document.getElementById("hidden-audio");
      audio.src = trackUrl;
      audio.load();

      // Avert your eyes!
      songName = this.files[0].name;
    });
};

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

// document.querySelector(".song-name");

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
    // TODO this doesnt change pause to play when stop button is clicked
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
