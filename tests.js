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

/* global QUnit */
/* global Thread */
/* global _extract */
/* global Analyzer */
/* global document */
/* global stringToId */
/* global StringCounter */

QUnit.test( "thread header 1", function(assert) {
    var header = '"thread name" prio=10 tid=0x00007f16a118e000 nid=0x6e5a runnable [0x00007f18b91d0000]';
    assert.equal(new Thread(header).toHeaderString(), '"thread name": runnable');
});

QUnit.test( "thread header 2", function(assert) {
    var header = '"ApplicationImpl pooled thread 1" prio=4 tid=11296d000 nid=0x118a84000 waiting on condition [118a83000]';
    assert.equal(new Thread(header).toHeaderString(), '"ApplicationImpl pooled thread 1": waiting on condition');
});

QUnit.test( "thread header 3", function(assert) {
    var header = '"Gang worker#1 (Parallel GC Threads)" prio=9 tid=105002800 nid=0x10bc88000 runnable';
    assert.equal(new Thread(header).toHeaderString(), '"Gang worker#1 (Parallel GC Threads)": runnable');
});

QUnit.test( "thread header 4", function(assert) {
    var header = '"Attach Listener" #10 daemon prio=9 os_prio=31 tid=0x00007fddb280e000 nid=0x380b waiting on condition [0x0000000000000000]';
    assert.equal(new Thread(header).toHeaderString(), '"Attach Listener": daemon, waiting on condition');
});

QUnit.test( "thread header 5", function(assert) {
    var header = '"Attach Listener" #10 daemon prio=9 os_prio=31 tid=0x00007fddb280e000 nid=0x380b waiting on condition';
    assert.equal(new Thread(header).toHeaderString(), '"Attach Listener": daemon, waiting on condition');
});

QUnit.test( "thread header 6", function(assert) {
    var header = '"VM Thread" os_prio=31 tid=0x00007fddb2049800 nid=0x3103 runnable';
    assert.equal(new Thread(header).toHeaderString(), '"VM Thread": runnable');
});

QUnit.test( "thread header 7", function(assert) {
    var header = '"Queued build chains changes collector 8" daemon group="main" prio=5 tid=431,909 nid=431,909 waiting ';
    assert.equal(new Thread(header).toHeaderString(), '"main"/"Queued build chains changes collector 8": daemon, waiting');
});

QUnit.test( "thread header 8", function(assert) {
    var header = '"Attach Listener" #10 prio=9 os_prio=31 tid=0x00007fddb280e000 nid=0x380b waiting on condition [0x0000000000000000]';
    assert.equal(new Thread(header).toHeaderString(), '"Attach Listener": waiting on condition');
});

QUnit.test( "daemon thread", function(assert) {
    var header = '"thread name" daemon prio=10 tid=0x00007f16a118e000 nid=0x6e5a runnable [0x00007f18b91d0000]';
    assert.equal(new Thread(header).toHeaderString(), '"thread name": daemon, runnable');
});

QUnit.test( "vm thread", function(assert) {
    var header = '"VM Periodic Task Thread" prio=10 tid=0x00007f1af00c9800 nid=0x3c2c waiting on condition ';
    assert.equal(new Thread(header).toHeaderString(), '"VM Periodic Task Thread": waiting on condition');
});

QUnit.test( "sleeping daemon thread", function(assert) {
    var header = '"Store spotify-uuid Spool Thread" daemon prio=10 tid=0x00007f1a16aa0800 nid=0x3f5b sleeping[0x00007f199997a000]';
    assert.equal(new Thread(header).toHeaderString(), '"Store spotify-uuid Spool Thread": daemon, sleeping');
});

QUnit.test( "sleeping thread", function(assert) {
    var header = '"git@github.com:caoliang2598/ta-zelda-test.git#master"}; 09:09:58 Task started; VCS Periodical executor 39" prio=10 tid=0x00007f1728056000 nid=0x1347 sleeping[0x00007f169cdcb000]';
    assert.equal(new Thread(header).toHeaderString(), '"git@github.com:caoliang2598/ta-zelda-test.git#master"}; 09:09:58 Task started; VCS Periodical executor 39": sleeping');
});

// Our definition of a "running" thread is one that is both in
// Thread.State RUNNABLE and free text state "runnable".
QUnit.test("thread.running", function(assert) {
    var thread;

    thread = new Thread('"thread" prio=10 runnable');
    thread.addStackLine("	java.lang.Thread.State: RUNNABLE");
    assert.ok(thread.running);

    thread = new Thread('"thread" prio=10 not runnable');
    thread.addStackLine("	java.lang.Thread.State: RUNNABLE");
    assert.ok(!thread.running);

    thread = new Thread('"thread" prio=10 runnable');
    thread.addStackLine("	java.lang.Thread.State: TERMINATED");
    assert.ok(!thread.running);

    thread = new Thread('"thread" prio=10 not runnable');
    thread.addStackLine("	java.lang.Thread.State: TERMINATED");
    assert.ok(!thread.running);

    // Thread without Thread.State
    thread = new Thread('"thread" prio=10 runnable');
    assert.ok(!thread.running);
});

QUnit.test( "multiline thread name", function(assert) {
    // It's the Analyzer that joins lines so we have to go through the Analyzer here
    var multilineHeader = '"line 1\nline 2" prio=10 tid=0x00007f16a118e000 nid=0x6e5a runnable [0x00007f18b91d0000]';
    var analyzer = new Analyzer(multilineHeader);
    var threads = analyzer.threads;

    assert.equal(threads.length, 1);
    var threadLines = threads[0].toString().split('\n');
    assert.deepEqual(threadLines, [
        '"line 1, line 2": runnable',
        '	<empty stack>'
    ]);

    // Test the Analyzer's toString() method as well now that we have an Analyzer
    var analysisLines = analyzer.toString().split('\n');
    assert.deepEqual(analysisLines, [
        "1 threads found:",
        "",
        '"line 1, line 2": runnable',
        "	<empty stack>",
        ""
    ]);
});

QUnit.test( "analyze stackless thread", function(assert) {
    var threadDump = '"thread name" prio=10 tid=0x00007f16a118e000 nid=0x6e5a runnable [0x00007f18b91d0000]';
    var analyzer = new Analyzer(threadDump);
    var threads = analyzer.threads;
    assert.equal(threads.length, 1);
    var thread = threads[0];

    var analysisResult = analyzer._toThreadsAndStacks();
    assert.deepEqual(analysisResult, [{
        threads: [thread],
        stackFrames: []
    }]);
});

QUnit.test( "analyze single thread", function(assert) {
    var threadDump = [
        '"thread name" prio=10 tid=0x00007f16a118e000 nid=0x6e5a runnable [0x00007f18b91d0000]',
        '	at fluff'
    ].join('\n');
    var analyzer = new Analyzer(threadDump);
    var threads = analyzer.threads;
    assert.equal(threads.length, 1);
    var thread = threads[0];

    var analysisResult = analyzer._toThreadsAndStacks();
    assert.deepEqual(analysisResult, [{
        threads: [thread],
        stackFrames: ["fluff"]
    }]);
});

QUnit.test( "analyze two threads with same stack", function(assert) {
    // Thread dump with zebra before aardvark
    var threadDump = [
        '"zebra thread" prio=10 tid=0x00007f16a118e000 nid=0x6e5a runnable [0x00007f18b91d0000]',
        '	at fluff',
        "",
        '"aardvark thread" prio=10 tid=0x00007f16a118e000 nid=0x6e5a runnable [0x00007f18b91d0000]',
        '	at fluff'
    ].join('\n');

    var analyzer = new Analyzer(threadDump);

    var threads = analyzer.threads;
    assert.equal(threads.length, 2);
    var zebra = threads[0];
    assert.equal(zebra.name, "zebra thread");
    var aardvark = threads[1];
    assert.equal(aardvark.name, "aardvark thread");

    var analysisResult = analyzer._toThreadsAndStacks();
    assert.deepEqual(analysisResult, [{
        // Make sure the aardvark comes before the zebra
        threads: [aardvark, zebra],
        stackFrames: ["fluff"]
    }]);
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
    assert.deepEqual(threadLines, [
        '"Thread name": sleeping',
        "	at java.security.AccessController.doPrivileged(Native Method)",
        "	at java.net.SocksSocketImpl.connect(SocksSocketImpl.java:353)"
    ]);
});

function unescapeHtml(escaped) {
  var e = document.createElement('div');
  e.innerHTML = escaped;
  return e.childNodes.length === 0 ? "" : e.childNodes[0].nodeValue;
}

QUnit.test( "full dump analysis", function(assert) {
    var input = document.getElementById("sample-input").innerHTML;
    var expectedOutput = unescapeHtml(document.getElementById("sample-analysis").innerHTML);
    var analyzer = new Analyzer(input);
    assert.deepEqual(analyzer.toString().split('\n'), expectedOutput.split('\n'));

    var expectedIgnores = document.getElementById("sample-ignored").innerHTML;
    assert.deepEqual(analyzer.toIgnoresString().split('\n'), expectedIgnores.split('\n'));

    var expectedRunning = document.getElementById("sample-running").innerHTML;
    assert.deepEqual(analyzer.toRunningString().split('\n'), expectedRunning.split('\n'));
});

QUnit.test("extract regex from string", function(assert) {
    var extracted = _extract(/a(p)a/, "gris");
    assert.equal(extracted.value, undefined);
    assert.equal(extracted.shorterString, "gris");

    extracted = _extract(/a(p)a/, "hejapagris");
    assert.equal(extracted.value, "p");
    assert.equal(extracted.shorterString, "hejgris");
});

QUnit.test("identical string counter", function(assert) {
    var counter = new StringCounter();
    assert.deepEqual(counter.getStrings().length, 0);
    assert.equal(counter.toString(), "");
    assert.equal(counter.length, 0);

    counter.addString("hej");
    assert.deepEqual(counter.getStrings(), [{count:1, string:"hej", sources: [undefined]}]);
    assert.deepEqual(counter.toString().split('\n'), [
        "1 hej"
    ]);
    assert.equal(counter.length, 1);

    counter.addString("nej");
    counter.addString("nej");
    assert.deepEqual(counter.getStrings(),
                     [
                         {count:2, string:"nej", sources:[undefined, undefined]},
                         {count:1, string:"hej", sources:[undefined]}
                     ]);
    assert.deepEqual(counter.toString().split('\n'), [
        "2 nej",
        "1 hej"
    ]);
    assert.equal(counter.length, 3);

    counter.addString("hej", "foo");
    counter.addString("hej", "bar");
    assert.deepEqual(counter.getStrings(),
                     [
                         {count:3, string:"hej", sources:[undefined, "foo", "bar"]},
                         {count:2, string:"nej", sources:[undefined, undefined]}
                     ]);
    assert.deepEqual(counter.toString().split('\n'), [
        "3 hej",
        "2 nej"
    ]);
    assert.equal(counter.length, 5);
});

QUnit.test("string to id", function(assert) {
    assert.equal(stringToId("\"<>'#"), "%22%3C%3E%27%23");
});

QUnit.test( "Analyzer.stackToHtml()", function(assert) {
    var threadDump = [
        '"running thread" prio=10 tid=0x00007f16a118e000 nid=0x6e5a runnable [0x00007f18b91d0000]',
        '	java.lang.Thread.State: RUNNABLE',
        '	at top_frame',
        '	at second_frame',
        '',
        '"VM Thread" prio=9 tid=105047000 nid=0x111901000 runnable',
    ].join('\n');
    var analyzer = new Analyzer(threadDump);

    assert.deepEqual(analyzer._stackToHtml(['top_frame', 'second_frame']).split('\n'), [
        '<div class="raw">	at top_frame</div>',
        '<div class="raw">	at second_frame</div>',
        '',
    ]);

    assert.deepEqual(analyzer._stackToHtml([]).split('\n'), [
        '<div class="raw">	&lt;empty stack&gt;</div>',
        '',
    ]);
});
