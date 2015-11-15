var jssw = jssw || {};
jssw.utils = jssw.utils || {};
jssw.utils.getCurrentSecond = function () {
    return Math.round(new Date().getTime() / 1000);
};
jssw.StopWatchModel = jssw.StopWatchModel || function () {
    this.time = {start: 0, elapsed: 0};
    return this;
};
jssw.StopWatchView = jssw.StopWatchView || function () {
    this.div = {};
    return this;
};
jssw.StopWatch = jssw.StopWatch || function (model, view) {
    this.model = model;
    this.view = view;
};

jssw.StopWatchView.prototype.new = function () {
    // create div for instance
    var jsswBaseDiv = document.getElementById('jsswBaseDiv');
    this.div.jsswInstanceDiv = document.createElement("div");
    this.div.jsswInstanceDiv.className = "jssw";
    // set positioning and draggable
    this.div.jsswInstanceDiv.style.position = 'absolute';
    this.div.jsswInstanceDiv.style.top = "200px";
    this.div.jsswInstanceDiv.style.left = "40px";
    $(this.div.jsswInstanceDiv).draggable({
        snap: '.jssw',
        scroll: false,
        stack: "body",
        containment: "document"
    });
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
jssw.StopWatch.prototype.new = function () {
    // set initial state ofthe model to empty.
    this.model.status = 'empty';
    // create div for instance
    this.view.new();
    this.view.div.timeDiv.innerHTML = this.model.time.elapsed;
    // add event listeners
    this.view.div.startSpan.addEventListener("click", this.start.bind(this));
    this.view.div.pauseSpan.addEventListener("click", this.pause.bind(this));
    this.view.div.resetSpan.addEventListener("click", this.reset.bind(this));
    this.view.div.closeSpan.addEventListener("click", this.close.bind(this));
    this.view.div.startSpan.style.display = "inline";
    this.view.div.pauseSpan.style.display = "none";
    this.view.div.resetSpan.style.display = "none";
    this.view.div.closeSpan.style.display = "inline";
};
jssw.StopWatch.prototype.start = function () {
    if (!(this.model.status === 'running')) {
        this.model.status = 'running';
        // update div controls
        //set visibility of buttons:
        this.view.div.startSpan.style.display = "none";
        this.view.div.pauseSpan.style.display = "inline";
        this.view.div.resetSpan.style.display = "inline";
        this.view.div.closeSpan.style.display = "none";
        //console.log('started: ' + JSON.stringify(this));
        this.model.time.start = jssw.utils.getCurrentSecond() - this.model.time.elapsed;
        this.run();
    }
};
jssw.StopWatch.prototype.run = function () {
    // update model data (elapsed time)
    this.model.time.elapsed = jssw.utils.getCurrentSecond() - this.model.time.start;
    // update time div 
    this.view.div.timeDiv.innerHTML = this.model.time.elapsed;
    //console.log('Elapsed time: ' + this.model.time.elapsed);
    this.wait();
};
jssw.StopWatch.prototype.wait = function () {
    this.timer = setTimeout(this.run.bind(this), 1000);
};
jssw.StopWatch.prototype.pause = function () {
    if (!(this.model.status === 'paused' || this.model.status === 'empty')) {
        this.model.status = 'paused';
        // update div controls
        //set visibility of buttons:
        this.view.div.startSpan.innerHTML = " Continue ";
        this.view.div.startSpan.style.display = "inline";
        this.view.div.pauseSpan.style.display = "none";
        this.view.div.resetSpan.style.display = "inline";
        this.view.div.closeSpan.style.display = "none";
        clearTimeout(this.timer);
        //console.log('paused: ' + JSON.stringify(this));
    }
};
jssw.StopWatch.prototype.reset = function () {
    if (!(this.model.status === 'empty')) {
        if (this.model.status === 'running') {
            this.pause();
        }
        this.model.status = 'empty';
        this.model.time.start = 0;
        this.model.time.elapsed = 0;
        // update div controls
        //set visibility of buttons:
        this.view.div.startSpan.innerHTML = " Start ";
        this.view.div.startSpan.style.display = "inline";
        this.view.div.pauseSpan.style.display = "none";
        this.view.div.resetSpan.style.display = "none";
        this.view.div.closeSpan.style.display = "inline";
        this.view.div.timeDiv.innerHTML = this.model.time.elapsed;
        //console.log('resetted: ' + JSON.stringify(this));
    }
};
jssw.StopWatch.prototype.close = function () {
    if (this.model.status !== 'empty') {
        this.reset();
    }
    // remove div
    this.view.remove();
    this.view = null;
    //delete this; // does nothing
    //console.log('closed: ' + JSON.stringify(this));
};

jssw.utils.initPage = function () {
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
    //console.log('initpage done');
};
jssw.utils.StopWatchConstructor = function () {
    return new jssw.StopWatch(new jssw.StopWatchModel(), new jssw.StopWatchView()).new();
};

(function () {
    jssw.utils.initPage();
})();