var e=`You have an array that never changes, and a great many questions of the form
"what is the smallest value between index 3 and index 9". Scanning the range
answers one question in O(length), which is fine for ten questions and hopeless
for a hundred thousand. A [segment tree](#/dsa/segment-tree/notes) brings that
down to O(log n) per question, but you have to write one, and it is a fair amount
of machinery for a structure that will never take an update.

The sparse table is what you build instead. Precompute the answer for every
block whose length is a power of two, and then any range at all can be covered by
just **two** of those blocks — overlapping in the middle, which is fine, because
asking for the minimum twice does not change the minimum. Build it once in
O(n log n), then every query afterwards is two array reads and one comparison.

The catch is in that word "fine". Overlap is harmless for minimum and harmless
for maximum, and it is ruinous for a sum. Understanding exactly which operations
tolerate overlap is most of what this topic is.

## Idempotent, and why it is the whole condition

An operation is **idempotent** when combining a value with itself gives the same
value back:

\`\`\`text
min(a, a) == a          max(a, a) == a
gcd(a, a) == a          a & a == a          a | a == a

a + a != a              a * a != a          a ^ a == 0, which is worse
\`\`\`

That property is the licence to overlap. If your two blocks both cover index 5,
then \`min\` sees \`a[5]\` twice, and seeing it twice is the same as seeing it once.
The answer is unaffected. Sum sees it twice too, and counts it twice, and the
answer is wrong by exactly \`a[5]\`.

![Which operations survive being handed the same element twice](diagrams/sparse-table-notes-idempotent.jpg)

So the rule, stated once and never bent:

> A sparse table answers range queries for idempotent operations only —
> minimum, maximum, gcd, bitwise AND, bitwise OR. Not sum, not product, not XOR.

For sums over an unchanging array you already have the right tool: a
[prefix sum](#/dsa/prefix-sum/notes) array, which is an O(n) build and one
subtraction per query. That is strictly better than a sparse table would be even
if a sparse table worked. [Range Sum Query - Immutable](problem:range-sum-query-immutable)
and [Range Sum Query 2D - Immutable](problem:range-sum-query-2d-immutable) are
both prefix-sum problems, and they are on this topic's list to make exactly that
contrast.

## The table

\`table[k][i]\` is the answer for the block of length 2^k that starts at index \`i\`.
So \`table[0]\` is the array itself — blocks of length 1 — and each level after
that halves the number of usable starts.

\`\`\`text
a = [5, 2, 4, 7, 1, 3, 6]        n = 7

k=0   blocks of 1     i: 0  1  2  3  4  5  6
                         5  2  4  7  1  3  6

k=1   blocks of 2     i: 0  1  2  3  4  5
                         2  2  4  1  1  3        table[1][3] = min(a[3], a[4]) = 1

k=2   blocks of 4     i: 0  1  2  3
                         2  1  1  1              table[2][1] = min(a[1..4]) = 1
\`\`\`

There is no \`k=3\` row, because a block of 8 does not fit in an array of 7. The
number of levels is \`floor(log2 n) + 1\`, which is why the whole table is
O(n log n) entries and not O(n²).

## Building it

Each block of length 2^k is two blocks of length 2^(k-1) laid end to end, and
those are already sitting on the level below.

\`\`\`java
for (int k = 1; (1 << k) <= n; k++)
    for (int i = 0; i + (1 << k) <= n; i++)
        table[k][i] = Math.min(table[k - 1][i], table[k - 1][i + (1 << (k - 1))]);
\`\`\`

Line by line:

- \`1 << k\` is 2^k — shifting a 1 left by \`k\` places. \`(1 << k) <= n\` stops the
  outer loop when the block is longer than the array.
- \`i + (1 << k) <= n\` is the bound that keeps the block inside the array. Get it
  wrong and you either read past the end or silently drop the last valid start.
- \`i + (1 << (k - 1))\` is where the second half begins: skip half a block.
- The order matters. Level \`k\` reads level \`k - 1\`, so the outer loop must be
  over \`k\`, ascending. Swapping the loops reads entries that have not been filled
  in yet.

Here the halves do **not** overlap — the build is exact, and it would be exact
for sums too. The overlap only appears at query time.

## The query, in one step

![Two power-of-two blocks anchored at each end, overlapping in the middle](diagrams/sparse-table-notes-two-blocks.jpg)

Take the range \`[l, r]\`, inclusive, of length \`len = r - l + 1\`. Pick the largest
\`k\` with 2^k ≤ len. Then two blocks of that length cover the range: one starting
at \`l\`, one *ending* at \`r\`.

\`\`\`java
int k = 31 - Integer.numberOfLeadingZeros(len);   // floor(log2 len)
return Math.min(table[k][l], table[k][r - (1 << k) + 1]);
\`\`\`

\`\`\`text
range [1, 5], len = 5, so k = 2 and the blocks are length 4

index    0    1    2    3    4    5    6
a        5  [ 2    4    7    1    3 ]  6
              +--- block at 1 -----+
                        |
              +---- block at 2 ----+       starts at r - 4 + 1 = 2

table[2][1] = 1        table[2][2] = 1        min = 1     correct
\`\`\`

The two blocks overlap on indices 2, 3 and 4. Every one of those values is
counted twice, and \`min\` does not care.

Why is a length-2^k block always enough? Because \`k\` is the largest power with
2^k ≤ len, doubling it exceeds \`len\`, so \`2 × 2^k > len\` — two such blocks are
longer than the range and therefore cover it, whichever ends you anchor them to.

\`Integer.numberOfLeadingZeros(x)\` counts the zero bits above the highest set bit
of \`x\`. For \`len = 5\` that is binary \`101\`, twenty-nine leading zeros, so
\`31 - 29 = 2\`. It is a single machine instruction and it removes any need for
\`Math.log\`, which is floating point and will give you \`log2(8) = 2.9999…\` on the
one input where it matters. If you prefer, precompute a \`log[]\` array once with
\`log[i] = log[i / 2] + 1\`.

## A sparse table you can run

\`\`\`java SparseMin.java @run-sparse-table-sparse-min
public class SparseMin {

    /** table[k][i] is the minimum of a[i .. i + 2^k - 1]. */
    private final int[][] table;
    private final int n;

    SparseMin(int[] a) {
        n = a.length;
        int levels = 32 - Integer.numberOfLeadingZeros(n);   // floor(log2 n) + 1
        table = new int[levels][n];
        System.arraycopy(a, 0, table[0], 0, n);

        for (int k = 1; k < levels; k++) {
            int half = 1 << (k - 1);
            for (int i = 0; i + (1 << k) <= n; i++)
                table[k][i] = Math.min(table[k - 1][i], table[k - 1][i + half]);
        }
    }

    /** Minimum of a[l .. r], inclusive, in constant time. */
    int query(int l, int r) {
        int len = r - l + 1;
        int k = 31 - Integer.numberOfLeadingZeros(len);
        return Math.min(table[k][l], table[k][r - (1 << k) + 1]);
    }

    /** The obvious answer, kept so the fast one can be checked against it. */
    static int slowMin(int[] a, int l, int r) {
        int best = a[l];
        for (int i = l + 1; i <= r; i++) best = Math.min(best, a[i]);
        return best;
    }

    public static void main(String[] args) {
        int[] a = { 5, 2, 4, 7, 1, 3, 6 };
        SparseMin st = new SparseMin(a);

        System.out.println("query(1, 5) = " + st.query(1, 5));
        System.out.println("query(0, 0) = " + st.query(0, 0));
        System.out.println("query(3, 4) = " + st.query(3, 4));
        System.out.println("query(0, 6) = " + st.query(0, 6));

        int checked = 0;
        boolean agree = true;
        for (int l = 0; l < a.length; l++)
            for (int r = l; r < a.length; r++) {
                checked++;
                if (st.query(l, r) != slowMin(a, l, r)) agree = false;
            }
        System.out.println(checked + " ranges checked, all agree: " + agree);
    }
}
\`\`\`

\`\`\`output @run-sparse-table-sparse-min
query(1, 5) = 1
query(0, 0) = 5
query(3, 4) = 1
query(0, 6) = 1
28 ranges checked, all agree: true
\`\`\`

The brute-force cross-check is worth keeping in your own practice file. A sparse
table has three places to get an off-by-one wrong — the build bound, the level
count, and \`r - (1 << k) + 1\` — and every one of them produces a table that looks
plausible and answers most ranges correctly. Checking all O(n²) ranges on a small
array catches all three in a second.

## What overlaps safely, and what does not

\`\`\`java RangeIdempotent.java @run-sparse-table-range-idempotent
public class RangeIdempotent {

    static int gcd(int x, int y) {
        while (y != 0) { int t = x % y; x = y; y = t; }
        return x;
    }

    /** A sparse table over any operation, chosen by name. */
    static int[][] build(int[] a, String op) {
        int n = a.length;
        int levels = 32 - Integer.numberOfLeadingZeros(n);
        int[][] t = new int[levels][n];
        System.arraycopy(a, 0, t[0], 0, n);
        for (int k = 1; k < levels; k++) {
            int half = 1 << (k - 1);
            for (int i = 0; i + (1 << k) <= n; i++)
                t[k][i] = combine(t[k - 1][i], t[k - 1][i + half], op);
        }
        return t;
    }

    static int combine(int x, int y, String op) {
        if (op.equals("min")) return Math.min(x, y);
        if (op.equals("gcd")) return gcd(x, y);
        return x + y;                       // "sum" — the one that must not overlap
    }

    static int query(int[][] t, int l, int r, String op) {
        int k = 31 - Integer.numberOfLeadingZeros(r - l + 1);
        return combine(t[k][l], t[k][r - (1 << k) + 1], op);
    }

    static int slowSum(int[] a, int l, int r) {
        int s = 0;
        for (int i = l; i <= r; i++) s += a[i];
        return s;
    }

    public static void main(String[] args) {
        int[] a = { 12, 18, 24, 9, 30, 6, 15 };

        System.out.println("min  [1,5] table = " + query(build(a, "min"), 1, 5, "min"));
        System.out.println("gcd  [0,3] table = " + query(build(a, "gcd"), 0, 3, "gcd"));
        System.out.println("gcd  [2,6] table = " + query(build(a, "gcd"), 2, 6, "gcd"));

        int wrong = query(build(a, "sum"), 1, 5, "sum");
        System.out.println("sum  [1,5] table = " + wrong + "   <- wrong");
        System.out.println("sum  [1,5] true  = " + slowSum(a, 1, 5));
        System.out.println("double-counted   = " + (wrong - slowSum(a, 1, 5)));
    }
}
\`\`\`

\`\`\`output @run-sparse-table-range-idempotent
min  [1,5] table = 6
gcd  [0,3] table = 3
gcd  [2,6] table = 3
sum  [1,5] table = 150   <- wrong
sum  [1,5] true  = 87
double-counted   = 63
\`\`\`

The last three lines are the argument made concrete. The two length-4 blocks that
cover \`[1, 5]\` overlap on indices 2, 3 and 4, so the sum comes out too large by
exactly \`a[2] + a[3] + a[4]\`. Run the same table over \`min\` or \`gcd\` and the
overlap costs nothing.

| Question | Combine with | Sparse table? |
|---|---|---|
| Range minimum | \`Math.min\` | yes |
| Range maximum | \`Math.max\` | yes |
| Range gcd | Euclid's \`gcd\` | yes |
| Range bitwise AND | \`&\` | yes |
| Range bitwise OR | <code>&#124;</code> | yes |
| Range sum | \`+\` | no — use a prefix sum |
| Range product | \`*\` | no |
| Range XOR | \`^\` | no — \`a ^ a\` is 0, the opposite of idempotent |

Range gcd is the one people forget qualifies. \`gcd(x, x) = x\`, so the overlap is
harmless, and it is the reason a "longest subarray whose gcd is greater than 1"
question can be answered with a sparse table and a
[binary search](#/dsa/binary-search/notes) on the length.

## Against a segment tree and a Fenwick tree

| | Build | Query | Update | Space | Operations |
|---|---|---|---|---|---|
| Prefix sum | O(n) | O(1) | O(n) rebuild | O(n) | invertible ones — sum, XOR |
| Sparse table | O(n log n) | O(1) | none | O(n log n) | idempotent ones only |
| [Fenwick tree](#/dsa/fenwick-tree-binary-indexed-tree/notes) | O(n log n) | O(log n) | O(log n) | O(n) | invertible ones |
| [Segment tree](#/dsa/segment-tree/notes) | O(n) | O(log n) | O(log n) | O(4n) | any that combines |

Read that table as a decision, in this order:

1. **Does anything change?** If yes, stop — you need a Fenwick tree or a segment
   tree. A sparse table has no update; changing one value invalidates up to
   log n entries per level and there is no cheap repair. That is the price of the
   O(1) query.
2. **Is it a sum?** Prefix sums, and you are done in three lines.
3. **Is it min, max, gcd, AND or OR, over fixed data?** Sparse table.
4. **Anything else** — a combine that is neither invertible nor idempotent, or
   range updates — segment tree.

[Range Sum Query - Mutable](problem:range-sum-query-mutable),
[Corporate Flight Bookings](problem:corporate-flight-bookings) and
[My Calendar III](problem:my-calendar-iii) all fail step 1: the data changes, so
they belong to the other two structures. They are listed here as the boundary of
what this one can do.

## What it costs

![Memory per element for prefix sum, Fenwick, segment tree and sparse table](diagrams/sparse-table-notes-space-price.jpg)

- **Build: O(n log n) time and O(n log n) space.** \`floor(log2 n) + 1\` levels,
  each a pass over the array. For n = 10⁵ that is about 17 levels, roughly 1.7
  million ints — around 7 MB. For n = 10⁷ it is not comfortable, and a segment
  tree's O(n) space starts to look attractive.
- **Query: O(1).** Two array reads, one comparison, one \`numberOfLeadingZeros\`.
  No recursion, no loop, no pointer chasing. This is the fastest range query
  there is, and it is why static-data solutions use it.
- **Update: not supported.** Not "slow" — absent. Rebuild, at O(n log n).

Against a segment tree: with \`q\` queries you pay \`n log n + q\` here and
\`n + q log n\` there. Past a few thousand queries the sparse table is ahead, and
it is always ahead on the code you have to write.

## The mistakes, in the order people make them

1. **Using it for sums.** The build is correct and the query double-counts the
   overlap, so it is right on ranges that happen to be an exact power of two and
   wrong on everything else — the worst kind of bug to find.
2. **\`Math.log(len) / Math.log(2)\`.** Floating point gives \`2.9999999\` for 8 on
   some inputs, \`floor\` turns that into 2, and the query reads the wrong level.
   Use \`31 - Integer.numberOfLeadingZeros(len)\`.
3. **The second block's start.** It is \`r - (1 << k) + 1\`, not \`r - (1 << k)\`.
   The block *ends* at \`r\`, and a block of length 2^k ending at \`r\` starts 2^k−1
   places before it.
4. **Sizing the levels wrong.** \`32 - Integer.numberOfLeadingZeros(n)\` gives
   \`floor(log2 n) + 1\`. One less and the top level is missing; one more and the
   top level is all zeroes, which silently returns 0 as the minimum.
5. **\`i + (1 << k) <= n\` written as \`<\`.** That drops the one block that ends
   exactly at the last index, which is the block a whole-array query needs.
6. **Looping \`i\` outside and \`k\` inside.** Level \`k\` is built from level \`k − 1\`,
   so \`k\` has to be the outer loop.
7. **Half-open ranges.** Decide once whether \`query(l, r)\` includes \`r\` and write
   it in a comment. Mixing the conventions is where a working table starts
   answering off by one element.
8. **Expecting an update to work.** There is no \`set\`; if the problem has one,
   go to [segment tree](#/dsa/segment-tree/notes). And
   \`31 - numberOfLeadingZeros(0)\` is −1, an index that throws — guard \`l > r\` at
   the call site.

## The Java you will reach for

| You want | Write |
|---|---|
| 2^k | \`1 << k\` |
| floor(log2 x), x ≥ 1 | \`31 - Integer.numberOfLeadingZeros(x)\` |
| Number of levels for n | \`32 - Integer.numberOfLeadingZeros(n)\` |
| Is x a power of two | \`x > 0 && (x & (x - 1)) == 0\` |
| Copy the array into level 0 | \`System.arraycopy(a, 0, table[0], 0, n)\` |
| A two-dimensional table | \`int[][] table = new int[levels][n]\` |
| gcd | write Euclid; Java has no \`Math.gcd\` for \`int\` |
| gcd for \`long\` | there is none — write it, or use \`BigInteger.gcd\` |
| Highest power of two ≤ x | \`Integer.highestOneBit(x)\` |

\`Integer.highestOneBit(5)\` returns 4 — the value, not the exponent. It is
sometimes more convenient than the \`numberOfLeadingZeros\` form, because
\`r - highestOneBit(len) + 1\` is the second block's start without any shifting.
See [bit manipulation](#/dsa/bit-manipulation/notes) for the rest of these.

## Working one from the sheet

[Sliding Window Maximum](problem:sliding-window-maximum): given an array and a
window size \`k\`, report the maximum of every window as it slides.

The intended answer is a monotonic [deque](#/dsa/deque/notes) in O(n). But a
sparse table solves it too, in O(n log n), and it is a good exercise because the
windows are exactly the fixed-length ranges the table is built for.

\`\`\`java WindowMax.java @run-sparse-table-window-max
import java.util.Arrays;

public class WindowMax {

    static int[][] buildMax(int[] a) {
        int n = a.length;
        int levels = 32 - Integer.numberOfLeadingZeros(n);
        int[][] t = new int[levels][n];
        System.arraycopy(a, 0, t[0], 0, n);
        for (int k = 1; k < levels; k++) {
            int half = 1 << (k - 1);
            for (int i = 0; i + (1 << k) <= n; i++)
                t[k][i] = Math.max(t[k - 1][i], t[k - 1][i + half]);
        }
        return t;
    }

    static int max(int[][] t, int l, int r) {
        int k = 31 - Integer.numberOfLeadingZeros(r - l + 1);
        return Math.max(t[k][l], t[k][r - (1 << k) + 1]);
    }

    static int[] maxSlidingWindow(int[] a, int w) {
        int[][] t = buildMax(a);
        int[] out = new int[a.length - w + 1];
        for (int l = 0; l < out.length; l++) out[l] = max(t, l, l + w - 1);
        return out;
    }

    public static void main(String[] args) {
        System.out.println(Arrays.toString(
                maxSlidingWindow(new int[] { 1, 3, -1, -3, 5, 3, 6, 7 }, 3)));
        System.out.println(Arrays.toString(
                maxSlidingWindow(new int[] { 9, 11 }, 2)));
        System.out.println(Arrays.toString(
                maxSlidingWindow(new int[] { 4 }, 1)));
        System.out.println(Arrays.toString(
                maxSlidingWindow(new int[] { 7, 2, 4 }, 1)));
    }
}
\`\`\`

\`\`\`output @run-sparse-table-window-max
[3, 3, 5, 5, 6, 7]
[11]
[4]
[7, 2, 4]
\`\`\`

The window size is fixed, so every query uses the same \`k\` — you could hoist it
out of the loop. The last two cases are the ones that break naive index
arithmetic: a window of 1 makes \`l == r\`, so \`len\` is 1 and \`k\` is 0, and the two
"overlapping" blocks are the same single element.

Note what the sparse table does not give you here that the deque does: the deque
is O(n) and O(k) space, and it works on a stream. The sparse table needs the
whole array in advance. That is the same immutability condition, restated.

## How to work through the topic

1. [Range Sum Query - Immutable](problem:range-sum-query-immutable). Solve it
   with a prefix sum, then try to talk yourself into a sparse table and notice
   where the argument fails. This is the fastest way to make "idempotent" stick.
2. [Find Minimum in Rotated Sorted Array](problem:find-minimum-in-rotated-sorted-array),
   [Find Peak Element](problem:find-peak-element). One-off minimum and maximum
   questions, answered by [binary search](#/dsa/binary-search/notes) rather than
   a table. Knowing when *not* to build one is half the topic.
3. Write the table itself. Build, query, and the brute-force check over every
   range. Do it for \`min\`, then change one line and do it for \`gcd\`.
   [Height Checker](problem:height-checker) is a gentle place to keep it.
4. [Trapping Rain Water](problem:trapping-rain-water). The classic answer is
   prefix maxima from both sides — which is a sparse table's problem with a
   one-dimensional shortcut. Write both and compare.
   [Product of Array Except Self](problem:product-of-array-except-self) is the
   same shape again.
5. [Sliding Window Maximum](problem:sliding-window-maximum),
   [Number of Subarrays with Bounded Maximum](problem:number-of-subarrays-with-bounded-maximum).
   Fixed and variable ranges over a static array. Then read the
   [deque](#/dsa/deque/notes) solution and be able to say why it is better.
6. [Sum of Subarray Minimums](problem:sum-of-subarray-minimums). A range-minimum
   problem that is really a monotonic [stack](#/dsa/stacks/notes) problem. The
   divide-and-conquer solution uses a sparse table to find the minimum of each
   half in O(1), which is where the two ideas meet.
7. [Shortest Subarray with Sum at Least K](problem:shortest-subarray-with-sum-at-least-k),
   [Count of Range Sum](problem:count-of-range-sum),
   [Constrained Subsequence Sum](problem:constrained-subsequence-sum). All three
   are sums, so none of them is a sparse table. Work them with a prefix sum plus
   a deque, a Fenwick tree, or a segment tree, and the boundary this topic draws
   will be permanent.
`;export{e as default};