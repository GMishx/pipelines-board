(function() {
    function stringToPercentage(str) {
        if (str === 'left') {
            return 0;
        }
        if (str === 'right') {
            return 100;
        }
        if (str === 'top') {
            return 0;
        }
        if (str === 'bottom') {
            return 100;
        }
        if (str === 'middle') {
            return 50;
        }

        return parseFloat(str);
    }

    var PipelinesBoard = function(parentEl, options) {
        options = options || {};
        var markersFillColor = options.markersFillColor || '#000';
        this.elements = options.data;
        this.arrowLineOptions = options.arrowLineOptions;

        this.parentEl = document.getElementById(parentEl);
        if (!this.parentEl) {
            throw Error("Please specify existing parent element in new PipelinesBoard(...)")
        }

        this.parentEl.classList.add('pipelines-board');
        // create svg element:
        this.svgEl = document.createElementNS("http://www.w3.org/2000/svg",
                "svg");
        this.svgEl.setAttribute('class', 'pipelines-board__svg-overlay');
        this.svgEl.setAttribute('width', '100%');
        this.svgEl.setAttribute('height', '100%');
        this.svgEl.setAttributeNS("http://www.w3.org/2000/xmlns/",
                "xmlns:xlink", "http://www.w3.org/1999/xlink");

        // add markers:
        var defs = document.createElementNS("http://www.w3.org/2000/svg",
                "defs");
        var arrowRightMarker = document.createElementNS(
                "http://www.w3.org/2000/svg", "marker");
        arrowRightMarker.setAttribute("id", "arrowRight");
        arrowRightMarker.setAttribute("markerWidth", "10");
        arrowRightMarker.setAttribute("markerHeight", "10");
        arrowRightMarker.setAttribute("refX", "0");
        arrowRightMarker.setAttribute("refY", "3");
        arrowRightMarker.setAttribute("orient", "auto");
        arrowRightMarker.setAttribute("markerUnits", "strokeWidth");
        arrowRightMarker.innerHTML = '<path d="M0,0 L0,6 L10,3 z" fill="'
                + markersFillColor + '" />';
        defs.append(arrowRightMarker);

        var arrowLeftMarker = document.createElementNS(
                "http://www.w3.org/2000/svg", "marker");
        arrowLeftMarker.setAttribute("id", "arrowLeft");
        arrowLeftMarker.setAttribute("markerWidth", "10");
        arrowLeftMarker.setAttribute("markerHeight", "10");
        arrowLeftMarker.setAttribute("refX", "10");
        arrowLeftMarker.setAttribute("refY", "3");
        arrowLeftMarker.setAttribute("orient", "auto");
        arrowLeftMarker.setAttribute("markerUnits", "strokeWidth");
        arrowLeftMarker.innerHTML = '<path d="M9,0 L9,6 L0,3 z" fill="'
                + markersFillColor + '" />';
        defs.append(arrowLeftMarker);

        var circleMarker = document.createElementNS(
                "http://www.w3.org/2000/svg", "marker");
        circleMarker.setAttribute("id", "circle");
        circleMarker.setAttribute("markerWidth", "6");
        circleMarker.setAttribute("markerHeight", "6");
        circleMarker.setAttribute("refX", "3");
        circleMarker.setAttribute("refY", "3");
        circleMarker.setAttribute("orient", "auto");
        circleMarker.setAttribute("markerUnits", "strokeWidth");
        circleMarker.innerHTML = '<circle cx="3" cy="3" r="3" fill="'
                + markersFillColor + '" />';
        defs.append(circleMarker);

        this.svgEl.append(defs);
        this.parentEl.append(this.svgEl);
        this.drawNodes();
        this.drawLinks();
        var that = this;
        window.onresize = function(event) {
            that.drawLinks();
        }
    };

    PipelinesBoard.prototype.reDraw = function() {
        this.drawLinks();
    };

    PipelinesBoard.prototype.clean = function() {
        var children = Array.from(this.svgEl.children);
        for (var i = 0, l = children.length; i < l; i++) {
            var node = children[i];
            if (node.tagName !== 'defs') {
                node.remove();
            }
        }
    };

    PipelinesBoard.prototype.drawNodes = function() {
        $.circleProgress.defaults.size = 19;
        for (var i = 0, l = this.elements.length; i < l; i++) {
            var node = this.elements[i];
            var phase = this.addNewPhase(node.phase);
            this.addNewNode(phase, node);
        }
    };

    PipelinesBoard.prototype.addNewPhase = function(newPhase) {
        var board = this.parentEl;
        var phase;
        if (!(phase = document.getElementById(newPhase))) {
            phase = document.createElement("div");
            phase.setAttribute("id", newPhase);
            phase.classList.add('pipelines-board__phase');
            board.appendChild(phase);
        }
        return phase;
    }

    PipelinesBoard.prototype.addNewNode = function(newNode) {
        this.elements.push(newNode);
        var phase = this.addNewPhase(newNode.phase);
        this.addNewNode(phase, newNode);
    }

    PipelinesBoard.prototype.addNewNode = function(phaseEl, newNode) {
        var parentPhase;
        if (typeof phaseEl === typeof {}) {
            parentPhase = phaseEl;
        } else {
            parentPhase = document.getElementById(phaseEl);
        }
        var nodeId = newNode.id;
        var jobElement = document.createElement("div");
        jobElement.setAttribute("id", nodeId);
        jobElement.classList.add('pipelines-board__phase__job');

        var jobTable = document.createElement("table");
        var jobRow = jobTable.insertRow(0);
        jobElement.appendChild(jobTable);

        if (newNode.progress !== undefined) {
            this.updateNodeProgressbar(nodeId, newNode.progress, jobElement);
        }
        this.updateNodeTitle(nodeId, newNode.title, jobElement);

        if (newNode.action != undefined) {
            this.updateNodeAction(nodeId, newNode.action, jobElement);
        }
        if (newNode.link != undefined) {
            if (newNode.link === "") {
                newNode.link = "#";
            }
            parentPhase.appendChild(this.updateNodeLink(nodeId, newNode.link,
                    jobElement));
        } else {
            parentPhase.appendChild(jobElement);
        }
    }

    PipelinesBoard.prototype.updateNodeProgressbar = function(nodeId,
            newProgress, nodeEl) {
        var min, max, progress, progressColor;
        var node = this.getNodeIndexById(nodeId);

        node.progress.min = newProgress.min || node.progress.min;
        node.progress.max = newProgress.max || node.progress.max;
        node.progress.current = newProgress.current || node.progress.current;
        node.progress.color = newProgress.color || node.progress.color;
        min = node.progress.min || 0;
        max = node.progress.max || 100;
        progress = node.progress.current || 0;
        progressColor = newProgress.color || '#080';

        progress = ((progress - min) / (max - min));
        var jobProgress = document.createElement("span");
        jobProgress.setAttribute("id", nodeId + "_prog");
        jobProgress.classList.add('pipelines-board__phase__job__progress')
        $(jobProgress).circleProgress({
            value : progress,
            startAngle : 4.712389,
            thickness : 5,
            fill : progressColor
        });
        var progNode;
        if (progNode = document.getElementById(nodeId + "_prog")) {
            progNode.parentNode.replaceChild(jobProgress, progNode);
        } else {
            if (nodeEl !== undefined) {
                $(nodeEl).find("tr")[0].insertCell(0).appendChild(jobProgress);
            } else {
                $("#" + parentNode).find("tr")[0].insertCell(0).appendChild(
                        jobProgress);
            }
        }
    }

    PipelinesBoard.prototype.updateNodeTitle = function(nodeId, newTitle,
            nodeEl) {
        var node = this.getNodeIndexById(nodeId);
        node.title = newTitle;

        var jobTitle = document.createElement("span");
        jobTitle.setAttribute("id", nodeId + "_title");
        jobTitle.classList.add('pipelines-board__phase__job__title');
        jobTitle.classList.add('wrapword');
        jobTitle.innerHTML = newTitle;
        var titleNode;
        if (titleNode = document.getElementById(nodeId + "_title")) {
            titleNode.parentNode.replaceChild(jobTitle, titleNode);
        } else {
            if (nodeEl !== undefined) {
                if (document.getElementById(nodeId + "_prog")) {
                    $(nodeEl).find("tr")[0].insertCell(1).appendChild(jobTitle);
                } else {
                    $(nodeEl).find("tr")[0].insertCell(-1)
                            .appendChild(jobTitle);
                }
            } else {
                if (document.getElementById(nodeId + "_prog")) {
                    $("#" + parentNode).find("tr")[0].insertCell(1)
                            .appendChild(jobTitle);
                } else {
                    $("#" + parentNode).find("tr")[0].insertCell(-1)
                            .appendChild(jobTitle);
                }
            }
        }
    }

    PipelinesBoard.prototype.updateNodeAction = function(nodeId, newAction,
            nodeEl) {
        var node = this.getNodeIndexById(nodeId);
        node.action = newAction;

        var jobAction = document.createElement("span");
        jobAction.setAttribute("id", nodeId + "_action");
        jobAction.classList.add('pipelines-board__phase__job__action');
        for (var ai = 0, al = newAction.length; ai < al; ai++) {
            var actionText = newAction[ai].text || "";
            var actionCallback = newAction[ai].callback;
            var actionEl = document.createElement('button');
            actionEl.classList
                    .add('pipelines-board__phase__job__action__button');
            actionEl.innerHTML = actionText;
            actionEl.setAttribute("node-id", nodeId);
            actionEl.setAttribute("action-text", actionText);
            actionEl.onclick = function() {
                actionCallback(this);
            }
            jobAction.appendChild(actionEl);
        }
        var actionNode;
        if (actionNode = document.getElementById(nodeId + "_action")) {
            actionNode.parentNode.replaceChild(jobAction, actionNode);
        } else {
            if (nodeEl !== undefined) {
                if (document.getElementById(nodeId + "_prog")) {
                    $(nodeEl).find("tr")[0].insertCell(2)
                            .appendChild(jobAction);
                } else {
                    $(nodeEl).find("tr")[0].insertCell(-1).appendChild(
                            jobAction);
                }
            } else {
                if (document.getElementById(nodeId + "_prog")) {
                    $("#" + parentNode).find("tr")[0].insertCell(2)
                            .appendChild(jobAction);
                } else {
                    $("#" + parentNode).find("tr")[0].insertCell(-1)
                            .appendChild(jobAction);
                }
            }
        }
    }

    PipelinesBoard.prototype.updateNodeLink = function(nodeId, newLink, nodeEl) {
        var node = this.getNodeIndexById(nodeId);
        node.link = newLink;

        var aTag = document.createElement('a');
        aTag.setAttribute("id", nodeId + "_link");
        aTag.setAttribute('href', newLink);

        if (nodeEl !== undefined) {
            aTag.appendChild(nodeEl);
            return aTag;
        }
        var currentNode = document.getElementById(nodeId);
        aTag.appendChild(currentNode);
        if (currentNode.parentNode.tagName !== "A") {
            currentNode.parentNode.replaceChild(aTag, currentNode);
        } else {
            var anchorNode = currentNode.parentNode;
            anchorNode.parentNode.replaceChild(aTag, anchorNode);
        }
        return null;
    }

    PipelinesBoard.prototype.updateNodeNext = function(nodeFrom, nodeTo) {
        var node = this.getNodeIndexById(nodeFrom);
        if (node.next === undefined) {
            node.next = [nodeTo];
        } else {
            node.next.push(nodeTo);
        }
        this.drawLinks();
    };

    PipelinesBoard.prototype.setNodeProgress = function(nodeId, newValue) {
        var node = this.getNodeIndexById(nodeId);
        node.progress.current = newValue;
        this.reDrawProgressbar(nodeId);
    };

    PipelinesBoard.prototype.reDrawProgressbar = function(nodeId) {
        var node = this.getNodeIndexById(nodeId);
        var min = node.progress.min || 0;
        var max = node.progress.max || 100;
        var progress = node.progress.current || 0;
        var progressColor = node.progress.color || '#080';
        progress = ((progress - min) / (max - min));
        var progBar = document.getElementById(nodeId + "_prog");
        if (progBar) {
            $(progBar).circleProgress('value', progress);
        } else {
            var newProgress = {
                progress : {
                    min : min,
                    max : max,
                    current : node.progress.current || 0,
                    color : progressColor
                }
            };
            updateNodeProgressbar(nodeId, newProgress);
        }
    };

    PipelinesBoard.prototype.drawLinks = function() {
        this.clean();
        for (var i = 0, l = this.elements.length; i < l; i++) {
            var node = this.elements[i];
            if (node.next !== undefined) {
                for (var j = 0, nl = node.next.length; j < nl; j++) {
                    this.arrowLine(this.arrowLineOptions).from(node.id).to(
                            node.next[j]);
                }
            }
        }
    };

    PipelinesBoard.prototype.getNodeIndexById = function(nodeId) {
        for (var i = 0, l = this.elements.length; i < l; i++) {
            var node = this.elements[i];
            if (node.id == nodeId) {
                return node;
            }
        }
        throw ("Node id " + nodeId + " not found!");
    };

    PipelinesBoard.prototype.arrowLine = function(options) {
        return new ArrowLine(this.svgEl, options);
    };

    var ArrowLine = function(svgCanvas, options) {
        this.svgCanvas = svgCanvas;
        var canvasRectangle = new Rectangle(this.svgCanvas);
        this.canvasTopLeftCorner = new Point(canvasRectangle.getX(),
                canvasRectangle.getY());

        this.options = Object.assign({}, {
            startOn : "right middle",
            endOn : "left middle",
            lineColor : "black",
            lineTension : 1,
            markerStartColor : "black",
            markerEndColor : "black",
            markerStart : null,
            markerEnd : null
        }, options);

        var startPointParts = this.options.startOn.split(" ");
        if (startPointParts.length !== 2) {
            throw Error("please specify startOn option for new ArrowLine as in: 'right middle'");
        }
        this.lineStartPoint = new RelativePointPercentage(
                stringToPercentage(startPointParts[0]),
                stringToPercentage(startPointParts[1]));

        var endPointParts = this.options.endOn.split(" ");
        if (endPointParts.length !== 2) {
            throw Error("please specify endOn option for new ArrowLine as in: 'right middle'");
        }
        this.lineEndPoint = new RelativePointPercentage(
                stringToPercentage(endPointParts[0]),
                stringToPercentage(endPointParts[1]));
    };

    ArrowLine.prototype.from = function(elId) {
        var el = document.getElementById(elId);
        if (!el) {
            throw Error("Please specify an existing element's id in arrow.from(...)");
        }

        this.fromRectangle = new Rectangle(el);
        return this;
    };

    ArrowLine.prototype.to = function(elId) {
        var el = document.getElementById(elId);
        if (!el) {
            throw Error("Please specify an existing element's id in arrow.to(...)");
        }

        this.toRectangle = new Rectangle(el);

        this.fromPoint = this.lineStartPoint.abs(this.fromRectangle).minus(
                this.canvasTopLeftCorner);
        this.toPoint = this.lineEndPoint.abs(this.toRectangle).minus(
                this.canvasTopLeftCorner);

        this.line = new Line(this.fromPoint, this.toPoint, {
            color : this.options.lineColor,
            tension : this.options.lineTension,
            markerStart : this.options.markerStart,
            markerEnd : this.options.markerEnd,
        });
        this.line.draw().append(this.svgCanvas);

        return this;
    };

    var Line = function(fromPoint, toPoint, options) {
        options = options || {};

        this.fromPoint = fromPoint;
        this.toPoint = toPoint;
        this.color = options.color || 'black';
        this.tension = options.tension || 1;

        this.markerStart = options.markerStart;
        this.markerEnd = options.markerEnd;

        if (this.markerStart === 'arrowLeft') {
            this.fromPoint.x += 10;
        }

        if (this.markerEnd === 'arrowRight') {
            this.toPoint.x -= 10;
        }
    };

    Line.prototype.draw = function() {
        var shape = document.createElementNS("http://www.w3.org/2000/svg",
                "path");
        var delta = (this.toPoint.x - this.fromPoint.x) * this.tension;

        var hx1 = this.fromPoint.x + delta;
        var hy1 = this.fromPoint.y;
        var hx2 = this.toPoint.x - delta;
        var hy2 = this.toPoint.y;

        var path = "M " + this.fromPoint.x + " " + this.fromPoint.y + " C "
                + hx1 + " " + hy1 + " " + hx2 + " " + hy2 + " "
                + this.toPoint.x + " " + this.toPoint.y;

        shape.setAttributeNS(null, "d", path);
        shape.setAttributeNS(null, "fill", "none");
        shape.setAttributeNS(null, "stroke", this.color);

        if (this.markerStart) {
            shape.setAttributeNS(null, "marker-start", 'url(#'
                    + this.markerStart + ')');
        }

        if (this.markerEnd) {
            shape.setAttributeNS(null, "marker-end", 'url(#' + this.markerEnd
                    + ')');
        }

        return new Shape(shape);
    };

    var Shape = function(svgEl) {
        this.svgEl = svgEl;
    };

    Shape.prototype.append = function(svgCanvas) {
        svgCanvas.appendChild(this.svgEl);
    };

    var Point = function(x, y) {
        this.x = x;
        this.y = y;
    };

    Point.prototype.minus = function(point) {
        return new Point(this.x - point.x, this.y - point.y)
    };

    var Rectangle = function(el) {
        this.boundingRectangle = el.getBoundingClientRect();
    };

    Rectangle.prototype.getX = function() {
        return this.boundingRectangle.left;
    };

    Rectangle.prototype.getWidth = function() {
        return this.boundingRectangle.width;
    };

    Rectangle.prototype.getY = function() {
        return this.boundingRectangle.top;
    };

    Rectangle.prototype.getHeight = function() {
        return this.boundingRectangle.height;
    };

    var RelativePointPercentage = function(percentageLeft, percentageTop) {
        if (typeof percentageLeft !== 'number') {
            throw Error('RelativePointPercentage.percentageLeft must be a number');
        }
        if (typeof percentageTop !== 'number') {
            throw Error('RelativePointPercentage.percentageTop must be a number');
        }

        this.percentageLeft = percentageLeft;
        this.percentageTop = percentageTop;
    };

    RelativePointPercentage.prototype.abs = function(rectangle) {
        return new Point(rectangle.getX() + rectangle.getWidth()
                * this.percentageLeft * 0.01, rectangle.getY()
                + rectangle.getHeight() * this.percentageTop * 0.01)
    };

    window.PipelinesBoard = PipelinesBoard;
})();
