module.exports = {
    index: function (req, res) {
        return res.view('explorer/index', DataViewService.create('Mes cartes mentales'));
    }
};
