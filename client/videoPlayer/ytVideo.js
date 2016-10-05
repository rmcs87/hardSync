function test1(){
    //cira o player
    var v1 = new Video({'vidId': 'video_area', 'src': 'Fgm9BqapROc','width': 300, 'heigth': 300,'autoplay': 0,'loop': 0,'controls': 0});
    v1.addEventListener("onStateChange",listener);
    //Adiciona um listner para quando o video estiver pronto;
        //setTimeout(function(){ alert("Hello"); }, 3000);
        //2do
    function listener(event){
        alert("LISTENER");
    }
}

window.onload = test1;

/**
 * Returns a new Video Player
 * @constructor
 * @param {Object[]} ops - options for initializing the video player
 * @param {string} vidId - The id of the div where the player will be inserted
 * @param {string} src - the video source|url
 * @param {number} width - Video Width
 * @param {number} heigth - Video Heigth
 * @param {0|1} autoplay - Autoplay Option
 * @param {0|1} loop - Video loops
 * @param {0|1} controls - Hide or not the controls of the video
 * @return {Video}
 */
function Video(ops){
    var ops = ops;
    console.log(YT);
    var player = new YT.Player(ops.vidId, {
        height: ops.width,
        width: ops.heigth,
        videoId: ops.src,
        playerVars: {
            'autoplay':(ops.autoplay).toString(),       // Liga o autoplay.
            'controls':(ops.controls).toString(),       // Mostra os controles.
            'loop':(ops.loop).toString(),               // Mostra os controles.
            'enablejsapi':'1',                          // Usa a API javascript.
        },
    });

    /**
     * Plays the Video 
     */
    this.play = function(){
        player.playVideo();
    }
    
    /**
     * Changes the Video source 
     * @param {string} src - the video source|url
     */
    this.changeSrc = function(src){
        player.loadVideoById(src, 0, "medium");
    }
    
    /**
     * Pauses the Video 
     */
    this.pause = function(){
        player.pauseVideo();
    }
    
    /**
     * Stops the video
     */
    this.stop = function(){
        player.stopVideo();
    }
    
    /**
     * Reloads the video
     */
    this.load = function(){
        player.loadVideoById(ops.src, 0, "medium");
    }
    
    /**
     * Seeks the video to a specific time. If the time can not be reached, goes as far as possible.
     * @param {number} time - the value to be reached in miliseconds;
     */
    this.seekTo = function(time){
        player.seekTo(time*1000, true);
    }
    
    /**
     * Mutes the video
     */
    this.mute = function(){
        player.mute();
    }
    
    /**
     * Unmute the video
     */
    this.unMute = function(){
        player.unMute();
    }
    
    /**
     * Returns if the video is muted
     * @return {bool}
     */
    this.isMuted = function(){
        return player.isMuted();
    }
    
    /**
     * Sets the volume of the video
     * @param {number} value - [0,1] indicating the volume %
     */
    this.setVolume = function(value){
        player.setVolume(value);
    }
    
    /**
     * Return the volume of the video - [0,1] indicating the volume %
     * @return {number}
     */
    this.getVolume = function(){
        return player.getVolume();
    }
    
    /**
     * Return the video current state: {-1-"NOT_LOADED",0-"STOPPED",1-"PLAYING",2-"PAUSED",3-"BUFFERING"}
     * @return {number}
     */
    this.getPlayerState = function(){
        return player.getPlayerState();
    }
    
    /**
     * Return the current playing time. For live stream, returns the uptime.
     * @return {number}
     */
    this.getCurrentTime = function(){
        return player.getCurrentTime();
    }
    //2do: terá que usar o seek!
    this.setCurrentTime = function(){
        alert("setCurrent time no implemented ...")
        return player.getCurrentTime();
    }
    
    /**
     * Returns the video URL;
     * @return {string}
     */
    this.getURL = function(){
        return player.getVideoUrl();
    }
    
    /**
     * Return fraction of the video played - [0,1] indicating the time %
     * @return {number}
     */
    this.getLoadedfraction = function(){
        return player.getVideoLoadedFraction();
    }
    
    /**
     * Adds a Listener to the player. For now {"onStateChange"}. Anonymous functions may caus problems;
     * @param {string} event - the event name;
     * @param {function} f - the function to be called;
     */
    this.addEventListener = function(event,f){
        player.addEventListener(event, f);
    }
}