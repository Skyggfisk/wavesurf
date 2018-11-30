// global song obj used to pass info from upload handler to hidden audio
// I did this because I have no idea how to get the file name from a blob / HTMLAudioElement's src
let song = { title: "", data: "", duration: "" }; // TODO find a better way to pass data between functions
let db;

// setup wavesurfer
const wavesurfer = WaveSurfer.create({
  container: "#waveform",
  waveColor: "brown",
  progressColor: "ghostwhite",
  responsive: true
});
wavesurfer.setVolume(0.5);

window.onload = function() {
  // idb setup
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
    // build playlist
    buildPlaylist();
  };

  // Setup object store
  req.onupgradeneeded = function(e) {
    let db = e.target.result;

    let objectStore = db.createObjectStore("songs", {
      keyPath: "id",
      autoIncrement: true
    });

    // create indexes defining the 'schema'
    objectStore.createIndex("title", "title", { unique: false });
    objectStore.createIndex("duration", "duration", { unique: false });
    objectStore.createIndex("data", "data", { unique: false });

    console.log("Database setup complete");
  };

  // set event handlers
  uploadTrackEventHandler();
  hiddenAudioEventHandler();
  playPauseEventHandler();
  muteEventHandler();
  stopButtonEventHandler();
  volumeEventHandler();
};

// opens a transaction and adds the given track to the "songs" store
function addToIDB(track, cb) {
  let trx = db.transaction(["songs"], "readwrite");
  let objStore = trx.objectStore("songs");
  let req = objStore.add(track);

  // on success print the id key and set return variable to result
  req.onsuccess = function(e) {
    console.log(`Song saved with id: ${e.target.result}`);
    cb(e.target.result); // this should probably have some sort of error handling...
  };

  // log transaction completion
  trx.oncomplete = () => {
    console.log(`Transaction completed. Added ${track.title}.`);
  };

  // log transaction error
  trx.onerror = function(e) {
    console.log("Transaction error.");
    console.log(trx.error);
  };
}

// play the song clicked in the playlist
function playSongFromPlaylist() {
  let trx = db.transaction(["songs"], "readonly");
  let objStore = trx.objectStore("songs");
  let req = objStore.get(parseInt(this.id)); // string =/= int

  req.onsuccess = function() {
    console.log(`got result:\n ${req.result.title}`);
    let track = URL.createObjectURL(req.result.data); // possible memory leak...
    wavesurfer.load(track);

    // change title to the song's name
    document.getElementById("song-title").innerHTML = req.result.title;
  };
}

// build the playlist from idb
function buildPlaylist() {
  let trx = db.transaction(["songs"], "readonly");
  let objStore = trx.objectStore("songs");
  let req = objStore.getAll();

  // on success add songs to the playlist display
  req.onsuccess = function() {
    for (let i = 0; i < req.result.length; i++) {
      let songDiv = document.createElement("div");
      songDiv.className = "song";
      songDiv.id = req.result[i].id;
      songDiv.innerHTML = `<p class="song-name">${
        req.result[i].title
      }</p><p class="song-length">${req.result[i].duration}</p>`;
      songDiv.onclick = playSongFromPlaylist;
      document.getElementById("playlist").appendChild(songDiv); // not the most optimal way...
    }
  };
}

// upload track event handler
function uploadTrackEventHandler() {
  document
    .querySelector("#upload-track")
    .addEventListener("change", function() {
      let songObj = URL.createObjectURL(this.files[0]);

      song.data = this.files[0];
      song.title = this.files[0].name;

      // add file to playlist, refer to hidden audio event handler for more details
      let audio = document.getElementById("hidden-audio");
      audio.src = songObj;
      audio.load();
    });
}

// hidden audio event-handler, used to get song duration
// modified version of https://jsfiddle.net/derickbailey/s4P2v/
function hiddenAudioEventHandler() {
  document
    .getElementById("hidden-audio")
    .addEventListener("canplaythrough", function() {
      let seconds = this.duration;
      let duration = moment.duration(seconds, "seconds");
      let time = "";
      let hours = duration.hours();
      if (hours > 0) {
        time = hours + ":";
      }
      time = time + duration.minutes() + ":" + duration.seconds();
      song.duration = time;

      // add to song store, now that we have all the data and grab the key
      addToIDB(song, function(res) {
        // insert new track in the playlist
        // what am I doing with my life...
        let songDiv = document.createElement("div");
        songDiv.className = "song";
        songDiv.id = res;
        songDiv.innerHTML = `<p class="song-name">${
          song.title
        }</p><p class="song-length">${time}</p>`;
        songDiv.onclick = playSongFromPlaylist;
        document.getElementById("playlist").appendChild(songDiv);
      });
    });
}

// play-pause event handler
function playPauseEventHandler() {
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
}

// mute-unmute event handler
function muteEventHandler() {
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
}

// stop-button event handler
function stopButtonEventHandler() {
  document.querySelector(".stop-button").addEventListener("click", function() {
    wavesurfer.stop();
    if (wavesurfer.isPlaying()) {
      // TODO this doesnt change pause to play when stop button is clicked
      let pp = document.querySelector(".play-pause-button");
      pp.classList.remove("fa-pause");
      pp.classList.add("fa-play");
    }
  });
}

// volume-slider event handler
function volumeEventHandler() {
  document
    .querySelector(".volume-slider")
    .addEventListener("change", function() {
      wavesurfer.setVolume(this.value / 100);
      let voltext = document.querySelector(".volume-text");
      voltext.innerHTML = `${this.value}%`;
    });
}
