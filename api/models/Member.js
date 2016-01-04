module.exports = {

    tableName: 'Member',

    attributes: {


        //===== ATTRIBUTES =====//

        p_manage: {
            type: 'boolean',
            defaultTo: false
        },


        //===== FOREIGN KEYS =====//

        user: {
            model: 'user'
        },

        group: {
            model: 'group'
        }
    }
}