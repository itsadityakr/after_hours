var e=`Some problems get smaller in a very particular way: cut the input in half, and
each half is the same problem again. Solve both, put the two answers together,
and you are done. That is the whole technique, and merge sort is the example
everybody meets first.

The reason it is worth a topic of its own is that the interesting part is not
the splitting. Splitting is one line. The interesting part is the combine —
what you can work out about the whole from the two halves' answers, and what
extra information you have to carry back up to make that possible. In merge sort
the combine is a linear merge. In counting inversions it is the same merge with
a counter attached, and that counter is the only reason the algorithm is
O(n log n) instead of O(n²). Every hard problem in this topic is a question
about the combine step.

You also want the cost model in your head, because it is what tells you whether
a divide-and-conquer solution is worth writing at all. Halving with a linear
combine is O(n log n). Halving with a constant combine is O(n). Halving and
throwing one side away is O(log n) — which is [binary
search](#/dsa/binary-search/notes), and the reason binary search belongs to this
family.

## The three steps

\`\`\`java
int solve(int lo, int hi) {
    if (lo >= hi) return base;                    // 1. small enough to answer directly
    int mid = lo + (hi - lo) / 2;
    int left  = solve(lo, mid);                   // 2. solve each side
    int right = solve(mid + 1, hi);
    return merge(left, right);                    // 3. combine
}
\`\`\`

Line by line:

- **The base case comes first.** \`lo >= hi\`, not \`lo == hi\`, so an empty range is
  caught too. Getting this wrong is how these recurse forever.
- **\`lo + (hi - lo) / 2\`, never \`(lo + hi) / 2\`.** With large bounds the sum
  overflows \`int\` and \`mid\` goes negative. The subtraction form cannot overflow
  because \`hi - lo\` is at most the range you already have.
- **The two calls are independent.** Neither may look at the other's data. If
  they need to, this is not divide and conquer; it is
  [dynamic programming](#/dsa/dynamic-programming/notes).
- **The merge is where you spend the thought.** Everything above it is
  boilerplate.

A second, subtler point about the split. \`mid\` and \`mid + 1\` means both sides
are strictly smaller than the whole, which is what makes the recursion
terminate. Writing \`solve(lo, mid)\` and \`solve(mid, hi)\` gives the right half
the same size as the whole when \`hi == lo + 1\`, and the program hangs.

## Reading the recurrence

![Where the work sits in the recursion tree for a linear and a constant combine](diagrams/divide-and-conquer-notes-work-per-level.jpg)

Write down the cost as an equation: the work at this level plus the work of the
calls below it. Three shapes cover nearly everything you will meet.

\`\`\`text
T(n) = 2T(n/2) + O(n)     two halves, linear combine
    level 0        n work        (1 problem  × n)
    level 1        n work        (2 problems × n/2)
    level 2        n work        (4 problems × n/4)
    ...            log n levels, each costing n
                => O(n log n)
\`\`\`

Every level does the same total amount of work — the problems get smaller
exactly as fast as they get more numerous — and there are log₂ n levels, so the
total is n log n. Merge sort.

\`\`\`text
T(n) = 2T(n/2) + O(1)     two halves, constant combine
    level 0        1 unit        (1 problem)
    level 1        2 units       (2 problems)
    level 2        4 units       (4 problems)
    ...            the bottom level dominates: n leaves
                => O(n)
\`\`\`

Here the work doubles as you descend, so the last level costs as much as
everything above it put together. There are n leaves, so it is O(n). Tree height
is the classic example: the combine is one \`Math.max\`.

\`\`\`text
T(n) = T(n/2) + O(1)      one half, constant combine
    n -> n/2 -> n/4 -> ... -> 1
                => O(log n)
\`\`\`

Only one call, so there is no branching at all — just a chain of halvings, and
you can halve n only log₂ n times before reaching 1. Binary search, and \`Pow(x,
n)\`.

That is the master theorem without the theorem. The rule of thumb: compare the
work done at the top level against the work done at the bottom. If they match,
multiply by the number of levels. If one dominates, it is the answer.

## Merge sort, the model

Split, sort each half, merge. The merge takes two sorted arrays and produces one
sorted array in linear time by walking both with two fingers and always taking
the smaller.

\`\`\`text
[2, 4, 1, 3, 5]
   split          [2, 4]        [1, 3, 5]
   split       [2]  [4]      [1]  [3, 5]
   merge         [2, 4]         [1]  [3]  [5]
   merge                        [1, 3, 5]
   merge              [1, 2, 3, 4, 5]
\`\`\`

The details of the merge — the buffer, the stability, the drain loops — belong
to [sorting](#/dsa/sorting/notes). What matters here is that the merge sees both
halves already sorted, which is information neither half had on its own, and
that is what makes the next section possible.

## Counting inversions during the merge

An inversion is a pair \`i < j\` where \`a[i] > a[j]\` — a pair that is out of
order. Counting them by hand is O(n²): every pair, checked. But look at what the
merge already knows.

When you are merging and the right-hand element \`a[j]\` is smaller than the
left-hand element \`a[i]\`, then \`a[j]\` is smaller than \`a[i]\` **and everything
after it in the left half**, because the left half is sorted. That is
\`mid - i + 1\` inversions discovered in one comparison.

![One merge comparison discovering a whole block of inversions at once](diagrams/divide-and-conquer-notes-inversions.jpg)

\`\`\`text
left [2, 4]   right [1, 3, 5]      inversions so far: 0
      i              j

 2 vs 1   right wins: 1 beats both 2 and 4   +2   -> 2
 2 vs 3   left wins                                 2
 4 vs 3   right wins: 3 beats 4              +1   -> 3
 4 vs 5   left wins, left empty                     3
 drain the right                                    3
\`\`\`

Three inversions in \`[2, 4, 1, 3, 5]\`: the pairs (2,1), (4,1) and (4,3). The
counting is free — one addition inside a loop that was already running — so the
whole thing stays O(n log n). This is the technique behind
[Count of Smaller Numbers After Self](problem:count-of-smaller-numbers-after-self)
and [Reverse Pairs](problem:reverse-pairs).

Reverse Pairs is worth a separate note. It asks for pairs with \`a[i] > 2*a[j]\`,
and you cannot count those during the merge itself, because "smaller than" and
"more than twice" advance the fingers at different rates. The fix is to count
first with a dedicated two-pointer pass over the two sorted halves, then merge:

\`\`\`java
int j = mid + 1;
for (int i = lo; i <= mid; i++) {
    while (j <= hi && (long) a[i] > 2L * a[j]) j++;
    reversePairs += j - (mid + 1);
}
merge(a, buf, lo, mid, hi);
\`\`\`

\`j\` never moves backwards across the whole \`i\` loop, so that pass is O(n) and
the total stays O(n log n). The \`2L\` is not decoration: \`2 * a[j]\` overflows
\`int\` for large values, and the count silently goes wrong.

\`\`\`java Merges.java @run-divide-and-conquer-merges
import java.util.Arrays;

public class Merges {

    static long inversions;
    static long reversePairs;

    /** Sorts a[lo..hi] and counts the pairs i < j with a[i] > a[j]. */
    static void countInversions(int[] a, int[] buf, int lo, int hi) {
        if (lo >= hi) return;
        int mid = lo + (hi - lo) / 2;
        countInversions(a, buf, lo, mid);
        countInversions(a, buf, mid + 1, hi);

        int i = lo, j = mid + 1, k = lo;
        while (i <= mid && j <= hi) {
            if (a[j] < a[i]) {
                inversions += mid - i + 1;      // a[i..mid] all beat a[j]
                buf[k++] = a[j++];
            } else {
                buf[k++] = a[i++];
            }
        }
        while (i <= mid) buf[k++] = a[i++];
        while (j <= hi) buf[k++] = a[j++];
        for (int t = lo; t <= hi; t++) a[t] = buf[t];
    }

    /** Sorts a[lo..hi] and counts the pairs i < j with a[i] > 2 * a[j]. */
    static void countReversePairs(int[] a, int[] buf, int lo, int hi) {
        if (lo >= hi) return;
        int mid = lo + (hi - lo) / 2;
        countReversePairs(a, buf, lo, mid);
        countReversePairs(a, buf, mid + 1, hi);

        int j = mid + 1;                        // count before merging
        for (int i = lo; i <= mid; i++) {
            while (j <= hi && (long) a[i] > 2L * a[j]) j++;
            reversePairs += j - (mid + 1);
        }
        merge(a, buf, lo, mid, hi);
    }

    static void merge(int[] a, int[] buf, int lo, int mid, int hi) {
        int i = lo, j = mid + 1, k = lo;
        while (i <= mid && j <= hi) buf[k++] = (a[j] < a[i]) ? a[j++] : a[i++];
        while (i <= mid) buf[k++] = a[i++];
        while (j <= hi) buf[k++] = a[j++];
        for (int t = lo; t <= hi; t++) a[t] = buf[t];
    }

    static long inversionsOf(int[] a) {
        inversions = 0;
        countInversions(a.clone(), new int[a.length], 0, a.length - 1);
        return inversions;
    }

    static long reversePairsOf(int[] a) {
        reversePairs = 0;
        countReversePairs(a.clone(), new int[a.length], 0, a.length - 1);
        return reversePairs;
    }

    public static void main(String[] args) {
        int[] a = { 2, 4, 1, 3, 5 };
        System.out.println("input        " + Arrays.toString(a));
        System.out.println("inversions   " + inversionsOf(a));
        System.out.println("untouched    " + Arrays.toString(a));

        System.out.println("already sorted " + inversionsOf(new int[] { 1, 2, 3, 4 }));
        System.out.println("reversed       " + inversionsOf(new int[] { 4, 3, 2, 1 }));
        System.out.println("empty          " + inversionsOf(new int[] {}));

        System.out.println("pairs [1,3,2,3,1]  " + reversePairsOf(new int[] { 1, 3, 2, 3, 1 }));
        System.out.println("pairs [2,4,3,5,1]  " + reversePairsOf(new int[] { 2, 4, 3, 5, 1 }));
    }
}
\`\`\`

\`\`\`output @run-divide-and-conquer-merges
input        [2, 4, 1, 3, 5]
inversions   3
untouched    [2, 4, 1, 3, 5]
already sorted 0
reversed       6
empty          0
pairs [1,3,2,3,1]  2
pairs [2,4,3,5,1]  3
\`\`\`

\`inversionsOf\` sorts a clone, which is why the input prints unchanged
afterwards. A reversed array of length n has n(n-1)/2 inversions — the maximum —
and a sorted one has none, which is the pair of tests to check any
implementation against. The counter is \`long\` because that maximum is about
5 × 10⁹ for n = 10⁵, which does not fit in an \`int\`.

## Halving without splitting

Not every divide-and-conquer solution has two recursive calls. Some halve the
*problem* rather than the data.

[Pow(x, n)](problem:powx-n) is the cleanest example. To compute x¹⁶ you do not
need sixteen multiplications; you need x⁸ once, and then one more multiplication
to square it. Odd exponents get one extra factor of x.

\`\`\`text
power(x, 10) = power(x, 5)²
power(x, 5)  = power(x, 2)² · x
power(x, 2)  = power(x, 1)²
power(x, 1)  = power(x, 0)² · x
power(x, 0)  = 1

five levels for an exponent of ten, not ten multiplications
\`\`\`

T(n) = T(n/2) + O(1), so O(log n). One trap: \`n\` can be
\`Integer.MIN_VALUE\`, and \`-Integer.MIN_VALUE\` overflows back to itself. Widen to
\`long\` before negating.

Two more halving problems on the sheet, both worth writing:

**[Majority Element](problem:majority-element) by divide and conquer.** If a
value is the majority of the whole array, it must be the majority of at least
one half — otherwise it could not have more than half the total. So find the
majority of each half; if they agree, that is the answer; if not, count both
over the whole range and take the winner. T(n) = 2T(n/2) + O(n), so O(n log n).
Boyer–Moore voting does it in O(n), so this version is for the argument rather
than the performance.

**[Maximum Subarray](problem:maximum-subarray) by divide and conquer.** The best
subarray lies entirely in the left half, entirely in the right half, or crosses
the middle. The first two are recursive calls. The third is the only real work:
the best suffix of the left half plus the best prefix of the right half, each
found by one scan outwards from the centre. O(n log n).

Say plainly that [Kadane's algorithm](#/dsa/kadanes-algorithm/notes) does the
same job in O(n) with three variables. The divide-and-conquer version is worth
knowing because the "crosses the middle" decomposition reappears in problems
where there is no linear alternative — but if an interviewer asks for Maximum
Subarray and you produce this, they will ask for Kadane next.

\`\`\`java Halving.java @run-divide-and-conquer-halving
public class Halving {

    /** x to the power n, by halving the exponent every step. */
    static double power(double x, long n) {
        if (n == 0) return 1;
        double half = power(x, n / 2);
        return (n % 2 == 0) ? half * half : half * half * x;
    }

    static double myPow(double x, int n) {
        long e = n;                        // widen first: -Integer.MIN_VALUE overflows
        return e < 0 ? power(1 / x, -e) : power(x, e);
    }

    /** The value appearing more than half the time, found by halving. */
    static int majority(int[] a, int lo, int hi) {
        if (lo == hi) return a[lo];
        int mid = lo + (hi - lo) / 2;
        int left = majority(a, lo, mid);
        int right = majority(a, mid + 1, hi);
        if (left == right) return left;
        return count(a, lo, hi, left) > count(a, lo, hi, right) ? left : right;
    }

    static int count(int[] a, int lo, int hi, int value) {
        int c = 0;
        for (int i = lo; i <= hi; i++) if (a[i] == value) c++;
        return c;
    }

    /** Best subarray sum: entirely left, entirely right, or across the middle. */
    static int maxSubarray(int[] a, int lo, int hi) {
        if (lo == hi) return a[lo];
        int mid = lo + (hi - lo) / 2;
        int left = maxSubarray(a, lo, mid);
        int right = maxSubarray(a, mid + 1, hi);

        int sum = 0, bestLeft = Integer.MIN_VALUE;
        for (int i = mid; i >= lo; i--) { sum += a[i]; bestLeft = Math.max(bestLeft, sum); }
        sum = 0;
        int bestRight = Integer.MIN_VALUE;
        for (int i = mid + 1; i <= hi; i++) { sum += a[i]; bestRight = Math.max(bestRight, sum); }

        return Math.max(Math.max(left, right), bestLeft + bestRight);
    }

    public static void main(String[] args) {
        System.out.println("2^10          " + myPow(2, 10));
        System.out.println("2^-2          " + myPow(2, -2));
        System.out.println("2^0           " + myPow(2, 0));
        System.out.println("2^MIN_VALUE   " + myPow(2, Integer.MIN_VALUE));

        int[] votes = { 2, 2, 1, 1, 1, 2, 2 };
        System.out.println("majority      " + majority(votes, 0, votes.length - 1));

        int[] gains = { -2, 1, -3, 4, -1, 2, 1, -5, 4 };
        System.out.println("max subarray  " + maxSubarray(gains, 0, gains.length - 1));

        int[] allNegative = { -3, -1, -2 };
        System.out.println("all negative  " + maxSubarray(allNegative, 0, allNegative.length - 1));
    }
}
\`\`\`

\`\`\`output @run-divide-and-conquer-halving
2^10          1024.0
2^-2          0.25
2^0           1.0
2^MIN_VALUE   0.0
majority      2
max subarray  6
all negative  -1
\`\`\`

\`maxSubarray\` uses \`lo == hi\` as its base case rather than \`lo >= hi\`, which is
safe only because it is never called on an empty range — with \`MIN_VALUE\` as the
neutral value there is no sensible answer for an empty range anyway. The
all-negative test is the one that catches a wrong neutral value: the answer is
-1, not 0.

## Discarding a half instead of solving it

The cheapest divide and conquer throws one side away without looking at it. That
requires a rule saying the answer cannot be there.

[Search a 2D Matrix II](problem:search-a-2d-matrix-ii) is the neat case: a grid
where every row is sorted left to right and every column top to bottom. Start at
the top-right corner.

\`\`\`text
target = 9              1   4   7  11
                        2   5   8  12
                        3   6   9  16
                       10  13  14  17

start 11 > 9  ->  drop the last column
      7  < 9  ->  drop the first row
      8  < 9  ->  drop that row
      9  == 9 ->  found

four steps for a 4x4 grid; O(rows + cols) in general
\`\`\`

At the top-right, the current value is the largest in its row and the smallest
in its column. So if it is bigger than the target the whole column is bigger and
can go; if it is smaller the whole row is smaller and can go. Every step
eliminates a full row or a full column, giving O(m + n) — not O(log) but the
same reasoning, and far better than searching every row separately.

![Starting at the top-right corner of a sorted grid deletes a row or a column each step](diagrams/divide-and-conquer-notes-top-right.jpg)

The same instinct covers
[Peak Index in a Mountain Array](problem:peak-index-in-a-mountain-array),
[Find K Closest Elements](problem:find-k-closest-elements) and
[Median of Two Sorted Arrays](problem:median-of-two-sorted-arrays), which is
binary search on where the partition between the two arrays should fall.

## Splitting at every operator

Not every problem splits down the middle. Some split at every possible point and
combine every left answer with every right answer.

[Different Ways to Add Parentheses](problem:different-ways-to-add-parentheses)
is the shape to learn. Given \`2*3-4*5\`, produce every value the expression can
take under every bracketing. There are three operators, so there are three ways
to be the *last* operation applied — and once you fix which one that is, the
left side and the right side are independent subproblems of exactly the same
kind.

\`\`\`text
"2*3-4*5"

split at *  ->  ways("2")  ×  ways("3-4*5")      combined with *
split at -  ->  ways("2*3") ×  ways("4*5")       combined with -
split at *  ->  ways("2*3-4") × ways("5")        combined with *

base case: a substring with no operator is a single number
\`\`\`

The combine is a double loop over the two lists of results, applying the
operator to every pair. There is no single answer to hand back, so each call
returns a \`List<Integer>\` of every value that side can produce.

\`\`\`java Parentheses.java @run-divide-and-conquer-parentheses
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class Parentheses {

    static Map<String, List<Integer>> memo = new HashMap<>();

    /** Every value the expression can take, over every way of bracketing it. */
    static List<Integer> ways(String s) {
        List<Integer> cached = memo.get(s);
        if (cached != null) return cached;

        List<Integer> out = new ArrayList<>();
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            if (c == '+' || c == '-' || c == '*') {
                List<Integer> left = ways(s.substring(0, i));
                List<Integer> right = ways(s.substring(i + 1));
                for (int l : left)
                    for (int r : right)
                        out.add(c == '+' ? l + r : c == '-' ? l - r : l * r);
            }
        }
        if (out.isEmpty()) out.add(Integer.parseInt(s));   // no operator: a plain number

        memo.put(s, out);
        return out;
    }

    public static void main(String[] args) {
        System.out.println("2-1-1     " + ways("2-1-1"));
        System.out.println("2*3-4*5   " + ways("2*3-4*5"));
        System.out.println("11        " + ways("11"));
        System.out.println("1+2*3     " + ways("1+2*3"));
    }
}
\`\`\`

\`\`\`output @run-divide-and-conquer-parentheses
2-1-1     [2, 0]
2*3-4*5   [-34, -10, -14, -10, 10]
11        [11]
1+2*3     [7, 9]
\`\`\`

Three things to take from it. The base case is detected by the absence of an
operator, not by length — \`"11"\` is one number, not two. The memo turns repeated
subexpressions into one computation each, which is the point at which this stops
being pure divide and conquer and starts being
[dynamic programming](#/dsa/dynamic-programming/notes). And the number of
results is a Catalan number, so this is exponential in the number of operators
regardless; the memo helps the constant, not the class.

[Maximum Binary Tree](problem:maximum-binary-tree) is the same split-anywhere
shape: the maximum becomes the root, and everything to its left and right are
subtrees built the same way.
[Convert Sorted List to Binary Search Tree](problem:convert-sorted-list-to-binary-search-tree)
splits down the middle instead, with the middle element as the root.

## The variants, and how to tell them apart

| What the halves give you | Combine | Cost | Example |
|---|---|---|---|
| Two sorted halves | linear merge | O(n log n) | merge sort, count inversions |
| Two answers | O(1) comparison | O(n) | tree height, max of an array |
| One half provably useless | none | O(log n) | binary search, \`Pow(x, n)\` |
| One row or column useless | none | O(m + n) | Search a 2D Matrix II |
| Every split point | cross product of results | exponential | add parentheses |
| Two sets of intervals | sweep and merge | O(n log n) | the skyline problem |

The question to ask a new problem is: *if somebody handed me the answer for the
left half and the answer for the right half, could I produce the answer for the
whole?* If yes, this technique applies and the combine is your remaining work.
If no, you need more than the answers — you need extra information carried up,
and working out what that information is turns out to be most of the difficulty
in [The Skyline Problem](problem:the-skyline-problem) and
[K-th Smallest Prime Fraction](problem:k-th-smallest-prime-fraction).

## What it costs

- **Time** is the recurrence. Work per level times the number of levels, or the
  bottom level alone when it dominates.
- **Space** is the recursion stack, which is the depth of the tree: O(log n) for
  a balanced split. Add the buffer if the combine needs one — O(n) for merge
  sort, allocated once.
- **The stack is a real limit.** Java's default stack overflows somewhere around
  10 000 frames deep. A balanced split never gets near that; an unbalanced one
  (split at 1 and n-1 every time) will.
- **Recursion is not free.** Merge sort and quicksort are both O(n log n) and
  quicksort is usually faster, because it does no copying. Cost classes do not
  capture that.

## The mistakes, in the order people make them

1. **\`(lo + hi) / 2\`.** Overflows \`int\` on large bounds and \`mid\` goes negative.
   \`lo + (hi - lo) / 2\` always.
2. **\`solve(lo, mid)\` and \`solve(mid, hi)\`.** The second call has the same size
   as its parent when the range has two elements, and it never terminates. It is
   \`mid + 1\`.
3. **Base case \`lo == hi\` when an empty range is possible.** \`lo >= hi\`.
4. **Counting inversions with \`<=\` instead of \`<\`.** Equal values are not
   inversions; taking from the right on a tie counts them as if they were.
5. **\`2 * a[j]\` in Reverse Pairs.** Overflows \`int\`. Cast to \`long\` first.
6. **An \`int\` counter for inversions.** Up to n(n-1)/2 of them, which passes 2³¹
   at about n = 65 000.
7. **Allocating the merge buffer inside the recursion.** One buffer, passed
   down, or the allocations cost more than the sort.
8. **Assuming the answer is always in one half.** It is only true when you have
   proved it. For maximum subarray the third case — crossing the middle — is
   where the answer usually is.
9. **Recomputing overlapping subproblems.** Once the same subproblem appears
   under two different splits, memoise it, or you have written an exponential
   version of a polynomial algorithm.

## The Java you will reach for

| You want | Write |
|---|---|
| A safe midpoint | \`int mid = lo + (hi - lo) / 2;\` |
| A reusable scratch array | \`int[] buf = new int[n];\` allocated once, passed down |
| A counter that will not overflow | \`long\`, and \`(long) a[i]\` before arithmetic |
| Sort a slice | \`Arrays.sort(a, from, to)\` — \`to\` exclusive |
| Copy a slice | \`Arrays.copyOfRange(a, from, to)\` |
| Copy back in bulk | \`System.arraycopy(src, sp, dst, dp, len)\` |
| A list result per call | \`List<Integer> out = new ArrayList<>();\` |
| Memoise on a substring | \`Map<String, List<Integer>> memo = new HashMap<>();\` |
| Merge many sorted runs | a heap — see [heaps](#/dsa/heaps/notes) |

\`System.arraycopy\` is worth knowing for the copy-back at the end of a merge. It
is the same loop, written in native code, and on a hot merge it is measurably
faster than writing the loop yourself.

## Working one from the sheet

[Sort an Array](problem:sort-an-array) asks you to sort without calling the
library sort, which is the sheet's polite way of asking for merge sort. The
version in \`Merges.java\` above is the answer — but the interesting question is
what an interviewer asks next, and it is usually
[Count of Smaller Numbers After Self](problem:count-of-smaller-numbers-after-self):
for each element, how many elements to its right are smaller than it?

That is per-element inversion counting. The change from the counter version is
that you can no longer sort the values directly, because you need to know which
original position each value came from. So you sort an array of *indices*
instead, and keep the counts in a separate array indexed by the original
position. When the merge takes an element from the left half at index \`idx[i]\`,
every right-hand element already taken is smaller and to its right — so add the
number of them to \`count[idx[i]]\`.

The recurrence is unchanged, the merge is the same merge, and the whole solution
is O(n log n). If you can write the inversion counter, you can write this one;
the only new idea is that the thing being sorted is not the thing being counted.

## How to work through the topic

1. [Search Insert Position](problem:search-insert-position),
   [Valid Perfect Square](problem:valid-perfect-square),
   [Peak Index in a Mountain Array](problem:peak-index-in-a-mountain-array). The
   T(n) = T(n/2) + O(1) shape, where one half is discarded. Do these first even
   if they feel like [binary search](#/dsa/binary-search/notes) problems — they
   are, and that is the point.
2. [Sort an Array (Merge Sort)](problem:sort-an-array),
   [Merge Sorted Array](problem:merge-sorted-array). Write the merge until it is
   automatic. Everything later reuses it.
3. [Maximum Subarray](problem:maximum-subarray),
   [Majority Element](problem:majority-element). Both by divide and conquer
   first, then by the linear method, and be able to say what the linear method
   knows that the recursion does not.
4. [Different Ways to Add Parentheses](problem:different-ways-to-add-parentheses),
   [Maximum Binary Tree](problem:maximum-binary-tree),
   [Convert Sorted List to Binary Search Tree](problem:convert-sorted-list-to-binary-search-tree).
   Splitting at a chosen point rather than the middle. See
   [recursion and backtracking](#/dsa/recursion-and-backtracking/notes) if the
   shape of the recursion is what is giving trouble.
5. [Beautiful Array](problem:beautiful-array),
   [Find K Closest Elements](problem:find-k-closest-elements). Constructions
   rather than searches — you build the answer out of the two halves instead of
   searching for it.
6. [Reverse Pairs](problem:reverse-pairs),
   [Count of Smaller Numbers After Self](problem:count-of-smaller-numbers-after-self),
   [Median of Two Sorted Arrays](problem:median-of-two-sorted-arrays). Counting
   in the merge, and partitioning two arrays at once. Do the first two together;
   they are the same idea twice.
7. [The Skyline Problem](problem:the-skyline-problem),
   [K-th Smallest Prime Fraction](problem:k-th-smallest-prime-fraction),
   [Russian Doll Envelopes](problem:russian-doll-envelopes). The hard band,
   where the combine step is the entire problem. Give each an hour, and read
   [sorting](#/dsa/sorting/notes) first — all three start by choosing an order.
`;export{e as default};