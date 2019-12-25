//TODO sometimes right-click-drag off node does not work...

$( document ).ready(function(){
	onLoad();
});

var cy;
var dragoutToggle = false;
var dragOverNode = undefined;
var inTextEditMode = false;
// globals for detecting double click on a node
var lastClickTime;
var lastClickedNode;

function onLoad(){
	cy = cytoscape({
		container: document.getElementById('cy'), // container to render in
		style: [
			{
				selector: 'node.base',
				style: {
					shape: 'round-rectangle',
					label: 'data(name)',
					'text-halign': 'center',
					'text-valign': 'center',
					'width': 'label',
					'height': 'label',
					'padding': '5, 0, 5, 0'
				}
			}
		]
	});

	addEventListeners();
}

function loadText(){
	readTextArea(document.getElementById("text_input"));
}

function readTextArea(elm){
	var sentence = elm.value.split(" ");
	for(var i = 0; i < sentence.length; i++){
		addNodeToCy(sentence[i], i);
	}
	cy.center();
}

function addNodeToCy(nodeText, nodeId, x, y){
	if(x == undefined) x = 100 + nodeId * 100;
	if(y == undefined) y = 250;
	node = 	{ // node" +
				data: {name: nodeText},
				renderedPosition: { x: x, y: y},
				classes:['base']
			};
	return cy.add(node);
}

function addEdgeToCy(source, target){
	edge = { 	group: 'edges',
				data: { source: source,
				target: target }
			}
	return cy.add(edge);
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
	});
	nodeTextInput.keyup(function(e){
		if(e.keyCode == 13){
			node.data("name", this.value);
			inTextEditMode = false;
			cy.userPanningEnabled(true);
			this.parentElement.remove();
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

/* event listeners */
function addEventListeners(){
	// create new node / edge by right click dragging off a node
	cy.on('cxttapend', 'node', function(event){
		if(dragoutToggle){
			var node = event.target;
			// create edge
			if(dragOverNode){
				addEdgeToCy(node.id(), dragOverNode.id());
			}
			// create new Node
			else{
				var position = event.renderedPosition;
				//detect if end of drag is on node, then create edge, else create new node

				newNode = addNodeToCy("newNode", "", position.x, position.y);
				addEdgeToCy(node.id(), newNode.id());
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
}

