// SerializeService.js - in api/services

function unserialize_0_0_1_(bigCategory) {
    var unserialized_style = {};

    var containerData = bigCategory[3].split(";");
    var fontData = bigCategory[4].split(";");
    var parentBranchData = bigCategory[5].split(";");
    var unifiedChildren = bigCategory[6].split(";");

    try {
        unserialized_style = {
            order: bigCategory[0],
            order_bis: bigCategory[0],
            dx: bigCategory[1],
            folded: bigCategory[2] == 'true',
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

    } catch (e) {
        console.log(e);
    }
    return unserialized_style;
}

module.exports = {

    serialize: function (style) {
        var serialized_style = "";

        try {
            //===== ORDER & DX =====//

            serialized_style += style.order + '|';
            serialized_style += style.dx + '|';
            serialized_style += style.folded + '|';


            //===== CONTAINER =====//

            serialized_style += style.container.kind + ';';
            serialized_style += style.container.borderThickness + ';';
            serialized_style += style.container.borderColor + ';';
            serialized_style += style.container.background + ';';
            serialized_style += style.container.radius + '|';


            //===== FONT =====//

            serialized_style += style.font.family + ';';
            serialized_style += style.font.size + ';';
            serialized_style += style.font.color + ';';
            serialized_style += style.font.weight + ';';
            serialized_style += style.font.style + ';';
            serialized_style += style.font.decoration + ';';
            serialized_style += style.font.align + '|';


            //===== PARENT BRANCH =====//

            serialized_style += style.parentBranch.color + '|';


            //===== UNIFIED CHILDREN =====//

            serialized_style += style.unifiedChildren.dx.toString() + ';';
            serialized_style += style.unifiedChildren.container.toString() + ';';
            serialized_style += style.unifiedChildren.font.toString() + ';';
            serialized_style += style.unifiedChildren.parentBranch.toString() + '|';


            //===== SERIALIZE VERSION =====//

            serialized_style += "0.0.1|";


        } catch (e) {
            console.log(e);
            return null;
        }

        return serialized_style;
    },

    unserialize: function (style) {
        var bigCategory = style.split("|");

        // Switch between version of style serialized

        switch (bigCategory[7]) {
            case "0.0.1":
            default:
                return unserialize_0_0_1_(bigCategory);
        }
    }

};
