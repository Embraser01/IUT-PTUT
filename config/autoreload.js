/**
 * Created by kocal on 28/01/16.
 */
module.exports.autoreload = {
    active: false,
    usePolling: false,
    dirs: [
        "api/models",
        "api/controllers",
        "api/services",
        "config/locales",
        "views/layouts",
    ],
    ignored: [
        // Ignore all files with .ts extension
        "**.ts"
    ]
};
