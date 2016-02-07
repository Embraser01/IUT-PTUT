validate = ($form, $inputs, errors) -> (

    $form = $form || null;
    $inputs = $inputs || null;
    errors = errors || {};

    if $form.length == 0
        console.warn "Validate: $form est introuvable"
        return

    if $inputs.length == 0
        console.warn "Validate: $inputs est introuvable"
        return

    if !errors? || Object.keys(errors).length == 0
        console.warn "Validate: pas de messages d'erreurs"
        return

    _validate $form, $inputs, errors
)

_validate = ($form, $inputs, errors) -> (
    $form.addClass 'validate'

    $inputs.each () -> (
        $input = $ this

        name = $input.attr 'name'

        if !errors[name]?
            console.warn "Validate: L'entrée #{name} n'est pas trouvable dans les messages d'erreurs"
            return

        _setErrorOnField $input, errors[name]
    )

    if errors.invalidAttributes
        console.warn "Validate: L'objet des erreurs contient en fait un tableau d'attributs invalides"

        console.log $inputs

        for input, error of errors.invalidAttributes
            $input = $inputs.filter "[name='#{input}']"
            console.log input, error, $input

            if $input.length == 0
                console.warn "Validate: Impossible d'attacher l'erreur au champ #{input}"
                continue

            _setErrorOnField $input, error[0].message

        return
)

_setErrorOnField = ($input, message) -> (
    $label = $input.next 'label'

    $label.addClass 'active'
    $label.attr 'data-error', message
    $input.addClass 'invalid'
)
