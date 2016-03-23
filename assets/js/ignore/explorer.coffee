class Explorer

    constructor: ($viewDirectories, $viewFiles, $viewNavigation) -> (
        @debug = false

        # Dossier courant
        @currentDirectory = '/'

        # Items de l'explorateur
        @items = []

        # Élement DOM qui contiendra les dossiers
        @$viewDirectories = $viewDirectories

        # Élement DOM qui contiendra les fichiers
        @$viewFiles = $viewFiles

        # Élement DOM qui contiendra la navigation (fil d'arianne)
        @$viewNavigation = $viewNavigation

        # Contient les items à afficher
        @itemsToDisplay =
            directories: [], files: []

        return;
    )

    init: (currentDirectory, items) -> (
        @setCurrentDirectory currentDirectory
        @setItems items

        return
    )

    setCurrentDirectory: (directory) -> (
        @currentDirectory = @_fixPath(directory)
    )

    setItems: (items) -> (
        console.log 'Explorer::setItems()' if @debug

        for item in items
            item.path = @_fixPath item.path
            item.slug = @_generateSlug (item.name || item.path)
            item.pathSlug = @_generateSlug @_directories(item.path).parts.join('/')

        @items = items

        return
    )


    updateItems: () -> (
        console.log 'Explorer::updateItems()' if @debug

        @itemsToDisplay =
            directories: [], files: []
        @handleItem item for item in @items

        return;
    )

    handleItem: (item) -> (

        currentDirectoryParts = @_directories @currentDirectory # a
        directoryParts = @_directories item.path # b

        a = currentDirectoryParts.parts.length
        b = directoryParts.parts.length

        ###
        a == b => fichier
        a + 1 == b => dossier
        else => sous dossier
        ###

        if new RegExp('^' + @currentDirectory).test item.path
            console.log "L'item est contenu dans cette arborescence" if @debug

            if a == b #fichier
                console.log "L'item est un fichier" if @debug
                @itemsToDisplay.files.push item: item, text: item.name

            else if a + 1 == b # sous-dossier "direct"
                console.log "L'item est un sous-dossier" if @debug
                @itemsToDisplay.directories.push item: item, text: directoryParts.parts[a]

            else if a < b # sous-dossier "lointain"
                console.log "L'item est un sous-dossier d'un sous-dossier" if @debug

            else # au dessus
                console.log "L'item est un élément au dessus" if @debug

        return;
    )

    clear: () -> (
        @$viewDirectories.empty()
        @$viewFiles.empty()
        @$viewNavigation.empty()
        $('.explorer-empty').remove()

        return
    )

    draw: () -> (
        console.log 'Explorer::draw()' if @debug
        console.log @itemsToDisplay if @debug

        @factoryDraw 'directory', directory for directory in @itemsToDisplay.directories
        @factoryDraw 'file', file for file in @itemsToDisplay.files

        if @$viewDirectories.is(':empty') && @$viewFiles.is(':empty')
            @$viewDirectories.parent().parent().after($ '<div>',
                class: 'explorer-empty valign-wrapper'
            .append $ '<h5>',
                class: 'valign',
                text: "Nous n'avons rien trouvé ici."
            )

        return
    )

    factoryDraw: (type, item) -> (
        console.log 'Explorer::factoryDraw(' + type + ', item)' if @debug

        if(['directory', 'file'].indexOf(type) == -1)
            return;

        console.log item if @debug

        $cell = $ '<div>',
            class: 'col col-xs-12 col-sm-6 col-md-3'
        .append @_makeItem type, item.item, item.text

        if type == 'directory'
            @$viewDirectories.append $cell if !@directoryIsDisplayed item.item.path

        if item.item.special == 'empty'
            return

        if type == 'file'
            @$viewFiles.append $cell

        return
    )

    directoryIsDisplayed: (path) -> (
        path = @_generateSlug path

        console.log 'Explorer::directoryIsDisplayed(' + path + ')' if @debug

        directory = $('.explorer-item-directory[data-slug="' + path + '"]')
        directory.length != 0
    )

    updateNavigation: () -> (
        console.log 'Explorer::updateNavigation()' if @debug

        that = @

        # Bouton précédent
        $previous = $('<a>',
            class: 'btn-flat waves-effect previous'
        ).append $ '<i>',
            class: 'material-icons'
            text:  'arrow_back'

        if @currentDirectory == '/'
            $previous.addClass 'disabled'

        $previous.on 'click', (e) ->
            that._updateHash e, $(this).attr 'data-path' if !$previous.hasClass 'disabled'

        @$viewNavigation.append $previous

        # Items
        currentDirectory = '/Mes cartes mentales' + @currentDirectory
        directories = @_directories currentDirectory

        for directory, n in directories.parts
            $item = $ '<a>',
                class: 'breadcrumb',
                text: directory

            @$viewNavigation.append $item

            # dernier item
            if n + 1 == directories.parts.length
                $item.addClass 'current'

            if n == 0
                $item.attr 'data-path', '/'
            else
                previousPath = $item.prev().attr 'data-path'
                $item.attr 'data-path', previousPath + directory + '/'

                # avant dernier item pour le btn précédent
                if n == directories.parts.length - 1
                    $previous.attr 'data-path', previousPath

            $item.on 'click', (e) ->
                that._updateHash e, $(this).attr 'data-path'

        return
    )

    updateAndDraw: () -> (
        @updateItems()
        @updateNavigation()
        @draw()
    )

    _fixPath: (path) -> (
        path = path.trim();

        if(path[0] != '/')
            path = '/' + path

        if(path[path.length - 1] != '/')
            path = path + '/'

        return path
    )

    # https://gist.github.com/mathewbyrne/1280286
    _generateSlug: (name) -> (
        name.toString().toLowerCase()
        .replace(/\s+/g, '-')# Replace spaces with -
        .replace(/[^\w\-]+/g, '')# Remove all non-word chars
        .replace(/\-\-+/g, '-')# Replace multiple - with single -
        .replace(/^-+/, '')# Trim - from start of text
        .replace(/-+$/, '')
    )

    _makeItem: (type, item, text) -> (
        console.log 'Explorer::_makeItem(' + type + ', item)' if @debug

        $item = $ '<div>',
            'data-slug': item.pathSlug
            'data-type': 'directory'

        if type == 'directory'
            $item.addClass 'explorer-item__directory btn waves-effect waves-dark white grey-text text-darken-4'

            directories = @_directories item.path

            # Création de l'icone
            $icon = $ '<i>',
                class: 'material-icons left'

            if /^\/?Partagées avec moi/.test directories.first
                $icon.text 'folder_shared'
            else
                $icon.text 'folder'

            # Nom du dossier
            $span = $ '<span>',
                text: text

            # Ajout event
            $item.on 'click', (e) =>
                @_updateHash e, '/' + directories.parts.join '/'

            $item.append($span).append($icon)

        else if type == 'file'
            # A changer avec une vraie miniature de mindmap
            $item.attr 'class', 'explorer-item__file card'
            $item.attr 'data-type', 'file'

            $item.append $('<div>',
                class: 'card-image waves-effect waves-block waves-light'
            ).append $ '<img>',
                src: 'http://lorempicsum.com/up/255/200/2'

            $item.append $('<div>',
                class: 'card-content',
            ).append $ '<div>',
                class: 'card-title grey-text text-darken-4',
                text: text

        return $item;
    )

    _directories: (path) -> (
        parts = path.split '/';
        parts.shift()
        parts.pop()

        first: if parts[0] then parts[0] else '',
        parts: parts
    )

    _updateHash: (e, hash) -> (
        if history.pushState
            # Me jugez pas svp xd
            history.pushState {}, null, '#' + hash
            history.pushState {}, null, '#' + hash
            history.back()
        else
            location.hash = hash

        e.preventDefault()
    )
