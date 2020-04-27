//TODO sometimes right-click-drag off node does not work...
//TODO add triangle for summarizing tree under
//TODO sometimes edges do not render when inserting template (when clicking on edge it is rendered)


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

var templates = (templates == undefined) ? {} : templates;
var tags = (tags == undefined) ? {} : tags;

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
					//'color': 'white',
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
					//'color': 'lightgrey',
					'background-color': 'lightgrey'
				}
			},
			{
				selector: 'node:parent',
				style:{
					shape: 'rectangle',					
					'background-color': 'white',
					'border-color': 'grey',
					'padding': '0, 0, 0, 0',
					'margin': '0, 0, 0, 0',
					'compound-sizing-wrt-labels': 'include'
				}
			},
			{
				selector: 'node:parent:selected',
				style:{
					shape: 'rectangle',
					'background-color': 'lightgrey',
					'border-width': '1px',
					'border-style': 'solid',
					'border-color': 'black',
					'compound-sizing-wrt-labels': 'include'
				}
			},
			{
				selector: 'node:child',
				style:{
					'background-opacity': '0',
					label: 'data(name)',
					'border-width': '0px',
					'text-halign': 'center',
					'text-valign': 'center',
					'width': 'label',
					'height': 'label',
					'events': 'no',
					'padding': '4, 0, 4, 0',
					'margin': '0, 0, 0, 0'
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
					'arrow-scale': 1,
					'target-arrow-color': 'black',
					'target-arrow-shape': 'vee'
				}
			},
			{
				selector: 'edge.arrow_source',
				style: {
					'curve-style': 'bezier',
					'arrow-scale': 1,
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

	// html label for super/subscript
/*
	cy.nodeHtmlLabel([{
		query: 'node.base',
		valign: "center",
		halign: "center",
		valignBox: "center",
		halignBox: "center",
		tpl: function(data) {
		    return '<span class="node_label">' + data.label_name + '</span>';
		}
	    }]);
*/

	//load shelf data
	loadTagData();
	loadTemplateData();
	
	produceNestedNodes();
}

function loadText(){
	readTextArea(document.getElementById("text_input"));
}

function produceNestedNodes(){
	var nodes = [
		{ data: { id: 'a', parent: 'b' , name: "Mary"}},
		{ data: { id: 'b'}, selectable: true}
	]
	cy.add(nodes);
}


/* functions for template shelves */
/** load shelf data from js file */
function loadTemplateData(){
	
	for(var i = 0; i < Object.keys(templates).length; i++){
		var groupName = Object.keys(templates)[i];
		var group = templates[groupName];
		var templateNames = [];
		for(var j = 0; j < Object.keys(group).length; j++){
			var templateName = Object.keys(group)[j];
			templateNames.push(templateName);
		}
		loadShelfData(groupName, $("#right_shelf"), templateNames, true);
	}	
}

function loadTagData(){
	for(var i = 0; i < Object.keys(tags).length; i++){
		var groupName = Object.keys(tags)[i];
		loadShelfData(groupName, $("#left_shelf"), tags[groupName], false);
	}	
}

/** puts predefined tags into shelves */
function loadShelfData(group, shelfElm, data, isTemplate){
	if (group === ""){
		group = "default";	
	}
	var shelfGroupHeader = $('<div>' + group + '</div>').attr("class", "shelf_group_header");
	var shelfGroupContainer = $('<div></div>').attr("class", "shelf_group_container").append(shelfGroupHeader).appendTo(shelfElm);
	for(elm in data){
		var div_elm = $("<div>" + data[elm] + "</div>").attr("class", "shelf_content").attr("draggable", "true").attr("ondragstart", "drag(event, '" + group + "', " + isTemplate + ")");
		shelfGroupContainer.append(div_elm);
	}
	return shelfGroupContainer;
}
/** insert input into shelf for adding new tags*/
function addTagEdit(elm){
	var tagInsert = $('<div><input type="text" placeholder="enter tag name..."></input></div>').attr("class", "new_tag");
	if($(elm).children(".shelf_content").css("display") == "none"){
		$(tagInsert).toggle();			
	}
	$(elm).append(tagInsert);
}


/** opens the functionality for adding tags */
function addTags(){
	$('#addTags').attr("disabled", true);
	$('#saveTags').show();
	var left_shelf = $('#left_shelf');
	var shelfGroupHeaderInsert = $('<div><input type="text" placeholder="enter group name..."></input></div>').attr("class", "new_group");

	left_shelf.children('.shelf_group_container').each(function(ind, elm){
		addTagEdit(elm);
	});
	left_shelf.append(shelfGroupHeaderInsert);
}

function saveTags(){
	$("#left_shelf .new_tag, #left_shelf .new_group").remove();
	$("#saveTags").toggle();
	$('#addTags').attr("disabled", false);
	saveTagFile();
}

function saveTag(groupElm, tagName){
	var groupName = $(groupElm).find(".shelf_group_header").text();
	if(tags[groupName] == undefined){
		tags[groupName] = [];
	}
	tags[groupName].push(tagName);

	console.log(tags);
	addTagToGroup(groupElm, tagName);
}

/** puts additional tag into existing groups */
function addTagToGroup(groupElm, tagName){
	console.log(groupElm.value);
	var div_elm = $("<div>" + tagName + "</div>").attr("class", "shelf_content").attr("draggable", "true").attr("ondragstart", "drag(event, '" + $(groupElm).find(".shelf_group_header").val() + "', false)");
	$(groupElm).append(div_elm);
}

function addTemplateToGroup(groupElm, templateName){
	var div_elm = $("<div>" + templateName + "</div>").attr("class", "shelf_content").attr("draggable", "true").attr("ondragstart", "drag(event, '" + $(groupElm).find(".shelf_group_header").val() + "', true)");
	$(groupElm).append(div_elm);
}

/* opens the functionality for adding templates */
function editTemplates(){
	$('#editTemplates').attr("disabled", true);
	$('#saveTemplates').show();

	var right_shelf = $('#right_shelf');
	right_shelf.children('.shelf_group_container').each(function(ind, elm){
		addTemplateCreateButton(elm);
	});
	var shelfGroupHeaderInsert = $('<div><input type="text" placeholder="enter group name..."></input></div>').attr("class", "new_group");
	right_shelf.append(shelfGroupHeaderInsert);		
}

function saveTemplates(){
	$("#right_shelf .new_group, .new_template").remove();
	$("#saveTemplates").toggle();
	$('#editTemplates').attr("disabled", false);
	saveTemplateFile();
}

function addTemplateCreateButton(groupElm){

	var input = $('<input type="text" placeholder="enter template name..."></input>');
	var templateButton = $('<div></div>').attr("class", "new_template");
	templateButton.append(input);
	if($(groupElm).children(".shelf_content").css("display") == "none"){
		$(templateButton).toggle();			
	}
	$(groupElm).append(templateButton);
}

function saveTemplate(groupElm, templateName){
	console.log(groupElm);
	var groupName = $(groupElm).find(".shelf_group_header").text();
	console.log(groupName);
	console.log(templates[groupName]);
	if(templates[groupName] == undefined){
		templates[groupName] = {};
	}
	templates[groupName][templateName] = JSON.stringify(cy.$(":selected").jsons());
	console.log(templates);
	addTemplateToGroup(groupElm, templateName);
}

/* functions for graph manipulation */
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
	if(x == undefined) x = 0;
	if(y == undefined) y = 0;
	node = 	{ // node" +
				data: {name: nodeText/*, label_name: nodeText*/},
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

/** adds a template to the graph */
// TODO fix bug where edges are not shown when inserting template
function displayTemplate(templateName, groupName, renderedLeft, renderedTop){
	var templateJSON = templates[groupName][templateName];
	var templateObject = JSON.parse(templateJSON);
	
	$(templateObject).each(function(ind, elm){
		//check if IDs exist
		var oldID = elm["data"]["id"];
		if(cy.$("#" + oldID).length > 0){
			//console.log(oldID);
			//generate new ID
			var newID = (Math.random()*1e19).toString(36);
			
			// in case newID already exists, generate a new one until it is unique - should happen very rarely if it ever happens
			while(cy.$("#" + newID).length > 0 | $(templateObject).map(function(i, e){return e["data"]["id"]}).get().indexOf(newID) > -1){
				newID = (Math.random()*1e19).toString(36);
			}

			//replace with new ID
			$(templateObject).each(function(i, e){
				if(e["group"] == "nodes" && e["data"]["id"] == oldID){
					e["data"]["id"] = newID;
				}
				if(e["group"] == "edges"){
					if(e["data"]["id"] == oldID){
						e["data"]["id"] = newID;
					}
					if(e["data"]["source"] == oldID){
						e["data"]["source"] = newID;
					}
					if(e["data"]["target"] == oldID){
						e["data"]["target"] = newID;
					}
				}
			});
		}
	});
	
	//insert object into graph
	cy.$().unselect();
	var newObjects = cy.add(templateObject);
	
	//recalculate positions

	// get old center of all nodes
	var newBB = newObjects.renderedBoundingBox();
	
	var sourceX = newBB.x1 + newBB.h/2;
	var sourceY = newBB.y1 + newBB.w/2;
	
	// calculate factors to move nodes by
	var difX = sourceX - renderedLeft;
	var difY = sourceY - renderedTop;
	
	/* debug data
	console.log("sourceX");
	console.log(sourceX);
	console.log("sourceY");
	console.log(sourceY);
	
	console.log("renderedLeft");
	console.log(renderedLeft);
	
	console.log("renderedTop");
	console.log(renderedTop);
	
	console.log("difX");
	console.log(difX);
	console.log("difY");
	console.log(difY);
	*/
	
	newObjects.forEach(function(ele, i, eles){
		if(ele.group() == "nodes"){
			
			oldRPos = ele.renderedPosition();
			//calculate new positions relative to renderedLeft, renderedTop (mouse position)
			newRPos = {x:oldRPos.x - difX, y:oldRPos.y - difY};
			
			/* debug data
			console.log("oldRPos");
			console.log(oldRPos);
			console.log("newRPos");
			console.log(newRPos);
			*/
			
			ele.renderedPosition(newRPos);
		}
	});
	
	
	if($("#snapControl").prop("checked")){
		cy.snapToGrid();
	}
	
	
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

/** center the view on the graph and reset the zoom to default level */
function centerOnGraph(){
	//fit viewport to all elements with padding of 50
	cy.fit( cy.$(), 50 );
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

function saveTemplateFile(){
	//create download of templates.js
	var text = "var templates = " + JSON.stringify(templates, null, 5);
	// code snippet from https://ourcodeworld.com/articles/read/189/how-to-create-a-file-and-generate-a-download-with-javascript-in-the-browser-without-a-server , accessed 14.04.2020
	var element = document.createElement('a');
	element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
	element.setAttribute('download', 'templates.js');

	element.style.display = 'none';
	document.body.appendChild(element);

	element.click();

	document.body.removeChild(element);
}

function saveTagFile(){
	//create download of templates.js
	var text = "var tags = " + JSON.stringify(tags, null, 5);
	// code snippet from https://ourcodeworld.com/articles/read/189/how-to-create-a-file-and-generate-a-download-with-javascript-in-the-browser-without-a-server , accessed 14.04.2020
	var element = document.createElement('a');
	element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
	element.setAttribute('download', 'tags.js');

	element.style.display = 'none';
	document.body.appendChild(element);

	element.click();

	document.body.removeChild(element);
}

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
			input = this.value;
			node.data("name", this.value);
			//node.data("label_name", convertLatexStyleSupSub(this.value));
			inTextEditMode = false;
			cy.userPanningEnabled(true);
			this.parentElement.remove();
			cy.resize();
	});
	nodeTextInput.keyup(function(e){
		if(e.key == 'Enter'){
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
/*
function convertLatexStyleSupSub(text){

	console.log(text.match(/_{.*}/g));
	if (text.match(/_{.*}/g)){
		//replace subscript
		text = text.replace(/_\{(.*?[^\\])\}/g, "<sub>$1</sub>").replace("\}", "}");
	}
	if (text.match(/\^{.*}/g)){
		//replace superscript
		text = text.replace(/\^{(.*?[^\\])}/g,"<sup>$1</sup>").replace("\}", "}");
	}
	return text;
}*/

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
	cy.on('select', 'edge', function(event){
		$("#edgeSwitch").prop('disabled', false);
	});
	cy.on('unselect', 'edge', function(event){
		if(cy.$("edge:selected").length === 0){
			$("#edgeSwitch").prop('disabled', true);
		}
	});

	cy.on('select', 'node:child', function(event){
		event.target.unselectify();
		event.target.parent().select();
		event.target.selectify();
	});
	
	// DEBUG
	// show position of selected elements on pressing 's'
	/*	
	$(document).on('keydown', function(event){
		if(event.key == 's'){
			console.log(cy.$(':selected').position());
			console.log(cy.$(':selected').renderedPosition());
		}
	});*/

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
		switch(event.key){
			// detect if "del"/"backspace" is pressed on an element of the graph
			case 'Delete':
				if(!inTextEditMode){
					cy.$(':selected').remove();
				}
				break;
			default:
				break;
		}
	});

	//show/hide shelf groups
	$('.shelf').on("click", ".shelf_group_header", function(event){
		$(event.target).siblings().toggle();
	});

	//add tag to shelf on enter when editing tag shelves
	$('.shelf').on("keydown", function(event){

		if(event.key == 'Enter'){
			//add new group or new element
			//console.log($(event.target).val());
			var input_div = $(event.target).parent();
			if($(event.target).parent().hasClass("new_group")){
				groupContainer = loadShelfData($(event.target).val(), $(event.target).parents(".shelf"), [], false);
				if($(event.target).parents("#left_shelf").hasClass("shelf")){
					addTagEdit(groupContainer);
				}
				if($(event.target).parents("#right_shelf").hasClass("shelf")){
					addTemplateCreateButton(groupContainer);
				}
				$(event.target).val("");
				$(input_div).appendTo($(input_div).parent());
			}
			if($(event.target).parent().hasClass("new_tag")){
				saveTag(input_div.parent(), $(event.target).val());
				$(event.target).val("");
				$(input_div).appendTo($(input_div).parent());
			}
			if($(event.target).parent().hasClass("new_template")){
				saveTemplate($(input_div).parent(), event.target.value);
				$(event.target).val("");
				$(input_div).appendTo($(input_div).parent());
			}
		}
	});
}

/** DRAG AND DROP */
/** source: https://www.w3schools.com/html/html5_draganddrop.asp */
function allowDrop(ev) {
  ev.preventDefault();
}

function drag(ev, group, isTemplate) {
  ev.dataTransfer.setData("text", ev.target.innerHTML);
  ev.dataTransfer.setData("group", group);
  ev.dataTransfer.setData("isTemplate", isTemplate);

}

function drop(ev) {
	ev.preventDefault();
	var data = ev.dataTransfer.getData("text");
	var isTemplate = ev.dataTransfer.getData("isTemplate");
	
	var renderedLeft = ev.clientX - $(cy.container()).position().left;
	var renderedTop = ev.clientY - $(cy.container()).position().top;

	if(isTemplate === "true"){
		var groupName = ev.dataTransfer.getData("group");
		displayTemplate(data, groupName, renderedLeft, renderedTop);
	}
	else{
		addNodeToCy(data, renderedLeft, renderedTop);
	}
}

