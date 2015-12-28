module.exports = {

    tableName: 'Permission',

    attributes: {
        p_read: {
            type: 'boolean',
            defaultTo: true
        },
        p_write: {
            type: 'boolean',
            defaultTo: false
        },
        p_delete: {
            type: 'boolean',
            defaultTo: false
        },
        p_unlock: {
            type: 'boolean',
            defaultTo: false
        },
        p_assign: {
            type: 'boolean',
            defaultTo: false
        }
    }
}