(function(window, $) {
    var $form = $(window.formToValidate);
    var $inputs = $form.find(window.inputs);

    // kind of magic
    setTimeout(function() {
        validate($form, $inputs, window.errors);
    }, 1);

})(window, jQuery);
