var e=`Sorting an array tells you everything about the order of everything. Most of the
time you do not want that. You want one fact — the smallest thing here — and you
want it again after something is removed and three more things are added. Paying
O(n log n) to sort ten million numbers so you can read the top three off the end
is the waste this topic exists to remove.

A heap answers "what is the smallest thing here" in O(1), and keeps answering it
as things come and go, at O(log n) per arrival and per departure. It does not
know anything else. It cannot tell you the second smallest without removing the
first, it cannot tell you whether a value is present without a linear scan, and
iterating it gives you no useful order at all. That narrowness is the price, and
for top-k, for a k-way merge and for a running median it is a price worth paying.

In Java the heap is \`PriorityQueue\`. It is a \`Queue\`, which is a confusing name
for it — the thing that comes out is not the thing that went in first, but the
smallest thing currently in.

## What a heap actually is

A heap is a **complete binary tree** — every level full except possibly the
last, and the last filled from the left — with one rule about values:

> Every node is smaller than or equal to both of its children.

That is the whole invariant, and notice what it does *not* say. It says nothing
about left versus right, and nothing about two nodes on the same level. It only
constrains a node against its own children. Follow the rule from the root
downwards and the smallest value in the whole tree has to be at the root, which
is the one fact a heap sells.

Because the tree is complete, it needs no pointers. Number the nodes left to
right, level by level, starting at 0, and store them in an array at those
numbers:

\`\`\`text
array   [2, 3, 5, 7, 4, 9, 6]
index    0  1  2  3  4  5  6

                  2               <- index 0, the smallest
               /     \\
             3         5          <- 1, 2
           /   \\     /   \\
         7      4   9      6      <- 3, 4, 5, 6

parent(i) = (i - 1) / 2           parent(4) = 3 / 2 = 1
left(i)   = 2 * i + 1             left(1)   = 3
right(i)  = 2 * i + 2             right(1)  = 4
\`\`\`

Check one: index 4 holds 4, its parent by the formula is index 1 which holds 3,
and 3 ≤ 4, so the rule holds there. Check the rest and you will find it holds
everywhere. Note that 3 sits at index 1 and 5 at index 2 — the array is not
sorted, and it never will be. Sorted is more than a heap needs.

![A complete binary tree stored in an array, with the index arithmetic](diagrams/heaps-notes-array-layout.jpg)

Two consequences of the array layout worth stating out loud. There is no
per-node overhead, so a heap of a million ints is a million ints and not a
million objects. And the children of node \`i\` sit far away from it in memory,
which is why a heap is slower per operation than the O(log n) suggests once \`n\`
is large — but it is still O(log n).

## Sift up: how something gets in

To insert, put the new value in the first free slot — the end of the array,
which keeps the tree complete — and then walk it upwards while it is smaller
than its parent. Each step swaps it with its parent.

![A new value walking up its root-to-leaf path, one parent at a time](diagrams/heaps-notes-sift-up.svg)

\`\`\`text
offer(1) into [2, 3, 5, 7, 4, 9, 6]

put at the end        [2, 3, 5, 7, 4, 9, 6, 1]      i = 7
parent(7) = 3 -> 7    1 < 7, swap
                      [2, 3, 5, 1, 4, 9, 6, 7]      i = 3
parent(3) = 1 -> 3    1 < 3, swap
                      [2, 1, 5, 3, 4, 9, 6, 7]      i = 1
parent(1) = 0 -> 2    1 < 2, swap
                      [1, 2, 5, 3, 4, 9, 6, 7]      i = 0, at the root, stop
\`\`\`

The value only ever moves along one root-to-leaf path, so the work is at most
the height of the tree, which for a complete tree of \`n\` nodes is ⌊log₂ n⌋. That
is the O(log n).

## Sift down: how something gets out

The answer to \`poll\` is \`a[0]\`. Removing it leaves a hole at the root, and the
only element you are allowed to move without breaking completeness is the last
one. So put the last element into the root, shrink the array by one, and walk it
downwards — each step swapping it with its **smaller** child, until both
children are at least as large as it is.

\`\`\`text
poll() from [1, 2, 5, 3, 4, 9, 6, 7]      answer is 1

last element 7 into the root, size 8 -> 7
                      [7, 2, 5, 3, 4, 9, 6]      i = 0
children 2 and 5, smaller is 2 at index 1
                      7 > 2, swap
                      [2, 7, 5, 3, 4, 9, 6]      i = 1
children 3 and 4, smaller is 3 at index 3
                      7 > 3, swap
                      [2, 3, 5, 7, 4, 9, 6]      i = 3
left(3) = 7, past the end — no children, stop
\`\`\`

Which is exactly the heap you started with before the insert. Two things about
sift-down that are the usual bugs: you must compare against the **smaller** of
the two children, not the left one, and you must check that each child index is
still inside the heap before you read it.

## Why building a heap is O(n) and not O(n log n)

You can build a heap out of an existing array by offering the elements one at a
time — n inserts, each O(log n), so O(n log n). There is a better way, and its
cost is the one surprising number in this topic.

Sift *down* every node that has a child, working from the last such node
backwards to the root:

\`\`\`java
for (int i = a.length / 2 - 1; i >= 0; i--) siftDown(a, a.length, i);
\`\`\`

Nodes from index \`a.length / 2\` onwards are leaves, and a leaf is already a
legal heap of one. Starting one before that and going backwards means that when
you sift \`i\` down, both of its subtrees are already heaps, so one sift-down
fixes it.

The cost looks like n sift-downs of O(log n) each. It is not, because almost all
of the nodes are near the bottom, where a sift-down has almost nowhere to go.

| Height above the leaves | Nodes at that height | Sift-down cost each | Total |
|---|---|---|---|
| 0 | n/2 | 0 | 0 |
| 1 | n/4 | 1 | n/4 |
| 2 | n/8 | 2 | 2n/8 |
| 3 | n/16 | 3 | 3n/16 |
| h | n/2^(h+1) | h | h·n/2^(h+1) |

Add the column up: n × (1/4 + 2/8 + 3/16 + …). That series converges to 1, so
the total is at most n. Half the nodes cost nothing, and the expensive nodes are
too rare to matter.

Contrast it with building by insertion, where the same argument runs the other
way: half the elements are inserted into a heap that is already nearly full, so
half of them pay the full log n. Bottom-up build is O(n); insertion build is
O(n log n). Java gives you the O(n) one for free — \`new PriorityQueue<>(list)\`
heapifies.

## Building one by hand

Nothing in a heap is hidden, and writing it once is the fastest way to stop
being suspicious of it.

\`\`\`java Heap.java @run-heaps-heap
import java.util.Arrays;

/** A min-heap held in a plain int array. */
public class Heap {

    private int[] a = new int[8];
    private int n = 0;

    private static int parent(int i) { return (i - 1) / 2; }
    private static int left(int i)   { return 2 * i + 1; }
    private static int right(int i)  { return 2 * i + 2; }

    private static void swap(int[] a, int i, int j) {
        int t = a[i];
        a[i] = a[j];
        a[j] = t;
    }

    /** Put x at the end, then walk it up while it is smaller than its parent. */
    void offer(int x) {
        if (n == a.length) a = Arrays.copyOf(a, n * 2);
        a[n++] = x;
        int i = n - 1;
        while (i > 0 && a[i] < a[parent(i)]) {
            swap(a, i, parent(i));
            i = parent(i);
        }
    }

    /** Take the root, move the last element into it, then walk that down. */
    int poll() {
        int top = a[0];
        a[0] = a[--n];
        siftDown(a, n, 0);
        return top;
    }

    /** Push a[i] down past the smaller child until both children are larger. */
    static void siftDown(int[] a, int n, int i) {
        while (left(i) < n) {
            int child = left(i);
            if (right(i) < n && a[right(i)] < a[child]) child = right(i);
            if (a[i] <= a[child]) break;
            swap(a, i, child);
            i = child;
        }
    }

    /** Bottom-up build. O(n), because most nodes are leaves. */
    static void heapify(int[] a) {
        for (int i = a.length / 2 - 1; i >= 0; i--) siftDown(a, a.length, i);
    }

    public static void main(String[] args) {
        Heap h = new Heap();
        for (int x : new int[] { 5, 3, 9, 2, 7, 6, 4 }) {
            h.offer(x);
            System.out.println("offer " + x + "  " + Arrays.toString(Arrays.copyOf(h.a, h.n)));
        }

        StringBuilder drained = new StringBuilder();
        while (h.n > 0) drained.append(h.poll()).append(' ');
        System.out.println("drained   " + drained.toString().trim());

        int[] raw = { 5, 3, 9, 2, 7, 6, 4, 1, 8 };
        Heap.heapify(raw);
        System.out.println("heapified " + Arrays.toString(raw) + "  root " + raw[0]);
    }
}
\`\`\`

\`\`\`output @run-heaps-heap
offer 5  [5]
offer 3  [3, 5]
offer 9  [3, 5, 9]
offer 2  [2, 3, 9, 5]
offer 7  [2, 3, 9, 5, 7]
offer 6  [2, 3, 6, 5, 7, 9]
offer 4  [2, 3, 4, 5, 7, 9, 6]
drained   2 3 4 5 6 7 9
heapified [1, 2, 4, 3, 7, 6, 9, 5, 8]  root 1
\`\`\`

Draining a heap by polling until it is empty gives you sorted order, and that is
heapsort: O(n) to build, then n polls at O(log n) each. It is O(n log n) with
O(1) extra space, and it is still slower in practice than the merge sort in
\`Arrays.sort\` — see [sorting](#/dsa/sorting/notes) for why.

## PriorityQueue, in full

You will not write the class above in an interview. You will write this, and
every line of it has something in it that catches people.

\`\`\`java
PriorityQueue<Integer> pq = new PriorityQueue<>();                       // MIN-heap
PriorityQueue<Integer> max = new PriorityQueue<>(Comparator.reverseOrder());
\`\`\`

- **It is a min-heap by default.** \`poll\` gives you the smallest. Every other
  language's \`heapq\` agrees, and every third person still expects the largest.
- **\`Comparator.reverseOrder()\` makes it a max-heap.** That is the whole trick.
  \`(x, y) -> y - x\` also works for small ints and overflows for large ones, so
  do not write it — use \`Comparator.reverseOrder()\` or \`Integer.compare(y, x)\`.
- **\`peek\` is O(1)**, and returns \`null\` on an empty heap rather than throwing.
  Assigning that to an \`int\` unboxes \`null\` and gives you a
  \`NullPointerException\` several lines from the actual mistake.
- **\`offer\` and \`poll\` are O(log n).** \`add\` is \`offer\` under a different name.
- **Iterating it does not give sorted order.** \`for (int x : pq)\`,
  \`pq.toString()\` and \`pq.stream()\` all walk the backing array in index order,
  which is heap order — root first, then whatever. The only way to get sorted
  order out is to poll until it is empty, which empties it.
- **\`remove(Object)\` is O(n)**, and so is \`contains\`. There is no index, so
  removing a specific value means scanning for it and then repairing the heap. A
  loop that calls \`remove(x)\` n times is quadratic.
- **\`new PriorityQueue<>(collection)\` heapifies in O(n)**, so if you have the
  data already, hand it to the constructor rather than offering in a loop.
- **No nulls, and no natural order for arrays.** \`PriorityQueue<int[]>\` with no
  comparator throws \`ClassCastException\` on the *second* offer, because the
  first one never has to compare anything.
- **It is not stable.** Two elements the comparator calls equal come out in an
  unspecified order. If the problem cares, put the tiebreak in the comparator.

\`\`\`java TopK.java @run-heaps-top-k
import java.util.Arrays;
import java.util.Comparator;
import java.util.PriorityQueue;

public class TopK {

    /** The k largest values. A MIN-heap, holding at most k. */
    static int[] kLargest(int[] a, int k) {
        PriorityQueue<Integer> keep = new PriorityQueue<>();
        for (int x : a) {
            keep.offer(x);
            if (keep.size() > k) keep.poll();      // drop the smallest survivor
        }
        int[] out = new int[keep.size()];
        for (int i = 0; i < out.length; i++) out[i] = keep.poll();
        return out;                                 // ascending
    }

    /** The k smallest values. Same shape, opposite heap. */
    static int[] kSmallest(int[] a, int k) {
        PriorityQueue<Integer> keep = new PriorityQueue<>(Comparator.reverseOrder());
        for (int x : a) {
            keep.offer(x);
            if (keep.size() > k) keep.poll();      // drop the largest survivor
        }
        int[] out = new int[keep.size()];
        for (int i = out.length - 1; i >= 0; i--) out[i] = keep.poll();
        return out;
    }

    public static void main(String[] args) {
        int[] a = { 5, 3, 9, 2, 7, 6, 4, 1, 8 };
        System.out.println("3 largest   " + Arrays.toString(kLargest(a, 3)));
        System.out.println("3 smallest  " + Arrays.toString(kSmallest(a, 3)));
        System.out.println("k above n   " + Arrays.toString(kLargest(a, 20)));

        PriorityQueue<Integer> pq = new PriorityQueue<>();
        for (int x : new int[] { 5, 3, 9, 2, 7 }) pq.offer(x);
        System.out.println("peek        " + pq.peek());
        System.out.println("iterated    " + pq);          // heap order, not sorted
        StringBuilder polled = new StringBuilder();
        while (!pq.isEmpty()) polled.append(pq.poll()).append(' ');
        System.out.println("polled      " + polled.toString().trim());
    }
}
\`\`\`

\`\`\`output @run-heaps-top-k
3 largest   [7, 8, 9]
3 smallest  [1, 2, 3]
k above n   [1, 2, 3, 4, 5, 6, 7, 8, 9]
peek        2
iterated    [2, 3, 9, 5, 7]
polled      2 3 5 7 9
\`\`\`

Look at the \`iterated\` line against the \`polled\` line in the recorded output.
They are not the same sequence, and believing they would be is the single most
common heap bug in submitted code.

## Top k with a heap of size k

This is the pattern card's shape, and the direction of the heap is the part
everybody gets backwards the first time.

\`\`\`java
PriorityQueue<Integer> pq = new PriorityQueue<>();   // min-heap
for (int x : a) {
    pq.offer(x);
    if (pq.size() > k) pq.poll();    // keep only the k largest
}
\`\`\`

**To keep the k largest, use a min-heap.** Say why to yourself before moving on,
because "largest, so max-heap" is what the hand types.

![Keeping the k largest needs a min-heap, not a max-heap](diagrams/heaps-notes-heap-direction.jpg)

You are holding k candidates. When a new value arrives you have k + 1 and must
throw one away, and the one to throw is the *worst* of them — the smallest. So
the operation you need to be cheap is "give me the smallest of the k I am
holding". That is a min-heap. The max-heap would give you instant access to the
best of your candidates, which is the one thing you never need to touch.

The root of that min-heap is also the answer to "the k-th largest", which is why
[Kth Largest Element in a Stream](problem:kth-largest-element-in-a-stream) is
this pattern with the answer read off \`peek\` rather than drained at the end.

Everything follows by symmetry. The k smallest need a max-heap so you can
discard the largest. The k closest points need a max-heap on distance so you can
discard the furthest — [K Closest Points to Origin](problem:k-closest-points-to-origin).
The k most frequent need a min-heap on count —
[Top K Frequent Elements](problem:top-k-frequent-elements).

## Merging k sorted lists

Given k already-sorted lists, produce one sorted list. Concatenating and sorting
is O(N log N) where N is the total. The heap does it in O(N log k), and more
importantly it does it without ever holding more than k elements at once, which
is what makes it work on streams that do not fit in memory.

The insight is that the next value overall is always the front of one of the k
lists. So keep exactly one element per list in the heap — the front — and every
time you take one out, put its successor in.

\`\`\`java
// each entry is { value, which list it came from, how far into that list }
PriorityQueue<int[]> pq = new PriorityQueue<>((x, y) -> Integer.compare(x[0], y[0]));
for (int i = 0; i < lists.length; i++)
    if (lists[i].length > 0) pq.offer(new int[] { lists[i][0], i, 0 });

while (!pq.isEmpty()) {
    int[] top = pq.poll();
    out[w++] = top[0];
    int list = top[1], next = top[2] + 1;
    if (next < lists[list].length) pq.offer(new int[] { lists[list][next], list, next });
}
\`\`\`

The heap never exceeds k entries, so each of the N polls and N offers is
O(log k). [Merge k Sorted Lists](problem:merge-k-sorted-lists) is this with
\`ListNode\` in place of the index pair, and
[Smallest Range Covering Elements from K Lists](problem:smallest-range-covering-elements-from-k-lists)
is the same sweep with the maximum tracked alongside.

Note the comparator: \`Integer.compare(x[0], y[0])\`, never \`x[0] - y[0]\`. On
values near \`Integer.MAX_VALUE\` the subtraction overflows and the comparator
starts claiming a large number is smaller than a small one, at which point the
heap invariant is nonsense and the failure is silent.

## The two-heap median

The running median is the problem that shows what a heap is for. You are given
numbers one at a time and asked for the median after each. Re-sorting is
O(n log n) per query. Inserting into a sorted array is O(n) per query because of
the shifting.

Split the values into two halves and keep each half in a heap facing the middle:

\`\`\`text
        low                              high
   a MAX-heap of the                a MIN-heap of the
   smaller half                     larger half

        [1, 3, 5]                        [7, 8, 15]
             ^                            ^
        root = 5                     root = 7
        the largest of the           the smallest of the
        small half                   large half

   the median sits between those two roots, and both are O(1) to read
\`\`\`

Keep the sizes differing by at most one. If they are equal, the median is the
average of the two roots. If \`low\` has one more, the median is \`low\`'s root.

The rebalance is easier to get right than it looks if you always push through
the same side:

\`\`\`java
low.offer(x);              // in through low, whatever x is
high.offer(low.poll());    // low's largest moves across — this fixes the split
if (high.size() > low.size()) low.offer(high.poll());   // fix the sizes
\`\`\`

Three lines, no conditionals about where \`x\` belongs. The second line guarantees
that every element of \`low\` is at most every element of \`high\`, because the only
element that could have violated it has just been moved. The third line
guarantees \`low.size()\` is either equal to \`high.size()\` or one greater.

\`\`\`java Median.java @run-heaps-median
import java.util.Comparator;
import java.util.PriorityQueue;

public class Median {

    /** The smaller half. Max-heap, so its root is the largest of that half. */
    private final PriorityQueue<Integer> low = new PriorityQueue<>(Comparator.reverseOrder());
    /** The larger half. Min-heap, so its root is the smallest of that half. */
    private final PriorityQueue<Integer> high = new PriorityQueue<>();

    void add(int x) {
        low.offer(x);
        high.offer(low.poll());
        if (high.size() > low.size()) low.offer(high.poll());
    }

    double median() {
        if (low.size() > high.size()) return low.peek();
        return (low.peek() + high.peek()) / 2.0;
    }

    public static void main(String[] args) {
        Median m = new Median();
        for (int x : new int[] { 5, 15, 1, 3, 8, 7, 9, 2 }) {
            m.add(x);
            System.out.println("add " + x
                    + "   low=" + m.low.size() + " high=" + m.high.size()
                    + "   median=" + m.median());
        }
    }
}
\`\`\`

\`\`\`output @run-heaps-median
add 5   low=1 high=0   median=5.0
add 15   low=1 high=1   median=10.0
add 1   low=2 high=1   median=5.0
add 3   low=2 high=2   median=4.0
add 8   low=3 high=2   median=5.0
add 7   low=3 high=3   median=6.0
add 9   low=4 high=3   median=7.0
add 2   low=4 high=4   median=6.0
\`\`\`

Each \`add\` is three heap operations, so O(log n), and \`median\` is O(1). That is
[Find Median from Data Stream](problem:find-median-from-data-stream) solved.
[Sliding Window Median](problem:sliding-window-median) is the same two heaps
plus removals, and removals are where it turns hard — \`remove(Object)\` is O(n),
so the accepted answer either uses lazy deletion with a "how many of these are
stale" map, or swaps the heaps for a \`TreeMap\`, which is
[BST and ordered set](#/dsa/bst-ordered-set/notes) territory.

## Heap against sort, and heap against quickselect

Three ways to answer "the k largest of n", and the right one depends on facts
about the input rather than on taste.

| | Sort, then take k | Heap of size k | Quickselect |
|---|---|---|---|
| Time | O(n log n) | O(n log k) | O(n) average, O(n²) worst |
| Extra space | O(n) for the sort | O(k) | O(1) |
| Modifies the input | yes | no | yes |
| Needs all of n at once | yes | no | yes |
| Gives the k in order | yes, free | O(k log k) more | no, needs a sort of k |
| Gives all n in order | yes | no | no |

Read it this way:

- **k is close to n**, or you also want the rest sorted: just sort. \`O(n log k)\`
  is not better than \`O(n log n)\` when \`k = n\`, and the sort has a much smaller
  constant.
- **k is small and n is huge**: the heap. \`log k\` for k = 10 is about 3, against
  \`log n\` for a billion which is about 30.
- **The data arrives one at a time, or does not fit in memory**: the heap, and
  nothing else on the table. This is the case that makes the pattern worth
  learning — quickselect and sorting both need the whole array in hand.
- **One offline query, whole array available, and you may reorder it**:
  quickselect is O(n) expected and beats both.
  [Kth Largest Element in an Array](problem:kth-largest-element-in-an-array) is
  the problem where all three answers are accepted and the interviewer is
  waiting to hear you name the trade-off.

## What it costs

| Operation | Cost | Why |
|---|---|---|
| \`peek\` | O(1) | the answer is \`a[0]\` |
| \`offer\` | O(log n) | one sift-up, at most the height |
| \`poll\` | O(log n) | one sift-down, at most the height |
| Build by offering n times | O(n log n) | n sift-ups |
| Build by heapify | O(n) | most nodes are leaves and cost nothing |
| \`contains\`, \`remove(Object)\` | O(n) | a heap has no index — it is not searchable |
| Heapsort: build then drain | O(n log n) | O(n) + n × O(log n) |
| Space | O(n) | one array, no per-node objects |
| Top k over n, heap capped at k | O(n log k) | n operations on a heap of size k |

The heap's height is ⌊log₂ n⌋ exactly, because the tree is complete — it cannot
degenerate the way an unbalanced [binary search tree](#/dsa/bst-ordered-set/notes)
can. That guarantee is free and comes from the shape rule alone.

## The mistakes, in the order people make them

1. **Max-heap for the k largest.** You need cheap access to the worst survivor,
   and the worst of the k largest is the smallest. Min-heap. This is the one.
2. **Iterating the heap and expecting sorted order.** \`pq.toString()\`,
   \`for (int x : pq)\` and \`pq.stream()\` all give heap order. Only repeated
   \`poll\` is sorted, and it destroys the heap.
3. **\`(x, y) -> x[0] - y[0]\` as a comparator.** It overflows on large values and
   silently inverts. \`Integer.compare(x[0], y[0])\`, always.
4. **\`PriorityQueue<int[]>\` with no comparator.** Arrays are not \`Comparable\`.
   It survives the first \`offer\` and throws \`ClassCastException\` on the second.
5. **\`remove(Object)\` inside a loop.** O(n) each, so the whole thing is O(n²).
   Use lazy deletion: leave the stale entry in and skip it when it surfaces.
6. **Mutating an element after it is in the heap.** Its position was fixed by
   comparisons made at insert time. The heap will not notice and will not
   re-sort. Remove it, change it, offer it back.
7. **Unboxing \`peek()\` or \`poll()\` on an empty heap.** Both return \`null\`, and
   \`int x = pq.poll()\` turns that into a \`NullPointerException\`. Check
   \`isEmpty()\` first.
8. **Offering n elements one at a time when you already have the array.**
   \`new PriorityQueue<>(list)\` is O(n); the loop is O(n log n).
9. **Forgetting the tiebreak.** Equal-priority elements come out in an
   unspecified order. If the problem says "smallest index wins", put that in the
   comparator — do not hope.

## The Java you will reach for

| You want | Write |
|---|---|
| Min-heap | \`new PriorityQueue<>()\` |
| Max-heap | \`new PriorityQueue<>(Comparator.reverseOrder())\` |
| Heap of pairs, by column 0 | \`new PriorityQueue<int[]>((x, y) -> Integer.compare(x[0], y[0]))\` |
| Heap by a field | \`new PriorityQueue<>(Comparator.comparingInt(Task::cost))\` |
| That, reversed | \`Comparator.comparingInt(Task::cost).reversed()\` |
| Two keys, second as tiebreak | \`Comparator.comparingInt(A::a).thenComparingInt(A::b)\` |
| Build from a collection, O(n) | \`new PriorityQueue<>(list)\` |
| Smallest without removing | \`pq.peek()\` — \`null\` if empty |
| Smallest, removing | \`pq.poll()\` — \`null\` if empty |
| Same, but throw if empty | \`pq.element()\` / \`pq.remove()\` |
| Size, emptiness | \`pq.size()\`, \`pq.isEmpty()\` |
| Remove one specific value | \`pq.remove(x)\` — O(n), avoid in a loop |
| Everything in sorted order | poll until empty; iteration is not sorted |
| Counting before a top-k | \`map.merge(key, 1, Integer::sum)\` |

\`Comparator.comparingInt\` takes a function from the element to an \`int\` and
builds the comparator for you, which is shorter and safer than a lambda that
subtracts. \`thenComparingInt\` chains a second key used only when the first ties.

## Working one from the sheet

[Task Scheduler](problem:task-scheduler): given task letters and a cooldown \`k\`,
the same task cannot run twice within \`k\` slots. Find the shortest schedule.

The greedy insight is that at every tick you should run whichever available task
has the most remaining copies, because the task with the most copies is the one
that will otherwise be left stranded at the end with nothing to interleave it
with. "Whichever available task has the most remaining" is a max-heap on count.
Tasks in cooldown are not available, so they wait in a queue with the time they
become free.

\`\`\`java Scheduler.java @run-heaps-scheduler
import java.util.ArrayDeque;
import java.util.Comparator;
import java.util.PriorityQueue;
import java.util.Queue;

public class Scheduler {

    static int leastInterval(char[] tasks, int k) {
        int[] count = new int[26];
        for (char c : tasks) count[c - 'A']++;

        PriorityQueue<Integer> ready = new PriorityQueue<>(Comparator.reverseOrder());
        for (int c : count) if (c > 0) ready.offer(c);

        // each entry is { copies still to run, the tick it becomes available }
        Queue<int[]> cooling = new ArrayDeque<>();

        int time = 0;
        while (!ready.isEmpty() || !cooling.isEmpty()) {
            time++;
            if (!ready.isEmpty()) {
                int left = ready.poll() - 1;
                if (left > 0) cooling.offer(new int[] { left, time + k });
            }
            if (!cooling.isEmpty() && cooling.peek()[1] == time)
                ready.offer(cooling.poll()[0]);
        }
        return time;
    }

    public static void main(String[] args) {
        System.out.println(leastInterval(new char[] { 'A', 'A', 'A', 'B', 'B', 'B' }, 2));
        System.out.println(leastInterval(new char[] { 'A', 'A', 'A', 'B', 'B', 'B' }, 0));
        System.out.println(leastInterval(new char[] { 'A', 'A', 'A', 'A', 'B', 'C', 'D', 'E' }, 2));
        System.out.println(leastInterval(new char[] { 'A' }, 5));
    }
}
\`\`\`

\`\`\`output @run-heaps-scheduler
8
6
10
1
\`\`\`

The cooldown queue is a plain FIFO and not a second heap, and that is worth a
second: tasks enter it in increasing order of ready-time, so the front is always
the earliest, and a [queue](#/dsa/queues/notes) is enough. Reaching for a heap
where the data is already ordered is a habit worth breaking.

When \`ready\` is empty but \`cooling\` is not, the loop still ticks the clock. Those
ticks are the idle slots, and counting them is the entire point of the problem.

## How to work through the topic

1. [Last Stone Weight](problem:last-stone-weight) and
   [Third Maximum Number](problem:third-maximum-number). The smallest possible
   uses: poll two, push one back; and a size-3 heap that is really just three
   variables. Do these to get the API into your fingers.
2. [Kth Largest Element in a Stream](problem:kth-largest-element-in-a-stream),
   [K Closest Points to Origin](problem:k-closest-points-to-origin),
   [Relative Ranks](problem:relative-ranks). The size-k heap, three times, in
   both directions. After the second one you should be able to say out loud why
   the heap faces the way it does before writing anything.
3. [Top K Frequent Elements](problem:top-k-frequent-elements) and
   [Sort Array by Increasing Frequency](problem:sort-array-by-increasing-frequency).
   Count into a map first, then heap the entries. The skill here is deciding
   what the heap holds — the key, or the pair.
4. [Minimum Cost to Connect Sticks](problem:minimum-cost-to-connect-sticks) and
   [Task Scheduler](problem:task-scheduler). Greedy choices where "the best
   available right now" changes after every step, which is the case a heap
   exists for. [Reorganize String](problem:reorganize-string) is the same idea
   with a one-step memory.
5. [Merge k Sorted Lists](problem:merge-k-sorted-lists). The k-way merge. Then
   [Furthest Building You Can Reach](problem:furthest-building-you-can-reach),
   which is the sneakiest use on the sheet — the heap holds decisions you have
   already made so you can take the worst one back.
6. [Find Median from Data Stream](problem:find-median-from-data-stream), then
   [Sliding Window Median](problem:sliding-window-median). Two heaps, then two
   heaps with deletion, which is a genuine step up.
7. [Minimum Cost to Hire K Workers](problem:minimum-cost-to-hire-k-workers) and
   [Single-Threaded CPU](problem:single-threaded-cpu). Sort by one key, heap on
   another. Combining the two is what most hard problems in this area are, and
   [sorting](#/dsa/sorting/notes) is the other half of the answer.
`;export{e as default};