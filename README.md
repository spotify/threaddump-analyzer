<!--- -*-markdown-*- -->

# Java Thread Dump Analyzer

This is a Java thread dump analyzer written in Javascript.

[Click here to get your Java thread dump analyzed.](http://spotify.github.io/threaddump-analyzer/)

[Click here to run the unit tests.](http://spotify.github.io/threaddump-analyzer/test.html)

# License

The Java Thread Dump Analyzer is licensed under
[version 2.0 of the Apache license](http://www.apache.org/licenses/LICENSE-2.0.html),
the copyright belongs to Spotify AB.

## TODO
* Say "... threads with no stack" for threads with no stack, rather
  than "... threads with this stack".

* Make the Thread class parse held locks, waited-for locks and
waited-for condition variables from the thread dump.

* List all synchronization things at the end; both locks and condition
  variables in the same list. For each, list who's holding it, who's
  waiting for the lock, and who's waiting for notification. All
  references should be clickable. And there should be clickable links
  from each thread in the thread list to whatever synchronization
  thingie it is involved with.

* If a thread is waiting for another thread to release a lock, make
sure there's a clickable reference from the waiter to the holder.

* Detect deadlocks and display deadlock information prominently at the
top if detected.

* Support uploading thread dumps from the local file system.

* Support parsing gzipped thread dumps.

* Support parsing multiple consecutive thread dumps.

* Auto detect if somebody copies a thread dump to the clipboard and
spontaneously analyze that.

* If two or more threads share both thread header and stack, print
only one thread header line prefixed by "N x ".

* Instead of showing the thread dump as text, show it in a tree with
expandable nodes.

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

* Publish on public Github.

* Update the README.md links to point to the public Analyzer location.

* Put links to the Github project and the unit tests page on index.html.

* Put an actual thread dump and the expected outcome of analyzing it
in test.html and make a test that verifies that analyzing that dump
gives the expected result.

* Add a "report bug" link right after the analysis.

* Add a Travis configuration.

* Make Travis run the unit tests and fail the build if they fail.

* If two stacks are just as common, use the stack trace contents itself
as the secondary sort key. This way similar stacks will end up closer to
each other.

* Sort thread names in each group alphabetically.

* Make Travis run a Javascript code checker and fail the build if there
are warnings.

* Make Travis validate the HTML and fail verifictaion on HTML
problems.

* Dump all input lines we failed to parse in red at the end so it's
obvious if we need to add something.

* Move styling into CSS.

* Turn the Ignored Lines section at the bottom into an HTML table.

* List top RUNNING methods before everything else. I have a thread
  dump taken on a system that was swapping basically getting the GC
  stuck. With a list of top RUNNING methods it should be possible to
  see this from the analysis.

* Add a Clear button next to the Analyze button.

* For top running methods belonging to only one thread, make a link
from the top list method to the thread executing it.

* For threads with a method in the top running methods at the start of
the page, make a link from the top frame of the full stack back up to
the Top Running Methods section.
