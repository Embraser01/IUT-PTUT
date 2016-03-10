module.exports = {

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
            collection: 'parent_folder',
            via: 'folder'
        },

        parent_folder: {
            model: 'folder'
        },

        mindmaps: {
            collection: 'folder',
            via: 'mindmap'
        }
    }
}