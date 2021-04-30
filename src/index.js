// "use strict";
import observer from "@cocreate/observer";
import "./style.css";

const coCreateResize = {
    selector: '', //'.resize',
    resizers: [],
    resizeWidgets: [],

    init: function(handleObj) {
        for (let handleKey in handleObj)
            if (handleObj.hasOwnProperty(handleKey) && handleKey === 'selector')
                this.selector = handleObj[handleKey];
        this.resizers = document.querySelectorAll(this.selector);
        this.resizers.forEach((resize, idx) => {
            this.resizeWidgets[idx] = new CoCreateResize(resize, handleObj);
        });
    },

    initElement: function(target) {
        this.resizeWidgets[0] = new CoCreateResize(target, {
            leftDrag: "[data-resize_handle='left']",
            rightDrag: "[data-resize_handle='right']",
            topDrag: "[data-resize_handle='top']",
            bottomDrag: "[data-resize_handle='bottom']"
        });
    }
}

function CoCreateResize(resizer, options) {
    this.resizeWidget = resizer;
    this.cornerSize = 10;
    this.dirHandler = {};
    this.init(options);
}

let dragMixin = {
    do () {},
    init (e) {
        this.processIframe();
        this.startTop = parseInt(document.defaultView.getComputedStyle(this.resizeWidget).top, 10);
        this.startHeight = parseInt(document.defaultView.getComputedStyle(this.resizeWidget).height, 10);
        this.startLeft = parseInt(document.defaultView.getComputedStyle(this.resizeWidget).left, 10);
        this.startWidth = parseInt(document.defaultView.getComputedStyle(this.resizeWidget).width, 10);
    },
    addInitEvents() {
        this.addListenerMulti(document.documentElement, 'mouseup touchend', this.stop);
        this.addListenerMulti(document.documentElement, 'mousemove touchmove', this.do);
    },
    stop () {
        this.resizeWidget.querySelectorAll('iframe').forEach(function(item) {
            item.style.pointerEvents = null;
        });
        this.removeInitEvents();
    },
    removeInitEvents() {
        this.removeListenerMulti(document.documentElement, 'mousemove touchmove', this.do);
        this.removeListenerMulti(document.documentElement, 'mouseup touchend', this.stop);
    },
    check(e) {},
};

let verticalMixin = {
    init(e) {
        super.init(e);
        if (e.touches)
            this.startY = e.touches[0].clientY;
        else
            this.startY = e.clientY;
        super.addInitEvents();
        super.removeInitEvents();
    },
    check(e) {
        let offsetY, scrollTop = document.documentElement.scrollTop;
        if (e.touches)
            e = e.touches[0];
        offsetY = e.clientY - this.getTopDistance(this.selector) + scrollTop;
        // MISSING LOGIC TO BE ADDED
        this.removeListenerMulti(this.resizeWidget.querySelector(this.selector), 'mousedown touchstart', this.init);
        this.addListenerMulti(this.resizeWidget.querySelector(this.selector), 'mousedown touchstart', this.init);
        super.check(e);
    },
};

let horizontalMixin = {
    init(e) {
        super.init(e);
        if (e.touches)
            this.startX = e.touches[0].clientX;
        else
            this.startX = e.clientX;
        super.addInitEvents();
        super.removeInitEvents();
    },
    check(e) {
        let offsetX, scrollLeft = document.documentElement.scrollLeft;
        if (e.touches)
            e = e.touches[0];
        offsetX = e.clientX - this.getLeftDistance(this.resizeWidget.querySelector(this.selector)) + scrollLeft;
        // MISSING LOGIC TO BE ADDED
        this.removeListenerMulti(this.resizeWidget.querySelector(this.selector), 'mousedown touchstart', this.init);
        this.addListenerMulti(this.resizeWidget.querySelector(this.selector), 'mousedown touchstart', this.init);

        super.check(e);
    },
};

let leftDragMixin = {
    __proto__: dragMixin,
    do(e) {
        let left, width;
        super.do(e);
        if (e.touches)
            e = e.touches[0];
        left = this.startLeft + e.clientX - this.startX;
        width = this.startWidth - e.clientX + this.startX;

        if (width < 10)
            return;
        this.resizeWidget.style.left = left + 'px';
        this.resizeWidget.style.width = width + 'px';
    },
    check() {
        super.check();
    },
};

let topDragMixin = {
    __proto__: dragMixin,
    do(e) {
        let top, height;
        super.do(e);

        top = this.startTop + e.clientY - this.startY;
        height = this.startHeight - e.clientY + this.startY;

        if (top < 10 || height < 10)
            return;
        this.resizeWidget.style.top = top + 'px';
        this.resizeWidget.style.height = height + 'px';
    },
    check() {
        super.check();
    },
};

let rightDragMixin = {
    __proto__: dragMixin,
    do(e) {
        let width = 0;
        super.do(e);
        if (e.touches)
            width = this.startWidth + e.touches[0].clientX - this.startX;
        else
            width = this.startWidth + e.clientX - this.startX;
        if (width < 10)
            return;
        this.resizeWidget.style.width = width + 'px';
    },
    check() {
        super.check();
    },
};

let bottomDragMixin = {
    __proto__: dragMixin,
    do(e) {
        let height = 0;
        super.do(e);
        if (e.touches)
            height = this.startHeight + e.touches[0].clientY - this.startY;
        else
            height = this.startHeight + e.clientY - this.startY;

        if (height < 10)
            return;
        this.resizeWidget.style.height = height + 'px';
    },
    check() {
        super.check();
    },
};

CoCreateResize.prototype = Object.assign(CoCreateResize.prototype, {
    dirConfigs: {
        leftDrag: () => {
            return Object.assign(this, leftDragMixin, verticalMixin);
        },
        rightDrag: () => {
            return Object.assign(this, rightDragMixin, verticalMixin);
        },
        topDrag: () => {
            return Object.assign(this, topDragMixin, horizontalMixin);
        },
        bottomDrag: () => {
            return Object.assign(this, bottomDragMixin, horizontalMixin);
        }
    },
    init: function(handleObj) {
        if (this.resizeWidget) {
            for (let handleKey in handleObj) {
                if (handleObj.hasOwnProperty(handleKey) && handleKey == 'selector') {
                    this.selector = handleObj[handleKey];
                    this.dirHandler[handleKey] = this.resizeWidget.querySelector(handleObj[handleKey]);
                }
            }
            this.initResize();
        }
    },
    initResize: function() {
        if (Object.keys(this.dirHandler).length > 0)
            for(let dir in this.dirHandler)
                if(this.dirHandler.hasOwnProperty(dir))
                            this.addListenerMulti(this.dirHandler[dir], 'mousemove touchmove', (this.dirConfigs[dir]()).check);
    },

    // Get an element's distance from the top of the page
    getTopDistance: function(elem) {
        let location = 0;
        if (elem.offsetParent) {
            do {
                location += elem.offsetTop;
                elem = elem.offsetParent;
            } while (elem);
        }
        return location >= 0 ? location : 0;
    },

    // Get an element's distance from the left of the page
    getLeftDistance: function(elem) {
        let location = 0;
        if (elem.offsetParent) {
            do {
                location += elem.offsetLeft;
                elem = elem.offsetParent;
            } while (elem);
        }
        return location >= 0 ? location : 0;
    },

    // Bind multiple events to a listener
    addListenerMulti: function(element, eventNames, listener) {
        let events = eventNames.split(' ');
        for (let i = 0, iLen = events.length; i < iLen; i++) {
        }
    },

    // Remove multiple events from a listener
    removeListenerMulti: function(element, eventNames, listener) {
        let events = eventNames.split(' ');
        for (let i = 0, iLen = events.length; i < iLen; i++) {
            element.removeEventListener(events[i], listener, false);
        }
    },

    // style="pointer-events:none" for iframe when drag event starts
    processIframe: function() {
        this.resizeWidget.querySelectorAll('iframe').forEach(function(item) {
            item.style.pointerEvents = 'none';
        });
    }
});

observer.init({
    name: 'CoCreateResize',
    observe: ['subtree', 'childList'],
    include: '.resize',
    callback: function(mutation) {
        coCreateResize.initElement(mutation.target);
    }
})
// CoCreateResize.init({
//     selector: "* [data-resize]",
//     dragLeft: "[data-resize='left']",
//     dragRight: "[data-resize='right']",
//     dragTop: "[data-resize='top']",
//     dragBottom: "[data-resize='bottom']",
// });


export default coCreateResize;