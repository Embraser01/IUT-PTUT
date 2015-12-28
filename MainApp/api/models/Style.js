module.exports = {

    tableName: 'Style',
    autoCreatedAt: false,
    autoUpdatedAt: false,

    attributes: {
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


        node: {
            model: 'node'
        },
        owner: {
            model: 'user'
        }
    }
}