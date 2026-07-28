var e=`A deque — say "deck", short for double-ended queue — is a line you can join or
leave at either end. Add to the front, add to the back, remove from the front,
remove from the back, all in constant time. A [stack](#/dsa/stacks/notes) is a
deque you only touch one end of. A [queue](#/dsa/queues/notes) is a deque you
add to one end and take from the other. This is the general case, and Java's
\`ArrayDeque\` is the class all three should be written with.

Being able to leave from both ends sounds like a small extra. It buys one
specific thing: you can throw away the oldest entry because it has expired, and
throw away the newest entry because something better just arrived. Doing both in
the same loop is the monotonic deque, and it is the reason this topic exists.
It answers "the maximum of every window of size k" in one pass over the array,
where the honest answer is k comparisons per window.

That problem — [Sliding Window Maximum](problem:sliding-window-maximum) — is the
one to understand. Everything else here is either the structure itself or the
same deque wearing a different hat.

## The structure

\`\`\`java
Deque<Integer> dq = new ArrayDeque<>();

dq.addFirst(1);      // 1
dq.addLast(2);       // 1 2
dq.addLast(3);       // 1 2 3

int front = dq.peekFirst();   // 1   look at the front
int back  = dq.peekLast();    // 3   look at the back
dq.pollFirst();               // removes 1
dq.pollLast();                // removes 3
\`\`\`

Every one of those is O(1). \`ArrayDeque\` is a circular array with a head index
and a tail index; adding at either end writes one slot and moves one index, and
when the array fills it doubles and copies, which averages out to O(1) per add.

The method names come in a \`First\`/\`Last\` pair, and each pair comes in a
throwing form and a returning form — the same split as \`Queue\`:

| Job | Throws when it cannot | Returns instead |
|---|---|---|
| Add to the front | \`addFirst(x)\` | \`offerFirst(x)\` |
| Add to the back | \`addLast(x)\` | \`offerLast(x)\` |
| Remove the front | \`removeFirst()\` | \`pollFirst()\` — \`null\` |
| Remove the back | \`removeLast()\` | \`pollLast()\` — \`null\` |
| Look at the front | \`getFirst()\` | \`peekFirst()\` — \`null\` |
| Look at the back | \`getLast()\` | \`peekLast()\` — \`null\` |

The short names are aliases onto these, and knowing which end each one means is
the difference between reading the code and guessing at it:

| Short name | Means | Reads as |
|---|---|---|
| \`push\` | \`addFirst\` | stack |
| \`pop\` | \`removeFirst\` | stack |
| \`offer\` | \`offerLast\` | queue |
| \`poll\` | \`pollFirst\` | queue |
| \`peek\` | \`peekFirst\` | either |

So \`push\` and \`offer\` add to **opposite ends**. Mixing the stack names and the
queue names in one method is how a deque solution becomes unreadable. Pick the
explicit \`First\`/\`Last\` names whenever the code genuinely uses both ends, which
in this topic is always.

## Why ArrayDeque, and not the other two

\`ArrayDeque\` is the one class that is a good stack, a good queue and a good
deque. There is no case in interview code where another choice is better.

- **\`java.util.Stack\`** is from 1995. Every method is \`synchronized\`, so you pay
  for a lock you do not use, and it extends \`Vector\`, so iterating or printing
  it runs bottom to top — the reverse of what you expect from a stack.
- **\`LinkedList\`** implements \`Deque\`, so it compiles wherever \`ArrayDeque\`
  does, and it is the wrong choice. Every element is a separate heap object with
  two pointers, so a list of a million \`int\` values costs roughly six times the
  memory of an array and scatters those objects across memory, which defeats the
  cache. Its one genuine advantage — O(1) removal from the middle given a node —
  is not something the \`Deque\` interface exposes.
- **\`ArrayDeque\`** stores elements in one contiguous array. Fewer objects, no
  pointer chasing, and both ends in O(1).

The one restriction: **\`ArrayDeque\` does not accept \`null\`.** \`addFirst(null)\`
throws \`NullPointerException\`. That is deliberate, because \`peekFirst()\` returns
\`null\` to mean "empty" and a \`null\` element would make that answer ambiguous.
\`LinkedList\` does accept \`null\`, which is a way of being wrong more quietly.

## The idea: the maximum of every window

![The front holds the maximum and expires; the back is where arrivals evict](diagrams/deque-notes-both-ends.jpg)

[Sliding Window Maximum](problem:sliding-window-maximum): given an array and a
window size k, report the maximum of every window of k consecutive values.

The brute force is O(nk) — walk each window, take its maximum. A heap gets it to
O(n log n). The deque gets it to O(n), and the reasoning is worth having whole.

Ask what a window's maximum can ever be. If \`a[i]\` and \`a[j]\` are both in the
window with \`i < j\` and \`a[i] <= a[j]\`, then \`a[i]\` is useless forever: every
future window containing \`i\` also contains \`j\`, because windows only move right.
So \`a[i]\` can never be the maximum of any window again, and it can be discarded
the moment \`a[j]\` arrives.

Keep a deque of the elements that are still candidates, in decreasing order.
Then:

- **The back is where new elements arrive.** Before pushing \`a[i]\`, drop from
  the back everything smaller than or equal to it — just shown to be useless.
- **The front holds the maximum**, because the contents are decreasing.
- **The front is also where elements expire**, because it is the oldest. When
  the window moves past it, drop it.

Both ends, for two different reasons. That is why this needs a deque and not a
stack or a queue.

\`\`\`text
a = [1, 3, -1, -3, 5, 3, 6, 7], k = 3
deque holds indices; the values under them are decreasing

i=0  a=1   back: nothing to drop     push 0      deque: [0]       vals 1
i=1  a=3   a[0]=1 <= 3, drop 0       push 1      deque: [1]       vals 3
i=2  a=-1  a[1]=3 > -1, keep         push 2      deque: [1,2]     vals 3 -1
           window [0..2] full -> answer a[1] = 3
i=3  a=-3  a[2]=-1 > -3, keep        push 3      deque: [1,2,3]   vals 3 -1 -3
           front 1 still inside [1..3] -> answer 3
i=4  a=5   front 1 has left the window (1 <= 4-3), drop it
           back: a[3]=-3 <= 5 drop, a[2]=-1 <= 5 drop   push 4  deque: [4]  vals 5
           -> answer 5
i=5  a=3   a[4]=5 > 3, keep          push 5      deque: [4,5]     vals 5 3
           -> answer 5
i=6  a=6   drop 5 (3<=6), 4 (5<=6)   push 6      deque: [6]       vals 6
           -> answer 6
i=7  a=7   drop 6                    push 7      deque: [7]       vals 7
           -> answer 7

answers: [3, 3, 5, 5, 6, 7]
\`\`\`

Look at \`i=4\`. Three elements leave the back at once, and none of them will ever
be missed, because the arriving 5 is at least as large and lives at least as
long. That is the whole optimisation, stated once.

Expiry from the front appeared once, at \`i=4\`, and there the arriving 5 would
have cleared the deque anyway. It is not always so lucky. On \`[9, 1, 1, 1]\` with
k = 3 the 9 sits at the front through the first window and then has to go,
because index 0 falls out of window \`[1..3]\` — nothing larger ever arrived to
push it off the back, so the front check is the only thing that removes it.

## Why indices and not values

Store indices in the deque, not values. The front has to be dropped when it
falls out of the window, and "is it out of the window" is a question about
**position**: \`front <= i - k\`. A value cannot answer it.

You can always recover the value with \`a[dq.peekFirst()]\`. You can never recover
the position from a value, and with duplicates you could not even guess.

## The shape

![The window of size k sliding, and the maximum it reports each time](diagrams/deque-notes-window-max.svg)

\`\`\`java
Deque<Integer> dq = new ArrayDeque<>();          // indices, values decreasing
for (int i = 0; i < a.length; i++) {
    if (!dq.isEmpty() && dq.peekFirst() <= i - k) dq.pollFirst();   // expired
    while (!dq.isEmpty() && a[dq.peekLast()] <= a[i]) dq.pollLast();// useless
    dq.addLast(i);
    if (i >= k - 1) out[i - k + 1] = a[dq.peekFirst()];             // window is full
}
\`\`\`

Four lines, and each answers a different question:

- The expiry check is an \`if\`, not a \`while\`. The index moves one step per
  iteration, so at most one element can fall out of the window at a time.
- The usefulness check is a \`while\`, not an \`if\`. One large arriving value can
  make several stored ones useless at once, as \`i=4\` did above.
- \`<=\` in the usefulness check drops equal values. \`<\` keeps them, which is also
  correct — it just leaves more in the deque. For a sliding *minimum*, flip that
  one comparison to \`>=\` and nothing else changes.
- The answer is only recorded from \`i >= k - 1\`, the first index at which a full
  window exists.

\`\`\`java Window.java @run-deque-window
import java.util.ArrayDeque;
import java.util.Arrays;
import java.util.Deque;

public class Window {

    /** The maximum of every window of k consecutive values, in one pass. */
    static int[] maxOfEachWindow(int[] a, int k) {
        if (a.length == 0 || k <= 0) return new int[0];
        int[] out = new int[a.length - k + 1];
        Deque<Integer> dq = new ArrayDeque<>();      // indices, values decreasing

        for (int i = 0; i < a.length; i++) {
            if (!dq.isEmpty() && dq.peekFirst() <= i - k) dq.pollFirst();   // left the window
            while (!dq.isEmpty() && a[dq.peekLast()] <= a[i]) dq.pollLast();// can never win again
            dq.addLast(i);
            if (i >= k - 1) out[i - k + 1] = a[dq.peekFirst()];
        }
        return out;
    }

    /** The same loop with one comparison flipped. */
    static int[] minOfEachWindow(int[] a, int k) {
        int[] out = new int[a.length - k + 1];
        Deque<Integer> dq = new ArrayDeque<>();      // indices, values increasing
        for (int i = 0; i < a.length; i++) {
            if (!dq.isEmpty() && dq.peekFirst() <= i - k) dq.pollFirst();
            while (!dq.isEmpty() && a[dq.peekLast()] >= a[i]) dq.pollLast();
            dq.addLast(i);
            if (i >= k - 1) out[i - k + 1] = a[dq.peekFirst()];
        }
        return out;
    }

    public static void main(String[] args) {
        int[] a = { 1, 3, -1, -3, 5, 3, 6, 7 };
        System.out.println("input        " + Arrays.toString(a));
        System.out.println("max k=3      " + Arrays.toString(maxOfEachWindow(a, 3)));
        System.out.println("min k=3      " + Arrays.toString(minOfEachWindow(a, 3)));
        System.out.println("max k=1      " + Arrays.toString(maxOfEachWindow(a, 1)));
        System.out.println("max k=8      " + Arrays.toString(maxOfEachWindow(a, 8)));

        int[] front = { 9, 1, 1, 1 };                // the front expires on its own
        System.out.println("expiry k=3   " + Arrays.toString(maxOfEachWindow(front, 3)));
        System.out.println("empty        " + Arrays.toString(maxOfEachWindow(new int[0], 3)));
    }
}
\`\`\`

\`\`\`output @run-deque-window
input        [1, 3, -1, -3, 5, 3, 6, 7]
max k=3      [3, 3, 5, 5, 6, 7]
min k=3      [-1, -3, -3, -3, 3, 3]
max k=1      [1, 3, -1, -3, 5, 3, 6, 7]
max k=8      [7]
expiry k=3   [9, 1]
empty        []
\`\`\`

\`k = 1\` and \`k = a.length\` are the two edges worth keeping in a test. With
\`k = 1\` every element is its own answer; with \`k = a.length\` there is one
answer, the maximum of the lot. A loop that is wrong about \`i >= k - 1\` usually
survives the middle cases and fails one of these.

## What the same deque solves

Once you can see the deque as "the candidates still worth keeping, in order",
several problems that look unrelated turn out to be it.

| Problem | The deque holds | Dropped from the back when |
|---|---|---|
| [Sliding Window Maximum](problem:sliding-window-maximum) | indices, values decreasing | a larger value arrives |
| [Longest Continuous Subarray With Absolute Diff Less Than or Equal to Limit](problem:longest-continuous-subarray-with-absolute-diff-less-than-or-equal-to-limit) | two deques, a max and a min | the new value beats the end |
| [Jump Game VI](problem:jump-game-vi) | indices, scores decreasing | a better score arrives |
| [Constrained Subsequence Sum](problem:constrained-subsequence-sum) | indices, sums decreasing | a better sum arrives |
| [Shortest Subarray with Sum at Least K](problem:shortest-subarray-with-sum-at-least-k) | prefix-sum indices, increasing | a smaller prefix arrives |
| [Find the Most Competitive Subsequence](problem:find-the-most-competitive-subsequence) | the answer being built | a smaller digit arrives and there is room |

The limit problem is the clearest sign you have understood the pattern: hold two
deques over the same window, one giving the maximum and one the minimum, and the
window is valid exactly when their difference is within the limit. Combined with
a [sliding window](#/dsa/sliding-window/notes) that shrinks from the left, the
whole thing is one pass.

The last row is a monotonic **stack** rather than a deque, and it is here to
make the point that when you build an answer left to right and only ever remove
from the end you have written, one end is enough. Use a deque when — and only
when — something expires from the other end.

## 0-1 BFS

![A zero-cost edge goes to the front of the deque and a one-cost edge to the back](diagrams/deque-notes-zero-one-bfs.jpg)

Ordinary breadth-first search finds shortest paths when every edge costs the
same. Dijkstra handles arbitrary weights with a heap and an extra log factor.
There is a case in between: every edge costs either 0 or 1. A deque handles that
one in plain O(V + E).

The insight is what BFS relies on — the queue is kept in non-decreasing distance
order. A 1-weight edge takes you to distance \`d + 1\`, which belongs at the back
with the other far things. A 0-weight edge takes you to distance \`d\`, the same
as where you are, which belongs at the **front**, alongside everything else at
that distance.

So the loop is BFS with \`poll\` replaced by \`pollFirst\`, and the single push
replaced by a choice: \`addFirst\` for a zero-weight edge, \`addLast\` for a
one-weight edge.

One thing differs from ordinary BFS: a node can be taken off the deque more than
once, so you cannot mark it seen and be done. Keep distances and skip when the
new one is not an improvement. The typical use is a grid where moving in the
direction you already face is free and turning costs one, or one where walking
is free and breaking a wall costs one.

\`\`\`java ZeroOne.java @run-deque-zero-one
import java.util.ArrayDeque;
import java.util.Arrays;
import java.util.Deque;

public class ZeroOne {

    /**
     * Fewest walls to break to cross a grid. '.' is free (cost 0 to enter),
     * '#' is a wall (cost 1 to break through and enter).
     */
    static int wallsToBreak(String[] rows) {
        int h = rows.length, w = rows[0].length();
        int[][] dist = new int[h][w];
        for (int[] row : dist) Arrays.fill(row, Integer.MAX_VALUE);

        Deque<int[]> dq = new ArrayDeque<>();
        dist[0][0] = rows[0].charAt(0) == '#' ? 1 : 0;
        dq.addFirst(new int[] { 0, 0 });
        int[][] steps = { { 1, 0 }, { -1, 0 }, { 0, 1 }, { 0, -1 } };

        while (!dq.isEmpty()) {
            int[] cell = dq.pollFirst();
            int r = cell[0], c = cell[1];
            for (int[] s : steps) {
                int nr = r + s[0], nc = c + s[1];
                if (nr < 0 || nr >= h || nc < 0 || nc >= w) continue;
                int cost = rows[nr].charAt(nc) == '#' ? 1 : 0;
                if (dist[r][c] + cost >= dist[nr][nc]) continue;   // no improvement
                dist[nr][nc] = dist[r][c] + cost;
                if (cost == 0) dq.addFirst(new int[] { nr, nc });  // same distance
                else           dq.addLast(new int[] { nr, nc });   // one further
            }
        }
        return dist[h - 1][w - 1];
    }

    public static void main(String[] args) {
        System.out.println(wallsToBreak(new String[] { "....", "####", "...." }));   // 1
        System.out.println(wallsToBreak(new String[] { "...", "..#", "..." }));      // 0
        System.out.println(wallsToBreak(new String[] { "#.#", "###", "#.#" }));      // 3
        System.out.println(wallsToBreak(new String[] { "." }));                      // 0
    }
}
\`\`\`

\`\`\`output @run-deque-zero-one
1
0
3
0
\`\`\`

## Design Circular Deque

[Design Circular Deque](problem:design-circular-deque) asks you to build the
structure rather than use it: fixed capacity, insert and delete at both ends, no
shifting of the contents.

Back it with an array and keep \`head\` — the index of the front — and \`size\`.
Adding at the back writes \`(head + size) % capacity\`. Adding at the front moves
\`head\` backwards, and going backwards is where the arithmetic bites: \`head - 1\`
can be \`-1\`, and Java's \`%\` keeps the sign of the left operand, so
\`(head - 1) % n\` is \`-1\` rather than \`n - 1\`. Write \`(head - 1 + n) % n\`.

\`\`\`java CircularDeque.java @run-deque-circular-deque
public class CircularDeque {

    private final int[] a;
    private int head = 0, size = 0;

    CircularDeque(int capacity) { a = new int[capacity]; }

    boolean insertFront(int x) {
        if (size == a.length) return false;
        head = (head - 1 + a.length) % a.length;   // + a.length, or this goes negative
        a[head] = x;
        size++;
        return true;
    }

    boolean insertLast(int x) {
        if (size == a.length) return false;
        a[(head + size) % a.length] = x;           // one past the last
        size++;
        return true;
    }

    boolean deleteFront() {
        if (size == 0) return false;
        head = (head + 1) % a.length;
        size--;
        return true;
    }

    boolean deleteLast() {
        if (size == 0) return false;
        size--;                                    // the slot is simply no longer counted
        return true;
    }

    int getFront() { return size == 0 ? -1 : a[head]; }
    int getRear()  { return size == 0 ? -1 : a[(head + size - 1) % a.length]; }

    public static void main(String[] args) {
        CircularDeque d = new CircularDeque(3);
        d.insertLast(1);
        d.insertLast(2);
        d.insertFront(3);                                           // now 3 1 2
        System.out.println("insertFront(4) " + d.insertFront(4));   // full, so false
        System.out.println("front, rear    " + d.getFront() + " " + d.getRear());  // 3 2
        d.deleteLast();
        d.deleteFront();
        System.out.println("front, rear    " + d.getFront() + " " + d.getRear());  // 1 1
        d.deleteFront();
        System.out.println("front empty    " + d.getFront());       // -1
    }
}
\`\`\`

\`\`\`output @run-deque-circular-deque
insertFront(4) false
front, rear    3 2
front, rear    1 1
front empty    -1
\`\`\`

Keeping \`size\` rather than a second \`tail\` index is what keeps this short. With
\`head\` and \`tail\` alone, "full" and "empty" both look like \`head == tail\`, and
you need a wasted slot or a spare flag to tell them apart. This is roughly what
\`ArrayDeque\` does internally, with the capacity rounded up to a power of two so
the \`%\` becomes a bitmask.

## What it costs

| Operation | Cost | Why |
|---|---|---|
| Add or remove at either end | O(1) | one slot written, one index moved |
| Growing the array | amortised O(1) | doubling, so n adds copy 2n slots in total |
| \`contains\`, \`remove(Object)\` | O(n) | it walks the whole thing |
| Random access by position | not offered | \`Deque\` has no \`get(i)\`; use an \`ArrayList\` |
| Sliding window maximum | O(n) time, O(k) space | each index added once and removed once |
| 0-1 BFS | O(V + E) | each edge relaxes at most once per improvement |

The O(n) for the sliding window is the same amortised argument as the monotonic
stack: the inner \`while\` can run many times on one step, but the total number of
removals over the whole run is bounded by the number of additions, and there are
exactly n of those. Space is O(k), not O(n) — the deque never holds more than
one window's worth.

## The mistakes, in the order people make them

1. **Storing values instead of indices.** Then you cannot tell whether the front
   has left the window, and the expiry check is unwritable.
2. **A \`while\` for the expiry check.** One index leaves per step, so it is an
   \`if\`. A \`while\` there is harmless but signals you have not thought about it;
   the reverse mistake — an \`if\` for the back — is a real bug.
3. **Checking expiry after pushing.** Push first and the new index can be at the
   front of a one-element deque, where the expiry test then looks at the wrong
   thing. Expire, then drop the useless, then push.
4. **Recording an answer before the window is full.** Guard with \`i >= k - 1\`,
   and write the answer at \`i - k + 1\`.
5. **Using \`LinkedList\`.** It compiles and it is slower for every operation this
   topic performs.
6. **Adding \`null\`.** \`ArrayDeque\` throws immediately. Usually it means a
   \`poll\` from an empty deque was passed straight along.
7. **Mixing \`push\` with \`offer\`.** They add to opposite ends. In a deque
   solution use \`addFirst\`/\`addLast\` and say which end you mean.
8. **\`(head - 1) % n\` in a circular buffer.** Negative. Add \`n\` first.
9. **Marking nodes seen in 0-1 BFS.** A node can be reached again with a smaller
   distance. Compare distances instead of keeping a \`seen\` set.

## The Java you will reach for

| You want | Write |
|---|---|
| A deque | \`Deque<Integer> dq = new ArrayDeque<>()\` |
| With a starting capacity | \`new ArrayDeque<>(1024)\` — rounded up to a power of two |
| Add at the front / back | \`dq.addFirst(x)\` / \`dq.addLast(x)\` |
| Remove the front / back | \`dq.pollFirst()\` / \`dq.pollLast()\` — \`null\` if empty |
| Look at the front / back | \`dq.peekFirst()\` / \`dq.peekLast()\` |
| As a stack | \`push\` = \`addFirst\`, \`pop\` = \`removeFirst\` |
| As a queue | \`offer\` = \`offerLast\`, \`poll\` = \`pollFirst\` |
| How many | \`dq.size()\`, \`dq.isEmpty()\` |
| Front to back | \`for (int x : dq)\` |
| Back to front | \`dq.descendingIterator()\` |
| Deque of pairs | \`Deque<int[]> dq\` with \`new int[] { i, value }\` |
| A copy as an array | \`dq.toArray(new Integer[0])\` |

Iterating an \`ArrayDeque\` goes front to back, which for a stack means top to
bottom — the sensible order, and the one \`java.util.Stack\` gets backwards.

## Working one from the sheet

[Jump Game VI](problem:jump-game-vi). You start at index 0 and each jump moves
you forward between 1 and k places. Landing on index \`i\` scores \`a[i]\`. Maximise
the total when you reach the last index.

The recurrence is short: \`best[i] = a[i] + max(best[i - k] .. best[i - 1])\`. The
direct version is O(nk), which is too slow at the usual limits. But that \`max\`
is the maximum of a sliding window of size k over an array you are building as
you go — the same question as before, so the same deque answers it.

The deque holds indices with **decreasing \`best\` values**. The front is the best
reachable predecessor; drop it when it drifts more than k behind.

\`\`\`text
a = [1, -1, -2, 4, -7, 3], k = 2
the deque holds indices; the best values under them are decreasing

     best[0] = 1                                  deque: [0]      best 1
i=1  front 0 is still reachable (0 >= 1-2)
     best[1] = -1 + best[0] = 0
     back: best[0]=1 > 0, nothing drops            deque: [0,1]    best 1, 0
i=2  front 0 is still reachable (0 >= 2-2)
     best[2] = -2 + best[0] = -1
     back: best[1]=0 > -1, nothing drops           deque: [0,1,2]  best 1, 0, -1
i=3  front 0 is out of range now (0 < 3-2), drop it
     best[3] = 4 + best[1] = 4
     back: -1 and 0 are both <= 4, both drop       deque: [3]      best 4
i=4  best[4] = -7 + best[3] = -3                   deque: [3,4]    best 4, -3
i=5  best[5] = 3 + best[3] = 7
     back: -3 and 4 are both <= 7, both drop       deque: [5]

answer best[5] = 7
\`\`\`

\`\`\`java JumpSix.java @run-deque-jump-six
import java.util.ArrayDeque;
import java.util.Deque;

public class JumpSix {

    static int maxResult(int[] a, int k) {
        int n = a.length;
        long[] best = new long[n];               // long, in case the sums grow
        Deque<Integer> dq = new ArrayDeque<>();  // indices, best values decreasing

        best[0] = a[0];
        dq.addLast(0);

        for (int i = 1; i < n; i++) {
            if (dq.peekFirst() < i - k) dq.pollFirst();          // out of jumping range
            best[i] = a[i] + best[dq.peekFirst()];               // the front is the best one
            while (!dq.isEmpty() && best[dq.peekLast()] <= best[i]) dq.pollLast();
            dq.addLast(i);
        }
        return (int) best[n - 1];
    }

    public static void main(String[] args) {
        System.out.println(maxResult(new int[] { 1, -1, -2, 4, -7, 3 }, 2));         // 7
        System.out.println(maxResult(new int[] { 10, -5, -2, 4, 0, 3 }, 3));         // 17
        System.out.println(maxResult(new int[] { 1, -5, -20, 4, -1, 3, -6, -3 }, 2));// 0
        System.out.println(maxResult(new int[] { 5 }, 1));                           // 5
        System.out.println(maxResult(new int[] { 1, 2, 3, 4 }, 4));                  // 10
    }
}
\`\`\`

\`\`\`output @run-deque-jump-six
7
17
0
5
10
\`\`\`

Note the order inside the loop: expire, then read the answer, then push. Reading
before expiring would use an index you can no longer jump from, which is the bug
that makes this problem look correct on the small cases and wrong on the large
ones. And the deque can never be empty at the read — index \`i - 1\` is always
within range and was pushed on the previous iteration.

## How to work through the topic

1. [Moving Average from Data Stream](problem:moving-average-from-data-stream),
   [Number of Recent Calls](problem:number-of-recent-calls). Use the structure
   as a plain queue first. Add at the back, expire from the front.
2. [Design Circular Queue](problem:design-circular-queue),
   [Design Circular Deque](problem:design-circular-deque),
   [Design Front Middle Back Queue](problem:design-front-middle-back-queue).
   Build it. \`head\` plus \`size\`, and \`+ n\` before every \`%\`.
3. [Design a Stack With Increment Operation](problem:design-a-stack-with-increment-operation),
   [Reveal Cards In Increasing Order](problem:reveal-cards-in-increasing-order),
   [Dota2 Senate](problem:dota2-senate). Both ends used for their own sake —
   the card problem is solved by running the described process backwards.
4. [Sliding Window Maximum](problem:sliding-window-maximum). The one to
   understand rather than memorise. Write the four lines, then explain out loud
   why the back drop is a \`while\` and the front drop is an \`if\`.
5. [Longest Continuous Subarray With Absolute Diff Less Than or Equal to Limit](problem:longest-continuous-subarray-with-absolute-diff-less-than-or-equal-to-limit),
   [Maximum Number of Robots Within Budget](problem:maximum-number-of-robots-within-budget).
   Two deques over one window, combined with a shrinking
   [sliding window](#/dsa/sliding-window/notes).
6. [Jump Game VI](problem:jump-game-vi),
   [Constrained Subsequence Sum](problem:constrained-subsequence-sum). The deque
   as the \`max\` inside a dynamic-programming recurrence. Same loop, and the
   array it slides over is the one you are still filling in.
7. [Shortest Subarray with Sum at Least K](problem:shortest-subarray-with-sum-at-least-k),
   [Sliding Window Median](problem:sliding-window-median),
   [Odd Even Jump](problem:odd-even-jump). The hard band. The first needs
   prefix sums with a monotonic deque and negative numbers are the whole
   difficulty; the last two are here to show where a deque stops being enough
   and an ordered structure takes over.
`;export{e as default};