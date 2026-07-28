var e=`Almost every question about a pair, a triple or a run of elements has an obvious
answer with two nested loops: try every \`i\`, and for each one try every \`j\`. That
is O(n²), and on an array of 100,000 it is ten billion comparisons — about a
minute of work for an answer the machine should give instantly.

The way out is that the two loops are not independent. If the input is sorted, or
can be sorted, then what you learn from the pair in front of you tells you
something about a whole block of pairs you have not tried, and you can throw that
block away untested. Do that repeatedly and the nested loops collapse into two
indices making one pass between them.

The pattern is small. The part worth practising is not the code — it is being
able to say, out loud, *why moving that index cannot skip the answer*. Without
that sentence you have guessed at a solution that happens to pass the examples.

## What you need before you start

Nothing but arrays, \`while\`, and the habit of naming a variable for its job.

\`\`\`java
int lo = 0, hi = a.length - 1;             // two indices, declared together
int t = a[lo]; a[lo] = a[hi]; a[hi] = t;   // a swap needs a third variable
a.length      // arrays: a field, no brackets
s.charAt(i)   // String: s.length() is a method, and charAt gives one char
\`\`\`

**In place** means you rearrange the array you were given and allocate nothing
proportional to its size, which is why the space column says O(1). **Sorted**
here always means non-decreasing, so equal values sit next to each other — that
adjacency is what makes duplicate handling possible at all.

One habit from [arrays](#/dsa/arrays/notes): name the two indices for what they
do — \`lo\` and \`hi\` when they close in, \`read\` and \`write\` when one trails the
other. \`i\` and \`j\` hides the fact that the two mean different things.

## The idea, walked by hand

![Two indices closing in from the ends of a sorted array](diagrams/two-pointers-notes-converging.svg)

[Two Sum II - Input Array Is Sorted](problem:two-sum-ii-input-array-is-sorted)
gives a sorted array and a target and wants the pair that adds up to it. Put one
index at each end and look at their sum. It is either right, too small or too
big — and in the last two cases there is only one index you may move.

\`\`\`text
a = [2, 7, 11, 15],  target = 18

lo=0 hi=3    2 + 15 = 17   too small  ->  lo++
lo=1 hi=3    7 + 15 = 22   too big    ->  hi--
lo=1 hi=2    7 + 11 = 18   found
\`\`\`

Three comparisons instead of six. On a large array it is n instead of n²/2.

## Why moving that pointer cannot skip the answer

This is the whole topic. Take the first step above: the sum is 17, too small.

Ask what else index 0 could pair with. Everything still in play sits at positions
1 to 3, and because the array is sorted the largest of those is \`a[3]\`. So the
biggest sum index 0 can still produce is \`a[0] + a[3] = 17\`, and 17 is already
too small. Index 0 is finished — not "probably", finished, because you have just
checked its best case.

So \`lo++\` retires an index that has been proved useless, and the mirror argument
retires \`hi\` when the sum is too big. Every step retires exactly one index, there
are n of them, and the scan is therefore linear. Say that in the interview: it is
the difference between having a solution and having a proof.

### Container With Most Water, where the argument is less obvious

[Container With Most Water](problem:container-with-most-water) gives heights and
asks for the largest rectangle between two of them. The area of the pair
\`(lo, hi)\` is \`(hi - lo) × min(h[lo], h[hi])\` — the width times the *shorter*
wall, because water spills over the low side.

The rule is to move the pointer at the **shorter** wall. Suppose \`h[lo] ≤ h[hi]\`,
so the short wall is on the left, and consider any other container that still
uses \`lo\`, paired with some \`hi'\` strictly inside. Its width \`hi' - lo\` is
**smaller** than \`hi - lo\`, and its height \`min(h[lo], h[hi'])\` is at most
\`h[lo]\`, which is exactly the height you already measured.

Smaller width, and a height that cannot exceed what you already had. Every
remaining container using \`lo\` is worse than the one just measured, so \`lo\` is
finished. Move \`hi\` instead and you throw away the tall wall with no such
argument — and the tall wall may well be half of the best answer.

When the walls are equal either move is safe, because the argument holds for both.

![Moving the taller wall throws away the answer; moving the shorter one cannot](diagrams/two-pointers-notes-shorter-wall.jpg)

## The shape

\`\`\`java
int lo = 0, hi = a.length - 1;
while (lo < hi) {
    int sum = a[lo] + a[hi];
    if (sum == target) return true;
    if (sum < target) lo++; else hi--;
}
\`\`\`

- \`while (lo < hi)\`, not \`lo <= hi\`. With \`<=\` the two indices meet on the same
  element and pair it with itself.
- The comparison is the *decision*, and it must have the shape of the elimination
  argument. If you cannot name which index it retires, the loop is a guess.
- Nothing inside restarts either index. Both only ever move one way, which is
  what keeps the whole thing linear.

## Opposite ends, in one program

\`\`\`java Ends.java @run-two-pointers-ends
public class Ends {

    /** Palindrome, ignoring case and anything that is not a letter or digit. */
    static boolean isPalindrome(String s) {
        int lo = 0, hi = s.length() - 1;
        while (lo < hi) {
            while (lo < hi && !Character.isLetterOrDigit(s.charAt(lo))) lo++;
            while (lo < hi && !Character.isLetterOrDigit(s.charAt(hi))) hi--;
            if (Character.toLowerCase(s.charAt(lo)) != Character.toLowerCase(s.charAt(hi)))
                return false;
            lo++;
            hi--;
        }
        return true;
    }

    /** The largest area between two walls: width times the shorter wall. */
    static int maxArea(int[] h) {
        int lo = 0, hi = h.length - 1, best = 0;
        while (lo < hi) {
            best = Math.max(best, (hi - lo) * Math.min(h[lo], h[hi]));
            if (h[lo] <= h[hi]) lo++; else hi--;   // always leave the taller wall
        }
        return best;
    }

    public static void main(String[] args) {
        System.out.println("palindrome   " + isPalindrome("A man, a plan, a canal: Panama"));
        System.out.println("palindrome   " + isPalindrome("race a car"));
        System.out.println("maxArea      " + maxArea(new int[] { 1, 8, 6, 2, 5, 4, 8, 3, 7 }));
        System.out.println("maxArea      " + maxArea(new int[] { 1, 1 }));
    }
}
\`\`\`

\`\`\`output @run-two-pointers-ends
palindrome   true
palindrome   false
maxArea      49
maxArea      1
\`\`\`

The pair-sum loop from *The shape* is the third member of this family, and it is
already written out above. The two inner \`while\` loops in \`isPalindrome\` are what people forget in
[Valid Palindrome](problem:valid-palindrome). Both re-test \`lo < hi\`, because a
string of nothing but punctuation would otherwise walk an index off the end.
\`Character.isLetterOrDigit\` and \`Character.toLowerCase\` are static helpers on the
\`Character\` class, where all the per-character questions live.

## Same direction: a fast reader and a slow writer

![The three regions a fast reader and a slow writer cut the array into](diagrams/two-pointers-notes-write-read.jpg)

The second form does not close in from the ends. Both indices start at the left
and move the same way at different speeds. The fast one reads every element; the
slow one advances only when something is worth keeping, so everything before it
is the answer so far. [Remove Element](problem:remove-element) is the plainest
case: drop every copy of a value and report how many are left.

\`\`\`text
a = [3, 2, 2, 3], val = 3

read=0  a[0]=3  drop              write=0   [3, 2, 2, 3]
read=1  a[1]=2  keep -> a[0]=2    write=1   [2, 2, 2, 3]
read=2  a[2]=2  keep -> a[1]=2    write=2   [2, 2, 2, 3]
read=3  a[3]=3  drop              write=2   [2, 2, 2, 3]

a[0..2) = [2, 2] is the answer, and write is its length
\`\`\`

\`write ≤ read\` at every moment, so you never overwrite a box you have not read
yet. That inequality is the safety argument for doing all of these in place.

## Merging from the back

[Merge Sorted Array](problem:merge-sorted-array) looks like it needs extra space
and does not. You get \`a\` with \`m\` values and enough empty room at the end, and
\`b\` with \`n\` values, and must merge in place. Filling from the front overwrites
values of \`a\` you have not copied yet. Filling from the **back** cannot: the
write index starts at \`m + n - 1\`, past every unread value, and descends exactly
as fast as the two read indices together.

\`\`\`text
a = [1, 2, 3, _, _, _]   b = [2, 5, 6]

i=2 j=2 write=5   3 vs 6 -> 6      a = [1, 2, 3, _, _, 6]
i=2 j=1 write=4   3 vs 5 -> 5      a = [1, 2, 3, _, 5, 6]
i=2 j=0 write=3   3 vs 2 -> 3      a = [1, 2, 3, 3, 5, 6]
i=1 j=0 write=2   2 vs 2 -> 2 (b)  a = [1, 2, 2, 3, 5, 6]
j < 0, stop — anything left in a is already in place
\`\`\`

The loop condition is \`j >= 0\`, not \`i >= 0 || j >= 0\`. Once \`b\` is exhausted the
remaining values of \`a\` already sit where they belong.

\`\`\`java Passes.java @run-two-pointers-passes
import java.util.Arrays;

public class Passes {

    /** Push every zero to the end, keeping the order of the rest. */
    static void moveZeroes(int[] a) {
        int write = 0;
        for (int read = 0; read < a.length; read++)
            if (a[read] != 0) {
                int t = a[write];       // swap rather than copy, so the zero is
                a[write] = a[read];     // carried forward instead of lost
                a[read] = t;
                write++;
            }
    }

    /** Remove duplicates from a sorted array. Returns the new length. */
    static int dedupeSorted(int[] a) {
        if (a.length == 0) return 0;
        int write = 1;
        for (int read = 1; read < a.length; read++)
            if (a[read] != a[write - 1]) a[write++] = a[read];
        return write;
    }

    /** Merge b into a, where a holds m values then n empty slots. */
    static void mergeFromBack(int[] a, int m, int[] b, int n) {
        int i = m - 1, j = n - 1, write = m + n - 1;
        while (j >= 0)
            a[write--] = (i >= 0 && a[i] > b[j]) ? a[i--] : b[j--];
    }

    public static void main(String[] args) {
        int[] z = { 0, 1, 0, 3, 12 };
        moveZeroes(z);
        System.out.println("moveZeroes    " + Arrays.toString(z));

        int[] d = { 1, 1, 2, 2, 2, 3 };
        System.out.println("dedupeSorted  " + Arrays.toString(Arrays.copyOf(d, dedupeSorted(d))));

        int[] a = { 1, 2, 3, 0, 0, 0 };
        mergeFromBack(a, 3, new int[] { 2, 5, 6 }, 3);
        System.out.println("merge         " + Arrays.toString(a));

        int[] onlyB = { 0 };
        mergeFromBack(onlyB, 0, new int[] { 1 }, 1);
        System.out.println("merge, m = 0  " + Arrays.toString(onlyB));
    }
}
\`\`\`

\`\`\`output @run-two-pointers-passes
moveZeroes    [1, 3, 12, 0, 0]
dedupeSorted  [1, 2, 3]
merge         [1, 2, 2, 3, 5, 6]
merge, m = 0  [1]
\`\`\`

\`dedupeSorted\` compares \`a[read]\` against \`a[write - 1]\`, the last value *kept* —
not \`a[read - 1]\`, the last value *seen*. On a run of three equal values those
differ, and picking the wrong one is the classic bug in this shape.
[Move Zeroes](problem:move-zeroes) swaps instead of copying for a related reason:
a plain copy leaves stale values behind that need a second loop to blank.

## The 3Sum shape, and the duplicate skipping

[3Sum](problem:3sum) wants every triple summing to zero, with no triple repeated.
The move is: sort, fix the first value with an outer loop, and let a two-pointer
scan find the other two. Sorting is O(n log n), the outer loop is n, and each
scan is O(n), so the total is O(n²) instead of O(n³).

Everybody gets the algorithm. What people get wrong is the duplicates, and there
are three separate places they have to be handled.

1. **The fixed value.** After finishing with \`a[i]\`, skip past every copy of it —
   \`if (i > 0 && a[i] == a[i - 1]) continue;\`. Compare with the value *behind*,
   not ahead: comparing forwards skips the first copy, which is the one you want.
2. **The left pointer, after a hit.** Advance \`lo\` past every duplicate of the
   value just used.
3. **The right pointer, after a hit.** The same on the other side.

And on a hit you must move **both** pointers. Moving one leaves the same sum in
play and records the same triple again.

\`\`\`java Triples.java @run-two-pointers-triples
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class Triples {

    static List<List<Integer>> threeSum(int[] a) {
        Arrays.sort(a);
        List<List<Integer>> out = new ArrayList<>();
        for (int i = 0; i + 2 < a.length; i++) {
            if (a[i] > 0) break;                       // sorted: no way back to zero
            if (i > 0 && a[i] == a[i - 1]) continue;   // this first value is done
            int lo = i + 1, hi = a.length - 1;
            while (lo < hi) {
                int sum = a[i] + a[lo] + a[hi];
                if (sum < 0) lo++;
                else if (sum > 0) hi--;
                else {
                    out.add(List.of(a[i], a[lo], a[hi]));
                    lo++;
                    hi--;                              // both, or the next round repeats
                    while (lo < hi && a[lo] == a[lo - 1]) lo++;
                    while (lo < hi && a[hi] == a[hi + 1]) hi--;
                }
            }
        }
        return out;
    }

    public static void main(String[] args) {
        System.out.println(threeSum(new int[] { -1, 0, 1, 2, -1, -4 }));
        System.out.println(threeSum(new int[] { 0, 0, 0, 0 }));
        System.out.println(threeSum(new int[] { 1, 2, -2, -1 }));
        System.out.println(threeSum(new int[] { }));
    }
}
\`\`\`

\`\`\`output @run-two-pointers-triples
[[-1, -1, 2], [-1, 0, 1]]
[[0, 0, 0]]
[]
[]
\`\`\`

Because the array is sorted, each triple comes out in non-decreasing order, so
two triples with the same values are the same \`List\` — no filtering afterwards,
which is the point of skipping as you go. The same skeleton with one more loop
around it is [4Sum](problem:4sum); with \`Math.abs\` in place of the equality test
it is [3Sum Closest](problem:3sum-closest); with counting instead of listing it
is [3Sum With Multiplicity](problem:3sum-with-multiplicity), where the duplicates
stop being a nuisance and become the answer.

## The variants

| Form | Where they start | How they move | Asks for |
|---|---|---|---|
| Opposite ends | \`0\` and \`n - 1\` | towards each other | a pair in sorted data, a palindrome, an area |
| Fast and slow | both at \`0\` | one per element, one per keeper | filter or compact in place |
| From the back | both at their ends | descending | merge into spare room at the end |
| Fix one, scan two | outer \`i\`, inner pair | outer once, inner pair each time | triples and quadruples |

"Sorted" plus "a pair" is opposite ends. "In place" plus "remove" or "move" is
fast and slow. "Room at the end of the first array" is from the back. A triple is
fix-one-and-scan, after a sort. The problems the sheet files under hard —
[Minimum Window
Substring](problem:minimum-window-substring), [Subarrays with K Different
Integers](problem:subarrays-with-k-different-integers), [Minimum Operations to
Reduce X to Zero](problem:minimum-operations-to-reduce-x-to-zero) — are two
pointers moving the same way with a count between them, which is a
[sliding window](#/dsa/sliding-window/notes) and its own topic.

## What it costs

| Step | Time | Space |
|---|---|---|
| The scan itself | O(n) | O(1) |
| After a sort | O(n log n) | O(log n) for the sort's stack |
| Fix one, scan the rest | O(n²) | O(1) beyond the output |
| The brute force it replaces | O(n²) or O(n³) | O(1) |

State the linear claim precisely: on each turn at least one index moves, no index
ever moves backwards, and together they move at most n steps. When the input is
not sorted you pay O(n log n) up front — see [sorting](#/dsa/sorting/notes) — and
the question is whether it buys back more than it costs. For 3Sum it plainly
does. For [Two Sum](problem:two-sum) it does not, because sorting destroys the
original indices and the answer is indices; a hash map is the right tool there.

## The mistakes, in the order people make them

1. **Using it on unsorted input.** The elimination argument depends on order. On
   an unsorted array a too-small sum says nothing about the other pairs, and the
   loop returns confident nonsense.
2. **\`lo <= hi\` when you meant \`lo < hi\`.** The indices land on the same element
   and it pairs with itself, which
   [Two Sum II](problem:two-sum-ii-input-array-is-sorted) forbids.
3. **Moving the wrong pointer in Container With Most Water.** Moving the taller
   wall shrinks the width and cannot raise the height, so it discards
   possibilities with no argument that they were dead.
4. **Missing one of the three duplicate skips in 3Sum**, or moving only one
   pointer after a hit. Each produces a different flavour of repeated triple, and
   the given examples rarely expose all of them.
5. **Merging from the front.** Every write lands on a value of \`a\` you still
   needed. Start at \`m + n - 1\` and descend.
6. **Skipping punctuation without re-checking \`lo < hi\`.** A string of pure
   punctuation walks an index off the end and throws.
7. **No guard for the empty array.** \`a.length - 1\` is \`-1\`. The \`while (lo < hi)\`
   form survives it; an unguarded \`a[0]\` does not.
8. **Overflow in the sum.** Three or four \`int\` values near two billion do not
   fit in an \`int\`. In [4Sum](problem:4sum) accumulate into a \`long\`.

## The Java you will reach for

| You want | Write |
|---|---|
| Sort before scanning | \`Arrays.sort(a)\` |
| Swap two slots | \`int t = a[i]; a[i] = a[j]; a[j] = t;\` |
| The smaller or larger | \`Math.min(x, y)\`, \`Math.max(x, y)\` |
| Distance from a target | \`Math.abs(sum - target)\` |
| Character at an index | \`s.charAt(i)\`, \`s.length()\` |
| Is it a letter or digit | \`Character.isLetterOrDigit(c)\` |
| Fold case | \`Character.toLowerCase(c)\` |
| A fixed triple to store | \`List.of(x, y, z)\` |
| Copy the kept prefix | \`Arrays.copyOf(a, write)\` |
| Print an array | \`Arrays.toString(a)\` |

\`Arrays.sort(int[])\` is a dual-pivot quicksort with no stability guarantee, which
does not matter for primitives; \`Arrays.sort(Integer[])\` is a stable merge sort
and it boxes, so prefer \`int[]\`. And \`List.of(...)\` gives an **immutable** list —
fine for a finished triple, wrong if you meant to modify it.

## Working one from the sheet

[Trapping Rain Water](problem:trapping-rain-water): given bar heights, how much
water sits between them after rain?

The water above bar \`i\` is bounded by the tallest bar to its left and the tallest
to its right — the lower of those, minus the bar's own height. The three-pass
solution builds both maxima into arrays and costs O(n) space.

The two-pointer version removes the arrays. Walk in from both ends carrying
\`leftMax\` and \`rightMax\`, and process whichever side is shorter. If
\`h[lo] ≤ h[hi]\`, a bar of height at least \`h[hi]\` definitely exists to the right
of \`lo\`, so the right-hand bound on \`lo\` is at least \`leftMax\`. The lower of the
two bounds is therefore \`leftMax\`, and \`lo\` can be settled now without ever
learning the true right-hand maximum.

\`\`\`java Water.java @run-two-pointers-water
public class Water {

    static int trap(int[] h) {
        int lo = 0, hi = h.length - 1;
        int leftMax = 0, rightMax = 0, water = 0;
        while (lo < hi) {
            if (h[lo] <= h[hi]) {           // left is the binding side
                leftMax = Math.max(leftMax, h[lo]);
                water += leftMax - h[lo];
                lo++;
            } else {                        // right is the binding side
                rightMax = Math.max(rightMax, h[hi]);
                water += rightMax - h[hi];
                hi--;
            }
        }
        return water;
    }

    public static void main(String[] args) {
        System.out.println(trap(new int[] { 0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1 }));
        System.out.println(trap(new int[] { 4, 2, 0, 3, 2, 5 }));
        System.out.println(trap(new int[] { 3, 2, 1 }));
        System.out.println(trap(new int[] { }));
    }
}
\`\`\`

\`\`\`output @run-two-pointers-water
6
9
0
0
\`\`\`

\`leftMax - h[lo]\` is never negative, because \`leftMax\` was updated to include
\`h[lo]\` on the line before. That ordering is not decoration — swap the two lines
and a tall bar subtracts water that was never there.

## How to work through the topic

1. [Reverse String](problem:reverse-string),
   [Valid Palindrome](problem:valid-palindrome). The bare opposite-ends loop,
   then the skipping version. Get the \`lo < hi\` re-check right first.
2. [Remove Element](problem:remove-element),
   [Move Zeroes](problem:move-zeroes). Fast and slow. Say why \`write ≤ read\`
   makes the in-place version safe.
3. [Merge Sorted Array](problem:merge-sorted-array),
   [Squares of a Sorted Array](problem:squares-of-a-sorted-array). Both fill from
   the back, and the second shows why: the largest square is at one end or the
   other, never in the middle.
4. [Two Sum II - Input Array Is
   Sorted](problem:two-sum-ii-input-array-is-sorted),
   [Boats to Save People](problem:boats-to-save-people). The elimination argument
   twice, once for a sum and once for a greedy pairing. Write it down for each.
5. [Container With Most Water](problem:container-with-most-water). Do not read a
   solution — work out for yourself why the taller wall must stay. Then
   [3Sum](problem:3sum), [3Sum Closest](problem:3sum-closest) and
   [4Sum](problem:4sum): fix-one-and-scan, all three duplicate skips, and test on
   \`[0,0,0,0]\` before you submit.
6. [Trapping Rain Water](problem:trapping-rain-water), [Number of Subsequences
   That Satisfy Given Sum
   Condition](problem:number-of-subsequences-that-satisfy-the-given-sum-condition).
   Both turn on what a pointer's position already guarantees. Give each a full
   hour before looking anything up.
`;export{e as default};