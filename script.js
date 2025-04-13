var currentPlaylists = {};
var trackNames = {};
var playingTracks = [];
var currentTrack = 0;
var trackOrder = "reg";

const movebuttonsEnable = '<div id="movebuttons" style="display:block;margin-top:5px"> <button  id="movebutton" style="width:50px;margin:auto" onclick=" this.disabled = true;editPlaylist(`moveup`)">^</button><button id="movebutton" style="width:50px;margin:auto" onclick="this.disabled = true;editPlaylist(`movedown`);">v</button></div>';
const movebuttonsDisable = '<div id="movebuttons" style="display:none;margin-top:5px"> <button  id="movebutton" style="width:50px;margin:auto" onclick=" this.disabled = true;editPlaylist(`moveup`)">^</button><button id="movebutton" style="width:50px;margin:auto" onclick="this.disabled = true;editPlaylist(`movedown`);">v</button></div>';

 function keyWordsearch(){
    gapi.client.setApiKey(atob("QUl6YVN5QjY3cmluVzNPdkU3Nnd0d0U3MnQwWFQ2UVd1RzlIY1Nz"));
    gapi.client.load('youtube', 'v3', function(){
            makeRequest();
    });
}
function makeRequest(){
    document.getElementById("artistinfo").style.display = 'none'
    document.getElementById("add-artist-playlist").style.display = 'none'
    document.getElementById("savestuff").style.display = 'none'
    document.getElementById("resultcontainer").style.display = 'block'
    var q = $('#query').val().toString();
    if (q == "") { q = "@larryhill212official"; }
    var isHandle = q.includes("@")
    if(q.includes("/channel/")) { q = q.split("/channel/")[1] ;}
    if(q.includes("@")) { q = q.split("@")[1]; }
    if(q.includes("/")) { q = q.split("/")[0]; }
    var request = null

    if (!isHandle) { 
       request = gapi.client.youtube.channels.list({
             part: 'snippet',
             id: q
        }); 
    } else {
      request = gapi.client.youtube.channels.list({
            part: 'snippet',
            forHandle: q
      });
    }
    request.execute(function(response)  {                                                                                
            $('#results').empty()
            var srchItems = response.result.items;
            var i = 0                 
            $.each(srchItems, function(index, item){
            vidId = item.id;
            vidTitle = item.snippet.title;  
            vidThumburl =  item.snippet.thumbnails.high.url;                 
            vidThumbimg = '<pre><img id="thumb" src="'+vidThumburl+'" alt="No  Image  Available." style="width:256px;height:256px"></pre>';                   
            var button = '<button id="submitbutton"  onclick="submitArtist(`' + vidTitle + '`, `' + vidId + '`, `' + vidThumburl + '`)">Select</button>'
            $('#results').append('<pre>' + vidThumbimg + "<b><h3>" + vidTitle + '</b></h3>' + button + '</pre>');  
            i++;  
    })  
  })  
}

 function directSearch(){
    gapi.client.setApiKey(atob("QUl6YVN5QjY3cmluVzNPdkU3Nnd0d0U3MnQwWFQ2UVd1RzlIY1Nz"));
    gapi.client.load('youtube', 'v3', function(){
    document.getElementById("artistinfo").style.display = 'none'
    document.getElementById("savestuff").style.display = 'none'
    document.getElementById("add-artist-playlist").style.display = 'none'
    document.getElementById("resultcontainer").style.display = 'block'
    var q = $('#directquery').val().toString();
    if (q == "") { q = "https://www.youtube.com/watch?v=P7tRQD31LI8&list=OLAK5uy_lgN-6H4vW6bD0O9yg3FPdPQdfdK8fXGJw&index=1"; }
    var isVideo= q.includes("watch?v=") && !q.includes("list=")
    if(!q.includes("watch?v") && !q.includes("list=")) { q = q.split("youtu.be/")[1]; isVideo = true; }
    if(q.includes("watch?v")) { q = q.split("watch?v=")[1] ;}
    var idSplit = []
    if(q.includes("list=")) { idSplit  = q.split("list="); q =idSplit[1]; }
    if(q.includes("&")) { q = q.split("&")[0]; }
    if(!isVideo && q.length < 15) {
     q =idSplit[0]; isVideo = true; if(q.includes("&")) { q = q.split("&")[0]; }
     }
    if(q.includes("?")) { q = q.split("?")[0]; }
    var request = null

    if (!isVideo) { 
       request = gapi.client.youtube.playlists.list({
             part: 'snippet',
             id: q
        }); 
    } else {
      request = gapi.client.youtube.videos.list({
            part: 'snippet',
            id: q
      });
    }
    request.execute(function(response)  { 
            var srchItems = response.result.items;
            var i = 0                 
            $.each(srchItems, function(index, item){
            vidId = item.id;
            vidTitle = item.snippet.title;  
            vidThumburl =  item.snippet.thumbnails.medium.url;                 
            vidThumbimg = '<pre><img id="thumb" src="'+vidThumburl+'" alt="No  Image  Available." style="width:315px;height:256px"></pre>';                   
            var button = '<button id="addbutton"  onclick="directlyAdd(`' + vidId + '`, `' + isVideo + '`)">Add to Playlist</button>'
            $('#results').append('<pre>' + vidThumbimg + "<b><h3>" + vidTitle + '</b></h3>' + button + '</pre>');  
            i++;  
    })  
  })
    });
}

function selectAll(playlistId) {
var artistPlaylist = document.getElementById(playlistId).getElementsByTagName("*")
var checked = null;
   for(i = 0; i < artistPlaylist.length; i++) {
       if (artistPlaylist[i].type != "checkbox") {continue;}
       if (checked == null) {checked = !artistPlaylist[i].checked;}
       artistPlaylist[i].checked = checked;
   }
}

function submitArtist(name, id, img) {
  document.getElementById("results").innerHTML = "";
  document.getElementById("resultcontainer").style.display = 'none'
  document.getElementById("search").style.display = "none";
  document.getElementById("artistinfo").style.display = "block";
  document.getElementById("artistthumb").src = img;
  if (name.includes(" - Topic")) { name = name.split(" - Topic")[0]; }
  document.getElementById("artistname").innerHTML = name;

  var request = gapi.client.youtube.playlists.list({
            part: 'snippet, status',
            channelId: id,
            maxResults: 50
    }); 
  var playlists = []
    request.execute(function(response2)  {                                                                                
            //$('#results').empty()
            var srchItems = response2.result.items;
            $.each(srchItems, function(index, item){ 
          if (item.snippet.title != "") {playlists.push(item);}
    })
    updatePlaylists(playlists, true)  
    })
}

function updatePlaylists(playlists, wipe = false) {
     if (wipe) {document.getElementById("artistplaylists").innerHTML = "";}
     for(j = 0; j < playlists.length; j++) {
       var playlist= document.createElement('input')
       playlist.type = "checkbox"
       playlist.id = "playlist" + j + "-" + playlists[j].snippet.title
       playlist.name = playlists[j].id
       playlist.srcUrl = playlists[j].snippet.thumbnails.medium.url
       playlist.kind = playlists[j].kind
       playlist.checked = true;
       var playlistLabel = document.createElement('label')
       playlistLabel.for = playlist.id
       playlistLabel.textContent = playlists[j].snippet.title
       playlistLabel.innerHTML += "<br>";
       document.getElementById("artistplaylists").appendChild(playlist)
       document.getElementById("artistplaylists").appendChild(playlistLabel)
     }
     if(playlists.length < 1) {document.getElementById("artistplaylists").innerHTML = "No public playlists found, keep in mind that Albums/Releases are not detected here. You will have to add them manually.";}
      document.getElementById("add-artist-playlist").style.display = 'block';
      document.getElementById("search").style.display = 'block';
      document.getElementById("currentplaylists").style.display = 'block';
    
  }

function addPlaylist() {
   document.getElementById("artistinfo").style.display = "none";
   document.getElementById("resultcontainer").style.display = 'none'
    document.getElementById("savestuff").style.display = 'block'
    document.getElementById("edit-button").style.display = 'block';
   var artistPlaylist = document.getElementById("artistplaylists").getElementsByTagName("*")
   for(i = 0; i < artistPlaylist.length; i++) {
     if (!artistPlaylist[i].id.includes("playlist") || Object.keys(currentPlaylists).indexOf(artistPlaylist[i].name) >= 0 || artistPlaylist[i].type != "checkbox" || artistPlaylist[i].type == "checkbox" && !artistPlaylist[i].checked) {continue;}
     currentPlaylists[artistPlaylist[i].name] = [];
      var playlist= document.createElement('input')
       playlist.type = "checkbox"
       playlist.id = artistPlaylist[i].id
       playlist.name = artistPlaylist[i].name
       playlist.checked = false;
       playlist.disabled = true
       var playlistLabel = document.createElement('label')
       playlistLabel.for = playlist.id
       playlistLabel.innerHTML += '<img src="' + artistPlaylist[i].srcUrl + '" style="width:48px;height:32px;position:relative;top:10px" border="2.5"></img>'
       playlistLabel.innerHTML += artistPlaylist[i].id.slice(artistPlaylist[i].id.indexOf("-") + 1)
       trackNames[artistPlaylist[i].name] = artistPlaylist[i].id.slice(artistPlaylist[i].id.indexOf("-") + 1);
       if (artistPlaylist[i].kind == "youtube#video") { playlistLabel.innerHTML += " (1)"; }
       playlistLabel.innerHTML += '<br>';
       document.getElementById("playlists").appendChild(playlist)
       document.getElementById("playlists").appendChild(playlistLabel)
       if (artistPlaylist[i].kind == "youtube#video") {
        currentPlaylists[artistPlaylist[i].name] = [artistPlaylist[i].name];
        continue;
       }
       getVideoList(artistPlaylist[i].name, playlistLabel, '<img id="' + playlist.name + 'image" src="' + artistPlaylist[i].srcUrl + '" style="width:48px;height:32px;position:relative;top:10px" border="2.5"></img>' + artistPlaylist[i].id.slice(artistPlaylist[i].id.indexOf("-") + 1), '')
   }
     setTimeout(() => { document.getElementById("play-button").disabled = false }, 1000);
}


function directlyAdd(id, isVideo) {
   document.getElementById("results").innerHTML = "";
  document.getElementById("resultcontainer").style.display = 'none'
  document.getElementById("artistinfo").style.display = "none";

  if (isVideo == "false") {
     var request = gapi.client.youtube.playlists.list({
            part: 'snippet, status',
            id: id,
            maxResults: 1
    }); 
    var playlists = []
    request.execute(function(response2)  {                                                                                
            //$('#results').empty()
            var srchItems = response2.result.items;
            $.each(srchItems, function(index, item){ 
          if (item.snippet.title != "") {playlists.push(item);}
    })
    updatePlaylists(playlists, true)
    addPlaylist()  
    })
  } else {
    var request = gapi.client.youtube.videos.list({
            part: 'snippet, status',
            id: id,
            maxResults: 1
    }); 
    var playlists = []
    request.execute(function(response2)  {                                                                                
            //$('#results').empty()
            var srchItems = response2.result.items;
            $.each(srchItems, function(index, item){ 
          if (item.snippet.title != "") {playlists.push(item);}
    })

    for (let i = 0; i < Object.keys(currentPlaylists).length; i++) {
       if (currentPlaylists[Object.keys(currentPlaylists)[i]].indexOf(playlists[0].id) < 0) { continue; }
       return;
    }
    updatePlaylists(playlists, true)
    addPlaylist()  
    })
  }
}

function getVideoList(playlistId, label, labelText, nextPageToken) {
   var request = gapi.client.youtube.playlistItems.list({
            part: 'snippet, status',
            playlistId: playlistId,
            maxResults: 50,
            pageToken: nextPageToken 
    }); 
   var videos= currentPlaylists[playlistId];
   var totalLength = 0;
   var newPageToken = nextPageToken
    request.execute(function(response2)  {   
            var srchItems = response2.result.items;
            totalLength = response2.result.pageInfo.totalResults
            newPageToken = response2.result.nextPageToken
            $.each(srchItems, function(index, item){ 
          if (item.snippet.title != "" && !item.snippet.title.toLowerCase().includes("deleted video")) {videos.push(item.snippet.resourceId.videoId);trackNames[item.snippet.resourceId.videoId] = item.snippet.title;}  
          })
      currentPlaylists[playlistId] = videos;
  if (newPageToken != nextPageToken && newPageToken != undefined) { getVideoList(playlistId, label, labelText, newPageToken); }
  if (nextPageToken != "") { return; }
  label.innerHTML = labelText + " (" + totalLength + ")<br>"
  label.outerHTML += movebuttonsDisable;
  });
}

function setOrder(order) {
  trackOrder = order
  document.getElementById("order-" + order).disabled = true
  var otherOrder = "reg"
  document.getElementById("play-button").innerHTML = "Start Playlist!! (shuffle)" 
  if(order == "reg") {
   otherOrder = "shuffle"
   document.getElementById("play-button").innerHTML = "Start Playlist!!"
  }
  document.getElementById("order-" + otherOrder ).disabled = false
  
}

function editPlaylist(action) {
  switch(action) {
    case "toggle":
        var enable = document.getElementById("delete-button").style.display == "none";
        document.getElementById("delete-button").style.display = enable ? "block" : "none";
        document.getElementById("select-all").style.display = enable ? "block" : "none";
        var playlist = document.getElementById("playlists").getElementsByTagName("*")
        for (var i = 0; i < playlist.length; i++) {
          if(playlist[i].id == "movebuttons") {playlist[i].style.display = enable ? "block" : "none";}
          if (playlist[i].type != "checkbox") {continue;}
          playlist[i].disabled = !enable;
          playlist[i].checked = false;
        }
        break;
   case "delete":
       var playlist = document.getElementById("playlists").getElementsByTagName("*")
       var playlistData = [];
       var toDelete = [];
        for (var i = 0; i < playlist.length; i++) {
          if (playlist[i].type != "checkbox") {continue;}
          if (playlist[i].checked) {toDelete.push(playlist[i].name);}
          playlistData.push([playlist[i].name, playlist[i].id, playlist[i + 1].innerHTML])
        }
        var currentPlDupe = currentPlaylists;
        currentPlaylists = [];
        document.getElementById("playlists").innerHTML = "";
        for (var i = 0; i < playlistData.length; i++) {
               //currentPlaylists[artistPlaylist[i].name] = [];
             if(toDelete.indexOf(playlistData[i][0]) > -1) {continue;}
             currentPlaylists[playlistData[i][0]] = currentPlDupe[playlistData[i][0]];
             var playlistInst = document.createElement('input')
             playlistInst.type = "checkbox"
             playlistInst.id = playlistData[i][1]
              playlistInst.name = playlistData[i][0]
             playlistInst.checked = false;
             playlistInst.disabled = false;
            var playlistLabel = document.createElement('label')
            playlistLabel.innerHTML = playlistData[i][2]
             
          document.getElementById("playlists").appendChild(playlistInst)
          document.getElementById("playlists").appendChild(playlistLabel)
          playlistLabel.outerHTML += movebuttonsEnable ;
        }
        break;
   case "moveup":
   case "movedown":
       var dir = action == "moveup" ? -1 : 1;
       var playlist = document.getElementById("playlists").getElementsByTagName("*")
       var playlistData = {};
       var toDelete = [];
       var idSwap = [0, 1];
        for (var i = 0; i < playlist.length; i++) {
          if(playlist[i].id == "movebutton" && playlist[i].disabled) {
            playlist[i].disabled = false;
            idSwap = [Math.abs(Object.keys(playlistData).length - 1), Math.abs(Object.keys(playlistData).length + dir - 1)];
            playlist[i].disabled = false;
           }
          if (playlist[i].type != "checkbox") {continue;}
          if (playlist[i].checked) {toDelete.push(playlist[i].name);}
          playlistData[Object.keys(playlistData).length] = [playlist[i].name, playlist[i].id, playlist[i + 1].innerHTML]
        }
        var currentPlDupe = currentPlaylists;
        currentPlaylists = [];
        document.getElementById("playlists").innerHTML = "";
        if(idSwap[0] >= Object.keys(playlistData).length) {idSwap[0] -= 2;}
        if(idSwap[1] >= Object.keys(playlistData).length) {idSwap[1] -= 2;}
        for (var i = 0; i < Object.keys(playlistData).length; i++) {
               //currentPlaylists[artistPlaylist[i].name] = [];
             var index = i
             if(idSwap[0] == index) {index = idSwap[1]}
             else if(idSwap[1] == index) {index = idSwap[0]}
             currentPlaylists[playlistData[index][0]] = currentPlDupe[playlistData[index][0]];
             var playlistInst = document.createElement('input')
             playlistInst.type = "checkbox"
             playlistInst.id = playlistData[index][1]
              playlistInst.name = playlistData[index][0]
             playlistInst.checked = false;
             playlistInst.disabled = false;
            var playlistLabel = document.createElement('label')
            playlistLabel.innerHTML = playlistData[index][2]
          document.getElementById("playlists").appendChild(playlistInst)
          document.getElementById("playlists").appendChild(playlistLabel)
          playlistLabel.outerHTML += movebuttonsEnable ;
        }
       break;
  }
  if(Object.keys(currentPlaylists).length > 0) {return;}
  if (document.getElementById("delete-button").style.display != "none") { editPlaylist("toggle"); }
  document.getElementById("play-button").disabled = true;
}

function startPlaylist() {
   if (Object.keys(currentPlaylists).length < 1 || currentPlaylists[Object.keys(currentPlaylists)[0]].length < 1) {return;}
   playingTracks = [];
   currentTrack = 0;
   document.getElementById("videoplay").style.display = "block";
   for(let i = 0; i < Object.keys(currentPlaylists).length; i++) {
     for(let j = 0; j < currentPlaylists[Object.keys(currentPlaylists)[i]].length; j++) { 
 playingTracks.push(currentPlaylists[Object.keys(currentPlaylists)[i]][j]); }
   }
    if(trackOrder == "shuffle") {shuffle(playingTracks)}
    updatePlaylist()
    
    getTracklist(0);

}


async function getTracklist(start) {
    document.getElementById("tracklistTable").innerHTML = `<tr><th>Track No.</th><th style="width:250px">Track Name</th><th>Playlist</th></tr>`;
    var limit = playingTracks.length;
    if (playingTracks.length - start > 100) { limit = 100 + start; }
    for (let i = 0 + start; i < limit; i++) { 
     document.getElementById("tracklistTable").innerHTML += `<tr><td>` + (i + 1) + `.</td><td><button style="width:250px" id="skip-track" onclick="skipPlaylist(` + i + `)">`  + trackNames[playingTracks[i]] + "</button></td><td>" + getVideoPlaylist(playingTracks[i]) + "</td></tr>"
    }
    document.getElementById("tracklist-prevpage").style.display = (start > 0) ? "block" : "none";
    document.getElementById("tracklist-prevpage").onclick = function() { getTracklist(start - 100);  }
    document.getElementById("tracklist-nextpage").style.display = (limit < playingTracks.length) ? "block" : "none";
    document.getElementById("tracklist-nextpage").onclick = function() { getTracklist(limit);  }
}

function showTracklist() {
document.getElementById("tracklist-prevpage").style.visibility = (document.getElementById("tracklist").style.display == "none") ? "visible" : "hidden";
document.getElementById("tracklist-nextpage").style.visibility = (document.getElementById("tracklist").style.display == "none") ? "visible" : "hidden";
document.getElementById("tracklist").style.display = (document.getElementById("tracklist").style.display == "none") ? "block" : "none";
}


function getVideoPlaylist(id) {
  var playlist = "none";
  var playlistId = "";
  for (i = 0; i < Object.keys(currentPlaylists).length; i++) {
    
    if (currentPlaylists[Object.keys(currentPlaylists)[i]].indexOf(id) < 0) {continue;}
    playlist = trackNames[Object.keys(currentPlaylists)[i]];
    playlistId = Object.keys(currentPlaylists)[i]
    break;
  }
  var src = document.getElementById(playlistId + 'image').src
  var img = '<img alt="' + playlist + '" style="width:100px;height:75" src="' + src + '"></img>'
  return img;
}


function updatePlaylist() {
   var source = "https://www.youtube.com/embed/" + playingTracks[currentTrack] + "?playlist="
   for (let i = 0 + currentTrack;i < 50 + currentTrack && i < playingTracks.length; i++) { source += playingTracks[i] + "," }
   source += "&loop=1&enablejsapi=1"
   document.getElementById("videoframe").src = source; 
   document.title = trackNames[playingTracks[currentTrack]] + " (" + (currentTrack + 1) + ") - the eestrecord"
   document.getElementById("current-track").innerHTML = "Current Track:<br>" + trackNames[playingTracks[currentTrack]] + " (" + (currentTrack + 1) + ")"
    var prev = currentTrack - 1;
    if (prev < 0) {prev = playingTracks.length - 1;}
    document.getElementById("prev-track").innerHTML = '<button id="skip-track" style="max-width:150px" onclick="skipPlaylist('+prev+')">Prev. Track:<br>' + trackNames[playingTracks[prev]] + " (" + (prev + 1) + ")"  + '</button>'     
    var next = currentTrack + 1;
    if (next >= playingTracks.length) {next = 0;}
    document.getElementById("next-track").innerHTML = '<button id="skip-track" style="max-width:150px" onclick=" skipPlaylist('+next+')">Next Track:<br>' + trackNames[playingTracks[next]] + " (" + (next + 1) + ")" + '</button>' 

    player = null
    console.log("setup")
    setTimeout(() => {
      console.log("loaded")
      player = new YT.Player('videoframe'); 
      document.getElementById("videoframe").src = source + "&autoplay=1"; 
      player.addEventListener("onStateChange", "onYouTubePlayerStateChange");
    }, 300);
}

function skipPlaylist(direction) {
  currentTrack = direction;
  if (currentTrack < 0) {currentTrack = playingTracks.length - 1;}
  if (currentTrack >= playingTracks.length) {currentTrack = 0;}
  updatePlaylist();
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

var tag = document.createElement('script');

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

//Holds a reference to the YouTube player
var player = null;



function onYouTubePlayerStateChange(event) {
    console.log(event.data);
    if(event.data > -1) {return;}
    var url = player.playerInfo.videoUrl;
    var id = url.split("&v=")[1];
    currentTrack = playingTracks.indexOf(id);
    if(currentTrack >= playingTracks.length - 1) {currentTrack = 0;}
    updatePlaylist();
}

function savePlaylist() {
  var q = $('#savequery').val().toString();
  if (q == "") { q = "Your Playlist"; }
  var keys = Object.keys(currentPlaylists)
  if(keys.length < 1) {return;}
  var trackString = ""
  var playlist = document.getElementById("playlists").getElementsByTagName("*")
 var playlistData = [];
  for (var i = 0; i < playlist.length; i++) {
   if (playlist[i].type != "checkbox") {continue;}
   playlistData.push(playlist[i + 1].innerHTML)
 }
  for (let i = 0; i < keys.length; i++) {
    trackString += keys[i] + "^" + playlistData[i] + "^"
    trackString += currentPlaylists[keys[i]].join(";") + "^"
  }
   var trackNamesString = "";
  var nameKeys = Object.keys(trackNames)
  for (let i = 0; i < nameKeys.length; i++) {
    trackNamesString += nameKeys[i] + "<" + trackNames[nameKeys[i]] + "<"
  }
  var allSavedlists = localStorage.getItem("savedLists");
  if (allSavedlists == null) { allSavedlists = q; }
  else if (!allSavedlists.includes(q)) {
    allSavedlists += ";" + q
  }
  document.getElementById("savequery").value = "";
  localStorage.setItem("nameKeys" + q, trackNamesString );
  localStorage.setItem("savedLists", allSavedlists);
  localStorage.setItem(q, trackString);
  refreshSavedLists()
}

refreshSavedLists();

function refreshSavedLists() {
  document.getElementById("saveselect").innerHTML = "";
  var savedLists = localStorage.getItem("savedLists")
  if(savedLists== null) {return;}
  var lists = savedLists.split(";")
  for (var i = 0; i < lists.length; i++) {
    document.getElementById("saveselect").innerHTML += '<option value="' + lists[i] +'">' + lists[i] + '</option>'
  }
}

function loadPlaylist() {
  var q = $('#saveselect').val().toString();
  var trackString = localStorage.getItem(q);
  if (trackString == null) {return;}
  var keys = trackString.split("^")
  var html = []

  var nameKeys = localStorage.getItem("nameKeys" + q).split("<");
  if(nameKeys == null) {return;}
  for (var i = 0; i < nameKeys.length; i+=2) {
     trackNames[nameKeys[i]] = nameKeys[i + 1];
  }

  currentPlaylists = {};
  for (var i = 0;i < keys.length; i+=3) {
     if (keys[i] == "" || keys[i + 1] == "undefined") {continue;}
     html.push([keys[i], keys[i + 1]])
     currentPlaylists[keys[i]] = keys[i + 2].split(";")
  }

  document.getElementById("playlistname").innerHTML = q;
   document.getElementById("playlists").innerHTML = "";
  document.getElementById("savequery").value = q;
  document.getElementById("edit-button").style.display = 'block';
  document.getElementById("play-button").disabled = false
  for (var i = 0; i < html.length; i++) {
     var playlistInst = document.createElement('input')
     playlistInst.type = "checkbox"
     playlistInst.id = html[i][0]
     playlistInst.name = html[i][0]
     playlistInst.checked = false;
     playlistInst.disabled = true;
     var playlistLabel = document.createElement('label')
            if(!html[i][1].includes("<img id=")) { 
                html[i][1] = html[i][1].split("<img ").join('<img id="' + playlistInst.name  +'image"') 
             }
            playlistLabel.innerHTML = html[i][1]
             
          document.getElementById("playlists").appendChild(playlistInst)
          document.getElementById("playlists").appendChild(playlistLabel)
          playlistLabel.outerHTML += movebuttonsDisable;
        }


}
