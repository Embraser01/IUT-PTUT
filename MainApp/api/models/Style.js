function serialize(style){
    var serialized_style = "";

    try {
        //===== ORDER & DX =====//

        serialized_style += style.order + '|';
        serialized_style += style.dx + '|';


        //===== CONTAINER =====//

        serialized_style +=  style.container.kind + ';';
        serialized_style +=  style.container.borderThickness + ';';
        serialized_style +=  style.container.borderColor + ';';
        serialized_style +=  style.container.background + ';';
        serialized_style +=  style.container.radius + '|';


        //===== FONT =====//

        serialized_style +=  style.font.family + ';';
        serialized_style +=  style.font.size + ';';
        serialized_style +=  style.font.color + ';';
        serialized_style +=  style.font.weight + ';';
        serialized_style +=  style.font.style + ';';
        serialized_style +=  style.font.decoration + ';';
        serialized_style +=  style.font.align + '|';


        //===== PARENT BRANCH =====//

        serialized_style +=  style.parentBranch.color + '|';


        //===== UNIFIED CHILDREN =====//

        serialized_style +=  style.unifiedChildren.dx.toString() + ';';
        serialized_style +=  style.unifiedChildren.container.toString() + ';';
        serialized_style +=  style.unifiedChildren.font.toString() + ';';
        serialized_style +=  style.unifiedChildren.parentBranch.toString() + '|';



    } catch(e){
        console.log(e);
        return null;
    }

    return serialized_style;
}

function unserialize(style){
    var bigCategory = style.split("|");
    var unserialized_style = {};

    var containerData = bigCategory[2].split(";");
    var fontData = bigCategory[3].split(";");
    var parentBranchData = bigCategory[4].split(";");
    var unifiedChildren = bigCategory[5].split(";");

    try {
        unserialized_style = {
            order: bigCategory[0],
            dx: bigCategory[1],
            container: {
                kind: containerData[0],
                borderThickness: containerData[1],
                borderColor: containerData[2],
                background: containerData[3],
                radius: containerData[4]
            },
            font: {
                family: fontData[0],
                size: fontData[1],
                color: fontData[2],
                weight: fontData[3],
                style: fontData[4],
                decoration: fontData[5],
                align: fontData[6]
            },
            parentBranch: {
                color: parentBranchData[0]
            },
            unifiedChildren: {
                dx: (unifiedChildren[0] == "true"),
                container: (unifiedChildren[1] == "true"),
                font: (unifiedChildren[2] == "true"),
                parentBranch: (unifiedChildren[3] == "true")
            }
        }

    }catch(e) {
        console.log(e);
    }
    return unserialized_style;
}

module.exports = {

    tableName: 'Style',
    autoCreatedAt: false,
    autoUpdatedAt: false,

    attributes: {


        //===== ATTRIBUTES =====//

        style: {
            type: 'string',
            required: true,
            size: 255 // TODO Check size
        },

        fold: {
            type: 'boolean',
            required: true
        },


        //===== FOREIGN KEYS =====//

        node: {
            model: 'node'
        },

        owner: {
            model: 'user'
        }
    },

    beforeCreate: function(values, cb) {
        values.style = serialize(values.style);

        if(!values.style) return cb(new Error("Malformed style"));
        cb();
    },

    findUnserialize: function(values, cb){
        Style.find({ where: { node: values.node, owner: values.owner}}).exec(function( err, styles){
            if(err) return cb(err);

            if(!styles) return cb(new Error("Style not found !"));

            styles[0].style = unserialize(styles[0].style);
            cb(null, styles);
        })
    }
}