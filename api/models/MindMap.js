module.exports = {

    tableName: 'MindMap',
    autoUpdatedAt: false,


    attributes: {


        //===== ATTRIBUTES =====//

        name: {
            type: 'string',
            required: true,
            size: 40
        },


        //===== FOREIGN KEYS =====//

        owner: {
            model: 'user'
        },

        messages: {
            collection: 'message',
            via: 'mindmap'
        },

        nodes: {
            collection: 'node',
            via: 'mindmap'
        }
    }

}