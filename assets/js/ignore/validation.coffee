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
        $label = $input.next 'label'
        name = $input.attr 'name'

        if !errors[name]?
            console.warn "Validate: L'entrée #{name} n'est pas trouvable dans les messages d'erreurs"
            return

        $label.addClass 'active'
        $label.attr 'data-error', errors[name]
        $input.addClass 'invalid'

        return
    )
)
