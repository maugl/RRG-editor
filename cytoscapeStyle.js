cyStyle = [
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
					'background-color': 'lightgrey'
				}
			},			
			//subscript superscript
			{
				selector: 'node.superSubscriptContainer',
				style:{
					shape: 'rectangle',
					'border-width': '0px',
					'background-color': 'white',
					'padding': '0, 0, 0, 0',
					'compound-sizing-wrt-labels': 'include'
				}
			},
			{
				selector: 'node.superSubscriptContainer:selected',
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
				selector: 'node.superSubscriptText, node.subscript, node.superscript',
				style:{
					'background-opacity': '0',
					label: 'data(name)',
					'border-width': '0px',
					'text-halign': 'center',
					'text-valign': 'center',
					'width': 'label',
					'height': 'label',
					'events': 'no',
					'padding': '4, 0, 4, 0'
				}
			},
			{
				selector: 'node.subscript, node.superscript',
				style:{
					'font-size': '8'
				}
			},
			//summary triangles
			{
				selector: 'node.triangle',
				style:{
					'shape': 'round-rectangle',
					'width': '20',
					'height': '20',
					'background-opacity': '0',
					'background-color': 'lightgrey',
					'border-width': '0'
				}
			},
			{
				selector: 'node.triangle:selected',
				style:{
					'background-opacity': '0.5'
				}
			},
			{
				selector: 'node.triangle:parent',
				style:{
					"padding": "0, 0, 0, 0",
				}		
			},
			{
				selector: 'edge.triangle',
				style:{
					'line-cap': 'round',
					'events': 'no'
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