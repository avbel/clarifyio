var http = require("https"),
  debug = require("debug")("op3nvoice");
  querystring = require("querystring");


var defaultHost = "api.clarify.io";


function Client(host, apiToken) {
  if (!(this instanceof Client)) {
    return new Client(host, apiToken);
  }
  this.apiToken = apiToken;
  this.host = host || defaultHost;
  this.baseUrl = "/v1/";
  debug("Creating Op3nVoice client");
}

module.exports = Client;


/* Bundles */
Client.prototype.getBundles = function(opts, callback){
  if(typeof opts == "function"){
    callback = opts;
    opts = null;
  }
  this.get(this.concatBaseUrl("bundles"), opts, callback);
};

Client.prototype.createBundle = function(data, callback){
  this.post(this.concatBaseUrl("bundles"), data, callback);
};

Client.prototype.getBundle = function(id, opts, callback){
  if(typeof opts == "function"){
    callback = opts;
    opts = null;
  }
  this.get(this.concatBaseUrl("bundles/" + id), opts, callback);
};

Client.prototype.removeBundle = function(id, callback){
  this.delete(this.concatBaseUrl("bundles/" + id), callback);
};

Client.prototype.deleteBundle = Client.prototype.removeBundle;

Client.prototype.updateBundle = function(id, data, callback){
  this.put(this.concatBaseUrl("bundles/" + id), data, callback);
};


/* Metadata */
Client.prototype.getMetadata = function(bundleId, opts, callback){
  if(typeof opts == "function"){
    callback = opts;
    opts = null;
  }
  this.get(this.concatBaseUrl("bundles/" + bundleId + "/metadata"), opts, callback);
};

Client.prototype.updateMetadata = function(bundleId, data, callback){
  if(!data.data && !data.version){
    data = {data: data};
  }
  if(typeof data.data != "string"){
    data.data = JSON.stringify(data.data);
  }
  this.put(this.concatBaseUrl("bundles/" + bundleId + "/metadata"), data, callback);
};

Client.prototype.removeMetadata = function(bundleId, callback){
  this.delete(this.concatBaseUrl("bundles/" + bundleId + "/metadata"), callback);
};

Client.prototype.deleteMetadata = Client.prototype.removeMetadata;


/* Tracks */
Client.prototype.getTracks = function(bundleId, opts, callback){
  if(typeof opts == "function"){
    callback = opts;
    opts = null;
  }
  this.get(this.concatBaseUrl("bundles/" + bundleId + "/tracks"), opts, callback);
};

Client.prototype.createTrack = function(bundleId, data, callback){
  this.post(this.concatBaseUrl("bundles/" + bundleId + "/tracks"), data, callback);
};

Client.prototype.updateTrack = function(bundleId, track, data, callback){
  if(typeof data == "function"){
    callback = data;
    data = track;
  }
  else{
    data.track = track;
  }
  this.put(this.concatBaseUrl("bundles/" + bundleId + "/tracks"), data, callback);
};

Client.prototype.removeTrack = function(bundleId, track, callback){
  var data = undefined;
  if(typeof track == "function"){
    callback = track;
  }
  else{
    data = {track: track};
  }
  this.delete(this.concatBaseUrl("bundles/" + bundleId + "/tracks"), data, callback);
};

Client.prototype.deleteTrack = Client.prototype.removeTrack;


/* Search */
Client.prototype.search = function(opts, callback){
  if(typeof opts == "function"){
    callback = opts;
    opts = null;
  }
  this.get(this.concatBaseUrl("search"), opts, callback);
};





/*
* Utility Methods
*
*/
Client.prototype.concatBaseUrl = function(path){
  return this.baseUrl + path;
}

Client.prototype.get = function(path, queryParameters, callback){
  var headers = {"Authorization" : "Bearer " + this.apiToken}
  var queryParams = querystring.stringify(queryParameters) || "";
  var urlPath = path;

  urlPath += queryParams ? "?" + queryParams : "";

  var httpOptions = {
    rejectUnauthorized:0,
    host : this.host,
    port: 443,
    path: urlPath,
    method: "GET",
    headers: headers
  };
  debug("GET %s", urlPath);
  var req = http.request(httpOptions, function(res){
    debug("Status code: %d", res.statusCode);
    if(res.statusCode !== 201 && res.statusCode !== 200){
      var err = new Error("Op3nvoice api error: " + (res.body || ""));
      err.statusCode = res.statusCode;
      callback(err);
    }
    else{
      var data = "";
      res.on("data", function(chunk){
        data += chunk
       });
      res.on("end", function(){
        var responseObj = JSON.parse(data);
        if(responseObj.message){
          callback(responseObj, null)
        }else {
          callback(null, responseObj);
        }
      });
    }
  });
  req.on("error", function(e) {
    callback(e)
  });

  req.end();

}


var makeRequest = function(method){
  return function(path, data, callback)
  {
    var content;
    callback = callback || function(){};
    if(typeof data == "function"){
      callback = data;
      data = "";
      content = "";
    }
    else{
      if(!data){
        content = "";
      }
      else{
        content = JSON.stringify(data);
      }
    }
    debug("%s %s: %s", method, path, content);
    var contentLength = content.length || 0;
    var headers = {"Content-Type":"application/json", "Content-Length":contentLength, "Authorization": "Bearer " + this.apiToken};

    var httpOptions = {
      host : this.host,
      port: 443,
      path: path,
      method: method,
      headers: headers
    };

    var req = http.request(httpOptions, function(res){
      debug("Status code: %d", res.statusCode);
      if(res.statusCode >= 400)
      {
        var err = new Error("Op3nvoice api error: " + (res.body || res.status || ""));
        err.statusCode = res.statusCode;
        callback(err);
      }
      else {
        var data = "";
        res.on("data", function(chunk){
          data += chunk
        });
        res.on("end", function(){
          var responseObj = null;
          try{
            responseObj = JSON.parse(data || "{}");
          }
          catch(err){
            responseObj = data;
          }
          if(responseObj.message){
            callback(responseObj, null)
          }else {
            callback(null, responseObj);
          }
        });
      }
    });
    req.on("error", function(e) {
      callback(e)
    });

    if(contentLength > 0)
    {
      req.write(content);
    }
    req.end();

  }
};

Client.prototype.post = makeRequest("POST");
Client.prototype.put = makeRequest("PUT");
Client.prototype.delete = makeRequest("DELETE");
