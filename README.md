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
* Publish on public Github.

* Update the README.md links to point to the public Analyzer location.

* Put links to the Github project and the unit tests page on index.html.

* Add a Travis configuration.

* Make Travis run the unit tests and fail the build if they fail.

* Make Travis validate the HTML and fail the build if the HTML is
invalid.

* Make Travis run a Javascript code checker and fail the build if there
are warnings.

* Sort thread names in each group alphabetically.

* Dump all input lines we failed to parse in red at the end so it's
obvious if we need to add something.

* If two stacks are just as common, use the stack trace contents itself
as the secondary sort key. This way similar stacks will end up closer to
each other.

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

* Put an actual thread dump and the expected outcome of analyzing it
in test.html and make a test that verifies that analyzing that dump
gives the expected result.


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

* Group threads with the same stacks and show the most common stack
traces and their names first.

* Put \<empty stack trace\> threads last, no matter how many they are.

* If there are five or more threads in a group, prefix the group with a
line saying: "NN threads with stack trace:"
