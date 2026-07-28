var e=`An array is a row of boxes, numbered from zero, all the same type, and fixed in
length once made. That is the entire data structure. Everything else on this
sheet — the stack, the heap, the hash table, the graph — is built out of one, so
the habits you form here are the ones you carry the whole way.

The problems in this topic have a shape of their own. Almost every one of them
has an obvious answer with two nested loops, and an intended answer with one
loop and a little thought. Learning to see the second is what the topic is for.

## What you get for free, and what you pay for

\`\`\`java
int[] a = new int[5];        // five boxes, all 0
int[] b = { 3, 1, 4, 1, 5 }; // five boxes, filled

int first = b[0];            // 3      — O(1), instant
int last  = b[b.length - 1]; // 5      — length is a field, not a method
\`\`\`

- **Reading or writing a box by its number is O(1).** The machine knows where
  the array starts and every box is the same size, so the address is arithmetic.
  This is the one superpower an array has.
- **Finding a value is O(n)** unless the array is sorted. There is no shortcut;
  you look at the boxes.
- **The length cannot change.** \`int[]\` has no \`add\`. Growing means allocating a
  bigger array and copying, which is what \`ArrayList\` does for you.
- **Indices run 0 to \`length - 1\`.** An index outside that throws
  \`ArrayIndexOutOfBoundsException\` at run time — Java checks every access, so
  you cannot read past the end by accident, only crash.

Two spellings that trip beginners: \`a.length\` for an array, \`s.length()\` for a
\`String\`, \`list.size()\` for a \`List\`. Three names for one idea, and the compiler
will tell you which one you wanted.

## The pattern: one pass with two indices

Here is the shape almost every problem in this topic collapses to.

\`\`\`java
int write = 0;
for (int read = 0; read < a.length; read++)
    if (keep(a[read])) a[write++] = a[read];
// a[0..write) is the answer, done in place
\`\`\`

Two indices moving over one array at different speeds. \`read\` visits every
element exactly once. \`write\` only advances when something is worth keeping, so
it trails behind, and everything before it is the answer so far.

Because \`write <= read\` always, you never overwrite a box you have not read yet.
That is the whole safety argument, and it is why this can be done in place with

![The three regions a read and write index cut an array into](diagrams/arrays-notes-two-index-regions.jpg)
no second array.

Name them for what they do. \`i\` and \`j\` is where these solutions become
unreadable, and it is where the bugs hide — the two indices mean different
things, and calling them the same kind of name hides that.

## Seeing it work

[Move Zeroes](problem:move-zeroes) is the purest example: move every zero to the
end, keep the order of everything else, do it in place.

\`\`\`text
a = [0, 1, 0, 3, 12]

read=0  a[0]=0   not kept          write=0   [0, 1, 0, 3, 12]
read=1  a[1]=1   kept -> a[0]=1    write=1   [1, 1, 0, 3, 12]
read=2  a[2]=0   not kept          write=1   [1, 1, 0, 3, 12]
read=3  a[3]=3   kept -> a[1]=3    write=2   [1, 3, 0, 3, 12]
read=4  a[4]=12  kept -> a[2]=12   write=3   [1, 3, 12, 3, 12]

then fill from write to the end with zeroes -> [1, 3, 12, 0, 0]
\`\`\`

\`\`\`java Passes.java @run-arrays-passes
import java.util.Arrays;

public class Passes {

    /** Move every zero to the end, keeping the order of the rest. */
    static void moveZeroes(int[] a) {
        int write = 0;
        for (int read = 0; read < a.length; read++)
            if (a[read] != 0) a[write++] = a[read];
        while (write < a.length) a[write++] = 0;
    }

    /** Remove duplicates from a sorted array. Returns the new length. */
    static int dedupeSorted(int[] a) {
        if (a.length == 0) return 0;
        int write = 1;
        for (int read = 1; read < a.length; read++)
            if (a[read] != a[write - 1]) a[write++] = a[read];
        return write;
    }

    /** Reverse in place: swap the ends, walk inwards. */
    static void reverse(int[] a, int from, int to) {
        while (from < to) {
            int t = a[from];
            a[from++] = a[to];
            a[to--] = t;
        }
    }

    public static void main(String[] args) {
        int[] zeroes = { 0, 1, 0, 3, 12 };
        moveZeroes(zeroes);
        System.out.println("moveZeroes   " + Arrays.toString(zeroes));

        int[] sorted = { 1, 1, 2, 2, 2, 3, 4, 4 };
        int size = dedupeSorted(sorted);
        System.out.println("dedupe       " + Arrays.toString(Arrays.copyOf(sorted, size))
                + "  (new length " + size + ")");

        int[] r = { 1, 2, 3, 4, 5 };
        reverse(r, 0, r.length - 1);
        System.out.println("reverse      " + Arrays.toString(r));
    }
}
\`\`\`

\`\`\`output @run-arrays-passes
moveZeroes   [1, 3, 12, 0, 0]
dedupe       [1, 2, 3, 4]  (new length 4)
reverse      [5, 4, 3, 2, 1]
\`\`\`

Read \`dedupeSorted\` again. It compares against \`a[write - 1]\` — the last thing
kept — and not against \`a[read - 1]\`, the previous thing seen. On a run of three
equal values those are different, and comparing against the wrong one is the bug.

## Rotate: three reversals

![A rotation by k, done as three reversals, with the two blocks colour tracked](diagrams/arrays-notes-rotate-three-reversals.jpg)

[Rotate Array](problem:rotate-array) asks you to shift everything right by \`k\`.
The obvious answers are an extra array (O(n) space) or shifting one place \`k\`
times (O(nk) time). The intended answer is a trick worth memorising, because it
appears again in string problems:

> Reverse the whole thing. Then reverse the first \`k\`. Then reverse the rest.

\`\`\`text
[1,2,3,4,5,6,7], k = 3

reverse all      [7,6,5,4,3,2,1]
reverse first 3  [5,6,7,4,3,2,1]
reverse the rest [5,6,7,1,2,3,4]   <- correct
\`\`\`

\`\`\`java
static void rotate(int[] a, int k) {
    k %= a.length;                 // k can be larger than the array
    reverse(a, 0, a.length - 1);
    reverse(a, 0, k - 1);
    reverse(a, k, a.length - 1);
}
\`\`\`

The \`k %= a.length\` is not a nicety. Without it a \`k\` of 10 on an array of 7
walks off the end.

## Prefix and suffix, when you may not divide

[Product of Array Except Self](problem:product-of-array-except-self) forbids
division, which rules out "multiply everything then divide by each". The answer
is the idea behind a whole later topic: the product of everything except
position \`i\` is *everything to its left* times *everything to its right*.

\`\`\`java
static int[] productExceptSelf(int[] a) {
    int n = a.length;
    int[] out = new int[n];

    int running = 1;
    for (int i = 0; i < n; i++) {      // left to right: product before i
        out[i] = running;
        running *= a[i];
    }

    running = 1;
    for (int i = n - 1; i >= 0; i--) { // right to left: multiply by product after i
        out[i] *= running;
        running *= a[i];
    }
    return out;
}
\`\`\`

Two passes, no division, and the output array does not count as extra space
because the problem asks for it. When you meet
[prefix sum](#/dsa/prefix-sum/notes) later, this is the same idea with \`+\`
instead of \`×\`.

## Sorted changes everything

If an array is sorted, or you are allowed to sort it, a whole set of questions
gets cheaper:

- **Is a value present?** Binary search, O(log n) — see
  [binary search](#/dsa/binary-search/notes).
- **Any duplicates?** Equal values are now adjacent. One pass.
- **A pair summing to a target?** One pointer at each end, walk them towards
  each other — [two pointers](#/dsa/two-pointers/notes).
- **The k largest?** They are at the end.

Sorting costs O(n log n), so the question is always whether that buys back more
than it costs. For [3Sum](problem:3sum) it plainly does: sorted, the problem is
n runs of a two-pointer scan, which is O(n²) rather than O(n³).

The trade-off to keep in mind is that sorting **destroys the original
positions**. If the answer is a set of indices — as in
[Two Sum](problem:two-sum) — you either need to keep the positions alongside the
values or use a hash map instead.

## The mistakes, in the order people make them

1. **\`<=\` in the loop bound.** \`i <= a.length\` reads one past the end. The last
   index is \`length - 1\`.
2. **Assuming non-empty.** \`a[0]\` on a zero-length array throws. Every solution
   should survive \`[]\` and \`[x]\`.
3. **\`==\` on arrays.** That compares references. Use \`Arrays.equals(a, b)\`, and
   \`Arrays.deepEquals\` for nested ones.
4. **Printing with \`println(a)\`.** Prints the type and a hash. Use
   \`Arrays.toString(a)\`.
5. **Copying by assignment.** \`int[] b = a\` gives two names for one array.
   \`a.clone()\` or \`Arrays.copyOf(a, n)\` is a copy.
6. **\`int\` sums.** The sum of 10⁵ values near a million overflows an \`int\`
   silently. Use \`long\`.
7. **Modifying while iterating.** Removing from an \`ArrayList\` inside a
   \`for-each\` throws \`ConcurrentModificationException\`. Iterate backwards with
   an index, or use \`removeIf\`.
8. **Comparing against the wrong neighbour** in a two-index pass — \`a[write-1]\`
   is the last kept, \`a[read-1]\` is the last seen, and they are not the same.

## The Java you will reach for

| You want | Write |
|---|---|
| Length | \`a.length\` (no brackets) |
| Sort | \`Arrays.sort(a)\` |
| Sort part of it | \`Arrays.sort(a, from, to)\` |
| Print | \`Arrays.toString(a)\` |
| Copy | \`Arrays.copyOf(a, n)\`, \`Arrays.copyOfRange(a, from, to)\` |
| Fill | \`Arrays.fill(a, value)\` |
| Compare contents | \`Arrays.equals(a, b)\` |
| Binary search a sorted array | \`Arrays.binarySearch(a, key)\` |
| Array to list | \`Arrays.stream(a).boxed().toList()\` |
| List to array | \`list.stream().mapToInt(Integer::intValue).toArray()\` |
| Two-dimensional | \`int[][] grid = new int[rows][cols]\` |
| Sort rows by a column | \`Arrays.sort(g, (x, y) -> Integer.compare(x[0], y[0]))\` |

\`Arrays.binarySearch\` returns the index if found, and otherwise
\`-(insertionPoint) - 1\` — a negative number that tells you where the value would
have gone. That is more useful than it looks, and it is why the return value is
not simply \`-1\`.

## Working one from the sheet

[Best Time to Buy and Sell Stock](problem:best-time-to-buy-and-sell-stock): given
daily prices, find the largest profit from one buy and one later sell.

The nested-loop answer tries every pair, O(n²). The trick is to notice what you
actually need at each day: the best profit if you sell *today* is today's price
minus the cheapest price *so far*. So walk once, keeping the cheapest seen.

![The cheapest price so far, carried forward instead of rescanned](diagrams/arrays-notes-carry-it-forward.jpg)

\`\`\`java Stock.java @run-arrays-stock
public class Stock {

    static int maxProfit(int[] prices) {
        int cheapest = Integer.MAX_VALUE;
        int best = 0;
        for (int price : prices) {
            if (price < cheapest) cheapest = price;
            else best = Math.max(best, price - cheapest);
        }
        return best;
    }

    public static void main(String[] args) {
        System.out.println(maxProfit(new int[] { 7, 1, 5, 3, 6, 4 }));  // 5
        System.out.println(maxProfit(new int[] { 7, 6, 4, 3, 1 }));     // 0, never sell
        System.out.println(maxProfit(new int[] { 2, 4, 1 }));           // 2
        System.out.println(maxProfit(new int[] { 1 }));                 // 0
    }
}
\`\`\`

\`\`\`output @run-arrays-stock
5
0
2
0
\`\`\`

\`best\` starts at 0 rather than at \`Integer.MIN_VALUE\`, because you are allowed
not to trade at all. Small decision, and it is the difference between the second
test returning 0 and returning a negative number.

That reasoning — *what do I need to know at position i, and can I carry it
forward instead of recomputing it* — is the single idea behind most of the
medium problems in this topic, and it is the same idea that becomes
[Kadane's algorithm](#/dsa/kadanes-algorithm/notes) one topic later.

## How to work through the topic

1. [Two Sum](problem:two-sum), [Contains Duplicate](problem:contains-duplicate),
   [Missing Number](problem:missing-number). Say the brute force out loud, then
   find the one-pass version. Two of the three want a hash map; the third has an
   arithmetic answer worth spotting.
2. [Move Zeroes](problem:move-zeroes),
   [Majority Element](problem:majority-element). The two-index pass, and then
   Boyer–Moore voting — which looks like a magic trick and is worth
   understanding rather than memorising.
3. [Best Time to Buy and Sell Stock](problem:best-time-to-buy-and-sell-stock),
   [Maximum Product Subarray](problem:maximum-product-subarray). Carry a running
   answer. The product version needs the minimum too, because a negative times a
   negative is large.
4. [Rotate Array](problem:rotate-array),
   [Product of Array Except Self](problem:product-of-array-except-self),
   [Spiral Matrix](problem:spiral-matrix). Index arithmetic. Draw the small case.
5. [3Sum](problem:3sum),
   [Find Minimum in Rotated Sorted Array](problem:find-minimum-in-rotated-sorted-array).
   Sorting as a tool, and the first hint of binary search on something that is
   not quite sorted.
6. [First Missing Positive](problem:first-missing-positive),
   [Trapping Rain Water](problem:trapping-rain-water),
   [Next Permutation](problem:next-permutation). All three are famous for a
   reason. Leave them until the first five feel routine, then give each one a
   full hour.
`;export{e as default};