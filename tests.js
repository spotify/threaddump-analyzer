/*
Copyright 2014 Spotify AB

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

QUnit.test( "basic thread", function(assert) {
    var header = '"thread name" prio=10 tid=0x00007f16a118e000 nid=0x6e5a runnable [0x00007f18b91d0000]';
    assert.equal(new ThreadHeader(header), '"thread name": runnable');
});

QUnit.test( "daemon thread", function(assert) {
    var header = '"thread name" daemon prio=10 tid=0x00007f16a118e000 nid=0x6e5a runnable [0x00007f18b91d0000]';
    assert.equal(new ThreadHeader(header), '"thread name": daemon, runnable');
});

QUnit.test( "multiline thread name", function(assert) {
    var multilineHeader = '"line 1\nline 2" prio=10 tid=0x00007f16a118e000 nid=0x6e5a runnable [0x00007f18b91d0000]';
    var analyzer = new Analyzer(multilineHeader);
    var threads = analyzer.threads;

    assert.equal(threads.length, 1);
    assert.equal(threads[0].toString(), '"line 1, line 2": runnable');

    analysisLines = analyzer.toString().split('\n');
    assert.equal(analysisLines.length, 3);
    assert.equal(analysisLines[0], "1 threads found:");
    assert.equal(analysisLines[1], "");
    assert.equal(analysisLines[2], '"line 1, line 2": runnable');
});
