module.exports = function(app)
{
    var mysql = require('mysql');
    var dbData = require('./dbData');
    var con = mysql.createConnection(dbData);
    var fs = require('fs');
    
    app.get('/', function(req, res){
        res.send('SuperMarioMaker Server ver_kjh');
    }); 
    
    app.post('/Upload', function(req, res, next){
        var mapInfo = req.body.MapInfo;
        
        var userID = mapInfo[0].UserID;
        var mapName = mapInfo[0].MapName;
        var mapLevel = mapInfo[0].Level;
        
        var sql = 'INSERT INTO map (fk_user_map, name, level) VALUES(?, ?, ?)';
        var params = [userID, mapName, mapLevel];
        
        con.query(sql, params, function (error, results, fields) {
            if(error){
                    console.log(err);
                    console.log('Upload_Fail');
                    res.send('Upload_Fail');  
            }
            else{
                var folderPath = './maps/' + mapInfo[0].UserID;
                
                try{
                    fs.mkdirSync(folderPath); 
                    console.log('forder : create');
                }catch(e){
                    if(e.code != 'EXIST');
                }
        
                var mapNameJson = folderPath + '/' + mapName + '.json';
                console.log(userID + '의 맵 : ' + mapName + '등록');
                const mapData = req.body;
        
                const mapDataJson = JSON.stringify(mapData);
                fs.writeFileSync(mapNameJson, mapDataJson);
                
                console.log('Upload_MySQL : ' + mapName);
                res.send('Upload_Success');
            }
        });
    }); 
    
    app.get('/GetMapList', function(req, res){
        
        con.query('SELECT * FROM map', function (error, results, fields) {
            if(results == ''){
                console.log('Map not exists');
                res.send('MapList_Fail');
            }
            else{     
                var mapList = "";
                for(var i in results){
                    mapList += 'UserID : ';
                    mapList += results[i].fk_user_map;
                    mapList += ', MapName : ';
                    mapList += results[i].name;
                    mapList += ', Level : ';
                    mapList += results[i].level;
                    mapList += '!';
                }
                console.log(results);
                console.log(mapList);
                res.send(mapList);
            }
        });
    });
    
    app.get('/DownloadMap', function(req, res){
        var id = req.query.id;
        var name= req.query.name + '.json';
        
        var path = './maps/' + id + '/' + name
        fs.readFile(path, function(err, data){
            if(err){
                res.send('Download_Fail');  
                console.log(err);
            } 
            else{            
                res.send(data);
                console.log('result : ' + data);
            }
        });
    });
    
    app.get('/CreateId', function(req, res){
        var name= req.query.name;
        var sql = 'INSERT INTO user (nick_name) VALUES(?)';
        var params = [name];

        con.query(sql, params, function (error, results, fields) {
            if(error){
                console.log('Create ID - Fail : ' + name + ' already exists');
                res.send('Already_Exists_Nickname');
            }
            else{
                console.log('Create ID - Success');
                res.send('Create_Success');
            }
        });
    });
    
    app.get('/GetId', function(req, res){
        var name= req.query.name;
        var sql = 'SELECT * FROM user WHERE nick_name=?';
        var params = [name];
        
        con.query(sql, params, function (error, results, fields) {
            if(results == ''){
                console.log('Get ID - Fail : ' + name + ' not exists');
                res.send('Not_Exists_Name');
            }
            else{                
                var id = "";
                id += results[0].user_id;
                console.log('GetId - ' + results[0].user_id + ' : ' + results[0].nick_name);
                res.send(id);
            }
        });
    });
    
    app.get('/Login', function(req, res){
        var id = req.query.id;
        var sql = 'SELECT * FROM user WHERE user_id=?';
        var params = [id];
        
        con.query(sql, params, function (error, results, fields) {
            if(results == ''){
                console.log('Login - Fail : ' + id + ' not exists');
                res.send('Login Fail');
            }
            else{     
                var name = "";
                name += results[0].nick_name;
                console.log('Login - ' + results[0].user_id + ' : ' + results[0].nick_name);
                res.send(name);
            }
        });
    });
}