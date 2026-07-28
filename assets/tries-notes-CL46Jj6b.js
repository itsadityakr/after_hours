var e=`Put a dictionary in a \`HashSet<String>\` and you can ask one question about it:
is this exact word in there. That is genuinely all a hash set can do, because it
turns the whole word into a number and then forgets the word. Ask "how many of
these words begin with \`car\`" and the set has nothing to offer — you are back to
looking at every word it holds.

A trie is a tree where the *path* spells the word. One node per character
position, children shared by everything with the same start, and walking from the
root down is the same thing as reading a word left to right. Because a shared
prefix is a shared path, "does anything start with \`car\`" is three steps and a
null check. That is the whole reason the structure exists. The name is from
*retrieval*, and most people say it "try".

The problems in this topic are the ones where a dictionary is consulted many
times — autocomplete, spell-checking, and the board searches that would otherwise
rescan every word for every square.

## What a trie is, and what a node holds

Store the five words \`car\`, \`cart\`, \`carton\`, \`do\`, \`dog\`. Mark with \`*\` the
nodes where a word finishes.

\`\`\`text
                (root)
               /      \\
              c        d
              |        |
              a        o*        "do" ends here
              |        |
              r*       g*        "dog"
              |
              t*                 "cart"
              |
              o
              |
              n*                 "carton"
\`\`\`

Three things to read off that picture.

- **No node stores a word.** The node at the end of \`c-a-r\` is not labelled
  \`"car"\`; it is labelled \`*\`, and \`"car"\` is the path that got you there.
- **\`car\`, \`cart\` and \`carton\` cost three extra nodes between them**, not
  thirteen characters. That is the space win, and it only arrives when the words
  actually share prefixes.
- **\`*\` is doing real work.** Without it, \`ca\` would look like a word, because
  the path \`c-a\` exists. The flag separates "this is a word" from "this is on the
  way to a word".

A node, then, is a row of children and a flag:

![The path spells the word and the end flag says where a word finishes](diagrams/tries-notes-path-and-end.jpg)

\`\`\`java
class Node {
    Node[] next = new Node[26];   // next[0] is 'a', next[25] is 'z'
    boolean end;                  // a word finishes exactly here
}
\`\`\`

\`next\` is an array of 26 references, one slot per lowercase letter, all \`null\`
until something is stored there. \`c - 'a'\` turns a character into that index:
\`char\` arithmetic in Java promotes to \`int\`, so \`'c' - 'a'\` is 2. The alternative
is \`Map<Character, Node> next = new HashMap<>()\`, and the trade-off goes both
ways.

| Children as | Cost per node | Good when |
|---|---|---|
| \`Node[26]\` | 26 references, allocated whether used or not | the alphabet is small and fixed, and nodes are dense |
| \`HashMap<Character, Node>\` | one entry per real child, plus map overhead | the alphabet is large — case-sensitive, digits, unicode — or the tree is sparse |

An indexed read beats a hash lookup, so the array wins on speed almost always and
loses on memory when most of the 26 slots are empty. For lowercase English, take
the array. If the constraints allow digits or mixed case, take the map —
\`c - 'a'\` on \`'A'\` gives \`-32\`, which is an \`ArrayIndexOutOfBoundsException\`.

## Insert, search and startsWith

All three are the same walk. The only difference is what you do when the walk
runs out of path, and what you check when it does not.

\`\`\`java
class Node { Node[] next = new Node[26]; boolean end; }

for (char c : word.toCharArray()) {
    int i = c - 'a';
    if (cur.next[i] == null) cur.next[i] = new Node();   // insert makes the path
    cur = cur.next[i];
}
cur.end = true;
\`\`\`

- **Insert** creates a node whenever the next step is missing, then sets \`end\`
  on the node it finishes at.
- **Search** returns \`false\` the moment a step is missing, and at the end
  returns \`cur.end\`.
- **startsWith** returns \`false\` the moment a step is missing, and at the end
  returns \`true\` — it never looks at \`end\` at all.

That last line is the entire distinction between the two queries, and it is why
a trie answers a prefix question at the same price as an exact one.

## A trie you can run

\`\`\`java Trie.java @run-tries-trie
public class Trie {

    /** One node per character position. next[c - 'a'] is the child for that letter. */
    static class Node {
        Node[] next = new Node[26];
        boolean end;
    }

    private final Node root = new Node();

    /** Walk the word, creating nodes wherever the path does not exist yet. */
    void insert(String word) {
        Node cur = root;
        for (int i = 0; i < word.length(); i++) {
            int c = word.charAt(i) - 'a';
            if (cur.next[c] == null) cur.next[c] = new Node();
            cur = cur.next[c];
        }
        cur.end = true;
    }

    /** The node this string spells out, or null when the path runs out. */
    private Node walk(String s) {
        Node cur = root;
        for (int i = 0; i < s.length(); i++) {
            int c = s.charAt(i) - 'a';
            if (cur.next[c] == null) return null;
            cur = cur.next[c];
        }
        return cur;
    }

    boolean search(String word) {
        Node n = walk(word);
        return n != null && n.end;
    }

    boolean startsWith(String prefix) {
        return walk(prefix) != null;
    }

    /** How many stored words begin with this prefix: count the ends in the subtree. */
    int countWithPrefix(String prefix) {
        return countEnds(walk(prefix));
    }

    private int countEnds(Node n) {
        if (n == null) return 0;
        int total = n.end ? 1 : 0;
        for (Node child : n.next) total += countEnds(child);
        return total;
    }

    public static void main(String[] args) {
        Trie t = new Trie();
        for (String w : new String[] { "car", "cart", "carton", "do", "dog" }) t.insert(w);

        System.out.println("search car        " + t.search("car"));
        System.out.println("search ca         " + t.search("ca"));
        System.out.println("startsWith ca     " + t.startsWith("ca"));
        System.out.println("startsWith cat    " + t.startsWith("cat"));
        System.out.println("search do         " + t.search("do"));
        System.out.println("search dogs       " + t.search("dogs"));
        System.out.println("words under car   " + t.countWithPrefix("car"));
        System.out.println("words under z     " + t.countWithPrefix("z"));
    }
}
\`\`\`

\`\`\`output @run-tries-trie
search car        true
search ca         false
startsWith ca     true
startsWith cat    false
search do         true
search dogs       false
words under car   3
words under z     0
\`\`\`

\`search("ca")\` and \`startsWith("ca")\` disagree, and that disagreement is the
point of the \`end\` flag. \`countWithPrefix("z")\` walks into a \`null\` on the first
step, and \`countEnds(null)\` returns 0 — which is why the null check lives at the
top of the recursion rather than at every call site. That class is
[Implement Trie (Prefix Tree)](problem:implement-trie-prefix-tree) with one extra
method.

## When a trie beats a hash set, precisely

![A trie only beats a hash set on prefix questions](diagrams/tries-notes-trie-or-hashset.jpg)

A \`HashSet<String>\` gives exact membership in O(L) — hashing the word reads all L
characters — and uses less memory than a trie for the same words. The trie is not
a free upgrade. It wins in one situation:

> Use a trie when the question is about **prefixes**, not about whole words.

Concretely, these are the questions a hash set cannot answer:

- Does any stored word start with this string —
  [Implement Trie (Prefix Tree)](problem:implement-trie-prefix-tree).
- Which stored word is the shortest prefix of this string: walk the query, stop
  at the first \`end\` — [Replace Words](problem:replace-words).
- The smallest three words under this prefix after every keystroke: one descent
  plus a bounded walk of the subtree —
  [Search Suggestions System](problem:search-suggestions-system).
- Is any suffix of the stream a word: the same trie over reversed words —
  [Stream of Characters](problem:stream-of-characters).
- Sum the values of every key with this prefix —
  [Map Sum Pairs](problem:map-sum-pairs).

And one that is subtler: **a trie lets you fail early.** When a candidate is
being built character by character, a hash set can only judge the finished
candidate; a trie says after three characters that nothing starts that way, so
the thousand branches below are never walked. That is what makes
[Word Search II](problem:word-search-ii) tractable. For plain "is this word in
the list", use the hash set — see [hash tables](#/dsa/hash-tables/notes).

## Wildcards: search with a dot

[Design Add and Search Words Data Structure](problem:design-add-and-search-words-data-structure)
allows \`.\` in a query, matching any single character. The walk stops being a
loop and becomes a recursion, because at a \`.\` you do not know which child to
take, so you take all of them.

\`\`\`java WildcardDict.java @run-tries-wildcard-dict
public class WildcardDict {

    static class Node {
        Node[] next = new Node[26];
        boolean end;
    }

    private final Node root = new Node();

    void addWord(String word) {
        Node cur = root;
        for (int i = 0; i < word.length(); i++) {
            int c = word.charAt(i) - 'a';
            if (cur.next[c] == null) cur.next[c] = new Node();
            cur = cur.next[c];
        }
        cur.end = true;
    }

    boolean search(String pattern) {
        return go(pattern, 0, root);
    }

    /** At i, standing on cur. A dot branches over every child; a letter takes one. */
    private boolean go(String pattern, int i, Node cur) {
        if (cur == null) return false;
        if (i == pattern.length()) return cur.end;

        char c = pattern.charAt(i);
        if (c != '.') return go(pattern, i + 1, cur.next[c - 'a']);

        for (Node child : cur.next)
            if (go(pattern, i + 1, child)) return true;
        return false;
    }

    public static void main(String[] args) {
        WildcardDict d = new WildcardDict();
        for (String w : new String[] { "bad", "dad", "mad", "bat" }) d.addWord(w);

        System.out.println("pad    " + d.search("pad"));
        System.out.println("bad    " + d.search("bad"));
        System.out.println(".ad    " + d.search(".ad"));
        System.out.println("b..    " + d.search("b.."));
        System.out.println("...    " + d.search("..."));
        System.out.println("....   " + d.search("...."));
        System.out.println("ba.d   " + d.search("ba.d"));
    }
}
\`\`\`

\`\`\`output @run-tries-wildcard-dict
pad    false
bad    true
.ad    true
b..    true
...    true
....   false
ba.d   false
\`\`\`

Two details carry the whole method. \`if (cur == null) return false\` at the top
means the caller never has to check before recursing. And the loop over children
returns \`true\` on the first success but does **not** return \`false\` on the first
failure; it has to try all 26 before giving up. Returning inside the loop on
failure is the classic bug here, and it makes \`.ad\` match only if \`a\` happens to
be the first child. A query with \`d\` dots can visit 26^d branches in the worst
case, though in practice most of those children are \`null\` and return at once.

## Pruning a board search

[Word Search II](problem:word-search-ii) gives you a grid of letters and a list
of words, and asks which words can be traced through adjacent cells. Running the
[backtracking](#/dsa/recursion-and-backtracking/notes) search once per word is
O(words × cells × 4^L) and times out. Turn it inside out: put every word into a
trie, then do **one** search of the board that carries a trie node alongside the
position.

\`\`\`java
void dfs(char[][] board, int r, int c, Node node, StringBuilder path, List<String> found) {
    char ch = board[r][c];
    Node next = node.next[ch - 'a'];
    if (next == null) return;        // no word in the dictionary goes this way — stop

    path.append(ch);
    if (next.end) { found.add(path.toString()); next.end = false; }  // don't report twice

    board[r][c] = '#';               // mark visited
    for (int[] d : new int[][] { {1,0}, {-1,0}, {0,1}, {0,-1} }) {
        int nr = r + d[0], nc = c + d[1];
        if (inside(board, nr, nc) && board[nr][nc] != '#')
            dfs(board, nr, nc, next, path, found);
    }
    board[r][c] = ch;                // undo the mark
    path.deleteCharAt(path.length() - 1);
}
\`\`\`

\`if (next == null) return\` is the line that makes it fast. The moment the path
you have traced is not a prefix of anything in the dictionary, the entire subtree
of moves below it is abandoned. Setting \`next.end = false\` after reporting is how
you avoid adding the same word twice when it can be traced two ways.

## The binary trie, over the bits of an integer

![Walking a binary trie from the top bit, always taking the opposite child](diagrams/tries-notes-xor-greedy.jpg)

Nothing said the alphabet has to be letters. Take an integer, write it as 31
bits from the top down, and store those bits as a path in a trie with two
children per node. Every stored number is then a root-to-leaf path of fixed
length.

This is the answer to
[Maximum XOR of Two Numbers in an Array](problem:maximum-xor-of-two-numbers-in-an-array).
XOR gives a 1 exactly where the two numbers differ, and you want the result as
large as possible, so you want to differ in the highest bit you can. At each bit,
ask the current node for the child holding the *opposite* bit: if it exists, take
it and set that bit in the answer; if it does not, you are forced into the
same-bit child and that bit of the answer is 0.

\`\`\`text
value = 5 = 00101 (five bits shown)

bit 4   value has 0  ->  want a stored number with 1 here
bit 3   value has 0  ->  want 1 here, among the ones still on the path
bit 2   value has 1  ->  want 0 here
\`\`\`

Greedy is correct because one bit at position \`b\` outweighs every bit below it
put together — 2^b > 2^b − 1.

\`\`\`java XorTrie.java @run-tries-xor-trie
public class XorTrie {

    static class Node {
        Node[] next = new Node[2];   // next[0] and next[1], one per bit value
    }

    /** Bit 30 down to bit 0 covers every non-negative int. */
    private static final int TOP = 30;

    private final Node root = new Node();

    void insert(int value) {
        Node cur = root;
        for (int b = TOP; b >= 0; b--) {
            int bit = (value >>> b) & 1;
            if (cur.next[bit] == null) cur.next[bit] = new Node();
            cur = cur.next[bit];
        }
    }

    /** The largest value ^ stored, over everything inserted so far. */
    int bestXor(int value) {
        Node cur = root;
        int best = 0;
        for (int b = TOP; b >= 0; b--) {
            int bit = (value >>> b) & 1;
            int opposite = bit ^ 1;
            if (cur.next[opposite] != null) {
                best |= 1 << b;              // this bit of the XOR is 1
                cur = cur.next[opposite];
            } else {
                cur = cur.next[bit];         // forced; this bit of the XOR is 0
            }
        }
        return best;
    }

    static int maximumXor(int[] a) {
        XorTrie trie = new XorTrie();
        trie.insert(a[0]);
        int best = 0;
        for (int i = 1; i < a.length; i++) {
            best = Math.max(best, trie.bestXor(a[i]));
            trie.insert(a[i]);
        }
        return best;
    }

    public static void main(String[] args) {
        System.out.println(maximumXor(new int[] { 3, 10, 5, 25, 2, 8 }));
        System.out.println(maximumXor(new int[] { 14, 70, 53, 83, 49, 91, 36, 80, 92, 51, 66, 70 }));
        System.out.println(maximumXor(new int[] { 0 }));
        System.out.println(maximumXor(new int[] { 8, 8 }));
    }
}
\`\`\`

\`\`\`output @run-tries-xor-trie
28
127
0
0
\`\`\`

Three things to note. The first value is inserted before the loop starts, so
\`bestXor\` is never called on an empty trie — with no children, \`cur\` would become
\`null\` and the next iteration would throw. \`TOP\` is 30 because bit 31 is the sign
bit and every input here is non-negative. And \`>>>\` is used rather than \`>>\`
because the value is a bag of bits, not a number — see
[bit manipulation](#/dsa/bit-manipulation/notes). The same structure, with a
count on each node, answers
[Count Pairs With XOR in a Range](problem:count-pairs-with-xor-in-a-range).

## What it costs

| Operation | Time | Why |
|---|---|---|
| insert a word of length L | O(L) | one step per character |
| search | O(L) | the same walk plus one flag read |
| startsWith | O(L) | the same walk, no flag read |
| every word under a prefix | O(L + size of subtree) | descend, then collect |
| wildcard query with d dots | O(26^d × L) worst case | each dot branches |
| binary trie insert or query | O(31) | one step per bit |

**None of those mention how many words are stored.** A trie holding ten words and
a trie holding a million answer \`startsWith("car")\` in the same three steps. That
independence is the reason to reach for it when the dictionary is large and
consulted often.

Space is O(total characters × alphabet) with array children. For 10⁵ words
averaging 10 characters that is up to 10⁶ nodes × 26 references, around 100 MB,
which is enough to matter. Shared prefixes cut it, sometimes drastically, and
map-backed children cut each node down to the children that exist.

## The mistakes, in the order people make them

1. **No \`end\` flag.** Every prefix then reports as a word, so \`car\` is found
   inside \`carton\` and the answer is wrong on inputs that look fine.
2. **\`c - 'a'\` on characters that are not lowercase letters.** A capital or a
   digit gives a negative index and throws
   \`ArrayIndexOutOfBoundsException\`. Read the constraints; take the map if they
   allow anything wider.
3. **Descending without a null check.** \`cur = cur.next[i]\` on a \`null\` slot does
   not fail immediately — it fails on the *next* access, so the stack trace points
   at the wrong line.
4. **Returning \`false\` inside the wildcard loop.** It must try all 26 children
   and only give up after the last one.
5. **Reporting a board word twice.** In [Word Search II](problem:word-search-ii),
   clear \`end\` after adding, or collect into a set. And unmark the visited cell
   on the way back out, or every later branch sees a grid still mid-search.
6. **Deleting by unlinking nodes.** \`carton\` and \`car\` share nodes; removing the
   path for one deletes the other. Clear the flag, and only free a node with no
   children and no flag.
7. **Building a trie for exact lookups.** If no query mentions a prefix, a
   \`HashSet<String>\` is smaller, simpler and just as fast.
8. **Walking a binary trie from bit 0 upwards.** The greedy argument only holds
   from the most significant bit down.

## The Java you will reach for

| You want | Write |
|---|---|
| Array children | \`Node[] next = new Node[26]\` |
| Letter to index | \`c - 'a'\` (0 to 25) |
| Index back to letter | \`(char) ('a' + i)\` |
| Map children | \`Map<Character, Node> next = new HashMap<>()\` |
| Get or create a map child | \`next.computeIfAbsent(c, k -> new Node())\` |
| Character at a position | \`word.charAt(i)\` — no array copy, unlike \`toCharArray()\` |
| Build a word on the way down | \`StringBuilder\`, \`append\` then \`deleteCharAt(len - 1)\` |
| Bit \`b\` of \`x\`, unsigned | \`(x >>> b) & 1\` |
| Set bit \`b\` | <code>best &#124;= 1 &lt;&lt; b</code> |
| Shortest words first | \`Arrays.sort(words, Comparator.comparingInt(String::length))\` |
| Collect results without duplicates | \`new LinkedHashSet<>()\` — keeps insertion order |

\`toCharArray()\` allocates a fresh \`char[]\` every time it is called. Inside a
trie insert that runs a million times, use \`charAt(i)\` and an index loop.

## Working one from the sheet

[Longest Word in Dictionary](problem:longest-word-in-dictionary): find the
longest word that can be built one character at a time, where every intermediate
string is also in the list. Ties go to the lexicographically smallest.

The condition "every prefix is also a word" is a trie condition stated out loud:
walking the word from the root, **every node on the path must have \`end\` set**.
So insert everything, then walk each word and check.

\`\`\`java
boolean everyPrefixIsAWord(String word) {
    Node cur = root;
    for (int i = 0; i < word.length(); i++) {
        cur = cur.next[word.charAt(i) - 'a'];
        if (cur == null || !cur.end) return false;
    }
    return true;
}

String best = "";
for (String w : words)
    if (everyPrefixIsAWord(w)
            && (w.length() > best.length()
                || (w.length() == best.length() && w.compareTo(best) < 0)))
        best = w;
\`\`\`

\`compareTo\` on \`String\` compares lexicographically and returns a negative number
when the left one sorts first, which is the tie-break the problem asks for. Note
the order of the two conditions: longer always wins, and the comparison only runs
when the lengths are equal. The same walk, stopping at the *first* \`end\` rather
than requiring all of them, solves [Replace Words](problem:replace-words).

## How to work through the topic

1. [Implement Trie (Prefix Tree)](problem:implement-trie-prefix-tree). Write the
   node, insert, search and startsWith from memory before reading anything.
   Everything below is this class with one method changed.
2. [Replace Words](problem:replace-words),
   [Longest Word in Dictionary](problem:longest-word-in-dictionary). Both are one
   walk with a different stopping rule — first \`end\`, or all \`end\`s. This is
   where the flag stops feeling like bookkeeping.
3. [Map Sum Pairs](problem:map-sum-pairs),
   [Short Encoding of Words](problem:short-encoding-of-words). A value stored on
   the node, and a trie built over *reversed* words so that suffixes become
   prefixes. Reversing the input is a move worth remembering.
4. [Design Add and Search Words Data Structure](problem:design-add-and-search-words-data-structure),
   [Search Suggestions System](problem:search-suggestions-system),
   [Implement Magic Dictionary](problem:implement-magic-dictionary). The walk
   turns into a recursion, and the subtree becomes something you collect from
   rather than only test. The magic dictionary is the same recursion with a
   budget of one substitution.
5. [Word Search II](problem:word-search-ii). The trie as a pruner rather than a
   dictionary. Give this one an hour; it is the problem the topic exists for.
6. [Maximum XOR of Two Numbers in an Array](problem:maximum-xor-of-two-numbers-in-an-array),
   then [Count Pairs With XOR in a Range](problem:count-pairs-with-xor-in-a-range).
   The binary trie. Once the greedy walk makes sense, revisit
   [bit manipulation](#/dsa/bit-manipulation/notes) — several of its hard
   problems are this structure in disguise.
7. [Palindrome Pairs](problem:palindrome-pairs),
   [Concatenated Words](problem:concatenated-words),
   [Prefix and Suffix Search](problem:prefix-and-suffix-search). Tries combined
   with something else — palindrome checks, dynamic programming, and a trie over
   \`suffix#prefix\` pairs. Leave these until the rest is routine, and read
   [strings](#/dsa/strings/notes) alongside them.
`;export{e as default};