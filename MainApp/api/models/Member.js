module.exports = {

    tableName: 'Member',

    attributes: {
        p_manage: {
            type: 'boolean',
            defaultTo: false
        },

        user: {
            model: 'user'
        },

        group: {
            model: 'group'
        }
    }
}