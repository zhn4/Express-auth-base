var express = require('express');
var router = express.Router();
var connection = require('../config/db.js')
var sha1 = require('sha1')
var jwt = require('jwt-simple')

var payload = {
  name: 'lotus'
}

var secret = 'panyu'

function checkJWT(req, res, next) {
  if(req.headers.authorization) {
    var token = req.headers.authorization.split(' ')[1]
    try {
      jwt.decode(token, secret)
      next()
    }
    catch(err) {
      res.json({
        code: 400,
        msg: 'token错误'
      })
    }
  }
}

module.exports = function(app) {
  app.get('/', function(req, res) {
    res.render('index', {
      title: 'Express'
    })
  })
  app.post('/api/v1/registered', function(req, res) {// 注册
    if(req.body.username && req.body.password) {
      var username = req.body.username,
          password = sha1(req.body.password)
          sql = 'select * from user where username = ' + '"' + username + '"'
      connection.query(sql, function(err, results) {
        if(err) throw err
        if(results.length < 1) {
          var create_user = 'insert into user (username, password) values (?, ?)'
          connection.query(create_user, [username, password], function(err, results) {
            if(err) throw err
            res.json({
              code: 200,
              msg: '注册成功'
            })
          })
        }else {
          res.json({
            code: 400,
            msg: '账号已存在'
          })
        }
      })
    }
  })

  app.post('/api/v1/login', function(req, res) {// 登录
    if(req.body.username && req.body.password) {
      var username = req.body.username,
          password = sha1(req.body.password)
          sql = 'select * from user where username = ' + '"' + username + '"' + ' and ' + 'password = ' + '"' + password + '"'
      connection.query(sql, function(err, results) {
        if(err) throw err
        var token = jwt.encode(payload, secret);
        if(results.length > 0) {
          res.json({
            code: 200,
            msg: '登录成功',
            token: token
          })
        }else {
          res.json({
            code: 400,
            msg: '账号或密码错误'
          })
        }
      })
    }
  })

  app.get('/api/v1/test', checkJWT, function(req, res) {
    res.json({
      code: 200,
      msg: '测试成功'
    })
  })

}
