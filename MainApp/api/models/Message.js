module.exports = {

    tableName: 'Message',
    autoUpdatedAt: false,

    attributes: {
        data: {
            type: 'string',
            required: true,
            size: 1024
        }
    }
}