module.exports = {

    tableName: 'MindMap',
    autoCreatedAt: false,
    autoUpdatedAt: false,

    attributes: {
        id: {
            type: 'integer',
            autoIncrement: true
        },
        owner_id: {
            type: 'string',
            required: true,
            size: 40
        },
        name: {
            type: 'string',
            required: true,
            size: 30
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
        // Create a user
        User.findOne({
                mail: inputs.mail,
                password: crypto.createHash('sha256').update("42IAmASalt42" + crypto.createHash('sha256').update(inputs.password).digest('hex')).digest('hex')
            })
            .exec(cb);
    }
}