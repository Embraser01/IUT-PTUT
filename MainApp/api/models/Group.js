module.exports = {

    tableName: 'Team',

    attributes: {
        name: {
            type: 'string',
            required: true,
            size: 40
        },
        description: {
            type: 'string',
            required: true,
            size: 1024
        }
    }
}