# Java thread dump analyzer

This is a Java thread dump analyzer written in Javascript.

The idea is that this web page should live somewhere on the Internet
and help people all over analyze their thread dumps:

https://ghe.spotify.net/pages/walles/threaddump-analyzer/


## TODO
* Connect the submit button to a Javascript function that simply
copies the whole thread dump to below the line.

* Parse the thread dump and reconstruct it below the line.

* Instead of recreating the thread dump, show it in a tree with
expandable nodes.

* Support uploading threaddumps from the local file system.

* Support parsing gzipped threaddumps.

* Support parsing multiple consecutive thread dumps.

* Show locking information as part of the analysis.


## DONE
* Publish the web page using Github pages.

* Make submit button call a Javascript function.
