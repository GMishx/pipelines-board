# Pipelines Board

Visualize your pipelines with HTML5 + SVG

## Depends
The code has dependencies on
1.  jQuery
2.  circle-progress (https://github.com/kottenator/jquery-circle-progress)

## Features:
- Render jobs in CSS
- Connect jobs with lines and arrows in SVG
- Arrow and circle markers
- Separate progress bar for each pipeline step
- Separate actions for each pipeline step

## Usage:
```HTML
  <head>
  <link rel="stylesheet" href="../src/css/pipelines-board.min.css" />
  </head>
  <body>
  <div id="myBoard"></div>

  <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
  <script src="../src/js/circle-progress.min.js"></script>
  <script src="../src/js/pipelines-board.min.js"></script>

  <script>
    let callme = function(button) {
        alert("Button with text \"" + button.getAttribute("action-text") +
                "\" on element with id " + button.getAttribute("node-id") +
                " clicked!");
    }
    let arrowLineOptions = {
        lineColor : '#c2c2c2',
        tension : 1,
        startOn : "right middle",
        endOn : "left middle",
        markerStart : "circle",
        markerEnd : "arrowRight"
    };
    let elements = [{
        id : "job1",
        phase : "phase1",
        title : "My database",
        progress: {
            min: 0,
            max: 100,
            current: 20,
            color: '#ff1e41'
        },
        action: [{
            text: 'Stop',
            callback: callme
        }, {
            text: 'Resume',
            callback: callme
        }],
        link : "http://example.com",
        next : ["job2"]
    }, {
        id : "job2",
        phase : "phase2",
        title : "Pull Data"
    }]

    var board = new PipelinesBoard("myBoard", {
        markersFillColor : '#c2c2c2',
        arrowLineOptions : arrowLineOptions,
        data : elements
    });
  </script>
  </body>
```
- Check `examples/simple-pipelines.html` for an example.

## Options
Specify options like in example above. (Text in bold is required)

| Option | Description |
| ---: | :--- |
| **id** | Unique job id |
| **phase** | Unique phase id to which the job belongs |
| **title** | Title/job text |
| progress | If the current job has progress tracking<br>Progress has 3 elements:<br> 1. **min**: (default 0) Minimum value of progress<br> 2. **max**: (default 100) Maximum value of progress<br> 3. **current**: (default 0) Current value of progress |
| action | If the current job needs some action buttons<br>Action has 2 elements:<br> 1. **text**: Text to show on button<br> 2. **callback**: Function to call on button click<br> - Callback will receive the button element as the argument.<br> - The button will have attribute **node-id** and **action-text** (see examples). |
| link | Encapsulate current task in an anchor tag |
| next | List of next job ids (to draw arrow lines) |

### Arrow line options
Options supported by the arrow lines between the nodes.

| Option | Description |
| ---: | :--- |
| startOn | Start link from ("<right/left> <top/middle/bottom>") |
| endOn | End link on ("<right/left> <top/middle/bottom>") |
| lineColor | Color of the line connecting the nodes ("black", "#eee", ...) |
| lineTension | Tension on the line (curve) |
| markerStartColor | Starting marker color ("black", "#eee", ...) |
| markerEndColor | Ending marker color ("black", "#eee", ...) |
| markerStart | Start marker with an arrow/circle/none (arrowRight, arrowLeft, circle) |
| markerEnd | End marker with an arrow/circle/none (arrowRight, arrowLeft, circle) |

## API
Following functions are supported on the object:

| Function | Arguments | Description |
| ---: | :---: | :--- |
| reDraw | | Clean every stage connection and redraw them. |
| clean | | Clean every stage connection. |
| addNewPhase | newPhaseId | Draw a new phase with the provided phase id and add the the board.<br>Returns newly created phase element. |
| addNewNode | newNode | Draw a new node and add it to the elements list. |
| addNewNode | phaseEl, newNode | Draw a new node and attach to the parent phase element. |
| updateNodeProgressbar | nodeId, newProgress, nodeEl | Update the progress bar settings for the given node id.<br>If node element is provided, make the changes to it. |
| updateNodeTitle | nodeId, newTitle, nodeEl | Update the title for the given node id.<br>If node element is provided, make the changes to it. |
| updateNodeAction | nodeId, newAction, nodeEl | Update the actions for the given node id.<br>If node element is provided, make the changes to it. |
| updateNodeLink | nodeId, newLink, nodeEl | Update the link for the given node id.<br>If node element is provided, make the changes to it and return new anchor tag.<br>Else create new elements and return null. |
| updateNodeNext | nodeFrom, nodeTo | Add the **nodeTo** to **nodeFrom**'s **next** and redraw the links |
| setNodeProgress | nodeId, newValue | Set the value of progress bar to **newValue**. Calls setNodeProgress. |
| reDrawProgressbar | nodeId | Redraw the progress bar for the given node id.<br>If progress bar does not exists for the node, create it. |
| drawLinks | | Clean the board and redraw every link |
| getNodeIndexById | nodeId | From the elements list, get the index of node with id passed |
