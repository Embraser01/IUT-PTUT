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
        },


        permissions: {
            collection: 'permission',
            via: 'group'
        },

        members: {
            collection: 'member',
            via: 'group'
        }
    }
}