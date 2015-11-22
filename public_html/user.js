var jssw = jssw || {};
jssw.utils = jssw.utils || {};
jssw.preferences = jssw.preferences || {};
jssw.utils.getCurrentSecond = function () {
    return Math.round(new Date().getTime() / 1000);
};
jssw.preferences.idPrefix = "jssw_";
jssw.preferences.queryForStorageChangesTimeoutSec = 5;

jssw.utils.generateId = function () {
    return jssw.preferences.idPrefix + jssw.utils.getCurrentSecond();
};
//#############################################################################
jssw.StopWatchModel = jssw.StopWatchModel || function () {
    this.time = {start: 0, elapsed: 0};
    this.state = '';
    this.id = '';
    this.position = {top: 240, left: 60};
    return this;
};
jssw.StopWatchView = jssw.StopWatchView || function () {
    this.div = {};
    return this;
};
jssw.StopWatch = jssw.StopWatch || function (model, view) {
    this.model = model;
    this.view = view;
    return this;
};
//#############################################################################
jssw.StopWatchView.prototype.new = function () {
    // create div for instance
    var jsswBaseDiv = document.getElementById('jsswBaseDiv');
    this.div.jsswInstanceDiv = document.createElement("div");
    this.div.jsswInstanceDiv.className = "jssw";
    // set positioning and draggable
    this.div.jsswInstanceDiv.style.position = 'absolute';
    // create the rest of the div
    this.div.timeDiv = document.createElement("div");
    this.div.timeDiv.className = "time";
    this.div.controlsDiv = document.createElement("div");
    this.div.controlsDiv.className = "controls";
    this.div.startSpan = document.createElement("span");
    this.div.startSpan.className = "start";
    this.div.startSpan.innerHTML = " Start ";
    this.div.pauseSpan = document.createElement("span");
    this.div.pauseSpan.className = "pause";
    this.div.pauseSpan.innerHTML = " Pause ";
    this.div.resetSpan = document.createElement("span");
    this.div.resetSpan.className = "reset";
    this.div.resetSpan.innerHTML = " Reset ";
    this.div.closeSpan = document.createElement("span");
    this.div.closeSpan.className = "close";
    this.div.closeSpan.innerHTML = " Close ";
    // connect the above
    jsswBaseDiv.appendChild(this.div.jsswInstanceDiv);
    this.div.jsswInstanceDiv.appendChild(this.div.timeDiv);
    this.div.jsswInstanceDiv.appendChild(this.div.controlsDiv);
    this.div.controlsDiv.appendChild(this.div.startSpan);
    this.div.controlsDiv.appendChild(this.div.pauseSpan);
    this.div.controlsDiv.appendChild(this.div.resetSpan);
    this.div.controlsDiv.appendChild(this.div.closeSpan);
};
jssw.StopWatchView.prototype.remove = function () {
    //console.log('remove is triggered');
    var jsswBaseDiv = document.getElementById('jsswBaseDiv');
    while (this.div.jsswInstanceDiv.firstChild) {
        this.div.jsswInstanceDiv.removeChild(this.div.jsswInstanceDiv.firstChild);
    }
    jsswBaseDiv.removeChild(this.div.jsswInstanceDiv);
};
//#############################################################################
jssw.StopWatch.prototype.new = function () {
    this.model.id = jssw.utils.generateId();
    this.view.new();
    // connect view + model functionality:
    this.setState('empty');
    this.saveToStorage();
    this.initialize();
};
jssw.StopWatch.prototype.restore = function () {
    this.view.new();
    this.initialize();
    this.restoreState();
};
jssw.StopWatch.prototype.initialize = function () {
    // add event listeners
    this.view.div.startSpan.addEventListener("click", this.start.bind(this));
    this.view.div.pauseSpan.addEventListener("click", this.pause.bind(this));
    this.view.div.resetSpan.addEventListener("click", this.reset.bind(this));
    this.view.div.closeSpan.addEventListener("click", this.close.bind(this));
    // write out elapsed time and restore div position
    this.view.div.timeDiv.innerHTML = this.model.time.elapsed;
    this.view.div.jsswInstanceDiv.style.top = this.model.position.top + "px";
    this.view.div.jsswInstanceDiv.style.left = this.model.position.left + "px";
    // set draggable and add dragstop event listener
    this.setDraggableWithListener();
};
jssw.StopWatch.prototype.setDraggableWithListener = function () {
    var controller = this;
    $(controller.view.div.jsswInstanceDiv).draggable({
        snap: '.jssw',
        scroll: false,
        stack: "body",
        containment: "document",
        stop: function (event, ui) {
            controller.model.position = ui.helper.position() //save the new position to the object.
            controller.saveToStorage();
        }
    });
};
jssw.StopWatch.prototype.start = function () {
    if (this.model.state === 'running') { // it is running, or restored to runnign state.
        this.pause(); // have to pause it first to be able to start it again.
    }
    if (!(this.model.state === 'running')) {
        this.setState('running');
        //console.log('started: ' + JSON.stringify(this.model));
        this.model.time.start = jssw.utils.getCurrentSecond() - this.model.time.elapsed;
        this.saveToStorage();
        this.run();
    }
};
jssw.StopWatch.prototype.run = function () {
    // update model data (elapsed time)
    this.model.time.elapsed = jssw.utils.getCurrentSecond() - this.model.time.start;
    this.saveToStorage();
    // update time div 
    this.view.div.timeDiv.innerHTML = this.model.time.elapsed;
    //console.log('Elapsed time: ' + this.model.time.elapsed);
    this.wait();
};
jssw.StopWatch.prototype.wait = function () {
    this.timer = setTimeout(this.run.bind(this), 1000);
};
jssw.StopWatch.prototype.pause = function () {
    if (!(this.model.state === 'paused' || this.model.state === 'empty')) {
        this.setState('paused');
        this.saveToStorage();
        clearTimeout(this.timer);
        //console.log('paused: ' + JSON.stringify(this));
    }
};
jssw.StopWatch.prototype.reset = function () {
    if (!(this.model.state === 'empty')) {
        if (this.model.state === 'running') {
            this.pause();
        }
        this.setState('empty');
        this.model.time.start = 0;
        this.model.time.elapsed = 0;
        this.saveToStorage();
        this.view.div.timeDiv.innerHTML = this.model.time.elapsed;
        //console.log('resetted: ' + JSON.stringify(this));
    }
};
jssw.StopWatch.prototype.close = function () {
    if (this.model.state !== 'empty') {
        this.reset();
    }
    // remove from storage
    localStorage.removeItem(this.model.id);
    // remove div
    this.view.remove();
    this.view = null;
    // remove model
    this.model = null;
    // remove 'this' ? 
    //console.log('closed: ' + JSON.stringify(this));
};
jssw.StopWatch.prototype.setState = function (state) {
    if (state === 'running') {
        this.model.state = 'running';
        this.view.div.startSpan.style.display = "none";
        this.view.div.pauseSpan.style.display = "inline";
        this.view.div.resetSpan.style.display = "inline";
        this.view.div.closeSpan.style.display = "none";
    } else if (state === 'paused') {
        this.model.state = 'paused';
        this.view.div.startSpan.innerHTML = " Continue ";
        this.view.div.startSpan.style.display = "inline";
        this.view.div.pauseSpan.style.display = "none";
        this.view.div.resetSpan.style.display = "inline";
        this.view.div.closeSpan.style.display = "none";
    } else if (state === 'empty') {
        this.model.state = 'empty';
        this.view.div.startSpan.innerHTML = " Start ";
        this.view.div.startSpan.style.display = "inline";
        this.view.div.pauseSpan.style.display = "none";
        this.view.div.resetSpan.style.display = "none";
        this.view.div.closeSpan.style.display = "inline";
    }
};
jssw.StopWatch.prototype.restoreState = function () {
    if (this.model.state === 'running') {
        this.setState('running');
        this.start();
    } else if (this.model.state === 'paused') {
        this.setState('paused');
    } else if (this.model.state === 'empty') {
        this.setState('empty');
    }
};
//#############################################################################
jssw.StopWatch.prototype.saveToStorage = function () {
    var key = this.model.id;
    var value = JSON.stringify(this.model);
    localStorage.setItem(key, value); // sets value for key
};
//#############################################################################
jssw.utils.initPage = function () {
    // TODO check if javascript is enabled. if not, log error message to console, do not proceed with init.
    // TODO check if jquery is loaded, wait for it, if waited long and could not load, log error to console, do not proceed with init.
    // create style element, fill it with the styling and add it to head
    // TODO the style should be in this file too.
    document.head.innerHTML += '<link rel="stylesheet" href="style.css" type="text/css"/>';
    // create base div & add it to body
    var baseDivInstance = document.body.insertBefore(document.createElement("div"), document.body.firstChild);
    baseDivInstance.id = "jsswBaseDiv";
    // TODO if this is an issue page, add NewButton to it.
    // newbutton might use css display: inline property to show up inline with the h1?
    // just add a button now for testing :
    var newStopperButton = document.createElement("span");
    newStopperButton.innerHTML = '<button id="newStopWatch">New</button>';
    document.body.appendChild(newStopperButton);
    newStopperButton.addEventListener("click", jssw.utils.StopWatchConstructor);
    // load existing stopwatches from localStorage
    jssw.utils.loadExistingFromStorage();
};
jssw.utils.StopWatchConstructor = function () {
    return new jssw.StopWatch(
            new jssw.StopWatchModel(), new jssw.StopWatchView()).new();
};
jssw.utils.loadExistingFromStorage = function () {
    for (var i = 0; i < localStorage.length; i++) {
        var key = localStorage.key(i);
        var value = localStorage.getItem(key);
        console.log(value);
        try {
            var restoredObject = JSON.parse(value);
            if (restoredObject.id.slice(0, jssw.preferences.idPrefix.length)
                    === jssw.preferences.idPrefix) {
                new jssw.StopWatch(
                        restoredObject, new jssw.StopWatchView()).restore();
            }
        }
        catch (e) {
            continue;
        }
    }
};

//jssw.utils.queryForStorageChanges = function () {
//    // addition has to be checked
//    // removal has to be checked
//    // property changes have to be checked (status, time, position)
//    console.log("query for storage changes");
//    
//    
//    // calls itself again after the timeout
//    setTimeout(jssw.utils.queryForStorageChanges,
//            jssw.preferences.queryForStorageChangesTimeoutSec * 1000);
//};

(function () {
    jssw.utils.initPage();
    jssw.utils.queryForStorageChanges();

})();