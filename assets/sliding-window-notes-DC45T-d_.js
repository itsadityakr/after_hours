var e=`A great many questions ask about a contiguous run of an array or a string. The
longest stretch with no repeated letter. The shortest run adding up to at least
seven. How many runs contain exactly three different values. The obvious answer
to all of them is the same: try every start, try every end, measure what is in
between — O(n²) pairs, and O(n³) if measuring means looping over the run.

What kills the extra loops is that consecutive candidates overlap almost
completely. \`a[3..9]\` and \`a[3..10]\` differ by one element, so recomputing the
second from scratch throws away everything the first told you. Keep the run in a
pair of indices, keep a summary of what is inside it, and when an index moves,
update the summary by the one element that entered or left.

That run is the window. Both edges only ever move forwards, and that single
restriction is what makes the whole scan linear.

## The vocabulary, and the Java

A **subarray** is contiguous: \`a[2]\`, \`a[3]\`, \`a[4]\` with nothing skipped. A
**subsequence** may skip. Windows only ever answer questions about subarrays and
substrings, so if a question says "subsequence", put the window down.

The two edges are \`lo\` and \`hi\`, both inclusive, so the window is \`a[lo..hi]\`
and its length is \`hi - lo + 1\`. That \`+ 1\` is where half the off-by-one bugs
live.

For the summary of what is inside the window you have four choices, and picking
the right one is most of the work:

| What the window has to know | Use |
|---|---|
| A sum, or a count | A single \`int\` or \`long\` |
| Counts of lowercase letters | \`int[26]\`, indexed by \`c - 'a'\` |
| Counts of arbitrary values | \`HashMap<Integer, Integer>\` |
| The maximum of the window itself | A monotonic \`ArrayDeque\` — see below |

\`c - 'a'\` works because a \`char\` is a number: subtracting \`'a'\` maps \`'a'\` to 0
and \`'z'\` to 25. For uppercase, subtract \`'A'\`.

## The fixed window: one in, one out

![A window of fixed size k stepping along, one element in and one out](diagrams/sliding-window-notes-fixed-window.svg)

Start with the easy half. The size is given to you, say \`k\`, and you want the
best window of exactly that size — [Maximum Average Subarray I](problem:maximum-average-subarray-i)
is the plain version. Build the first window by hand, then each step adds the
element arriving on the right and subtracts the one leaving on the left.

\`\`\`java
int sum = 0;
for (int i = 0; i < k; i++) sum += a[i];   // the first window, built once
int best = sum;
for (int hi = k; hi < a.length; hi++) {
    sum += a[hi] - a[hi - k];              // one in, one out
    best = Math.max(best, sum);
}
\`\`\`

The element leaving is \`a[hi - k]\`, not \`a[hi - k + 1]\` and not \`a[lo]\`. Count
it: when \`hi\` is the new right edge, the window covers \`hi - k + 1\` through
\`hi\`, so the box that has just fallen out of it is \`hi - k\`.

\`\`\`text
a = [1, 12, -5, -6, 50, 3], k = 4

first window   [1, 12, -5, -6]              sum = 2      best = 2
hi = 4  +50 -1  [12, -5, -6, 50]            sum = 51     best = 51
hi = 5  +3 -12  [-5, -6, 50, 3]             sum = 42     best = 51
\`\`\`

Note that this is perfectly happy with negative numbers. The size is fixed, so
nothing depends on the sum behaving in any particular way as the window changes
shape. That is not true of the next kind.

## The variable window: grow right, shrink left

![A variable window growing on the right and shrinking on the left](diagrams/sliding-window-notes-variable-window.svg)

Now the size is not given. The question is "the longest" or "the shortest" run
satisfying some condition, and the window has to work out its own size.

The rule is the same every time. The right edge advances once per iteration, no
exceptions. The left edge advances only when the window has become something you
do not want.

\`\`\`java
int lo = 0;
for (int hi = 0; hi < a.length; hi++) {
    add(a[hi]);                            // the right edge always moves
    while (invalid()) remove(a[lo++]);      // the left edge moves only under pressure
    best = Math.max(best, hi - lo + 1);
}
\`\`\`

Take [Minimum Size Subarray Sum](problem:minimum-size-subarray-sum): the
shortest run of positive numbers adding to at least a target. Here "invalid" is
inverted — you shrink *while the window is still good*, because a shorter good
window is a better answer, and you record the length before each shrink.

\`\`\`text
a = [2, 3, 1, 2, 4, 3], target = 7

hi=0  +2   window [2]                sum=2
hi=1  +3   window [2,3]              sum=5
hi=2  +1   window [2,3,1]            sum=6
hi=3  +2   window [2,3,1,2]          sum=8  >= 7  -> length 4, best=4
           -2  window [3,1,2]        sum=6
hi=4  +4   window [3,1,2,4]          sum=10 >= 7  -> length 4, best=4
           -3  window [1,2,4]        sum=7  >= 7  -> length 3, best=3
           -1  window [2,4]          sum=6
hi=5  +3   window [2,4,3]            sum=9  >= 7  -> length 3, best=3
           -2  window [4,3]          sum=7  >= 7  -> length 2, best=2
           -4  window [3]            sum=3

answer 2
\`\`\`

\`while\`, not \`if\`. At \`hi = 5\` the left edge moved twice in one step, and an
\`if\` would have stopped after the first and missed the answer.

Which of the two forms you want depends on the question:

- **Longest valid.** Shrink until the window is valid again, then record. The
  window is valid at the moment you measure it.
- **Shortest valid.** Grow until the window is valid, then record and shrink
  while it stays valid. You measure just before each shrink.

Getting these two the wrong way round is the most common way a correct-looking
window returns nonsense.

## Why two nested loops are still O(n)

The shape has a \`for\` with a \`while\` inside it, which looks quadratic and is
not. The argument is about the left edge, and it is worth being able to say out
loud in an interview.

\`lo\` only ever increases. It starts at 0, it never goes back, and it can never
exceed \`n\`. So across the entire run of the program the body of the inner
\`while\` executes at most \`n\` times in total — not \`n\` times per outer step. Put
it as a sentence about the elements: **each index enters the window exactly
once, when \`hi\` reaches it, and leaves at most once, when \`lo\` passes it.** Two
constant-time events per index, 2n events overall, O(n).

That is an amortised argument: a single step of the outer loop might shrink
twenty times, but the total across all steps is bounded, because that work is
paid for by elements nobody will pay for again. Write \`lo = 0\` inside the loop
and the argument collapses, and so does the running time.

## Windows over characters

Two shapes cover most of the string problems.

The first is a **counting array**, for when you are looking for a fixed multiset
of characters — [Find All Anagrams in a String](problem:find-all-anagrams-in-a-string)
and [Permutation in String](problem:permutation-in-string). The window is a
fixed size, so it is really the easy half of the topic with a 26-slot summary in
place of a sum.

The second is a **map from character to last position**, for
[Longest Substring Without Repeating Characters](problem:longest-substring-without-repeating-characters).
When the arriving character has been seen inside the current window, the left
edge jumps past that earlier copy in one move rather than shuffling forwards.

\`\`\`java Chars.java @run-sliding-window-chars
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class Chars {

    /** Longest stretch with no character repeated. */
    static int longestDistinct(String s) {
        Map<Character, Integer> lastSeen = new HashMap<>();
        int lo = 0, best = 0;
        for (int hi = 0; hi < s.length(); hi++) {
            char c = s.charAt(hi);
            Integer seen = lastSeen.get(c);
            if (seen != null && seen >= lo) lo = seen + 1;  // jump past the earlier copy
            lastSeen.put(c, hi);                            // overwrite: only the latest matters
            best = Math.max(best, hi - lo + 1);
        }
        return best;
    }

    /** Every index in s where p starts as an anagram. */
    static List<Integer> anagramStarts(String s, String p) {
        List<Integer> out = new ArrayList<>();
        if (p.length() > s.length()) return out;

        int[] need = new int[26], have = new int[26];
        for (char c : p.toCharArray()) need[c - 'a']++;

        int k = p.length();
        for (int hi = 0; hi < s.length(); hi++) {
            have[s.charAt(hi) - 'a']++;                       // one in
            if (hi >= k) have[s.charAt(hi - k) - 'a']--;       // one out
            if (hi >= k - 1 && Arrays.equals(need, have)) out.add(hi - k + 1);
        }
        return out;
    }

    public static void main(String[] args) {
        System.out.println("abcabcbb   " + longestDistinct("abcabcbb"));
        System.out.println("bbbbb      " + longestDistinct("bbbbb"));
        System.out.println("pwwkew     " + longestDistinct("pwwkew"));
        System.out.println("empty      " + longestDistinct(""));

        System.out.println("abc in cbaebabacd  " + anagramStarts("cbaebabacd", "abc"));
        System.out.println("ab  in abab        " + anagramStarts("abab", "ab"));
        System.out.println("z   in abab        " + anagramStarts("abab", "z"));
    }
}
\`\`\`

\`\`\`output @run-sliding-window-chars
abcabcbb   3
bbbbb      1
pwwkew     3
empty      0
abc in cbaebabacd  [0, 6]
ab  in abab        [0, 1, 2]
z   in abab        []
\`\`\`

The line that people get wrong is \`if (seen != null && seen >= lo)\`. Without the
\`seen >= lo\` guard, a character last seen *before* the current window drags \`lo\`
backwards, the window silently grows over ground it has already rejected, and
the answer comes out too large. The left edge may not move backwards. Ever.

\`Arrays.equals(need, have)\` compares 26 slots, so that check is a constant 26
rather than a 1. For genuine O(1), keep a tally of how many of the 26 letters
currently match and adjust it as the counts change.

## Counting windows: exactly k is two at-most passes

Some questions do not ask for the best window. They ask **how many** windows
satisfy something — [Subarrays with K Different Integers](problem:subarrays-with-k-different-integers),
[Binary Subarrays with Sum](problem:binary-subarrays-with-sum),
[Count Number of Nice Subarrays](problem:count-number-of-nice-subarrays).

A window cannot count "exactly" directly, because "exactly k distinct" is not a
condition that survives shrinking: cut an element off a window with exactly
three distinct values and you may be left with two. The condition has to be
**monotone** — true of a window implies true of every sub-window — for the
shrink loop to make sense. "At most k" is monotone. "Exactly k" is not.

So count "at most", which a window does easily:

\`\`\`java
count.merge(a[hi], 1, Integer::sum);
while (count.size() > k) { ... shrink ... }
total += hi - lo + 1;
\`\`\`

That last line is the whole trick. Once the window \`a[lo..hi]\` is the longest
valid one ending at \`hi\`, every window ending at \`hi\` and starting anywhere from
\`lo\` to \`hi\` is also valid — there are \`hi - lo + 1\` of them, and each is
counted exactly once because each has a different start. Add them and move on.

Then subtract. \`atMost(k)\` counts every subarray with 1 up to k distinct values;
\`atMost(k-1)\` counts every subarray with 1 up to k-1; the difference is every
subarray with exactly k.

\`\`\`java AtMost.java @run-sliding-window-at-most
import java.util.HashMap;
import java.util.Map;

public class AtMost {

    /** How many subarrays contain at most k distinct values. */
    static long atMostDistinct(int[] a, int k) {
        Map<Integer, Integer> count = new HashMap<>();
        long total = 0;
        int lo = 0;
        for (int hi = 0; hi < a.length; hi++) {
            count.merge(a[hi], 1, Integer::sum);            // put, or add 1 to what is there
            while (count.size() > k) {
                int leaving = a[lo++];
                if (count.merge(leaving, -1, Integer::sum) == 0) count.remove(leaving);
            }
            total += hi - lo + 1;                           // every start from lo to hi
        }
        return total;
    }

    static long exactlyDistinct(int[] a, int k) {
        if (k == 0) return 0;
        return atMostDistinct(a, k) - atMostDistinct(a, k - 1);
    }

    public static void main(String[] args) {
        int[] a = { 1, 2, 1, 2, 3 };
        System.out.println("at most 2 distinct  " + atMostDistinct(a, 2));
        System.out.println("at most 1 distinct  " + atMostDistinct(a, 1));
        System.out.println("exactly 2 distinct  " + exactlyDistinct(a, 2));
        System.out.println("exactly 3 distinct  " + exactlyDistinct(new int[] { 1, 2, 1, 3, 4 }, 3));
        System.out.println("exactly 4 distinct  " + exactlyDistinct(a, 4));
    }
}
\`\`\`

\`\`\`output @run-sliding-window-at-most
at most 2 distinct  12
at most 1 distinct  5
exactly 2 distinct  7
exactly 3 distinct  3
exactly 4 distinct  0
\`\`\`

\`count.remove(leaving)\` when the count reaches zero is not tidiness. \`count.size()\`
is how the window knows how many distinct values it holds, and a key sitting
there mapped to 0 still counts towards the size. Leave it in and the window
shrinks for a value it no longer contains.

\`total\` is a \`long\`. The number of subarrays of an array of length n is
n(n+1)/2, which passes two billion at about n = 65,000, and the input limits on
these problems are larger than that.

## When a window does not work

![A negative value at the left edge makes shrinking raise the sum](diagrams/sliding-window-notes-negatives.jpg)

The variable window rests on an assumption that is easy to miss: **widening the
window makes the quantity move in one direction, and narrowing it moves it
back**. Add a positive number and the sum goes up; drop one and it goes down.
That is what makes "shrink while the sum is too big" a sensible instruction —
shrinking is guaranteed to help.

Put one negative number in the array and the guarantee is gone. Dropping \`a[lo]\`
when \`a[lo]\` is \`-5\` makes the sum *larger*. The shrink loop can no longer be
trusted to make progress towards validity, and the window quietly returns the
wrong answer rather than looping forever, which is worse.

- **Sums with possible negatives**, as in [Subarray Sum Equals K](problem:subarray-sum-equals-k)
  or [Maximum Size Subarray Sum Equals k](problem:maximum-size-subarray-sum-equals-k):
  use [prefix sum](#/dsa/prefix-sum/notes) with a hash map instead. A prefix sum
  does not care about sign, because it never has to argue about direction.
  [Shortest Subarray with Sum at Least K](problem:shortest-subarray-with-sum-at-least-k)
  is Minimum Size Subarray Sum with negatives allowed, and it is rated hard for
  exactly that reason: prefix sums in a monotonic deque, not a window.
- **The maximum of every window** — [Sliding Window Maximum](problem:sliding-window-maximum)
  — fails differently. Nothing is wrong with the window; the summary is wrong. A
  sum can be undone by subtraction when an element leaves, but a maximum cannot,
  because you cannot recover the second largest from the largest. Hold the
  window's contents in a decreasing [deque](#/dsa/deque/notes) instead, so the
  maximum is always at the front and anything that can never be the maximum is
  dropped as it arrives.
- **Products with zeroes and negatives** do not window either; that is
  [Kadane's algorithm](#/dsa/kadanes-algorithm/notes) territory.

## The variants

| The question says | Window | What you track | Example |
|---|---|---|---|
| "of size k" | Fixed, both edges move together | A sum or a count array | [Maximum Number of Vowels in a Substring](problem:maximum-number-of-vowels-in-a-substring-of-given-length) |
| "longest ... such that" | Grow right, shrink until valid, then measure | Whatever validity depends on | [Max Consecutive Ones III](problem:max-consecutive-ones-iii) |
| "shortest ... such that" | Grow until valid, measure, then shrink while valid | The same | [Minimum Size Subarray Sum](problem:minimum-size-subarray-sum) |
| "how many ... with exactly k" | Two at-most passes, subtracted | A count of distinct, or a sum | [Subarrays with K Different Integers](problem:subarrays-with-k-different-integers) |
| "contains all of ..." | Grow until it covers, shrink to tighten | Counts plus a satisfied-letters tally | [Minimum Window Substring](problem:minimum-window-substring) |
| "maximum of every window" | Fixed size, but the summary is a deque | A decreasing deque of indices | [Sliding Window Maximum](problem:sliding-window-maximum) |

Two are windows in disguise.
[Maximum Points You Can Obtain from Cards](problem:maximum-points-you-can-obtain-from-cards)
takes cards from both ends, which leaves a contiguous window of size \`n - k\` in
the middle — minimise that and you maximise the rest.
[Minimum Swaps to Group All 1's Together](problem:minimum-swaps-to-group-all-1s-together)
counts the ones, then asks which window of that width holds the most of them.

## What it costs

| | Time | Space |
|---|---|---|
| Fixed window, numeric summary | O(n) | O(1) |
| Variable window, numeric summary | O(n) | O(1) |
| Window over lowercase letters | O(26n), which is O(n) | O(26) |
| Window with a \`HashMap\` summary | O(n) expected | O(distinct values) |
| At-most counting, exactly-k | O(n), run twice | as above |
| Monotonic deque maximum | O(n) | O(k) |

Every one of these is one pass. The amortised argument is what justifies the
first column: 2n window events, each costing whatever one update to the summary
costs. If the update is O(1), the algorithm is O(n). If the update is a scan of
the window, it is not a sliding window — it is a nested loop wearing one.

## The mistakes, in the order people make them

1. **Restarting the left edge.** \`lo = hi + 1\` or \`lo = 0\` inside the loop. The
   answer may even be right; the running time is O(n²) and the point of the
   pattern is gone.
2. **\`if\` instead of \`while\` when shrinking.** One step of the right edge can
   require several steps of the left. An \`if\` handles one and carries on with an
   invalid window.
3. **\`hi - lo\` for the length.** Both edges are inclusive, so it is
   \`hi - lo + 1\`. Test with a one-element window: \`lo == hi\` should measure 1.
4. **Measuring at the wrong moment.** For "longest", measure after shrinking,
   when the window is valid. For "shortest", measure before shrinking, while it
   still is. Swap them and you record invalid windows.
5. **Forgetting to undo the summary when the left edge moves.** \`lo++\` without
   the matching \`sum -=\` or \`count[c]--\` leaves the summary describing a window
   that no longer exists, and nothing crashes.
6. **Leaving zero-valued keys in the map.** \`count.size()\` counts them, so the
   window believes it holds a value it dropped several steps ago.
7. **Letting the left edge move backwards** — the missing \`seen >= lo\` guard in
   the last-position version. The window then overlaps itself.
8. **Using a variable window on an array with negatives**, or starting to record
   fixed-window answers before \`hi\` reaches \`k - 1\`, or counting subarrays in an
   \`int\` when n(n+1)/2 needs a \`long\`.

## The Java you will reach for

| You want | Write |
|---|---|
| Character at an index | \`s.charAt(i)\` — and \`s.length()\` with brackets |
| The window as a string | \`s.substring(lo, hi + 1)\` — the end is exclusive |
| Letter to a slot | \`c - 'a'\` for lowercase, \`c - 'A'\` for uppercase |
| A count table | \`int[] count = new int[26]\` |
| Compare two count tables | \`Arrays.equals(need, have)\` |
| Add one to a map count | \`map.merge(k, 1, Integer::sum)\` |
| Take one away, and prune | \`if (map.merge(k, -1, Integer::sum) == 0) map.remove(k)\` |
| Read a count that may be absent | \`map.getOrDefault(k, 0)\` |
| Distinct values in the window | \`map.size()\` — only correct if you prune zeroes |
| A deque for the window maximum | \`Deque<Integer> dq = new ArrayDeque<>()\` |
| Push and pop at either end | \`addLast\`, \`pollLast\`, \`pollFirst\`, \`peekFirst\` |

\`ArrayDeque\` over \`Stack\` or \`LinkedList\`: \`Stack\` is synchronised and iterates
in the wrong order, and \`LinkedList\` allocates a node per element.

One boxing trap. \`map.merge(...)\` returns an \`Integer\`, and \`==\` between two
\`Integer\` objects compares references outside the cached range of −128 to 127.
Comparing against the literal \`0\`, as above, unboxes and is safe;
\`count1 == count2\` between two \`Integer\` variables is not. Use \`.equals\`, or
keep counts in an \`int[]\`.

## Working one from the sheet

[Longest Repeating Character Replacement](problem:longest-repeating-character-replacement):
given a string of uppercase letters and a budget \`k\`, you may change at most \`k\`
characters. Find the longest run you can make all-the-same.

Start by asking what makes a window valid. If a window has length \`L\` and its
most common letter appears \`m\` times, turning the whole window into that letter
costs \`L - m\` changes, so the window is affordable exactly when \`L - m <= k\`.
That condition is monotone — removing a character cannot raise the cost — so a
window will work. Grow on the right, and while \`hi - lo + 1 - mostCommon > k\`,
shrink.

One part surprises people. \`mostCommon\` is never lowered when the left edge
moves, so it can be stale — larger than the true maximum of the current window.
That cannot inflate the answer. A stale \`mostCommon\` only makes the window look
*more* affordable, so the window never shrinks below the largest size already
achieved, and the largest size already achieved was genuinely valid when it was
recorded. Recomputing the true maximum each step also works, at 26 operations a
step.

\`\`\`java Replace.java @run-sliding-window-replace
public class Replace {

    /** Longest run that can be made uniform by changing at most k characters. */
    static int longest(String s, int k) {
        int[] count = new int[26];
        int lo = 0, mostCommon = 0, best = 0;

        for (int hi = 0; hi < s.length(); hi++) {
            int in = s.charAt(hi) - 'A';
            count[in]++;
            mostCommon = Math.max(mostCommon, count[in]);   // high-water mark, never lowered

            while (hi - lo + 1 - mostCommon > k)            // too many changes needed
                count[s.charAt(lo++) - 'A']--;

            best = Math.max(best, hi - lo + 1);
        }
        return best;
    }

    public static void main(String[] args) {
        System.out.println("ABAB    k=2  " + longest("ABAB", 2));      // change both Bs
        System.out.println("AABABBA k=1  " + longest("AABABBA", 1));
        System.out.println("AAAA    k=0  " + longest("AAAA", 0));      // already uniform
        System.out.println("ABCDE   k=1  " + longest("ABCDE", 1));     // no two alike
        System.out.println("A       k=5  " + longest("A", 5));         // k larger than the string
    }
}
\`\`\`

\`\`\`output @run-sliding-window-replace
ABAB    k=2  4
AABABBA k=1  4
AAAA    k=0  4
ABCDE   k=1  2
A       k=5  1
\`\`\`

Trace the third and fifth cases in your head before running it. \`k = 0\` means no
window may contain two different letters, and \`k\` larger than the string means
every window is affordable, so the answer is the whole string.

## How to work through the topic

1. [Maximum Average Subarray I](problem:maximum-average-subarray-i),
   [Maximum Number of Vowels in a Substring](problem:maximum-number-of-vowels-in-a-substring-of-given-length),
   [Number of Sub-arrays of Size K and Average Greater than or Equal to Threshold](problem:number-of-sub-arrays-of-size-k-and-average-greater-than-or-equal-to-threshold).
   The fixed window three times, so that building the first window and then
   adding one and dropping one becomes automatic.
2. [Minimum Size Subarray Sum](problem:minimum-size-subarray-sum),
   [Max Consecutive Ones III](problem:max-consecutive-ones-iii),
   [Fruit Into Baskets](problem:fruit-into-baskets). The variable window, once
   for "shortest" and twice for "longest". Say out loud which side of the shrink
   loop you are measuring on, and why.
3. [Longest Substring Without Repeating Characters](problem:longest-substring-without-repeating-characters),
   [Permutation in String](problem:permutation-in-string),
   [Find All Anagrams in a String](problem:find-all-anagrams-in-a-string). The
   two character summaries: last-position map, and count array.
4. [Longest Repeating Character Replacement](problem:longest-repeating-character-replacement),
   [Longest Subarray of 1's After Deleting One Element](problem:longest-subarray-of-1s-after-deleting-one-element),
   [Frequency of the Most Frequent Element](problem:frequency-of-the-most-frequent-element).
   Windows where the validity test is itself a small piece of reasoning. The
   last one wants a sort and a prefix sum alongside the window.
5. [Subarrays with K Different Integers](problem:subarrays-with-k-different-integers),
   [Binary Subarrays with Sum](problem:binary-subarrays-with-sum),
   [Count Number of Nice Subarrays](problem:count-number-of-nice-subarrays).
   Counting rather than measuring, and \`exactly = atMost(k) - atMost(k-1)\` three
   times until it is a reflex.
6. [Minimum Window Substring](problem:minimum-window-substring). The one that
   gets asked. Two count tables and a tally of how many required characters are
   currently satisfied, so the validity check stays O(1). Grow until satisfied,
   then shrink as far as it will go, and record the smallest.
7. [Sliding Window Maximum](problem:sliding-window-maximum),
   [Substring with Concatenation of All Words](problem:substring-with-concatenation-of-all-words),
   [Minimum Swaps to Group All 1's Together II](problem:minimum-swaps-to-group-all-1s-together-ii).
   The window plus a second idea — a deque, a word-sized stride with several
   offsets, and a circular array handled by doubling it. Leave these until the
   first five are routine.

The habit to take away is the question you ask before writing anything: *what
makes a window valid, and does removing an element from a valid window keep it
valid?* If the answer is yes, a window will work and the code writes itself. If
the answer is no, you want the at-most trick, a prefix sum, or something else
entirely.
`;export{e as default};