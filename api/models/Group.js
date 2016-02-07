module.exports = {

    tableName: 'Team',

    attributes: {


        //===== ATTRIBUTES =====//

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


        //===== FOREIGN KEYS =====//

        owner: {
          model: 'user'
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