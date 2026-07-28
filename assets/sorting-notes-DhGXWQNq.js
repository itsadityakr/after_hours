var e=`Almost no interview asks you to write a sort. The library has one, it is better
than yours, and reaching for it is the right answer. What an interview asks
constantly is a question that becomes easy once the input is in the right
order — and getting it into that order means choosing a comparator, which is a
design decision rather than a library call.

So this topic has two halves. The first is what \`Arrays.sort\` actually does,
what it guarantees, and how to tell it what "in order" means for your data. The
second is the few sorts you should still be able to write from memory: merge
sort, because the merge step gets reused everywhere; quicksort, because
partitioning does; and the counting sorts, because when the values come from a
small range they beat n log n outright and turn several problems on this sheet
linear.

Underneath all of it is one habit. Before writing a loop, ask whether sorting
first would make the loop unnecessary. [3Sum](problem:3sum) is O(n³) unsorted
and O(n²) sorted. [Meeting Rooms II](problem:meeting-rooms-ii) is hard to reason
about unsorted and obvious once the intervals are in start order. The sort costs
O(n log n); the question is only ever whether it buys back more.

## The sort you already have

\`\`\`java
int[] a = { 5, 2, 9, 1 };
Arrays.sort(a);                                  // 1, 2, 5, 9 — in place

Integer[] boxed = { 5, 2, 9, 1 };
Arrays.sort(boxed, Comparator.reverseOrder());   // 9, 5, 2, 1

List<String> names = new ArrayList<>(List.of("Cy", "Ada", "Bo"));
names.sort(Comparator.naturalOrder());           // Ada, Bo, Cy
\`\`\`

- **It sorts in place and returns nothing.** \`int[] b = Arrays.sort(a)\` does not
  compile. If you need the original order afterwards, sort \`a.clone()\`.
- **\`Arrays.sort(a, from, to)\`** sorts a slice, \`to\` exclusive.
- **There is no descending sort for \`int[]\`.** No overload takes a comparator for
  a primitive array. Sort ascending and reverse, or box into \`Integer[]\`. This
  catches people out under pressure, so know it now.
- **Sorting destroys the original positions.** If the answer is indices, keep
  them alongside the values or sort a copy.

## Primitives and objects are sorted differently

| Input | Algorithm | Worst case | Stable |
|---|---|---|---|
| \`int[]\`, \`long[]\`, \`double[]\` | dual-pivot quicksort | O(n²) | no |
| \`Integer[]\`, \`String[]\`, any \`Object[]\` | TimSort | O(n log n) | yes |
| \`List\`, via \`list.sort\` or \`Collections.sort\` | TimSort | O(n log n) | yes |

**Stability** means equal elements keep the order they arrived in. That is what
lets you sort by two keys in two passes: sort by the secondary key, then by the
primary, and the secondary order survives inside each group. It only works
because TimSort is stable. On \`int[]\` there is no such guarantee — though for
plain integers you cannot tell two equal values apart anyway.

**The quadratic worst case** is real. Dual-pivot quicksort takes its pivots from
fixed positions, so an adversary who knows the algorithm can construct an array
where every partition is maximally lopsided. Some judges keep one in their test
set, and the symptom is a solution that is O(n log n) on paper timing out on a
single hidden case. Two fixes:

\`\`\`java
// Box it, so TimSort runs instead — O(n log n) guaranteed.
Integer[] boxed = Arrays.stream(a).boxed().toArray(Integer[]::new);

// Or shuffle first, so no fixed input can be the bad one.
Random rnd = new Random();
for (int i = a.length - 1; i > 0; i--) {
    int j = rnd.nextInt(i + 1);
    int t = a[i]; a[i] = a[j]; a[j] = t;
}
Arrays.sort(a);
\`\`\`

Boxing costs memory and pointer chasing; shuffling costs one linear pass. Do
neither by default — do one when a correct solution times out and nothing else
explains it.

## Comparators, in full

A comparator answers one question: given \`a\` and \`b\`, which comes first? Negative
means \`a\`, zero means equal, positive means \`b\`. You rarely write that
arithmetic yourself.

\`\`\`java
Comparator.comparingInt((int[] p) -> p[0])   // by the first column, ascending
Comparator.comparing(Person::name)           // by any Comparable key
\`\`\`

\`comparingInt\` exists alongside \`comparing\` because \`comparing\` boxes every key
it extracts. There are \`comparingLong\` and \`comparingDouble\` too.

\`\`\`java
Comparator<int[]> byStartThenLongest = Comparator
    .comparingInt((int[] p) -> p[0])                        // start, ascending
    .thenComparing(p -> p[1], Comparator.reverseOrder());   // end, descending
\`\`\`

\`thenComparing\` is consulted only when everything before it returned zero, which
is exactly what "break the tie by" means. \`reversed()\` flips everything built so
far, so where you put it matters:

\`\`\`java
Comparator.comparingInt(Person::height).reversed().thenComparing(Person::name)
// tallest first; among equal heights, names ascending

Comparator.comparingInt(Person::height).thenComparing(Person::name).reversed()
// the whole thing backwards, names included
\`\`\`

One rule you must not break: **never subtract inside a comparator.**
\`(a, b) -> a - b\` looks like it compares, and does, until the subtraction
overflows. \`2000000000 - (-2000000000)\` is four billion, does not fit in an
\`int\`, wraps negative, and the comparator reports that two billion is the
smaller of the two. \`Integer.compare(a, b)\` is branches rather than arithmetic
and cannot overflow. Same for \`p[1] - q[1]\` inside an array comparator.

The other rule is consistency. If a comparator says \`a < b\` and \`b < c\` it must
say \`a < c\`, and it must never say both \`a < b\` and \`b < a\`. TimSort checks, and
throws \`IllegalArgumentException: Comparison method violates its general
contract!\` when yours is not an ordering. That message means your comparator is
wrong.

\`\`\`java Comparators.java @run-sorting-comparators
import java.util.Arrays;
import java.util.Comparator;

public class Comparators {

    /** A person: a name, and a height in centimetres. */
    record Person(String name, int height) {}

    public static void main(String[] args) {
        // Subtraction overflows. Integer.compare never does.
        Integer[] wrong = { 2_000_000_000, -2_000_000_000, 0 };
        Integer[] right = { 2_000_000_000, -2_000_000_000, 0 };
        Arrays.sort(wrong, (a, b) -> a - b);
        Arrays.sort(right, (a, b) -> Integer.compare(a, b));
        System.out.println("a - b            " + Arrays.toString(wrong));
        System.out.println("Integer.compare  " + Arrays.toString(right));

        // Tallest first, ties broken by name.
        Person[] people = {
            new Person("Ada", 170), new Person("Bo", 165),
            new Person("Cy", 170), new Person("Di", 165),
        };
        Arrays.sort(people, Comparator
                .comparingInt((Person p) -> p.height()).reversed()
                .thenComparing(p -> p.name()));
        for (Person p : people) System.out.println("  " + p.name() + " " + p.height());

        // Rows of a 2D array: start ascending, then end descending.
        int[][] intervals = { { 5, 7 }, { 1, 4 }, { 1, 2 }, { 8, 9 } };
        Arrays.sort(intervals, Comparator
                .comparingInt((int[] r) -> r[0])
                .thenComparing(r -> r[1], Comparator.reverseOrder()));
        System.out.println("intervals        " + Arrays.deepToString(intervals));
    }
}
\`\`\`

\`\`\`output @run-sorting-comparators
a - b            [2000000000, -2000000000, 0]
Integer.compare  [-2000000000, 0, 2000000000]
  Ada 170
  Cy 170
  Bo 165
  Di 165
intervals        [[1, 4], [1, 2], [5, 7], [8, 9]]
\`\`\`

The first two output lines are the argument against subtraction: the array is
left in an order that is not sorted by any definition, and nothing threw. Note
\`(Person p) -> p.height()\` rather than \`Person::height\` — once you chain
\`.reversed()\` there is nothing for the compiler to infer the element type from,
and naming the parameter type is the shortest fix.

## Merge sort

Split in half, sort each half, merge the two sorted halves. The recursion is
trivial; the merge is what is worth having by heart. Two fingers, one on each
half — take the smaller, advance that finger.

\`\`\`text
left  [2, 5, 9]     right [1, 5, 6]     out []
       i                   j

 2 vs 1   take 1 (right)                out [1]
 2 vs 5   take 2 (left)                 out [1, 2]
 5 vs 5   tie — take the LEFT one       out [1, 2, 5]
 9 vs 5   take 5 (right)                out [1, 2, 5, 5]
 9 vs 6   take 6 (right)                out [1, 2, 5, 5, 6]
 right empty — drain the left           out [1, 2, 5, 5, 6, 9]
\`\`\`

The tie is the stability argument, and it is one character of code. On a tie you
take from the left half — the one whose elements came earlier in the original
array — so equal elements never swap places. Written as
\`buf[k++] = (a[j] < a[i]) ? a[j++] : a[i++]\`, the \`<\` means "prefer the right
one only when it is strictly smaller". Change it to \`<=\` and the sort is still
correct and no longer stable.

O(n log n) always: log n levels, O(n) merging per level. It needs an O(n)
buffer, which is its one real cost against quicksort. Allocate that buffer once,
outside the recursion — a fresh \`new int[n]\` per call turns a fast sort into a
garbage collector benchmark. Merge sort is also the right answer for
[Sort List](problem:sort-list), because a linked list can be merged without any
buffer at all.

## Quicksort and the Lomuto partition

Pick a pivot. Rearrange so everything smaller sits left of it and everything
larger sits right. The pivot is now in its final position, and you recurse into
the two sides — with no merge step, because the partition already did the work.
Lomuto's version is the one to memorise, because it is five lines.

\`\`\`text
a = [3, 7, 8, 5, 2, 1, 9, 5]   pivot = a[hi] = 5

i=0  3 <= 5   swap into store 0   [3, 7, 8, 5, 2, 1, 9, 5]  store=1
i=1  7 >  5   leave                                          store=1
i=2  8 >  5   leave                                          store=1
i=3  5 <= 5   swap 1 and 3        [3, 5, 8, 7, 2, 1, 9, 5]  store=2
i=4  2 <= 5   swap 2 and 4        [3, 5, 2, 7, 8, 1, 9, 5]  store=3
i=5  1 <= 5   swap 3 and 5        [3, 5, 2, 1, 8, 7, 9, 5]  store=4
i=6  9 >  5   leave                                          store=4

pivot into place: swap 4 and 7    [3, 5, 2, 1, 5, 7, 9, 8]
                                               ^ index 4, final
\`\`\`

The invariant is the whole proof: at every step \`a[lo..store)\` holds values at
most the pivot and \`a[store..i)\` holds values greater than it, so swapping the
pivot into \`store\` puts it exactly between them.

O(n log n) on average, O(n²) when the pivot is always the smallest or largest —
which is what a sorted input does to a last-element pivot. A random pivot, or
the median of three, makes that a lottery you are unlikely to lose. It sorts in
place, which is why the library uses it for primitives.

## Quickselect: the k-th element without sorting

Partitioning tells you exactly where one element belongs. If that index is \`k\`
you are done and never needed the rest sorted. If not, \`k\` lies on one side, so
you recurse into that side and discard the other.

Discarding half each time gives n + n/2 + n/4 + … which sums to 2n, so the
average is O(n) — better than the O(n log n) of sorting and the O(n log k) of a
[heap](#/dsa/heaps/notes). The worst case is O(n²) and a random pivot is the
answer to that. This is the intended solution to
[Kth Largest Element in an Array](problem:kth-largest-element-in-an-array), and
saying "quickselect, O(n) average" out loud is most of the mark.

\`\`\`java Sorts.java @run-sorting-sorts
import java.util.Arrays;

public class Sorts {

    /** Merge sort: sort each half, then merge the two sorted halves. */
    static void mergeSort(int[] a, int[] buf, int lo, int hi) {
        if (lo >= hi) return;
        int mid = lo + (hi - lo) / 2;
        mergeSort(a, buf, lo, mid);
        mergeSort(a, buf, mid + 1, hi);
        merge(a, buf, lo, mid, hi);
    }

    static void merge(int[] a, int[] buf, int lo, int mid, int hi) {
        int i = lo, j = mid + 1, k = lo;
        while (i <= mid && j <= hi)
            buf[k++] = (a[j] < a[i]) ? a[j++] : a[i++];  // < keeps it stable
        while (i <= mid) buf[k++] = a[i++];
        while (j <= hi) buf[k++] = a[j++];
        for (int t = lo; t <= hi; t++) a[t] = buf[t];
    }

    /** Lomuto partition: everything <= the pivot ends up left of it. */
    static int partition(int[] a, int lo, int hi) {
        int pivot = a[hi];
        int store = lo;
        for (int i = lo; i < hi; i++)
            if (a[i] <= pivot) swap(a, store++, i);
        swap(a, store, hi);
        return store;
    }

    static void quickSort(int[] a, int lo, int hi) {
        if (lo >= hi) return;
        int p = partition(a, lo, hi);
        quickSort(a, lo, p - 1);
        quickSort(a, p + 1, hi);
    }

    /** The k-th smallest, k counted from 0. Partitions one side only. */
    static int quickSelect(int[] a, int k) {
        int lo = 0, hi = a.length - 1;
        while (lo < hi) {
            int p = partition(a, lo, hi);
            if (p == k) return a[p];
            if (p < k) lo = p + 1; else hi = p - 1;
        }
        return a[lo];
    }

    static void swap(int[] a, int i, int j) { int t = a[i]; a[i] = a[j]; a[j] = t; }

    public static void main(String[] args) {
        int[] a = { 5, 2, 9, 1, 5, 6 };
        mergeSort(a, new int[a.length], 0, a.length - 1);
        System.out.println("merge sort   " + Arrays.toString(a));

        int[] b = { 5, 2, 9, 1, 5, 6 };
        quickSort(b, 0, b.length - 1);
        System.out.println("quicksort    " + Arrays.toString(b));

        int[] c = { 3, 2, 1, 5, 6, 4 };
        System.out.println("2nd largest  " + quickSelect(c, c.length - 2));

        int[] none = {};
        mergeSort(none, new int[0], 0, -1);
        System.out.println("empty        " + Arrays.toString(none));
    }
}
\`\`\`

\`\`\`output @run-sorting-sorts
merge sort   [1, 2, 5, 5, 6, 9]
quicksort    [1, 2, 5, 5, 6, 9]
2nd largest  5
empty        []
\`\`\`

Both sorts survive the empty and one-element arrays because \`lo >= hi\` catches
them before anything is indexed. Get that guard right once and the edge cases
stop coming up.

## Beating n log n: the counting family

No comparison sort can do better than O(n log n): there are n! orders, each
comparison halves the possibilities, and log₂(n!) is about n log n. The way past
the bound is to stop comparing. If you know something about the values, you can
place them directly.

**Counting sort.** When every value lies in a small known range, count how many
of each there are and write them back out in order.

\`\`\`java
static int[] countingSort(int[] a, int k) {   // values known to be in 0..k
    int[] count = new int[k + 1];
    for (int v : a) count[v]++;
    int[] out = new int[a.length];
    int w = 0;
    for (int v = 0; v <= k; v++)
        while (count[v]-- > 0) out[w++] = v;
    return out;
}
\`\`\`

O(n + k) time, O(k) space. Worth it when \`k\` is comparable to \`n\` or smaller,
and useless when values are arbitrary \`int\`s — four billion counters is not a
plan. [Sort Colors](problem:sort-colors) is counting sort with \`k = 2\`, and
[Height Checker](problem:height-checker) is counting sort with \`k = 100\`.

**Bucket sort by frequency.** The same idea with the roles swapped: bucket by
count instead of by value. An element appears at most \`n\` times, so make \`n + 1\`
buckets, drop each distinct value into the bucket numbered by its count, and
read from the top down until you have \`k\`. This is the good answer to
[Top K Frequent Elements](problem:top-k-frequent-elements).

\`\`\`text
nums = [1, 1, 1, 2, 2, 3],  k = 2

counts    1 -> 3,   2 -> 2,   3 -> 1
bucket[1] = [3]     bucket[2] = [2]     bucket[3] = [1]

read from bucket[n] downwards: 1, then 2   -> [1, 2]
\`\`\`

O(n), against O(n log k) for the heap answer and O(n log n) for sorting the
counts. [Sort Characters By Frequency](problem:sort-characters-by-frequency) is
the same structure with 128 possible keys instead of n, and
[Sort Array By Increasing Frequency](problem:sort-array-by-increasing-frequency)
is the comparator version of it.

**Radix sort**, in a paragraph: when the range is too large for one counting
pass, sort by the last digit with a stable counting sort, then by the next
digit, and so on. Each pass being stable is what makes the earlier digits
survive, so after \`d\` passes the whole thing is sorted, in O(d × (n + 10)). It
is rarely what an interview wants, and it is the reason
[Maximum Gap](problem:maximum-gap) can be claimed to be linear.

## Cyclic sort

A pattern rather than a general sort, and the one that quietly solves a whole
family. When the input is a permutation of \`1..n\` — possibly with a value
missing or duplicated — every value has an obvious home: \`v\` belongs at index
\`v - 1\`. Walk the array, and whenever \`a[i]\` is not home, swap it to where it
belongs. Whatever it displaces gets examined next.

\`\`\`text
a = [3, 1, 5, 4, 2]

i=0  a[0]=3 belongs at 2   swap 0,2   [5, 1, 3, 4, 2]
i=0  a[0]=5 belongs at 4   swap 0,4   [2, 1, 3, 4, 5]
i=0  a[0]=2 belongs at 1   swap 0,1   [1, 2, 3, 4, 5]
i=0  a[0]=1 is home        i++
i=1..4  all home           i++ each time
\`\`\`

The loop looks quadratic and is not. Every swap puts at least one value in its
final place permanently, so there are at most n swaps in the whole run and \`i\`
advances at most n times. O(n) time, O(1) space. Afterwards the first index
where \`a[i] != i + 1\` is the missing number, the duplicate, or the corrupt pair,
depending on what was asked.

\`\`\`java Cyclic.java @run-sorting-cyclic
import java.util.Arrays;

public class Cyclic {

    /** Send every value v in 1..n to index v - 1, by swapping. */
    static void cyclicSort(int[] a) {
        int i = 0;
        while (i < a.length) {
            int home = a[i] - 1;                       // where a[i] belongs
            if (a[i] >= 1 && a[i] <= a.length && a[home] != a[i]) swap(a, i, home);
            else i++;
        }
    }

    /** The smallest positive integer that is not in a. */
    static int firstMissingPositive(int[] a) {
        cyclicSort(a);
        for (int i = 0; i < a.length; i++)
            if (a[i] != i + 1) return i + 1;
        return a.length + 1;
    }

    static void swap(int[] a, int i, int j) { int t = a[i]; a[i] = a[j]; a[j] = t; }

    public static void main(String[] args) {
        int[] a = { 3, 1, 5, 4, 2 };
        cyclicSort(a);
        System.out.println("cyclic sort  " + Arrays.toString(a));

        System.out.println("[1,2,0]       " + firstMissingPositive(new int[] { 1, 2, 0 }));
        System.out.println("[3,4,-1,1]    " + firstMissingPositive(new int[] { 3, 4, -1, 1 }));
        System.out.println("[7,8,9,11,12] " + firstMissingPositive(new int[] { 7, 8, 9, 11, 12 }));
        System.out.println("[]            " + firstMissingPositive(new int[] {}));
    }
}
\`\`\`

\`\`\`output @run-sorting-cyclic
cyclic sort  [1, 2, 3, 4, 5]
[1,2,0]       3
[3,4,-1,1]    2
[7,8,9,11,12] 1
[]            1
\`\`\`

The guard is \`a[home] != a[i]\`, not \`home != i\`. If the home slot already holds
this value the swap would achieve nothing, so you move on instead — and that one
condition is the difference between
[First Missing Positive](problem:first-missing-positive) passing and hanging.
The same routine, read differently, answers
[Missing Number](problem:missing-number) and
[Find the Duplicate Number](problem:find-the-duplicate-number).

## What it costs

| Sort | Time | Space | Stable | Reach for it when |
|---|---|---|---|---|
| \`Arrays.sort\`, primitives | O(n log n) avg, O(n²) worst | O(log n) | no | default for \`int[]\` |
| \`Arrays.sort\`, objects | O(n log n) | O(n) | yes | default for everything else |
| Merge sort | O(n log n) | O(n) | yes | stability, or a linked list |
| Quicksort | O(n log n) avg, O(n²) worst | O(log n) | no | in place, primitives |
| Quickselect | O(n) avg, O(n²) worst | O(1) | n/a | one k-th element |
| Counting sort | O(n + k) | O(k) | yes | small known value range |
| Bucket by frequency | O(n) | O(n) | n/a | top-k by count |
| Radix sort | O(d × (n + b)) | O(n + b) | yes | fixed-width integer keys |
| Cyclic sort | O(n) | O(1) | no | values are a permutation of 1..n |

The O(log n) for quicksort is the recursion stack, not a buffer — log n levels
deep when the pivots split evenly.

## The mistakes, in the order people make them

1. **\`a - b\` inside a comparator.** Overflows on large or small values and the
   sort quietly produces a wrong order. Use \`Integer.compare(a, b)\`.
2. **Expecting \`Arrays.sort(a)\` to return something.** It is \`void\` and sorts in
   place.
3. **\`Arrays.sort(intArray, Comparator.reverseOrder())\`.** No such overload for
   primitives. Box, or sort and reverse.
4. **A comparator that is not an ordering.** Returning \`1\` for "not equal", or
   keying on a field that changes, gives
   \`Comparison method violates its general contract!\`.
5. **Sorting inside a loop.** An O(n log n) sort inside an O(n) loop is
   O(n² log n). Sort once, before the loop.
6. **Allocating the merge buffer inside the recursion.** Correct, and slow
   enough to time out. One buffer, passed down.
7. **Running plain Lomuto on an array of equal values.** Every partition lands
   at one end and the sort is O(n²). Three-way partitioning — the Dutch national
   flag of [Sort Colors](problem:sort-colors) — is the fix, and it is why the
   library's quicksort is dual-pivot.
8. **Using \`lo == hi\` as the base case instead of \`lo >= hi\`.** An empty range
   has \`lo > hi\`, slips past the guard, and indexes off the end.
9. **Counting sort on unbounded values.** \`new int[max + 1]\` with \`max\` near
   10⁹ throws \`OutOfMemoryError\`. Check the stated range first.
10. **Cyclic sort without the duplicate guard.** It hangs the moment two equal
    values want the same slot.

## The Java you will reach for

| You want | Write |
|---|---|
| Sort ascending | \`Arrays.sort(a)\` |
| Sort a slice | \`Arrays.sort(a, from, to)\` — \`to\` exclusive |
| Sort objects descending | \`Arrays.sort(x, Comparator.reverseOrder())\` |
| Sort a list | \`list.sort(cmp)\`, \`Collections.sort(list)\` |
| Sort rows by a column | \`Arrays.sort(g, Comparator.comparingInt(r -> r[0]))\` |
| Key, then tie-break | \`cmp.thenComparing(other)\` |
| Flip an order | \`cmp.reversed()\` |
| Compare safely | \`Integer.compare\`, \`Long.compare\`, \`Double.compare\` |
| Reverse a list | \`Collections.reverse(list)\` |
| Box a primitive array | \`Arrays.stream(a).boxed().toArray(Integer[]::new)\` |
| Unbox again | \`Arrays.stream(x).mapToInt(Integer::intValue).toArray()\` |
| Search a sorted array | \`Arrays.binarySearch(a, x)\` — miss gives \`-(insertion) - 1\` |

\`Comparator.comparingInt(r -> r[0])\` needs its parameter written as \`(int[] r)\`
whenever you chain \`.reversed()\` or \`.thenComparing\` onto it, because there is
then nothing left for the compiler to infer the type from.

## Working one from the sheet

[Largest Number](problem:largest-number): arrange the numbers so that
concatenating them gives the largest possible number. \`[3, 30, 34, 5, 9]\` gives
\`9534330\`.

Sorting descending numerically is wrong, and \`[10, 2]\` shows it in one line:
numerically \`10\` comes first and gives \`102\`, when the answer is \`210\`. Sorting
the strings descending gets that pair right and fails on \`[3, 30, 34, 5, 9]\`.
Neither ordering is the one the question is about.

You do not need a rule about digits at all. You need a comparator that answers
"which of these two goes first", and for two strings \`a\` and \`b\` there are only
two possible outcomes — \`a + b\` or \`b + a\`. Compare those two and take the
bigger. That is the whole comparator, and that it happens to be a consistent
ordering is the non-obvious part.

\`\`\`java LargestNumber.java @run-sorting-largest-number
import java.util.Arrays;

public class LargestNumber {

    static String largestNumber(int[] nums) {
        String[] parts = new String[nums.length];
        for (int i = 0; i < nums.length; i++) parts[i] = String.valueOf(nums[i]);

        // Put b first when b + a reads larger than a + b.
        Arrays.sort(parts, (a, b) -> (b + a).compareTo(a + b));

        if (parts[0].equals("0")) return "0";      // every value was zero
        StringBuilder sb = new StringBuilder();
        for (String p : parts) sb.append(p);
        return sb.toString();
    }

    public static void main(String[] args) {
        System.out.println(largestNumber(new int[] { 10, 2 }));
        System.out.println(largestNumber(new int[] { 3, 30, 34, 5, 9 }));
        System.out.println(largestNumber(new int[] { 0, 0 }));
        System.out.println(largestNumber(new int[] { 1 }));
    }
}
\`\`\`

\`\`\`output @run-sorting-largest-number
210
9534330
0
1
\`\`\`

Two details carry it. \`String.compareTo\` compares lexicographically, which for
two strings of equal length is the same as comparing them as numbers — and
\`a + b\` and \`b + a\` always have equal length, so it is safe. And the zero check:
without it \`[0, 0]\` returns \`"00"\`. The algorithm was \`Arrays.sort\`; the work
was deciding what "in order" meant.

## How to work through the topic

1. [Sort Array by Parity](problem:sort-array-by-parity),
   [Merge Sorted Array](problem:merge-sorted-array),
   [Height Checker](problem:height-checker). Each hides a better answer than
   sorting: a two-pointer partition, a backwards merge, a counting sort. Find it.
2. [Sort the People](problem:sort-the-people),
   [Relative Sort Array](problem:relative-sort-array),
   [Sort Array By Increasing Frequency](problem:sort-array-by-increasing-frequency).
   Pure comparator design — sort by a key you have to build first.
3. [Sort Colors](problem:sort-colors),
   [Sort an Array (Merge Sort)](problem:sort-an-array). Write the counting sort
   and the merge sort by hand. Sort Colors also has a one-pass three-way
   partition worth knowing.
4. [Kth Largest Element in an Array](problem:kth-largest-element-in-an-array),
   [Top K Frequent Elements](problem:top-k-frequent-elements). Quickselect and
   bucket-by-frequency. Compare both against the [heap](#/dsa/heaps/notes)
   answer and be able to say when the heap wins.
5. [Meeting Rooms II](problem:meeting-rooms-ii),
   [Minimum Number of Arrows to Burst Balloons](problem:minimum-number-of-arrows-to-burst-balloons),
   [Queue Reconstruction by Height](problem:queue-reconstruction-by-height).
   Sorting as the setup for a greedy scan. Name the sort key before writing
   anything else.
6. [Reverse Pairs](problem:reverse-pairs),
   [Count of Smaller Numbers After Self](problem:count-of-smaller-numbers-after-self),
   [Maximum Gap](problem:maximum-gap). The hard band. The first two count during
   a merge — see [divide and conquer](#/dsa/divide-and-conquer/notes) — and the
   third is bucketing again. Leave them until merge sort is muscle memory, and
   read [binary search](#/dsa/binary-search/notes) if the counting argument does
   not land.
`;export{e as default};