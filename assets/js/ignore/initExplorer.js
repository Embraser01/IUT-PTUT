/*
 * initExplorer.js  :
 * Copyright (C) 2016  Hugo ALLIAUME Benjamin CHAZELLE Marc-Antoine FERNANDES
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

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
