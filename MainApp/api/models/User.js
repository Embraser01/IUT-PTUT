var crypto = require('crypto');

var pwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;

module.exports = {

    tableName: 'User',

    attributes: {


        //===== ATTRIBUTES =====//

        name: {
            type: 'string',
            required: true,
            size: 40
        },

        firstname: {
            type: 'string',
            required: true,
            size: 30
        },

        mail: {
            type: 'email',
            required: true,
            unique: true,
            size: 254
        },

        password: {
            type: 'string',
            required: true,
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
        },

        toJSON: function() {
            var obj = this.toObject();
            delete obj.password;
            delete obj.messages;
            delete obj.mindmaps;
            delete obj.styles;
            delete obj.members;
            delete obj.permissions;
            delete obj.nodes;
            delete obj.mail;
            return obj;
        }
    },


    signup: function (inputs, cb) {
        // Create a user
        if (inputs.password !== inputs.passwordConfirmation) return cb(new Error("Password and Password confirmation are different !"));
        if (!pwdRegex.test(inputs.password)) return cb(new Error("Password is not secure !"));

        User.create({
                name: inputs.name,
                firstname: inputs.firstname,
                mail: inputs.mail,
                password: crypto.createHash('sha256').update("42IAmASalt42" + crypto.createHash('sha256').update(inputs.password).digest('hex')).digest('hex')
        })
        .exec(cb);

    },

    login: function (inputs, cb) {

        if(!inputs.password) return cb(new Error("You have to give a password !"));
        if(!inputs.mail) return cb(new Error("You have to give a mail address !"));

        User.findOne({
                mail: inputs.mail,
                password: crypto.createHash('sha256').update("42IAmASalt42" + crypto.createHash('sha256').update(inputs.password).digest('hex')).digest('hex')
        })
        .exec(cb);
    }
}