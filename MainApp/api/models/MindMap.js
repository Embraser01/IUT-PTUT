module.exports = {

    tableName: 'MindMap',
    autoUpdatedAt: false,


    attributes: {
        name: {
            type: 'string',
            required: true,
            size: 40
        },


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