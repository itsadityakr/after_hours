var e=`Some problems have no sensible loop. List every subset of a set, every ordering
of a word, every way to place eight queens so that none attacks another. There
is no single index to advance. What there is, at each step, is a small set of
choices, and after each one the same problem again on whatever is left.

Recursion is how you write that down. Backtracking is recursion with one extra
rule: when you come back from a choice, put the state the way you found it. That
rule is the whole difficulty of the topic. The recursion people write first time
is usually right; the state they leave behind is what makes it print rubbish.

## The call stack, and why a base case is not optional

When a method is called, Java sets aside a block of memory — a **frame** —
holding that call's parameters and locals. Frames sit in a stack, newest on top,
each waiting for the one above it to finish. When a method returns its frame is
discarded and the one underneath carries on. That is true of every method call;
recursion just means the frames are all for the same method, each with its own
copy of the locals.

\`\`\`java
static int factorial(int n) {
    if (n <= 1) return 1;            // base case: no further call
    return n * factorial(n - 1);     // the same problem, one step smaller
}
\`\`\`

\`\`\`text
going in                            coming out

factorial(4) needs factorial(3)
  factorial(3) needs factorial(2)
    factorial(2) needs factorial(1)
      factorial(1)  n <= 1  ->  1   frame popped, hands back 1
    factorial(2)                    2 * 1 = 2    popped
  factorial(3)                      3 * 2 = 6    popped
factorial(4)                        4 * 6 = 24   popped
\`\`\`

Four frames on, four off, and every multiplication happens on the way *out*, in
the reverse of the order the calls were made. Plenty of recursion bugs are code
placed on the wrong side of the recursive call.

Now delete the base case. \`factorial(1)\` calls \`factorial(0)\` calls
\`factorial(-1)\`, nothing ever returns, nothing is ever popped, and the JVM runs
out of room for frames and throws \`StackOverflowError\` — not a hang, a crash,
usually within a fraction of a second. So two things must be true: there is a
case that returns without calling itself, and every recursive call is on
something **strictly closer** to it. Fail the second and you get the same crash
even though a base case exists; \`f(n - 1)\` with a base case of \`n == 0\` never
terminates for a negative \`n\`, which is why you guard with \`<=\`.

## Reading a recursion as a promise

The instinct is to trace it. Do that once, on \`factorial(4)\`, so you know what
happens. Then stop, because past three levels nobody can hold the frames in
mind, and it is not how you check correctness anyway.

Read it as a promise instead. Look at the recursive call and *assume it already
works*: \`factorial(n - 1)\` returns the factorial of \`n - 1\`, and you do not care
how. Then there are exactly two things to check.

- **The base case.** Does \`factorial(1)\` return 1? Yes.
- **The step.** Given a correct \`factorial(n - 1)\`, is \`n * factorial(n - 1)\` a
  correct \`factorial(n)\`? Yes, by the definition.

Neither needs a stack diagram, and if both hold the whole thing is correct for
every \`n\`. That is induction, and it is why a recursion is easier to *verify*
than a loop even when it is harder to picture. Write the base case first, then
write the step as if the smaller answer were already sitting in a variable.

## The shape

\`\`\`java
Answer solve(Problem p) {
    if (isSmallest(p)) return baseAnswer(p);   // 1. stop
    Answer smaller = solve(shrink(p));         // 2. the same problem, smaller
    return combine(p, smaller);                // 3. build this answer from it
}
\`\`\`

[Fibonacci Number](problem:fibonacci-number) is that with two smaller problems
instead of one. [Merge Two Sorted Lists](problem:merge-two-sorted-lists) is that
on a linked list — take the smaller head, and the rest of the answer is the
merge of what remains. Seeing the second one as a recursion makes the tree
topics much cheaper later.

Naive Fibonacci is also the standard warning: \`fib(n)\` calls \`fib(n-1)\` and
\`fib(n-2)\`, which do the same again, and the same subproblems get recomputed
thousands of times. Remembering what you already worked out is the whole of
[dynamic programming](#/dsa/dynamic-programming/notes), and it begins from
exactly this code.

![Naive Fibonacci call counts growing by a hundred times every ten steps](diagrams/recursion-and-backtracking-notes-recompute.jpg)

\`\`\`java Frames.java @run-recursion-and-backtracking-frames
public class Frames {

    /** n! with each frame printed as it goes on and as it comes off. */
    static int factorial(int n, int depth) {
        String pad = "  ".repeat(depth);
        System.out.println(pad + "in   factorial(" + n + ")");
        if (n <= 1) {
            System.out.println(pad + "out  1   (base case)");
            return 1;
        }
        int smaller = factorial(n - 1, depth + 1);
        System.out.println(pad + "out  " + n + " * " + smaller + " = " + n * smaller);
        return n * smaller;
    }

    static long calls;

    static int fib(int n) {
        calls++;
        if (n < 2) return n;
        return fib(n - 1) + fib(n - 2);      // two calls per frame, so it explodes
    }

    public static void main(String[] args) {
        factorial(4, 0);
        System.out.println();
        for (int n : new int[] { 10, 20, 30 }) {
            calls = 0;
            System.out.println("fib(" + n + ") = " + fib(n) + "   in " + calls + " calls");
        }
    }
}
\`\`\`

\`\`\`output @run-recursion-and-backtracking-frames
in   factorial(4)
  in   factorial(3)
    in   factorial(2)
      in   factorial(1)
      out  1   (base case)
    out  2 * 1 = 2
  out  3 * 2 = 6
out  4 * 6 = 24

fib(10) = 55   in 177 calls
fib(20) = 6765   in 21891 calls
fib(30) = 832040   in 2692537 calls
\`\`\`

## Choose, explore, un-choose

Backtracking is recursion over a set of choices. Pick one of the options open to
you, recurse to deal with everything that follows, then take the pick back so
the next option starts from the state you did.

\`\`\`java
void go(state) {
    if (complete(state)) { record(state); return; }
    for (Option o : optionsFrom(state)) {
        apply(o);        // choose
        go(state);       // explore everything that follows
        undo(o);         // un-choose
    }
}
\`\`\`

Three lines in the loop body, and the third is the one people leave out.

### The un-choose is the whole thing

![The path with the un-choose against the debris left without it](diagrams/recursion-and-backtracking-notes-un-choose.jpg)

\`apply\` and \`undo\` have to be exact opposites. If \`apply\` adds to a list, \`undo\`
removes the last element. If \`apply\` sets \`used[i] = true\`, \`undo\` sets it back
to \`false\`. If \`apply\` overwrites a grid cell, \`undo\` writes the old character
back — which means you had to save it first.

Leave the \`undo\` out and the code still compiles and still runs. It carries the
debris of every branch it has tried into every branch it tries next.

\`\`\`text
subsets of [1,2,3], with the un-choose      and without it

go(0, [])                                    go(0, [])
  take 1   path = [1]                          take 1   path = [1]
    take 2   path = [1,2]                        take 2   path = [1,2]
      take 3   record [1,2,3]                      take 3   record [1,2,3]
      undo     path = [1,2]                        skip 3   record [1,2,3]   wrong
      skip 3   record [1,2]                      skip 2   path is still [1,2,3]
    undo       path = [1]                          take 3   record [1,2,3,3] wrong
\`\`\`

Eight subsets become eight copies of increasingly long nonsense. Nothing throws.
The only symptom is wrong output, which is why the bug survives so long — you
stare at the recursion, which is right, instead of at the state, which is not.

### And copy the path when you record it

The other half of the same mistake. \`out.add(path)\` does not store the list, it
stores a **reference** to the one list you have been mutating all along. By the
time the search finishes that list is empty again, and \`out\` is a hundred
pointers to one empty list.

\`\`\`java
out.add(path);                    // wrong: every answer is the same list
out.add(new ArrayList<>(path));   // right: a snapshot, taken now
\`\`\`

The copy costs O(k) for a path of length \`k\`, which is why generating subsets is
O(n · 2ⁿ) rather than O(2ⁿ). You pay to write each answer out.

## Subsets

Every element is in or out, independently, so there are \`2ⁿ\` subsets and the
recursion writes itself: at index \`i\`, take \`a[i]\` and recurse, then do not take
it and recurse.

\`\`\`java
static void take(int[] a, int i, List<Integer> path, List<List<Integer>> out) {
    if (i == a.length) { out.add(new ArrayList<>(path)); return; }
    path.add(a[i]);                 // choose
    take(a, i + 1, path, out);      // explore with it
    path.remove(path.size() - 1);   // un-choose
    take(a, i + 1, path, out);      // explore without it
}
\`\`\`

\`\`\`text
a = [1, 2, 3]        (T = took it, S = skipped it)

                        go(0, [])
              T /                    \\ S
          go(1,[1])                go(1,[])
        T /      \\ S            T /       \\ S
  go(2,[1,2])  go(2,[1])   go(2,[2])   go(2,[])
   T /  \\ S     T /  \\ S    T /  \\ S    T /  \\ S
[1,2,3] [1,2] [1,3]  [1]  [2,3]  [2]  [3]    []
\`\`\`

Eight leaves, one per subset. There is a second shape for the same job and it is
the one the rest of the topic is built on: a loop from a \`start\` index,
recording at *every* node rather than only at the leaves — that is \`pick\` in the
program below. The \`i + 1\` it recurses with is what stops \`[1,2]\` and \`[2,1]\`
both appearing. A subset has no order, so you only ever extend to the right.
Remember that: it is the single difference between subsets and permutations.

## Permutations

Order matters now, every element is used exactly once, and there are \`n!\`
answers. Two standard spellings.

**With a \`used\` array.** Keep a \`boolean[]\` saying which indices are already in
the path and, at each depth, try every index still free — \`build\` below. The
loop starts at \`0\` rather than at \`start\`, which is the difference from subsets
written out in one character, and the un-choose has two halves: drop the last
element of the path *and* clear the flag.

**By swapping.** Fix position \`k\` by swapping each remaining element into it,
recurse on \`k + 1\`, and swap straight back — \`swapFrom\` below. No extra array,
because the array itself is the path, and the second \`swap(a, k, i)\` is the
entire un-choose.

The swap version uses less memory. The \`used\` version is easier to adapt, since
an added constraint nearly always attaches to "may I use this element here",
which is one line there and a contortion in the swap version. Learn both, reach
for \`used\` under pressure.

\`\`\`java Choices.java @run-recursion-and-backtracking-choices
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class Choices {

    /** Subsets by the start-index loop. Records at every node, skips duplicates. */
    static void pick(int[] a, int start, List<Integer> path, List<List<Integer>> out) {
        out.add(new ArrayList<>(path));
        for (int i = start; i < a.length; i++) {
            if (i > start && a[i] == a[i - 1]) continue;   // a repeat at this depth
            path.add(a[i]);
            pick(a, i + 1, path, out);                     // i + 1: never look back
            path.remove(path.size() - 1);
        }
    }

    static List<List<Integer>> subsets(int[] a) {
        int[] sorted = a.clone();
        Arrays.sort(sorted);                  // the skip above needs equals adjacent
        List<List<Integer>> out = new ArrayList<>();
        pick(sorted, 0, new ArrayList<>(), out);
        return out;
    }

    /** Permutations with a used[] flag. */
    static void build(int[] a, boolean[] used, List<Integer> path, List<List<Integer>> out) {
        if (path.size() == a.length) { out.add(new ArrayList<>(path)); return; }
        for (int i = 0; i < a.length; i++) {
            if (used[i]) continue;
            used[i] = true;
            path.add(a[i]);
            build(a, used, path, out);
            path.remove(path.size() - 1);
            used[i] = false;
        }
    }

    /** Permutations by swapping into position k. */
    static void swapFrom(int[] a, int k, List<List<Integer>> out) {
        if (k == a.length) {
            List<Integer> snapshot = new ArrayList<>();
            for (int v : a) snapshot.add(v);
            out.add(snapshot);
            return;
        }
        for (int i = k; i < a.length; i++) {
            swap(a, k, i);
            swapFrom(a, k + 1, out);
            swap(a, k, i);
        }
    }

    static void swap(int[] a, int i, int j) { int t = a[i]; a[i] = a[j]; a[j] = t; }

    public static void main(String[] args) {
        System.out.println("subsets [1,2,3]   " + subsets(new int[] { 1, 2, 3 }));
        System.out.println("subsets [2,1,2]   " + subsets(new int[] { 2, 1, 2 }));
        System.out.println("subsets []        " + subsets(new int[] {}));

        List<List<Integer>> byUsed = new ArrayList<>();
        build(new int[] { 1, 2, 3 }, new boolean[3], new ArrayList<>(), byUsed);
        System.out.println("permute by used[] " + byUsed);

        List<List<Integer>> bySwap = new ArrayList<>();
        swapFrom(new int[] { 1, 2, 3 }, 0, bySwap);
        System.out.println("permute by swap   " + bySwap);
    }
}
\`\`\`

\`\`\`output @run-recursion-and-backtracking-choices
subsets [1,2,3]   [[], [1], [1, 2], [1, 2, 3], [1, 3], [2], [2, 3], [3]]
subsets [2,1,2]   [[], [1], [1, 2], [1, 2, 2], [2], [2, 2]]
subsets []        [[]]
permute by used[] [[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]]
permute by swap   [[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 2, 1], [3, 1, 2]]
\`\`\`

\`[1,2,3]\` gives eight subsets, \`[2,1,2]\` gives six rather than eight, and the
two permutation routines agree on the set while disagreeing on the order. That
six is the next section.

## Duplicates: sort, then skip

When the input can repeat a value, the plain recursion repeats the answer.
Deduplicating afterwards with a \`Set\` works and is a bad habit — it does the
exponential work first and throws most of it away.

The rule is two lines and worth memorising exactly:

\`\`\`java
Arrays.sort(a);                                   // 1. equal values become adjacent
if (i > start && a[i] == a[i - 1]) continue;      // 2. skip a repeat at this depth
\`\`\`

\`i > start\`, not \`i > 0\`. The **first** occurrence at this depth must get
through — it is the branch that produces every answer containing this value.
Only the second and later copies are skipped. Writing \`i > 0\` skips the first
too and loses whole families of answers. And the sort is not optional: without
it equal values are not adjacent, \`a[i] == a[i - 1]\` never fires, and the skip
does nothing at all.

\`\`\`text
a = [1, 1, 2], at depth start = 0

i = 0   a[0] = 1   i == start   take   -> produces [1], [1,1], [1,2], [1,1,2]
i = 1   a[1] = 1   == a[0]      skip   -> would repeat the branch above
i = 2   a[2] = 2   differs      take   -> produces [2]
\`\`\`

Skipping index 1 does not lose \`[1,1]\`. That comes out of the branch started at
index 0, which recurses with \`start = 1\` and picks up the second \`1\` there. Only
the duplicate of a branch already taken is lost. This is exactly
[Subsets II](problem:subsets-ii), and the same two lines handle the duplicate
version of combination sum.

## Combinations, and the one index that allows reuse

A combination of size \`k\` is a subset of size \`k\`: the same start-index loop
with the base case checking \`path.size() == k\` instead of the index.
[Combination Sum](problem:combination-sum) is that loop again with the base case
on a running total — and with one number allowed to be used repeatedly. That
permission is a **single index**.

| Rule | The recursive call |
|---|---|
| Each number at most once | \`go(i + 1, left - a[i])\` |
| Each number reusable | \`go(i, left - a[i])\` |

Passing \`i\` lets the loop one level down start at the same element and take it
again. Passing \`i + 1\` moves past it forever. One character, two problems.

Passing \`start\` rather than either is the bug in that neighbourhood: the loop
restarts from the beginning each time and produces \`[2,3]\` and \`[3,2]\` as
separate answers, which for a combination they are not.

## Pruning

![A constraint checked at the leaf against the same constraint checked before recursing](diagrams/recursion-and-backtracking-notes-pruning.jpg)

Backtracking explores a tree. Pruning is cutting a branch the moment you can
prove nothing under it can be an answer. It changes no output, and it is
routinely the difference between passing and running for several minutes.

**Sorted, so stop when it cannot fit.** If the array is ascending and \`a[i]\`
already exceeds what is left of the target, so does everything after it.
\`break\`, not \`continue\`.

\`\`\`java
if (a[i] > left) break;
\`\`\`

**A feasibility bound.** If the best case from here is still not good enough,
return before recursing. In
[Partition to K Equal Sum Subsets](problem:partition-to-k-equal-sum-subsets), if
the total does not divide by \`k\`, or any single number exceeds the per-subset
target, there is no answer at all.

The rule of thumb is **test as early as you can**. A constraint checked at the
leaf prunes nothing; the same constraint checked before the recursive call
removes the entire subtree. N-Queens is the clearest case: place all \`n\` queens
and then check the board and you examine \`n^n\` boards — sixteen million for
\`n = 8\`, and \`n = 12\` never finishes. Check each queen against those already
placed and \`n = 12\` takes well under a second.

## N-Queens

[N-Queens](problem:n-queens) places \`n\` queens on an \`n × n\` board with no two
sharing a row, column or diagonal. Place one queen per row — that disposes of
the row constraint for free — so the choice at each depth is only which column.

The conflict test must be O(1), not a scan. Three boolean arrays do it, because
every square on the same \`\\\` diagonal has the same \`r - c\` and every square on
the same \`/\` diagonal has the same \`r + c\`.

\`\`\`text
column     c                 -> n slots
diagonal   r - c + n - 1     -> shifted so it is never negative, 2n - 1 slots
anti-diag  r + c             -> already 0 .. 2n - 2

    c=0 c=1 c=2 c=3      r-c+3        r+c
r=0  .   .   Q   .        3 2 1 0      0 1 2 3
r=1  Q   .   .   .        4 3 2 1      1 2 3 4
r=2  .   .   .   Q        5 4 3 2      2 3 4 5
r=3  .   Q   .   .        6 5 4 3      3 4 5 6
\`\`\`

A queen at \`(r, c)\` sets three flags; a candidate square is legal exactly when
all three of its flags are clear.

\`\`\`java Queens.java @run-recursion-and-backtracking-queens
import java.util.ArrayList;
import java.util.List;

public class Queens {

    static int n;
    static boolean[] col, diag, anti;   // the three constraint sets
    static int[] chosen;                // chosen[r] = the column used in row r
    static List<List<String>> boards;

    static void place(int row) {
        if (row == n) { boards.add(draw()); return; }
        for (int c = 0; c < n; c++) {
            int d = row - c + n - 1, a = row + c;
            if (col[c] || diag[d] || anti[a]) continue;     // pruned: it conflicts
            col[c] = diag[d] = anti[a] = true;              // choose
            chosen[row] = c;
            place(row + 1);                                 // explore
            col[c] = diag[d] = anti[a] = false;             // un-choose
        }
    }

    static List<String> draw() {
        List<String> rows = new ArrayList<>();
        for (int r = 0; r < n; r++) {
            StringBuilder sb = new StringBuilder(".".repeat(n));
            sb.setCharAt(chosen[r], 'Q');
            rows.add(sb.toString());
        }
        return rows;
    }

    static List<List<String>> solve(int size) {
        n = size;
        col = new boolean[n];
        diag = new boolean[2 * n - 1];
        anti = new boolean[2 * n - 1];
        chosen = new int[n];
        boards = new ArrayList<>();     // reset every field before searching
        place(0);
        return boards;
    }

    public static void main(String[] args) {
        for (int size = 1; size <= 10; size++)
            System.out.println("n = " + size + "   " + solve(size).size() + " solutions");
        System.out.println();
        for (String row : solve(6).get(0)) System.out.println(row);
    }
}
\`\`\`

\`\`\`output @run-recursion-and-backtracking-queens
n = 1   1 solutions
n = 2   0 solutions
n = 3   0 solutions
n = 4   2 solutions
n = 5   10 solutions
n = 6   4 solutions
n = 7   40 solutions
n = 8   92 solutions
n = 9   352 solutions
n = 10   724 solutions

.Q....
...Q..
.....Q
Q.....
..Q...
....Q.
\`\`\`

\`n = 2\` and \`n = 3\` print zero, which is correct — there is no legal placement,
and a solution that assumes one exists fails on both. The three arrays are
shared mutable state reset inside \`solve\`; a \`static\` field left over from a
previous call is a common wrong answer that only reproduces on the second test
case.

## Word search, and the mark you have to undo

[Word Search](problem:word-search) asks whether a word can be spelled by walking
between neighbouring cells, using no cell twice. The recursion is obvious —
match this character, then try the four neighbours for the next. The interesting
part is "no cell twice". You could carry a \`boolean[][] visited\`; the shorter
trick is to overwrite the cell with a character that cannot match, and write the
original back on the way out. The board is the visited set.

Forget the restore and the first failed attempt leaves \`#\` scattered across the
grid, so every later start finds a wall where letters used to be. The function
then returns \`false\` for words that are plainly there — and only for some of
them, depending on the order the starts are tried.

\`\`\`java
static boolean walk(char[][] board, String word, int r, int c, int k) {
    if (k == word.length()) return true;                           // matched it all
    if (r < 0 || r >= board.length || c < 0 || c >= board[0].length) return false;
    if (board[r][c] != word.charAt(k)) return false;               // pruned here

    char keep = board[r][c];     // save it, or you cannot undo
    board[r][c] = '#';           // choose: this cell is now in the path

    boolean found = walk(board, word, r + 1, c, k + 1) || walk(board, word, r - 1, c, k + 1)
                 || walk(board, word, r, c + 1, k + 1) || walk(board, word, r, c - 1, k + 1);

    board[r][c] = keep;          // un-choose: the next start needs a clean board
    return found;
}
\`\`\`

The caller tries \`walk\` from every cell and stops at the first \`true\`. The
bounds check comes *before* the character comparison, or \`board[r][c]\` throws on
the edge. And \`||\` short-circuits, so as soon as one direction succeeds the rest
are skipped — while the un-choose still runs, because it sits after the whole
expression rather than inside it.
[Word Search II](problem:word-search-ii) is the same walk against many words at
once, with the dictionary in a trie so a prefix no word starts with is pruned
immediately.

## What it costs

| Search | Answers | Time | Extra space |
|---|---|---|---|
| Subsets of n | 2ⁿ | O(n · 2ⁿ) | O(n) path |
| Permutations of n | n! | O(n · n!) | O(n) path |
| Combinations C(n, k) | C(n, k) | O(k · C(n, k)) | O(k) |
| N-Queens | varies | O(n!) worst case, far less pruned | O(n) |
| Word search, length L | — | O(rows · cols · 4ᴸ) | O(L) stack |

The \`n ·\` factor on the first two is the copy — writing each answer out costs
its own length. Keep two kinds of space apart. The **output** is unavoidable: if
a problem asks for \`2ⁿ\` lists, that is not counted against you. The **stack** is
O(depth) frames, and around 10,000 frames is a \`StackOverflowError\` in Java on
the default stack size. Backtracking depth is nearly always small, so this bites
elsewhere — a recursive walk of a 100,000-node list overflows, and that has to
become a loop with an explicit stack.

Two numbers to hold on to. 2²⁰ is about a million, so 20 is roughly the largest
\`n\` for a comfortable subset enumeration. 10! is 3.6 million and 13! is over six
billion, so \`n ≤ 10\` in the constraints is a permutation problem announcing
itself.

## The mistakes, in the order people make them

1. **No base case, or one the recursion steps over.** Guard with \`<=\`, not \`==\`.
2. **Forgetting the un-choose.** Nothing throws; the output is quietly wrong.
3. **Storing the path without copying it.** Every answer comes out identical,
   usually every answer is \`[]\`.
4. **\`i > 0\` instead of \`i > start\`** in the duplicate skip, which drops the
   first occurrence too and loses real answers.
5. **The duplicate skip without the sort.** Equal values are not adjacent, so
   the condition never fires.
6. **\`i\` where \`i + 1\` belongs** in a combination, letting an element repeat
   and, if the target never shrinks, recursing forever.
7. **\`path.remove(2)\` meaning the wrong thing.** On a \`List<Integer>\`,
   \`remove(int)\` removes by index and \`remove(Object)\` by value. Always write
   \`path.remove(path.size() - 1)\`.
8. **Static state not reset between runs**, so the second test case inherits the
   first one's answers.
9. **Checking constraints at the leaf**, which prunes nothing at all.

## The Java you will reach for

| You want | Write |
|---|---|
| A growable path | \`List<Integer> path = new ArrayList<>()\` |
| Snapshot the path | \`new ArrayList<>(path)\` |
| Drop the last element | \`path.remove(path.size() - 1)\` |
| A used-flag set | \`boolean[] used = new boolean[n]\` |
| Equal values adjacent | \`Arrays.sort(a)\` |
| Characters of a string | \`s.charAt(i)\`, \`s.toCharArray()\` |
| Build a string as you go | \`sb.append(c)\`, undo with \`sb.setLength(len)\` |
| A row of n dots | \`".".repeat(n)\` |
| Change one character | \`sb.setCharAt(i, 'Q')\` |
| Copy an array | \`a.clone()\`, \`Arrays.copyOf(a, n)\` |

\`StringBuilder\` wants the same discipline as the list: \`append\` is the choose
and \`setLength(sb.length() - 1)\` is the un-choose. Building a fresh \`String\` at
every node instead turns an already exponential search into something
considerably worse.

## Working one from the sheet

[Combination Sum](problem:combination-sum): given distinct positive numbers and
a target, list every multiset of them adding to the target, with numbers
reusable as often as you like.

Reason it out first. The answers are combinations, so \`[2,2,3]\` and \`[3,2,2]\`
are one answer — the loop takes a \`start\` and never looks left. The target
shrinks by whatever you take, so the base case is \`left == 0\`. Reuse means the
recursive call passes \`i\`, not \`i + 1\`. And sorting buys the prune: once \`a[i]\`
exceeds what is left, so does everything after it.

\`\`\`java Combos.java @run-recursion-and-backtracking-combos
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class Combos {

    /**
     * One routine, both problems. \`reuse\` decides whether the recursive call
     * starts at i (the element is still available) or at i + 1 (it is spent).
     */
    static void go(int[] a, int start, int left, boolean reuse,
                   List<Integer> path, List<List<Integer>> out) {
        if (left == 0) { out.add(new ArrayList<>(path)); return; }
        for (int i = start; i < a.length; i++) {
            if (a[i] > left) break;                        // sorted: the rest are bigger
            if (i > start && a[i] == a[i - 1]) continue;   // a repeat at this depth
            path.add(a[i]);                                // choose
            go(a, reuse ? i : i + 1, left - a[i], reuse, path, out);
            path.remove(path.size() - 1);                  // un-choose
        }
    }

    static List<List<Integer>> combinationSum(int[] a, int target, boolean reuse) {
        int[] sorted = a.clone();
        Arrays.sort(sorted);
        List<List<Integer>> out = new ArrayList<>();
        go(sorted, 0, target, reuse, new ArrayList<>(), out);
        return out;
    }

    public static void main(String[] args) {
        System.out.println("reuse [2,3,6,7] -> 7   " + combinationSum(new int[] { 2, 3, 6, 7 }, 7, true));
        System.out.println("reuse [2,3,5]   -> 8   " + combinationSum(new int[] { 2, 3, 5 }, 8, true));
        System.out.println("reuse [2]       -> 1   " + combinationSum(new int[] { 2 }, 1, true));
        System.out.println("once  [10,1,2,7,6,1,5] -> 8   "
                + combinationSum(new int[] { 10, 1, 2, 7, 6, 1, 5 }, 8, false));
        System.out.println("once  [1,1,1]   -> 2   " + combinationSum(new int[] { 1, 1, 1 }, 2, false));
    }
}
\`\`\`

\`\`\`output @run-recursion-and-backtracking-combos
reuse [2,3,6,7] -> 7   [[2, 2, 3], [7]]
reuse [2,3,5]   -> 8   [[2, 2, 2, 2], [2, 3, 3], [3, 5]]
reuse [2]       -> 1   []
once  [10,1,2,7,6,1,5] -> 8   [[1, 1, 6], [1, 2, 5], [1, 7], [2, 6]]
once  [1,1,1]   -> 2   [[1, 1]]
\`\`\`

The third line prints an empty list, and that is the case worth testing: a
target no combination reaches is not an error, it is an empty answer. Note that
the duplicate skip is harmless when the input has no repeats and essential when
it does — it is what stops \`[1,7]\` appearing twice because there were two ones
available to start it.

## How to work through the topic

1. [Fibonacci Number](problem:fibonacci-number),
   [Merge Two Sorted Lists](problem:merge-two-sorted-lists). Pure recursion, no
   backtracking. Write each as a base case plus a step and read it as a promise.
2. [Subsets](problem:subsets),
   [Letter Case Permutation](problem:letter-case-permutation). The take-it or
   leave-it tree twice. Write subsets both ways and satisfy yourself they agree.
3. [Permutations](problem:permutations),
   [Letter Combinations of a Phone Number](problem:letter-combinations-of-a-phone-number).
   The loop from \`0\` with a \`used\` array, then a loop over per-position options.
   Do the swap version as well.
4. [Combination Sum](problem:combination-sum),
   [Subsets II](problem:subsets-ii). The \`i\` versus \`i + 1\` decision and the
   sort-then-skip rule — between them, nearly every duplicate question asked.
5. [Generate Parentheses](problem:generate-parentheses),
   [Palindrome Partitioning](problem:palindrome-partitioning). The first is
   backtracking where the pruning *is* the problem: track open and close counts
   and never emit an illegal prefix. The second recurses on a string index.
6. [Binary Tree Paths](problem:binary-tree-paths), [Path Sum](problem:path-sum).
   The same choose/explore/un-choose on a tree, which is how the pattern turns
   up in [binary tree](#/dsa/binary-tree/notes) later.
7. [N-Queens](problem:n-queens), [Sudoku Solver](problem:sudoku-solver),
   [Word Search II](problem:word-search-ii). Constraint sets and pruning. Give
   each a full sitting.
8. [Partition to K Equal Sum Subsets](problem:partition-to-k-equal-sum-subsets),
   [Expression Add Operators](problem:expression-add-operators). Exponential
   searches that only pass with several prunes stacked up. The first is where
   backtracking hands over to
   [dynamic programming](#/dsa/dynamic-programming/notes); for the tidy half of
   recursion, where the two branches never interact, see
   [divide and conquer](#/dsa/divide-and-conquer/notes).
`;export{e as default};