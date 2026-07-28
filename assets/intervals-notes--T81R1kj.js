var e=`An interval is two numbers: a start and an end. A meeting from 9 to 11, a
balloon spanning x = 3 to x = 7, a booking, a lifetime, a range of rows. Given a
pile of them, you get asked which ones overlap, how many overlap at once, how
few you can throw away to stop the overlapping, and where the gaps are.

Every one of those has a brute force that compares each interval with every
other one — O(n²), and correct. And almost every one of them has an intended
answer that begins with a sort and then a single left-to-right pass. What the
whole topic really turns on is one decision, taken before you write a line:

> Do you sort by **start**, or by **end**?

Sort by start when you are building something up as you sweep — merging a run,
inserting into a run, walking two lists together. Sort by end when you are
making a greedy choice about what to keep, because whatever finishes soonest
leaves the most room for everything after it. Get that choice wrong and the code
still runs, still looks reasonable, and is wrong on about one input in five.

## What an interval is in Java, and the question to settle first

There is no \`Interval\` class. In practice an interval is \`int[]\` of length two,
and a list of them is \`int[][]\`:

\`\`\`java
int[][] iv = { { 1, 3 }, { 2, 6 }, { 8, 10 }, { 15, 18 } };
// iv[i][0] is the start, iv[i][1] is the end
\`\`\`

Before anything else, settle this: **do \`[1,2]\` and \`[2,3]\` overlap?**

It depends on the problem, and it is the single most common source of a wrong
answer in this topic. Two conventions are in use.

- **Closed**, \`[s, e]\`, both endpoints included. \`[1,2]\` and \`[2,3]\` share the
  point 2, so they overlap. This is what balloon problems mean: an arrow at
  x = 2 bursts both.
- **Half-open**, \`[s, e)\`, the start included and the end excluded. \`[1,2]\` and
  \`[2,3]\` do not overlap. This is what time means: a meeting that ends at 2
  frees the room for a meeting starting at 2.

The problem statement will tell you, usually in one clause you will read past:
"a meeting ending at the same time another starts does not conflict", or "a
balloon with \`xstart ≤ x ≤ xend\` is burst". Write down which one before you
write the comparison, because the entire difference in the code is one character:

| Convention | Overlap test | Merge condition | Greedy keep condition |
|---|---|---|---|
| Closed, touching counts | \`b.start <= a.end\` | \`cur[0] <= last[1]\` | \`cur[0] > lastEnd\` |
| Half-open, touching is fine | \`b.start < a.end\` | \`cur[0] < last[1]\` | \`cur[0] >= lastEnd\` |

## The overlap test, derived rather than memorised

Take two intervals and assume \`a.start ≤ b.start\` — you can always name them so.
Then there is only one way they can miss each other: \`b\` starts after \`a\` has
finished. So:

\`\`\`text
a = [1, 5]      b = [7, 9]        miss:     a ends before b starts
     -----           -----

a = [1, 5]      b = [3, 9]        overlap:  b starts inside a
     -----
         -----

a = [1, 5]      b = [5, 9]        depends:  closed -> overlap at the point 5
     -----                                  half-open -> miss
         -----
\`\`\`

They miss when \`b.start > a.end\` (closed) or \`b.start >= a.end\` (half-open), so
they overlap when the opposite holds. Written without assuming which comes
first, the symmetric form is:

\`\`\`java
boolean overlap = Math.max(a[0], b[0]) <= Math.min(a[1], b[1]);   // closed
\`\`\`

and that same expression gives you the intersection itself:
\`[max(starts), min(ends)]\`, which is exactly what
[Interval List Intersections](problem:interval-list-intersections) wants you to
emit. If the max is greater than the min, the intersection is empty.

## Sort by start: merging

[Merge Intervals](problem:merge-intervals) is the base case of the whole topic.
Sort by start, keep a running "last interval in the output", and for each one
either extend it or start a new one.

\`\`\`text
[[1,3], [8,10], [2,6], [15,18]]

sorted by start:   [1,3]   [2,6]   [8,10]   [15,18]

out = [[1,3]]
[2,6]     2 <= 3    overlap   ->  last.end = max(3, 6) = 6    out = [[1,6]]
[8,10]    8 <= 6    no        ->  append                      out = [[1,6], [8,10]]
[15,18]  15 <= 10   no        ->  append          out = [[1,6], [8,10], [15,18]]
\`\`\`

Sorting by start is what makes one comparison enough. Once the list is in start
order, any interval that overlaps anything already in the output must overlap
the **last** one — everything earlier ends no later than the last one does, or
it would have been merged into it. So there is no search, only a look at the
back of the list.

The merge itself is \`last.end = max(last.end, cur.end)\`, and the \`max\` is not
decoration:

\`\`\`text
[[1,10], [2,3]]

out = [[1,10]]
[2,3]   2 <= 10   overlap   ->  last.end = max(10, 3) = 10, not 3
out = [[1,10]]
\`\`\`

A fully contained interval would otherwise shrink the one holding it. That bug
passes the obvious test cases and fails the first nested one.

## Inserting into a list that is already sorted

[Insert Interval](problem:insert-interval) hands you a list that is already
sorted and non-overlapping, plus one new interval. You could append and re-merge
for O(n log n), but the list is already in order, so O(n) is available. Think of
it as three phases, in this order:

1. **Before.** Every interval that ends strictly before the new one starts.
   Copy them across untouched.
2. **Merging.** Every interval that overlaps the new one. Do not emit them —
   widen the new interval to swallow each, taking \`min\` of the starts and \`max\`
   of the ends. When this phase ends, emit the widened interval once.
3. **After.** Everything left. Copy them across untouched.

\`\`\`text
existing  [1,2] [3,5] [6,7] [8,10] [12,16]      new = [4,8]

phase 1   [1,2]                      2 < 4, before          out = [1,2]
phase 2   [3,5]  [6,7]  [8,10]       start <= 8, overlaps
          new grows [4,8] -> [3,8] -> [3,8] -> [3,10]       out = [1,2] [3,10]
phase 3   [12,16]                    copy                   out = [1,2] [3,10] [12,16]
\`\`\`

The phases are sequential and never revisit anything, so it is one pass. Each
phase is a \`while\` with its own condition, which is why this reads better as
three loops than as one loop with a flag.

\`\`\`java Merge.java @run-intervals-merge
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class Merge {

    /** Merge overlapping intervals. Touching ends count as overlapping here. */
    static int[][] merge(int[][] iv) {
        if (iv.length == 0) return new int[0][];
        Arrays.sort(iv, (x, y) -> Integer.compare(x[0], y[0]));

        List<int[]> out = new ArrayList<>();
        out.add(new int[] { iv[0][0], iv[0][1] });
        for (int i = 1; i < iv.length; i++) {
            int[] last = out.get(out.size() - 1);
            if (iv[i][0] <= last[1]) last[1] = Math.max(last[1], iv[i][1]);
            else out.add(new int[] { iv[i][0], iv[i][1] });
        }
        return out.toArray(new int[0][]);
    }

    /** Insert into a sorted, non-overlapping list. Three phases, one pass. */
    static int[][] insert(int[][] iv, int[] add) {
        List<int[]> out = new ArrayList<>();
        int i = 0, n = iv.length;

        while (i < n && iv[i][1] < add[0]) out.add(iv[i++]);      // 1. before

        int s = add[0], e = add[1];
        while (i < n && iv[i][0] <= e) {                          // 2. merging
            s = Math.min(s, iv[i][0]);
            e = Math.max(e, iv[i][1]);
            i++;
        }
        out.add(new int[] { s, e });

        while (i < n) out.add(iv[i++]);                           // 3. after
        return out.toArray(new int[0][]);
    }

    static String show(int[][] iv) {
        StringBuilder sb = new StringBuilder();
        for (int[] p : iv) sb.append('[').append(p[0]).append(',').append(p[1]).append("] ");
        return sb.toString().trim();
    }

    public static void main(String[] args) {
        System.out.println(show(merge(new int[][] { { 1, 3 }, { 8, 10 }, { 2, 6 }, { 15, 18 } })));
        System.out.println(show(merge(new int[][] { { 1, 10 }, { 2, 3 } })));   // nested
        System.out.println(show(merge(new int[][] { { 1, 4 }, { 4, 5 } })));    // touching
        System.out.println(show(merge(new int[0][])));                          // empty

        int[][] cal = { { 1, 2 }, { 3, 5 }, { 6, 7 }, { 8, 10 }, { 12, 16 } };
        System.out.println(show(insert(cal, new int[] { 4, 8 })));
        System.out.println(show(insert(cal, new int[] { 17, 19 })));   // after everything
        System.out.println(show(insert(cal, new int[] { 0, 0 })));     // before everything
    }
}
\`\`\`

\`\`\`output @run-intervals-merge
[1,6] [8,10] [15,18]
[1,10]
[1,5]

[1,2] [3,10] [12,16]
[1,2] [3,5] [6,7] [8,10] [12,16] [17,19]
[0,0] [1,2] [3,5] [6,7] [8,10] [12,16]
\`\`\`

The empty case returns \`new int[0][]\` rather than reading \`iv[0]\`, and the
touching case is the one to change first when a problem uses the other
convention — \`<=\` becomes \`<\` and \`[1,4] [4,5]\` stops being one interval.

## Sort by end: the greedy that keeps the most

[Non-overlapping Intervals](problem:non-overlapping-intervals) asks for the
fewest removals that leave nothing overlapping. That is the same question as
"keep the most", and it is the classic activity-selection problem.

**Sort by end, and greedily keep every interval that starts at or after the last
kept one ended.**

\`\`\`java
Arrays.sort(iv, (x, y) -> Integer.compare(x[1], y[1]));    // by END
int kept = 0, lastEnd = Integer.MIN_VALUE;
for (int[] cur : iv)
    if (cur[0] >= lastEnd) { kept++; lastEnd = cur[1]; }
return iv.length - kept;
\`\`\`

### Why earliest-finishing-first is optimal

The argument is worth having, because "greedy" without one is a guess. It is an
**exchange argument**: take any optimal solution and show you can turn it into
one that starts with the greedy choice, without making it worse.

Let \`g\` be the interval that finishes earliest overall — the greedy's first
pick. Let \`O\` be some optimal set of non-overlapping intervals, ordered by end,
with first element \`o\`. Two cases:

- If \`o = g\`, nothing to do.
- Otherwise \`o ≠ g\`, and since \`g\` finishes earliest, \`g.end ≤ o.end\`. Swap \`o\`
  out of \`O\` and \`g\` in. Does anything break? The second element of \`O\` starts
  at or after \`o.end\`, and \`g.end ≤ o.end\`, so it starts at or after \`g.end\`
  too — no conflict. \`O\` is still non-overlapping and still the same size, so it
  is still optimal.

So there is always an optimal solution containing the greedy choice. Remove \`g\`
and everything overlapping it, and repeat the argument on what remains. By
induction the greedy is optimal.

Now notice what sorting by **start** would have done. The interval that starts
earliest can be the one that runs the longest — \`[1, 100]\` starts before
\`[2, 3]\` and \`[4, 5]\` and blocks both. Starting early tells you nothing about
how much room is left afterwards. Finishing early tells you exactly that, which
is the reason the sort key is the end.

The same greedy, with the touching convention flipped, is
[Minimum Number of Arrows to Burst Balloons](problem:minimum-number-of-arrows-to-burst-balloons):
there, touching balloons *can* be burst by one arrow, so the keep test is
\`cur[0] > lastEnd\` rather than \`>=\`. One character, and it is the whole
difference between the two problems.

## Counting the overlap: the sweep line

[Meeting Rooms II](problem:meeting-rooms-ii) asks a different kind of question:
not which intervals to keep, but how many are alive at the busiest moment.
Merging does not help — the answer is about depth, not extent.

Forget that these are intervals. Each one is two **events**: a \`+1\` when it
starts and a \`-1\` when it ends. Sort all 2n events by time and walk them,
carrying a running count. The largest that count ever reaches is the answer.

\`\`\`text
meetings   [0,30]   [5,10]   [15,20]

events     (0,+1)  (5,+1)  (10,-1)  (15,+1)  (20,-1)  (30,-1)

time        0       5       10       15       20       30
running     1       2       1        2        1        0
                    ^                ^
                    peak 2, so two rooms are enough
\`\`\`

The one decision in that sort is what happens when a \`-1\` and a \`+1\` land on the
same time — and it is the touching-ends question again. Under the half-open
convention a room freed at 10 can be taken at 10, so the \`-1\` must be processed
first. Put the delta in the tiebreak and \`-1\` sorts before \`+1\` naturally.

When the times are small integers, you do not need to sort at all: make an array
indexed by time, add \`+1\` at the start and \`-1\` at the end, and take the running
maximum of the prefix sums. That is the **difference array**, the same structure
that shows up in [prefix sum](#/dsa/prefix-sum/notes):

\`\`\`java
int[] delta = new int[1001];              // times are 0..1000 in this problem
for (int[] t : trips) {
    delta[t[1]] += t[0];                  // passengers on
    delta[t[2]] -= t[0];                  // passengers off
}
int live = 0;
for (int d : delta) {
    live += d;
    if (live > capacity) return false;
}
return true;
\`\`\`

That is [Car Pooling](problem:car-pooling) in nine lines, O(range) rather than
O(n log n), and it works only because the problem bounds the times. When the
times are unbounded, sort the events instead.

## The other way to count: a heap of end times

The same problem has a second standard answer, and it is worth knowing both
because interviewers ask for the second after you give the first.

Sort by start. Keep a min-heap of the end times of the meetings currently in
rooms. For each new meeting, if the earliest-ending room has already finished —
its end is at or before the new start — reuse it by polling. Then push the new
end. The heap's size at the finish is the number of rooms you needed.

\`\`\`java
Arrays.sort(iv, (x, y) -> Integer.compare(x[0], y[0]));
PriorityQueue<Integer> endings = new PriorityQueue<>();   // min-heap of end times
for (int[] m : iv) {
    if (!endings.isEmpty() && endings.peek() <= m[0]) endings.poll();
    endings.offer(m[1]);
}
return endings.size();
\`\`\`

The min-heap is right because the only room worth checking is the one that
frees earliest — if that one is still busy, all of them are. See
[heaps](#/dsa/heaps/notes) for why the direction is the way round it is.

\`\`\`java Rooms.java @run-intervals-rooms
import java.util.Arrays;
import java.util.PriorityQueue;

public class Rooms {

    /** Split into +1 and -1 events, sort, and carry a running count. */
    static int bySweep(int[][] iv) {
        int[][] ev = new int[iv.length * 2][];
        int k = 0;
        for (int[] m : iv) {
            ev[k++] = new int[] { m[0], +1 };
            ev[k++] = new int[] { m[1], -1 };
        }
        // Same time: the -1 first, so a room freed at 10 is reused at 10.
        Arrays.sort(ev, (x, y) -> x[0] != y[0]
                ? Integer.compare(x[0], y[0])
                : Integer.compare(x[1], y[1]));

        int live = 0, best = 0;
        for (int[] e : ev) {
            live += e[1];
            best = Math.max(best, live);
        }
        return best;
    }

    /** Same answer, min-heap of the end times of the rooms in use. */
    static int byHeap(int[][] iv) {
        int[][] a = iv.clone();
        Arrays.sort(a, (x, y) -> Integer.compare(x[0], y[0]));
        PriorityQueue<Integer> endings = new PriorityQueue<>();
        for (int[] m : a) {
            if (!endings.isEmpty() && endings.peek() <= m[0]) endings.poll();
            endings.offer(m[1]);
        }
        return endings.size();
    }

    static void report(String label, int[][] iv) {
        System.out.println(label + "  sweep=" + bySweep(iv) + "  heap=" + byHeap(iv));
    }

    public static void main(String[] args) {
        report("classic  ", new int[][] { { 0, 30 }, { 5, 10 }, { 15, 20 } });
        report("touching ", new int[][] { { 1, 5 }, { 5, 9 }, { 9, 12 } });
        report("nested   ", new int[][] { { 1, 20 }, { 2, 19 }, { 3, 18 }, { 4, 17 } });
        report("disjoint ", new int[][] { { 1, 2 }, { 3, 4 }, { 5, 6 } });
        report("single   ", new int[][] { { 7, 8 } });
    }
}
\`\`\`

\`\`\`output @run-intervals-rooms
classic    sweep=2  heap=2
touching   sweep=1  heap=1
nested     sweep=4  heap=4
disjoint   sweep=1  heap=1
single     sweep=1  heap=1
\`\`\`

The \`touching\` line is the one to look at. Both methods say one room, because
both were written for the half-open convention — the sweep puts \`-1\` first in
the tiebreak and the heap uses \`<=\`. Change either to the closed convention and
that line becomes three.

## Sort by start, or sort by end

| The question | Sort by | Because |
|---|---|---|
| Merge overlapping runs | start | the only thing that can extend the run is the next earliest start |
| Insert into a sorted list | already start | the three phases are positions in start order |
| Intersect two sorted lists | already start | advance whichever of the two ends first |
| Is anyone double-booked | start | adjacent pairs are the only ones that can clash |
| Remove covered intervals | start, then end descending | the longer of two equal starts must come first |
| Keep the most non-overlapping | end | earliest finish leaves the most room after it |
| Fewest removals to stop overlap | end | the same problem, counted the other way |
| Fewest arrows, fewest platforms | end | the same greedy again |
| How many overlap at once | neither — events | depth is not about order of intervals, only of times |
| Depth when times are small | neither — difference array | index by time, no sort at all |

If a problem asks you to **choose a subset**, sort by end. If it asks you to
**describe the union**, sort by start. If it asks **how deep**, forget the
intervals and sweep the events. Those three sentences cover most of the sheet.

## What it costs

| Step | Cost | Why |
|---|---|---|
| The sort | O(n log n) | this dominates almost every solution here |
| The merge pass | O(n) | one look at the back of the output per interval |
| Insert into a sorted list | O(n) | three phases, none revisits anything |
| Sweep line | O(n log n) | 2n events, and sorting them is the cost |
| Difference array | O(n + range) | no sort, but you pay for the whole time axis |
| Heap of end times | O(n log n) | the sort, plus n heap operations |
| Output space | O(n) | the merged list, or the event array at 2n |

Nothing here beats O(n log n) unless the times are bounded, in which case the
difference array is O(n + range) and wins outright. Read the constraints: a
problem that says \`0 ≤ time ≤ 1000\` is telling you to use it.

## The mistakes, in the order people make them

1. **Not deciding the convention first.** \`<\` against \`<=\` in the overlap test.
   Write down whether \`[1,2]\` and \`[2,3]\` touch before writing any code.
2. **Sorting by start for the greedy.** It looks fine and fails whenever one
   long early interval blocks several short ones. The keep-the-most greedy sorts
   by end, always.
3. **Forgetting the \`max\` in the merge.** \`last.end = cur.end\` shrinks the
   output when \`cur\` is entirely inside \`last\`.
4. **\`(x, y) -> x[0] - y[0]\` as the comparator.** It overflows on large
   coordinates and silently inverts the order.
   [Minimum Number of Arrows](problem:minimum-number-of-arrows-to-burst-balloons)
   uses the full \`int\` range specifically to catch this.
5. **Not handling the empty list.** \`iv[0]\` on a zero-length array throws. Also
   check the one-interval case, which several of these get wrong.
6. **Mutating the input array's rows.** \`out.add(iv[i])\` puts the caller's array
   into your output, and then \`last[1] = …\` modifies it. Copy the row if the
   caller might look at theirs afterwards.
7. **Getting the sweep tiebreak backwards.** With \`+1\` before \`-1\` at equal
   times, a meeting ending at 10 and one starting at 10 briefly count as two.
   That is right for the closed convention and wrong for the half-open one.
8. **Using the difference array without checking the bounds.** A time axis of
   10⁹ is not an array. Sort the events instead.
9. **Assuming the input is sorted.** Only [Insert Interval](problem:insert-interval)
   and [Interval List Intersections](problem:interval-list-intersections)
   promise it. The rest do not, and the sort is on you.

## The Java you will reach for

| You want | Write |
|---|---|
| Sort by start | \`Arrays.sort(iv, (x, y) -> Integer.compare(x[0], y[0]))\` |
| Sort by end | \`Arrays.sort(iv, (x, y) -> Integer.compare(x[1], y[1]))\` |
| Sort by start, longest first on a tie | \`Arrays.sort(iv, (x, y) -> x[0] != y[0] ? Integer.compare(x[0], y[0]) : Integer.compare(y[1], x[1]))\` |
| Growable output | \`List<int[]> out = new ArrayList<>()\` |
| Look at the last one | \`out.get(out.size() - 1)\` |
| Back to an array | \`out.toArray(new int[0][])\` |
| Widen | \`last[1] = Math.max(last[1], cur[1])\` |
| Intersection of two | \`new int[]{ Math.max(a[0], b[0]), Math.min(a[1], b[1]) }\` |
| Min-heap of end times | \`new PriorityQueue<Integer>()\` |
| Copy a row | \`p.clone()\` or \`new int[]{ p[0], p[1] }\` |

\`Arrays.sort\` on an object array is a stable merge sort, so intervals the
comparator calls equal keep their input order. That matters when the tiebreak is
left out on purpose.

## Working one from the sheet

[Non-overlapping Intervals](problem:non-overlapping-intervals): find the minimum
number of intervals to remove so that the rest do not overlap. Touching ends —
\`[1,2]\` and \`[2,3]\` — do not count as overlapping.

Removing the fewest is keeping the most, so this is the end-sorted greedy. The
program below also runs the balloon version beside it, so the effect of the one
changed character is visible on the same input.

\`\`\`java Greedy.java @run-intervals-greedy
import java.util.Arrays;

public class Greedy {

    /** Fewest removals so nothing overlaps. Touching is allowed, so >=. */
    static int eraseOverlap(int[][] iv) {
        if (iv.length == 0) return 0;
        int[][] a = iv.clone();
        Arrays.sort(a, (x, y) -> Integer.compare(x[1], y[1]));

        int kept = 0;
        long lastEnd = Long.MIN_VALUE;
        for (int[] cur : a)
            if (cur[0] >= lastEnd) {
                kept++;
                lastEnd = cur[1];
            }
        return a.length - kept;
    }

    /** Fewest arrows. Touching balloons burst together, so >. */
    static int arrows(int[][] iv) {
        if (iv.length == 0) return 0;
        int[][] a = iv.clone();
        Arrays.sort(a, (x, y) -> Integer.compare(x[1], y[1]));

        int shots = 0;
        long last = Long.MIN_VALUE;
        for (int[] cur : a)
            if (cur[0] > last) {
                shots++;
                last = cur[1];
            }
        return shots;
    }

    static void report(String label, int[][] iv) {
        System.out.println(label + "  remove=" + eraseOverlap(iv) + "  arrows=" + arrows(iv));
    }

    public static void main(String[] args) {
        report("overlapping ", new int[][] { { 1, 2 }, { 2, 3 }, { 3, 4 }, { 1, 3 } });
        report("all touching", new int[][] { { 1, 2 }, { 2, 3 }, { 3, 4 } });
        report("identical   ", new int[][] { { 1, 2 }, { 1, 2 }, { 1, 2 } });
        report("nested      ", new int[][] { { 1, 100 }, { 2, 3 }, { 4, 5 }, { 6, 7 } });
        report("empty       ", new int[0][]);
    }
}
\`\`\`

\`\`\`output @run-intervals-greedy
overlapping   remove=1  arrows=2
all touching  remove=0  arrows=2
identical     remove=2  arrows=1
nested        remove=1  arrows=3
empty         remove=0  arrows=0
\`\`\`

Read the \`all touching\` line. The chain \`[1,2] [2,3] [3,4]\` needs no removals —
under this convention nothing there overlaps — and still needs two arrows,
because one at x = 2 bursts the first two and nothing reaches the third. Same
input, two answers, one character apart.

The \`nested\` line is the one that shows why the sort key is the end. Sorted by
start, \`[1,100]\` comes first and blocks all three short ones. Sorted by end it
comes last, and it is the single interval removed.

\`lastEnd\` is a \`long\` because the interval bounds can be \`Integer.MIN_VALUE\`,
and an \`int\` sentinel would then be a legal end time rather than a sentinel.
Small thing, and it is a real failing test case.

## How to work through the topic

1. [Summary Ranges](problem:summary-ranges) and
   [Teemo Attacking](problem:teemo-attacking). Intervals you build rather than
   receive. Neither needs a sort, and both need you to be careful about the
   endpoint.
2. [Meeting Rooms](problem:meeting-rooms) and
   [Merge Intervals](problem:merge-intervals). Sort by start, then one pass.
   Merge Intervals is the one to be able to write without thinking — it appears
   inside half the harder problems.
3. [Insert Interval](problem:insert-interval) and
   [Interval List Intersections](problem:interval-list-intersections). Both give
   you a sorted list and want O(n). Three phases in the first; a two-pointer
   walk in the second, advancing whichever ends first.
4. [Non-overlapping Intervals](problem:non-overlapping-intervals) and
   [Minimum Number of Arrows to Burst Balloons](problem:minimum-number-of-arrows-to-burst-balloons).
   The end-sorted greedy, twice, with the convention flipped between them. Say
   the exchange argument out loud before you code either — see
   [greedy](#/dsa/greedy/notes) for the general shape.
5. [Meeting Rooms II](problem:meeting-rooms-ii) and
   [Car Pooling](problem:car-pooling). Counting depth. Do the first with events
   and then again with a [heap](#/dsa/heaps/notes); do the second with a
   difference array once you have noticed the bound on the times.
6. [Remove Covered Intervals](problem:remove-covered-intervals) and
   [Find Right Interval](problem:find-right-interval). Sort keys with a
   deliberate tiebreak, and a binary search over the starts. This is the point
   where the comparator becomes the whole solution — [sorting](#/dsa/sorting/notes)
   is the companion page.
7. [Employee Free Time](problem:employee-free-time),
   [My Calendar III](problem:my-calendar-iii) and
   [Minimum Number of Taps to Open to Water a Garden](problem:minimum-number-of-taps-to-open-to-water-a-garden).
   Merging to find the gaps, a running maximum booking depth, and interval
   covering — which is the greedy from step 4 with reach in place of end.
   [Maximum Number of Events That Can Be Attended II](problem:maximum-number-of-events-that-can-be-attended-ii)
   is the one that stops being greedy and becomes dynamic programming, and
   knowing why is worth as much as solving it.
`;export{e as default};