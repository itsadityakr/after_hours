var e=`Given a row of numbers, some positive and some negative, find the contiguous run
with the largest total. The brute force writes itself: pick a start, pick an
end, add up what is in between. That is O(n³), or O(n²) if you keep a running
total as the end moves. Both are fine for a hundred numbers and useless for a
hundred thousand.

The one-pass answer is short enough to type from memory, which is exactly why it
is worth deriving instead. Memorised, it is four lines you will get subtly wrong
under pressure. Derived, it is one question asked at every index — and every
variant on this page is that same question maximising something else.

Here is the question. Walk left to right, and at each index \`i\` ask only this:
**what is the best run that ends exactly at \`i\`?** Not the best run anywhere —
the best run forced to include \`a[i]\` as its last element. Answer that at every
index and the real answer is the largest of those n answers, because every run
ends somewhere.

## The one decision

Call the best run ending at \`i\` the value \`here\`. There are exactly two
candidates for it, and no others:

- The best run ending at \`i - 1\`, with \`a[i]\` glued onto the end of it. That is
  \`here + a[i]\`.
- A brand new run consisting of \`a[i]\` alone. That is \`a[i]\`.

Nothing else is possible. Any run ending at \`i\` that is longer than one element
is some run ending at \`i - 1\` plus \`a[i]\`, and among those the best one to
extend is the best one there was, because they all get the same \`+ a[i]\`.

So \`here = Math.max(a[i], here + a[i])\`. Extend, or start again.

Now look at when the two branches differ. \`here + a[i]\` beats \`a[i]\` exactly
when \`here > 0\`. So the rule in words is:

> Keep the run you have unless it has gone negative. A negative run so far is a
> liability — dragging it along makes everything after it worse than starting
> fresh would.

That is the whole algorithm. The \`Math.max\` version and the \`if (here < 0)\`
version are the same thing said two ways, and the second is the one to say in an
interview because it explains itself.

## Watching it run

\`\`\`text
a =      -2    1   -3    4   -1    2    1   -5    4

i = 0   here = -2                              (nothing to extend)
i = 1   here < 0, start again        here = 1
i = 2   1 is positive, extend        here = -2
i = 3   here < 0, start again        here = 4
i = 4   extend                       here = 3
i = 5   extend                       here = 5
i = 6   extend                       here = 6
i = 7   extend                       here = 1
i = 8   extend                       here = 5

best = largest here ever seen        = 6      the run [4, -1, 2, 1]
\`\`\`

Two things to notice. At \`i = 2\` the run was worth 1 and became −2: still
extended, because the run was positive when the decision was made. And at
\`i = 7\` the run dropped from 6 to 1 without being abandoned, because 1 is still
better than starting again at −5 — and \`best\` had already banked the 6. \`best\`
never goes down. \`here\` does, constantly.

## The shape

\`\`\`java
int best = a[0], here = a[0];
for (int i = 1; i < a.length; i++) {
    here = Math.max(a[i], here + a[i]);   // extend, or start again
    best = Math.max(best, here);
}
return best;
\`\`\`

Four things about those five lines:

- Both variables start at \`a[0]\`, not at 0. The loop starts at \`i = 1\`, because
  index 0 has nothing to extend and its answer is itself.
- \`here\` is updated before \`best\`. The run ending at \`i\` has to exist before you
  can ask whether it is the best one.
- The array must be non-empty. \`a[0]\` on a zero-length array throws. Most
  statements of the problem guarantee at least one element; check.
- There is no inner loop and nothing is stored. O(n) time, O(1) space.

## Why best = 0 is wrong

The single most common bug on this page is writing \`int best = 0\`.

It looks harmless. It is a maximum, 0 is small, and on any array with a positive
number in it the answer comes out right. Then the test case \`[-3, -1, -2]\`
arrives, and the code returns 0.

Zero is only the correct answer if the empty subarray is allowed, and
[Maximum Subarray](problem:maximum-subarray) requires the subarray to contain at
least one number. On \`[-3, -1, -2]\` the best run is the single element \`-1\`.
Returning 0 claims a run that is not on the board.

So: **start both variables at \`a[0]\`, or at \`Integer.MIN_VALUE\`, never at 0** —
unless the problem says in so many words that an empty selection is permitted,
in which case \`Math.max(kadane(a), 0)\` at the end is clearer than baking it into
the loop.

## Where was it, not just what was it

Plenty of questions want the indices of the best run rather than its total, and
the change is small: remember where the current run started, and when you start
again, that is a new start.

\`\`\`java
int start = 0, from = 0, to = 0;
if (here < 0) { here = a[i]; start = i; }   // starting again — new start index
else here += a[i];
if (here > best) { best = here; from = start; to = i; }
\`\`\`

\`>\` and not \`>=\` in the last line. With \`>=\` you overwrite a tied answer with a
later one, and the two are different subarrays with the same total — sometimes
the question cares which you report, and the earliest is the conventional
choice.

\`\`\`java Kadane.java @run-kadanes-algorithm-kadane
import java.util.Arrays;

public class Kadane {

    /** The largest total of any non-empty contiguous run. */
    static int best(int[] a) {
        int best = a[0], here = a[0];
        for (int i = 1; i < a.length; i++) {
            here = Math.max(a[i], here + a[i]);
            best = Math.max(best, here);
        }
        return best;
    }

    /** The same walk, reporting { total, from, to } with both ends inclusive. */
    static int[] bestRange(int[] a) {
        int here = a[0], best = a[0];
        int start = 0, from = 0, to = 0;
        for (int i = 1; i < a.length; i++) {
            if (here < 0) { here = a[i]; start = i; }   // the run so far is a liability
            else here += a[i];
            if (here > best) { best = here; from = start; to = i; }
        }
        return new int[] { best, from, to };
    }

    /** Best profit from one buy and one later sell: Kadane over the day-to-day changes. */
    static int maxProfit(int[] price) {
        int here = 0, best = 0;                          // doing nothing is allowed, so 0
        for (int i = 1; i < price.length; i++) {
            here = Math.max(0, here + price[i] - price[i - 1]);
            best = Math.max(best, here);
        }
        return best;
    }

    public static void main(String[] args) {
        int[] mixed = { -2, 1, -3, 4, -1, 2, 1, -5, 4 };
        System.out.println("mixed         " + best(mixed));
        System.out.println("  range       " + Arrays.toString(bestRange(mixed)));

        int[] negative = { -3, -1, -2 };
        System.out.println("all negative  " + best(negative));
        System.out.println("  range       " + Arrays.toString(bestRange(negative)));

        System.out.println("single        " + best(new int[] { 7 }));
        System.out.println("profit        " + maxProfit(new int[] { 7, 1, 5, 3, 6, 4 }));
        System.out.println("profit, falls " + maxProfit(new int[] { 7, 6, 4, 3, 1 }));
    }
}
\`\`\`

\`\`\`output @run-kadanes-algorithm-kadane
mixed         6
  range       [6, 3, 6]
all negative  -1
  range       [-1, 1, 1]
single        7
profit        5
profit, falls 0
\`\`\`

\`maxProfit\` is worth staring at. [Best Time to Buy and Sell Stock](problem:best-time-to-buy-and-sell-stock)
does not look like a subarray problem, but the profit from buying on day \`i\` and
selling on day \`j\` is the sum of the daily changes between them. So the best
profit is the best subarray of the difference array — Kadane, with \`best\`
starting at 0 because you are permitted not to trade. The differences are never
built; \`price[i] - price[i-1]\` is computed as it goes.

## The maximum product variant

[Maximum Product Subarray](problem:maximum-product-subarray) changes \`+\` to \`×\`
and breaks the derivation, because a large negative is no longer a liability. It
is one negative away from being the largest product on the board.

\`−8\` is a bad running total for a sum. For a product it is the best possible
thing to be holding when the next element is \`−4\`.

So carry two running values instead of one: the largest product ending here and
the smallest. When the next element is negative, multiplying swaps their roles —
the largest becomes the smallest and the smallest becomes the largest — so swap
them before you use them.

\`\`\`text
a =        -2      3      -4

i = 0    hi = -2         lo = -2
i = 1    x = 3, positive, no swap
         hi = max(3, -2*3) = 3
         lo = min(3, -2*3) = -6
i = 2    x = -4, negative, swap first:  hi = -6, lo = 3
         hi = max(-4, -6*-4) = 24     <- the answer, out of the smallest
         lo = min(-4,  3*-4) = -12

best = 24, the whole array
\`\`\`

\`\`\`java Product.java @run-kadanes-algorithm-product
public class Product {

    /** The largest product of any non-empty contiguous run. */
    static int maxProduct(int[] a) {
        int best = a[0], hi = a[0], lo = a[0];
        for (int i = 1; i < a.length; i++) {
            int x = a[i];
            if (x < 0) { int t = hi; hi = lo; lo = t; }   // a negative swaps the roles
            hi = Math.max(x, hi * x);
            lo = Math.min(x, lo * x);
            best = Math.max(best, hi);
        }
        return best;
    }

    public static void main(String[] args) {
        System.out.println("2 3 -2 4    " + maxProduct(new int[] { 2, 3, -2, 4 }));
        System.out.println("-2 0 -1     " + maxProduct(new int[] { -2, 0, -1 }));
        System.out.println("-2 3 -4     " + maxProduct(new int[] { -2, 3, -4 }));
        System.out.println("-2 -3 -4    " + maxProduct(new int[] { -2, -3, -4 }));
        System.out.println("0 2         " + maxProduct(new int[] { 0, 2 }));
        System.out.println("single -5   " + maxProduct(new int[] { -5 }));
    }
}
\`\`\`

\`\`\`output @run-kadanes-algorithm-product
2 3 -2 4    6
-2 0 -1     0
-2 3 -4     24
-2 -3 -4    12
0 2         2
single -5   -5
\`\`\`

A zero needs no special handling. It drives both \`hi\` and \`lo\` to 0, and the
next element's \`Math.max(x, hi * x)\` picks \`x\`, which is the restart. The
\`Math.max(x, ...)\` is doing the same job it did for sums: start again here.

## The circular variant

[Maximum Sum Circular Subarray](problem:maximum-sum-circular-subarray) lets the
run wrap round the end of the array back to the front. There are only two kinds
of answer:

1. **The run does not wrap.** Ordinary Kadane finds it.
2. **The run wraps.** Then the elements it does *not* contain form one ordinary,
   non-wrapping run in the middle. Making the wrapping run as large as possible
   is the same as making that middle run as small as possible.

So run Kadane twice on the same pass — once maximising, once minimising — and
take \`Math.max(maxSubarray, total - minSubarray)\`.

\`\`\`text
a = [5, -3, 5]

best non-wrapping run    5 + -3 + 5 = 7
total                    7
smallest run             -3
wrapping answer          total - smallest = 7 - (-3) = 10   the run [5, 5]
answer                   max(7, 10) = 10
\`\`\`

One special case, and it is the reason this problem is rated hard. If every
element is negative, the smallest run is the whole array, so \`total - minSubarray\`
is 0 — which claims the empty subarray again. Detect it with \`maxSubarray < 0\`
and return \`maxSubarray\`.

## Working one from the sheet

Putting the circular argument into code, with both Kadanes sharing one loop.

\`\`\`java Circular.java @run-kadanes-algorithm-circular
public class Circular {

    static int maxCircular(int[] a) {
        int total = a[0];
        int maxHere = a[0], maxBest = a[0];
        int minHere = a[0], minBest = a[0];

        for (int i = 1; i < a.length; i++) {
            total += a[i];
            maxHere = Math.max(a[i], maxHere + a[i]);   // Kadane, maximising
            maxBest = Math.max(maxBest, maxHere);
            minHere = Math.min(a[i], minHere + a[i]);   // Kadane, minimising
            minBest = Math.min(minBest, minHere);
        }

        if (maxBest < 0) return maxBest;                // every element negative
        return Math.max(maxBest, total - minBest);
    }

    public static void main(String[] args) {
        System.out.println("5 -3 5       " + maxCircular(new int[] { 5, -3, 5 }));
        System.out.println("1 -2 3 -2    " + maxCircular(new int[] { 1, -2, 3, -2 }));
        System.out.println("3 -1 2 -1    " + maxCircular(new int[] { 3, -1, 2, -1 }));
        System.out.println("-3 -2 -3     " + maxCircular(new int[] { -3, -2, -3 }));
        System.out.println("single -4    " + maxCircular(new int[] { -4 }));
    }
}
\`\`\`

\`\`\`output @run-kadanes-algorithm-circular
5 -3 5       10
1 -2 3 -2    3
3 -1 2 -1    4
-3 -2 -3     -2
single -4    -4
\`\`\`

The second case is the one that catches people. \`[1, -2, 3, -2]\` totals 0 and
its smallest run is \`-2\`, so the wrapping candidate is 2 — worse than the plain
answer of 3. Both candidates have to be computed; neither one wins by default.

## The smallest dynamic programming there is

Kadane is a complete dynamic programme, which is worth seeing before the topic
arrives properly. Write the recurrence out:

\`\`\`text
dp[i] = the best run ending at i
dp[0] = a[0]
dp[i] = max(a[i], dp[i - 1] + a[i])
answer = max over all i of dp[i]
\`\`\`

Every ingredient is there. A subproblem with a precise meaning ("ending at i",
which is the choice that makes the subproblems combine). A recurrence built from
strictly smaller subproblems. A base case. An answer assembled from the table.

The only reason it does not look like the dynamic programming you will meet in
[dynamic programming](#/dsa/dynamic-programming/notes) is that the table is
never allocated. \`dp[i]\` depends on \`dp[i - 1]\` and nothing earlier, so one
\`int\` called \`here\` is the whole table rolled up. That rolling is a standard
optimisation applied to many DP solutions; here it is available from the start,
which is why the algorithm looks like a trick rather than a method. Being able
to state the meaning of \`here\` in one sentence is the transferable skill.

## The relatives

| Problem | The running value | What changes |
|---|---|---|
| [Maximum Subarray](problem:maximum-subarray) | Best sum ending here | Nothing — this is the plain form |
| [Best Time to Buy and Sell Stock](problem:best-time-to-buy-and-sell-stock) | Best sum of daily changes ending here | Kadane on differences, \`best\` starts at 0 |
| [Maximum Product Subarray](problem:maximum-product-subarray) | Largest and smallest product ending here | Two values, swapped on a negative |
| [Maximum Sum Circular Subarray](problem:maximum-sum-circular-subarray) | Largest and smallest sum ending here | \`total - min\`, with the all-negative guard |
| [Maximum Absolute Sum of Any Subarray](problem:maximum-absolute-sum-of-any-subarray) | Largest and smallest sum ending here | Answer is \`max(maxBest, -minBest)\` |
| [Longest Continuous Increasing Subsequence](problem:longest-continuous-increasing-subsequence) | Length of the increasing run ending here | Restart when \`a[i] <= a[i-1]\` |
| [Longest Turbulent Subarray](problem:longest-turbulent-subarray) | Two lengths: run ending up, run ending down | The comparison alternates |
| [K-Concatenation Maximum Sum](problem:k-concatenation-maximum-sum) | Best sum ending here, over two copies | Plus \`(k - 2) × total\` when the total is positive |

The pattern is always the same: name a quantity that "ends here", say how it is
built from the same quantity at \`i - 1\`, and keep a separate best. When one
value cannot make the recurrence work, carry two.

## What it costs

| | Time | Space |
|---|---|---|
| Maximum subarray | O(n) | O(1) |
| With indices recovered | O(n) | O(1) |
| Maximum product | O(n) | O(1) |
| Circular | O(n), one pass, four running values | O(1) |
| Brute force, for comparison | O(n²) | O(1) |

One pass, a constant number of \`int\` variables, no allocation. There is also a
divide-and-conquer solution at O(n log n) — a reasonable thing to mention in an
interview and a worse thing to write.

## The mistakes, in the order people make them

1. **\`best = 0\`.** Returns 0 on an all-negative array, where the answer is the
   least negative element. Start at \`a[0]\`.
2. **Starting the loop at \`i = 0\` after initialising with \`a[0]\`.** The first
   element is then counted twice: \`here\` becomes \`a[0] + a[0]\`.
3. **Updating \`best\` before \`here\`.** The best run ending at \`i\` must be
   computed before it can be compared.
4. **Resetting \`here\` when \`here + a[i]\` is negative** rather than when \`here\`
   is negative. The test is on the run *before* adding the new element. Getting
   this wrong drops runs that recover.
5. **Forgetting the swap in the product version**, applying it after the
   multiplication rather than before, or writing a swap that reads \`hi\` after it
   has already been overwritten.
6. **In the circular version, forgetting the all-negative guard.** It returns 0,
   which is the empty subarray by another route.
7. **Overflow.** Sums of 10⁵ values near a million exceed \`int\`; products
   overflow almost immediately. Use \`long\` when the constraints allow big
   numbers — that [Maximum Product Subarray](problem:maximum-product-subarray)
   fits in an \`int\` is part of that problem's statement, not a general fact.

## The Java you will reach for

| You want | Write |
|---|---|
| The larger of two | \`Math.max(a, b)\` |
| The smaller of two | \`Math.min(a, b)\` |
| A safe starting worst case | \`Integer.MIN_VALUE\` / \`Integer.MAX_VALUE\` |
| Swap two \`int\` variables | \`int t = hi; hi = lo; lo = t;\` |
| Sum an array | \`Arrays.stream(a).sum()\` — returns \`int\`, so mind the overflow |
| Sum without overflow | \`Arrays.stream(a).asLongStream().sum()\` |
| Return several numbers | \`return new int[] { best, from, to };\` |
| Print that array | \`Arrays.toString(result)\` |

\`Math.max\` exists for \`long\` and \`double\` too, and mixing types promotes
silently: \`Math.max(intValue, longValue)\` returns a \`long\`, which will not
assign back into an \`int\` without a cast. If the compiler complains here it is
telling you one of your running values is wider than you thought.

## How to work through the topic

1. [Maximum Subarray](problem:maximum-subarray). Write it from the derivation,
   not from memory, and test it on an all-negative array before submitting.
2. [Best Time to Buy and Sell Stock](problem:best-time-to-buy-and-sell-stock),
   [Maximum Average Subarray I](problem:maximum-average-subarray-i). The first
   is Kadane in disguise; the second is a fixed
   [sliding window](#/dsa/sliding-window/notes), and telling the two apart at a
   glance is the point of doing them together.
3. [Longest Continuous Increasing Subsequence](problem:longest-continuous-increasing-subsequence),
   [Longest Turbulent Subarray](problem:longest-turbulent-subarray). The same
   walk with a length instead of a sum, and then with two lengths.
4. [Maximum Product Subarray](problem:maximum-product-subarray),
   [Maximum Absolute Sum of Any Subarray](problem:maximum-absolute-sum-of-any-subarray).
   Both need the minimum alongside the maximum, for the same reason.
5. [Maximum Sum Circular Subarray](problem:maximum-sum-circular-subarray),
   [K-Concatenation Maximum Sum](problem:k-concatenation-maximum-sum). The
   complement argument, and then the same argument over repeated copies.
6. [Maximum Sum of Two Non-Overlapping Subarrays](problem:maximum-sum-of-two-non-overlapping-subarrays),
   [Maximum Sum of 3 Non-Overlapping Subarrays](problem:maximum-sum-of-3-non-overlapping-subarrays).
   Kadane's idea plus a prefix pass and a suffix pass — the point where this
   stops being one variable and becomes real
   [dynamic programming](#/dsa/dynamic-programming/notes).

Everything on this page came from [arrays](#/dsa/arrays/notes) and one habit:
ask what you need to know at position \`i\`, and whether you can carry it forward
instead of recomputing it. Kadane is that habit at its smallest, which is why it
is worth being able to derive rather than recall.
`;export{e as default};