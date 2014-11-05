<!--- -*-markdown-*- -->

# Java Thread Dump Analyzer

This is a Java thread dump analyzer written in Javascript.

[Click here to get your Java thread dump analyzed.](https://ghe.spotify.net/pages/walles/threaddump-analyzer/)

[Click here to run the unit tests.](https://ghe.spotify.net/pages/walles/threaddump-analyzer/test.html)

# License

The Java Thread Dump Analyzer is licensed under
[version 2.0 of the Apache license](http://www.apache.org/licenses/LICENSE-2.0.html),
the copyright belongs to Spotify AB.

## TODO
* Group threads with the same stacks and show the most common stack
traces and their names first.

* Instead of recreating the thread dump, show it in a tree with
expandable nodes.

* Support uploading threaddumps from the local file system.

* Support parsing gzipped threaddumps.

* Support parsing multiple consecutive thread dumps.

* Include locking information in the analysis.

* Include synchronizers in the analysis.

* Include java.lang.Thread.State in the analysis.

* Include "- locked", "- eliminated", "- parking to wait for", "-
  waiting on" and any other similar lines in the analysis.

* Auto detect if somebody copies a thread dump to the clipboard and
spontaneously analyze that.

* Find out how to load a text file in the tests and validate the
result of analyzing that file.

* Dump all input lines we failed to parse in red at the end so it's
obvious if we need to add something.

* Publish on public Github.


## DONE
* Publish the web page using Github pages.

* Make submit button call a Javascript function.

* Connect the submit button to a Javascript function that simply
copies the whole thread dump to below the line.

* HTML escape the text before writing it below the line.

* Make an Analyzer class / prototype.

* Parse the thread dump and reconstruct it below the line.

* Handle thread names containing linefeeds.

* Add tests, unit or otherwise.

* Apply Apache License.

* Our example thread dump contains 297 threads. Make sure we get all
of them on the web page.

* Add thread stack traces to the parse result.

* Add thread stacks to the output.
