module.exports = {
    index: function (req, res) {
        return res.view('group/index', DataViewService.create('Mes groupes'));
    }
};
