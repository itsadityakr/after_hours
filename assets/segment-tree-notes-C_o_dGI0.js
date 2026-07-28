var e=`A [Fenwick tree](#/dsa/fenwick-tree-binary-indexed-tree/notes) answers "what is
the sum of this range" while the array changes, in ten lines. Now change the
question to "what is the *minimum* of this range". The Fenwick trick was
\`sum(r) - sum(l - 1)\`, and subtraction is meaningless for a minimum — knowing
the smallest of a[0..6] and the smallest of a[0..2] tells you nothing about the
smallest of a[3..6]. The structure does not apply at all.

A segment tree is the version with no such restriction. Every node stands for a
contiguous range and stores the answer for that range: the root is the whole
array, its children are the two halves, the leaves are single elements. Any range
you ask about is the union of O(log n) of these nodes, so a query walks down,
collects a handful of precomputed answers, and combines them. The price is fifty
lines rather than ten and 4n slots rather than n. What you get back is a combine
that can be anything associative — sum, min, max, gcd, product, bitwise or — and
lazy propagation, which lets an update hit a whole range at once.

## What the tree looks like

Take \`a = [5, 8, 6, 3, 2, 7, 2, 6]\` with sum as the operation. Number nodes from
1 and give node \`i\` the children \`2i\` and \`2i + 1\` — the same implicit numbering
a binary heap uses, so there are no pointers and no objects, just an array and
arithmetic.

\`\`\`text
                          1: [0,7] = 39
                   /                        \\
           2: [0,3] = 22                3: [4,7] = 17
          /           \\                 /           \\
   4:[0,1]=13     5:[2,3]=9      6:[4,5]=9      7:[6,7]=8
     /    \\         /    \\         /    \\         /    \\
  8:5    9:8    10:6   11:3    12:2   13:7    14:2   15:6
  a[0]   a[1]   a[2]   a[3]    a[4]   a[5]    a[6]   a[7]
\`\`\`

- **A node never stores its own range.** \`lo\` and \`hi\` are passed down as
  parameters. Storing them would double the memory for nothing.
- **The height is ⌈log₂ n⌉.** Eight leaves, four levels; 10⁵ leaves, seventeen.
- **Every parent is the combination of its two children.** That one invariant is
  what build maintains, update restores, and query exploits.

## Why the array is 4n and not 2n

![At n = 6 the highest index used is 13, past the 12 slots that 2n gives](diagrams/segment-tree-notes-four-n.jpg)

A perfect binary tree with n leaves has 2n − 1 nodes, so with heap numbering the
highest index is 2n − 1. That is where \`2n\` comes from, and it is right — as long
as n is a power of two.

When it is not, \`mid = (lo + hi) / 2\` splits into unequal parts and the tree is
no longer perfect. Some leaves sit a level deeper, and because the numbering
reserves a slot for every position of a perfect tree of that height, indices run
past 2n. Six elements is enough to show it:

\`\`\`text
n = 6
                     1: [0,5]
              2: [0,2]         3: [3,5]
        4: [0,1]    5: [2]   6: [3,4]    7: [5]
     8: [0]  9: [1]        12: [3] 13: [4]

highest index used = 13.   2n = 12.   An array of size 12 has already
overflowed, and nothing warned you.
\`\`\`

The safe bound is easy to argue: round n up to the next power of two P; since
P < 2n, a perfect tree on P leaves uses indices 1 to 2P − 1 < 4n. So \`4n\` always
fits. It wastes space — the true worst case is nearer 2.8n — but nobody has
regretted \`new long[4 * n]\`, and plenty of people have lost an evening to an
\`ArrayIndexOutOfBoundsException\` from \`2 * n\`.

## Build: one post-order pass

Recurse to the leaves, set each leaf to its element, then on the way back out set
each parent to the combination of the two children just built.

\`\`\`java
private void build(int node, int lo, int hi, int[] a) {
    if (lo == hi) { t[node] = a[lo]; return; }        // a leaf: one element
    int mid = (lo + hi) / 2;
    build(2 * node, lo, mid, a);
    build(2 * node + 1, mid + 1, hi, a);
    t[node] = t[2 * node] + t[2 * node + 1];          // the combine
}
\`\`\`

Every node is visited once and does O(1) work, so the build is O(n) — not
O(n log n). Call it as \`build(1, 0, n - 1, a)\`.

## The query, and its three cases

![A query range covered by three precomputed nodes, the rest pruned](diagrams/segment-tree-notes-range-decomposition.jpg)

This is the part worth memorising, because every segment tree function you will
ever write has the same skeleton. You are at a node covering \`[lo, hi]\` and you
want \`[l, r]\`:

\`\`\`text
1. no overlap      hi < l  or  r < lo        return the identity, ask no further
2. total overlap   l <= lo  and  hi <= r     return t[node], it is the answer
3. partial         anything else             ask both children, combine the two
\`\`\`

Keep them in that order: "no overlap" is the only test that can fire on a node
the query has nothing to do with, so putting it first means the other two never
have to consider a node out of range. Case 2 earns the logarithm — without the
early return you would descend to the leaves every time and the query would be
O(n).

\`\`\`java
private long query(int node, int lo, int hi, int l, int r) {
    if (r < lo || hi < l) return 0;                   // identity for sum
    if (l <= lo && hi <= r) return t[node];
    int mid = (lo + hi) / 2;
    return query(2 * node, lo, mid, l, r)
         + query(2 * node + 1, mid + 1, hi, l, r);
}
\`\`\`

Run \`query(2, 6)\` on the tree above and watch which case fires where:

\`\`\`text
query(l = 2, r = 6)                                   contributes

 1: [0,7]   partial       -> descend
   2: [0,3]   partial     -> descend
     4: [0,1]   no overlap (hi 1 < l 2)                     0
     5: [2,3]   total     -> t[5]                           9
   3: [4,7]   partial     -> descend
     6: [4,5]   total     -> t[6]                           9
     7: [6,7]   partial   -> descend
       14: [6,6]  total   -> t[14]                          2
       15: [7,7]  no overlap (lo 7 > r 6)                   0
                                                       ------
                                                           20   = 6+3+2+7+2
\`\`\`

Three nodes did the work and the rest were pruned. At any level at most two nodes
are partial, because the query range has only two ends, so the recursion touches
O(log n) nodes.

## Point update

The same descent with only one child ever taken, and the combine reapplied on the
way back out.

\`\`\`text
set(4, 10)                         a[4] was 2

 1: [0,7]  -> 4 is in [4,7], go right
   3: [4,7] -> 4 is in [4,5], go left
     6: [4,5] -> leaf side, go left
       12: [4,4]  write 10
     6 = 10 + 7 = 17     (was 9)
   3 = 17 + 8 = 25       (was 17)
 1 = 22 + 25 = 47        (was 39)

only the four nodes on the path changed
\`\`\`

## A complete segment tree

\`\`\`java SegTree.java @run-segment-tree-seg-tree
import java.util.Arrays;

public class SegTree {

    private final int n;
    private final long[] t;        // node 1 is the root; children of i are 2i and 2i + 1

    SegTree(int[] a) {
        n = a.length;
        t = new long[4 * n];       // 4n is the bound that is always safe
        build(1, 0, n - 1, a);
    }

    private void build(int node, int lo, int hi, int[] a) {
        if (lo == hi) { t[node] = a[lo]; return; }
        int mid = (lo + hi) / 2;
        build(2 * node, lo, mid, a);
        build(2 * node + 1, mid + 1, hi, a);
        t[node] = t[2 * node] + t[2 * node + 1];
    }

    /** Sum of a[l..r], inclusive and zero-based. */
    long query(int l, int r) { return query(1, 0, n - 1, l, r); }

    private long query(int node, int lo, int hi, int l, int r) {
        if (r < lo || hi < l) return 0;                      // 1. no overlap
        if (l <= lo && hi <= r) return t[node];              // 2. total overlap
        int mid = (lo + hi) / 2;                             // 3. partial
        return query(2 * node, lo, mid, l, r)
             + query(2 * node + 1, mid + 1, hi, l, r);
    }

    /** a[i] = v. */
    void set(int i, int v) { set(1, 0, n - 1, i, v); }

    private void set(int node, int lo, int hi, int i, int v) {
        if (lo == hi) { t[node] = v; return; }
        int mid = (lo + hi) / 2;
        if (i <= mid) set(2 * node, lo, mid, i, v);
        else set(2 * node + 1, mid + 1, hi, i, v);
        t[node] = t[2 * node] + t[2 * node + 1];
    }

    public static void main(String[] args) {
        SegTree s = new SegTree(new int[] { 5, 8, 6, 3, 2, 7, 2, 6 });
        System.out.println("nodes 1-15  " + Arrays.toString(Arrays.copyOfRange(s.t, 1, 16)));
        System.out.println("sum 2..6    " + s.query(2, 6));
        System.out.println("sum 3..3    " + s.query(3, 3));

        s.set(4, 10);
        System.out.println("after set   " + s.query(2, 6));
        System.out.println("nodes 1-15  " + Arrays.toString(Arrays.copyOfRange(s.t, 1, 16)));

        System.out.println("single      " + new SegTree(new int[] { 42 }).query(0, 0));
        SegTree odd = new SegTree(new int[] { 1, 2, 3, 4, 5, 6 });   // not a power of two
        System.out.println("six items   " + odd.query(0, 5) + " " + odd.query(1, 4));
    }
}
\`\`\`

\`\`\`output @run-segment-tree-seg-tree
nodes 1-15  [39, 22, 17, 13, 9, 9, 8, 5, 8, 6, 3, 2, 7, 2, 6]
sum 2..6    20
sum 3..3    3
after set   28
nodes 1-15  [47, 22, 25, 13, 9, 17, 8, 5, 8, 6, 3, 10, 7, 2, 6]
single      42
six items   21 14
\`\`\`

## Choosing the combine, and getting the identity right

Swap the \`+\` for anything associative and the structure is unchanged. What must
change with it is the value the "no overlap" case returns — the identity, meaning
the value that leaves the combine alone.

| Question | combine(a, b) | Identity |
|---|---|---|
| Range sum | \`a + b\` | \`0\` |
| Range minimum | \`Math.min(a, b)\` | \`Integer.MAX_VALUE\` |
| Range maximum | \`Math.max(a, b)\` | \`Integer.MIN_VALUE\` |
| Range gcd | \`gcd(a, b)\` | \`0\`, because \`gcd(0, x) == x\` |
| Range product | \`a * b\` | \`1\` |
| Range bitwise or | <code>a &#124; b</code> | \`0\` |
| Range bitwise and | \`a & b\` | \`-1\`, every bit set |

Get this wrong and the failure is quiet. Returning 0 from a minimum tree makes
every query containing a pruned branch answer 0 — correct on any array that
happens to contain a zero, wrong everywhere else. The operation must also be
**associative**, because the tree chooses the bracketing and you do not control
it; it need not be commutative, as long as the left child stays on the left. One
caution on maximum trees: \`Integer.MIN_VALUE\` is a fine identity for \`Math.max\`,
but if you ever add to the result it overflows. When values are known to be
non-negative, use 0.

## Lazy propagation: updating a whole range

Point update is O(log n). Adding 5 to every element of a range of length m by
calling it m times is O(m log n), worse than a plain array. Lazy propagation fixes
it, and the idea is a debt.

When an update covers a node's range entirely, do not descend. Fix that node's
stored answer at once — for a sum tree, \`+ v × (hi − lo + 1)\`, since every one of
its elements went up by \`v\` — and write \`v\` into a second array \`z[node]\`,
meaning: *this node's total is already correct, its children have not been told.*
Then any later operation that needs to go below this node must first hand the
debt to the children and clear it.

> **Push down before you descend.** Every time, in queries as well as updates.

\`\`\`java
/** Apply "+v to every element of [lo, hi]" to one node. */
private void apply(int node, int lo, int hi, long v) {
    t[node] += v * (hi - lo + 1);
    z[node] += v;                 // += , not = : debts accumulate
}

/** Hand this node's debt to its children, then clear it. */
private void push(int node, int lo, int hi) {
    if (z[node] == 0) return;
    int mid = (lo + hi) / 2;
    apply(2 * node, lo, mid, z[node]);
    apply(2 * node + 1, mid + 1, hi, z[node]);
    z[node] = 0;
}
\`\`\`

Watch it on \`a = [1, 1, 1, 1]\`, where \`t\` is a node's total and \`z\` its debt.

\`\`\`text
add(0, 2, +5)
 1: [0,3]  partial, z = 0, descend
   2: [0,1]  inside  -> apply +5    t = 2 + 5*2 = 12,  z = 5     stop here
   3: [2,3]  partial, descend
     6: [2,2]  inside -> apply +5   t = 1 + 5*1 = 6,   z = 5
     7: [3,3]  no overlap           t = 1
     3: t = 6 + 1 = 7
 1: t = 12 + 7 = 19        (= 4 + 5*3, correct)

sum(1, 3)
 1: [0,3]  partial, z = 0, descend
   2: [0,1]  partial -> PUSH z = 5 first:
                4: [0,0] t = 6      5: [1,1] t = 6      z[2] = 0
     4: [0,0]  no overlap                        0
     5: [1,1]  total                             6
   3: [2,3]  total -> t[3]                       7
                                              ----
                                                13     ([6,6,6,1] -> 6+6+1)
\`\`\`

Node 2 was never descended into during the update, so it held a debt of 5 for its
children. The query needed to look inside it, so the push happened exactly then.
Skip the push and nodes 4 and 5 still hold 1 each, and the query answers 3.

![A node holding a lazy debt its children have not been told about](diagrams/segment-tree-notes-lazy-debt.jpg)

- **\`z[node] += v\`, not \`=\`.** Two range-adds on the same node must accumulate. A
  range-*assign* tree composes differently — a later assign overwrites — which is
  why assign and add do not mix without care.
- **Recompute the parent after the recursion**, exactly as in point update.
- **Push in \`query\` too.** Nothing is read-only once the tree is lazy.

\`\`\`java Lazy.java @run-segment-tree-lazy
public class Lazy {

    private final int n;
    private final long[] t;        // the answer for this node's range
    private final long[] z;        // an add applied here, not yet to the children

    /** Starts at zero and adds each element as a range of length one. The
     *  post-order build from above works here unchanged and is O(n); this is
     *  O(n log n) and keeps the class down to the parts that are new. */
    Lazy(int[] a) {
        n = a.length;
        t = new long[4 * n];
        z = new long[4 * n];
        for (int i = 0; i < n; i++) add(i, i, a[i]);
    }

    private void apply(int node, int lo, int hi, long v) {
        t[node] += v * (hi - lo + 1);
        z[node] += v;
    }

    private void push(int node, int lo, int hi) {
        if (z[node] == 0) return;
        int mid = (lo + hi) / 2;
        apply(2 * node, lo, mid, z[node]);
        apply(2 * node + 1, mid + 1, hi, z[node]);
        z[node] = 0;
    }

    /** Add v to every element of a[l..r]. */
    void add(int l, int r, long v) { add(1, 0, n - 1, l, r, v); }

    private void add(int node, int lo, int hi, int l, int r, long v) {
        if (r < lo || hi < l) return;
        if (l <= lo && hi <= r) { apply(node, lo, hi, v); return; }
        push(node, lo, hi);
        int mid = (lo + hi) / 2;
        add(2 * node, lo, mid, l, r, v);
        add(2 * node + 1, mid + 1, hi, l, r, v);
        t[node] = t[2 * node] + t[2 * node + 1];
    }

    /** Sum of a[l..r]. */
    long sum(int l, int r) { return sum(1, 0, n - 1, l, r); }

    private long sum(int node, int lo, int hi, int l, int r) {
        if (r < lo || hi < l) return 0;
        if (l <= lo && hi <= r) return t[node];
        push(node, lo, hi);
        int mid = (lo + hi) / 2;
        return sum(2 * node, lo, mid, l, r) + sum(2 * node + 1, mid + 1, hi, l, r);
    }

    public static void main(String[] args) {
        Lazy s = new Lazy(new int[] { 1, 1, 1, 1 });
        s.add(0, 2, 5);
        System.out.println("sum 0..3   " + s.sum(0, 3));
        System.out.println("sum 1..3   " + s.sum(1, 3));
        s.add(1, 3, 2);                       // overlapping the first update
        System.out.println("each       " + s.sum(0, 0) + " " + s.sum(1, 1)
                + " " + s.sum(2, 2) + " " + s.sum(3, 3));

        Lazy big = new Lazy(new int[] { 0, 0, 0, 0, 0, 0, 0 });
        for (int i = 0; i < 7; i++) big.add(i, 6, 1);   // seven nested ranges
        System.out.println("staircase  " + big.sum(0, 6) + " " + big.sum(6, 6));
    }
}
\`\`\`

\`\`\`output @run-segment-tree-lazy
sum 0..3   19
sum 1..3   13
each       6 8 8 3
staircase  28 7
\`\`\`

## Fenwick, segment tree, or sparse table

| | Fenwick | Segment tree | Sparse table |
|---|---|---|---|
| Operations | Invertible only: sum, xor | Any associative | Idempotent only: min, max, gcd |
| Build | O(n) | O(n) | O(n log n) |
| Query | O(log n) | O(log n) | O(1) |
| Point update | O(log n) | O(log n) | Rebuild |
| Range update | Difference trick, limited | O(log n) with lazy | No |
| Space | n | 4n | n log n |
| Lines to write | About ten | About fifty | About fifteen |

The decision, in order:

1. Does the array change? If not, use a [prefix sum](#/dsa/prefix-sum/notes) for
   sums or a [sparse table](#/dsa/sparse-table/notes) for min and max. Both are
   simpler and one is O(1) per query.
2. Point updates, and the operation is a sum or an xor? Use a
   [Fenwick tree](#/dsa/fenwick-tree-binary-indexed-tree/notes) — shorter,
   smaller constant, less to get wrong under time pressure.
3. Anything else — a minimum, a range update, a combine you invented for the
   problem — is a segment tree.

## What it costs

- **Build O(n)**: every node visited once, and there are fewer than 2n nodes.
- **Query O(log n)**: at most two partial nodes per level, over ⌈log₂ n⌉ levels.
- **Point update O(log n)**: one root-to-leaf path. **Range update with lazy**:
  the same argument plus O(1) of pushing per visited node.
- **Space 4n**, doubled if you keep a lazy array. For n = 10⁵ and \`long\` that is
  3.2 MB — fine, but worth knowing before you allocate it inside a loop.
- **The constant is not small.** Recursion, two array reads and a branch per
  node. A Fenwick tree doing the same job is several times faster in practice,
  which is the real reason to prefer it when both apply.

## The mistakes, in the order people make them

1. **Sizing the array \`2n\`.** Correct only when n is a power of two, so it passes
   the small tests and throws on the real input. Use \`4 * n\`.
2. **Dropping the total-overlap case.** Without the \`l <= lo && hi <= r\` early
   return the recursion runs to the leaves and the query is O(n) — still correct,
   which is why the bug survives testing. That case is the pruning.
3. **The wrong identity.** 0 for a minimum tree, or \`Integer.MIN_VALUE\` for a
   sum. Both give answers that look plausible on some inputs.
4. **Forgetting to recompute the parent** when an update recursion returns. The
   leaf is right and everything above it is stale.
5. **Not pushing in \`query\`.** The classic lazy bug: updates look correct and
   queries return pre-update values for some ranges and not others.
6. **\`z[node] = v\` instead of \`+=\`.** Two overlapping range-adds, and the first
   one vanishes.
7. **Mixing the two numbering schemes.** The nodes are one-based, the array
   positions are zero-based. Write \`query(1, 0, n - 1, l, r)\` and never think
   about it again.
8. **\`int\` overflow.** The root holds the total of the whole array. Use \`long\`
   for the tree even when the input is \`int\`.
9. **Building on an empty array.** With \`n == 0\` the constructor calls
   \`build(1, 0, -1, a)\`, which splits and reads \`a[0]\`. Guard \`n == 0\`.

## The Java you will reach for

| You want | Write |
|---|---|
| The tree array | \`long[] t = new long[4 * n]\` |
| Children of node \`i\` | \`2 * i\` and \`2 * i + 1\` |
| Parent of node \`i\` | \`i / 2\` |
| Midpoint, safely | \`int mid = lo + (hi - lo) / 2\` |
| Minimum identity | \`Integer.MAX_VALUE\`, or \`Long.MAX_VALUE\` |
| Maximum identity | \`Integer.MIN_VALUE\`, or 0 for non-negative data |
| Print part of the tree | \`Arrays.toString(Arrays.copyOfRange(t, 1, 16))\` |
| Recursion depth | log n, so 17 frames at n = 10⁵ — no stack worries |

\`lo + (hi - lo) / 2\` and \`(lo + hi) / 2\` agree for every array size you meet here,
because both are array indices. The first is still the habit worth having — see
[binary search](#/dsa/binary-search/notes) for where it matters.

## Working one from the sheet

[Longest Increasing Subsequence II](problem:longest-increasing-subsequence-ii):
find the longest strictly increasing subsequence in which consecutive chosen
elements differ by at most \`k\`.

The O(n²) recurrence is "the best ending at \`i\` is one more than the best ending
at any earlier \`j\` with \`nums[j] < nums[i]\` and \`nums[i] - nums[j] <= k\`".
Rewritten in terms of *values* rather than positions it becomes a range: the best
answer over values in \`[nums[i] - k, nums[i] - 1]\`, plus one. That is a range
maximum query with a point update after each element. The data changes and
maximum has no inverse, so it is a segment tree and nothing else will do.

\`\`\`java Lis.java @run-segment-tree-lis
public class Lis {

    private int n;                 // the tree covers values 1..n
    private int[] t;               // a maximum tree; 0 is the identity here

    private void set(int node, int lo, int hi, int pos, int val) {
        if (lo == hi) { t[node] = Math.max(t[node], val); return; }
        int mid = lo + (hi - lo) / 2;
        if (pos <= mid) set(2 * node, lo, mid, pos, val);
        else set(2 * node + 1, mid + 1, hi, pos, val);
        t[node] = Math.max(t[2 * node], t[2 * node + 1]);
    }

    private int max(int node, int lo, int hi, int l, int r) {
        if (r < lo || hi < l) return 0;                  // identity: no subsequence
        if (l <= lo && hi <= r) return t[node];
        int mid = lo + (hi - lo) / 2;
        return Math.max(max(2 * node, lo, mid, l, r),
                        max(2 * node + 1, mid + 1, hi, l, r));
    }

    int longest(int[] nums, int k) {
        n = 1;
        for (int v : nums) n = Math.max(n, v);
        t = new int[4 * n];

        int best = 0;
        for (int v : nums) {
            int lo = Math.max(1, v - k);
            int hi = v - 1;                              // strictly increasing
            int prev = hi < lo ? 0 : max(1, 1, n, lo, hi);
            best = Math.max(best, prev + 1);
            set(1, 1, n, v, prev + 1);                   // record it at value v
        }
        return best;
    }

    public static void main(String[] args) {
        System.out.println(new Lis().longest(new int[] { 4, 2, 1, 4, 3, 4, 5, 8, 15 }, 3));
        System.out.println(new Lis().longest(new int[] { 7, 4, 5, 1, 8, 12, 4, 7 }, 5));
        System.out.println(new Lis().longest(new int[] { 1, 5 }, 1));
        System.out.println(new Lis().longest(new int[] { 3, 3, 3, 3 }, 10));
    }
}
\`\`\`

\`\`\`output @run-segment-tree-lis
5
4
1
1
\`\`\`

Notice \`hi < lo ? 0 : ...\` guarding the query. When \`v\` is 1 there are no smaller
values and the range is empty; asking the tree about \`l > r\` would recurse and
return nonsense. Empty ranges are the caller's problem, not the tree's.

## How to work through the topic

1. [Range Sum Query - Immutable](problem:range-sum-query-immutable) with a prefix
   array, then again with a segment tree written from scratch. Deliberate
   over-engineering: the point is to type \`build\`, \`query\` and the three cases
   once with nothing else in the way.
2. [Range Sum Query - Mutable](problem:range-sum-query-mutable). Build, point
   update, range query. Then write it again as a minimum tree, changing only the
   combine and the identity, and confirm nothing else moved.
3. [Kth Largest Element in a Stream](problem:kth-largest-element-in-a-stream) and
   [Product of the Last K Numbers](problem:product-of-the-last-k-numbers). Both
   have simpler answers — a heap, a running product — and it is worth knowing
   why, so you stop reaching for the tree by reflex.
4. [Range Addition](problem:range-addition),
   [Corporate Flight Bookings](problem:corporate-flight-bookings) and
   [Car Pooling](problem:car-pooling). All three fall to a plain difference array
   because every query comes after every update. Do them that way first, then
   with lazy propagation, and note where lazy is actually required.
5. [Longest Increasing Subsequence II](problem:longest-increasing-subsequence-ii)
   and [Describe the Painting](problem:describe-the-painting). Building the tree
   over the value axis rather than the position axis — the most transferable idea
   in the topic.
6. [My Calendar III](problem:my-calendar-iii),
   [Falling Squares](problem:falling-squares) and
   [Range Module](problem:range-module). Coordinates too large to index directly,
   so either compress them first or create nodes on demand.
7. [Count Integers in Intervals](problem:count-integers-in-intervals) and
   [Handling Sum Queries After Update](problem:handling-sum-queries-after-update).
   The second needs a lazy flag that is a *flip* rather than an add, which forces
   you to work out how two pending operations compose. That is where lazy
   propagation stops being a recipe.
`;export{e as default};