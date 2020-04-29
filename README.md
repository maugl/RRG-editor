# RRG-editor
Browser tool for creating RRG graphs

## How to use the editor
- enter a sentence into text box above (click "display")
- create new nodes by right-click-dragging off a node
- change a node's text by double clicking (press enter after changing the text)
- create a new edge by right-click dragging from one node to another
- insert new nodes from the left shelf by dragging them into the desired position
- \[optional\] activate "snap to grid control" checkbox and use a grid to align the graph
- click "export to jpg" and save an image of the current graph

## Controls
| key		| action 	|
| ------------- | ------------- |
| <kbd>click</kbd> + drag mouse in a blank spot | pan the window |
| <kbd>click</kbd> (on node/edge)| select node/edge in graph |
| <kbd>ctrl</kbd> + <kbd>click</kbd> + drag mouse | select multiple nodes in graph |
| <kbd>DEL</kbd>  | delete selected node(s)/edge(s)  |
| <kbd>double click</kbd> (on node)  | change node text (<kbd>enter</kbd> to confirm change) |
| <kbd>right click</kbd> + drag off a node | create new node |
| <kbd>right click</kbd> + drag off a node onto node | create new edge |


## Predefined tags and templates
### Tags
For quickly adding tags to a graph on the left hand side next to the graph display there are predefined tags which can be drag-and-dropped into the graph.
New custom tags can be added by clicking "add tags..." and entering a tag directly into the corresponding group by choosing the correct text field.
Like this new groups can be created by using the bottom most text field.
Both, creating new tags and groups are confirmed by pressing <kbd>Enter</kbd> in the corresponding text field.

### Templates
For repeating recurrent structures quickly and easily, templates can be created. This is done by selecting an existing structure in the graph and clicking on "edit templates...". Much like with the tags a new name and group can be specified.

### Saving tags and templates
when all new tags and or templates are added, the "save tags..."/"save templates..." is used to store the tags and templates for later use. For each action a separate file is downloaded which can be copied into the source directory of the application
replacing the current tags and templates files. After the application is reloaded all the new tags and templates are available.