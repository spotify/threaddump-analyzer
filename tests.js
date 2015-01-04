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
    assert.equal(new Thread(header).toHeaderHTML(), '<span class="raw">"thread name": runnable</span>');
});

QUnit.test( "thread header 2", function(assert) {
    var header = '"ApplicationImpl pooled thread 1" prio=4 tid=11296d000 nid=0x118a84000 waiting on condition [118a83000]';
    assert.equal(new Thread(header).toHeaderHTML(), '<span class="raw">"ApplicationImpl pooled thread 1": waiting on condition</span>');
});

QUnit.test( "thread header 3", function(assert) {
    var header = '"Gang worker#1 (Parallel GC Threads)" prio=9 tid=105002800 nid=0x10bc88000 runnable';
    assert.equal(new Thread(header).toHeaderHTML(), '<span class="raw">"Gang worker#1 (Parallel GC Threads)": runnable</span>');
});

QUnit.test( "thread header 4", function(assert) {
    var header = '"Attach Listener" #10 daemon prio=9 os_prio=31 tid=0x00007fddb280e000 nid=0x380b waiting on condition [0x0000000000000000]';
    assert.equal(new Thread(header).toHeaderHTML(), '<span class="raw">"Attach Listener": daemon, waiting on condition</span>');
});

QUnit.test( "thread header 5", function(assert) {
    var header = '"Attach Listener" #10 daemon prio=9 os_prio=31 tid=0x00007fddb280e000 nid=0x380b waiting on condition';
    assert.equal(new Thread(header).toHeaderHTML(), '<span class="raw">"Attach Listener": daemon, waiting on condition</span>');
});

QUnit.test( "thread header 6", function(assert) {
    var header = '"VM Thread" os_prio=31 tid=0x00007fddb2049800 nid=0x3103 runnable';
    assert.equal(new Thread(header).toHeaderHTML(), '<span class="raw">"VM Thread": runnable</span>');
});

QUnit.test( "thread header 7", function(assert) {
    var header = '"Queued build chains changes collector 8" daemon group="main" prio=5 tid=431,909 nid=431,909 waiting ';
    assert.equal(new Thread(header).toHeaderHTML(),
                 '<span class="raw">"main"/"Queued build chains changes collector 8": daemon, waiting</span>');
});

QUnit.test( "thread header 8", function(assert) {
    var header = '"Attach Listener" #10 prio=9 os_prio=31 tid=0x00007fddb280e000 nid=0x380b waiting on condition [0x0000000000000000]';
    assert.equal(new Thread(header).toHeaderHTML(), '<span class="raw">"Attach Listener": waiting on condition</span>');
});

QUnit.test( "daemon thread", function(assert) {
    var header = '"thread name" daemon prio=10 tid=0x00007f16a118e000 nid=0x6e5a runnable [0x00007f18b91d0000]';
    assert.equal(new Thread(header).toHeaderHTML(), '<span class="raw">"thread name": daemon, runnable</span>');
});

QUnit.test( "vm thread", function(assert) {
    var header = '"VM Periodic Task Thread" prio=10 tid=0x00007f1af00c9800 nid=0x3c2c waiting on condition ';
    assert.equal(new Thread(header).toHeaderHTML(), '<span class="raw">"VM Periodic Task Thread": waiting on condition</span>');
});

QUnit.test( "sleeping daemon thread", function(assert) {
    var header = '"Store spotify-uuid Spool Thread" daemon prio=10 tid=0x00007f1a16aa0800 nid=0x3f5b sleeping[0x00007f199997a000]';
    assert.equal(new Thread(header).toHeaderHTML(), '<span class="raw">"Store spotify-uuid Spool Thread": daemon, sleeping</span>');
});

QUnit.test( "sleeping thread", function(assert) {
    var header = '"git@github.com:caoliang2598/ta-zelda-test.git#master"}; 09:09:58 Task started; VCS Periodical executor 39" prio=10 tid=0x00007f1728056000 nid=0x1347 sleeping[0x00007f169cdcb000]';
    assert.equal(new Thread(header).toHeaderHTML(),
                 '<span class="raw">"git@github.com:caoliang2598/ta-zelda-test.git#master"}; 09:09:58 Task started; VCS Periodical executor 39": sleeping</span>');
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
    var analysisLines = analyzer.toHtml().split('\n');
    assert.deepEqual(analysisLines, [
        "<h2>1 threads found</h2>",
        "<div class=\"threadgroup\">",
        "<div class=\"threadcount\"></div>",
        '<div id="0x00007f16a118e000"><span class="raw">"line 1, line 2": runnable</span></div>',
        "<div class=\"raw\">	&lt;empty stack&gt;</div>",
        "</div>",
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

QUnit.test( "analyze thread waiting for notification", function(assert) {
    var threadDump = [
        '"Image Fetcher 2" daemon prio=8 tid=11b885800 nid=0x11e78d000 in Object.wait() [11e78c000]',
        '   java.lang.Thread.State: TIMED_WAITING (on object monitor)',
        '	at java.lang.Object.wait(Native Method)',
        '	- waiting on <7c135ea90> (a java.util.Vector)',
        '	at sun.awt.image.ImageFetcher.nextImage(ImageFetcher.java:114)',
        '	- locked <7c135ea90> (a java.util.Vector)',
        '	at sun.awt.image.ImageFetcher.fetchloop(ImageFetcher.java:167)',
        '	at sun.awt.image.ImageFetcher.run(ImageFetcher.java:136)',
        '',
        '   Locked ownable synchronizers:',
        '	- None',
    ].join('\n');
    var analyzer = new Analyzer(threadDump);
    var threads = analyzer.threads;
    assert.equal(threads.length, 1);
    var thread = threads[0];

    assert.equal(thread.wantNotificationOn, '7c135ea90');
    assert.equal(thread.wantToAcquire, null);

    var locksHeld = [ /* Lock is released while synchronizing */ ];
    assert.deepEqual(thread.locksHeld, locksHeld);

    assert.equal(thread.synchronizerClasses['7c135ea90'], 'java.util.Vector');
    assert.equal(thread.synchronizerClasses['47114712gris'], null);

    // Validate global lock analysis
    assert.deepEqual(Object.keys(analyzer._synchronizerById), ['7c135ea90']);
    assert.ok(analyzer._synchronizerById['7c135ea90'] !== null);
    assert.ok(analyzer._synchronizerById['7c135ea90'] !== undefined);
    assert.deepEqual(analyzer._synchronizers,
                     [analyzer._synchronizerById['7c135ea90']]);
});

QUnit.test( "analyze thread waiting for java.util.concurrent lock", function(assert) {
    var threadDump = [
        '"Animations" daemon prio=5 tid=11bad3000 nid=0x11dbcf000 waiting on condition [11dbce000]',
        '   java.lang.Thread.State: WAITING (parking)',
        '	at sun.misc.Unsafe.park(Native Method)',
        '	- parking to wait for  <7c2cd7dd0> (a java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject)',
        '	at java.util.concurrent.locks.LockSupport.park(LockSupport.java:156)',
        '	at java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject.await(AbstractQueuedSynchronizer.java:1987)',
        '	at java.util.concurrent.DelayQueue.take(DelayQueue.java:160)',
        '	at java.util.concurrent.ScheduledThreadPoolExecutor$DelayedWorkQueue.take(ScheduledThreadPoolExecutor.java:609)',
        '	at java.util.concurrent.ScheduledThreadPoolExecutor$DelayedWorkQueue.take(ScheduledThreadPoolExecutor.java:602)',
        '	at java.util.concurrent.ThreadPoolExecutor.getTask(ThreadPoolExecutor.java:957)',
        '	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:917)',
        '	at java.lang.Thread.run(Thread.java:695)',
        '',
        '   Locked ownable synchronizers:',
        '	- None',
    ].join('\n');

    var analyzer = new Analyzer(threadDump);
    var threads = analyzer.threads;
    assert.equal(threads.length, 1);
    var thread = threads[0];

    assert.equal(thread.wantNotificationOn, null);
    assert.equal(thread.wantToAcquire, '7c2cd7dd0');

    var locksHeld = [ /* None */ ];
    assert.deepEqual(thread.locksHeld, locksHeld);

    assert.equal(thread.synchronizerClasses['7c2cd7dd0'], 'java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject');
    assert.equal(thread.synchronizerClasses['47114712gris'], null);
});

QUnit.test( "analyze thread waiting for traditional lock", function(assert) {
    var threadDump = [
        '"DB-Processor-14" daemon prio=5 tid=0x003edf98 nid=0xca waiting for monitor entry [0x000000000825f020]',
        '   java.lang.Thread.State: BLOCKED (on object monitor)',
        '	at beans.ConnectionPool.getConnection(ConnectionPool.java:102)',
        '	- waiting to lock <0xe0375410> (a beans.ConnectionPool)',
        '	at beans.cus.ServiceCnt.getTodayCount(ServiceCnt.java:111)',
        '	at beans.cus.ServiceCnt.insertCount(ServiceCnt.java:43)',
        '',
        '   Locked ownable synchronizers:',
        '	- None',
    ].join('\n');

    var analyzer = new Analyzer(threadDump);
    var threads = analyzer.threads;
    assert.equal(threads.length, 1);
    var thread = threads[0];

    assert.equal(thread.wantNotificationOn, null);
    assert.equal(thread.wantToAcquire, '0xe0375410');

    var locksHeld = [ /* None */ ];
    assert.deepEqual(thread.locksHeld, locksHeld);

    assert.equal(thread.synchronizerClasses['0xe0375410'], 'beans.ConnectionPool');
    assert.equal(thread.synchronizerClasses['47114712gris'], null);
});

QUnit.test( "analyze thread holding locks", function(assert) {
    var threadDump = [
        '"ApplicationImpl pooled thread 8" daemon prio=4 tid=10d96d000 nid=0x11e68a000 runnable [11e689000]',
        '   java.lang.Thread.State: RUNNABLE',
        '	at sun.nio.ch.KQueueArrayWrapper.kevent0(Native Method)',
        '	at sun.nio.ch.KQueueArrayWrapper.poll(KQueueArrayWrapper.java:136)',
        '	at sun.nio.ch.KQueueSelectorImpl.doSelect(KQueueSelectorImpl.java:69)',
        '	at sun.nio.ch.SelectorImpl.lockAndDoSelect(SelectorImpl.java:69)',
        '	- locked <7c37ef220> (a io.netty.channel.nio.SelectedSelectionKeySet)',
        '	- locked <7c392fac0> (a java.util.Collections$UnmodifiableSet)',
        '	- locked <7c37f5b88> (a sun.nio.ch.KQueueSelectorImpl)',
        '	at sun.nio.ch.SelectorImpl.select(SelectorImpl.java:80)',
        '	at io.netty.channel.nio.NioEventLoop.select(NioEventLoop.java:618)',
        '	at io.netty.channel.nio.NioEventLoop.run(NioEventLoop.java:306)',
        '	at io.netty.util.concurrent.SingleThreadEventExecutor$5.run(SingleThreadEventExecutor.java:824)',
        '	at com.intellij.openapi.application.impl.ApplicationImpl$8.run(ApplicationImpl.java:419)',
        '	at java.util.concurrent.Executors$RunnableAdapter.call(Executors.java:439)',
        '	at java.util.concurrent.FutureTask$Sync.innerRun(FutureTask.java:303)',
        '	at java.util.concurrent.FutureTask.run(FutureTask.java:138)',
        '	at java.util.concurrent.ThreadPoolExecutor$Worker.runTask(ThreadPoolExecutor.java:895)',
        '	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:918)',
        '	at java.lang.Thread.run(Thread.java:695)',
        '	at com.intellij.openapi.application.impl.ApplicationImpl$1$1.run(ApplicationImpl.java:149)',
        '',
        '   Locked ownable synchronizers:',
        '	- <7c393f190> (a java.util.concurrent.locks.ReentrantLock$NonfairSync)',
    ].join('\n');
    var analyzer = new Analyzer(threadDump);
    var threads = analyzer.threads;
    assert.equal(threads.length, 1);
    var thread = threads[0];

    assert.equal(thread.wantNotificationOn, null);
    assert.equal(thread.wantToAcquire, null);

    var locksHeld = [ '7c37ef220', '7c392fac0', '7c37f5b88', '7c393f190' ];
    assert.deepEqual(thread.locksHeld, locksHeld);

    assert.equal(thread.synchronizerClasses['7c37ef220'], 'io.netty.channel.nio.SelectedSelectionKeySet');
    assert.equal(thread.synchronizerClasses['7c392fac0'], 'java.util.Collections$UnmodifiableSet');
    assert.equal(thread.synchronizerClasses['7c37f5b88'], 'sun.nio.ch.KQueueSelectorImpl');
    assert.equal(thread.synchronizerClasses['7c393f190'], 'java.util.concurrent.locks.ReentrantLock$NonfairSync');
    assert.equal(thread.synchronizerClasses['47114712gris'], null);

    assert.equal(analyzer._synchronizerById['7c37f5b88'].lockHolder, thread);
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
    assert.deepEqual(analyzer.toHtml().split('\n'), expectedOutput.split('\n'));

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

    assert.ok(counter.hasString('hej'));
    assert.ok(counter.hasString('nej'));
    assert.ok(!counter.hasString('gris'));
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
        '<div class="raw">	at <a class="internal" href="#top_frame">top_frame</a></div>',
        '<div class="raw">	at second_frame</div>',
        '',
    ]);

    assert.deepEqual(analyzer._stackToHtml([]).split('\n'), [
        '<div class="raw">	&lt;empty stack&gt;</div>',
        '',
    ]);
});
