const musicPath = '/music/';
const track = new Audio();
const mainElem = document.querySelector('main');
const volm = document.getElementById('volume');
const nowPlaying = document.getElementById('nowPlaying');
const nowPlayingImg = document.getElementById('nowPlayingImg');
const seek = document.getElementById('seek');
const seekbar = document.getElementById('seekbar');
const currTime = document.getElementById('currentTime');
const totalTime = document.getElementById('totalTime');
const playBtn = document.getElementById('play');
const nextBtn = document.getElementById('next');
const prevBtn = document.getElementById('prev');
const circle = document.getElementById('circle');
const allSongBtn = document.getElementById('allSongs');
const playListBtn = document.getElementById('playList');
const playlistAside = document.getElementById('songsPlaylist');
const createNewPlaylist = document.getElementById('createPlaylist');
const hamburger = document.getElementById('hamburger');
const closeBtn = document.getElementById('close');
let SONGSLOADED = null;
let songs = [];
let songsInAside = [];
let currentIndex;

if (localStorage.getItem('volume') != null) {
    volm.value = localStorage.getItem('volume');
    track.volume = volm.value;
} else {
    localStorage.setItem('volume', volm.value);
}

const createForm = () => {
    let form = document.createElement('form');
    form.id = 'createPlaylistForm';
    let h2 = document.createElement('h2');
    h2.textContent = 'Create Playlist';
    let div = document.createElement('div');
    div.className = 'namePlaylist';
    let img = document.createElement('img');
    img.src = './svgs/playlist.svg';
    img.alt = 'playlist';
    img.className = 'invert';
    let input = document.createElement('input');
    input.type = 'text';
    input.id = 'playlistName';
    input.name = 'playlistName';
    input.placeholder = 'Playlist Name';
    input.required = true;
    div.appendChild(img);
    div.appendChild(input);
    form.appendChild(h2);
    form.appendChild(div);
    input = document.createElement('input');
    input.type = 'text';
    input.id = 'playlistDesc';
    input.name = 'playlistDesc';
    input.placeholder = 'Give a short description for your playlist';
    form.appendChild(input);
    let h3 = document.createElement('h3');
    h3.textContent = 'Select Songs to add in Playlist';
    form.appendChild(h3);

    let i = 0;
    for (const song of SONGSLOADED) {
        let div = document.createElement('div');
        div.className = 'selectSong';
        let img = document.createElement('img');
        img.src = song[3];
        img.alt = 'song';
        img.height = 60;
        let label = document.createElement('label');
        label.htmlFor = song[1];
        label.textContent = song[1];
        let input = document.createElement('input');
        input.type = 'checkbox';
        input.name = i;
        input.id = song[1];
        div.appendChild(img);
        div.appendChild(label);
        div.appendChild(input);
        form.appendChild(div);
        i++;
    }

    let button = document.createElement('button');
    button.textContent = 'Ok';
    form.appendChild(button);

    form.onsubmit = (e) => {
        e.preventDefault();
        let playlistName = '';
        let playlistDesc = '';
        let songsIndex = [];
        const formData = new FormData(form);
        for (const pair of formData.entries()) {
            if (pair[0] == 'playlistName' && pair[1].trim() == '') {
                break;
            }
            else if (pair[0] == 'playlistName' && pair[1].trim() != '') {
                playlistName = pair[1].trim();
            }
            else if (pair[0] == 'playlistDesc') {
                playlistDesc = pair[1].trim();
            }
            else {
                songsIndex.push(pair[0]);
            }
        }
        console.log(playlistName, songsIndex)
        if (playlistName != '') {
            localStorage.setItem(playlistName, JSON.stringify({
                'desc': playlistDesc,
                'songs': JSON.stringify(songsIndex)
            }));
        }
        allSongBtn.click()
    }

    return form;
}

function secondsToMinutesSeconds(seconds) {
    var minutes = Math.floor(seconds / 60);
    var remainingSeconds = seconds % 60;
    return (minutes < 10 ? '0' : "") + minutes + ":" + (remainingSeconds <= 9 ? "0" : "") + Math.ceil(remainingSeconds);
}

const loadSongsInAside = (indexes = 0, isLoaded = false) => {
    if (isLoaded == false) {
        songsInAside = [];
        for (const index of indexes) {
            songsInAside.push(SONGSLOADED[index]);
        }
    }
    playlistAside.textContent = '';
    let i = 0;
    for (const song of songsInAside) {
        let card = createPlaylistAsideCard(song[1], [song[0], i], true, song[3], 'music');
        playlistAside.appendChild(card);
        i++;
    }
    songs = songsInAside;
}

const createPlaylistAsideCard = (itemID, item, song = false, src = './svgs/playlist.svg', alt = 'playlist') => {
    let card = document.createElement('article');
    card.className = 'playlistCardAside';
    let img = document.createElement('img');
    img.className = 'songPlaylist icon invert';
    img.src = src;
    img.alt = alt;
    let span = document.createElement('span');
    span.className = 'playlistName';
    span.title = itemID;
    span.textContent = itemID;
    let btn = document.createElement('button');
    btn.className = 'playlistPlayBtn';

    if (!song) {
        btn.onclick = () => {
            playListBtn.click();
            loadSongsInAside(JSON.parse(item.songs));
            playlistAside.querySelector('.playlistPlayBtn').click();
        }
    } else {
        btn.onclick = () => {
            track.src = item[0];
            track.play();
            nowPlaying.textContent = itemID;
            nowPlayingImg.src = src;
            currentIndex = item[1];
        }
    }

    card.appendChild(img);
    card.appendChild(span);
    card.appendChild(btn);

    return card;
}

const loadPlaylistsInAsideTab = () => {
    let i = 0;
    while (i < localStorage.length) {
        let itemID = localStorage.key(i);
        if (itemID == 'volume') {
            i++;
            continue;
        }
        let item = JSON.parse(localStorage.getItem(itemID));
        if (JSON.parse(item.desc == undefined)) {
            i++;
            continue;
        }
        let card = createPlaylistAsideCard(itemID, item);
        playlistAside.appendChild(card);
        i++;
    }

}

async function loadSongs() {
    let song = await fetch(musicPath)
    let data = await song.text();
    let div = document.createElement('div')
    div.innerHTML = data;
    let a = div.querySelectorAll('a');
    let songs = []
    a.forEach(e => {
        if (e.href.endsWith('.mp3')) {
            songs.push(decodeURI(e.href));
        }
    })
    return songs;
}

const getMusicData = async (song) => {
    let g = await new Promise((resolve, reject) => {
        jsmediatags.read(song, {
            onSuccess: function (tag) {
                tag = tag.tags;
                let picture = tag.picture;
                let base64String = "";
                for (let i = 0; i < picture.data.length; i++) {
                    base64String += String.fromCharCode(picture.data[i]);
                }
                let imageUri = "data:" + picture.format + ";base64," + window.btoa(base64String);
                let title = tag.title;
                let artist = tag.artist;

                resolve([title, artist, imageUri])
            },
            onError: function (error) {
                console.log(error);
            }
        })
    })
    return g;
}

const createCard = (data, index) => {
    let card = document.createElement('article');
    card.className = 'card';

    let img = document.createElement('img');
    img.src = './svgs/spotify.svg';

    let title = document.createElement('h4');
    let artist = document.createElement('p');

    let btn = document.createElement('button');
    btn.className = 'cardButton';
    btn.dataset.index = index;

    card.append(img);
    card.append(title);
    card.append(artist);
    card.append(btn);

    title.textContent = data[1];
    artist.textContent = data[2];
    img.src = data[3];

    btn.onclick = () => {
        songs = SONGSLOADED;
        songsInAside = [];
        track.src = data[0];
        track.play();
        nowPlaying.textContent = decodeURI(data[1]);
        nowPlayingImg.src = decodeURI(data[3]);
        currentIndex = index;
    }

    return card;
}

const loadMusicFilesData = async (songs) => {
    let SONGS = [];
    for (let song of songs) {
        let data = await getMusicData(song);
        SONGS.push([song, ...data]);
    }
    return SONGS;
}

const loadMusicFileCards = (songs) => {
    let i = 0;
    for (let song of songs) {
        let card = createCard(song, i);
        mainElem.append(card);
        i++;
    }
}

const createPlaylistCard = (pName, data) => {
    let card = document.createElement('article');
    card.className = 'card';
    card.dataset.indexes = data.songs;

    let img = document.createElement('img');
    img.src = './svgs/playlist.svg';
    img.className = 'invert';

    let name = document.createElement('h4');
    let desc = document.createElement('p');

    let btn = document.createElement('button');
    btn.className = 'cardButton';

    btn.onclick = () => {
        loadSongsInAside(JSON.parse(data.songs));
        playlistAside.querySelector('.playlistPlayBtn').click();
    }

    name.textContent = pName;
    desc.textContent = data.desc;

    card.append(img);
    card.append(name);
    card.append(desc);
    card.append(btn);

    return card;
}

async function main(run = false) {
    if (run == true) {
        createNewPlaylist.style.pointerEvents = 'none';
        playlistAside.style.pointerEvents = "none";
        playListBtn.style.pointerEvents = 'none';
    }
    playlistAside.textContent = '';
    loadPlaylistsInAsideTab();
    allSongBtn.style.pointerEvents = 'none';
    mainElem.textContent = '';
    let circle = document.createElement('div');
    circle.id = 'circle';
    mainElem.appendChild(circle);
    mainElem.classList.add('content-center');
    if (SONGSLOADED == null) {
        SONGSLOADED = await loadSongs();
        SONGSLOADED = await loadMusicFilesData(SONGSLOADED);
    }
    if (run == true) {
        SONGSLOADED = await loadSongs();
        SONGSLOADED = await loadMusicFilesData(SONGSLOADED);
    }
    songs = SONGSLOADED;
    try {
        mainElem.removeChild(circle);
        mainElem.classList.remove('content-center');
        loadMusicFileCards(songs);
        if (songs.length == 0) {
            let div = document.createElement('div');
            div.id = 'noMusic';
            div.textContent = 'No Music Found';
            mainElem.appendChild(div);
        }
    } catch { }
    finally {
        allSongBtn.style.pointerEvents = "all";
        playlistAside.style.pointerEvents = "all";
        playListBtn.style.pointerEvents = 'all';
        createNewPlaylist.style.pointerEvents = 'all';
    }
}

function playlistFunc() {
    loadSongsInAside(0, true);
    mainElem.textContent = '';
    mainElem.classList.remove('content-center');
    let i = 0;
    while (i < localStorage.length) {
        let itemID = localStorage.key(i);
        if (itemID == 'volume') {
            i++;
            continue;
        }
        let item = JSON.parse(localStorage.getItem(itemID));
        if (JSON.parse(item.desc == undefined)) {
            i++;
            continue;
        }
        let card = createPlaylistCard(itemID, item);
        mainElem.appendChild(card);
        i++;
    }
}

volm.addEventListener('input', (e) => {
    track.volume = e.target.value;
})

volm.addEventListener('change', (e) => {
    localStorage.setItem('volume', e.target.value);
})

track.addEventListener('timeupdate', () => {
    seek.style.left = (track.currentTime / track.duration) * 100 + '%';
    currTime.textContent = secondsToMinutesSeconds(track.currentTime);
})

track.addEventListener('playing', () => {
    totalTime.textContent = secondsToMinutesSeconds(track.duration);
    playBtn.src = './svgs/pause.svg';
})

seekbar.addEventListener('click', (e) => {
    let percent = e.offsetX / e.target.offsetWidth;
    track.currentTime = percent * track.duration;
})

playBtn.onclick = () => {
    if (track.currentSrc == '') {
        mainElem.firstElementChild.lastElementChild.click();
    }
    else {
        if (track.paused) {
            playBtn.src = './svgs/pause.svg';
            track.play();
        }
        else {
            playBtn.src = './svgs/play.svg';
            track.pause();
        }
    }

}

prevBtn.onclick = () => {
    if (currentIndex <= 0) {
        currentIndex = songs.length - 1;
    }
    else {
        currentIndex -= 1;
    }
    track.src = songs[currentIndex][0];
    track.play();
    nowPlaying.textContent = decodeURI(songs[currentIndex][1]);
    nowPlayingImg.src = songs[currentIndex][3];
}

nextBtn.onclick = () => {
    if (currentIndex >= songs.length - 1) {
        currentIndex = 0;
    }
    else {
        currentIndex += 1;
    }
    track.src = songs[currentIndex][0];
    track.play();
    nowPlaying.textContent = decodeURI(songs[currentIndex][1]);
    nowPlayingImg.src = songs[currentIndex][3];
}

track.addEventListener('ended', () => {
    if (currentIndex >= songs.length - 1) {
        currentIndex = 0;
    }
    else {
        currentIndex += 1;
    }
    track.src = songs[currentIndex][0];
    track.play();
    nowPlaying.textContent = decodeURI(songs[currentIndex][1]);
    nowPlayingImg.src = songs[currentIndex][3];
})

hamburger.onclick = () => {
    document.querySelector('#application>header').style.left = '0';
}
closeBtn.onclick = () => {
    document.querySelector('#application>header').style.left = '-100%';
}

createNewPlaylist.onclick = () => {
    closeBtn.onclick();
    mainElem.textContent = '';
    mainElem.classList.remove('items-center');
    let form = createForm();
    mainElem.appendChild(form);
}

allSongBtn.onclick = () => { main() };
allSongBtn.ondblclick = () => { main(true) };

playListBtn.onclick = playlistFunc;

main(true);
