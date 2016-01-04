module.exports = {

    tableName: 'Style',
    autoCreatedAt: false,
    autoUpdatedAt: false,

    attributes: {


        //===== ATTRIBUTES =====//

        style: {
            type: 'string',
            required: true,
            size: 255
        },


        //===== FOREIGN KEYS =====//

        node: {
            model: 'node'
        },

        owner: {
            model: 'user'
        }
    },

    beforeValidate: function (values, cb) {
        values.style = SerializeService.serialize(values.style);

        if (!values.style) return cb(new Error("Malformed style"));
        cb();
    }
}