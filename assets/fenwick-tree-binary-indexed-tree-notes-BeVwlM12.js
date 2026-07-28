var e=`You have an array of a hundred thousand numbers and a hundred thousand
operations. Half ask "what is the sum of positions 30 to 70?" and half say "add
5 to position 42". You already know two structures, and each of them is bad at
one of those.

Keep the plain array and an update is one assignment — O(1) — but a range sum
means walking the range, O(n). Keep a [prefix sum](#/dsa/prefix-sum/notes) array
instead and the range sum is one subtraction — O(1) — but a single update
invalidates every prefix after it, so you rebuild, O(n). Either way one of the
two is linear, and a hundred thousand linear operations is ten billion steps.

A Fenwick tree — a binary indexed tree, the two names are the same thing — makes
both O(log n), which for n = 100 000 is seventeen steps instead of a hundred
thousand. It is about ten lines of code, and every one of them does something
with \`i & -i\`.

## The two structures you are trading against

![Seventeen steps against a hundred thousand, at n = 100000](diagrams/fenwick-tree-binary-indexed-tree-notes-the-trade.jpg)

\`\`\`text
                      update a[i]      sum of a[l..r]
plain array            O(1)             O(n)
prefix sum array       O(n)             O(1)
Fenwick tree           O(log n)         O(log n)
\`\`\`

Nothing here is free. If the array never changes, build a prefix sum and stop —
it is shorter, and O(1) beats O(log n). The tree earns its keep exactly when the
updates and the queries are interleaved.

## What you need first: the low bit

Everything rests on \`i & -i\`, which gives you the lowest set bit of \`i\` as a
number. The reasoning is in
[bit manipulation](#/dsa/bit-manipulation/notes); the short version is that Java
stores negatives in two's complement, so \`-i\` is every bit of \`i\` flipped, plus
one.

\`\`\`text
 i  =  12    ...0000 1100
 ~i =  -13   ...1111 0011     flip every bit
 -i =  -12   ...1111 0100     ...then add one
 -------------------------------------------
 i & -i      ...0000 0100  =  4
\`\`\`

Flipping and adding one leaves the lowest set bit alone, zeroes everything below
it and inverts everything above it. So \`&\` survives in exactly one position.

\`\`\`java
12 & -12   // 4    1100 -> 100
8  & -8    // 8    already a power of two
7  & -7    // 1    0111 -> 1
0  & -0    // 0    <- the one that ruins everything
\`\`\`

That last line is why a Fenwick tree is one-based, and it is not a style
preference. The update loop advances with \`i += i & -i\`; at \`i = 0\` that is
\`i += 0\`, so it never moves and never ends. **Position 1 of your data lives at
index 1 of the tree.** Allocate \`n + 1\` slots and leave slot 0 empty.

## The idea: every index owns a block

> Index \`i\` of the tree stores the sum of the \`i & -i\` elements that end at
> position \`i\`.

Index 6 has \`6 & -6 == 2\`, so it holds two elements ending at 6 — a5 and a6.
Index 8 has \`8 & -8 == 8\`, so it holds all of a1 to a8.

\`\`\`text
 i   binary   i & -i   t[i] is the sum of
 1    0001       1     a1
 2    0010       2     a1 a2
 3    0011       1     a3
 4    0100       4     a1 a2 a3 a4
 5    0101       1     a5
 6    0110       2     a5 a6
 7    0111       1     a7
 8    1000       8     a1 a2 a3 a4 a5 a6 a7 a8
\`\`\`

Drawn as bars it is easier to see. It is not a tree of nodes and pointers — it
is a set of overlapping power-of-two blocks, one per index, and the "tree" is
the containment between them.

\`\`\`text
         a1   a2   a3   a4   a5   a6   a7   a8
t[1]    [==]
t[2]    [=======]
t[3]              [==]
t[4]    [=================]
t[5]                        [==]
t[6]                        [=======]
t[7]                                  [==]
t[8]    [=====================================]
\`\`\`

Two facts fall out of the picture, and they are the two operations.

- **Any prefix a1..ai is a stack of these bars laid end to end.** The prefix
  a1..a7 is t[7], then t[6], then t[4]. No gaps, no overlaps.
- **Any single position sits inside a handful of bars.** Position 5 is inside
  t[5], t[6] and t[8] and nothing else, so changing a5 makes exactly those three
  totals stale.

Each bar is at least twice the width of the one before it, so both handfuls have
at most log₂ n members.

## Walking down, and walking up

![The tree indices a prefix query reads and the ones an update writes](diagrams/fenwick-tree-binary-indexed-tree-notes-low-bit-walks.jpg)

To sum a1..ai, add \`t[i]\`, jump to just before that bar starts — \`i - (i & -i)\` —
and repeat until you fall off the front. To add \`v\` at position \`i\`, add it to
\`t[i]\`, move to the smallest wider bar containing \`i\` — \`i + (i & -i)\` — and
repeat until you run past \`n\`.

\`\`\`text
sum(7)                        add(5, v)   with n = 8
  7 = 0111                      5 = 0101
  s += t[7]  -> a7              t[5] += v  -> a5           5 + 1 = 6
  7 - 1 = 6                     t[6] += v  -> a5 a6        6 + 2 = 8
  s += t[6]  -> a5 a6           t[8] += v  -> a1..a8       8 + 8 = 16 > 8
  6 - 2 = 4
  s += t[4]  -> a1..a4        exactly the bars containing position 5
  4 - 4 = 0   stop
  a1..a7, each counted once
\`\`\`

The query clears one set bit per step, so it takes \`Integer.bitCount(i)\` steps.
The update at least doubles the low bit per step, so it takes at most log₂ n.

\`\`\`java
void add(int i, long v) { for (; i <= n; i += i & -i) t[i] += v; }
long sum(int i)         { long s = 0; for (; i > 0; i -= i & -i) s += t[i]; return s; }
long range(int l, int r) { return sum(r) - sum(l - 1); }
\`\`\`

\`range\` is the [prefix sum](#/dsa/prefix-sum/notes) subtraction, unchanged.
\`sum(l - 1)\` at \`l = 1\` is \`sum(0)\`, which returns 0 immediately because \`i > 0\`
fails — the one-based indexing hands you that empty case for free.

Note what \`add\` does not do: it never stores the element. A Fenwick tree keeps no
copy of the array. If you want \`a[i]\` back it is \`sum(i) - sum(i - 1)\`.

Because it works by subtraction, the operation must be one you can undo. Sum,
XOR and count are fine. Minimum is not — the minimum of a1..a7 and the minimum
of a1..a3 tell you nothing about a4..a7. That restriction is the main reason
[segment trees](#/dsa/segment-tree/notes) exist.

![Subtraction recovers a range sum but says nothing about a range minimum](diagrams/fenwick-tree-binary-indexed-tree-notes-needs-an-inverse.jpg)

## Building in O(n)

The obvious build is \`n\` calls to \`add\`, which is O(n log n). The linear build is
three lines: put each element in its own slot, then push each slot's total into
the slot that contains it.

\`\`\`java
for (int i = 1; i <= n; i++) t[i] += a[i - 1];
for (int i = 1; i <= n; i++) {
    int parent = i + (i & -i);
    if (parent <= n) t[parent] += t[i];
}
\`\`\`

\`parent\` is always greater than \`i\`, so by the time the loop reaches \`i\` every
smaller index has contributed and \`t[i]\` is final. One pass, left to right.

## A complete Fenwick tree

\`\`\`java Fenwick.java @run-fenwick-tree-binary-indexed-tree-fenwick
import java.util.Arrays;

public class Fenwick {

    private final int n;
    private final long[] t;      // t[i] = sum of the (i & -i) elements ending at i

    /** Build from a 0-based array in O(n). Slot 0 of the tree is never used. */
    Fenwick(int[] a) {
        n = a.length;
        t = new long[n + 1];
        for (int i = 1; i <= n; i++) t[i] += a[i - 1];
        for (int i = 1; i <= n; i++) {
            int parent = i + (i & -i);
            if (parent <= n) t[parent] += t[i];
        }
    }

    /** a[i] += v, with i one-based. Walks up, widening the block each step. */
    void add(int i, long v) {
        for (; i <= n; i += i & -i) t[i] += v;
    }

    /** Sum of a1..ai. Walks down, peeling one whole block off each step. */
    long sum(int i) {
        long s = 0;
        for (; i > 0; i -= i & -i) s += t[i];
        return s;
    }

    /** Sum of al..ar, both one-based and inclusive. */
    long range(int l, int r) { return sum(r) - sum(l - 1); }

    /** The indices sum(i) touches, printed so the walk is visible. */
    static String path(int i) {
        StringBuilder sb = new StringBuilder();
        for (; i > 0; i -= i & -i) sb.append(sb.isEmpty() ? "" : " + ").append("t[" + i + "]");
        return sb.toString();
    }

    public static void main(String[] args) {
        Fenwick f = new Fenwick(new int[] { 3, 2, -1, 6, 5, 4, -3, 3 });
        System.out.println("tree        " + Arrays.toString(f.t));
        System.out.println("sum(7)   =  " + path(7) + " = " + f.sum(7));
        System.out.println("range 3..6  " + f.range(3, 6));
        System.out.println("range 1..1  " + f.range(1, 1));
        System.out.println("empty sum   " + f.sum(0));

        f.add(5, 10);                          // a5 goes from 5 to 15
        System.out.println("after add   " + Arrays.toString(f.t));
        System.out.println("range 3..6  " + f.range(3, 6));
        System.out.println("size one    " + new Fenwick(new int[] { 42 }).range(1, 1));
    }
}
\`\`\`

\`\`\`output @run-fenwick-tree-binary-indexed-tree-fenwick
tree        [0, 3, 5, -1, 10, 5, 9, -3, 19]
sum(7)   =  t[7] + t[6] + t[4] = 16
range 3..6  14
range 1..1  3
empty sum   0
after add   [0, 3, 5, -1, 10, 15, 19, -3, 29]
range 3..6  24
size one    42
\`\`\`

\`sb.isEmpty()\` is emptiness on a \`StringBuilder\`, available since Java 15;
\`sb.length() == 0\` says the same on older releases.

## The variants

| What you need | How | Cost |
|---|---|---|
| Point update, range sum | The plain tree above | O(log n) each |
| Range update, point read | Store differences: \`add(l, v)\` and \`add(r + 1, -v)\`; the value at \`i\` is \`sum(i)\` | O(log n) each |
| Range update, range sum | Two trees, one for the linear term and one for the constant | O(log n) each |
| Two dimensions | \`long[][] t\`, two nested low-bit loops | O(log rows × log cols) |

The second is the difference array from
[prefix sum](#/dsa/prefix-sum/notes) with a Fenwick tree underneath, and it is
what [Corporate Flight Bookings](problem:corporate-flight-bookings) and
[Range Addition](problem:range-addition) want.

\`\`\`java
void addRange(int l, int r, long v) { add(l, v); add(r + 1, -v); }
long valueAt(int i) { return sum(i); }
\`\`\`

Size that tree \`n + 2\`, so \`add(r + 1, ...)\` at \`r == n\` has somewhere to land
rather than falling out of the loop and being silently dropped.

## The Fenwick tree of counts

This is the pattern that turns up in the hard band, and it does not look like a
sum problem. Build the tree over **values** rather than positions and store 1 at
each value you have seen. Then \`sum(v)\` is "how many values so far are ≤ v", and
the tree has become an order-statistic structure.

[Count of Smaller Numbers After Self](problem:count-of-smaller-numbers-after-self)
asks, for each element, how many elements to its right are strictly smaller.
Walk right to left. Before inserting the current value, ask how many
already-inserted values are smaller — those are the ones to its right.

\`\`\`text
a = [5, 2, 6, 1]        ranks: 1->1, 2->2, 5->3, 6->4

i=3  a=1  rank 1   sum(0) = 0   ->  0     then mark 1
i=2  a=6  rank 4   sum(3) = 1   ->  1     then mark 4     seen {1}
i=1  a=2  rank 2   sum(1) = 1   ->  1     then mark 2     seen {1,4}
i=0  a=5  rank 3   sum(2) = 2   ->  2     then mark 3     seen {1,2,4}

answer [2, 1, 1, 0]
\`\`\`

Counting inversions is the same loop with the answers totalled instead of
recorded: an inversion is a pair \`i < j\` with \`a[i] > a[j]\`, which is exactly "a
smaller element later". That is the alternative to the merge-sort count in
[divide and conquer](#/dsa/divide-and-conquer/notes), and it is shorter.

### Coordinate compression, the standard companion

The tree is indexed by value, so it needs small positive integers. Real input is
not: it can be negative and it can reach 10⁹. So replace each value by its
**rank** — 1 for the smallest distinct value, 2 for the next. Sort a copy, remove
duplicates, and binary search each original value in it. Ranks preserve order,
which is all the algorithm asks about, and they squeeze any n values into 1..n.
Expect to write this beside almost every Fenwick solution.

## What it costs

- **Query O(log n)**: one step per set bit of the index, at most ⌊log₂ n⌋ + 1.
- **Update O(log n)**: each jump at least doubles the low bit.
- **Build O(n)** with the push-to-parent loop, O(n log n) via \`add\`.
- **Space n + 1**. A [segment tree](#/dsa/segment-tree/notes) wants 4n and a
  [sparse table](#/dsa/sparse-table/notes) wants n log n.
- **The constant is small**: no recursion, no objects, one array, and an inner
  loop of one add and one bitwise and. That is why it is preferred whenever it
  applies.

Counting inversions is O(n log n) overall — the sort for compression, then n
updates and n queries.

## The mistakes, in the order people make them

1. **Zero-based indexing.** \`add(0, v)\` loops forever because \`0 & -0\` is 0.
   Shift every position by one on the way in.
2. **Sizing the array \`n\`.** Index \`n\` is valid, so it needs \`n + 1\` slots, and
   \`n + 2\` for the difference variant.
3. **Confusing \`t[i]\` with \`a[i]\`.** They agree only when \`i\` is odd. The tree
   holds no copy of the array.
4. **\`set\` written as \`add\`.** To set position \`i\` to \`v\` you must add
   \`v - current\`, so keep the plain array alongside.
5. **\`int\` accumulators.** 10⁵ values near 10⁹ overflow silently. Use \`long\`.
6. **Off by one in a count query.** Strictly smaller is \`sum(rank - 1)\`; smaller
   or equal is \`sum(rank)\`. Getting it wrong is invisible until duplicates.
7. **Compressing wrongly.** Ranks must be assigned over the whole input at once,
   and duplicates must collapse to the same rank, or the counts drift.
8. **Reaching for it on a minimum.** \`sum(r) - sum(l - 1)\` needs an inverse. Min,
   max and gcd have none — that is a segment tree question.

## The Java you will reach for

| You want | Write |
|---|---|
| The lowest set bit | \`i & -i\`, or \`Integer.lowestOneBit(i)\` |
| Steps a query takes | \`Integer.bitCount(i)\` |
| Highest power of two not above n | \`Integer.highestOneBit(n)\` |
| Sorted copy for compression | \`int[] s = a.clone(); Arrays.sort(s);\` |
| Rank of a value | \`Arrays.binarySearch(s, 0, distinct, v) + 1\` |
| A tree over values, not positions | \`new long[maxRank + 1]\` |
| Boxed result list | \`Arrays.asList(boxedArray)\` |

\`Integer.lowestOneBit\` compiles to the same instruction as \`i & -i\`. Recognise
both — solutions on the internet use them interchangeably.

## Working one from the sheet

[Count of Smaller Numbers After Self](problem:count-of-smaller-numbers-after-self)
is the trace above, written out with compression in front of it. \`inversions\` is
the identical walk with the counts added up, which is why both live in one class.

\`\`\`java Smaller.java @run-fenwick-tree-binary-indexed-tree-smaller
import java.util.Arrays;
import java.util.List;

public class Smaller {

    private int size;
    private int[] t;

    private void add(int i) { for (; i <= size; i += i & -i) t[i] += 1; }

    private int countUpTo(int i) {
        int s = 0;
        for (; i > 0; i -= i & -i) s += t[i];
        return s;
    }

    /** Replace every value by its rank among the distinct values, 1-based. */
    private int[] compress(int[] a) {
        int[] sorted = a.clone();
        Arrays.sort(sorted);
        int distinct = 0;
        for (int i = 0; i < sorted.length; i++)
            if (i == 0 || sorted[i] != sorted[i - 1]) sorted[distinct++] = sorted[i];

        int[] rank = new int[a.length];
        for (int i = 0; i < a.length; i++)
            rank[i] = Arrays.binarySearch(sorted, 0, distinct, a[i]) + 1;

        size = distinct;
        t = new int[size + 1];
        return rank;
    }

    /** For each i, how many j > i have a[j] < a[i]. */
    List<Integer> countSmaller(int[] a) {
        int[] rank = compress(a);
        Integer[] out = new Integer[a.length];
        for (int i = a.length - 1; i >= 0; i--) {
            out[i] = countUpTo(rank[i] - 1);       // strictly smaller: stop one short
            add(rank[i]);
        }
        return Arrays.asList(out);
    }

    /** Pairs i < j with a[i] > a[j] — the same walk, totalled. */
    long inversions(int[] a) {
        int[] rank = compress(a);
        long inv = 0;
        for (int i = a.length - 1; i >= 0; i--) {
            inv += countUpTo(rank[i] - 1);
            add(rank[i]);
        }
        return inv;
    }

    public static void main(String[] args) {
        System.out.println("smaller  " + new Smaller().countSmaller(new int[] { 5, 2, 6, 1 }));
        System.out.println("dupes    " + new Smaller().countSmaller(new int[] { -1, -1 }));
        System.out.println("single   " + new Smaller().countSmaller(new int[] { -1 }));
        System.out.println("big      " + new Smaller().countSmaller(
                new int[] { 1000000000, -1000000000, 0 }));
        System.out.println("inv 1    " + new Smaller().inversions(new int[] { 2, 4, 1, 3, 5 }));
        System.out.println("inv 2    " + new Smaller().inversions(new int[] { 5, 4, 3, 2, 1 }));
    }
}
\`\`\`

\`\`\`output @run-fenwick-tree-binary-indexed-tree-smaller
smaller  [2, 1, 1, 0]
dupes    [0, 0]
single   [0]
big      [2, 0, 0]
inv 1    3
inv 2    10
\`\`\`

\`Arrays.binarySearch(sorted, 0, distinct, v)\` searches only the deduplicated
front, and because every value of \`a\` is certainly in there the return is always
an index rather than the negative miss code.

## How to work through the topic

1. [Range Sum Query - Immutable](problem:range-sum-query-immutable) with a plain
   prefix array and no tree. It is the baseline you are trading against.
2. [Range Sum Query - Mutable](problem:range-sum-query-mutable). Write the whole
   structure from memory, including the zero-to-one-based shift, and remember
   that \`update\` sets rather than adds, so you need the old value. Do it twice on
   separate days.
3. [Corporate Flight Bookings](problem:corporate-flight-bookings) and
   [Range Addition](problem:range-addition). The difference-array variant. A
   plain difference array also solves both; the Fenwick version is what you need
   when reads are interleaved with the updates rather than all at the end.
4. [Count Number of Teams](problem:count-number-of-teams) and
   [Queries on a Permutation With Key](problem:queries-on-a-permutation-with-key).
   The first is a tree of counts used twice, once from each side; the second
   reserves space in front of the array so a move-to-front is an update rather
   than a shift.
5. [Count of Smaller Numbers After Self](problem:count-of-smaller-numbers-after-self)
   and [Create Sorted Array through Instructions](problem:create-sorted-array-through-instructions).
   Compression plus a tree of counts, which is most of the hard band. Get the
   strictly-smaller boundary right on input with duplicates.
6. [Count of Range Sum](problem:count-of-range-sum) and
   [Number of Pairs Satisfying Inequality](problem:number-of-pairs-satisfying-inequality).
   Both need the condition rewritten as a comparison between two prefix sums
   before the tree can help. That rewriting, not the tree, is the work.
7. [Range Sum Query 2D - Mutable](problem:range-sum-query-2d-mutable) and
   [Maximum Sum Queries](problem:maximum-sum-queries). Two dimensions, then a
   tree keeping a maximum along one axis after sorting on the other. By here the
   tree is a tool you stop thinking about, which is the goal.
`;export{e as default};