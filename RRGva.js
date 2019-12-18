$( document ).ready(function(){
	onLoad();
});

var cy;
var dragoutToggle = false;
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
	cy.nodeHtmlLabel([{
        query: 'node',
        valign: 'center',
        halign: 'center',
        valignBox: 'center',
        halignBox: 'center',
        tpl: function(data) {
            return '<input type="text" class="nodeInputWrapper" id=label-' + data.id + '></input>';
        }
    }]);
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

function openTextChange(node){
	document.getElementById("label-" + node.id()).style.visibility = "visible";
	//alert(document.getElementById("label-" + node.id()).style.visibility);
}

/* event listeners */
function addEventListeners(){
	// create new node by right click dragging of a node
	cy.on('cxttapend', 'node', function(event){
		if(dragoutToggle){
			var node = event.target;
			var position = event.position;
			//alert("x: " + position.x + " - y: " + position.y);
			newNode = addNodeToCy("newNode", "", position.x, position.y);
			addEdgeToCy(node.id(), newNode.id())
		}
	});
	cy.on('cxttapstart', 'node', function(event){
		dragoutToggle = false;
	});
	cy.on('cxtdragout', 'node', function(event){
		dragoutToggle = true;
	});
	
	// detect if "del" is pressed on an element of the graph
	$(document).on("keydown", function(event){
		if(event.which == 46){
			cy.$(':selected').remove();
		}
	});
	
	// change node text
	cy.on('tap', 'node', function(event){
		var curTime = Date.now();
		var curNode = event.target;
		if(curTime - lastClickTime < 500 && curNode == lastClickedNode){
			openTextChange(curNode);
		}
		lastClickTime = curTime;
		lastClickedNode = curNode;
	});
}
