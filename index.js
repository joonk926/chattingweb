var app = require('express')();
var http = require('http').Server(app);
var io= require('socket.io')(http);

app.get('/', function(req,res){
    res.sendFile(__dirname + '/index.html');
});

http.listen(80, function(){
    console.log('WebServer running on *:80');
});

var userList = [];

io.on('connection', function(socket){
    var joinedUser = false;
    var nickname;

    //user joined
    socket.on('join', function(data){
        if (joinedUser){ //if user already exist, stop the program
            return false;
        }

        nickname = data;
        userList.push(nickname);
        socket.broadcast.emit('join',{
            nickname: nickname,
            userList : userList
        });

        socket.emit('welcome', {
            nickname: nickname,
            userList : userList
        });

        joinedUser  = true;
    });

    socket.on('msg', function(data){
        console.log('msg:' + data);
        io.emit('msg', {
            nickname: nickname,
            msg: data
        });
    });

    socket.on('disconnect', function(){
        //if user exit stops.
        if (!joinedUser){
            console.log('----not joinedUser left');
            return false;
        }

        var i = userList.indexOf(nickname);
        userList.splice(i,1);

        socket.broadcast.emit('left', {
            nickname: nickname,
            userList: userList
        });
    });
});
