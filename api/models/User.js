var crypto = require('crypto');

var pwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;

module.exports = {

    tableName: 'User',

    attributes: {


        //===== ATTRIBUTES =====//

        display_name: {
            type: 'string'
        },

        provider: {
            type: 'string'
        },

        ext_id: {
            type: 'string'
        },

        img_url: {
            type: 'string'
        },

        mail: {
            type: 'email',
            unique: true,
            size: 254
        },

        password: {
            type: 'string',
            size: 64
        },


        //===== FOREIGN KEYS =====//

        messages: {
            collection: 'message',
            via: 'owner'
        },

        mindmaps: {
            collection: 'mindmap',
            via: 'owner'
        },

        nodes: {
            collection: 'node',
            via: 'owner'
        },

        styles: {
            collection: 'style',
            via: 'owner'
        },

        permissions: {
            collection: 'permission',
            via: 'user'
        },

        members: {
            collection: 'member',
            via: 'user'
        }
    },


    signup: function (inputs, cb) {
        // Create a user
        if (inputs.password !== inputs.passwordConfirmation) return cb(new Error("Password and Password confirmation are different !"));
        if (!pwdRegex.test(inputs.password)) return cb(new Error("Password is not secure !"));

        // TODO Add image profile link
        User.create({
                display_name: inputs.display_name,
                mail: inputs.mail,
                password: crypto.createHash('sha256').update("42IAmASalt42" + crypto.createHash('sha256').update(inputs.password).digest('hex')).digest('hex')
        })
        .exec(cb);

    }
}