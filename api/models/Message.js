module.exports = {

    tableName: 'Message',
    autoUpdatedAt: false,

    attributes: {


        //===== ATTRIBUTES =====//

        data: {
            type: 'string',
            required: true,
            size: 1024
        },


        //===== FOREIGN KEYS =====//

        owner: {
            model: 'user'
        },

        mindmap: {
            model: 'mindmap'
        }
    }
}