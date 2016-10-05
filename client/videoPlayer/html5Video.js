function test1(){
    //cira o player
    var v1 = new Video({'vidId': 'video_area', 'src': 'https://dl.dropboxusercontent.com/u/13768488/hardSync/b01_01.webm','width': 300, 'heigth': 300,'autoplay': 0,'loop': 1,'controls': 0});
    v1.addEventListener("onStateChange",listener);
    //Adiciona um listner para quando o video estiver pronto;
        //setTimeout(function(){ alert("Hello"); }, 3000);
        //2do
    function listener(event){
        alert(event);
    }
}

//window.onload = test1;

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
    var player = document.createElement('video');
    player.src = ops.src;
    player.width = ops.width;
    player.height = ops.heigth;
    console.log(ops.autoplay, Boolean(ops.autoplay));
    player.autoplay = Boolean(ops.autoplay);
    player.loop = Boolean(ops.loop);
    player.controls = Boolean(ops.controls);
    document.getElementById(ops.vidId).appendChild(player);

    /**
     * Plays the Video 
     */
    this.play = function(){
        player.play();
    }
    
    /**
     * Changes the Video source 
     * @param {string} src - the video source|url
     */
    this.changeSrc = function(src){
        player.src = src;
    }
    
    /**
     * Pauses the Video 
     */
    this.pause = function(){
        player.pause();
    }
    
    /**
     * Stops the video
     */
    this.stop = function(){
        player.pause();
    }
    
    /**
     * Reloads the video
     */
    this.load = function(){
        player.load();
    }
    
    /**
     * Seeks the video to a specific time. If the time can not be reached, goes as far as possible.
     * @param {number} time - the value to be reached in miliseconds;
     */
    this.seekTo = function(time){
        player.currentTime = time;
    }
    
    /**
     * Mutes the video
     */
    this.mute = function(){
        player.volume = 0;
    }
    
    /**
     * Unmute the video
     */
    this.unMute = function(){
        player.volume = 1;
    }
    
    /**
     * Returns if the video is muted
     * @return {bool}
     */
    this.isMuted = function(){
        return player.muted;
    }
    
    /**
     * Sets the volume of the video
     * @param {number} value - [0,1] indicating the volume %
     */
    this.setVolume = function(value){
        player.volume = value;
    }
    
    /**
     * Return the volume of the video - [0,1] indicating the volume %
     * @return {number}
     */
    this.getVolume = function(){
        return player.volume;
    }
    
    /**
     * Return the video current state: {-1-"NOT_LOADED",0-"STOPPED",1-"PLAYING",2-"PAUSED",3-"BUFFERING"}
     * @return {number}
     */
    this.getPlayerState = function(){
        if(player.paused){
            return 2;
        }else if(player.ended){
            return 0;
        }else{
            return 1;
        }
    }
    
    /**
     * Return the current playing time. For live stream, returns the uptime.
     * @return {number}
     */
    this.getCurrentTime = function(){
        return player.currentTime;
    }
    /**
     * Return the current playing time. For live stream, returns the uptime.
     * @return {number}
     */
    this.setCurrentTime = function(value){
        player.currentTime = value;
    }
    
    /**
     * Returns the video URL;
     * @return {string}
     */
    this.getURL = function(){
        return player.src;
    }
    
    /**
     * Return fraction of the video played - [0,1] indicating the time %
     * @return {number}
     */
    this.getLoadedfraction = function(){
        return player.buffered.end(0);
    }
    
    /**
     * Adds a Listener to the player. For now {"onStateChange"}. Anonymous functions may caus problems;
     * @param {string} event - the event name;
     * @param {function} f - the function to be called;
     */
    this.addEventListener = function(event,f){
        player.addEventListener("playing",function(e){ f({'data':1}) });
        player.addEventListener("pause",function(e){ f({'data':2}) });
        player.addEventListener("ended",function(e){ f({'data':0}) });
        player.addEventListener("waiting",function(e){ f({'data':3}) });
    }
}