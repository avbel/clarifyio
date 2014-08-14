var op3nvoice = require("../lib");
var path = require("path");
var client = new op3nvoice.Client("api-beta.op3nvoice.com", "FILL_API_KEY_HERE");
var should = require('should')

describe("Op3nvoice API tests", function(){


  describe("baseline tests", function(){
    it("should be valid client", function(done){
      client.should.be.ok
      done()
    });
  });

  describe("Bundle tests", function(){
    it("should support CRUD operations", function(done){
      var data = {
        name: "Test bundle " + Math.random(),
        media_url: "https://s3-us-west-2.amazonaws.com/op3nvoice/harvard-sentences-1.wav"
      };
      client.createBundle(data, function(err, res){
        if(err) return done(err);
        res.id.should.be.ok;
        var bundleId = res.id;
        client.getBundle(bundleId, function(err, bundle){
          if(err) return done(err);
          bundle.id.should.equal(bundleId);
          bundle.name.should.equal(data.name);
          client.updateBundle(bundleId, {name: "another name"}, function(err, bundle){
            if(err) return done(err);
            bundle.id.should.equal(bundleId);
            client.getBundle(bundleId, function(err, bundle){
              if(err) return done(err);
              bundle.id.should.equal(bundleId);
              bundle.name.should.equal("another name");
              client.getBundles(function(err, list){
                if(err) return done(err);
                var total = list.total;
                (list._links.items.length > 0).should.be.true;
                (total > 0).should.be.true;
                client.removeBundle(bundleId, function(err){
                  if(err) return done(err);
                  client.getBundles(function(err, list){
                    if(err) return done(err);
                    (total - list.total).should.equal(1);
                    done();
                  });
                });
              });
            });
          });
        });
      });
    });
  });
  describe("Metadata tests", function(){
    it("should support CRUD operations", function(done){
      var data = {
        name: "Test bundle " + Math.random(),
        media_url: "https://s3-us-west-2.amazonaws.com/op3nvoice/harvard-sentences-1.wav"
      };
      client.createBundle(data, function(err, res){
        if(err) return done(err);
        var bundleId = res.id;
        client.getMetadata(bundleId, function(err, data){
          if(err) return done(err);
          data.bundle_id.should.equal(bundleId);
          Object.keys(data.data).length.should.equal(0);
          client.updateMetadata(bundleId, {test: "test"}, function(err){
            if(err) return done(err);
            client.getMetadata(bundleId, function(err, data){
              if(err) return done(err);
              data.data.test.should.equal("test");
              client.removeMetadata(bundleId, function(err){
                if(err) return done(err);
                client.getMetadata(bundleId, function(err, data){
                  if(err) return done(err);
                  data.bundle_id.should.equal(bundleId);
                  Object.keys(data.data).length.should.equal(0);
                  client.removeBundle(bundleId, done);
                });
              });
            });
          });
        });
      });
    });
  });
  describe("Tracks tests", function(){
    it("should support CRUD operations", function(done){
      var data = {
        name: "Test bundle " + Math.random(),
        media_url: "https://s3-us-west-2.amazonaws.com/op3nvoice/harvard-sentences-1.wav"
      };
      client.createBundle(data, function(err, res){
        if(err) return done(err);
        var bundleId = res.id;
        client.createTrack(bundleId, {label: "track1", media_url: "https://s3-us-west-2.amazonaws.com/op3nvoice/harvard-sentences-2.wav"}, function(err){
          if(err) return done(err);
          client.getTracks(bundleId, function(err, tracks){
            if(err) return done(err);
            tracks.tracks.length.should.equal(2);
            tracks.tracks[0].media_url.should.equal("https://s3-us-west-2.amazonaws.com/op3nvoice/harvard-sentences-1.wav");
            tracks.tracks[1].media_url.should.equal("https://s3-us-west-2.amazonaws.com/op3nvoice/harvard-sentences-2.wav");
            tracks.tracks[1].label.should.equal("track1");
            client.updateTrack(bundleId, 1, {label: "new track"}, function(err){
              if(err) return done(err);
              client.getTracks(bundleId, function(err, tracks){
                if(err) return done(err);
                tracks.tracks[1].label.should.equal("new track");
                client.createTrack(bundleId, {label: "track2", media_url: "https://s3-us-west-2.amazonaws.com/op3nvoice/harvard-sentences-2.wav"}, function(err){
                  if(err) return done(err);
                  client.getTracks(bundleId, function(err, tracks){
                    if(err) return done(err);
                    tracks.tracks.length.should.equal(3);
                    client.removeTrack(bundleId, 1, function(err){
                      if(err) return done(err);
                      client.getTracks(bundleId, function(err, tracks){
                        if(err) return done(err);
                        tracks.tracks.length.should.equal(2);
                        client.removeTrack(bundleId, function(err){
                          if(err) return done(err);
                          client.getTracks(bundleId, function(err, tracks){
                            if(err) return done(err);
                            tracks.tracks.length.should.equal(0);
                            client.removeBundle(bundleId, done);
                          });
                        });
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  });
  describe("Search tests", function(){
    it("should search bundles by query text", function(done){
      var bundleId1, bundleId2;
      var data = {
        name: "qwerty bundle " + Math.random(),
        media_url: "https://s3-us-west-2.amazonaws.com/op3nvoice/harvard-sentences-1.wav"
      };
      client.createBundle(data, function(err, res){
        if(err) return done(err);
        bundleId1 = res.id;
        data = {
          name: "sssss bundle " + Math.random(),
          media_url: "https://s3-us-west-2.amazonaws.com/op3nvoice/harvard-sentences-2.wav"
        };
        client.createBundle(data, function(err, res){
          if(err) return done(err);
          bundleId2 = res.id;
          client.search({query: "qwerty", query_fields: "bundle.name"}, function(err, res){
            if(err) return done(err);
            res.total.should.equal(1);
            res.item_results.length.should.equal(1);
            res._links.items.length.should.equal(1);
            (res._links.items[0].href.indexOf("/" + bundleId1) > 0).should.be.true;
            client.removeBundle(bundleId1, function(err){
              if(err) return done(err);
              client.removeBundle(bundleId2, done);
            });
          });
        });
      });

    });
  });
});

