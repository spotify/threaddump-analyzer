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
    assert.equal(new Thread(header), '"thread name": runnable');
});

QUnit.test( "daemon thread", function(assert) {
    var header = '"thread name" daemon prio=10 tid=0x00007f16a118e000 nid=0x6e5a runnable [0x00007f18b91d0000]';
    assert.equal(new Thread(header), '"thread name": daemon, runnable');
});

QUnit.test( "vm thread", function(assert) {
    var header = '"VM Periodic Task Thread" prio=10 tid=0x00007f1af00c9800 nid=0x3c2c waiting on condition ';
    assert.equal(new Thread(header), '"VM Periodic Task Thread": waiting on condition');
});

QUnit.test( "sleeping daemon thread", function(assert) {
    var header = '"Store spotify-uuid Spool Thread" daemon prio=10 tid=0x00007f1a16aa0800 nid=0x3f5b sleeping[0x00007f199997a000]';
    assert.equal(new Thread(header), '"Store spotify-uuid Spool Thread": daemon, sleeping');
});

QUnit.test( "sleeping thread", function(assert) {
    var header = '"git@ghe.spotify.net:caoliang2598/ta-zelda-test.git#master"}; 09:09:58 Task started; VCS Periodical executor 39" prio=10 tid=0x00007f1728056000 nid=0x1347 sleeping[0x00007f169cdcb000]';
    assert.equal(new Thread(header), '"git@ghe.spotify.net:caoliang2598/ta-zelda-test.git#master"}; 09:09:58 Task started; VCS Periodical executor 39": sleeping');
});

QUnit.test( "multiline thread name", function(assert) {
    // It's the Analyzer that joins lines so we have to go through the Analyzer here
    var multilineHeader = '"line 1\nline 2" prio=10 tid=0x00007f16a118e000 nid=0x6e5a runnable [0x00007f18b91d0000]';
    var analyzer = new Analyzer(multilineHeader);
    var threads = analyzer.threads;

    assert.equal(threads.length, 1);
    assert.equal(threads[0].toString(), '"line 1, line 2": runnable');

    // Test the Analyzer's toString() method as well now that we have an Analyzer
    var analysisLines = analyzer.toString().split('\n');
    assert.equal(analysisLines.length, 3);
    assert.equal(analysisLines[0], "1 threads found:");
    assert.equal(analysisLines[1], "");
    assert.equal(analysisLines[2], '"line 1, line 2": runnable');
});

QUnit.test( "thread stack", function(assert) {
    var header = '"Thread name" prio=10 tid=0x00007f1728056000 nid=0x1347 sleeping[0x00007f169cdcb000]';
    var thread = new Thread(header);
    thread.addStackLine("	at java.security.AccessController.doPrivileged(Native Method)");
    thread.addStackLine("	- eliminated <0x00000006b3ccb178> (a java.io.PipedInputStream)");
    thread.addStackLine("	at java.net.SocksSocketImpl.connect(SocksSocketImpl.java:353)");
    thread.addStackLine("	- parking to wait for  <0x00000003138d65d0> (a java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject)");

    // When adding stack frames we should just ignore unsupported
    // lines, and the end result should contain only supported data.
    var threadLines = thread.toString().split('\n');
    assert.equal(threadLines.length, 3);
    assert.equal(threadLines[0], '"Thread name": sleeping');
    assert.equal(threadLines[1], "	at java.security.AccessController.doPrivileged(Native Method)");
    assert.equal(threadLines[2], "	at java.net.SocksSocketImpl.connect(SocksSocketImpl.java:353)");
});
