var e=`Everybody can describe binary search in a sentence: look at the middle, throw
away the half that cannot contain the answer, repeat. Rather fewer can write it
without an off-by-one, and fewer still can write the version that returns "the
first element greater than or equal to \`x\`" instead of "is \`x\` here". This is
the most bug-prone pattern on the sheet, and none of the bugs are conceptual —
they are all in the bounds.

So this page is arranged around getting it right rather than around what it is.
One loop form used everywhere. One invariant, stated out loud. Two named
searches that between them answer every "first position where" question.

Then the part worth the practice. Binary search does not need an array. It needs
a range of candidates and a question whose answer flips from no to yes exactly
once. When the input is far too large to scan but the *answer* lives in a
numeric range you can name, you search the answer space instead.

## What it actually needs

Not "a sorted array" — that is one instance. It needs a range of positions and a
yes/no test \`p(i)\` that is **monotone**: false for a while, then true for the

![A monotone predicate flips from false to true exactly once](diagrams/binary-search-notes-monotone-predicate.jpg)
rest, and never false again after it turns true.

\`\`\`text
i      0     1     2     3     4     5     6     7
p(i)   F     F     F     F     T     T     T     T
                             ^
                             the boundary — the one thing a binary search finds
\`\`\`

If \`p\` goes \`F T F T\` then halving is not justified, because a false at the
midpoint tells you nothing about what lies to its left. Every correct use of
this pattern comes with a sentence saying why the test is monotone; without that
sentence you are guessing. "Sorted array, is \`x\` present" is that test with
\`p(i)\` being \`a[i] >= x\` — sorting makes it monotone for free, which is why
sorting and searching go together, and [sorting](#/dsa/sorting/notes) is the
other half of it.

Each probe removes half the remaining candidates, so \`n\` candidates take
\`log₂ n\` probes: 10 for a thousand, 20 for a million, 30 for a billion, 60 for
10¹⁸. That last figure is why an answer-space search stays cheap however large
the answer space is.

## The classic: an exact match

\`\`\`java
static int find(int[] a, int key) {
    int lo = 0, hi = a.length - 1;        // a closed range: [lo, hi]
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        if (a[mid] == key) return mid;
        if (a[mid] < key) lo = mid + 1;   // key is strictly right of mid
        else              hi = mid - 1;   // key is strictly left of mid
    }
    return -1;                            // lo > hi: the range is empty
}
\`\`\`

\`mid\` has been compared and is not the answer, so it is excluded from both new
ranges — \`mid + 1\` and \`mid - 1\`, never \`mid\`. That is what guarantees the range
shrinks every iteration, which is what guarantees termination. And \`<=\` rather
than \`<\`, because when \`lo == hi\` there is still one element to look at.

### Why lo + (hi - lo) / 2

\`(lo + hi) / 2\` is the obvious spelling and it is wrong. Both are \`int\`. If each
is around a billion, \`lo + hi\` exceeds \`Integer.MAX_VALUE\` (2,147,483,647), wraps
to a negative number, and the division gives a negative \`mid\`.

![Why lo + (hi - lo) / 2 and never (lo + hi) / 2](diagrams/binary-search-notes-midpoint-overflow.jpg)

\`\`\`text
lo = 1_500_000_000   hi = 2_000_000_000

(lo + hi) / 2        3_500_000_000 does not fit in an int
                     -> wraps to -794_967_296   -> mid = -397_483_648

lo + (hi - lo) / 2   hi - lo = 500_000_000, always fits
                     -> 1_500_000_000 + 250_000_000 = 1_750_000_000
\`\`\`

\`hi - lo\` is a distance, never larger than either endpoint, so it cannot
overflow when the endpoints are valid. On an array this is theoretical — nobody
has two billion elements. On a search over the *answer*, where \`hi\` might
legitimately be 10⁹, it is an everyday problem. Write it the safe way always and
you never have to decide which case you are in. This is not invented: the JDK's
own \`Arrays.binarySearch\` shipped with the overflowing version for nine years.

## The half-open invariant

The closed form is fine for exact match and awkward for everything else. The
form to standardise on is **half-open**: \`lo\` is included, \`hi\` is not, so the
live range is \`[lo, hi)\` and \`hi\` starts at \`n\` rather than \`n - 1\`.

\`\`\`java
int lo = 0, hi = n;                    // [lo, hi) — hi is one past the end
while (lo < hi) {
    int mid = lo + (hi - lo) / 2;
    if (p(mid)) hi = mid;              // mid might be the answer, so keep it
    else        lo = mid + 1;          // mid is definitely not, so drop it
}
return lo;                             // lo == hi: the first index where p holds
\`\`\`

The invariant, which you should say out loud as you write it:

> Everything before \`lo\` is false. Everything from \`hi\` onwards is true. The
> answer is somewhere in \`[lo, hi)\`.

Both updates preserve it. If \`p(mid)\` is true then everything from \`mid\` on is
true, so \`hi = mid\`. If it is false then everything up to and including \`mid\` is
false, so \`lo = mid + 1\`. When the loop ends \`lo == hi\`, the live range is
empty, and the invariant says \`lo\` is the boundary.

![The half-open window shrinking, one probe at a time](diagrams/binary-search-notes-halving.svg)

Three properties fall out, and they are the reason to prefer this form.

- **It always terminates.** \`mid < hi\` always, because \`mid\` rounds down and
  \`lo < hi\`. So \`hi = mid\` strictly shrinks the range and so does \`lo = mid + 1\`.
  Neither branch can leave the range unchanged.
- **It never reads out of range.** \`mid\` is at least \`lo\` and less than \`hi ≤ n\`.
- **It has one return.** No \`return mid\` inside, no special case for not found.
  \`lo == n\` at the end means "no index satisfies it", which is a real answer
  rather than an error.

The infinite loop comes from mixing the forms. \`while (lo <= hi)\` with
\`hi = mid\` hangs the moment \`lo == hi == mid\`: the assignment changes nothing
and the condition is still true. Pick one form and keep it.

## Lower bound and upper bound

Memorise these two and stop writing binary searches from scratch. The code is
identical apart from one comparison operator.

| Name | Returns | Predicate |
|---|---|---|
| \`lowerBound(a, x)\` | first index with \`a[i] >= x\` | \`a[mid] >= x\` |
| \`upperBound(a, x)\` | first index with \`a[i] > x\` | \`a[mid] > x\` |

Everything else is these two, combined:

![Every question you can answer with lowerBound and upperBound](diagrams/binary-search-notes-bounds-toolkit.jpg)

\`\`\`text
a = [1, 2, 2, 2, 5, 8, 8, 13]        x = 2

lowerBound = 1   -> the first 2
upperBound = 4   -> one past the last 2

is x present?           lowerBound < n && a[lowerBound] == x
first position of x     lowerBound
last position of x      upperBound - 1
how many x are there    upperBound - lowerBound
where would x go        lowerBound        (that is Search Insert Position)
count of values < x     lowerBound
count of values <= x    upperBound
\`\`\`

That block answers [Search Insert Position](problem:search-insert-position), the
whole first-and-last-position family, and every "how many elements are below the
threshold" subquestion buried inside a harder problem. Neither routine cares
whether \`x\` is present, which is what makes them safe: there is no "not found"
branch to get wrong.

[First Bad Version](problem:first-bad-version) is \`lowerBound\` with the array
replaced by an API call — the predicate is \`isBadVersion(mid)\`, false then true,
and the answer is the first true. It is the smallest example of searching a
space that is not an array.

\`\`\`java Search.java @run-binary-search-search
import java.util.Arrays;

public class Search {

    /** Classic exact match over the closed range [lo, hi]. */
    static int find(int[] a, int key) {
        int lo = 0, hi = a.length - 1;
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;
            if (a[mid] == key) return mid;
            if (a[mid] < key) lo = mid + 1;
            else hi = mid - 1;
        }
        return -1;
    }

    /** First index with a[i] >= key, or a.length if there is none. */
    static int lowerBound(int[] a, int key) {
        int lo = 0, hi = a.length;
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            if (a[mid] >= key) hi = mid; else lo = mid + 1;
        }
        return lo;
    }

    /** First index with a[i] > key. One character different. */
    static int upperBound(int[] a, int key) {
        int lo = 0, hi = a.length;
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            if (a[mid] > key) hi = mid; else lo = mid + 1;
        }
        return lo;
    }

    /** The [first, last] positions of key, or [-1, -1]. */
    static int[] range(int[] a, int key) {
        int first = lowerBound(a, key);
        if (first == a.length || a[first] != key) return new int[] { -1, -1 };
        return new int[] { first, upperBound(a, key) - 1 };
    }

    public static void main(String[] args) {
        int[] a = { 1, 2, 2, 2, 5, 8, 8, 13 };
        System.out.println("a = " + Arrays.toString(a));
        for (int key : new int[] { 2, 3, 8, 0, 20 })
            System.out.printf("key %-3d find %-3d lower %d  upper %d  range %-9s count %d%n",
                    key, find(a, key), lowerBound(a, key), upperBound(a, key),
                    Arrays.toString(range(a, key)),
                    upperBound(a, key) - lowerBound(a, key));

        System.out.println();
        System.out.println("empty array, find   " + find(new int[] {}, 1));
        System.out.println("empty array, lower  " + lowerBound(new int[] {}, 1));
        System.out.println("one element, lower  " + lowerBound(new int[] { 5 }, 9));
    }
}
\`\`\`

\`\`\`output @run-binary-search-search
a = [1, 2, 2, 2, 5, 8, 8, 13]
key 2   find 3   lower 1  upper 4  range [1, 3]    count 3
key 3   find -1  lower 4  upper 4  range [-1, -1]  count 0
key 8   find 5   lower 5  upper 7  range [5, 6]    count 2
key 0   find -1  lower 0  upper 0  range [-1, -1]  count 0
key 20  find -1  lower 8  upper 8  range [-1, -1]  count 0

empty array, find   -1
empty array, lower  0
one element, lower  1
\`\`\`

\`printf\` takes \`%-3d\` to mean "an integer, left-aligned, at least three wide",
and \`%n\` for the line break; it is only there to keep the columns straight.

Look at \`key = 3\`, which is absent. \`find\` gives \`-1\`, but \`lowerBound\` gives 4
— the position a 3 would go to keep the array sorted. The bounds carry more
information than the exact-match search at no extra cost.

## Arrays.binarySearch and its negative return

Java has one built in, and the return value looks strange until you see why.

- **Found**: an index of a matching element. With duplicates, *which* one is
  unspecified, so it is no use for "the first occurrence".
- **Not found**: \`-(insertionPoint) - 1\`, where \`insertionPoint\` is where the key
  would go. Negative, so \`i >= 0\` is the found test, and \`-i - 1\` recovers the
  insertion point.

\`\`\`text
a = [1, 3, 5, 7]

key 5   ->  2                 found at index 2
key 4   ->  -(2) - 1 = -3     would be inserted at index 2
key 0   ->  -(0) - 1 = -1     would be inserted at the front
key 9   ->  -(4) - 1 = -5     would be inserted at the end
\`\`\`

Why not just \`-1\`? Because insertion point 0 would then be indistinguishable
from a valid index, and the \`-(x) - 1\` encoding has no such collision — every
miss maps to a distinct negative number, so one call answers both "is it here"
and "where does it belong".

The array must already be sorted; on an unsorted one the result is undefined,
not an exception. And there is no overload giving you the first of several equal
elements, which is why \`lowerBound\` is still worth writing by hand. \`TreeMap\`
offers the same idea with names: \`floorKey\`, \`ceilingKey\`, \`higherKey\`,
\`lowerKey\`.

## Rotated: one half is always sorted

[Search in Rotated Sorted Array](problem:search-in-rotated-sorted-array) takes a
sorted array, cuts it at an unknown point and swaps the two pieces. It is no
longer sorted, so the ordinary search is invalid — and yet it is still O(log n),
because of one observation.

> Cut a rotated sorted array anywhere. At least one of the two halves is
> ordinary sorted.

\`\`\`text
[4, 5, 6, 7, 0, 1, 2]     mid = 3, a[mid] = 7
left  [4, 5, 6, 7]   a[lo]=4 <= a[mid]=7   -> sorted, so reason about it here

[6, 7, 0, 1, 2, 4, 5]     mid = 3, a[mid] = 1
left  [6, 7, 0, 1]   a[lo]=6 >  a[mid]=1   -> contains the wrap
right [2, 4, 5]                            -> sorted, so reason about it here
\`\`\`

The test is \`a[lo] <= a[mid]\`. If it holds the left half is sorted, and two
comparisons — \`a[lo] <= key\` and \`key < a[mid]\` — say whether the key is inside
it. If it is, discard the right; if not, discard the left. If the test fails,
the right half is the sorted one and you ask the mirror question. Either way one
probe eliminates half the array. The sorted half is where you can *reason*; the
other half is where you send anything you could not place.

\`\`\`java Rotated.java @run-binary-search-rotated
import java.util.Arrays;

public class Rotated {

    /** Search a rotated sorted array of distinct values. */
    static int search(int[] a, int key) {
        int lo = 0, hi = a.length - 1;
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;
            if (a[mid] == key) return mid;
            if (a[lo] <= a[mid]) {                            // left half is sorted
                if (a[lo] <= key && key < a[mid]) hi = mid - 1;
                else lo = mid + 1;
            } else {                                          // right half is sorted
                if (a[mid] < key && key <= a[hi]) lo = mid + 1;
                else hi = mid - 1;
            }
        }
        return -1;
    }

    /** The smallest value, which is the point it was rotated at. */
    static int findMin(int[] a) {
        int lo = 0, hi = a.length - 1;
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            if (a[mid] > a[hi]) lo = mid + 1;   // the dip is strictly right of mid
            else hi = mid;                      // mid could itself be the dip
        }
        return a[lo];
    }

    public static void main(String[] args) {
        int[][] cases = {
            { 4, 5, 6, 7, 0, 1, 2 },
            { 6, 7, 0, 1, 2, 4, 5 },
            { 0, 1, 2, 4, 5, 6, 7 },   // rotated by zero
            { 2, 1 },
            { 1 },
        };
        for (int[] a : cases) {
            StringBuilder sb = new StringBuilder();
            for (int key : new int[] { 0, 1, 3, 7 })
                sb.append("  search(").append(key).append(")=").append(search(a, key));
            System.out.println(Arrays.toString(a) + "   min " + findMin(a) + sb);
        }
    }
}
\`\`\`

\`\`\`output @run-binary-search-rotated
[4, 5, 6, 7, 0, 1, 2]   min 0  search(0)=4  search(1)=5  search(3)=-1  search(7)=3
[6, 7, 0, 1, 2, 4, 5]   min 0  search(0)=2  search(1)=3  search(3)=-1  search(7)=1
[0, 1, 2, 4, 5, 6, 7]   min 0  search(0)=0  search(1)=1  search(3)=-1  search(7)=6
[2, 1]   min 1  search(0)=-1  search(1)=1  search(3)=-1  search(7)=-1
[1]   min 1  search(0)=-1  search(1)=0  search(3)=-1  search(7)=-1
\`\`\`

\`findMin\` compares against \`a[hi]\`, not \`a[lo]\`. Compare against \`a[lo]\` and the
not-rotated case breaks: in \`[0,1,2,4,5,6,7]\` the midpoint exceeds \`a[lo]\`,
which would send you right, away from the answer. Comparing against the right
end works in both cases, and that asymmetry is the thing to remember here.

Duplicates ruin the guarantee. If \`a[lo] == a[mid] == a[hi]\` you cannot tell
which half is sorted, and the honest fix is to step \`lo\` inwards by one, which
degrades to O(n). That is not a flaw in your solution — the information is
genuinely absent.

## Binary search on the answer

Here is the pattern the topic exists for.

Some problems give an input far too large to try every possibility, but the
*answer* is a single number in a range you can name. Bananas per hour. Ship
capacity. The largest sum of any piece. And for each candidate answer there is a
cheap check — usually one linear scan — saying whether that value would work.

> **The predicate must be monotone: false, false, false, true, true, true.** If
> a speed of 4 is fast enough then 5 is too, because being *more* generous never
> stops working. That sentence is the proof. If you cannot say it about your
> predicate, this pattern does not apply.

[Koko Eating Bananas](problem:koko-eating-bananas) is the canonical one. Piles
of bananas, \`h\` hours, one pile at a time at \`k\` bananas an hour, and any
leftover hour on a pile is wasted. Find the smallest \`k\` that finishes in time.

\`\`\`text
piles = [3, 6, 7, 11]   h = 8

k        1     2     3     4     5     6     7     8     9    10    11
hours   27    15    10     8     7     6     6     5     5     4     4
in 8?    F     F     F     T     T     T     T     T     T     T     T
                           ^
                           the first T — the answer is 4
\`\`\`

Candidates run from 1 to \`max(piles)\`: below 1 is meaningless and above the
biggest pile changes nothing. The check is a scan summing \`ceil(pile / k)\`. That
is O(n) per probe with \`log(max)\` probes, so O(n log max) overall — about thirty
scans for an answer space of a billion.

The recipe, every time:

1. **Name the answer.** One number. "The eating speed." "The ship capacity."
2. **Bound it.** A lower bound that is obviously too small or exactly minimal,
   and an upper bound that obviously works. Loose is fine — thirty probes covers
   a billion.
3. **Write \`feasible(x)\`** as a plain loop with no search in it, usually a greedy
   sweep counting how many days, pieces or hours \`x\` needs.
4. **Say the monotonicity sentence.** If it is not true, stop; wrong predicate.
5. **Run the half-open loop** and return \`lo\`.

| Problem | The answer being searched | \`feasible(x)\` |
|---|---|---|
| [Koko Eating Bananas](problem:koko-eating-bananas) | bananas per hour | total hours at speed \`x\` is at most \`h\` |
| [Capacity to Ship Packages Within D Days](problem:capacity-to-ship-packages-within-d-days) | ship capacity | filling ships of size \`x\` in order needs at most \`d\` days |
| [Split Array Largest Sum](problem:split-array-largest-sum) | the largest piece sum | cutting whenever the load would pass \`x\` needs at most \`k\` pieces |

The last two are the same problem in different words, which is worth noticing
before an interview rather than during one. [Divide Chocolate](problem:divide-chocolate)
is the same again with the inequality flipped — you want the *largest* minimum,
so the predicate is true-then-false and \`mid\` is kept on the other side.

\`\`\`java Answer.java @run-binary-search-answer
public class Answer {

    /** Hours needed to clear the piles at this speed. Ceiling division. */
    static long hoursAt(int[] piles, int speed) {
        long hours = 0;
        for (int p : piles) hours += (p + speed - 1) / speed;
        return hours;
    }

    static int minSpeed(int[] piles, int h) {
        int lo = 1, hi = 0;
        for (int p : piles) hi = Math.max(hi, p);      // fastest useful speed
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            if (hoursAt(piles, mid) <= h) hi = mid; else lo = mid + 1;
        }
        return lo;
    }

    /** Days needed if every ship holds at most \`capacity\`, loading in order. */
    static int daysAt(int[] weights, int capacity) {
        int days = 1, load = 0;
        for (int w : weights) {
            if (load + w > capacity) { days++; load = 0; }
            load += w;
        }
        return days;
    }

    static int minCapacity(int[] weights, int d) {
        int lo = 0, hi = 0;
        for (int w : weights) { lo = Math.max(lo, w); hi += w; }   // one item .. all of them
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            if (daysAt(weights, mid) <= d) hi = mid; else lo = mid + 1;
        }
        return lo;
    }

    public static void main(String[] args) {
        int[] piles = { 3, 6, 7, 11 };
        StringBuilder shape = new StringBuilder();
        int fastest = 0;
        for (int p : piles) fastest = Math.max(fastest, p);
        for (int k = 1; k <= fastest; k++) shape.append(hoursAt(piles, k) <= 8 ? 'T' : 'F');
        System.out.println("predicate for k = 1.." + fastest + "   " + shape);
        System.out.println("min speed, h = 8            " + minSpeed(piles, 8));
        System.out.println("min speed [30,11,23,4,20]   " + minSpeed(new int[] { 30, 11, 23, 4, 20 }, 6));

        int[] w = { 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 };
        System.out.println();
        for (int d : new int[] { 1, 3, 5, 10 })
            System.out.println("ship in " + d + " days, capacity " + minCapacity(w, d));
    }
}
\`\`\`

\`\`\`output @run-binary-search-answer
predicate for k = 1..11   FFFTTTTTTTT
min speed, h = 8            4
min speed [30,11,23,4,20]   23

ship in 1 days, capacity 55
ship in 3 days, capacity 21
ship in 5 days, capacity 15
ship in 10 days, capacity 10
\`\`\`

The printed predicate string is the whole idea in one line: a run of \`F\`, then
nothing but \`T\`. Note \`hoursAt\` returns \`long\` — ten thousand piles of a billion
bananas at speed one is 10¹³ hours, which does not fit an \`int\`. The predicate
is where overflow lives in these problems, far more often than \`mid\` is.

Ceiling division without floating point is \`(p + speed - 1) / speed\`.
\`Math.ceil((double) p / speed)\` works for small numbers and starts losing
precision above 2⁵³; the integer form has no such trouble for positive values.

## What it costs

| | Time | Space |
|---|---|---|
| Search a sorted array | O(log n) | O(1) iterative, O(log n) recursive |
| Lower or upper bound | O(log n) | O(1) |
| Sort, then many searches | O(n log n) once, O(log n) each | O(1) beyond the sort |
| Rotated array, distinct | O(log n) | O(1) |
| Rotated array, duplicates | O(n) worst case | O(1) |
| Search on the answer | O(check × log range) | whatever the check needs |

\`log n\` grows so slowly that the practical answer to "how many probes" is always
"about thirty, or sixty for a \`long\`". The trade to watch: sorting an unsorted
array to enable one search is O(n log n) to save O(n), which is a loss. Sorting
pays when there will be many queries, or when it buys something else at the same
time — usually it does, because sorted input also unlocks
[two pointers](#/dsa/two-pointers/notes).

The recursive spelling of binary search is the smallest honest example of
[divide and conquer](#/dsa/divide-and-conquer/notes), except that it throws one
half away instead of solving both — which is exactly why it is \`log n\` while
merge sort is \`n log n\`.

## The mistakes, in the order people make them

1. **\`(lo + hi) / 2\`.** Overflows once the bounds pass a billion, which an
   answer-space search reaches routinely.
2. **Mixing the two loop forms.** \`while (lo <= hi)\` with \`hi = mid\` hangs.
   Closed range goes with \`mid ± 1\`; half-open with \`hi = mid\` and \`lo = mid + 1\`.
3. **\`hi = a.length - 1\` in the half-open form.** The last element is never
   examined, and "not found" comes back as the last index instead of \`n\`.
4. **A predicate that is not monotone.** Nothing warns you; the search returns
   an arbitrary boundary, right on the small test and wrong on the large one.
5. **Overflow inside the predicate.** Summing hours, weights or sums as \`int\`.
   The search is fine and the check silently lies. Use \`long\`.
6. **Bounds that exclude the answer.** \`lo = 1\` when zero is legal, or
   \`hi = max(a)\` when the answer can be the total. Loose bounds cost one probe;
   wrong ones cost the answer.
7. **Trusting \`Arrays.binarySearch\` with duplicates.** It returns *an* index, not
   the first.
8. **Searching an unsorted array.** No exception, just a wrong number.
9. **\`return mid\` from a boundary search.** There is no \`mid\` at the end of a
   half-open loop. Return \`lo\`.

## The Java you will reach for

| You want | Write |
|---|---|
| The midpoint | \`int mid = lo + (hi - lo) / 2\` |
| Search a sorted array | \`Arrays.binarySearch(a, key)\` |
| Search part of it | \`Arrays.binarySearch(a, from, to, key)\` |
| Insertion point from a miss | \`-result - 1\` |
| Search a \`List\` | \`Collections.binarySearch(list, key)\` |
| With a comparator | \`Arrays.binarySearch(objs, key, cmp)\` |
| Smallest key at least x | \`TreeMap.ceilingKey(x)\`, \`TreeSet.ceiling(x)\` |
| Largest key at most x | \`TreeMap.floorKey(x)\`, \`TreeSet.floor(x)\` |
| Ceiling division | \`(a + b - 1) / b\` for positive values |
| A count that may run away | \`long\`, and cap it if it can |

\`TreeMap\` and \`TreeSet\` are binary search over a set that changes. When elements
arrive between queries, an array plus \`Arrays.binarySearch\` costs O(n) per
insert and the tree costs O(log n) — which is what
[Time Based Key-Value Store](problem:time-based-key-value-store) is really
asking about.

## Working one from the sheet

[Split Array Largest Sum](problem:split-array-largest-sum): cut an array of
positive numbers into \`k\` contiguous pieces so that the largest piece sum is as
small as possible, and return that sum.

The instinct is dynamic programming over "first \`i\` elements into \`j\` pieces",
which is O(n²k) and correct. The binary search answer is shorter, and it starts
by turning the question inside out: instead of asking *what is the smallest
largest sum*, ask *given a budget \`x\`, can it be done in \`k\` pieces or fewer?*
That is one greedy sweep — keep adding to the current piece, start a new one
whenever the next element would push it over \`x\` — and greedy is optimal because
delaying a cut never lets you use fewer pieces.

Now the monotonicity sentence: if budget \`x\` needs at most \`k\` pieces, then so
does \`x + 1\`, because every piece that fitted still fits. False, false, then
true forever, so the answer is the first true. The bounds pick themselves: the
budget cannot be below the largest single element, since that element must sit
in some piece, and it never needs to exceed the total, which is the one-piece
answer.

\`\`\`java Split.java @run-binary-search-split
import java.util.Arrays;

public class Split {

    /** Greedily cut at the budget, and count the pieces it takes. */
    static int piecesNeeded(int[] a, long budget) {
        int pieces = 1;                                      // there is always a first piece
        long load = 0;
        for (int v : a) {
            if (load + v > budget) { pieces++; load = v; }   // start a new piece
            else load += v;
        }
        return pieces;
    }

    static long splitArray(int[] a, int k) {
        long lo = 0, hi = 0;
        for (int v : a) { lo = Math.max(lo, v); hi += v; }   // biggest element .. the total
        while (lo < hi) {
            long mid = lo + (hi - lo) / 2;
            if (piecesNeeded(a, mid) <= k) hi = mid; else lo = mid + 1;
        }
        return lo;
    }

    public static void main(String[] args) {
        int[] a = { 7, 2, 5, 10, 8 };
        System.out.println("a = " + Arrays.toString(a));
        for (int k = 1; k <= a.length; k++)
            System.out.println("  k = " + k + "   largest sum " + splitArray(a, k));

        System.out.println();
        System.out.println("one element, k = 1   " + splitArray(new int[] { 5 }, 1));

        int[] big = new int[1000];
        Arrays.fill(big, 1_000_000);
        System.out.println("1000 x 1e6, k = 3    " + splitArray(big, 3));
        System.out.println("1000 x 1e6, k = 1    " + splitArray(big, 1));
    }
}
\`\`\`

\`\`\`output @run-binary-search-split
a = [7, 2, 5, 10, 8]
  k = 1   largest sum 32
  k = 2   largest sum 18
  k = 3   largest sum 14
  k = 4   largest sum 10
  k = 5   largest sum 10

one element, k = 1   5
1000 x 1e6, k = 3    334000000
1000 x 1e6, k = 1    1000000000
\`\`\`

The last case is why the bounds are \`long\`: a thousand million is 10⁹, which
fits an \`int\` with almost nothing to spare, and one more element would not.

Read \`piecesNeeded\` once more. \`pieces\` starts at 1, not 0, because there is
always a first piece before any cut is made. Starting at 0 gives an answer one
too small, so the predicate is too generous and the search returns a budget that
does not actually work — a wrong answer, with no exception anywhere.

## How to work through the topic

1. [Binary Search](problem:binary-search),
   [Guess Number Higher or Lower](problem:guess-number-higher-or-lower). Write
   the classic exact-match form once by hand, with the closed range. Then never
   write it that way again.
2. [Search Insert Position](problem:search-insert-position),
   [First Bad Version](problem:first-bad-version). Both are \`lowerBound\`. The
   second has no array at all, which is why they belong together.
3. [Sqrt(x)](problem:sqrtx), [Valid Perfect Square](problem:valid-perfect-square),
   [Arranging Coins](problem:arranging-coins). The first answer-space searches,
   small enough to check by hand. Watch the overflow in \`mid * mid\` — use
   \`long\`, or compare using division.
4. [Find Minimum in Rotated Sorted Array](problem:find-minimum-in-rotated-sorted-array),
   then [Search in Rotated Sorted Array](problem:search-in-rotated-sorted-array).
   In that order: finding the dip teaches the comparison against \`a[hi]\`, and
   the full search is easier once you have it.
5. [Find Peak Element](problem:find-peak-element),
   [Peak Index in a Mountain Array](problem:peak-index-in-a-mountain-array).
   Binary search on an array that is not sorted at all — the strongest argument
   that the pattern is about monotone predicates rather than order.
6. [Search a 2D Matrix](problem:search-a-2d-matrix),
   [Find K Closest Elements](problem:find-k-closest-elements). A matrix read as
   one long sorted array, and a bound search over the *start* of a window.
7. [Koko Eating Bananas](problem:koko-eating-bananas),
   [Capacity to Ship Packages Within D Days](problem:capacity-to-ship-packages-within-d-days),
   [Split Array Largest Sum](problem:split-array-largest-sum). The answer-space
   trio, in one sitting, writing the monotonicity sentence for each before any
   code.
8. [Divide Chocolate](problem:divide-chocolate),
   [Kth Smallest Number in Multiplication Table](problem:kth-smallest-number-in-multiplication-table),
   [Find in Mountain Array](problem:find-in-mountain-array),
   [Median of Two Sorted Arrays](problem:median-of-two-sorted-arrays). The hard
   band. The last is a binary search on the *partition point* rather than on a
   value; it also appears in
   [divide and conquer](#/dsa/divide-and-conquer/notes), and seeing it from both
   sides is how it stops being a memorised trick.
`;export{e as default};