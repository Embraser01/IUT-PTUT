module.exports = {
    index: function (req, res) {

        io.socket.on('user', function(event){
           console.log(event);
        });
        return res.view('auth/login');
    },


};