module.exports = {

    //tableName: 'Folder',

    attributes: {


        //===== ATTRIBUTES =====//

        name: {
            type: 'string',
            required: true,
            size: 40
        },


        //===== FOREIGN KEYS =====//

        owner: {
            model: 'user'
        },

        child_folders: {
            collection: 'folder',
            via: 'parent_folder'
        },

        parent_folder: {
            model: 'folder'
        },

        mindmaps: {
            collection: 'mindmap',
            via: 'folder'
        }
    }
}