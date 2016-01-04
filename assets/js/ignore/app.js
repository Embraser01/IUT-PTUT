/*
 * Format de reception de noeud depuis le serveur (exemple)
 *
 * nodes: [{
 *          id: id_du_noeud,
 *          parent_node: id_du_noeud_parent,
 *          label: label_du_noeud,
 *          style: {
 *              order: ordre_parmi_ses_freres,
 *              dx: decalage_horizontal,
 *              folded: vrai_si_fermé,
 *              container: {
 *                  kind: "rectangle",
 *                  borderThickness: "0",
 *                  borderColor: "#263238",
 *                  background: "white",
 *                  radius: "7"
 *              },
 *              font: {
 *                   family: "sans-serif",
 *                   size: "24",
 *                   color: "#006064",
 *                   weight: "bold ",
 *                   style: "italic ",
 *                   decoration: "none",
 *                   align: "right"
 *               },
 *               parentBranch: {
 *                   color: "#42a5f5"
 *               },
 *               unifiedChildren: {
 *                   dx: false,
 *                   container: false,
 *                   font: false,
 *                   parentBranch: false
 *               }
 *          },
 *          permissions: {
 *              TODO Permissions
 *          }
 *      }]
 */

MindmapFrame = function (c) {


    /*===== OBJECT DECLARATION =====*/

    /**
     * MindMap Node Object
     *
     * @param id {Integer} Node unique identifiant
     * @param parent_node {MindmapNode}Parent node
     * @param worker id of the user who work on this node
     * @param permission ?? Permission of the user for this node
     * @param style {Object} Style of the node
     * @param label {String} Label of the node
     * @constructor
     */
    MindmapNode = function (id, parent_node, worker, permission, style, label) {


        /*====== VARIABLES =====*/

        // Node data receiving

        /**
         * Node Id
         * @type {Integer}
         */
        this.id = id;

        /**
         * Node Parent
         * @null
         * @type {MindmapNode}
         */
        this.parent_node = parent_node;

        /**
         * Label of the node
         * @type {String}
         */
        this.label = label;

        /**
         * Style of the node
         * @type {Object}
         */
        this.style = style;

        /**
         * Permissions for the user on this node
         * @type {Object}
         */
        this.permission = permission;


        // Node data for drawing and other purpose

        /**
         * Id of the user working on this node
         * @type {Integer}
         */
        this.worker = worker;

        /**
         * Position of the node
         * @type {{x: number, y: number}}
         */
        this.position = {x: 0, y: 0};

        /**
         * Array of the child of the node
         * @type {Array}
         */
        this.childNodes = [];

        /**
         * TODO Javadoc
         * @type {null}
         */
        this.nodeElement = null;

        /**
         * TODO Javadoc
         * @type {null}
         */
        this.rectElement = null;

        /**
         * TODO Javadoc
         * @type {null}
         */
        this.lineElement = null;

        /**
         * TODO Javadoc
         * @type {null}
         */
        this.textElement = null;

        /**
         * TODO Javadoc
         * @type {null}
         */
        this.textNode = null;

        /**
         * TODO Javadoc
         * @type {null}
         */
        this.nodeConnecter = null;

        /**
         * TODO Javadoc
         * @type {null}
         */
        this.branchElement = null;

        /**
         * TODO Javadoc
         * @type {null}
         */
        this.orientation = null; //left, right, none


        /*===== FUNCTIONS =====*/

        /**
         * Initialisation function
         */
        this.init = function () {

            //Create DOM Elements and Nodes
            this.nodeElement = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            mindmap.layers.nodes.appendChild(this.nodeElement);
            this.nodeElement.style.display = 'none';
            this.nodeElement.id = this.id;
            this.nodeElement.name = 'node';

            this.rectElement = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            this.nodeElement.appendChild(this.rectElement);

            this.lineElement = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            this.nodeElement.appendChild(this.lineElement);

            this.textElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            this.nodeElement.appendChild(this.textElement);

            this.leftConnecterElement = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            this.nodeElement.appendChild(this.leftConnecterElement);
            this.leftConnecterElement.setAttribute("name", "lx");

            this.rightConnecterElement = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            this.nodeElement.appendChild(this.rightConnecterElement);
            this.rightConnecterElement.setAttribute("name", "rx");

            this.lockElement = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            this.nodeElement.appendChild(this.lockElement);
            this.lockElement.setAttribute("name", "lock");

            this.textElement.setAttribute('text-anchor', 'start');

            this.textNode = document.createTextNode(this.label);
            this.textElement.appendChild(this.textNode);

            //Create DOM Element for branch, set orientation
            if (this.parent_node != null) {

                if (this.parent_node.parent_node == undefined)
                    this.orientation = (this.style.dx < 0) ? 'left' : 'right';
                else
                    this.orientation = this.parent_node.orientation;

                if (this.orientation == 'left')
                    this.style.dx = -Math.abs(this.style.dx);
                else if (this.orientation == 'right')
                    this.style.dx = Math.abs(this.style.dx);

                this.branchElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                mindmap.layers.branchs.appendChild(this.branchElement);
                this.branchElement.style.display = 'none';
            }
            else {
                this.orientation = 'none';
            }

            //style correction

            if (-100 < this.style.dx && this.style.dx < 0)
                this.style.dx = -100;

            else if (100 > this.style.dx && this.style.dx > 0)
                this.style.dx = 100;

        };


        // Display the node

        /**
         * Hide the node
         */
        this.hideNode = function () {

            this.nodeElement.style.display = 'none';

            if (this.branchElement != null)
                this.branchElement.style.display = 'none';

        };

        /**
         * Show the node
         */
        this.showNode = function () {

            this.nodeElement.style.display = '';

            if (this.branchElement != null)
                this.branchElement.style.display = '';

        };

        /**
         * Recursive function to hide all children
         */
        this.hideNodeChildren = function () {

            var traverse = function (node) {
                _.forEach(node.childNodes, function (n) {
                    n.hideNode();
                    traverse(n);
                });
            };
            traverse(this);

        };

        /**
         * Draw the node with the style attribute
         */
        this.drawNode = function () {

            var nodePosition = {
                x: this.position.x,
                y: this.position.y
            };

            //folder correction

            if (this == mindmap.rootNode)
                this.style.folded = false;

            //style correction


            if (this == mindmap.rootNode) {

                this.style.container.kind = "rectangle";

                this.style.container.borderThickness = 0;
                this.style.container.background = 'white';
                this.style.container.radius = '7';
                this.style.container.attach = 'sides';
            }
            else if (this.style.folded) {

                this.style.container.kind = "rectangle";

                this.style.container.borderThickness = 0;
                this.style.container.background = 'white';
                this.style.container.radius = '7';
                this.style.container.attach = 'sides';

                this.nodeElement.setAttribute("title", "Double-cliquer pour déplier");

            }
            else {

                this.style.container.borderColor = 'transparent';
                this.style.container.background = 'transparent';
                this.style.container.radius = '0';
                this.style.container.attach = 'sides';

                this.style.container.kind = "none";

                this.nodeElement.setAttribute("title", "");
            }

            //rectElement style

            this.rectElement.setAttribute('fill', this.style.container.background);
            this.rectElement.setAttribute('rx', parseInt(this.style.container.radius));
            this.rectElement.setAttribute('ry', parseInt(this.style.container.radius));
            this.rectElement.setAttribute('stroke-width', parseInt(this.style.container.borderThickness));
            this.rectElement.setAttribute('stroke', this.style.container.borderColor);

            //textElement style

            this.textNode.label = this.label;

            this.textElement.setAttribute('font-family', this.style.font.family);
            this.textElement.setAttribute('font-size', parseFloat(this.style.font.size));
            this.textElement.setAttribute('fill', this.style.font.color);

            if (this.style.font.weight == 'bold')
                this.textElement.style.fontWeight = 'bold';

            if (this.style.font.style == 'italic')
                this.textElement.style.fontStyle = 'italic';

            if (this.style.font.decoration == 'underline')
                this.textElement.style.textDecoration = 'underline';
            else if (this.style.font.decoration == 'strike')
                this.textElement.style.textDecoration = 'line-through';


            //rectElement, textElement metric

            this.textElement.setAttribute('y', '');

            var padx = parseInt(this.style.font.size) / 1.5;
            var pady = parseInt(this.style.font.size) / 2.5;


            var rectHeight = parseInt(this.style.font.size) + 2 * pady;

            this.rectElement.setAttribute('height', rectHeight);
            // rectHeight /= mindmap.view.zoom;

            var textMetric = this.textElement.getBoundingClientRect();
            var rectWidth = (textMetric.width / mindmap.view.zoom) + 2 * padx;


            if (parseInt(this.style.container.width) > rectWidth)
                rectWidth = parseInt(this.style.container.width);

            this.rectElement.setAttribute('width', rectWidth);

            var rectMetric = this.rectElement.getBoundingClientRect();
            var rectTop = rectMetric.top / mindmap.view.zoom;
            var tmp_textTop = textMetric.top / mindmap.view.zoom;
            var textTop = rectTop - tmp_textTop;
            var textHeight = textMetric.height / mindmap.view.zoom;
            var textWidth = textMetric.width / mindmap.view.zoom;

            //textElement re-metric

            if (this.style.font.align == 'left')
                this.textElement.setAttribute('x', padx);
            else if (style.font.align == 'right')
                this.textElement.setAttribute('x', rectWidth - textWidth - padx);
            else
                this.textElement.setAttribute('x', (rectWidth - textWidth) / 2);

            this.textElement.setAttribute('y', textTop + (rectHeight - textHeight) / 2);

            //lineElement init

            if (this.style.container.kind == 'none') {

                this.lineElement.setAttribute('x1', 0);
                this.lineElement.setAttribute('y1', rectHeight / 2);
                this.lineElement.setAttribute('x2', rectWidth);
                this.lineElement.setAttribute('y2', rectHeight / 2);

                this.lineElement.setAttribute('stroke', this.style.parentBranch.color);
                this.lineElement.setAttribute('stroke-width', 4);
                this.lineElement.setAttribute('stroke-linecap', 'butt');

                this.textElement.setAttribute('y', textTop + rectHeight / 2 - textHeight - 4);


            }
            else {
                this.lineElement.setAttribute('stroke', 'transparent');
                this.lineElement.setAttribute('stroke-width', 0);
            }
            // lineElement.style.filter = selection ? 'drop-shadow(5px 5px 7px #888)' : '';

            if (this.orientation == 'left')
                nodePosition.x -= rectWidth / 2;
            else if (this.orientation == 'right')
                nodePosition.x += rectWidth / 2;

            this.nodeElement.setAttribute('transform', 'translate(' + (-rectWidth / 2 + nodePosition.x) + ', ' + (-rectHeight / 2 + nodePosition.y) + ')');

            //gElement attaches compute
            this.nodeConnecter = {'y': nodePosition.y};

            // if(style.container.attach == 'center') {
            // this.nodeConnecter.lx = nodePosition.x;
            // this.nodeConnecter.rx = nodePosition.x;
            // }
            // else {
            this.nodeConnecter.lx = nodePosition.x - rectWidth / 2;
            this.nodeConnecter.rx = nodePosition.x + rectWidth / 2;
            // }


            this.leftConnecterElement.setAttribute("cx", 0);
            this.rightConnecterElement.setAttribute("cx", rectWidth);
            this.lockElement.setAttribute("cx", rectWidth / 2);

            this.leftConnecterElement.setAttribute("cy", rectHeight / 2);
            this.rightConnecterElement.setAttribute("cy", rectHeight / 2);
            this.lockElement.setAttribute("cy", rectHeight);

            this.leftConnecterElement.setAttribute("r", rectHeight / 4);
            this.rightConnecterElement.setAttribute("r", rectHeight / 4);
            this.lockElement.setAttribute("r", rectHeight / 5);

            this.leftConnecterElement.style.display = "none";
            this.rightConnecterElement.style.display = "none";

            if (this.worker != null) {
                this.lockElement.style.display = "";
                this.lockElement.setAttribute("title", this.worker)
            }

            else {
                this.lockElement.style.display = "none";
            }


            if (this.worker == mindmap.worker)
                this.lockElement.setAttribute("fill", "#4caf50")
            else
                this.lockElement.setAttribute("fill", "#f44336")

            if (!this.style.folded) {
                if (this.orientation != 'right')
                    this.leftConnecterElement.style.display = "";
                if (this.orientation != 'left')
                    this.rightConnecterElement.style.display = "";

            }


            //branchElement init

            if (this.parent_node != null) {

                //edit pathEelement.d
                if (this.position.x < this.parent_node.position.x) {

                    var path = 'M' + this.parent_node.nodeConnecter.lx + ',' + this.parent_node.nodeConnecter.y + ' ';
                    path += 'C' + (this.nodeConnecter.rx + 0.333 * (this.parent_node.nodeConnecter.lx - this.nodeConnecter.rx)) + ',' + this.parent_node.nodeConnecter.y + ' ';
                    path += (this.nodeConnecter.rx + 0.666 * (this.parent_node.nodeConnecter.lx - this.nodeConnecter.rx)) + ',' + this.nodeConnecter.y + ' ';
                    path += this.nodeConnecter.rx + ',' + this.nodeConnecter.y;

                }
                else {

                    var path = 'M' + this.parent_node.nodeConnecter.rx + ',' + this.parent_node.nodeConnecter.y + ' ';
                    path += 'C' + (this.parent_node.nodeConnecter.rx + 0.666 * (this.nodeConnecter.lx - this.parent_node.nodeConnecter.rx)) + ',' + this.parent_node.nodeConnecter.y + ' ';
                    path += (this.parent_node.nodeConnecter.rx + 0.333 * (this.nodeConnecter.lx - this.parent_node.nodeConnecter.rx)) + ',' + this.nodeConnecter.y + ' ';
                    path += this.nodeConnecter.lx + ',' + this.nodeConnecter.y;

                }

                this.branchElement.setAttribute('d', path);
                this.branchElement.setAttribute('fill', 'none');
                this.branchElement.setAttribute('stroke', '#42a5f5');
                this.branchElement.setAttribute('stroke-width', '4');

                //node.branchElement.style.filter = selection ? 'drop-shadow(5px 5px 7px #888)' : '';
            }

        };


        // Edit node data

        /**
         * Edit this node
         * @param worker
         * @param text
         * @param style
         * @param isMe
         */
        this.editNode = function (worker, text, style, isMe) {

            var drawFromParent = false;

            if (text != null)
                this.label = text;

            if (style) {

                if ("dx" in style)
                    this.style.dx = style.dx;

                if ("folded" in style)
                    this.style.folded = style.folded;

                // TODO Delete this function if this is not necessary
                if ("container" in style && "width" in style.container)
                    this.style.container.width = style.container.width;

                if ("font" in style) {

                    _.forEach(style.font, function (n, key) {
                        this.style.font[key] = n;
                    });

                    // TODO Delete this function if this is not necessary
                    //for (var k in style.font)
                    //    if (k in style.font)
                    //        this.style.font[k] = style.font[k];
                }

                if ("parentBranch" in style && "color" in style.parentBranch)
                    this.style.parentBranch.color = style.parentBranch.color;

                if ("unifiedChildren" in style) {
                    drawFromParent = true;

                    _.forEach(style.font, function (n, key) {
                        this.style.unifiedChildren[key] = n;
                    });

                    // TODO Delete this function if this is not necessary
                    //for (var k in style.unifiedChildren)
                    //    if (k in style.unifiedChildren)
                    //        this.style.unifiedChildren[k] = style.unifiedChildren[k];
                }
            }

            if (drawFromParent && this.parent_node != null)
                mindmap.drawMap(this.parent_node);
            else
                mindmap.drawMap(this);


            // TODO Bouger la fonction à la vraie edition et appeler cette fonction après la réponse serveur
            if (isMe) mindmap.ioManager.out.editNode(this);
        };

        /**
         * Destroy the node (and all child)
         */
        this.destroyNode = function () {

            mindmap.layers.nodes.removeChild(this.nodeElement);
            mindmap.layers.branchs.removeChild(this.branchElement);

            var parentChildId = this.parent_node.childNodes.indexOf(this);

            this.parent_node.childNodes.splice(parentChildId, 1);

            delete mindmap.nodes[this.id];

        };


        /*===== INITIALISATION =====*/

        if (parent_node != null) parent_node.childNodes.push(this);
        else mindmap.rootNode = this;

        this.init();
    };


    /*===== VARIABLES =====*/

    /**
     * MindMap variable
     * @type {MindmapFrame}
     */
    mindmap = this;


    // For Drawing purpose

    /**
     * TODO Javadoc
     * @type {boolean}
     */
    this.syncDraw = true;

    /**
     * SVG Container that contain the MindMap
     * @type {HTMLElement}
     */
    this.container = c;

    /**
     * TODO Javadoc
     * @type {{offset: {x: number, y: number}, zoom: number}}
     */
    this.view = {
        offset: {x: 0, y: 0},
        zoom: 1
    };

    /**
     * TODO Javadoc
     * @type {{}}
     */
    this.layers = {};

    /**
     * TODO Javadoc
     * @type {null}
     */
    this.newBranchElement = null;


    // For other purpose (essentially collaboration)

    /**
     * Array of users on the mindmap
     * @type {{Integer}}
     */
    this.workers = {};

    /**
     * Id of the user
     * @type {number}
     */
    this.worker = -1;

    /**
     * Root Node of the mindmap
     * @type {MindmapNode}
     */
    this.rootNode = undefined;

    /**
     * List of all the nodes of the mindmap
     * @type {{MindmapNode}}
     */
    this.nodes = {};


    /*===== FUNCTIONS =====*/

    // Initialisation

    /**
     * Initialize the mindmap by creating and get all data that it need
     */
    this.initialize = function () {

        //Create layers
        this.layers.view = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.container.appendChild(this.layers.view);

        this.layers.branchs = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.layers.view.appendChild(this.layers.branchs);

        this.newBranchElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        this.layers.branchs.appendChild(this.newBranchElement);

        this.newBranchElement.setAttribute('fill', 'none');
        this.newBranchElement.setAttribute('stroke', '#64b5f6'); //#29b6f6
        this.newBranchElement.setAttribute('stroke-width', '4');

        this.layers.nodes = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.layers.view.appendChild(this.layers.nodes);

        //Set view offset
        this.view.offset.x = parseInt(document.body.offsetWidth / 2);
        this.view.offset.y = parseInt(document.body.offsetHeight / 2);

        this.setView(parseInt(document.body.offsetWidth / 2), parseInt(document.body.offsetHeight / 2), 1);

    };


    // Selection

    /**
     * Return the node that is selected (can be undefined)
     * @returns {MindmapNode}
     */
    this.getSelectedNode = function () {
        return this.nodes[this.workers[this.worker]];
    };

    /**
     * Set the node that edit the user to a specific one
     * @param node_id
     */
    this.setSelectedNode = function (node_id) {
        this.workers[this.worker] = node_id;
    };

    /**
     * Unselect a specific node (ask for force unselect if allowed)
     * @param forced
     */
    this.unselectNode = function (forced) {

        var ex = mindmap.getSelectedNode();

        if (ex == null)
            return;

        ex.worker = null;
        mindmap.setSelectedNode(null);

        ex.drawNode();

        // TODO Attendre la confirmation avant de deselectionner (forcé ou non)
        if (!forced) {
            mindmap.ioManager.out.unselectNode(ex);
        }

    };

    /**
     * Select a specific node
     * @param node
     */
    this.selectNode = function (node) {

        if (node.worker == null) { //If the node isn't currently selected by the user or a contributor

            if (this.getSelectedNode() != null) //If user has already selected a node
                this.unselectNode(false);

            node.worker = this.worker;
            mindmap.setSelectedNode(eventManager.eventData.node.id);

            mindmap.getSelectedNode().drawNode();

            // TODO Wait for confirmation before select
            mindmap.ioManager.out.selectNode(node);
        } else {
            // TODO Message the user that he can't edit now
        }

    };


    // Misc

    /**
     * TODO Javadoc
     * @param childNodes
     * @param clientY
     * @param parent_node
     * @param orientation
     * @returns {{prevY_i: *, current_i: *, nextY_i: *}}
     */
    this.nearBrothersVerticalPosition = function (childNodes, clientY, parent_node, orientation) {

        childNodes.sort(function (a, b) {
            return a.nodeElement.getBoundingClientRect().top - b.nodeElement.getBoundingClientRect().top;
        });

        var current_i = null;

        var nextY_i = null;
        var nextY_v = null;
        var prevY_i = null;
        var prevY_v = null;

        for (var i in childNodes) {

            var node_i = childNodes[i];

            node_i.style.order = i;

            if (node_i == parent_node)
                current_i = i;

            //get only node which are in same side

            same = node_i.orientation == orientation;

            if (same) {

                if (node_i.rectElement.getBoundingClientRect().top + node_i.rectElement.getBoundingClientRect().height < clientY && (prevY_v == null || (prevY_v != null && node_i.rectElement.getBoundingClientRect().top + node_i.rectElement.getBoundingClientRect().height > prevY_v))) {
                    prevY_i = i;
                    prevY_v = node_i.rectElement.getBoundingClientRect().top + node_i.rectElement.getBoundingClientRect().height;

                }

                if (clientY < node_i.rectElement.getBoundingClientRect().top && (nextY_v == null || (nextY_v != null && node_i.rectElement.getBoundingClientRect().top < nextY_v))) {
                    nextY_i = i;
                    nextY_v = node_i.rectElement.getBoundingClientRect().top;

                }

            }

        }

        return {prevY_i: prevY_i, current_i: current_i, nextY_i: nextY_i};
    };

    /**
     * TODO Javadoc
     * @param firstNode
     * @param secondNode
     */
    this.switchNodeInSiblings = function (firstNode, secondNode) {

        var pos = firstNode.style.order;
        firstNode.style.order = secondNode.style.order;
        secondNode.style.order = pos;
    };

    /**
     * Delete nodes that are selected
     */
    this.deleteSelectedNode = function () {

        if (this.getSelectedNode() == null || this.getSelectedNode() == this.rootNode)
            return;

        // TODO Passer avec lodash, et voir pour supprimer plus d'un

        var traverse = function (node) {

            for (var i in node.childNodes) {

                if (node.childNodes[i].worker != null)
                    return false;

                if (!traverse(node.childNodes[i]))
                    return false;
            }

            return true;

        };

        var canDelete = traverse(this.getSelectedNode());

        if (canDelete) {

            var ids_to_delete = [];

            var traverseDelete = function (node) {

                var nodeId = node.id;

                var childNodesId = [];

                for (var i in node.childNodes)
                    childNodesId.push(node.childNodes[i].id);

                for (var j = 0; j < childNodesId.length; j++) {
                    traverseDelete(mindmap.nodes[childNodesId[j]]);

                }

                node.destroyNode();

                ids_to_delete.push(nodeId);

            };

            traverseDelete(this.getSelectedNode());

            if (ids_to_delete) mindmap.ioManager.out.deleteNodes(ids_to_delete);

            this.drawMap();

        }
    };

    /**
     * Set the user id in the list of worker
     * @type {null}
     */
    this.setWorker = function(user_id){
        this.worker = user_id;
        this.workers[this.worker] = null;
    };


    // Functions for drawing purpose

    /**
     * Set view position
     * @param x
     * @param y
     * @param z
     */
    this.setView = function (x, y, z) {

        if (z == undefined)
            z = this.view.zoom;

        if (x == undefined || y == undefined) {
            x = this.view.offset.x;
            y = this.view.offset.y;
        }

        this.view.offset.x = x;
        this.view.offset.y = y;

        this.layers.view.setAttribute('transform', 'scale(' + this.view.zoom + '),translate(' + this.view.offset.x + ',' + this.view.offset.y + ')');

    };

    /**
     * TODO Javadoc
     * @param node
     * @param leafs
     * @returns {*}
     */
    this.countLeafs = function (node, leafs) { //Count the number of leaf each side of the map

        node.showNode();

        if (node.style.folded || node.childNodes.length == 0) { //If node is folded node or leaf node, increase leaf counters

            if (node.orientation == 'left')
                leafs.left++;
            else
                leafs.right++;

        }
        else { //Else, explore node's children

            node.childNodes.sort(function (a, b) {
                return a.style.order - b.style.order;
            });


            for (var i in node.childNodes) {


                this.countLeafs(node.childNodes[i], leafs);
            }


        }

        if (node == this.rootNode)
            return leafs;

    };

    /**
     * TODO Javadoc
     * @param node
     * @param leafIterator
     * @param leafs
     */
    this.computeNodesYPosition = function (node, leafIterator, leafs) { //Compute vertical position of node

        if (node.style.folded || node.childNodes.length == 0) { //If node is folded node or leaf node, set the Y position

            var lineHeight = 80;

            if (node.orientation == 'left') {

                var BlockHeight = leafs.left * lineHeight;

                node.position.y = BlockHeight / (-2) + leafIterator.left * lineHeight;
                node.position.y = leafIterator.left * lineHeight - ((leafs.left - 1) * lineHeight ) / 2;

                leafIterator.left++;
            }
            else {

                var BlockHeight = leafs.right * lineHeight;

                node.position.y = BlockHeight / (-2) + leafIterator.right * lineHeight;
                node.position.y = leafIterator.right * lineHeight - ((leafs.right - 1) * lineHeight ) / 2;

                leafIterator.right++;
            }

            leafIterator++;
        }
        else { // Else, explore node's children and set the Y position

            for (var i in node.childNodes)
                this.computeNodesYPosition(node.childNodes[i], leafIterator, leafs);

            if (node != this.rootNode)
                node.position.y = (node.childNodes[0].position.y + node.childNodes[node.childNodes.length - 1].position.y) / 2;

        }

    };

    /**
     * TODO Javadoc
     * @param node
     */
    this.computeNodeXPosition = function (node) { //Correct position accroding to orientation


        if (node != this.rootNode && node.parent_node != this.rootNode)
            node.orientation = node.parent_node.orientation;

        if (node.orientation == 'left')
            node.style.dx = -Math.abs(node.style.dx);
        else if (node.orientation == 'right')
            node.style.dx = Math.abs(node.style.dx);

        if (node == this.rootNode)
            node.position.x = node.position.y = 0;
        else if (node.orientation == 'left') {

            if (node.parent_node == this.rootNode)
                node.position.x = node.parent_node.position.x - Math.abs(node.style.dx) - parseInt(node.parent_node.rectElement.getAttribute('width')) / 2;
            else
                node.position.x = node.parent_node.position.x - Math.abs(node.style.dx) - parseInt(node.parent_node.rectElement.getAttribute('width'));

        }
        else if (node.orientation == 'right') {

            if (node.parent_node == this.rootNode)
                node.position.x = node.parent_node.position.x + Math.abs(node.style.dx) + parseInt(node.parent_node.rectElement.getAttribute('width')) / 2;
            else
                node.position.x = node.parent_node.position.x + Math.abs(node.style.dx) + parseInt(node.parent_node.rectElement.getAttribute('width'));
        }

    };

    /**
     * TODO A supprimer ?
     * Return all of the descendants of a node
     * @param node
     * @returns {Array}
     */
    this.getDescendants = function (node) {

        var descendants = [];

        for (var i in node.childNodes) {

            descendants.push(node.childNodes[i].id);

            descendants = descendants.concat(this.getDescendants(node.childNodes[i]));

        }

        return descendants;

    };

    /**
     * Draw the mindmap
     * @param fromNode
     * @returns {boolean}
     */
    this.drawMap = function (fromNode) {

        if (this.syncDraw)
            this.syncDraw = false;
        else {
            console.log("abort");
            return false;
        }

        var leafs = this.countLeafs(this.rootNode, {left: 0, right: 0});

        this.computeNodesYPosition(this.rootNode, {left: 0, right: 0}, leafs);

        that = this;

        var traverse = function (node) {

            that.computeNodeXPosition(node);

            node.drawNode();

            for (var i in node.childNodes)
                traverse(node.childNodes[i]);


        };

        if (fromNode != undefined)
            traverse(fromNode);
        else
            traverse(this.rootNode);

        this.syncDraw = true;


    };


    /*===== MANAGERS =====*/

    /**
     * Local event manager
     * @type {eventManager}
     */
    this.eventManager = new function () {

        eventManager = this;

        this.eventType = null;
        this.eventData = null;

        this.on = function (e) {

            switch (eventManager.eventType) {

                case 'newNode':

                    switch (e.type) {


                        case 'mouseup':
                            eventManager.eventType = null;


                            //Ce case c'est là où l'utilisateur ajoute lui même un noeud
                            //TODO: Requête de création de noeud - Émission
                            //Faut demander l'id du noeud au serveur
                            //Puis Notification de modification du noeud
                            //Puis Notification de l'ordre de la fratrie du noeud


                            var style = {
                                "unifiedChildren": {
                                    "dx": false,
                                    "container": false,
                                    "font": false,
                                    "parentBranch": false
                                }
                            };

                            for (var i in eventManager.eventData.parent_node.childNodes) {
                                eventManager.eventData.parent_node.childNodes[i].style.order = i;
                            }

                            var orientation = (eventManager.eventData.attach.getAttribute("name") == "lx") ? "left" : "right";

                            var nearBrothers = mindmap.nearBrothersVerticalPosition(eventManager.eventData.parent_node.childNodes, e.clientY, eventManager.eventData.parent_node, orientation);
                            // console.log(nearBrothers)

                            if (nearBrothers.prevY_i == undefined)
                                style.order = -1;
                            else if (nearBrothers.nextY_i == undefined)
                                style.order = eventManager.eventData.parent_node.childNodes.length;
                            else {

                                style.order = (parseInt(eventManager.eventData.parent_node.childNodes[nearBrothers.prevY_i].style.order) + parseInt(eventManager.eventData.parent_node.childNodes[nearBrothers.nextY_i].style.order)) / 2;


                            }


                            if (eventManager.eventData.attach.getAttribute("name") == 'lx')
                                style.dx = -100;
                            else
                                style.dx = 100;

                            style.container = JSON.parse(JSON.stringify(eventManager.eventData.parent_node.style.container));
                            style.font = JSON.parse(JSON.stringify(eventManager.eventData.parent_node.style.font));
                            style.font.size = 16;
                            style.parentBranch = JSON.parse(JSON.stringify(eventManager.eventData.parent_node.style.parentBranch));

                            mindmap.ioManager.out.newNode(eventManager.eventData.parent_node.id, mindmap.worker, null, style);


                            //Tout ce qui concerne la création du noeud s'arrête ici

                            break;

                        case 'mousemove':

                            var attach_x = eventManager.eventData.parent_node.nodeElement.getBoundingClientRect().left;

                            mindmap.newBranchElement.style.display = "";

                            var middle_x = (mindmap.rootNode.nodeElement.getBoundingClientRect().left + mindmap.rootNode.nodeElement.getBoundingClientRect().width / 2);
                            var middle_y = (mindmap.rootNode.nodeElement.getBoundingClientRect().top + mindmap.rootNode.nodeElement.getBoundingClientRect().height / 2);

                            this.nodeConnecter = {};
                            this.nodeConnecter.x = e.clientX / mindmap.view.zoom - middle_x / mindmap.view.zoom;
                            this.nodeConnecter.y = e.clientY / mindmap.view.zoom - middle_y / mindmap.view.zoom;

                            if (eventManager.eventData.attach.getAttribute("name") == 'lx') {

                                if (eventManager.eventData.w <= 100 && (eventManager.eventData.parent_node.nodeConnecter.lx - nodeConnecter.x) > eventManager.eventData.w)
                                    eventManager.eventData.w = (eventManager.eventData.parent_node.nodeConnecter.lx - nodeConnecter.x);

                                if ((eventManager.eventData.parent_node.nodeConnecter.lx - nodeConnecter.x) < eventManager.eventData.w)
                                    nodeConnecter.x = eventManager.eventData.parent_node.nodeConnecter.lx - eventManager.eventData.w;

                                var path = 'M' + eventManager.eventData.parent_node.nodeConnecter.lx + ',' + eventManager.eventData.parent_node.nodeConnecter.y + ' ';
                                path += 'C' + (nodeConnecter.x + 0.333 * (eventManager.eventData.parent_node.nodeConnecter.lx - nodeConnecter.x)) + ',' + eventManager.eventData.parent_node.nodeConnecter.y + ' ';
                                path += (nodeConnecter.x + 0.666 * (eventManager.eventData.parent_node.nodeConnecter.lx - nodeConnecter.x)) + ',' + this.nodeConnecter.y + ' ';
                                path += nodeConnecter.x + ',' + this.nodeConnecter.y;

                            }
                            else if (eventManager.eventData.attach.getAttribute("name") == 'rx') {

                                if (eventManager.eventData.w <= 100 && -(eventManager.eventData.parent_node.nodeConnecter.rx - nodeConnecter.x) > eventManager.eventData.w)
                                    eventManager.eventData.w = -(eventManager.eventData.parent_node.nodeConnecter.rx - nodeConnecter.x);

                                if ((eventManager.eventData.parent_node.nodeConnecter.rx - nodeConnecter.x) > -eventManager.eventData.w)
                                    nodeConnecter.x = eventManager.eventData.parent_node.nodeConnecter.rx + eventManager.eventData.w;

                                var path = 'M' + eventManager.eventData.parent_node.nodeConnecter.rx + ',' + eventManager.eventData.parent_node.nodeConnecter.y + ' ';
                                path += 'C' + (eventManager.eventData.parent_node.nodeConnecter.rx + 0.666 * (nodeConnecter.x - eventManager.eventData.parent_node.nodeConnecter.rx)) + ',' + eventManager.eventData.parent_node.nodeConnecter.y + ' ';
                                path += (eventManager.eventData.parent_node.nodeConnecter.rx + 0.333 * (nodeConnecter.x - eventManager.eventData.parent_node.nodeConnecter.rx)) + ',' + this.nodeConnecter.y + ' ';
                                path += nodeConnecter.x + ',' + this.nodeConnecter.y;

                            }

                            mindmap.newBranchElement.setAttribute('d', path);

                            break;
                    }

                    break;

                case 'offsetMap':

                    switch (e.type) {

                        case 'mouseup':
                            eventManager.eventType = null;
                            window.document.body.style.cursor = "grab";

                        case 'mousemove':

                            var dx = (e.clientX - eventManager.eventData.cx + eventManager.eventData.ox * mindmap.view.zoom) / mindmap.view.zoom;
                            var dy = (e.clientY - eventManager.eventData.cy + eventManager.eventData.oy * mindmap.view.zoom) / mindmap.view.zoom;

                            mindmap.setView(dx, dy);

                            break;
                    }

                    break;

                case 'offsetNode':

                    switch (e.type) {

                        case 'mouseup':
                            eventManager.eventType = null;

                            if (eventManager.eventData.node != mindmap.rootNode)
                                mindmap.ioManager.out.editNodes(eventManager.eventData.node.parent_node.childNodes);

                            mindmap.selectNode(eventManager.eventData.node);

                        case 'mousemove':

                            if (eventManager.eventData.node == mindmap.rootNode)
                                break;

                            var dx = (e.clientX - eventManager.eventData.x) / mindmap.view.zoom + eventManager.eventData.dx;

                            var nearBrothers = mindmap.nearBrothersVerticalPosition(eventManager.eventData.node.parent_node.childNodes, e.clientY, eventManager.eventData.node, eventManager.eventData.node.orientation);

                            var prevY_i = nearBrothers.prevY_i;
                            var current_i = nearBrothers.current_i;
                            var nextY_i = nearBrothers.nextY_i;

                            if (prevY_i != null && current_i < prevY_i && prevY_i != nextY_i) {
                                mindmap.switchNodeInSiblings(eventManager.eventData.node, eventManager.eventData.node.parent_node.childNodes[prevY_i]);
                            }
                            else if (nextY_i != null && current_i > nextY_i && prevY_i != nextY_i) {
                                mindmap.switchNodeInSiblings(eventManager.eventData.node, eventManager.eventData.node.parent_node.childNodes[nextY_i]);
                            }

                            var middle_x = mindmap.rootNode.rectElement.getBoundingClientRect().left + mindmap.rootNode.rectElement.getBoundingClientRect().width / 2;

                            var delta_middle = Math.abs(middle_x - eventManager.eventData.x);

                            var change_side = false;

                            if (eventManager.eventData.node.orientation == 'left') {
                                if (-100 < dx)
                                    dx = -100;

                                if (eventManager.eventData.node.parent_node == mindmap.rootNode && e.clientX > middle_x) {
                                    eventManager.eventData.node.orientation = "right";
                                    change_side = true;

                                }


                            }
                            else if (eventManager.eventData.node.orientation == 'right') {
                                if (dx < 100)
                                    dx = 100;

                                if (eventManager.eventData.node.parent_node == mindmap.rootNode && e.clientX < middle_x) {
                                    eventManager.eventData.node.orientation = "left";
                                    change_side = true;
                                }

                            }


                            eventManager.eventData.node.style.dx = dx;

                            mindmap.drawMap(eventManager.eventData.node.parent_node);

                            if (change_side) {

                                if (eventManager.eventData.node.orientation == 'left') {
                                    eventManager.eventData.x = eventManager.eventData.node.rectElement.getBoundingClientRect().right - 1;
                                    eventManager.eventData.dx = -100;
                                }

                                else {
                                    eventManager.eventData.x = eventManager.eventData.node.rectElement.getBoundingClientRect().left + 1;
                                    eventManager.eventData.dx = 100;
                                }

                            }


                            break;
                    }

                    break;

                default:
                    eventManager.eventData = null;

                    switch (e.type) {

                        case "dblclick" :


                            if (e.target.nodeName == 'text' || e.target.nodeName == 'rect' || e.target.nodeName == 'line') {

                                var nodeId = e.target.parent_node.id;

                                if (mindmap.nodes[nodeId] != mindmap.rootNode && mindmap.nodes[nodeId].childNodes.length > 0) {

                                    mindmap.nodes[nodeId].style.folded = !mindmap.nodes[nodeId].style.folded;

                                    if (mindmap.nodes[nodeId].style.folded)
                                        mindmap.nodes[nodeId].hideNodeChildren();

                                    mindmap.drawMap();

                                }
                            }
                            else if (e.target.nodeName == 'g' && e.target.name == 'node') {

                                var nodeId = e.target.id;

                                if (mindmap.nodes[nodeId] != mindmap.rootNode && mindmap.nodes[nodeId].childNodes.length > 0) {

                                    mindmap.nodes[nodeId].style.folded = !mindmap.nodes[nodeId].style.folded;

                                    if (mindmap.nodes[nodeId].style.folded)
                                        mindmap.nodes[nodeId].hideNodeChildren();

                                    mindmap.drawMap();

                                }
                            }

                            break;


                        case 'mousedown':
                            if (e.target.nodeName == 'circle' && e.target.getAttribute("name") == "folder") {
                                //void
                            }

                            else if (e.target.nodeName == 'text' || e.target.nodeName == 'rect' || e.target.nodeName == 'line') {
                                eventManager.eventType = 'offsetNode';

                                var nodeId = e.target.parent_node.id;

                                eventManager.eventData = {
                                    x: e.clientX,
                                    y: e.clientY,
                                    node: mindmap.nodes[nodeId],
                                    dx: mindmap.nodes[nodeId].style.dx
                                };
                            }
                            else if (e.target.nodeName == 'circle' && (e.target.getAttribute("name") == "lx" || e.target.getAttribute("name") == "rx")) {
                                eventManager.eventType = 'newNode';

                                var nodeId = e.target.parent_node.id;

                                eventManager.eventData = {
                                    parent_node: mindmap.nodes[nodeId],
                                    attach: e.target,
                                    newNode: null,
                                    w: 0
                                };
                            }
                            else if (e.target.nodeName == 'g' && e.target.name == 'node') {
                                eventManager.eventType = 'offsetNode';

                                var nodeId = e.target.id;

                                eventManager.eventData = {
                                    x: e.clientX,
                                    y: e.clientY,
                                    node: mindmap.nodes[nodeId],
                                    dx: mindmap.nodes[nodeId].style.dx
                                };
                            }
                            // if(e.target.id == 'container') {
                            else {

                                window.document.body.style.cursor = "grabbing";

                                eventManager.eventType = 'offsetMap';
                                eventManager.eventData = {
                                    ox: mindmap.view.offset.x,
                                    oy: mindmap.view.offset.y,
                                    cx: e.clientX,
                                    cy: e.clientY
                                };
                            }
                            break;

                        case 'mousewheel':
                        case 'wheel' :

                            if ('wheelDelta' in e)
                                var zoom = e.wheelDelta > 0;
                            else if ('deltaY' in e)
                                var zoom = e.deltaY < 0;
                            else
                                break;

                            var zoom_coef = 1.2;

                            if (zoom) {
                                mindmap.view.zoom *= zoom_coef;
                                mindmap.view.offset.x -= (zoom_coef * e.clientX - e.clientX) / mindmap.view.zoom;
                                mindmap.view.offset.y -= (zoom_coef * e.clientY - e.clientY) / mindmap.view.zoom;

                            }
                            else {
                                mindmap.view.zoom /= zoom_coef;

                                mindmap.view.offset.x += (e.clientX - e.clientX / zoom_coef ) / mindmap.view.zoom;
                                mindmap.view.offset.y += (e.clientY - e.clientY / zoom_coef ) / mindmap.view.zoom;


                            }

                            mindmap.setView();

                            break;

                        // default:


                    }

            }
        };
    };

    /**
     * Distant event manager (i/o)
     * @type {ioManager}
     */
    this.ioManager = new function () {

        var basePath = window.location.pathname + "/";

        this.controller = function () {

            /* On se connecte au serveur */

            if (io.socket.isConnected()) {
                /* Handle the time to create MindMap Object */
                setTimeout(function () {
                    // On s'annonce au serveur
                    mindmap.ioManager.out.join();

                    // On traite les messages reçu !
                    io.socket.on('mindmap', mindmap.ioManager.in.negotiate);
                }, 200);
            } else {

                io.socket.on('connect', function socketConnected() {

                    console.log("Socket : connexion reussie !");

                    // On s'annonce au serveur
                    mindmap.ioManager.out.join();

                    // On traite les messages reçu !
                    io.socket.on('mindmap', mindmap.ioManager.in.negotiate);
                });
            }
        };

        this.out = new function () {

            this.join = function () {

                io.socket.post(basePath + "join", function (data) {
                    // Subscribe to mindmap event and receive all the mindmap once

                    console.log("Parsing data ...");
                    console.log(data);

                    mindmap.setWorker(data.user);
                    _.forEach(data.nodes, function (n) {
                        mindmap.ioManager.in.createdNode(n);
                    });

                });
            };

            this.leave = function () {

                //TODO: Leave, ici je sais pas quand on l'appel x)

            }


            ////When user query server to get the id of a new node
            this.newNode = function (parent_nodeId, worker, permission, style) {

                console.log("Out : demande création noeud");

                io.socket.post(basePath + "node/new", {
                    nodes: [{
                        parent_node: parent_nodeId,
                        style: style,
                        label: 'New node',
                        permission: permission
                    }]
                }, function (nodes) {
                    // Request creation of a new node (receive nodes newly created)

                    _.forEach(nodes, function (n) {
                        mindmap.ioManager.in.createdNode(n);
                    });
                });
            };

            //When user edit node
            this.editNode = function (node, updateStyle) {

                console.log("Out : edit Node", node);

                var path = basePath + "node/update/" + (updateStyle) ? 'yes' : 'no'

                io.socket.post(path, {
                    nodes: [{
                        parent_node: node.parent_node.id,
                        style: node.style,
                        label: node.label,
                        id: node.id
                    }]
                }, function (nodes) {

                    _.forEach(nodes, function (n) {
                        mindmap.ioManager.in.editNode(0, n, false);
                    });

                });
            };

            //When user edit several nodes
            this.editNodes = function (nodes) {

                console.log("Out : edit several Nodes", nodes);

                var path = basePath + "node/update/yes";

                var data = {nodes: []};

                _.forEach(nodes, function (n) {
                    data.nodes.push({
                        parent_node: n.parent_node.id,
                        style: n.style,
                        label: n.label,
                        id: n.id
                    });
                });

                io.socket.post(path, data, function (nodes) {

                    _.forEach(nodes, function (n) {
                        mindmap.ioManager.in.editNode(0, n, false);
                    });

                });
            };

            //When user unselect a node
            this.unselectNode = function (node) {

                console.log("Out : unselect Node", node);

                //TODO: Notification de déséléction - Émission
                //Données utiles : node.id
            }

            //When user select a node
            this.selectNode = function (node) {

                console.log("Out : select Node", node);

                //TODO: Notification de séléction - Émission
                //Données utiles : node.id
            }

            //When user delete nodes
            this.deleteNodes = function (ids) {

                console.log("Out : delete Node", ids);

                //TODO: Notification de suppression de noeud - Émission
                //Données utiles : id

                var data = {nodes: []};

                _.forEach(ids, function (n) {
                    data.nodes.push({
                        id: n
                    });
                });

                io.socket.post(basePath + "node/delete", data, function (ids) {

                    _.forEach(ids, function (n) {
                        mindmap.ioManager.in.deleteNode(0, n);
                    });

                });
            }

        };

        this.in = new function () {

            this.createdNode = function (node) {

                if (node.worker != null) { //Si le noeud possède un worker courant
                    if (mindmap.workers[node.worker] != null) { //Si le worker existe déjà
                        mindmap.nodes[mindmap.workers[node.worker]].worker = null; //On déséléctionne son noeud courant
                    }
                    mindmap.workers[node.worker] = node.id; //On séléctionne le nouveau noeud
                }
                console.log(node);
                mindmap.nodes[node.id] = new MindmapNode(node.id, mindmap.nodes[node.parent_node], node.worker, node.permission, node.style, node.label);
                node = mindmap.nodes[node.id];


                if (node.parent_node) {
                    node.parent_node.childNodes.sort(function (a, b) {
                        return a.style.order - b.style.order;
                    });

                    for (var i in node.parent_node.childNodes) {

                        node.parent_node.childNodes[i].style.order = i;
                    }
                }
                mindmap.newBranchElement.style.display = "none"; //bug risk

                mindmap.drawMap();

                console.log("In : Node created");
            };


            //When a collaborator select a node
            this.selectNode = function (workerId, nodeId) {

                if (!(nodeId in mindmap.nodes)) return;

                //Si le worker était sur un noeud, on le lui déséléctionne
                if (workerId in mindmap.workers && mindmap.workers[workerId] != null) {

                    if (mindmap.workers[workerId] in mindmap.nodes) {
                        mindmap.nodes[mindmap.workers[workerId]].worker = null;
                        mindmap.nodes[mindmap.workers[workerId]].drawNode();
                    }

                }

                //On séléctionne le nouveau noeud

                mindmap.workers[workerId] = nodeId;

                mindmap.nodes[nodeId].worker = workerId;

                //Si l'user est sur ce noeud, on l'enlève

                if (mindmap.getSelectedNode() != null && mindmap.getSelectedNode().id == nodeId)
                    mindmap.setSelectedNode(null);

                mindmap.nodes[nodeId].drawNode();

                console.log("In : Node selected");

            };

            //When a collaborator unselect a node
            this.unselectNode = function (workerId, nodeId) {

                mindmap.workers[workerId] = null;
                mindmap.nodes[nodeId].worker = null;
                mindmap.nodes[nodeId].drawNode();

                console.log("In : Node unselected");

            };

            /*
             //When a collaborator force me to unselect a node
             this.looseNode = function (workerId, nodeId) {

             console.log("In : loose Node selection");

             };*/

            //When a collaborator edit a node
            this.editNode = function (workerId, node, isMe) {

                mindmap.nodes[node.id].editNode(workerId, node.label, node.style, isMe);

                console.log("In : Node edited");

            };

            //When a collaborator delete a node
            this.deleteNode = function (workerId, nodeId) {


                var traverseDelete = function (node) {

                    if (!node) return;

                    _.forEach(node.childNodes, function (n) {
                        traverseDelete(mindmap.nodes[n]);
                    });

                    mindmap.workers[node.worker] = null;

                    node.destroyNode();

                };

                traverseDelete(mindmap.nodes[nodeId]);

                mindmap.drawMap();

                console.log("In : Node deleted");

            };


            this.negotiate = function (message) {
                switch (message.verb) {

                    case 'messaged':
                        switch (message.data.header) {
                            case 'Chat_public':
                                // TODO Ajouter le message à la liste ^^
                                break;
                            case 'New_nodes':
                                _.forEach(message.data.msg, function (n) {
                                    mindmap.ioManager.in.createdNode(n);
                                });
                                break;
                            case 'Update_nodes_w_style':
                            case 'Update_nodes':
                                _.forEach(message.data.msg, function (n) {
                                    mindmap.ioManager.in.editNode(0, n, false);
                                });
                                break;
                            case 'Delete_nodes':
                                _.forEach(message.data.msg, function (n) {
                                    mindmap.ioManager.in.deleteNode(0, n);
                                });
                                break;

                        }
                        // TODO Ajouter toutes les possibilités (select/ edit/ delete)
                        break;

                    default:
                        break;
                }
            }

        };

        this.controller();
    };


    /*===== LAUNCH =====*/

    this.initialize();
}