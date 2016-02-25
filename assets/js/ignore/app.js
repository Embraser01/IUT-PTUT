/*
 * Format de reception de noeud depuis le serveur (exemple)
 *
 * nodes: [{
 *          id: id_du_noeud,
 *          parentNode: id_du_noeud_parent,
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
basePath = window.location.pathname + "/";

MindmapFrame = function (c) {


    /*===== OBJECT DECLARATION =====*/

    /**
     * MindMap Node Object
     *
     * @param id {Integer} Node unique identifiant
     * @param parentNode {MindmapNode}Parent node
     * @param worker id of the user who work on this node
     * @param permissions ?? permissions of the user for this node
     * @param style {Object} Style of the node
     * @param label {String} Label of the node
     * @constructor
     */
    MindmapNode = function (id, parentNode, worker, permissions, style, label) {


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
        this.parentNode = parentNode;

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
        this.permissions = permissions;
		
		if(permissions == null) {
			this.permissions = {
								"p_read" : false,
								"p_write" : false,
								"p_delete" : false,
								"p_unlock" : false,
								"p_assign" : false
								};
		}


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

		this.cutAction = null;
		
        /*===== FUNCTIONS =====*/

        /**
         * Initialisation function
         */
        this.init = function () {
			
			this.cutAction = false;

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
            if (this.parentNode != null) {

                if (this.parentNode.parentNode == undefined)
                    this.orientation = (this.style.dx < 0) ? 'left' : 'right';
                else
                    this.orientation = this.parentNode.orientation;

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
         * Recursive function to show all children
         */
        this.showNodeChildren = function () {

            var traverse = function (node) {
                _.forEach(node.childNodes, function (n) {
                    n.showNode();
                    traverse(n);
                });
            };
            traverse(this);

        };

        this.orderizeChildren = function () {

            if (this.parentNode) {
                this.parentNode.childNodes.sort(function (a, b) {
                    return parseFloat(a.style.order) - parseFloat(b.style.order);
                });

                for (var i in this.parentNode.childNodes) {
                    this.parentNode.childNodes[i].style.order = parseInt(i);
                }

                // console.log(this.label, this.parentNode.childNodes);
            }
        };

        this.orderizeDescendance = function () {

            var traverse = function (node) {
                _.forEach(node.childNodes, function (n) {
                    n.orderizeChildren();
                    traverse(n);
                });
            };
            traverse(this);

        };

        this.viewNode = function () {

            var nx = parseInt(document.body.offsetWidth / 2) / mindmap.view.zoom - this.position.x;
            var ny = parseInt(document.body.offsetHeight / 2) / mindmap.view.zoom - this.position.y;

            if (mindmap.rootNode == this)
                nx += 0;
            else if (this.orientation == "left")
                nx += parseFloat(this.rectElement.getAttribute("width")) / 2;
            else if (this.orientation == "right")
                nx -= parseFloat(this.rectElement.getAttribute("width")) / 2;

            mindmap.setView(nx, ny);

        };

        /**
         * Draw the node with the style attribute
         */
        this.drawNode = function () {
			
			this.cutAction = "type" in mindmap.action && "src" in mindmap.action && mindmap.action.type == "cut" && (mindmap.action.src == this || (this.parentNode != undefined && this.parentNode.cutAction));
			
			// // console.log(this.cutAction);
			
            var nodePosition = {
                x: this.position.x,
                y: this.position.y
            };

            var tmpStyle = JSON.parse(JSON.stringify(this.style));

            this.textElement.childNodes[0].nodeValue = this.label;

            //folder correction

            if (this == mindmap.rootNode) {
                this.style.folded = false;

            }


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

                this.style.container.background = '#42a5f5'; //TODO, bg selon couleur de la branche
                tmpStyle.font.color = '#ffffff'; //TODO, selon bg
                tmpStyle.font.weight = 'normal';
                tmpStyle.font.style = 'normal';
                tmpStyle.font.decoration = 'none';


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
            this.textElement.setAttribute('fill', tmpStyle.font.color);

            if (tmpStyle.font.weight == 'bold')
                this.textElement.style.fontWeight = 'bold';
            else
                this.textElement.style.fontWeight = 'normal';

            if (tmpStyle.font.style == 'italic')
                this.textElement.style.fontStyle = 'italic';
            else
                this.textElement.style.fontStyle = 'normal';

            if (tmpStyle.font.decoration == 'underline')
                this.textElement.style.textDecoration = 'underline';
            else if (tmpStyle.font.decoration == 'strike')
                this.textElement.style.textDecoration = 'line-through';
            else
                this.textElement.style.textDecoration = 'none';


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
				
				if(this.cutAction) {
					
					this.lineElement.setAttribute('stroke-dasharray', "5,5");
					
				}
				else {
					
					this.lineElement.setAttribute('stroke-dasharray', "");
					
				}

                this.textElement.setAttribute('y', textTop + rectHeight / 2 - textHeight - 4);


            }
            else {
                this.lineElement.setAttribute('stroke', 'transparent');
                this.lineElement.setAttribute('stroke-width', 0);
            }
            // lineElement.style.filter = selection ? 'drop-shadow(5px 5px 7px #888)' : '';


            if (this == mindmap.rootNode)
                nodePosition.x = 0;
            else if (this.orientation == 'left')
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
                this.lockElement.setAttribute("fill", "#4caf50");
            else
                this.lockElement.setAttribute("fill", "#f44336");

            if (this == mindmap.rootNode) {
                this.leftConnecterElement.style.display = "";
                this.rightConnecterElement.style.display = "";
            }
            else if (!this.style.folded) {
                if (this.orientation != 'right')
                    this.leftConnecterElement.style.display = "";
                else if (this.orientation != 'left')
                    this.rightConnecterElement.style.display = "";

            }


            //branchElement init

            if (this.parentNode != null) {

                //edit pathEelement.d
                if (this.position.x < this.parentNode.position.x) {

                    var path = 'M' + this.parentNode.nodeConnecter.lx + ',' + this.parentNode.nodeConnecter.y + ' ';
                    path += 'C' + (this.nodeConnecter.rx + 0.333 * (this.parentNode.nodeConnecter.lx - this.nodeConnecter.rx)) + ',' + this.parentNode.nodeConnecter.y + ' ';
                    path += (this.nodeConnecter.rx + 0.666 * (this.parentNode.nodeConnecter.lx - this.nodeConnecter.rx)) + ',' + this.nodeConnecter.y + ' ';
                    path += this.nodeConnecter.rx + ',' + this.nodeConnecter.y;

                }
                else {

                    var path = 'M' + this.parentNode.nodeConnecter.rx + ',' + this.parentNode.nodeConnecter.y + ' ';
                    path += 'C' + (this.parentNode.nodeConnecter.rx + 0.666 * (this.nodeConnecter.lx - this.parentNode.nodeConnecter.rx)) + ',' + this.parentNode.nodeConnecter.y + ' ';
                    path += (this.parentNode.nodeConnecter.rx + 0.333 * (this.nodeConnecter.lx - this.parentNode.nodeConnecter.rx)) + ',' + this.nodeConnecter.y + ' ';
                    path += this.nodeConnecter.lx + ',' + this.nodeConnecter.y;

                }

                this.branchElement.setAttribute('d', path);
                this.branchElement.setAttribute('fill', 'none');
                this.branchElement.setAttribute('stroke', '#42a5f5');
                this.branchElement.setAttribute('stroke-width', '4');
               
				
				if(mindmap.action.src != this && this.cutAction == true) {
					
					this.branchElement.setAttribute('stroke-dasharray', "5,5");
					
				}
				else {
					
					this.branchElement.setAttribute('stroke-dasharray', "");
					
				}
				

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

            // // console.log(this.label, style)

            if (style) {


                if ("dx" in style) {
                    this.style.dx = style.dx;

                    //TODO: Risque de bug, peut être que ce test ne s'applique qu'à la première génération
                    if (this.style.dx < 0)
                        this.orientation = 'left';
                    else
                        this.orientation = 'right';
                }


                if ("order" in style)
                    this.style.order = style.order;

                if ("folded" in style) {

                    var refreshFolded = (this.style.folded != style.folded);

                    this.style.folded = style.folded;

                    if (refreshFolded) {
                        if (this.style.folded)
                            this.hideNodeChildren();
                        else
                            this.showNodeChildren();
                    }
                }


                if ("container" in style && "width" in style.container)
                    this.style.container.width = style.container.width;

                if ("font" in style) {

                    _.forEach(style.font, function (n, key) {
                        this.style.font[key] = n;

                    }.bind(this));
                }

                if ("parentBranch" in style && "color" in style.parentBranch)
                    this.style.parentBranch.color = style.parentBranch.color;

                if ("unifiedChildren" in style) {
                    drawFromParent = true;

                    _.forEach(style.font, function (n, key) {
                        this.style.unifiedChildren[key] = n;
                    }.bind(this));
                }
            }

            if (drawFromParent && this.parentNode != null)
                mindmap.drawMap(this.parentNode);
            else
                mindmap.drawMap(this);


            // TODO Bouger la fonction à la vraie edition et appeler cette fonction après la réponse serveur
            if (isMe) mindmap.ioManager.out.editNode(this, true);
        };

        /**
         * Destroy the node (and all child)
         */
        this.destroyNode = function () {

            mindmap.layers.nodes.removeChild(this.nodeElement);
            mindmap.layers.branchs.removeChild(this.branchElement);

            var parentChildId = this.parentNode.childNodes.indexOf(this);

            this.parentNode.childNodes.splice(parentChildId, 1);

            delete mindmap.nodes[this.id];

        };
		
		this.hasPerm = function (permKey) {
			
			return (typeof(this.permissions) == "object" && permKey in this.permissions && this.permissions[permKey]);
			
		};


        /*===== INITIALISATION =====*/

        if (parentNode != null)
			parentNode.childNodes.push(this);
       // else
		//	mindmap.rootNode = this;

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
	
	this.action = {type : null, src : null, dest : null};


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

        this.setView(parseInt(document.body.offsetWidth / 2), parseInt(document.body.offsetHeight / 2), 2);

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

		if(node == null)
			return;
	
		if (node.worker == mindmap.worker) {
			//nothing
		}
        else if (node.worker == null) { //If the node isn't currently selected by the user or a contributor

            if (this.getSelectedNode() != null) //If user has already selected a node
                this.unselectNode(false);

            node.worker = this.worker;
            mindmap.setSelectedNode(eventManager.eventData.node.id);

            mindmap.getSelectedNode().drawNode();

            // TODO Wait for confirmation before select
            mindmap.ioManager.out.selectNode(node);
        } else {
			
			if(node.hasPerm('p_unlock')) {
				
				notificationManager.push("Ce noeud est verrouillé", "Le dévérouiller", function () {
					mindmap.ioManager.out.unselectNode(node);
				});
				
			}
			else {
				
				notificationManager.push("Vous n'avez pas le droit de déverouiller ce noeud", "", null);
				
			}
        }

    };


    // Misc

    /**
     * TODO Javadoc
     * @param childNodes
     * @param clientY
     * @param parentNode
     * @param orientation
     * @returns {{prevY_i: *, current_i: *, nextY_i: *}}
     */
    this.nearBrothersVerticalPosition = function (childNodes, clientY, parentNode, orientation) {

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

            if (node_i == parentNode)
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

            if (ids_to_delete) mindmap.ioManager.out.deleteNodes(ids_to_delete, true);

            this.drawMap();

        }
    };

    /**
     * Set the user id in the list of worker
     * @type {null}
     */
    this.setWorker = function (user_id) {
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


        if (node != this.rootNode && node.parentNode != this.rootNode)
            node.orientation = node.parentNode.orientation;

        if (node.orientation == 'left')
            node.style.dx = -Math.abs(node.style.dx);
        else if (node.orientation == 'right')
            node.style.dx = Math.abs(node.style.dx);

        if (node == this.rootNode)
            node.position.x = node.position.y = 0;
        else if (node.orientation == 'left') {

            if (node.parentNode == this.rootNode)
                node.position.x = node.parentNode.position.x - Math.abs(node.style.dx) - parseInt(node.parentNode.rectElement.getAttribute('width')) / 2;
            else
                node.position.x = node.parentNode.position.x - Math.abs(node.style.dx) - parseInt(node.parentNode.rectElement.getAttribute('width'));

        }
        else if (node.orientation == 'right') {

            if (node.parentNode == this.rootNode)
                node.position.x = node.parentNode.position.x + Math.abs(node.style.dx) + parseInt(node.parentNode.rectElement.getAttribute('width')) / 2;
            else
                node.position.x = node.parentNode.position.x + Math.abs(node.style.dx) + parseInt(node.parentNode.rectElement.getAttribute('width'));
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
            // console.log("abort");
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

    this.keyboardManager = new function () {

        keyboardManager = this;

        this.shift = false;
        this.ctrl = false;
        this.alt = false;

        window.onkeydown = function (e) {

			// if(e.keyCode == 116) return true;
		
            switch (e.keyCode) {

                case 16:
                    keyboardManager.shift = true;
                    return false;
                case 17:
                    keyboardManager.ctrl = true;
                    return false;
                case 18:
                    keyboardManager.alt = true;
                    return false;

            }
			
			
			
			if(keyboardManager.ctrl) {
				
				switch (e.keyCode) {
                    case 67: //C
					
						break;
					case 68: //D
						return false;
						
                    case 86: //V
						
					
						return false;
					case 88: //X
						return false;

				}
				
			}
			
			// return false;
        };

        window.onkeyup = function (e) {

            switch (e.keyCode) {

                case 16:
                    keyboardManager.shift = false;
                    break;
                case 17:
                    keyboardManager.ctrl = false;
                    break;
                case 18:
                    keyboardManager.alt = false;
                    break;			

            }

            if (keyboardManager.ctrl) {

                switch (e.keyCode) {
                    case 65: //A

                        break;
                    case 67: //C
					
					
						var node = mindmap.getSelectedNode();
						
						if(node != undefined && node != mindmap.rootNode) {
							
							
							var nodesStack = [];
							
							var traverse = function (node) {
								nodesStack.push({id : node.id, parentNodeId : node.parentNode.id, data : {label : node.label, style : node.style}});
								_.forEach(node.childNodes, function (n) {
									traverse(n);
								});
							};
							traverse(node);
					
							mindmap.action.type = "copy";
							mindmap.action.src = nodesStack;									
							mindmap.action.dest = null;	
							
							//TODO notification copier
							
						}
						
						

						/*
						var node = mindmap.getSelectedNode();
						
						if(node != undefined && node != mindmap.rootNode) {
							
							if(mindmap.action == undefined || mindmap.action != node) {
								mindmap.action.type = "copy";
								mindmap.action = node;									
							}
							else {
								mindmap.action = null;								
								mindmap.action.type = null;
							}
						}*/
							
						mindmap.drawMap();

                        break;
                    case 68: //D
					
						mindmap.action.type = null;
						mindmap.action.src = null;
						mindmap.action.dest = null;
					
						
						mindmap.drawMap();

                        break;
                    case 86: //V
					
						var node = mindmap.getSelectedNode();
						
						if(node != null && node.hasPerm("p_write")) {
						
							mindmap.ioManager.out.cutPaste();
							
							mindmap.ioManager.out.copyPaste();
							}
						
						mindmap.drawMap();

                        break;
                    case 88: //X
					
						var node = mindmap.getSelectedNode();
						
						if(node != undefined && node != mindmap.rootNode) {
							
							if(mindmap.action == undefined || mindmap.action.src != node) {
								mindmap.action.type = "cut";
								mindmap.action.src = node;									
								mindmap.action.dest = null;									
							}
							else {
								mindmap.action.dest = null;								
								mindmap.action.src = null;								
								mindmap.action.type = null;
							}

							
							mindmap.drawMap();
							
						}

                        break;
                    case 89: //Y

                        break;
                    case 90: //Z

                        break;

                }
				
				return false;
            }
			else {
				
				if(e.keyCode == 46) {//SUPPR
				
					var node = mindmap.getSelectedNode();
					if(node != null && node.hasPerm("p_delete"))
						document.getElementById('editBox_deleteButton').click();
				
					return false;
				}
				else {
					return true;
				}
				
			}
			
			
        };


    };

    this.hashManager = new function () {

        hashManager = this;

        this.fixHashValue = false;

        this.fixHashObserver = function () {

            if (hashManager.fixHashValue != window.location.hash) {

                hashManager.fixHashValue = window.location.hash;

                hashManager.on();

            }

            setTimeout(hashManager.fixHashObserver, 250);

        };

        this.on = function () {

            var hash = window.location.hash;

            var split = hash.substr(1).split(':');

            if (split.length == 2) {

                if (split[0] == 'node' && split[1] in mindmap.nodes) {

                    mindmap.nodes[split[1]].viewNode();

                }

            }

        };

        if (false && 'onhashchange' in window)
            window.onhashchange = hashManager.on;

        else
            hashManager.fixHashObserver();


    };

    this.workersListManager = new function () {

        workersListManager = this;

        this.workersListElement = document.getElementById('workers');

        this.findWorker = function (id) {

            var allWorkers = this.workersListElement.children;

            for (var i in allWorkers) {

                if (allWorkers[i].tagName == "DIV" && allWorkers[i].getAttribute("name") == id)
                    return allWorkers[i];

            }

            return undefined;
        };

        this.removeWorker = function (user) {

            var worker = workersListManager.findWorker(user.id);

            if (worker != undefined) {

                workersListManager.workersListElement.removeChild(worker);
            }
        };

        this.addWorker = function (user) {
            // console.log(user);

            var worker = document.createElement("DIV");

            worker.setAttribute("name", user.id);

            worker.setAttribute("style", 'background-image:url(' + (user.img_url || '/images/default/' + (user.display_name.charAt(0).toLowerCase()) + '.png') + ');');

            worker.innerHTML = '<span>' + user.display_name + '</span>';

            worker.onclick = function () {

                var id = this.getAttribute("name");

                if (id in mindmap.workers) {

                    var nodeId = mindmap.workers[id];

                    if (nodeId != undefined) {

                        window.location.hash = "#node:" + nodeId;
                    }
                }
            };

            workersListManager.workersListElement.appendChild(worker);
        };
    };

    this.chatBoxManager = new function () {

        chatBoxManager = this;

        this.inputElement = document.getElementById("chatBoxInputElement");
        this.submitElement = document.getElementById("chatBoxInputSend");
        this.messages = document.getElementById("chatBoxMessages");
        this.scroller = document.getElementById("chatBoxScroller");

        this.nb_page = 2;

        this.postMessage = function () {

            var messageData = {
                msg: chatBoxManager.inputElement.value
            };


            io.socket.post(basePath + "chat/public", messageData, function (data) {

                chatBoxManager.inputElement.value = "";
                mindmap.chatBoxManager.onMessage(data);

            });
        };

        this.submitElement.onclick = this.postMessage;

        this.inputElement.onkeyup = function (e) {
            if (e.keyCode == 13)
                chatBoxManager.postMessage();
        };

        this.onMessage = function (messageData, addTop) {

            var message = document.createElement("tr");

            message.innerHTML = '<td class="picture"> \
							<div style="background-image:url(' + (messageData.user.img_url || '/images/default/' + (messageData.user.display_name.charAt(0).toLowerCase()) + '.png') + ')"></div> \
						</td> \
						<td> \
							<div class="author"> \
								' + messageData.user.display_name + ' <span class="time">' + messageData.createdAt.substr(11, 5) + '</span> \
							</div> \
							<div class="message"> \
								' + messageData.data + '\
							</div> \
						</td>';

            if (!addTop) {
                chatBoxManager.messages.appendChild(message);
                chatBoxManager.scroller.scrollTop = chatBoxManager.scroller.scrollHeight;
            }
            else {

                chatBoxManager.messages.insertBefore(message, chatBoxManager.messages.firstChild);
            }
        };

        this.scroller.onscroll = function () {

            if (chatBoxManager.scroller.scrollTop == 0) {

                var messageData = {
                    page: chatBoxManager.nb_page
                };
                chatBoxManager.nb_page++;

                io.socket.post(basePath + "chat/getAll", messageData, function (data) {
                    _.forEach(data, function (message) {
                        mindmap.chatBoxManager.onMessage(message, true);
                    });
                });
            }
        };


    };
	
	this.notificationManager = new function () {
		
		notificationManager = this;
		
        this.notificationElement = document.getElementById("notification");
		this.delay = null;
		this.transition = null;
		
		this.pop = function (callback) {
			
			notificationManager.notificationElement.classList.add('hidden');
			notificationManager.transition = setTimeout(function (callback) {
				notificationManager.notificationElement.classList.add('displaynone');
				if(typeof(callback) == "function")
					callback();
				
			}, 500, callback);
			
		};
		
		this.push = function (message, action, callback) {
			
			this.notificationElement.classList.remove('displaynone');
			
			clearTimeout(notificationManager.transition);
			notificationManager.transition = setTimeout(function (message, action, callback) {
				
				notificationManager.notificationElement.classList.remove('hidden');
				
				notificationManager.notificationElement.innerHTML = message + " <a>"+action+"</a>";
				notificationManager.notificationElement.children[0].onclick = function () {
					notificationManager.pop();
					if(typeof(callback) == "function")
						callback();
				};
				
				clearTimeout(notificationManager.delay);
				notificationManager.delay = setTimeout(notificationManager.pop, 5000);
			
			}, 300, message, action, callback);
		};
	};
	
    this.permBoxManager = new function () {

        permBoxManager = this;

        this.permBoxManagerContainer = document.getElementById("permBox");

        this.searchDelay = null;

		this.updateView = function (entities) {
			
			var out = "";
			
			var node = mindmap.getSelectedNode();
			
			
			
			var canIAssignPerm = (node != null) ? node.hasPerm('p_assign') : false;
			
			var p = {
				"p_read" : 'visibility',
				"p_write" : 'create',
				"p_delete" : 'delete',
				"p_unlock" : 'lock_open',
				"p_assign" : 'assignment_ind'
				};
			
			if(node != undefined || entities.length == 0) {
				
				for(var i in entities) {
					
					var id = entities[i].id;
					var kind = entities[i].isUser ? 'u' : 'g';
			
					out += '<span name="'+id+'"><i name="'+kind+'" class="material-icons entity">';
					if(entities[i].isUser)
						out += 'account_circle';
					else
						out += 'group_work';
					out += '</i> ';
					out += entities[i].name;
					if(entities[i].isOwner)
						out += ' (propriétaire)';
					out += '</span>';
					out += '<div class="perms">';
					
					for(var j in p) {
						
						var checked = entities[i].perms[j] ? 'checked="checked"' : '';
						var disabled = (!canIAssignPerm || entities[i].isOwner) ? 'disabled' : '';
						
						out+= '<div>';
							out+= '<label>';
								out+= '<input name="'+j+'" type="checkbox" class="rightpicker" '+disabled+' '+checked+' />';
								out+= '<span>&#x2713;</span>';
								out+= '<i class="material-icons">'+p[j]+'</i>';
							out+= '</label>';
						out+= '</div>';
						
					}
					
					out += '</div>';
					
				}
				
			}
			else {
				out = "Aucun résultat";
			}

			
			document.getElementById("permBoxResult").innerHTML = out;
			
			
			var checkboxs = document.getElementById("permBoxResult").getElementsByTagName("input");
			
			for(var i = 0; i < checkboxs.length; i++) {
				
				checkboxs.item(i).onchange = function () {
					
					var id = this.parentNode.parentNode.parentNode.previousElementSibling.getAttribute("name");
					var isUser = (this.parentNode.parentNode.parentNode.previousElementSibling.children["0"].getAttribute("name") == 'u')
					
					var permKey = this.getAttribute("name");
					var permValue = this.checked;
					
					//TODO 2: Fixer une permission en fonction de id, isUser, permKey et permValue
					/*io.socket.post(basePath + ".../...", function (data) {
						
						rien à faire en retour
						
					});*/
					
					if(permKey == "p_write" && permValue) {
						var checkboxRead = this.parentNode.parentNode.parentNode.children["0"].children["0"].children["0"];
						checkboxRead.checked = true;
						checkboxRead.onchange();
					}
					
					
				};
				
			}
			
		};
		

		
		this.updateModel = function () {
			
			var search = document.getElementById("permBoxSearchElement").value;
			
			//TODO 3: Retour de la recherche d'un utilisateur ou d'un groupe dans le menu des permissions
			/*io.socket.post(basePath + ".../...", function (data) {
				
				data au format :
				
					[	
						{
						"id" : 42,
						"name" : "Benji Chaz",
						"isOwner" : true,
						"isUser" : true,
						"perms" : {
							"p_read" : true,
							"p_write" : true,
							"p_delete" : true,
							"p_unlock" : true,
							"p_assign" : true
							}
						},
						...
					]
					
					
					
				permBoxManager.updateView(data); // On oublie pas de mettre à jour le modèle ensuite
			});*/
			
		};
		
		document.getElementById("permBoxSearchElement").onkeyup = function () {
			
			if(this.searchDelay != null)
				clearTimeout(this.searchDelay);
			
			this.searchDelay = setTimeout(permBoxManager.updateModel, 400);
			
		};
		
		this.permBoxManagerContainer.onload = function () {
			
			
			document.getElementById("permBoxSearchElement").value = "";
			
			// permBoxManager.updateModel(); //TODO prod, décommenter cette ligne et osef des deux suivantes
			
		entities_test = [
		
			{
			"id" : 1,
			"name" : "Benji Chaz",
			"isOwner" : true,
			"isUser" : true,
			"perms" : {
				"p_read" : true,
				"p_write" : true,
				"p_delete" : true,
				"p_unlock" : true,
				"p_assign" : true
				}
			},
			{
			"id" : 1,
			"name" : "Administrateurs",
			"isOwner" : false,
			"isUser" : false,
			"perms" : {
				"p_read" : false,
				"p_write" : false,
				"p_delete" : false,
				"p_unlock" : false,
				"p_assign" : true
				}
			},
			{
			"id": 2,
			"name" : "Boris Bo",
			"isOwner" : false,
			"isUser" : false,
			"perms" : {
				"p_read" : true,
				"p_write" : true,
				"p_delete" : false,
				"p_unlock" : false,
				"p_assign" : true
				}
			}
			
		
		];
		
			permBoxManager.updateView(entities_test);//commenter cette ligne
			
		};
		
	};

    this.editBoxManager = new function () {

        editBoxManager = this;

        this.editBox = document.getElementById("editBoxForm");
        this.editBoxContainer = document.getElementById("editBox");

        this.syncDelay = null;
        this.label = null;
        this.style = null;


        this.labelLoad = function () {
            if (mindmap.getSelectedNode() != undefined) {
                editBoxManager.label = mindmap.getSelectedNode().label;
                return true;
            }
            return false;
        };

        this.styleLoad = function () {
            if (mindmap.getSelectedNode() != undefined) {
                editBoxManager.style = mindmap.getSelectedNode().style;
                return true;
            }
            return false;
        };
		
		this.focus = function () {
                this.editBox.elements["editBox_label"].focus();			
		};

        this.load = function () {

            if (mindmap.getSelectedNode() != undefined) {

                this.labelLoad();
                this.styleLoad();
                this.updateView();

            }
        };

        this.editBox.onsubmit = function () {
            return false;
        };

        this.editBox.elements["editBox_label"].onkeyup = function () {
            if (editBoxManager.labelLoad()) {
                editBoxManager.label = this.value;

                if (this.syncDelay != undefined)
                    clearTimeout(this.syncDelay);

                this.syncDelay = setTimeout(editBoxManager.sync, 300);
            }
        };


        this.editBox.elements["editBox_family"].onchange = function () {
            if (editBoxManager.styleLoad()) {
				
				if(this.selectedOptions[0].getAttribute('name') != null) {

					this.style.fontFamily = this.value;
					editBoxManager.style.font.family = this.value;
					editBoxManager.sync();
				
				}
            }
        };
		
        this.editBox.elements["editBox_color"].onchange = function () {
            if (editBoxManager.styleLoad()) {
				
				if(this.selectedOptions[0].getAttribute('name') != null) {
				
					this.style.color = this.selectedOptions[0].getAttribute('name');
					editBoxManager.style.font.color = this.selectedOptions[0].getAttribute('name');
					document.getElementById('colorpicker').value = this.style.color;
				
				}
				
                editBoxManager.sync();
            }
        };


        this.editBox.elements["editBox_delete"].onclick = function () {
            if (mindmap.getSelectedNode() != null)
                mindmap.deleteSelectedNode();
            editBoxManager.editBoxContainer.style.display = "none";
        };

        this.editBox.elements["editBox_bold"].onclick = function () {
            if (editBoxManager.styleLoad()) {
                editBoxManager.style.font.weight = this.checked ? "bold" : "normal";

                editBoxManager.sync();
            }
        };
        this.editBox.elements["editBox_italic"].onclick = function () {
            if (editBoxManager.styleLoad()) {
                editBoxManager.style.font.style = this.checked ? "italic" : "normal";

                editBoxManager.sync();
            }
        };
        this.editBox.elements["editBox_strike"].onclick = function () {
            if (editBoxManager.styleLoad()) {
                editBoxManager.style.font.decoration = this.checked ? "strike" : "none";

                editBoxManager.sync();
            }
        };
        this.editBox.elements["editBox_underline"].onclick = function () {
            if (editBoxManager.styleLoad()) {
                editBoxManager.style.font.decoration = this.checked ? "underline" : "none";

                editBoxManager.sync();
            }
        };



        this.__checkBoxUpdate = function (checkbox, checked) {

            if (checked) {
				checkbox.nextElementSibling.classList.add("is-checked")
                checkbox.checked = true;
            }
            else {
                checkbox.nextElementSibling.classList.remove("is-checked");
                checkbox.checked = false;
            }
        };

        this.updateView = function () {
			
			var node = mindmap.getSelectedNode();
			
			if(node == null || !node.hasPerm("p_write")) {
				
				editBoxManager.editBox.elements["editBox_label"].disabled = true;
				editBoxManager.editBox.elements["editBox_strike"].disabled = true;
				editBoxManager.editBox.elements["editBox_underline"].disabled = true;
				editBoxManager.editBox.elements["editBox_italic"].disabled = true;
				editBoxManager.editBox.elements["editBox_bold"].disabled = true;
				editBoxManager.editBox.elements["editBox_color"].disabled = true;
				editBoxManager.editBox.elements["editBox_family"].disabled = true;
			}
			else {
				editBoxManager.editBox.elements["editBox_label"].disabled = false;
				editBoxManager.editBox.elements["editBox_strike"].disabled = false;
				editBoxManager.editBox.elements["editBox_underline"].disabled = false;
				editBoxManager.editBox.elements["editBox_italic"].disabled = false;
				editBoxManager.editBox.elements["editBox_bold"].disabled = false;
				editBoxManager.editBox.elements["editBox_color"].disabled = false;
				editBoxManager.editBox.elements["editBox_family"].disabled = false;				
			}
			
			if(node == null || !node.hasPerm("p_delete")) {
				editBoxManager.editBox.elements["editBox_delete"].disabled = true;		
			}
			else {
				editBoxManager.editBox.elements["editBox_delete"].disabled = false;		
			}
			
			editBoxManager.editBox.elements["editBox_label"].value = this.label;
			
			editBoxManager.editBox.elements["editBox_family"].value = this.style.font.family;
			
			if(editBoxManager.editBox.elements["editBox_family"].selectedOptions[0].getAttribute('name') != this.style.font.family) {
				
				var p = editBoxManager.editBox.elements["editBox_family"].children.item(0);
				p.style.display = '';
				p.innerHTML = this.style.font.family;
				p.style.fontFamily = this.style.font.family;
				p.setAttribute('name', this.style.font.family);
				p.selected = true;
				
			}
			
			
			editBoxManager.editBox.elements["editBox_family"].style.fontFamily = this.style.font.family;

			editBoxManager.editBox.elements["editBox_color"].value = "&#x1F532; " + this.style.font.color;
			
			if(this.style.font.color in editBoxManager.editBox.elements["editBox_color"].children) {
				editBoxManager.editBox.elements["editBox_color"].children[this.style.font.color].selected = true;
			}
			else if(this.style.font.color != null) {
				
				var p = editBoxManager.editBox.elements["editBox_color"].children.item(0);
				p.style.display = '';
				p.innerHTML = "&#x1F532; " + this.style.font.color;
				p.style.color = this.style.font.color;
				p.setAttribute('name', this.style.font.color);
				
				
				p.selected = true;
				

			}

			editBoxManager.editBox.elements["editBox_color"].style.color = this.style.font.color;

			document.getElementById('colorpicker').value = this.style.font.color;

            this.__checkBoxUpdate(editBoxManager.editBox.elements["editBox_bold"], editBoxManager.style.font.weight == "bold");
            this.__checkBoxUpdate(editBoxManager.editBox.elements["editBox_italic"], editBoxManager.style.font.style == "italic");
            this.__checkBoxUpdate(editBoxManager.editBox.elements["editBox_underline"], editBoxManager.style.font.decoration == "underline");
            this.__checkBoxUpdate(editBoxManager.editBox.elements["editBox_strike"], editBoxManager.style.font.decoration == "strike");

        };

        this.sync = function () {

            editBoxManager.updateView();

            var node = mindmap.getSelectedNode();

            if (node != undefined) {

                node.label = editBoxManager.label;

                node.style = editBoxManager.style;

                mindmap.ioManager.out.editNode(node, true);

            }
        }
		
		this.editBoxContainer.onload = function () {
			editBoxManager.load();
		};

		this.editBoxContainer.onfocus = function () {
			editBoxManager.focus();
		};


    };
	
    this.selecterBoxManager = new function () {
		
		selecterBoxManager = this;
		
		this.boxs = document.getElementsByClassName("box");
		
		var selecters = document.getElementsByClassName("boxSelecter");
		
		//Open menu 
		for(var i = 0;i < selecters.length; i++) {
			
			selecters.item(i).onclick = function () {
				
				document.getElementById("workselecter").style.display = 'block';
				
			};
			
			
		}

		//Close menu
		document.getElementById("workselecter").onmouseleave = function () {
		
			this.style.display = 'none';
		
			};
			
		this.close = function () {
			
			for(var j=0;j<this.boxs.length;j++) {
				
				this.boxs.item(j).style.display = 'none';
				this.boxs.item(j).onload();
			}
			
			
		};
			
		this.reloadBoxs = function () {
			//dbg
			//var node = mindmap.getSelectedNode();
			
			
			
			//alert(mindmap.getSelectedNode().permissions);
			
			var already_open = false;
			
			for(var j=0;j<this.boxs.length;j++) {
				this.boxs[j].onload();
				if(!already_open && this.boxs[j].style.display == 'block')
					already_open = true;
			}
			
			if(!already_open)
				this.changeBox("editBox");
			
		};
			
		this.changeBox = function (id) {
			
			for(var j=0;j<this.boxs.length;j++) {
				
				var box = this.boxs.item(j);
				
				if(id == box.id) {
					box.style.display = 'block';
					box.onload();
				}
				else {
					box.style.display = 'none';
				}
				
			}
			
		};
			
		//Change box
		var boxRefs = document.getElementById("workselecter").children;
		
		for(var i=0; i < boxRefs.length; i++) {
			
			boxRefs.item(i).onclick = function () {
				
				var id = this.getAttribute("name");
				
				selecterBoxManager.changeBox(id);
				
				document.getElementById("workselecter").style.display = 'none';

			};
		}
		
	};


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
                                "folded": false,
                                "unifiedChildren": {
                                    "dx": false,
                                    "container": false,
                                    "font": false,
                                    "parentBranch": false
                                }
                            };

                            for (var i in eventManager.eventData.parentNode.childNodes) {
                                eventManager.eventData.parentNode.childNodes[i].style.order = i;
                            }

                            var orientation = (eventManager.eventData.attach.getAttribute("name") == "lx") ? "left" : "right";

                            var nearBrothers = mindmap.nearBrothersVerticalPosition(eventManager.eventData.parentNode.childNodes, e.clientY, eventManager.eventData.parentNode, orientation);
                            // // console.log(nearBrothers)

                            if (nearBrothers.prevY_i == undefined)
                                style.order = -1;
                            else if (nearBrothers.nextY_i == undefined)
                                style.order = eventManager.eventData.parentNode.childNodes.length;
                            else {

                                style.order = (parseInt(eventManager.eventData.parentNode.childNodes[nearBrothers.prevY_i].style.order) + parseInt(eventManager.eventData.parentNode.childNodes[nearBrothers.nextY_i].style.order)) / 2;


                            }


                            if (eventManager.eventData.attach.getAttribute("name") == 'lx')
                                style.dx = -100;
                            else
                                style.dx = 100;

                            style.container = JSON.parse(JSON.stringify(eventManager.eventData.parentNode.style.container));
                            style.font = JSON.parse(JSON.stringify(eventManager.eventData.parentNode.style.font));
                            style.font.size = 16;
                            style.parentBranch = JSON.parse(JSON.stringify(eventManager.eventData.parentNode.style.parentBranch));

                            mindmap.ioManager.out.newNode(eventManager.eventData.parentNode.id, mindmap.worker, null, style);


                            //Tout ce qui concerne la création du noeud s'arrête ici

                            break;

                        case 'mousemove':

                            var attach_x = eventManager.eventData.parentNode.nodeElement.getBoundingClientRect().left;

                            mindmap.newBranchElement.style.display = "";

                            var middle_x = (mindmap.rootNode.nodeElement.getBoundingClientRect().left + mindmap.rootNode.nodeElement.getBoundingClientRect().width / 2);
                            var middle_y = (mindmap.rootNode.nodeElement.getBoundingClientRect().top + mindmap.rootNode.nodeElement.getBoundingClientRect().height / 2);

                            this.nodeConnecter = {};
                            this.nodeConnecter.x = e.clientX / mindmap.view.zoom - middle_x / mindmap.view.zoom;
                            this.nodeConnecter.y = e.clientY / mindmap.view.zoom - middle_y / mindmap.view.zoom;

                            if (eventManager.eventData.attach.getAttribute("name") == 'lx') {

                                if (eventManager.eventData.w <= 100 && (eventManager.eventData.parentNode.nodeConnecter.lx - nodeConnecter.x) > eventManager.eventData.w)
                                    eventManager.eventData.w = (eventManager.eventData.parentNode.nodeConnecter.lx - nodeConnecter.x);

                                if ((eventManager.eventData.parentNode.nodeConnecter.lx - nodeConnecter.x) < eventManager.eventData.w)
                                    nodeConnecter.x = eventManager.eventData.parentNode.nodeConnecter.lx - eventManager.eventData.w;

                                var path = 'M' + eventManager.eventData.parentNode.nodeConnecter.lx + ',' + eventManager.eventData.parentNode.nodeConnecter.y + ' ';
                                path += 'C' + (nodeConnecter.x + 0.333 * (eventManager.eventData.parentNode.nodeConnecter.lx - nodeConnecter.x)) + ',' + eventManager.eventData.parentNode.nodeConnecter.y + ' ';
                                path += (nodeConnecter.x + 0.666 * (eventManager.eventData.parentNode.nodeConnecter.lx - nodeConnecter.x)) + ',' + this.nodeConnecter.y + ' ';
                                path += nodeConnecter.x + ',' + this.nodeConnecter.y;

                            }
                            else if (eventManager.eventData.attach.getAttribute("name") == 'rx') {

                                if (eventManager.eventData.w <= 100 && -(eventManager.eventData.parentNode.nodeConnecter.rx - nodeConnecter.x) > eventManager.eventData.w)
                                    eventManager.eventData.w = -(eventManager.eventData.parentNode.nodeConnecter.rx - nodeConnecter.x);

                                if ((eventManager.eventData.parentNode.nodeConnecter.rx - nodeConnecter.x) > -eventManager.eventData.w)
                                    nodeConnecter.x = eventManager.eventData.parentNode.nodeConnecter.rx + eventManager.eventData.w;

                                var path = 'M' + eventManager.eventData.parentNode.nodeConnecter.rx + ',' + eventManager.eventData.parentNode.nodeConnecter.y + ' ';
                                path += 'C' + (eventManager.eventData.parentNode.nodeConnecter.rx + 0.666 * (nodeConnecter.x - eventManager.eventData.parentNode.nodeConnecter.rx)) + ',' + eventManager.eventData.parentNode.nodeConnecter.y + ' ';
                                path += (eventManager.eventData.parentNode.nodeConnecter.rx + 0.333 * (nodeConnecter.x - eventManager.eventData.parentNode.nodeConnecter.rx)) + ',' + this.nodeConnecter.y + ' ';
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


                            if (eventManager.eventData.node != mindmap.rootNode && (e.clientX != eventManager.eventData.x || e.clientY != eventManager.eventData.y)) {

                                mindmap.ioManager.out.editNodes(eventManager.eventData.node.parentNode.childNodes);

                            }

                            mindmap.selectNode(eventManager.eventData.node);

                        case 'mousemove':

                            if (eventManager.eventData.node == mindmap.rootNode)
                                break;

                            var dx = (e.clientX - eventManager.eventData.x) / mindmap.view.zoom + eventManager.eventData.dx;

                            var nearBrothers = mindmap.nearBrothersVerticalPosition(eventManager.eventData.node.parentNode.childNodes, e.clientY, eventManager.eventData.node, eventManager.eventData.node.orientation);

                            var prevY_i = nearBrothers.prevY_i;
                            var current_i = nearBrothers.current_i;
                            var nextY_i = nearBrothers.nextY_i;

                            if (prevY_i != null && current_i < prevY_i && prevY_i != nextY_i) {
                                mindmap.switchNodeInSiblings(eventManager.eventData.node, eventManager.eventData.node.parentNode.childNodes[prevY_i]);
                            }
                            else if (nextY_i != null && current_i > nextY_i && prevY_i != nextY_i) {
                                mindmap.switchNodeInSiblings(eventManager.eventData.node, eventManager.eventData.node.parentNode.childNodes[nextY_i]);
                            }

                            var middle_x = mindmap.rootNode.rectElement.getBoundingClientRect().left + mindmap.rootNode.rectElement.getBoundingClientRect().width / 2;

                            var delta_middle = Math.abs(middle_x - eventManager.eventData.x);

                            var change_side = false;

                            if (eventManager.eventData.node.orientation == 'left') {
                                if (-100 < dx)
                                    dx = -100;

                                if (eventManager.eventData.node.parentNode == mindmap.rootNode && e.clientX > middle_x) {
                                    eventManager.eventData.node.orientation = "right";
                                    change_side = true;

                                }


                            }
                            else if (eventManager.eventData.node.orientation == 'right') {
                                if (dx < 100)
                                    dx = 100;

                                if (eventManager.eventData.node.parentNode == mindmap.rootNode && e.clientX < middle_x) {
                                    eventManager.eventData.node.orientation = "left";
                                    change_side = true;
                                }

                            }


                            eventManager.eventData.node.style.dx = dx;

                            mindmap.drawMap(eventManager.eventData.node.parentNode);

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

                                var nodeId = e.target.parentNode.id;

                                var node = mindmap.nodes[nodeId];

                                if (node != mindmap.rootNode && node.childNodes.length > 0) {

                                    node.style.folded = !node.style.folded;

                                    if (node.style.folded)
                                        node.hideNodeChildren();

                                    mindmap.drawMap();

                                    mindmap.ioManager.out.editNode(node, true);
                                }
                            }
                            /*else if (e.target.nodeName == 'g' && e.target.name == 'node') {

                             var nodeId = e.target.id;

                             if (mindmap.nodes[nodeId] != mindmap.rootNode && mindmap.nodes[nodeId].childNodes.length > 0) {

                             mindmap.nodes[nodeId].style.folded = !mindmap.nodes[nodeId].style.folded;

                             if (mindmap.nodes[nodeId].style.folded)
                             mindmap.nodes[nodeId].hideNodeChildren();

                             mindmap.drawMap();

                             mindmap.ioManager.out.editNode(mindmap.nodes[nodeId]);

                             }
                             }*/

                            break;


                        case 'mousedown':
                            if (e.target.nodeName == 'circle' && e.target.getAttribute("name") == "folder") {
                                //void
                            }

                            else if (e.target.nodeName == 'text' || e.target.nodeName == 'rect' || e.target.nodeName == 'line') {
                                eventManager.eventType = 'offsetNode';

                                var nodeId = e.target.parentNode.id;

                                eventManager.eventData = {
                                    x: e.clientX,
                                    y: e.clientY,
                                    node: mindmap.nodes[nodeId],
                                    dx: mindmap.nodes[nodeId].style.dx
                                };
                            }
                            else if (e.target.nodeName == 'circle' && (e.target.getAttribute("name") == "lx" || e.target.getAttribute("name") == "rx")) {
                                eventManager.eventType = 'newNode';

                                var nodeId = e.target.parentNode.id;

                                eventManager.eventData = {
                                    parentNode: mindmap.nodes[nodeId],
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
                            else if (e.target.nodeName == "svg" || e.target.nodeName == "path") {


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

                            if (e.target.nodeName == "svg" || e.target.nodeName == "g" || e.target.nodeName == "rect" || e.target.nodeName == "circle" || e.target.nodeName == "line" || e.target.nodeName == "text" || e.target.nodeName == "line" || e.target.nodeName == "path") {

                                if ('wheelDelta' in e)
                                    var zoom = e.wheelDelta > 0;
                                else if ('deltaY' in e)
                                    var zoom = e.deltaY < 0;
                                else
                                    break;

                                var zoom_coef = 1.5;


                                if (zoom) {
									if(mindmap.view.zoom < 5.0625) {
										
										mindmap.view.zoom *= zoom_coef;
										mindmap.view.offset.x -= (zoom_coef * e.clientX - e.clientX) / mindmap.view.zoom;
										mindmap.view.offset.y -= (zoom_coef * e.clientY - e.clientY) / mindmap.view.zoom;
										
									}
                                }
                                else {
									
									if(mindmap.view.zoom > 0.43){
									
										mindmap.view.zoom /= zoom_coef;
										mindmap.view.offset.x += (e.clientX - e.clientX / zoom_coef ) / mindmap.view.zoom;
										mindmap.view.offset.y += (e.clientY - e.clientY / zoom_coef ) / mindmap.view.zoom;
										
									}
                                }
								
                                mindmap.setView();

                            }

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

                    // console.log("Socket : connexion reussie !");

                    // On s'annonce au serveur
                    mindmap.ioManager.out.join();

                    // On traite les messages reçu !
                    io.socket.on('mindmap', mindmap.ioManager.in.negotiate);
                });
            }
        };

        this.out = new function () {

            this.join = function () {

                io.socket.post(basePath + "join", function (data, jwr) {
                    // Subscribe to mindmap event and receive all the mindmap once

                    console.log("Parsing data ...");
                    console.log(jwr);

                    mindmap.ioManager.in.open(data.nodes);
                    mindmap.setWorker(data.user);
                    _.forEach(data.users, function (u) {
                        mindmap.workersListManager.addWorker(u);
                    });

                    mindmap.hashManager.on();
                });

                io.socket.post(basePath + "chat/getAll", function (data) {
                    _.forEach(data, function (message) {
                        mindmap.chatBoxManager.onMessage(message, true);
                    });
                });
            };
			
			
			this.cutPaste = function () {
			
				if(mindmap.action.type != "cut") return;
				
				var srcNode = mindmap.action.src;
				
				var destParentNode = mindmap.getSelectedNode();

				if(srcNode != undefined && destParentNode != undefined  && destParentNode.cutAction == false) {
					
					/*client cutPaste implementation, not stable*/
					var nodesStack = [];
					
					var traverse = function (node) {
						console.log("$", node);
						nodesStack.push({id : node.id, parentNodeId : node.parentNode.id, data : {label : node.label, style : node.style}});
						_.forEach(node.childNodes, function (n) {
							traverse(n);
						});
					};
					traverse(srcNode);
					
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
					
					traverseDelete(srcNode);
					
					mindmap.ioManager.out.deleteNodes(ids_to_delete, false);	
					mindmap.drawMap();
					mindmap.action.type = "copy";
					mindmap.action.src = nodesStack;
					mindmap.action.dest = null;
					
					// mindmap.ioManager.out.copyPaste();
					
					//TODO 5: cutPaste opti côté serveur, variables utiles : srcNode, destParentNode for io.socket.post
					
					//dans le callback, si nécessaire, on peut détruire le tampon 

						// mindmap.action.type = null;
						// mindmap.action.src = null;
						// mindmap.action.dest = null;
						
						mindmap.drawMap();
				}
				
			};
			
			this.copyPaste = function () {
				
				if(mindmap.action.type != "copy") return;
				
				var nodesStack = JSON.parse(JSON.stringify(mindmap.action.src));
				
				var destParentNode = mindmap.getSelectedNode();

				if(nodesStack != undefined && destParentNode != undefined && nodesStack.length > 0) {

				//TODO 6: Implementer le copyPaste côté serveur, variables utile : mindmap.action.src, destParentNode
				
				//client implementation dans ce if
				
				var idTranslationTable = {};
					
					idTranslationTable[nodesStack[0].parentNodeId] = destParentNode.id;
					
					var copyNextNode = function () {
						
						if(nodesStack.length > 0 && nodesStack[0].parentNodeId in idTranslationTable) {
							
							var _parentNodeId = idTranslationTable[nodesStack[0].parentNodeId];
							
							var newNode = {
								'parent_node' : _parentNodeId,
								'style' : nodesStack[0].data.style,
								'label' : nodesStack[0].data.label,
								'permissions' : {
												"p_read" : true,
												"p_write" : true,
												"p_delete" : true,
												"p_unlock" : true,
												"p_assign" : true
												}
							};
							
							io.socket.post(basePath + "node/new", {
								nodes: [newNode]
							}, function (nodes) {							
								

								_.forEach(nodes, function (n) {
									mindmap.ioManager.in.createdNode(n);
									
									idTranslationTable[nodesStack[0].id] = n.id;
									
									//TODO user progress notification
									
									return;
									
								});
								
								nodesStack.splice(0, 1);
								
								copyNextNode();
								

								
							});
							
						}
						else {
							
							//TODO user progress notification
							
						}
						
						
					};
					
					copyNextNode();

					
				}
				
			};

            ////When user query server to get the id of a new node
            this.newNode = function (parentNodeId, worker, permissions, style) {

                // console.log("Out : demande création noeud");

                io.socket.post(basePath + "node/new", {
                    nodes: [{
                        parent_node: parentNodeId,
                        style: style,
                        label: 'New node',
                        permissions: permissions
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

                // console.log("Out : edit Node", node);

                var path = basePath + "node/update/" + (updateStyle ? 'yes' : 'no');

                var father = (node.parentNode != undefined) ? node.parentNode.id : 0;

                io.socket.post(path, {
                    nodes: [{
                        parent_node: father,
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

                // console.log("Out : edit several Nodes", nodes);

                var path = basePath + "node/update/yes";

                var data = {nodes: []};

                _.forEach(nodes, function (n) {
                    data.nodes.push({
                        parent_node: n.parentNode.id,
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

                // console.log("Out : unselect Node", node);

				//TODO 4: a placer dans le ioManager.in quand le vérrouillage sera implenté
				selecterBoxManager.reloadBoxs();

                //TODO: Notification de déséléction - Émission
                //Données utiles : node.id
            };

            //When user select a node
            this.selectNode = function (node) {

                // console.log("Out : select Node", node);

				//TODO 4:a placer dans le ioManager.in  quand le vérrouillage sera implenté (bis)
				selecterBoxManager.reloadBoxs();

                //TODO: Notification de séléction - Émission
                //Données utiles : node.id
            };

            //When user delete nodes
            this.deleteNodes = function (ids, notif) {
console.log(ids);
                // console.log("Out : delete Node", ids);

				if(ids.length == 0)
					return;
				
				if(notif) {
					if(ids.length == 1)
						notificationManager.push("Le noeud a été supprimé", "");
					else
						notificationManager.push("Les noeuds ont été supprimés", "");
				}
                //Données utiles : id

                var data = {nodes: []};

                _.forEach(ids, function (n) {
                    data.nodes.push({
                        id: n
                    });
                });
				
			

                io.socket.post(basePath + "node/delete", data, function (ids) {
	
                    _.forEach(ids, function (n) {
                        mindmap.ioManager.in.deleteNode(n.id);
                    });

                });
            }

        };

        this.in = new function () {

            this.open = function (nodes) {

                for (var i in nodes) {

                    var node = nodes[i];
					
					//TODO 1: Envoyer les permissions dans node, comme ce qui suit
					/*node.permissions = {
										"p_read" : true,
										"p_write" : true,
										"p_delete" : true,
										"p_unlock" : true,
										"p_assign" : true
										};
					*/
					
					////TODO 4: Envoyer le worker actuel (vérouillage) dans node, comme ce qui suit
					//if(node.id == 2) //pour les test sans implementation
					//	node.worker = 2;
					
                    mindmap.nodes[node.id] = new MindmapNode(node.id, mindmap.nodes[node.parent_node], node.worker, node.permissions, node.style, node.label);

                    if (mindmap.rootNode == undefined && nodes[i].parentNode == undefined && nodes[i] != undefined) {
						
                        mindmap.rootNode = mindmap.nodes[node.id];
					}


                    if (node.id in mindmap.workers && mindmap.workers[node.id].worker != null)
                        mindmap.workers[mindmap.workers[node.id].worker] = node.id;
                }

				
                mindmap.rootNode.orderizeDescendance();

                mindmap.drawMap();

            };

            this.createdNode = function (node) {

                // // console.log(node.label, node.style.order);

                // node.style.order = parseFloat(node.style.order);

                if (node.worker != null) { //Si le noeud possède un worker courant
                    if (mindmap.workers[node.worker] != null) { //Si le worker existe déjà
                        mindmap.nodes[mindmap.workers[node.worker]].worker = null; //On déséléctionne son noeud courant
                    }
                    mindmap.workers[node.worker] = node.id; //On séléctionne le nouveau noeud
                }
                // // console.log(node.style.order, node.style.order_bis);
                // // console.log(node);
                // node.style.order = node.style.order_bis;

                // // console.log(node);
                mindmap.nodes[node.id] = new MindmapNode(node.id, mindmap.nodes[node.parent_node], node.worker, node.permissions, node.style, node.label);
                node = mindmap.nodes[node.id];


                if (node.parentNode) {
                    node.parentNode.childNodes.sort(function (a, b) {
                        return parseFloat(a.style.order) - parseFloat(b.style.order);
                    });

                    for (var i in node.parentNode.childNodes) {
                        node.parentNode.childNodes[i].style.order = parseInt(i);
                    }


                }
                mindmap.newBranchElement.style.display = "none"; //bug risk

                mindmap.drawMap();

                //// console.log("In : Node created");
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

                //// console.log("In : Node selected");

            };

            //When a collaborator unselect a node
            this.unselectNode = function (workerId, nodeId) {

                mindmap.workers[workerId] = null;
                mindmap.nodes[nodeId].worker = null;
                mindmap.nodes[nodeId].drawNode();

                //// console.log("In : Node unselected");

            };

            /*
             //When a collaborator force me to unselect a node
             this.looseNode = function (workerId, nodeId) {

             //// console.log("In : loose Node selection");

             };*/

            //When a collaborator edit a node
            this.editNode = function (workerId, node, isMe) {

                mindmap.nodes[node.id].editNode(workerId, node.label, node.style, isMe);

                // // console.log("When a collaborator edit a node", node.label, node.style.order)

                // console.log("In : Node edited");

            };

            //When a collaborator delete a node
            this.deleteNode = function (nodeId) {


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

                //// console.log("In : Node deleted");

            };

            this.negotiate = function (message) {


                switch (message.verb) {

                    case 'messaged':
                        switch (message.data.header) {
                            case 'Chat_public':
                                mindmap.chatBoxManager.onMessage(message.data.msg);
                                break;
                            case 'New_nodes':
                                _.forEach(message.data.msg, function (n) {

                                    mindmap.ioManager.in.createdNode(n);
                                });
                                break;
                            case 'Update_nodes':
                                _.forEach(message.data.msg, function (n) {
                                    mindmap.ioManager.in.editNode(0, n, false);
                                });
                                break;
                            case 'Delete_nodes':
                                _.forEach(message.data.msg, function (n) {
                                    mindmap.ioManager.in.deleteNode(n.id);
                                });
                                break;
                            case 'User_connect':
                                mindmap.workersListManager.addWorker(message.data.msg);
                                break;
                            case 'User_disconnect':
                                mindmap.workersListManager.removeWorker(message.data.msg);
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
};


/*===== WINDOWS STARTUP =====*/

window.onload = initMindmap();

function initMindmap() {

    var Mindmap = new MindmapFrame(document.getElementById('container'));

    window.onmousedown = Mindmap.eventManager.on;
    window.onmouseup = Mindmap.eventManager.on;
    window.onmousemove = Mindmap.eventManager.on;
    window.onwheel = Mindmap.eventManager.on;
    window.onmousewheel = Mindmap.eventManager.on;
    window.ondblclick = Mindmap.eventManager.on;
}