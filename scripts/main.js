//Based on http://www.html5rocks.com/en/tutorials/webdatabase/todo/

document.addEventListener("deviceready", init, false);
document.addEventListener("touchstart", function () { }, false);

var app = {};
app.db = null;
var data = "iVBORw0KGgoAAAANSUhEUgAAALkAAAC6CAIAAAB9W3ulAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAjkSURBVHhe7Z27kdtIFEVlKwjZG4FsBSFbuclWELIVwdoKQvasQU4JxVtsnL54/WHtPTa63wcHU3zVIOfDWwiMuBIocSVQ4kqgxJVAiSuBElcCJa4ESlwJlLgSKHElUOJKoMSVQIkrgRJXAiWuBEpcCRTqyq9fv/5Zx7dv3+559KA5k31IpVX5zMTL+Qh15efPnx/W8eXLl3sePWjOZB9SaVU+M/FyPhJXHokrz4grj8SVZ8SVR+LKM+LKI3HlGb4rnz9//ncM379/v8d4R+skM8WnT5/u698h/frz5889j3c0n48fP95jPEfnjt162IvvyvXYzyCxvGfUy7kq1m497CWunFMVa7ce9hJXzqmKtVsPe4kr51TF2q2HvcSVc6pi7dbDXipd8c47yLxA+k5mit+/f9/X96CTEUFj7dbDXipd0WsIZB/vmt3YrYe9xJV57NbDXuLKPHbrYS9xZR679bCXuDKP3XrYy6u6orPJjx8/7lPBO+RNMJ07dBWZTUis3XrYy6u6ooxbReqaGUsh+5AM28SVmrpmxlLIPiTDNnGlpq6ZsRSyD8mwTVypqWtmLIXsQzJsE1dq6poZSyH7kAzbvKorOpvoW3D69ho5N9FVurOePZEpbLce9vKqroyLRajKeW0+vcSVlTmvzaeXuLIy57X59BJXVua8Np9e4srKnNfm00ulKzPfH9NrdDYh35Eh+yg69ZDvIu3Ww14qXamCxJp5jaKrlKpYHiNixRWnLl2lVMXyGBErrjh16SqlKpbHiFhxxalLVylVsTxGxIorTl26SqmK5TEilu8K+a0Aj6qZouoaPXv6+vXrfQJ5x5u51vawF9+VmYzzYO01M9F8eokrK6+ZiebTS1xZec1MNJ9e4srKa2ai+fQSV1ZeMxPNpxfqindOUUXVmZHOHTrRaCzyXSQyd+zWw16oK7tR9Rx7T9u4nXcmrsQVSlyJK5S4ElcocSWuUKgr3m8FkF8hUEgsb37xfgFb0eiK5kPqUkhXFdLnXqgr";

// Open Database based on device
function openDb() {
    var dbName = "Todo.sqliteDB";
    if (window.navigator.simulator === true) {
        //Web Browser
        console.log("Use built in SQL Lite");
        app.db = window.openDatabase(dbName, "1.0", "Cordova Demo", 200000);
    }
    else {
        //Telerik Appbuilder
        app.db = window.sqlitePlugin.openDatabase(dbName);
    }
}

//Create table and Index
function createTable() {
    var db = app.db;
    db.transaction(function (tx) {
        tx.executeSql("CREATE TABLE IF NOT EXISTS todo(ID INTEGER PRIMARY KEY ASC, todo TEXT, added_on DATETIME)", []);
        tx.executeSql("CREATE INDEX idx_ID ON todo (ID)");
    });
}

//Add 1000 rows in table todo
function addData(todoText) {
    var db = app.db;
    todoText = data;
    db.transaction(function (tx) {
        var addedOn = new Date();
        for (i = 0; i < 1000; i++) {
            tx.executeSql("INSERT INTO todo(todo, added_on) VALUES (?,?)",
                          [todoText, addedOn],
                          onSuccess,
                          onError);
        }
    });
    alert("Inserted 1000 Rows");
}

function onError(tx, e) {
    debugger;
    alert("Error: " + e.message);
}

function onSuccess(tx, e) {
    refresh();
}

//Search table based on ID
function searchTableData() {
    var db = app.db;
    var rowID = document.getElementById("todoSearch").value;
    db.transaction(function (tx) {
        tx.executeSql(
            "select * from todo where ID=?", [rowID],
            function (tx, res) {
                for (var i = 0; i < res.rows.length; i++) {
                    var row = res.rows.item(0);
                    alert("row " + i + ":\n" + " - id = " + row.ID + "\n" + " - data = " + row.todo);
                }
            },
            function (tx, res) {
                alert('error: ' + res.message);
            });
    });
}

//Delete 1000 rows 
function deleteTableData() {
    debugger;
    var db = app.db;
    db.transaction(function (tx) {
        debugger;
        tx.executeSql("DELETE FROM todo", [],
					  onSuccess,
					  onError);
    });
}

//Delete specific row
function deleteTodo(id) {
    var db = app.db;
    db.transaction(function (tx) {
        tx.executeSql("DELETE FROM todo WHERE ID=?", [id],
					  onSuccess,
					  onError);
    });
}

//Bind data after insert and delete operation
function refresh() {
    debugger;
    var renderTodo = function (row) {
        return "<li>" + "<div class='todo-check'></div>" + row.ID + "<a class='button delete' href='javascript:void(0);'  onclick='deleteTodo(" + row.ID + ");'><p class='todo-delete'></p></a>" + "<div class='clear'></div>" + "</li>";
    }

    var render = function (tx, rs) {
        var rowOutput = "";
        var todoItems = document.getElementById("todoItems");
        for (var i = 0; i < rs.rows.length; i++) {
            rowOutput += renderTodo(rs.rows.item(i));
        }
        todoItems.innerHTML = rowOutput;
    }

    var db = app.db;
    db.transaction(function (tx) {
        tx.executeSql("SELECT * FROM todo ", [],
					  render,
					  onError);
    });
}

function init() {
    navigator.splashscreen.hide();
    openDb();
    createTable();
    refresh();
}

function addTodo() {
    var todo = document.getElementById("todo");
    addData(todo.value);
    todo.value = "";
}