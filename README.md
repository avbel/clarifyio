Op3nvoice API for Node
========================

Install
------------------------

```
npm install clarifyio
```

Usage
------------------------

Read [here](https://api-beta.op3nvoice.com/docs) for more detailed description.

```
var client = new clarifyio.Client("api-beta.op3nvoice.com", "your-auth-key");

client.getBundles(opts, callback);
client.createBundle(data, callback);
client.getBundlefunction(bundleId, opts, callback);
client.removeBundle(bundleId, callback);
client.updateBundle(bundleId, data, callback);

client.getMetadata(bundleId, opts, callback);
client.updateMetadata(bundleId, data, callback);
client.removeMetadata(bundleId, callback);

client.getTracks(bundleId, opts, callback);
client.createTrack(bundleId, data, callback);
client.updateTrack(bundleId, track, data, callback);
client.removeTrack(bundleId, track, callback);

client.search(opts, callback);

```
