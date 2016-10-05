//usando a abordagem: Interfaces with Comments, no futuro substituir: Duck Typing
interface Video {
    /**
     * Returns a new Video Player
     * @constructor
     * @param {Object[]} ops - options for initializing the video player
     * @param {string} src - the video source|url
     * @param {number} width - Video Width
     * @param {number} heigth - Video Heigth
     * @param {bool} autoplay - Autoplay Option
     * @param {bool} muted - Starts the video
     * @param {bool} loop - Video loops
     * @param {bool} controls - Hide or not the controls of the video
     * @return {Video}
     */
    function Video(ops){}
    /**
     * Plays the Video 
     */
    function play(){}
    /**
     * Changes the Video source 
     * @param {string} src - the video source|url
     */
    function changeSrc(src){}
    /**
     * Pauses the Video 
     */
    function pause(){}
    /**
     * Stops the video
     */
    function stop(){}
    /**
     * Reloads the video
     */
    function load(){}
    /**
     * Seeks the video to a specific time. If the time can not be reached, goes as far as possible.
     * @param {number} time - the value to be reached in miliseconds;
     */
    function seekTo(time){}
    /**
     * Mutes the video
     */
    function mute(){}
    /**
     * Unmute the video
     */
    function unMute(){}
    /**
     * Returns if the video is muted
     * @return {bool}
     */
    function isMuted(){}
    /**
     * Sets the volume of the video
     * @param {number} value - [0,1] indicating the volume %
     */
    function setVolume(value){}
    /**
     * Return the volume of the video - [0,1] indicating the volume %
     * @return {number}
     */
    function getVolume(){}
    /**
     * Return the video current state: {-1-"NOT_LOADED",0-"STOPPED",1-"PLAYING",2-"PAUSED",3-"BUFFERING"}
     * @return {number}
     */
    function getPlayerState(){}
    /**
     * Return the current playing time. For live stream, returns the uptime.
     * @return {number}
     */
    function getCuttentTime(){}
    /**
     * Returns the video URL;
     * @return {string}
     */
    function getURL(){}
    /**
     * Return fraction of the video played - [0,1] indicating the time %
     * @return {number}
     */
    function getLoadedfraction(){}
    /**
     * Adds a Listener to the player. For now {"onStateChange"};
     * @param {string} event - the event name;
     * @param {function} event - the function to be called;
     */
    function addEventListener(event,function){}
}