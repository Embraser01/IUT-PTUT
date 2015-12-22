var createHash = require('sha.js');
var sha256 = createHash.sha256();

var pwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
var mailRegex = /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/;

module.exports = {

    tableName: 'User',

    types: {
        password: function (password) {
            return password === this.passwordConfirmation;
        },
        secure: function (password) {
            return pwdRegex.test(password);
        }
    },

    attributes: {
        id: {
            type: 'integer',
            autoIncrement: true
        },
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
            type: 'string',
            email: true,
            required: true,
            unique: true,
            size: 254
        },
        password: {
            type: 'string',
            required: true,
            size: 64,
            secure: true
        },
        passwordConfirmation: {
            type: 'string',
            size: 64,
            password: true
        }
    },


    signup: function (inputs, cb) {
        // Create a user
        User.create({
                name: inputs.name,
                email: inputs.email,
                // TODO: But encrypt the password first
                password: inputs.password
            })
            .exec(cb);
    },


    /**
     * Check validness of a login using the provided inputs.
     * But encrypt the password first.
     *
     * @param  {Object}   inputs
     *                     • email    {String}
     *                     • password {String}
     * @param  {Function} cb
     */

    attemptLogin: function (inputs, cb) {
        // Create a user
        User.findOne({
                email: inputs.email,
                // TODO: But encrypt the password first
                password: inputs.password
            })
            .exec(cb);
    }
}