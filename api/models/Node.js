module.exports = {

    tableName: 'Node',

    attributes: {


        //===== ATTRIBUTES =====//

        label: {
            type: 'string',
            required: true,
            size: 30
        },


        //===== FOREIGN KEYS =====//

        mindmap: {
            model: 'mindmap'
        },

        owner: {
            model: 'user'
        },

        styles: {
            collection: 'style',
            via: 'node'
        },

        permissions: {
            collection: 'permission',
            via: 'node'
        },

        parent_node: {
            model: 'node'
        }
    }
}