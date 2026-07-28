var e=`A hash table answers one question instantly: **have I seen this before?** That is
all it does, and it is the reason half the "obvious" nested loops on this sheet
are not the intended answer. Where the brute force asks "for each element, look
through all the others", a hash table lets you ask "for each element, is the
thing I need already in my notes" — and the notes are looked up in constant
time.

The problems are the easiest on the sheet to recognise. The skill that actually
separates people here is not spotting that a map is wanted; it is choosing **what
to key on**, and that is a design decision rather than a lookup.

## What it is, in one paragraph

A hash table stores keys in an array of buckets. To find where a key goes it
runs the key through a **hash function** — a procedure that turns any object into
an integer — and uses that integer to pick a bucket. Because the bucket is
computed rather than searched for, the work does not grow with the number of
entries.

Two consequences worth carrying:

- **O(1) is an average, not a promise.** Two different keys can land in the same
  bucket, which is a *collision*, and the bucket then holds a small list (a tree,
  in Java, past eight entries). With a decent hash function the average is
  constant and the worst case is rare enough to plan around.
- **There is no order.** A \`HashMap\` will hand keys back in an order that looks
  arbitrary and can change between runs. If a problem needs order, you want
  \`LinkedHashMap\` (insertion order) or \`TreeMap\` (sorted).

## The three collections and when each is right

| Type | Holds | Use it when |
|---|---|---|
| \`HashSet<T>\` | keys only | "have I seen this" |
| \`HashMap<K, V>\` | key to value | "how many", "where was it", "what goes with it" |
| \`LinkedHashMap\` | as above, in insertion order | LRU caches, and stable output |
| \`TreeMap\` | sorted keys | you need neighbours: \`floorKey\`, \`ceilingKey\` |
| \`int[]\` | a small fixed key range | letters, digits, 0–100. Faster and clearer |

That last row matters more than it looks. When the keys are lowercase letters,
\`int[26]\` is a hash table with a perfect hash function — no boxing, no hashing,
no collisions. Reach for a \`HashMap\` when the key space is large or open, not
reflexively.

![When a count array beats a HashMap](diagrams/hash-tables-notes-key-space.jpg)

## The pattern: remember as you go

![Checking the map before inserting stops an element pairing with itself](diagrams/hash-tables-notes-check-then-insert.jpg)

The canonical shape is one pass that checks the map before adding to it.

\`\`\`java
Map<Integer, Integer> seen = new HashMap<>();
for (int i = 0; i < a.length; i++) {
    if (seen.containsKey(target - a[i])) return new int[]{seen.get(target - a[i]), i};
    seen.put(a[i], i);
}
\`\`\`

Read the order carefully: **check, then insert.** Doing it the other way round
lets an element pair with itself, so \`[3, 4]\` with a target of 6 would wrongly
report the 3 twice. That ordering is the entire correctness argument for
[Two Sum](problem:two-sum), and it is the kind of detail an interviewer will
ask about.

The other thing to notice is that this is a *complement* search. You never look
for \`a[i]\`; you look for what would complete it. Turning "find a pair that sums
to k" into "for each element, has its complement gone past" is the move that
converts O(n²) into O(n), and it generalises: for a difference, look for
\`a[i] - k\`; for a product, \`k / a[i]\` when it divides.

## Counting, grouping and looking up

Three idioms cover almost every use of a map on this sheet.

\`\`\`java HashIdioms.java @run-hash-tables-hash-idioms
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;

public class HashIdioms {

    public static void main(String[] args) {
        String[] words = { "eat", "tea", "tan", "ate", "nat", "bat" };

        // 1. Count per key. Printed through a TreeMap because a HashMap has no
        //    order of its own — see the note under this program.
        Map<Character, Integer> letters = new HashMap<>();
        for (char c : "mississippi".toCharArray())
            letters.merge(c, 1, Integer::sum);
        System.out.println("counts   " + new TreeMap<>(letters));

        // 2. Group by a computed key. The key IS the design: two words are
        //    anagrams exactly when their sorted letters agree.
        Map<String, List<String>> groups = new HashMap<>();
        for (String word : words) {
            char[] letterArray = word.toCharArray();
            Arrays.sort(letterArray);
            groups.computeIfAbsent(new String(letterArray), k -> new ArrayList<>()).add(word);
        }
        System.out.println("groups   " + new TreeMap<>(groups));

        // 3. Membership.
        Set<Integer> seen = new HashSet<>();
        int firstRepeat = -1;
        for (int x : new int[] { 4, 1, 7, 1, 9 })
            if (!seen.add(x)) {          // add returns false if it was there
                firstRepeat = x;
                break;
            }
        System.out.println("repeat   " + firstRepeat);
    }
}
\`\`\`

\`\`\`output @run-hash-tables-hash-idioms
counts   {i=4, m=1, p=2, s=4}
groups   {abt=[bat], aet=[eat, tea, ate], ant=[tan, nat]}
repeat   1
\`\`\`

- \`merge(key, 1, Integer::sum)\` is the counting idiom: insert 1, or add 1 to
  what is there.
- \`computeIfAbsent(key, k -> new ArrayList<>()).add(v)\` is the grouping idiom:
  make the list if it is missing, then add to it. Writing this as \`get\`,
  null-check, \`put\` is four lines and one \`NullPointerException\` waiting.
- \`set.add(x)\` **returns false** when the element was already present, so
  "already seen" and "record it" are one call rather than two.

\`getOrDefault(key, 0)\` is the fourth, for reading a count that may be absent.

The two \`new TreeMap<>(…)\` wrappers around the printing are not part of the
idiom — they are there so the output above is the same on your machine as it was
on the one that recorded it. A \`HashMap\` printed directly comes out in whatever
order its buckets happen to be in, which is not the insertion order, not sorted,
and not guaranteed between releases.

## Choosing the key is the whole problem

The map is never the hard part. Here is what the key turns out to be across the
medium band:

| Problem | The key |
|---|---|
| [Group Anagrams](problem:group-anagrams) | the word's letters, sorted |
| [Subarray Sum Equals K](problem:subarray-sum-equals-k) | the running prefix sum |
| [Contains Duplicate II](problem:contains-duplicate-ii) | the value, mapped to its last index |
| [Word Pattern](problem:word-pattern) | both directions — letter to word *and* word to letter |
| [4Sum II](problem:4sum-ii) | the sum of a pair from the first two arrays |
| [Longest Consecutive Sequence](problem:longest-consecutive-sequence) | the value, in a set, so you can ask for \`x - 1\` |

Two of those deserve a sentence.

**Word Pattern needs two maps.** A single map from letter to word accepts
\`"abba"\` against \`"dog dog dog dog"\`, because nothing stops two letters mapping
to one word. A one-to-one correspondence has to be checked in both directions —
a good example of a problem where the failing case is not an edge case but a
misreading.

**Longest Consecutive Sequence** is the neatest use of a set on the sheet. Put
every value in a \`HashSet\`; then for each value, only start counting if \`x - 1\`
is absent — because that means \`x\` begins a run. Every element is then visited
at most twice overall, so it is O(n) despite the inner \`while\` loop, and that
argument is the answer the interviewer is listening for.

\`\`\`java Consecutive.java @run-hash-tables-consecutive
import java.util.HashSet;
import java.util.Set;

public class Consecutive {

    static int longestConsecutive(int[] a) {
        Set<Integer> all = new HashSet<>();
        for (int x : a) all.add(x);

        int best = 0;
        for (int x : all) {
            if (all.contains(x - 1)) continue;   // not the start of a run
            int length = 1;
            while (all.contains(x + length)) length++;
            best = Math.max(best, length);
        }
        return best;
    }

    public static void main(String[] args) {
        System.out.println(longestConsecutive(new int[] { 100, 4, 200, 1, 3, 2 }));
        System.out.println(longestConsecutive(new int[] { 0, 3, 7, 2, 5, 8, 4, 6, 0, 1 }));
        System.out.println(longestConsecutive(new int[] {}));
    }
}
\`\`\`

\`\`\`output @run-hash-tables-consecutive
4
9
0
\`\`\`

Sorting would also solve it, in O(n log n). The hash set is what gets it to
O(n), and the \`continue\` is what stops it being quadratic.

## When the key is an object

If you key a map on your own class, you must override **both** \`equals\` and
\`hashCode\`, and they must agree: equal objects must have equal hash codes. Miss
\`hashCode\` and two equal objects land in different buckets, so a lookup that
should hit misses and the map appears to lose entries.

In practice, for interview problems, do not write the class. Two easier options:

- **A \`record\`**, which generates both correctly:
  \`record Point(int r, int c) {}\`.
- **Encode the key as a \`String\` or a \`long\`.** A coordinate pair in a grid
  becomes \`r * cols + c\`, or \`r + "," + c\`. Slightly crude, entirely reliable,
  and it is what most solutions do.

Arrays are the trap here: \`int[]\` uses identity for both \`equals\` and
\`hashCode\`, so a \`HashSet<int[]>\` will never find anything you put in it. Use
\`Arrays.toString(a)\` or a \`List<Integer>\` as the key instead.

## What it costs

| Operation | Average | Worst |
|---|---|---|
| \`put\`, \`get\`, \`containsKey\`, \`remove\` | O(1) | O(log n) in modern Java |
| Iterate | O(n) | O(n) |
| Space | O(n) | O(n) |

The worst case used to be O(n) — a bucket degenerating into a linked list — and
Java 8 changed a long bucket into a red-black tree, which is where the O(log n)
comes from. Worth knowing as an answer; never worth worrying about in a problem.

The real cost of a \`HashMap<Integer, Integer>\` is not the complexity, it is the
constant: every key and value is a boxed object, so it is several times slower
and several times larger than an \`int[]\`. When the key range is small and known,
use the array.

## The mistakes, in the order people make them

1. **Inserting before checking.** Lets an element pair with itself.
2. **\`get\` returning \`null\`.** Unboxing a \`null\` \`Integer\` into an \`int\` throws
   \`NullPointerException\` with no \`null\` visible in the line. Use
   \`getOrDefault\`.
3. **\`int[]\` as a key.** Hashes by identity. Nothing is ever found.
4. **Relying on iteration order.** \`HashMap\` has none. Use \`LinkedHashMap\` if
   you need one.
5. **Modifying the map while iterating it.** Throws
   \`ConcurrentModificationException\`. Collect the keys first, or use
   \`entrySet().removeIf\`.
6. **\`==\` on boxed \`Integer\`s.** Works up to 127 because of the boxing cache,
   fails above it. Compare with \`.equals\` or unbox to \`int\`.
7. **Using a map where a count array would do.** Correct, and slower and harder
   to read.
8. **One map where the problem needs two.** The bijection problems.

## The Java you will reach for

| You want | Write |
|---|---|
| Count | \`map.merge(k, 1, Integer::sum)\` |
| Read a count safely | \`map.getOrDefault(k, 0)\` |
| Group | \`map.computeIfAbsent(k, x -> new ArrayList<>()).add(v)\` |
| Have I seen it | \`if (!set.add(x)) …\` |
| Loop over pairs | \`for (Map.Entry<K, V> e : map.entrySet())\` |
| Loop over keys or values | \`map.keySet()\`, \`map.values()\` |
| Remove while looping | \`map.entrySet().removeIf(e -> …)\` |
| Insertion order | \`new LinkedHashMap<>()\` |
| Sorted keys and neighbours | \`new TreeMap<>()\` — \`floorKey\`, \`ceilingKey\` |
| A pair as a key | \`record Point(int r, int c) {}\` or \`r * cols + c\` |
| Frequency sort | sort the entries by \`Map.Entry.comparingByValue()\` |

## Working one from the sheet

[Subarray Sum Equals K](problem:subarray-sum-equals-k): how many contiguous
subarrays sum to exactly \`k\`?

The brute force is every start with every end, O(n²). The insight is the one
from [prefix sum](#/dsa/prefix-sum/notes): the sum of \`a[i..j]\` is
\`prefix[j] - prefix[i-1]\`. So a subarray ending at \`j\` sums to \`k\` exactly when
some earlier prefix equals \`prefix[j] - k\`. That is a "have I seen this before"
question, which is a map.

![Seeding the prefix map with a count of one for zero](diagrams/hash-tables-notes-prefix-seed.jpg)

\`\`\`java SubarraySum.java @run-hash-tables-subarray-sum
import java.util.HashMap;
import java.util.Map;

public class SubarraySum {

    static int subarraySum(int[] a, int k) {
        Map<Integer, Integer> countOfPrefix = new HashMap<>();
        countOfPrefix.put(0, 1);      // the empty prefix, so a[0..j] itself counts

        int running = 0, total = 0;
        for (int x : a) {
            running += x;
            total += countOfPrefix.getOrDefault(running - k, 0);
            countOfPrefix.merge(running, 1, Integer::sum);
        }
        return total;
    }

    public static void main(String[] args) {
        System.out.println(subarraySum(new int[] { 1, 1, 1 }, 2));
        System.out.println(subarraySum(new int[] { 1, 2, 3 }, 3));
        System.out.println(subarraySum(new int[] { 1, -1, 0 }, 0));
        System.out.println(subarraySum(new int[] { 3, 4, 7, 2, -3, 1, 4, 2 }, 7));
    }
}
\`\`\`

\`\`\`output @run-hash-tables-subarray-sum
2
2
3
4
\`\`\`

The \`put(0, 1)\` before the loop is the line everybody misses. Without it, a
subarray that starts at index 0 and sums to \`k\` is never counted, because there
is no earlier prefix of 0 recorded. Seeding the map with the empty prefix is the
same idea as sizing a prefix array \`n + 1\` — it removes the special case rather
than handling it.

Note also that this counts negative numbers correctly, which is why a sliding
window does **not** work here. A window relies on sums growing as it widens.

## How to work through the topic

1. [Two Sum](problem:two-sum), [Contains Duplicate II](problem:contains-duplicate-ii),
   [Ransom Note](problem:ransom-note). The three shapes: complement, last-index,
   count. Do \`Ransom Note\` with an \`int[26]\`, not a map.
2. [Valid Anagram](problem:valid-anagram),
   [Word Pattern](problem:word-pattern). The second needs two maps; work out
   why before reading anything.
3. [Group Anagrams](problem:group-anagrams),
   [Sort Characters By Frequency](problem:sort-characters-by-frequency).
   Choosing a key, and sorting by a value.
4. [Top K Frequent Elements](problem:top-k-frequent-elements). Count, then pick
   the top k — with a heap, or with bucket sort by frequency, which is O(n) and
   the better answer.
5. [Subarray Sum Equals K](problem:subarray-sum-equals-k),
   [4Sum II](problem:4sum-ii). Both are "map of prefixes or partial sums", and
   both are the moment the topic stops being about lookup and starts being about
   design.
6. [Longest Consecutive Sequence](problem:longest-consecutive-sequence). Get the
   O(n) argument right, out loud.
7. [LFU Cache](problem:lfu-cache),
   [All O\`one Data Structure](problem:all-oone-data-structure). Several maps
   working together — these belong with
   [data structure design](#/dsa/data-structure-design/notes) and are worth
   saving until after it.
`;export{e as default};