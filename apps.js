/*------------ APP_Meow ------------*/

function meow(){
    var audio = new Audio(`data/audio/meow${Math.floor(Math.random() * 13) + 1}.mp3`);
    audio.volume = 0.5;
    audio.play();
}

function meowMadness(){
    for (let i = 0; i < 20; i++) {
        var audio = new Audio(`data/audio/meow${Math.floor(Math.random() * 13) + 1}.mp3`);
        audio.volume = 0.5;
        audio.play();
    }
}

/*------------ END ------------*/