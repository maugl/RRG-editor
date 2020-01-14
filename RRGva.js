//TODO sometimes right-click-drag off node does not work...

$( document ).ready(function(){
	onLoad();
});


// TODO wrap all the global variables into runtime/environment object
var cy;
var dragoutToggle = false;
var dragOverNode = undefined;
var inTextEditMode = false;
// globals for detecting double click on a node
var lastClickTime;
var lastClickedNode;
// global constant for spacing new nodes horizontally
var X_NODE_SPACING = 80;
// global constant with edge states/classes for switching edge types
var EDGE_TYPES_SWITCH = {current: ['base', 'operator', 'arrow_target', 'arrow_source'], next:['operator', 'arrow_target', 'arrow_source', 'base']};

//TODO export cytoscape style to separate json file
function onLoad(){
	cy = cytoscape({
		container: document.getElementById('cy'), // container to render in
		style: [
			{
				selector: 'node.base',
				style: {
					shape: 'rectangle',					
					label: 'data(name)',
					'background-color': 'white',
					'text-halign': 'center',
					'text-valign': 'center',
					'width': 'label',
					'height': 'label',
					'padding': '5, 0, 5, 0'
				}
			},
			{
				selector: 'node.base:selected',
				style: {
					'border-width': '1px',
					'border-style': 'solid',
					'border-color': 'black',
					'background-color': 'lightgrey'
				}
			},
			//edges
			{
				selector: 'edge',
				style: {
					'line-color': 'black',
					'width': 3,
				}
			},
			{
				selector: 'edge:selected',
				style: {
					'line-color': 'blue',
				}
			},
			{
				selector: 'edge.operator',
				style: {
					'line-style': 'dashed',
					'line-dash-pattern': [2,4]
				}
			},
			{
				selector: 'edge.arrow_target',
				style: {
					'curve-style': 'bezier',
					'arrow-scale': 2,
					'target-arrow-color': 'black',
					'target-arrow-shape': 'vee'
				}
			},
			{
				selector: 'edge.arrow_source',
				style: {
					'curve-style': 'bezier',
					'arrow-scale': 2,
					'source-arrow-color': 'black',
					'source-arrow-shape': 'vee'
				}
			},
			{
				selector: 'edge.arrow_target:selected',
				style: {
					'target-arrow-color': 'blue',
				}
			},
			{
				selector: 'edge.arrow_source:selected',
				style: {
					'source-arrow-color': 'blue'
				}
			},
		]
	});
	
	addEventListeners();
	// snap to grid: makes graph be positioned along a grid
	cy.snapToGrid();
	executeSnapGrid(false);
	
	//test shelf loading
	//TODO json/JS-object format for shelf contents (use json format of cytoscape)
	var shelfLeftData = ['NP', 'V', 'PRED', 'SENTENCE', 'CLAUSE', 'CORE', 'NUC'];
	loadShelfData("Layered Structure", $("#left_shelf"), shelfLeftData);
	var shelfLeftData2 = ['IF', 'TNS', 'ASP', 'MOD', 'NEG', 'STA'];
	loadShelfData("Operators", $("#left_shelf"), shelfLeftData2);
}

function loadText(){
	readTextArea(document.getElementById("text_input"));
}

/** puts predefined tags into shelves */
function loadShelfData(group, shelfElm, data){
	if (group === ""){
		group = "default";	
	}
	var shelfGroupHeader = $('<div>' + group + '</div>').attr("class", "shelf_group_header")
	var shelfGroupContainer = $('<div></div>').attr("class", "shelf_group_container").append(shelfGroupHeader).appendTo(shelfElm);
	for(elm in data){
		var div_elm = $("<div>" + data[elm] + "</div>").attr("class", "shelf_content").attr("draggable", "true").attr("ondragstart", "drag(event)");
		shelfGroupContainer.append(div_elm);
	}
}

/** reads text from input text area, splits by whitespace and puts split parts into graph */
function readTextArea(elm){
	var sentence = elm.value.split(" ");
	var XPos = 0;
	for(var i = 0; i < sentence.length; i++){
		var YPos = 0;
		curNode = addNodeToCy(sentence[i], 0, YPos);
		XPos = XPos + curNode.width()/2;
		curNode.position("x", XPos);
		// calculate next node position using the current node for next node position to get even spacing on center
		XPos = XPos + X_NODE_SPACING + curNode.width()/2;
	}
	cy.center();
}

/** adds a node to the graph with specified "name", id and position */
function addNodeToCy(nodeText, x, y){
	if(x == undefined) x = 100;
	if(y == undefined) y = 0;
	node = 	{ // node" +
				data: {name: nodeText},
				renderedPosition: { x: x, y: y},
				classes:['base']
			};
	return cy.add(node);
}

/** adds an edge to the graph between two nodes */
function addEdgeToCy(source, target){
	edge = { 	group: 'edges',
				data: { source: source,
				target: target },
				classes: ['base']
			}
	return cy.add(edge);
}

/* functions for tools in the toolbar */
/** switch through the edge types for a selected edge */
function switchEdgeType(){
	cy.$('edge:selected').each(function(edge, j, edges){
		for(let i = 0; i < EDGE_TYPES_SWITCH.current.length; i++){
			edge_class = EDGE_TYPES_SWITCH.current[i];
			if(edge.hasClass(edge_class)){
				edge.removeClass(edge_class).addClass(EDGE_TYPES_SWITCH.next[i]);
				break;
			}
		}
	});
}


/* layout */

// enable/disable snap to grid for clean graphs
function executeSnapGrid(state){
	if(state){
		cy.snapToGrid('snapOn');
		cy.snapToGrid('gridOn');
	}
	else{
		cy.snapToGrid('snapOff');
		cy.snapToGrid('gridOff');
	}
}



/* export */

function saveToJPG(){
	cy.$().unselect();
	boundingBox = cy.$().bb();
	jpg_options={
		'full': 'true'
	};
	var download = document.createElement('a');
	download.href = cy.jpg(jpg_options);
	download.download = "RRG_Graph.jpg";
	download.click();
}


// opens a text input field for changing a Nodes Name
// TODO clean up function (extract duplicate code and add comments)
// TODO fix focusout when trying to edit with mouse in text field
// resize does not work if "" is entered
// TODO recalculate box??? (maybe not needed if box is not shown...) -> boxes are recalculated when clicking anywhere in the canvas
function openTextChange(node){
	inTextEditMode = true;
	cy.userPanningEnabled(false);
	nodeTextInput = $("<input></input>").attr("type", "text").attr("id", "nodeTextInput").attr("value", node.data("name")).width((25 > node.renderedWidth()) ? 25 : node.renderedWidth());
	// add triggers for exiting edit mode
	nodeTextInput.blur(function(){
			node.data("name", this.value);
			inTextEditMode = false;
			cy.userPanningEnabled(true);
			this.parentElement.remove();
			cy.resize();
	});
	nodeTextInput.keyup(function(e){
		if(e.which == 13){
			this.blur();
		}
	});
	
	// add div element for positioning purposes
	nodeTextDiv = $('<div></div>').append(nodeTextInput);
	nodeTextDiv.addClass("nodeTextInputContainer");
	nodeTextDiv.appendTo("#cy");
	nodeTextDiv.css("top", node.renderedPosition("y") - nodeTextDiv.height()/2);
	nodeTextDiv.css("left", node.renderedPosition("x") - node.renderedWidth()/2);
	// take this into account if optimizing for mobile safari (https://stackoverflow.com/questions/4067469/selecting-all-text-in-html-text-input-when-clicked)
	$("#nodeTextInput").focus().select();
}

/** event listeners */
function addEventListeners(){
	// create new node / edge by right click dragging off a node
	cy.on('cxttapend', 'node', function(event){
		if(dragoutToggle){
			//detect if end of drag is on node, then create edge, else create new node
			var node = event.target;
			// create edge
			if(dragOverNode){
				addEdgeToCy(node.id(), dragOverNode.id());
			}
			// create new Node
			else{
				var position = event.renderedPosition;
				newNode = addNodeToCy("newNode", position.x, position.y);
				addEdgeToCy(node.id(), newNode.id());
				cy.$().unselect();
				newNode.select();
			}
		}
	});
	cy.on('cxttapstart', 'node', function(event){
		dragoutToggle = false;
	});
	cy.on('cxtdragout', 'node', function(event){
		dragoutToggle = true;
		dragOverNode = undefined;
	});
	cy.on('cxtdragover', 'node', function(event){
		dragOverNode = event.target;
	});

	// detect double click or single click with alt
	cy.on('tap', 'node', function(event){
		//detect double click
		var curTime = Date.now();
		var curNode = event.target;
		if(curTime - lastClickTime < 500 && curNode == lastClickedNode){
			// double clicked node
			openTextChange(curNode);
		}
		lastClickTime = curTime;
		lastClickedNode = curNode;
	});

	$(document).on("keydown", function(event){
		switch(event.which){
			// detect if "del" is pressed on an element of the graph
			case 46:
				if(!inTextEditMode){
					cy.$(':selected').remove();
				}
				break;
			default:
				break;
		}
	});

	$('.shelf').on("click", ".shelf_group_header", function(event){
		$(event.target).siblings().toggle();
	});
}

/** DRAG AND DROP */
/** source: https://www.w3schools.com/html/html5_draganddrop.asp */
function allowDrop(ev) {
  ev.preventDefault();
}

function drag(ev) {
  ev.dataTransfer.setData("text", ev.target.innerHTML);
}

function drop(ev) {
	ev.preventDefault();
	var data = ev.dataTransfer.getData("text");
	var renderedLeft = ev.clientX - $(cy.container()).position().left;
	var renderedTop = ev.clientY - $(cy.container()).position().top;
	addNodeToCy(data, renderedLeft, renderedTop)
}

