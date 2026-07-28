var e=`Here is the problem this pattern exists for. You are handed an array of a million
numbers and a hundred thousand questions of the form "what do the values from
index 400 to index 9000 add up to?" Answering each by looping over the range is
O(n) per question, so a hundred thousand of them is 10¹¹ additions.

But the array never changes, and every one of those loops re-adds numbers an
earlier loop already added. So do the adding once: build a second array where
slot \`i\` holds the total of everything before position \`i\`. After that the sum of
any range is one subtraction — the total up to the end minus the total up to the
start — and every question afterwards is answered in constant time.

That is the whole idea, and it generalises. Swap \`+\` for XOR and you get prefix
XOR; count instead of summing and you get prefix counts; do it in two directions
and you get 2-D prefix sums; turn it inside out and you get the difference array,
for the opposite problem of many range *updates* and one read at the end.

## What you need before you start

Only arrays and loops, plus a \`HashMap\` for the second half of the page.

- **Overflow.** 10⁵ values near a million overflow an \`int\` long before the end
  of the array, silently, wrapping to a negative number. If the values can be
  large, make the prefix array \`long[]\`.
- **Inclusive or exclusive.** Say which you mean. On this page \`a[l..r]\` includes
  both ends, and \`pre[i]\` is the sum of \`a[0..i-1]\` — everything strictly
  *before* \`i\`.
- **A \`HashMap\`.** \`map.getOrDefault(k, 0)\` reads with a fallback and
  \`map.merge(k, 1, Integer::sum)\` inserts 1 or adds 1 to what is there. Both come
  from [hash tables](#/dsa/hash-tables/notes).

## The idea, worked by hand

\`\`\`text
a   =        3    1    4    1    5    9
pre =  0    3    4    8    9   14   23
       ^                             ^
    pre[0] is 0                 pre[6] is everything

pre[i] = a[0] + a[1] + ... + a[i-1]      (everything before i)
\`\`\`

Take the sum of \`a[2..4]\`, which is 4 + 1 + 5 = 10. Everything up to and
including index 4 is \`pre[5] = 14\`; everything before index 2 is \`pre[2] = 4\`.
Subtract, and the part you did not want falls away: \`14 - 4 = 10\`.

So \`sum(l, r) = pre[r + 1] - pre[l]\`, and that is the only formula on this page
you have to remember. Everything else is this with a different operator or an
extra dimension.

## Why the array is n + 1 long

Try it with the prefix array the same length as the input, where \`pre[i]\` holds
the sum *including* \`a[i]\`. Then \`sum(l, r) = pre[r] - pre[l - 1]\`, which is fine
until \`l\` is 0 — and \`pre[-1]\` does not exist. So the code grows a special case:

\`\`\`java
int sum = (l == 0) ? pre[r] : pre[r] - pre[l - 1];   // the branch you do not want
\`\`\`

That branch is where the bugs live. In the 2-D version it becomes four branches,
and in the map version it becomes the entry you forgot to seed.

Size the array \`n + 1\` instead, with \`pre[0] = 0\` meaning "the sum of nothing",
and the special case disappears. \`l = 0\` reads \`pre[0]\`, which is 0, which is
exactly right: subtracting nothing leaves everything. The leading zero is the
empty prefix, a real value that queries genuinely need, and the same decision
reappears in the map version as the seed \`put(0, 1)\`.

## The shape

\`\`\`java
int[] pre = new int[a.length + 1];
for (int i = 0; i < a.length; i++) pre[i + 1] = pre[i] + a[i];
// sum of a[l..r] == pre[r + 1] - pre[l]
\`\`\`

- The loop runs over the **input's** indices and writes at \`i + 1\`. Writing at
  \`i\` and reading \`pre[i - 1]\` is the same code with an off-by-one waiting.
- \`pre[0]\` is never assigned. Java zero-fills a new \`int[]\`, and 0 is what you
  want.
- One pass builds it; every query afterwards touches exactly two slots.

## Building it and querying it

\`\`\`java Ranges.java @run-prefix-sum-ranges
import java.util.Arrays;

public class Ranges {

    /** pre[i] is the sum of everything before index i. */
    static int[] build(int[] a) {
        int[] pre = new int[a.length + 1];
        for (int i = 0; i < a.length; i++) pre[i + 1] = pre[i] + a[i];
        return pre;
    }

    /** The sum of a[l..r], both ends included. */
    static int rangeSum(int[] pre, int l, int r) {
        return pre[r + 1] - pre[l];
    }

    /** The index where everything left of it equals everything right of it. */
    static int pivotIndex(int[] a) {
        int total = 0;
        for (int x : a) total += x;
        int left = 0;
        for (int i = 0; i < a.length; i++) {
            if (left == total - left - a[i]) return i;   // right side, by subtraction
            left += a[i];
        }
        return -1;
    }

    public static void main(String[] args) {
        int[] a = { 3, 1, 4, 1, 5, 9, 2, 6 };
        int[] pre = build(a);
        System.out.println("pre      " + Arrays.toString(pre));
        System.out.println("a[0..3]  " + rangeSum(pre, 0, 3));   // the l == 0 case
        System.out.println("a[7..7]  " + rangeSum(pre, 7, 7));   // a single element
        System.out.println("whole    " + rangeSum(pre, 0, a.length - 1));
        System.out.println("pivot    " + pivotIndex(new int[] { 1, 7, 3, 6, 5, 6 }));
        System.out.println("pivot    " + pivotIndex(new int[] { 1, 2, 3 }));
    }
}
\`\`\`

\`\`\`output @run-prefix-sum-ranges
pre      [0, 3, 4, 8, 9, 14, 23, 25, 31]
a[0..3]  9
a[7..7]  6
whole    31
pivot    3
pivot    -1
\`\`\`

\`pivotIndex\` — [Find Pivot Index](problem:find-pivot-index) — shows the other way
to use the idea. It never builds the array; it carries the running left sum and
gets the right sum by subtraction, \`total - left - a[i]\`. When one sweep is
enough, the carried running total *is* the prefix sum, and
[Running Sum of 1d Array](problem:running-sum-of-1d-array) and
[Find the Highest Altitude](problem:find-the-highest-altitude) are the same shape
with less around them. [Range Sum Query -
Immutable](problem:range-sum-query-immutable) is where the array is worth
allocating, because the queries keep coming — "immutable" in the title is the
whole hint.

## When the range is not given: prefix sums in a map

[Subarray Sum Equals K](problem:subarray-sum-equals-k) does not tell you the
range — it asks how many ranges sum to \`k\`, and there are n(n+1)/2 of them.

Rewrite the condition. A subarray \`a[l..r]\` sums to \`k\` exactly when
\`pre[r + 1] - pre[l] == k\`, which is the same as \`pre[l] == pre[r + 1] - k\`. So
walk left to right keeping the running sum: at each position, the number of
subarrays *ending here* that sum to \`k\` is the number of earlier prefixes equal
to \`running - k\`. A map from prefix value to how many times it has been seen
answers that in constant time, and the whole thing becomes one pass.

The seed is the part everybody forgets. \`seen.put(0, 1)\` before the loop records
that the empty prefix, with sum 0, has been seen once. Without it, every subarray
that starts at index 0 goes uncounted — on \`[1,1,1]\` with \`k = 2\` you get 1
instead of 2.

### Counts, not sums

[Contiguous Array](problem:contiguous-array) wants the longest run with as many
zeroes as ones. That is not a sum question until you make it one: score a 1 as
\`+1\` and a 0 as \`-1\`. Now "equally many" means "the running score is unchanged",
so the run from \`i + 1\` to \`j\` is balanced exactly when the score at \`i\` equals
the score at \`j\`.

The map changes with the question. Counting subarrays wants *value to how many
times seen*, seeded \`put(0, 1)\`. Finding the **longest** wants *value to the
earliest index it appeared*, seeded \`put(0, -1)\`, and you never overwrite an
entry — an earlier first sighting gives a longer run.

### The same trick with XOR

XOR is its own inverse, \`x ^ x == 0\`, which is the property the subtraction
argument needs. Where sums subtract, XORs XOR again.

\`\`\`java
running ^= x;
count += seen.getOrDefault(running ^ k, 0);   // the prefix that would leave k
seen.merge(running, 1, Integer::sum);
\`\`\`

See [bit manipulation](#/dsa/bit-manipulation/notes) for why XOR cancels.

### Where a sliding window cannot go

A [sliding window](#/dsa/sliding-window/notes) also finds subarrays with a given
sum, in O(n) time and O(1) space — but only when every value is non-negative. Its
shrink rule is "the sum is too big, so drop from the left and it gets smaller",
and that is false the moment a negative value is in play: dropping a \`-5\` makes
the sum *larger*.

Prefix sums never assume the running total moves in one direction, so
\`[1, -1, 0]\` and \`[-3, 4, -1]\` need no special case. That is the deciding
question: **can the values be negative?** If yes, it is a prefix sum with a map.
If they are all non-negative and the question is "longest" or "shortest", a
window is cheaper on space.

\`\`\`java Counting.java @run-prefix-sum-counting
import java.util.HashMap;
import java.util.Map;

public class Counting {

    /** How many subarrays sum to exactly k. Negatives are fine. */
    static int subarraySum(int[] a, int k) {
        Map<Integer, Integer> seen = new HashMap<>();
        seen.put(0, 1);                 // the empty prefix, seen once
        int running = 0, count = 0;
        for (int x : a) {
            running += x;
            count += seen.getOrDefault(running - k, 0);   // count first
            seen.merge(running, 1, Integer::sum);         // then record
        }
        return count;
    }

    /** The longest run with as many 0s as 1s: score +1 for a 1, -1 for a 0. */
    static int longestBalanced(int[] a) {
        Map<Integer, Integer> firstAt = new HashMap<>();
        firstAt.put(0, -1);             // score 0 happened before index 0
        int score = 0, best = 0;
        for (int i = 0; i < a.length; i++) {
            score += (a[i] == 1) ? 1 : -1;
            Integer earlier = firstAt.get(score);
            if (earlier != null) best = Math.max(best, i - earlier);
            else firstAt.put(score, i);   // keep the FIRST sighting, never overwrite
        }
        return best;
    }

    public static void main(String[] args) {
        System.out.println("sum = 2   " + subarraySum(new int[] { 1, 1, 1 }, 2));
        System.out.println("sum = 0   " + subarraySum(new int[] { 1, -1, 0 }, 0));
        System.out.println("sum = 3   " + subarraySum(new int[] { 3 }, 3));
        System.out.println("balanced  " + longestBalanced(new int[] { 0, 1 }));
        System.out.println("balanced  " + longestBalanced(new int[] { 0, 0, 1, 0, 0, 0, 1, 1 }));
    }
}
\`\`\`

\`\`\`output @run-prefix-sum-counting
sum = 2   2
sum = 0   3
sum = 3   1
balanced  2
balanced  6
\`\`\`

The second test is the one that matters: \`[1, -1, 0]\` with \`k = 0\` has three
answers — \`[1,-1]\`, \`[1,-1,0]\` and \`[0]\` — and a sliding window finds none of
them. \`firstAt.get\` returns a boxed \`Integer\` that can be \`null\`, which is why
the check is \`earlier != null\`; comparing boxed values with \`==\` compares
references, and outside the cached range of -128 to 127 that returns false.

## Two dimensions, and inclusion–exclusion

For a grid, \`pre[r][c]\` holds the sum of the rectangle above and to the left of
\`(r, c)\`, excluding row \`r\` and column \`c\`. Build and query both come from the
same overlap argument.

\`\`\`text
build pre[r+1][c+1], the block ending at cell (r, c):

    m[r][c] + pre[r][c+1] + pre[r+1][c] - pre[r][c]
              everything     everything    the block inside
              above          to the left   both, added twice

query the rectangle (r1,c1) to (r2,c2):

    pre[r2+1][c2+1]     everything up to the bottom-right corner
  - pre[r1][c2+1]       minus the band above it
  - pre[r2+1][c1]       minus the band to its left
  + pre[r1][c1]         plus the top-left block, subtracted twice
\`\`\`

\`\`\`java Grid.java @run-prefix-sum-grid
public class Grid {

    private final int[][] pre;

    Grid(int[][] m) {
        int rows = m.length, cols = m[0].length;
        pre = new int[rows + 1][cols + 1];      // the +1 border of zeroes again
        for (int r = 0; r < rows; r++)
            for (int c = 0; c < cols; c++)
                pre[r + 1][c + 1] = m[r][c] + pre[r][c + 1] + pre[r + 1][c] - pre[r][c];
    }

    /** The sum of the rectangle with corners (r1,c1) and (r2,c2), inclusive. */
    int sum(int r1, int c1, int r2, int c2) {
        return pre[r2 + 1][c2 + 1] - pre[r1][c2 + 1] - pre[r2 + 1][c1] + pre[r1][c1];
    }

    public static void main(String[] args) {
        int[][] m = {
            { 3, 0, 1, 4, 2 },
            { 5, 6, 3, 2, 1 },
            { 1, 2, 0, 1, 5 },
            { 4, 1, 0, 1, 7 },
            { 1, 0, 3, 0, 5 },
        };
        Grid g = new Grid(m);
        System.out.println("whole grid    " + g.sum(0, 0, 4, 4));
        System.out.println("(2,1)-(4,3)   " + g.sum(2, 1, 4, 3));
        System.out.println("(1,2)-(2,4)   " + g.sum(1, 2, 2, 4));
        System.out.println("single cell   " + g.sum(0, 0, 0, 0));
    }
}
\`\`\`

\`\`\`output @run-prefix-sum-grid
whole grid    58
(2,1)-(4,3)   8
(1,2)-(2,4)   12
single cell   3
\`\`\`

That is [Range Sum Query 2D - Immutable](problem:range-sum-query-2d-immutable) in
full. [Number of Submatrices That Sum to
Target](problem:number-of-submatrices-that-sum-to-target) and [Max Sum of
Rectangle No Larger Than K](problem:max-sum-of-rectangle-no-larger-than-k) build
on it: fix a pair of rows, collapse the strip between them into a 1-D array of
column sums, then run the map trick on that array. See
[matrix](#/dsa/matrix/notes) for the grid handling itself.

## The difference array, which is the mirror

Prefix sums answer many range queries over data that does not change. The
difference array answers the opposite: many range **updates**, with the values
read only at the end. Store the *changes* rather than the values — to add \`v\` to
everything in \`[l, r]\`, record \`+v\` at \`l\` and \`-v\` at \`r + 1\`, which is two
writes. One prefix pass at the end turns the changes back into values.

\`\`\`java
int[] diff = new int[n + 1];        // n + 1 again, so r + 1 == n is legal
diff[l] += v;
diff[r + 1] -= v;

int[] out = new int[n];
int running = 0;
for (int i = 0; i < n; i++) {
    running += diff[i];
    out[i] = running;
}
\`\`\`

\`\`\`text
n = 5, add 3 to [1,3], then add 2 to [0,2]

diff:    [ 2,  3,  0, -3, -2,  0 ]
out:     [ 2,  5,  5,  2,  0 ]
               ^-- 3 + 2, both ranges cover index 1
\`\`\`

The rule of thumb: **prefix sum for range read plus point update, difference
array for range update plus point read.** Needing both at once is a Fenwick tree,
and a later topic.

## The variants

| Variant | Build | Answers |
|---|---|---|
| 1-D prefix sum | \`pre[i+1] = pre[i] + a[i]\` | sum of any range, O(1) |
| Running total only | one carried variable | one sweep, no array needed |
| Prefix with a map | value to count seen | how many subarrays sum to k |
| Prefix with a map | value to first index | the longest subarray summing to k |
| Prefix XOR | \`running ^= a[i]\` | subarrays XOR-ing to k |
| Prefix count | \`+1\` / \`-1\` scoring | equal counts of two things |
| 2-D prefix | inclusion–exclusion | any rectangle, O(1) |
| Difference array | \`+v\` at \`l\`, \`-v\` at \`r+1\` | many range updates |

## What it costs

| Operation | Time | Space |
|---|---|---|
| Build 1-D | O(n) | O(n), or O(1) carrying a running total |
| One range query | O(1) | — |
| q queries after the build | O(n + q) | O(n) |
| The loop it replaces | O(nq) | O(1) |
| Build 2-D | O(rows × cols) | O(rows × cols) |
| Map version, one pass | O(n) average | O(n) |

The trade is memory for time, and it pays only when the queries outnumber the
build. The map version is O(n) *average* rather than guaranteed, because it
inherits the hash table's average-case bound.

## The mistakes, in the order people make them

1. **Sizing the array \`n\`.** Then \`l = 0\` needs \`pre[-1]\` and you write a special
   case. \`n + 1\` with \`pre[0] = 0\` removes it.
2. **Forgetting \`pre[r + 1]\`.** \`pre[r] - pre[l]\` is the sum of \`a[l..r-1]\` — off
   by one element, every time, quietly.
3. **Forgetting \`put(0, 1)\`.** Every subarray beginning at index 0 goes
   uncounted, so the answer is out by exactly one, which is easy to mistake for a
   boundary bug elsewhere.
4. **Seeding \`put(0, 0)\` for the longest version.** It is \`put(0, -1)\`, because
   the empty prefix sits *before* index 0 and \`i - (-1)\` is the length of a run
   starting at the beginning.
5. **Overwriting the map entry in the longest version.** Keeping the latest index
   shortens every run that uses it. Keep the first.
6. **Updating the map before counting.** With \`k = 0\` that lets a prefix pair
   with itself and counts an empty subarray. Count first, then record.
7. **\`int\` overflow.** The last slot holds the total of everything. Use \`long[]\`.
8. **A sliding window when the values can be negative.** The shrink rule is
   invalid, and the solution passes the positive examples only.
9. **Missing the \`+pre[r1][c1]\` in 2-D.** Both bands contain that corner, so it
   is removed twice and has to be added back.

## The Java you will reach for

| You want | Write |
|---|---|
| An \`n + 1\` array of zeroes | \`new int[n + 1]\` — Java zero-fills it |
| A large-value prefix array | \`new long[n + 1]\` |
| Read with a fallback | \`map.getOrDefault(key, 0)\` |
| Insert 1, or add 1 | \`map.merge(key, 1, Integer::sum)\` |
| Insert only if absent | \`map.putIfAbsent(key, i)\` |
| A 2-D prefix grid | \`new int[rows + 1][cols + 1]\` |
| Java's own running sum | \`Arrays.parallelPrefix(a, Integer::sum)\` |
| Print a grid | \`Arrays.deepToString(grid)\` |

\`map.putIfAbsent(key, i)\` is the "keep the first sighting" rule as one call, and
\`Arrays.parallelPrefix\` rewrites the array in place with the running totals —
the \`n\`-length form, rarely what you want, because it gives up the leading zero.

## Working one from the sheet

[Count Number of Nice Subarrays](problem:count-number-of-nice-subarrays): count
the subarrays containing exactly \`k\` odd numbers.

Nothing here mentions sums, which is the point. Score each element \`1\` if it is
odd and \`0\` if it is even. Then "contains exactly \`k\` odd numbers" becomes "the
scores in this subarray sum to \`k\`", which is
[Subarray Sum Equals K](problem:subarray-sum-equals-k) with a different input —
the same map, the same seed, the same three lines in the loop.

\`\`\`java Nice.java @run-prefix-sum-nice
import java.util.HashMap;
import java.util.Map;

public class Nice {

    static int numberOfSubarrays(int[] a, int k) {
        Map<Integer, Integer> seen = new HashMap<>();
        seen.put(0, 1);                    // the empty prefix has 0 odd numbers
        int odds = 0, count = 0;
        for (int x : a) {
            odds += x & 1;                 // 1 when x is odd, 0 when even
            count += seen.getOrDefault(odds - k, 0);
            seen.merge(odds, 1, Integer::sum);
        }
        return count;
    }

    public static void main(String[] args) {
        System.out.println(numberOfSubarrays(new int[] { 1, 1, 2, 1, 1 }, 3));
        System.out.println(numberOfSubarrays(new int[] { 2, 4, 6 }, 1));
        System.out.println(numberOfSubarrays(new int[] { 2, 2, 2, 1, 2, 2, 1, 2, 2, 2 }, 2));
    }
}
\`\`\`

\`\`\`output @run-prefix-sum-nice
2
0
16
\`\`\`

\`x & 1\` is the lowest bit of \`x\`, 1 exactly when \`x\` is odd — see
[bit manipulation](#/dsa/bit-manipulation/notes). The habit worth taking away is
the translation: whenever a question asks *how many subarrays have exactly k of
something*, score that something 1 and everything else 0, and it is a prefix sum.

## How to work through the topic

1. [Running Sum of 1d Array](problem:running-sum-of-1d-array),
   [Find the Highest Altitude](problem:find-the-highest-altitude). Build it once
   by hand, and check the \`n + 1\` version against the \`n\` version to watch the
   special case appear.
2. [Range Sum Query - Immutable](problem:range-sum-query-immutable). The build
   goes in the constructor and the query is one subtraction. If you are looping
   inside the query, you have missed the point.
3. [Find Pivot Index](problem:find-pivot-index), [Number of Ways to Split
   Array](problem:number-of-ways-to-split-array), [Minimum Value to Get Positive
   Step by Step Sum](problem:minimum-value-to-get-positive-step-by-step-sum).
   Left sum and right sum by subtraction, with no second array.
4. [Subarray Sum Equals K](problem:subarray-sum-equals-k). The map version. Get
   \`put(0, 1)\` and the count-before-you-record order right, then test on an input
   with negatives.
5. [Contiguous Array](problem:contiguous-array), [Maximum Size Subarray Sum
   Equals k](problem:maximum-size-subarray-sum-equals-k). The longest variant:
   first indices, seeded \`put(0, -1)\`, never overwritten — plus \`+1\`/\`-1\` scoring.
   Then [Range Sum Query 2D - Immutable](problem:range-sum-query-2d-immutable)
   and [Product of Array Except Self](problem:product-of-array-except-self): two
   dimensions, then the prefix-and-suffix version of the same idea with \`×\`.
6. [Count Number of Nice Subarrays](problem:count-number-of-nice-subarrays),
   [Number of Submatrices That Sum to
   Target](problem:number-of-submatrices-that-sum-to-target), [Count of Range
   Sum](problem:count-of-range-sum). Translating a question into a sum, then
   collapsing a grid onto a line. Leave these until 1 to 6 are automatic.
`;export{e as default};