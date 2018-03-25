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
/* global stringToId */
/* global Synchronizer */
/* global ThreadStatus */
/* global StringCounter */
/* global createLockUsersHtml */
/* global synchronizerComparator */

QUnit.test( "thread.getLinkedName()", function(assert) {
    var header = '"thread name" prio=10 tid=0x00007f16a118e000 nid=0x6e5a runnable [0x00007f18b91d0000]';
    assert.equal(new Thread(header).getLinkedName(),
                 '<a class="internal" href="#thread-0x00007f16a118e000">thread name</a>');
});

QUnit.test( "thread header 1", function(assert) {
    var header = '"thread name" prio=10 tid=0x00007f16a118e000 nid=0x6e5a runnable [0x00007f18b91d0000]';
    assert.equal(new Thread(header).name, "thread name");
    assert.equal(new Thread(header).tid, "0x00007f16a118e000");
    assert.equal(new Thread(header).group, undefined);
});

QUnit.test( "thread header 2", function(assert) {
    var header = '"ApplicationImpl pooled thread 1" prio=4 tid=11296d000 nid=0x118a84000 waiting on condition [118a83000]';
    assert.equal(new Thread(header).name, "ApplicationImpl pooled thread 1");
    assert.equal(new Thread(header).tid, "11296d000");
    assert.equal(new Thread(header).group, undefined);
});

QUnit.test( "thread header 3", function(assert) {
    var header = '"Gang worker#1 (Parallel GC Threads)" prio=9 tid=105002800 nid=0x10bc88000 runnable';
    assert.equal(new Thread(header).name, "Gang worker#1 (Parallel GC Threads)");
    assert.equal(new Thread(header).tid, "105002800");
    assert.equal(new Thread(header).group, undefined);
});

QUnit.test( "thread header 4", function(assert) {
    var header = '"Attach Listener" #10 daemon prio=9 os_prio=31 tid=0x00007fddb280e000 nid=0x380b waiting on condition [0x0000000000000000]';
    assert.equal(new Thread(header).name, "Attach Listener");
    assert.equal(new Thread(header).tid, "0x00007fddb280e000");
    assert.equal(new Thread(header).group, undefined);
});

QUnit.test( "thread header 5", function(assert) {
    var header = '"Attach Listener" #10 daemon prio=9 os_prio=31 tid=0x00007fddb280e000 nid=0x380b waiting on condition';
    assert.equal(new Thread(header).name, "Attach Listener");
    assert.equal(new Thread(header).tid, "0x00007fddb280e000");
    assert.equal(new Thread(header).group, undefined);
});

QUnit.test( "thread header 6", function(assert) {
    var header = '"VM Thread" os_prio=31 tid=0x00007fddb2049800 nid=0x3103 runnable';
    assert.equal(new Thread(header).name, "VM Thread");
    assert.equal(new Thread(header).tid, "0x00007fddb2049800");
    assert.equal(new Thread(header).group, undefined);
});

QUnit.test( "thread header 7", function(assert) {
    var header = '"Queued build chains changes collector 8" daemon group="main" prio=5 tid=431,909 nid=431,909 waiting ';
    assert.equal(new Thread(header).name, "Queued build chains changes collector 8");
    assert.equal(new Thread(header).tid, "431,909");
    assert.equal(new Thread(header).group, "main");
});

QUnit.test( "thread header 8", function(assert) {
    var header = '"Attach Listener" #10 prio=9 os_prio=31 tid=0x00007fddb280e000 nid=0x380b waiting on condition [0x0000000000000000]';
    assert.equal(new Thread(header).name, "Attach Listener");
    assert.equal(new Thread(header).tid, "0x00007fddb280e000");
    assert.equal(new Thread(header).group, undefined);
});

QUnit.test( "thread header 9", function(assert) {
    var header = '"Connect thread foo.net session" prio=5 tid=8,057,104 nid=8,057,104';
    assert.equal(new Thread(header).name, "Connect thread foo.net session");
    assert.equal(new Thread(header).tid, "8,057,104");
    assert.equal(new Thread(header).group, undefined);
});

QUnit.test( "thread header 10", function(assert) {
    var header = '"thread name" daemon prio=10 tid=0x00007f16a118e000 nid=0x6e5a runnable [0x00007f18b91d0000]';
    assert.equal(new Thread(header).name, "thread name");
    assert.equal(new Thread(header).tid, "0x00007f16a118e000");
    assert.equal(new Thread(header).group, undefined);
});

QUnit.test( "thread header 11", function(assert) {
    var header = '"VM Periodic Task Thread" prio=10 tid=0x00007f1af00c9800 nid=0x3c2c waiting on condition ';
    assert.equal(new Thread(header).name, "VM Periodic Task Thread");
    assert.equal(new Thread(header).tid, "0x00007f1af00c9800");
    assert.equal(new Thread(header).group, undefined);
});

QUnit.test( "thread header 12", function(assert) {
    var header = '"Store spotify-uuid Spool Thread" daemon prio=10 tid=0x00007f1a16aa0800 nid=0x3f5b sleeping[0x00007f199997a000]';
    assert.equal(new Thread(header).name, "Store spotify-uuid Spool Thread");
    assert.equal(new Thread(header).tid, "0x00007f1a16aa0800");
    assert.equal(new Thread(header).group, undefined);
});

QUnit.test( "thread header 13", function(assert) {
    var header = '"git@github.com:caoliang2598/ta-zelda-test.git#master"}; 09:09:58 Task started; VCS Periodical executor 39" prio=10 tid=0x00007f1728056000 nid=0x1347 sleeping[0x00007f169cdcb000]';
    assert.equal(new Thread(header).name,
                 'git@github.com:caoliang2598/ta-zelda-test.git#master"}; 09:09:58 Task started; VCS Periodical executor 39');
    assert.equal(new Thread(header).tid, "0x00007f1728056000");
    assert.equal(new Thread(header).group, undefined);
});

QUnit.test("thread header 14", function(assert){
    var header = '"http-bio-8810-exec-147" - Thread t@96965';
    assert.equal(new Thread(header).name,"http-bio-8810-exec-147");
    assert.equal(new Thread(header).tid, "96965");
    assert.equal(new Thread(header).group, undefined);
});

QUnit.test("thread header 15", function(assert){
    // From: https://github.com/spotify/threaddump-analyzer/issues/12
    var header = '"ajp-bio-18009-exec-1189":';

    assert.equal(new Thread(header).name,"ajp-bio-18009-exec-1189");

    var tid = new Thread(header).tid;
    assert.notEqual(tid, undefined);
    assert.equal(tid.indexOf("generated-id-"), 0);

    assert.equal(new Thread(header).group, undefined);
});

// A thread should be considered running if it has a stack trace and
// is RUNNABLE
QUnit.test("thread.running", function(assert) {
    var thread;

    thread = new Thread('"thread" prio=10 runnable');
    thread.addStackLine("	java.lang.Thread.State: RUNNABLE");
    thread.addStackLine(" at hej");
    assert.ok(thread.getStatus().isRunning());

    // We don't care about the free-text "not runnable" status
    thread = new Thread('"thread" prio=10 not runnable');
    thread.addStackLine("	java.lang.Thread.State: RUNNABLE");
    thread.addStackLine(" at hej");
    assert.ok(thread.getStatus().isRunning());

    thread = new Thread('"thread" prio=10 runnable');
    thread.addStackLine("	java.lang.Thread.State: TERMINATED");
    thread.addStackLine(" at hej");
    assert.ok(!thread.getStatus().isRunning());

    thread = new Thread('"thread" prio=10 not runnable');
    thread.addStackLine("	java.lang.Thread.State: TERMINATED");
    thread.addStackLine(" at hej");
    assert.ok(!thread.getStatus().isRunning());

    // Thread without Thread.State
    thread = new Thread('"thread" prio=10 runnable');
    thread.addStackLine(" at hej");
    assert.ok(!thread.getStatus().isRunning());
});

QUnit.test( "multiline thread name", function(assert) {
    // It's the Analyzer that joins lines so we have to go through the Analyzer here
    var multilineHeader = '"line 1\nline 2" prio=10 tid=0x00007f16a118e000 nid=0x6e5a runnable [0x00007f18b91d0000]';
    var analyzer = new Analyzer(multilineHeader);
    var threads = analyzer.threads;

    assert.equal(threads.length, 1);
    var threadLines = threads[0].toString().split("\n");
    assert.deepEqual(threadLines, [
        '"line 1, line 2": runnable',
        "	<empty stack>",
    ]);

    // Test the Analyzer's toString() method as well now that we have an Analyzer
    var analysisLines = analyzer.toHtml().split("\n");
    assert.deepEqual(analysisLines, [
        "<h2>1 threads found</h2>",
        "<div class=\"threadgroup\">",
        "<div class=\"threadcount\"></div>",
        '<div id="thread-0x00007f16a118e000"><span class="raw">"line 1, line 2": non-Java thread</span></div>',
        "<div class=\"raw\">	&lt;empty stack&gt;</div>",
        "</div>",
        "",
    ]);
});

QUnit.test( "non-multiline thread name", function(assert) {
    // It's the Analyzer that joins lines so we have to go through the Analyzer here
    var nonMultilineHeader = '"line 1":\nat x.y.Z.service(Z.java:722)';
    var analyzer = new Analyzer(nonMultilineHeader);
    var threads = analyzer.threads;

    assert.equal(threads.length, 1);
    var threadLines = threads[0].toString().split("\n");
    assert.deepEqual(threadLines, [
        '"line 1": ',
        "	<empty stack>",
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
        stackFrames: [],
    }]);
});

QUnit.test( "analyze single thread", function(assert) {
    var threadDump = [
        '"thread name" prio=10 tid=0x00007f16a118e000 nid=0x6e5a runnable [0x00007f18b91d0000]',
        "	at fluff",
    ].join("\n");
    var analyzer = new Analyzer(threadDump);
    var threads = analyzer.threads;
    assert.equal(threads.length, 1);
    var thread = threads[0];

    var analysisResult = analyzer._toThreadsAndStacks();
    assert.deepEqual(analysisResult, [{
        threads: [thread],
        stackFrames: ["fluff"],
    }]);
});

QUnit.test( "analyze thread waiting for notification", function(assert) {
    var threadDump = [
        '"Image Fetcher 2" daemon prio=8 tid=11b885800 nid=0x11e78d000 in Object.wait() [11e78c000]',
        "   java.lang.Thread.State: TIMED_WAITING (on object monitor)",
        "	at java.lang.Object.wait(Native Method)",
        "	- waiting on <7c135ea90> (a java.util.Vector)",
        "	at sun.awt.image.ImageFetcher.nextImage(ImageFetcher.java:114)",
        "	- locked <7c135ea90> (a java.util.Vector)",
        "	at sun.awt.image.ImageFetcher.fetchloop(ImageFetcher.java:167)",
        "	at sun.awt.image.ImageFetcher.run(ImageFetcher.java:136)",
        "",
        "   Locked ownable synchronizers:",
        "	- None",
    ].join("\n");
    var analyzer = new Analyzer(threadDump);
    var threads = analyzer.threads;
    assert.equal(threads.length, 1);
    var thread = threads[0];

    assert.equal(thread.wantNotificationOn, "7c135ea90");
    assert.equal(thread.wantToAcquire, null);

    var locksHeld = [ /* Lock is released while synchronizing */ ];
    assert.deepEqual(thread.locksHeld, locksHeld);

    assert.equal(thread.synchronizerClasses["7c135ea90"], "java.util.Vector");
    assert.equal(thread.synchronizerClasses["47114712gris"], null);

    // Validate global lock analysis
    assert.deepEqual(Object.keys(analyzer._synchronizerById), ["7c135ea90"]);
    assert.ok(analyzer._synchronizerById["7c135ea90"] !== null);
    assert.ok(analyzer._synchronizerById["7c135ea90"] !== undefined);
    assert.deepEqual(analyzer._synchronizers,
                     [analyzer._synchronizerById["7c135ea90"]]);
});

QUnit.test( "analyze thread waiting for java.util.concurrent lock", function(assert) {
    var threadDump = [
        '"Animations" daemon prio=5 tid=11bad3000 nid=0x11dbcf000 waiting on condition [11dbce000]',
        "   java.lang.Thread.State: WAITING (parking)",
        "	at sun.misc.Unsafe.park(Native Method)",
        "	- parking to wait for  <7c2cd7dd0> (a java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject)",
        "	at java.util.concurrent.locks.LockSupport.park(LockSupport.java:156)",
        "	at java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject.await(AbstractQueuedSynchronizer.java:1987)",
        "	at java.util.concurrent.DelayQueue.take(DelayQueue.java:160)",
        "	at java.util.concurrent.ScheduledThreadPoolExecutor$DelayedWorkQueue.take(ScheduledThreadPoolExecutor.java:609)",
        "	at java.util.concurrent.ScheduledThreadPoolExecutor$DelayedWorkQueue.take(ScheduledThreadPoolExecutor.java:602)",
        "	at java.util.concurrent.ThreadPoolExecutor.getTask(ThreadPoolExecutor.java:957)",
        "	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:917)",
        "	at java.lang.Thread.run(Thread.java:695)",
        "",
        "   Locked ownable synchronizers:",
        "	- None",
    ].join("\n");

    var analyzer = new Analyzer(threadDump);
    var threads = analyzer.threads;
    assert.equal(threads.length, 1);
    var thread = threads[0];

    assert.equal(thread.wantNotificationOn, "7c2cd7dd0");
    assert.equal(thread.wantToAcquire, null);

    var locksHeld = [ /* None */ ];
    assert.deepEqual(thread.locksHeld, locksHeld);

    assert.equal(thread.synchronizerClasses["7c2cd7dd0"], "java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject");
    assert.equal(thread.synchronizerClasses["47114712gris"], null);
});

QUnit.test( "analyze thread waiting for traditional lock", function(assert) {
    var threadDump = [
        '"DB-Processor-14" daemon prio=5 tid=0x003edf98 nid=0xca waiting for monitor entry [0x000000000825f020]',
        "   java.lang.Thread.State: BLOCKED (on object monitor)",
        "	at beans.ConnectionPool.getConnection(ConnectionPool.java:102)",
        "	- waiting to lock <0xe0375410> (a beans.ConnectionPool)",
        "	at beans.cus.ServiceCnt.getTodayCount(ServiceCnt.java:111)",
        "	at beans.cus.ServiceCnt.insertCount(ServiceCnt.java:43)",
        "",
        "   Locked ownable synchronizers:",
        "	- None",
    ].join("\n");

    var analyzer = new Analyzer(threadDump);
    var threads = analyzer.threads;
    assert.equal(threads.length, 1);
    var thread = threads[0];

    assert.equal(thread.wantNotificationOn, null);
    assert.equal(thread.wantToAcquire, "0xe0375410");

    var locksHeld = [ /* None */ ];
    assert.deepEqual(thread.locksHeld, locksHeld);

    assert.equal(thread.synchronizerClasses["0xe0375410"], "beans.ConnectionPool");
    assert.equal(thread.synchronizerClasses["47114712gris"], null);
});

QUnit.test(" analyze thread waiting for locks 2", function(assert){
    var threadDump= [
        '"http-5525-116" - Thread t@151',
        "   java.lang.Thread.State: BLOCKED",
        "   at org.apache.log4j.Category.callAppenders(Category.java:205)",
        '   - waiting to lock <259a4a41> (a org.apache.log4j.spi.RootLogger) owned by "http-5525-127" t@162',
        "   at org.apache.log4j.Category.forcedLog(Category.java:391)",
        "   at org.apache.log4j.Category.log(Category.java:856)",
        "   at org.apache.juli.logging.impl.Log4JLogger.error(Log4JLogger.java:251)",
        "   at org.apache.catalina.core.StandardWrapperValve.invoke(StandardWrapperValve.java:274)",
        "   at java.lang.Thread.run(Thread.java:662)",
        "",
        "   Locked ownable synchronizers:",
        "   - None",
    ].join("\n");

    var analyzer = new Analyzer(threadDump);
    var threads = analyzer.threads;
    assert.equal(threads.length, 1);
    var thread = threads[0];

    assert.equal(thread.wantNotificationOn, null);
    assert.equal(thread.wantToAcquire, "259a4a41");

    var locksHeld = [ /* None */ ];
    assert.deepEqual(thread.locksHeld, locksHeld);

    assert.equal(thread.synchronizerClasses["259a4a41"], "org.apache.log4j.spi.RootLogger");
    assert.equal(thread.synchronizerClasses["47114712gris"], null);
});

QUnit.test( "analyze thread holding locks", function(assert) {
    var threadDump = [
        '"ApplicationImpl pooled thread 8" daemon prio=4 tid=10d96d000 nid=0x11e68a000 runnable [11e689000]',
        "   java.lang.Thread.State: RUNNABLE",
        "	at sun.nio.ch.KQueueArrayWrapper.kevent0(Native Method)",
        "	at sun.nio.ch.KQueueArrayWrapper.poll(KQueueArrayWrapper.java:136)",
        "	at sun.nio.ch.KQueueSelectorImpl.doSelect(KQueueSelectorImpl.java:69)",
        "	at sun.nio.ch.SelectorImpl.lockAndDoSelect(SelectorImpl.java:69)",
        "	- locked <7c37ef220> (a io.netty.channel.nio.SelectedSelectionKeySet)",
        "	- locked <7c392fac0> (a java.util.Collections$UnmodifiableSet)",
        "	- locked <7c37f5b88> (a sun.nio.ch.KQueueSelectorImpl)",
        "	at sun.nio.ch.SelectorImpl.select(SelectorImpl.java:80)",
        "	at io.netty.channel.nio.NioEventLoop.select(NioEventLoop.java:618)",
        "	at io.netty.channel.nio.NioEventLoop.run(NioEventLoop.java:306)",
        "	at io.netty.util.concurrent.SingleThreadEventExecutor$5.run(SingleThreadEventExecutor.java:824)",
        "	at com.intellij.openapi.application.impl.ApplicationImpl$8.run(ApplicationImpl.java:419)",
        "	at java.util.concurrent.Executors$RunnableAdapter.call(Executors.java:439)",
        "	at java.util.concurrent.FutureTask$Sync.innerRun(FutureTask.java:303)",
        "	at java.util.concurrent.FutureTask.run(FutureTask.java:138)",
        "	at java.util.concurrent.ThreadPoolExecutor$Worker.runTask(ThreadPoolExecutor.java:895)",
        "	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:918)",
        "	at java.lang.Thread.run(Thread.java:695)",
        "	at com.intellij.openapi.application.impl.ApplicationImpl$1$1.run(ApplicationImpl.java:149)",
        "",
        "   Locked ownable synchronizers:",
        "	- <7c393f190> (a java.util.concurrent.locks.ReentrantLock$NonfairSync)",
    ].join("\n");
    var analyzer = new Analyzer(threadDump);
    var threads = analyzer.threads;
    assert.equal(threads.length, 1);
    var thread = threads[0];

    assert.equal(thread.wantNotificationOn, null);
    assert.equal(thread.wantToAcquire, null);

    var locksHeld = [ "7c37ef220", "7c392fac0", "7c37f5b88", "7c393f190" ];
    assert.deepEqual(thread.locksHeld, locksHeld);

    assert.equal(thread.synchronizerClasses["7c37ef220"], "io.netty.channel.nio.SelectedSelectionKeySet");
    assert.equal(thread.synchronizerClasses["7c392fac0"], "java.util.Collections$UnmodifiableSet");
    assert.equal(thread.synchronizerClasses["7c37f5b88"], "sun.nio.ch.KQueueSelectorImpl");
    assert.equal(thread.synchronizerClasses["7c393f190"], "java.util.concurrent.locks.ReentrantLock$NonfairSync");
    assert.equal(thread.synchronizerClasses["47114712gris"], null);

    assert.equal(analyzer._synchronizerById["7c37f5b88"].lockHolder, thread);
});

QUnit.test( "analyze two threads with same stack", function(assert) {
    // Thread dump with zebra before aardvark
    var threadDump = [
        '"zebra thread" prio=10 tid=0x00007f16a118e000 nid=0x6e5a runnable [0x00007f18b91d0000]',
        "	at fluff",
        "",
        '"aardvark thread" prio=10 tid=0x00007f16a118e000 nid=0x6e5a runnable [0x00007f18b91d0000]',
        "	at fluff",
    ].join("\n");

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
        stackFrames: ["fluff"],
    }]);
});

QUnit.test( "thread stack", function(assert) {
    var header = '"Thread name" prio=10 tid=0x00007f1728056000 nid=0x1347 sleeping[0x00007f169cdcb000]';
    var thread = new Thread(header);
    assert.ok(thread.addStackLine("	at java.security.AccessController.doPrivileged(Native Method)"));
    assert.ok(thread.addStackLine("	- eliminated <0x00000006b3ccb178> (a java.io.PipedInputStream)"));
    assert.ok(thread.addStackLine("	at java.net.SocksSocketImpl.connect(SocksSocketImpl.java:353)"));
    assert.ok(thread.addStackLine("	- parking to wait for  <0x00000003138d65d0> (a java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject)"));

    // When adding stack frames we should just ignore unsupported
    // lines, and the end result should contain only supported data.
    var threadLines = thread.toString().split("\n");
    assert.deepEqual(threadLines, [
        '"Thread name": sleeping',
        "	at java.security.AccessController.doPrivileged(Native Method)",
        "	at java.net.SocksSocketImpl.connect(SocksSocketImpl.java:353)",
    ]);
});

function unescapeHtml(escaped) {
    var e = document.createElement("div");
    e.innerHTML = escaped;
    return e.childNodes.length === 0 ? "" : e.childNodes[0].nodeValue;
}

QUnit.test( "full dump analysis", function(assert) {
    var input = unescapeHtml(document.getElementById("sample-input").innerHTML);
    var expectedAnalysis = document.getElementById("sample-analysis").innerHTML;
    var analyzer = new Analyzer(input);
    assert.deepEqual(analyzer.toHtml().split("\n"), expectedAnalysis.split("\n"));

    var expectedIgnores = document.getElementById("sample-ignored").innerHTML;
    assert.deepEqual(analyzer.toIgnoresString().split("\n"), expectedIgnores.split("\n"));

    var expectedRunning = document.getElementById("sample-running").innerHTML;
    assert.deepEqual(analyzer.toRunningString().split("\n"), expectedRunning.split("\n"));
});

QUnit.test( "Top Methods from running threads", function(assert) {
    var input = unescapeHtml(document.getElementById("sample-input").innerHTML);
    var analyzer = new Analyzer(input);
    var running = analyzer.toRunningHtml();
    var expectedRunning = [
        '<tr id="java.net.PlainSocketImpl.socketAccept(Native%20Method)">',
            '<td class="vertical-align">java.net.PlainSocketImpl.socketAccept(Native Method)</td>',
            '<td class="raw">',
                '<a class="internal" href="#thread-11c319800">RMI TCP Accept-0</a><br>',
                '<a class="internal" href="#thread-105001800">Lock thread</a>',
            "</td>",
        "</tr>\n",
        '<tr id="java.lang.UNIXProcess.waitForProcessExit(Native%20Method)">',
            '<td class="vertical-align">java.lang.UNIXProcess.waitForProcessExit(Native Method)</td>',
            '<td class="raw">',
                '<a class="internal" href="#thread-11c048800">process reaper</a>',
            "</td>",
        "</tr>\n",
        '<tr id="sun.nio.ch.KQueueArrayWrapper.kevent0(Native%20Method)">',
            '<td class="vertical-align">sun.nio.ch.KQueueArrayWrapper.kevent0(Native Method)</td>',
            '<td class="raw"><a class="internal" href="#thread-11c386000">ApplicationImpl pooled thread 9</a></td>',
        "</tr>\n",
    ].join("");
    assert.equal(running, expectedRunning);
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
    assert.deepEqual(counter.toString().split("\n"), [
        "1 hej",
    ]);
    assert.equal(counter.length, 1);

    counter.addString("nej");
    counter.addString("nej");
    assert.deepEqual(counter.getStrings(),
                     [
                         {count:2, string:"nej", sources:[undefined, undefined]},
                         {count:1, string:"hej", sources:[undefined]},
                     ]);
    assert.deepEqual(counter.toString().split("\n"), [
        "2 nej",
        "1 hej",
    ]);
    assert.equal(counter.length, 3);

    counter.addString("hej", "foo");
    counter.addString("hej", "bar");
    assert.deepEqual(counter.getStrings(),
                     [
                         {count:3, string:"hej", sources:[undefined, "foo", "bar"]},
                         {count:2, string:"nej", sources:[undefined, undefined]},
                     ]);
    assert.deepEqual(counter.toString().split("\n"), [
        "3 hej",
        "2 nej",
    ]);
    assert.equal(counter.length, 5);

    assert.ok(counter.hasString("hej"));
    assert.ok(counter.hasString("nej"));
    assert.ok(!counter.hasString("gris"));
});

QUnit.test("string to id", function(assert) {
    assert.equal(stringToId("\"<>'#"), "%22%3C%3E%27%23");
});

QUnit.test( "Analyzer.stackToHtml()", function(assert) {
    var threadDump = [
        '"running thread" prio=10 tid=0x00007f16a118e000 nid=0x6e5a runnable [0x00007f18b91d0000]',
        "	java.lang.Thread.State: RUNNABLE",
        "	at top_frame",
        "	at second_frame",
        "",
        '"VM Thread" prio=9 tid=105047000 nid=0x111901000 runnable',
    ].join("\n");
    var analyzer = new Analyzer(threadDump);

    assert.deepEqual(analyzer._stackToHtml(["top_frame", "second_frame"]).split("\n"), [
        '<div class="raw">	at <a class="internal" href="#top_frame">top_frame</a></div>',
        '<div class="raw">	at second_frame</div>',
        "",
    ]);

    assert.deepEqual(analyzer._stackToHtml([]).split("\n"), [
        '<div class="raw">	&lt;empty stack&gt;</div>',
        "",
    ]);
});

QUnit.test("Synchronizer class name", function(assert) {
    assert.equal(new Synchronizer("x", "java.lang.Foo").getPrettyClassName(), "Foo");
    assert.equal(new Synchronizer("x", "java.lang.Class for java.lang.Foo").getPrettyClassName(), "Foo.class");
    assert.equal(new Synchronizer("x", "Foo").getPrettyClassName(), "Foo");
    assert.equal(new Synchronizer("x", undefined).getPrettyClassName(), undefined);
});

QUnit.test("Synchronizer.toHtmlTableRow()", function(assert) {
    assert.equal(new Synchronizer("1234", "g.w.Bush").toHtmlTableRow(),
                 '<tr id="synchronizer-1234">' +
                 '<td class="synchronizer"><div class="synchronizer">1234<br>Bush</div></td>' +
                 '<td class="synchronizer"></td>' +
                 "</tr>");
});

QUnit.test("thread status running", function(assert) {
    var threadStatus = new ThreadStatus({
        frames: ["frame"],
        wantNotificationOn: null,
        wantToAcquire: null,
        locksHeld: [],
        threadState: "RUNNABLE",
    });

    assert.ok(threadStatus.isRunning());
    assert.equal(threadStatus.toHtml(), "running");
});

QUnit.test("thread status unset", function(assert) {
    var threadStatus = new ThreadStatus({
        frames: ["frame"],
        wantNotificationOn: null,
        wantToAcquire: null,
        locksHeld: [],
        threadState: null /* = missing from thread dump */,
    });

    assert.ok(!threadStatus.isRunning());
    assert.equal(threadStatus.toHtml(), "non-Java thread");
});

QUnit.test("thread status unset, locks held", function(assert) {
    var threadStatus = new ThreadStatus({
        frames: ["frame"],
        wantNotificationOn: null,
        wantToAcquire: null,
        locksHeld: ["aaa"],
        threadState: null /* = missing from thread dump */,
    });

    assert.ok(!threadStatus.isRunning());
    assert.equal(threadStatus.toHtml(), 'non-Java thread, holding [<a href="#synchronizer-aaa" class="internal">aaa</a>]');
});

QUnit.test("thread status sleeping", function(assert) {
    var threadStatus = new ThreadStatus({
        frames: ["frame"],
        wantNotificationOn: null,
        wantToAcquire: null,
        locksHeld: ["aaa"],
        threadState: "TIMED_WAITING (sleeping)",
    });

    assert.ok(!threadStatus.isRunning());
    assert.equal(threadStatus.toHtml(), 'sleeping, holding [<a href="#synchronizer-aaa" class="internal">aaa</a>]');
});

QUnit.test("thread status waiting for lock", function(assert) {
    var threadStatus = new ThreadStatus({
        frames: ["frame"],
        wantNotificationOn: null,
        wantToAcquire: "1234",
        locksHeld: ["aaa", "bbb"],
        threadState: "whatever",
    });

    assert.ok(!threadStatus.isRunning());
    assert.equal(threadStatus.toHtml(),
                 'waiting to acquire [<a href="#synchronizer-1234" class="internal">1234</a>], ' +
                 'holding [<a href="#synchronizer-aaa" class="internal">aaa</a>, <a href="#synchronizer-bbb" class="internal">bbb</a>]');
});

QUnit.test("thread status waiting for notification", function(assert) {
    var threadStatus = new ThreadStatus({
        frames: ["frame"],
        wantNotificationOn: "1234",
        wantToAcquire: null,
        locksHeld: [],
        threadState: "whatever",
    });

    assert.ok(!threadStatus.isRunning());
    assert.equal(threadStatus.toHtml(),
                 'awaiting notification on [<a href="#synchronizer-1234" class="internal">1234</a>]');
});

QUnit.test("thread status not started", function(assert) {
    var threadStatus = new ThreadStatus({
        frames: ["frame"],
        wantNotificationOn: null,
        wantToAcquire: null,
        locksHeld: [],
        threadState: "NEW",
    });

    assert.ok(!threadStatus.isRunning());
    assert.equal(threadStatus.toHtml(), "not started");
});

QUnit.test("thread status terminated", function(assert) {
    var threadStatus = new ThreadStatus({
        frames: ["frame"],
        wantNotificationOn: null,
        wantToAcquire: null,
        locksHeld: [],
        threadState: "TERMINATED",
    });

    assert.ok(!threadStatus.isRunning());
    assert.equal(threadStatus.toHtml(), "terminated");
});

QUnit.test( "analyze thread waiting for unspecified notification 1", function(assert) {
    var threadDump = [
        '"Thread Name" daemon prio=10 tid=0x000000000219d000 nid=0x3fa3 in Object.wait() [0x00007f0fc985d000]',
        "   java.lang.Thread.State: TIMED_WAITING (on object monitor)",
        "        at java.lang.Object.wait(Native Method)",
        "        at java.lang.ref.ReferenceQueue.remove(ReferenceQueue.java:136)",
        "        - locked <0x0000000780b17bc8> (a java.lang.ref.ReferenceQueue$Lock)",
        "        at org.netbeans.lib.profiler.server.ProfilerRuntimeObjLiveness$ReferenceManagerThread.run(ProfilerRuntimeObjLiveness.java:54)",
    ].join("\n");
    var analyzer = new Analyzer(threadDump);
    var threads = analyzer.threads;
    assert.equal(threads.length, 1);
    var thread = threads[0];
    var threadStatus = thread.getStatus();

    assert.ok(!threadStatus.isRunning());

    // Since it's holding only one lock, that has to be the lock it's
    // awaiting notification for. Make sure this is what we present in
    // the UI.
    assert.equal(threadStatus.toHtml(),
                 'awaiting notification on [<a href="#synchronizer-0x0000000780b17bc8" class="internal">0x0000000780b17bc8</a>]');
});

QUnit.test( "analyze thread waiting for unspecified notification 2", function(assert) {
    var threadDump = [
        '"Thread Name" daemon prio=10 tid=0x00007f0fd45cf800 nid=0x2937 in Object.wait() [0x00007f0fc995e000]',
        "   java.lang.Thread.State: TIMED_WAITING (on object monitor)",
        "        at java.lang.Object.wait(Native Method)",
        "        at org.hsqldb.lib.HsqlTimer$TaskQueue.park(Unknown Source)",
        "        - locked <0x00000007805debf8> (a org.hsqldb.lib.HsqlTimer$TaskQueue)",
        "        at org.hsqldb.lib.HsqlTimer.nextTask(Unknown Source)",
        "        - locked <0x00000007805debf8> (a org.hsqldb.lib.HsqlTimer$TaskQueue)",
        "        at org.hsqldb.lib.HsqlTimer$TaskRunner.run(Unknown Source)",
        "        at java.lang.Thread.run(Thread.java:745)",
    ].join("\n");
    var analyzer = new Analyzer(threadDump);
    var threads = analyzer.threads;
    assert.equal(threads.length, 1);
    var thread = threads[0];
    var threadStatus = thread.getStatus();

    assert.ok(!threadStatus.isRunning());

    // Since it's holding only one lock (that it has taken twice),
    // that has to be the lock it's awaiting notification for. Make
    // sure this is what we present in the UI.
    assert.equal(threadStatus.toHtml(),
                 'awaiting notification on [<a href="#synchronizer-0x00000007805debf8" class="internal">0x00000007805debf8</a>]');
});

QUnit.test( "analyze thread waiting for unspecified notification 3", function(assert) {
    var threadDump = [
        '"Thread Name" daemon prio=10 tid=0x000000000219d000 nid=0x3fa3 in Object.wait() [0x00007f0fc985d000]',
        "   java.lang.Thread.State: WAITING (on object monitor)",
        "        at java.lang.Object.wait(Native Method)",
        "        at java.lang.ref.ReferenceQueue.remove(ReferenceQueue.java:136)",
        "        - locked <0x0000000780b17bc8> (a java.lang.ref.ReferenceQueue$Lock)",
        "        at org.netbeans.lib.profiler.server.ProfilerRuntimeObjLiveness$ReferenceManagerThread.run(ProfilerRuntimeObjLiveness.java:54)",
    ].join("\n");
    var analyzer = new Analyzer(threadDump);
    var threads = analyzer.threads;
    assert.equal(threads.length, 1);
    var thread = threads[0];
    var threadStatus = thread.getStatus();

    assert.ok(!threadStatus.isRunning());

    // Since it's holding only one lock, that has to be the lock it's
    // awaiting notification for. Make sure this is what we present in
    // the UI.
    assert.equal(threadStatus.toHtml(),
                 'awaiting notification on [<a href="#synchronizer-0x0000000780b17bc8" class="internal">0x0000000780b17bc8</a>]');
});

QUnit.test( "analyze thread waiting for unspecified notification 4", function(assert) {
    var threadDump = [
        '"Monkey" daemon prio=10 tid=0x00007f56b52a2000 nid=0x75f5 in Object.wait() [0x00007f5b01201000]',
        "   java.lang.Thread.State: TIMED_WAITING (on object monitor)",
        "	at java.lang.Object.wait(Native Method)",
        "	at java.io.PipedReader.read(PipedReader.java:257)",
        "	- eliminated <0x000000057c46ee20> (a java.io.PipedReader)",
        "	at java.io.PipedReader.read(PipedReader.java:309)",
        "	- locked <0x000000057c46ee20> (a java.io.PipedReader)",
        "	at org.cyberneko.html.HTMLScanner.load(HTMLScanner.java:1082)",
        "	at org.cyberneko.html.HTMLScanner.read(HTMLScanner.java:1043)",
        "	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:615)",
        "	at java.lang.Thread.run(Thread.java:744)",
        "",
        "   Locked ownable synchronizers:",
        "	- <0x00000004f00094c0> (a java.util.concurrent.ThreadPoolExecutor$Worker)",
    ].join("\n");
    var analyzer = new Analyzer(threadDump);
    var threads = analyzer.threads;
    assert.equal(threads.length, 1);
    var thread = threads[0];
    var threadStatus = thread.getStatus();

    assert.ok(!threadStatus.isRunning());

    // Since it's holding only one synchronized(){}-style lock, that
    // has to be the lock it's awaiting notification for. Make sure
    // this is what we present in the UI.
    assert.equal(threadStatus.toHtml(),
                 "awaiting notification on " +
                 '[<a href="#synchronizer-0x000000057c46ee20" class="internal">0x000000057c46ee20</a>]' +
                 ", holding " +
                 '[<a href="#synchronizer-0x00000004f00094c0" class="internal">0x00000004f00094c0</a>]');
});

QUnit.test("thread status no stack trace", function(assert) {
    var threadDump =
        '"Attach Listener" daemon prio=10 tid=0x00007f1b5c001000 nid=0x1bd4 waiting on condition [0x0000000000000000]\n' +
        "   java.lang.Thread.State: RUNNABLE";
    var analyzer = new Analyzer(threadDump);
    var threads = analyzer.threads;
    assert.equal(threads.length, 1);
    var thread = threads[0];
    var threadStatus = thread.getStatus();

    assert.ok(!threadStatus.isRunning());
    assert.equal(threadStatus.toHtml(), "non-Java thread");
});

QUnit.test("lock user html creator", function(assert) {
    var thread1 = new Thread('"Thread1" prio=10 tid=1234 nid=0x6e5a runnable');
    var thread2 = new Thread('"Thread2" prio=10 tid=1234 nid=0x6e5a runnable');
    var thread3 = new Thread('"Thread3" prio=10 tid=1234 nid=0x6e5a runnable');
    var thread4 = new Thread('"Thread4" prio=10 tid=1234 nid=0x6e5a runnable');
    var thread5 = new Thread('"Thread5" prio=10 tid=1234 nid=0x6e5a runnable');

    assert.equal(createLockUsersHtml("Threads waiting to take lock", []),
                 "");

    assert.equal(createLockUsersHtml("Threads waiting to take lock", [thread1]),
                 '<div class="synchronizer">Threads waiting to take lock:<br>' +
                 '<span class="raw">' +
                 '  <a class="internal" href="#thread-1234">Thread1</a>' +
                 "</span>" +
                 "</div>");

    assert.equal(createLockUsersHtml("Threads waiting to take lock", [thread3, thread1, thread4, thread2]),
                 '<div class="synchronizer">Threads waiting to take lock:' +
                 '<br><span class="raw">' +
                 '  <a class="internal" href="#thread-1234">Thread1</a></span>' +
                 '<br><span class="raw">' +
                 '  <a class="internal" href="#thread-1234">Thread2</a></span>' +
                 '<br><span class="raw">' +
                 '  <a class="internal" href="#thread-1234">Thread3</a></span>' +
                 '<br><span class="raw">' +
                 '  <a class="internal" href="#thread-1234">Thread4</a></span>' +
                 "</div>");

    assert.equal(createLockUsersHtml("Threads waiting to take lock", [thread2, thread1, thread4, thread5, thread3]),
                 '<div class="synchronizer">5 threads waiting to take lock:' +
                 '<br><span class="raw">' +
                 '  <a class="internal" href="#thread-1234">Thread1</a></span>' +
                 '<br><span class="raw">' +
                 '  <a class="internal" href="#thread-1234">Thread2</a></span>' +
                 '<br><span class="raw">' +
                 '  <a class="internal" href="#thread-1234">Thread3</a></span>' +
                 '<br><span class="raw">' +
                 '  <a class="internal" href="#thread-1234">Thread4</a></span>' +
                 '<br><span class="raw">' +
                 '  <a class="internal" href="#thread-1234">Thread5</a></span>' +
                 "</div>");
});

QUnit.test("synchronizer thread count", function(assert) {
    var thread = new Thread('"Thread" prio=10 tid=1234 nid=0x6e5a runnable');
    var synchronizer = new Synchronizer("foo", "bar");
    synchronizer.notificationWaiters = [thread, thread, thread];
    synchronizer.lockWaiters = [thread, thread];
    synchronizer.lockHolder = thread;

    assert.equal(synchronizer.getThreadCount(), 6);
});

QUnit.test("synchronizer sort function", function(assert) {
    var unused = new Synchronizer("id", "ClassName");

    assert.equal(synchronizerComparator(unused, unused), 0);

    var thread = new Thread('"Thread" prio=10 tid=1234 nid=0x6e5a runnable');
    var held = new Synchronizer("id", "ClassName");
    held.lockHolder = thread;
    assert.deepEqual([unused, held].sort(synchronizerComparator), [held, unused]);

    var zebra = new Synchronizer("id", "Zebra");
    assert.deepEqual([zebra, unused].sort(synchronizerComparator), [unused, zebra]);
    assert.deepEqual([zebra, unused, held].sort(synchronizerComparator),
                     [held, unused, zebra]);

    var biggerId = new Synchronizer("jd", "ClassName");
    assert.deepEqual([zebra, biggerId, unused, held].sort(synchronizerComparator),
                     [held, unused, biggerId, zebra]);
});
