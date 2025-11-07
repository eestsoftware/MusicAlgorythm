var currentPlaylists = {};
var trackNames = {};
var playingTracks = [];
var pTracksOrder = [];
var currentTrack = 0;
var tracklistPageData = [0, "", []]; //page, query, querydata
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
    console.log(window.runningAdsAllowed);
    document.getElementById("artistinfo").style.display = 'none'
    document.getElementById("add-artist-playlist").style.display = 'none'
    document.getElementById("savestuff").style.display = 'none'
    document.getElementById("exportstuff").style.display= 'none'
    document.getElementById("resultcontainer").style.display = 'block'
    var q = $('#query').val().toString();

    if (q == "") { q = "@larryhill212official"; }
    
    var isChannelLink = q.includes("/channel/")
    var isHandle = q.includes("@")
    var isVideo= q.includes("watch?v=") && !q.includes("list=")
    var isPlaylist = q.includes("list=")

    if(!isVideo && !isPlaylist && q.includes("youtu.be")) { q = q.split("youtu.be/")[1]; isVideo = true; isPlaylist = false; }
    if(q.includes("watch?v")) { q = q.split("watch?v=")[1] ;}
    var idSplit = []

    if (isPlaylist && q.includes("&v=")) {q = q.split("&v=")[1]; isVideo = true; isPlaylist = false;}
    if(q.includes("list=")) { idSplit  = q.split("list="); q =idSplit[1]; }

    if(q.includes("/channel/") && isChannelLink) { q = q.split("/channel/")[1] ;}
    if(q.includes("@") && isHandle) { q = q.split("@")[1]; }
    if(q.includes("/") && !isVideo && !isPlaylist) { q = q.split("/")[0]; }
    if(q.includes("&")) { q = q.split("&")[0]; }

    if(isPlaylist && q.length < 15) {
     q =idSplit[0]; isVideo = true; if(q.includes("&")) { q = q.split("&")[0]; }
     }
    if(q.includes("?")) { q = q.split("?")[0]; }
    

    

    var request = null
    if (isVideo){
      request = gapi.client.youtube.videos.list({
            part: 'snippet',
            id: q
      });
    } else if (isPlaylist) {
       request = gapi.client.youtube.playlists.list({
             part: 'snippet',
             id: q
        }); 
    } else if (isChannelLink) { 
       request = gapi.client.youtube.channels.list({
             part: 'snippet',
             id: q
        }); 
    } else if(isHandle) {
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
            var button = ''
            if (isHandle || isChannelLink) { 
            vidThumburl =  item.snippet.thumbnails.high.url;
            vidThumbimg = '<pre><img id="thumb" src="'+vidThumburl+'" alt="No  Image  Available." style="width:256px;height:256px"></pre>';                   
            button = '<button id="submitbutton"  onclick="submitArtist(`' + vidTitle + '`, `' + vidId + '`, `' + vidThumburl + '`)">Select</button>'
            } else { 
            vidThumburl =  item.snippet.thumbnails.medium.url;
            vidThumbimg = '<pre><img id="thumb" src="'+vidThumburl+'" alt="No  Image  Available." style="width:315px;height:256px"></pre>';                   
            button = '<button id="addbutton"  onclick="directlyAdd(`' + vidId + '`, `' + isVideo + '`)">Add to Playlist</button>'
            }
            $('#results').append('<pre>' + vidThumbimg + "<b><h3>" + vidTitle + '</b></h3>' + button + '</pre>');  
            i++;  
    })  
  })  
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
    document.getElementById("exportstuff").style.display= 'block'
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
          if (item.snippet.title != "" && item.snippet.title.toLowerCase() != "deleted video" && item.snippet.title.toLowerCase() != "private video") {videos.push(item.snippet.resourceId.videoId);trackNames[item.snippet.resourceId.videoId] = item.snippet.title;}  
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

    playingTracks.push(playingTracks[playingTracks.length - 1])
    pTracksOrder = [...playingTracks];
    updatePlaylist()
    
    getTracklist(0);
    
    document.getElementById("sessionselect").value = "Current Session";
    document.getElementById("sessionquery").value = "Current Session";
    var playlistName = document.getElementById("playlistname").innerHTML;
    var hasSession = localStorage.getItem(playlistName + ";Current Session");
    var allSessions = localStorage.getItem(playlistName + "/allsessions");
    if (allSessions == null) {allSessions = "Current Session"}
    if (hasSession != null) {
       refreshSavedSessions(playlistName);
       if (localStorage.getItem(playlistName + ";Previous Session") == playingTracks.join(";")) {return;}
       if(!allSessions.includes("Previous Session")) {allSessions += ";Previous Session";}
       localStorage.setItem(playlistName + ";Previous Session", hasSession);
    }
    localStorage.setItem(playlistName + ";Current Session", playingTracks.join(";"));
    localStorage.setItem(playlistName + "/allsessions", allSessions);
    
    refreshSavedSessions(playlistName);
    document.getElementById("sessionselect").value = "Current Session";
    document.getElementById("sessionquery").value = "Current Session";

}


async function getTracklist(start, allTracks = pTracksOrder, lastQuery = "") {
    document.getElementById("tracklistTable").innerHTML = `<tr><th>Search Track Name</th><th style="width:250px"> <input id="searchtrackquery" style="width:250px;height:35px" value='' placeholder='Sorcererz' type="text"/></th><th><button id="search-tracks"    onclick="searchTrack()">Search</button></label></th><th></th></tr>`;
     if(lastQuery != "") {document.getElementById("tracklistTable").innerHTML += `<tr><th></th><th style="width:250px">Results for "` + lastQuery + `"</th><th></th><th></th></tr>`;}
     else { tracklistPageData[1] = "" }
     document.getElementById("tracklistTable").innerHTML += `<tr><th>Track No.</th><th style="width:250px">Track Name</th><th>Playlist</th><th>Remove</th></tr>`;
    tracklistPageData[0] = start;
    var limit = allTracks.length;
    if (allTracks.length - start > 100) { limit = 100 + start; }
    var createdIds = [];
    for (let i = 0 + start; i < limit; i++) {
     if (createdIds.indexOf(pTracksOrder.indexOf(allTracks[i])) > -1) { continue; }
     createdIds.push(pTracksOrder.indexOf(allTracks[i]));
     document.getElementById("tracklistTable").innerHTML += `<tr><td>` + (pTracksOrder.indexOf(allTracks[i]) + 1) + `.</td><td><button style="width:250px" id="skip-track" onclick="skipPlaylist(` + pTracksOrder.indexOf(allTracks[i]) + `, false)">`  + trackNames[allTracks [i]] + "</button></td><td>" + getVideoPlaylist(allTracks [i]) + `</td><td><button class="remove-track" id="remove-track-`+i+`" onclick="removeTrack('` + allTracks[i] + `')"> X </button></td></tr>`
    }
    document.getElementById("tracklist-prevpage").style.visibility = (lastQuery == "" && document.getElementById("tracklist").style.display == "block") ? "visible" : "hidden";
    document.getElementById("tracklist-prevpage").onclick = function() { 
       var prev = start - 100;
       if (start <= 0) {prev = Math.floor(allTracks.length / 100) * 100;}
       getTracklist(prev);  
   }
    document.getElementById("tracklist-nextpage").style.visibility = (lastQuery == "" && document.getElementById("tracklist").style.display == "block") ? "visible" : "hidden";
    document.getElementById("tracklist-nextpage").onclick = function() { 
     var next = limit;
     if (limit >= allTracks.length) {next = 0;}
     getTracklist(next);  
    }
}

function showTracklist() {
document.getElementById("tracklist-prevpage").style.visibility = (document.getElementById("tracklist").style.display == "none") ? "visible" : "hidden";
document.getElementById("tracklist-nextpage").style.visibility = (document.getElementById("tracklist").style.display == "none") ? "visible" : "hidden";
document.getElementById("tracklist").style.display = (document.getElementById("tracklist").style.display == "none") ? "block" : "none";
 if ( document.getElementById("tracklist").style.display == "block" ) { 
   var page = Math.floor(currentTrack / 100) * 100;
   getTracklist(page );
 }
}

function searchTrack() {
  var q = $('#searchtrackquery').val().toString().toLowerCase();
  if (q == "") {
    getTracklist(tracklistPageData[0], playingTracks);
    return;
  }
  var foundTracks = []
  for (let i = 0; i < playingTracks.length; i++) {
    if (!(trackNames[playingTracks[i]].toLowerCase()).includes(q)) {continue;}
    foundTracks.push(playingTracks[i]);
  }
  tracklistPageData = [tracklistPageData[0], q, foundTracks]
  getTracklist(0, foundTracks, q); 
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
   var source = "https://www.youtube.com/embed/" + pTracksOrder[currentTrack] + "?playlist="
   for (let i = 0 + currentTrack;i < 25 + currentTrack && i < pTracksOrder.length; i++) { source += pTracksOrder[i] + "," }
   source += "&enablejsapi=1"
   document.getElementById("videoframe").src = source; 
   document.title = trackNames[pTracksOrder[currentTrack]] + " (" + (currentTrack + 1) + ") - the eestrecord"
   document.getElementById("current-track").innerHTML = "Current Track:<br>" + trackNames[pTracksOrder[currentTrack]] + " (" + (currentTrack + 1) + ")"
    var prev = currentTrack - 1;
    if (prev < 0) {prev = pTracksOrder.length - 2;}
    document.getElementById("prev-track").innerHTML = '<button id="skip-track-" style="max-width:150px" onclick="skipPlaylist('+prev+')">Prev. Track:<br>' + trackNames[pTracksOrder[prev]] + " (" + (prev + 1) + ")"  + '</button>'     
    var next = currentTrack + 1;
    if (next >= pTracksOrder.length - 1) {next = 0;}

    document.getElementById("next-track").innerHTML = '<button id="skip-track" style="max-width:150px" onclick=" skipPlaylist('+next+')">Next Track:<br>' + trackNames[pTracksOrder[next]] + " (" + (next + 1) + ")" + '</button>' 

    player = null
    console.log("setup")
    setTimeout(() => {
      console.log("loaded")
      player = new YT.Player('videoframe'); 
      document.getElementById("videoframe").src = source + "&autoplay=1"; 
      player.addEventListener("onStateChange", "onYouTubePlayerStateChange");
    }, 300);
}

function skipPlaylist(direction, absolute = false) {
  var trackTo = playingTracks[direction];
  currentTrack = pTracksOrder.indexOf(trackTo);
  if (absolute == false) {currentTrack = direction;}
  if (currentTrack < 0) {currentTrack = pTracksOrder.length - 1;}
  if (currentTrack >= playingTracks.length) {currentTrack = 0;}
  updatePlaylist();
}

function removeTrack(track) {
 var id = pTracksOrder.indexOf(track)
 if (id < 0) {return;}
 playingTracks.splice(id, 1);
 pTracksOrder.splice(pTracksOrder.indexOf(track), 1);
 if(tracklistPageData[1] != "") { tracklistPageData[2].splice(tracklistPageData[2].indexOf(track), 1); }
 getTracklist(tracklistPageData[0], (tracklistPageData[1] == "") ? pTracksOrder : tracklistPageData[2], tracklistPageData[1])  
 if (id == currentTrack || id == currentTrack + 1) {
  updatePlaylist();
 }
}

var currentOrder = "reg";

function switchOrder() {
    var currentTrackN = pTracksOrder[currentTrack];
    switch(currentOrder) {
    case "reg":
      currentOrder = "rev";
      document.getElementById("switch-play-order").innerHTML = "Order: Reverse";
      pTracksOrder = [...playingTracks];
      pTracksOrder.pop();
      pTracksOrder.reverse();
      pTracksOrder.push(pTracksOrder[pTracksOrder.length - 1]);
      break;
    case "rev":
      currentOrder = "search";
      if (tracklistPageData[2].length < 1) {
        switchOrder();
        return
      }
      document.getElementById("switch-play-order").innerHTML = "Order: Search";
      var didChange = false;
      var trueIndex = playingTracks.indexOf(currentTrackN);
      for (var i = 0; i < tracklistPageData[2].length; i++) {
        var trackIdx = playingTracks.indexOf(tracklistPageData[2][i]);
        if (trueIndex > trackIdx) {continue;}
        currentTrack = i;
        didChange = true;
        break;
      }
      pTracksOrder = [...tracklistPageData[2]];
      
      if (!didChange) {currentTrack = 0;}
      pTracksOrder.push(pTracksOrder[pTracksOrder.length - 1]);
      break;
    case "search":
      currentOrder = "reg";
      document.getElementById("switch-play-order").innerHTML = "Order: Regular";
      pTracksOrder = [...playingTracks];
      break;

  }
  if (currentOrder != "search") {
    currentTrack = pTracksOrder.indexOf(currentTrackN);
  }
    updatePlaylist();
    getTracklist(currentTrack);
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
    console.log(event);
    if(event.data > -1) {return;}
    var url = player.playerInfo.videoUrl;
    var id = url.split("&v=")[1];
    var lastTrack = currentTrack
    currentTrack = pTracksOrder.indexOf(id);
    if (currentTrack == lastTrack) {currentTrack++;}
    if(currentTrack >= pTracksOrder.length - 1) {currentTrack = 0;}
    updatePlaylist();
}

function savePlaylist() {
  var q = $('#savequery').val().toString();
  if (q == "" || q.includes("<") || q.includes(">") || q.includes('"'))  { q = "Your Playlist"; }
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
  //document.getElementById("savequery").value = "";
  
  document.getElementById("playlistname").innerHTML = q;
  document.getElementById("exportbutton").style.visibility= "visible";

  localStorage.setItem("nameKeys" + q, trackNamesString );
  localStorage.setItem("savedLists", allSavedlists);
  localStorage.setItem(q, trackString);
  refreshSavedLists()
  
  document.getElementById("saveselect").value = q;
}

function deletePlaylist() {
  var q = $('#savequery').val().toString();
  if (q == "") { return; }
  if (localStorage.getItem(q) == null) {return;}
  localStorage.removeItem(q);
  localStorage.removeItem("nameKeys" + q);
  document.getElementById("savequery").value = "";
  document.getElementById("exportbutton").style.visibility= "hidden";
  document.getElementById("playlistname").innerHTML = "Your Playlist";

  refreshSavedLists() 
}

refreshSavedLists();

function refreshSavedLists() {
  document.getElementById("saveselect").innerHTML = "";
  var savedLists = localStorage.getItem("savedLists")
  if(savedLists== null) {return;}
  var lists = savedLists.split(";")
  for (var i = 0; i < lists.length; i++) {
     if (localStorage.getItem(lists[i]) == null) {continue;}
    document.getElementById("saveselect").innerHTML += '<option value="' + lists[i] +'">' + lists[i] + '</option>'
  }
}

function refreshSavedSessions(playlistname) {
  document.getElementById("sessionselect").innerHTML = "";
  var savedSess = localStorage.getItem(playlistname + "/allsessions");
  if(savedSess== null) {return;}
  var sessions = savedSess.split(";")
  for (var i = 0; i < sessions.length; i++) {
     if (localStorage.getItem(playlistname + ";" + sessions[i]) == null) {continue;}
    document.getElementById("sessionselect").innerHTML += '<option value="' + sessions[i] +'">' + sessions[i] + '</option>'
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
  var bannedTracks = [];
  
  for (var i = 0; i < nameKeys.length; i+=2) {
     if (nameKeys[i] == "") {continue;}
     if (nameKeys[i + 1].toLowerCase() == "deleted video" || nameKeys[i + 1].toLowerCase() == "private video") {
         bannedTracks.push(nameKeys[i]);
         continue;
     }
     trackNames[nameKeys[i]] = nameKeys[i + 1];
  }

  currentPlaylists = {};
  for (var i = 0;i < keys.length; i+=3) {
     if (keys[i] == "" || keys[i + 1] == "undefined") {continue;}
     html.push([keys[i], keys[i + 1]])
     currentPlaylists[keys[i]] = keys[i + 2].split(";")
     for (let j = 0; j < currentPlaylists[keys[i]].length;j++) {
        if (bannedTracks.indexOf(currentPlaylists[keys[i]][j]) < 0) {continue;}
        currentPlaylists[keys[i]].splice(j, 1);
        j -=1;
     }
  }
  
  document.getElementById("exportarea").style.display = "none";
  document.getElementById("exportbutton").style.visibility = "visible";
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

function loadSession() {
  var playlistName = document.getElementById("playlistname").innerHTML;
  var q = $('#sessionselect').val().toString();
  var trackString = localStorage.getItem(playlistName + ";" + q);
  if (trackString == null) {return;}

  playingTracks = trackString.split(";");
  pTracksOrder = [...playingTracks];
  document.getElementById("sessionquery").value = q;
   document.getElementById("sessionname").innerHTML = q;
   currentTrack = 0;
   updatePlaylist()
    
    getTracklist(0);
}

function saveSession() {
  var q = $('#sessionquery').val().toString();
  if (q == "" || q.includes("<") || q.includes(">") || q.includes('"'))  { q = "New Session"; }
 
  
  var playlistName = document.getElementById("playlistname").innerHTML;
  var tracks = playingTracks.join(";");
  
  localStorage.setItem(playlistName + ";" + q, tracks);
  var allSessions = localStorage.getItem(playlistName + "/allsessions");
  if (allSessions == null) {allSessions = q;}
  if (!allSessions.includes(q)) {allSessions += ";" + q;}
  localStorage.setItem(playlistName + "/allsessions", allSessions);

  refreshSavedSessions(playlistName);
  document.getElementById("sessionselect").value = q;
}

function deleteSession() {
  var q = $('#sessionquery').val().toString();
  var playlistName = document.getElementById("playlistname").innerHTML;
  if (q == "") { return; }
  if (localStorage.getItem(playlistName + ";" + q) == null) {return;}
  localStorage.removeItem(playlistName + ";" + q);
  var allSessions = localStorage.getItem(playlistName + "/allsessions").split(";");
  var newSessions = [];
  for (var i = 0; i < allSessions.length; i++) {
    if (allSessions[i] == q) {continue;}
    newSessions.push(allSessions[i]);
  }
  localStorage.setItem(playlistName + "/allsessions", newSessions.join(";"));
  document.getElementById("sessionquery").value = "";

  refreshSavedSessions(playlistName);
}

function exportPlaylist() {
   document.getElementById("importarea").style.display = "none";
   document.getElementById("exportarea").style.display = (document.getElementById("exportarea").style.display == "none") ? "block" : "none";
   if (document.getElementById("exportarea").style.display == "none") {return;}
   var id = document.getElementById("playlistname").innerHTML;
   document.getElementById("exporttext").innerHTML = "There was an error exporting";
   document.getElementById("exporttitle").innerHTML = "Copy this and put it away for later. Playlist: " + id;
   var code = localStorage.getItem(id);
   if (code == null) {return;}
   console.log(id);
   var code2 = localStorage.getItem("nameKeys" + id);
   console.log(code2);
   if (code2 == null) {return;}
   console.log(code2.split("<").length);
     //if (code
      // code2 = code2.split("<");
     //  code2.length = 2;
     //  code2 = code2.join("<");
      console.log(btoa(unescape(encodeURIComponent(code2))));
   
   document.getElementById("exporttext").value = btoa(id) + ">" + btoa(code) + ">" +btoa(unescape(encodeURIComponent(code2)));
   console.log(btoa(id) + ">" + btoa(code) + ">" + btoa(unescape(encodeURIComponent(code2))));
}

function copyExport() {
   navigator.clipboard.writeText(document.getElementById("exporttext").value);
   document.getElementById("copybutton").innerHTML = "Copied";
   setTimeout(() => { document.getElementById("copybutton").innerHTML = "Copy";}, 1000);
} 

function importPlaylist() {
   document.getElementById("importarea").style.display = (document.getElementById("importarea").style.display == "none") ? "block" : "none";
   document.getElementById("exportarea").style.display = "none";
}

function submitImport() {
   var text = document.getElementById("importtext").value;
   console.log(text);
   var failed = false;
   if (!text.includes(">") || text.includes("<") || text.includes("!")) { failed = true; }
 
   if (failed) {
    document.getElementById("importtext").value = "There was an error";
    return;
   }
 
   console.log(data);
   var data = text.split(">");
   console.log(data);
   var name = atob(data[0]);
   console.log(name);
   var dataO = atob(data[1]);
   console.log(dataO);
   var nameKeys = atob(data[2]);
   console.log(nameKeys);
   console.log(name);
   
  var allSavedlists = localStorage.getItem("savedLists");
  if (allSavedlists == null) { allSavedlists = name; }
  else if (!allSavedlists.includes(name)) {
    allSavedlists += ";" + name
  }
  
  localStorage.setItem("savedLists", allSavedlists);
   localStorage.setItem(name, dataO);
   localStorage.setItem("nameKeys" + name, nameKeys);
   refreshSavedLists();
   document.getElementById("saveselect").value = name;
   loadPlaylist();
}
 async function detectAdBlockUsingFetch() {
let adBlockEnabled = false;
const googleAdsURL =
    'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js'
try {
    await fetch(new Request(googleAdsURL)).catch(_ => {
      adBlockEnabled = true;
    });
  } catch (err) {
    adBlockEnabled = true;
  } finally {
    console.log(`AdBlock enabled: ${adBlockEnabled}`);

    document.getElementById("adblock-notice").style.display = adBlockEnabled ? "none" : "block";
  }
}


detectAdBlockUsingFetch();
