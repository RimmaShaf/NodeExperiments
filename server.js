var sockio = require("socket.io");
var r = require("rethinkdb");
var app = require("express")();

var io = sockio.listen(app.listen(8071),{log:false});

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

//var getLeaders = r.table("ProvDivs").orderBy({index: r.desc("score")}).limit(5);
 
 
 r.connect({db: "test",host:'192.168.37.104'}).then(function(c) {
  r.table("dividends").changes().run(c)
    .then(function(cursor) {
      cursor.each(function(err, item) {
        io.sockets.emit("update", item);
      });
    });
});
 

io.sockets.on("connection", function(socket) {
  var conn;
  r.connect({db: "test",host:'192.168.37.104'}).then(function(c) {
    conn = c;
    return r.table("dividends").orderBy({index:"index1"}).run(conn);
  })
  .then(function(cursor) { return cursor.toArray(); })
  .then(function(result) {
    socket.emit("leaders", result);
  })
  .error(function(err) { console.log("Failure:", err); })
  .finally(function() {
    if (conn)
      conn.close();
  });
});
