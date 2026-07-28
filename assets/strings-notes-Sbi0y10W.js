var e=`A \`String\` in Java is an array of characters you are not allowed to change. Every
method that looks like it modifies one — \`toUpperCase\`, \`replace\`, \`substring\`,
\`trim\` — actually builds a new string and hands it back. That single fact
explains most of the performance traps in this topic and half of the confusion
about \`==\`.

The problems themselves are usually short. What fails them is the case you did
not think about: the empty string, the uppercase letter, the space, the
character that is not a letter at all.

## Immutable, and what it costs

\`\`\`java
String s = "hello";
s.toUpperCase();          // builds "HELLO" and throws it away
System.out.println(s);    // still hello
s = s.toUpperCase();      // this is the version that does something
\`\`\`

\`\`\`expected
hello
\`\`\`

Because a string cannot change, building one up a character at a time is
expensive. \`s += c\` inside a loop allocates a fresh string and copies everything
across on every pass, so \`n\` appends cost 1 + 2 + 3 + … + n character copies —
O(n²) for what should have been O(n).

![Each += builds a whole new string and copies everything across](diagrams/strings-notes-append-copies.jpg)

\`StringBuilder\` is the mutable version, and it is the right answer whenever a
string is being assembled:

\`\`\`java
StringBuilder sb = new StringBuilder();
for (char c : s.toCharArray())
    if (c != ' ') sb.append(c);
String result = sb.toString();
\`\`\`

The other consequence is \`==\`. It compares references, and string literals are
shared from a pool while strings built at run time are not — so \`==\` appears to
work until the text comes from input, and then quietly stops. **Use \`.equals\`,
every time.** For a comparison that ignores case, \`equalsIgnoreCase\`.

## Characters are numbers

A \`char\` in Java is a 16-bit number, and arithmetic on it works. This is what
makes the counting patterns short:

\`\`\`java
char c = 'c';
int index = c - 'a';        // 2  — 'a' is 0, 'b' is 1, 'c' is 2
int digit = '7' - '0';      // 7  — the same trick for digits
char next = (char) (c + 1); // 'd' — the cast is needed, arithmetic widens to int
\`\`\`

The letters are consecutive in the character set, so subtracting \`'a'\` turns a
lowercase letter into a number from 0 to 25 — an index into an array of 26.

## The pattern: count in a fixed array

Any question about "which characters, and how many" is this:

\`\`\`java
int[] count = new int[26];
for (char c : s.toCharArray()) count[c - 'a']++;
\`\`\`

Twenty-six integers, one pass, O(n) time and O(1) space — the alphabet does not
grow with the input, so a 26-slot table is constant space no matter how long the
string is. It beats a \`HashMap<Character, Integer>\` on both speed and clarity
whenever the alphabet is known.

Use \`new int[128]\` when the input is any ASCII character rather than only
lowercase letters, and index with \`c\` directly. Fall back to a \`HashMap\` only for
Unicode.

Three questions this one array answers:

\`\`\`java Counting.java @run-strings-counting
import java.util.Arrays;

public class Counting {

    /** Same letters, same counts, in any order. */
    static boolean isAnagram(String a, String b) {
        if (a.length() != b.length()) return false;
        int[] count = new int[26];
        for (int i = 0; i < a.length(); i++) {
            count[a.charAt(i) - 'a']++;
            count[b.charAt(i) - 'a']--;    // one pass, both strings
        }
        for (int c : count) if (c != 0) return false;
        return true;
    }

    /** The first character that appears exactly once. */
    static int firstUnique(String s) {
        int[] count = new int[26];
        for (char c : s.toCharArray()) count[c - 'a']++;
        for (int i = 0; i < s.length(); i++)
            if (count[s.charAt(i) - 'a'] == 1) return i;
        return -1;
    }

    /** The signature two anagrams share, for grouping. */
    static String signature(String s) {
        char[] letters = s.toCharArray();
        Arrays.sort(letters);
        return new String(letters);
    }

    public static void main(String[] args) {
        System.out.println("anagram      " + isAnagram("listen", "silent"));
        System.out.println("not anagram  " + isAnagram("rat", "car"));
        System.out.println("firstUnique  " + firstUnique("loveleetcode"));
        System.out.println("signature    " + signature("eat") + " " + signature("tea"));
    }
}
\`\`\`

\`\`\`output @run-strings-counting
anagram      true
not anagram  false
firstUnique  2
signature    aet aet
\`\`\`

\`isAnagram\` counts up for one string and down for the other in a single loop,
which is neater than building two tables and comparing them — and the length
check first is not an optimisation, it is what makes one loop over both legal.

![Counting up for one string and down for the other in a single loop](diagrams/strings-notes-anagram-one-loop.jpg)

The \`signature\` idea is the key insight for
[Group Anagrams](problem:group-anagrams): sorted letters are the same for every
anagram of a word, so they make a map key. That "choose what to key on" decision
is the real skill in [hash tables](#/dsa/hash-tables/notes).

## Palindromes: walk in from both ends

\`\`\`java
static boolean isPalindrome(String s) {
    int left = 0, right = s.length() - 1;
    while (left < right) {
        if (s.charAt(left) != s.charAt(right)) return false;
        left++;
        right--;
    }
    return true;
}
\`\`\`

\`left < right\` rather than \`left != right\`, so an odd-length string stops
cleanly in the middle rather than crossing over. The middle character never
needs checking — it is its own mirror.

[Valid Palindrome](problem:valid-palindrome) adds the awkward part: skip
anything that is not a letter or digit, and ignore case. That turns into two
inner loops that advance past the rubbish before comparing:

\`\`\`java
while (left < right && !Character.isLetterOrDigit(s.charAt(left))) left++;
while (left < right && !Character.isLetterOrDigit(s.charAt(right))) right--;
if (Character.toLowerCase(s.charAt(left)) != Character.toLowerCase(s.charAt(right)))
    return false;
\`\`\`

The \`left < right\` guard inside the skipping loops is what stops a string of
pure punctuation from running off the end.

## Expanding around a centre

[Longest Palindromic Substring](problem:longest-palindromic-substring) is the
first genuinely interesting problem in the topic, and the approach generalises.
A palindrome is defined by its centre, so try every centre and grow outwards
while the characters match.

There are \`2n - 1\` centres, not \`n\`: every character is one, and so is every gap
between two characters — an even-length palindrome like \`abba\` has its centre in
a gap.

![Every character and every gap is a palindrome centre](diagrams/strings-notes-centres.jpg)

\`\`\`java Palindromes.java @run-strings-palindromes
public class Palindromes {

    static String longest(String s) {
        if (s.isEmpty()) return "";
        int start = 0, best = 1;

        for (int centre = 0; centre < s.length(); centre++) {
            int odd = grow(s, centre, centre);       // abcba
            int even = grow(s, centre, centre + 1);  // abba
            int len = Math.max(odd, even);
            if (len > best) {
                best = len;
                start = centre - (len - 1) / 2;
            }
        }
        return s.substring(start, start + best);
    }

    /** How wide the palindrome around this centre grows. */
    static int grow(String s, int left, int right) {
        while (left >= 0 && right < s.length() && s.charAt(left) == s.charAt(right)) {
            left--;
            right++;
        }
        return right - left - 1;   // the loop overshot by one on each side
    }

    public static void main(String[] args) {
        System.out.println(longest("babad"));
        System.out.println(longest("cbbd"));
        System.out.println(longest("a"));
        System.out.println(longest("forgeeksskeegfor"));
    }
}
\`\`\`

\`\`\`output @run-strings-palindromes
bab
bb
a
geeksskeeg
\`\`\`

\`right - left - 1\` is the length after the loop has stepped one too far in both
directions, and \`centre - (len - 1) / 2\` recovers the start from the centre and
the length. Both are worth deriving once on paper; they are the kind of index
arithmetic that is obvious afterwards and impossible to guess.

Cost is O(n²) time, O(1) space. There is an O(n) algorithm (Manacher's) and it
is almost never what an interview wants.

## Substrings, and the cost people forget

Since Java 7, \`substring\` **copies** the characters — it does not share the
original array. So a loop that takes a substring on every pass is quadratic even
though \`substring\` itself looks like a single call.

\`\`\`java
// O(n^2) in disguise — every substring is a fresh copy
for (int i = 0; i < s.length(); i++) seen.add(s.substring(i, i + k));
\`\`\`

When you need to compare or hash every window of a string, the answers are a
rolling hash (see [Repeated DNA Sequences](problem:repeated-dna-sequences)) or a
sliding window over \`charAt\`. Reach for \`substring\` when you need the text
itself, not when you need to look at it.

The same reasoning applies to \`split\` and to regular expressions: both are
convenient and both allocate. Fine for one call per solution, wrong inside a
loop over the input.

## The mistakes, in the order people make them

1. **\`==\` instead of \`.equals\`.** Works on literals, fails on anything built at
   run time.
2. **\`s += c\` in a loop.** Quadratic. Use \`StringBuilder\`.
3. **Assuming lowercase.** \`c - 'a'\` on an uppercase letter gives a negative
   index and an exception. Normalise first or use a 128-slot table.
4. **Forgetting the empty string.** \`s.charAt(0)\` on \`""\` throws.
5. **\`length\` versus \`length()\`.** Arrays have the field, strings have the
   method.
6. **\`substring\` in a loop.** Copies. See above.
7. **\`Character.isLetter\` versus \`isLetterOrDigit\`.** Read the problem: most
   palindrome questions want digits kept.
8. **Losing surrogate pairs.** \`length()\` counts UTF-16 code units, so an emoji
   counts as 2 and \`charAt\` splits it. Almost never tested, and worth knowing
   why the almost is there.

## The Java you will reach for

| You want | Write |
|---|---|
| Length | \`s.length()\` |
| One character | \`s.charAt(i)\` |
| As an array | \`s.toCharArray()\` |
| Compare | \`s.equals(t)\`, \`s.equalsIgnoreCase(t)\` |
| Order | \`s.compareTo(t)\` — negative, zero, positive |
| Part of it | \`s.substring(from, to)\` — \`to\` is exclusive |
| Find | \`s.indexOf(t)\`, \`s.lastIndexOf(t)\` — \`-1\` when absent |
| Starts, ends, contains | \`startsWith\`, \`endsWith\`, \`contains\` |
| Split on spaces, collapsing runs | \`s.trim().split("\\\\s+")\` |
| Join | \`String.join(" ", parts)\` |
| Build | \`new StringBuilder().append(x).toString()\` |
| Reverse | \`new StringBuilder(s).reverse().toString()\` |
| Repeat | \`s.repeat(k)\` |
| Blank check | \`s.isEmpty()\`, \`s.isBlank()\` |
| Classify a character | \`Character.isLetter\`, \`isDigit\`, \`isLetterOrDigit\` |
| Change case | \`Character.toLowerCase(c)\`, \`s.toLowerCase()\` |
| Sorted letters | \`char[] c = s.toCharArray(); Arrays.sort(c); new String(c)\` |

\`StringBuilder\` also has \`deleteCharAt\`, \`setCharAt\`, \`insert\` and \`reverse\`,
which is why it is the working structure for anything being built or undone —
backtracking over a string, in particular.

## Working one from the sheet

[String Compression](problem:string-compression): rewrite \`["a","a","b","b","c"]\`
in place as \`["a","2","b","2","c"]\`, returning the new length. Runs of one keep
no number.

It is the two-index pass from [arrays](#/dsa/arrays/notes) with a run counter,
and it is a good example of a problem whose difficulty is entirely in the edge
cases: a run of exactly one, a run of ten or more (whose count is two
characters), and the final run, which has no character after it to end it.

\`\`\`java Compress.java @run-strings-compress
public class Compress {

    static int compress(char[] chars) {
        int write = 0, read = 0;

        while (read < chars.length) {
            char c = chars[read];
            int run = 0;
            while (read < chars.length && chars[read] == c) {
                read++;
                run++;
            }

            chars[write++] = c;
            if (run > 1)
                for (char digit : String.valueOf(run).toCharArray())
                    chars[write++] = digit;
        }
        return write;
    }

    public static void main(String[] args) {
        char[] a = { 'a', 'a', 'b', 'b', 'c', 'c', 'c' };
        System.out.println(new String(a, 0, compress(a)));

        char[] b = { 'a' };
        System.out.println(new String(b, 0, compress(b)));

        char[] c = "aaaaaaaaaaaab".toCharArray();
        System.out.println(new String(c, 0, compress(c)));
    }
}
\`\`\`

\`\`\`output @run-strings-compress
a2b2c3
a
a12b
\`\`\`

The inner \`while\` consuming the whole run is what removes the "last run" special
case: the outer loop only ever starts at the beginning of a run, so there is
nothing left over at the end. Structuring a loop so the awkward case cannot
arise beats handling the awkward case, every time.

## How to work through the topic

1. [Valid Anagram](problem:valid-anagram),
   [First Unique Character in a String](problem:first-unique-character-in-a-string),
   [Longest Common Prefix](problem:longest-common-prefix). The counting array,
   and one problem that is just careful looping.
2. [Reverse Vowels of a String](problem:reverse-vowels-of-a-string),
   [Valid Palindrome II](problem:valid-palindrome-ii). Two pointers on
   characters. The second is the first problem where you have to try both
   branches.
3. [Roman to Integer](problem:roman-to-integer),
   [String Compression](problem:string-compression). Parsing, and runs.
4. [Group Anagrams](problem:group-anagrams),
   [Find All Anagrams in a String](problem:find-all-anagrams-in-a-string).
   Choosing a key, and then the same counting array inside a sliding window.
5. [Longest Palindromic Substring](problem:longest-palindromic-substring),
   [Decode String](problem:decode-string). Expand around a centre, and a stack.
6. [Minimum Window Substring](problem:minimum-window-substring). The hardest
   commonly-asked string problem there is, and it is a
   [sliding window](#/dsa/sliding-window/notes) with a counting array. Do that
   topic first, then come back.

The pattern-matching problems — [Wildcard Matching](problem:wildcard-matching),
[Interleaving String](problem:interleaving-string),
[Word Break II](problem:word-break-ii) — are dynamic programming wearing string
clothes. Leave them until after
[dynamic programming](#/dsa/dynamic-programming/notes); attempting them as
string problems is what makes them feel impossible.
`;export{e as default};