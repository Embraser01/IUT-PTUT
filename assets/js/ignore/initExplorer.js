(function($) {

    var explorer = new Explorer(
        $('.directories .explorer .row'),
        $('.files .explorer .row'),
        $('.explorer-navigation .nav-wrapper')
    );

    function newDirectory(e) {

    }

    function update(e) {
        $('.mdl-layout__content').animate({
            scrollTop: 0
        }, 300);

        e.preventDefault();

        explorer.clear();
        explorer.setCurrentDirectory(location.hash.substr(1));
        explorer.updateAndDraw();
    }

    $('a.js-open-modal').click();

    explorer.onNewDirectory = newDirectory;
    window.onhashchange = update;
    window.onpopstate = update;

    explorer.init(location.hash.substr(2) || '/', items);
    explorer.updateAndDraw();
})(jQuery);
