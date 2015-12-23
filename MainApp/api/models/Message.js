module.exports = {

    tableName: 'Message',
    autoCreatedAt: false,
    autoUpdatedAt: false,

    attributes: {
        id: {
            type: 'integer',
            autoIncrement: true
        },
        mindmap_id: {
            type: 'integer',
            required: true
        },
        user_id: {
            type: 'integer',
            required: true
        },
        date: {
            type: 'datetime',
            required: true
        },
        data: {
            type: 'string',
            required: true,
            size: 1024
        }
    },


    new: function (inputs, cb) {
        // Create a msg

        Message.create({
                mindmap_id: inputs.mindmap_id,
                user_id: inputs.user_id,
                date: new Date(),
                data: inputs.data
            })
            .exec(cb);

    },


    findByMindMapId: function (inputs, cb){
        Message.find
    }
}