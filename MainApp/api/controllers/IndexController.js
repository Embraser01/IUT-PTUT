module.exports = {
    index: function (req, res) {
        return res.view('index/index', DataViewService.create('Index'));
    }
};