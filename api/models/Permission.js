module.exports = {

    tableName: 'Permission',

    attributes: {


        //===== ATTRIBUTES =====//

        p_read: {
            type: 'boolean',
            defaultsTo: true
        },

        p_write: {
            type: 'boolean',
            defaultsTo: false
        },

        p_delete: {
            type: 'boolean',
            defaultsTo: false
        },

        p_unlock: {
            type: 'boolean',
            defaultsTo: false
        },

        p_assign: {
            type: 'boolean',
            defaultsTo: false
        },


        //===== FOREIGN KEYS =====//

        node: {
            model: 'node'
        },

        user: {
            model: 'user'
        },

        owner: {
            model: 'user',
            required: true
        },

        group: {
            model: 'group'
        }
    }
}