// PermissionService.js - in api/services
module.exports = {

    create: function (title, data) {

        // Send something
        data = data || {};


        return {
            AppName: 'MindMap PTUT',
            title: title,
            data: data
        };
    }
}
