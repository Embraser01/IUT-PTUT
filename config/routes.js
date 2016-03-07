/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes map URLs to views and controllers.
 *
 * If Sails receives a URL that doesn't match any of the routes below,
 * it will check for matching files (images, scripts, stylesheets, etc.)
 * in your assets directory.  e.g. `http://localhost:1337/images/foo.jpg`
 * might match an image file: `/assets/images/foo.jpg`
 *
 * Finally, if those don't match either, the default 404 handler is triggered.
 * See `api/responses/notFound.js` to adjust your app's 404 logic.
 *
 * Note: Sails doesn't ACTUALLY serve stuff from `assets`-- the default Gruntfile in Sails copies
 * flat files from `assets` to `.tmp/public`.  This allows you to do things like compile LESS or
 * CoffeeScript for the front-end.
 *
 * For more information on configuring custom routes, check out:
 * http://sailsjs.org/#!/documentation/concepts/Routes/RouteTargetSyntax.html
 */

module.exports.routes = {

    /***************************************************************************
     *                                                                          *
     * Make the view located at `views/homepage.ejs` (or `views/homepage.jade`, *
     * etc. depending on your default view engine) your home page.              *
     *                                                                          *
     * (Alternatively, remove this and add an `index.html` file in your         *
     * `assets` directory)                                                      *
     *                                                                          *
     ***************************************************************************/

    '/': {
        controller: 'IndexController',
        action: 'index'
    },


    /***************************************************************************
     *                                                                          *
     * Custom routes here...                                                    *
     *                                                                          *
     * If a request to a URL doesn't match any of the custom routes above, it   *
     * is matched against Sails route blueprints. See `config/blueprints.js`    *
     * for configuration options and examples.                                  *
     *                                                                          *
     ***************************************************************************/


    /*===== Auth Controller =====*/

    'get /auth': '/auth/login',
    'get /auth/signup': 'AuthController.signup',
    'get /auth/login': 'AuthController.login',
    '/auth/process/logout': 'AuthController.processLogout',
    'post /auth/process/signup': 'AuthController.processSignup',
    'post /auth/process/login': 'AuthController.processLogin',
    '/auth/facebook': 'AuthController.facebook',
    '/auth/facebook/callback': 'AuthController.facebook',
    '/auth/google': 'AuthController.google',
    '/auth/google/callback': 'AuthController.google',
    '/auth/twitter': 'AuthController.twitter',
    '/auth/twitter/callback': 'AuthController.twitter',


    /*===== MindMap Controller =====*/

    'post /mm/create': 'MindMapController.create',
    'get /mm/:id': {
        controller: 'MindMapController',
        action: 'index',
        locals: {
            layout: 'layouts/mindmap'
        }
    },
    'post /mm/:id/join': 'MindMapController.join',


    /*===== Chat Controller =====*/

    'post /mm/:id/chat/public': 'ChatController.public',
    'post /mm/:id/chat/getAll': 'ChatController.getAll',


    /*===== Node Controller =====*/

    'post /mm/:id/node/new': 'NodeController.new',
    'post /mm/:id/node/update/:style': 'NodeController.update',
    'post /mm/:id/node/delete': 'NodeController.delete',
    'post /mm/:id/node/select': 'NodeController.select',
    'post /mm/:id/node/unselect': 'NodeController.unselect',
    'post /mm/:id/node/move': 'NodeController.move',
    'post /mm/:id/node/perm': 'NodeController.perm',


    /*===== Explorer Controller =====*/
    'get /explorer': {
        controller: 'ExplorerController',
        action: 'index',
        locals: {
            layout: 'layouts/explorer'
        }
    },

    /*===== Search Controller =====*/

    'post /mm/:id/search/search': 'SearchController.search'

    /*===== Test Controller =====*/

    //'/test/order': 'TestController.getOne'
};
