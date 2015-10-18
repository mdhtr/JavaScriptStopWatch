var jssw = jssw || {};
jssw.utils = jssw.utils || {};
jssw.utils.getCurrentSecond = function () {
    return Math.round(new Date().getTime() / 1000);
};
jssw.StopWatchModel = jssw.StopWatchModel || function (idData) {
    this.id = idData;
    this.status = 'empty';
    this.time = {start: 0, elapsed: 0};
    return this;
};
jssw.StopWatchView = jssw.StopWatchView || function (model) {
    this.model = model;
    return this;
};



jssw.StopWatchView.prototype.new = function () {
    // create div for instance
    var jsswBaseDiv = document.getElementById('jssw_baseDiv');
    var jsswInstanceDiv = document.createElement("div");
    jsswInstanceDiv.id = this.model.id;
    jsswInstanceDiv.className = "jssw";
    var timeDiv = document.createElement("div");
    timeDiv.className = "time";
    timeDiv.innerHTML = this.model.time.saved;
    var controlsDiv = document.createElement("div");
    controlsDiv.className = "controls";
    var startSpan = document.createElement("span");
    startSpan.className = "start";
    startSpan.innerHTML = " Start ";
    var pauseSpan = document.createElement("span");
    pauseSpan.className = "pause";
    pauseSpan.innerHTML = " Pause ";
    var resetSpan = document.createElement("span");
    resetSpan.className = "reset";
    resetSpan.innerHTML = " Reset ";
    var closeSpan = document.createElement("span");
    closeSpan.className = "close";
    closeSpan.innerHTML = " Close ";

    startSpan.addEventListener("click", this.start.bind(this));
    pauseSpan.addEventListener("click", this.pause.bind(this));
    resetSpan.addEventListener("click", this.reset.bind(this));
    closeSpan.addEventListener("click", this.reset.bind(this));

    jsswBaseDiv.appendChild(jsswInstanceDiv);
    jsswInstanceDiv.appendChild(timeDiv);
    jsswInstanceDiv.appendChild(controlsDiv);
    controlsDiv.appendChild(startSpan);
    controlsDiv.appendChild(pauseSpan);
    controlsDiv.appendChild(resetSpan);
    controlsDiv.appendChild(closeSpan);

};


jssw.StopWatchEvent = jssw.StopWatchEvent || function (view) {
    this.view = view;
    return this;
};
jssw.StopWatchView.prototype.start = function () {
    if (!(this.model.status === 'running')) {
        this.model.status = 'running';
        // update div controls
        console.log('started: ' + JSON.stringify(this));
        this.model.time.start = jssw.utils.getCurrentSecond() - this.model.time.elapsed;
        this.run();
    }
};
jssw.StopWatchView.prototype.run = function () {
    this.model.time.elapsed = jssw.utils.getCurrentSecond() - this.model.time.start;
    // update div time
    console.log('Elapsed time: ' + this.model.time.elapsed);
    this.wait();
};
jssw.StopWatchView.prototype.wait = function () {
    this.timer = setTimeout(this.run.bind(this), 1000);
};
jssw.StopWatchView.prototype.pause = function () {
    if (!(this.model.status === 'paused' || this.model.status === 'empty')) {
        this.model.status = 'paused';
        // update div controls
        clearTimeout(this.timer);
        console.log('paused: ' + JSON.stringify(this));
    }
};
jssw.StopWatchView.prototype.reset = function () {
    if (!(this.model.status === 'empty')) {
        if (this.model.status === 'running') {
            this.pause();
        }
        this.model.status = 'empty';
        this.model.time.start = 0;
        this.model.time.elapsed = 0;
        // update div controls
        // update div time
        console.log('resetted: ' + JSON.stringify(this));
    }
};
jssw.StopWatchView.prototype.close = function () {
    if (this.model.status !== 'empty') {
        this.reset();
    }
    // remove div
//     var myNode = document.getElementById("foo");
//     while (myNode.firstChild) {
//        myNode.removeChild(myNode.firstChild);
//     }
    delete this;
    console.log('closed: ' + JSON.stringify(this));
};

//jssw.StopWatchView.prototype.initPage = function () {
//    // create style element, fill it with the styling and add it to head
//    // create base div & add it to body
//    // if this is an issue page, add NewButton to it.
//    console.log('view.initPage: function not implemented yet');
//};
//
//jssw.StopWatchView.prototype.refreshTime = function () {
//    // refresh time in div 
//    console.log('view.refreshTime: function not implemented yet');
//};
//

(function () {
    var stopwatch = new jssw.StopWatchView(new jssw.StopWatchModel("id_123"));
    stopwatch.new();

})();