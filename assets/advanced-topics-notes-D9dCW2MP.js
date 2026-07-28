var e=`This one is not a pattern. Every other topic on the sheet is a single idea with
a dozen faces — a window that slides, a stack that stays sorted, a table you fill
in. This one is a drawer. It holds the algorithms that have somebody's name
attached, or a name of their own, and the only thing they have in common is that
you cannot derive them at the desk in four minutes. You either know that KMP
exists and roughly how the failure function works, or you write the O(nm) scan
and hope the constraints are small.

So read this page differently. It is not a technique to internalise; it is a
reference to skim now, so that six weeks from now, when a question says
"10⁵ characters, find the longest repeated substring", something in the back of
your head says *rolling hash, and binary search the length*. Recognising which
one is being asked for is the whole difficulty. The implementations are short
once you know which one you are writing.

The other honest thing to say is that most problems filed here really belong
somewhere else. Part of the work is telling those apart, so there is a table
further down that names the home of every problem on the list.

## What is actually in this list

Four algorithms are worth learning here, because nothing else on the sheet
teaches them:

- **Union-find**, also called disjoint set union. Connectivity, in almost
  constant time, without a traversal.
- **KMP**, and specifically its failure function. Substring search in O(n + m),
  and a surprising amount of information about a string's own structure.
- **Rolling hash**, or Rabin–Karp. Compare substrings in O(1) after an O(n)
  pass, which combines with binary search to answer "longest repeated" questions.
- **Topological order**. A linear ordering of a directed graph with no cycles,
  which is what a dependency question is really asking for.

Everything else on the list is a problem from another topic that happens to be
hard. Both parts matter, and the table at the end of this page sorts them.

## Union-find, or disjoint set union

You have \`n\` things and a stream of statements of the form "these two are in the
same group", and at any point you want to answer "are these two in the same
group" or "how many groups are there". Rebuilding a graph and running a traversal
after every statement is O(n) per question.

Union-find keeps one array. \`parent[x]\` is another element of the same set, and
following it repeatedly lands on the set's representative — the element that is
its own parent.

\`\`\`java
int find(int x) { return parent[x] == x ? x : (parent[x] = find(parent[x])); }
void union(int a, int b) { parent[find(a)] = find(b); }
\`\`\`

Two optimisations turn that from O(n) per operation into something you can treat
as constant:

- **Path compression.** \`parent[x] = find(parent[x])\` — on the way back out of
  the recursion, point every node visited directly at the representative. The
  next \`find\` on any of them is one step.
- **Union by rank.** Keep an approximate height per tree and always hang the
  shorter one under the taller. Without it, unioning in the wrong order builds a
  chain of length n, and the first \`find\` on it is O(n).

With both, \`m\` operations on \`n\` elements cost O(m α(n)), where α is the inverse
Ackermann function. It is below 5 for every input that fits in a computer, so in
practice each operation is constant time. That bound is genuinely difficult to
prove and completely safe to quote.

\`\`\`java DisjointSet.java @run-advanced-topics-disjoint-set
public class DisjointSet {

    private final int[] parent;   // parent[x] is another member of x's set
    private final int[] rank;     // an upper bound on the tree's height
    private int components;

    DisjointSet(int n) {
        parent = new int[n];
        rank = new int[n];
        components = n;                              // everything alone, to start
        for (int i = 0; i < n; i++) parent[i] = i;
    }

    /** The representative of x's set, flattening every node on the path. */
    int find(int x) {
        if (parent[x] != x) parent[x] = find(parent[x]);
        return parent[x];
    }

    /** Join two sets. Returns false when they were already the same set. */
    boolean union(int a, int b) {
        int ra = find(a), rb = find(b);
        if (ra == rb) return false;                  // already together
        if (rank[ra] < rank[rb]) { int t = ra; ra = rb; rb = t; }
        parent[rb] = ra;                             // shorter hangs under taller
        if (rank[ra] == rank[rb]) rank[ra]++;
        components--;
        return true;
    }

    boolean connected(int a, int b) { return find(a) == find(b); }
    int count() { return components; }

    public static void main(String[] args) {
        DisjointSet ds = new DisjointSet(8);
        int[][] edges = { { 0, 1 }, { 1, 2 }, { 3, 4 }, { 5, 6 }, { 6, 7 }, { 0, 2 } };

        for (int[] e : edges) {
            boolean joined = ds.union(e[0], e[1]);
            System.out.println("edge " + e[0] + "-" + e[1]
                    + (joined ? "   joined" : "   already together, so this edge closes a cycle"));
        }

        System.out.println("components  " + ds.count());
        System.out.println("0 and 2     " + ds.connected(0, 2));
        System.out.println("0 and 4     " + ds.connected(0, 4));
        System.out.println("5 and 7     " + ds.connected(5, 7));
    }
}
\`\`\`

\`\`\`output @run-advanced-topics-disjoint-set
edge 0-1   joined
edge 1-2   joined
edge 3-4   joined
edge 5-6   joined
edge 6-7   joined
edge 0-2   already together, so this edge closes a cycle
components  3
0 and 2     true
0 and 4     false
5 and 7     true
\`\`\`

The return value of \`union\` is the part people leave out and then need. \`false\`
means the two were already connected, which in an undirected graph means the edge
you just tried to add closes a **cycle**. That single fact solves cycle
detection, [Number of Provinces](problem:number-of-provinces),
[Accounts Merge](problem:accounts-merge) and
[Remove Max Number of Edges to Keep Graph Fully Traversable](problem:remove-max-number-of-edges-to-keep-graph-fully-traversable),
and it is the core of Kruskal's minimum spanning tree.

Use union-find when the question is *connectivity only* and the edges arrive over
time. Use a traversal from [graphs](#/dsa/graphs/notes) when you need paths,
distances or an ordering — union-find knows which set you are in and nothing at
all about how you got there.

## KMP, and the failure function

Finding a pattern of length \`m\` in a text of length \`n\` by trying every start
position is O(nm). The waste is obvious once you name it: after matching
\`abcabca\` and failing on the next character, the naive scan slides forward by one
and re-reads characters it has already seen.

KMP precomputes, for the pattern alone, an array that says how far it may slide
without missing anything.

\`\`\`text
p     =  a  b  a  b  a  c  a
index    0  1  2  3  4  5  6
fail  =  0  0  1  2  3  0  1
\`\`\`

\`fail[i]\` is the length of the longest proper prefix of \`p[0..i]\` that is also a
suffix of \`p[0..i]\`. At \`i = 4\` the pattern so far is \`ababa\`; \`aba\` is both its
prefix and its suffix, so \`fail[4] = 3\`. "Proper" means it does not count the
whole string, which is why \`fail[0]\` is always 0.

The use is this: when a match of length \`len\` fails, you do not restart. You set
\`len = fail[len - 1]\`, which is the longest amount of the pattern you are still
allowed to believe you have matched, and you try again from there. The text index
never moves backwards, so the scan is O(n) after an O(m) precompute.

\`\`\`java Kmp.java @run-advanced-topics-kmp
import java.util.Arrays;

public class Kmp {

    /** fail[i] = longest proper prefix of p[0..i] that is also a suffix of it. */
    static int[] failure(String p) {
        int[] fail = new int[p.length()];
        int len = 0;                                   // length matched so far
        for (int i = 1; i < p.length(); i++) {
            while (len > 0 && p.charAt(i) != p.charAt(len)) len = fail[len - 1];
            if (p.charAt(i) == p.charAt(len)) len++;
            fail[i] = len;
        }
        return fail;
    }

    /** First index where pattern occurs in text, or -1. O(n + m). */
    static int indexOf(String text, String pattern) {
        if (pattern.isEmpty()) return 0;
        int[] fail = failure(pattern);
        int len = 0;
        for (int i = 0; i < text.length(); i++) {
            while (len > 0 && text.charAt(i) != pattern.charAt(len)) len = fail[len - 1];
            if (text.charAt(i) == pattern.charAt(len)) len++;
            if (len == pattern.length()) return i - len + 1;
        }
        return -1;
    }

    /** A string is a repeated block exactly when the period divides its length. */
    static boolean isRepeatedBlock(String s) {
        int n = s.length();
        int longest = failure(s)[n - 1];
        int period = n - longest;
        return longest > 0 && n % period == 0;
    }

    public static void main(String[] args) {
        System.out.println("fail(ababaca)     " + Arrays.toString(failure("ababaca")));
        System.out.println("fail(aaaa)        " + Arrays.toString(failure("aaaa")));

        System.out.println("sadbutsad / sad   " + indexOf("sadbutsad", "sad"));
        System.out.println("leetcode / leeto  " + indexOf("leetcode", "leeto"));
        System.out.println("aaaaab / aab      " + indexOf("aaaaab", "aab"));

        for (String s : new String[] { "abab", "aba", "abcabcabc", "a", "aa" })
            System.out.println("repeated " + s + "   " + isRepeatedBlock(s));
    }
}
\`\`\`

\`\`\`output @run-advanced-topics-kmp
fail(ababaca)     [0, 0, 1, 2, 3, 0, 1]
fail(aaaa)        [0, 1, 2, 3]
sadbutsad / sad   0
leetcode / leeto  -1
aaaaab / aab      3
repeated abab   true
repeated aba   false
repeated abcabcabc   true
repeated a   false
repeated aa   true
\`\`\`

\`isRepeatedBlock\` is worth staring at, because it is the failure function used
for something other than searching. \`n - fail[n-1]\` is the string's smallest
period; if that period divides \`n\` exactly, the string is that block written out
\`n / period\` times. That is [Repeated Substring Pattern](problem:repeated-substring-pattern)
in three lines, and the same array answers
[Longest Happy Prefix](problem:longest-happy-prefix) directly and
[Shortest Palindrome](problem:shortest-palindrome) after one reversal trick. All
three live in [strings](#/dsa/strings/notes), and all three are KMP wearing a
different hat.

Note the two \`while\` loops are identical in shape. If you only remember one thing
about KMP, remember \`while (len > 0 && mismatch) len = fail[len - 1];\`.

## Rolling hash, and binary search on the length

A rolling hash treats a string as a number in base \`b\`, modulo a large prime:

\`\`\`text
hash(s[l..r]) = s[l]·b^(len-1) + s[l+1]·b^(len-2) + … + s[r]   (mod M)
\`\`\`

Sliding the window one place right is two operations rather than a rescan:
subtract the leaving character times \`b^(len-1)\`, multiply by \`b\`, add the
arriving character. So every substring of a fixed length gets a number in O(1)
after the first, and comparing two substrings becomes comparing two numbers.

That is Rabin–Karp, and on its own it is another way to write \`indexOf\`. What
makes it worth knowing is the combination with
[binary search](#/dsa/binary-search/notes) on the *length*:

> If some substring of length L occurs twice, then some substring of length
> L − 1 occurs twice as well — take a prefix of it.

The property is monotonic, so binary search applies. Ask "is there a repeated
substring of length \`mid\`" — one rolling-hash pass, O(n) — and halve. That is
O(n log n) for [Longest Duplicate Substring](problem:longest-duplicate-substring),
which is the flagship of this technique and is on this topic's list.

Two rules, neither optional. **Always verify a hash match** by comparing the
actual characters, because two different substrings can hash the same; a hash
that is trusted blindly gives wrong answers on adversarial input. And use \`long\`
arithmetic with a modulus around 10⁹, so the multiply cannot overflow — an \`int\`
hash overflows silently and the collisions stop being rare.

## Topological order

Given tasks with "A must come before B" constraints, a topological order is any
sequence that respects all of them. It exists exactly when the directed graph has
no cycle, which is why the same algorithm answers both "give me an order" and "is
this possible".

Kahn's algorithm is the version to remember, because it is a queue and nothing
else:

\`\`\`java
int[] indegree = new int[n];
for (int u = 0; u < n; u++) for (int v : adj[u]) indegree[v]++;

Deque<Integer> ready = new ArrayDeque<>();
for (int u = 0; u < n; u++) if (indegree[u] == 0) ready.add(u);

List<Integer> order = new ArrayList<>();
while (!ready.isEmpty()) {
    int u = ready.poll();
    order.add(u);
    for (int v : adj[u]) if (--indegree[v] == 0) ready.add(v);
}
// order.size() < n means a cycle: those nodes never reached indegree 0
\`\`\`

The last line is the cycle test, and it is free. This is
[Course Schedule](problem:course-schedule),
[Course Schedule II](problem:course-schedule-ii) and
[Alien Dictionary](problem:alien-dictionary), and it belongs properly to
[graphs](#/dsa/graphs/notes) — it is repeated here because the card names it and
because "a named algorithm is the intended answer" is exactly how these questions
feel in the room.

## The rest of the list, and where each one really lives

Nearly every remaining problem on this topic's list is a well-behaved member of
another topic. Work it there, and come back here only for the four algorithms
above.

| Problem | What it actually wants | Its real home |
|---|---|---|
| [Find Pivot Index](problem:find-pivot-index) | running total from each side | [prefix sum](#/dsa/prefix-sum/notes) |
| [Running Sum of 1d Array](problem:running-sum-of-1d-array) | the prefix array itself | [prefix sum](#/dsa/prefix-sum/notes) |
| [Power of Two](problem:power-of-two) | \`x > 0 && (x & (x - 1)) == 0\` | [bit manipulation](#/dsa/bit-manipulation/notes) |
| [Number of 1 Bits](problem:number-of-1-bits) | \`Integer.bitCount\`, or clear the lowest set bit | [bit manipulation](#/dsa/bit-manipulation/notes) |
| [Contains Duplicate II](problem:contains-duplicate-ii) | a map from value to last index | [hash tables](#/dsa/hash-tables/notes) |
| [Sqrt(x)](problem:sqrtx) | binary search on the answer | [binary search](#/dsa/binary-search/notes) |
| [Range Sum Query - Mutable](problem:range-sum-query-mutable) | a Fenwick tree | [Fenwick tree](#/dsa/fenwick-tree-binary-indexed-tree/notes) |
| [My Calendar I](problem:my-calendar-i) | \`TreeMap.floorKey\` and \`ceilingKey\` | [BST and ordered set](#/dsa/bst-ordered-set/notes) |
| [Subarrays with K Different Integers](problem:subarrays-with-k-different-integers) | at-most-K windows, subtracted | [sliding window](#/dsa/sliding-window/notes) |
| [Find All Anagrams in a String](problem:find-all-anagrams-in-a-string) | fixed window with a 26-slot count | [sliding window](#/dsa/sliding-window/notes) |
| [Continuous Subarray Sum](problem:continuous-subarray-sum) | prefix sums modulo k, in a map | [prefix sum](#/dsa/prefix-sum/notes) |
| [Bitwise ORs of Subarrays](problem:bitwise-ors-of-subarrays) | the ORs ending at i number at most 32 | [bit manipulation](#/dsa/bit-manipulation/notes) |
| [Count of Smaller Numbers After Self](problem:count-of-smaller-numbers-after-self) | merge sort, counting in the merge | [divide and conquer](#/dsa/divide-and-conquer/notes) |
| [Count of Range Sum](problem:count-of-range-sum) | the same, over prefix sums | [divide and conquer](#/dsa/divide-and-conquer/notes) |
| [The Skyline Problem](problem:the-skyline-problem) | a sweep line with a multiset of heights | [heaps](#/dsa/heaps/notes) |
| [Sliding Window Maximum](problem:sliding-window-maximum) | a monotonic deque | [deque](#/dsa/deque/notes) |
| [Median of Two Sorted Arrays](problem:median-of-two-sorted-arrays) | binary search on the partition point | [binary search](#/dsa/binary-search/notes) |
| [Longest Duplicate Substring](problem:longest-duplicate-substring) | rolling hash plus binary search | this page |

Two of those get miscategorised more than the rest.
[The Skyline Problem](problem:the-skyline-problem) is a **sweep line**: sort every
building edge by x, keep the current heights in something that gives you the
maximum and can remove an arbitrary value — a \`PriorityQueue\` with lazy deletion,
or a \`TreeMap<Integer, Integer>\` used as a multiset — and emit a point whenever
that maximum changes. Sweep lines also solve
[intervals](#/dsa/intervals/notes) problems and
[My Calendar I](problem:my-calendar-i). And
[Median of Two Sorted Arrays](problem:median-of-two-sorted-arrays) is not about
merging: you binary search how many elements come from the shorter array and
check the partition with four comparisons, moving nothing.

## What each one costs

| Algorithm | Precompute | Per operation | Space |
|---|---|---|---|
| Union-find, both optimisations | O(n) | O(α(n)), effectively constant | O(n) |
| Union-find, path compression only | O(n) | O(log n) amortised | O(n) |
| KMP failure function | O(m) | — | O(m) |
| KMP search | O(m) | O(n) for the whole text | O(m) |
| Rolling hash, fixed length | O(n) | O(1) per window | O(1), plus the map |
| Rolling hash + binary search | — | O(n log n) total | O(n) |
| Topological order (Kahn) | — | O(V + E) | O(V) |
| Sweep line with a heap | O(n log n) sort | O(log n) per event | O(n) |

The union-find row is the one to be able to defend out loud. Path compression
alone gives O(log n) amortised; union by rank alone gives O(log n) worst case;
together they give the inverse Ackermann bound. Interviewers ask.

## The mistakes, in the order people make them

1. **Union-find without path compression.** It still works and it degrades to a
   linked list, which is O(n) per \`find\` and a timeout on the large case.
2. **Union by size or rank applied to the elements rather than the roots.**
   \`parent[b] = a\` is wrong; it must be \`parent[find(b)] = find(a)\`.
3. **Not using the return value of \`union\`.** \`false\` is the cycle test, and
   recomputing it separately is both slower and a second place to get it wrong.
4. **The \`while\` in the failure function written as an \`if\`.** A single fallback
   is not enough; you may have to fall back several times before the characters
   agree, and the \`if\` version silently misses matches. Related: \`fail[0]\` set to
   −1, a convention some textbooks use and then index differently everywhere else.
5. **A rolling hash with \`int\` arithmetic.** It overflows, collisions stop being
   rare, and the failures look random.
6. **Trusting a hash match.** Always compare the actual characters before
   returning. One \`regionMatches\` call is the difference between a solution and a
   probabilistic guess.
7. **Binary searching a property that is not monotonic.** "A repeated substring
   of length L exists" is monotonic. "The k-th character is x" is not. State the
   monotonic claim in words before you write the loop.
8. **Reaching for a named algorithm first.** Most questions here are a window, a
   map or a sort. Try the ordinary tools, and only reach into this drawer when
   the constraints say the ordinary tool will not fit.

## The Java you will reach for

| You want | Write |
|---|---|
| Identity parents | \`for (int i = 0; i < n; i++) parent[i] = i;\` |
| Recursive find with compression | \`if (parent[x] != x) parent[x] = find(parent[x]);\` |
| Compare substrings without allocating | \`s.regionMatches(i, t, j, len)\` |
| A substring's characters, cheaply | \`s.charAt(i)\` — \`substring\` copies |
| Modular arithmetic without overflow | \`long\`, and a modulus near 10⁹ |
| Keep a value non-negative after subtracting | \`(x % M + M) % M\` |
| Group values under a key | \`map.computeIfAbsent(k, x -> new ArrayList<>()).add(v)\` |
| A queue for Kahn's algorithm | \`Deque<Integer> q = new ArrayDeque<>()\` |
| A multiset for a sweep line | \`TreeMap<Integer, Integer>\` with \`merge(k, 1, Integer::sum)\` |
| Largest key at or below x | \`treeMap.floorKey(x)\` |
| Count set bits | \`Integer.bitCount(x)\` |

\`(x % M + M) % M\` is worth memorising on its own. Java's \`%\` keeps the sign of
the left operand, so \`-3 % 7\` is \`-3\` and not \`4\`. Every modular hash and every
"prefix sum modulo k" solution needs that correction, and forgetting it is a
whole afternoon.

## Working one from the sheet

[Longest Duplicate Substring](problem:longest-duplicate-substring): find the
longest substring that occurs at least twice. The input can be 30,000 characters,
so the O(n²) approach of hashing every substring is out.

Two ideas stacked. Binary search the length, because a repeat of length L implies
a repeat of length L − 1. For each candidate length, one rolling-hash pass tells
you in O(n) whether a repeat of exactly that length exists.

\`\`\`java DuplicateSubstring.java @run-advanced-topics-duplicate-substring
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class DuplicateSubstring {

    private static final long BASE = 131;              // any base above the alphabet size
    private static final long MOD = 1_000_000_007L;    // prime, and small enough that a
                                                       // long multiply cannot overflow

    /** Start index of some substring of this length that occurs twice, or -1. */
    static int findRepeat(String s, int len) {
        long hash = 0, power = 1;
        for (int i = 0; i < len; i++) {
            hash = (hash * BASE + s.charAt(i)) % MOD;
            if (i > 0) power = power * BASE % MOD;     // BASE^(len-1)
        }

        Map<Long, List<Integer>> seen = new HashMap<>();
        seen.computeIfAbsent(hash, k -> new ArrayList<>()).add(0);

        for (int i = len; i < s.length(); i++) {
            hash = (hash - s.charAt(i - len) * power % MOD + MOD) % MOD;  // drop the left
            hash = (hash * BASE + s.charAt(i)) % MOD;                     // take the right
            int start = i - len + 1;

            List<Integer> earlier = seen.computeIfAbsent(hash, k -> new ArrayList<>());
            for (int j : earlier)
                if (s.regionMatches(j, s, start, len)) return start;      // verify, always
            earlier.add(start);
        }
        return -1;
    }

    static String longestDuplicate(String s) {
        int lo = 1, hi = s.length() - 1;
        String best = "";
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;
            int at = findRepeat(s, mid);
            if (at >= 0) { best = s.substring(at, at + mid); lo = mid + 1; }
            else hi = mid - 1;
        }
        return best;
    }

    public static void main(String[] args) {
        for (String s : new String[] { "banana", "abcd", "aaaaa", "ababab", "a" })
            System.out.println(s + "  ->  [" + longestDuplicate(s) + "]");
    }
}
\`\`\`

\`\`\`output @run-advanced-topics-duplicate-substring
banana  ->  [ana]
abcd  ->  []
aaaaa  ->  [aaaa]
ababab  ->  [abab]
a  ->  []
\`\`\`

Three details are the difference between this passing and failing.
\`(hash - s.charAt(i - len) * power % MOD + MOD) % MOD\` adds \`MOD\` before the final
\`%\`, because the subtraction can go negative and Java would keep it negative.
\`regionMatches\` compares \`len\` characters in place, allocating nothing, which
matters inside a binary search. And \`hi\` starts at \`s.length() - 1\`, because a
substring occurring twice cannot be the whole string — which is also why the
\`"a"\` case returns \`""\` without ever entering the loop.

## How to work through the topic

1. Write union-find from memory — \`find\` with compression, \`union\` by rank, and
   \`union\` returning a boolean. Then solve
   [Number of Provinces](problem:number-of-provinces) with it and again with a
   [graph](#/dsa/graphs/notes) traversal, and note which was shorter.
2. [Accounts Merge](problem:accounts-merge). Union-find where the elements are
   strings, so you need a \`Map<String, Integer>\` to number them first. That
   numbering step is most of the work and it recurs constantly.
3. Write the KMP failure function, and check it by hand against \`ababaca\`. Then
   [Find the Index of the First Occurrence in a String](problem:find-the-index-of-the-first-occurrence-in-a-string)
   and [Repeated Substring Pattern](problem:repeated-substring-pattern) — the
   second uses the array without searching anything.
4. [Course Schedule](problem:course-schedule) then
   [Course Schedule II](problem:course-schedule-ii). Kahn's algorithm, and the
   \`order.size() < n\` cycle test. Then
   [Alien Dictionary](problem:alien-dictionary), where the hard part is building
   the edges rather than ordering them.
5. Work the easy and medium band of this list in their real topics —
   [Find Pivot Index](problem:find-pivot-index),
   [Contains Duplicate II](problem:contains-duplicate-ii),
   [Continuous Subarray Sum](problem:continuous-subarray-sum),
   [Find All Anagrams in a String](problem:find-all-anagrams-in-a-string). None of
   them needs anything from this page, and saying so quickly is a skill of its own.
6. [Longest Duplicate Substring](problem:longest-duplicate-substring). Rolling
   hash plus binary search on the length. Do it after step 3, so you can see why
   a hash is the right tool when the pattern is not known in advance.
7. [Count of Smaller Numbers After Self](problem:count-of-smaller-numbers-after-self)
   and [Count of Range Sum](problem:count-of-range-sum), each solved twice — once
   with merge sort counting in the merge, once with a
   [Fenwick tree](#/dsa/fenwick-tree-binary-indexed-tree/notes) over compressed
   values. Coordinate compression is the technique that transfers.
8. [The Skyline Problem](problem:the-skyline-problem) and
   [Median of Two Sorted Arrays](problem:median-of-two-sorted-arrays). The sweep
   line and the partition search. Both are famous, both are short once seen, and
   both are worth a full hour each rather than a glance at a solution.
`;export{e as default};