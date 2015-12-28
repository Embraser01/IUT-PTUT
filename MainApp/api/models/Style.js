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

        node_order: {
            type: 'integer',
            required: true
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
    }
}